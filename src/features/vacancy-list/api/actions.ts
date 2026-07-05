// src/features/vacancy-list/api/actions.ts

"use server";
import { prisma } from "@/shared/lib/prisma-client";
import { getServerSession } from "@/shared/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const DEFAULT_STAGES = ["Отклик", "Скрининг", "Интервью", "Оффер", "Найм"];

export async function createVacancyAction(formData: FormData) {
    const session = await getServerSession();
    if (!session || session.user.app_metadata.role !== "admin") {
        throw new Error("Недостаточно прав для создания вакансии");
    }
    const title = String(formData.get("title") ?? "").trim();
    const grade = String(formData.get("grade") ?? "middle");
    const department = String(formData.get("department") ?? "Engineering");
    if (!title) throw new Error("Название вакансии обязательно");
    const vacancy = await prisma.vacancy.create({
        data: {
            title, grade,
            department
        }
    });
    await prisma.stage.createMany({
        data: DEFAULT_STAGES.map((name, order) => ({
            vacancyId: vacancy.id, name,
            order
        })),
    });
    revalidatePath("/vacancies");
    redirect(`/board/${vacancy.id}`);
}
export async function getVacancies() {
    return prisma.vacancy.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { candidates: true } } },
    });
}