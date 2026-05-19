import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Popup.css';

const CDN = '/assets';

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
    <path d="M15.625 4.375L4.375 15.625M15.625 15.625L4.375 4.375"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Popup = () => {
  const [open, setOpen]   = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);

  useEffect(() => {
    // if (sessionStorage.getItem('popup-dismissed')) return;
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    // sessionStorage.setItem('popup-dismissed', '1');
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setTimeout(dismiss, 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="popup__overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Subscribe popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="popup__modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.button
              className="popup__close"
              onClick={dismiss}
              aria-label="Close"
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <CloseIcon />
            </motion.button>

            <div className="popup__image">
              <picture>
                <source media="(max-width: 767px)" srcSet={`${CDN}/popup--mb.webp?v=1772616546&width=640`} />
                <img src="https://loremflickr.com/1200/1200/couple,fashion?lock=7" alt="CoupleCotton" loading="lazy" />
              </picture>
            </div>

            <div className="popup__content">
              <h2 style={{ fontSize: '28px', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>CoupleCotton</h2>

              <h2 className="popup__heading">
                Unlock 10% OFF<br />your order
              </h2>
              <p className="popup__sub">Matching outfits for you & your love? Sign us up</p>

              <AnimatePresence mode="wait">
                {done ? (
                  <motion.p
                    key="success"
                    className="popup__success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    🎉 You're in! Check your inbox.
                  </motion.p>
                ) : (
                  <motion.form
                    key="form"
                    className="popup__form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <label className="popup__sr-only" htmlFor="popup-email">Email</label>
                    <input
                      id="popup-email"
                      type="email"
                      className="popup__input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                    <button type="submit" className="popup__submit">Get 10% OFF</button>
                  </motion.form>
                )}
              </AnimatePresence>

              <button className="popup__decline" onClick={dismiss}>
                I'll pay full price
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;
