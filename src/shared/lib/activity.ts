// src/shared/lib/activity.ts
import { prisma } from "./prisma-client";
import type { Prisma } from "@prisma/client";

export async function logActivity(
 candidateId: string,
 actorId: string,
  type: Prisma.ActivityLogCreateInput["type"],
  payload: Prisma.InputJsonValue
) {
 return prisma.activityLog.create({
 data: { candidateId, actorId, type, payload },
 });
}
