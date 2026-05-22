import React, { useRef, useEffect, useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   GarmentRenderer — 2.5D Layered Cloth Compositing Engine
   Replaces the old single-mesh TPS and GLB pipelines with a
   fast, multi-layered canvas compositing approach.
   ───────────────────────────────────────────────────────────── */

const GarmentRenderer = ({ 
  assets, // { torso, leftSleeve, rightSleeve, collar }
  bodyMetrics, 
  videoWidth, 
  videoHeight 
}) => {
  const canvasRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});

  // 1. Load image assets
  useEffect(() => {
    if (!assets) return;
    
    let isCancelled = false;
    const loadImages = async () => {
      const keys = Object.keys(assets);
      const promises = keys.map((key) => {
        return new Promise((resolve) => {
          if (!assets[key]) {
            resolve({ key, img: null });
            return;
          }
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve({ key, img });
          img.onerror = () => resolve({ key, img: null });
          img.src = assets[key];
        });
      });

      const results = await Promise.all(promises);
      if (isCancelled) return;

      const newImages = {};
      results.forEach(({ key, img }) => {
        if (img) newImages[key] = img;
      });
      setLoadedImages(newImages);
    };

    loadImages();

    return () => {
      isCancelled = true;
    };
  }, [assets]);

  // 2. Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bodyMetrics || !videoWidth || !videoHeight) return;

    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    const {
      landmarks,
      worldLandmarks
    } = bodyMetrics;

    if (!landmarks || !worldLandmarks || landmarks.length < 25) return;

    // MediaPipe Pose landmarks
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // World Landmarks for true 3D rotations/angles
    const wLeftShoulder = worldLandmarks[11];
    const wRightShoulder = worldLandmarks[12];
    const wLeftElbow = worldLandmarks[13];
    const wRightElbow = worldLandmarks[14];

    // Convert to pixel space
    const ls = { x: leftShoulder.x * videoWidth, y: leftShoulder.y * videoHeight };
    const rs = { x: rightShoulder.x * videoWidth, y: rightShoulder.y * videoHeight };
    
    const lh = leftHip ? { x: leftHip.x * videoWidth, y: leftHip.y * videoHeight } : { x: ls.x, y: ls.y + videoHeight * 0.4 };
    const rh = rightHip ? { x: rightHip.x * videoWidth, y: rightHip.y * videoHeight } : { x: rs.x, y: rs.y + videoHeight * 0.4 };
    
    const swPx = Math.abs(ls.x - rs.x) * 1.2; // roughly shoulder width
    const thPx = Math.abs(lh.y - ls.y); // torso height
    
    const shoulderMidX = (ls.x + rs.x) / 2;
    const shoulderMidY = (ls.y + rs.y) / 2;
    
    // Use worldLandmarks to determine the true 3D shoulder angle
    // dx and dy in the physical plane (assuming z is depth, x is lateral, y is vertical)
    const shoulderAngle3D = Math.atan2(wRightShoulder.y - wLeftShoulder.y, wRightShoulder.x - wLeftShoulder.x);

    ctx.save();
    
    // ─── HELPER: Draw Layer ───
    const drawLayer = (img, x, y, width, height, angle, originX = 0.5, originY = 0.5) => {
      if (!img) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      // originX/Y define pivot point relative to image dimensions
      ctx.drawImage(img, -width * originX, -height * originY, width, height);
      ctx.restore();
    };

    // ─── 1. TORSO ───
    if (loadedImages.torso) {
      const hipsMidX = (lh.x + rh.x) / 2;
      const hipsMidY = (lh.y + rh.y) / 2;
      
      const torsoCenterX = (shoulderMidX + hipsMidX) / 2;
      const torsoCenterY = (shoulderMidY + hipsMidY) / 2;

      const displayWidth = swPx * 1.5; 
      const displayHeight = thPx * 1.2;

      drawLayer(
        loadedImages.torso,
        torsoCenterX,
        torsoCenterY,
        displayWidth,
        displayHeight,
        shoulderAngle3D, 
        0.5, 
        0.5
      );
    }

    // ─── 2. LEFT SLEEVE ───
    if (loadedImages.leftSleeve) {
      const startX = ls.x;
      const startY = ls.y;
      
      const leX = leftElbow ? leftElbow.x * videoWidth : ls.x + swPx * 0.4;
      const leY = leftElbow ? leftElbow.y * videoHeight : ls.y + swPx * 0.4;

      // Use true 3D vector for sleeve angle mapping
      let sleeveAngle = Math.atan2(leY - startY, leX - startX);
      if (wLeftElbow) {
        sleeveAngle = Math.atan2(wLeftElbow.y - wLeftShoulder.y, wLeftElbow.x - wLeftShoulder.x);
      }

      // Foreshortening: Use 3D length vs 2D length to determine scale/perspective
      // For now, sticking to constant length or simple 2D distance
      const sleeveLength = Math.hypot(leX - startX, leY - startY) * 1.2; 
      const sleeveWidth = swPx * 0.6; 

      drawLayer(
        loadedImages.leftSleeve,
        startX,
        startY,
        sleeveLength,
        sleeveWidth,
        sleeveAngle,
        0.1, 
        0.5  
      );
    }

    // ─── 3. RIGHT SLEEVE ───
    if (loadedImages.rightSleeve) {
      const startX = rs.x;
      const startY = rs.y;
      
      const reX = rightElbow ? rightElbow.x * videoWidth : rs.x - swPx * 0.4;
      const reY = rightElbow ? rightElbow.y * videoHeight : rs.y + swPx * 0.4;

      let sleeveAngle = Math.atan2(reY - startY, reX - startX);
      if (wRightElbow) {
         sleeveAngle = Math.atan2(wRightElbow.y - wRightShoulder.y, wRightElbow.x - wRightShoulder.x);
      }

      const sleeveLength = Math.hypot(reX - startX, reY - startY) * 1.2;
      const sleeveWidth = swPx * 0.6;

      drawLayer(
        loadedImages.rightSleeve,
        startX,
        startY,
        sleeveLength,
        sleeveWidth,
        sleeveAngle,
        0.1, 
        0.5 
      );
    }

    // ─── 4. COLLAR ───
    if (loadedImages.collar) {
      const collarWidth = swPx * 0.8;
      const collarHeight = collarWidth * (loadedImages.collar.height / loadedImages.collar.width);
      
      const offsetX = Math.cos(shoulderAngle3D + Math.PI/2) * (collarHeight * 0.2);
      const offsetY = Math.sin(shoulderAngle3D + Math.PI/2) * (collarHeight * 0.2);

      drawLayer(
        loadedImages.collar,
        shoulderMidX - offsetX,
        shoulderMidY - offsetY,
        collarWidth, 
        collarHeight,
        shoulderAngle3D, 
        0.5,
        0.8 
      );
    }

    ctx.restore();

  }, [loadedImages, bodyMetrics, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      className="tryon__canvas-layered-garment"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        transform: 'scaleX(-1)', // Mirror to match the camera feed
      }}
    />
  );
};

export default GarmentRenderer;
