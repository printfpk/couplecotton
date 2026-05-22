/* ─────────────────────────────────────────────────────────────
   smoothLandmarks.js — Exponential moving average filter
   
   Eliminates jitter from MediaPipe pose landmarks while keeping
   the cloth responsive to real movement.
   
   alpha = 0.15 → ~4-frame lag (~67ms at 60fps) — cloth feels "fabric-like"
   alpha = 0.30 → ~2-frame lag — cloth feels "snappy"
   ───────────────────────────────────────────────────────────── */

const ALPHA = 0.18; // smoothing factor — tune between 0.1 (sluggish) and 0.35 (jittery)

/**
 * SmoothLandmarks — stateful smoother for one pose's landmarks.
 * 
 * Usage:
 *   const smoother = new SmoothLandmarks();
 *   // Each frame:
 *   const smoothed = smoother.update(rawLandmarks);
 */
export class SmoothLandmarks {
  constructor(alpha = ALPHA) {
    this.alpha    = alpha;
    this.smoothed = null;
  }

  /**
   * update(raw) — accepts a MediaPipe landmarks array (33 points).
   * Returns the smoothed landmarks array.
   */
  update(raw) {
    if (!raw || raw.length === 0) return this.smoothed;

    if (!this.smoothed || this.smoothed.length !== raw.length) {
      // First frame — initialise directly
      this.smoothed = raw.map(lm => ({ x: lm.x, y: lm.y, z: lm.z || 0, visibility: lm.visibility || 1 }));
      return this.smoothed;
    }

    const a = this.alpha;
    const b = 1 - a;

    for (let i = 0; i < raw.length; i++) {
      const r = raw[i];
      const s = this.smoothed[i];
      s.x = a * r.x + b * s.x;
      s.y = a * r.y + b * s.y;
      s.z = a * (r.z || 0) + b * s.z;
      if (r.visibility != null) s.visibility = a * r.visibility + b * (s.visibility || 1);
    }

    return this.smoothed;
  }

  reset() { this.smoothed = null; }
}

/**
 * smoothValue — smooth a single scalar value.
 * Returns updater: call with (current, target) each frame.
 */
export function makeSmoothValue(alpha = ALPHA) {
  let current = null;
  return (target) => {
    if (current === null) { current = target; return current; }
    current = alpha * target + (1 - alpha) * current;
    return current;
  };
}
