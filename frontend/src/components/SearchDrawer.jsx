import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SearchDrawer.css';

const CDN = '/assets';

const KEYWORDS = ['Couple', 'Matching', 'Cotton', 'Hoodie', 'Tee'];

const FEATURED = [
  {
    img:   'https://loremflickr.com/600/800/clothing?lock=19',
    name:  'Cotton Polo Pair',
    type:  'Couple Set',
    price: '$52.00',
    href:  '/products/cc-cotton-polo-pair',
  },
  {
    img:   'https://loremflickr.com/600/800/clothing?lock=21',
    name:  'Linen Couple Shirt',
    type:  'Matching Set',
    price: '$48.00',
    href:  '/products/cc-linen-couple-shirt',
  },
  {
    img:   'https://loremflickr.com/600/800/clothing?lock=23',
    name:  'Summer Short Set',
    type:  'Matching Set',
    price: '$45.00',
    href:  '/products/cc-summer-short-set',
  },
];

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
    <circle cx="8.75" cy="8.75" r="6.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.17 13.17L17.5 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
    <path d="M15.625 4.375L4.375 15.625M15.625 15.625L4.375 4.375" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const stop = e => e.preventDefault();

const drawerVariants = {
  hidden:  { y: '-100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 30 } },
  exit:    { y: '-100%', opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } },
};

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.06, duration: 0.3 } }),
};

const SearchDrawer = ({ open = false, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    if (!open) setQuery('');
  }, [open]);

  const handleSearch = e => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?type=product&options%5Bprefix%5D=last&q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="sdrawer__backdrop" onClick={onClose} aria-hidden="true"
            variants={backdropVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ duration: 0.2 }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            className="sdrawer sdrawer--open"
            aria-label="Search" aria-modal="true"
            variants={drawerVariants} initial="hidden" animate="visible" exit="exit">

            <div className="sdrawer__header">
              <form className="sdrawer__form" onSubmit={handleSearch} role="search">
                <label className="sdrawer__sr-only" htmlFor="search-drawer-input">Search</label>
                <span className="sdrawer__search-icon"><SearchIcon /></span>
                <input
                  id="search-drawer-input"
                  ref={inputRef}
                  type="search"
                  className="sdrawer__input"
                  placeholder="Search products…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoComplete="off" autoCorrect="off" spellCheck="false"
                />
                <AnimatePresence>
                  {query && (
                    <motion.button type="button" className="sdrawer__clear"
                      onClick={() => setQuery('')} aria-label="Clear"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}>
                      <CloseIcon />
                    </motion.button>
                  )}
                </AnimatePresence>
              </form>
              <button className="sdrawer__close" onClick={onClose} aria-label="Close search">
                <CloseIcon />
              </button>
            </div>

            <div className="sdrawer__body">
              <div className="sdrawer__section">
                <h4 className="sdrawer__section-title">Popular search</h4>
                <div className="sdrawer__keywords">
                  {KEYWORDS.map((kw, i) => (
                    <motion.a
                      key={kw}
                      href={`/search?type=product&options%5Bprefix%5D=last&q=${kw}`}
                      onClick={stop}
                      className="sdrawer__keyword"
                      custom={i} variants={itemVariants} initial="hidden" animate="visible">
                      {kw}
                    </motion.a>
                  ))}
                </div>
              </div>

              <div className="sdrawer__section">
                <h4 className="sdrawer__section-title">Featured products</h4>
                <div className="sdrawer__products">
                  {FEATURED.map((p, i) => (
                    <motion.a key={p.name} href={p.href} onClick={stop} className="sdrawer__product"
                      custom={i + KEYWORDS.length} variants={itemVariants} initial="hidden" animate="visible">
                      <div className="sdrawer__product-img">
                        <img src={p.img} alt={p.name} loading="lazy" />
                      </div>
                      <div className="sdrawer__product-info">
                        <span className="sdrawer__product-type">{p.type}</span>
                        <span className="sdrawer__product-name">{p.name}</span>
                        <span className="sdrawer__product-price">{p.price}</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchDrawer;
