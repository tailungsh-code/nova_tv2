# NOVA TV — Free-to-Air Live Television Streaming Platform

NOVA TV is a lightweight, responsive television streaming web application and Progressive Web App (PWA) built with React, TypeScript, Tailwind CSS, and HLS.js. It is designed to run cleanly as a static site (for GitHub Pages, Netlify, or Cloudflare Pages) and inside Android WebView containers.

> **Content & Licensing Notice**
> The starter channels included in `channels.json` are clearly marked **demonstration placeholders** with non-operational `.invalid` URLs. NOVA TV is intended strictly for legally licensed, public-access, or broadcaster-authorized free-to-air television streams.

---

## Key Features

- **Home & Discovery**: Featured hero carousel, Continue Watching, Recently Added, Popular, Favorites, Recommended, and dynamic category carousels.
- **Live TV & Dynamic Categories**: Instant debounced search, category filters, alphabetical/recent/popular sorting, and favorites filtering.
- **Adaptive HLS Video Player**:
  - Powered by **HLS.js** (`.m3u8`) with native Safari/iOS HLS & MP4 fallback.
  - Automatic and manual quality switching when multi-bitrate manifests are present.
  - Live vs. VOD detection (never shows misleading seek bars on live broadcasts).
  - Fit, Fill, and Original aspect ratio modes, Fullscreen, Picture-in-Picture (where supported), desktop keyboard shortcuts, double-tap VOD seek, stream reconnection, and a built-in **Local Diagnostic Test Signal** for verifying controls offline.
- **External Channel Management System**:
  - Add, edit, delete, activate/deactivate, reorder, and recategorize channels without editing source code.
  - Live logo preview and real **Stream URL Tester** (checks HTTP reachability & `#EXTM3U` manifest validity).
  - **M3U Playlist Importer** and one-click **Export JSON** / **Export M3U**.
- **Multilingual + RTL**: English, Arabic (`dir="rtl"`), and French, plus Dark (default) and Light themes.
- **Installable PWA**: Service worker offline caching, web app manifest, PNG app icons, and in-app install prompt.

---

## Project Structure

```text
src/
  admin/       Protected Channel Management console, channel form, M3U importer
  components/  Cards, logos, splash screen, skeletons, empty states, PWA prompts
  context/     Global app state, user preferences, theme & RTL sync
  data/        Default external JSON seeds (channels.json, categories.json, settings.json)
  hooks/       usePWAInstall, useOnlineStatus, useDebounce
  i18n/        English, Arabic (RTL), and French dictionaries
  layouts/     Responsive Desktop Sidebar + Mobile Bottom Navigation
  pages/       Home, Live TV, Categories, Favorites, Search, Settings, Info pages
  player/      Adaptive HLS.js + HTML5 VideoPlayer and PlayerPage
  services/    DataProvider interface, LocalDataProvider, FirebaseDataProvider
  types/       TypeScript interfaces
  utils/       M3U parser/exporter, stream tester, capability detection, IndexedDB cache
public/
  data/        Static JSON copies
  images/      Local cinematic thumbnails
  logos/       Local SVG channel logos
  manifest.json, icon.svg, pwa-192x192.png, pwa-512x512.png, pwa-maskable-512x512.png
firestore.rules Ready-to-deploy Firebase Security Rules template
```

---

## Running Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

The production output is generated in `dist/` and uses relative `./` asset paths and `#/` hash routing so it works on any static host or subfolder.

---

## Data Architecture: Local Demo Mode vs. Firebase Cloud

NOVA TV separates channel data from frontend code via `src/services/dataService.ts`.

### 1. Local Demo Mode (Default — No Credentials Needed)
- Loads initial data from `src/data/channels.json`, `src/data/categories.json`, and `src/data/settings.json`.
- Edits made in **Channel Admin** are saved in your browser's **IndexedDB / LocalStorage**.
- Because a static frontend cannot hide administrator passwords securely in JavaScript, Local Demo Mode clearly labels itself as a browser-only sandbox. Use **Export JSON** to download an updated `channels.json` if you host static files directly.

### 2. Connecting Firebase (Firestore + Firebase Authentication)
To manage channels centrally across all devices with real administrator authentication:

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication → Sign-in method → Email/Password** and create your administrator user account.
3. Enable **Cloud Firestore** and deploy the included `firestore.rules` file.
   - Add your admin user's `uid` as a document at `admins/{uid}` in Firestore (or set an `admin: true` custom claim).
4. Copy `.env.example` to `.env` and fill in your public Firebase Web App config (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`), **OR** enter those public web config fields directly inside **Settings → Optional Firebase Connection** in the app UI.
5. Rebuild (`npm run build`) if using `.env`.

---

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Run `npm run build` (or configure a GitHub Actions workflow that runs `npm ci && npm run build` and deploys the `dist/` folder to `gh-pages`).
3. Because NOVA TV uses `base: './'` in `vite.config.ts` and hash routing (`#/live`, `#/watch/...`), it works out of the box on `https://<username>.github.io/<repo-name>/` with zero 404 routing errors.

---

## Converting to an Android App (WebView / APK)

You can package the built `dist/` folder or your hosted HTTPS URL into an Android APK using **Capacitor** or a native Android **WebView** project:

### Option A: Capacitor (Recommended)
1. Build the web app: `npm run build`
2. Initialize Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "NOVA TV" "com.example.novatv" --web-dir dist
   npx cap add android
   npx cap sync android
   npx cap open android
   ```
3. Build a signed APK or App Bundle (`.aab`) in Android Studio.

### Option B: Native Android WebView Checklist
- Enable JavaScript and DOM Storage (`settings.javaScriptEnabled = true`, `settings.domStorageEnabled = true`).
- Allow media playback (`settings.mediaPlaybackRequiresUserGesture = false`).
- Handle hardware Back button presses via `if (webView.canGoBack()) webView.goBack()` — NOVA TV's `#/` hash routing automatically integrates with WebView history.
- Implement `WebChromeClient.onShowCustomView` / `onHideCustomView` to support fullscreen video inside WebView.
