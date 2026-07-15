import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { cliente, historialEstado, notaria, tramite } from "@/db/schema";
import type { Estado } from "@/lib/estados";

export async function listTramites(params: {
  notariaId: string;
  estado?: Estado;
  q?: string;
}) {
  const conditions = [eq(tramite.notariaId, params.notariaId)];

  if (params.estado) {
    conditions.push(eq(tramite.estadoActual, params.estado));
  }

  if (params.q) {
    const like = `%${params.q}%`;
    const match = or(
      ilike(cliente.nombreCompleto, like),
      ilike(cliente.ci, like),
      ilike(tramite.codigoSeguimiento, like),
    );
    if (match) conditions.push(match);
  }

  return db
    .select({
      id: tramite.id,
      codigoSeguimiento: tramite.codigoSeguimiento,
      tipo: tramite.tipo,
      estadoActual: tramite.estadoActual,
      fechaIngreso: tramite.fechaIngreso,
      clienteNombre: cliente.nombreCompleto,
      clienteCi: cliente.ci,
    })
    .from(tramite)
    .innerJoin(cliente, eq(tramite.clienteId, cliente.id))
    .where(and(...conditions))
    .orderBy(desc(tramite.fechaIngreso));
}

export async function getTramiteDetail(params: {
  id: string;
  notariaId: string;
}) {
  const rows = await db
    .select({
      id: tramite.id,
      codigoSeguimiento: tramite.codigoSeguimiento,
      tipo: tramite.tipo,
      estadoActual: tramite.estadoActual,
      observaciones: tramite.observaciones,
      fechaIngreso: tramite.fechaIngreso,
      fechaEntrega: tramite.fechaEntrega,
      clienteNombre: cliente.nombreCompleto,
      clienteCi: cliente.ci,
      clienteCelular: cliente.celular,
      whatsappActivo: notaria.whatsappActivo,
    })
    .from(tramite)
    .innerJoin(cliente, eq(tramite.clienteId, cliente.id))
    .innerJoin(notaria, eq(tramite.notariaId, notaria.id))
    .where(and(eq(tramite.id, params.id), eq(tramite.notariaId, params.notariaId)))
    .limit(1);

  if (rows.length === 0) return null;

  const historial = await db
    .select({
      id: historialEstado.id,
      estado: historialEstado.estado,
      comentario: historialEstado.comentario,
      createdAt: historialEstado.createdAt,
    })
    .from(historialEstado)
    .where(eq(historialEstado.tramiteId, params.id))
    .orderBy(historialEstado.createdAt);

  return { tramite: rows[0], historial };
}
