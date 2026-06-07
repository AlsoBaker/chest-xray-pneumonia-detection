# ============================================================
# model_utils.py
# Handles model loading, inference, and Grad-CAM generation
# ============================================================

import os
import json
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.models import load_model
from huggingface_hub import hf_hub_download
import base64

# ── Load model + threshold once at startup ─────────────────
BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
THRESHOLD_PATH = os.path.join(BASE_DIR, "optimal_threshold.json")

print("Loading model from Hugging Face Hub...")
MODEL_PATH = hf_hub_download(
    repo_id="vijayesh684/chest-xray-densenet121",
    filename="best_model_phase2.keras"
)
model = load_model(MODEL_PATH)
print("✓ Model loaded")

with open(THRESHOLD_PATH) as f:
    THRESHOLD = json.load(f)["threshold"]
print(f"✓ Threshold loaded: {THRESHOLD:.4f}")

IMG_SIZE = 224

# ── Preprocessing ───────────────────────────────────────────
def preprocess_image(img_bytes):
    """
    Convert raw image bytes → normalized tensor
    Returns: (original_rgb, preprocessed_batch)
    """
    nparr = np.frombuffer(img_bytes, np.uint8)
    img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img   = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    original       = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img_normalized = original / 255.0
    img_batch      = np.expand_dims(img_normalized, 0).astype(np.float32)

    return original, img_batch

# ── Inference ───────────────────────────────────────────────
def predict(img_batch):
    """
    Run inference on preprocessed image batch.
    Returns: (score, label, confidence)
    """
    score      = float(model.predict(img_batch, verbose=0)[0][0])
    label      = "PNEUMONIA" if score > THRESHOLD else "NORMAL"
    confidence = score if score > THRESHOLD else 1 - score
    return score, label, confidence

# ── Grad-CAM ────────────────────────────────────────────────
def get_gradcam_heatmap(img_batch):
    """Generate Grad-CAM heatmap for input image."""
    base_model = model.get_layer("densenet121")

    img_tensor = tf.cast(img_batch, tf.float32)

    with tf.GradientTape() as tape:
        conv_outputs = base_model(img_tensor, training=False)
        tape.watch(conv_outputs)
        x             = model.get_layer("global_average_pooling2d")(conv_outputs)
        x             = model.get_layer("batch_normalization")(x, training=False)
        x             = model.get_layer("dense")(x)
        x             = model.get_layer("dropout")(x, training=False)
        predictions   = model.get_layer("dense_1")(x)
        class_channel = predictions[:, 0]

    grads        = tape.gradient(class_channel, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_out     = conv_outputs[0]
    heatmap      = conv_out @ pooled_grads[..., tf.newaxis]
    heatmap      = tf.squeeze(heatmap)
    heatmap      = tf.maximum(heatmap, 0).numpy()

    if heatmap.max() > 0:
        heatmap = heatmap / heatmap.max()

    return heatmap

def overlay_gradcam(original_img, heatmap, alpha=0.4):
    """Overlay heatmap on original image."""
    heatmap_resized = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
    heatmap_uint8   = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    superimposed    = cv2.addWeighted(
        original_img, 1 - alpha,
        heatmap_colored, alpha, 0
    )
    return superimposed

def numpy_to_base64(img_array):
    """Convert numpy image array to base64 string for React."""
    img_bgr    = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    _, buffer  = cv2.imencode(".png", img_bgr)
    b64_string = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/png;base64,{b64_string}"

# ── Main pipeline ───────────────────────────────────────────
def analyze_xray(img_bytes):
    """
    Full pipeline: bytes → prediction + Grad-CAM
    Returns dict with all results for React frontend
    """
    original, img_batch      = preprocess_image(img_bytes)
    score, label, confidence = predict(img_batch)
    heatmap                  = get_gradcam_heatmap(img_batch)
    superimposed             = overlay_gradcam(original, heatmap)

    return {
        "label"      : label,
        "confidence" : round(confidence * 100, 2),
        "score"      : round(score, 4),
        "threshold"  : round(THRESHOLD, 4),
        "original"   : numpy_to_base64(original),
        "gradcam"    : numpy_to_base64(superimposed),
        "metrics"    : {
            "accuracy"   : 90.54,
            "roc_auc"    : 0.9663,
            "sensitivity": 94.62,
            "specificity": 83.76,
            "f1_score"   : 0.9260
        }
    }
