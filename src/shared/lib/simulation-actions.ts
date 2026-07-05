// src/shared/lib/simulation-actions.ts
import { prisma } from "./prisma-client";
import { logActivity } from "./activity";
import { faker } from "@faker-js/faker/locale/ru";
async function getBotUser() {
    return prisma.user.upsert({
        where: { email: "bot@hireflow.demo" },
        update: {},
        create: {
            name: "HireFlow Bot", email: "bot@hireflow.demo", role:
                "recruiter", isBot: true
        },
    });
}
export async function moveRandomCandidate() {
    const bot = await getBotUser();
    const candidate = await prisma.candidate.findFirst({
        orderBy: { updatedAt: "asc" },
        include: {
            stage: {
                include: {
                    vacancy: {
                        include: {
                            stages: {
                                orderBy:
                                    { order: "asc" }
                            }
                        }
                    }
                }
            }
        },
    });
    if (!candidate) return { skipped: true };
    const stages = candidate.stage.vacancy.stages;
    const currentIndex = stages.findIndex((s) => s.id === candidate.stageId);
    const nextStage = stages[currentIndex + 1];
    if (!nextStage) return { skipped: true }; await prisma.candidate.update({
        where: { id: candidate.id }, data:
            { stageId: nextStage.id }
    });
    await logActivity(candidate.id, bot.id, "stage_moved", {
        stageId:
            nextStage.id
    });
    return { moved: candidate.id, to: nextStage.name };
}
export async function createRandomCandidate() {
    const bot = await getBotUser();
    const vacancy = await prisma.vacancy.findFirst({
        include: {
            stages:
                { orderBy: { order: "asc" } }
        }
    });
    if (!vacancy) return { skipped: true };
    const firstStage = vacancy.stages[0];
    if (!firstStage) return { skipped: true };
    const candidate = await prisma.candidate.create({
        data: {
            vacancyId: vacancy.id,
            stageId: firstStage.id,
            fullName: faker.person.fullName(),
            source: faker.helpers.arrayElement(["site", "referral", "agency",
                "headhunting"]),
            grade: faker.helpers.arrayElement(["junior", "middle", "senior"]),
            expectedSalary: faker.number.int({ min: 150000, max: 400000 }),
            assignedRecruiterId: bot.id,
        },
    });
    await logActivity(candidate.id, bot.id, "created", {});
    return { created: candidate.id };
}
export async function addRandomComment() {
    const bot = await getBotUser();
    const candidate = await prisma.candidate.findFirst({
        orderBy: {
            updatedAt:
                "desc"
        }
    });
    if (!candidate) return { skipped: true };
    await prisma.comment.create({
        data: {
            candidateId: candidate.id, authorId: bot.id, text:
                faker.lorem.sentence()
        },
    });
    await logActivity(candidate.id, bot.id, "comment_added", {});
    return { commented: candidate.id };
}
