import { useState, useRef } from "react"
import axios from "axios"
import "./index.css"

// Public chest X-ray sample images (from NIH/Kaggle open datasets)
const SAMPLE_IMAGES = [
  {
    label: "PNEUMONIA",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Pneumonia_x-ray.jpg/440px-Pneumonia_x-ray.jpg",
    name: "Pneumonia Sample 1"
  },
  {
    label: "PNEUMONIA",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Chest_X-ray_in_influenza_and_Haemophilus_influenzae_-_annotated.jpg/480px-Chest_X-ray_in_influenza_and_Haemophilus_influenzae_-_annotated.jpg",
    name: "Pneumonia Sample 2"
  },
  {
    label: "NORMAL",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg/440px-Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg",
    name: "Normal Sample 1"
  },
  {
    label: "NORMAL",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Chest_Xray_PA_3-8-2010.png/440px-Chest_Xray_PA_3-8-2010.png",
    name: "Normal Sample 2"
  }
]

export default function App() {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef                = useRef(null)

  // ── File handling ──────────────────────────────────────────
  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setResult(null)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  // ── Load sample image ──────────────────────────────────────
  const loadSample = async (sample) => {
    setResult(null)
    setPreview(sample.url)
    setLoading(true)
    try {
      const res  = await fetch(sample.url)
      const blob = await res.blob()
      const f    = new File([blob], sample.name + ".jpg", { type: "image/jpeg" })
      setFile(f)
    } catch {
      alert("Failed to load sample image")
    } finally {
      setLoading(false)
    }
  }

  // ── API call ───────────────────────────────────────────────
  const analyze = async () => {
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await axios.post(
        "https://vijayesh684-chest-xray-api.hf.space/predict",
        formData
      )
      setResult(res.data)
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
  }

  return (
    <div className="app">
      {/* ── Header ── */}
      <div className="header">
        <h1>🫁 Chest X-Ray Diagnosis</h1>
        <p>AI-powered pneumonia detection using EfficientNetB4 + Grad-CAM</p>
      </div>

      {/* ── Warning ── */}
      <div className="warning">
        ⚠️ For research purposes only. Not a substitute for professional medical diagnosis.
      </div>

      <div className="main-layout">
        {/* ── Sample Images Panel ── */}
        <div className="sample-panel">
          <h3 className="sample-title">🩻 Try a Sample</h3>
          <p className="sample-subtitle">Click any image to load it</p>
          <div className="sample-grid">
            {SAMPLE_IMAGES.map((sample, i) => (
              <div
                key={i}
                className={`sample-card ${sample.label.toLowerCase()}`}
                onClick={() => loadSample(sample)}
              >
                <img src={sample.url} alt={sample.name} />
                <div className="sample-badge">{sample.label}</div>
                <div className="sample-name">{sample.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="main-content">
          {/* Upload Zone */}
          {!result && (
            <div
              className={`upload-zone ${dragging ? "dragging" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="preview"
                    style={{ maxHeight: 220, borderRadius: 10, marginBottom: "1rem" }}
                  />
                  <p style={{ color: "#94a3b8" }}>{file?.name}</p>
                </>
              ) : (
                <>
                  <div className="icon">🩻</div>
                  <h3>Drop your chest X-ray here</h3>
                  <p>or click a sample on the left</p>
                  <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Supports PNG, JPG, JPEG</p>
                </>
              )}
              <button
                className="upload-btn"
                onClick={(e) => { e.stopPropagation(); inputRef.current.click() }}
              >
                {preview ? "Change Image" : "Browse File"}
              </button>
            </div>
          )}

          {/* Analyze Button */}
          {file && !result && !loading && (
            <button
              className="upload-btn"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", marginBottom: "1.5rem" }}
              onClick={analyze}
            >
              🔍 Analyze X-Ray
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="loading">
              <div className="spinner" />
              <p style={{ color: "#64748b" }}>Analyzing X-ray with EfficientNetB4...</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <>
              <div className="results-grid">
                {/* Prediction Card */}
                <div className="card">
                  <h3>Diagnosis Result</h3>
                  <div className={`result-label ${result.label.toLowerCase()}`}>
                    {result.label === "PNEUMONIA" ? "🔴" : "🟢"} {result.label}
                  </div>
                  <div className="confidence-bar-wrap">
                    <div
                      className={`confidence-bar ${result.label.toLowerCase()}`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                  <div className="confidence-text">
                    Confidence: <span>{result.confidence}%</span>
                  </div>
                  <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#64748b" }}>
                    <div>Raw score: {result.score}</div>
                    <div>Threshold: {result.threshold}</div>
                  </div>
                </div>

                {/* Metrics Card */}
                <div className="card">
                  <h3>Model Performance</h3>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <div className="metric-value">{result.metrics.accuracy}%</div>
                      <div className="metric-label">Accuracy</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-value">{result.metrics.roc_auc}</div>
                      <div className="metric-label">ROC-AUC</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-value">{result.metrics.sensitivity}%</div>
                      <div className="metric-label">Sensitivity</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-value">{result.metrics.specificity}%</div>
                      <div className="metric-label">Specificity</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="image-grid">
                <div className="card image-card">
                  <h3>Original X-Ray</h3>
                  <img src={result.original} alt="original xray" />
                </div>
                <div className="card image-card">
                  <h3>Grad-CAM Heatmap</h3>
                  <img src={result.gradcam} alt="gradcam heatmap" />
                </div>
              </div>

              {/* Reset */}
              <button className="reset-btn" onClick={reset}>
                🔄 Analyze Another X-Ray
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
