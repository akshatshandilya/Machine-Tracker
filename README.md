# Machine Tracker

Daily Construction Machinery Tracking — React Native + Expo (SDK 57) + TypeScript.
All data is stored on the phone in a local SQLite database. No server, no login, no paid services, no device permissions.

## Run on your computer (optional)
```bash
npm install
npx expo install --fix     # aligns all packages with the Expo SDK
npm run typecheck
npx expo run:android       # needs Android Studio / a connected phone
```

## Build the APK with GitHub Actions
1. Create an empty repository on GitHub (e.g. `machine-tracker`), without a README.
2. In this folder run:
   ```bash
   git init
   git add .
   git commit -m "Machine Tracker"
   git branch -M main
   git remote add origin https://github.com/<your-username>/machine-tracker.git
   git push -u origin main
   ```
3. Open the repository → **Actions** tab → **Build Android APK** (it starts automatically on every push to `main`; you can also press **Run workflow**).
4. When the run turns green (about 10–20 minutes), open it and download **machine-tracker-apk** from the **Artifacts** section. Unzip it to get `app-release.apk`.
5. Copy the APK to your phone and open it. Allow "Install unknown apps" for your file manager or browser when asked.

## Notes
- The APK is signed with a debug key, which is fine for installing on your own phones. For Google Play you need your own release keystore (EAS Build or a signed Gradle config).
- Change `android.package` in `app.json` (default `com.machinetracker.app`) before publishing to Play Store.
- Data lives only on each phone. Use **Export to Excel** to keep copies.
