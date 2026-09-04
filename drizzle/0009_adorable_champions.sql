ALTER TABLE `partners` ADD `reliabilityScore` decimal(5,2) DEFAULT '100.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `partners` ADD `disputeCount` int DEFAULT 0 NOT NULL;