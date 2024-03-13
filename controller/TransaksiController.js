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
      noHp,
      nopol,
    } = req.body;

    // Parse mekanikId and service to integers
    const mekanikIds = parseInt(mekanikId, 10);
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

    // Check if stok is sufficient for each barang
    const barangHabis = [];
    const stokHabis = [];
    barangs.forEach((barang, index) => {
      if (barang.stok < jumlahArray[index]) {
        barangHabis.push(barang.nama);
        stokHabis.push(barang.stok);
      }
    });

    // Mengonversi stokHabis menjadi string dengan koma sebagai pemisah
    const stokString = stokHabis.join(", ");

    // If any barang is out of stock, return the list of out of stock barangs
    if (barangHabis.length > 0) {
      return res.status(400).json({
        error: `Stok barang ${barangHabis.join(
          ", "
        )} hanya tersisa ${stokString}`,
      });
    }
    // Calculate total
    let total = 0;
    let currentModal = 0;
    barangs.forEach((barang, index) => {
      total += barang.harga * jumlahArray[index];
      currentModal = barang.modal * jumlahArray[index];
    });

    // Calculate total with service cost

    const existingPendapatan = await prisma.pendapatan.findFirst();

    let existingPendapatanId = null;

    if (existingPendapatan) {
      existingPendapatanId = existingPendapatan.id;
    }

    const totalAkhir = total;
    let modalAwal = 0;

    if (existingPendapatan) {
      modalAwal = existingPendapatan.modalAwal;
    }

    const earning = totalAkhir;
    const keuntungan = earning - currentModal;

    if (existingPendapatanId) {
      await prisma.pendapatan.update({
        where: { id: existingPendapatanId },
        data: {
          tanggal: new Date(),
          keuntungan: { increment: keuntungan },
          totalPendapatan: { increment: totalAkhir },
        },
      });
    } else {
      await prisma.pendapatan.create({
        data: {
          modalAwal: modalAwal,
          keuntungan: keuntungan,
          totalPendapatan: totalAkhir,
          tanggal: new Date(), // Tanggal pembuatan entitas pendapatan
        },
      });
    }

    let existingPendapatanHarianId = null;

    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const existingPendapatanHarian = await prisma.pendapatanHarian.findFirst({
      where: {
        tanggal: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    if (existingPendapatanHarian) {
      existingPendapatanHarianId = existingPendapatanHarian.id;
    }

    if (existingPendapatanHarianId) {
      await prisma.pendapatanHarian.update({
        where: { id: existingPendapatanHarianId },
        data: {
          keuntungan: { increment: keuntungan },
          totalPendapatan: { increment: totalAkhir },
        },
      });
    } else {
      await prisma.pendapatanHarian.create({
        data: {
          keuntungan: keuntungan,
          totalPendapatan: totalAkhir,
          tanggal: new Date(),
        },
      });
    }

    const existingEarning = await prisma.earning.findFirst();

    let existingEarningId = null;

    if (existingEarning) {
      existingEarningId = existingEarning.id;
    }

    if (!existingEarningId) {
      await prisma.earning.create({
        data: {
          uang_masuk: totalAkhir,

          tanggal: new Date(),
        },
      });
    } else {
      await prisma.earning.updateMany({
        where: {
          id: existingEarningId,
        },
        data: { uang_masuk: { increment: totalAkhir }, tanggal: new Date() },
      });
    }

    const newTransaction = await prisma.transaksi.create({
      data: {
        nama,
        alamat,
        motor,
        detail,
        nopol,
        noHp,
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

    const todays = new Date();
    const startDates = new Date(
      todays.getFullYear(),
      todays.getMonth(),
      todays.getDate() - todays.getDay() // Mendapatkan hari pertama dari minggu ini
    );
    const endDates = new Date(
      todays.getFullYear(),
      todays.getMonth(),
      todays.getDate() - todays.getDay() + 7 // Mendapatkan hari terakhir dari minggu ini
    );
    
    // Cek apakah data sudah ada untuk mekanik tertentu pada minggu ini
    const existingGajiMekanik = await prisma.gajiMekanik.findFirst({
      where: {
        AND: [
          {
            tanggal: {
              gte: startDates,
              lt: endDates,
            },
          },
          {
            mekanikId: mekanikIds,
          },
        ],
      },
    });
    
    if (existingGajiMekanik) {
      // Jika sudah ada data, lakukan update jumlah gaji
      await prisma.gajiMekanik.updateMany({
        where: {
          AND: [
            {
              tanggal: {
                gte: startDates,
                lt: endDates,
              },
            },
            {
              mekanikId: mekanikIds,
            },
          ],
        },
        data: {
          jumlah: {
            increment: parseInt(serviceCost), // Menambahkan serviceCost ke jumlah gaji mekanik
          },
        },
      });
    } else {
      // Jika belum ada data, buat data baru
      await prisma.gajiMekanik.create({
        data: {
          jumlah: parseInt(serviceCost), // Menambahkan serviceCost ke jumlah gaji mekanik
          tanggal: new Date(), // Tanggal pembayaran gaji atau transaksi
          mekanikId: mekanikIds,
        },
      });
    }

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

  

    res.status(201).json(newTransaction);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal Server Error" });
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

    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect(); // Disconnect from the database when done
  }
};

// export const getChartTransaksi = async (req, res) => {
//   const { mode } = req.query;
//   try {
//     // Ambil semua transaksi dari database
//     let transaksis = await prisma.transaksi.findMany({
//       include: {
//         transaksiBarangs: {
//           include: {
//             barang: true,
//           },
//         },
//       },
//     });

//     // Filter transaksi berdasarkan mode
//     if (mode) {
//       const currentDate = new Date();
//       switch (mode) {
//         case "harian":
//           transaksis = transaksis.filter((transaksi) => {
//             const transactionDate = new Date(transaksi.tanggal);
//             return (
//               transactionDate.getDate() === currentDate.getDate() &&
//               transactionDate.getMonth() === currentDate.getMonth() &&
//               transactionDate.getFullYear() === currentDate.getFullYear()
//             );
//           });
//           break;
//         case "mingguan":
//           transaksis = transaksis.filter((transaksi) => {
//             const transactionDate = new Date(transaksi.tanggal);
//             const firstDayOfWeek = new Date(
//               currentDate.setDate(currentDate.getDate() - currentDate.getDay())
//             );
//             const lastDayOfWeek = new Date(
//               currentDate.setDate(
//                 currentDate.getDate() - currentDate.getDay() + 6
//               )
//             );
//             return (
//               transactionDate >= firstDayOfWeek &&
//               transactionDate <= lastDayOfWeek
//             );
//           });
//           break;
//         case "bulanan":
//           transaksis = transaksis.filter((transaksi) => {
//             const transactionDate = new Date(transaksi.tanggal);
//             return (
//               transactionDate.getMonth() === currentDate.getMonth() &&
//               transactionDate.getFullYear() === currentDate.getFullYear()
//             );
//           });
//           break;
//         case "tahunan":
//           // Tidak perlu filter berdasarkan tahun
//           break;
//         default:
//           break;
//       }
//     }
//     const allBarang = await prisma.barang.findMany();

//     // Kelompokkan transaksi berdasarkan tanggal
//     const groupedTransaksis = {};
//     transaksis.forEach((transaksi) => {
//       const transaksiDate = new Date(transaksi.tanggal);
//       const formattedDate = transaksiDate.toLocaleDateString("id-ID", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "2-digit",
//       });
//       if (!groupedTransaksis[formattedDate]) {
//         groupedTransaksis[formattedDate] = {
//           totalEarning: 0,
//           totalModalAwal: 0,
//           totalKeuntungan: 0,
//         };
//       }

//       allBarang.forEach((barang) => {
//         const modalAwal = barang.modal * (barang.stok + barang.laku); // Hitung modal awal untuk setiap barang
//         // Disini Anda bisa melanjutkan dengan melakukan apa pun yang perlu dilakukan dengan modal awal
//         console.log(`Modal awal untuk barang ${barang.nama}: ${modalAwal}`);

//         // Tambahkan modal awal dari barang ke totalModalAwal di groupedTransaksis
//         groupedTransaksis[formattedDate].totalModalAwal = modalAwal;
//       });

//       groupedTransaksis[formattedDate].totalEarning += transaksi.total;
//       // groupedTransaksis[formattedDate].totalKeuntungan +=
//       //   transaksi.total -
//       //   transaksi.transaksiBarangs.reduce((acc, transaksiBarang) => {
//       //     return acc + transaksiBarang.barang.modal * transaksiBarang.jumlah;
//       //   }, 0);
//       const totalKeuntungan =
//         groupedTransaksis[formattedDate].totalEarning -
//         groupedTransaksis[formattedDate].totalModalAwal;

//       // Menambahkan total keuntungan ke dalam groupedTransaksis
//       groupedTransaksis[formattedDate].totalKeuntungan = totalKeuntungan;
//     });

//     // Ubah objek menjadi array
//     const groupedTransaksisArray = Object.keys(groupedTransaksis).map(
//       (key) => ({
//         totalEarning: groupedTransaksis[key].totalEarning,
//         totalModalAwal: groupedTransaksis[key].totalModalAwal,
//         totalKeuntungan: groupedTransaksis[key].totalKeuntungan,
//         tanggal: key,
//       })
//     );

//     // Hitung total earning dari semua transaksi
//     const totalEarning = transaksis.reduce(
//       (acc, transaksi) => acc + transaksi.total,
//       0
//     );

//     // Kirim hasil ke client
//     res.json({ data: groupedTransaksisArray, total: totalEarning });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
export const getChartData = async (req, res) => {
  const { mode } = req.query;

  try {
    let data;
    let tanggal;

    // Ambil tanggal saat ini
    const today = new Date();
    const year = today.getFullYear();

    switch (mode) {
      case "harian":
        // Filter data pendapatan berdasarkan tanggal
        const startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        );

        data = await prisma.pendapatan.findMany({
          where: {
            tanggal: {
              gte: startDate,
              lt: endDate,
            },
          },
        });
        break;

      case "bulanan":
        // Filter data pendapatan untuk semua bulan pada tahun ini
        const startOfMonth = new Date(year, 0, 1); // Mulai tahun ini
        const endOfMonth = new Date(year + 1, 0, 1); // Akhir tahun ini

        data = await prisma.pendapatan.findMany({
          where: {
            tanggal: {
              gte: startOfMonth,
              lt: endOfMonth,
            },
          },
        });
        break;
      case "tahunan":
        // Tampilkan semua data tanpa filter tanggal
        data = await prisma.pendapatan.findMany();
        break;

      default:
        return res.status(400).json({ message: "Mode tidak valid" });
    }

    // Kirimkan data dan tanggal saat ini sebagai respons
    res.status(200).json({ data, mode });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat memuat data" });
  }
};
export const getChartDataHarian = async (req, res) => {
  const { mode } = req.query;

  try {
    let data;
    let tanggal;
    let totalKeuntungan = 0; // Inisialisasi total keuntungan

    // Ambil tanggal saat ini
    const today = new Date();
    const year = today.getFullYear();

    switch (mode) {
      case "harian":
        // Filter data pendapatan berdasarkan tanggal
        const startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        );

        data = await prisma.pendapatanHarian.findMany({
          where: {
            tanggal: {
              gte: startDate,
              lt: endDate,
            },
          },
        });

        // Menghitung total keuntungan dari data
        totalKeuntungan = data.reduce((acc, curr) => acc + curr.keuntungan, 0);
        break;

      case "bulanan":
        const startOfMonth = new Date(year, today.getMonth(), 1);
        const endOfMonth = new Date(year, today.getMonth() + 1, 0);

        data = await prisma.pendapatanHarian.findMany({
          where: {
            tanggal: {
              gte: startOfMonth,
              lt: endOfMonth,
            },
          },
          orderBy: {
            tanggal: "asc",
          },
          take: 7,
        });

        // Menghitung total keuntungan dari data
        totalKeuntungan = data.reduce((acc, curr) => acc + curr.keuntungan, 0);
        break;

      case "tahunan":
        data = await prisma.pendapatanHarian.findMany();

        // Menghitung total keuntungan dari data
        totalKeuntungan = data.reduce((acc, curr) => acc + curr.keuntungan, 0);
        break;

      default:
        return res.status(400).json({ message: "Mode tidak valid" });
    }

    console.log(totalKeuntungan);

    res.status(200).json({ data, totalKeuntungan, mode }); // Menambahkan totalKeuntungan ke respons
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat memuat data" });
  }
};

export const getMoneyTracking = async (req, res) => {
  try {
    const data = await prisma.earning.findMany();
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
