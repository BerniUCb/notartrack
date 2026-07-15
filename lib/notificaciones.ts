import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { cliente, notaria, notificacionLog, tramite } from "@/db/schema";
import { TIPO_LABEL, type Tipo } from "@/lib/estados";
import { enviarNotificacion } from "@/lib/whatsapp";

export function buildMensajeListo(params: {
  notariaNombre: string;
  tipo: Tipo;
  codigo: string;
}): string {
  return `${params.notariaNombre}: su trámite de ${TIPO_LABEL[params.tipo]} (código ${params.codigo}) está listo para recoger. Horario de atención: lunes a viernes 8:30-16:30.`;
}

export type NotificacionResultado = { ok: boolean; motivo?: string };

/**
 * Envía la notificación "listo para recoger" y registra el intento en
 * notificacion_log. Nunca lanza: pensada para llamarse desde el avance de estado
 * sin romperlo si Twilio falla. Respeta el feature flag whatsappActivo.
 */
export async function notificarListoParaRecoger(
  tramiteId: string,
  notariaId: string,
): Promise<NotificacionResultado> {
  try {
    const [row] = await db
      .select({
        codigo: tramite.codigoSeguimiento,
        tipo: tramite.tipo,
        celular: cliente.celular,
        notariaNombre: notaria.nombre,
        whatsappActivo: notaria.whatsappActivo,
      })
      .from(tramite)
      .innerJoin(cliente, eq(tramite.clienteId, cliente.id))
      .innerJoin(notaria, eq(tramite.notariaId, notaria.id))
      .where(and(eq(tramite.id, tramiteId), eq(tramite.notariaId, notariaId)))
      .limit(1);

    if (!row) return { ok: false, motivo: "Trámite no encontrado." };
    if (!row.whatsappActivo) {
      return { ok: false, motivo: "WhatsApp no está activo para esta notaría." };
    }
    if (!row.celular) {
      return { ok: false, motivo: "El cliente no tiene celular registrado." };
    }

    const mensaje = buildMensajeListo({
      notariaNombre: row.notariaNombre,
      tipo: row.tipo,
      codigo: row.codigo,
    });

    const res = await enviarNotificacion(row.celular, mensaje);

    await db.insert(notificacionLog).values({
      tramiteId,
      celular: row.celular,
      mensaje,
      estado: res.ok ? "ENVIADO" : "FALLIDO",
      error: res.ok ? null : (res.error ?? "Error desconocido"),
    });

    return { ok: res.ok, motivo: res.ok ? undefined : res.error };
  } catch (err) {
    // Blindaje final: nunca romper el flujo que llama.
    return {
      ok: false,
      motivo: err instanceof Error ? err.message : "Error inesperado.",
    };
  }
}

/** Última notificación registrada para un trámite (o null si no hay). */
export async function getUltimaNotificacion(tramiteId: string) {
  const [row] = await db
    .select({
      estado: notificacionLog.estado,
      celular: notificacionLog.celular,
      error: notificacionLog.error,
      createdAt: notificacionLog.createdAt,
    })
    .from(notificacionLog)
    .where(eq(notificacionLog.tramiteId, tramiteId))
    .orderBy(desc(notificacionLog.createdAt))
    .limit(1);

  return row ?? null;
}
