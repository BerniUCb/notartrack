import { config } from "dotenv";

config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { ESTADOS, ESTADO_LABEL, type Estado, type Tipo } from "../lib/estados";
import { generateTrackingCode } from "../lib/tracking-code";
import {
  cliente,
  historialEstado,
  notaria,
  tramite,
} from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida en .env.local");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql });

// Códigos de seguimiento únicos en memoria para el lote del seed.
const usados = new Set<string>();
function codigoUnico(): string {
  let code = generateTrackingCode();
  while (usados.has(code)) code = generateTrackingCode();
  usados.add(code);
  return code;
}

const now = new Date();
function fechaHaceDias(dias: number, horas = 9): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - dias);
  d.setHours(horas, 0, 0, 0);
  return d;
}

// Comentario por defecto de cada estado (para el historial).
const COMENTARIO: Record<Estado, string> = {
  RECIBIDO: "Trámite recibido en la notaría.",
  EN_ELABORACION: "En elaboración por el equipo.",
  PARA_FIRMA: "Documento listo para la firma.",
  PROTOCOLIZADO: "Protocolizado en el registro notarial.",
  LISTO_PARA_RECOGER: "Listo para recoger en ventanilla.",
  ENTREGADO: "Entregado al cliente.",
};

const CLIENTES = [
  { nombreCompleto: "María Elena Quispe Mamani", ci: "4587963", celular: "70012345" },
  { nombreCompleto: "Juan Carlos Rojas Villarroel", ci: "3987456", celular: "71234567" },
  { nombreCompleto: "Rosa Angélica Flores Condori", ci: "6785412", celular: "68956321" },
  { nombreCompleto: "Luis Fernando Gutiérrez Ayala", ci: "5123478", celular: "72345678" },
  { nombreCompleto: "Carla Beatriz Terrazas Ledezma", ci: "7896541", celular: "69874123" },
  { nombreCompleto: "José Antonio Mamani Choque", ci: "4478512", celular: "73456789" },
  { nombreCompleto: "Ana Lucía Vargas Peredo", ci: "8123654", celular: "70987654" },
  { nombreCompleto: "Pedro Pablo Céspedes Zapata", ci: "3654789", celular: "67451236" },
];

// 15 trámites: cliente (índice), tipo, estado objetivo, días desde el ingreso y
// observación opcional. Distribuidos en todos los estados del flujo.
const TRAMITES: {
  cliente: number;
  tipo: Tipo;
  estado: Estado;
  ingresoHaceDias: number;
  observaciones?: string;
}[] = [
  { cliente: 0, tipo: "PODER", estado: "RECIBIDO", ingresoHaceDias: 1 },
  { cliente: 1, tipo: "DECLARACION_JURADA", estado: "RECIBIDO", ingresoHaceDias: 2, observaciones: "Declaración jurada de ingresos para el banco." },
  { cliente: 2, tipo: "RECONOCIMIENTO_FIRMAS", estado: "RECIBIDO", ingresoHaceDias: 0 },
  { cliente: 3, tipo: "ESCRITURA_PUBLICA", estado: "EN_ELABORACION", ingresoHaceDias: 4, observaciones: "Compraventa de inmueble en la zona de Cala Cala." },
  { cliente: 4, tipo: "TESTIMONIO", estado: "EN_ELABORACION", ingresoHaceDias: 3 },
  { cliente: 5, tipo: "PODER", estado: "EN_ELABORACION", ingresoHaceDias: 5, observaciones: "Poder amplio y suficiente para trámites bancarios." },
  { cliente: 6, tipo: "PROTOCOLIZACION", estado: "PARA_FIRMA", ingresoHaceDias: 7 },
  { cliente: 7, tipo: "ESCRITURA_PUBLICA", estado: "PARA_FIRMA", ingresoHaceDias: 6, observaciones: "Constitución de sociedad SRL." },
  { cliente: 0, tipo: "TESTIMONIO", estado: "PROTOCOLIZADO", ingresoHaceDias: 10 },
  { cliente: 1, tipo: "PODER", estado: "PROTOCOLIZADO", ingresoHaceDias: 12, observaciones: "Poder especial para venta de vehículo." },
  { cliente: 2, tipo: "DECLARACION_JURADA", estado: "LISTO_PARA_RECOGER", ingresoHaceDias: 9 },
  { cliente: 3, tipo: "RECONOCIMIENTO_FIRMAS", estado: "LISTO_PARA_RECOGER", ingresoHaceDias: 8 },
  { cliente: 4, tipo: "ESCRITURA_PUBLICA", estado: "ENTREGADO", ingresoHaceDias: 20, observaciones: "Minuta de transferencia registrada." },
  { cliente: 5, tipo: "PROTOCOLIZACION", estado: "ENTREGADO", ingresoHaceDias: 25 },
  { cliente: 6, tipo: "OTRO", estado: "ENTREGADO", ingresoHaceDias: 30, observaciones: "Legalización de documentos varios." },
];

async function main() {
  console.log("Limpiando datos anteriores...");
  // Orden respetando las llaves foráneas.
  await db.delete(historialEstado);
  await db.delete(tramite);
  await db.delete(cliente);
  await db.delete(notaria);

  console.log("Creando notaría...");
  const [notariaRow] = await db
    .insert(notaria)
    .values({
      nombre: "Notaría de Fe Pública N° 42 — Cochabamba",
      numeroNotaria: "42",
      ciudad: "Cochabamba",
      telefono: "4-4258963",
    })
    .returning({ id: notaria.id });
  const notariaId = notariaRow.id;

  console.log("Creando clientes...");
  const clienteRows = await db
    .insert(cliente)
    .values(CLIENTES.map((c) => ({ ...c, notariaId })))
    .returning({ id: cliente.id });

  console.log("Creando trámites e historial...");
  for (const t of TRAMITES) {
    const targetIndex = ESTADOS.indexOf(t.estado);
    const ingreso = fechaHaceDias(t.ingresoHaceDias);

    // Fechas del historial: una por cada estado alcanzado, espaciadas ~1 día.
    const pasos = ESTADOS.slice(0, targetIndex + 1);
    const fechas = pasos.map((_, i) => {
      const d = new Date(ingreso);
      d.setDate(d.getDate() + i);
      return d;
    });
    const fechaFinal = fechas[fechas.length - 1];

    const [tramiteRow] = await db
      .insert(tramite)
      .values({
        notariaId,
        clienteId: clienteRows[t.cliente].id,
        codigoSeguimiento: codigoUnico(),
        tipo: t.tipo,
        estadoActual: t.estado,
        observaciones: t.observaciones ?? null,
        fechaIngreso: ingreso,
        fechaEntrega: t.estado === "ENTREGADO" ? fechaFinal : null,
      })
      .returning({ id: tramite.id, codigo: tramite.codigoSeguimiento });

    await db.insert(historialEstado).values(
      pasos.map((estado, i) => ({
        tramiteId: tramiteRow.id,
        estado,
        comentario: COMENTARIO[estado],
        createdAt: fechas[i],
      })),
    );

    console.log(`  ${tramiteRow.codigo}  →  ${ESTADO_LABEL[t.estado]}`);
  }

  console.log(
    `\n✅ Seed completo: 1 notaría, ${CLIENTES.length} clientes, ${TRAMITES.length} trámites.`,
  );
}

main().catch((err) => {
  console.error("❌ Error en el seed:");
  console.error(err);
  process.exit(1);
});
