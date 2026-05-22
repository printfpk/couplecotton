import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './ProductTabs.css';

const CDN = '/assets';

/* ── Product data ─────────────────────────────────────────────── */
const BEST_SELLERS = [
  {
    name: 'Skin Synbiotic',
    type: 'Vitamin',
    badge: 'Sale',
    href: '/products/skin-synbiotic',
    img1: `${CDN}/DailySkinSynbiotic1.webp`,
    img2: `${CDN}/DailySkinSynbiotic2.webp`,
    price: '$50.00',
    compareAt: '$110.00',
  },
  {
    name: 'Enduro Fuel',
    type: 'Vitamin',
    badge: null,
    href: '/products/enduro-fuel',
    img1: `${CDN}/WellinaEnduroFuel1597881502.webp`,
    img2: `${CDN}/WellinaEnduroFuel1597881503.webp`,
    price: '$54.00',
    compareAt: null,
  },
  {
    name: 'Pure Balance',
    type: 'Vitamin',
    badge: 'Best Sellers',
    href: '/products/pure-balance',
    img1: `${CDN}/WellinaPureBalance1597881490.webp`,
    img2: `${CDN}/WellinaPureBalance1597881491.webp`,
    price: '$48.00',
    compareAt: null,
  },
  {
    name: 'Omega Complex',
    type: 'Vitamin',
    badge: null,
    href: '/products/omega-complex',
    img1: `${CDN}/DailyOmegaComplex1597881476.webp`,
    img2: `${CDN}/DailyOmegaComplex1597881477.webp`,
    price: '$49.00',
    compareAt: null,
  },
];

const NEW_ARRIVALS = [
  {
    name: 'Detox Support',
    type: 'Vitamin',
    badge: 'New',
    href: '/products/detox-support',
    img1: `${CDN}/DailyDetoxSupport1597881463.webp`,
    img2: `${CDN}/DailyDetoxSupport1597881464.webp`,
    price: '$52.00',
    compareAt: null,
  },
  {
    name: 'Metabolism Boost',
    type: 'Vitamin',
    badge: 'New',
    href: '/products/metabolism-boost',
    img1: `${CDN}/DailyMetabolismBoost1597881470.webp`,
    img2: `${CDN}/DailyMetabolismBoost1597881471.webp`,
    price: '$56.00',
    compareAt: null,
  },
  {
    name: 'Vitality Softgels',
    type: 'Vitamin',
    badge: null,
    href: '/products/vitality-softgels',
    img1: `${CDN}/DailyVitalitySoftgels1597881482.webp`,
    img2: `${CDN}/DailyVitalitySoftgels1597881482.webp`,
    price: '$47.00',
    compareAt: null,
  },
  {
    name: 'Plant Protein',
    type: 'Vitamin',
    badge: 'New',
    href: '/products/plant-protein',
    img1: `${CDN}/WellinaPlantProtein1597881526.webp`,
    img2: `${CDN}/WellinaPlantProtein1597881527.webp`,
    price: '$58.00',
    compareAt: null,
  },
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

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

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
        <span
          className={`ptabs__badge ptabs__badge--${badge.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {badge}
        </span>
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

      <Link to={href} className="ptabs__quick-add" aria-label={`Add ${name} to cart`}>
        <CartIcon />
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
          <h2 className="ptabs__heading">Find your supplement</h2>
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
