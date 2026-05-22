/* ─────────────────────────────────────────────────────────────
   ClothMesh.js — 2D Static Canvas TPS Deformation

   Warps a high-res flat PNG onto the user's body using 
   Thin Plate Spline (TPS) on a dense grid for maximum fidelity.
   ───────────────────────────────────────────────────────────── */

import { TPS, buildWarpedGrid, drawWarpedMesh } from './tps';

// High-density grid for static photo rendering
const COLS = 30;
const ROWS = 35;

export const IMG_ANCHORS = [
  { x: 0.50, y: 0.04 },  // 0  collar centre
  { x: 0.30, y: 0.06 },  // 1  left collar edge
  { x: 0.70, y: 0.06 },  // 2  right collar edge
  { x: 0.08, y: 0.15 },  // 3  left shoulder tip
  { x: 0.92, y: 0.15 },  // 4  right shoulder tip
  { x: 0.00, y: 0.38 },  // 5  left sleeve end (outer)
  { x: 1.00, y: 0.38 },  // 6  right sleeve end (outer)
  { x: 0.08, y: 0.45 },  // 7  left sleeve end (inner/bottom)
  { x: 0.92, y: 0.45 },  // 8  right sleeve end (inner/bottom)
  { x: 0.15, y: 0.32 },  // 9  left armpit
  { x: 0.85, y: 0.32 },  // 10 right armpit
  { x: 0.15, y: 0.65 },  // 11 left side mid (waist)
  { x: 0.85, y: 0.65 },  // 12 right side mid (waist)
  { x: 0.20, y: 0.94 },  // 13 left hem corner
  { x: 0.80, y: 0.94 },  // 14 right hem corner
  { x: 0.50, y: 0.94 },  // 15 bottom hem centre
  { x: 0.50, y: 0.35 },  // 16 chest centre
  { x: 0.50, y: 0.65 },  // 17 belly centre
];

export class ClothMesh {
  constructor(imgUrl) {
    this.imgUrl = imgUrl;
    this.img = null;
    this._ready = false;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        this.img = image;
        this._ready = true;
        resolve();
      };
      image.onerror = reject;
      // Force loading as a 2D PNG since we dumped the 3D GLB architecture
      // For this static photo-based try-on, we require the transparent flat .png version.
      this.imgUrl = this.imgUrl.replace('.glb', '.png');
      image.src = this.imgUrl;
    });
  }

  renderToCanvas(ctx, bodyAnchors, dw, dh, dpr) {
    if (!this._ready || !bodyAnchors || bodyAnchors.length !== IMG_ANCHORS.length) return;

    // TPS expects source points in pixel coordinates of the image
    const iw = this.img.width;
    const ih = this.img.height;
    
    const srcPts = IMG_ANCHORS.map(a => ({ x: a.x * iw, y: a.y * ih }));
    const tpsSolver = new TPS(srcPts, bodyAnchors);

    const { src, dst } = buildWarpedGrid(iw, ih, COLS, ROWS, tpsSolver);
    drawWarpedMesh(ctx, this.img, src, dst, COLS, ROWS, dpr);
  }

  dispose() {
    this.img = null;
    this._ready = false;
  }
}

/* ── Build the 18 body anchor points from pose landmarks ──────── */
export function buildBodyAnchors(lm, dw, dh) {
  const mx = v => (1 - v) * dw;
  const py = v => v * dh;

  const ls = lm[11], rs = lm[12];
  const le = lm[13], re = lm[14];
  const lh = lm[23], rh = lm[24];

  if (!ls || !rs || !lh || !rh) return null;

  const lsX = mx(ls.x), lsY = py(ls.y);
  const rsX = mx(rs.x), rsY = py(rs.y);
  const lhX = mx(lh.x), lhY = py(lh.y);
  const rhX = mx(rh.x), rhY = py(rh.y);

  const smX = (lsX + rsX) / 2;
  const smY = (lsY + rsY) / 2;
  const hmX = (lhX + rhX) / 2;
  const hmY = (lhY + rhY) / 2;
  const torsoH = Math.abs(smY - hmY);
  const sw = Math.abs(lsX - rsX);
  
  const frontFacingFactor = Math.min(1, Math.max(0, sw / (torsoH * 1.2)));

  const SEXP = 0.18 + (0.34 - 0.18) * frontFacingFactor;  
  const HEXP = 0.25;  

  const halfSW = sw / 2;
  const halfHW = Math.abs(lhX - rhX) / 2;

  const lsXe = smX - halfSW * (1 + SEXP);
  const rsXe = smX + halfSW * (1 + SEXP);

  const lhXe = hmX - halfHW * (1 + HEXP);
  const rhXe = hmX + halfHW * (1 + HEXP);

  const neckLiftRatio = 0.38 - (0.38 - 0.22) * frontFacingFactor;
  const collarX = smX;
  const collarY = smY - torsoH * neckLiftRatio;

  const getElbow = (shoulderX, shoulderY, elbow, defaultDirX) => {
    if (elbow && elbow.visibility > 0.5) return { x: mx(elbow.x), y: py(elbow.y) };
    return { x: shoulderX + defaultDirX, y: shoulderY + torsoH * 0.4 };
  };

  const realLe = getElbow(lsX, lsY, le, -sw * 0.4);
  const realRe = getElbow(rsX, rsY, re, sw * 0.4);

  const lVecX = realLe.x - lsX, lVecY = realLe.y - lsY;
  const rVecX = realRe.x - rsX, rVecY = realRe.y - rsY;
  
  const lLen = Math.hypot(lVecX, lVecY) || 1;
  const rLen = Math.hypot(rVecX, rVecY) || 1;
  
  const lnx = lVecX / lLen, lny = lVecY / lLen;
  const rnx = rVecX / rLen, rny = rVecY / rLen;

  const lSleeveLen = lLen * 0.92;
  const rSleeveLen = rLen * 0.92;

  const leXe = lsXe + lnx * lSleeveLen;
  const leYe = lsY + lny * lSleeveLen;
  const reXe = rsXe + rnx * rSleeveLen;
  const reYe = rsY + rny * rSleeveLen;

  const hemY = hmY + torsoH * 0.35;
  const lerp = (a, b, t) => a + (b - a) * t;

  return [
    { x: collarX, y: collarY },                               
    { x: lerp(collarX, lsXe, 0.4), y: collarY + torsoH * 0.05 }, 
    { x: lerp(collarX, rsXe, 0.4), y: collarY + torsoH * 0.05 }, 
    { x: lsXe, y: lsY - torsoH * 0.05 },                      
    { x: rsXe, y: rsY - torsoH * 0.05 },                      
    
    { x: leXe, y: leYe },                                     
    { x: reXe, y: reYe },                                     
    
    { x: leXe - lny * (torsoH*0.15), y: leYe + lnx * (torsoH*0.15) }, 
    { x: reXe + rny * (torsoH*0.15), y: reYe - rnx * (torsoH*0.15) }, 
    
    { x: lerp(lsXe, lhXe, 0.25), y: lerp(lsY, lhY, 0.25) },   
    { x: lerp(rsXe, rhXe, 0.25), y: lerp(rsY, rhY, 0.25) },   
    
    { x: lerp(lsXe, lhXe, 0.65), y: lerp(lsY, lhY, 0.65) },   
    { x: lerp(rsXe, rhXe, 0.65), y: lerp(rsY, rhY, 0.65) },   
    
    { x: lhXe, y: hemY },                                     
    { x: rhXe, y: hemY },                                     
    { x: hmX,  y: hemY + torsoH * 0.05 },                     
    
    { x: smX, y: smY + torsoH * 0.15 },                       
    { x: hmX, y: hmY - torsoH * 0.15 },                       
  ];
}
