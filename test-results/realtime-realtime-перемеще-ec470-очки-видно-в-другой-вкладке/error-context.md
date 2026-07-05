# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: realtime.spec.ts >> realtime: перемещение карточки видно в другой вкладке
- Location: tests\e2e\realtime.spec.ts:24:5

# Error details

```
PrismaClientKnownRequestError: 
Invalid `prisma.vacancy.create()` invocation in
C:\App\hireflow\tests\e2e\realtime.spec.ts:25:67

  22 }
  23 
  24 test("realtime: перемещение карточки видно в другой вкладке", async ({ browser, baseURL }) => {
→ 25     const createdVacancy = await withDbRetry(() => prisma.vacancy.create(
Can't reach database server at aws-0-eu-west-1.pooler.supabase.com
```

# Test source

```ts
  1   | // tests/e2e/realtime.spec.ts
  2   | import { test, expect } from "@playwright/test";
  3   | import { prisma, resetPrismaClient } from "@/shared/lib/prisma-client";
  4   | 
  5   | function isRecoverablePrismaError(error: unknown) {
  6   |     if (!(error instanceof Error)) return false;
  7   |     const message = error.message.toLowerCase();
  8   |     return message.includes("connection terminated unexpectedly")
  9   |         || message.includes("transaction already closed");
  10  | }
  11  | 
  12  | async function withDbRetry<T>(operation: () => Promise<T>): Promise<T> {
  13  |     try {
  14  |         return await operation();
  15  |     } catch (error) {
  16  |         if (!isRecoverablePrismaError(error)) {
  17  |             throw error;
  18  |         }
  19  |         await resetPrismaClient();
  20  |         return operation();
  21  |     }
  22  | }
  23  | 
  24  | test("realtime: перемещение карточки видно в другой вкладке", async ({ browser, baseURL }) => {
> 25  |     const createdVacancy = await withDbRetry(() => prisma.vacancy.create({
      |                                                                   ^ PrismaClientKnownRequestError: 
  26  |         data: {
  27  |             title: `E2E realtime ${Date.now()}`,
  28  |             grade: "middle",
  29  |             department: "Engineering",
  30  |         },
  31  |     }));
  32  | 
  33  |     try {
  34  |         await withDbRetry(() => prisma.stage.createMany({
  35  |             data: [
  36  |                 { vacancyId: createdVacancy.id, name: "Отклик", order: 0 },
  37  |                 { vacancyId: createdVacancy.id, name: "Скрининг", order: 1 },
  38  |             ],
  39  |         }));
  40  |         const stages = await withDbRetry(() => prisma.stage.findMany({
  41  |             where: { vacancyId: createdVacancy.id },
  42  |             orderBy: { order: "asc" },
  43  |         }));
  44  | 
  45  |         const fromStage = stages[0];
  46  |         const toStage = stages[1];
  47  |         if (!fromStage || !toStage) {
  48  |             throw new Error("Expected at least two stages for E2E setup");
  49  |         }
  50  | 
  51  |         const recruiter = await withDbRetry(() => prisma.user.upsert({
  52  |             where: { email: "e2e-recruiter@hireflow.local" },
  53  |             update: {},
  54  |             create: {
  55  |                 email: "e2e-recruiter@hireflow.local",
  56  |                 name: "E2E Recruiter",
  57  |                 role: "recruiter",
  58  |             },
  59  |         }));
  60  | 
  61  |         const candidate = await withDbRetry(() => prisma.candidate.create({
  62  |             data: {
  63  |                 vacancyId: createdVacancy.id,
  64  |                 stageId: fromStage.id,
  65  |                 fullName: "E2E Candidate",
  66  |                 source: "site",
  67  |                 grade: "middle",
  68  |                 expectedSalary: 100000,
  69  |                 assignedRecruiterId: recruiter.id,
  70  |             },
  71  |         }));
  72  | 
  73  |         const cookie = {
  74  |             name: "e2e-bypass",
  75  |             value: "1",
  76  |             url: baseURL ?? "http://localhost:3000",
  77  |         };
  78  |         const [ctxA, ctxB] = await Promise.all([browser.newContext(), browser.newContext()]);
  79  |         await Promise.all([ctxA.addCookies([cookie]), ctxB.addCookies([cookie])]);
  80  |         const [pageA, pageB] = await Promise.all([ctxA.newPage(), ctxB.newPage()]);
  81  | 
  82  |         await pageA.goto(`/board/${createdVacancy.id}`);
  83  |         await pageB.goto(`/board/${createdVacancy.id}`);
  84  |         await expect(pageA.getByTestId(`candidate-card-${candidate.id}`)).toBeVisible();
  85  |         await expect(pageB.getByTestId(`candidate-card-${candidate.id}`)).toBeVisible();
  86  | 
  87  |         await withDbRetry(() => prisma.candidate.update({
  88  |             where: { id: candidate.id },
  89  |             data: { stageId: toStage.id },
  90  |         }));
  91  | 
  92  |         await expect(
  93  |             pageA.getByTestId(`stage-column-${toStage.id}`).getByTestId(`candidate-card-${candidate.id}`)
  94  |         ).toBeVisible({ timeout: 15000 });
  95  |         await expect(
  96  |             pageB.getByTestId(`stage-column-${toStage.id}`).getByTestId(`candidate-card-${candidate.id}`)
  97  |         ).toBeVisible({ timeout: 15000 });
  98  | 
  99  |         await Promise.all([ctxA.close(), ctxB.close()]);
  100 |     } finally {
  101 |         await withDbRetry(() => prisma.vacancy.delete({
  102 |             where: { id: createdVacancy.id },
  103 |         })).catch(() => undefined);
  104 |     }
  105 | });
  106 | 
  107 | test.afterAll(async () => {
  108 |     await prisma.$disconnect();
  109 | });
  110 | 
```