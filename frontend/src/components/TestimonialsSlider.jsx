import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TestimonialsSlider.css';

const CDN = '/assets';

const SLIDES = [
  {
    imgD:   'https://loremflickr.com/1200/1200/couple,clothing?lock=57',
    imgM:   'https://loremflickr.com/960/1200/couple,clothing?lock=57',
    product:{
      img:   'https://loremflickr.com/300/400/clothing?lock=25',
      name:  'Summer Short Set',
      price: '$45.00',
      href:  '/products/cc-summer-short-set',
    },
    quote:  '"We wore these on our anniversary trip and got so many compliments. The fabric is incredibly soft and the fit is perfect for both of us."',
    avatar: 'https://loremflickr.com/200/200/face?lock=1',
    name:   'Ruth & James',
  },
  {
    imgD:   'https://loremflickr.com/1200/1200/couple,clothing?lock=58',
    imgM:   'https://loremflickr.com/960/1200/couple,clothing?lock=58',
    product:{
      img:   'https://loremflickr.com/300/400/clothing?lock=27',
      name:  'Striped Duo Tee',
      price: '$44.00',
      href:  '/products/cc-striped-duo-tee',
    },
    quote:  '"Finally found couple outfits that don\'t look cheesy. These are stylish, comfy, and we actually want to wear them every day."',
    avatar: 'https://loremflickr.com/200/200/face?lock=2',
    name:   'Nora & Alex',
  },
  {
    imgD:   'https://loremflickr.com/1200/1200/couple,clothing?lock=59',
    imgM:   'https://loremflickr.com/960/1200/couple,clothing?lock=59',
    product:{
      img:   'https://loremflickr.com/300/400/clothing?lock=21',
      name:  'Date Night Dress Set',
      price: '$49.00',
      href:  '/products/cc-date-night-dress-set',
    },
    quote:  '"The quality blew us away. We ordered the date night set and it made our evening out feel so special and coordinated."',
    avatar: 'https://loremflickr.com/200/200/face?lock=3',
    name:   'Henry & Sofia',
  },
];

const CheckCircle = () => (
  <svg viewBox="0 0 256 256" fill="none" className="ts__verify-icon">
    <path d="M128 24C87.43 24 51.12 47.3 31.92 88.2C12.71 129.1 21.99 177.1 54.46 201.54 86.94 225.99 131.88 231.96 167.8 224.08 203.72 216.21 234.04 189.68 231.97 148.29 229.9 106.9 182.01 24 128 24ZM173.66 109.66L117.66 165.66C114.16 169.16 108.16 169.16 104.66 165.66L80.66 141.66C77.16 138.16 77.16 132.16 80.66 128.66 84.16 125.16 90.16 125.16 93.66 128.66L111.16 146.16 161.16 96.16C164.66 92.66 170.66 92.66 174.16 96.16 177.66 99.66 177.16 106.16 173.66 109.66Z" fill="currentColor"/>
  </svg>
);

const stop = (e) => e.preventDefault();

const quoteVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0, 0, 1] } },
  exit:  { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const SLIDE_DURATION = 6000;

const TestimonialsSlider = () => {
  const [active, setActive] = useState(0);
  const total    = SLIDES.length;
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => setActive((idx + total) % total), [total]);

  useEffect(() => {
    timerRef.current = setInterval(() => goTo(active + 1), SLIDE_DURATION);
    return () => clearInterval(timerRef.current);
  }, [active, goTo]);

  const slide = SLIDES[active];

  return (
    <section className="ts">
      {/* Left: Image panel */}
      <div className="ts__media">
        {SLIDES.map((s, i) => (
          <div key={i} className={`ts__img-wrap${i === active ? ' ts__img-wrap--active' : ''}`}>
            <picture>
              <source media="(max-width: 767px)" srcSet={s.imgM} />
              <img src={s.imgD} alt="" className="ts__img" loading={i === 0 ? 'eager' : 'lazy'} />
            </picture>
            {/* Product card overlay */}
            <motion.div className="ts__product"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={i === active ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.4, ease: [0.25, 0, 0, 1], delay: 0.15 }}>
              <img src={s.product.img} alt={s.product.name} className="ts__product-img" loading="lazy" />
              <div className="ts__product-info">
                <a href={s.product.href} onClick={stop} className="ts__product-name">{s.product.name}</a>
                <span className="ts__product-price">{s.product.price}</span>
              </div>
              <a href={s.product.href} onClick={stop} className="ts__product-btn">Shop</a>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Right: Content panel */}
      <div className="ts__content">
        <p className="ts__supertitle">Our Favorite Couple Sets</p>

        <AnimatePresence mode="wait">
          <motion.blockquote className="ts__quote" key={active}
            variants={quoteVariants} initial="enter" animate="center" exit="exit">
            {slide.quote}
          </motion.blockquote>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div className="ts__author" key={`author-${active}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.1 } }}
            exit={{ opacity: 0, x: 16, transition: { duration: 0.25 } }}>
            <img src={slide.avatar} alt={slide.name} className="ts__avatar" loading="lazy" />
            <div className="ts__author-info">
              <span className="ts__author-name">{slide.name}</span>
              <span className="ts__verify">
                <CheckCircle /> Verify Customer
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="ts__controls">
          <span className="ts__counter">
            {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <div className="ts__progress">
            <motion.div
              key={active}
              className="ts__progress-bar"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
            />
          </div>
          <div className="ts__arrows">
            <button className="ts__arrow" aria-label="Previous" onClick={() => goTo(active - 1)}>
              <svg viewBox="0 0 20 20" fill="none"><path d="M12.5 16.25L6.25 10L12.5 3.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="ts__arrow" aria-label="Next" onClick={() => goTo(active + 1)}>
              <svg viewBox="0 0 20 20" fill="none"><path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
