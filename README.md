# 🫁 Chest X-Ray Pneumonia Detection
> AI-powered chest X-ray classifier using Transfer Learning (EfficientNetB4) + Grad-CAM explainability. Built in 7 days.

🔗 **[Live Demo](https://chest-xray-pneumonia-detection-bice.vercel.app)**

## 🎯 Results

| Metric | Score |
|--------|-------|
| Test Accuracy | **93.59%** |
| ROC-AUC | **0.9834** |
| Sensitivity (Recall) | **94.36%** |
| Specificity | **92.31%** |
| F1 Score | **0.9485** |
| Threshold | 0.7533 |

> Results achieved using **EfficientNetB4** with **Test-Time Augmentation (TTA x10)**

## 🔬 What is Grad-CAM?
Grad-CAM highlights the regions of the X-ray the model focuses on when making predictions.
- 🔴 Red/Yellow → High attention (where pneumonia is detected)
- 🔵 Blue → Low attention

This makes the model **explainable** — critical for medical AI.

## 🏗️ Model Architecture

```
Input (380×380 RGB)
↓
EfficientNetB4 (pretrained on ImageNet, fine-tuned on X-rays)
↓
GlobalAveragePooling2D
↓
BatchNormalization
↓
Dense(256, ReLU) + Dropout(0.5)
↓
Dense(128, ReLU) + Dropout(0.3)
↓
Dense(1, Sigmoid) → Normal / Pneumonia
```

### Why EfficientNetB4 over DenseNet121?
- **Compound scaling** — scales width, depth, and resolution together
- **Native 380×380 resolution** — captures more detail than 224×224
- **Better generalization** on medical imaging tasks
- Consistently outperforms DenseNet121 on this dataset

## 📊 Dataset
- **Source:** [Kaggle Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia)
- **Total images:** 5,863
- **Classes:** NORMAL (1,341) vs PNEUMONIA (3,875)
- **Challenge:** 3x class imbalance handled with class weights

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Model training | TensorFlow, Keras, Google Colab (T4 GPU) |
| Base model | EfficientNetB4 (ImageNet pretrained) |
| Explainability | Grad-CAM |
| Backend API | Flask, Python |
| Frontend | React, Vite |
| Model hosting | Hugging Face Hub |
| Backend hosting | Hugging Face Spaces (Docker) |
| Frontend hosting | Vercel |

## 🚀 Run Locally

### Prerequisites
- Python 3.11+
- Node.js 16+

### Backend
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Model weights
Model is automatically downloaded from [Hugging Face](https://huggingface.co/vijayesh684/chest-xray-densenet121) on backend startup — no manual download needed.

## 📁 Project Structure

```
medical_ai_app/
├── backend/
│   ├── app.py                    # Flask REST API (lazy model loading)
│   ├── model_utils.py            # Inference + Grad-CAM pipeline
│   ├── download_model.py         # HF Hub model downloader
│   ├── optimal_threshold.json    # Optimal classification threshold
│   └── requirements.txt          # Python dependencies
├── frontend/
│   └── src/
│       ├── App.jsx               # Main React component
│       └── index.css             # Styles
└── README.md
```

## 🔭 Training Pipeline

```
Day 1 → Data preprocessing + augmentation
Day 2 → Transfer learning (frozen base, train head)
Day 3 → Fine-tuning (unfreeze top 100 layers, lr=5e-6)
Day 4 → Grad-CAM implementation
Day 5 → Full evaluation (ROC, PR curves, confusion matrix) + TTA
Day 6 → Flask API + React frontend
Day 7 → GitHub + deployment (HF Spaces + Vercel)
```

### Two-Phase Training Strategy
- **Phase 1:** Train head only (base frozen) with `lr=1e-3` for 10 epochs
- **Phase 2:** Fine-tune top 100 layers of EfficientNetB4 with `lr=5e-6` for 20 epochs
- **Early stopping** with patience=6 on validation AUC
- **Test-Time Augmentation (TTA x10)** applied at inference for +1% accuracy boost

## ⚠️ Disclaimer
For research and educational purposes only.  
Not a substitute for professional medical diagnosis.

## 👨‍💻 Author

**Vijayesh Thiyagarajan**  
B.Tech Robotics & AI, SASTRA University

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/vijayesh-thiyagarajan-8bb758356)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github)](https://github.com/AlsoBaker)
