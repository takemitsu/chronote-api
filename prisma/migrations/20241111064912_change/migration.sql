/*
  Warnings:

  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `name` VARCHAR(255) NOT NULL,
    MODIFY `email` VARCHAR(255) NULL,
    MODIFY `password` VARCHAR(255) NULL,
    MODIFY `provider` VARCHAR(255) NOT NULL,
    MODIFY `providerId` VARCHAR(255) NULL;
