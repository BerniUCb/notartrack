import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { usuario } from "@/db/schema";

export async function listUsuarios(notariaId: string) {
  return db
    .select({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      createdAt: usuario.createdAt,
    })
    .from(usuario)
    .where(eq(usuario.notariaId, notariaId))
    .orderBy(asc(usuario.nombre));
}
