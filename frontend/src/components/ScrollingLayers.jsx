import React from 'react';
import { motion } from 'framer-motion';
import './ScrollingLayers.css';

const CDN = '/assets';

const LightningIcon = () => (
  <svg viewBox="0 0 256 256" fill="none" className="sl__icon-svg">
    <path d="m160 16-16 80 64 24L96 240l16-80-64-24z" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const StrollerIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" className="sl__icon-svg">
    <path d="M6 14h23a9 9 0 0 1-9 9h-5a9 9 0 0 1-9-9m12 0V6a1 1 0 0 1 1-1h1a9 9 0 0 1 9 9M2 10a4 4 0 0 1 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="11" cy="28" r="2" fill="currentColor"/>
    <circle cx="24" cy="28" r="2" fill="currentColor"/>
    <path d="m18 14 8.179-6.544" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const HeartBeatIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" className="sl__icon-svg">
    <path d="M4 17H9L11 14L15 20L17 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 13C3 10.96 3.71 9.24 4.98 7.98 6.24 6.71 7.96 6 9.75 6 12.57 6 14.99 7.54 16 10 17.01 7.54 19.43 6 22.25 6 24.04 6 25.76 6.71 27.02 7.98 28.29 9.24 29 10.96 29 12.75 29 21 16 28 16 28 16 28 10.75 25.18 6.93 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LAYERS = [
  { Icon: LightningIcon, title: 'Shop Couple Basics', body: 'Essential matching tees, polos, and everyday wear designed for couples who love to coordinate.', href: '/collections/matching-tees', img: 'https://loremflickr.com/1620/1200/couple,clothing?lock=63' },
  { Icon: StrollerIcon,  title: 'Shop Date Night',    body: 'Elegant coordinated outfits for dinners, events, and those special evenings out together.', href: '/collections/date-night', img: 'https://loremflickr.com/1620/1200/couple,clothing?lock=64' },
  { Icon: HeartBeatIcon, title: 'Shop Loungewear', body: 'Cozy matching sets for lazy mornings, movie nights, and everything in between.', href: '/collections/lounge-sets', img: 'https://loremflickr.com/1620/1200/couple,clothing?lock=65' },
];

const stop = e => e.preventDefault();

const ScrollingLayers = () => (
  <section className="sl">
    <div className="sl__container">
      <motion.div
        className="sl__header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p className="sl__supertitle">shop by occasion</p>
        <h2 className="sl__heading">
          Choose what you need, <br /><em>for every moment</em>
        </h2>
      </motion.div>

      <div className="sl__layers">
        {LAYERS.map(({ Icon, title, body, href, img }, i) => (
          <motion.div
            key={title}
            className="sl__layer"
            initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="sl__layer-inner">
              <motion.div
                className="sl__icon-wrap"
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 + 0.2 }}
              >
                <Icon />
              </motion.div>
              <div className="sl__content">
                <h3 className="sl__title">{title}</h3>
                <p className="sl__body">{body}</p>
                <a href={href} onClick={stop} className="sl__btn">Shop Now →</a>
              </div>
            </div>
            <motion.div
              className="sl__media"
              initial={{ opacity: 0, scale: 1.04 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.1 + 0.1 }}
            >
              <img src={img} alt={title} className="sl__img" loading="lazy" />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ScrollingLayers;
