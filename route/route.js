import express from "express";

import {
  EditBarang,
  createBarang,
  deleteBarang,
  getAllBarang,
  getBarang,
  searchBarang,
} from "../controller/BarangController.js";

import {
  createdTransactions,
  createdTransaksiWithounItem,
  getAllTransaction,
  getChartData,
  getChartDataHarian,
  getMoneyTracking,
  getTransaction,
  searchTransactionByNopol,
} from "../controller/TransaksiController.js";
import {
  Logout,
  changePassword,
  handleLogin,
  handleRegister,
  isLoggIn,
} from "../controller/AuthController.js";
import {
  getHistory,
  getHistoryManageItem,
} from "../controller/HistoryController.js";
import {
  DeleteMekanik,
  EditMekanik,
  createMekanik,
  getDataAllMekanik,
  getDataMekanik,
  searchMekanik,
} from "../controller/MekanikController.js";

import { Middleware, MiddlewareEarning } from "../controller/Midleware.js";
import { getData } from "../controller/getdata.js";
import { editPeriode, getGajiTeknisi } from "../controller/GajiController.js";
import { EditPinjamDana, GetMyDana, PinjamDana, deleteDana } from "../controller/PinjamController.js";

const router = express.Router();

// Auth Controller
router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/logout", Logout);
router.post("/user", isLoggIn);
router.post("/change/password",Middleware,changePassword)

// produk Controller
router.get("/produk", Middleware, getBarang);
router.get("/all/produk", Middleware, getAllBarang);
router.post("/produk",Middleware , createBarang);
router.put("/produk/:id", Middleware, EditBarang);
router.delete("/produk/:id", Middleware, deleteBarang);
router.get("/search/produk", Middleware, searchBarang);
router.get("/history/update", getHistoryManageItem);

// MekanikController
router.get("/mekanik", Middleware, getDataMekanik);
router.get("/all/mekanik", Middleware, getDataAllMekanik);
router.get("/search/mekanik", Middleware, searchMekanik);
router.post("/mekanik", Middleware, createMekanik);
router.put("/mekanik/:id", Middleware, EditMekanik);
router.delete("/mekanik/:id", Middleware, DeleteMekanik);
router.get("/salary/teknisi", getGajiTeknisi);
router.put("/salary/teknisi/:id", Middleware,editPeriode)

// Transaksi Controller
router.post("/transaksi", createdTransactions);
router.post("/transaksi/service", createdTransaksiWithounItem);
router.get("/transaksi", getTransaction);
router.get("/graphic/transaksi", MiddlewareEarning, getChartData);
router.get("/graphic/harian/transaksi", MiddlewareEarning, getChartDataHarian);
router.get("/money", MiddlewareEarning, getMoneyTracking);
router.get("/search/transaksi",Middleware, searchTransactionByNopol);
router.get("/all/transaksi",Middleware, getAllTransaction);

// Dana Penguluaran
router.post("/dana/pinjam",Middleware, PinjamDana);
router.get("/dana/pinjam",Middleware, GetMyDana);
router.put("/dana/pinjam/:id",Middleware, EditPinjamDana);
router.delete("/dana/pinjam/:id", Middleware,deleteDana);



// Histroy Controller
router.get("/history", getHistory);
router.get("/data", getData);



export default router;
