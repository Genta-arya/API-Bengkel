import express from "express";

import {
  EditBarang,
  createBarang,
  deleteBarang,
  getAllBarang,
  getBarang,
  searchBarang,
} from "../controller/BarangController.js";
// import sendWhatsAppMessage, { getQr } from "../controller/sendWa.js";
import { createdTransactions,  getChartData, getTransaction } from "../controller/TransaksiController.js";
import { Logout, handleLogin, handleRegister, isLoggIn } from "../controller/AuthController.js";
import { getHistory } from "../controller/HistoryController.js";
import { DeleteMekanik, EditMekanik, createMekanik, getDataAllMekanik, getDataMekanik, searchMekanik } from "../controller/MekanikController.js";
import { sendMessage } from "../Config/Twilio/Config.js";

const router = express.Router();

// Auth Controller
router.post("/register",handleRegister)
router.post("/login",handleLogin)
router.post("/logout",Logout)
router.post("/user", isLoggIn);

// produk Controller
router.get("/produk", getBarang);
router.get("/all/produk",getAllBarang)
router.post("/produk", createBarang);
router.put("/produk/:id",EditBarang)
router.delete("/produk/:id",deleteBarang)
router.get("/search/produk", searchBarang);

// MekanikController
router.get("/mekanik",getDataMekanik)
router.get("/all/mekanik",getDataAllMekanik)
router.get("/search/mekanik",searchMekanik)
router.post("/mekanik",createMekanik)
router.put("/mekanik/:id",EditMekanik)
router.delete("/mekanik/:id",DeleteMekanik)

// Transaksi Controller
router.post("/transaksi", createdTransactions);
router.get("/transaksi", getTransaction);
// router.get("/graphic/transaksi",getChartTransaksi)
router.get("/graphic/transaksi",getChartData)

// Message Controller
// router.get("/qrchat",getQr)
// router.post("/send-whatsapp",sendWhatsAppMessage)

// Histroy Controller
router.get("/history",getHistory)


router.post("/message",sendMessage)
export default router;
