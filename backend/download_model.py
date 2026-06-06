# ============================================================
# download_model.py
# Downloads model from Hugging Face on server startup
# Render doesn't store large files — we fetch from HF
# ============================================================

import os
from huggingface_hub import hf_hub_download

MODEL_PATH = "best_model_phase2.keras"

def download_if_missing():
    if not os.path.exists(MODEL_PATH):
        print("Downloading model from Hugging Face...")
        hf_hub_download(
            repo_id="vijayesh684/chest-xray-densenet121",
            filename="best_model_phase2.keras",
            local_dir="."
        )
        print("✓ Model downloaded!")
    else:
        print("✓ Model already exists")

if __name__ == "__main__":
    download_if_missing()