/*
  Warnings:

  - Added the required column `updatedAt` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Made the column `jobType` on table `jobs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `jobs` ADD COLUMN `deadline` DATETIME(3) NULL,
    ADD COLUMN `experienceReq` ENUM('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'EXPERT') NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `salaryMax` INTEGER NULL,
    ADD COLUMN `salaryMin` INTEGER NULL,
    ADD COLUMN `skillVector` TEXT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `views` INTEGER NOT NULL DEFAULT 0,
    MODIFY `description` TEXT NOT NULL,
    MODIFY `requiredSkills` VARCHAR(191) NOT NULL DEFAULT '[]',
    MODIFY `jobType` ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE', 'REMOTE') NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `education` VARCHAR(191) NULL,
    ADD COLUMN `experienceLevel` ENUM('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'EXPERT') NULL,
    ADD COLUMN `interests` VARCHAR(191) NOT NULL DEFAULT '[]',
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `skillVector` TEXT NULL,
    ADD COLUMN `skills` VARCHAR(191) NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE `company_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `website` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `companySize` ENUM('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE') NULL,
    `logo` VARCHAR(191) NULL,
    `foundedYear` INTEGER NULL,
    `address` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `company_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `coverLetter` TEXT NULL,
    `resumeUrl` VARCHAR(191) NULL,
    `matchPercentage` DOUBLE NOT NULL,
    `skillGap` VARCHAR(191) NOT NULL DEFAULT '[]',
    `learningRecommendations` VARCHAR(191) NOT NULL DEFAULT '[]',
    `status` ENUM('PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN') NOT NULL DEFAULT 'PENDING',
    `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `employerNotes` TEXT NULL,

    INDEX `applications_jobId_idx`(`jobId`),
    INDEX `applications_userId_idx`(`userId`),
    INDEX `applications_matchPercentage_idx`(`matchPercentage`),
    UNIQUE INDEX `applications_userId_jobId_key`(`userId`, `jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Career Assistant Chat',
    `messages` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learning_resources` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `skill` VARCHAR(191) NOT NULL,
    `level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    `type` ENUM('COURSE', 'TUTORIAL', 'ARTICLE', 'VIDEO', 'BOOK', 'BOOTCAMP', 'CERTIFICATION') NOT NULL DEFAULT 'COURSE',
    `duration` VARCHAR(191) NULL,
    `free` BOOLEAN NOT NULL DEFAULT false,
    `aiGenerated` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `learning_resources_skill_idx`(`skill`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `career_paths` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `steps` JSON NOT NULL,
    `skills` VARCHAR(191) NOT NULL DEFAULT '[]',
    `duration` VARCHAR(191) NULL,
    `difficulty` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('APPLICATION_UPDATE', 'JOB_MATCH', 'NEW_JOB', 'MESSAGE', 'SYSTEM') NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `data` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `company_profiles` ADD CONSTRAINT `company_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_sessions` ADD CONSTRAINT `chat_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
