const fecha = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const fechaHora = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatFecha(date: Date | string): string {
  return fecha.format(typeof date === "string" ? new Date(date) : date);
}

export function formatFechaHora(date: Date | string): string {
  return fechaHora.format(typeof date === "string" ? new Date(date) : date);
}
