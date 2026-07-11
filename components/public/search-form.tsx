"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

import { buscarTramites, type SearchState } from "@/actions/seguimiento";
import { EstadoBadge } from "@/components/estado-badge";
import { TIPO_LABEL } from "@/lib/estados";
import { formatFecha } from "@/lib/format";

type Notaria = { id: string; nombre: string };
type Modo = "codigo" | "ci";

export function SearchForm({ notarias }: { notarias: Notaria[] }) {
  const [modo, setModo] = useState<Modo>("codigo");
  const [state, formAction, isPending] = useActionState<SearchState, FormData>(
    buscarTramites,
    undefined,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de modo */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1">
        <TabButton active={modo === "codigo"} onClick={() => setModo("codigo")}>
          Con código
        </TabButton>
        <TabButton active={modo === "ci"} onClick={() => setModo("ci")}>
          Con cédula
        </TabButton>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="modo" value={modo} />

        {modo === "codigo" ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="codigo" className="text-sm font-medium text-neutral-700">
              Código de seguimiento
            </label>
            <input
              id="codigo"
              name="codigo"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              placeholder="NT-XXXXX"
              className="h-14 w-full rounded-lg border border-neutral-300 bg-white px-4 text-center text-lg font-semibold tracking-widest uppercase text-neutral-900 outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-neutral-400 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
            />
            <p className="text-xs text-neutral-500">
              Lo encontrás en el comprobante que le dieron en la notaría.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="notariaId"
                className="text-sm font-medium text-neutral-700"
              >
                Notaría
              </label>
              <select
                id="notariaId"
                name="notariaId"
                defaultValue={notarias[0]?.id ?? ""}
                className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
              >
                {notarias.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ci" className="text-sm font-medium text-neutral-700">
                Cédula de identidad
              </label>
              <input
                id="ci"
                name="ci"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ej: 4587963"
                className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none placeholder:text-neutral-400 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {isPending ? "Buscando…" : "Buscar mi trámite"}
        </button>
      </form>

      {state?.status === "error" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {state.message}
        </p>
      ) : null}

      {state?.status === "multiple" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-600">
            Encontramos {state.items.length} trámites con esa cédula. Elegí cuál
            querés ver:
          </p>
          <ul className="flex flex-col gap-2">
            {state.items.map((item) => (
              <li key={item.codigo}>
                <Link
                  href={`/seguimiento/${item.codigo}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <span className="min-w-0">
                    <span className="block font-mono text-sm font-semibold text-neutral-900">
                      {item.codigo}
                    </span>
                    <span className="block text-xs text-neutral-500">
                      {TIPO_LABEL[item.tipo]} · Ingresó{" "}
                      {formatFecha(item.fechaIngreso)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <EstadoBadge estado={item.estadoActual} />
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-white text-neutral-900 shadow-sm"
          : "text-neutral-500 hover:text-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}
