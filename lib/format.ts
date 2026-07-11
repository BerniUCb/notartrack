// Las fechas se guardan en UTC (timestamptz). Fijamos la zona horaria de
// Bolivia para que se muestren correctas aunque el server corra en UTC (Vercel).
const TIME_ZONE = "America/La_Paz";

const fecha = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const fechaHora = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

export function formatFecha(date: Date | string): string {
  return fecha.format(typeof date === "string" ? new Date(date) : date);
}

export function formatFechaHora(date: Date | string): string {
  return fechaHora.format(typeof date === "string" ? new Date(date) : date);
}
