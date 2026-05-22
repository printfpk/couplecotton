import React from 'react';
import { motion } from 'framer-motion';
import './CustomSection1.css';

const CDN = '/assets';

const CARDS = [
  {
    img: `${CDN}/collection-with-bg-1.webp`,
    imgM: `${CDN}/collection-with-bg-1-m.webp`,
    badge: 'Nutrient Support',
    title: 'Support metabolic balance',
    href: '/collections/all',
    prodImg: `${CDN}/DailyVitalitySoftgels1597881482.webp`,
  },
  {
    img: `${CDN}/collection-with-bg-2-new.webp`,
    imgM: `${CDN}/collection-with-bg-2-m-new.webp`,
    badge: 'Immune Defense',
    title: 'Strengthen natural immunity',
    href: '/collections/all',
    prodImg: `${CDN}/DailySkinSynbiotic1.webp`,
  },
  {
    img: `${CDN}/collection-with-bg-3.webp`,
    imgM: `${CDN}/collection-with-bg-3-m.webp`,
    badge: 'Mind & Focus',
    title: 'Promote cognitive health',
    href: '/collections/all',
    prodImg: `${CDN}/DailyOmegaComplex1597881476.webp`,
  },
];

const CustomSection1 = () => (
  <section className="cs1">
    <div className="cs1__container">
      <motion.div
        className="cs1__header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p className="cs1__subheading">Formulations</p>
        <h2 className="cs1__heading">Science-backed formulations</h2>
        <p className="cs1__body">
          Our targeted blends combine research-backed ingredients with thoughtful formulation to support lasting vitality
          and balance.
        </p>
      </motion.div>

      <div className="cs1__grid">
        {CARDS.map(({ img, imgM, badge, title, href, prodImg }, i) => (
          <motion.div
            key={badge}
            className="cs1__card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.02, transition: { duration: 0.22 } }}
          >
            <picture className="cs1__card-picture">
              <source media="(max-width: 767px)" srcSet={imgM} />
              <img src={img} alt={title} className="cs1__card-img" loading="lazy" />
            </picture>
            <div className="cs1__card-overlay" aria-hidden="true" />
            <div className="cs1__card-badge">
              <img src={prodImg} alt="" className="cs1__card-badge-img" loading="lazy" />
            </div>
            <div className="cs1__card-content">
              <span className="cs1__card-tag">{badge}</span>
              <h3 className="cs1__card-title">{title}</h3>
              <a href={href} onClick={e => e.preventDefault()} className="cs1__card-btn">Shop Now</a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CustomSection1;
