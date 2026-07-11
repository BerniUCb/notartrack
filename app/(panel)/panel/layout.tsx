import Link from "next/link";

import { logout } from "@/actions/auth";
import { ROL_LABEL } from "@/lib/estados";
import { getCurrentUser } from "@/lib/tenant";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/panel" className="font-semibold">
            NotarTrack · Panel
          </Link>
          <div className="flex items-center gap-3">
            {user.rol === "NOTARIO" ? (
              <Link
                href="/panel/usuarios"
                className="text-sm text-muted-foreground hover:underline"
              >
                Usuarios
              </Link>
            ) : null}
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-muted-foreground hover:underline"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <p className="text-xs text-muted-foreground">
            {user.nombre} · {ROL_LABEL[user.rol]}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>
    </div>
  );
}
