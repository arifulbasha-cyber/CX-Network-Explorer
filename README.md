# CX Native Explorer

A pure Native Android application written in Kotlin that functions as a cloud-based file explorer (CX Explorer style).

## Features
- **Cloud Only**: No local storage clutter. Starts directly with Google Drive authentication.
- **MX Player Integration**: Automatically generates `.m3u8` playlists from folders so "Next/Previous" buttons work in MX Player.
- **Native Performance**: Built with Kotlin and Coroutines.

## How to Build
1. Clone this repository.
2. Open Android Studio.
3. Select **Open an existing Android Studio project**.
4. Navigate to and select the `android` folder from this repository.
5. Let Gradle sync.
6. Run on your device/emulator.

## Setup
You need to add your Google Cloud Console credentials:
1. Go to `android/app/src/main/res/values/strings.xml` (create if missing).
2. Add your OAuth Client ID (or configure via Firebase/Google Services json if preferred).
