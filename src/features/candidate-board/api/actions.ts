// src/features/candidate-board/api/actions.ts
"use server";
import { prisma, withPrismaRetry } from "@/shared/lib/prisma-client";
import { getServerSession } from "@/shared/lib/supabase-server";
import { logActivity } from "@/shared/lib/activity";
import { cookies } from "next/headers";
import type { Candidate } from "@/entities/candidate/types";

type PrismaCandidate = Awaited<
    ReturnType<typeof prisma.candidate.findFirstOrThrow>
>;

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
    const candidates = await withPrismaRetry(() =>
        prisma.candidate.findMany({
            where: { vacancyId }, orderBy:
                { createdAt: "desc" }
        })
    );

    return candidates.map(toCandidateEntity);
}
export async function moveCandidateAction(input: {
    candidateId: string;
    stageId: string
}) {
    const session = await getServerSession();
    const cookieStore = await cookies();
    const isE2EBypass =
        process.env.NODE_ENV !== "production"
        && cookieStore.get("e2e-bypass")?.value === "1";
    if (!session && !isE2EBypass) throw new Error("Unauthorized");

    const currentCandidate = await prisma.candidate.findUnique({
        where: { id: input.candidateId },
        select: { id: true, vacancyId: true },
    });
    if (!currentCandidate) {
        throw new Error("Candidate not found");
    }

    const targetStage = await prisma.stage.findUnique({
        where: { id: input.stageId },
        select: { id: true, vacancyId: true },
    });
    if (!targetStage || targetStage.vacancyId !== currentCandidate.vacancyId) {
        throw new Error("Invalid target stage");
    }

    const candidate = await prisma.candidate.update({
        where: { id: input.candidateId },
        data: { stageId: input.stageId },
    });

    const email = session?.user.email ?? "e2e-bypass@hireflow.local";
    const role = session?.user.app_metadata?.role === "admin"
        || session?.user.app_metadata?.role === "hiring_manager"
        ? session.user.app_metadata.role
        : "recruiter";

    const actor = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name:
                (session?.user.user_metadata?.full_name as string | undefined) ??
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
