ALTER TABLE "users" ADD COLUMN "marital_status" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "family_members_count" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "passport_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "local_bank_account" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "iban" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "apple_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_national_id_unique" UNIQUE("national_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_google_id_unique" UNIQUE("google_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_apple_id_unique" UNIQUE("apple_id");