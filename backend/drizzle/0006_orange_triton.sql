CREATE TABLE "maintenances" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero_maintenance" varchar(20) NOT NULL,
	"materiel_id" integer NOT NULL,
	"ticket_id" integer,
	"type" varchar(20) NOT NULL,
	"statut" varchar(20) DEFAULT 'PLANIFIEE' NOT NULL,
	"titre" varchar(255) NOT NULL,
	"description" text,
	"diagnostic" text,
	"solution" text,
	"technicien_id" integer,
	"statut_materiel_avant" varchar(30),
	"etat_materiel_avant" varchar(20),
	"statut_materiel_apres" varchar(30),
	"etat_materiel_apres" varchar(20),
	"date_planifiee" timestamp with time zone,
	"date_debut" timestamp with time zone,
	"date_fin" timestamp with time zone,
	"cout" numeric(12, 2),
	"created_by_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "maintenances_numero_maintenance_unique" UNIQUE("numero_maintenance")
);
--> statement-breakpoint
CREATE TABLE "maintenance_historique" (
	"id" serial PRIMARY KEY NOT NULL,
	"maintenance_id" integer NOT NULL,
	"utilisateur_id" integer,
	"action" varchar(50) NOT NULL,
	"description" text,
	"ancienne_valeur" jsonb,
	"nouvelle_valeur" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_materiel_id_materiels_id_fk" FOREIGN KEY ("materiel_id") REFERENCES "public"."materiels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_technicien_id_utilisateurs_id_fk" FOREIGN KEY ("technicien_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_created_by_id_utilisateurs_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_historique" ADD CONSTRAINT "maintenance_historique_maintenance_id_maintenances_id_fk" FOREIGN KEY ("maintenance_id") REFERENCES "public"."maintenances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_historique" ADD CONSTRAINT "maintenance_historique_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;