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
import { createdTransactions,  getChartData, getChartDataHarian, getTransaction } from "../controller/TransaksiController.js";
import { Logout, handleLogin, handleRegister, isLoggIn } from "../controller/AuthController.js";
import { getHistory } from "../controller/HistoryController.js";
import { DeleteMekanik, EditMekanik, createMekanik, getDataAllMekanik, getDataMekanik, searchMekanik } from "../controller/MekanikController.js";
import { sendMessage } from "../Config/Twilio/Config.js";
import { Middleware } from "../controller/Midleware.js";

const router = express.Router();

// Auth Controller
router.post("/register",handleRegister)
router.post("/login",handleLogin)
router.post("/logout",Logout)
router.post("/user", isLoggIn);

// produk Controller
router.get("/produk", Middleware ,getBarang);
router.get("/all/produk",Middleware,getAllBarang)
router.post("/produk", Middleware,createBarang);
router.put("/produk/:id",Middleware,EditBarang)
router.delete("/produk/:id",Middleware,deleteBarang)
router.get("/search/produk",Middleware, searchBarang);

// MekanikController
router.get("/mekanik",Middleware,getDataMekanik)
router.get("/all/mekanik",Middleware,getDataAllMekanik)
router.get("/search/mekanik",Middleware,searchMekanik)
router.post("/mekanik",Middleware,createMekanik)
router.put("/mekanik/:id",Middleware,EditMekanik)
router.delete("/mekanik/:id",Middleware,DeleteMekanik)

// Transaksi Controller
router.post("/transaksi", createdTransactions);
router.get("/transaksi", getTransaction);
// router.get("/graphic/transaksi",getChartTransaksi)
router.get("/graphic/transaksi",Middleware,getChartData)
router.get("/graphic/harian/transaksi",Middleware,getChartDataHarian)

// Message Controller
// router.get("/qrchat",getQr)
// router.post("/send-whatsapp",sendWhatsAppMessage)

// Histroy Controller
router.get("/history",getHistory)


router.post("/message",sendMessage)
export default router;
