// Genera el código de seguimiento: "NT-" + 5 caracteres alfanuméricos en
// mayúscula. Se excluyen I, O, 0 y 1 para evitar confusiones cuando el cliente
// lee o dicta el código por teléfono. Módulo puro (sin acceso a la base) para
// poder reutilizarlo en el seed. La verificación de unicidad contra la base
// vive en las Server Actions.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateTrackingCode(): string {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `NT-${code}`;
}
