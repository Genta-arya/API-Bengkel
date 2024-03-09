-- CreateTable
CREATE TABLE "PendapatanHarian" (
    "id" SERIAL NOT NULL,
    "modalAwal" INTEGER NOT NULL DEFAULT 0,
    "keuntungan" INTEGER NOT NULL DEFAULT 0,
    "totalPendapatan" INTEGER NOT NULL DEFAULT 0,
    "tanggal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendapatanHarian_pkey" PRIMARY KEY ("id")
);
