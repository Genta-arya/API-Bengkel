import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const Middleware = async (req, res, next) => {
  try {
    let token = req.body.token || req.headers.authorization || "";

    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    if (!token) {
      return res
        .status(401)
        .json({ error: "Akses ditolak, silahkan login terlebih dahulu" });
    }

    const user = await prisma.auth.findFirst({
      where: {
        token_jwt: token,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "Token tidak valid atau pengguna tidak ditemukan" });
    }

    next();
  } catch (error) {
    console.error("Middleware Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
