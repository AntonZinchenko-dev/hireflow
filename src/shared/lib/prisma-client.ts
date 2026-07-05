import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../prisma/generated";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
// Use pooled runtime URL first; DIRECT_URL is mainly for migrations/CLI.
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL for Prisma");
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });
}

export let prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function resetPrismaClient() {
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore disconnect errors; we'll replace the client anyway.
  }

  prisma = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
