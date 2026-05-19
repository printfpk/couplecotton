import { useRef, useState, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   usePoseDetection — MediaPipe Pose body landmark detection
   Returns normalized landmark positions each frame.
   ───────────────────────────────────────────────────────────── */

const POSE_IDX = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
};

export { POSE_IDX };

export default function usePoseDetection() {
  const landmarkerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const lastTsRef = useRef(-1);

  // Initialize MediaPipe PoseLandmarker
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const vision = await import('@mediapipe/tasks-vision');
        const { PoseLandmarker, FilesetResolver } = vision;

        const fileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        if (cancelled) return;

        const landmarker = await PoseLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });

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

  // Detect pose in a video frame — returns landmarks array or null
  const detect = useCallback((videoElement) => {
    if (!landmarkerRef.current || !videoElement || videoElement.readyState < 2) return null;

    const now = performance.now();
    if (now === lastTsRef.current) return null;
    lastTsRef.current = now;

    try {
      const result = landmarkerRef.current.detectForVideo(videoElement, now);
      if (result.landmarks && result.landmarks.length > 0) {
        return result.landmarks[0]; // first person's landmarks
      }
    } catch { /* skip frame */ }

    return null;
  }, []);

  // Extract useful body metrics from landmarks
  const getBodyMetrics = useCallback((landmarks, videoWidth, videoHeight) => {
    if (!landmarks) return null;

    const ls = landmarks[POSE_IDX.LEFT_SHOULDER];
    const rs = landmarks[POSE_IDX.RIGHT_SHOULDER];
    const le = landmarks[POSE_IDX.LEFT_ELBOW];
    const re = landmarks[POSE_IDX.RIGHT_ELBOW];
    const lh = landmarks[POSE_IDX.LEFT_HIP];
    const rh = landmarks[POSE_IDX.RIGHT_HIP];

    if (!ls || !rs || !lh || !rh) return null;

    const shoulderMidX = (ls.x + rs.x) / 2;
    const shoulderMidY = (ls.y + rs.y) / 2;
    const hipMidX = (lh.x + rh.x) / 2;
    const hipMidY = (lh.y + rh.y) / 2;
    const shoulderWidth = Math.sqrt((ls.x - rs.x) ** 2 + (ls.y - rs.y) ** 2);
    const torsoHeight = Math.sqrt((shoulderMidX - hipMidX) ** 2 + (shoulderMidY - hipMidY) ** 2);
    const bodyAngle = Math.atan2(rs.y - ls.y, rs.x - ls.x);

    // Depth estimate from shoulder width (normalized)
    const depthZ = (ls.z + rs.z) / 2;

    return {
      shoulderMid: { x: shoulderMidX, y: shoulderMidY },
      hipMid: { x: hipMidX, y: hipMidY },
      shoulderWidth,
      torsoHeight,
      bodyAngle,
      depthZ,
      // Individual landmark positions (normalized 0-1)
      leftShoulder: { x: ls.x, y: ls.y },
      rightShoulder: { x: rs.x, y: rs.y },
      leftElbow: le ? { x: le.x, y: le.y } : null,
      rightElbow: re ? { x: re.x, y: re.y } : null,
      leftHip: { x: lh.x, y: lh.y },
      rightHip: { x: rh.x, y: rh.y },
      // Pixel coordinates
      px: {
        shoulderMidX: shoulderMidX * videoWidth,
        shoulderMidY: shoulderMidY * videoHeight,
        shoulderWidth: shoulderWidth * videoWidth,
        torsoHeight: torsoHeight * videoHeight,
      },
    };
  }, []);

  return { ready, error, detect, getBodyMetrics, POSE_IDX };
}
