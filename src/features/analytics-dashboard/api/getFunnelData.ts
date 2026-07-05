// src/features/analytics-dashboard/api/getFunnelData.ts
"use server";
import { prisma } from "@/shared/lib/prisma-client";

type FunnelStage = {
 name: string;
 _count: {
 candidates: number;
 };
};

export async function getFunnelData(vacancyId: string) {
 const stages = await prisma.stage.findMany({
 where: { vacancyId },
 orderBy: { order: "asc" },
 include: { _count: { select: { candidates: true } } },
 });
 return stages.map((stage: FunnelStage, i: number) => {
 const count = stage._count.candidates;
 const prevCount = stages[i - 1]?._count.candidates ?? count;
 const conversionRate = prevCount > 0 ? Math.round((count / prevCount) *
100) : 100;
 return { stageName: stage.name, count, conversionRate };
 });
}