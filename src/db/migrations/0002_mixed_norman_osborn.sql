CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"type" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_deployment" (
	"id" text PRIMARY KEY NOT NULL,
	"resourceId" text NOT NULL,
	"incidentId" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"deployedAt" timestamp DEFAULT now() NOT NULL,
	"returnedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "resource" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"serialNumber" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"currentLga" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_deployment" ADD CONSTRAINT "resource_deployment_resourceId_resource_id_fk" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_deployment" ADD CONSTRAINT "resource_deployment_incidentId_incident_id_fk" FOREIGN KEY ("incidentId") REFERENCES "public"."incident"("id") ON DELETE no action ON UPDATE no action;