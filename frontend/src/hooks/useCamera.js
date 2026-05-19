import { useRef, useState, useCallback, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────
   useCamera — Manages webcam access via getUserMedia
   ───────────────────────────────────────────────────────────── */

export default function useCamera() {
  const videoRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const start = useCallback(async (facingMode = 'user') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode,
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          videoRef.current.play();
          setDimensions({
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });
          setActive(true);
        };
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError(err.message);
    }
  }, []);

  const stop = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { videoRef, active, error, dimensions, start, stop };
}
