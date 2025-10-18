import React, { useEffect, useRef, useState } from 'react'
import HeaderBar from '../../components/HeaderBar.jsx'
import './ServicesDiseaseDetection.css'

export default function ServicesDiseaseDetection() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [subjectType, setSubjectType] = useState('') // leaf | stem | fruit

  const startCamera = async () => {
    try {
      setError('')
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = media
        await videoRef.current.play()
        setStreaming(true)
      }
    } catch (e) {
      setError('Camera access denied or unavailable')
    }
  }

  const stopCamera = () => {
    try {
      const media = videoRef.current && videoRef.current.srcObject
      if (media) {
        media.getTracks().forEach(t => t.stop())
      }
      setStreaming(false)
    } catch {}
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    const c = canvasRef.current
    const w = v.videoWidth
    const h = v.videoHeight
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    ctx.drawImage(v, 0, 0, w, h)
    c.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
        setImageFile(file)
        setImagePreview(URL.createObjectURL(blob))
      }
    }, 'image/jpeg', 0.92)
  }

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (!subjectType) {
      setError('Please choose subject type (Leaf/Stem/Fruit) first')
      return
    }
    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  useEffect(() => {
    return () => {
      // cleanup stream
      try { stopCamera() } catch {}
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="disease-detection-container">
      <HeaderBar />
      <div className="disease-detection-content">
        <div className="disease-detection-back-button-container">
          <button
            onClick={() => window.history.back()}
            className="disease-detection-back-button"
          >
            ← Back
          </button>
        </div>
        <div className="disease-detection-card">
          <h1 className="disease-detection-title">Disease Detection</h1>
          <p className="disease-detection-description">Select the subject and then upload or capture an image to analyze.</p>

          <div className="disease-detection-subject-buttons">
            {[{id:'leaf',label:'Leaf',emoji:'🍃'},{id:'stem',label:'Stem',emoji:'🌿'},{id:'fruit',label:'Fruit',emoji:'🍎'}].map(opt => (
              <button key={opt.id}
                onClick={() => { setSubjectType(opt.id); setError('') }}
                className={`disease-detection-subject-button ${subjectType===opt.id ? 'disease-detection-subject-button-active' : 'disease-detection-subject-button-inactive'}`}
              >{opt.emoji} {opt.label}</button>
            ))}
          </div>

          {error && (
            <div className="disease-detection-error">{error}</div>
          )}

          <div className="disease-detection-upload-grid">
            <div className="disease-detection-upload-section">
              <div className="disease-detection-upload-title">Upload Image</div>
              <input type="file" accept="image/*" onChange={onFileChange} disabled={!subjectType} className="disease-detection-file-input" />
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="disease-detection-image-preview" />
              )}
            </div>
            <div className="disease-detection-upload-section">
              <div className="disease-detection-upload-title">Capture with Camera</div>
              {!streaming ? (
                <button onClick={startCamera} disabled={!subjectType} className="disease-detection-start-camera-button">Start Camera</button>
              ) : (
                <div className="disease-detection-camera-section">
                  <video ref={videoRef} className="disease-detection-video" playsInline muted />
                  <div className="disease-detection-camera-controls">
                    <button onClick={captureFrame} className="disease-detection-capture-button">Capture</button>
                    <button onClick={stopCamera} className="disease-detection-stop-button">Stop</button>
                  </div>
                  <canvas ref={canvasRef} className="disease-detection-canvas" />
                </div>
              )}
            </div>
          </div>

          <div className="disease-detection-analyze-section">
            <button 
              disabled={!imageFile || !subjectType} 
              className={`disease-detection-analyze-button ${(imageFile && subjectType) ? 'disease-detection-analyze-button-enabled' : 'disease-detection-analyze-button-disabled'}`}
            >Analyze (mock)</button>
            {(imageFile || subjectType) && <span className="disease-detection-status-text">{subjectType ? ('Subject: ' + subjectType) : ''}{imageFile ? ('  |  Selected: ' + imageFile.name) : ''}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}


