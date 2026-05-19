import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CollectionHighlight.css';

const CDN = '/assets';

const COLLECTIONS = [
  {
    title: 'Casual',
    href: '/collections/best-sellers',
    desc: 'Effortlessly coordinated everyday wear designed for couples who love to keep it relaxed and stylish.',
    bg:  'https://loremflickr.com/1920/1080/couple,fashion?lock=4',
    bgM: 'https://loremflickr.com/960/1200/couple,fashion?lock=4',
    product: {
      img: 'https://loremflickr.com/400/500/clothing?lock=43',
      name: 'Weekend Hoodie Set', href: '/products/cc-weekend-hoodie-set',
      body: 'Matching hoodies crafted from premium cotton for ultimate weekend comfort.',
      bullets: ['Soft brushed fleece interior', 'His & hers relaxed fit'],
    },
  },
  {
    title: 'Date Night',
    href: '/collections/best-sellers',
    desc: 'Elegant coordinated outfits that make every date night a little more memorable and picture-perfect.',
    bg:  'https://loremflickr.com/1920/1080/couple,fashion?lock=5',
    bgM: 'https://loremflickr.com/960/1200/couple,fashion?lock=5',
    product: {
      img: 'https://loremflickr.com/400/500/clothing?lock=44',
      name: 'Linen Couple Shirt', href: '/products/cc-linen-couple-shirt',
      body: 'Breathable linen shirts designed for coordinated couple elegance.',
      bullets: ['Lightweight & breathable', 'Tailored couple fit'],
    },
  },
  {
    title: 'Loungewear',
    href: '/collections/best-sellers',
    desc: 'Ultra-cozy matching sets for lazy Sundays, movie nights, and everything in between.',
    bg:  'https://loremflickr.com/1920/1080/couple,fashion?lock=6',
    bgM: 'https://loremflickr.com/960/1200/couple,fashion?lock=6',
    product: {
      img: 'https://loremflickr.com/400/500/clothing?lock=45',
      name: 'Matching Jogger Set', href: '/products/cc-matching-jogger-set',
      body: 'Premium cotton joggers with matching design for couples who love comfort.',
      bullets: ['Relaxed tapered fit', 'Coordinated color options'],
    },
  },
];

const stop = e => e.preventDefault();
const CheckIcon = () => (
  <svg viewBox="0 0 256 256" fill="none" width="14" height="14">
    <path d="m40 144 56 56L224 72" stroke="currentColor" strokeWidth="24"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const contentVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0, 0, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

const productVariants = {
  hidden:  { opacity: 0, x: 30, scale: 0.96 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0, 0, 1], delay: 0.08 } },
  exit:    { opacity: 0, x: -20, scale: 0.96, transition: { duration: 0.25 } },
};

const CollectionHighlight = () => {
  const [active, setActive] = useState(0);
  const col = COLLECTIONS[active];

  return (
    <section className="ch">
      <div className="ch__bgs" aria-hidden="true">
        {COLLECTIONS.map((c, i) => (
          <picture key={i} className={`ch__bg${i === active ? ' ch__bg--active' : ''}`}>
            <source media="(max-width: 767px)" srcSet={c.bgM} />
            <img src={c.bg} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
          </picture>
        ))}
        <div className="ch__overlay" />
      </div>

      <div className="ch__content">
        <div className="ch__left">
          <p className="ch__supertitle">our collections</p>
          <nav className="ch__titles">
            {COLLECTIONS.map((c, i) => (
              <button
                key={c.title}
                className={`ch__title-btn${i === active ? ' ch__title-btn--active' : ''}`}
                onClick={() => setActive(i)}>
                {c.title}
              </button>
            ))}
          </nav>
          <AnimatePresence mode="wait">
            <motion.div className="ch__desc" key={`desc-${active}`}
              variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <p>{col.desc}</p>
              <a href={col.href} onClick={stop} className="ch__btn">Shop now →</a>
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div className="ch__product-wrap" key={`prod-${active}`}
            variants={productVariants} initial="hidden" animate="visible" exit="exit">
            <div className="ch__product">
              <a href={col.product.href} onClick={stop}>
                <img src={col.product.img} alt={col.product.name} className="ch__product-img" loading="lazy"/>
              </a>
              <div className="ch__product-info">
                <a href={col.product.href} onClick={stop} className="ch__product-name">
                  {col.product.name}
                </a>
                <p className="ch__product-body">{col.product.body}</p>
                <ul className="ch__product-bullets">
                  {col.product.bullets.map(b => (
                    <li key={b}><CheckIcon /> {b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CollectionHighlight;
