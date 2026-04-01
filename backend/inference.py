import torch
import numpy as np
from backend.utils import preprocess_image, overlay_mask
from backend.model_loader import device


DEFECT_LABELS = {
    0: "Rolled-in Scale",
    1: "Surface Patch",
    2: "Scratch",
    3: "Inclusion",
}


def _normalize_to_uint8(data):
    clipped = np.clip(data, 0.0, 1.0)
    return (255 * clipped).astype(np.uint8)


def run_inference(model, image_bgr, threshold=0.5, use_tta=True, use_mc_dropout=True, mc_iterations=10):
    """
    Research-grade inference pipeline with Bayesian Uncertainty Quantification.
    """
    image_rgb, image_norm = preprocess_image(image_bgr)
    tensor = torch.tensor(image_norm).permute(2, 0, 1).unsqueeze(0).float().to(device)

    # Enable Dropout for MC Inference if requested
    if use_mc_dropout:
        for m in model.modules():
            if m.__class__.__name__.startswith("Dropout"):
                m.train()
    
    with torch.no_grad():
        all_probs = []
        # Base prediction
        output = model(tensor)
        probs = torch.sigmoid(output)
        all_probs.append(probs)

        # MC Dropout Iterations (Uncertainty Quantification)
        if use_mc_dropout:
            for _ in range(mc_iterations - 1):
                all_probs.append(torch.sigmoid(model(tensor)))
        
        # Test Time Augmentation (TTA)
        if use_tta:
            flipped_tensor = torch.flip(tensor, dims=[3])
            flipped_output = model(flipped_tensor)
            flipped_probs = torch.flip(torch.sigmoid(flipped_output), dims=[3])
            all_probs.append(flipped_probs)

        # Aggregate results (Mean and Variance)
        stack_probs = torch.stack(all_probs)
        mean_probs = stack_probs.mean(dim=0)
        uncertainty_map = stack_probs.var(dim=0) # Pixel-wise variance as uncertainty

        binary_mask = (mean_probs > threshold).float()

    prob_map = mean_probs.squeeze(0).cpu().numpy()
    uncertainty = uncertainty_map.squeeze(0).cpu().numpy()
    mask = binary_mask.squeeze(0).cpu().numpy().astype(np.uint8)
    combined_mask = (mask.sum(axis=0) > 0).astype(np.uint8)

    class_scores = prob_map.mean(axis=(1, 2))
    class_coverage = mask.mean(axis=(1, 2))

    overlay = overlay_mask(image_rgb, combined_mask.astype(bool))
    argmax_mask = np.argmax(prob_map, axis=0) + 1
    argmax_mask[combined_mask == 0] = 0

    class_metrics = []
    for idx, score in enumerate(class_scores.tolist()):
        class_metrics.append(
            {
                "class_id": idx,
                "label": DEFECT_LABELS.get(idx, f"class_{idx}"),
                "confidence": float(score),
                "coverage": float(class_coverage[idx]),
                "uncertainty": float(uncertainty[idx].mean()),
            }
        )

    top_class_idx = int(np.argmax(class_scores))
    top_confidence = float(class_scores[top_class_idx])
    severity = "critical" if top_confidence >= 0.35 else "warning" if top_confidence >= 0.20 else "normal"

    result = {
        "overlay_rgb": overlay,
        "combined_mask": combined_mask,
        "argmax_mask": argmax_mask.astype(np.uint8),
        "class_metrics": class_metrics,
        "top_class_id": top_class_idx,
        "top_label": DEFECT_LABELS.get(top_class_idx, f"class_{top_class_idx}"),
        "top_confidence": top_confidence,
        "severity": severity,
        "prob_maps": prob_map,
        "uncertainty_map": uncertainty,
    }
    return result


def serialize_inference_result(result):
    # Lightweight serializer for HTTP payloads.
    class_metrics = result["class_metrics"]
    return {
        "class_metrics": class_metrics,
        "top_class_id": result["top_class_id"],
        "top_label": result["top_label"],
        "top_confidence": result["top_confidence"],
        "severity": result["severity"],
        "combined_mask": result["combined_mask"].tolist(),
        "argmax_mask": result["argmax_mask"].tolist(),
        "overlay_rgb": _normalize_to_uint8(result["overlay_rgb"] / 255.0).tolist(),
    }
