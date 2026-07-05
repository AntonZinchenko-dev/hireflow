// src/features/scorecard/api/actions.ts
"use server";

import { prisma } from "@/shared/lib/prisma-client";
import { getServerSession } from "@/shared/lib/supabase-server";
import { logActivity } from "@/shared/lib/activity";
import { scorecardSchema } from "../model/schema";

export async function saveScorecardAction(raw: unknown) {
    const session = await getServerSession();
    if (!session) return { ok: false as const };
    const parsed = scorecardSchema.safeParse(raw);
    if (!parsed.success) return {
        ok: false as const, errors:
            parsed.error.flatten()
    };
    const email = session.user.email;
    if (!email) return { ok: false as const };

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

    const prismaData = {
        ...parsed.data,
        comment: parsed.data.comment ?? null,
        interviewerId: actor.id,
    };

    const interview = await prisma.interview.create({
        data: prismaData,
    });
    await logActivity(parsed.data.candidateId, actor.id,
        "interview_added", {
        ...parsed.data,
        comment: parsed.data.comment ?? null,
    });
    return { ok: true as const, interview };
}
