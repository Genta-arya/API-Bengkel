import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const getHistory = async (req, res) => {
    try {
      // Mengambil data dari tabel History dan menampilkan relasi dengan tabel Barang
      const history = await prisma.history.findMany({
        include: {
          barang: true,
        },
      });
  
      // Mengembalikan data sebagai respons
      res.status(200).json({data:history});
    } catch (error) {
      // Menangani kesalahan dan mengembalikan respons dengan pesan kesalahan
      res.status(500).json({ error: "Internal Server Error" });
      console.error(error);
    }
  };