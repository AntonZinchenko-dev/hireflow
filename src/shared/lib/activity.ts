// src/shared/lib/activity.ts
import { prisma } from "./prisma-client";

type ActivityLogCreateData = Parameters<typeof prisma.activityLog.create>[0]["data"];

export async function logActivity(
 candidateId: string,
 actorId: string,
  type: ActivityLogCreateData["type"],
  payload: ActivityLogCreateData["payload"]
) {
 return prisma.activityLog.create({
 data: { candidateId, actorId, type, payload },
 });
}
