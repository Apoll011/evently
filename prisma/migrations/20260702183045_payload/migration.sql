/*
  Warnings:

  - A unique constraint covering the columns `[payload]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payload` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "payload" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_payload_key" ON "Ticket"("payload");
