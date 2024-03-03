

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getdata = async (req, res) => {
  try {
    const { page = 1, perPage = 1000} = req.query;

    const skip = (page - 1) * perPage;
    const take = perPage;

    const users = await prisma.users.findMany({
      skip,
      take,
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: `Error getting users: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};
