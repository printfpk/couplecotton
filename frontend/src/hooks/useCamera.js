import { useRef, useState, useCallback, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────
   useCamera — Mobile-optimised camera hook
   
   Mobile requirements addressed:
   • iOS Safari: needs playsInline + muted + explicit play()
   • Android: lower resolution fallback if 1280x720 fails
   • Torch/facingMode switching for future back-camera support
   • Handles camera permission denial gracefully
   ───────────────────────────────────────────────────────────── */

export default function useCamera() {
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const [active,     setActive]     = useState(false);
  const [error,      setError]      = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const start = useCallback(async (facingMode = 'user') => {
    setError(null);

    // Progressive constraint fallback:
    // Mobile might not support 1280×720 — try lower if it fails
    const constraintsList = [
      // Ideal: 720p front camera
      { video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      // Fallback: 480p
      { video: { facingMode, width: { ideal: 640 },  height: { ideal: 480 } }, audio: false },
      // Last resort: any camera
      { video: { facingMode }, audio: false },
    ];

    let stream = null;
    for (const constraints of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break;
      } catch (e) {
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          setError('camera_denied');
          return;
        }
        // try next constraints
      }
    }

    if (!stream) {
      setError('camera_unavailable');
      return;
    }

    streamRef.current = stream;

    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;

    // iOS Safari REQUIRES these attributes for camera streams
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.muted = true;
    video.playsInline = true;

    // Use loadedmetadata (fires earlier than loadeddata on mobile)
    const onReady = async () => {
      try {
        await video.play();
      } catch {
        // Autoplay blocked — try again on user interaction
      }
      setDimensions({
        width:  video.videoWidth  || 640,
        height: video.videoHeight || 480,
      });
      setActive(true);
    };

    if (video.readyState >= 1) {
      onReady();
    } else {
      video.addEventListener('loadedmetadata', onReady, { once: true });
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return { videoRef, active, error, dimensions, start, stop };
}
