-- CreateEnum
CREATE TYPE "InterestLevel" AS ENUM ('INTERESTED', 'NOT_INTERESTED', 'MAYBE');

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "interestLevel" "InterestLevel";

-- Update existing records to have default interest level
UPDATE "EventRegistration" SET "interestLevel" = 'INTERESTED' WHERE "interestLevel" IS NULL;
