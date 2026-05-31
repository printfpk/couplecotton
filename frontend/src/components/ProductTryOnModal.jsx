import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductTryOnModal.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── Icons ─────────────────────────────────────────────── */
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const FlipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6M23 20v-6h-6"/>
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
  </svg>
);

const RetakeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

/* ── Helper: get image URL from product ────────────── */
const getProductImageUrl = (product) => {
  if (!product?.images?.length) return '';
  const img = product.images[0];
  return img?.url || img || '';
};

/* ── Helper: fetch image URL as File ────────────────── */
const urlToFile = async (url, filename = 'garment.jpg') => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
};

/* ══════════════════════════════════════════════════════
   ProductTryOnModal
   ══════════════════════════════════════════════════════ */
const ProductTryOnModal = ({ open, onClose, product }) => {
  /* State */
  const [step, setStep] = useState('capture');        // capture | generating | result
  const [personFile, setPersonFile] = useState(null);
  const [personPreview, setPersonPreview] = useState('');
  const [resultImage, setResultImage] = useState('');
  const [isMockResult, setIsMockResult] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [cameraReady, setCameraReady] = useState(false);

  /* Refs */
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  /* Lock body scroll when modal is open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* Cleanup camera on unmount / close */
  useEffect(() => {
    if (!open) {
      stopCamera();
      resetState();
    }
  }, [open]);

  const resetState = () => {
    setStep('capture');
    setPersonFile(null);
    setPersonPreview('');
    setResultImage('');
    setIsMockResult(false);
    setError('');
    setCameraActive(false);
    setCameraReady(false);
  };

  /* ── Camera Controls ──────────────────────────────── */
  const startCamera = useCallback(async (mode = facingMode) => {
    try {
      setError('');
      const constraints = {
        video: { facingMode: mode, width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
        };
      }
      setCameraActive(true);
    } catch (err) {
      setError('Camera access denied. Please allow camera access or upload a photo.');
      setCameraActive(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraReady(false);
  }, []);

  const flipCamera = useCallback(async () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    stopCamera();
    await startCamera(next);
  }, [facingMode, stopCamera, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !cameraReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Mirror if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setPersonFile(file);
      setPersonPreview(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg', 0.92);
  }, [cameraReady, facingMode, stopCamera]);

  /* ── File Upload ──────────────────────────────────── */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    stopCamera();
  };

  /* ── Generate Try-On ──────────────────────────────── */
  const handleGenerate = async () => {
    if (!personFile) {
      setError('Please take or upload your photo first.');
      return;
    }
    setError('');
    setStep('generating');

    try {
      const garmentUrl = getProductImageUrl(product);
      if (!garmentUrl) throw new Error('Product image not available.');

      let garmentFile;
      try {
        garmentFile = await urlToFile(garmentUrl, 'garment.jpg');
      } catch {
        throw new Error('Could not load product image. Try again.');
      }

      const formData = new FormData();
      formData.append('person', personFile);
      formData.append('garment', garmentFile);

      const res = await fetch(`${API_BASE}/api/tryon`, {
        method: 'POST',
        body: formData,
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || 'Try-on request failed.');

      const image = payload?.data?.imageBase64 || payload?.data?.imageUrl || '';
      if (!image) throw new Error('Try-on completed, but no image was returned.');

      setResultImage(image);
      setIsMockResult(!!payload?.data?.isMock);
      setStep('result');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep('capture');
    }
  };

  /* ── Retake ───────────────────────────────────────── */
  const handleRetake = () => {
    setPersonFile(null);
    setPersonPreview('');
    setResultImage('');
    setIsMockResult(false);
    setError('');
    setStep('capture');
  };

  /* ── Download Result ──────────────────────────────── */
  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `tryon-${product?.title?.replace(/\s+/g, '-') || 'look'}-${Date.now()}.png`;
    a.click();
  };

  if (!open) return null;

  const garmentImgUrl = getProductImageUrl(product);

  return (
    <AnimatePresence>
      <motion.div
        className="pto-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div
          className="pto-modal"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ─────────────────────────────── */}
          <div className="pto-header">
            <div className="pto-header-left">
              <span className="pto-eyebrow">✨ AI Virtual Try-On</span>
              <h2 className="pto-title">See how it looks on you</h2>
            </div>
            <button className="pto-close" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          {/* ── Body ───────────────────────────────── */}
          <div className="pto-body">
            {/* Left: Person Photo */}
            <div className="pto-section pto-section--person">
              <div className="pto-section-label">
                <span className="pto-step-num">1</span>
                <span>Your Photo</span>
              </div>

              <div className="pto-capture-area">
                {/* Camera view */}
                {cameraActive && !personPreview && (
                  <div className="pto-camera-view">
                    <video
                      ref={videoRef}
                      className="pto-video"
                      playsInline
                      muted
                      autoPlay
                      style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                    />
                    {cameraReady && (
                      <div className="pto-camera-controls">
                        <button className="pto-cam-btn pto-cam-btn--flip" onClick={flipCamera} title="Flip Camera">
                          <FlipIcon />
                        </button>
                        <button className="pto-cam-btn pto-cam-btn--shutter" onClick={capturePhoto} aria-label="Take Photo">
                          <div className="pto-shutter-inner" />
                        </button>
                        <div style={{ width: 44 }} />
                      </div>
                    )}
                    {!cameraReady && (
                      <div className="pto-camera-loading">
                        <div className="pto-spinner" />
                        <span>Starting camera…</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Preview */}
                {personPreview && (
                  <div className="pto-preview-wrap">
                    <img src={personPreview} alt="Your photo" className="pto-preview-img" />
                    <button className="pto-retake-btn" onClick={handleRetake}>
                      <RetakeIcon /> Retake
                    </button>
                  </div>
                )}

                {/* Initial prompt (no camera, no preview) */}
                {!cameraActive && !personPreview && (
                  <div className="pto-prompt">
                    <div className="pto-prompt-actions">
                      <button className="pto-prompt-btn" onClick={() => startCamera()}>
                        <CameraIcon />
                        <span>Open Camera</span>
                      </button>
                      <div className="pto-prompt-divider">
                        <span>or</span>
                      </div>
                      <button className="pto-prompt-btn" onClick={() => fileInputRef.current?.click()}>
                        <UploadIcon />
                        <span>Upload Photo</span>
                      </button>
                    </div>
                    <p className="pto-prompt-hint">Full body or upper body photo works best</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                  className="pto-file-input"
                />
              </div>
            </div>

            {/* Center: Product (garment) */}
            <div className="pto-section pto-section--garment">
              <div className="pto-section-label">
                <span className="pto-step-num">2</span>
                <span>Selected Outfit</span>
              </div>
              <div className="pto-garment-card">
                {garmentImgUrl && (
                  <img src={garmentImgUrl} alt={product?.title} className="pto-garment-img" />
                )}
                <div className="pto-garment-info">
                  <span className="pto-garment-name">{product?.title}</span>
                  <span className="pto-garment-price">
                    ₹{(product?.price?.finalPrice ?? product?.price?.amount ?? 0).toFixed(2)}
                  </span>
                </div>
                <span className="pto-garment-check">✓ Selected</span>
              </div>
            </div>

            {/* Right: Result */}
            <div className="pto-section pto-section--result">
              <div className="pto-section-label">
                <span className="pto-step-num">3</span>
                <span>Try-On Result</span>
              </div>
              <div className="pto-result-area">
                {step === 'generating' && (
                  <div className="pto-generating">
                    <div className="pto-spinner pto-spinner--large" />
                    <span className="pto-generating-text">AI is generating your look…</span>
                    <span className="pto-generating-sub">This may take 10-20 seconds</span>
                  </div>
                )}
                {step === 'result' && resultImage && (
                  <div className="pto-result-wrap">
                    <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', overflow: 'hidden' }}>
                      <img src={resultImage} alt="Try-on result" className="pto-result-img" />
                      {isMockResult && garmentImgUrl && (
                        <motion.img 
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 0.95, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          src={garmentImgUrl} 
                          alt="Garment overlay" 
                          style={{
                            position: 'absolute',
                            top: '35%',
                            left: '15%',
                            width: '70%',
                            height: '60%',
                            objectFit: 'contain',
                            mixBlendMode: 'multiply',
                            pointerEvents: 'none'
                          }} 
                        />
                      )}
                    </div>
                    <div className="pto-result-actions">
                      <button className="pto-result-btn" onClick={handleDownload}>
                        <DownloadIcon /> Save Look
                      </button>
                      <button className="pto-result-btn pto-result-btn--secondary" onClick={handleRetake}>
                        <RetakeIcon /> Try Again
                      </button>
                    </div>
                  </div>
                )}
                {step === 'capture' && !resultImage && (
                  <div className="pto-result-placeholder">
                    <div className="pto-result-placeholder-icon">👗</div>
                    <p>Your AI-generated try-on will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Error ──────────────────────────────── */}
          {error && (
            <motion.div
              className="pto-error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ⚠ {error}
            </motion.div>
          )}

          {/* ── Footer / Generate Button ───────────── */}
          <div className="pto-footer">
            <button
              className="pto-generate-btn"
              onClick={handleGenerate}
              disabled={!personFile || step === 'generating'}
            >
              {step === 'generating' ? (
                <>
                  <div className="pto-btn-spinner" />
                  Generating…
                </>
              ) : (
                <>✨ Generate Try-On</>
              )}
            </button>
          </div>

          {/* Hidden canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductTryOnModal;
