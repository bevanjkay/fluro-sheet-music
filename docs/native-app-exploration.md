# Native App Exploration (iOS, iPadOS, Android)

## Summary
- Recommended first approach: **Capacitor wrapper** around the existing Nuxt app.
- Reason: current app is already client-rendered (`ssr: false`) and uses browser APIs (`localStorage`, `window`) that fit a WebView runtime.
- Outcome: fastest path to App Store / Play Store builds with minimal rewrite risk.

## Architecture options
1. Capacitor (recommended now)
- Reuse existing Nuxt codebase.
- Access native APIs as needed (status bar, splash, filesystem, etc.) via Capacitor plugins.
- Lowest migration cost.

2. Full native rewrite (Swift/Kotlin or React Native/Flutter)
- Better long-term native UX/performance flexibility.
- High rewrite cost and longer delivery timeline.

## App-specific findings
- API usage is remote-only (`https://api.fluro.io`) and token-based auth already exists.
- Session/token persistence currently uses `localStorage` via `@vueuse/core`.
- PDF rendering uses `pdfjs-dist` with a CDN worker URL.

## Mobile risks to address
1. Secure token storage
- Current localStorage token persistence should be replaced for production mobile builds with secure storage (for example, Capacitor Preferences + encrypted strategy, or a secure storage plugin).

2. Offline behavior
- PDF worker and all content are network-dependent; app currently behaves as online-only.
- Decide if that is acceptable for v1 native release.

3. Platform polish
- Add safe-area handling and test orientation behavior on iPad.
- Implement Android back-button behavior for route navigation.

4. Store compliance
- Prepare app icon/splash assets, privacy disclosures, and store metadata.

## Spike setup added in this branch
- `capacitor.config.json`
- `package.json` scripts:
  - `build:web`
  - `cap:add:ios`
  - `cap:add:android`
  - `cap:sync`
  - `cap:ios`
  - `cap:android`
- `cap:sync` sets `CAPACITOR_BUILD=1` so native builds skip Vite legacy bundle generation.
- Capacitor dependencies:
  - `@capacitor/core`
  - `@capacitor/cli`
  - `@capacitor/ios`
  - `@capacitor/android`

## Build and run commands
```bash
npm install
npm run cap:add:ios
npm run cap:add:android
npm run cap:sync
npm run cap:ios
npm run cap:android
```

## Suggested next implementation steps
1. Replace token storage abstraction with secure mobile storage for native builds.
2. Add Capacitor StatusBar/SplashScreen/App plugins and platform-specific UX tweaks.
3. Add CI lanes for iOS archive and Android bundle generation/signing.
