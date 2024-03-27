import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const PinjamDana = async (req, res) => {
  const { nama, keterangan, nominal } = req.body;
  console.log(req.body);
  const parseNominal = parseInt(nominal, 10);
  try {
    if (!nama || !keterangan || !nominal) {
      return res.status(400).json({ message: "Form Tidak boleh kosong" });
    }
    const today = new Date();
    const isoToday = today.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    });
    const dateObj = new Date(isoToday);

    const isoString = dateObj.toISOString();
    const startOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);

    const pendapatan = await prisma.sadoKas.findMany({
      where: {
        tanggal: {
          gte: startOfMonth,
          lt: new Date(
            dateObj.getFullYear(),
            dateObj.getMonth() + 1,
            0
          ).toISOString(),
        },
      },
      select: {
        id: true,
        nominal: true,
      },
      orderBy: { id: "desc" },
      take: 1,
    });

    if (pendapatan.length === 0) {
      return res.status(400).json({
        data: [],
        error:
          "Transaksi tidak dapat dilanjutkan Karna belum ada pemasukan saldo Kas",
      });
    }

    const Pendapatan = pendapatan[0].nominal || 0;
    if (Pendapatan < parseNominal) {
      return res.status(400).json({ error: "Keuangan tidak mencukupi" });
    }

    const savePengeluaran = await prisma.peminjamans.create({
      data: {
        nama,
        ket: keterangan,
        nominal: parseNominal,
        tanggal: isoString,
      },
    });

    await prisma.sadoKas.update({
      where: {
        id: pendapatan[0].id,
      },
      data: {
        nominal: { decrement: parseNominal },
      },
    });

    res.status(200).json({ message: "berhasil", data: savePengeluaran });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const EditPinjamDana = async (req, res) => {
  const { nama, keterangan, nominal } = req.body;
  const { id } = req.params;
  console.log(id);
  const today = new Date();
  const isoToday = today.toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });
  const dateObj = new Date(isoToday);

  const isoString = dateObj.toISOString();
  const startOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);

  const parseNominal = parseInt(nominal, 10);
  try {
    if (!nama || !keterangan || !nominal) {
      return res.status(400).json({ message: "Form Tidak boleh kosong" });
    }
    const today = new Date();
    const isoToday = today.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    });

    const findData = await prisma.peminjamans.findMany({
      where: {
        id: parseInt(id, 10),
      },

      take: 1,
    });

    const pendapatan = await prisma.sadoKas.findMany({
      where: {
        tanggal: {
          gte: startOfMonth,
          lt: new Date(
            dateObj.getFullYear(),
            dateObj.getMonth() + 1,
            0
          ).toISOString(),
        },
      },
      select: {
        id: true,
        nominal: true,
      },
      orderBy: { id: "desc" },
      take: 1,
    });
    const currentNominal = findData[0].nominal;
    const difference = currentNominal - parseNominal;
    // console.log(difference);
    if (findData.length === 0) {
      return res
        .status(404)
        .json({ data: [], message: "Data tidak ditemukan" });
    }

    if (pendapatan.length === 0) {
      return res
        .status(400)
        .json({ data: [], message: "Belum ada keuntungan" });
    }

    const calculate = currentNominal - difference;
    console.log("nominal data sekarang", currentNominal);
    console.log("nominal req.body", parseNominal);
    console.log(calculate);
    const Pendapatan = pendapatan[0].nominal || 0;
    if (Pendapatan < parseNominal) {
      return res.status(400).json({ error: "Saldo kas tidak mencukupi" });
    }

    if (currentNominal < parseNominal) {
      console.log("dikurang");
      await prisma.sadoKas.update({
        where: {
          id: pendapatan[0].id,
        },
        data: {
          nominal: { decrement: Math.abs(difference) },
        },
      });
    } else {
      console.log("ditambah");
      await prisma.sadoKas.update({
        where: {
          id: pendapatan[0].id,
        },
        data: {
          nominal: { increment: Math.abs(difference) },
        },
      });
    }

    const response = await prisma.peminjamans.update({
      where: {
        id: parseInt(id, 10),
      },
      data: {
        nama,
        nominal: parseNominal,
        ket: keterangan,
      },
    });

    // console.log(updatedSadoKas);

    res.status(200).json({ message: "berhasil", data: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const GetMyDana = async (req, res) => {
  const { filter } = req.body;
  const startDate = new Date(filter?.startDate); // Mengambil tanggal awal dari filter

  // Hitung tanggal terakhir dari bulan tersebut

  const today = new Date();
  const isoToday = today.toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });
  const dateObj = new Date(isoToday);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const lastDayOfMonth = new Date(year, month + 1);

  // lastDayOfMonth sekarang berisi tanggal terakhir dari bulan yang sesuai dengan filter.startDate
  console.log(lastDayOfMonth.toISOString());
  const startOfMonth = new Date(year, month, 1);
  const monthNameID = dateObj.toLocaleString("id-ID", { month: "long" });

  console.log("Nama bulan ini (Bahasa Indonesia):", monthNameID);
  try {
    const pendapatan = await prisma.sadoKas.findMany({
      where: {
        tanggal: {
          gte: startOfMonth,
          lt: new Date(
            dateObj.getFullYear(),
            dateObj.getMonth() + 1,
            0
          ).toISOString(),
        },
      },
      select: {
        id: true,
        nominal: true,
      },
      orderBy: { id: "desc" },
      take: 1,
    });

    if (pendapatan.length === 0) {
      return res
        .status(200)
        .json({ data: [], message: "Belum ada keuntungan", pendapatan: [] ,       bulan: monthNameID, });
    }

    let mydana;
    if (filter) {
      // Jika terdapat filter, gunakan filter dalam pencarian data

      mydana = await prisma.peminjamans.findMany({
        where: {
          tanggal: {
            gte: startDate,
            lt: new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate() + 1
            ),
          },
        },
      });
      // if (mydana.length === 0) {
      //   return res.status(404).json({ message: "Data tidak ditemuakn" });
      // } else {
      //   mydana = await prisma.peminjamans.findMany({
      //     where: {
      //       tanggal: {
      //         gte: startOfMonth,
      //         lt: new Date(
      //           dateObj.getFullYear(),
      //           dateObj.getMonth() + 1,
      //           0
      //         ).toISOString(),
      //       },
      //     },
      //   });
      // }
    } else {
      mydana = await prisma.peminjamans.findMany({
        where: {
          tanggal: {
            gte: startOfMonth,
            lt: new Date(
              dateObj.getFullYear(),
              dateObj.getMonth() + 1,
              0
            ).toISOString(),
          },
        },
      });
    }

    if (mydana.length === 0) {
      return res.status(200).json({
        data: [],
        message: "Belum ada pengeluaran",
        pendapatan: pendapatan,
      });
    }
    console.log(mydana);

    res.status(200).json({
      message: "berhasil",
      data: mydana,
      pendapatan: pendapatan,

      bulan: monthNameID,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const deleteDana = async (req, res) => {
  const { id } = req.params;

  try {
    const today = new Date();
    const isoToday = today.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    });

    const dateObj = new Date(isoToday);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const monthNameID = dateObj.toLocaleString("id-ID", { month: "long" });

    const findId = await prisma.peminjamans.findMany({
      where: {
        id: parseInt(id, 10),
      },
      select: {
        nominal: true,
      },
    });
    if (!findId) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    const pendapatan = await prisma.sadoKas.findMany({
      where: {
        tanggal: {
          gte: startOfMonth,
          lt: new Date(
            dateObj.getFullYear(),
            dateObj.getMonth() + 1,
            0
          ).toISOString(),
        },
      },
      select: {
        id: true,
        nominal: true,
      },
      orderBy: { id: "desc" },
      take: 1,
    });
    if (pendapatan) {
      await prisma.sadoKas.update({
        where: {
          id: pendapatan[0].id,
        },
        data: {
          nominal: { increment: findId[0].nominal },
        },
      });
    } else {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    await prisma.peminjamans.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    res.status(200).json({ message: "Data Berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
