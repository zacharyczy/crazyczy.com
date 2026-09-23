CREATE TABLE `writing_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_key` text NOT NULL,
	`visitor_id` text NOT NULL,
	`author` text DEFAULT 'Guest' NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_writing_comments_post_created` ON `writing_comments` (`post_key`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_writing_comments_visitor_created` ON `writing_comments` (`visitor_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `writing_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`post_key` text NOT NULL,
	`target_kind` text NOT NULL,
	`target_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_writing_likes_target_visitor` ON `writing_likes` (`target_kind`,`target_id`,`visitor_id`);--> statement-breakpoint
CREATE INDEX `idx_writing_likes_post` ON `writing_likes` (`post_key`);