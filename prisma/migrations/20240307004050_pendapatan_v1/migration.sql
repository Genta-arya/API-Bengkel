-- AlterTable
ALTER TABLE "TransaksiBarang" ADD COLUMN     "pendapatanId" INTEGER;

-- AddForeignKey
ALTER TABLE "TransaksiBarang" ADD CONSTRAINT "TransaksiBarang_pendapatanId_fkey" FOREIGN KEY ("pendapatanId") REFERENCES "Pendapatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
