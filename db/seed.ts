import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  console.log(
    "Seed pendiente: se implementa en la Fase 1 (requiere el schema de la base de datos).",
  );
}

main();
