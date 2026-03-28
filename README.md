# 🏴‍☠️ Grand Line Tracker

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**Grand Line Tracker** adalah aplikasi web modern dan premium yang dirancang khusus untuk para penggemar One Piece untuk melacak perjalanan mereka melalui dunia luas ciptaan Eiichiro Oda secara langsung di perangkat Anda tanpa perlu login.

---

## 📱 Pelacakan Berbasis Perangkat (No Login)

Grand Line Tracker menggunakan filosofi **"Device-First"**. Anda tidak perlu membuat akun atau login. Semua data Anda aman tersimpan di dalam browser perangkat Anda sendiri.

- **📍 Deteksi Otomatis**: Aplikasi mendeteksi perangkat (Mobile/Desktop) dan sistem operasi Anda untuk memastikan kompatibilitas.
- **💾 Penyimpanan Lokal**: Menggunakan `localStorage` browser untuk menyimpan progres secara instan dan aman.
- **🔄 Pemindahan Data**: Ingin pindah perangkat? Gunakan fitur **Ekspor/Impor** untuk memindahkan logbook Anda ke ponsel atau komputer lain dengan mudah melalui file JSON.

---

## ✨ Fitur Utama

- **🚢 Logbook Lengkap**: Setiap episode dan film dikategorikan berdasarkan Saga dan Arc, memastikan Anda mengikuti perjalanan dengan benar.
- **📊 Statistik Kompak**: Visualisasi bar progres yang ringkas untuk seri utama (Canon), Saga, konten Filler, hingga film.
- **📺 Integrasi Bilibili**: Tautan langsung untuk menonton episode di Bilibili dengan judul yang sudah dilokalisasi.
- **🧭 Navigasi Cerdas**: Fitur "Lanjut Nonton" yang secara otomatis menemukan episode berikutnya di logbook Anda.
- **🌓 Desain Premium**: UI responsif dengan Tailwind CSS v4, mode gelap yang indah, dan mikro-animasi yang halus.

---

## 🛠️ Stack Teknologi

- **Inti**: [React 19](https://react.dev/)
- **Logika**: [TypeScript](https://www.typescriptlang.org/)
- **Gaya**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Alat Build**: [Vite](https://vitejs.dev/)

---

## 🚀 Memulai

Untuk menjalankan salinan lokal di komputer Anda, ikuti langkah-langkah sederhana ini:

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

## 📖 Cara Penggunaan & Migrasi Data

1. **Lacak Episode**: Centang lingkaran di sebelah episode yang telah Anda tonton.
2. **Penyimpanan Perangkat**: Di sidebar, Anda akan melihat status "Tersimpan di [OS] ([Device])".
3. **Pindah Perangkat**:
    - Klik **📥 Simpan File** di perangkat lama untuk mengunduh logbook Anda.
    - Kirim file JSON tersebut ke perangkat baru.
    - Di perangkat baru, klik **📤 Muat File** dan pilih file tersebut.
4. **Lanjut Nonton**: Klik tombol tombol logo kapal untuk langsung diarahkan ke episode berikutnya.

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

---

<p align="center">
  <i>Dibuat dengan ❤️ untuk seluruh Nakama di seluruh dunia. Tanpa Login, Tanpa Ribet.</i>
</p>
