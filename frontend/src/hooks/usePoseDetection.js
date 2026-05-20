import { useRef, useState, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   usePoseDetection — Mobile-optimised MediaPipe Pose detection

   Mobile fixes:
   • GPU delegate → CPU fallback (GPU WebGL may fail on some Android)
   • pose_landmarker_lite model (smallest, fastest — ideal for mobile)
   • Frame throttling: detects every Nth frame to save battery/CPU
   • Timestamp dedup guards prevent double-detection
   ───────────────────────────────────────────────────────────── */

export { POSE_IDX };

const POSE_IDX = {
  NOSE: 0,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW:    13, RIGHT_ELBOW:    14,
  LEFT_WRIST:    15, RIGHT_WRIST:    16,
  LEFT_HIP:      23, RIGHT_HIP:      24,
  LEFT_KNEE:     25, RIGHT_KNEE:     26,
};

/* Detect if we're on a mobile/low-power device */
const isMobile = () =>
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  ('ontouchstart' in window);

export default function usePoseDetection() {
  const landmarkerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const lastTsRef   = useRef(-1);
  const frameCount  = useRef(0);

  /* Throttle: detect every 2nd frame on mobile, every frame on desktop */
  const SKIP = isMobile() ? 2 : 1;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

        const fileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        if (cancelled) return;

        /* Try GPU first, fall back to CPU (important for Android WebView / iOS) */
        let landmarker = null;
        for (const delegate of ['GPU', 'CPU']) {
          try {
            landmarker = await PoseLandmarker.createFromOptions(fileset, {
              baseOptions: {
                modelAssetPath:
                  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                delegate,
              },
              runningMode: 'VIDEO',
              numPoses: 1,
              minPoseDetectionConfidence: 0.5,
              minPosePresenceConfidence:  0.5,
              minTrackingConfidence:      0.5,
            });
            console.log(`MediaPipe running on: ${delegate}`);
            break;
          } catch (e) {
            console.warn(`Delegate ${delegate} failed, trying next…`, e.message);
          }
        }

        if (!landmarker) throw new Error('Could not initialise pose landmarker');
        if (cancelled) return;

        landmarkerRef.current = landmarker;
        setReady(true);
      } catch (err) {
        console.error('MediaPipe init failed:', err);
        setError(err.message);
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  /* detect() — call every RAF frame; internally throttles on mobile */
  const detect = useCallback((videoElement) => {
    if (!landmarkerRef.current || !videoElement) return null;
    if (videoElement.readyState < 2) return null;

    /* Frame skip on mobile */
    frameCount.current = (frameCount.current + 1) % SKIP;
    if (frameCount.current !== 0) return null;

    const now = performance.now();
    if (now <= lastTsRef.current) return null;
    lastTsRef.current = now;

    try {
      const result = landmarkerRef.current.detectForVideo(videoElement, now);
      if (result?.landmarks?.length > 0) {
        return result.landmarks[0];
      }
    } catch { /* skip frame on error */ }

    return null;
  }, [SKIP]);

  return { ready, error, detect, POSE_IDX };
}
