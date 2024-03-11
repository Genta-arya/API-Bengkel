/*
  Warnings:

  - Added the required column `nama` to the `HistoryBarang` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HistoryBarang" DROP CONSTRAINT "HistoryBarang_barangId_fkey";

-- AlterTable
ALTER TABLE "HistoryBarang" ADD COLUMN     "nama" TEXT NOT NULL;
