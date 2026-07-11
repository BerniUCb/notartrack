import { type Estado } from "@/lib/estados";

/** Enmascara el CI para la vista pública: muestra los primeros 4 dígitos. */
export function maskCi(ci: string): string {
  const visible = ci.slice(0, 4);
  return `${visible}***`;
}

// Mensaje contextual mostrado al cliente según el estado actual del trámite.
export const ESTADO_MENSAJE: Record<Estado, string> = {
  RECIBIDO: "Recibimos su trámite. Ya está registrado en la notaría.",
  EN_ELABORACION: "Su trámite está siendo elaborado por nuestro equipo.",
  PARA_FIRMA: "Su documento está en proceso de firma.",
  PROTOCOLIZADO: "Su documento fue protocolizado en el registro notarial.",
  LISTO_PARA_RECOGER:
    "Su documento está listo. Puede pasar a recogerlo en horario de oficina.",
  ENTREGADO: "Su trámite fue entregado. ¡Gracias por su confianza!",
};
