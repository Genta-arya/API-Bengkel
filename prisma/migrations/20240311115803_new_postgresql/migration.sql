-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "password" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barcode" (
    "id" SERIAL NOT NULL,
    "barcode" TEXT NOT NULL,
    "barcodeUrl" TEXT NOT NULL,
    "barangId" INTEGER NOT NULL,

    CONSTRAINT "Barcode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "motor" TEXT NOT NULL,
    "noHp" TEXT,
    "nopol" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "totalService" DOUBLE PRECISION,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mekanikId" INTEGER,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiBarang" (
    "id" SERIAL NOT NULL,
    "transaksiId" INTEGER NOT NULL,
    "barangId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "pendapatanId" INTEGER,

    CONSTRAINT "TransaksiBarang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendapatan" (
    "id" SERIAL NOT NULL,
    "modalAwal" INTEGER NOT NULL DEFAULT 0,
    "keuntungan" INTEGER NOT NULL DEFAULT 0,
    "totalPendapatan" INTEGER NOT NULL DEFAULT 0,
    "tanggal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pendapatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendapatanHarian" (
    "id" SERIAL NOT NULL,
    "keuntungan" INTEGER NOT NULL DEFAULT 0,
    "totalPendapatan" INTEGER NOT NULL DEFAULT 0,
    "tanggal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendapatanHarian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Earning" (
    "id" SERIAL NOT NULL,
    "uang_keluar" INTEGER NOT NULL DEFAULT 0,
    "uang_masuk" INTEGER NOT NULL DEFAULT 0,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Earning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barang" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "harga" DOUBLE PRECISION NOT NULL,
    "diskon" DECIMAL(65,30),
    "service" INTEGER NOT NULL DEFAULT 0,
    "modal" INTEGER NOT NULL,
    "laku" INTEGER DEFAULT 0,
    "stok" INTEGER NOT NULL,

    CONSTRAINT "Barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryBarang" (
    "id" SERIAL NOT NULL,
    "barangId" INTEGER NOT NULL,
    "tipe" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "perubahan" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "HistoryBarang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mekanik" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "noHp" TEXT,

    CONSTRAINT "Mekanik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "barangId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qrcht" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "qrcht_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auth" (
    "uid" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255),
    "name" VARCHAR(255),
    "token_jwt" VARCHAR(255),
    "otp" TEXT,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Barcode_barcode_key" ON "Barcode"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Barang_nama_key" ON "Barang"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Mekanik_nama_key" ON "Mekanik"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_username_key" ON "Auth"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_token_jwt_key" ON "Auth"("token_jwt");

-- AddForeignKey
ALTER TABLE "Barcode" ADD CONSTRAINT "Barcode_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_mekanikId_fkey" FOREIGN KEY ("mekanikId") REFERENCES "Mekanik"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiBarang" ADD CONSTRAINT "TransaksiBarang_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiBarang" ADD CONSTRAINT "TransaksiBarang_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiBarang" ADD CONSTRAINT "TransaksiBarang_pendapatanId_fkey" FOREIGN KEY ("pendapatanId") REFERENCES "Pendapatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
