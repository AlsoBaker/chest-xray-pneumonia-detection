import { useState, useRef, useMemo } from "react"
import axios from "axios"
import "./index.css"

// ── Pool of images stored in public/samples/ (all .jpeg) ──
const PNEUMONIA_POOL = [
  { label: "PNEUMONIA", path: "/samples/pneumonia1.jpeg",  name: "Pneumonia Sample 1"  },
  { label: "PNEUMONIA", path: "/samples/pneumonia2.jpeg",  name: "Pneumonia Sample 2"  },
  { label: "PNEUMONIA", path: "/samples/pneumonia3.jpeg",  name: "Pneumonia Sample 3"  },
  { label: "PNEUMONIA", path: "/samples/pneumonia5.jpeg",  name: "Pneumonia Sample 5"  },
  { label: "PNEUMONIA", path: "/samples/pneumonia6.jpeg",  name: "Pneumonia Sample 6"  },
  { label: "PNEUMONIA", path: "/samples/pneumonia7.jpeg",  name: "Pneumonia Sample 7"  },
  { label: "PNEUMONIA", path: "/samples/pneumonia8.jpeg",  name: "Pneumonia Sample 8"  },
  { label: "PNEUMONIA", path: "/samples/pneumonia9.jpeg",  name: "Pneumonia Sample 9"  },
  { label: "PNEUMONIA", path: "/samples/pneumonia10.jpeg", name: "Pneumonia Sample 10" },
]

const NORMAL_POOL = [
  { label: "NORMAL", path: "/samples/normal1.jpeg",  name: "Normal Sample 1"  },
  { label: "NORMAL", path: "/samples/normal2.jpeg",  name: "Normal Sample 2"  },
  { label: "NORMAL", path: "/samples/normal3.jpeg",  name: "Normal Sample 3"  },
  { label: "NORMAL", path: "/samples/normal4.jpeg",  name: "Normal Sample 4"  },
  { label: "NORMAL", path: "/samples/normal5.jpeg",  name: "Normal Sample 5"  },
  { label: "NORMAL", path: "/samples/normal6.jpeg",  name: "Normal Sample 6"  },
  { label: "NORMAL", path: "/samples/normal7.jpeg",  name: "Normal Sample 7"  },
  { label: "NORMAL", path: "/samples/normal8.jpeg",  name: "Normal Sample 8"  },
  { label: "NORMAL", path: "/samples/normal9.jpeg",  name: "Normal Sample 9"  },
  { label: "NORMAL", path: "/samples/normal10.jpeg", name: "Normal Sample 10" },
]

// Always pick 2 pneumonia + 2 normal — guaranteed balance
function pickBalanced() {
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
  return [...shuffle(PNEUMONIA_POOL).slice(0, 2), ...shuffle(NORMAL_POOL).slice(0, 2)]
}

export default function App() {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef                = useRef(null)

  // 2 pneumonia + 2 normal, randomised once per page load
  const displayedSamples = useMemo(() => pickBalanced(), [])

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

  // ── Load sample image (local public/ files — no CORS issues) ──
  const loadSample = async (sample) => {
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch(sample.path)
      if (!res.ok) throw new Error(`Image not found (${res.status}): ${sample.path}`)
      const blob = await res.blob()
      const f    = new File([blob], sample.name + ".jpg", { type: "image/jpeg" })
      setFile(f)
      setPreview(URL.createObjectURL(blob))
    } catch (err) {
      alert("Failed to load sample: " + err.message)
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
        {/* ── Main Content (LEFT) ── */}
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
                  <p>or click a sample on the right</p>
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

        {/* ── Sample Images Panel (RIGHT) ── */}
        <div className="sample-panel">
          <h3 className="sample-title">🩻 Try a Sample</h3>
          <p className="sample-subtitle">Click any image to load it</p>
          <div className="sample-grid">
            {displayedSamples.map((sample, i) => (
              <div
                key={i}
                className={`sample-card ${sample.label.toLowerCase()}`}
                onClick={() => loadSample(sample)}
              >
                <img src={sample.path} alt={sample.name} />
                <div className="sample-badge">{sample.label}</div>
                <div className="sample-name">{sample.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
