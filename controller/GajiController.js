import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();



export const getGajiTeknisi = async (req, res) => {
  try {
    // Mengambil tanggal pertama dari data gajiMekanik yang ada di database
    const firstGaji = await prisma.gajiMekanik.findFirst({
      orderBy: {
        tanggal: 'asc', // Urutkan berdasarkan tanggal secara menaik
      },
    });

    if (!firstGaji) {
      throw new Error('No data available in gajiMekanik table');
    }

    const startDate = new Date(firstGaji.tanggal); // Menggunakan tanggal pertama dari data
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7); // Mengatur tanggal akhir setelah 7 hari dari tanggal awal

    console.log('Periode Mulai:', startDate.toISOString());
    console.log('Periode Selesai:', endDate.toISOString());
    const gajiTeknisi = await prisma.gajiMekanik.findMany({
      where: {
        AND: [
          {
            tanggal: {
              gte: startDate,
              lt: endDate,
            },
          },
        ],
      },
      include: {
        mekanik: true
      }
    });

    res.status(200).json({ data: gajiTeknisi });
  } catch (error) {
    console.error('Error retrieving gaji teknisi:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};