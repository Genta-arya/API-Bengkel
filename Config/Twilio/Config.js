import twilio from 'twilio';

const accountSid = 'AC4f8e39a226ecfcfe3a444f8d3517785e';
const authToken = '8cade51c4ad9db46e1cdb4e21f4a9022';
const client = twilio(accountSid, authToken);

const sendMessage = async (req, res) => {
    try {
        // Mendapatkan data yang diperlukan dari body permintaan
        const { messageBody, penerima} = req.body;

        // Memastikan nomor penerima dimulai dengan "+628"
        const formattedRecipient = penerima.startsWith('08') ? `+62${penerima.slice(1)}` : penerima;

        // Mengirim pesan menggunakan data yang diperoleh dari body permintaan
        const message = await client.messages.create({
            body: messageBody,
            from: 'whatsapp:+14155238886',
            to: `whatsapp:${formattedRecipient}`
        });

        // Menampilkan pesan terkirim ke konsol
        console.log('Pesan terkirim:', message.sid);

        // Mengirim respon ke klien
        res.status(200).json({ message: 'Pesan WhatsApp berhasil dikirim!' });
    } catch (error) {
        // Menangani kesalahan yang terjadi selama pengiriman pesan
        console.error('Error:', error.message);

        // Mengirim respon kesalahan ke klien
        res.status(500).json({ error: 'Gagal mengirim pesan WhatsApp' });
    }
};

export { sendMessage };