import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react";
import { neon } from "@neondatabase/serverless";

export const authClient = createAuthClient(
  import.meta.env.VITE_NEON_AUTH_URL,
  {
    adapter: BetterAuthReactAdapter(),
  }
);

// Neon SQL client for direct PostgreSQL queries
const DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL;
export const sql = neon(DATABASE_URL);

