import React, { useRef, useEffect, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   ARViewer — A-Frame + WebXR immersive AR mode
   Opens full-screen AR camera passthrough with the .glb
   clothing model placed in real-world space on the user's body.
   ───────────────────────────────────────────────────────────── */

// Garment path mapping
const GARMENT_MODELS = {
  'cc-cotton-polo-pair':     '/garments/cc-cotton-polo-pair.glb',
  'cc-linen-couple-shirt':   '/garments/cc-linen-couple-shirt.glb',
  'cc-summer-short-set':     '/garments/cc-summer-short-set.glb',
  'cc-matching-hoodie-duo':  '/garments/cc-matching-hoodie-duo.glb',
  'cc-couple-graphic-tee':   '/garments/cc-couple-graphic-tee.glb',
};

const ARViewer = ({ product, color, onClose }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [arSupported, setARSupported] = useState(false);
  const [arActive, setARActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const modelPath = GARMENT_MODELS[product?.slug] || null;

  // Check WebXR AR support
  useEffect(() => {
    const check = async () => {
      if (navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setARSupported(supported);
        } catch {
          setARSupported(false);
        }
      }
    };
    check();
  }, []);

  // Initialize A-Frame scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Import A-Frame (side-effect: registers custom elements)
    import('aframe').then(() => {
      // Give A-Frame time to register
      setTimeout(() => {
        buildScene();
        setLoading(false);
      }, 500);
    });

    return () => {
      // Cleanup A-Frame scene
      if (sceneRef.current && containerRef.current?.contains(sceneRef.current)) {
        containerRef.current.removeChild(sceneRef.current);
      }
    };
  }, []);

  const buildScene = useCallback(() => {
    if (!containerRef.current) return;

    // Remove existing scene if any
    const existing = containerRef.current.querySelector('a-scene');
    if (existing) existing.remove();

    // Create A-Frame scene element
    const scene = document.createElement('a-scene');
    scene.setAttribute('embedded', '');
    scene.setAttribute('vr-mode-ui', 'enabled: false');
    scene.setAttribute('renderer', 'colorManagement: true; alpha: true');
    scene.setAttribute('background', 'color: transparent');

    // If AR supported, enable WebXR
    if (arSupported) {
      scene.setAttribute('webxr', 'requiredFeatures: hit-test,local-floor; optionalFeatures: dom-overlay; overlayElement: #ar-overlay');
    }

    // Camera
    const camera = document.createElement('a-camera');
    camera.setAttribute('position', '0 1.6 0');
    camera.setAttribute('look-controls', 'enabled: false');
    scene.appendChild(camera);

    // Lighting
    const ambientLight = document.createElement('a-light');
    ambientLight.setAttribute('type', 'ambient');
    ambientLight.setAttribute('color', '#ffffff');
    ambientLight.setAttribute('intensity', '0.7');
    scene.appendChild(ambientLight);

    const dirLight = document.createElement('a-light');
    dirLight.setAttribute('type', 'directional');
    dirLight.setAttribute('color', '#ffffff');
    dirLight.setAttribute('intensity', '0.8');
    dirLight.setAttribute('position', '2 4 3');
    scene.appendChild(dirLight);

    // 3D garment model
    if (modelPath) {
      const entity = document.createElement('a-entity');
      entity.setAttribute('gltf-model', `url(${modelPath})`);
      entity.setAttribute('position', '0 0.8 -1.5');
      entity.setAttribute('scale', '1 1 1');
      entity.setAttribute('rotation', '0 0 0');
      entity.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 12000; easing: linear');
      entity.setAttribute('id', 'garment-model');

      // Apply color
      if (color?.hex) {
        entity.addEventListener('model-loaded', () => {
          const mesh = entity.getObject3D('mesh');
          if (mesh) {
            mesh.traverse((node) => {
              if (node.isMesh && node.material) {
                node.material.color.set(color.hex);
              }
            });
          }
        });
      }

      scene.appendChild(entity);
    } else {
      // Fallback: simple box placeholder
      const box = document.createElement('a-box');
      box.setAttribute('position', '0 0.8 -1.5');
      box.setAttribute('width', '0.6');
      box.setAttribute('height', '0.8');
      box.setAttribute('depth', '0.2');
      box.setAttribute('color', color?.hex || '#1B2A4A');
      box.setAttribute('opacity', '0.8');
      box.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear');
      box.setAttribute('id', 'garment-model');
      scene.appendChild(box);

      // Add text label
      const text = document.createElement('a-text');
      text.setAttribute('value', 'Place .glb model in\n/public/garments/');
      text.setAttribute('position', '0 1.6 -2');
      text.setAttribute('align', 'center');
      text.setAttribute('color', '#ffffff');
      text.setAttribute('width', '2');
      scene.appendChild(text);
    }

    // Floor plane (for non-AR mode)
    const floor = document.createElement('a-plane');
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('width', '10');
    floor.setAttribute('height', '10');
    floor.setAttribute('color', '#2a2a2a');
    floor.setAttribute('opacity', '0.3');
    floor.setAttribute('position', '0 0 0');
    scene.appendChild(floor);

    containerRef.current.appendChild(scene);
    sceneRef.current = scene;
  }, [modelPath, color, arSupported]);

  // Enter WebXR AR session
  const enterAR = useCallback(async () => {
    if (!sceneRef.current) return;
    try {
      const xrSystem = navigator.xr;
      if (!xrSystem) return;

      const session = await xrSystem.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['dom-overlay'],
      });

      const renderer = sceneRef.current.renderer;
      if (renderer) {
        await renderer.xr.setSession(session);
        setARActive(true);

        session.addEventListener('end', () => {
          setARActive(false);
        });
      }
    } catch (err) {
      console.error('Failed to enter AR:', err);
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 400, background: '#111' }}>
      {/* A-Frame container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', minHeight: 400 }}
      />

      {/* Loading */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 10,
          flexDirection: 'column', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, border: '3px solid rgba(201,232,107,0.2)',
            borderTopColor: '#c9e86b', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Loading 3D scene…</span>
        </div>
      )}

      {/* AR overlay controls */}
      <div id="ar-overlay" style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8, zIndex: 20,
      }}>
        {arSupported && !arActive && (
          <button onClick={enterAR} style={{
            padding: '10px 22px', border: 'none', borderRadius: 999,
            background: '#c9e86b', color: '#1a2e1a', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            🥽 Enter AR Mode
          </button>
        )}
        <button onClick={onClose} style={{
          padding: '10px 22px', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 999, background: 'rgba(30,59,42,0.85)',
          backdropFilter: 'blur(8px)', color: '#fff', fontSize: 13,
          fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ✕ Close 3D View
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ARViewer;
