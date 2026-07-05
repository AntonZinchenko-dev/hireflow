// src/features/candidate-board/api/actions.ts
"use server";
import { prisma } from "@/shared/lib/prisma-client";
import { getServerSession } from "@/shared/lib/supabase-server";
import { logActivity } from "@/shared/lib/activity";
import type { Candidate } from "@/entities/candidate/types";
import type { Candidate as PrismaCandidate } from "@prisma/client";

function toCandidateEntity(candidate: PrismaCandidate): Candidate {
    return {
        ...candidate,
        source: candidate.source as Candidate["source"],
        grade: candidate.grade as Candidate["grade"],
        createdAt: candidate.createdAt.toISOString(),
        updatedAt: candidate.updatedAt.toISOString(),
        offerDeadline: candidate.offerDeadline?.toISOString() ?? null,
    };
}

export async function getCandidatesAction(vacancyId: string) {
    const candidates = await prisma.candidate.findMany({
        where: { vacancyId }, orderBy:
            { createdAt: "desc" }
    });

    return candidates.map(toCandidateEntity);
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

    const email = session.user.email;
    if (!email) {
        throw new Error("Authenticated user email is required");
    }

    const role =
        session.user.app_metadata?.role === "admin" ||
            session.user.app_metadata?.role === "hiring_manager"
            ? session.user.app_metadata.role
            : "recruiter";

    const actor = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name:
                (session.user.user_metadata?.full_name as string | undefined) ??
                email.split("@")[0] ??
                "User",
            role,
        },
        select: { id: true },
    });

    // Activity logging is non-critical; candidate move should still succeed.
    try {
        await logActivity(candidate.id, actor.id, "stage_moved", {
            stageId: input.stageId,
        });
    } catch (error) {
        console.error("Failed to write activity log", error);
    }

    return candidate;
}
