CREATE TABLE `supportTicketMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`sender` enum('customer','support','system') NOT NULL DEFAULT 'customer',
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supportTicketMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supportTicketRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`stars` int NOT NULL,
	`comment` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTicketRatings_id` PRIMARY KEY(`id`),
	CONSTRAINT `supportTicketRatings_ticketId_unique` UNIQUE(`ticketId`)
);
--> statement-breakpoint
ALTER TABLE `supportTicketMessages` ADD CONSTRAINT `supportTicketMessages_ticketId_supportTickets_id_fk` FOREIGN KEY (`ticketId`) REFERENCES `supportTickets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supportTicketMessages` ADD CONSTRAINT `supportTicketMessages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supportTicketRatings` ADD CONSTRAINT `supportTicketRatings_ticketId_supportTickets_id_fk` FOREIGN KEY (`ticketId`) REFERENCES `supportTickets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supportTicketRatings` ADD CONSTRAINT `supportTicketRatings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;