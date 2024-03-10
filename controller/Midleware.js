import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
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
        .json({
          error: "Akses ditolak, silahkan login terlebih dahulu",
          status: 401,
        });
    }

    const decodedToken = jwt.decode(token);

    if (decodedToken && decodedToken.exp < Date.now() / 1000) {
      return res
        .status(401)
        .json({ error: "Token sudah kedaluwarsa", status: 401 });
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const MiddlewareEarning = async (req, res, next) => {
  try {
    const token = req.body.token || req.headers.authorization || "";

    if (!token) {
      return res
        .status(401)
        .json({ error: "Akses ditolak silahkan login terlebih dahulu" });
    }

    next();
  } catch (error) {
    console.error("Middleware Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
