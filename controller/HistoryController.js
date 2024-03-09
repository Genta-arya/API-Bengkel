import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getHistory = async (req, res) => {
  const { page = 1, perPage = 5 } = req.query;

  const skip = (page - 1) * perPage;
  const take = perPage;

  try {
    // Menghitung jumlah total data
    const totalCount = await prisma.history.count();

    // Menghitung total halaman
    const totalPage = Math.ceil(totalCount / perPage);

    // Mengambil data dari tabel History dan menampilkan relasi dengan tabel Barang
    const history = await prisma.history.findMany({
      include: {
        barang: true,
      },
      orderBy: {
        createdAt: "desc", // Mengurutkan berdasarkan createdAt dari yang terbaru ke yang terlama
      },
      skip: skip,
      take: take,
    });

    // Mengembalikan data sebagai respons bersama dengan informasi halaman
    res.status(200).json({
      data: history,
      currentPage: parseInt(page),
      totalPage: totalPage,
    });
  } catch (error) {
    // Menangani kesalahan dan mengembalikan respons dengan pesan kesalahan
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};
