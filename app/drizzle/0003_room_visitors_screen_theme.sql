CREATE TABLE `room_visitors` (
	`room_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`name` text,
	`first_seen_at` integer DEFAULT (unixepoch()) NOT NULL,
	`last_seen_at` integer DEFAULT (unixepoch()) NOT NULL,
	`banned_at` integer,
	PRIMARY KEY(`room_id`, `visitor_id`),
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `rooms` ADD `screen_theme` text DEFAULT 'dark' NOT NULL;