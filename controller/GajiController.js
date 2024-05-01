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

    const today = new Date();

    const isoToday = today.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    }); // String ISO 8601 dengan zona waktu Asia/Jakarta
    const dateObj = new Date(isoToday); // Ubah kembali ke objek Date
    // Set jam, menit, detik, dan milidetik ke 00:00:00

    // Konversi kembali ke string ISO 8601 setelah jam diatur ke 00:00:00
    const isoString = dateObj.toISOString();

    // Mendapatkan tanggal hari ini

    console.log("Tanggal Hari Ini:", today.toISOString());

    // Filter data yang tanggal gajinya belum melewati batas akhir tanggal (gaji.tanggal_akhir)
    const filteredGaji = allGaji.filter((gaji) => {
      const gajiTanggalAkhir = new Date(gaji.tanggal_akhir);
      console.log("Tanggal Akhir Gaji:", gajiTanggalAkhir.toISOString());
      return dateObj <= gajiTanggalAkhir;
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


export const editPeriode = async(req,res) => {
  const {id} = req.params
  const {date} = req.body
  const formattedDate = new Date(date).toISOString();

  const parseId = parseInt(id,10)
  console.log(date)
  if (!date) return res.status(400).json({message:"Required Date"})

  if (!id) return res.status(400).json({message:"Required Id"})
  try {
    let data = await prisma.gajiMekanik.findUnique({
      where: {
        id: parseId
      }
    });

    if (!data) return res.status(404).json({ message: "Gaji Tidak ditemukan" });

    // Update the salary and date
    data = await prisma.gajiMekanik.update({
      where: {
        id: parseId
      },
      data: {
        
        tanggal_akhir: formattedDate // Assuming 'date' is the field to update
      }
    });
    res.status(201).json({ message:"Data berhasil diubah"});
  }  catch (error) {
    console.error("Error retrieving gaji teknisi:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}