ALTER TABLE "case_evaluations" ADD COLUMN "is_demo_data" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "case_votes" ADD COLUMN "is_demo_data" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "is_demo_data" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "community_reports" ADD COLUMN "is_demo_data" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "is_demo_data" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_demo_data" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_demo_data" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "whistleblower_reports" ADD COLUMN "is_demo_data" boolean DEFAULT false;