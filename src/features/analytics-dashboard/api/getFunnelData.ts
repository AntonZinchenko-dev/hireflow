// src/features/analytics-dashboard/api/getFunnelData.ts
"use server";
import { prisma } from "@/shared/lib/prisma-client";

type FunnelStage = {
  name: string;
  order: number;
  _count: {
    candidates: number;
  };
};

export type FunnelPoint = {
  stageName: string;
  count: number;
  conversionRate: number;
};

export async function getFunnelData(vacancyId: string) {
  const stages = await prisma.stage.findMany({
    where: { vacancyId },
    orderBy: { order: "asc" },
    include: { _count: { select: { candidates: true } } },
  });

  return stages.map((stage: FunnelStage, i: number): FunnelPoint => {
    const count = stage._count.candidates;
    const prevCount = stages[i - 1]?._count.candidates ?? count;
    const conversionRate = prevCount > 0 ? Math.round((count / prevCount) * 100) : 100;

    return { stageName: stage.name, count, conversionRate };
  });
}

export async function getAggregateFunnelData() {
  const vacancies = await prisma.vacancy.findMany({
    select: {
      stages: {
        orderBy: { order: "asc" },
        include: { _count: { select: { candidates: true } } },
      },
    },
  });

  const bucketByOrder = new Map<number, { stageName: string; count: number }>();

  for (const vacancy of vacancies) {
    for (const stage of vacancy.stages as FunnelStage[]) {
      const current = bucketByOrder.get(stage.order);
      if (!current) {
        bucketByOrder.set(stage.order, { stageName: stage.name, count: stage._count.candidates });
        continue;
      }

      current.count += stage._count.candidates;
    }
  }

  const orderedBuckets = [...bucketByOrder.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, value]) => value);

  return orderedBuckets.map((bucket, i): FunnelPoint => {
    const prevCount = orderedBuckets[i - 1]?.count ?? bucket.count;
    const conversionRate = prevCount > 0 ? Math.round((bucket.count / prevCount) * 100) : 100;

    return {
      stageName: bucket.stageName,
      count: bucket.count,
      conversionRate,
    };
  });
}