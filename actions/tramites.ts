"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { cliente, historialEstado, tramite } from "@/db/schema";
import {
  ESTADO_LABEL,
  TIPOS,
  nextEstado,
  previousEstado,
} from "@/lib/estados";
import {
  getCurrentNotariaId,
  getCurrentUser,
  requireNotario,
} from "@/lib/tenant";
import { generateTrackingCode } from "@/lib/tracking-code";

const createSchema = z.object({
  ci: z.string().trim().min(5, "El CI es obligatorio.").max(20),
  nombreCompleto: z.string().trim().min(3, "El nombre completo es obligatorio."),
  celular: z.string().trim().max(20).optional().or(z.literal("")),
  tipo: z.enum(TIPOS, { message: "Elegí un tipo de trámite." }),
  observaciones: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type CreateTramiteState = { error: string } | undefined;

/** Genera un código de seguimiento único verificando contra la base. */
async function generateUniqueTrackingCode(): Promise<string> {
  for (let intento = 0; intento < 20; intento++) {
    const code = generateTrackingCode();
    const existe = await db
      .select({ id: tramite.id })
      .from(tramite)
      .where(eq(tramite.codigoSeguimiento, code))
      .limit(1);
    if (existe.length === 0) return code;
  }
  throw new Error("No se pudo generar un código de seguimiento único.");
}

export async function createTramite(
  _prev: CreateTramiteState,
  formData: FormData,
): Promise<CreateTramiteState> {
  const parsed = createSchema.safeParse({
    ci: formData.get("ci"),
    nombreCompleto: formData.get("nombreCompleto"),
    celular: formData.get("celular"),
    tipo: formData.get("tipo"),
    observaciones: formData.get("observaciones"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const data = parsed.data;
  const user = await getCurrentUser();
  const notariaId = user.notariaId;

  // Buscar cliente existente por CI dentro de la notaría, o crearlo.
  let clienteId: string;
  const existente = await db
    .select({ id: cliente.id })
    .from(cliente)
    .where(and(eq(cliente.notariaId, notariaId), eq(cliente.ci, data.ci)))
    .limit(1);

  if (existente.length > 0) {
    clienteId = existente[0].id;
  } else {
    const [nuevo] = await db
      .insert(cliente)
      .values({
        notariaId,
        nombreCompleto: data.nombreCompleto,
        ci: data.ci,
        celular: data.celular || null,
      })
      .returning({ id: cliente.id });
    clienteId = nuevo.id;
  }

  const codigoSeguimiento = await generateUniqueTrackingCode();

  const [nuevoTramite] = await db
    .insert(tramite)
    .values({
      notariaId,
      clienteId,
      codigoSeguimiento,
      tipo: data.tipo,
      estadoActual: "RECIBIDO",
      observaciones: data.observaciones || null,
    })
    .returning({ id: tramite.id });

  await db.insert(historialEstado).values({
    tramiteId: nuevoTramite.id,
    estado: "RECIBIDO",
    comentario: "Trámite recibido en la notaría.",
    usuarioId: user.id,
  });

  revalidatePath("/panel");
  redirect(`/panel/${nuevoTramite.id}`);
}

const advanceSchema = z.object({
  tramiteId: z.uuid(),
  comentario: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function advanceTramite(formData: FormData): Promise<void> {
  const { tramiteId, comentario } = advanceSchema.parse({
    tramiteId: formData.get("tramiteId"),
    comentario: formData.get("comentario"),
  });
  const user = await getCurrentUser();

  const rows = await db
    .select({ estadoActual: tramite.estadoActual })
    .from(tramite)
    .where(and(eq(tramite.id, tramiteId), eq(tramite.notariaId, user.notariaId)))
    .limit(1);

  if (rows.length === 0) {
    throw new Error("Trámite no encontrado.");
  }

  const siguiente = nextEstado(rows[0].estadoActual);
  if (!siguiente) return; // Ya está ENTREGADO: no hay siguiente estado.

  await db
    .update(tramite)
    .set({
      estadoActual: siguiente,
      ...(siguiente === "ENTREGADO" ? { fechaEntrega: new Date() } : {}),
    })
    .where(eq(tramite.id, tramiteId));

  await db.insert(historialEstado).values({
    tramiteId,
    estado: siguiente,
    comentario: comentario || `Avanzó a ${ESTADO_LABEL[siguiente]}.`,
    usuarioId: user.id,
  });

  revalidatePath(`/panel/${tramiteId}`);
  revalidatePath("/panel");
}

const revertSchema = z.object({
  tramiteId: z.uuid(),
  comentario: z
    .string()
    .trim()
    .min(1, "El comentario es obligatorio para retroceder.")
    .max(500),
});

/**
 * Retrocede el trámite un estado. Solo el rol NOTARIO puede hacerlo y el
 * comentario es obligatorio (regla de CLAUDE.md). Registra una fila en el
 * historial con el usuario que lo hizo (queda auditado).
 */
export async function revertTramite(formData: FormData): Promise<void> {
  const { tramiteId, comentario } = revertSchema.parse({
    tramiteId: formData.get("tramiteId"),
    comentario: formData.get("comentario"),
  });
  const user = await requireNotario();

  const rows = await db
    .select({ estadoActual: tramite.estadoActual })
    .from(tramite)
    .where(and(eq(tramite.id, tramiteId), eq(tramite.notariaId, user.notariaId)))
    .limit(1);

  if (rows.length === 0) {
    throw new Error("Trámite no encontrado.");
  }

  const anterior = previousEstado(rows[0].estadoActual);
  if (!anterior) return; // Ya está en RECIBIDO: no hay estado anterior.

  await db
    .update(tramite)
    .set({ estadoActual: anterior, fechaEntrega: null })
    .where(eq(tramite.id, tramiteId));

  await db.insert(historialEstado).values({
    tramiteId,
    estado: anterior,
    comentario,
    usuarioId: user.id,
  });

  revalidatePath(`/panel/${tramiteId}`);
  revalidatePath("/panel");
}

/** Autocompletar en el formulario: busca un cliente por CI en la notaría. */
export async function findClienteByCi(
  ci: string,
): Promise<{ nombreCompleto: string; celular: string | null } | null> {
  const clean = ci.trim();
  if (clean.length < 3) return null;

  const notariaId = await getCurrentNotariaId();
  const rows = await db
    .select({
      nombreCompleto: cliente.nombreCompleto,
      celular: cliente.celular,
    })
    .from(cliente)
    .where(and(eq(cliente.notariaId, notariaId), eq(cliente.ci, clean)))
    .limit(1);

  return rows[0] ?? null;
}
