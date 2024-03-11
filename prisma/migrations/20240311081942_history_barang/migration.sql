-- CreateTable
CREATE TABLE "HistoryBarang" (
    "id" SERIAL NOT NULL,
    "barangId" INTEGER NOT NULL,
    "tipe" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "perubahan" TEXT NOT NULL,

    CONSTRAINT "HistoryBarang_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistoryBarang" ADD CONSTRAINT "HistoryBarang_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
