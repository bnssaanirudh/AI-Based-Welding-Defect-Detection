import cv2
import numpy as np
import torch

IMG_HEIGHT = 128
IMG_WIDTH = 800


def preprocess_image(image_bgr):
    image_resized = cv2.resize(image_bgr, (IMG_WIDTH, IMG_HEIGHT))
    image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
    image_norm = image_rgb.astype(np.float32) / 255.0
    return image_rgb, image_norm


def prepare_tensor_from_bgr(image_bgr, device):
    _, image_norm = preprocess_image(image_bgr)
    tensor = torch.from_numpy(image_norm).permute(2, 0, 1).unsqueeze(0).float()
    return tensor.to(device)


def overlay_mask(image_rgb, mask, color=(255, 0, 0), alpha=0.45):
    overlay = image_rgb.copy()
    overlay[mask] = color
    blended = cv2.addWeighted(image_rgb, 1 - alpha, overlay, alpha, 0)
    return blended


def mask_to_color(mask_map):
    palette = np.array(
        [
            [0, 0, 0],
            [255, 82, 82],
            [255, 193, 7],
            [33, 150, 243],
            [76, 175, 80],
        ],
        dtype=np.uint8,
    )
    safe_idx = np.clip(mask_map.astype(np.int32), 0, len(palette) - 1)
    return palette[safe_idx]
