import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getGajiTeknisi = async (req, res) => {
  try {
    const allGaji = await prisma.gajiMekanik.findMany({
      include: {
        mekanik: true,
      },
    });

    if (!allGaji || allGaji.length === 0) {
      return res
        .status(200)
        .json({ message: "Belum ada data saat ini", data: [] });
    }

    const isoToday = today.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    }); // String ISO 8601 dengan zona waktu Asia/Jakarta
    const dateObj = new Date(isoToday); // Ubah kembali ke objek Date
    // Set jam, menit, detik, dan milidetik ke 00:00:00

    // Konversi kembali ke string ISO 8601 setelah jam diatur ke 00:00:00
    const isoString = dateObj.toISOString();

    // Mendapatkan tanggal hari ini
    const today = new Date();
    console.log("Tanggal Hari Ini:", today.toISOString());

    // Filter data yang tanggal gajinya belum melewati batas akhir tanggal (gaji.tanggal_akhir)
    const filteredGaji = allGaji.filter((gaji) => {
      const gajiTanggalAkhir = new Date(gaji.tanggal_akhir);
      console.log("Tanggal Akhir Gaji:", gajiTanggalAkhir.toISOString());
      return isoString <= gajiTanggalAkhir;
    });
    const formatDate = (date) => {
      const options = { day: "2-digit", month: "long", year: "numeric" };
      return date.toLocaleDateString("id-ID", options);
    };

    // Mendapatkan periode untuk setiap entitas gaji yang lolos filter
    const gajiWithPeriode = filteredGaji.map((gaji) => {
      const startDate = new Date(gaji.tanggal);
      const endDate = new Date(gaji.tanggal_akhir);
      const periode = `${formatDate(startDate)} - ${formatDate(endDate)}`;
      return { ...gaji, periode }; // Menambahkan informasi periode ke objek gaji
    });

    res.status(200).json({ data: gajiWithPeriode, tanggal: isoString });
  } catch (error) {
    console.error("Error retrieving gaji teknisi:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
