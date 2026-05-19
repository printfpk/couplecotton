import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './HeroSlideshow.css';

const CDN = '/assets';
const v1 = '1774428659', v1m = '1774428658', v3 = '1774428660';

const SLIDES = [
  {
    imgD: 'https://loremflickr.com/1920/1080/couple,fashion?lock=1',
    imgM: 'https://loremflickr.com/960/1200/couple,fashion?lock=1',
    tag:  'New Collection',
    headline: <>Style that matches<br /><em>your story.</em></>,
    href: '/collections/couple-sets',
  },
  {
    imgD: 'https://loremflickr.com/1920/1080/couple,fashion?lock=2',
    imgM: 'https://loremflickr.com/960/1200/couple,fashion?lock=2',
    tag:  'Couple Essentials',
    headline: <>Together in <br /><em>every thread.</em></>,
    href: '/collections/matching-tees',
  },
  {
    imgD: 'https://loremflickr.com/1920/1080/couple,fashion?lock=3',
    imgM: 'https://loremflickr.com/960/1200/couple,fashion?lock=3',
    tag:  'Premium Cotton',
    headline: <>Dress alike, <br />feel <em>closer.</em></>,
    href: '/collections/all',
  },
];

const ArrowRight = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M7.5 3.75L13.75 10L7.5 16.25"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowLeft = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M12.5 16.25L6.25 10L12.5 3.75"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.32, 0, 0.15, 1] } },
  exit:  (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80, transition: { duration: 0.5, ease: 'easeIn' } }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0, 0, 1] },
  }),
};

const HeroSlideshow = () => {
  const [[active, dir], setSlide] = useState([0, 0]);
  const total    = SLIDES.length;
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    const next = (idx + total) % total;
    setSlide(([cur]) => [next, next > cur ? 1 : -1]);
  }, [total]);

  useEffect(() => {
    timerRef.current = setInterval(() => goTo(active + 1), 5000);
    return () => clearInterval(timerRef.current);
  }, [active, goTo]);

  const slide = SLIDES[active];

  return (
    <section className="hero" aria-label="Hero slideshow">
      <div className="hero__track" style={{ overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence initial={false} custom={dir} mode="sync">
          <motion.div
            key={active}
            className="hero__slide hero__slide--active"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ position: 'absolute', inset: 0 }}
          >
            <picture className="hero__picture">
              <source media="(max-width: 767px)" srcSet={slide.imgM} sizes="100vw" />
              <img
                src={slide.imgD}
                alt="CoupleCotton"
                className="hero__img"
                loading={active === 0 ? 'eager' : 'lazy'}
                fetchPriority={active === 0 ? 'high' : 'low'}
                sizes="100vw"
              />
            </picture>
            <div className="hero__overlay" aria-hidden="true" />

            <div className="hero__content">
              <motion.p className="hero__tag"
                custom={0} variants={contentVariants} initial="hidden" animate="visible">
                {slide.tag}
              </motion.p>
              <motion.h1 className="hero__headline"
                custom={1} variants={contentVariants} initial="hidden" animate="visible">
                {slide.headline}
              </motion.h1>
              <motion.a href={slide.href} className="hero__btn"
                custom={2} variants={contentVariants} initial="hidden" animate="visible"
                onClick={e => e.preventDefault()}>
                Shop Now
                <span className="hero__btn-icon"><ArrowRight /></span>
              </motion.a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="hero__controls">
        <span className="hero__counter">
          {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <div className="hero__progress">
          <motion.div
            className="hero__progress-bar"
            animate={{ width: `${((active + 1) / total) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="hero__arrows">
          <button className="hero__arrow" aria-label="Previous slide" onClick={() => goTo(active - 1)}>
            <ArrowLeft />
          </button>
          <button className="hero__arrow" aria-label="Next slide" onClick={() => goTo(active + 1)}>
            <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSlideshow;
