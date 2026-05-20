/* ─────────────────────────────────────────────────────────────
   tps.js — Thin Plate Spline 2D warping + mesh renderer

   Usage:
     const tps = new TPS(srcPoints, dstPoints);
     const { src, dst } = buildWarpedGrid(iw, ih, cols, rows, tps);
     drawWarpedMesh(ctx, img, src, dst, cols, rows, dpr);
   ───────────────────────────────────────────────────────────── */

/* TPS basis function U(r²) = r² · log(r²) */
function U(r2) { return r2 < 1e-10 ? 0 : r2 * Math.log(r2 + 1e-10); }

/* Gaussian elimination (solves Ax=b, returns x) */
function solveLinear(A, b) {
  const n  = b.length;
  const Ab = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let max = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(Ab[r][col]) > Math.abs(Ab[max][col])) max = r;
    [Ab[col], Ab[max]] = [Ab[max], Ab[col]];

    const piv = Ab[col][col];
    if (Math.abs(piv) < 1e-12) continue;
    for (let r = col + 1; r < n; r++) {
      const f = Ab[r][col] / piv;
      for (let k = col; k <= n; k++) Ab[r][k] -= f * Ab[col][k];
    }
  }

  const x = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = Ab[i][n];
    for (let j = i + 1; j < n; j++) x[i] -= Ab[i][j] * x[j];
    x[i] /= Ab[i][i] || 1;
  }
  return x;
}

/* ── TPS class ────────────────────────────────────────────────── */
export class TPS {
  constructor(srcPts, dstPts) {
    this.n   = srcPts.length;
    this.src = srcPts;
    const n    = this.n;
    const size = n + 3;

    // Build system matrix L
    const L = Array.from({ length: size }, () => new Float64Array(size));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const dx = srcPts[i].x - srcPts[j].x, dy = srcPts[i].y - srcPts[j].y;
        L[i][j] = U(dx * dx + dy * dy);
      }
      L[i][n] = 1;         L[n][i]   = 1;
      L[i][n+1] = srcPts[i].x; L[n+1][i] = srcPts[i].x;
      L[i][n+2] = srcPts[i].y; L[n+2][i] = srcPts[i].y;
    }

    const bx = new Float64Array(size), by = new Float64Array(size);
    for (let i = 0; i < n; i++) { bx[i] = dstPts[i].x; by[i] = dstPts[i].y; }

    this.wx = solveLinear(L.map(r => Array.from(r)), Array.from(bx));
    this.wy = solveLinear(L.map(r => Array.from(r)), Array.from(by));
  }

  /* Map a source point (px,py) → warped destination {x,y} */
  warp(px, py) {
    const { wx, wy, n, src } = this;
    let u = wx[n] + wx[n+1]*px + wx[n+2]*py;
    let v = wy[n] + wy[n+1]*px + wy[n+2]*py;
    for (let i = 0; i < n; i++) {
      const dx = px - src[i].x, dy = py - src[i].y;
      const k  = U(dx*dx + dy*dy);
      u += wx[i] * k; v += wy[i] * k;
    }
    return { x: u, y: v };
  }
}

/* ── Build mesh grid ─────────────────────────────────────────── */
export function buildWarpedGrid(iw, ih, cols, rows, tps) {
  const src = [], dst = [];
  for (let r = 0; r <= rows; r++) {
    const sr = [], dr = [];
    for (let c = 0; c <= cols; c++) {
      const px = (c / cols) * iw, py = (r / rows) * ih;
      sr.push({ x: px, y: py });
      dr.push(tps.warp(px, py));
    }
    src.push(sr); dst.push(dr);
  }
  return { src, dst };
}

/* ── Draw warped mesh ────────────────────────────────────────────
   Renders each grid cell as 2 triangles using per-triangle affine.

   dpr: device pixel ratio from main rendering loop.
        The main loop uses ctx.setTransform(dpr,0,0,dpr,0,0) to
        get sharp rendering on HiDPI screens. dst points are in
        CSS px (user space). We scale the affine by dpr so that
        image pixels land at the correct physical canvas pixels.
   ──────────────────────────────────────────────────────────────*/
export function drawWarpedMesh(ctx, img, src, dst, cols, rows, dpr = 1) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      _tri(ctx, img, dpr,
        src[r][c],   src[r][c+1],   src[r+1][c+1],
        dst[r][c],   dst[r][c+1],   dst[r+1][c+1]);
      _tri(ctx, img, dpr,
        src[r][c],   src[r+1][c+1], src[r+1][c],
        dst[r][c],   dst[r+1][c+1], dst[r+1][c]);
    }
  }
}

/* Draw one triangle:
   - Clip to screen dst triangle (in CSS user space, CTM=DPR scales to physical)
   - Apply affine (scaled by dpr) so image pixels land at correct physical pixels
   - Draw full source image — only the clipped area is visible
*/
function _tri(ctx, img, dpr, s0, s1, s2, d0, d1, d2) {
  const m = _affine(s0, s1, s2, d0, d1, d2);   // forward: src_image → dst_css
  if (!m) return;

  ctx.save();
  // Clip in current user space (CSS pixels; CTM=dpr scales to physical) ✓
  ctx.beginPath();
  ctx.moveTo(d0.x, d0.y); ctx.lineTo(d1.x, d1.y); ctx.lineTo(d2.x, d2.y);
  ctx.closePath();
  ctx.clip();

  // Replace CTM with dpr-scaled forward affine:
  //   image pixel (px,py)
  //   → CSS px via m
  //   → physical px via ×dpr
  // Physical pixel = (m.a*dpr)*px + (m.c*dpr)*py + m.e*dpr
  // This matches the physical clip region (d?.x * dpr, d?.y * dpr)
  ctx.setTransform(
    m.a * dpr, m.b * dpr,
    m.c * dpr, m.d * dpr,
    m.e * dpr, m.f * dpr
  );
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/* Affine matrix mapping triangle (p0,p1,p2) → (q0,q1,q2).
   Returns {a,b,c,d,e,f} for ctx.setTransform — or null if degenerate. */
function _affine(p0, p1, p2, q0, q1, q2) {
  const x0=p0.x, y0=p0.y, x1=p1.x, y1=p1.y, x2=p2.x, y2=p2.y;
  const u0=q0.x, v0=q0.y, u1=q1.x, v1=q1.y, u2=q2.x, v2=q2.y;

  const det = x0*(y1-y2) + x1*(y2-y0) + x2*(y0-y1);
  if (Math.abs(det) < 0.1) return null;

  const a = (u0*(y1-y2) + u1*(y2-y0) + u2*(y0-y1)) / det;
  const c = (u0*(x2-x1) + u1*(x0-x2) + u2*(x1-x0)) / det;
  const e = (u0*(x1*y2-x2*y1) + u1*(x2*y0-x0*y2) + u2*(x0*y1-x1*y0)) / det;
  const b = (v0*(y1-y2) + v1*(y2-y0) + v2*(y0-y1)) / det;
  const d = (v0*(x2-x1) + v1*(x0-x2) + v2*(x1-x0)) / det;
  const f = (v0*(x1*y2-x2*y1) + v1*(x2*y0-x0*y2) + v2*(x0*y1-x1*y0)) / det;

  return { a, b, c, d, e, f };
}
