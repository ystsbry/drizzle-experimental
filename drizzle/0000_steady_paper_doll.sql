CREATE TYPE "public"."department" AS ENUM('engineering', 'sales', 'marketing', 'hr', 'finance');--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(20),
	"department" "department" NOT NULL,
	"position" varchar(100) NOT NULL,
	"hire_date" date NOT NULL,
	"salary" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
