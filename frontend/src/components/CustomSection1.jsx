import React from 'react';
import { motion } from 'framer-motion';
import './CustomSection1.css';

const CDN = '/assets';

const CARDS = [
  { img: 'https://loremflickr.com/832/1200/couple,clothing?lock=54', imgM: 'https://loremflickr.com/640/800/couple,clothing?lock=54', badge: 'Everyday Essentials', title: 'Casual couple basics', href: '/collections/matching-tees', prodImg: 'https://loremflickr.com/300/400/clothing?lock=11' },
  { img: 'https://loremflickr.com/832/1200/couple,clothing?lock=55', imgM: 'https://loremflickr.com/640/800/couple,clothing?lock=55', badge: 'Date Night', title: 'Dress to impress together', href: '/collections/date-night', prodImg: 'https://loremflickr.com/300/400/clothing?lock=21' },
  { img: 'https://loremflickr.com/832/1200/couple,clothing?lock=56', imgM: 'https://loremflickr.com/640/800/couple,clothing?lock=56', badge: 'Cozy & Comfort', title: 'Lounge sets for two', href: '/collections/lounge-sets', prodImg: 'https://loremflickr.com/300/400/clothing?lock=23' },
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
        <p className="cs1__subheading">Collections</p>
        <h2 className="cs1__heading">Crafted for couples who match</h2>
        <p className="cs1__body">
          Our curated collections bring together premium fabrics and{' '}
          thoughtful design to create matching outfits you'll both love.
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
