/*
  Warnings:

  - Made the column `modalAwal` on table `Pendapatan` required. This step will fail if there are existing NULL values in that column.
  - Made the column `keuntungan` on table `Pendapatan` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalPendapatan` on table `Pendapatan` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Pendapatan" ALTER COLUMN "modalAwal" SET NOT NULL,
ALTER COLUMN "modalAwal" SET DEFAULT 0,
ALTER COLUMN "keuntungan" SET NOT NULL,
ALTER COLUMN "keuntungan" SET DEFAULT 0,
ALTER COLUMN "totalPendapatan" SET NOT NULL,
ALTER COLUMN "totalPendapatan" SET DEFAULT 0;
