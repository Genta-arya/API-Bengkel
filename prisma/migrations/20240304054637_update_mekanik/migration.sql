/*
  Warnings:

  - A unique constraint covering the columns `[nama]` on the table `Mekanik` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Mekanik_nama_key" ON "Mekanik"("nama");
