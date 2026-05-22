import { useRef, useState, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   useSegmentation — MediaPipe ImageSegmenter hook
   
   Uses the selfie_multiclass_256x256 model which returns per-pixel
   category masks:
     0 = background
     1 = hair
     2 = body skin
     3 = face skin
     4 = clothes
     5 = others (accessories etc.)
   
   Falls back to CPU if GPU delegate fails.
   Mobile: runs every 2nd frame to save battery.
   ───────────────────────────────────────────────────────────── */

const isMobile = () =>
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  ('ontouchstart' in window);

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';

export const SEG_LABELS = {
  BACKGROUND: 0,
  HAIR:       1,
  BODY_SKIN:  2,
  FACE_SKIN:  3,
  CLOTHES:    4,
  OTHERS:     5,
};

export default function useSegmentation() {
  const segmenterRef  = useRef(null);
  const maskCanvasRef = useRef(null);
  const lastTsRef     = useRef(-1);
  const frameCount    = useRef(0);
  
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const SKIP = isMobile() ? 3 : 1;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { ImageSegmenter, FilesetResolver } = await import('@mediapipe/tasks-vision');

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        if (cancelled) return;

        let segmenter = null;
        for (const delegate of ['GPU', 'CPU']) {
          try {
            segmenter = await ImageSegmenter.createFromOptions(vision, {
              baseOptions: { modelAssetPath: MODEL_URL, delegate },
              runningMode: 'VIDEO',
              outputCategoryMask: true,
              outputConfidenceMasks: false,
            });
            console.log(`Segmenter running on: ${delegate}`);
            break;
          } catch (e) {
            console.warn(`Segmenter ${delegate} failed:`, e.message);
          }
        }

        if (!segmenter) {
          throw new Error("Failed to initialize segmenter (all delegates failed).");
        }
        
        if (cancelled) return;

        segmenterRef.current = segmenter;

        const oc = document.createElement('canvas');
        oc.width = 256; oc.height = 256;
        maskCanvasRef.current = oc;

        setReady(true);
      } catch (err) {
        console.error('Segmenter init failed:', err);
        setError(err.message || "Failed to load Segmentation model");
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  const segment = useCallback((video) => {
    if (!segmenterRef.current || !video) return null;
    if (video.readyState !== undefined && video.readyState < 2) return null;

    frameCount.current = (frameCount.current + 1) % SKIP;
    if (frameCount.current !== 0) return null;

    const now = performance.now();
    if (now <= lastTsRef.current) return null;
    lastTsRef.current = now;

    try {
      const result = segmenterRef.current.segmentForVideo(video, now);
      if (!result?.categoryMask) return null;

      const mask = result.categoryMask;
      const data = mask.getAsFloat32Array();
      mask.close();
      return data;
    } catch { return null; }
  }, [SKIP]);

  const buildLayerMask = useCallback((segData, categories, dw, dh) => {
    if (!segData || !maskCanvasRef.current) return null;
    const oc = maskCanvasRef.current;
    const ctx = oc.getContext('2d');
    const id = ctx.createImageData(256, 256);
    const d = id.data;
    const catSet = new Set(categories);

    for (let i = 0; i < segData.length; i++) {
      const idx = i * 4;
      const isMatch = catSet.has(Math.round(segData[i]));
      // IMPORTANT FIX: Background pixels must be fully transparent (alpha 0)
      // so that globalCompositeOperation="source-in" clips correctly.
      d[idx]   = isMatch ? 255 : 0;
      d[idx+1] = isMatch ? 255 : 0;
      d[idx+2] = isMatch ? 255 : 0;
      d[idx+3] = isMatch ? 255 : 0;
    }
    ctx.putImageData(id, 0, 0);
    return oc;
  }, []);

  return { ready, error, segment, buildLayerMask };
}
