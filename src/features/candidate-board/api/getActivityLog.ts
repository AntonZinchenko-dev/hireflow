// src/features/candidate-form/api/getActivityLog.ts
"use server";
import { prisma } from "@/shared/lib/prisma-client";

export async function getActivityLog(candidateId: string) {
    return prisma.activityLog.findMany({
        where: { candidateId },
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true, isBot: true } } },
    });
}