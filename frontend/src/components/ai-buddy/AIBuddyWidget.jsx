import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIBuddy } from '../../context/AIBuddyContext';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { useAuth } from '../../context/AuthContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import './AIBuddyWidget.css';

const AIBuddyWidget = () => {
  const { sendMessage, isProcessing, isSpeaking: aiSpeaking, resetChat } = useAIBuddy();
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();
  const { user } = useAuth();

  const [hasGreeted, setHasGreeted] = useState(false);
  const [greetingSpeaking, setGreetingSpeaking] = useState(false);

  const handleVoiceResult = useCallback((text) => {
    if (text) {
      sendMessage(text);
    }
  }, [sendMessage]);

  const { transcript, isListening, startListening, stopListening } = useVoiceRecognition(handleVoiceResult);

  // Determine the active state for the FAB button
  const isActive = isListening || isSpeaking || greetingSpeaking || aiSpeaking || isProcessing;

  const toggleListening = useCallback(() => {
    if (isProcessing) return;

    if (isListening) {
      stopListening();
      return;
    }

    if (isSpeaking || greetingSpeaking) {
      stopSpeaking();
      setGreetingSpeaking(false);
      startListening();
      return;
    }

    if (!hasGreeted) {
      setHasGreeted(true);
      setGreetingSpeaking(true);
      const name = user?.fullName?.firstName || user?.username || '';
      const greeting = name
        ? `Hello ${name}! batao aaj kya shopping karne ka mann hai?`
        : `Hello! batao aaj kya shopping karne ka mann hai?`;

      speak(greeting, () => {
        setGreetingSpeaking(false);
        startListening();
      });
    } else {
      startListening();
    }
  }, [isListening, isProcessing, isSpeaking, greetingSpeaking, hasGreeted, user, speak, startListening, stopListening, stopSpeaking]);

  // Refs to always access latest versions in global listeners
  const toggleRef = useRef(toggleListening);
  const resetRef = useRef(resetChat);
  useEffect(() => {
    toggleRef.current = toggleListening;
    resetRef.current = resetChat;
  }, [toggleListening, resetChat]);

  // Bluetooth media keys: double-tap (Next Track) = reset, single-tap (Play/Pause) = toggle mic
  useEffect(() => {
    let lastTapTime = 0;
    let tapTimer = null;

    const handleTap = () => {
      const now = Date.now();
      if (now - lastTapTime < 500) {
        // Double tap detected
        clearTimeout(tapTimer);
        resetRef.current();
      } else {
        // Single tap
        tapTimer = setTimeout(() => {
          toggleRef.current();
        }, 350);
      }
      lastTapTime = now;
    };

    const handleMediaKeys = (e) => {
      const key = e.key;
      if (key === 'MediaTrackNext') {
        e.preventDefault();
        resetRef.current();
        return;
      }
      if (key === 'MediaPlayPause' || key === 'MediaPlay' || key === 'MediaPause') {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleMediaKeys);

    // Modern Bluetooth integration using MediaSession API
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', handleTap);
        navigator.mediaSession.setActionHandler('pause', handleTap);
        navigator.mediaSession.setActionHandler('nexttrack', () => resetRef.current());
      } catch (e) {
        console.warn('MediaSession API not fully supported', e);
      }
    }

    return () => {
      window.removeEventListener('keydown', handleMediaKeys);
      clearTimeout(tapTimer);
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
          navigator.mediaSession.setActionHandler('nexttrack', null);
        } catch (e) {}
      }
    };
  }, []);

  // Safety net: ensure body scroll is never locked by stale state
  useEffect(() => {
    const interval = setInterval(() => {
      const body = document.body;
      const isModalOpen = document.querySelector('.auth-overlay') ||
                          document.querySelector('.nb__mobile-overlay') ||
                          document.querySelector('.cdrawer__backdrop') ||
                          document.querySelector('.sdrawer__backdrop');
      if (!isModalOpen && body.style.overflow === 'hidden') {
        body.style.overflow = '';
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Current state label
  const stateLabel = greetingSpeaking || isSpeaking
    ? '🔊 Speaking...'
    : isProcessing
      ? '🤔 Thinking...'
      : transcript || '🎙️ Listening...';

  return (
    <div className="ai-widget-container">
      <AnimatePresence>
        {(isListening || greetingSpeaking || isSpeaking) && (
          <motion.div
            className={`ai-widget-active-pill ${greetingSpeaking || isSpeaking ? 'speaking' : ''}`}
            initial={{ opacity: 0, y: 30, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <div className="ai-widget-wave">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="ai-bar"
                  animate={{
                    height: (greetingSpeaking || isSpeaking)
                      ? [6, 14 + Math.random() * 22, 6]
                      : [8, 18 + i * 4, 8],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5 + i * 0.08,
                    delay: i * 0.06,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
            <span className="ai-widget-text">
              {stateLabel}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ai-widget-controls">
        <motion.button
          className="ai-widget-reset-btn"
          onClick={resetChat}
          title="Reset AI Session"
          aria-label="Reset AI Session"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </motion.button>

        <motion.button
          className={`ai-widget-fab ${isActive ? 'active' : ''} ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''} ${greetingSpeaking || isSpeaking ? 'speaking' : ''}`}
          onClick={toggleListening}
          disabled={isProcessing}
          title="Voice Assistant"
          aria-label="Voice Assistant"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          {isProcessing ? (
            <div className="ai-spinner"></div>
          ) : (greetingSpeaking || isSpeaking) ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          )}

          {/* Animated ring for active states */}
          {isActive && !isProcessing && (
            <>
              <span className="ai-fab-ring ai-fab-ring--1"></span>
              <span className="ai-fab-ring ai-fab-ring--2"></span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default AIBuddyWidget;
