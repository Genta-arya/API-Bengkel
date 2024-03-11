

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getData = async (req, res) => {
  try {
    // Mendapatkan jumlah data barang
    const jumlahBarang = await prisma.barang.count();
    
    // Mendapatkan jumlah data mekanik
    const jumlahMekanik = await prisma.mekanik.count();
    
    // Mendapatkan jumlah data transaksi
    const jumlahTransaksi = await prisma.transaksi.count();
    
    // Mengembalikan data jumlah dalam respons
    res.status(200).json({
      success: true,
      data: {
        jumlahBarang,
        jumlahMekanik,
        jumlahTransaksi,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: `Error getting data: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};