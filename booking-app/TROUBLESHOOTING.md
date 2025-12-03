# 🔧 Troubleshooting Guide

Dokumen ini berisi solusi untuk masalah-masalah umum yang mungkin terjadi.

## 🚨 Installation Issues

### Error: `npm install` gagal

**Solusi 1**: Clear cache

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solusi 2**: Gunakan Node.js LTS version

- Download dari [nodejs.org](https://nodejs.org)
- Install Node.js 18.x atau 20.x

**Solusi 3**: Check disk space

- Pastikan ada cukup ruang di hard drive

### Error: Tailwind CSS tidak berfungsi

**Gejala**: Tidak ada styling, halaman putih polos

**Solusi**:

1. Restart development server (Ctrl+C, lalu `npm start`)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check file `postcss.config.js` ada dan benar
4. Verify `@tailwind` directives ada di `index.css`

## 🔑 API Issues

### Error: "Invalid Client" / "Unauthorized"

**Penyebab**: Credentials Amadeus salah atau tidak ter-set

**Solusi**:

1. Check file `.env` exists di root folder
2. Pastikan format benar:

```env
REACT_APP_AMADEUS_CLIENT_ID=your_actual_id
REACT_APP_AMADEUS_CLIENT_SECRET=your_actual_secret
```

3. **NO QUOTES** di sekitar values
4. **NO SPACES** sebelum atau sesudah =
5. Restart server setelah update .env

**Verify credentials**:

- Login ke [Amadeus Dashboard](https://developers.amadeus.com/my-apps)
- Check Client ID dan Secret
- Copy-paste langsung (hindari typo)

### Error: "Rate Limit Exceeded"

**Penyebab**: Terlalu banyak request dalam waktu singkat

**Solusi**:

1. Tunggu 1 menit
2. Untuk development: Kurangi frekuensi testing
3. Implement debouncing untuk autocomplete
4. Cache hasil search

**Prevention**:

```javascript
// Contoh debouncing
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
```

### Error: "No flights found"

**Penyebab**: Route tidak ada atau parameter salah

**Solusi**:

1. **Check IATA codes** (harus 3 huruf):

   - ✅ Benar: `JKT`, `DPS`, `CGK`
   - ❌ Salah: `Jakarta`, `Bali`, `jkt`

2. **Gunakan routes populer** untuk testing:

   - JKT → DPS (Jakarta - Bali)
   - JKT → SUB (Jakarta - Surabaya)
   - CGK → SIN (Jakarta - Singapore)

3. **Check tanggal**:

   - Tidak boleh di masa lalu
   - Test API: max 330 hari ke depan
   - Format: YYYY-MM-DD

4. **Test dengan cURL**:

```bash
curl "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=JKT&destinationLocationCode=DPS&departureDate=2024-12-20&adults=1" \
-H "Authorization: Bearer YOUR_TOKEN"
```

### Error: Token expired

**Gejala**: API call gagal setelah beberapa waktu

**Solusi**: Service sudah handle auto-refresh, tapi jika masih error:

1. Restart aplikasi
2. Check system time/date correct
3. Clear browser storage

## 💻 Development Server Issues

### Error: Port 3000 already in use

**Solusi 1**: Kill process di port 3000

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Solusi 2**: Gunakan port lain

```bash
PORT=3001 npm start
```

### Error: Module not found

**Gejala**: `Cannot find module 'xyz'`

**Solusi**:

```bash
npm install
```

Jika masih error:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Browser tidak auto-reload

**Solusi**:

1. Restart development server
2. Check browser console untuk errors
3. Hard refresh (Ctrl+Shift+R)
4. Try different browser

## 🎨 Styling Issues

### Tailwind classes tidak work

**Check list**:

- [ ] `postcss.config.js` ada dan benar
- [ ] `tailwind.config.js` ada
- [ ] `index.css` punya `@tailwind` directives
- [ ] Server sudah di-restart
- [ ] Browser cache sudah di-clear

**Test**: Add class `bg-red-500` ke element. Jika tidak merah, Tailwind belum loaded.

### Custom animations tidak berfungsi

**Check**: Verify `tailwind.config.js` punya animations:

```javascript
extend: {
  animation: {
    'fade-in': 'fadeIn 0.5s ease-in-out',
    // ...
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    // ...
  }
}
```

## 📱 Responsive Issues

### Layout broken di mobile

**Debug**:

1. Open Chrome DevTools (F12)
2. Click device icon (Ctrl+Shift+M)
3. Test different screen sizes
4. Check for:
   - Overflow
   - Fixed widths
   - Missing responsive classes

**Common fixes**:

- Use `md:`, `lg:` prefixes
- Use `flex-col md:flex-row`
- Use `w-full md:w-auto`

### Text terpotong

**Solusi**:

- Add `overflow-hidden`
- Use `text-ellipsis`
- Use `break-words`
- Adjust container width

## 🌐 Browser Compatibility

### Fitur tidak work di browser tertentu

**Support**:

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Fix untuk older browsers**:

1. Check [caniuse.com](https://caniuse.com) untuk feature support
2. Add polyfills jika perlu
3. Use Babel transpilation

### Cookies/Storage issues

**Solusi**:

1. Enable cookies di browser settings
2. Check privacy settings
3. Try incognito mode
4. Clear all browser data

## 🔍 Debugging Tips

### Enable verbose logging

Di `amadeusService.js`, uncomment console.logs:

```javascript
console.log("Request:", params);
console.log("Response:", response.data);
```

### React DevTools

1. Install [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
2. Open DevTools → Components
3. Inspect component state/props

### Network monitoring

1. Open DevTools → Network tab
2. Filter: XHR
3. Check API calls:
   - Status codes
   - Response times
   - Payloads

## 🚀 Performance Issues

### App loading lambat

**Optimizations**:

1. Code splitting:

```javascript
const SearchFlight = lazy(() => import("./pages/SearchFlight"));
```

2. Image optimization:

   - Compress images
   - Use WebP format
   - Lazy load images

3. Memoization:

```javascript
const expensiveValue = useMemo(() => computeExpensive(data), [data]);
```

### API calls terlalu banyak

**Solutions**:

1. Debounce autocomplete (300-500ms)
2. Cache search results
3. Limit autocomplete results
4. Use pagination

## 📦 Build Issues

### `npm run build` gagal

**Check**:

1. All imports correct
2. No TypeScript errors (if using TS)
3. Environment variables set
4. Enough disk space

**Common errors**:

- Missing dependencies: `npm install`
- Syntax errors: Check console
- Memory issues: Increase Node memory:

```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Build sukses tapi production tidak work

**Check**:

1. Environment variables set di hosting
2. API URL correct (production, not test)
3. HTTPS enabled
4. CORS configured

## 🆘 Getting Help

Jika masih bermasalah:

1. **Check console**:

   - Browser console (F12)
   - Terminal output
   - Network tab

2. **Dokumentasi**:

   - [React Docs](https://react.dev)
   - [Tailwind Docs](https://tailwindcss.com)
   - [Amadeus Docs](https://developers.amadeus.com)

3. **Community**:

   - Stack Overflow
   - Reddit r/reactjs
   - Amadeus Developer Forum

4. **Search error message**:
   - Copy exact error message
   - Google it
   - Check GitHub issues

## 📋 Diagnostic Checklist

Run through ini jika ada masalah:

- [ ] Node.js version correct (18+)
- [ ] `npm install` completed successfully
- [ ] `.env` file exists dengan correct credentials
- [ ] Development server running (`npm start`)
- [ ] No errors di browser console
- [ ] No errors di terminal
- [ ] Internet connection working
- [ ] Amadeus API credentials valid
- [ ] API quota tidak exceeded

## 💡 Pro Tips

1. **Always check console first** - 90% errors ada di console
2. **Read error messages** - Biasanya sudah explain masalahnya
3. **Google is your friend** - Copy error message → Google
4. **Clear cache** - When in doubt, clear everything
5. **Restart everything** - Server, browser, even computer
6. **Version control** - Git commit sering, rollback jika perlu

---

**Masih ada masalah? Check README.md atau AMADEUS_SETUP.md untuk info lebih lanjut!**
