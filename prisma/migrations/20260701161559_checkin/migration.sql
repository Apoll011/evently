/*
  Warnings:

  - Added the required column `eventId` to the `CheckIn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "eventId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
