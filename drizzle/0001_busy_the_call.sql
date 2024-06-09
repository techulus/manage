CREATE TABLE `Comment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`createdByUser` text NOT NULL,
	`parentId` integer NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`createdByUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
