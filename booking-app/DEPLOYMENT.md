# 🚀 Panduan Deployment

Dokumen ini berisi panduan untuk deploy aplikasi Flight Booking ke berbagai platform hosting.

## 📦 Build untuk Production

Sebelum deploy, build aplikasi terlebih dahulu:

```bash
npm run build
```

Ini akan membuat folder `build/` yang berisi file-file production-ready.

## 🌐 Deployment Options

### 1. Vercel (Recommended - Gratis)

Vercel sangat cocok untuk React apps dan mudah di-setup.

#### Setup:

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login ke Vercel:

```bash
vercel login
```

3. Deploy:

```bash
vercel
```

4. Set Environment Variables di Vercel Dashboard:

   - Go to Project Settings
   - Navigate to Environment Variables
   - Add:
     - `REACT_APP_AMADEUS_CLIENT_ID`
     - `REACT_APP_AMADEUS_CLIENT_SECRET`
     - `REACT_APP_AMADEUS_BASE_URL`

5. Redeploy:

```bash
vercel --prod
```

#### Vercel dengan GitHub:

1. Push code ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Vercel akan auto-detect React app
4. Set environment variables
5. Deploy!

### 2. Netlify (Gratis)

#### Via Netlify CLI:

1. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Build app:

```bash
npm run build
```

3. Deploy:

```bash
netlify deploy
```

4. Deploy to production:

```bash
netlify deploy --prod
```

#### Via Netlify Dashboard:

1. Push code ke GitHub
2. Login ke [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Choose your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Set environment variables di Site Settings
7. Deploy!

#### Netlify.toml Configuration:

Buat file `netlify.toml` di root:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

#### Setup:

1. Install gh-pages:

```bash
npm install --save-dev gh-pages
```

2. Update `package.json`:

```json
{
  "homepage": "https://yourusername.github.io/booking-app",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. Deploy:

```bash
npm run deploy
```

**Note**: GitHub Pages tidak mendukung environment variables dengan aman. Tidak recommended untuk production dengan API keys!

### 4. Firebase Hosting

#### Setup:

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login:

```bash
firebase login
```

3. Initialize:

```bash
firebase init hosting
```

Pilih:

- Public directory: `build`
- Single-page app: Yes
- GitHub auto-deploy: Optional

4. Build app:

```bash
npm run build
```

5. Deploy:

```bash
firebase deploy
```

#### Set Environment Variables:

Untuk Firebase, environment variables harus di-set saat build. Buat file `.env.production`:

```env
REACT_APP_AMADEUS_CLIENT_ID=your_prod_client_id
REACT_APP_AMADEUS_CLIENT_SECRET=your_prod_client_secret
REACT_APP_AMADEUS_BASE_URL=https://api.amadeus.com/v2
```

### 5. Heroku

#### Setup:

1. Install Heroku CLI

2. Login:

```bash
heroku login
```

3. Create Heroku app:

```bash
heroku create booking-app-nama-anda
```

4. Add buildpack:

```bash
heroku buildpacks:set mars/create-react-app
```

5. Set environment variables:

```bash
heroku config:set REACT_APP_AMADEUS_CLIENT_ID=your_client_id
heroku config:set REACT_APP_AMADEUS_CLIENT_SECRET=your_client_secret
heroku config:set REACT_APP_AMADEUS_BASE_URL=https://api.amadeus.com/v2
```

6. Deploy:

```bash
git push heroku main
```

## 🔒 Environment Variables untuk Production

Saat deploy ke production, pastikan:

1. **Gunakan Production API URL**:

```env
REACT_APP_AMADEUS_BASE_URL=https://api.amadeus.com/v2
```

2. **Gunakan Production Credentials**:

   - Buat app baru di Amadeus dashboard untuk production
   - Atau upgrade existing app ke production

3. **Jangan hardcode credentials** di code

## ⚙️ Production Checklist

Sebelum deploy ke production:

- [ ] Test semua fitur di local
- [ ] Build tanpa error: `npm run build`
- [ ] Set correct environment variables
- [ ] Gunakan production Amadeus API
- [ ] Enable HTTPS
- [ ] Test di berbagai devices dan browsers
- [ ] Optimize images jika ada
- [ ] Enable error tracking (Sentry, etc)
- [ ] Setup analytics (Google Analytics, etc)
- [ ] Test booking flow end-to-end
- [ ] Backup credentials dengan aman

## 🔍 Testing Production Build Locally

Sebelum deploy, test production build:

1. Build:

```bash
npm run build
```

2. Install serve:

```bash
npm install -g serve
```

3. Serve production build:

```bash
serve -s build
```

4. Open [http://localhost:3000](http://localhost:3000)

## 📊 Monitoring

Setelah deploy, monitor aplikasi:

1. **Amadeus Dashboard**:

   - Check API usage
   - Monitor rate limits
   - Track errors

2. **Hosting Platform**:

   - Monitor bandwidth
   - Check response times
   - View error logs

3. **Optional Tools**:
   - Google Analytics (user behavior)
   - Sentry (error tracking)
   - LogRocket (session replay)

## 🐛 Common Deployment Issues

### 1. "Page not found" on refresh

**Penyebab**: SPA routing issue

**Solusi**:

- Vercel/Netlify: Otomatis handled
- Apache: Add `.htaccess` with rewrite rules
- Nginx: Configure `try_files`

### 2. Environment variables not working

**Penyebab**: Variables tidak di-set di hosting platform

**Solusi**:

- Set variables di hosting dashboard
- Redeploy setelah set variables
- Variable harus prefix `REACT_APP_`

### 3. Build fails

**Penyebab**: Missing dependencies atau errors

**Solusi**:

- Run `npm run build` locally first
- Fix any warnings or errors
- Check Node version compatibility

### 4. API calls fail in production

**Penyebab**:

- Wrong API URL
- CORS issues
- Invalid credentials

**Solusi**:

- Use production API URL
- Check credentials
- Enable CORS di backend jika ada

## 🔄 Continuous Deployment

Setup auto-deploy dengan Git:

### Vercel + GitHub:

1. Connect GitHub repo di Vercel
2. Every push to `main` = auto deploy
3. Set environment variables di Vercel

### Netlify + GitHub:

1. Connect repo di Netlify
2. Configure build settings
3. Every push = auto deploy

## 💰 Cost Estimation

### Free Tier Options:

- **Vercel**: 100GB bandwidth/month, unlimited deploys
- **Netlify**: 100GB bandwidth/month, 300 build minutes
- **Firebase**: 10GB storage, 360MB/day bandwidth
- **GitHub Pages**: Unlimited, tapi tidak cocok untuk apps dengan secrets

### Amadeus API:

- **Test**: Free, 2,000 transactions/month
- **Production**: Pay per use, starts dari $0.0025/transaction

## 🎯 Best Practices

1. **Use CDN**: Hosting platforms biasanya include CDN
2. **Enable Compression**: Gzip/Brotli untuk faster loads
3. **Cache Static Assets**: Set proper cache headers
4. **Lazy Load**: Code splitting untuk faster initial load
5. **Error Boundaries**: Handle errors gracefully
6. **Service Worker**: PWA capabilities untuk offline support

## 📱 PWA Deployment

Aplikasi sudah PWA-ready. Untuk enable:

1. Update `public/manifest.json`
2. Add icons di `public/`
3. Test dengan Lighthouse
4. Deploy

Users bisa "Add to Home Screen" di mobile!

## 🆘 Need Help?

- Vercel: [vercel.com/support](https://vercel.com/support)
- Netlify: [netlify.com/support](https://netlify.com/support)
- Firebase: [firebase.google.com/support](https://firebase.google.com/support)

---

**Happy Deploying! 🚀**
