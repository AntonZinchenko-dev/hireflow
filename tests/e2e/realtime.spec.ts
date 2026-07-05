// tests/e2e/realtime.spec.ts
import { test, expect } from "@playwright/test";
import { prisma, resetPrismaClient } from "@/shared/lib/prisma-client";

function isRecoverablePrismaError(error: unknown) {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return message.includes("connection terminated unexpectedly")
        || message.includes("transaction already closed");
}

async function withDbRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (!isRecoverablePrismaError(error)) {
            throw error;
        }
        await resetPrismaClient();
        return operation();
    }
}

test("realtime: перемещение карточки видно в другой вкладке", async ({ browser, baseURL }) => {
    const createdVacancy = await withDbRetry(() => prisma.vacancy.create({
        data: {
            title: `E2E realtime ${Date.now()}`,
            grade: "middle",
            department: "Engineering",
        },
    }));

    try {
        await withDbRetry(() => prisma.stage.createMany({
            data: [
                { vacancyId: createdVacancy.id, name: "Отклик", order: 0 },
                { vacancyId: createdVacancy.id, name: "Скрининг", order: 1 },
            ],
        }));
        const stages = await withDbRetry(() => prisma.stage.findMany({
            where: { vacancyId: createdVacancy.id },
            orderBy: { order: "asc" },
        }));

        const fromStage = stages[0];
        const toStage = stages[1];
        if (!fromStage || !toStage) {
            throw new Error("Expected at least two stages for E2E setup");
        }

        const recruiter = await withDbRetry(() => prisma.user.upsert({
            where: { email: "e2e-recruiter@hireflow.local" },
            update: {},
            create: {
                email: "e2e-recruiter@hireflow.local",
                name: "E2E Recruiter",
                role: "recruiter",
            },
        }));

        const candidate = await withDbRetry(() => prisma.candidate.create({
            data: {
                vacancyId: createdVacancy.id,
                stageId: fromStage.id,
                fullName: "E2E Candidate",
                source: "site",
                grade: "middle",
                expectedSalary: 100000,
                assignedRecruiterId: recruiter.id,
            },
        }));

        const cookie = {
            name: "e2e-bypass",
            value: "1",
            url: baseURL ?? "http://localhost:3000",
        };
        const [ctxA, ctxB] = await Promise.all([browser.newContext(), browser.newContext()]);
        await Promise.all([ctxA.addCookies([cookie]), ctxB.addCookies([cookie])]);
        const [pageA, pageB] = await Promise.all([ctxA.newPage(), ctxB.newPage()]);

        await pageA.goto(`/board/${createdVacancy.id}`);
        await pageB.goto(`/board/${createdVacancy.id}`);
        await expect(pageA.getByTestId(`candidate-card-${candidate.id}`)).toBeVisible();
        await expect(pageB.getByTestId(`candidate-card-${candidate.id}`)).toBeVisible();

        await withDbRetry(() => prisma.candidate.update({
            where: { id: candidate.id },
            data: { stageId: toStage.id },
        }));

        await expect(
            pageA.getByTestId(`stage-column-${toStage.id}`).getByTestId(`candidate-card-${candidate.id}`)
        ).toBeVisible({ timeout: 15000 });
        await expect(
            pageB.getByTestId(`stage-column-${toStage.id}`).getByTestId(`candidate-card-${candidate.id}`)
        ).toBeVisible({ timeout: 15000 });

        await Promise.all([ctxA.close(), ctxB.close()]);
    } finally {
        await withDbRetry(() => prisma.vacancy.delete({
            where: { id: createdVacancy.id },
        })).catch(() => undefined);
    }
});

test.afterAll(async () => {
    await prisma.$disconnect();
});
