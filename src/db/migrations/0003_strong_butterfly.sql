CREATE TABLE "incident_update" (
	"id" text PRIMARY KEY NOT NULL,
	"incidentId" text NOT NULL,
	"authorId" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "incident_update" ADD CONSTRAINT "incident_update_incidentId_incident_id_fk" FOREIGN KEY ("incidentId") REFERENCES "public"."incident"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_update" ADD CONSTRAINT "incident_update_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;