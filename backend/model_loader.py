from functools import lru_cache

import torch
import segmentation_models_pytorch as smp

IMG_HEIGHT = 128
IMG_WIDTH = 800

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def load_model(model_path, encoder_name="mobilenet_v2", classes=4):
    """
    Research-grade model loader with support for various backbones and Dropout layers.
    Recommended backbones: 'efficientnet-b7', 'mit_b3', 'resnet101'.
    """
    model = smp.Unet(
        encoder_name=encoder_name,
        encoder_weights=None,
        in_channels=3,
        classes=classes,
        decoder_use_batchnorm=True,
    )
    # Ensure Dropout is active even in eval() for MC Inference if needed
    # (implemented in the inference loop).
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()
    return model


@lru_cache(maxsize=2)
def load_model_cached(model_path):
    return load_model(model_path)
