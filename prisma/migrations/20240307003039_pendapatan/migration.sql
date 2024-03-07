-- CreateTable
CREATE TABLE "pendapatan" (
    "id" SERIAL NOT NULL,
    "modalAwal" INTEGER,
    "profit" INTEGER,
    "pendapatan" INTEGER,

    CONSTRAINT "pendapatan_pkey" PRIMARY KEY ("id")
);
