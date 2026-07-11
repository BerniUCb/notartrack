import { db } from "@/db";
import { notaria } from "@/db/schema";

// Hasta la Fase 3 (auth) no hay usuario logueado. Como sólo existe una notaría
// (la del seed), tomamos la primera. Cuando llegue auth, esto se reemplaza por
// la notaría del usuario de la sesión. Toda query del panel debe seguir
// filtrando por notariaId para no romper el aislamiento multi-tenant.
export async function getCurrentNotariaId(): Promise<string> {
  const rows = await db.select({ id: notaria.id }).from(notaria).limit(1);
  if (rows.length === 0) {
    throw new Error(
      "No hay ninguna notaría cargada. Ejecutá `npm run db:seed`.",
    );
  }
  return rows[0].id;
}
