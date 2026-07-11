"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { type Estado, type Tipo } from "@/lib/estados";
import { getTramitePublico, searchTramitesByCi } from "@/lib/public-tramites";
import { checkRateLimit } from "@/lib/rate-limit";

export type SearchResultItem = {
  codigo: string;
  tipo: Tipo;
  estadoActual: Estado;
  fechaIngreso: Date;
};

export type SearchState =
  | { status: "error"; message: string }
  | { status: "multiple"; items: SearchResultItem[] }
  | undefined;

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "local";
}

/** Normaliza el código a la forma canónica NT-XXXXX, o null si no es válido. */
function normalizeCodigo(raw: string): string | null {
  const s = raw.trim().toUpperCase().replace(/\s+/g, "");
  const m = s.match(/^(?:NT-)?([A-Z0-9]{5})$/);
  return m ? `NT-${m[1]}` : null;
}

const ciSchema = z.object({
  notariaId: z.uuid(),
  ci: z.string().trim().regex(/^\d{5,10}$/),
});

export async function buscarTramites(
  _prev: SearchState,
  formData: FormData,
): Promise<SearchState> {
  const rl = checkRateLimit(await clientIp());
  if (!rl.ok) {
    return {
      status: "error",
      message: `Demasiadas búsquedas. Esperá ${rl.retryAfterSeconds} segundos e intentá de nuevo.`,
    };
  }

  const modo = formData.get("modo");

  if (modo === "codigo") {
    const codigo = normalizeCodigo(String(formData.get("codigo") ?? ""));
    if (!codigo) {
      return {
        status: "error",
        message: "Ingresá un código válido con el formato NT-XXXXX.",
      };
    }
    const found = await getTramitePublico(codigo);
    if (!found) {
      return {
        status: "error",
        message:
          "No encontramos ningún trámite con ese código. Revisá que esté bien escrito.",
      };
    }
    redirect(`/seguimiento/${codigo}`);
  }

  if (modo === "ci") {
    const parsed = ciSchema.safeParse({
      notariaId: formData.get("notariaId"),
      ci: formData.get("ci"),
    });
    if (!parsed.success) {
      return {
        status: "error",
        message: "Ingresá una cédula válida y elegí la notaría.",
      };
    }

    const items = await searchTramitesByCi(parsed.data);
    if (items.length === 0) {
      return {
        status: "error",
        message:
          "No encontramos trámites para esa cédula en la notaría seleccionada.",
      };
    }
    if (items.length === 1) {
      redirect(`/seguimiento/${items[0].codigo}`);
    }
    return { status: "multiple", items };
  }

  return { status: "error", message: "Búsqueda inválida." };
}
