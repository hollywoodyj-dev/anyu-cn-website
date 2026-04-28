import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

declare global {
  var __anyuPrisma: PrismaClient | undefined;
  var __anyuPgPool: Pool | undefined;
}

export function getPrismaClient(): PrismaClient {
  if (!global.__anyuPrisma) {
    const url = process.env.ANYU_CHAT_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    global.__anyuPgPool = pool;
    global.__anyuPrisma = new PrismaClient({ adapter });
  }
  return global.__anyuPrisma;
}
