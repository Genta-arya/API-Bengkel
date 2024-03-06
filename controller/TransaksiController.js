import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createdTransactions = async (req, res) => {
  try {
    const {
      barangId,
      nama,
      alamat,
      motor,
      detail,
      jumlah,
      mekanikId,
      service,
    } = req.body;

    console.log(req.body);

    // Parse mekanikId to integer
    const mekanikIds = parseInt(mekanikId, 10);

    // Parse service to integer
    const serviceCost = parseInt(service, 10);

    // Check if nama is not null or undefined
    if (!nama) {
      return res.status(400).json({ error: "Nama is required" });
    }

    // Convert barangId and jumlah from comma-separated strings to arrays of integers
    const barangIdArray = barangId.split(",").map(Number);
    const jumlahArray = jumlah.split(",").map(Number);

    // Fetch barang details to calculate total
    const barangs = await prisma.barang.findMany({
      where: { id: { in: barangIdArray } },
    });

    // Calculate total
    let total = 0;
    barangs.forEach((barang, index) => {
      total += barang.harga * jumlahArray[index];
    });

    const totalAkhir = total + serviceCost;

    console.log(total + serviceCost);

    // Membuat transaksi baru menggunakan Prisma Client
    const newTransaction = await prisma.transaksi.create({
      data: {
        nama,
        alamat,
        motor,
        detail,
        total: totalAkhir,
        totalService: serviceCost,
        mekanikId: mekanikIds,
        transaksiBarangs: {
          create: barangIdArray.map((id, index) => ({
            barangId: id,
            jumlah: jumlahArray[index],
          })),
        },
      },
      include: {
        transaksiBarangs: true,
      },
    });

    // Mengurangi stok barang sesuai jumlah yang dibeli
    await Promise.all(
      barangIdArray.map(async (id, index) => {
        await prisma.barang.update({
          where: { id },
          data: {
            stok: {
              decrement: jumlahArray[index],
            },
            laku: {
              increment: jumlahArray[index],
            },
          },
        });

        await prisma.history.create({
          data: {
            barangId: id,
            nama: nama,
            qty: jumlahArray[index],
          },
        });
      })
    );

    // Mengembalikan respons dengan transaksi yang baru dibuat
    res.status(201).json(newTransaction);
  } catch (error) {
    // Menangani kesalahan dan mengembalikan respons dengan pesan kesalahan
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  }
};

export const getTransaction = async (req, res) => {
  try {
    const { currentPage = 1, limit = 10 } = req.query;

    const offset = (currentPage - 1) * limit;

    // Menggunakan Prisma Client untuk mengambil semua transaksi dan relasi yang terkait
    const transactions = await prisma.transaksi.findMany({
      include: {
        mekanik: true,
        transaksiBarangs: {
          include: {
            barang: true, // Mengambil detail barang
          },
        },
      },
      skip: offset,
      take: parseInt(limit),
    });

    // Mengembalikan respons dengan transaksi yang ditemukan
    res.status(200).json(transactions);
  } catch (error) {
    // Menangani kesalahan dan mengembalikan respons dengan pesan kesalahan
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect(); // Disconnect from the database when done
  }
};

export const getChartTransaksi = async (req, res) => {
  const { mode } = req.query;
  try {
    // Ambil semua transaksi dari database
    let transaksis = await prisma.transaksi.findMany({
      include: {
        transaksiBarangs: {
          include: {
            barang: true,
          },
        },
      },
    });

    // Filter transaksi berdasarkan mode
    if (mode) {
      const currentDate = new Date();
      switch (mode) {
        case "harian":
          transaksis = transaksis.filter((transaksi) => {
            const transactionDate = new Date(transaksi.tanggal);
            return (
              transactionDate.getDate() === currentDate.getDate() &&
              transactionDate.getMonth() === currentDate.getMonth() &&
              transactionDate.getFullYear() === currentDate.getFullYear()
            );
          });
          break;
        case "mingguan":
          transaksis = transaksis.filter((transaksi) => {
            const transactionDate = new Date(transaksi.tanggal);
            const firstDayOfWeek = new Date(
              currentDate.setDate(currentDate.getDate() - currentDate.getDay())
            );
            const lastDayOfWeek = new Date(
              currentDate.setDate(
                currentDate.getDate() - currentDate.getDay() + 6
              )
            );
            return (
              transactionDate >= firstDayOfWeek &&
              transactionDate <= lastDayOfWeek
            );
          });
          break;
        case "bulanan":
          transaksis = transaksis.filter((transaksi) => {
            const transactionDate = new Date(transaksi.tanggal);
            return (
              transactionDate.getMonth() === currentDate.getMonth() &&
              transactionDate.getFullYear() === currentDate.getFullYear()
            );
          });
          break;
        case "tahunan":
          // Tidak perlu filter berdasarkan tahun
          break;
        default:
          break;
      }
    }
    const allBarang = await prisma.barang.findMany();

    // Kelompokkan transaksi berdasarkan tanggal
    const groupedTransaksis = {};
    transaksis.forEach((transaksi) => {
      const transaksiDate = new Date(transaksi.tanggal);
      const formattedDate = transaksiDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
      if (!groupedTransaksis[formattedDate]) {
        groupedTransaksis[formattedDate] = {
          totalEarning: 0,
          totalModalAwal: 0,
          totalKeuntungan: 0,
        };
      }

      allBarang.forEach((barang) => {
        const modalAwal = barang.modal * (barang.stok + barang.laku); // Hitung modal awal untuk setiap barang
        // Disini Anda bisa melanjutkan dengan melakukan apa pun yang perlu dilakukan dengan modal awal
        console.log(`Modal awal untuk barang ${barang.nama}: ${modalAwal}`);

        // Tambahkan modal awal dari barang ke totalModalAwal di groupedTransaksis
        groupedTransaksis[formattedDate].totalModalAwal = modalAwal;
      });

      groupedTransaksis[formattedDate].totalEarning += transaksi.total;
      // groupedTransaksis[formattedDate].totalKeuntungan +=
      //   transaksi.total -
      //   transaksi.transaksiBarangs.reduce((acc, transaksiBarang) => {
      //     return acc + transaksiBarang.barang.modal * transaksiBarang.jumlah;
      //   }, 0);
      const totalKeuntungan =
        groupedTransaksis[formattedDate].totalEarning -
        groupedTransaksis[formattedDate].totalModalAwal;

      // Menambahkan total keuntungan ke dalam groupedTransaksis
      groupedTransaksis[formattedDate].totalKeuntungan = totalKeuntungan;
    });

    // Ubah objek menjadi array
    const groupedTransaksisArray = Object.keys(groupedTransaksis).map(
      (key) => ({
        totalEarning: groupedTransaksis[key].totalEarning,
        totalModalAwal: groupedTransaksis[key].totalModalAwal,
        totalKeuntungan: groupedTransaksis[key].totalKeuntungan,
        tanggal: key,
      })
    );

    // Hitung total earning dari semua transaksi
    const totalEarning = transaksis.reduce(
      (acc, transaksi) => acc + transaksi.total,
      0
    );

    // Kirim hasil ke client
    res.json({ data: groupedTransaksisArray, total: totalEarning });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
