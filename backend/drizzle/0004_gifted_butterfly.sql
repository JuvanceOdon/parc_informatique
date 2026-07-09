CREATE TABLE "affectations" (
	"id" serial PRIMARY KEY NOT NULL,
	"materiel_id" integer NOT NULL,
	"utilisateur_id" integer NOT NULL,
	"service_id" integer,
	"localisation" varchar(255),
	"date_debut" timestamp with time zone DEFAULT now() NOT NULL,
	"date_fin" timestamp with time zone,
	"statut" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"motif" text,
	"affecte_par_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affectations" ADD CONSTRAINT "affectations_materiel_id_materiels_id_fk" FOREIGN KEY ("materiel_id") REFERENCES "public"."materiels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affectations" ADD CONSTRAINT "affectations_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affectations" ADD CONSTRAINT "affectations_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affectations" ADD CONSTRAINT "affectations_affecte_par_id_utilisateurs_id_fk" FOREIGN KEY ("affecte_par_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;