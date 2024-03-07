/*
  Warnings:

  - You are about to drop the column `barangId` on the `Pendapatan` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Pendapatan_barangId_key";

-- AlterTable
ALTER TABLE "Pendapatan" DROP COLUMN "barangId";
