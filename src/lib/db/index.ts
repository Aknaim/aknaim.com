import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type AppDatabase =
  | ReturnType<typeof drizzleNeon<typeof schema>>
  | ReturnType<typeof drizzlePostgres<typeof schema>>;

const globalForDb = globalThis as unknown as {
  drizzleDb: AppDatabase | undefined;
  postgresClient: ReturnType<typeof postgres> | undefined;
};

function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  // Neon / dotenv sometimes wrap the value in quotes; Workers secrets must be bare URLs.
  return raw.trim().replace(/^['"]|['"]$/g, "");
}

function isNeonUrl(url: string): boolean {
  return url.includes("neon.tech") || url.includes("neon.database");
}

function getDb(): AppDatabase {
  if (globalForDb.drizzleDb) {
    return globalForDb.drizzleDb;
  }

  const url = resolveDatabaseUrl();

  // Production / Neon: HTTP driver (Cloudflare Workers–friendly).
  // Local Docker: postgres.js over TCP.
  // Always cache on the isolate — recreating Neon clients per query blows
  // Worker CPU/memory (Error 1102) under OpenNext on Cloudflare.
  const db = isNeonUrl(url)
    ? drizzleNeon(neon(url), { schema })
    : drizzlePostgres(
        (globalForDb.postgresClient ??= postgres(url, { max: 5, prepare: false })),
        { schema }
      );

  globalForDb.drizzleDb = db;
  return db;
}

/** Lazy proxy so importing this module during `next build` does not require DATABASE_URL. */
export const db = new Proxy({} as AppDatabase, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export type Database = AppDatabase;
