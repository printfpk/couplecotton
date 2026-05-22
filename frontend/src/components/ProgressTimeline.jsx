import React from 'react';
import { motion } from 'framer-motion';
import './ProgressTimeline.css';

const CDN = '/assets';

const STEPS = [
  {
    badge: 'Step 1',
    title: 'Pick Your Style',
    desc:  'Browse our curated collection of matching outfits and find the perfect set that reflects your couple vibe.',
  },
  {
    badge: 'Step 2',
    title: 'Unbox Together',
    desc:  'Receive your beautifully packaged matching set — designed for that special unboxing moment as a couple.',
  },
  {
    badge: 'Step 3',
    title: 'Twin & Shine',
    desc:  'Step out in style, turn heads together, and create memories in outfits that tell your story.',
  },
];

const HeartIcon = () => (
  <svg viewBox="0 0 256 256" fill="none" className="pt__badge-icon">
    <path
      d="M128 224S24 168 24 102a54 54 0 0 1 54-54c22.59 0 41.94 12.31 50 32 8.06-19.69 27.41-32 50-32a54 54 0 0 1 54 54c0 66-104 122-104 122"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"
    />
  </svg>
);

const BADGE_TEXT = 'CoupleCotton - Style that matches - ';

const ProgressTimeline = () => (
  <section className="pt">
    <div className="pt__container">
      {/* Header */}
      <div className="pt__header">
        <motion.p className="pt__subheading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}>
          The couple style journey
        </motion.p>
        <motion.h2 className="pt__heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.1 }}>
          Style that bonds over time.
        </motion.h2>
      </div>

      <div className="pt__body">
        {/* Timeline steps */}
        <div className="pt__steps">
          {STEPS.map(({ badge, title, desc }, i) => (
            <motion.div key={badge} className="pt__step"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.14, ease: [0.25, 0, 0, 1] }}>
              <div className="pt__step-track">
                <div className="pt__step-dot" />
                {i < STEPS.length - 1 && <div className="pt__step-line" />}
              </div>
              <div className="pt__step-content">
                <span className="pt__step-badge">{badge}</span>
                <h3 className="pt__step-title">{title}</h3>
                <p className="pt__step-desc">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Media */}
        <motion.div className="pt__media"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.25, 0, 0, 1] }}>
          <div className="pt__media-inner">
            {/* Spinning badge */}
            <div className="pt__spin-badge">
              <div
                className="pt__spin-text"
                aria-hidden="true"
                style={{ '--char-total': BADGE_TEXT.length }}
              >
                {BADGE_TEXT.split('').map((ch, i) => (
                  <span key={`${ch}-${i}`} style={{ '--char-id': i }}>
                    {ch}
                  </span>
                ))}
              </div>
              <div className="pt__spin-icon">
                <HeartIcon />
              </div>
            </div>

            <img
              src={`${CDN}/progress-2.webp?v=1772674164&width=1200`}
              alt="Skin progress"
              className="pt__img-main"
              loading="lazy"
            />
            <img
              src={`${CDN}/progress-1.webp?v=1772674164&width=780`}
              alt="Progress"
              className="pt__img-secondary"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div className="pt__footer"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: 0.2 }}>
        <a href="/collections/couple-sets" onClick={e => e.preventDefault()} className="pt__cta">
          See How it works
          <svg viewBox="0 0 20 20" fill="none" className="pt__cta-icon">
            <path d="M7.5 3.75L13.75 10L7.5 16.25"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </motion.div>
    </div>
  </section>
);

export default ProgressTimeline;
