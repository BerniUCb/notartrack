CREATE TYPE "public"."tramite_estado" AS ENUM('RECIBIDO', 'EN_ELABORACION', 'PARA_FIRMA', 'PROTOCOLIZADO', 'LISTO_PARA_RECOGER', 'ENTREGADO');--> statement-breakpoint
CREATE TYPE "public"."tramite_tipo" AS ENUM('PODER', 'ESCRITURA_PUBLICA', 'TESTIMONIO', 'PROTOCOLIZACION', 'RECONOCIMIENTO_FIRMAS', 'DECLARACION_JURADA', 'OTRO');--> statement-breakpoint
CREATE TABLE "cliente" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notaria_id" uuid NOT NULL,
	"nombre_completo" text NOT NULL,
	"ci" text NOT NULL,
	"celular" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "historial_estado" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tramite_id" uuid NOT NULL,
	"estado" "tramite_estado" NOT NULL,
	"comentario" text,
	"usuario_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notaria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"numero_notaria" text NOT NULL,
	"ciudad" text NOT NULL,
	"logo_url" text,
	"telefono" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tramite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notaria_id" uuid NOT NULL,
	"cliente_id" uuid NOT NULL,
	"codigo_seguimiento" text NOT NULL,
	"tipo" "tramite_tipo" NOT NULL,
	"estado_actual" "tramite_estado" DEFAULT 'RECIBIDO' NOT NULL,
	"observaciones" text,
	"fecha_ingreso" timestamp with time zone DEFAULT now() NOT NULL,
	"fecha_entrega" timestamp with time zone,
	CONSTRAINT "tramite_codigo_seguimiento_unique" UNIQUE("codigo_seguimiento")
);
--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_notaria_id_notaria_id_fk" FOREIGN KEY ("notaria_id") REFERENCES "public"."notaria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_estado" ADD CONSTRAINT "historial_estado_tramite_id_tramite_id_fk" FOREIGN KEY ("tramite_id") REFERENCES "public"."tramite"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tramite" ADD CONSTRAINT "tramite_notaria_id_notaria_id_fk" FOREIGN KEY ("notaria_id") REFERENCES "public"."notaria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tramite" ADD CONSTRAINT "tramite_cliente_id_cliente_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."cliente"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cliente_notaria_ci_unico" ON "cliente" USING btree ("notaria_id","ci");