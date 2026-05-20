import React, { useRef, useEffect, useState, useCallback } from 'react';
import useCamera from '../../hooks/useCamera';
import usePoseDetection from '../../hooks/usePoseDetection';

/* ─────────────────────────────────────────────────────────────
   CameraView — PNG garment try-on (scale + position + rotate)
   
   Pipeline each frame:
   1. Draw mirrored video onto canvas (base layer)
   2. Detect body landmarks
   3. Compute shirt placement: scale to body width, position
      collar at neck, rotate to body angle
   4. Draw shirt image at 85% opacity (body shows through)
   5. Composite face + neck + forearms + lower body from video
   ───────────────────────────────────────────────────────────── */

const GARMENT_IMAGES = {
  'cc-cotton-polo-pair': '/garments/cc-cotton-polo-pair.png',
  'cc-classic-duo-tee':  '/garments/cc-cotton-polo-pair.png',
};

/* ── Where the collar sits in the PNG (normalised 0→1) ──────── 
   This is the ONLY anchor we need — the collar/neck point.
   We position the whole image so this point aligns with the 
   user's neck, and scale the image to match body width.
   ──────────────────────────────────────────────────────────── */
const COLLAR_ANCHOR = { x: 0.50, y: 0.08 };

/* ── Approximate where sleeves end in the PNG (normalised) ──── 
   Used to compute image "body width" for scaling.
   Sleeve-to-sleeve span in image = how wide the shirt fabric is.
   ──────────────────────────────────────────────────────────── */
const IMG_LEFT_EDGE  = 0.04;  // leftmost sleeve pixel
const IMG_RIGHT_EDGE = 0.96;  // rightmost sleeve pixel
const IMG_SHIRT_WIDTH_FRAC = IMG_RIGHT_EDGE - IMG_LEFT_EDGE; // ~0.92

/* ── Remove white background ─────────────────────────────────── */
function removeWhiteBg(img, threshold = 225) {
  const oc = document.createElement('canvas');
  oc.width  = img.naturalWidth;
  oc.height = img.naturalHeight;
  const c = oc.getContext('2d');
  c.drawImage(img, 0, 0);
  const id = c.getImageData(0, 0, oc.width, oc.height);
  const d  = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], b = d[i+2];
    if (r > threshold && g > threshold && b > threshold) {
      d[i+3] = 0; // transparent
    }
  }
  c.putImageData(id, 0, 0);
  return oc;
}

/* ═══════════════════════════════════════════════════════════════
   CameraView Component
   ═══════════════════════════════════════════════════════════════ */
const CameraView = ({ product, color, showDebug = false }) => {
  const { videoRef, active: cameraActive, error: camError, start: startCamera } = useCamera();
  const { ready: poseReady, detect } = usePoseDetection();

  const containerRef   = useRef(null);
  const canvasRef      = useRef(null);
  const animRef        = useRef(null);
  const lastLmRef      = useRef(null);
  const shirtCanvasRef = useRef(null);
  const [shirtReady,   setShirtReady]   = useState(false);
  const [started,      setStarted]      = useState(false);
  const [bodyDetected, setBodyDetected] = useState(false);
  const [status,       setStatus]       = useState('idle');

  const imgPath = GARMENT_IMAGES[product?.slug] || null;

  /* ── Load & process shirt PNG ── */
  useEffect(() => {
    if (!imgPath) return;
    setShirtReady(false);
    shirtCanvasRef.current = null;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      shirtCanvasRef.current = removeWhiteBg(img, 225);
      setShirtReady(true);
    };
    img.onerror = () => console.warn('Shirt PNG failed to load:', imgPath);
    img.src = imgPath;
  }, [imgPath]);

  const handleStart = useCallback(async () => {
    setStarted(true); setStatus('loading');
    await startCamera('user');
  }, [startCamera]);

  useEffect(() => {
    if (started && cameraActive && poseReady) setStatus('ready');
    else if (started && cameraActive)         setStatus('loading');
  }, [started, cameraActive, poseReady]);

  /* ── Draw one composited frame ── */
  const drawFrame = useCallback((ctx, lm, video, dw, dh) => {
    ctx.clearRect(0, 0, dw, dh);

    /* ══ LAYER 0: Mirrored video (base) ══════════════════════ */
    if (video && video.readyState >= 2) {
      ctx.save();
      ctx.translate(dw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, dw, dh);
      ctx.restore();
    }

    /* ── Landmark extraction ── */
    const mx   = v => (1 - v) * dw;  // mirror X
    const py   = v => v * dh;
    const ls   = lm[11], rs = lm[12]; // shoulders
    const le   = lm[13], re = lm[14]; // elbows
    const lw   = lm[15], rw = lm[16]; // wrists
    const lh   = lm[23], rh = lm[24]; // hips
    const nose = lm[0];
    if (!ls || !rs || !lh || !rh) return false;

    const lsX = mx(ls.x), lsY = py(ls.y);
    const rsX = mx(rs.x), rsY = py(rs.y);
    const lhX = mx(lh.x), lhY = py(lh.y);
    const rhX = mx(rh.x), rhY = py(rh.y);

    // Elbows (with fallback)
    const leX = le ? mx(le.x) : lsX + (lsX - rsX) * 0.7;
    const leY = le ? py(le.y) : lsY + Math.abs(lhY - lsY) * 0.42;
    const reX = re ? mx(re.x) : rsX + (rsX - lsX) * 0.7;
    const reY = re ? py(re.y) : rsY + Math.abs(rhY - rsY) * 0.42;

    // Wrists (with fallback)
    const lwX = lw ? mx(lw.x) : leX + (leX - lsX) * 0.8;
    const lwY = lw ? py(lw.y) : leY + Math.abs(leY - lsY) * 0.8;
    const rwX = rw ? mx(rw.x) : reX + (reX - rsX) * 0.8;
    const rwY = rw ? py(rw.y) : reY + Math.abs(reY - rsY) * 0.8;

    // Key measurements
    const sw   = Math.abs(lsX - rsX);          // skeleton shoulder width
    const smX  = (lsX + rsX) / 2;              // shoulder midpoint X
    const smY  = (lsY + rsY) / 2;              // shoulder midpoint Y
    const hmX  = (lhX + rhX) / 2;              // hip midpoint X
    const hmY  = (lhY + rhY) / 2;              // hip midpoint Y
    const torsoH = Math.abs(smY - hmY);          // shoulder→hip height
    const bodyAngle = Math.atan2(rsY - lsY, rsX - lsX); // body tilt

    /* ══ LAYER 1: Shirt image ════════════════════════════════
       Strategy: scale the whole PNG so the shirt's visible
       width matches the body width (skeleton + generous padding).
       
       The actual body surface is ~60% wider than the skeleton
       shoulder landmarks. We want the shirt to cover ALL of it.
       ════════════════════════════════════════════════════════ */
    if (shirtCanvasRef.current && shirtReady) {
      const sc = shirtCanvasRef.current;
      const iw = sc.width, ih = sc.height;

      // Target body width = skeleton shoulders * 2.3
      // MediaPipe skeleton is MUCH narrower than the actual body surface
      const targetBodyW = sw * 2.3;

      // The shirt image's fabric spans IMG_SHIRT_WIDTH_FRAC of its width.
      // Scale so that fabric width = targetBodyW.
      const scale = targetBodyW / (IMG_SHIRT_WIDTH_FRAC * iw);

      // Scaled dimensions
      const drawW = iw * scale;
      const drawH = ih * scale;

      // Where to position: collar maps to base of neck
      // Neck is well ABOVE the shoulder landmarks
      const neckX = smX;
      const neckY = smY - torsoH * 0.22;

      // Collar position in the scaled image
      const collarScaledX = COLLAR_ANCHOR.x * drawW;
      const collarScaledY = COLLAR_ANCHOR.y * drawH;

      ctx.save();
      // Move canvas origin to neck position
      ctx.translate(neckX, neckY);
      // Rotate to body angle
      ctx.rotate(bodyAngle);
      // Draw shirt so collar aligns with origin
      ctx.globalAlpha = 0.85;
      ctx.drawImage(sc, -collarScaledX, -collarScaledY, drawW, drawH);
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }

    /* ══ LAYER 2: Composite — paint real pixels back ═════════
       Face, neck, forearms, and lower body restored from video.
       This makes the shirt appear worn, not pasted.
       ════════════════════════════════════════════════════════ */
    if (video && video.readyState >= 2) {
      const composite = (buildPath) => {
        ctx.save();
        ctx.beginPath(); buildPath(); ctx.clip();
        ctx.translate(dw, 0); ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, dw, dh);
        ctx.restore();
      };

      // Face + head
      if (nose) {
        const fX = mx(nose.x), fY = py(nose.y);
        const fW = sw * 0.55, fH = sw * 0.75;
        composite(() => ctx.ellipse(fX, fY - fH * 0.22, fW, fH, 0, 0, Math.PI * 2));
        // Neck strip
        composite(() => {
          const nW = sw * 0.22;
          ctx.rect(fX - nW, fY + fH * 0.42, nW * 2, sw * 0.40);
        });
      }

      // Left forearm + hand
      const lFW = sw * 0.24;
      const lFA = Math.atan2(lwY - leY, lwX - leX);
      const lfx = Math.cos(lFA + Math.PI/2) * lFW;
      const lfy = Math.sin(lFA + Math.PI/2) * lFW;
      const lSX = leX - (leX - lsX) * 0.12;
      const lSY = leY - (leY - lsY) * 0.12;
      composite(() => {
        ctx.moveTo(lSX + lfx, lSY + lfy);
        ctx.lineTo(lwX + lfx * 2.0, lwY + lfy * 2.0);
        ctx.lineTo(lwX - lfx * 2.0, lwY - lfy * 2.0);
        ctx.lineTo(lSX - lfx, lSY - lfy);
      });

      // Right forearm + hand
      const rFW = sw * 0.24;
      const rFA = Math.atan2(rwY - reY, rwX - reX);
      const rfx = Math.cos(rFA + Math.PI/2) * rFW;
      const rfy = Math.sin(rFA + Math.PI/2) * rFW;
      const rSX = reX - (reX - rsX) * 0.12;
      const rSY = reY - (reY - rsY) * 0.12;
      composite(() => {
        ctx.moveTo(rSX + rfx, rSY + rfy);
        ctx.lineTo(rwX + rfx * 2.0, rwY + rfy * 2.0);
        ctx.lineTo(rwX - rfx * 2.0, rwY - rfy * 2.0);
        ctx.lineTo(rSX - rfx, rSY - rfy);
      });

      // Lower body — everything below shirt hem
      const hemY = hmY + torsoH * 0.30;
      composite(() => ctx.rect(0, hemY, dw, dh - hemY));
    }

    /* ══ Debug overlay ═══════════════════════════════════════ */
    if (showDebug) {
      ctx.strokeStyle = 'rgba(201,232,107,.85)';
      ctx.lineWidth = 2;
      [[11,12],[11,23],[12,24],[23,24],[11,13],[12,14],[13,15],[14,16]].forEach(([a,b]) => {
        const la=lm[a], lb=lm[b]; if(!la||!lb) return;
        ctx.beginPath(); ctx.moveTo(mx(la.x),py(la.y)); ctx.lineTo(mx(lb.x),py(lb.y)); ctx.stroke();
      });
      [0,11,12,13,14,15,16,23,24].forEach(i => {
        const p=lm[i]; if(!p) return;
        ctx.beginPath(); ctx.arc(mx(p.x),py(p.y),4,0,Math.PI*2);
        ctx.fillStyle='#c9e86b'; ctx.fill();
      });
    }

    return true;
  }, [shirtReady, color, showDebug]);

  /* ── RAF loop ── */
  useEffect(() => {
    if (!cameraActive || !poseReady) return;
    const loop = () => {
      const video = videoRef.current, container = containerRef.current, canvas = canvasRef.current;
      if (!canvas || !container) { animRef.current = requestAnimationFrame(loop); return; }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const dw  = container.offsetWidth, dh = container.offsetHeight;
      if (canvas.width !== dw * dpr || canvas.height !== dh * dpr) {
        canvas.width  = dw * dpr;
        canvas.height = dh * dpr;
        canvas.style.width  = `${dw}px`;
        canvas.style.height = `${dh}px`;
      }
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const lm = detect(video);
      if (lm) { lastLmRef.current = lm; setBodyDetected(true); setStatus('detecting'); }
      else    { setBodyDetected(false); setStatus('waiting'); }

      const landmarks = lm || lastLmRef.current;
      if (landmarks) {
        drawFrame(ctx, landmarks, video, dw, dh);
      } else {
        // No landmarks — still show live camera
        ctx.clearRect(0, 0, dw, dh);
        if (video && video.readyState >= 2) {
          ctx.save();
          ctx.translate(dw, 0); ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, dw, dh);
          ctx.restore();
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [cameraActive, poseReady, detect, drawFrame]);

  /* ── Screenshot ── */
  const captureScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = document.createElement('canvas');
    c.width = canvas.offsetWidth; c.height = canvas.offsetHeight;
    c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
    const a = document.createElement('a');
    a.download = `couplecotton-tryon-${Date.now()}.png`;
    a.href = c.toDataURL('image/png'); a.click();
  }, []);

  const statusConfig = {
    idle:      { dot:'wait', text:'Tap to start camera' },
    loading:   { dot:'wait', text: poseReady ? 'Starting camera…' : 'Loading AI…' },
    ready:     { dot:'wait', text:'Stand back — show your full torso' },
    detecting: { dot:'ok',   text: shirtReady ? 'Trying on — looking great!' : 'Body detected!' },
    waiting:   { dot:'wait', text:'Step into frame' },
  };
  const st = statusConfig[status] || statusConfig.idle;

  return (
    <div ref={containerRef} className="pdp__tryon-camera">
      {!started && (
        <div className="pdp__tryon-prompt">
          <span className="pdp__tryon-prompt-icon">📷</span>
          <p>Stand back so your full torso is visible.<br />
            Try on <strong>{product?.name || 'this item'}</strong> live.</p>
          <button className="pdp__tryon-start-btn" onClick={handleStart}>Start Camera</button>
        </div>
      )}
      {camError === 'camera_denied' && (
        <div className="pdp__tryon-prompt pdp__tryon-prompt--error">
          <span className="pdp__tryon-prompt-icon">🚫</span>
          <p>Camera access denied.<br />Allow camera in settings and reload.</p>
        </div>
      )}
      {started && (!cameraActive || !poseReady) && !camError && (
        <div className="pdp__tryon-prompt" style={{ background:'rgba(26,46,26,0.95)' }}>
          <div className="pdp__tryon-spinner" />
          <p>{poseReady ? 'Accessing camera…' : 'Loading body detection AI…'}<br />
            <small style={{ opacity:0.5, fontSize:11 }}>First load ~5–8s</small></p>
        </div>
      )}
      {cameraActive && (
        <div className="pdp__tryon-status">
          <span className={`pdp__tryon-status-dot pdp__tryon-status-dot--${st.dot}`} />
          <span className="pdp__tryon-status-text">{st.text}</span>
        </div>
      )}
      {/* Video hidden — used only as pixel source */}
      <video ref={videoRef} playsInline muted autoPlay
        style={{ position:'absolute', width:1, height:1, opacity:0, pointerEvents:'none' }} />
      {/* Canvas renders everything: video + shirt + compositing */}
      <canvas ref={canvasRef} style={{
        position:'absolute', top:0, left:0,
        width:'100%', height:'100%',
        display: cameraActive ? 'block' : 'none',
        zIndex: 2,
      }} />
      {cameraActive && bodyDetected && (
        <div className="pdp__tryon-actions">
          <button className="pdp__tryon-capture-btn" onClick={captureScreenshot}>
            📷 Capture Look
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraView;
