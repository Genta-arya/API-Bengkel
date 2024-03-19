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

    console.log("harga service", serviceCost)

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

    let total = 0;
    let currentModal = 0;
    barangs.forEach((barang, index) => {
      total += barang.harga * jumlahArray[index];
      currentModal += barang.modal * jumlahArray[index];
    });

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
    console.log(`${earning} -  ${currentModal} `);

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
          tanggal: new Date(),
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
    let endDate = new Date(startDate); 

  
    if (today.getMonth() !== 11) {
      // Bulan-bulan kecuali Desember
      endDate.setMonth(endDate.getMonth() + 1); // Tambahkan 1 bulan
    } else {
      // Bulan Desember
      endDate.setFullYear(endDate.getFullYear() + 1); // Tambahkan 1 tahun
    }


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
          modalAwal: { increment: modalAwal },
          totalPendapatan: { increment: totalAkhir },
        },
      });
    } else {
      const newPendapatanHarian = await prisma.pendapatanHarian.create({
        data: {
          keuntungan: keuntungan,
          modalAwal: modalAwal,
          totalPendapatan: totalAkhir,
          tanggal: new Date(),
        },
      });


    }

    const existingEarning = await prisma.earning.findFirst({
      where:{
        tanggal: {
          gte: startDate,
          lt: endDate,
        },
      }
    });
 

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
      todays.getDate() - todays.getDay()
    );
    const endDates = new Date(
      todays.getFullYear(),
      todays.getMonth(),
      todays.getDate() - todays.getDay() + 7
    );

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
            increment: parseInt(serviceCost),
          },
        },
      });
    } else {
      await prisma.gajiMekanik.create({
        data: {
          jumlah: parseInt(serviceCost),
          tanggal: new Date(),
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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const transactions = await prisma.transaksi.findMany({
      include: {
        mekanik: true,
        transaksiBarangs: {
          include: {
            barang: true,
          },
        },
      },
      skip: offset,
      take: parseInt(limit),
    });

    const totalTransactions = await prisma.transaksi.count();

    const totalPages = Math.ceil(totalTransactions / parseInt(limit));

    const reversedTransactions = transactions.reverse();

    res.status(200).json({
      data: reversedTransactions,
      totalPage: totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

export const searchTransactionByNopol = async (req, res) => {
  try {
    const { nopol, currentPage = 1, limit = 2 } = req.query;

   

    const skip = (parseInt(currentPage) - 1) * parseInt(limit);
    const take = parseInt(limit);
    // Cek apakah nopol ada atau tidak
    if (!nopol) {
      return res.status(400).json({ error: "Nomor polisi diperlukan" });
    }

    // Menggunakan Prisma Client untuk mencari transaksi berdasarkan nopol
    const transactionsByNopol = await prisma.transaksi.findMany({
      where: {
        nopol: {
          contains: nopol,
        },
      },
      include: {
        mekanik: true,
        transaksiBarangs: {
          include: {
            barang: true, // Mengambil detail barang
          },
        },
      },
      skip: skip,
      take: take,
    });

    // Periksa apakah transaksi ditemukan
    if (transactionsByNopol.length === 0) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    // Menghitung total halaman berdasarkan jumlah data
    const totalData = await prisma.transaksi.count({
      where: {
        nopol: {
          contains: nopol,
        },
      },
    });
   
    const totalPages = Math.ceil(totalData / take);

    // Mengembalikan hasil pencarian beserta informasi paginasi
    res.status(200).json({
      data: transactionsByNopol,
      totalPages: totalPages,
      currentPage: parseInt(currentPage),
    });
  } catch (error) {
    // Menangani kesalahan dan mengembalikan respons dengan pesan kesalahan
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect(); // Disconnect from the database when done
  }
};

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
    let modalAwal;
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
        const today = new Date();
        const startDates = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        ); // Tanggal awal dari tanggal saat ini

        let endDates = new Date(startDates); // Buat salinan dari startDates untuk diubah nilainya

        // Tambahkan 30 hari ke endDates atau tambahkan 1 bulan kecuali jika bulan saat ini adalah Desember
        if (today.getMonth() !== 11) {
          // Bulan-bulan kecuali Desember
          endDates.setMonth(endDates.getMonth() + 1); // Tambahkan 1 bulan
        } else {
          // Bulan Desember
          endDates.setFullYear(endDates.getFullYear() + 1); // Tambahkan 1 tahun
        }

       
        data = await prisma.pendapatanHarian.findMany({
          where: {
            tanggal: {
              gte: startDates,
              lt: endDates,
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

    const startOfMonth = new Date(year, today.getMonth(), 1);
    const endOfMonth = new Date(year, today.getMonth() + 1, 0);
    modalAwal = await prisma.pendapatan.findMany({
      where: {
        tanggal: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      select: {
        modalAwal: true,
      },
    });

    function formatDate(date) {
      const day = String(date.getDate()).padStart(2, "0"); // Ambil tanggal dengan padding 0 jika perlu
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Ambil bulan dengan padding 0 jika perlu (Ingat: bulan dimulai dari 0)
      const year = date.getFullYear(); // Ambil tahun

      return `${day}-${month}-${year}`; // Format tanggal sesuai dd-mm-yyyy
    }

    const startDates = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    let endDates = new Date(startDates);

    if (today.getMonth() !== 11) {
      endDates.setMonth(endDates.getMonth() + 1);
    } else {
      endDates.setFullYear(endDates.getFullYear() + 1); // Tambahkan 1 tahun
    }
    const formattedStartDate = formatDate(today);
    const formattedEndDate = formatDate(endDates);

    const formattedMessage = `Periode ${formattedStartDate} - ${formattedEndDate}`;



    res.status(200).json({
      data,
      totalKeuntungan,
      modalAwal,
      mode,
      message: `${formattedMessage}`,
    }); // Menambahkan totalKeuntungan ke respons
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Terjadi kesalahan saat memuat data" });
  }
};
export const getMoneyTracking = async (req, res) => {
  const today = new Date();

  const startDates = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ); // Tanggal awal dari tanggal saat ini

  let endDates = new Date(today); 
 
  if (today.getMonth() !== 11) {
    // Bulan-bulan kecuali Desember
    endDates.setMonth(endDates.getMonth() + 1); 
  } else {
    // Bulan Desember
    endDates.setFullYear(endDates.getFullYear() + 1); // Tambahkan 1 tahun
  }
 

  try {
    const data = await prisma.earning.findMany({
      where: {
        tanggal: {
          gte: startDates,
          lt: endDates,
        },
      },
    });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};