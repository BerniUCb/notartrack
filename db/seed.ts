import { config } from "dotenv";

config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import {
  ESTADOS,
  ESTADO_LABEL,
  type Estado,
  type Rol,
  type Tipo,
} from "../lib/estados";
import { generateTrackingCode } from "../lib/tracking-code";
import {
  cliente,
  historialEstado,
  notaria,
  tramite,
  usuario,
} from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida en .env.local");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql });

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

const COMENTARIO: Record<Estado, string> = {
  RECIBIDO: "Trámite recibido en la notaría.",
  EN_ELABORACION: "En elaboración por el equipo.",
  PARA_FIRMA: "Documento listo para la firma.",
  PROTOCOLIZADO: "Protocolizado en el registro notarial.",
  LISTO_PARA_RECOGER: "Listo para recoger en ventanilla.",
  ENTREGADO: "Entregado al cliente.",
};

type UsuarioSeed = { nombre: string; email: string; rol: Rol };
type ClienteSeed = { nombreCompleto: string; ci: string; celular: string };
type TramiteSeed = {
  cliente: number;
  tipo: Tipo;
  estado: Estado;
  ingresoHaceDias: number;
  observaciones?: string;
};
type NotariaSeed = {
  notaria: {
    nombre: string;
    numeroNotaria: string;
    ciudad: string;
    telefono: string;
  };
  usuarios: UsuarioSeed[];
  clientes: ClienteSeed[];
  tramites: TramiteSeed[];
};

// Contraseña común para todos los usuarios de prueba.
const PASSWORD = "notaria123";

const NOTARIAS: NotariaSeed[] = [
  {
    notaria: {
      nombre: "Notaría de Fe Pública N° 42 — Cochabamba",
      numeroNotaria: "42",
      ciudad: "Cochabamba",
      telefono: "4-4258963",
    },
    usuarios: [
      { nombre: "Dr. Ramiro Salinas Gutiérrez", email: "notario@notaria42.bo", rol: "NOTARIO" },
      { nombre: "Lucía Ferrufino Rojas", email: "secretaria@notaria42.bo", rol: "SECRETARIA" },
    ],
    clientes: [
      { nombreCompleto: "María Elena Quispe Mamani", ci: "4587963", celular: "70012345" },
      { nombreCompleto: "Juan Carlos Rojas Villarroel", ci: "3987456", celular: "71234567" },
      { nombreCompleto: "Rosa Angélica Flores Condori", ci: "6785412", celular: "68956321" },
      { nombreCompleto: "Luis Fernando Gutiérrez Ayala", ci: "5123478", celular: "72345678" },
      { nombreCompleto: "Carla Beatriz Terrazas Ledezma", ci: "7896541", celular: "69874123" },
      { nombreCompleto: "José Antonio Mamani Choque", ci: "4478512", celular: "73456789" },
      { nombreCompleto: "Ana Lucía Vargas Peredo", ci: "8123654", celular: "70987654" },
      { nombreCompleto: "Pedro Pablo Céspedes Zapata", ci: "3654789", celular: "67451236" },
    ],
    tramites: [
      { cliente: 0, tipo: "PODER", estado: "RECIBIDO", ingresoHaceDias: 1 },
      { cliente: 1, tipo: "DECLARACION_JURADA", estado: "EN_ELABORACION", ingresoHaceDias: 3, observaciones: "Declaración jurada de ingresos para el banco." },
      { cliente: 2, tipo: "RECONOCIMIENTO_FIRMAS", estado: "PARA_FIRMA", ingresoHaceDias: 5 },
      { cliente: 3, tipo: "ESCRITURA_PUBLICA", estado: "EN_ELABORACION", ingresoHaceDias: 4, observaciones: "Compraventa de inmueble en la zona de Cala Cala." },
      { cliente: 4, tipo: "TESTIMONIO", estado: "PROTOCOLIZADO", ingresoHaceDias: 8 },
      { cliente: 5, tipo: "PODER", estado: "LISTO_PARA_RECOGER", ingresoHaceDias: 7, observaciones: "Poder amplio para trámites bancarios." },
      { cliente: 6, tipo: "PROTOCOLIZACION", estado: "ENTREGADO", ingresoHaceDias: 20 },
      { cliente: 7, tipo: "ESCRITURA_PUBLICA", estado: "PARA_FIRMA", ingresoHaceDias: 6, observaciones: "Constitución de sociedad SRL." },
      { cliente: 0, tipo: "TESTIMONIO", estado: "ENTREGADO", ingresoHaceDias: 25 },
    ],
  },
  {
    notaria: {
      nombre: "Notaría de Fe Pública N° 7 — La Paz",
      numeroNotaria: "7",
      ciudad: "La Paz",
      telefono: "2-2445871",
    },
    usuarios: [
      { nombre: "Dra. Elena Aramayo Michel", email: "notario@notaria7.bo", rol: "NOTARIO" },
      { nombre: "Marcelo Ticona Apaza", email: "secretaria@notaria7.bo", rol: "SECRETARIA" },
    ],
    clientes: [
      { nombreCompleto: "Freddy Nina Mamani", ci: "6234511", celular: "71122334" },
      { nombreCompleto: "Gabriela Poma Quisbert", ci: "8345677", celular: "60998877" },
      { nombreCompleto: "Wilfredo Choque Laura", ci: "4990011", celular: "72211009" },
      { nombreCompleto: "Silvia Callisaya Huanca", ci: "7712345", celular: "68877665" },
      { nombreCompleto: "Ramiro Apaza Colque", ci: "3456120", celular: "73344556" },
      { nombreCompleto: "Norah Mamani Ticona", ci: "8890012", celular: "60011223" },
    ],
    tramites: [
      { cliente: 0, tipo: "PODER", estado: "RECIBIDO", ingresoHaceDias: 2 },
      { cliente: 1, tipo: "ESCRITURA_PUBLICA", estado: "EN_ELABORACION", ingresoHaceDias: 5, observaciones: "Contrato de anticrético en la zona de Sopocachi." },
      { cliente: 2, tipo: "TESTIMONIO", estado: "PARA_FIRMA", ingresoHaceDias: 6 },
      { cliente: 3, tipo: "DECLARACION_JURADA", estado: "LISTO_PARA_RECOGER", ingresoHaceDias: 9 },
      { cliente: 4, tipo: "PROTOCOLIZACION", estado: "PROTOCOLIZADO", ingresoHaceDias: 11 },
      { cliente: 5, tipo: "RECONOCIMIENTO_FIRMAS", estado: "ENTREGADO", ingresoHaceDias: 18 },
      { cliente: 0, tipo: "OTRO", estado: "ENTREGADO", ingresoHaceDias: 30, observaciones: "Legalización de documentos varios." },
    ],
  },
];

async function main() {
  console.log("Limpiando datos anteriores...");
  await db.delete(historialEstado);
  await db.delete(tramite);
  await db.delete(cliente);
  await db.delete(usuario);
  await db.delete(notaria);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  let totalTramites = 0;

  for (const seed of NOTARIAS) {
    console.log(`\nNotaría: ${seed.notaria.nombre}`);

    const [notariaRow] = await db
      .insert(notaria)
      .values(seed.notaria)
      .returning({ id: notaria.id });
    const notariaId = notariaRow.id;

    await db
      .insert(usuario)
      .values(
        seed.usuarios.map((u) => ({
          notariaId,
          nombre: u.nombre,
          email: u.email,
          passwordHash,
          rol: u.rol,
        })),
      );
    // La secretaria firma el historial del seed.
    const secretaria = seed.usuarios.find((u) => u.rol === "SECRETARIA")!;
    const [secretariaRow] = await db
      .select({ id: usuario.id })
      .from(usuario)
      .where(eq(usuario.email, secretaria.email))
      .limit(1);
    const usuarioId = secretariaRow.id;

    const clienteRows = await db
      .insert(cliente)
      .values(seed.clientes.map((c) => ({ ...c, notariaId })))
      .returning({ id: cliente.id });

    for (const t of seed.tramites) {
      const targetIndex = ESTADOS.indexOf(t.estado);
      const ingreso = fechaHaceDias(t.ingresoHaceDias);
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
          usuarioId,
          createdAt: fechas[i],
        })),
      );

      totalTramites++;
      console.log(`  ${tramiteRow.codigo}  →  ${ESTADO_LABEL[t.estado]}`);
    }
  }

  console.log(
    `\n✅ Seed completo: ${NOTARIAS.length} notarías, ${
      NOTARIAS.length * 2
    } usuarios, ${totalTramites} trámites.`,
  );
  console.log(`   Contraseña de todos los usuarios: ${PASSWORD}`);
}

main().catch((err) => {
  console.error("❌ Error en el seed:");
  console.error(err);
  process.exit(1);
});
