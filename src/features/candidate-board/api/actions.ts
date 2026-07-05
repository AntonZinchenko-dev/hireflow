// src/features/candidate-board/api/actions.ts
"use server";
import { prisma } from "@/shared/lib/prisma-client";
import { getServerSession } from "@/shared/lib/supabase-server";
import { logActivity } from "@/shared/lib/activity";

export async function getCandidatesAction(vacancyId: string) {
    return prisma.candidate.findMany({
        where: { vacancyId }, orderBy:
            { createdAt: "desc" }
    });
}
export async function moveCandidateAction(input: {
    candidateId: string;
    stageId: string
}) {
    const session = await getServerSession();

    if (!session) throw new Error("Unauthorized");

    const candidate = await prisma.candidate.update({
        where: { id: input.candidateId },
        data: { stageId: input.stageId },
    });

    await logActivity(candidate.id, session.user.id, "stage_moved", {
        stageId:
            input.stageId
    });
    
    return candidate;
}
