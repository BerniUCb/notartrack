// Rate limiting simple en memoria por clave (IP). Suficiente "por ahora" para
// frenar el scraping de CIs desde la búsqueda pública. Nota: en serverless cada
// instancia tiene su propia memoria, así que es best-effort. En Fase 5 se puede
// reemplazar por algo persistente (ej. Upstash Redis) si hace falta.
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const LIMIT = 15; // búsquedas permitidas por ventana
const WINDOW_MS = 60_000; // ventana de 1 minuto

export function checkRateLimit(key: string): {
  ok: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= LIMIT) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}
