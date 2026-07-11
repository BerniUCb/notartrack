import Link from "next/link";

import { EstadoBadge } from "@/components/estado-badge";
import { ESTADOS, ESTADO_LABEL, TIPO_LABEL, type Estado } from "@/lib/estados";
import { formatFecha } from "@/lib/format";
import { getCurrentNotariaId } from "@/lib/tenant";
import { listTramites } from "@/lib/tramites";

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const estado = ESTADOS.includes(sp.estado as Estado)
    ? (sp.estado as Estado)
    : undefined;
  const q = sp.q?.trim() || undefined;

  const notariaId = await getCurrentNotariaId();
  const tramites = await listTramites({ notariaId, estado, q });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Trámites</h1>
        <Link
          href="/panel/nuevo"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Nuevo trámite
        </Link>
      </div>

      <form method="get" className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre, CI o código"
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <select
          name="estado"
          defaultValue={estado ?? ""}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ESTADO_LABEL[e]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium"
        >
          Filtrar
        </button>
      </form>

      {tramites.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No hay trámites que coincidan con la búsqueda.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Código</th>
                <th className="px-3 py-2 font-medium">Cliente</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium whitespace-nowrap">
                  Ingreso
                </th>
              </tr>
            </thead>
            <tbody>
              {tramites.map((t) => (
                <tr key={t.id} className="border-t hover:bg-muted/40">
                  <td className="px-3 py-2">
                    <Link
                      href={`/panel/${t.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {t.codigoSeguimiento}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <div>{t.clienteNombre}</div>
                    <div className="text-xs text-muted-foreground">
                      CI {t.clienteCi}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {TIPO_LABEL[t.tipo]}
                  </td>
                  <td className="px-3 py-2">
                    <EstadoBadge estado={t.estadoActual} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatFecha(t.fechaIngreso)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
