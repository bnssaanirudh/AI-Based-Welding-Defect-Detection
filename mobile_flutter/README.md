# Welding AI Flutter App

## Prerequisites

- Flutter SDK installed
- Android Studio or Xcode
- Backend running at `http://<your-ip>:8000`

## Run

```bash
cd mobile_flutter
flutter pub get
flutter run
```

## Notes

- For real devices, do not use `127.0.0.1`; use your laptop LAN IP.
- API endpoint used by app: `POST /v1/analyze/image`
- In-app controls:
  - backend URL
  - threshold
  - explainability toggle
  - camera/gallery source
