import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";

import { EstadoBadge } from "@/components/estado-badge";
import { TrackingTimeline } from "@/components/public/tracking-timeline";
import { TIPO_LABEL } from "@/lib/estados";
import { formatFecha } from "@/lib/format";
import { ESTADO_MENSAJE } from "@/lib/public";
import { getTramitePublico } from "@/lib/public-tramites";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ codigo: string }>;
}): Promise<Metadata> {
  const { codigo } = await params;
  return {
    title: `Trámite ${decodeURIComponent(codigo).toUpperCase()} | NotarTrack`,
    description: "Estado de su trámite notarial.",
    // La vista de un trámite no debe indexarse.
    robots: { index: false, follow: false },
  };
}

export default async function TramitePublicoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const data = await getTramitePublico(decodeURIComponent(codigo).toUpperCase());

  if (!data) notFound();

  const listoOEntregado =
    data.estadoActual === "LISTO_PARA_RECOGER" ||
    data.estadoActual === "ENTREGADO";

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-6 pb-10">
      {/* Header de la notaría */}
      <header className="mb-6 flex items-center gap-3 border-b border-neutral-200 pb-5">
        {data.notaria.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.notaria.logoUrl}
            alt={data.notaria.nombre}
            className="h-11 w-11 rounded-lg object-contain"
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <Building2 className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-neutral-900">
            {data.notaria.nombre}
          </p>
          <p className="text-xs text-neutral-500">{data.notaria.ciudad}</p>
        </div>
      </header>

      {/* Código + estado */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Código de seguimiento
          </p>
          <p className="font-mono text-2xl font-bold text-neutral-900">
            {data.codigo}
          </p>
        </div>
        <EstadoBadge estado={data.estadoActual} />
      </div>

      {/* Mensaje contextual */}
      <div
        className={`mt-4 rounded-xl border p-4 text-sm ${
          listoOEntregado
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-blue-200 bg-blue-50 text-blue-800"
        }`}
      >
        {ESTADO_MENSAJE[data.estadoActual]}
      </div>

      {/* Datos del trámite */}
      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div>
          <dt className="text-xs text-neutral-500">Tipo de trámite</dt>
          <dd className="text-sm font-medium text-neutral-900">
            {TIPO_LABEL[data.tipo]}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Fecha de ingreso</dt>
          <dd className="text-sm font-medium text-neutral-900">
            {formatFecha(data.fechaIngreso)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-neutral-500">Cédula del titular</dt>
          <dd className="text-sm font-medium text-neutral-900">
            {data.ciMasked}
          </dd>
        </div>
      </dl>

      {/* Timeline */}
      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">
          Estado del trámite
        </h2>
        <TrackingTimeline
          estadoActual={data.estadoActual}
          fechasPorEstado={data.fechasPorEstado}
        />
      </section>

      <div className="mt-6 text-center">
        <Link
          href="/seguimiento"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Consultar otro trámite
        </Link>
      </div>
    </div>
  );
}
