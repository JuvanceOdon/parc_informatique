CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero_ticket" varchar(20) NOT NULL,
	"titre" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"materiel_id" integer,
	"demandeur_id" integer NOT NULL,
	"assignee_id" integer,
	"service_id" integer,
	"priorite" varchar(20) DEFAULT 'MOYENNE' NOT NULL,
	"statut" varchar(20) DEFAULT 'OUVERT' NOT NULL,
	"date_resolution" timestamp with time zone,
	"date_fermeture" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_numero_ticket_unique" UNIQUE("numero_ticket")
);
--> statement-breakpoint
CREATE TABLE "ticket_commentaires" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"utilisateur_id" integer NOT NULL,
	"contenu" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_pieces_jointes" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"uploaded_by_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_historique" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"utilisateur_id" integer,
	"action" varchar(50) NOT NULL,
	"description" text,
	"ancienne_valeur" jsonb,
	"nouvelle_valeur" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_materiel_id_materiels_id_fk" FOREIGN KEY ("materiel_id") REFERENCES "public"."materiels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_demandeur_id_utilisateurs_id_fk" FOREIGN KEY ("demandeur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_id_utilisateurs_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_commentaires" ADD CONSTRAINT "ticket_commentaires_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_commentaires" ADD CONSTRAINT "ticket_commentaires_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_pieces_jointes" ADD CONSTRAINT "ticket_pieces_jointes_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_pieces_jointes" ADD CONSTRAINT "ticket_pieces_jointes_uploaded_by_id_utilisateurs_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_historique" ADD CONSTRAINT "ticket_historique_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_historique" ADD CONSTRAINT "ticket_historique_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;