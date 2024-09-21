CREATE TABLE `auth_sessions` (
	`attempts` integer NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`id` integer DEFAULT false NOT NULL,
	`otp_hash` text NOT NULL,
	`user_email` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`created_at` text,
	`email` text NOT NULL,
	`first_name` text,
	`id` text PRIMARY KEY NOT NULL,
	`last_name` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);