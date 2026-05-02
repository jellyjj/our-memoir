import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./dev.db",
  });
  const client = new PrismaClient({ adapter });

  // 启用 SQLite 性能优化
  client.$executeRaw`PRAGMA journal_mode=WAL`.catch(() => {});
  client.$executeRaw`PRAGMA synchronous=NORMAL`.catch(() => {});
  client.$executeRaw`PRAGMA cache_size=-64000`.catch(() => {}); // 64MB 缓存

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
