PRAGMA foreign_keys=OFF;--> statement-breakpoint
DROP TABLE `Notification`;--> statement-breakpoint
CREATE TABLE `Notification` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text,
	`message` text NOT NULL,
	`target` text,
	`read` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`fromUser` text,
	`toUser` text NOT NULL,
	FOREIGN KEY (`fromUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`toUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=ON;