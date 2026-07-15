// Envío de WhatsApp aislado detrás de una única función. Hoy usa el sandbox de
// Twilio; para cambiar de proveedor sólo se reescribe este archivo, sin tocar el
// resto del sistema. La función NUNCA lanza: devuelve un resultado.

export type EnvioResultado = { ok: boolean; sid?: string; error?: string };

/** Normaliza un celular boliviano a formato E.164 (+591XXXXXXXX). */
function toE164Bolivia(celular: string): string | null {
  const raw = celular.trim();
  if (raw.startsWith("+")) return raw.replace(/[^\d+]/g, "");

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) return `+591${digits}`;
  if (digits.length === 11 && digits.startsWith("591")) return `+${digits}`;
  return null;
}

export async function enviarNotificacion(
  celular: string,
  mensaje: string,
): Promise<EnvioResultado> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    return {
      ok: false,
      error: "Twilio no configurado (faltan variables de entorno).",
    };
  }

  const to = toE164Bolivia(celular);
  if (!to) {
    return { ok: false, error: `Número de celular inválido: ${celular}` };
  }

  try {
    const body = new URLSearchParams({
      From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
      To: `whatsapp:${to}`,
      Body: mensaje,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${accountSid}:${authToken}`,
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    if (!res.ok) {
      let error = `Twilio respondió ${res.status}`;
      try {
        const json = (await res.json()) as { message?: string };
        if (json?.message) error = json.message;
      } catch {
        // respuesta sin JSON: dejamos el mensaje por defecto
      }
      return { ok: false, error };
    }

    const data = (await res.json()) as { sid?: string };
    return { ok: true, sid: data.sid };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error de red al enviar.",
    };
  }
}
