"use server";

import { prisma } from "@/shared/lib/prisma-client";
import { resetPrismaClient } from "@/shared/lib/prisma-client";
import { getServerSession } from "@/shared/lib/supabase-server";
import { resolveAppRole } from "@/shared/lib/auth-role";
import { revalidatePath } from "next/cache";

async function getAccountPrisma() {
  if (Object.prototype.hasOwnProperty.call(prisma, "portalProfile")) {
    return prisma;
  }

  return resetPrismaClient();
}

export async function getOrCreateProfile() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = session.user;
  const role = resolveAppRole(user);
  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    user.email?.split("@")[0] ||
    "Пользователь";

  const client = await getAccountPrisma();
  const profile = await client.portalProfile.upsert({
    where: { authUserId: user.id },
    update: {
      email: user.email ?? "",
      role,
      fullName,
    },
    create: {
      authUserId: user.id,
      email: user.email ?? "",
      role,
      fullName,
    },
  });

  return profile;
}

export async function updateProfileAction(formData: FormData) {
  const session = await getServerSession();
  if (!session) {
    return;
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (fullName.length < 2) {
    return;
  }

  const client = await getAccountPrisma();
  await client.portalProfile.upsert({
    where: { authUserId: session.user.id },
    update: {
      fullName,
      headline: headline || null,
      bio: bio || null,
    },
    create: {
      authUserId: session.user.id,
      email: session.user.email ?? "",
      role: resolveAppRole(session.user),
      fullName,
      headline: headline || null,
      bio: bio || null,
    },
  });

  return;
}

export async function applyToVacancyAction(formData: FormData) {
  const session = await getServerSession();
  if (!session) {
    return;
  }

  if (resolveAppRole(session.user) !== "candidate") {
    return;
  }

  const vacancyId = String(formData.get("vacancyId") ?? "");
  if (!vacancyId) {
    return;
  }

  const client = await getAccountPrisma();
  const profile = await getOrCreateProfile();
  const vacancy = await client.vacancy.findUnique({
    where: { id: vacancyId, status: "open" },
    include: {
      stages: { orderBy: { order: "asc" }, select: { id: true } },
    },
  });

  if (!vacancy) {
    return;
  }

  const firstStage = vacancy.stages[0];
  if (!firstStage) {
    return;
  }

  const recruiter = await client.user.findFirst({
    where: {
      isBot: false,
      role: { in: ["recruiter", "hiring_manager", "admin"] },
    },
    select: { id: true },
  });

  if (!recruiter) {
    return;
  }

  await client.candidate.upsert({
    where: {
      vacancyId_portalProfileId: {
        vacancyId: vacancy.id,
        portalProfileId: profile.id,
      },
    },
    update: {},
    create: {
      vacancyId: vacancy.id,
      stageId: firstStage.id,
      fullName: profile.fullName,
      source: "site",
      grade: "middle",
      expectedSalary: 0,
      assignedRecruiterId: recruiter.id,
      portalProfileId: profile.id,
    },
  });

  revalidatePath("/jobs");
}
