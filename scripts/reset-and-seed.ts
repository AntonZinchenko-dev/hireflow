import { prisma } from "../src/shared/lib/prisma-client";
import { faker } from "@faker-js/faker/locale/ru";

async function main() {
    await prisma.activityLog.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.stage.deleteMany();
    await prisma.vacancy.deleteMany();
    await prisma.user.deleteMany();
    const recruiter = await prisma.user.create({
        data: {
            name: "Анна Рекрутёр", email: "recruiter@hireflow.demo", role:
                "recruiter"
        },
    });
    const bot = await prisma.user.create({
        data: {
            name: "HireFlow Bot", email: "bot@hireflow.demo", role:
                "recruiter", isBot: true
        },
    });
    const vacancy = await prisma.vacancy.create({
        data: {
            title: "Frontend Developer (Middle+)", grade: "middle",
            department: "Engineering"
        },
    });
    const stageNames = ["Отклик", "Скрининг", "Интервью", "Оффер", "Найм"];
    const stages = await Promise.all(
        stageNames.map((name, order) => prisma.stage.create({
            data: {
                vacancyId:
                    vacancy.id, name, order
            }
        }))
    );
    for (let i = 0; i < 10; i++) {
        const stage = stages[faker.number.int({
            min: 0, max: stages.length -
                2
        })];
        if (!stage) {
            throw new Error("Failed to select a stage for candidate seed");
        }
        await prisma.candidate.create({
            data: {
                vacancyId: vacancy.id,
                stageId: stage.id,
                fullName: faker.person.fullName(),
                source: faker.helpers.arrayElement(["site", "referral", "agency",
                    "headhunting"]),
                grade: faker.helpers.arrayElement(["junior", "middle", "senior"]),
                expectedSalary: faker.number.int({ min: 150000, max: 400000 }),
                assignedRecruiterId: recruiter.id,
            },
        });
    }
    console.log("Seed завершён:", {
        recruiter: recruiter.email, bot: bot.email,
        vacancy: vacancy.title
    });
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
