CREATE TABLE "service_provider_visit_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"photo_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_provider_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_provider_id" uuid NOT NULL,
	"producer_id" uuid NOT NULL,
	"visit_date" timestamp NOT NULL,
	"visit_lat" numeric(10, 8) NOT NULL,
	"visit_lng" numeric(11, 8) NOT NULL,
	"collection_estimation_week" integer,
	"collected_crop_type" text,
	"collected_volume_kg" numeric(12, 2),
	"shipped_crop_type" text,
	"shipped_volume_kg" numeric(12, 2),
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "buyer_orders" ADD COLUMN "estimated_invoice_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "buyer_orders" ADD COLUMN "farmer_payment" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "buyer_orders" ADD COLUMN "service_provider_payment" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "buyer_orders" ADD COLUMN "gok_payment" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "buyer_orders" ADD COLUMN "delivery_airport" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "core_mandates" text[];--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "main_office_address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "office_state" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "office_city" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "office_zip_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "delivery_airport" text;--> statement-breakpoint
ALTER TABLE "service_provider_visit_photos" ADD CONSTRAINT "service_provider_visit_photos_visit_id_service_provider_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."service_provider_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_provider_visits" ADD CONSTRAINT "service_provider_visits_service_provider_id_users_id_fk" FOREIGN KEY ("service_provider_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_provider_visits" ADD CONSTRAINT "service_provider_visits_producer_id_users_id_fk" FOREIGN KEY ("producer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sp_visit_photos_visit_id" ON "service_provider_visit_photos" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX "idx_sp_visits_sp_id" ON "service_provider_visits" USING btree ("service_provider_id");--> statement-breakpoint
CREATE INDEX "idx_sp_visits_producer_id" ON "service_provider_visits" USING btree ("producer_id");