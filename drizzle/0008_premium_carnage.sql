ALTER TABLE `partners` DROP FOREIGN KEY `partners_reviewedBy_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `partners` MODIFY COLUMN `reviewedBy` varchar(320);