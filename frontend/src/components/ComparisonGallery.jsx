import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ComparisonGallery.css';

const CDN = '/assets';

const ITEMS = [
  { before: 'https://loremflickr.com/1200/1200/couple,clothing?lock=46', after: 'https://loremflickr.com/1200/1200/couple,clothing?lock=47', thumb: 'https://loremflickr.com/200/200/clothing?lock=21', name: 'Date Night Dress Set', href: '/products/cc-date-night-dress-set', bullets: ['Premium breathable cotton blend', 'Tailored his & hers fit'] },
  { before: 'https://loremflickr.com/1200/1200/couple,clothing?lock=48', after: 'https://loremflickr.com/1200/1200/couple,clothing?lock=49', thumb: 'https://loremflickr.com/200/200/clothing?lock=25', name: 'Summer Short Set', href: '/products/cc-summer-short-set', bullets: ['Lightweight summer-ready fabric', 'Matching color palette for couples'] },
  { before: 'https://loremflickr.com/1200/1200/couple,clothing?lock=50', after: 'https://loremflickr.com/1200/1200/couple,clothing?lock=51', thumb: 'https://loremflickr.com/200/200/clothing?lock=27', name: 'Striped Duo Tee', href: '/products/cc-striped-duo-tee', bullets: ['Classic stripe pattern for both', 'Soft organic cotton construction'] },
  { before: 'https://loremflickr.com/1200/1200/couple,clothing?lock=52', after: 'https://loremflickr.com/1200/1200/couple,clothing?lock=53', thumb: 'https://loremflickr.com/200/200/clothing?lock=23', name: 'Cozy Lounge Set', href: '/products/cc-cozy-lounge-set', bullets: ['Ultra-soft fleece interior', 'Relaxed unisex silhouette'] },
];

const stop = e => e.preventDefault();

const CheckIcon = () => (
  <svg viewBox="0 0 256 256" fill="none" width="14" height="14">
    <path d="m40 144 56 56L224 72" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ImageComparison = ({ before, after }) => {
  const [pct, setPct] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const updatePct = useCallback(clientX => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPct(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onMouseMove = useCallback(e => { if (dragging.current) updatePct(e.clientX); }, [updatePct]);
  const onMouseUp   = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div ref={containerRef} className="cg__comparison" onMouseMove={onMouseMove} onTouchMove={e => updatePct(e.touches[0].clientX)}>
      <img src={after}  alt="After"  className="cg__img cg__img--after"  loading="lazy" />
      <div className="cg__img-before-wrap" style={{ width: `${pct}%` }}>
        <img src={before} alt="Before" className="cg__img cg__img--before" loading="lazy" />
      </div>
      <span className="cg__badge cg__badge--before">His</span>
      <span className="cg__badge cg__badge--after">Hers</span>
      <button
        className="cg__handle"
        style={{ left: `${pct}%` }}
        aria-label="Drag to compare"
        onMouseDown={() => { dragging.current = true; }}
        onTouchStart={() => { dragging.current = true; }}
        onTouchEnd={() => { dragging.current = false; }}
      >
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M12.5 16.25L6.25 10L12.5 3.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
};

const ComparisonGallery = () => {
  const [active, setActive] = useState(0);
  const item = ITEMS[active];

  return (
    <motion.section
      className="cg"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <div className="cg__container">
        <div className="cg__left">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="cg__comparison-wrap"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <ImageComparison before={item.before} after={item.after} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="cg__right">
          <p className="cg__supertitle">His &amp; Hers</p>
          <h2 className="cg__heading">See the perfect match</h2>

          <div className="cg__thumbs">
            {ITEMS.map((it, i) => (
              <motion.button
                key={it.name}
                className={`cg__thumb${i === active ? ' cg__thumb--active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={it.name}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.18 }}
              >
                <img src={it.thumb} alt={it.name} loading="lazy" />
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="cg__product-info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <h3 className="cg__product-name">{item.name}</h3>
              <ul className="cg__bullets">
                {item.bullets.map((b, i) => (
                  <motion.li
                    key={b}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                  >
                    <CheckIcon /> {b}
                  </motion.li>
                ))}
              </ul>
              <a href={item.href} onClick={stop} className="cg__btn">Shop Now →</a>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
};

export default ComparisonGallery;
