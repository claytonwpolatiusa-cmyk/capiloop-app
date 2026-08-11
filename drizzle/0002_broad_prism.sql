CREATE TABLE `partnerSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `partnerSessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `partners` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `cnpjStatus` varchar(32);--> statement-breakpoint
ALTER TABLE `partners` ADD `cnpjVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `partners` ADD `lastSignedInAt` timestamp;--> statement-breakpoint
ALTER TABLE `partnerSessions` ADD CONSTRAINT `partnerSessions_partnerId_partners_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partners`(`id`) ON DELETE no action ON UPDATE no action;