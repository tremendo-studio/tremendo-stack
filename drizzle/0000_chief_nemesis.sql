CREATE TABLE IF NOT EXISTS "auth_sessions" (
	"attempts" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"id" char(24) PRIMARY KEY NOT NULL,
	"otp_hash" varchar NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"email" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"id" char(24) PRIMARY KEY NOT NULL,
	"last_name" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
