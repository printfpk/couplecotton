import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  // Always keep the latest onResult in a ref to avoid re-creating recognition
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;    // Don't auto-stop on pauses
    recognition.interimResults = true;
    recognition.lang = 'hi-IN';       // Hinglish support
    recognition.maxAlternatives = 1;

    let silenceTimer = null;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      clearTimeout(silenceTimer);
    };

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript + ' ';
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      const displayStr = (finalStr + interimStr).trim();
      setTranscript(displayStr);

      // Clear the timer whenever the user generates any speech (interim or final)
      clearTimeout(silenceTimer);

      if (displayStr) {
        // Wait 2 seconds after they completely stop speaking to auto-send
        silenceTimer = setTimeout(() => {
          if (onResultRef.current) {
            onResultRef.current(displayStr);
            setTranscript('');
            // Stop recognition completely so it doesn't keep accumulating in the background
            try { recognitionRef.current.stop(); } catch(e) {}
            setIsListening(false);
          }
        }, 2000);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Silently ignore
      } else {
        setError(event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      clearTimeout(silenceTimer);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch (_) {}
    };
  }, []); // Only create once — onResult is accessed via ref

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    const rec = recognitionRef.current;
    if (!rec) return;

    // Abort any leftover session first, then start fresh
    try { rec.abort(); } catch (_) {}

    // Small delay to let the browser reset
    setTimeout(() => {
      try {
        rec.start();
      } catch (e) {
        console.warn('Could not start speech recognition:', e.message);
        setIsListening(false);
      }
    }, 100);
  }, []);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try { rec.stop(); } catch (_) {}
    setIsListening(false);
  }, []);

  return { transcript, isListening, startListening, stopListening, error };
};
