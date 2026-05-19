import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Navbar.css';

const CDN = '/assets';
const m = (n) => `https://loremflickr.com/150/150/clothing?lock=${n}`;
// Logo replaced with text

const SHOP_CATS = [
  { key: 'for-him', label: 'Shop For Him', href: '/collections/shop-for-him',
    items: [
      { label: 'T-Shirts',    img: m(1), href: '/collections/tshirts' },
      { label: 'Hoodies',     img: m(2), href: '/collections/hoodies' },
      { label: 'Polo Shirts', img: m(3), href: '/collections/polo-shirts' },
      { label: 'Pants',       img: m(4), href: '/collections/pants' },
      { label: 'Joggers',     img: m(5), href: '/collections/joggers' },
      { label: 'Loungewear',  img: m(6), href: '/collections/loungewear' },
      { label: 'Accessories', img: m(7), href: '/collections/accessories' },
    ],
  },
  { key: 'for-her', label: 'Shop For Her', href: '/collections/shop-for-her',
    items: [
      { label: 'Couple Tees',  img: m(15), href: '/collections/couple-tees' },
      { label: 'Date Night',   img: m(17), href: '/collections/date-night' },
      { label: 'Dresses',      img: m(4),  href: '/collections/dresses' },
      { label: 'Tops',         img: m(3),  href: '/collections/tops' },
      { label: 'Shop All',     img: m(20), href: '/collections/all-her' },
    ],
  },
  { key: 'bestsellers', label: 'Shop Bestsellers', href: '/collections/shop-bestsellers',
    items: [
      { label: 'Matching Tees',   img: m(4),  href: '/collections/matching-tees' },
      { label: 'Couple Hoodies',  img: m(5),  href: '/collections/couple-hoodies' },
      { label: 'Lounge Sets',     img: m(2),  href: '/collections/lounge-sets' },
      { label: 'Date Night',      img: m(8),  href: '/collections/date-night' },
      { label: 'New Drops',       img: m(10), href: '/collections/new-drops' },
      { label: 'Shop All',        img: m(20), href: '/collections/all' },
    ],
  },
  { key: 'all', label: 'Shop All', href: '/collections/all',
    items: [
      { label: 'T-Shirts',    img: m(1), href: '/collections/tshirts' },
      { label: 'Hoodies',     img: m(2), href: '/collections/hoodies' },
      { label: 'Polo Shirts', img: m(3), href: '/collections/polo-shirts' },
      { label: 'Pants',       img: m(4), href: '/collections/pants' },
      { label: 'Joggers',     img: m(5), href: '/collections/joggers' },
      { label: 'Loungewear',  img: m(6), href: '/collections/loungewear' },
      { label: 'Accessories', img: m(7), href: '/collections/accessories' },
    ],
  },
];

const COL_COLUMNS = [
  { title: 'For Him', links: [
    { label: 'T-Shirts',    href: '/collections/tshirts' },
    { label: 'Hoodies',     href: '/collections/hoodies' },
    { label: 'Polo Shirts', href: '/collections/polo-shirts' },
    { label: 'Loungewear',  href: '/collections/loungewear' },
    { label: 'Accessories', href: '/collections/accessories' },
    { label: 'Shop All',    href: '/collections/all' },
  ]},
  { title: 'Couple Sets', links: [
    { label: 'Matching Tees',  href: '/collections/matching-tees' },
    { label: 'Couple Hoodies', href: '/collections/couple-hoodies' },
    { label: 'Lounge Sets',    href: '/collections/lounge-sets' },
    { label: 'Date Night',     href: '/collections/date-night' },
    { label: 'Pajama Pairs',   href: '/collections/pajama-pairs' },
    { label: 'Shop All',       href: '/collections/all' },
  ]},
  { title: 'For Her', links: [
    { label: 'Couple Tees', href: '/collections/couple-tees' },
    { label: 'Date Night',  href: '/collections/date-night' },
    { label: 'Dresses',     href: '/collections/dresses' },
    { label: 'Tops',        href: '/collections/tops' },
    { label: 'Shop All',    href: '/collections/all-her' },
  ]},
];

const COL_CARDS = [
  { tag: 'Couple Sets',  title: 'Twinning is winning',  img: m(4), href: '/collections/couple-sets' },
  { tag: 'New Arrivals', title: 'Fresh drops for two', img: m(9), href: '/collections/all' },
];

const PAGES_CARDS = [
  { label: 'Our Story',   img: m(8),  href: '/pages/our-story' },
  { label: 'Our Journal', img: m(9),  href: '/blogs/journal' },
  { label: 'Our Services',img: m(10), href: '/pages/services' },
];

const PAGES_LINKS = [
  { label: 'Our Story',    href: '/pages/our-story' },
  { label: 'FAQs',         href: '/pages/faqs' },
  { label: 'Contact Us',   href: '/pages/contact' },
  { label: 'Find A Store', href: '/pages/find-a-store' },
  { label: 'Our Journal',  href: '/blogs/journal' },
  { label: 'Help Center',  href: '/pages/help' },
];

const FEATURES_ITEMS = [
  { label: 'Collections',       arrow: true,  href: '/collections' },
  { label: 'Product Gallery',   arrow: true,  href: '/pages/product-gallery' },
  { label: 'Product Flash Sale',arrow: false, href: '/pages/flash-sale' },
];

// ── SVG helpers ─────────────────────────────────────────────
const CaretDown = () => (
  <svg className="nb__caret" viewBox="0 0 20 20" fill="none">
    <path d="M16.25 7.5L10 13.75L3.75 7.5" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

// ── Mega menu animation variants ────────────────────────────
const megaVariants = {
  hidden: { opacity: 0, y: -8, scaleY: 0.97 },
  visible: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.22, ease: [0.25, 0, 0, 1] } },
  exit:    { opacity: 0, y: -8, scaleY: 0.97, transition: { duration: 0.16, ease: 'easeIn' } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25, ease: 'easeOut' } }),
};

// ══════════════════════════════════════════════════════════════
const Navbar = ({ onSearchOpen, onCartOpen }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [shopCat, setShopCat]       = useState('for-him');
  const timerRef                    = useRef(null);

  const open  = useCallback((menu) => { clearTimeout(timerRef.current); setActiveMenu(menu); }, []);
  const close = useCallback(() => { timerRef.current = setTimeout(() => setActiveMenu(null), 140); }, []);
  const stay  = useCallback(() => clearTimeout(timerRef.current), []);
  const stop  = (e) => e.preventDefault();

  const currentShopCat = SHOP_CATS.find(c => c.key === shopCat) || SHOP_CATS[0];

  return (
    <nav className="nb" role="navigation">
      {/* ── TOP BAR ───────────────────────────────────────── */}
      <div className="nb__bar">
        <div className="nb__left">
          {/* SHOP */}
          <div className={`nb__item${activeMenu === 'shop' ? ' nb__item--open' : ''}`}
            onMouseEnter={() => open('shop')} onMouseLeave={close}>
            <button className="nb__item-btn" aria-haspopup="true" aria-expanded={activeMenu === 'shop'}>
              Shop <CaretDown />
            </button>
          </div>

          {/* COLLECTIONS */}
          <div className={`nb__item${activeMenu === 'collections' ? ' nb__item--open' : ''}`}
            onMouseEnter={() => open('collections')} onMouseLeave={close}>
            <button className="nb__item-btn" aria-haspopup="true" aria-expanded={activeMenu === 'collections'}>
              Collections <CaretDown />
            </button>
          </div>

          {/* PAGES */}
          <div className={`nb__item${activeMenu === 'pages' ? ' nb__item--open' : ''}`}
            onMouseEnter={() => open('pages')} onMouseLeave={close}>
            <button className="nb__item-btn" aria-haspopup="true" aria-expanded={activeMenu === 'pages'}>
              Pages <CaretDown />
            </button>
          </div>

          {/* FEATURES */}
          <div className={`nb__item nb__item--features${activeMenu === 'features' ? ' nb__item--open' : ''}`}
            onMouseEnter={() => open('features')} onMouseLeave={close}
            style={{ position: 'relative' }}>
            <button className="nb__item-btn" aria-haspopup="true" aria-expanded={activeMenu === 'features'}>
              Features <CaretDown />
            </button>
            <AnimatePresence>
              {activeMenu === 'features' && (
                <motion.div className="mega mega--features"
                  variants={megaVariants} initial="hidden" animate="visible" exit="exit"
                  style={{ transformOrigin: 'top center' }}
                  onMouseEnter={stay} onMouseLeave={close}>
                  <ul className="mega__features-list">
                    {FEATURES_ITEMS.map((item, i) => (
                      <motion.li key={item.label} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                        <a href={item.href} onClick={stop} className="mega__features-item">
                          <span>{item.label}</span>
                          {item.arrow && <span className="mega__features-item-arrow">›</span>}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center logo */}
        <div className="nb__logo">
          <a href="/" onClick={stop} style={{ textDecoration: 'none', color: '#ffffff', fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>
            CoupleCotton
          </a>
        </div>

        {/* Right icons */}
        <div className="nb__right">
          <Link to="/try-on" className="nb__tryon-btn">✨ Try On 3D</Link>
          <button className="nb__icon-btn" aria-label="Search" onClick={onSearchOpen}><IconSearch /></button>
          <button className="nb__icon-btn" aria-label="Account"><IconUser /></button>
          <button className="nb__icon-btn" aria-label="Cart" onClick={onCartOpen}><IconCart /></button>
        </div>
      </div>

      {/* ── SHOP MEGA MENU ──────────────────────────────── */}
      <AnimatePresence>
        {activeMenu === 'shop' && (
          <motion.div className="mega mega--shop"
            variants={megaVariants} initial="hidden" animate="visible" exit="exit"
            style={{ transformOrigin: 'top center' }}
            onMouseEnter={stay} onMouseLeave={close}>
            <div className="mega__inner">
              <div className="mega__sidebar">
                {SHOP_CATS.map((cat, i) => (
                  <motion.a key={cat.key} href={cat.href} onClick={stop}
                    className={`mega__sidebar-link${shopCat === cat.key ? ' mega__sidebar-link--active' : ''}`}
                    onMouseEnter={() => setShopCat(cat.key)}
                    custom={i} variants={itemVariants} initial="hidden" animate="visible">
                    {cat.label}
                  </motion.a>
                ))}
              </div>
              <div className="mega__products">
                <AnimatePresence mode="wait">
                  <motion.div key={shopCat} className="mega__products-grid"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                    {currentShopCat.items.map((item, i) => (
                      <motion.a key={item.label} href={item.href} onClick={stop} className="mega__product-item"
                        custom={i} variants={itemVariants} initial="hidden" animate="visible">
                        <img src={item.img} alt={item.label} className="mega__product-img" />
                        <span className="mega__product-label">{item.label}</span>
                      </motion.a>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mega__promo">
                <div className="mega__promo-card">
                  <span className="mega__promo-tag">NEW IN</span>
                  <h3 className="mega__promo-title">Fresh couple drops</h3>
                  <a href="/collections/new-arrivals" onClick={stop} className="mega__promo-btn">
                    Shop Now <span className="mega__promo-btn-icon">›</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COLLECTIONS MEGA MENU ───────────────────────── */}
      <AnimatePresence>
        {activeMenu === 'collections' && (
          <motion.div className="mega mega--collections"
            variants={megaVariants} initial="hidden" animate="visible" exit="exit"
            style={{ transformOrigin: 'top center' }}
            onMouseEnter={stay} onMouseLeave={close}>
            <div className="mega__inner">
              <div className="mega__columns">
                {COL_COLUMNS.map((col, ci) => (
                  <motion.div key={col.title} className="mega__column"
                    custom={ci} variants={itemVariants} initial="hidden" animate="visible">
                    <h4 className="mega__column-title">{col.title}</h4>
                    <ul className="mega__column-list">
                      {col.links.map(lnk => (
                        <li key={lnk.label}>
                          <a href={lnk.href} onClick={stop} className="mega__column-link">{lnk.label}</a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
              <div className="mega__cards">
                {COL_CARDS.map((card, i) => (
                  <motion.a key={card.tag} href={card.href} onClick={stop} className="mega__img-card"
                    custom={i + COL_COLUMNS.length} variants={itemVariants} initial="hidden" animate="visible">
                    <img src={card.img} alt={card.title} />
                    <div className="mega__img-card-overlay">
                      <span className="mega__img-card-tag">{card.tag}</span>
                      <h4 className="mega__img-card-title">{card.title}</h4>
                      <button className="mega__img-card-btn" onClick={stop}>›</button>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGES MEGA MENU ─────────────────────────────── */}
      <AnimatePresence>
        {activeMenu === 'pages' && (
          <motion.div className="mega mega--pages"
            variants={megaVariants} initial="hidden" animate="visible" exit="exit"
            style={{ transformOrigin: 'top center' }}
            onMouseEnter={stay} onMouseLeave={close}>
            <div className="mega__inner">
              <div className="mega__quote">
                <p>Our most-loved matching outfits — and for good reason.</p>
              </div>
              <div className="mega__page-cards">
                {PAGES_CARDS.map((card, i) => (
                  <motion.a key={card.label} href={card.href} onClick={stop} className="mega__page-card"
                    custom={i} variants={itemVariants} initial="hidden" animate="visible">
                    <div className="mega__page-card-image">
                      <img src={card.img} alt={card.label} />
                    </div>
                    <div className="mega__page-card-footer">
                      <span>{card.label}</span>
                      <span className="mega__page-card-arrow">›</span>
                    </div>
                  </motion.a>
                ))}
              </div>
              <div className="mega__page-links">
                {PAGES_LINKS.map((lnk, i) => (
                  <motion.a key={lnk.label} href={lnk.href} onClick={stop} className="mega__page-link"
                    custom={i} variants={itemVariants} initial="hidden" animate="visible">
                    {lnk.label}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
