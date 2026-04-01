import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Single PrismaClient for the whole Node process (dev + production).
 * Prevents connection pool exhaustion under Next.js hot reload and serverless warm instances.
 * @see https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let connectLogged = false;

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create PrismaClient");
  }

  if (process.env.NODE_ENV !== "test") {
    console.info("[prisma] Initializing client (DATABASE_URL is set)");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    adapter,
  });

  void client
    .$connect()
    .then(() => {
      if (!connectLogged) {
        connectLogged = true;
        console.info("[prisma] Database connection established");
      }
    })
    .catch((err: unknown) => {
      console.error("[prisma] Initial $connect failed", err);
    });

  return client;
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

// Lazy proxy avoids throwing during build-time module evaluation.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrismaClient() as unknown as object, prop, receiver);
  },
});
