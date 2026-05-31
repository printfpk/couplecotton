import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const m = (n) => `https://loremflickr.com/150/150/clothing?lock=${n}`;
// Logo replaced with text

const SHOP_CATS = [
  {
    key: 'for-him', label: 'Shop For Him', href: '/collections/shop-for-him',
    items: [
      { label: 'T-Shirts', img: m(1), href: '/collections/tshirts' },
      { label: 'Hoodies', img: m(2), href: '/collections/hoodies' },
      { label: 'Polo Shirts', img: m(3), href: '/collections/polo-shirts' },
      { label: 'Pants', img: m(4), href: '/collections/pants' },
      { label: 'Joggers', img: m(5), href: '/collections/joggers' },
      { label: 'Loungewear', img: m(6), href: '/collections/loungewear' },
      { label: 'Accessories', img: m(7), href: '/collections/accessories' },
    ],
  },
  {
    key: 'for-her', label: 'Shop For Her', href: '/collections/shop-for-her',
    items: [
      { label: 'Couple Tees', img: m(15), href: '/collections/couple-tees' },
      { label: 'Date Night', img: m(17), href: '/collections/date-night' },
      { label: 'Dresses', img: m(4), href: '/collections/dresses' },
      { label: 'Tops', img: m(3), href: '/collections/tops' },
      { label: 'Shop All', img: m(20), href: '/collections/all-her' },
    ],
  },
  {
    key: 'bestsellers', label: 'Shop Bestsellers', href: '/collections/shop-bestsellers',
    items: [
      { label: 'Matching Tees', img: m(4), href: '/collections/matching-tees' },
      { label: 'Couple Hoodies', img: m(5), href: '/collections/couple-hoodies' },
      { label: 'Lounge Sets', img: m(2), href: '/collections/lounge-sets' },
      { label: 'Date Night', img: m(8), href: '/collections/date-night' },
      { label: 'New Drops', img: m(10), href: '/collections/new-drops' },
      { label: 'Shop All', img: m(20), href: '/collections/all' },
    ],
  },
  {
    key: 'all', label: 'Shop All', href: '/collections/all',
    items: [
      { label: 'T-Shirts', img: m(1), href: '/collections/tshirts' },
      { label: 'Hoodies', img: m(2), href: '/collections/hoodies' },
      { label: 'Polo Shirts', img: m(3), href: '/collections/polo-shirts' },
      { label: 'Pants', img: m(4), href: '/collections/pants' },
      { label: 'Joggers', img: m(5), href: '/collections/joggers' },
      { label: 'Loungewear', img: m(6), href: '/collections/loungewear' },
      { label: 'Accessories', img: m(7), href: '/collections/accessories' },
    ],
  },
];

const COL_COLUMNS = [
  {
    title: 'For Him', links: [
      { label: 'T-Shirts', href: '/collections/tshirts' },
      { label: 'Hoodies', href: '/collections/hoodies' },
      { label: 'Polo Shirts', href: '/collections/polo-shirts' },
      { label: 'Loungewear', href: '/collections/loungewear' },
      { label: 'Accessories', href: '/collections/accessories' },
      { label: 'Shop All', href: '/collections/all' },
    ]
  },
  {
    title: 'Couple Sets', links: [
      { label: 'Matching Tees', href: '/collections/matching-tees' },
      { label: 'Couple Hoodies', href: '/collections/couple-hoodies' },
      { label: 'Lounge Sets', href: '/collections/lounge-sets' },
      { label: 'Date Night', href: '/collections/date-night' },
      { label: 'Pajama Pairs', href: '/collections/pajama-pairs' },
      { label: 'Shop All', href: '/collections/all' },
    ]
  },
  {
    title: 'For Her', links: [
      { label: 'Couple Tees', href: '/collections/couple-tees' },
      { label: 'Date Night', href: '/collections/date-night' },
      { label: 'Dresses', href: '/collections/dresses' },
      { label: 'Tops', href: '/collections/tops' },
      { label: 'Shop All', href: '/collections/all-her' },
    ]
  },
];

const COL_CARDS = [
  { tag: 'Couple Sets', title: 'Twinning is winning', img: m(4), href: '/collections/couple-sets' },
  { tag: 'New Arrivals', title: 'Fresh drops for two', img: m(9), href: '/collections/all' },
];

const PAGES_CARDS = [
  { label: 'Our Story', img: m(8), href: '/pages/our-story' },
  { label: 'Our Journal', img: m(9), href: '/blogs/journal' },
  { label: 'Our Services', img: m(10), href: '/pages/services' },
];

const PAGES_LINKS = [
  { label: 'Our Story', href: '/pages/our-story' },
  { label: 'FAQs', href: '/pages/faqs' },
  { label: 'Contact Us', href: '/pages/contact' },
  { label: 'Find A Store', href: '/pages/find-a-store' },
  { label: 'Our Journal', href: '/blogs/journal' },
  { label: 'Help Center', href: '/pages/help' },
];

const FEATURES_ITEMS = [
  { label: 'Collections', arrow: true, href: '/collections' },
  { label: 'Product Gallery', arrow: true, href: '/pages/product-gallery' },
  { label: 'Product Flash Sale', arrow: false, href: '/pages/flash-sale' },
];

const MOBILE_SECTIONS = [
  {
    key: 'shop',
    label: 'Shop',
    links: SHOP_CATS.map((cat) => ({ label: cat.label, href: cat.href })),
  },
  {
    key: 'collections',
    label: 'Collections',
    links: COL_COLUMNS.flatMap((col) => col.links),
  },
  {
    key: 'pages',
    label: 'Pages',
    links: PAGES_LINKS,
  },
  {
    key: 'features',
    label: 'Features',
    links: FEATURES_ITEMS.map((item) => ({ label: item.label, href: item.href })),
  },
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
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const FlipText = ({ children }) => {
  if (typeof children !== 'string') return children;
  return (
    <motion.span
      initial="initial"
      whileHover="hover"
      style={{ position: 'relative', display: 'inline-flex', overflow: 'hidden' }}
    >
      <span style={{ display: 'flex' }}>
        {children.split('').map((char, i) => (
          <motion.span
            key={i}
            variants={{
              initial: { y: 0 },
              hover: { y: '-100%' }
            }}
            transition={{ duration: 0.25, delay: i * 0.02, ease: 'easeInOut' }}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {char}
          </motion.span>
        ))}
      </span>
      <span style={{ position: 'absolute', top: 0, left: 0, display: 'flex' }}>
        {children.split('').map((char, i) => (
          <motion.span
            key={i}
            variants={{
              initial: { y: '100%' },
              hover: { y: 0 }
            }}
            transition={{ duration: 0.25, delay: i * 0.02, ease: 'easeInOut' }}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
};

// ── Mega menu animation variants ────────────────────────────
const megaVariants = {
  hidden: { opacity: 0, y: -8, scaleY: 0.97 },
  visible: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.22, ease: [0.25, 0, 0, 1] } },
  exit: { opacity: 0, y: -8, scaleY: 0.97, transition: { duration: 0.16, ease: 'easeIn' } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25, ease: 'easeOut' } }),
};

const mobileOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const mobilePanelVariants = {
  hidden: { opacity: 0, y: -14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], when: 'beforeChildren', staggerChildren: 0.05 },
  },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

const mobileListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

// ══════════════════════════════════════════════════════════════
const Navbar = ({ onSearchOpen, onAuthOpen }) => {
  const { user, logout } = useAuth() || {};
  const { cartCount, toggleCart } = useCart() || { cartCount: 0, toggleCart: () => { } };
  const [activeMenu, setActiveMenu] = useState(null);
  const [shopCat, setShopCat] = useState('for-him');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const timerRef = useRef(null);

  const open = useCallback((menu) => { clearTimeout(timerRef.current); setActiveMenu(menu); }, []);
  const close = useCallback(() => { timerRef.current = setTimeout(() => setActiveMenu(null), 140); }, []);
  const stay = useCallback(() => clearTimeout(timerRef.current), []);

  const currentShopCat = SHOP_CATS.find(c => c.key === shopCat) || SHOP_CATS[0];

  const handleSearchOpen = useCallback(() => {
    if (onSearchOpen) onSearchOpen();
  }, [onSearchOpen]);

  const openMobile = useCallback(() => {
    setActiveMenu(null);
    setMobileOpen(true);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileSection(null);
  }, []);

  const toggleMobileSection = useCallback((key) => {
    setMobileSection((prev) => (prev === key ? null : key));
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = '';
      return undefined;
    }

    document.body.style.overflow = 'hidden';

    const handleResize = () => {
      if (window.innerWidth >= 900) {
        closeMobile();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') closeMobile();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, closeMobile]);

  return (
    <nav className="nb" role="navigation">
      {/* ── TOP BAR ───────────────────────────────────────── */}
      <div className="nb__bar">
        <div className="nb__left">
          <button
            className="nb__mobile-toggle"
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={openMobile}
          >
            <IconMenu />
          </button>
          {/* SHOP */}
          <div className={`nb__item${activeMenu === 'shop' ? ' nb__item--open' : ''}`}
            onMouseEnter={() => open('shop')} onMouseLeave={close}>
            <button className="nb__item-btn" aria-haspopup="true" aria-expanded={activeMenu === 'shop'}>
              <FlipText>Shop</FlipText> <CaretDown />
            </button>
          </div>

          {/* COLLECTIONS */}
          <div className={`nb__item${activeMenu === 'collections' ? ' nb__item--open' : ''}`}
            onMouseEnter={() => open('collections')} onMouseLeave={close}>
            <button className="nb__item-btn" aria-haspopup="true" aria-expanded={activeMenu === 'collections'}>
              <FlipText>Collections</FlipText> <CaretDown />
            </button>
          </div>

          {/* PAGES */}
          <div className={`nb__item${activeMenu === 'pages' ? ' nb__item--open' : ''}`}
            onMouseEnter={() => open('pages')} onMouseLeave={close}>
            <button className="nb__item-btn" aria-haspopup="true" aria-expanded={activeMenu === 'pages'}>
              <FlipText>Pages</FlipText> <CaretDown />
            </button>
          </div>

          {/* FEATURES */}
          <div className={`nb__item nb__item--features${activeMenu === 'features' ? ' nb__item--open' : ''}`}
            onMouseEnter={() => open('features')} onMouseLeave={close}
            style={{ position: 'relative' }}>
            <button className="nb__item-btn" aria-haspopup="true" aria-expanded={activeMenu === 'features'}>
              <FlipText>Features</FlipText> <CaretDown />
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
                        <Link to={item.href} onClick={close} className="mega__features-item">
                          <FlipText>{item.label}</FlipText>
                          {item.arrow && <span className="mega__features-item-arrow">›</span>}
                        </Link>
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
          <Link to="/" className="nb__logo-link">
            <FlipText>CoupleCotton</FlipText>
          </Link>
        </div>

        {/* Right icons */}
        <div className="nb__right">
          <button className="nb__search-pill" type="button" onClick={handleSearchOpen} aria-label="Open search">
            <span className="nb__search-text"><FlipText>What are you looking for?</FlipText></span>
            <span className="nb__search-icon"><IconSearch /></span>
          </button>
          <Link to="/try-on" className="nb__tryon-btn"><FlipText>Try On 3D</FlipText></Link>
          {user ? (
            <Link to="/profile" className="nb__icon-btn" aria-label="Profile" title="My Profile" style={{ position: 'relative' }}>
              <IconUser />
              <div style={{ position: 'absolute', bottom: -2, right: -4, background: '#2d5a3e', color: '#fff', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold', border: '2px solid #fff' }}>✓</div>
            </Link>
          ) : (
            <button className="nb__icon-btn" aria-label="Account" onClick={onAuthOpen}><IconUser /></button>
          )}
          <button className="nb__icon-btn" aria-label="Cart" onClick={() => toggleCart(true)}>
            <IconCart />
            {cartCount > 0 && <span className="nb__cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nb__mobile-overlay"
            variants={mobileOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeMobile}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
          >
            <motion.div
              className="nb__mobile-panel"
              variants={mobilePanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="nb__mobile-header">
                <span className="nb__mobile-logo"><FlipText>CoupleCotton</FlipText></span>
                <button className="nb__mobile-close" type="button" aria-label="Close menu" onClick={closeMobile}>
                  <IconClose />
                </button>
              </div>

              <motion.div className="nb__mobile-list" variants={mobileListVariants}>
                {MOBILE_SECTIONS.map((section) => (
                  <motion.div
                    key={section.key}
                    className="nb__mobile-section"
                    variants={mobileItemVariants}
                  >
                    <button
                      className="nb__mobile-section-btn"
                      type="button"
                      aria-expanded={mobileSection === section.key}
                      onClick={() => toggleMobileSection(section.key)}
                    >
                      <span><FlipText>{section.label}</FlipText></span>
                      <span className={`nb__mobile-chevron${mobileSection === section.key ? ' is-open' : ''}`}>
                        <IconChevron />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {mobileSection === section.key && (
                        <motion.div
                          className="nb__mobile-links"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                          {section.links.map((lnk, i) => (
                            <motion.div key={`${section.key}-${lnk.label}`} custom={i} variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                              <Link to={lnk.href} onClick={closeMobile} className="nb__mobile-link">
                                <FlipText>{lnk.label}</FlipText>
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>

              <div className="nb__mobile-footer">
                <Link to="/try-on" className="nb__mobile-cta" onClick={closeMobile}>
                  Try On 3D
                </Link>
                {user ? (
                  <Link to="/profile" className="nb__mobile-action" onClick={closeMobile} style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
                    My Profile ({user.fullName?.firstName || user.username})
                  </Link>
                ) : (
                  <button className="nb__mobile-action" type="button" onClick={onAuthOpen}>
                    Sign In / Register
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <motion.div key={cat.key} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                    <Link to={cat.href} onClick={close} className={`mega__sidebar-link${shopCat === cat.key ? ' mega__sidebar-link--active' : ''}`} onMouseEnter={() => setShopCat(cat.key)}>
                      <FlipText>{cat.label}</FlipText>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mega__products">
                <AnimatePresence mode="wait">
                  <motion.div key={shopCat} className="mega__products-grid"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                    {currentShopCat.items.map((item, i) => (
                      <motion.div key={item.label} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                        <Link to={item.href} onClick={close} className="mega__product-item">
                          <img src={item.img} alt={item.label} className="mega__product-img" />
                          <span className="mega__product-label">{item.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mega__promo">
                <div className="mega__promo-card">
                  <span className="mega__promo-tag">NEW IN</span>
                  <h3 className="mega__promo-title">Fresh couple drops</h3>
                  <Link to="/collections/new-arrivals" onClick={close} className="mega__promo-btn">
                    Shop Now <span className="mega__promo-btn-icon">›</span>
                  </Link>
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
                          <Link to={lnk.href} onClick={close} className="mega__column-link"><FlipText>{lnk.label}</FlipText></Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
              <div className="mega__cards">
                {COL_CARDS.map((card, i) => (
                  <motion.div key={card.tag} custom={i + COL_COLUMNS.length} variants={itemVariants} initial="hidden" animate="visible">
                    <Link to={card.href} onClick={close} className="mega__img-card">
                      <img src={card.img} alt={card.title} />
                      <div className="mega__img-card-overlay">
                        <span className="mega__img-card-tag">{card.tag}</span>
                        <h4 className="mega__img-card-title">{card.title}</h4>
                        <button className="mega__img-card-btn">›</button>
                      </div>
                    </Link>
                  </motion.div>
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
                  <motion.div key={card.label} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                    <Link to={card.href} onClick={close} className="mega__page-card">
                      <div className="mega__page-card-image">
                        <img src={card.img} alt={card.label} />
                      </div>
                      <div className="mega__page-card-footer">
                        <span>{card.label}</span>
                        <span className="mega__page-card-arrow">›</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mega__page-links">
                {PAGES_LINKS.map((lnk, i) => (
                  <motion.div key={lnk.label} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                    <Link to={lnk.href} onClick={close} className="mega__page-link">
                      <FlipText>{lnk.label}</FlipText>
                    </Link>
                  </motion.div>
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
