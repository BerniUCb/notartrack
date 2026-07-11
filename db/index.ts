import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL no está definida. Copiá .env.example a .env.local y completá la conexión de Neon.",
  );
}

const sql = neon(process.env.DATABASE_URL);

// El schema se agrega en la Fase 1 (db/schema.ts).
export const db = drizzle({ client: sql });
