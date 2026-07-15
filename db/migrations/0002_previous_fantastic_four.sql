CREATE TYPE "public"."notificacion_estado" AS ENUM('ENVIADO', 'FALLIDO');--> statement-breakpoint
CREATE TABLE "notificacion_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tramite_id" uuid NOT NULL,
	"celular" text NOT NULL,
	"mensaje" text NOT NULL,
	"estado" "notificacion_estado" NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notaria" ADD COLUMN "whatsapp_activo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notificacion_log" ADD CONSTRAINT "notificacion_log_tramite_id_tramite_id_fk" FOREIGN KEY ("tramite_id") REFERENCES "public"."tramite"("id") ON DELETE cascade ON UPDATE no action;