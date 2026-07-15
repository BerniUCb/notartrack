// Envío de WhatsApp aislado detrás de una única función. Usa la WhatsApp Cloud
// API de Meta. Para cambiar de proveedor sólo se reescribe este archivo, sin
// tocar el resto del sistema. La función NUNCA lanza: devuelve un resultado.

export type EnvioResultado = { ok: boolean; id?: string; error?: string };

const API_VERSION = process.env.WHATSAPP_API_VERSION ?? "v21.0";

/** Normaliza un celular boliviano al formato que espera Meta (solo dígitos con
 * código de país, ej. 59170012345). Acepta también números de otros países si
 * vienen con "+". */
function toWhatsappNumber(celular: string): string | null {
  const raw = celular.trim();

  if (raw.startsWith("+")) {
    const digits = raw.replace(/\D/g, "");
    return digits.length >= 8 ? digits : null;
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) return `591${digits}`;
  if (digits.length === 11 && digits.startsWith("591")) return digits;
  return null;
}

export async function enviarNotificacion(
  celular: string,
  mensaje: string,
): Promise<EnvioResultado> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return {
      ok: false,
      error: "WhatsApp no configurado (faltan variables de entorno).",
    };
  }

  const to = toWhatsappNumber(celular);
  if (!to) {
    return { ok: false, error: `Número de celular inválido: ${celular}` };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { preview_url: false, body: mensaje },
        }),
      },
    );

    const data = (await res.json().catch(() => null)) as {
      messages?: { id: string }[];
      error?: { message?: string };
    } | null;

    if (!res.ok) {
      const error = data?.error?.message ?? `WhatsApp respondió ${res.status}`;
      return { ok: false, error };
    }

    return { ok: true, id: data?.messages?.[0]?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error de red al enviar.",
    };
  }
}
