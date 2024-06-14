CREATE TABLE `Event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	`allDay` integer DEFAULT false NOT NULL,
	`repeatRule` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`projectId` integer NOT NULL,
	`createdByUser` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`createdByUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
