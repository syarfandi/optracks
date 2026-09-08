# OP Tracker 🏴‍☠️

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Port](https://img.shields.io/badge/Port-3002-emerald)](http://localhost:3002)

**OP Tracker** adalah aplikasi web logbook dan pelacak progres petualangan anime One Piece paling modern, cepat, dan elegan. Dibangun dengan pendekatan *Device-First* tanpa kewajiban login, aplikasi ini dirancang khusus untuk memandu para Nakama menjelajahi ribuan episode serta film layar lebar tanpa repot, bebas filler, dan selalu terorganisir.

---

> ### ⚓ Logbook Petualangan Nakama
> Lupakan catatan manual di buku atau spreadsheet yang membingungkan. **OP Tracker** menyajikan pengalaman melacak progres yang mulus, interaktif, dan penuh nuansa khas dunia bajak laut:
> 
> * 🚫 **Bebas Login** — Akses instan detik itu juga, seluruh progres tersimpan aman di perangkat lokal Anda.
> * 🧭 **Navigasi 10 Saga & Puluhan Arc** — Dari Romance Dawn hingga Egghead & Elbaf.
> * 🎯 **Filter Pintar (Anti-Filler)** — Lewati cerita sampingan dan fokus penuh pada alur canon.
> * 🎬 **Arsip 15 Film Layar Lebar** — Lacak tontonan film bioskop dari Movie 1 hingga Film Red.
> * 💰 **Sistem Rank & Bounty Dinamis** — Raih gelar dari Tukang Pel (Rookie) hingga Raja Bajak Laut dengan nilai buruan Berries (฿) nyata.
> * 📸 **Pamer Kartu Bajak Laut (High-Res Export)** — Hasilkan kartu poster pencapaian resolusi 3x HD untuk dibagikan ke media sosial.
> * 🔔 **Notifikasi Episode Otomatis** — Terintegrasi dengan Service Worker dan sinkronisasi berkala Bilibili.

> **⚠️ Disclaimer Hukum / Legal Disclaimer**  
> *This is a fan-made, non-profit, open-source project. This project is not affiliated with, endorsed by, or sponsored by Eiichiro Oda, Shueisha, Toei Animation, or any of the official copyright holders of 'One Piece'. All trademarks, character names, and related images belong to their respective owners. No copyrighted media files are hosted on this repository.*

---

## 📑 Daftar Isi

- [Fitur Unggulan](#-fitur-unggulan)
- [Sistem Rank & Nilai Buruan (Bounty)](#-sistem-rank--nilai-buruan-bounty)
- [Arsip Film Layar Lebar (Movie Archive)](#-arsip-film-layar-lebar-movie-archive)
- [Otomasi Data & Sinkronisasi Bilibili](#-otomasi-data--sinkronisasi-bilibili)
- [Tumpukan Teknologi](#-tumpukan-teknologi)
- [Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Konfigurasi PM2](#-konfigurasi-pm2)
- [Privasi & Keamanan Data](#-privasi--keamanan-data)

---

## ✨ Fitur Unggulan

### 1. Privasi Mutlak & Zero-Friction (Tanpa Login)
- **Tanpa Akun & Password**: Tidak memerlukan email, kata sandi, ataupun otentikasi pihak ketiga. Langsung klik dan catat progres Anda.
- **Penyimpanan Lokal (`localStorage`)**: Data tontonan Anda sepenuhnya berada di bawah kendali perangkat Anda sendiri.
- **Ekspor & Impor Cadangan (JSON)**: Berpindah perangkat atau browser dengan mudah melalui fitur unduh/unggah file cadangan JSON sekali klik.

### 2. Manajemen Episode Komprehensif (1100+ Episode)
- **10 Saga Terstruktur**: Pengelompokan saga resmi (*East Blue, Alabasta, Sky Island, Water 7, Thriller Bark, Summit War, Fish-Man Island, Dressrosa, Yonko Saga, dan Final Saga*).
- **Klasifikasi Detail per Arc**: Setiap arc ditandai dengan jenis status alur yang jelas: `Canon`, `Filler`, `Mixed`, atau `Recommended Filler` (seperti Arc G-8 Navarone).
- **Mode Tampilan Fleksibel**: Pilihan tampilan grid kartu (*Card Mode*) yang kaya visual atau daftar ringkas (*List Mode*).
- **Centang Borongan (Batch Toggle)**: Selesaikan seluruh episode dalam satu Arc atau satu Saga penuh dalam satu kali klik.

### 3. Filter Pintar & Pencarian Kilat
- **Filter Anti-Filler**: Sembunyikan episode filler untuk pengalaman menonton cerita canon murni yang terbebas dari pengalihan alur.
- **Sembunyikan Selesai (*Hide Completed*)**: Bersihkan layar dari episode yang telah Anda tonton agar fokus pada perjalanan yang tersisa.
- **Pencarian Real-Time**: Cari episode berdasarkan nomor spesifik (contoh: `1122`), nama arc, atau kata kunci judul secara instan dengan fitur auto-expand saga yang cocok.
- **Tombol Lanjut Nonton (*Auto-Resume*)**: Menemukan episode pertama yang belum Anda tonton, otomatis membuka akordion saga/arc, lalu melakukan *smooth scroll* dengan sorotan efek *glow ring* amber.

### 4. Tautan Resmi Bilibili / Bstation
- Setiap episode terintegrasi dengan tautan resmi ke platform streaming legal Bstation/Bilibili SEA untuk menonton langsung dengan resolusi terbaik.

### 5. Pengalaman Visual & Interaksi Premium
- **Tema Gelap & Terang (*Dark / Light Mode*)**: Dilengkapi transisi visual halus serta sinkronisasi warna *address bar* peramban (`theme-color`).
- **Dukungan Bilingual (ID & EN)**: Seluruh antarmuka beserta judul episode dapat dialihkan secara instan antara Bahasa Indonesia dan Bahasa Inggris.
- **Animasi & Audio Selebrasi**: Didukung animasi kembang api `canvas-confetti` dan efek audio kemenangan saat menamatkan sebuah Arc atau Saga.
- **Generator Kartu Bajak Laut ("Pamer Hasil!")**: Ekspor ringkasan progres tontonan menjadi poster grafis beresolusi tinggi (pixel ratio 3x) format PNG yang memuat nama Anda, gelar pangkat, nilai buruan, dan lingkaran statistik.

### 6. PWA (Progressive Web App) & Notifikasi Rilis
- **Installable**: Dapat diinstal ke layar utama (*Add to Home Screen*) di ponsel Android, iOS, tablet, maupun PC desktop sebagai aplikasi mandiri (*standalone*).
- **Service Worker Background Sync**: Mengecek rilis episode baru secara berkala dan menampilkan *desktop/web notification* saat episode terbaru sudah tersedia di Bilibili.

---

## 🏴‍☠️ Sistem Rank & Nilai Buruan (Bounty)

Aplikasi menghitung progres Anda secara real-time berdasarkan total akumulasi episode canon, filler, dan film yang telah diselesaikan:

### Tingkatan Pangkat Bajak Laut
| Rank (ID) | Rank (EN) | Syarat Episode Ditonton | Nuansa Warna |
| :--- | :--- | :--- | :--- |
| **Tukang Pel (Rookie)** | Chore Boy (Rookie) | 0 Episode | Netral / Abu-abu |
| **Kadet Berani** | Brave Cadet | 1 – 99 Episode | Biru Laut |
| **Kapten Bajak Laut** | Pirate Captain | 100 – 299 Episode | Hijau Daun |
| **Supernova** | Supernova | 300 – 499 Episode | Amber / Emas Muda |
| **Shichibukai** | Seven Warlords | 500 – 799 Episode | Ungu Kerajaan |
| **Komandan Yonko** | Emperor Commander | 800 – 999 Episode | Rose Merah Muda |
| **Yonko (Kaisar Lautan)** | Emperor (Yonko) | 1000+ Episode | Merah Pekat |
| **Raja Bajak Laut** | King of Pirates | **100% Selesai** (Canon + Filler + Movie) | Emas Menyala (*Glowing Pulse*) |

### Perhitungan Nilai Buruan (Bounty ฿)
Nilai buruan dihitung menggunakan formula bertingkat dinamis menyerupai pertumbuhan buruan di dunia One Piece:
- **0 – 100 Episode**: ฿ 300.000 per episode (Maks. ฿ 30.000.000)
- **101 – 300 Episode**: ฿ 30.000.000 + ฿ 600.000 per episode tambahan (Maks. ฿ 150.000.000)
- **301 – 500 Episode**: ฿ 150.000.000 + ฿ 1.750.000 per episode tambahan (Maks. ฿ 500.000.000)
- **501 – 800 Episode**: ฿ 500.000.000 + ฿ 3.333.333 per episode tambahan (Maks. ฿ 1.500.000.000)
- **801 – 1000 Episode**: ฿ 1.500.000.000 + ฿ 10.000.000 per episode tambahan (Maks. ฿ 3.500.000.000)
- **> 1000 Episode**: ฿ 3.500.000.000 + ฿ 15.000.000 per episode tambahan (Skala alami hingga melampaui ฿ 5.6 Milyar Berries)

---

## 🎬 Arsip Film Layar Lebar (Movie Archive)

Aplikasi menyediakan tab khusus **Movie** untuk melacak 15 film bioskop resmi One Piece:
1. *One Piece: The Movie* (2000)
2. *Clockwork Island Adventure* (2001)
3. *Chopper's Kingdom in the Strange Animal Island* (2002)
4. *Dead End Adventure* (2003)
5. *The Cursed Holy Sword* (2004)
6. *Baron Omatsuri and the Secret Island* (2005)
7. *The Giant Mechanical Soldier of Karakuri Castle* (2006)
8. *Episode of Alabasta: The Desert Princess and the Pirates* (2007)
9. *Episode of Chopper Plus: Bloom in the Winter, Miracle Sakura* (2008)
10. ⭐ *One Piece: Strong World* (2009) — *Recommended*
11. *One Piece 3D: Straw Hat Chase* (2011)
12. ⭐ *One Piece Film: Z* (2012) — *Recommended*
13. ⭐ *One Piece Film: Gold* (2016) — *Recommended*
14. ⭐ *One Piece: Stampede* (2019) — *Recommended*
15. ⭐ *One Piece Film: Red* (2022) — *Recommended*

Setiap kartu film dilengkapi dengan poster resmi, tautan data IMDb, penanda tontonan, serta kontrol sortir tahun rilis (Terbaru / Terlama).

---

## 🤖 Otomasi Data & Sinkronisasi Bilibili

Database judul episode diperbarui secara otomatis menggunakan alur kerja GitHub Actions ([`.github/workflows/update-episodes.yml`](.github/workflows/update-episodes.yml)):

- **Jadwal Eksekusi**:
  - Setiap **Senin pukul 10:00 & 11:00 WIB** (Jendela waktu rilis episode mingguan resmi).
  - Setiap **Rabu & Jumat pukul 15:00 WIB** (Penyisiran pembaruan judul episode resmi).
  - Setiap **6 jam sekali di hari Minggu** (Pemeriksaan latar belakang).
- **Skrip Sinkronisasi ([`src/scripts/sync_bilibili.js`](src/scripts/sync_bilibili.js))**:
  - Mengakses API internal Bilibili OGV Gateway untuk Season One Piece (`season_id: 37976`).
  - Mengambil metadata dalam dwi-bahasa: Bahasa Indonesia (`id_ID`) dan Bahasa Inggris (`en_US`).
  - Menghasilkan file basis data terstruktur di [`public/data/bilibili_episodes.json`](public/data/bilibili_episodes.json) dan [`public/data/english_episodes.json`](public/data/english_episodes.json).

---

## 🛠️ Tumpukan Teknologi

- **Fondasi Aplikasi**: [React 19](https://react.dev/), [TypeScript 5.9](https://www.typescriptlang.org/), [Vite 7](https://vitejs.dev/)
- **Desain & Gaya**: [Tailwind CSS 4](https://tailwindcss.com/), `@tailwindcss/vite`, Lucide Icons
- **Animasi & Efek Interaktif**: [Framer Motion](https://www.framer.com/motion/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Ekspor Gambar**: [html-to-image](https://www.npmjs.com/package/html-to-image) (Rendering poster 3x pixel ratio)
- **PWA & Offline Worker**: `vite-plugin-pwa`, `workbox-precaching`, `workbox-core`
- **Analitik**: `@vercel/analytics`

---

## 📁 Struktur Direktori Proyek

```plaintext
optracks/
├── .github/
│   └── workflows/
│       └── update-episodes.yml   # Otomasi sinkronisasi episode Bilibili via GitHub Actions
├── public/
│   ├── data/
│   │   ├── bilibili_episodes.json # Database judul episode Bahasa Indonesia
│   │   └── english_episodes.json  # Database judul episode Bahasa Inggris
│   ├── mugiwara-logo.png          # Favicon & icon PWA Topi Jerami
│   └── success.mp3                # Efek audio perayaan Arc/Saga
├── src/
│   ├── data/                      # Backup lokal database episode
│   ├── scripts/
│   │   ├── fetch_english_titles.js
│   │   └── sync_bilibili.js       # Node.js scraper & updater Bilibili
│   ├── App.tsx                    # Komponen utama aplikasi (Tracker, UI, State, Poster)
│   ├── index.css                  # Konfigurasi Tailwind CSS 4 & efek Glassmorphism
│   ├── main.tsx                   # Titik masuk React 19
│   └── sw.ts                      # Service Worker (PWA cache, background check, notifikasi)
├── ecosystem.config.cjs           # Konfigurasi PM2 Process Manager (Port 3002)
├── index.html                     # Dokumen HTML utama, SEO meta tags & theme color
├── package.json                   # Dependensi & skrip npm
├── tsconfig.json                  # Konfigurasi kompilasi TypeScript
└── vite.config.ts                 # Konfigurasi Vite & plugin PWA
```

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18, 20, atau 22+
- npm atau package manager pilihan Anda

### 1. Kloning Repositori
```sh
git clone https://github.com/syarfandi/optracks.git
cd optracks
```

### 2. Instalasi Dependensi
```sh
npm install
```

### 3. Jalankan Server Pengembangan
Aplikasi ini berjalan secara default di **port 3002**:
```sh
npm run dev
```
Buka peramban Anda di `http://localhost:3002`.

### 4. Sinkronisasi Episode Manual
Jika Anda ingin memperbarui daftar episode secara manual dari API Bilibili:
```sh
npm run sync-episodes
```

---

## ⚡ Konfigurasi PM2

Untuk menjalankan aplikasi di server lokal atau kiosk secara terus-menerus di latar belakang (*background service*), gunakan PM2 dengan berkas [`ecosystem.config.cjs`](ecosystem.config.cjs):

```sh
# Menjalankan service dengan PM2 pada port 3002
pm2 start ecosystem.config.cjs

# Memeriksa status service
pm2 status

# Melihat log aplikasi
pm2 logs optracks:3002

# Menghentikan service
pm2 stop optracks:3002
```

---

## 🔒 Privasi & Keamanan Data

- **Zero Data Collection**: Aplikasi ini tidak mengumpulkan data pribadi apa pun, tidak menggunakan pelacak iklan pihak ketiga, dan tidak menyimpan informasi pengguna di server eksternal.
- **Penyimpanan Lokal Penuh**: Seluruh rekaman riwayat tontonan disimpan secara eksklusif pada peramban web pengguna menggunakan API `localStorage`.
- **Keamanan Data**: Anda disarankan untuk memanfaatkan fitur **Export Progress** secara berkala guna mencadangkan file `.json` progres Anda.

---

<p align="center">
  <b>OP Tracker</b> — <i>Dibuat dengan cinta untuk seluruh Nakama di seluruh dunia. Berlayarlah menuju Grand Line! ⛵</i>
</p>

