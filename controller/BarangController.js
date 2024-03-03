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
  if ((!nama, !harga, !stok, !diskon, !modal, !service)) {
    return res.status(401).json({ error: "field tidak boleh kosong" });
  }

  try {
    const existingBarang = await prisma.barang.findFirst({
      where: { nama },
    });

    if (existingBarang) {
      return res
        .status(400)
        .json({ error: "Barang dengan nama tersebut sudah ada." });
    }

    const qrCodeData = `BRG-${uuidv4()}`;

    const qrCodeBuffer = await generateQRCode(qrCodeData);

    if (!qrCodeBuffer) {
      return res.status(500).json({ error: "Error generating QR code." });
    }

    const qrCodeFileName = `${qrCodeData}.png`;
    const qrCodeFilePath = `QR/${qrCodeFileName}`;
    const qrCodeFile = bucket.file(qrCodeFilePath);
    await qrCodeFile.save(qrCodeBuffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    const newBarang = await prisma.barang.create({
      data: {
        nama,
        harga: parsedHarga,
        stok: parsedStok,
        diskon: parsedDiskon,
        modal: parsedModal,
        service: parsedService,
        kode: qrCodeData,
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
    console.error("Error creating barang:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

export const EditBarang = async (req, res) => {
  const { nama, harga, stok, diskon, modal, service } = req.body;
  const parsedHarga = parseInt(harga);
  const parsedService = parseInt(service);
  const parsedStok = parseInt(stok);
  const parsedModal = parseInt(modal);
  const parsedDiskon = parseFloat(diskon) / 100;
  if ((!nama, !harga, !stok, !diskon, !modal, !service)) {
    return res.status(401).json({ error: "field tidak boleh kosong" });
  }

  try {
    const updatedBarang = await prisma.barang.update({
      where: { id: parseInt(req.params.id) },
      data: {
        nama: nama,
        harga: parsedHarga,
        stok: parsedStok,
        diskon: parsedDiskon,
        modal: parsedModal,
        service: parsedService,
      },
    });

    return res.status(200).json({
      data: updatedBarang,
      message: "Data berhasil diupdate",
      status: 200,
    });
  } catch (error) {
    console.error("Error creating barang:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;

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

    res.status(200).json({ message: "Barang berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBarang = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  try {
    const skip = (page - 1) * perPage;
    const take = perPage;
    const allBarang = await prisma.barang.findMany({
      include: {
        barcodes: true,
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
    console.error("Error retrieving barang:", error);

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

    res.status(200).json({
      data: allBarang,
    });
  } catch (error) {
    console.error("Error retrieving barang:", error);

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
          mode: "insensitive",
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
          mode: "insensitive",
        },
      },
    });

    res.status(200).json({
      data: barang,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / perPage),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
