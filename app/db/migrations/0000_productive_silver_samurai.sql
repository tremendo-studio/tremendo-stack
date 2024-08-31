CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text,
	`last_name` text,
	`email` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
