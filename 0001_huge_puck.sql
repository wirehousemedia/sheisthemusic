CREATE TABLE `event_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventTitle` varchar(200) NOT NULL,
	`eventDate` varchar(100) NOT NULL,
	`location` varchar(120),
	`status` varchar(40) NOT NULL DEFAULT 'registered',
	`registeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`interestKey` varchar(80) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `member_interests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`region` varchar(120) NOT NULL,
	`phone` varchar(40),
	`categoryType` varchar(100) NOT NULL,
	`careerRole` varchar(160) NOT NULL,
	`company` varchar(160),
	`pronouns` varchar(60),
	`race` varchar(100),
	`sexualOrientation` varchar(100),
	`isPublicDirectory` boolean NOT NULL DEFAULT true,
	`bio` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `member_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `member_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`userId` int,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member_interests` ADD CONSTRAINT `member_interests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member_profiles` ADD CONSTRAINT `member_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD CONSTRAINT `newsletter_subscribers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `event_registrations_user_idx` ON `event_registrations` (`userId`);--> statement-breakpoint
CREATE INDEX `member_interests_user_key_idx` ON `member_interests` (`userId`,`interestKey`);--> statement-breakpoint
CREATE INDEX `member_profiles_user_idx` ON `member_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `member_profiles_region_category_idx` ON `member_profiles` (`region`,`categoryType`);--> statement-breakpoint
CREATE INDEX `newsletter_email_idx` ON `newsletter_subscribers` (`email`);