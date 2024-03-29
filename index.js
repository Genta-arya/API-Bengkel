// app.js
import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import router from "./route/route.js";


dotenv.config();

const app = express();
const port = 5001;
const httpserver = createServer(app);

app.use(express.json());
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

app.use(express.static("public"));
app.use(cors());

app.use(router);


app.get('/', (req, res) => {
  res.redirect('https://sscenter.smkn2ketapang.sch.id/');
});
// app.post('/send-whatsapp', async (req, res) => {
//   const { number, message } = req.body;

//   if (!number|| !message) {
//       return res.status(400).json({ error: 'Missing phoneNumber or message' });
//   }

//   try {
//       await sendWhatsAppMessage(number, message);
//       return res.status(200).json({ success: true });
//   } catch (error) {
//       console.error('Error sending WhatsApp message:', error);
//       return res.status(500).json({ error: 'Error sending WhatsApp message' });
//   }
// });

// app.post('/send-whatsapps', async (req, res) => {
//   const phoneNumber = 6281351539176
//   const message = "Halo"

//   if (!phoneNumber || !message) {
//       return res.status(400).json({ error: 'Missing phoneNumber or message' });
//   }

//   try {
//       // Mengirim pesan WhatsApp
//       await sendWhatsAppMessage(phoneNumber, message);

//       // Mengulang pengiriman pesan setiap 10 detik
//       const intervalId = setInterval(async () => {
//         try {
//           await sendWhatsAppMessage(phoneNumber, message);
//         } catch (error) {
//           console.error('Error sending WhatsApp message:', error);
//         }
//       }, 10000); // 10 detik

//       // Menghentikan pengulangan setelah 1x pengiriman
//       setTimeout(() => {
//         clearInterval(intervalId);
//       }, 10000); // 10 detik

//       return res.status(200).json({ success: true });
//   } catch (error) {
//       console.error('Error sending WhatsApp message:', error);
//       return res.status(500).json({ error: 'Error sending WhatsApp message' });
//   }
// });


httpserver.listen(port, () => {
  console.log("Server running on port " + port);
});
