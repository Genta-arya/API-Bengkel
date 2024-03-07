/*
  Warnings:

  - You are about to drop the `pendapatan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "pendapatan";

-- CreateTable
CREATE TABLE "Pendapatan" (
    "id" SERIAL NOT NULL,
    "barangId" INTEGER NOT NULL,
    "modalAwal" INTEGER,
    "keuntungan" INTEGER,
    "totalPendapatan" INTEGER,

    CONSTRAINT "Pendapatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pendapatan_barangId_key" ON "Pendapatan"("barangId");

-- AddForeignKey
ALTER TABLE "Pendapatan" ADD CONSTRAINT "Pendapatan_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
