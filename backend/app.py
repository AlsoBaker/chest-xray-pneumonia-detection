# ============================================================
# app.py — Flask API server
# ============================================================

import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Lazy load — model loads on first request, not at startup
model_loaded = False
analyze_xray = None

def load_model_lazy():
    global model_loaded, analyze_xray
    if not model_loaded:
        from model_utils import analyze_xray as _analyze
        analyze_xray = _analyze
        model_loaded = True

@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok", "model": "DenseNet121"}

@app.route("/predict", methods=["POST"])
def predict():
    load_model_lazy()

    if "file" not in request.files:
        return {"error": "No file uploaded"}, 400

    file = request.files["file"]

    if file.filename == "":
        return {"error": "Empty filename"}, 400

    allowed = {"png", "jpg", "jpeg"}
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        return {"error": "Only PNG/JPG allowed"}, 400

    try:
        img_bytes = file.read()
        result = analyze_xray(img_bytes)
        return result
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)