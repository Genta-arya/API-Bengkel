import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createdTransactions = async (req, res) => {
  try {
    const { barangId, nama, alamat, motor, detail, jumlah } = req.body;

    console.log(barangId, nama, alamat, motor, detail);

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

    // Membuat transaksi baru menggunakan Prisma Client
    const newTransaction = await prisma.transaksi.create({
      data: {
        nama,
        alamat,
        motor,
        detail,
        total,
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
  

        // Menambahkan data transaksi ke tabel History
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

export const getEarningTransaksi = async (req, res) => {
  try {
    const { currentPage = 1, limit = 10, mode } = req.query;

    const offset = (currentPage - 1) * limit;

    // Menggunakan Prisma Client untuk mengambil total pendapatan dari semua transaksi
    const totalEarnings = await prisma.transaksi.aggregate({
      _sum: {
        total: true,
      },
    });

    // Menggunakan Prisma Client untuk mengambil semua transaksi dan relasi yang terkait
    let transactions = await prisma.transaksi.findMany({
      include: {
        transaksiBarangs: {
          include: {
            barang: true, // Mengambil detail barang
          },
        },
      },
      skip: offset,
      take: parseInt(limit),
    });

    // Filter transaksi berdasarkan mode
    if (mode) {
      const currentDate = new Date();
      switch (mode) {
        case 'harian':
          transactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.tanggal);
            return (
              transactionDate.getDate() === currentDate.getDate() &&
              transactionDate.getMonth() === currentDate.getMonth() &&
              transactionDate.getFullYear() === currentDate.getFullYear()
            );
          });
          break;
        case 'mingguan':
          transactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.tanggal);
            const firstDayOfWeek = new Date(
              currentDate.setDate(currentDate.getDate() - currentDate.getDay())
            );
            const lastDayOfWeek = new Date(
              currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6)
            );
            return (
              transactionDate >= firstDayOfWeek && transactionDate <= lastDayOfWeek
            );
          });
          break;
        case 'bulanan':
          transactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.tanggal);
            return (
              transactionDate.getMonth() === currentDate.getMonth() &&
              transactionDate.getFullYear() === currentDate.getFullYear()
            );
          });
          break;
        case 'tahunan':
          // Tidak perlu filter berdasarkan tahun
          break;
        default:
          break;
      }
    }

    // Menghitung total modal dari transaksi yang ditemukan
    const totalCostPrice = transactions.reduce((acc, transaction) => {
      const transactionCostPrice = transaction.transaksiBarangs.reduce(
        (acc, transaksiBarang) => {
          return acc + transaksiBarang.barang.modal * transaksiBarang.jumlah;
        },
        0
      );
      return acc + transactionCostPrice;
    }, 0);

    // Menghitung total keuntungan dari transaksi yang ditemukan
    const totalProfit = totalEarnings._sum.total - totalCostPrice;

    // Mengelompokkan transaksi berdasarkan tanggal
    const groupedTransactions = transactions.reduce((acc, transaction) => {
      const transactionDate = new Date(transaction.tanggal);
      const formattedDate = transactionDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
      if (!acc[formattedDate]) {
        acc[formattedDate] = 0;
      }
      acc[formattedDate] += transaction.total;
      return acc;
    }, {});

    // Mengembalikan respons dengan total pendapatan, total modal, total keuntungan, dan tanggal transaksi terbaru
    res.status(200).json({
      data: {
        earning: totalEarnings._sum.total,
        costPrice: totalCostPrice,
        profit: totalProfit,
        groupedTransactions,
      },
    });
  } catch (error) {
    // Menangani kesalahan dan mengembalikan respons dengan pesan kesalahan
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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
        case 'harian':
          transaksis = transaksis.filter(transaksi => {
            const transactionDate = new Date(transaksi.tanggal);
            return (
              transactionDate.getDate() === currentDate.getDate() &&
              transactionDate.getMonth() === currentDate.getMonth() &&
              transactionDate.getFullYear() === currentDate.getFullYear()
            );
          });
          break;
        case 'mingguan':
          transaksis = transaksis.filter(transaksi => {
            const transactionDate = new Date(transaksi.tanggal);
            const firstDayOfWeek = new Date(
              currentDate.setDate(currentDate.getDate() - currentDate.getDay())
            );
            const lastDayOfWeek = new Date(
              currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6)
            );
            return (
              transactionDate >= firstDayOfWeek && transactionDate <= lastDayOfWeek
            );
          });
          break;
        case 'bulanan':
          transaksis = transaksis.filter(transaksi => {
            const transactionDate = new Date(transaksi.tanggal);
            return (
              transactionDate.getMonth() === currentDate.getMonth() &&
              transactionDate.getFullYear() === currentDate.getFullYear()
            );
          });
          break;
        case 'tahunan':
          // Tidak perlu filter berdasarkan tahun
          break;
        default:
          break;
      }
    }

    // Kelompokkan transaksi berdasarkan tanggal
    const groupedTransaksis = {};
    transaksis.forEach(transaksi => {
      const transaksiDate = new Date(transaksi.tanggal);
      const formattedDate = transaksiDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
      if (!groupedTransaksis[formattedDate]) {
        groupedTransaksis[formattedDate] = {
          totalEarning: 0,
          totalModalAwal: 0,
          totalKeuntungan: 0,
        };
      }
      groupedTransaksis[formattedDate].totalEarning += transaksi.total;
      groupedTransaksis[formattedDate].totalModalAwal += transaksi.transaksiBarangs.reduce((acc, transaksiBarang) => {
        return acc + transaksiBarang.barang.modal * transaksiBarang.jumlah;
      }, 0);
      groupedTransaksis[formattedDate].totalKeuntungan += transaksi.total - transaksi.transaksiBarangs.reduce((acc, transaksiBarang) => {
        return acc + transaksiBarang.barang.modal * transaksiBarang.jumlah;
      }, 0);
    });

    // Ubah objek menjadi array
    const groupedTransaksisArray = Object.keys(groupedTransaksis).map(key => ({
      totalEarning: groupedTransaksis[key].totalEarning,
      totalModalAwal: groupedTransaksis[key].totalModalAwal,
      totalKeuntungan: groupedTransaksis[key].totalKeuntungan,
      tanggal: key,
    }));
    const totalEarning = transaksis.reduce((acc, transaksi) => acc + transaksi.total, 0);
    // Kirim hasil ke client
    res.json({ data: groupedTransaksisArray  , total: totalEarning});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
