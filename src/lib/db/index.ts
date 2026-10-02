import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type AppDatabase = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  drizzleDb: AppDatabase | undefined;
};

function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  // Neon / dotenv sometimes wrap the value in quotes; Workers secrets must be bare URLs.
  return raw.trim().replace(/^['"]|['"]$/g, "");
}

function getDb(): AppDatabase {
  if (globalForDb.drizzleDb) {
    return globalForDb.drizzleDb;
  }

  const sql = neon(resolveDatabaseUrl());
  const db = drizzle(sql, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.drizzleDb = db;
  }

  return db;
}

/** Lazy proxy so importing this module during `next build` does not require DATABASE_URL. */
export const db = new Proxy({} as AppDatabase, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getDb(), prop, receiver);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});

export type Database = AppDatabase;
