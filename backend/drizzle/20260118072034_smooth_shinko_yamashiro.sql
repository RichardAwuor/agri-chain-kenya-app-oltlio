CREATE TABLE "buyer_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"crop_type" text NOT NULL,
	"quantity_kg" numeric(12, 2) NOT NULL,
	"delivery_date" date NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kenya_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"county_name" text NOT NULL,
	"county_code" text NOT NULL,
	"county_number" text NOT NULL,
	"sub_county" text NOT NULL,
	"ward_name" text NOT NULL,
	"ward_number" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "producer_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"producer_id" uuid NOT NULL,
	"report_type" text NOT NULL,
	"week_number" integer NOT NULL,
	"year" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regulator_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"regulator_id" uuid NOT NULL,
	"producer_id" uuid NOT NULL,
	"visit_date" timestamp NOT NULL,
	"visit_lat" numeric(10, 8) NOT NULL,
	"visit_lng" numeric(11, 8) NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_type" text NOT NULL,
	"email" text,
	"phone" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" date,
	"id_number" text,
	"farmer_id" text,
	"county" text NOT NULL,
	"sub_county" text NOT NULL,
	"ward" text NOT NULL,
	"address_lat" numeric(10, 8),
	"address_lng" numeric(11, 8),
	"farm_acreage" numeric(8, 2),
	"crop_type" text,
	"organization_name" text,
	"core_mandate" text,
	"work_id_front_url" text,
	"work_id_back_url" text,
	"registration_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_users_farmer_id" UNIQUE("farmer_id")
);
--> statement-breakpoint
CREATE TABLE "visit_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"photo_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "buyer_orders" ADD CONSTRAINT "buyer_orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "producer_reports" ADD CONSTRAINT "producer_reports_producer_id_users_id_fk" FOREIGN KEY ("producer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulator_visits" ADD CONSTRAINT "regulator_visits_regulator_id_users_id_fk" FOREIGN KEY ("regulator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulator_visits" ADD CONSTRAINT "regulator_visits_producer_id_users_id_fk" FOREIGN KEY ("producer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_photos" ADD CONSTRAINT "visit_photos_visit_id_regulator_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."regulator_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_buyer_orders_buyer_id" ON "buyer_orders" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "idx_buyer_orders_status" ON "buyer_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_locations_county_code" ON "kenya_locations" USING btree ("county_code");--> statement-breakpoint
CREATE INDEX "idx_locations_county_name" ON "kenya_locations" USING btree ("county_name");--> statement-breakpoint
CREATE INDEX "idx_producer_reports_producer_id" ON "producer_reports" USING btree ("producer_id");--> statement-breakpoint
CREATE INDEX "idx_regulator_visits_regulator_id" ON "regulator_visits" USING btree ("regulator_id");--> statement-breakpoint
CREATE INDEX "idx_regulator_visits_producer_id" ON "regulator_visits" USING btree ("producer_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_users_user_type" ON "users" USING btree ("user_type");--> statement-breakpoint
CREATE INDEX "idx_users_county" ON "users" USING btree ("county");--> statement-breakpoint
CREATE INDEX "idx_visit_photos_visit_id" ON "visit_photos" USING btree ("visit_id");