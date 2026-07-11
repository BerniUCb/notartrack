import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteUsuario } from "@/actions/usuarios";
import { UsuarioForm } from "@/components/usuario-form";
import { ROL_LABEL } from "@/lib/estados";
import { getCurrentUser } from "@/lib/tenant";
import { listUsuarios } from "@/lib/usuarios";

export default async function UsuariosPage() {
  const user = await getCurrentUser();
  if (user.rol !== "NOTARIO") redirect("/panel");

  const usuarios = await listUsuarios(user.notariaId);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/panel"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Volver a trámites
      </Link>
      <h1 className="text-xl font-semibold">Usuarios de la notaría</h1>

      <div className="rounded-md border">
        <ul className="divide-y">
          {usuarios.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{u.nombre}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {u.email} · {ROL_LABEL[u.rol]}
                </p>
              </div>
              {u.id === user.id ? (
                <span className="text-xs text-muted-foreground">Vos</span>
              ) : (
                <form action={deleteUsuario}>
                  <input type="hidden" name="id" value={u.id} />
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="mb-3 text-sm font-semibold">Crear nuevo usuario</h2>
        <UsuarioForm />
      </div>
    </div>
  );
}
