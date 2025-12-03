# 🔑 Panduan Setup Amadeus API

Dokumen ini berisi panduan lengkap untuk mendapatkan dan mengkonfigurasi API Amadeus untuk aplikasi booking pesawat.

## 📝 Langkah-langkah Mendapatkan API Credentials

### 1. Registrasi Akun

1. Kunjungi [Amadeus for Developers](https://developers.amadeus.com/)
2. Klik **"Register"** atau **"Sign Up"**
3. Isi form registrasi dengan data:
   - Email
   - Password
   - Nama lengkap
   - Negara
4. Verifikasi email yang dikirimkan
5. Login ke dashboard Amadeus

### 2. Membuat Aplikasi Baru

1. Setelah login, klik **"My Self-Service Workspace"**
2. Klik **"Create new app"**
3. Isi informasi aplikasi:
   - **App Name**: Booking App (atau nama pilihan Anda)
   - **App Type**: Pilih sesuai kebutuhan
   - **Description**: Website booking tiket pesawat
4. Klik **"Create"**

### 3. Mendapatkan Credentials

Setelah aplikasi dibuat, Anda akan mendapatkan:

```
API Key (Client ID): xxxxxxxxxxxxxxxxxxxx
API Secret (Client Secret): xxxxxxxxxxxxxxxxxxxx
```

**⚠️ PENTING**:

- Jangan share credentials ini ke publik
- Simpan di tempat yang aman
- Jangan commit ke Git repository

### 4. Konfigurasi di Aplikasi

1. Di root folder aplikasi, buat file `.env`:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

2. Edit file `.env` dengan credentials Anda:

```env
REACT_APP_AMADEUS_CLIENT_ID=your_actual_client_id
REACT_APP_AMADEUS_CLIENT_SECRET=your_actual_client_secret
REACT_APP_AMADEUS_BASE_URL=https://test.api.amadeus.com/v2
```

3. **Restart** development server:

```bash
# Stop server (Ctrl+C)
# Jalankan lagi
npm start
```

## 🧪 Testing dengan Test API

Amadeus menyediakan 2 environment:

### Test Environment (Development)

- **URL**: `https://test.api.amadeus.com`
- **Kegunaan**: Development & testing
- **Rate Limit**: 10 transactions/second
- **Free Quota**: 2,000 transactions/month
- **Data**: Test data, tidak untuk produksi

### Production Environment

- **URL**: `https://api.amadeus.com`
- **Kegunaan**: Production (aplikasi live)
- **Rate Limit**: Lebih tinggi (tergantung paket)
- **Billing**: Pay per use
- **Data**: Real-time data maskapai

**Untuk pembelajaran, gunakan Test Environment!**

## 🔍 Menguji API

### Test dengan Postman/cURL

Dapatkan Access Token:

```bash
curl --location --request POST 'https://test.api.amadeus.com/v1/security/oauth2/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'client_id=YOUR_CLIENT_ID' \
--data-urlencode 'client_secret=YOUR_CLIENT_SECRET'
```

Search Flights:

```bash
curl --location --request GET 'https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=SYD&destinationLocationCode=BKK&departureDate=2024-12-15&adults=1' \
--header 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## 📋 Contoh IATA Codes (Kota Indonesia)

| Kota                     | IATA Code |
| ------------------------ | --------- |
| Jakarta                  | JKT       |
| Jakarta (Soekarno-Hatta) | CGK       |
| Jakarta (Halim)          | HLP       |
| Bali (Denpasar)          | DPS       |
| Surabaya                 | SUB       |
| Medan                    | KNO       |
| Makassar                 | UPG       |
| Yogyakarta               | JOG       |
| Balikpapan               | BPN       |
| Manado                   | MDC       |
| Bandung                  | BDO       |
| Semarang                 | SRG       |
| Palembang                | PLM       |
| Pekanbaru                | PKU       |
| Lombok                   | LOP       |

## ⚠️ Common Issues

### 1. "Invalid Client"

**Penyebab**: Client ID atau Secret salah

**Solusi**:

- Double check credentials di dashboard Amadeus
- Pastikan tidak ada spasi atau karakter tersembunyi
- Copy-paste langsung dari dashboard

### 2. "Rate Limit Exceeded"

**Penyebab**: Terlalu banyak request dalam waktu singkat

**Solusi**:

- Tunggu beberapa detik
- Gunakan debouncing untuk autocomplete
- Cache hasil pencarian

### 3. "No flight found"

**Penyebab**:

- IATA code salah
- Tidak ada penerbangan di tanggal tersebut
- Route tidak tersedia

**Solusi**:

- Gunakan IATA code yang valid (3 huruf)
- Coba route populer (JKT-DPS, JKT-SUB)
- Cek tanggal (jangan terlalu jauh di masa depan untuk test API)

### 4. "Unauthorized"

**Penyebab**: Token expired atau tidak valid

**Solusi**:

- Service akan otomatis refresh token
- Pastikan system time correct
- Restart aplikasi

## 💡 Tips Pengembangan

1. **Caching**: Simpan access token untuk mengurangi API calls
2. **Error Handling**: Tangani error dengan user-friendly message
3. **Loading States**: Tampilkan loading saat fetch data
4. **Debouncing**: Untuk autocomplete, gunakan debounce 300-500ms
5. **Validation**: Validasi input sebelum call API

## 📊 API Limits (Test Environment)

| Resource               | Limit      |
| ---------------------- | ---------- |
| Transactions/second    | 10         |
| Transactions/month     | 2,000      |
| Token expiry           | 30 minutes |
| Max results per search | 250        |

## 🔐 Security Best Practices

1. ✅ **Jangan** commit file `.env` ke Git
2. ✅ **Gunakan** environment variables
3. ✅ **Simpan** credentials dengan aman
4. ✅ **Rotate** credentials secara berkala
5. ✅ **Monitor** usage di dashboard Amadeus

## 📚 Resources

- [Amadeus API Documentation](https://developers.amadeus.com/self-service)
- [Flight Offers Search API](https://developers.amadeus.com/self-service/category/air/api-doc/flight-offers-search)
- [API Reference](https://developers.amadeus.com/self-service/apis-docs)
- [Community Forum](https://developers.amadeus.com/support)

## 🆘 Support

Jika mengalami masalah dengan API:

1. Cek [FAQ](https://developers.amadeus.com/support/faq)
2. Baca [Documentation](https://developers.amadeus.com/self-service)
3. Visit [Community Forum](https://developers.amadeus.com/support)
4. Contact Amadeus Support

---

**Selamat mengembangkan aplikasi! ✈️**
