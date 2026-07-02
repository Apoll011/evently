/*
  Warnings:

  - Added the required column `index` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "index" INTEGER NOT NULL;
