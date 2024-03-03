// import { Client } from 'whatsapp-web.js';
// import qrcode from 'qrcode';

// const client = new Client();
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// client.on('qr', async (qr) => {
//     const qrCode = await qrcode.toDataURL(qr);
//     // console.log(qrCode);
//     // const updatedQr = await prisma.qrcht.update({
//     //     where: { id: 1 }, // ID yang ingin diupdate
//     //     data: {
//     //         url: qrCode,
//     //     },
//     // });

// });

// export const getQr = async (req, res) => {
//     try {
//         const qrCode = await prisma.qrcht.findUnique({
//             where: { id: 1 },
//         });

//         if (!qrCode) {
//             return res.status(404).json({ error: 'QR Code not found' });
//         }

//         const qrCodeData = qrCode.url;

//         return res.status(200).json({ qrCodeData });
//     } catch (error) {
//         console.error('Error getting QR Code from database:', error);
//         return res.status(500).json({ error: 'Error getting QR Code from database' });
//     }
// };


// client.on('ready', () => {
//     console.log('Client is ready!');

// });

// client.initialize();


// const sendWhatsAppMessage = async (req, res) => {
//     try {
//       const {number,message} = req.body

//         if (!number || !message) {
//             return res.status(400).json({ error: 'Missing number or message' });
//         }

//             const chat = await client.getChatById(`${number}@c.us`);
//             await chat.sendMessage(message);
//             console.log('Message sent successfully!');
//             return res.status(201).json({ success: true });
       
//     } catch (error) {
//         console.error('Error sending message:', error);
//         return res.status(500).json({ error: 'Error sending message' });
//     }
// };
// // const sendWhatsAppMessage = async (number, message) => {
// //     try {
// //         const chat = await client.getChatById(`${number}@c.us`);
// //         await chat.sendMessage(message);
// //         console.log('Message sent successfully!');
// //     } catch (error) {
// //         console.error('Error sending message:', error);
// //     }
// // };
// // const sendWhatsAppMessage = async (number, message) => {
// //     try {
// //         if (client === "ready") {
// //             const chat = await client.getChatById(`${number}@c.us`);
// //             await chat.sendMessage(message);
// //             console.log('Message sent successfully!');
// //         } else {
// //             console.log('WhatsApp client is not ready yet. Message not sent.');
// //         }
// //     } catch (error) {
// //         console.error('Error sending message:', error);
// //     }
// // };


// export default sendWhatsAppMessage;
