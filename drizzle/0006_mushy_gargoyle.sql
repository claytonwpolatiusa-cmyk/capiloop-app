CREATE TABLE `reservationDisputes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservationId` int NOT NULL,
	`userId` int NOT NULL,
	`reason` enum('bag_unavailable','pickup_issue','quality_issue','payment_issue','other') NOT NULL,
	`details` text,
	`status` enum('open','under_review','approved','rejected','refunded') NOT NULL DEFAULT 'open',
	`refundStatus` enum('not_requested','pending','processing','completed','failed') NOT NULL DEFAULT 'not_requested',
	`refundAmount` decimal(10,2),
	`paymentGatewayRefundId` varchar(255),
	`penaltyPoints` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolvedAt` timestamp,
	CONSTRAINT `reservationDisputes_id` PRIMARY KEY(`id`),
	CONSTRAINT `reservationDisputes_reservationId_unique` UNIQUE(`reservationId`)
);
--> statement-breakpoint
ALTER TABLE `bags` MODIFY COLUMN `status` enum('active','sold_out','expired','cancelled') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `reservations` MODIFY COLUMN `status` enum('pending','confirmed','picked_up','cancelled','disputed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `bags` ADD `pickupDate` varchar(10);--> statement-breakpoint
ALTER TABLE `bags` ADD `pickupStartAt` timestamp;--> statement-breakpoint
ALTER TABLE `bags` ADD `pickupEndAt` timestamp;--> statement-breakpoint
ALTER TABLE `partners` ADD `reviewNotes` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `reviewedAt` timestamp;--> statement-breakpoint
ALTER TABLE `partners` ADD `mercadoPagoCollectorId` varchar(128);--> statement-breakpoint
ALTER TABLE `reservations` ADD `lockExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `reservations` ADD `confirmedAt` timestamp;--> statement-breakpoint
ALTER TABLE `transactions` ADD `totalBagValue` decimal(10,2);--> statement-breakpoint
ALTER TABLE `transactions` ADD `platformCommissionFee` decimal(10,2);--> statement-breakpoint
ALTER TABLE `transactions` ADD `restaurantNetValue` decimal(10,2);--> statement-breakpoint
ALTER TABLE `transactions` ADD `splitStatus` enum('not_started','pending','completed','failed') DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationDisputes` ADD CONSTRAINT `reservationDisputes_reservationId_reservations_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservationDisputes` ADD CONSTRAINT `reservationDisputes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;