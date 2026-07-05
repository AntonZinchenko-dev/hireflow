// src/features/candidate-form/api/getActivityLog.ts
"use server";
import { prisma } from "@/shared/lib/prisma-client";

export type ActivityLogEntry = {
    id: string;
    type: string;
    createdAt: Date;
    actor: {
        name: string;
        isBot: boolean;
    };
};

export async function getActivityLog(candidateId: string) {
    const entries = await prisma.activityLog.findMany({
        where: { candidateId },
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true, isBot: true } } },
    });

    return entries as ActivityLogEntry[];
}