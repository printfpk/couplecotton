import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './ProductTabs.css';

const CDN = '/assets';

/* ── Product data ─────────────────────────────────────────────── */
const BEST_SELLERS = [
  { name: 'Classic Duo Tee', type: 'Couple Set', badge: 'Sale', href: '/products/cc-classic-duo-tee', img1: 'https://loremflickr.com/600/800/clothing?lock=11', img2: 'https://loremflickr.com/600/800/clothing?lock=12', price: '$50.00', compareAt: '$110.00' },
  { name: 'Weekend Hoodie Set', type: 'Couple Set', badge: null, href: '/products/cc-weekend-hoodie-set', img1: 'https://loremflickr.com/600/800/clothing?lock=13', img2: 'https://loremflickr.com/600/800/clothing?lock=14', price: '$54.00', compareAt: null },
  { name: 'Linen Couple Shirt', type: 'Matching Set', badge: null, href: '/products/cc-linen-couple-shirt', img1: 'https://loremflickr.com/600/800/clothing?lock=15', img2: 'https://loremflickr.com/600/800/clothing?lock=16', price: '$48.00', compareAt: null },
  { name: 'Matching Jogger Set', type: 'Duo Pack', badge: 'Sale', href: '/products/cc-matching-jogger-set', img1: 'https://loremflickr.com/600/800/clothing?lock=17', img2: 'https://loremflickr.com/600/800/clothing?lock=18', price: '$46.00', compareAt: '$92.00' },
  { name: 'Cotton Polo Pair', type: 'Couple Set', badge: null, href: '/products/cc-cotton-polo-pair', img1: 'https://loremflickr.com/600/800/clothing?lock=19', img2: 'https://loremflickr.com/600/800/clothing?lock=20', price: '$52.00', compareAt: null },
  { name: 'Date Night Dress Set', type: 'Matching Set', badge: null, href: '/products/cc-date-night-dress-set', img1: 'https://loremflickr.com/600/800/clothing?lock=21', img2: 'https://loremflickr.com/600/800/clothing?lock=22', price: '$49.00', compareAt: null },
  { name: 'Cozy Lounge Set', type: 'Matching Set', badge: null, href: '/products/cc-cozy-lounge-set', img1: 'https://loremflickr.com/600/800/clothing?lock=23', img2: 'https://loremflickr.com/600/800/clothing?lock=24', price: '$51.00', compareAt: null },
  { name: 'Summer Short Set', type: 'Matching Set', badge: 'Sale', href: '/products/cc-summer-short-set', img1: 'https://loremflickr.com/600/800/clothing?lock=25', img2: 'https://loremflickr.com/600/800/clothing?lock=26', price: '$45.00', compareAt: '$90.00' },
];

const NEW_ARRIVALS = [
  { name: 'Striped Duo Tee', type: 'Matching Set', badge: 'New', href: '/products/cc-striped-duo-tee', img1: 'https://loremflickr.com/600/800/clothing?lock=27', img2: 'https://loremflickr.com/600/800/clothing?lock=28', price: '$44.00', compareAt: null },
  { name: 'Flannel Couple Set', type: 'Matching Set', badge: 'New', href: '/products/cc-flannel-couple-set', img1: 'https://loremflickr.com/600/800/clothing?lock=29', img2: 'https://loremflickr.com/600/800/clothing?lock=30', price: '$53.00', compareAt: null },
  { name: 'Graphic Tee Pair', type: 'Couple Set', badge: 'New', href: '/products/cc-graphic-tee-pair', img1: 'https://loremflickr.com/600/800/clothing?lock=31', img2: 'https://loremflickr.com/600/800/clothing?lock=32', price: '$58.00', compareAt: null },
  { name: 'Satin PJ Set', type: 'Couple Set', badge: 'New', href: '/products/cc-satin-pj-set', img1: 'https://loremflickr.com/600/800/clothing?lock=33', img2: 'https://loremflickr.com/600/800/clothing?lock=34', price: '$62.00', compareAt: null },
  { name: 'Denim Jacket Duo', type: 'Matching Set', badge: 'Sale', href: '/products/cc-denim-jacket-duo', img1: 'https://loremflickr.com/600/800/clothing?lock=35', img2: 'https://loremflickr.com/600/800/clothing?lock=36', price: '$47.00', compareAt: '$94.00' },
  { name: 'Bomber Jacket Pair', type: 'Couple Set', badge: 'New', href: '/products/cc-bomber-jacket-pair', img1: 'https://loremflickr.com/600/800/clothing?lock=37', img2: 'https://loremflickr.com/600/800/clothing?lock=38', price: '$42.00', compareAt: null },
  { name: 'Varsity Couple Set', type: 'Matching Set', badge: 'New', href: '/products/cc-varsity-couple-set', img1: 'https://loremflickr.com/600/800/clothing?lock=39', img2: 'https://loremflickr.com/600/800/clothing?lock=40', price: '$46.00', compareAt: null },
  { name: 'Silk Pajama Pair', type: 'Matching Set', badge: 'New', href: '/products/cc-silk-pajama-pair', img1: 'https://loremflickr.com/600/800/clothing?lock=41', img2: 'https://loremflickr.com/600/800/clothing?lock=42', price: '$44.00', compareAt: null },
];

const TABS = [
  { key: 'best', label: 'Best Sellers', products: BEST_SELLERS },
  { key: 'new',  label: 'New Arrivals', products: NEW_ARRIVALS },
];



/* ── Animation variants ──────────────────────────────────────── */
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
  exit:  { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:   { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

/* ── Individual product card ──────────────────────────────────── */
const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const { name, type, badge, href, img1, img2, price, compareAt } = product;
  const onSale = Boolean(compareAt);

  return (
    <motion.div
      className="ptabs__card"
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {badge && (
        <span className={`ptabs__badge ptabs__badge--${badge.toLowerCase()}`}>{badge}</span>
      )}

      <Link to={href} className="ptabs__card-img-link" tabIndex="-1" aria-hidden="true">
        <div className="ptabs__card-media">
          <img
            src={hovered && img2 ? img2 : img1}
            alt={name}
            className="ptabs__card-img"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="ptabs__card-info">
        <span className="ptabs__card-type">{type}</span>
        <Link to={href} className="ptabs__card-name">{name}</Link>
        <div className="ptabs__card-price">
          <span className={`ptabs__price${onSale ? ' ptabs__price--sale' : ''}`}>{price}</span>
          {compareAt && <span className="ptabs__price ptabs__price--compare">{compareAt}</span>}
        </div>
      </div>

      <Link to={href} className="ptabs__quick-add">
        Choose options →
      </Link>
    </motion.div>
  );
};

/* ── Main ProductTabs component ──────────────────────────────── */
const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState('best');
  const tab = TABS.find(t => t.key === activeTab);

  return (
    <motion.section
      className="ptabs"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ptabs__container">
        {/* Header row */}
        <div className="ptabs__header">
          <h2 className="ptabs__heading">Find your perfect match</h2>
          <div className="ptabs__tab-nav" role="tablist">
            {TABS.map(t => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                className={`ptabs__tab${activeTab === t.key ? ' ptabs__tab--active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animated product grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="ptabs__grid"
            role="tabpanel"
            variants={gridVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {tab.products.map(p => (
              <ProductCard key={p.name} product={p} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View all CTA */}
        <div className="ptabs__footer">
          <a href="/collections/all" onClick={stop} className="ptabs__view-all">
            View all products →
          </a>
        </div>
      </div>
    </motion.section>
  );
};

export default ProductTabs;
