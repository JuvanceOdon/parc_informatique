CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"utilisateur_id" integer NOT NULL,
	"type" varchar(30) NOT NULL,
	"titre" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"entite_type" varchar(30),
	"entite_id" integer,
	"lu" boolean DEFAULT false NOT NULL,
	"lu_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE cascade ON UPDATE no action;