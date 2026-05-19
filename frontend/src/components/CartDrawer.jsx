import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CartDrawer.css';

const CDN_COL = '/assets';

const SUGGESTIONS = [
  { img: `${CDN_COL}/cart-collection-1.webp?v=1773128830&width=300`, label: 'Daily Health',  href: '/collections/daily-health' },
  { img: `${CDN_COL}/cart-collection-2.webp?v=1773128817&width=300`, label: 'Pregnancy',     href: '/collections/pregnancy' },
  { img: `${CDN_COL}/cart-collection-3.webp?v=1773128797&width=300`, label: 'Best Sellers',  href: '/collections/best-sellers' },
];

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
    <path d="M15.625 4.375L4.375 15.625M15.625 15.625L4.375 4.375"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
    <path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const stop = (e) => e.preventDefault();

const drawerVariants = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 32 } },
  exit:    { x: '100%', opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } },
};

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.12 + i * 0.07, duration: 0.35 } }),
};

const CartDrawer = ({ open: openProp, onClose }) => {
  const [selfOpen, setSelfOpen] = useState(false);
  const isOpen     = openProp !== undefined ? openProp : selfOpen;
  const handleClose = onClose || (() => setSelfOpen(false));

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div className="cdrawer__backdrop" onClick={handleClose} aria-hidden="true"
            variants={backdropVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ duration: 0.2 }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="cdrawer cdrawer--open"
            aria-label="Shopping cart" aria-modal="true"
            variants={drawerVariants} initial="hidden" animate="visible" exit="exit">

            <div className="cdrawer__header">
              <h2 className="cdrawer__title">Your cart</h2>
              <button className="cdrawer__close" onClick={handleClose} aria-label="Close cart">
                <CloseIcon />
              </button>
            </div>

            <div className="cdrawer__body">
              <div className="cdrawer__empty">
                <motion.p className="cdrawer__empty-title"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.3 }}>
                  Your cart is empty
                </motion.p>
                <motion.p className="cdrawer__empty-sub"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.14, duration: 0.3 }}>
                  Not sure where to start? Try these collections:
                </motion.p>

                <div className="cdrawer__suggestions">
                  {SUGGESTIONS.map(({ img, label, href }, i) => (
                    <motion.a key={label} href={href} onClick={stop} className="cdrawer__suggestion"
                      custom={i} variants={itemVariants} initial="hidden" animate="visible">
                      <div className="cdrawer__suggestion-img">
                        <img src={img} alt={label} loading="lazy" />
                      </div>
                      <span className="cdrawer__suggestion-label">{label}</span>
                    </motion.a>
                  ))}
                </div>

                <motion.a href="/collections/all" onClick={stop} className="cdrawer__shop-btn"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}>
                  Continue shopping <ArrowRight />
                </motion.a>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartDrawer;
