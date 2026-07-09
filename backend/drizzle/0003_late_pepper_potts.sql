CREATE TABLE "materiels" (
	"id" serial PRIMARY KEY NOT NULL,
	"code_materiel" varchar(50) NOT NULL,
	"numero_serie" varchar(100),
	"designation" varchar(200) NOT NULL,
	"marque" varchar(100),
	"modele" varchar(100),
	"categorie_id" integer NOT NULL,
	"service_id" integer,
	"localisation" varchar(255),
	"date_acquisition" date,
	"date_fin_garantie" date,
	"statut" varchar(30) DEFAULT 'EN_STOCK' NOT NULL,
	"etat" varchar(20) DEFAULT 'BON' NOT NULL,
	"description" text,
	"actif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materiel_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"materiel_id" integer NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(50) NOT NULL,
	"size" integer NOT NULL,
	"is_principal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materiel_historique" (
	"id" serial PRIMARY KEY NOT NULL,
	"materiel_id" integer NOT NULL,
	"utilisateur_id" integer,
	"action" varchar(50) NOT NULL,
	"description" text,
	"ancienne_valeur" jsonb,
	"nouvelle_valeur" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "materiels" ADD CONSTRAINT "materiels_categorie_id_categories_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materiels" ADD CONSTRAINT "materiels_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materiel_images" ADD CONSTRAINT "materiel_images_materiel_id_materiels_id_fk" FOREIGN KEY ("materiel_id") REFERENCES "public"."materiels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materiel_historique" ADD CONSTRAINT "materiel_historique_materiel_id_materiels_id_fk" FOREIGN KEY ("materiel_id") REFERENCES "public"."materiels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materiel_historique" ADD CONSTRAINT "materiel_historique_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "materiels_code_materiel_unique" ON "materiels" USING btree ("code_materiel");--> statement-breakpoint
CREATE UNIQUE INDEX "materiels_numero_serie_unique" ON "materiels" USING btree ("numero_serie");