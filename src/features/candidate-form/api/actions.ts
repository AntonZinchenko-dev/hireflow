// src/features/candidate-form/api/actions.ts
"use server";
import { prisma } from "@/shared/lib/prisma-client";
import { getServerSession } from "@/shared/lib/supabase-server";
import { logActivity } from "@/shared/lib/activity";
import { candidateSchema } from "../model/schema";

export async function saveCandidateAction(raw: unknown) {
    const session = await getServerSession();
    if (!session) return {
        ok: false as const, errors: {
            formErrors:
                ["Unauthorized"], fieldErrors: {}
        }
    };
    const parsed = candidateSchema.safeParse(raw);
    if (!parsed.success) return {
        ok: false as const, errors:
            parsed.error.flatten()
    };
    const { id, ...data } = parsed.data;
    const rawVacancyId = (raw as { vacancyId?: unknown }).vacancyId;
    const vacancyId = typeof rawVacancyId === "string" ? rawVacancyId : "";
    if (!id && !vacancyId) {
        return {
            ok: false as const,
            errors: {
                formErrors: ["vacancyId is required for candidate creation"],
                fieldErrors: {},
            },
        };
    }

    const prismaData = {
        fullName: data.fullName,
        source: data.source,
        grade: data.grade,
        stageId: data.stageId,
        expectedSalary: data.expectedSalary,
        referrerName: data.referrerName ?? null,
        seniorityExpectations: data.seniorityExpectations ?? null,
        offerAmount: data.offerAmount ?? null,
        offerDeadline: data.offerDeadline ? new Date(data.offerDeadline) : null,
    };

    const candidate = id
        ? await prisma.candidate.update({ where: { id }, data: prismaData })
        : await prisma.candidate.create({
            data: {
                ...prismaData,
                vacancyId,
                assignedRecruiterId: session.user.id,
            },
        });
    await logActivity(candidate.id, session.user.id, id ? "field_changed" :
        "created", {
        ...data,
        referrerName: data.referrerName ?? null,
        seniorityExpectations: data.seniorityExpectations ?? null,
        offerAmount: data.offerAmount ?? null,
        offerDeadline: data.offerDeadline ?? null,
    });
    return { ok: true as const, candidate };
}
