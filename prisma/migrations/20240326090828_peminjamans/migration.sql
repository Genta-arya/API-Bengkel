/*
  Warnings:

  - You are about to drop the `Peminjaman` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Peminjaman`;

-- CreateTable
CREATE TABLE `Peminjamans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `noHp` VARCHAR(191) NOT NULL,
    `ket` TEXT NOT NULL,
    `nominal` INTEGER NOT NULL DEFAULT 0,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
