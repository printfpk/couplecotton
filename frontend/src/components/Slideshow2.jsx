import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Slideshow2.css';

const CDN = '/assets';
const v  = '1772677717';
const vm = '1772677716';

const SLIDES = [
  { imgD: 'https://loremflickr.com/1920/1080/couple,clothing?lock=69',  imgM: 'https://loremflickr.com/960/1200/couple,clothing?lock=69', tag: 'Premium Cotton Basics', headline: <><span>Built for two.</span><br /><em>Designed for you.</em></>, href: '/collections/all' },
  { imgD: 'https://loremflickr.com/1920/1080/couple,clothing?lock=70', imgM: 'https://loremflickr.com/960/1200/couple,clothing?lock=70', tag: 'Handcrafted Couple Wear', headline: <><span>Stitched with intention.</span><br /><em>Worn with love.</em></>, href: '/collections/all' },
  { imgD: 'https://loremflickr.com/1920/1080/couple,clothing?lock=71', imgM: 'https://loremflickr.com/960/1200/couple,clothing?lock=71', tag: 'Made for Two', headline: <><span>Match your vibe.</span><br /><em>Elevate your style.</em></>, href: '/collections/all' },
];

const stop = e => e.preventDefault();

const contentVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.1 } },
  exit:   { opacity: 0, y: -16, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0 },
};

const Slideshow2 = () => {
  const [active, setActive]   = useState(0);
  const total                  = SLIDES.length;
  const timerRef               = useRef(null);

  const goTo = useCallback(i => {
    setActive((i + total) % total);
  }, [total]);

  useEffect(() => {
    timerRef.current = setInterval(() => goTo(active + 1), 5000);
    return () => clearInterval(timerRef.current);
  }, [active, goTo]);

  return (
    <section className="ss2" aria-label="Feature slideshow">
      <div className="ss2__track">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`ss2__slide${i === active ? ' ss2__slide--active' : ''}`}
            aria-hidden={i !== active}
          >
            <picture className="ss2__picture">
              <source media="(max-width: 767px)" srcSet={slide.imgM} />
              <img
                src={slide.imgD}
                alt="CoupleCotton"
                className="ss2__img"
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'low'}
              />
            </picture>
            <div className="ss2__overlay" aria-hidden="true" />

            {/* Animated content per active slide */}
            <AnimatePresence mode="wait">
              {i === active && (
                <motion.div
                  key={`content-${i}`}
                  className="ss2__content"
                  variants={contentVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <motion.p className="ss2__tag" variants={itemVariants}>{slide.tag}</motion.p>
                  <motion.h2 className="ss2__headline" variants={itemVariants}>{slide.headline}</motion.h2>
                  <motion.a
                    href={slide.href}
                    onClick={stop}
                    className="ss2__btn"
                    variants={itemVariants}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Learn More →
                  </motion.a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Tab pagination */}
      <div className="ss2__tabs">
        {SLIDES.map((slide, i) => (
          <button
            key={i}
            className={`ss2__tab${i === active ? ' ss2__tab--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={slide.tag}
          >
            <span className="ss2__tab-num">{i + 1}.</span>
            <span className="ss2__tab-label">{slide.tag}</span>
            <span className="ss2__tab-bar">
              <span className="ss2__tab-fill" style={i === active ? {} : { width: 0 }} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Slideshow2;
