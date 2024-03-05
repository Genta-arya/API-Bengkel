import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDataMekanik = async (req, res) => {
  try {
    const { page = 1, pageSize = 2 } = req.query;
    const offset = (page - 1) * pageSize;
    const pageInt = parseInt(page);
    const mekaniks = await prisma.mekanik.findMany({
      take: Number(pageSize),
      skip: offset,
    });

    const totalMekaniks = await prisma.mekanik.count();
    const totalPages = Math.ceil(totalMekaniks / pageSize);

    if (mekaniks.length === 0) {
      return res.status(404).json({ error: "Data not found" });
    }

    res.status(200).json({ data: mekaniks, page: pageInt, totalPages });
  } catch (error) {
    console.error("Error fetching mekaniks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDataAllMekanik = async (req, res) => {
  try {
    const allMekaniks = await prisma.mekanik.findMany();

    res.status(200).json({ data: allMekaniks });
  } catch (error) {
    console.error("Error fetching all mekaniks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createMekanik = async (req, res) => {
  try {
    const { nama, noHp } = req.body;

    // Check if the mekanik with the same nama already exists
    const existingMekanik = await prisma.mekanik.findUnique({
      where: { nama },
    });

    if (existingMekanik) {
      // If the mekanik with the same nama already exists, return a 409 Conflict response
      return res.status(409).json({ error: "nama sudah terdaftar" });
    }

    // Create a new mekanik in the database
    const newMekanik = await prisma.mekanik.create({
      data: {
        nama,
        noHp,
      },
    });

    // Send a success response with the new mekanik data
    res.status(201).json({ data: newMekanik, status: 201 });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: "Internal server error" });
  }
};

export const EditMekanik = async (req, res) => {
  const { id } = req.params;
  const { nama, noHp } = req.body;

  try {
    // Cari mekanik berdasarkan ID
    const mekanik = await prisma.mekanik.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!mekanik) {
      return res.status(404).json({ message: "Mekanik tidak ditemukan" });
    }

    const existingMekanik = await prisma.mekanik.findFirst({
      where: {
        nama: nama,
        NOT: {
          id: parseInt(id),
        },
      },
    });

    if (existingMekanik) {
      return res
        .status(400)
        .json({ message: "Nama mekanik sudah ada" });
    }

    const updatedMekanik = await prisma.mekanik.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nama: nama,
        noHp: noHp,
      },
    });

    return res.status(200).json(updatedMekanik);
  } catch (error) {
    // Tangani kesalahan
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memperbarui mekanik" });
  } finally {
    await prisma.$disconnect();
  }
};

export const DeleteMekanik = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.transaksi.deleteMany({
      where: {
        mekanikId: parseInt(id),
      },
    });

    await prisma.mekanik.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json({ message: "Mekanik berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus mekanik" });
  } finally {
    await prisma.$disconnect();
  }
};

export const searchMekanik = async (req, res) => {
  try {
    let { q, page = 1, perPage = 1 } = req.query;

    const skip = (page - 1) * perPage;
    const take = perPage;

    const mekanik = await prisma.mekanik.findMany({
      where: {
        nama: {
          contains: q,
          mode: "insensitive",
        },
      },
      skip,
      take,
    });

    if (mekanik.length === 0) {
      return res.status(404).json({ message: "No barang found" });
    }

    const totalItems = await prisma.mekanik.count({
      where: {
        nama: {
          contains: q,
          mode: "insensitive",
        },
      },
    });

    res.status(200).json({
      data: mekanik,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / perPage),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
