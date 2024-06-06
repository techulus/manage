CREATE TABLE `Blob` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`contentType` text NOT NULL,
	`contentSize` integer NOT NULL,
	`createdByUser` text NOT NULL,
	`documentFolderId` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`createdByUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`documentFolderId`) REFERENCES `DocumentFolder`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Document` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`markdownContent` text NOT NULL,
	`status` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`projectId` integer NOT NULL,
	`folderId` integer,
	`createdByUser` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`folderId`) REFERENCES `DocumentFolder`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`createdByUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `DocumentFolder` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`projectId` integer NOT NULL,
	`createdByUser` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`createdByUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Project` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`dueDate` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`createdByUser` text NOT NULL,
	FOREIGN KEY (`createdByUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Task` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`taskListId` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`dueDate` integer,
	`position` real NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`assignedToUser` text,
	`createdByUser` text NOT NULL,
	FOREIGN KEY (`taskListId`) REFERENCES `TaskList`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`assignedToUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`createdByUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `TaskList` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`dueDate` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`projectId` integer NOT NULL,
	`createdByUser` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`createdByUser`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`firstName` text,
	`lastName` text,
	`imageUrl` text,
	`rawData` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Blob_key_unique` ON `Blob` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);