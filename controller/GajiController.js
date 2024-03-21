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
      return res.status(200).json({ message: 'Belum ada data saat ini', data: [] });
    }

    const latestGaji = allGaji.reduce((latest, current) => {
      return latest.tanggal > current.tanggal ? latest : current;
    });

    console.log(latestGaji)
    const weekAgo = new Date(latestGaji.tanggal);
    weekAgo.setDate(weekAgo.getDate() - 1); // 1 hari sebelum tanggal terakhir gaji

    console.log('Periode Mulai:', weekAgo.toISOString());
    console.log('Periode Selesai:', latestGaji.tanggal.toISOString());

    // Filter data yang masih berada dalam rentang waktu yang diinginkan
    const filteredGaji = allGaji.filter((gaji) => new Date(gaji.tanggal) >= weekAgo);

    res.status(200).json({ data: filteredGaji });
  } catch (error) {
    console.error('Error retrieving gaji teknisi:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};
