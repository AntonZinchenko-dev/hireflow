// src/app/board/[vacancyId]/page.tsx
import { prisma } from "@/shared/lib/prisma-client";
import { getCandidatesAction } from "@/features/candidate-board/api/actions";
import { BoardClient } from "@/features/candidate-board/ui/BoardClient";
import { notFound } from "next/navigation";
import type { Stage, Vacancy } from "@/entities/vacancy/types";

function toVacancyEntity(vacancy: {
    id: string;
    title: string;
    grade: string;
    department: string;
    status: string;
    createdAt: Date;
    stages: Stage[];
}): Vacancy & { stages: Stage[] } {
    return {
        ...vacancy,
        status: vacancy.status === "closed" ? "closed" : "open",
        createdAt: vacancy.createdAt.toISOString(),
    };
}

export default async function BoardPage({ params }: {
    params:
    Promise<{ vacancyId: string }>
}) {
    const { vacancyId } = await params;
    const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId },
        include: { stages: { orderBy: { order: "asc" } } },
    });
    if (!vacancy) notFound();
    const candidates = await getCandidatesAction(vacancyId);
    return (
        <BoardClient
            vacancy={toVacancyEntity(vacancy)}
            initialCandidates={candidates}
        />
    );
}
