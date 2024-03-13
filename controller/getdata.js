

import { PrismaClient } from '@prisma/client';
import { getChartData, getChartDataHarian, getMoneyTracking } from './TransaksiController.js';

const prisma = new PrismaClient();

export const getData = async (req, res) => {
  try {
  
    const jumlahBarang = await prisma.barang.count();
    

    const jumlahMekanik = await prisma.mekanik.count();
    
   
    const jumlahTransaksi = await prisma.transaksi.count();
    
    
    res.status(200).json({
      success: true,
      data: {
        jumlahBarang,
        jumlahMekanik,
        jumlahTransaksi,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: `Error getting data: ${error.message}` });
  } finally {
    await prisma.$disconnect();
  }
};



export const getAllData = async (req, res) => {
  try {
    const dataResponse = await getData();
    const chartDataResponse = await getChartData();
    const chartDataHarianResponse = await getChartDataHarian();
    const moneyTrackingResponse = await getMoneyTracking();

    res.status(200).json({
      success: true,
      data: {
        jumlahBarang: dataResponse.jumlahBarang,
        jumlahMekanik: dataResponse.jumlahMekanik,
        jumlahTransaksi: dataResponse.jumlahTransaksi,
        chartData: chartDataResponse.data,
        chartDataHarian: chartDataHarianResponse.data,
        moneyTracking: moneyTrackingResponse.data,
      },
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: `Error getting data: ${error.message}` });
  }
};