import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Enums de negocio (fuente de verdad en lib/estados.ts).
import { ESTADOS, TIPOS } from "../lib/estados";

export const tramiteTipoEnum = pgEnum("tramite_tipo", TIPOS);
export const tramiteEstadoEnum = pgEnum("tramite_estado", ESTADOS);

export const notaria = pgTable("notaria", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  numeroNotaria: text("numero_notaria").notNull(),
  ciudad: text("ciudad").notNull(),
  logoUrl: text("logo_url"),
  telefono: text("telefono"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const cliente = pgTable(
  "cliente",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    notariaId: uuid("notaria_id")
      .notNull()
      .references(() => notaria.id, { onDelete: "cascade" }),
    nombreCompleto: text("nombre_completo").notNull(),
    ci: text("ci").notNull(),
    celular: text("celular"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // El CI identifica a un cliente dentro de una notaría (permite reusarlo).
    uniqueIndex("cliente_notaria_ci_unico").on(t.notariaId, t.ci),
  ],
);

export const tramite = pgTable("tramite", {
  id: uuid("id").primaryKey().defaultRandom(),
  notariaId: uuid("notaria_id")
    .notNull()
    .references(() => notaria.id, { onDelete: "cascade" }),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => cliente.id, { onDelete: "restrict" }),
  // Único global: la página pública busca por este código sin saber la notaría.
  codigoSeguimiento: text("codigo_seguimiento").notNull().unique(),
  tipo: tramiteTipoEnum("tipo").notNull(),
  estadoActual: tramiteEstadoEnum("estado_actual").notNull().default("RECIBIDO"),
  observaciones: text("observaciones"),
  fechaIngreso: timestamp("fecha_ingreso", { withTimezone: true })
    .defaultNow()
    .notNull(),
  fechaEntrega: timestamp("fecha_entrega", { withTimezone: true }),
});

export const historialEstado = pgTable("historial_estado", {
  id: uuid("id").primaryKey().defaultRandom(),
  tramiteId: uuid("tramite_id")
    .notNull()
    .references(() => tramite.id, { onDelete: "cascade" }),
  estado: tramiteEstadoEnum("estado").notNull(),
  comentario: text("comentario"),
  // Se completa desde la Fase 3 (auth). Nullable hasta entonces.
  usuarioId: uuid("usuario_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Notaria = typeof notaria.$inferSelect;
export type Cliente = typeof cliente.$inferSelect;
export type Tramite = typeof tramite.$inferSelect;
export type HistorialEstado = typeof historialEstado.$inferSelect;
