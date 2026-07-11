"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/db";
import { usuario } from "@/db/schema";
import { ROLES } from "@/lib/estados";
import { requireNotario } from "@/lib/tenant";

const createSchema = z.object({
  nombre: z.string().trim().min(3, "El nombre es obligatorio."),
  email: z
    .string()
    .trim()
    .min(5, "Email inválido.")
    .max(120)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Email inválido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  rol: z.enum(ROLES, { message: "Elegí un rol." }),
});

export type CreateUsuarioState = { error: string } | { ok: true } | undefined;

export async function createUsuario(
  _prev: CreateUsuarioState,
  formData: FormData,
): Promise<CreateUsuarioState> {
  const notario = await requireNotario();

  const parsed = createSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    rol: formData.get("rol"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const email = parsed.data.email.toLowerCase();

  const existe = await db
    .select({ id: usuario.id })
    .from(usuario)
    .where(eq(usuario.email, email))
    .limit(1);

  if (existe.length > 0) {
    return { error: "Ya existe un usuario con ese email." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.insert(usuario).values({
    notariaId: notario.notariaId,
    nombre: parsed.data.nombre,
    email,
    passwordHash,
    rol: parsed.data.rol,
  });

  revalidatePath("/panel/usuarios");
  return { ok: true };
}

export async function deleteUsuario(formData: FormData): Promise<void> {
  const notario = await requireNotario();
  const id = z.uuid().parse(formData.get("id"));

  if (id === notario.id) {
    throw new Error("No podés eliminar tu propio usuario.");
  }

  // Solo dentro de la misma notaría (aislamiento multi-tenant).
  await db
    .delete(usuario)
    .where(and(eq(usuario.id, id), eq(usuario.notariaId, notario.notariaId)));

  revalidatePath("/panel/usuarios");
}
