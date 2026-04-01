# Welding AI: Mobile Deployment (APK Generation Guide)

This guide provides the step-by-step process for converting the Welding AI web application into a fully functional Android APK using **Capacitor**.
[x] **Status**: Core integration PERFORMED by Antigravity.

## Prerequisites
1.  **Node.js**: Installed on your machine.
2.  **Android Studio**: Properly installed and configured with at least one Android SDK and the Android Emulator.
3.  **Publicly Accessible Backend**: For the APK to work, your FastAPI backend must be reachable via a public URL (e.g., using `ngrok`) or a static IP on your local network.

---

## Step 1: Install Capacitor
Run the following commands in the root of your `web_app` directory:
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init WeldingAI com.welding.app --web-dir dist
```

## Step 2: Configure API Endpoint
The mobile app cannot use `localhost` to connect to the backend. 
1.  Open `src/config.ts` (newly created).
2.  Update the `API_BASE` to your backend's external IP or domain.
    -   *Example*: `http://192.168.1.15:8000` (Local IP) or `https://your-backend.com` (Hosted).

## Step 3: Build the Web App
Generate the production-ready distribution folder:
```bash
npm run build
```

## Step 4: Add the Android Platform
Initialize the Android project structure:
```bash
npx cap add android
```

## Step 5: Sync & Open in Android Studio
Copy the web assets and update the native project:
```bash
npx cap sync
npx cap open android
```

## Step 6: Generate the APK
In **Android Studio**:
1.  Wait for the Gradle sync to finish.
2.  Go to `Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`.
3.  Once finished, a notification will appear. Click **locate** to find your `app-debug.apk`.

---

## Technical Tips for Mobile
-   **Safe Areas**: The UI already uses CSS environment variables to handle notches on modern phones.
-   **Permissions**: If you plan to use a physical camera for scanning, you must add the camera permission to `AndroidManifest.xml`.
-   **Debugging**: You can debug the web content inside the APK by connecting your phone to your PC and navigating to `chrome://inspect` in Chrome.

**Current Status**: Integration complete. `android` project initialized and synced.
