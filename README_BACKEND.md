# Flight Booking App - Django Backend + React Frontend

## 🏗️ Architecture

```
React Frontend (Port 3000)
         ↓
Django Backend (Port 8000) ← Credentials AMAN di sini!
         ↓
Amadeus API
```

## 📁 Project Structure

```
UAS_VictorMarlino/
├── booking-app/          # React Frontend
│   ├── src/
│   │   └── services/
│   │       └── amadeusService.js  # Updated to use Django backend
│   ├── .env              # Backend URL configuration
│   └── package.json
│
└── backend/
    └── bookingapp/       # Django Backend
        ├── api/          # API app
        │   ├── amadeus_service.py  # Amadeus API client
        │   ├── views.py            # API endpoints
        │   └── urls.py             # URL routing
        ├── bookingapp/   # Django project
        │   ├── settings.py         # Configuration
        │   └── urls.py
        ├── .env          # Amadeus credentials (SECURE!)
        ├── requirements.txt
        └── manage.py
```

## 🚀 Setup Instructions

### 1. Setup Django Backend

```bash
# Navigate to backend directory
cd backend/bookingapp

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Django server
python manage.py runserver
```

Django backend akan berjalan di: **http://localhost:8000**

### 2. Setup React Frontend

```bash
# Open new terminal
cd booking-app

# Install dependencies (jika belum)
npm install

# Start React development server
npm start
```

React frontend akan berjalan di: **http://localhost:3000**

## 🔌 API Endpoints

Django backend menyediakan endpoints berikut:

| Method | Endpoint                      | Description          |
| ------ | ----------------------------- | -------------------- |
| GET    | `/api/health/`                | Health check         |
| GET    | `/api/flights/search/`        | Search flights       |
| GET    | `/api/locations/search/`      | Search locations     |
| POST   | `/api/flights/confirm-price/` | Confirm flight price |

### Example API Calls

**Search Flights:**

```
GET http://localhost:8000/api/flights/search/?origin=JKT&destination=DPS&departureDate=2025-12-20&adults=1
```

**Search Locations:**

```
GET http://localhost:8000/api/locations/search/?keyword=jakarta
```

**Confirm Price:**

```
POST http://localhost:8000/api/flights/confirm-price/
Content-Type: application/json

{
  "flightOffer": { ... }
}
```

## 🔐 Security Benefits

### ❌ Before (React Only):

- API credentials exposed di browser
- Siapa saja bisa lihat di DevTools
- Bisa dicuri dan disalahgunakan

### ✅ After (Django + React):

- Credentials aman di backend (.env file)
- Tidak pernah dikirim ke browser
- Backend sebagai proxy ke Amadeus API

## 🧪 Testing

### 1. Test Django Backend

```bash
# Test health check
curl http://localhost:8000/api/health/

# Expected response:
# {"status":"healthy","message":"Flight Booking API is running"}
```

### 2. Test React Integration

1. Buka React app: http://localhost:3000
2. Coba search penerbangan
3. Check browser console - tidak ada error
4. Verify API calls ke Django backend (bukan langsung ke Amadeus)

## 📝 Configuration Files

### Backend: `.env`

```env
AMADEUS_CLIENT_ID=your_client_id
AMADEUS_CLIENT_SECRET=your_client_secret
AMADEUS_BASE_URL=https://test.api.amadeus.com
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend: `.env`

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

## 🐛 Troubleshooting

### Backend Error: "ModuleNotFoundError"

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### CORS Error in Browser

- Pastikan Django backend sudah running
- Check `CORS_ALLOWED_ORIGINS` di backend settings.py
- Restart Django server

### React Can't Connect to Backend

- Verify Django server running di port 8000
- Check `.env` file di React app
- Restart React development server: `npm start`

## 📊 How It Works

### Old Flow (Insecure):

```
User → React → Amadeus API
              (credentials exposed!)
```

### New Flow (Secure):

```
User → React → Django → Amadeus API
              (credentials safe!)
```

## 🎯 Next Steps (Optional)

1. **Add Caching** - Cache flight search results
2. **Rate Limiting** - Limit API calls per user
3. **User Authentication** - Add login/register
4. **Database** - Store booking history
5. **Deployment** - Deploy to production

## 📞 Support

Jika ada error:

1. Check Django server logs
2. Check browser console
3. Verify .env files
4. Make sure both servers running

---

**Author:** Victor Marlino  
**NIM:** 23502410024  
**Project:** UAS Web Development - Flight Booking App
