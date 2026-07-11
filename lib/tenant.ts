import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { Rol } from "@/lib/estados";

export type SessionUser = {
  id: string;
  notariaId: string;
  rol: Rol;
  nombre: string;
  email: string;
};

/**
 * Usuario de la sesión actual. Si no hay sesión, redirige a /login (defensa en
 * profundidad: el middleware ya protege /panel, pero las queries/acciones no
 * deben confiar sólo en él).
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return {
    id: session.user.id,
    notariaId: session.user.notariaId,
    rol: session.user.rol,
    nombre: session.user.nombre,
    email: session.user.email ?? "",
  };
}

/** notariaId del usuario en sesión. Toda query del panel debe filtrar por este. */
export async function getCurrentNotariaId(): Promise<string> {
  const user = await getCurrentUser();
  return user.notariaId;
}

/** Exige rol NOTARIO; lanza si no lo es (para acciones restringidas). */
export async function requireNotario(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user.rol !== "NOTARIO") {
    throw new Error("Acción permitida solo para el rol Notario.");
  }
  return user;
}
