import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) return;

    // Always fetch latest voices synchronously to avoid React state closure issues on first load
    const currentVoices = window.speechSynthesis.getVoices();

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // 1. Try to find Premium/Natural AI voices (Edge/Chrome cloud voices)
    let selectedVoice = currentVoices.find(v => (v.lang.includes('hi') || v.lang.includes('en')) && (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online')) && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('aria')));
    
    // 2. Try explicitly female high-quality cloud voices
    if (!selectedVoice) {
      selectedVoice = currentVoices.find(v => v.name === 'Google UK English Female');
    }

    // 3. Try to find a standard female Indian English or Hindi voice
    if (!selectedVoice) {
      selectedVoice = currentVoices.find(v => (v.lang === 'hi-IN' || v.lang === 'en-IN') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('aditi') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('kavya')));
    }
    
    // 4. Fallback to ANY female voice in English
    if (!selectedVoice) {
      selectedVoice = currentVoices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('hazel') || v.name.toLowerCase().includes('susan') || v.name.toLowerCase().includes('victoria') || v.name.toLowerCase().includes('karen')));
    }
    
    // 5. If absolutely no female voice is found, grab any Indian voice (last resort)
    if (!selectedVoice) {
      selectedVoice = currentVoices.find(v => v.lang === 'hi-IN' || v.lang === 'en-IN');
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 1.05; // Slightly faster for natural feel
    utterance.pitch = 1.2; // Slightly higher pitch for female/friendly tone

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    // Chrome GC bug fix: keep a global reference to the utterance
    window._currentUtterance = utterance;
    
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking };
};
