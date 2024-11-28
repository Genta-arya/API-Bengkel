import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import qrImage from "qr-image";
import { bucket } from "../Config/Firebase.js";

const prisma = new PrismaClient();

const generateQRCode = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const qrStream = qrImage.image(data, { type: "png" });
      const bufferArray = [];

      qrStream.on("data", (chunk) => {
        bufferArray.push(chunk);
      });

      qrStream.on("end", () => {
        const qrCodeBuffer = Buffer.concat(bufferArray);
        resolve(qrCodeBuffer);
      });

      qrStream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
export const createBarang = async (req, res) => {
  const { nama, harga, stok, diskon, modal, service } = req.body;
  const parsedHarga = parseInt(harga);
  const parsedService = parseInt(service);
  const parsedModal = parseInt(modal);
  const parsedStok = parseInt(stok);
  const parsedDiskon = parseFloat(diskon) / 100;

  if (!nama || !harga || !stok || !diskon || !modal ) {
    return res.status(401).json({ error: "Field tidak boleh kosong" });
  }

  // try {
    const qrCodeData = `BRG-${uuidv4()}`;

  //   const qrCodeBuffer = await generateQRCode(qrCodeData);

  //   if (!qrCodeBuffer) {
  //     return res.status(500).json({ error: "Error generating QR code." });
  //   }

  //   const qrCodeFileName = `${qrCodeData}.png`;
  //   const qrCodeFilePath = `QR/${qrCodeFileName}`;
  //   const qrCodeFile = bucket.file(qrCodeFilePath);
  //   await qrCodeFile.save(qrCodeBuffer, {
  //     metadata: {
  //       contentType: "image/png",
  //     },
  //   });

    const existingProduct = await prisma.barang.findFirst({
      where: {
        nama: {
          equals: nama,
        },
      },
    });

    if (existingProduct) {
      return res.status(400).json({ error: "Nama produk sudah ada" });
    }

    const newBarang = await prisma.barang.create({
      data: {
        nama,
        harga: parsedHarga,
        stok: parsedStok,
        diskon: parsedDiskon,
        modal: parsedModal,
        service: 0,
        kode: qrCodeData ,
      },
    });

    const modalAwal = parsedModal * parsedStok;

    const existingPendapatan = await prisma.pendapatan.findFirst();

    let existingPendapatanId = null;

    if (existingPendapatan) {
      existingPendapatanId = existingPendapatan.id;
    }

    if (!existingPendapatanId) {
      await prisma.pendapatan.create({
        data: {
          modalAwal,
          keuntungan: 0,
          totalPendapatan: 0,
          tanggal: new Date(),
        },
      });
    } else {
      await prisma.pendapatan.updateMany({
        where: {
          id: existingPendapatanId,
        },
        data: { modalAwal: { increment: modalAwal }, tanggal: new Date() },
      });
    }

    // const today = new Date();

    const today = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    });

    // today.setHours(0, 0, 0, 0); // Set jam ke 00:00:00  isoToday.setHours(0, 0, 0, 0);

    // Format ISO 8601 untuk tanggal dan waktu

    const isoToday = today.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    }); // String ISO 8601 dengan zona waktu Asia/Jakarta
    const dateObj = new Date(isoToday); // Ubah kembali ke objek Date

    // Set jam, menit, detik, dan milidetik ke 00:00:00
    dateObj.setHours(0, 0, 0, 0);

    // Konversi kembali ke string ISO 8601 setelah jam diatur ke 00:00:00
    const isoString = dateObj.toISOString();

    // Mendapatkan waktu saat ini dalam zona waktu "Asia/Jakarta"
    const currentTimeWIB = new Date(
      today.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    // Menerapkan zona waktu yang sama pada tanggal besok (tomorrow)
    const tomorrow = new Date(currentTimeWIB);
    tomorrow.setDate(currentTimeWIB.getDate() + 1);

    // Konversi waktu saat ini dan tanggal besok ke dalam format ISO
    const currentTimeISO = currentTimeWIB.toISOString();
    const tomorrowISO = tomorrow.toISOString();
    // today.setHours(0, 0, 0, 0); // Set jam ke 00:00:00
    // const endOfDay = new Date();
    // endOfDay.setHours(23, 59, 59, 999)

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
      // const hari = new Date();

      // const latestEarningDate = new Date(latestEarning.tanggal_akhir);
      // const latestEarningFormattedDate = new Date(
      //   latestEarningDate.getFullYear(),
      //   latestEarningDate.getMonth(),
      //   latestEarningDate.getDate()
      // );
      // if (latestEarningDate.getTime() <= hari.getTime()) {
      //   console.log("data ditambahkan", currentTimeWIB);
      console.log("Earning dibuat");
      await prisma.earning.create({
        data: {
          uang_keluar: modalAwal,
          tanggal: currentTimeISO,
          tanggal_akhir: tomorrowISO,
        },
      });
      // } else {
      //   console.log("data diupdated", currentTimeWIB);
      //   await prisma.earning.updateMany({
      //     where: {
      //       id: latestEarning.id,
      //     },
      //     data: { uang_keluar: { increment: modalAwal } },
      //   });
      // }
    } else {
      // await prisma.earning.create({
      //   data: {
      //     uang_keluar: modalAwal,
      //     tanggal: currentTimeISO,
      //     tanggal_akhir: tomorrowISO,
      //   },
      // });
      console.log("Earning diupdate");
      await prisma.earning.updateMany({
        where: {
          id: latestEarning.id,
        },
        data: { uang_keluar: { increment: modalAwal } },
      });
    }

    await prisma.historyBarang.create({
      data: {
        barangId: newBarang.id,
        tipe: "tambah",
        waktu: new Date(),
        nama: nama,
        perubahan: `Barang baru dengan nama ${nama} ditambahkan dengan harga ${parsedHarga}, stok ${parsedStok} , diskon ${diskon} , modal awal ${modal} `,
      },
    });

    const newBarcode = await prisma.barcode.create({
      data: {
        barcode: qrCodeData,
        barangId: newBarang.id,
        barcodeUrl: `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${encodeURIComponent(qrCodeFilePath)}?alt=media`,
      },
    });

    res.status(201).json({
      data: newBarang,
      barcode: newBarcode,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

export const EditBarang = async (req, res) => {
  const { nama, harga, stok, diskon=1, modal, service } = req.body;
  const parsedHarga = parseInt(harga);
  const parsedService = parseInt(service);
  const parsedStok = parseInt(stok);
  const parsedModal = parseInt(modal);
  const parsedDiskon = parseFloat(diskon) / 100;

  if (!nama || !harga || !stok || !diskon || !modal ) {
    return res.status(401).json({ error: "Field tidak boleh kosong" });
  }

  try {
    const existingProduct = await prisma.barang.findFirst({
      where: { nama: nama },
    });

    if (existingProduct && existingProduct.id !== parseInt(req.params.id)) {
      return res
        .status(400)
        .json({ error: "Nama produk sudah digunakan", status: 400 });
    }

    const previousBarang = await prisma.barang.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    const stokDifference = (parsedStok - previousBarang.stok) * modal;
    const parseDfirenet = parseInt(stokDifference);

    const modalDifference =
      parsedModal * parsedStok - previousBarang.modal * previousBarang.stok;

    const existingPendapatan = await prisma.pendapatan.findFirst();

    let existingPendapatanId = null;

    if (existingPendapatan) {
      existingPendapatanId = existingPendapatan.id;
    }

    if (existingPendapatanId) {
      await prisma.pendapatan.update({
        where: { id: existingPendapatanId },
        data: {
          modalAwal: { increment: modalDifference },
          tanggal: new Date(),
        },
      });
    }

    // const today = new Date();
    const today = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    });

    // Format ISO 8601 untuk tanggal dan waktu
    const isoToday = today.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    }); // String ISO 8601 dengan zona waktu Asia/Jakarta
    const dateObj = new Date(isoToday); // Ubah kembali ke objek Date

    // Set jam, menit, detik, dan milidetik ke 00:00:00
    dateObj.setHours(0, 0, 0, 0);

    // Konversi kembali ke string ISO 8601 setelah jam diatur ke 00:00:00
    const isoString = dateObj.toISOString();

    const currentTimeWIB = new Date(
      today.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    const currentTimeISO = currentTimeWIB.toISOString();
    const tomorrow = new Date(currentTimeWIB);
    tomorrow.setDate(currentTimeWIB.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString();
    // today.setHours(0, 0, 0, 0); // Set jam ke 00:00:00
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // Set jam ke 23:59:59
    const latestEarning = await prisma.earning.findFirst({
      where: {
        tanggal: {
          gte: isoString, // Rentang hari ini mulai dari 00:00:00
          lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Sampai dengan 23:59:59.999Z hari ini
        },
      },
      orderBy: { id: "desc" }, // Mengurutkan berdasarkan tanggal_akhir secara descending
    });
    console.log(latestEarning);

    // const hari = new Date();

    // Mengonversi latestEarning.tanggal_akhir ke format tanggal bulan tahun (tanpa jam)
    // const latestEarningDate = new Date(latestEarning.tanggal_akhir);
    // const latestEarningFormattedDate = new Date(
    //   latestEarningDate.getFullYear(),
    //   latestEarningDate.getMonth(),
    //   latestEarningDate.getDate()
    // );

    if (!latestEarning) {
      // if (latestEarningDate.getTime() <= hari.getTime()) {
      //   console.log("data ditambahkan", currentTimeWIB);
      console.log("Created Earning");
      await prisma.earning.create({
        data: {
          uang_keluar: parseDfirenet < 0 ? 0 : parseDfirenet,
          tanggal: currentTimeISO,
          tanggal_akhir: tomorrowISO,
        },
      });
     
    } else {
    
      console.log("Updated Earning");

      await prisma.earning.updateMany({
        where: {
          id: latestEarning.id,
        },
        data: {
          uang_keluar: { increment: parseDfirenet < 0 ? 0 : parseDfirenet },
        },
      });
    }

    const updatedBarang = await prisma.barang.update({
      where: { id: parseInt(req.params.id) },
      data: {
        nama: nama,
        harga: parsedHarga,
        stok: parsedStok,
        diskon: parsedDiskon,
        modal: parsedModal,
        service: 0,
      },
    });

    await prisma.historyBarang.create({
      data: {
        barangId: updatedBarang.id,
        tipe: "edit",
        waktu: new Date(),
        nama: nama,
        perubahan: `Informasi barang diubah: nama diubah menjadi ${nama}, harga diubah menjadi ${parsedHarga}, stok diubah menjadi ${parsedStok} , Diskon menjadi ${diskon} dan modal awal menjadi ${modal} `,
      },
    });

    return res.status(200).json({
      data: updatedBarang,
      message: "Data berhasil diupdate",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;

    const barangToDelete = await prisma.barang.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!barangToDelete) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    await prisma.barcode.deleteMany({
      where: {
        barangId: parseInt(id),
      },
    });

    await prisma.transaksiBarang.deleteMany({
      where: {
        barangId: parseInt(id),
      },
    });

    await prisma.history.deleteMany({
      where: {
        barangId: parseInt(id),
      },
    });

    await prisma.barang.delete({
      where: {
        id: parseInt(id),
      },
    });

    await prisma.historyBarang.create({
      data: {
        barangId: parseInt(id),
        tipe: "hapus", // Menandakan bahwa barang telah dihapus
        waktu: new Date(),
        nama: barangToDelete.nama,
        perubahan: `Barang dengan nama ${barangToDelete.nama} telah dihapus dari daftar.`,
      },
    });
    const modalToDelete =
      barangToDelete.modal * (barangToDelete.stok + barangToDelete.laku);

    const existingPendapatan = await prisma.pendapatan.findFirst();

    let existingPendapatanId = 0;

    if (existingPendapatan) {
      existingPendapatanId = existingPendapatan.id;
    }

    await prisma.pendapatan.update({
      where: {
        id: existingPendapatanId,
      },
      data: {
        modalAwal: {
          decrement: modalToDelete,
        },
      },
    });

    res.status(200).json({ message: "Barang berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBarang = async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  try {
    const skip = (page - 1) * perPage;
    const take = perPage;
    const allBarang = await prisma.barang.findMany({
      include: {
        barcodes: true,
      },
      orderBy:{
        id:"desc"
      },
      skip,
      take,
    });

    const totalItems = await prisma.barang.count();
    const totalPages = Math.ceil(totalItems / perPage);

    res.status(200).json({
      data: allBarang,
      currentPage: parseInt(page),
      totalPages: totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

export const getAllBarang = async (req, res) => {
  try {
    const allBarang = await prisma.barang.findMany({
      include: {
        barcodes: true,
      },
    });

    // Mengurutkan data berdasarkan nama barang (A-Z)
    allBarang.sort((a, b) => {
      if (a.nama < b.nama) return -1;
      if (a.nama > b.nama) return 1;
      return 0;
    });

    res.status(200).json({
      data: allBarang,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

export const searchBarang = async (req, res) => {
  try {
    let { q, page = 1, perPage = 10 } = req.query;

    const skip = (page - 1) * perPage;
    const take = perPage;

    const barang = await prisma.barang.findMany({
      where: {
        nama: {
          contains: q,
        },
      },
      skip,
      take,
    });

    if (barang.length === 0) {
      return res.status(404).json({ message: "No barang found" });
    }

    const totalItems = await prisma.barang.count({
      where: {
        nama: {
          contains: q,
        },
      },
    });

    res.status(200).json({
      data: barang,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / perPage),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
