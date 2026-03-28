# OP Tracker

> **⚠️ Disclaimer Hukum / Legal Disclaimer**
> 
> *This is a fan-made, non-profit, open-source project. This project is not affiliated with, endorsed by, or sponsored by Eiichiro Oda, Shueisha, Toei Animation, or any of the official copyright holders of 'One Piece'. All trademarks, character names, and related images belong to their respective owners. No copyrighted media files are hosted on this repository.*

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**OP Tracker** adalah platform pelacakan progres anime paling modern dan premium. Dirancang khusus untuk penggemar yang menginginkan kemudahan tanpa hambatan login, aplikasi ini memastikan perjalanan Anda melewati ribuan episode tetap terorganisir, cepat, dan selalu sinkron.

> ### ⚓ Tracker Anime untuk Fans
> Lupakan cara lama mencatat episode secara manual atau terjebak dalam episode filler yang panjang. **OP Tracker** dirancang untuk memudahkan perjalanan Anda tanpa hambatan teknis.
> 
> *   **Tanpa Login** - Mulai melacak progres Anda secara instan tanpa perlu akun.
> *   **Filter Filler** - Lewati cerita tambahan dan fokus pada alur utama (canon).
> *   **Sistem Rank** - Pantau kenaikan level Anda dari Rookie hingga Yonko.
> *   **Multi-Device** - Tampilan optimal dan ringan di HP maupun Desktop.
> *   **Update Rutin** - Sinkronisasi otomatis setiap hari dengan database terbaru.

---

## ⚡ Nilai Utama (Essential)

Aplikasi ini dibangun dengan filosofi **Device-First (Tanpa Login)**:
- **Zero Friction**: Mulai melacak dalam hitungan detik. Tidak perlu email, password, atau akun pihak ketiga. Progres Anda otomatis tersimpan di browser.
- **Privasi Mutlak**: Data Anda adalah milik Anda. Semua aktivitas tersimpan secara lokal di perangkat menggunakan `localStorage`.
- **Migrasi Fleksibel**: Pindah perangkat? Cukup gunakan fitur **Ekspor/Impor** JSON untuk membawa seluruh sejarah tontonan Anda ke mana pun.

---

## 🧭 Fitur Navigasi & Interaksi

Didesain untuk menangani skala besar (1100+ episode) dengan presisi:
- **Filter Pintar (Anti-Filler)**: Lewati episode filler hanya dengan satu klik. Fokus pada cerita canon atau tampilkan kembali saat Anda menginginkannya.
- **Pencarian Kilat**: Cari ribuan episode berdasarkan nomor (misal: "1122") atau kata kunci judul secara instan.
- **Integrasi Bilibili**: Terhubung langsung ke pemutar resmi Bstation/Bilibili SEA untuk pengalaman menonton yang legal dan berkualitas.
- **Sembunyikan Selesai**: Bersihkan antarmuka dari episode yang sudah Anda tonton agar tetap fokus pada perjalanan yang tersisa.

---

## 🏴‍☠️ Sistem Progres & Rank

Jadikan perjalanan menonton Anda lebih memuaskan:
- **Sistem Rank Bajak Laut**: Mulai sebagai "Rookie" dan naik kasta hingga menjadi "Yonko" atau bahkan "King of Pirates" seiring bertambahnya jumlah episode yang Anda selesaikan.
- **Lanjut Menonton (Auto-Resume)**: Aplikasi secara cerdas mendeteksi episode terakhir yang belum Anda tonton dan menempatkannya di bagian atas untuk akses cepat.
- **Pengelompokan Saga & Arc**: Struktur data yang rapi berdasarkan saga resmi memudahkan Anda mengidentifikasi fase cerita yang sedang diikuti.

---

## 🛠️ Keunggulan Teknis

- **Premium UI & Animasi**: Pengalaman visual yang mengagumkan dengan animasi buka-tutup Arc menggunakan Framer Motion.
- **Bstation Daily Sync**: Database episode diperbarui secara otomatis setiap hari melalui GitHub Actions menggunakan skrip sinkronisasi Bilibili.
- **PWA Ready**: Install aplikasi ini ke layar utama ponsel Anda untuk akses layaknya aplikasi native.
- **Responsive Adaptive**: Antarmuka yang berubah secara dinamis menyesuaikan penggunaan di Mobile, Tablet, atau Desktop.

---

## 🚀 Cara Menjalankan

### Instalasi Lokal
1. Clone repositori ini:
   ```sh
   git clone https://github.com/syarfandi/optracks.git
   ```
2. Instal dependensi:
   ```sh
   npm install
   ```
3. Jalankan server pengembangan:
   ```sh
   npm run dev
   ```

---

<p align="center">
  <i>Dibuat dengan cinta untuk para Nakama. Tanpa Login, Tanpa Ribet.</i>
</p>
