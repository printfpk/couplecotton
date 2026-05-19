import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Newsletter.css';

const CDN = '/assets';
const BG  = `${CDN}/newsletter-bg.webp?v=1772678075&width=1920`;
const BGM = `${CDN}/newsletter-bg--mb.webp?v=1772678075&width=768`;

const Newsletter = () => {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('success');
    setEmail('');
  };

  return (
    <section className="nl">
      <picture className="nl__bg" aria-hidden="true">
        <source media="(max-width: 767px)" srcSet={BGM} />
        <img src={BG} alt="" loading="lazy" />
      </picture>

      <motion.div className="nl__content"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.25, 0, 0, 1] }}>

        <motion.h2 className="nl__heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}>
          Subscribe for style tips, drops &amp; exclusive offers
        </motion.h2>

        <motion.div className="nl__form-wrap"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.22 }}>
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.p className="nl__success" key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}>
                🎉 Thanks for subscribing!
              </motion.p>
            ) : (
              <motion.form className="nl__form" key="form" onSubmit={handleSubmit}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <label className="nl__sr-only" htmlFor="nl-email">Email</label>
                <input
                  id="nl-email"
                  type="email"
                  className="nl__input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <button type="submit" className="nl__submit" aria-label="Sign up">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 3.75L13.75 10L7.5 16.25"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="nl__legal">
            By subscribing you agree to the{' '}
            <a href="/policies/privacy-policy">Terms of Use</a>
            {' '}&amp;{' '}
            <a href="/policies/privacy-policy">Privacy Policy.</a>
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Newsletter;
