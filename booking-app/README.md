# ✈️ Flight Booking Application

Aplikasi web modern untuk booking tiket pesawat yang terintegrasi dengan **Amadeus API**. Dibangun menggunakan React dengan Tailwind CSS untuk tampilan yang responsif dan menarik.

## 🎯 Fitur Utama

- 🔍 **Pencarian Penerbangan**: Cari penerbangan berdasarkan kota asal, tujuan, dan tanggal
- 🔄 **One-Way & Round Trip**: Mendukung pencarian untuk sekali jalan dan pulang pergi
- ✨ **Real-time Results**: Hasil pencarian real-time dari Amadeus API
- 📋 **Detail Lengkap**: Informasi lengkap maskapai, jadwal, durasi, dan harga
- 🎫 **Booking System**: Sistem booking dengan form input data penumpang
- 📱 **Responsive Design**: Tampilan optimal di semua perangkat (mobile, tablet, desktop)
- 🎨 **Modern UI/UX**: Animasi smooth dan desain yang user-friendly
- 🔒 **Validasi Form**: Validasi data penumpang dan nomor paspor

## 🚀 Teknologi

- **React 19** - Library JavaScript untuk UI
- **React Router DOM** - Routing aplikasi
- **Tailwind CSS** - Styling modern dan responsif
- **Axios** - HTTP client untuk API calls
- **Amadeus API** - Real-time flight data
- **date-fns** - Utility untuk format tanggal

## 📋 Prasyarat

- Node.js (versi 14 atau lebih baru)
- npm atau yarn
- Akun Amadeus API (gratis di [developers.amadeus.com](https://developers.amadeus.com/))

## 🛠️ Instalasi

### 1. Clone atau Download Project

```bash
cd booking-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Amadeus API

1. Daftar di [Amadeus for Developers](https://developers.amadeus.com/)
2. Buat aplikasi baru untuk mendapatkan **Client ID** dan **Client Secret**
3. Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

4. Edit file `.env` dan isi dengan credentials Anda:

```env
REACT_APP_AMADEUS_CLIENT_ID=your_client_id_here
REACT_APP_AMADEUS_CLIENT_SECRET=your_client_secret_here
REACT_APP_AMADEUS_BASE_URL=https://test.api.amadeus.com/v2
```

### 4. Jalankan Aplikasi

```bash
npm start
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## 📱 Halaman Aplikasi

### 1. Search Flight (`/`)

Halaman pencarian dengan fitur:

- Pilih tipe perjalanan (sekali jalan / pulang pergi)
- Input kota asal dan tujuan dengan autocomplete
- Pilih tanggal keberangkatan (dan kepulangan untuk round trip)
- Pilih jumlah penumpang

### 2. Flight Results (`/results`)

Halaman hasil pencarian dengan fitur:

- Daftar penerbangan yang tersedia
- Filter berdasarkan jumlah transit
- Sorting berdasarkan harga, durasi, atau waktu keberangkatan
- Informasi detail maskapai, jadwal, dan harga
- Klik untuk memilih penerbangan

### 3. Flight Booking (`/booking`)

Halaman booking dengan fitur:

- Form input data penumpang (nama, nomor paspor, tanggal lahir, jenis kelamin)
- Validasi nomor paspor
- Ringkasan penerbangan
- Konfirmasi booking dengan kode referensi

## 🎨 Fitur Desain

- **Gradient Background**: Background gradien yang smooth
- **Card Hover Effects**: Efek hover dengan shadow dan transform
- **Smooth Animations**: Animasi fade-in, slide-up, dan scale-in
- **Loading States**: Animasi loading yang menarik
- **Responsive Layout**: Grid dan flexbox untuk semua ukuran layar
- **Custom Colors**: Pallet warna primary yang konsisten
- **Typography**: Hierarki font yang jelas

## 🔧 Struktur Project

```
booking-app/
├── public/
├── src/
│   ├── components/        # Komponen reusable
│   │   └── LoadingSpinner.js
│   ├── pages/            # Halaman utama
│   │   ├── SearchFlight.js
│   │   ├── FlightResults.js
│   │   └── FlightBooking.js
│   ├── services/         # API services
│   │   └── amadeusService.js
│   ├── utils/            # Helper functions
│   │   └── helpers.js
│   ├── App.js           # Main app with routing
│   ├── App.css
│   ├── index.js
│   └── index.css        # Tailwind imports
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js
├── .env.example
├── package.json
└── README.md
```

## 🌐 API Endpoints yang Digunakan

1. **OAuth Token**: `/v1/security/oauth2/token`
2. **Flight Search**: `/v2/shopping/flight-offers`
3. **Location Search**: `/v2/reference-data/locations`
4. **Flight Pricing**: `/v2/shopping/flight-offers/pricing`
5. **Flight Booking**: `/v2/booking/flight-orders`

## ⚙️ Konfigurasi Tailwind

File `tailwind.config.js` sudah dikonfigurasi dengan:

- Custom color palette (primary blue)
- Custom animations (fade-in, slide-up, scale-in)
- Custom keyframes
- Component classes (btn-primary, btn-secondary, input-field, card)

## 📝 Catatan Penting

1. **Test Mode**: Gunakan `https://test.api.amadeus.com` untuk development
2. **Production Mode**: Ganti dengan `https://api.amadeus.com` untuk production
3. **Rate Limiting**: API test memiliki rate limit, gunakan bijak saat development
4. **IATA Codes**: Gunakan kode IATA 3 huruf untuk kota (contoh: JKT, DPS, CGK)
5. **Date Format**: Format tanggal harus YYYY-MM-DD
6. **Passport**: Nomor paspor harus 6-9 karakter alfanumerik

## 🎯 Cara Penggunaan

1. **Buka aplikasi** di browser
2. **Pilih tipe perjalanan** (One Way atau Round Trip)
3. **Masukkan kota asal** - ketik minimal 2 karakter untuk autocomplete
4. **Masukkan kota tujuan** - pilih dari suggestions
5. **Pilih tanggal** keberangkatan (dan kepulangan jika round trip)
6. **Klik "Cari Penerbangan"**
7. **Pilih penerbangan** dari hasil pencarian
8. **Lengkapi data penumpang** dengan benar
9. **Konfirmasi booking** untuk mendapatkan kode booking

## 🐛 Troubleshooting

### Error: "Failed to get access token"

- Pastikan Client ID dan Client Secret sudah benar
- Cek koneksi internet
- Pastikan menggunakan test.api.amadeus.com untuk development

### Error: "No flights found"

- Pastikan kode IATA kota benar (3 huruf)
- Cek tanggal sudah valid (tidak di masa lalu)
- Coba rute yang lebih populer

### Tampilan tidak ada styling

- Pastikan Tailwind sudah terinstall: `npm list tailwindcss`
- Restart development server: `npm start`

## 📦 Build untuk Production

```bash
npm run build
```

Hasil build akan ada di folder `build/` dan siap untuk di-deploy.

## 🤝 Kontribusi

Aplikasi ini dibuat untuk tugas UAS. Untuk improvement atau bug fixes, silakan hubungi developer.

## 📄 License

MIT License - Bebas digunakan untuk keperluan pembelajaran.

## 👨‍💻 Developer

Dibuat dengan ❤️ menggunakan React dan Tailwind CSS

---

**Happy Coding! ✈️**
