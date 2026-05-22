import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────
   ShirtGLB.jsx — Loads and rigs the 3D shirt model
   ───────────────────────────────────────────────────────────── */

export const ShirtGLB = forwardRef(({ url }, ref) => {
  const { scene, nodes, materials } = useGLTF(url);
  const groupRef = useRef();

  // Find bones dynamically if they exist (common Mixamo/Blender names)
  const bones = useRef({
    spine: null,
    leftShoulder: null,
    rightShoulder: null,
    leftArm: null,
    rightArm: null,
  });

  useEffect(() => {
    if (!scene) return;
    
    // Log nodes for debugging if we need to find exact bone names
    // console.log("GLTF Nodes:", Object.keys(nodes));

    // Simple heuristic to find bones
    scene.traverse((obj) => {
      if (obj.isBone || obj.type === 'Bone' || obj.isObject3D) {
        const name = obj.name.toLowerCase();
        if (name.includes('spine') || name.includes('torso') || name.includes('chest')) bones.current.spine = obj;
        else if (name.includes('left') && (name.includes('shoulder') || name.includes('clavicle'))) bones.current.leftShoulder = obj;
        else if (name.includes('right') && (name.includes('shoulder') || name.includes('clavicle'))) bones.current.rightShoulder = obj;
        else if (name.includes('left') && (name.includes('arm') || name.includes('bicep'))) bones.current.leftArm = obj;
        else if (name.includes('right') && (name.includes('arm') || name.includes('bicep'))) bones.current.rightArm = obj;
      }
    });

    // Fix material to be double sided so we can see the inside of the shirt
    Object.values(materials).forEach((mat) => {
      if (mat) {
        mat.side = THREE.DoubleSide;
        mat.needsUpdate = true;
      }
    });
  }, [scene, nodes, materials]);

  useImperativeHandle(ref, () => ({
    setPose: (landmarks, dw, dh) => {
      if (!groupRef.current || !landmarks) return;

      const ls = landmarks[11], rs = landmarks[12];
      const lh = landmarks[23], rh = landmarks[24];
      if (!ls || !rs || !lh || !rh) return;

      // Calculate torso center and scale based on screen dimensions
      const mx = v => (1 - v) * dw; // Mirror X
      const py = v => v * dh;

      const smX = (mx(ls.x) + mx(rs.x)) / 2;
      const smY = (py(ls.y) + py(rs.y)) / 2;
      
      const hmX = (mx(lh.x) + mx(rh.x)) / 2;
      const hmY = (py(lh.y) + py(rh.y)) / 2;
      
      const torsoH = Math.abs(smY - hmY);
      const sw = Math.abs(mx(ls.x) - mx(rs.x));

      // 1. Convert screen coordinates to Three.js world coordinates
      // Assuming orthographic camera [-dw/2, dw/2]
      const worldX = smX - dw / 2;
      const worldY = -(smY - dh / 2) - torsoH * 0.15; // Offset to put collar near neck

      groupRef.current.position.set(worldX, worldY, 0);

      // 2. Scale the model to fit the body
      // This requires knowing the base size of the GLB. We apply a dynamic scale factor.
      // E.g., if the GLB is 1 unit wide, and shoulders are `sw` pixels wide:
      const scaleFactor = sw * 1.5; // Adjust this multiplier based on the specific GLB's base scale
      groupRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // 3. Apply Parallax Rotation (Z-depth mapping)
      // MediaPipe Z: negative is closer to camera.
      // If left shoulder is closer than right, torso is rotated.
      const zDiff = (ls.z - rs.z) * 2.0; // multiplier for sensitivity
      groupRef.current.rotation.y = zDiff;

      // 4. Animate Bones (if they exist)
      if (bones.current.leftArm && landmarks[13]) {
        // Calculate angle of left arm
        const leX = mx(landmarks[13].x), leY = py(landmarks[13].y);
        const angle = Math.atan2(leY - py(ls.y), leX - mx(ls.x));
        // Note: bone rotation axes depend entirely on the Blender rig export!
        // We might need to adjust this axis (z vs x vs y)
        bones.current.leftArm.rotation.z = angle;
      }
      
      if (bones.current.rightArm && landmarks[14]) {
        const reX = mx(landmarks[14].x), reY = py(landmarks[14].y);
        const angle = Math.atan2(reY - py(rs.y), reX - mx(rs.x));
        bones.current.rightArm.rotation.z = angle + Math.PI; // mirrored
      }
    }
  }));

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  );
});

// Preload the model
useGLTF.preload('/garments/cc-cotton-polo-pair.glb');
