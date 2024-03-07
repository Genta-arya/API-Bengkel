/*
  Warnings:

  - Added the required column `nopol` to the `Transaksi` table without a default value. This is not possible if the table is not empty.
  - Made the column `nama` on table `Transaksi` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaksi" ADD COLUMN     "noHp" TEXT,
ADD COLUMN     "nopol" TEXT NOT NULL,
ALTER COLUMN "nama" SET NOT NULL;
