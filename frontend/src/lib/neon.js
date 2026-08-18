import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react";
import { neon } from "@neondatabase/serverless";

export const authClient = createAuthClient(
  "https://ep-late-art-acxidtbt.neonauth.sa-east-1.aws.neon.tech/neondb/auth",
  {
    adapter: BetterAuthReactAdapter(),
  }
);

// Neon SQL client for direct PostgreSQL queries
const DATABASE_URL = "postgresql://neondb_owner:npg_RAl48mfsWQKg@ep-late-art-acxidtbt-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require";
export const sql = neon(DATABASE_URL);

