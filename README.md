# Welding AI App 2.0

This project now has an API-first architecture:

- `backend/mobilex_main.py`: one-command Mobile X server (recommended)
- `mobile_next/`: highly interactive mobile-first PWA frontend
- `backend/`: FastAPI inference service + explainability
- `WeldingAI_Technical_Paper.docx`: Research-grade comprehensive white paper
- `mobile_pwa/`: installable mobile web app (recommended easiest path)
- `mobile_app/`: Expo React Native app (mobile-ready)
- `mobile_flutter/`: Flutter mobile app (recommended alternative)
- `frontend/streamlit_app.py`: desktop operator console (optional)

## Quick Start (Recommended New Alternative)

Run a single server that hosts both API and mobile app:

```bash
python -m backend.mobilex_main
```

Open:

- Laptop: `http://127.0.0.1:8010`
- Phone (same Wi-Fi): `http://<your-laptop-ip>:8010`

Install on phone via browser "Add to Home Screen".

## 1) Run backend API

```bash
pip install -r requirements.txt
python -m backend.main
```

API will run on `http://localhost:8000`.

Main endpoints:

- `GET /health`
- `POST /v1/analyze/image?threshold=0.5&explain=true`

## 2) Run mobile app (PWA, easiest)

1. Start backend:

```bash
python -m backend.main
```

2. Open on laptop:

```text
http://127.0.0.1:8000/mobile
```

3. Open on phone (same Wi-Fi):

```text
http://<your-laptop-ip>:8000/mobile
```

4. In browser menu, choose "Add to Home Screen" to install like an app.

## 3) Run mobile app (Expo)

```bash
cd mobile_app
npm install
npx expo start
```

In the app:

- set Backend URL (`http://<your-machine-ip>:8000` for real devices)
- choose image or camera
- analyze and inspect explainability maps and per-class metrics

## 4) Run mobile app (Flutter alternative)

```bash
cd mobile_flutter
flutter pub get
flutter run
```

In Flutter app:

- set Backend URL (`http://<your-machine-ip>:8000` for real devices)
- choose image from camera or gallery
- analyze and inspect explainability maps and per-class metrics

## 3) Explainability fix

Explainability now uses the exact same preprocessing as inference and provides:

- class probability map
- gradient saliency map
- fused explainability map

This resolves prior failures caused by inconsistent input sizing and preprocessing.
# AI-Based-Welding-Defect-Detection
