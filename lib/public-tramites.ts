import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { cliente, historialEstado, notaria, tramite } from "@/db/schema";
import { type Estado } from "@/lib/estados";
import { maskCi } from "@/lib/public";

export type TramitePublico = {
  codigo: string;
  tipo: (typeof tramite.$inferSelect)["tipo"];
  estadoActual: Estado;
  fechaIngreso: Date;
  ciMasked: string;
  notaria: { nombre: string; logoUrl: string | null; ciudad: string };
  // Fecha en la que se alcanzó cada estado (solo los ya recorridos).
  fechasPorEstado: Partial<Record<Estado, Date>>;
};

/** Búsqueda pública por código de seguimiento (único global). */
export async function getTramitePublico(
  codigo: string,
): Promise<TramitePublico | null> {
  const rows = await db
    .select({
      id: tramite.id,
      codigo: tramite.codigoSeguimiento,
      tipo: tramite.tipo,
      estadoActual: tramite.estadoActual,
      fechaIngreso: tramite.fechaIngreso,
      ci: cliente.ci,
      notariaNombre: notaria.nombre,
      notariaLogoUrl: notaria.logoUrl,
      notariaCiudad: notaria.ciudad,
    })
    .from(tramite)
    .innerJoin(cliente, eq(tramite.clienteId, cliente.id))
    .innerJoin(notaria, eq(tramite.notariaId, notaria.id))
    .where(eq(tramite.codigoSeguimiento, codigo))
    .limit(1);

  if (rows.length === 0) return null;
  const row = rows[0];

  const historial = await db
    .select({
      estado: historialEstado.estado,
      createdAt: historialEstado.createdAt,
    })
    .from(historialEstado)
    .where(eq(historialEstado.tramiteId, row.id))
    .orderBy(historialEstado.createdAt);

  const fechasPorEstado: Partial<Record<Estado, Date>> = {};
  for (const h of historial) {
    fechasPorEstado[h.estado] = h.createdAt;
  }

  return {
    codigo: row.codigo,
    tipo: row.tipo,
    estadoActual: row.estadoActual,
    fechaIngreso: row.fechaIngreso,
    ciMasked: maskCi(row.ci),
    notaria: {
      nombre: row.notariaNombre,
      logoUrl: row.notariaLogoUrl,
      ciudad: row.notariaCiudad,
    },
    fechasPorEstado,
  };
}

/** Búsqueda pública por CI dentro de una notaría (CI es único por notaría). */
export async function searchTramitesByCi(params: {
  notariaId: string;
  ci: string;
}) {
  return db
    .select({
      codigo: tramite.codigoSeguimiento,
      tipo: tramite.tipo,
      estadoActual: tramite.estadoActual,
      fechaIngreso: tramite.fechaIngreso,
    })
    .from(tramite)
    .innerJoin(cliente, eq(tramite.clienteId, cliente.id))
    .where(
      and(eq(tramite.notariaId, params.notariaId), eq(cliente.ci, params.ci)),
    )
    .orderBy(desc(tramite.fechaIngreso));
}

/** Notarías disponibles para el selector de la búsqueda por CI. */
export async function listNotariasPublic() {
  return db
    .select({ id: notaria.id, nombre: notaria.nombre })
    .from(notaria)
    .orderBy(notaria.nombre);
}
