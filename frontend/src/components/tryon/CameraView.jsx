import React, { useRef, useEffect, useState, useCallback } from 'react';
import useCamera from '../../hooks/useCamera';
import usePoseDetection from '../../hooks/usePoseDetection';
import useSegmentation from '../../hooks/useSegmentation';
import GarmentRenderer from './GarmentRenderer';

// Instead of one PNG, load layered assets.
const GARMENT_ASSETS = {
  'cc-cotton-polo-pair': {
    torso: '/garments/cc-cotton-polo-pair-torso.png',
    leftSleeve: '/garments/cc-cotton-polo-pair-lsleeve.png',
    rightSleeve: '/garments/cc-cotton-polo-pair-rsleeve.png',
    collar: '/garments/cc-cotton-polo-pair-collar.png'
  },
  'cc-classic-duo-tee': {
    torso: '/garments/cc-cotton-polo-pair-torso.png',
    leftSleeve: '/garments/cc-cotton-polo-pair-lsleeve.png',
    rightSleeve: '/garments/cc-cotton-polo-pair-rsleeve.png',
    collar: '/garments/cc-cotton-polo-pair-collar.png'
  }
};

const drawCapsule = (ctx, p1, p2, radius) => {
  ctx.beginPath();
  ctx.arc(p1.x, p1.y, radius, 0, Math.PI * 2);
  ctx.arc(p2.x, p2.y, radius, 0, Math.PI * 2);
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const offsetX = Math.cos(angle + Math.PI/2) * radius;
  const offsetY = Math.sin(angle + Math.PI/2) * radius;
  ctx.moveTo(p1.x + offsetX, p1.y + offsetY);
  ctx.lineTo(p2.x + offsetX, p2.y + offsetY);
  ctx.lineTo(p2.x - offsetX, p2.y - offsetY);
  ctx.lineTo(p1.x - offsetX, p1.y - offsetY);
  ctx.fill();
};

const CameraView = ({ product }) => {
  const { videoRef, active: cameraActive, start: startCamera, stop: stopCamera, error: camError } = useCamera();
  const { ready: poseReady, detect, error: poseError } = usePoseDetection();
  const { ready: segReady, segment, buildLayerMask, error: segError } = useSegmentation();

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const photoCanvasRef = useRef(null);
  const occlusionCanvasRef = useRef(null);
  const animRef = useRef(null);

  const [status, setStatus] = useState('idle');
  const [facingMode, setFacingMode] = useState('user');
  const [bodyMetrics, setBodyMetrics] = useState(null);

  const assets = GARMENT_ASSETS[product?.slug] || GARMENT_ASSETS['cc-cotton-polo-pair'];

  const handleStart = async () => {
    setStatus('loading');
    await startCamera(facingMode);
  };

  const toggleCamera = async () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    stopCamera();
    setStatus('loading');
    await startCamera(next);
  };

  useEffect(() => {
    if (cameraActive && poseReady && segReady && status === 'loading') {
      setStatus('live');
    }
  }, [cameraActive, poseReady, segReady, status]);

  useEffect(() => {
    if (status !== 'live') return;

    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !video || video.readyState < 2) {
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      const dw = containerRef.current.offsetWidth;
      const dh = containerRef.current.offsetHeight;
      if (canvas.width !== dw) {
        canvas.width = dw;
        canvas.height = dh;
      }

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, dw, dh);
      ctx.save();
      if (facingMode === 'user') { ctx.translate(dw, 0); ctx.scale(-1, 1); }
      
      ctx.drawImage(video, 0, 0, dw, dh);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(dw*0.15, dh*0.2, dw*0.7, dh*0.6);
      
      ctx.restore();
      animRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [status, facingMode]);

  const takePhoto = async () => {
    setStatus('processing');
    
    const video = videoRef.current;
    const dw = containerRef.current.offsetWidth;
    const dh = containerRef.current.offsetHeight;
    
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = dw;
    photoCanvas.height = dh;
    const pctx = photoCanvas.getContext('2d');
    
    pctx.save();
    if (facingMode === 'user') { pctx.translate(dw, 0); pctx.scale(-1, 1); }
    pctx.drawImage(video, 0, 0, dw, dh);
    pctx.restore();
    
    photoCanvasRef.current = photoCanvas;

    setTimeout(() => {
      generateComposite(photoCanvas, dw, dh);
    }, 50);
  };

  const generateComposite = (photoCanvas, dw, dh) => {
    const ctx = canvasRef.current.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvasRef.current.width = dw * dpr;
    canvasRef.current.height = dh * dpr;
    canvasRef.current.style.width = `${dw}px`;
    canvasRef.current.style.height = `${dh}px`;
    
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    photoCanvas.readyState = 2;
    const detectionResult = detect(photoCanvas);
    const lm = detectionResult?.landmarks;
    const wlm = detectionResult?.worldLandmarks;
    const segData = segment(photoCanvas);

    ctx.drawImage(photoCanvas, 0, 0, dw, dh);

    if (!lm) {
      alert("No body detected! Please make sure your full torso is visible and try again.");
      setStatus('live');
      return;
    }

    setBodyMetrics({ landmarks: lm, worldLandmarks: wlm });

    drawShadows(ctx, lm, dw, dh); // Updated to use lm instead of anchors

    // The GarmentRenderer component will handle rendering the layered clothes via React state
    
    // Step 4: Segmentation Masking
    if (occlusionCanvasRef.current) {
      const octx = occlusionCanvasRef.current.getContext('2d');
      occlusionCanvasRef.current.width = dw * dpr;
      occlusionCanvasRef.current.height = dh * dpr;
      occlusionCanvasRef.current.style.width = `${dw}px`;
      occlusionCanvasRef.current.style.height = `${dh}px`;
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawOcclusions(octx, photoCanvas, lm, segData, dw, dh);
    }
    
    setStatus('result');
    stopCamera(); 
  };

  const drawShadows = (ctx, lm, dw, dh) => {
    if (!lm || !lm[11] || !lm[12] || !lm[23] || !lm[24]) return;
    
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.filter = 'blur(16px)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';

    const nx = (lm[11].x + lm[12].x)/2 * dw;
    const ny = (lm[11].y + lm[12].y)/2 * dh;

    ctx.beginPath(); ctx.arc(nx, ny + 10, 25, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(lm[11].x * dw, lm[11].y * dh + 20, 30, 60, Math.PI/4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(lm[12].x * dw, lm[12].y * dh + 20, 30, 60, -Math.PI/4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(lm[23].x * dw + 10, lm[23].y * dh, 20, 80, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(lm[24].x * dw - 10, lm[24].y * dh, 20, 80, 0, 0, Math.PI*2); ctx.fill();

    ctx.restore();
  };

  const applyLightingAndWrinkles = (cctx, photoCanvas, dw, dh, dpr) => {
    cctx.globalCompositeOperation = 'overlay';
    const gradient = cctx.createLinearGradient(0, 0, dw, dh);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    cctx.fillStyle = gradient;
    cctx.fillRect(0, 0, dw, dh);
    cctx.globalCompositeOperation = 'source-over';
  };

  const drawOcclusions = (ctx, photoCanvas, lm, segData, dw, dh) => {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = dw; maskCanvas.height = dh;
    const mctx = maskCanvas.getContext('2d');
    
    mctx.fillStyle = 'white';
    const drawArm = (shoulder, elbow, wrist) => {
      if (!shoulder || !elbow) return;
      const s = { x: shoulder.x * dw, y: shoulder.y * dh };
      const e = { x: elbow.x * dw, y: elbow.y * dh };
      const sw = Math.abs(lm[11].x - lm[12].x) * dw;
      const radius = sw * 0.16;
      
      const dx = e.x - s.x, dy = e.y - s.y;
      const len = Math.hypot(dx, dy) || 1;
      const startP = { x: s.x + (dx/len)*radius*1.2, y: s.y + (dy/len)*radius*1.2 };
      
      drawCapsule(mctx, startP, e, radius);
      if (wrist) {
        const w = { x: wrist.x * dw, y: wrist.y * dh };
        drawCapsule(mctx, e, w, radius * 0.7);
      }
    };

    drawArm(lm[11], lm[13], lm[15]);
    drawArm(lm[12], lm[14], lm[16]);

    if (lm[0]) {
      const sw = Math.abs(lm[11].x - lm[12].x) * dw;
      mctx.beginPath();
      mctx.ellipse(lm[0].x * dw, lm[0].y * dh, sw*0.3, sw*0.4, 0, 0, Math.PI*2);
      mctx.fill();
    }

    if (segData) {
      const segMask = buildLayerMask(segData, [1, 2, 3, 4, 5], dw, dh);
      if (segMask) {
        mctx.globalCompositeOperation = 'source-in';
        mctx.drawImage(segMask, 0, 0, dw, dh);
      }
    }

    mctx.globalCompositeOperation = 'source-in';
    mctx.drawImage(photoCanvas, 0, 0, dw, dh);

    ctx.drawImage(maskCanvas, 0, 0, dw, dh);
  };

  const retakePhoto = async () => {
    setStatus('loading');
    await startCamera(facingMode);
  };

  const getLoadingMessage = () => {
    if (poseError || segError) return 'Error downloading AI models. Check internet.';
    if (status === 'processing') return 'Applying AI Fitting & Shadows...';
    if (!poseReady || !segReady) return 'Downloading AI Models (can take 5-10s)...';
    if (!cameraActive) return 'Requesting Camera Access...';
    return 'Starting Camera...';
  };

  return (
    <div ref={containerRef} className="pdp__tryon-camera" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {status === 'idle' && (
        <div className="pdp__tryon-prompt" style={{ zIndex: 10 }}>
          <span className="pdp__tryon-prompt-icon">📷</span>
          <p>High-Fidelity Virtual Try-On<br /><strong>Take a static photo for maximum realism.</strong></p>
          <button className="pdp__tryon-start-btn" onClick={handleStart}>Open Camera</button>
        </div>
      )}

      {camError && status === 'loading' && (
        <div className="pdp__tryon-prompt pdp__tryon-prompt--error" style={{ zIndex: 10 }}>
          <span className="pdp__tryon-prompt-icon">🚫</span>
          <p>Camera access denied or unavailable.</p>
          <button className="pdp__tryon-start-btn" onClick={() => setStatus('idle')}>Try Again</button>
        </div>
      )}

      {(poseError || segError) && status === 'loading' && (
        <div className="pdp__tryon-prompt pdp__tryon-prompt--error" style={{ zIndex: 10 }}>
          <span className="pdp__tryon-prompt-icon">⚠️</span>
          <p>Failed to download AI models. Please check your internet connection.</p>
          <button className="pdp__tryon-start-btn" onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      )}

      {(status === 'loading' || status === 'processing') && !camError && !poseError && !segError && (
        <div className="pdp__tryon-prompt" style={{ zIndex: 10, background: 'rgba(26,46,26,0.96)' }}>
          <div className="pdp__tryon-spinner" />
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 10 }}>
            {getLoadingMessage()}
          </p>
        </div>
      )}

      <video ref={videoRef} playsInline muted autoPlay
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />

      {/* Base Canvas (Video/Photo + Shadows) */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', top: 0, left: 0,
        display: (status === 'live' || status === 'result') ? 'block' : 'none',
        zIndex: 1
      }} />

      {/* 2.5D Layered Garment Renderer */}
      {status === 'result' && bodyMetrics && containerRef.current && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
          <GarmentRenderer
            assets={assets}
            bodyMetrics={bodyMetrics}
            videoWidth={containerRef.current.offsetWidth}
            videoHeight={containerRef.current.offsetHeight}
          />
        </div>
      )}

      {/* Occlusion Canvas (Foreground Arms/Head) */}
      <canvas ref={occlusionCanvasRef} style={{
        position: 'absolute', top: 0, left: 0,
        display: (status === 'live' || status === 'result') ? 'block' : 'none',
        zIndex: 3,
        pointerEvents: 'none'
      }} />

      {status === 'live' && (
        <>
          <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', zIndex: 10 }}>
            <span style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 20, color: 'white', fontSize: 13 }}>
              Align your torso in the frame
            </span>
          </div>
          <div className="pdp__tryon-actions" style={{ zIndex: 10, bottom: 30, justifyContent: 'center' }}>
            <button onClick={toggleCamera} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 50, height: 50, fontSize: 20, color: 'white', marginRight: 20 }}>🔄</button>
            <button onClick={takePhoto} style={{
              width: 70, height: 70, borderRadius: '50%', background: 'white',
              border: '4px solid #c9e86b', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }} aria-label="Take Photo" />
            <div style={{ width: 70 }} />
          </div>
        </>
      )}

      {status === 'result' && (
        <div className="pdp__tryon-actions" style={{ zIndex: 10, bottom: 30, justifyContent: 'center', gap: 15 }}>
          <button className="pdp__tryon-start-btn" onClick={retakePhoto} style={{ background: 'rgba(0,0,0,0.6)', width: 'auto', padding: '10px 20px' }}>
            Retake Photo
          </button>
          <button className="pdp__tryon-capture-btn" onClick={() => {
            const a = document.createElement('a');
            a.download = `my-fit-${Date.now()}.png`;
            a.href = canvasRef.current.toDataURL('image/png'); 
            a.click();
          }} style={{ width: 'auto', padding: '10px 20px' }}>
            Save Look ✨
          </button>
        </div>
      )}

    </div>
  );
};

export default CameraView;
