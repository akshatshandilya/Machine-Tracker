# Machine Tracker (MachTrack)

Daily Construction Machinery Tracking — React Native + Expo (SDK 54) + TypeScript.
Offline-first: all data is stored on the device (AsyncStorage). No backend, no paid services, no device permissions.

## Build the APK with GitHub Actions
1. Create a new GitHub repo and push this folder to it (`main` branch).
2. Open the repo → **Actions** → *Build Android APK* (runs automatically on push, or press **Run workflow**).
3. When it finishes, open the run and download the **MachineTracker-apk** artifact, unzip, install `MachineTracker.apk`.

The release APK is signed with the default Expo debug key — fine for in-house installs. For Play Store publishing, add your own keystore later.

## Run locally
```bash
npm install
npx expo start        # scan the QR with Expo Go, or press "a" for an Android emulator
```

## Structure
```
App.tsx                 root, navigation stack, Android back handling, splash
src/data/               types, business logic (status, history, sorting), AsyncStorage store
src/screens/            Projects, MachineListing, ManageMachinery, MachineDetails, Readings
src/sheets/             bottom sheets (add project, select machinery, reading form, export, confirms)
src/components/         Header, Logo (approved SVG), UI primitives, toast/sheet provider
src/splash/             opening animation (+ route tracker)
src/utils/              formatting, Excel export
assets/                 brand assets (logo, icons)
```
