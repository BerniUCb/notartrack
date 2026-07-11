// Fuente de verdad de los enums de negocio (compartida entre el schema de
// Drizzle, las Server Actions y la UI). Mantener sincronizada con CLAUDE.md.

// Estados del trámite, EN ORDEN (flujo lineal: solo avanza hacia adelante).
export const ESTADOS = [
  "RECIBIDO",
  "EN_ELABORACION",
  "PARA_FIRMA",
  "PROTOCOLIZADO",
  "LISTO_PARA_RECOGER",
  "ENTREGADO",
] as const;

export type Estado = (typeof ESTADOS)[number];

export const ESTADO_LABEL: Record<Estado, string> = {
  RECIBIDO: "Recibido",
  EN_ELABORACION: "En elaboración",
  PARA_FIRMA: "Para firma",
  PROTOCOLIZADO: "Protocolizado",
  LISTO_PARA_RECOGER: "Listo para recoger",
  ENTREGADO: "Entregado",
};

// Clases de Tailwind para el badge de cada estado (modo claro).
export const ESTADO_BADGE: Record<Estado, string> = {
  RECIBIDO: "bg-slate-100 text-slate-700",
  EN_ELABORACION: "bg-amber-100 text-amber-800",
  PARA_FIRMA: "bg-blue-100 text-blue-800",
  PROTOCOLIZADO: "bg-violet-100 text-violet-800",
  LISTO_PARA_RECOGER: "bg-emerald-100 text-emerald-800",
  ENTREGADO: "bg-neutral-800 text-neutral-50",
};

/** Devuelve el estado siguiente en el flujo, o null si ya está ENTREGADO. */
export function nextEstado(estado: Estado): Estado | null {
  const i = ESTADOS.indexOf(estado);
  return i >= 0 && i < ESTADOS.length - 1 ? ESTADOS[i + 1] : null;
}

/** Devuelve el estado anterior en el flujo, o null si es el inicial (RECIBIDO). */
export function previousEstado(estado: Estado): Estado | null {
  const i = ESTADOS.indexOf(estado);
  return i > 0 ? ESTADOS[i - 1] : null;
}

// Tipos de trámite.
export const TIPOS = [
  "PODER",
  "ESCRITURA_PUBLICA",
  "TESTIMONIO",
  "PROTOCOLIZACION",
  "RECONOCIMIENTO_FIRMAS",
  "DECLARACION_JURADA",
  "OTRO",
] as const;

export type Tipo = (typeof TIPOS)[number];

export const TIPO_LABEL: Record<Tipo, string> = {
  PODER: "Poder",
  ESCRITURA_PUBLICA: "Escritura pública",
  TESTIMONIO: "Testimonio",
  PROTOCOLIZACION: "Protocolización",
  RECONOCIMIENTO_FIRMAS: "Reconocimiento de firmas",
  DECLARACION_JURADA: "Declaración jurada",
  OTRO: "Otro",
};
