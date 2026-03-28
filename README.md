# One Piece Tracker

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**One Piece Tracker** adalah aplikasi web modern dan premium yang dirancang untuk membantu penggemar One Piece melacak perjalanan mereka melalui ribuan episode secara langsung tanpa perlu login.

---

## Filosofi Device-First (No Login)

One Piece Tracker menggunakan pendekatan **Device-First**. Anda tidak perlu membuat akun. Semua data tersimpan aman di dalam browser perangkat Anda.

- **Deteksi Otomatis**: Aplikasi mendeteksi perangkat (Mobile/Desktop) dan sistem operasi untuk memastikan antarmuka yang optimal.
- **Penyimpanan Lokal**: Menggunakan `localStorage` browser untuk menyimpan progres secara instan.
- **Migrasi Data**: Anda bisa menggunakan fitur **Ekspor/Impor** untuk memindahkan logbook antar perangkat melalui file JSON.

---

## Fitur Utama

- **Pangkat Bajak Laut**: Dapatkan gelar dari "Rookie" hingga "Yonko" berdasarkan jumlah episode yang telah diselesaikan.
- **Lanjut Menonton**: Temukan episode terakhir yang belum ditonton secara otomatis dan langsung terhubung ke Bilibili.
- **Filter Pintar**: Navigasi ribuan episode dengan mudah. Sembunyikan Filler atau episode yang sudah ditonton hanya dengan satu klik.
- **Antarmuka Premium**: Animasi buka-tutup Arc yang elegan menggunakan Framer Motion.
- **Logbook Lengkap**: Seluruh episode dikategorikan berdasarkan Saga dan Arc, lengkap dengan penanda Canon/Filler.
- **Pencarian Presisi**: Temukan episode spesifik hanya dengan mengetik nomor atau judulnya.
- **Sinkronisasi Otomatis**: Logbook episode diperbarui setiap hari secara otomatis melalui GitHub Actions.

---

## Stack Teknologi

- **Core**: [React 19](https://react.dev/)
- **Logic**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## Cara Memulai

### Prasyarat
* npm
  ```sh
  npm install npm@latest -g
  ```

### Instalasi
1. Clone repositori ini
   ```sh
   git clone https://github.com/syarfandi/grandline-tracker.git
   ```
2. Instal paket NPM
   ```sh
   npm install
   ```
3. Jalankan server pengembangan
   ```sh
   npm run dev
   ```

---

## Penggunaan & Migrasi

1. **Lacak Episode**: Centang lingkaran pada episode yang telah ditonton.
2. **Pindah Perangkat**:
    - Klik **Simpan File** di perangkat lama untuk mengunduh logbook.
    - Di perangkat baru, klik **Muat File** dan pilih file JSON tersebut.
3. **Pencarian**: Gunakan kotak pencarian untuk mencari nomor episode (misal: "1122") atau kata kunci judul.

---

## Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

---

<p align="center">
  <i>Dibuat untuk para Nakama. Tanpa Login, Tanpa Ribet.</i>
</p>
