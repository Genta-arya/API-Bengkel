-- CreateTable
CREATE TABLE "Earning" (
    "id" SERIAL NOT NULL,
    "uang_keluar" INTEGER NOT NULL DEFAULT 0,
    "uang_masuk" INTEGER NOT NULL DEFAULT 0,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Earning_pkey" PRIMARY KEY ("id")
);
