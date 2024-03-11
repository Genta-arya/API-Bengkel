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
  }
};

export const getHistoryManageItem = async (req, res) => {
  const { page = 1, perPage = 5, category = "all" } = req.query;

  const skip = (page - 1) * perPage;
  const take = parseInt(perPage);

  let where = {}; // Kondisi tambahan untuk query

  // Membuat kondisi tambahan berdasarkan kategori yang diminta
  if (category !== "all") {
    where = { tipe: category };
  }

  try {
    // Mengambil riwayat manajemen barang dari basis data dengan urutan menurun
    const history = await prisma.historyBarang.findMany({
      skip,
      take,
      orderBy: {
        waktu: 'desc', // Menyortir berdasarkan waktu secara menurun (dari yang terbaru)
      },
      where, // Menambahkan kondisi tambahan ke query
    });

    // Menghitung total data riwayat manajemen barang
    const totalCount = await prisma.historyBarang.count();

    // Mengembalikan riwayat manajemen barang beserta informasi paginasi
    res.status(200).json({
      data: history,
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalPage: Math.ceil(totalCount / perPage),
      totalCount,
    });
  } catch (error) {
    // Menangani kesalahan jika terjadi
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};