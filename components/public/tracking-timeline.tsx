import { Check } from "lucide-react";

import { ESTADOS, ESTADO_LABEL, type Estado } from "@/lib/estados";
import { formatFechaHora } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TrackingTimeline({
  estadoActual,
  fechasPorEstado,
}: {
  estadoActual: Estado;
  fechasPorEstado: Partial<Record<Estado, Date>>;
}) {
  const currentIndex = ESTADOS.indexOf(estadoActual);

  return (
    <ol className="relative">
      {ESTADOS.map((estado, i) => {
        const status =
          i < currentIndex ? "done" : i === currentIndex ? "current" : "pending";
        const fecha = fechasPorEstado[estado];
        const isLast = i === ESTADOS.length - 1;

        return (
          <li key={estado} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-4 top-8 -ml-px h-[calc(100%-2rem)] w-0.5",
                  i < currentIndex ? "bg-emerald-500" : "bg-neutral-200",
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                status === "done" && "bg-emerald-500 text-white",
                status === "current" &&
                  "bg-blue-600 text-white ring-4 ring-blue-100",
                status === "pending" && "border-2 border-neutral-300 bg-white",
              )}
            >
              {status === "done" ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : status === "current" ? (
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              )}
            </span>

            <div className="min-w-0 pt-1">
              <p
                className={cn(
                  "text-sm leading-tight",
                  status === "done" && "font-medium text-neutral-900",
                  status === "current" && "font-semibold text-blue-700",
                  status === "pending" && "text-neutral-400",
                )}
              >
                {ESTADO_LABEL[estado]}
              </p>
              {fecha ? (
                <p className="mt-0.5 text-xs text-neutral-500">
                  {formatFechaHora(fecha)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
