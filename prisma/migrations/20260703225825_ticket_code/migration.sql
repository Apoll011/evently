/*
  Warnings:

  - A unique constraint covering the columns `[code,payload]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId,ticketCode]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ticketCode` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "internetAccess" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ticketCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_code_payload_key" ON "Ticket"("code", "payload");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_eventId_ticketCode_key" ON "Ticket"("eventId", "ticketCode");
