

import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export const getData = async (req, res) => {
  try {
  
    const jumlahBarang = await prisma.barang.count();
    

    const jumlahMekanik = await prisma.mekanik.count();
    
   
    const jumlahTransaksi = await prisma.transaksi.count();
    
    
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



