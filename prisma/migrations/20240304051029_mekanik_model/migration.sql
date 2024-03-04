-- AlterTable
ALTER TABLE "Transaksi" ADD COLUMN     "mekanikId" INTEGER;

-- CreateTable
CREATE TABLE "Mekanik" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "noHp" TEXT,

    CONSTRAINT "Mekanik_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_mekanikId_fkey" FOREIGN KEY ("mekanikId") REFERENCES "Mekanik"("id") ON DELETE SET NULL ON UPDATE CASCADE;
