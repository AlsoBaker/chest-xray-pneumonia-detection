import { useState, useRef } from "react"
import axios from "axios"
import "./index.css"

export default function App() {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef                = useRef(null)

  // ── File handling ──────────────────────────────────────
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

  // ── API call ───────────────────────────────────────────
  const analyze = async () => {
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await axios.post("https://chest-xray-pneumonia-detection-04c6.onrender.com/_/backend/predict", formData)
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
        <p>AI-powered pneumonia detection using DenseNet121 + Grad-CAM</p>
      </div>

      {/* ── Warning ── */}
      <div className="warning">
        ⚠️ For research purposes only. Not a substitute for professional medical diagnosis.
      </div>

      {/* ── Upload Zone (show only before result) ── */}
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
              <p style={{ color: "#94a3b8" }}>{file.name}</p>
            </>
          ) : (
            <>
              <div className="icon">🩻</div>
              <h3>Drop your chest X-ray here</h3>
              <p>Supports PNG, JPG, JPEG</p>
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

      {/* ── Analyze Button ── */}
      {file && !result && !loading && (
        <button className="upload-btn" style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", marginBottom: "1.5rem" }} onClick={analyze}>
          🔍 Analyze X-Ray
        </button>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p style={{ color: "#64748b" }}>Analyzing X-ray with DenseNet121...</p>
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <>
          {/* Prediction + Metrics */}
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
  )
}