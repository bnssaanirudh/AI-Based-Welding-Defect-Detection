import base64
import logging
import os
from io import BytesIO

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from PIL import Image

from backend.explainability import generate_explainability
from backend.inference import run_inference
from backend.model_loader import device, load_model_cached
from backend.utils import IMG_HEIGHT, IMG_WIDTH, prepare_tensor_from_bgr

logger = logging.getLogger("weldvision_mobilex")
logging.basicConfig(level=logging.INFO)

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_PATH = os.path.join(ROOT_DIR, "model", "steel_segmentation_fast_model.pth")
WEB_DIR = os.path.join(ROOT_DIR, "mobile_next")

app = FastAPI(title="WeldVision Mobile X", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/assets", StaticFiles(directory=WEB_DIR), name="assets")


def _load_model():
    return load_model_cached(MODEL_PATH)


def _read_image(data: bytes):
    np_buf = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(np_buf, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image payload.")
    return img


def _rgb_to_jpeg_b64(image_rgb):
    pil_img = Image.fromarray(image_rgb.astype(np.uint8), mode="RGB")
    buf = BytesIO()
    pil_img.save(buf, format="JPEG", quality=92)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def _gray_to_png_b64(gray):
    img = Image.fromarray((np.clip(gray, 0.0, 1.0) * 255).astype(np.uint8), mode="L")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


@app.get("/")
def home():
    return FileResponse(os.path.join(WEB_DIR, "index.html"))


@app.get("/manifest.webmanifest")
def manifest():
    return FileResponse(os.path.join(WEB_DIR, "manifest.webmanifest"))


@app.get("/sw.js")
def sw():
    return FileResponse(os.path.join(WEB_DIR, "sw.js"))


@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)


@app.get("/health")
def health():
    return {"status": "ok", "device": str(device), "input_shape": f"{IMG_HEIGHT}x{IMG_WIDTH}"}


@app.post("/v1/analyze/image")
async def analyze_image(
    file: UploadFile = File(...),
    threshold: float = Query(default=0.5, ge=0.05, le=0.95),
    explain: bool = Query(default=True),
):
    try:
        raw = await file.read()
        if not raw:
            raise HTTPException(status_code=400, detail="Empty image file.")
        image_bgr = _read_image(raw)
        model = _load_model()
        result = run_inference(model, image_bgr, threshold=threshold)

        payload = {
            "summary": {
                "top_class_id": result["top_class_id"],
                "top_label": result["top_label"],
                "top_confidence": result["top_confidence"],
                "severity": result["severity"],
            },
            "class_metrics": result["class_metrics"],
            "images": {"overlay_jpeg_base64": _rgb_to_jpeg_b64(result["overlay_rgb"])},
        }

        if explain:
            try:
                tensor = prepare_tensor_from_bgr(image_bgr, device=device)
                maps = generate_explainability(model, tensor, result["top_class_id"])
                payload["explainability"] = {
                    "prob_map_png_base64": _gray_to_png_b64(maps["prob_map"]),
                    "grad_map_png_base64": _gray_to_png_b64(maps["grad_map"]),
                    "fused_map_png_base64": _gray_to_png_b64(maps["fused_map"]),
                }
            except Exception as xai_err:
                logger.exception("XAI failed: %s", xai_err)
                payload["explainability_error"] = str(xai_err)

        return payload
    except HTTPException:
        raise
    except Exception as err:
        logger.exception("analyze failed: %s", err)
        raise HTTPException(status_code=500, detail=f"Inference pipeline failed: {err}")
