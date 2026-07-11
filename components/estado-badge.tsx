import { ESTADO_BADGE, ESTADO_LABEL, type Estado } from "@/lib/estados";
import { cn } from "@/lib/utils";

export function EstadoBadge({
  estado,
  className,
}: {
  estado: Estado;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        ESTADO_BADGE[estado],
        className,
      )}
    >
      {ESTADO_LABEL[estado]}
    </span>
  );
}
