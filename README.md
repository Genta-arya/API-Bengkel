# README.md untuk Aplikasi Express

Dokumentasi ini memberikan gambaran umum tentang aplikasi Express, termasuk struktur, fitur utama, dan cara setup.

## Daftar Isi

- [Pengantar](#pengantar)
- [Fitur](#fitur)
- [Setup](#setup)
- [Endpoint API](#endpoint-api)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## Pengantar

Aplikasi Express ini dirancang untuk mengelola berbagai aspek bisnis, termasuk manajemen produk, pelacakan transaksi, manajemen karyawan, dan pelacakan pengeluaran. Aplikasi ini menggunakan pendekatan modular, memisahkan kekhawatiran ke dalam kontroler yang berbeda untuk memastikan kemudahan pemeliharaan dan skalabilitas.

## Fitur

- **Autentikasi**: Menangani pendaftaran pengguna, login, logout, dan perubahan kata sandi.
- **Manajemen Produk**: Memungkinkan untuk membuat, membaca, memperbarui, dan menghapus produk.
- **Manajemen Karyawan**: Mengelola data karyawan, termasuk membuat, membaca, memperbarui, dan menghapus catatan karyawan.
- **Pelacakan Transaksi**: Melacak transaksi, termasuk membuat transaksi baru dan melihat riwayat transaksi.
- **Pelacakan Pengeluaran**: Mengelola pengeluaran, termasuk membuat, membaca, memperbarui, dan menghapus catatan pengeluaran.
- **Visualisasi Data**: Menyediakan grafik dan diagram untuk pelacakan transaksi dan pengeluaran.
- **Pelacakan Riwayat**: Menyimpan riwayat perubahan yang dibuat pada produk, karyawan, dan transaksi.

## Setup

1. **Clone Repository**: Clone repository ini ke mesin lokal Anda.
2. **Install Dependencies**: Jalankan `npm install` untuk menginstal semua dependensi yang diperlukan.
3. **Variabel Lingkungan**: Atur variabel lingkungan Anda dalam file `.env`.
4. **Start Server**: Jalankan `npm start` untuk memulai server.

## Endpoint API

Aplikasi ini mengekspos berbagai endpoint API untuk mengelola data. Berikut adalah ringkasan dari endpoint utama:

### Autentikasi

- `POST /register`: Daftar pengguna baru.
- `POST /login`: Autentikasi pengguna.
- `POST /logout`: Logout pengguna.
- `POST /user`: Periksa apakah pengguna sudah login.
- `POST /change/password`: Ubah kata sandi pengguna.

### Manajemen Produk

- `GET /produk`: Dapatkan produk spesifik.
- `GET /all/produk`: Dapatkan semua produk.
- `POST /produk`: Buat produk baru.
- `PUT /produk/:id`: Perbarui produk.
- `DELETE /produk/:id`: Hapus produk.
- `GET /search/produk`: Cari produk.

### Manajemen Karyawan

- `GET /mekanik`: Dapatkan karyawan spesifik.
- `GET /all/mekanik`: Dapatkan semua karyawan.
- `GET /search/mekanik`: Cari karyawan.
- `POST /mekanik`: Buat karyawan baru.
- `PUT /mekanik/:id`: Perbarui karyawan.
- `DELETE /mekanik/:id`: Hapus karyawan.

### Pelacakan Transaksi

- `POST /transaksi`: Buat transaksi baru.
- `GET /transaksi`: Dapatkan transaksi spesifik.
- `GET /graphic/transaksi`: Dapatkan data grafik transaksi.
- `GET /graphic/harian/transaksi`: Dapatkan data grafik transaksi harian.
- `GET /money`: Dapatkan data pelacakan uang.
- `GET /search/transaksi`: Cari transaksi.
- `GET /all/transaksi`: Dapatkan semua transaksi.

### Pelacakan Pengeluaran

- `POST /dana/pinjam`: Buat catatan pengeluaran baru.
- `GET /dana/pinjam`: Dapatkan catatan pengeluaran.
- `PUT /dana/pinjam/:id`: Perbarui catatan pengeluaran.
- `DELETE /dana/pinjam/:id`: Hapus catatan pengeluaran.

### Pelacakan Riwayat

- `GET /history`: Dapatkan catatan riwayat.
- `GET /data`: Dapatkan catatan data.

## Kontribusi

Kontribusi diperbolehkan. Silakan baca [pedoman kontribusi](CONTRIBUTING.md) sebelum memulai.

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file [LISENSI](LICENSE) untuk detail.
