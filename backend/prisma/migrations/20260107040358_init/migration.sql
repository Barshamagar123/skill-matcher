-- CreateTable
CREATE TABLE `jobs` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `requiredSkills` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `jobType` VARCHAR(191) NULL,
    `employerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
