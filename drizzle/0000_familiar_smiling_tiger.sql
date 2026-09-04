CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text DEFAULT 'Guest' NOT NULL,
	`body` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_suggestions_created_at` ON `suggestions` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_suggestions_score` ON `suggestions` (`score`);--> statement-breakpoint
CREATE TABLE `daily_suggestion_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`day_key` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_daily_suggestion_usage_visitor_day` ON `daily_suggestion_usage` (`visitor_id`,`day_key`);--> statement-breakpoint
CREATE TABLE `suggestion_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`suggestion_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`value` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`suggestion_id`) REFERENCES `suggestions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_suggestion_votes_visitor` ON `suggestion_votes` (`suggestion_id`,`visitor_id`);--> statement-breakpoint
PRAGMA optimize;
