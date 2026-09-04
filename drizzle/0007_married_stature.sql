ALTER TABLE `partners` ADD `reviewedBy` int;--> statement-breakpoint
ALTER TABLE `partners` ADD `reviewNote` text;--> statement-breakpoint
ALTER TABLE `partners` ADD CONSTRAINT `partners_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;