# 🫁 Chest X-Ray Pneumonia Detection

> AI-powered chest X-ray classifier using Transfer Learning (DenseNet121) + Grad-CAM explainability. Built in 7 days.

## 🎯 Results

| Metric | Score |
|--------|-------|
| Test Accuracy | 90.54% |
| ROC-AUC | 0.9663 |
| Sensitivity (Recall) | 94.62% |
| Specificity | 83.76% |
| F1 Score | 0.9260 |
| Precision | 90.66% |

## 🔬 What is Grad-CAM?

Grad-CAM highlights the regions of the X-ray the model focuses on when making predictions.
- 🔴 Red/Yellow → High attention (where pneumonia is detected)
- 🔵 Blue → Low attention

This makes the model **explainable** — critical for medical AI.

## 🏗️ Model Architecture
Input (224×224 RGB)
↓
DenseNet121 (pretrained on ImageNet, fine-tuned on X-rays)
↓
GlobalAveragePooling2D
↓
Dense(256, ReLU) + Dropout(0.4)
↓
Dense(1, Sigmoid) → Normal / Pneumonia

## 📊 Dataset

- **Source:** [Kaggle Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia)
- **Total images:** 5,863
- **Classes:** NORMAL (1,341) vs PNEUMONIA (3,875)
- **Challenge:** 3x class imbalance handled with class weights

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Model training | TensorFlow, Keras, Google Colab (T4 GPU) |
| Base model | DenseNet121 (ImageNet pretrained) |
| Explainability | Grad-CAM |
| Backend API | Flask, Python |
| Frontend | React, Vite |

## 🚀 Run Locally

### Prerequisites
- Python 3.9+
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
Download `best_model_phase2.keras` from [Hugging Face](https://huggingface.co/) and place in `backend/`

## 📁 Project Structure
medical_ai_app/
├── backend/
│   ├── app.py                    # Flask REST API
│   ├── model_utils.py            # Inference + Grad-CAM pipeline
│   └── requirements.txt          # Python dependencies
├── frontend/
│   └── src/
│       ├── App.jsx               # Main React component
│       └── index.css             # Styles
└── README.md

## 🔭 Training Pipeline
Day 1 → Data preprocessing + augmentation
Day 2 → Transfer learning (frozen base, train head)
Day 3 → Fine-tuning (unfreeze top 50 layers)
Day 4 → Grad-CAM implementation
Day 5 → Full evaluation (ROC, PR curves, confusion matrix)
Day 6 → Flask API + React frontend
Day 7 → GitHub + deployment

## ⚠️ Disclaimer

For research and educational purposes only.
Not a substitute for professional medical diagnosis.

## 👨‍💻 Author

**Vijayesh Thiyagarajan**  
B.Tech Robotics & AI, SASTRA University

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/vijayesh-thiyagarajan-8bb758356)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github)](https://github.com/AlsoBaker)