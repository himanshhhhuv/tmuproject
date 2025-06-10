/*
  Warnings:

  - You are about to drop the column `interestLevel` on the `EventRegistration` table. All the data in the column will be lost.
  - Added the required column `userName` to the `EventRegistration` table without a default value. This is not possible if the table is not empty.

*/

-- First, add userName column with a default value
ALTER TABLE "EventRegistration" ADD COLUMN "userName" TEXT DEFAULT 'Unknown User';

-- Update existing rows to have a proper userName based on userId
UPDATE "EventRegistration" SET "userName" = CONCAT('User ', "userId") WHERE "userName" = 'Unknown User';

-- Now make userName NOT NULL
ALTER TABLE "EventRegistration" ALTER COLUMN "userName" SET NOT NULL;

-- Add userEmail column
ALTER TABLE "EventRegistration" ADD COLUMN "userEmail" TEXT;

-- Drop the interestLevel column
ALTER TABLE "EventRegistration" DROP COLUMN "interestLevel";

-- Add totalParticipants to EventReport
ALTER TABLE "EventReport" ADD COLUMN "totalParticipants" INTEGER;

-- Drop the unused enum
DROP TYPE "InterestLevel";
