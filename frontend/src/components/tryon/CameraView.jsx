import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import useCamera from '../../hooks/useCamera';
import usePoseDetection from '../../hooks/usePoseDetection';

/* ─────────────────────────────────────────────────────────────
   GARMENT_MODELS — maps product slug → public GLB path
   ───────────────────────────────────────────────────────────── */
const GARMENT_MODELS = {
  'cc-cotton-polo-pair':    '/garments/cc-cotton-polo-pair.glb',
  'cc-linen-couple-shirt':  '/garments/cc-linen-couple-shirt.glb',
  'cc-summer-short-set':    '/garments/cc-summer-short-set.glb',
  'cc-matching-hoodie-duo': '/garments/cc-matching-hoodie-duo.glb',
  'cc-couple-graphic-tee':  '/garments/cc-couple-graphic-tee.glb',
};

/* ─────────────────────────────────────────────────────────────
   GLBModel — loads the .glb and positions it every frame.
   Camera is orthographic: world coords = display pixels
   Origin = top-left, Y increases downward (matches CSS).
   ───────────────────────────────────────────────────────────── */
const GLBModel = ({ modelPath, landmarksRef, containerRef, colorHex }) => {
  const { scene }      = useGLTF(modelPath);
  const cloned         = useMemo(() => scene.clone(true), [scene]);
  const groupRef       = useRef();
  const { camera }     = useThree();

  /* measure model bounding box once */
  const modelBox = useMemo(() => {
    const box  = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const ctr  = box.getCenter(new THREE.Vector3());
    return { w: size.x || 1, h: size.y || 1, d: size.z || 1, ctr };
  }, [cloned]);

  /* apply color tint */
  useEffect(() => {
    if (!colorHex) return;
    cloned.traverse(child => {
      if (child.isMesh) {
        const m = child.material.clone();
        m.color.set(colorHex);
        m.transparent = false;
        m.opacity = 1;
        child.material = m;
      }
    });
  }, [cloned, colorHex]);

  useFrame(() => {
    const lm        = landmarksRef.current;
    const container = containerRef.current;
    const group     = groupRef.current;
    if (!lm || !container || !group) return;

    const ls = lm[11], rs = lm[12];
    const lh = lm[23], rh = lm[24];
    if (!ls || !rs || !lh || !rh) return;

    const dw = container.offsetWidth;
    const dh = container.offsetHeight;

    // Mirror X: display_x = (1 - lm.x) * dw
    const mx = v => (1 - v) * dw;
    const py = v => v * dh;

    const lsX = mx(ls.x), lsY = py(ls.y);
    const rsX = mx(rs.x), rsY = py(rs.y);
    const lhY = py(lh.y);
    const rhY = py(rh.y);

    const shoulderCX = (lsX + rsX) / 2;
    const shoulderCY = (lsY + rsY) / 2;
    const hipCY      = (lhY + rhY) / 2;
    const torsoMidY  = (shoulderCY + hipCY) / 2;
    const swPx       = Math.abs(lsX - rsX);
    const thPx       = Math.abs(hipCY - shoulderCY);
    const bodyAngle  = Math.atan2(rsY - lsY, rsX - lsX);

    // Scale to fill torso (shoulder width x torso height)
    const targetW = swPx * 1.6;
    const targetH = thPx * 1.3;
    const scaleW  = targetW / (modelBox.w  || 1);
    const scaleH  = targetH / (modelBox.h  || 1);
    const scale   = Math.max(scaleW, scaleH);

    // Camera is Y-down (top=0, bottom=dh → Y increases downward like CSS).
    // GLB models are Y-up (collar at positive Y, hem at negative Y).
    // We use scale.y = -scale to FLIP the model vertically so collar appears at top.
    //
    // With -scale.y:
    //   Model center at model.ctr → world Y = posY + ctr.y * (-scale) = posY - ctr.y*scale
    //   We want model center at torsoMidY → posY = torsoMidY + ctr.y * scale
    const posX = shoulderCX - modelBox.ctr.x * scale;
    const posY = torsoMidY  + modelBox.ctr.y * scale;

    group.position.set(posX, posY, 0);
    group.scale.set(scale, -scale, scale);   // negative Y = flip right-side up
    group.rotation.set(0, 0, bodyAngle);
  });

  return (
    <group ref={groupRef}>
      <primitive object={cloned} />
    </group>
  );
};

/* ─────────────────────────────────────────────────────────────
   OrthoSync — keeps orthographic camera in sync with container
   World space = pixel space, origin top-left, Y increases down
   ───────────────────────────────────────────────────────────── */
const OrthoSync = ({ containerRef }) => {
  const { camera } = useThree();
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const dw = containerRef.current.offsetWidth;
      const dh = containerRef.current.offsetHeight;
      // Y-down camera: world (0,0)=top-left, world (dw,dh)=bottom-right
      // This maps display pixel coords directly to world units
      camera.left   = 0;
      camera.right  = dw;
      camera.top    = 0;    // world Y=0 at TOP of screen
      camera.bottom = dh;   // world Y=dh at BOTTOM of screen
      camera.near   = -500;
      camera.far    = 500;
      camera.position.set(0, 0, 100);
      camera.zoom   = 1;
      camera.updateProjectionMatrix();
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [camera, containerRef]);
  return null;
};

/* ─────────────────────────────────────────────────────────────
   CameraView — main component
   ───────────────────────────────────────────────────────────── */
const CameraView = ({ product, color, showDebug = false }) => {
  const { videoRef, active: cameraActive, dimensions, start: startCamera } = useCamera();
  const { ready: poseReady, detect } = usePoseDetection();

  const containerRef   = useRef(null);
  const svgRef         = useRef(null);
  const debugCanvasRef = useRef(null);
  const animRef        = useRef(null);
  const landmarksRef   = useRef(null);   /* shared with GLB via ref, no re-render */

  const [started,      setStarted]      = useState(false);
  const [bodyDetected, setBodyDetected] = useState(false);
  const [status,       setStatus]       = useState('idle');

  const modelPath    = GARMENT_MODELS[product?.slug] || null;
  const hasGLB       = Boolean(modelPath);
  const garmentColor = color?.hex || '#1B4A2A';

  const handleStart = useCallback(async () => {
    setStarted(true);
    setStatus('loading');
    await startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (started && cameraActive && poseReady) setStatus('ready');
    else if (started && cameraActive) setStatus('loading');
  }, [started, cameraActive, poseReady]);

  /* ── Main RAF loop ── */
  useEffect(() => {
    if (!cameraActive || !poseReady) return;

    const hideSVG = () => { if (svgRef.current) svgRef.current.style.display = 'none'; };

    const loop = () => {
      const lm        = detect(videoRef.current);
      const container = containerRef.current;

      if (lm && container) {
        landmarksRef.current = lm;

        const dw = container.offsetWidth;
        const dh = container.offsetHeight;
        const mx = v => (1 - v) * dw;
        const py = v => v * dh;

        const ls = lm[11], rs = lm[12];
        const le = lm[13], re = lm[14];
        const lh = lm[23], rh = lm[24];

        if (ls && rs && lh && rh) {
          setBodyDetected(true);
          setStatus('detecting');

          if (!hasGLB && svgRef.current) {
            /* ── SVG fallback shirt ── */
            const svg = svgRef.current;
            const lsX = mx(ls.x), lsY = py(ls.y);
            const rsX = mx(rs.x), rsY = py(rs.y);
            const lhX = mx(lh.x), lhY = py(lh.y);
            const rhX = mx(rh.x), rhY = py(rh.y);
            const leX = le ? mx(le.x) : lsX + (lsX - rsX) * 0.65;
            const leY = le ? py(le.y) : lsY + Math.abs(lhY - lsY) * 0.4;
            const reX = re ? mx(re.x) : rsX + (rsX - lsX) * 0.65;
            const reY = re ? py(re.y) : rsY + Math.abs(rhY - rsY) * 0.4;

            const swPx = Math.abs(lsX - rsX);
            const thPx = Math.abs(((lsY + rsY) / 2) - ((lhY + rhY) / 2));
            const pad  = swPx * 0.28;
            const hemY = Math.max(lhY, rhY) + thPx * 0.18;
            const neckX  = (lsX + rsX) / 2;
            const neckY  = Math.min(lsY, rsY) - swPx * 0.08;
            const neckHW = swPx * 0.14;
            const lsOX = lsX + pad, lsOY = lsY;
            const rsOX = rsX - pad, rsOY = rsY;
            const lhOX = lhX + pad * 0.75;
            const rhOX = rhX - pad * 0.75;
            const sW = swPx * 0.19, eW = swPx * 0.13;
            const lA = Math.atan2(leY - lsY, leX - lsX);
            const lPX = Math.cos(lA + Math.PI/2) * sW, lPY = Math.sin(lA + Math.PI/2) * sW;
            const lEX = Math.cos(lA + Math.PI/2) * eW, lEY = Math.sin(lA + Math.PI/2) * eW;
            const rA = Math.atan2(reY - rsY, reX - rsX);
            const rPX = Math.cos(rA + Math.PI/2) * sW, rPY = Math.sin(rA + Math.PI/2) * sW;
            const rEX = Math.cos(rA + Math.PI/2) * eW, rEY = Math.sin(rA + Math.PI/2) * eW;

            svg.setAttribute('width', dw);
            svg.setAttribute('height', dh);
            svg.setAttribute('viewBox', `0 0 ${dw} ${dh}`);
            svg.style.display = 'block';

            const tPts = `M${neckX-neckHW} ${neckY} Q${lsOX-pad*.1} ${lsOY-pad*.4},${lsOX} ${lsOY} L${lhOX} ${hemY} L${rhOX} ${hemY} Q${rsOX+pad*.1} ${rsOY-pad*.4},${rsOX} ${rsOY} L${neckX+neckHW} ${neckY} Q${neckX} ${neckY+swPx*.12},${neckX-neckHW} ${neckY} Z`;
            svg.querySelector('#s-torso')?.setAttribute('d', tPts);
            svg.querySelector('#s-shine')?.setAttribute('d', tPts);
            svg.querySelector('#s-sl')?.setAttribute('points', `${lsOX+lPX},${lsOY+lPY} ${leX+lEX},${leY+lEY} ${leX-lEX},${leY-lEY} ${lsOX-lPX},${lsOY-lPY}`);
            svg.querySelector('#s-sr')?.setAttribute('points', `${rsOX+rPX},${rsOY+rPY} ${reX+rEX},${reY+rEY} ${reX-rEX},${reY-rEY} ${rsOX-rPX},${rsOY-rPY}`);
            svg.querySelector('#s-col')?.setAttribute('d', `M${neckX-neckHW} ${neckY} Q${neckX} ${neckY+swPx*.12},${neckX+neckHW} ${neckY}`);
          }

          /* ── Debug skeleton ── */
          if (showDebug && debugCanvasRef.current) {
            const cv = debugCanvasRef.current;
            cv.width = dw; cv.height = dh;
            const ctx = cv.getContext('2d');
            ctx.clearRect(0, 0, dw, dh);
            [[11,12],[11,23],[12,24],[23,24],[11,13],[12,14]].forEach(([a,b]) => {
              const la = lm[a], lb = lm[b]; if (!la||!lb) return;
              ctx.beginPath(); ctx.moveTo(mx(la.x),py(la.y)); ctx.lineTo(mx(lb.x),py(lb.y));
              ctx.strokeStyle='rgba(201,232,107,.6)'; ctx.lineWidth=2; ctx.stroke();
            });
            [11,12,13,14,23,24].forEach(i => {
              const p = lm[i]; if (!p) return;
              ctx.beginPath(); ctx.arc(mx(p.x),py(p.y),5,0,Math.PI*2);
              ctx.fillStyle='#c9e86b'; ctx.fill();
            });
          }

          animRef.current = requestAnimationFrame(loop);
          return;
        }
      }

      landmarksRef.current = null;
      setBodyDetected(false);
      setStatus('waiting');
      hideSVG();
      animRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [cameraActive, poseReady, detect, showDebug, hasGLB]);

  const captureScreenshot = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    ctx.save(); ctx.scale(-1,1); ctx.drawImage(v,-c.width,0,c.width,c.height); ctx.restore();
    const a = document.createElement('a');
    a.download = `couplecotton-tryon-${Date.now()}.png`;
    a.href = c.toDataURL(); a.click();
  }, []);

  const statusConfig = {
    idle:      { dot:'wait', text:'Click to start camera' },
    loading:   { dot:'wait', text: poseReady ? 'Starting camera…' : 'Loading AI model…' },
    ready:     { dot:'wait', text:'Stand in front of camera' },
    detecting: { dot:'ok',   text:'Body detected — trying on!' },
    waiting:   { dot:'wait', text:'Step into frame' },
  };
  const st = statusConfig[status] || statusConfig.idle;

  return (
    <div ref={containerRef} className="pdp__tryon-camera">

      {!started && (
        <div className="pdp__tryon-prompt">
          <span className="pdp__tryon-prompt-icon">📷</span>
          <p>Stand in front of your camera to see<br />
            <strong>{product?.name || 'this item'}</strong> on your body</p>
          <button className="pdp__tryon-start-btn" onClick={handleStart}>Start Camera</button>
        </div>
      )}

      {started && (!cameraActive || !poseReady) && (
        <div className="pdp__tryon-prompt" style={{ background:'rgba(26,46,26,0.95)' }}>
          <div style={{
            width:44,height:44,border:'3px solid rgba(201,232,107,0.2)',
            borderTopColor:'#c9e86b',borderRadius:'50%',
            animation:'pdp-spin 0.8s linear infinite',
          }}/>
          <p>{poseReady ? 'Accessing camera…' : 'Loading body detection AI…'}</p>
          <style>{`@keyframes pdp-spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {cameraActive && (
        <div className="pdp__tryon-status">
          <span className={`pdp__tryon-status-dot pdp__tryon-status-dot--${st.dot}`}/>
          <span className="pdp__tryon-status-text">{st.text}</span>
        </div>
      )}

      {/* Video */}
      <video ref={videoRef} className="pdp__tryon-video" playsInline muted
        style={{ display: cameraActive ? 'block' : 'none' }}/>

      {/* THREE.JS GLB overlay — no CSS transform, coords pre-mirrored */}
      {cameraActive && hasGLB && (
        <Canvas
          orthographic
          gl={{ alpha:true, antialias:true }}
          style={{
            position:'absolute', top:0, left:0,
            width:'100%', height:'100%',
            pointerEvents:'none', zIndex:2,
          }}
        >
          <OrthoSync containerRef={containerRef} />
          <ambientLight intensity={1.2} />
          <directionalLight position={[3,5,5]} intensity={0.8} />
          <directionalLight position={[-3,2,-3]} intensity={0.3} />
          <React.Suspense fallback={null}>
            <GLBModel
              modelPath={modelPath}
              landmarksRef={landmarksRef}
              containerRef={containerRef}
              colorHex={garmentColor}
            />
          </React.Suspense>
        </Canvas>
      )}

      {/* SVG fallback (no GLB) */}
      {!hasGLB && (
        <svg ref={svgRef} style={{
          position:'absolute', top:0, left:0,
          width:'100%', height:'100%',
          pointerEvents:'none', display:'none', zIndex:2,
        }}>
          <defs>
            <filter id="s-shadow">
              <feDropShadow dx="1" dy="2" stdDeviation="3" floodOpacity="0.35"/>
            </filter>
            <linearGradient id="s-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="white" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="black" stopOpacity="0.12"/>
            </linearGradient>
          </defs>
          <path id="s-torso" fill={garmentColor} fillOpacity="0.92" filter="url(#s-shadow)"/>
          <path id="s-shine" fill="url(#s-grad)"/>
          <polygon id="s-sl" fill={garmentColor} fillOpacity="0.92"/>
          <polygon id="s-sr" fill={garmentColor} fillOpacity="0.92"/>
          <path id="s-col" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}

      {/* Debug */}
      {showDebug && (
        <canvas ref={debugCanvasRef} style={{
          position:'absolute', top:0, left:0,
          width:'100%', height:'100%',
          pointerEvents:'none',
          display: cameraActive ? 'block' : 'none',
          zIndex:5,
        }}/>
      )}

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
