import requests
import numpy as np
import cv2
import os
import json

# API Configuration
BASE_URL = "http://localhost:8000/v1"
TEST_IMG_PATH = "research_test_weld.jpg"
TEST_MASK_PATH = "research_test_mask.png"

# Test Credentials (Update if needed)
EMAIL = "test@example.com"
PASSWORD = "password" # Assuming a default password for the test account

def get_token():
    """Logs in and retrieves a Bearer token."""
    print(f"Logging in as {EMAIL}...")
    url = f"{BASE_URL}/auth/login"
    data = {"username": EMAIL, "password": PASSWORD}
    try:
        response = requests.post(url, data=data)
        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Connection error during login: {e}")
        return None

def create_synthetic_test_data():
    """Generates a synthetic welding image with a simulated defect for research testing."""
    print("Generating synthetic research data (128x800)...")
    
    # 1. Generate Image (Simulated Steel Surface)
    # Grainy gray texture
    img = np.full((128, 800, 3), 120, dtype=np.uint8)
    noise = np.random.normal(0, 15, (128, 800, 3)).astype(np.uint8)
    img = cv2.add(img, noise)
    
    # Add a horizontal "weld line"
    cv2.line(img, (0, 64), (800, 64), (100, 100, 100), 10)
    
    # Add a "Defect" (a dark patch)
    cv2.rectangle(img, (300, 50), (350, 80), (40, 40, 40), -1)
    cv2.imwrite(TEST_IMG_PATH, img)
    
    # 2. Generate Ground Truth Mask (Simple binary mask for the defect)
    mask = np.zeros((128, 800), dtype=np.uint8)
    cv2.rectangle(mask, (300, 50), (350, 80), 1, -1) # Class 1
    cv2.imwrite(TEST_MASK_PATH, mask)
    
    print(f"Created {TEST_IMG_PATH} and {TEST_MASK_PATH}")

def test_bayesian_inference(token):
    """Tests the new MC Dropout uncertainty feature."""
    print("\n--- Testing Bayesian Inference (MC Dropout) ---")
    url = f"{BASE_URL}/analyze/image?use_mc_dropout=true&mc_iterations=10"
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    with open(TEST_IMG_PATH, 'rb') as f:
        files = {'file': f}
        try:
            response = requests.post(url, files=files, headers=headers)
            if response.status_code == 200:
                data = response.json()
                diag = data.get("research_diagnostics", {})
                print(f"Status: Success")
                print(f"Uncertainty Score (Avg Variance): {diag.get('uncertainty_score')}")
                print(f"MC Iterations: {diag.get('mc_iterations')}")
                print(f"Top Label: {data['summary']['top_label']}")
                if "uncertainty_png_base64" in data["images"]:
                     print("Uncertainty Heatmap received!")
            else:
                print(f"Failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error connecting to API: {e}")

def test_research_validation(token):
    """Tests the new mIoU/Dice validation endpoint."""
    print("\n--- Testing Research Validation (mIoU / Dice) ---")
    url = f"{BASE_URL}/research/validate"
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    with open(TEST_IMG_PATH, 'rb') as img_f, open(TEST_MASK_PATH, 'rb') as mask_f:
        files = {
            'image': img_f,
            'mask': mask_f
        }
        try:
            response = requests.post(url, files=files, headers=headers)
            if response.status_code == 200:
                data = response.json()
                metrics = data.get("metrics", {})
                print(f"mIoU: {round(metrics.get('miou', 0), 4)}")
                print(f"Mean Dice: {round(metrics.get('mean_dice', 0), 4)}")
                print(f"Class IoUs: {metrics.get('class_ious')}")
            else:
                print(f"Failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error connecting to API: {e}")

if __name__ == "__main__":
    create_synthetic_test_data()
    print("\nNote: Ensure the API server is running (python -m backend.main)")
    token = get_token()
    test_bayesian_inference(token)
    test_research_validation(token)
