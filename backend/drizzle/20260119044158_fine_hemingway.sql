-- Migration for US location tables
-- These tables may already exist if migrations were partially applied
CREATE TABLE IF NOT EXISTS "us_airports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"airport_name" text NOT NULL,
	"airport_code" text NOT NULL,
	"city" text,
	"state_code" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "us_cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_code" text NOT NULL,
	"city_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "us_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_name" text NOT NULL,
	"state_code" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "us_zip_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city_name" text NOT NULL,
	"state_code" text NOT NULL,
	"zip_code" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_us_airports_code" ON "us_airports" USING btree ("airport_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_us_airports_state_code" ON "us_airports" USING btree ("state_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_us_cities_state_code" ON "us_cities" USING btree ("state_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_us_cities_city_name" ON "us_cities" USING btree ("city_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_us_states_code" ON "us_states" USING btree ("state_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_us_zip_codes_city_name" ON "us_zip_codes" USING btree ("city_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_us_zip_codes_state_code" ON "us_zip_codes" USING btree ("state_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_us_zip_codes_zip_code" ON "us_zip_codes" USING btree ("zip_code");
