import Link from "next/link";
import { notFound } from "next/navigation";

import { AdvanceButton, RevertButton } from "@/components/advance-button";
import { EstadoBadge } from "@/components/estado-badge";
import {
  ESTADO_LABEL,
  TIPO_LABEL,
  nextEstado,
  previousEstado,
} from "@/lib/estados";
import { formatFecha, formatFechaHora } from "@/lib/format";
import { getCurrentUser } from "@/lib/tenant";
import { getTramiteDetail } from "@/lib/tramites";

export default async function TramiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const data = await getTramiteDetail({ id, notariaId: user.notariaId });

  if (!data) notFound();

  const { tramite: t, historial } = data;
  const siguiente = nextEstado(t.estadoActual);
  const anterior = previousEstado(t.estadoActual);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/panel"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Volver a trámites
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-mono text-2xl font-semibold">
          {t.codigoSeguimiento}
        </h1>
        <EstadoBadge estado={t.estadoActual} />
      </div>

      {/* Datos del trámite */}
      <dl className="grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Cliente</dt>
          <dd className="text-sm font-medium">{t.clienteNombre}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">CI</dt>
          <dd className="text-sm">{t.clienteCi}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Celular</dt>
          <dd className="text-sm">{t.clienteCelular ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Tipo</dt>
          <dd className="text-sm">{TIPO_LABEL[t.tipo]}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fecha de ingreso</dt>
          <dd className="text-sm">{formatFecha(t.fechaIngreso)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fecha de entrega</dt>
          <dd className="text-sm">
            {t.fechaEntrega ? formatFecha(t.fechaEntrega) : "—"}
          </dd>
        </div>
        {t.observaciones ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Observaciones</dt>
            <dd className="text-sm">{t.observaciones}</dd>
          </div>
        ) : null}
      </dl>

      {/* Acciones de estado */}
      <div className="flex flex-col gap-3 rounded-md border p-4">
        {siguiente ? (
          <AdvanceButton
            tramiteId={t.id}
            siguienteLabel={ESTADO_LABEL[siguiente]}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Este trámite ya fue <strong>entregado</strong>. No hay más estados
            por avanzar.
          </p>
        )}
        {anterior && user.rol === "NOTARIO" ? (
          <RevertButton tramiteId={t.id} anteriorLabel={ESTADO_LABEL[anterior]} />
        ) : null}
      </div>

      {/* Timeline del historial */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Historial</h2>
        <ol className="flex flex-col">
          {historial.map((h, i) => (
            <li key={h.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1 h-3 w-3 rounded-full bg-primary" />
                {i < historial.length - 1 ? (
                  <span className="w-px flex-1 bg-border" />
                ) : null}
              </div>
              <div className="pb-5">
                <p className="text-sm font-medium">{ESTADO_LABEL[h.estado]}</p>
                {h.comentario ? (
                  <p className="text-sm text-muted-foreground">{h.comentario}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {formatFechaHora(h.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
