import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();




export const getGajiTeknisi = async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay() // Hari pertama dari minggu ini
    );
    const endOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay() + 7 // Hari terakhir dari minggu ini
    );

    // Query untuk mendapatkan data gaji teknisi per minggu
    const gajiTeknisi = await prisma.gajiMekanik.findMany({
      where: {
        AND: [
          {
            tanggal: {
              gte: startOfWeek,
              lt: endOfWeek,
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
