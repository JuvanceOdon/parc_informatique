CREATE TABLE "journal_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"utilisateur_id" integer,
	"action" varchar(30) NOT NULL,
	"categorie" varchar(30) NOT NULL,
	"description" text NOT NULL,
	"entite_type" varchar(50),
	"entite_id" integer,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"metadonnees" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "journal_audit" ADD CONSTRAINT "journal_audit_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE set null ON UPDATE no action;