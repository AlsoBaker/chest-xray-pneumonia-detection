# ============================================================
# app.py — Flask API server
# ============================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from model_utils import analyze_xray

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "model": "DenseNet121"})

@app.route("/predict", methods=["POST"])
def predict():
    """
    POST /predict
    Body: multipart/form-data with 'file' field
    Returns: JSON with prediction + Grad-CAM images
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Check file type
    allowed = {"png", "jpg", "jpeg"}
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        return jsonify({"error": "Only PNG/JPG allowed"}), 400

    try:
        img_bytes = file.read()
        result    = analyze_xray(img_bytes)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)