import React from 'react';
import { motion } from 'framer-motion';
import './CustomSection1.css';

const CDN = '/assets';

const CARDS = [
  {
    img: 'https://ik.imagekit.io/printf/couplecotton/couplecotton01.png',
    imgM: 'https://ik.imagekit.io/printf/couplecotton/cotton01mob%20-%20Copy.png',
    badge: 'Streetwear',
    title: 'Urban matching sets',
    href: '/collections/all',
  },
  {
    img: 'https://ik.imagekit.io/printf/couplecotton/couplecotton02.png',
    imgM: 'https://ik.imagekit.io/printf/couplecotton/ChatGPT%20Image%20May%2031,%202026,%2001_28_38%20AM.png',
    badge: 'Lounge Wear',
    title: 'Cozy indoor essentials',
    href: '/collections/all',
  },
  {
    img: 'https://ik.imagekit.io/printf/couplecotton/couplecotton03.png',
    imgM: 'https://ik.imagekit.io/printf/couplecotton/ChatGPT%20Image%20May%2031,%202026,%2001_30_47%20AM.png',
    badge: 'Travel & Outdoors',
    title: 'Explore together',
    href: '/collections/all',
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
        <p className="cs1__subheading">Our Collections</p>
        <h2 className="cs1__heading">Matching Couple Styles</h2>
        <p className="cs1__body">
          Our matching sets combine premium cotton with thoughtful designs to keep you both comfortable and stylish, wherever you go.
        </p>
      </motion.div>

      <div className="cs1__grid">
        {CARDS.map(({ img, imgM, badge, title, href }, i) => (
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
