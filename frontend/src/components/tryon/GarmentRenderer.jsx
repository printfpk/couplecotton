import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────
   GarmentModel — Loads a .glb and scales it to match the
   detected body using an orthographic camera overlay.
   ───────────────────────────────────────────────────────────── */
const GarmentModel = ({ modelPath, bodyMetrics, color, videoWidth, videoHeight }) => {
  const groupRef = useRef();
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Measure the model's native bounding box once
  const modelInfo = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return { width: size.x || 1, height: size.y || 1, depth: size.z || 1, center };
  }, [clonedScene]);

  // Apply color tint
  useEffect(() => {
    if (!color) return;
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = child.material.clone();
        mat.color = new THREE.Color(color);
        child.material = mat;
      }
    });
  }, [clonedScene, color]);

  // Position/scale each frame based on body landmarks
  useFrame(() => {
    if (!groupRef.current || !bodyMetrics || !videoWidth || !videoHeight) return;

    const { shoulderMid, hipMid, shoulderWidth, torsoHeight, bodyAngle, depthZ } = bodyMetrics;

    // Convert to pixel coordinates
    const smX = shoulderMid.x * videoWidth;
    const smY = shoulderMid.y * videoHeight;
    const hmY = hipMid.y * videoHeight;
    const swPx = shoulderWidth * videoWidth;
    const thPx = torsoHeight * videoHeight;

    // Scale: use the larger of width-based or height-based scaling
    const targetWidth = swPx * 1.8;
    const targetHeight = thPx * 1.5;
    const scaleW = targetWidth / modelInfo.width;
    const scaleH = targetHeight / modelInfo.height;
    const finalScale = Math.max(scaleW, scaleH);

    const centerOffsetX = modelInfo.center.x * finalScale;
    const centerOffsetY = modelInfo.center.y * finalScale;
    const bodyMidY = (smY + hmY) / 2;

    groupRef.current.position.set(smX - centerOffsetX, bodyMidY + centerOffsetY, 1 + depthZ);
    groupRef.current.scale.setScalar(finalScale);
    groupRef.current.rotation.set(0, 0, -bodyAngle);
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
};

/* ─────────────────────────────────────────────────────────────
   OrthoCamera — Syncs orthographic camera to video dimensions
   ───────────────────────────────────────────────────────────── */
const OrthoCamera = ({ videoWidth, videoHeight }) => {
  const { camera } = useThree();
  useEffect(() => {
    if (!videoWidth || !videoHeight) return;
    camera.left = 0;
    camera.right = videoWidth;
    camera.top = 0;
    camera.bottom = videoHeight;
    camera.near = 0.1;
    camera.far = 100;
    camera.position.set(0, 0, 10);
    camera.updateProjectionMatrix();
  }, [camera, videoWidth, videoHeight]);
  return null;
};

/* ─────────────────────────────────────────────────────────────
   GLBScene — Three.js scene for .glb models only
   ───────────────────────────────────────────────────────────── */
const GLBScene = ({ modelPath, bodyMetrics, color, videoWidth, videoHeight }) => (
  <>
    <OrthoCamera videoWidth={videoWidth} videoHeight={videoHeight} />
    <ambientLight intensity={0.8} />
    <directionalLight position={[2, 3, 4]} intensity={0.7} />
    <directionalLight position={[-2, 1, -2]} intensity={0.3} />
    <React.Suspense fallback={null}>
      <GarmentModel
        modelPath={modelPath}
        bodyMetrics={bodyMetrics}
        color={color}
        videoWidth={videoWidth}
        videoHeight={videoHeight}
      />
    </React.Suspense>
  </>
);

/* ─────────────────────────────────────────────────────────────
   Canvas2DGarment — Draws a shirt shape directly on a 2D
   canvas using actual body landmark pixel positions.
   
   This is the fallback when no .glb model is available.
   Much more accurate than 3D boxes because it uses the
   real landmark positions to draw the garment contour.
   ───────────────────────────────────────────────────────────── */
const Canvas2DGarment = ({ bodyMetrics, color, garmentType, videoWidth, videoHeight }) => {
  const canvasRef = useRef(null);
  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bodyMetrics || !videoWidth || !videoHeight) return;

    // Only reset canvas dimensions if they changed
    if (dimsRef.current.w !== videoWidth || dimsRef.current.h !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      dimsRef.current = { w: videoWidth, h: videoHeight };
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    const {
      leftShoulder, rightShoulder,
      leftElbow, rightElbow,
      leftHip, rightHip,
      shoulderWidth, torsoHeight,
    } = bodyMetrics;

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return;

    // Convert normalized (0-1) to pixel coordinates
    const lsX = leftShoulder.x * videoWidth;
    const lsY = leftShoulder.y * videoHeight;
    const rsX = rightShoulder.x * videoWidth;
    const rsY = rightShoulder.y * videoHeight;
    const lhX = leftHip.x * videoWidth;
    const lhY = leftHip.y * videoHeight;
    const rhX = rightHip.x * videoWidth;
    const rhY = rightHip.y * videoHeight;

    const swPx = shoulderWidth * videoWidth;
    const thPx = torsoHeight * videoHeight;

    // ─── Key proportions ───
    // Generous padding so shirt extends well past the body
    const pad = swPx * 0.30;

    // Neckline center
    const neckX = (lsX + rsX) / 2;
    const neckY = (lsY + rsY) / 2 - pad * 0.4;

    // Outer shoulder points (where shirt edge sits, past actual shoulders)
    const lsOutX = lsX + pad;
    const lsOutY = lsY;
    const rsOutX = rsX - pad;
    const rsOutY = rsY;

    // Hem points (below hips, shirt hangs lower)
    const hemDrop = thPx * 0.20; // shirt extends 20% below hip line
    const lhOutX = lhX + pad * 0.8;
    const lhOutY = lhY + hemDrop;
    const rhOutX = rhX - pad * 0.8;
    const rhOutY = rhY + hemDrop;

    // Armpit / side seam midpoints (slight outward bulge for natural body curve)
    const lArmpit = {
      x: (lsOutX + lhOutX) / 2 + pad * 0.3,
      y: (lsOutY + lhOutY) / 2 - thPx * 0.05,
    };
    const rArmpit = {
      x: (rsOutX + rhOutX) / 2 - pad * 0.3,
      y: (rsOutY + rhOutY) / 2 - thPx * 0.05,
    };

    // Waist taper (slight inward curve at waist)
    const waistInset = pad * 0.15;
    const lWaist = {
      x: (lsOutX + lhOutX) / 2 + pad * 0.1 - waistInset,
      y: (lsOutY + lhOutY) / 2 + thPx * 0.15,
    };
    const rWaist = {
      x: (rsOutX + rhOutX) / 2 - pad * 0.1 + waistInset,
      y: (rsOutY + rhOutY) / 2 + thPx * 0.15,
    };

    // Elbow positions for sleeves
    const leX = leftElbow ? leftElbow.x * videoWidth : lsX + swPx * 0.5;
    const leY = leftElbow ? leftElbow.y * videoHeight : lsY + swPx * 0.45;
    const reX = rightElbow ? rightElbow.x * videoWidth : rsX - swPx * 0.5;
    const reY = rightElbow ? rightElbow.y * videoHeight : rsY + swPx * 0.45;

    // Sleeve dimensions
    const sleeveWidthTop = swPx * 0.22;
    const sleeveWidthBottom = swPx * 0.16;

    const fillColor = color || '#1B2A4A';

    // ─── DRAW TORSO ───
    // Shape: neckline → right shoulder → right side curve → right hem →
    //        left hem → left side curve → left shoulder → neckline
    ctx.beginPath();

    // Start at neckline (right side of neck opening)
    ctx.moveTo(neckX + swPx * 0.06, neckY);

    // Neckline curve to right shoulder
    ctx.quadraticCurveTo(
      rsOutX + pad * 0.1, rsOutY - pad * 0.6,
      rsOutX, rsOutY
    );

    // Right side: shoulder → armpit → waist → hip (natural body curve)
    ctx.bezierCurveTo(
      rArmpit.x, rArmpit.y,
      rWaist.x, rWaist.y,
      rhOutX, rhOutY
    );

    // Bottom hem (slight curve)
    const hemMidX = (lhOutX + rhOutX) / 2;
    const hemMidY = Math.max(lhOutY, rhOutY) + thPx * 0.03;
    ctx.quadraticCurveTo(hemMidX, hemMidY, lhOutX, lhOutY);

    // Left side: hip → waist → armpit → shoulder (natural body curve)
    ctx.bezierCurveTo(
      lWaist.x, lWaist.y,
      lArmpit.x, lArmpit.y,
      lsOutX, lsOutY
    );

    // Left shoulder back to neckline
    ctx.quadraticCurveTo(
      lsOutX - pad * 0.1, lsOutY - pad * 0.6,
      neckX - swPx * 0.06, neckY
    );

    // V-neckline
    ctx.quadraticCurveTo(
      neckX, neckY + swPx * 0.1,
      neckX + swPx * 0.06, neckY
    );

    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Subtle edge/shadow for depth
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ─── DRAW LEFT SLEEVE ───
    const lsAngle = Math.atan2(leY - lsY, leX - lsX);
    const lsPerpX = Math.cos(lsAngle + Math.PI / 2);
    const lsPerpY = Math.sin(lsAngle + Math.PI / 2);

    ctx.beginPath();
    // Start from shoulder outer edge (top of sleeve)
    ctx.moveTo(lsOutX + lsPerpX * sleeveWidthTop, lsOutY + lsPerpY * sleeveWidthTop);
    // To elbow (outer edge)
    ctx.lineTo(leX + lsPerpX * sleeveWidthBottom, leY + lsPerpY * sleeveWidthBottom);
    // Across elbow opening
    ctx.lineTo(leX - lsPerpX * sleeveWidthBottom, leY - lsPerpY * sleeveWidthBottom);
    // Back to shoulder (inner edge / armpit side)
    ctx.lineTo(lsOutX - lsPerpX * sleeveWidthTop, lsOutY - lsPerpY * sleeveWidthTop);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ─── DRAW RIGHT SLEEVE ───
    const rsAngle = Math.atan2(reY - rsY, reX - rsX);
    const rsPerpX = Math.cos(rsAngle + Math.PI / 2);
    const rsPerpY = Math.sin(rsAngle + Math.PI / 2);

    ctx.beginPath();
    ctx.moveTo(rsOutX + rsPerpX * sleeveWidthTop, rsOutY + rsPerpY * sleeveWidthTop);
    ctx.lineTo(reX + rsPerpX * sleeveWidthBottom, reY + rsPerpY * sleeveWidthBottom);
    ctx.lineTo(reX - rsPerpX * sleeveWidthBottom, reY - rsPerpY * sleeveWidthBottom);
    ctx.lineTo(rsOutX - rsPerpX * sleeveWidthTop, rsOutY - rsPerpY * sleeveWidthTop);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ─── COLLAR / NECKLINE highlight ───
    ctx.beginPath();
    ctx.moveTo(neckX - swPx * 0.06, neckY);
    ctx.quadraticCurveTo(neckX, neckY + swPx * 0.1, neckX + swPx * 0.06, neckY);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [bodyMetrics, color, garmentType, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        transform: 'scaleX(-1)', // mirror to match camera
      }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────
   GarmentRenderer — Decides between:
   1. Three.js Canvas with .glb model (when file exists)
   2. 2D Canvas with drawn garment shape (fallback)
   ───────────────────────────────────────────────────────────── */
const GarmentRenderer = ({ modelPath, bodyMetrics, color, garmentType, videoWidth, videoHeight }) => {
  const hasModel = modelPath && modelPath.endsWith('.glb');

  if (hasModel) {
    return (
      <Canvas
        orthographic
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        camera={{
          position: [0, 0, 10],
          near: 0.1,
          far: 100,
          left: 0,
          right: videoWidth || 640,
          top: 0,
          bottom: videoHeight || 480,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          transform: 'scaleX(-1)',
        }}
      >
        <GLBScene
          modelPath={modelPath}
          bodyMetrics={bodyMetrics}
          color={color}
          videoWidth={videoWidth}
          videoHeight={videoHeight}
        />
      </Canvas>
    );
  }

  // Fallback: 2D canvas garment drawn from body landmarks
  return (
    <Canvas2DGarment
      bodyMetrics={bodyMetrics}
      color={color}
      garmentType={garmentType}
      videoWidth={videoWidth}
      videoHeight={videoHeight}
    />
  );
};

export default GarmentRenderer;
