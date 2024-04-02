import { PrismaClient } from "@prisma/client";
import e from "express";
import moment from "moment";
import "moment-timezone";
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
    if (
      !nama ||
      !barangId ||
      !alamat ||
      !motor ||
      !detail ||
      !jumlah ||
      !mekanikId ||
      !service ||
      !noHp ||
      !nopol
    ) {
      return res
        .status(400)
        .json({ error: "Form tidak boleh ada yang kosong" });
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

    const totalAkhir = total + serviceCost;
    const untung = totalAkhir - serviceCost;

    let modalAwal = 0;

    if (existingPendapatan) {
      modalAwal = existingPendapatan.modalAwal;
    }

    const earning = totalAkhir;
    const keuntungan = untung - currentModal;

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
    console.log("ini keuntungan", keuntungan);

    // handle pendapatanHarian
    const todayss = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set jam ke 00:00:00

    // Format ISO 8601 untuk tanggal dan waktu
    const isoToday = todayss.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    }); // String ISO 8601 dengan zona waktu Asia/Jakarta
    const dateObj = new Date(isoToday); // Ubah kembali ke objek Date

    // Set jam, menit, detik, dan milidetik ke 00:00:00
    dateObj.setHours(0, 0, 0, 0);

    // Konversi kembali ke string ISO 8601 setelah jam diatur ke 00:00:00
    const isoString = dateObj.toISOString();

    const daypendapatan = new Date();
    const currentTimeWIB = new Date(
      daypendapatan.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    const currentTimeISO = currentTimeWIB.toISOString();

    console.log("jam sekarang", currentTimeISO);

    // Menghitung tanggal besok
    const tomorrow = new Date(currentTimeWIB);
    tomorrow.setDate(currentTimeWIB.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString();
    console.log("jambesok", tomorrowISO);

    // Dapatkan waktu saat ini dalam format ISO

    const day = today.getDate();
    const month = today.getMonth() + 1; // Ingat bahwa bulan dimulai dari 0, maka ditambahkan 1
    const year = today.getFullYear();

    today.setHours(0, 0, 0, 0); // Set jam ke 00:00:00

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // Set jam ke 23:59:59

    // Dapatkan waktu saat ini di zona waktu "Asia/Jakarta"
    console.log(`${year}-${month}-${day}`);
    const existingEarnings = await prisma.pendapatanHarian.findFirst({
      where: {
        tanggal: {
          gte: isoString, // Rentang hari ini mulai dari 00:00:00
          lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Sampai dengan 23:59:59.999Z hari ini
        },
      },

      orderBy: { id: "desc" }, // Mengurutkan berdasarkan tanggal_akhir secara descending
      take: 1, // Ambil hanya 1 data terbaru
    });

    console.log("DATA Pendapatan", existingEarnings);

    if (existingEarnings) {
      await prisma.pendapatanHarian.update({
        where: { id: existingEarnings.id },
        data: {
          keuntungan: { increment: keuntungan },
          modalAwal: { increment: modalAwal },
          totalPendapatan: { increment: totalAkhir },
        },
      });
      console.log("Pendapatan Harian Di Perbarui");
    } else {
      console.log("Pendapatan Harian Di Buat");
      await prisma.pendapatanHarian.create({
        data: {
          keuntungan: keuntungan,
          modalAwal: modalAwal,
          totalPendapatan: totalAkhir,
          tanggal: currentTimeISO,
          tanggal_akhir: tomorrowISO,
        },
      });
    }

    const latestEarning = await prisma.earning.findFirst({
      where: {
        tanggal: {
          gte: isoString, // Rentang hari ini mulai dari 00:00:00
          lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Sampai dengan 23:59:59.999Z hari ini
        },
      },
      orderBy: { id: "desc" }, // Mengurutkan berdasarkan tanggal_akhir secara descending
    });
    console.log("Data Earning", latestEarning);
    const startOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    const lastDayOfMonth = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth() + 1,
      0
    );

    const findSaldo = await prisma.sadoKas.findFirst({
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
      orderBy: { id: "desc" },
    });

    if (!findSaldo) {
      console.log("Entitas Saldo dibuat");
      await prisma.sadoKas.create({
        data: {
          nominal: earning,
          tanggal: isoString,
          tanggal_akhir: new Date(
            lastDayOfMonth.getFullYear(),
            lastDayOfMonth.getMonth(),
            lastDayOfMonth.getDate() + 1
          ).toISOString(),
        },
      });
    } else {
      console.log("Entitas Saldo diperbarui");
      await prisma.sadoKas.update({
        where: {
          id: findSaldo.id,
        },
        data: {
          nominal: { increment: earning },
        },
      });
    }

    if (!latestEarning) {
      console.log("Pendapatan Earning Di buat");
      await prisma.earning.create({
        data: {
          uang_masuk: totalAkhir,
          tanggal: currentTimeISO,
          tanggal_akhir: tomorrowISO,
        },
      });
    } else {
      console.log("Pendapatan Earning Di perbarui");
      await prisma.earning.updateMany({
        where: {
          id: latestEarning.id,
        },
        data: { uang_masuk: { increment: totalAkhir } },
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

    // HandleGaji
    const todays = new Date();
    const startDates = new Date(currentTimeWIB);
    const endDates = new Date(startDates);
    endDates.setDate(startDates.getDate() + 7); // Tambahkan 7 hari untuk mendapatkan akhir seminggu dari hari ini
    const endDatesISO = endDates.toISOString();
    const startDateISO = startDates.toISOString();

    // Mendapatkan tanggal akhir terbaru berdasarkan mekanikId
    const latestEndDate = await prisma.gajiMekanik.findFirst({
      where: {
        mekanikId: mekanikIds,
      },
      select: {
        tanggal_akhir: true,
      },
      orderBy: {
        id: "desc", // Mengurutkan berdasarkan tanggal_akhir secara descending
      },
    });

    if (latestEndDate) {
      // Mengonversi tanggal akhir terbaru ke format tanggal bulan tahun (tanpa jam)
      const latestEndDateFormatted = new Date(
        latestEndDate.tanggal_akhir.getFullYear(),
        latestEndDate.tanggal_akhir.getMonth(),
        latestEndDate.tanggal_akhir.getDate()
      );

      // Mengonversi hari ini ke format tanggal bulan tahun (tanpa jam)
      const latestGajiMekanik = await prisma.gajiMekanik.findFirst({
        where: {
          mekanikId: mekanikIds,
        },
        orderBy: {
          id: "desc", // Mengurutkan berdasarkan tanggal_akhir secara descending
        },
      });
      // console.log("gaji hari ini :", todayFormattedDate.toLocaleDateString());
      // console.log(
      //   "batas gaji",
      //   latestEarningFormattedDate.toLocaleDateString()
      // );

      // Memeriksa apakah hari ini sudah melewati tanggal akhir gaji
      if (latestEndDateFormatted.getTime() < dateObj.getTime()) {
        // Buat entitas baru karena tanggal hari ini sudah melewati tanggal akhir
        await prisma.gajiMekanik.create({
          data: {
            jumlah: parseInt(serviceCost),
            tanggal: startDateISO,
            tanggal_akhir: endDatesISO,
            mekanikId: mekanikIds,
          },
        });
        console.log(
          `Entitas Gaji baru dibuat untuk periode dari ${startDates.toDateString()} hingga ${endDates.toDateString()}`
        );
      } else {
        // Lakukan peningkatan nilai gaji jika tanggal hari ini masih berada dalam periode yang sama
        await prisma.gajiMekanik.updateMany({
          where: {
            id: latestGajiMekanik.id,
            mekanikId: mekanikIds,
          },

          data: {
            jumlah: {
              increment: parseInt(serviceCost),
            },
          },
        });
        console.log(
          `Data Gaji diperbarui untuk periode dari ${startDates.toDateString()} hingga ${endDates.toDateString()}`
        );
      }
    } else {
      // Buat entitas baru karena tidak ada gaji mekanik sebelumnya
      await prisma.gajiMekanik.create({
        data: {
          jumlah: parseInt(serviceCost),
          tanggal: startDateISO,
          tanggal_akhir: endDatesISO,
          mekanikId: mekanikIds,
        },
      });
      console.log(
        `Entitas Gaji baru dibuat untuk periode dari ${startDates.toDateString()} hingga ${endDates.toDateString()}`
      );
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

export const createdTransaksiWithounItem = async (req, res) => {
  try {
    const { nama, alamat, motor, detail, mekanikId, service, noHp, nopol } =
      req.body;

    if (
      !nama ||
      !alamat ||
      !motor ||
      !detail ||
      !mekanikId ||
      !service ||
      !noHp ||
      !nopol
    ) {
      return res
        .status(400)
        .json({ error: "Form tidak boleh ada yang kosong" });
    }
    const parseService = parseInt(service, 10);
    const mekanikIds = parseInt(mekanikId, 10);
    const existingPendapatan = await prisma.pendapatan.findFirst();

    let existingPendapatanId = null;

    if (existingPendapatan) {
      existingPendapatanId = existingPendapatan.id;
    }

    const totalAkhir = parseService;

    let modalAwal = 0;

    if (existingPendapatan) {
      modalAwal = existingPendapatan.modalAwal;
    }

    const earning = totalAkhir;
    const keuntungan = earning;

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
          modalAwal: 0,
          keuntungan: keuntungan,
          totalPendapatan: totalAkhir,
          tanggal: new Date(),
        },
      });
    }

    // handle pendapatanHarian
    const todayss = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set jam ke 00:00:00

    // Format ISO 8601 untuk tanggal dan waktu
    const isoToday = todayss.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    }); // String ISO 8601 dengan zona waktu Asia/Jakarta
    const dateObj = new Date(isoToday); // Ubah kembali ke objek Date

    // Set jam, menit, detik, dan milidetik ke 00:00:00
    dateObj.setHours(0, 0, 0, 0);

    // Konversi kembali ke string ISO 8601 setelah jam diatur ke 00:00:00
    const isoString = dateObj.toISOString();

    const daypendapatan = new Date();
    const currentTimeWIB = new Date(
      daypendapatan.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    const currentTimeISO = currentTimeWIB.toISOString();

    console.log("jam sekarang", currentTimeISO);

    // Menghitung tanggal besok
    const tomorrow = new Date(currentTimeWIB);
    tomorrow.setDate(currentTimeWIB.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString();
    console.log("jambesok", tomorrowISO);

    // Dapatkan waktu saat ini dalam format ISO

    const day = today.getDate();
    const month = today.getMonth() + 1; // Ingat bahwa bulan dimulai dari 0, maka ditambahkan 1
    const year = today.getFullYear();

    today.setHours(0, 0, 0, 0); // Set jam ke 00:00:00

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // Set jam ke 23:59:59

    // Dapatkan waktu saat ini di zona waktu "Asia/Jakarta"
    console.log(`${year}-${month}-${day}`);
    const existingEarnings = await prisma.pendapatanHarian.findFirst({
      where: {
        tanggal: {
          gte: isoString, // Rentang hari ini mulai dari 00:00:00
          lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Sampai dengan 23:59:59.999Z hari ini
        },
      },

      orderBy: { id: "desc" }, // Mengurutkan berdasarkan tanggal_akhir secara descending
      take: 1, // Ambil hanya 1 data terbaru
    });

    console.log("DATA Pendapatan", existingEarnings);

    if (existingEarnings) {
      await prisma.pendapatanHarian.update({
        where: { id: existingEarnings.id },
        data: {
          modalAwal: { increment: keuntungan },
          totalPendapatan: { increment: totalAkhir },
        },
      });
      console.log("Pendapatan Harian Di Perbarui");
    } else {
      console.log("Pendapatan Harian Di Buat");
      await prisma.pendapatanHarian.create({
        data: {
          modalAwal: keuntungan,
          totalPendapatan: totalAkhir,
          tanggal: currentTimeISO,
          tanggal_akhir: tomorrowISO,
        },
      });
    }

    const startDates = new Date(currentTimeWIB);
    const endDates = new Date(startDates);
    endDates.setDate(startDates.getDate() + 7); // Tambahkan 7 hari untuk mendapatkan akhir seminggu dari hari ini
    const endDatesISO = endDates.toISOString();
    const startDateISO = startDates.toISOString();

    // Mendapatkan tanggal akhir terbaru berdasarkan mekanikId
    const latestEndDate = await prisma.gajiMekanik.findFirst({
      where: {
        mekanikId: mekanikIds,
      },
      select: {
        tanggal_akhir: true,
      },
      orderBy: {
        id: "desc", // Mengurutkan berdasarkan tanggal_akhir secara descending
      },
    });

    if (latestEndDate) {
      // Mengonversi tanggal akhir terbaru ke format tanggal bulan tahun (tanpa jam)
      const latestEndDateFormatted = new Date(
        latestEndDate.tanggal_akhir.getFullYear(),
        latestEndDate.tanggal_akhir.getMonth(),
        latestEndDate.tanggal_akhir.getDate()
      );

      // Mengonversi hari ini ke format tanggal bulan tahun (tanpa jam)
      const latestGajiMekanik = await prisma.gajiMekanik.findFirst({
        where: {
          mekanikId: mekanikIds,
        },
        orderBy: {
          id: "desc", // Mengurutkan berdasarkan tanggal_akhir secara descending
        },
      });

      // Memeriksa apakah hari ini sudah melewati tanggal akhir gaji
      if (latestEndDateFormatted.getTime() < dateObj.getTime()) {
        // Buat entitas baru karena tanggal hari ini sudah melewati tanggal akhir
        await prisma.gajiMekanik.create({
          data: {
            jumlah: parseInt(serviceCost),
            tanggal: startDateISO,
            tanggal_akhir: endDatesISO,
            mekanikId: mekanikIds,
          },
        });
        console.log(
          `Entitas Gaji baru dibuat untuk periode dari ${startDates.toDateString()} hingga ${endDates.toDateString()}`
        );
      } else {
        // Lakukan peningkatan nilai gaji jika tanggal hari ini masih berada dalam periode yang sama
        await prisma.gajiMekanik.updateMany({
          where: {
            id: latestGajiMekanik.id,
            mekanikId: mekanikIds,
          },

          data: {
            jumlah: {
              increment: parseService,
            },
          },
        });
        console.log(
          `Data Gaji diperbarui untuk periode dari ${startDates.toDateString()} hingga ${endDates.toDateString()}`
        );
      }
    } else {
      // Buat entitas baru karena tidak ada gaji mekanik sebelumnya
      await prisma.gajiMekanik.create({
        data: {
          jumlah: parseService,
          tanggal: startDateISO,
          tanggal_akhir: endDatesISO,
          mekanikId: mekanikIds,
        },
      });
      console.log(
        `Entitas Gaji baru dibuat untuk periode dari ${startDates.toDateString()} hingga ${endDates.toDateString()}`
      );
    }
    const startOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    const lastDayOfMonth = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth() + 1,
      0
    );

    const findSaldo = await prisma.sadoKas.findFirst({
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
      orderBy: { id: "desc" },
    });

    if (!findSaldo) {
      console.log("Entitas Saldo dibuat");
      await prisma.sadoKas.create({
        data: {
          nominal: keuntungan,
          tanggal: isoString,
          tanggal_akhir: new Date(
            lastDayOfMonth.getFullYear(),
            lastDayOfMonth.getMonth(),
            lastDayOfMonth.getDate() + 1
          ).toISOString(),
        },
      });
    } else {
      console.log("Entitas Saldo diperbarui");
      await prisma.sadoKas.update({
        where: {
          id: findSaldo.id,
        },
        data: {
          nominal: { increment: keuntungan },
        },
      });
    }
    const latestEarning = await prisma.earning.findFirst({
      where: {
        tanggal: {
          gte: isoString, // Rentang hari ini mulai dari 00:00:00
          lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Sampai dengan 23:59:59.999Z hari ini
        },
      },
      orderBy: { id: "desc" }, // Mengurutkan berdasarkan tanggal_akhir secara descending
    });
    if (!latestEarning) {
      console.log("Pendapatan Earning Di buat");
      await prisma.earning.create({
        data: {
          uang_masuk: totalAkhir,
          tanggal: currentTimeISO,
          tanggal_akhir: tomorrowISO,
        },
      });
    } else {
      console.log("Pendapatan Earning Di perbarui");
      await prisma.earning.updateMany({
        where: {
          id: latestEarning.id,
        },
        data: { uang_masuk: { increment: totalAkhir } },
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
        totalService: parseService,
        mekanikId: mekanikIds,
      },
      include: {
        transaksiBarangs: true,
      },
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    // Menangani kesalahan dan mengembalikan respons dengan pesan kesalahan
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect(); // Disconnect from the database when done
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

export const getAllTransaction = async (req, res) => {
  try {
    let startDates, endDates;

    // const today = new Date();
    // const startDates = new Date(today.getFullYear(), today.getMonth(), 1);
    // const endDates = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const { startDate } = req.query;
    console.log(startDate);

    if (startDate) {
      // Jika filter tanggal diberikan, gunakan tanggal yang diberikan
      startDates = new Date(startDate);
      endDates = new Date(startDate);
    } else {
      // Jika tidak ada filter tanggal, gunakan default tanggal
      const today = new Date();
      startDates = new Date(today.getFullYear(), today.getMonth(), 1);
      endDates = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    // Ambil awal bulan dan akhir bulan berdasarkan tanggal yang diberikan
    const startOfMonth = new Date(
      startDates.getFullYear(),
      startDates.getMonth(),
      1
    );
    const endOfMonth = new Date(
      endDates.getFullYear(),
      endDates.getMonth() + 1,
      0
    );

    console.log("Awal bulan:", startOfMonth.toLocaleDateString());
    console.log("Akhir bulan:", endOfMonth.toLocaleDateString());

    const pendapatan = await prisma.pendapatanHarian.findMany({
      where: {
        tanggal: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        totalPendapatan: true,
        keuntungan: true,
      },
    });

    console.log(pendapatan);
    const calculateTotal = (data) => {
      let totalPendapatan = 0;
      let keuntungan = 0;

      // Iterasi melalui setiap objek dalam array
      data.forEach((item) => {
        totalPendapatan += item.totalPendapatan;
        keuntungan += item.keuntungan;
      });

      return [totalPendapatan, keuntungan];
    };

    const totals = calculateTotal(pendapatan);

    const arrayPendapatan = [
      { totalPendapatan: totals[0], keuntungan: totals[1] },
    ];

    // console.log(arrayPendapatan);

    const transaksi = await prisma.transaksi.findMany({
      include: {
        mekanik: true,
        transaksiBarangs: {
          include: {
            barang: true,
          },
        },
      },
      where: {
        tanggal: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    if (transaksi.length === 0) {
      return res.status(404).json({ message: "Transaksi Tidak ditemukan" });
    }

    const totalService = transaksi.reduce(
      (acc, curr) => acc + curr.totalService,
      0
    );

    const total = pendapatan.reduce(
      (acc, curr) => acc + curr.totalPendapatan,
      0
    );

    const pendapatanKotor = totalService + total;

    console.log("total service", totalService);
    console.log("total", total);

    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString();
      return `${day}-${month}-${year}`;
    };

    const formattedStartDate = formatDate(startOfMonth);
    const formattedEndDate = formatDate(endOfMonth);

    const periode = `${formattedStartDate} sampai ${formattedEndDate}`;
    console.log(
      `Data Transaksi saat ini untuk periode dari ${formattedStartDate} hingga ${formattedEndDate}`
    );

    res.status(200).json({
      data: transaksi,
      pendapatan: arrayPendapatan,
      periode,
      pendapatanKotor: total,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).send("Error fetching transactions");
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
    let totalKeuntungan = 0;

    const pendapatanHarianData = await prisma.pendapatanHarian.findMany({
      orderBy: {
        tanggal: "asc",
      },
      select: {
        tanggal: true,
      },
    });

    if (pendapatanHarianData.length === 0) {
      return res
        .status(404)
        .json({ message: "Data pendapatan harian tidak ditemukan" });
    }

    // const today = pendapatanHarianData[0].tanggal;

    const today = new Date(); // Tanggal hari ini
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (mode) {
      case "bulanan":
        const today = new Date(); // Tanggal hari ini
        const year = today.getFullYear();
        const month = today.getMonth();
        const startDates = new Date(year, month, 1); // Tanggal awal bulan
        const endDates = new Date(year, month + 1, 0); // Tanggal akhir bulan
        data = await prisma.pendapatanHarian.findMany({
          where: {
            tanggal_akhir: {
              gte: startDates,
              lte: endDates,
            },
          },
          orderBy: {
            tanggal: "asc",
          },
        });
        totalKeuntungan = data.reduce((acc, curr) => acc + curr.keuntungan, 0);

        // Update totalKeuntungan di database
        // const updateResult = await prisma.pendapatanHarian.updateMany({
        //   where: {
        //     tanggal_akhir: {
        //       gte: startDates,
        //       lte: endDates,
        //     },
        //   },
        //   data: {
        //     totalKeuntungan: totalKeuntungan,
        //   },
        // });

        // if (updateResult.count > 0) {
        //   console.log(`Total keuntungan berhasil diupdate: ${totalKeuntungan}`);
        // } else {
        //   console.log("Tidak ada data yang diupdate.");
        // }
        break;
    }

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

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
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    }

    const formattedStartDate = formatDate(startOfMonth);
    const formattedEndDate = formatDate(endOfMonth);

    const formattedMessage = `Periode ${formattedStartDate} - ${formattedEndDate}`;

    res.status(200).json({
      data,
      totalKeuntungan,
      modalAwal,
      mode,
      message: `${formattedMessage}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Terjadi kesalahan saat memuat data" });
  }
};

export const getMoneyTracking = async (req, res) => {
  const today = new Date();

  // Set jam ke 00:00:00

  // Format ISO 8601 untuk tanggal dan waktu
  // const isoToday = new Date(today).toISOString();
  // isoToday.setHours(0, 0, 0, 0);
  const isoToday = today.toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  }); // String ISO 8601 dengan zona waktu Asia/Jakarta
  const dateObj = new Date(isoToday); // Ubah kembali ke objek Date
  // Set jam, menit, detik, dan milidetik ke 00:00:00
  dateObj.setHours(0, 0, 0, 0);

  // Konversi kembali ke string ISO 8601 setelah jam diatur ke 00:00:00
  const isoString = dateObj.toISOString();

  try {
    // Mendapatkan tanggal hari ini tanpa jam

    const data = await prisma.earning.findMany({
      where: {
        tanggal: {
          gte: isoString, // Rentang hari ini mulai dari 00:00:00
          lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Sampai dengan 23:59:59.999Z hari ini
        },
      },
      orderBy: {
        id: "desc",
      },
      take: 1,
    });

    console.log(data);

    // console.log(new Date(da.getTime() + 24 * 60 * 60 * 1000).toISOString());

    // Mendapatkan waktu saat ini dalam UTC
    const currentTimeUTC = moment.utc();

    // Mengonversi waktu UTC ke Zona Waktu Indonesia Barat (WIB)
    const currentTimeWIB = currentTimeUTC.tz("Asia/Jakarta");

    // Mendapatkan waktu dalam format ISO untuk tampilan atau penyimpanan
    const currentTimeISO = currentTimeWIB.toISOString();
    console.log("jam sekarang", currentTimeWIB.toISOString());
    console.log(dateObj.toLocaleString());
    // Menghitung waktu untuk hari berikutnya dalam Zona WIB
    const tomorrowWIB = currentTimeWIB.clone().add(1, "day");

    // Mendapatkan waktu besok dalam format ISO untuk tampilan atau penyimpanan
    const tomorrowISO = tomorrowWIB.toISOString();
    console.log("jambesok", tomorrowISO);

    let formattedDate = null;
    if (data.length > 0) {
      const latestEarningDate = data[0].tanggal_akhir;
      const thisday = data[0].tanggal;

      // console.log(latestEarningDate.toLocaleDateString());
      // console.log(today.toLocaleDateString());

      // if (latestEarningDate.getTime() < today.getTime()) {
      //   // Jika tanggal sama dengan hari ini, kosongkan data
      //   data.length = 0;
      // }

      // Array nama hari dalam Bahasa Indonesia
      const namaHari = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];

      // Mendapatkan nama hari dalam Bahasa Indonesia
      const hariIndex = thisday.getDay(); // Mengambil indeks hari dari tanggal
      const namaHariIndo = namaHari[hariIndex];

      // Mendapatkan string dalam format yang diinginkan
      formattedDate = `${namaHariIndo}, ${thisday.getDate()} ${thisday.toLocaleString(
        "id-ID",
        {
          month: "long",
          year: "numeric",
        }
      )}`;
      const hari = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
      });
      const isoString = new Date(hari).toISOString();
      const days = new Date();

      res.status(200).json({
        data: data,
        tanggal: formattedDate,
        today: isoString,
        day: days,
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Belum ada transaksi",
        today: today,
        day: isoString,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// const today = pendapatanHarianData[0].tanggal;
// const startDates = new Date(
//   today.getFullYear(),
//   today.getMonth(),
//   today.getDate()
// );

// let endDates = new Date(startDates);

// if (startDates.getMonth() !== 11) {
//   endDates.setMonth(endDates.getMonth() + 1);
// } else {
//   endDates.setFullYear(endDates.getFullYear() + 1);
// }

// if (today.getMonth() !== 11) {
//   endDates.setMonth(endDates.getMonth() + 1);
// } else {
//   endDates.setFullYear(endDates.getFullYear() + 1);
// }
