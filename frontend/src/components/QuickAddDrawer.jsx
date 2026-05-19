import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './QuickAddDrawer.css';

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
    <path d="M15.625 4.375L4.375 15.625M15.625 15.625L4.375 4.375"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * QuickAddDrawer — slides in from the right with framer-motion spring.
 * Props:
 *   open     {boolean}
 *   onClose  {function}
 *   product  {object|null}  — { title, price, inStock, href }
 */
const QuickAddDrawer = ({ open = false, onClose, product = null }) => (
  <AnimatePresence>
    {open && (
      <>
        {/* Backdrop */}
        <motion.div
          className="qad__backdrop"
          onClick={onClose}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        />

        {/* Drawer panel */}
        <motion.aside
          className="qad"
          aria-label="Quick add"
          aria-modal="true"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        >
          <motion.button
            className="qad__close"
            onClick={onClose}
            aria-label="Close"
            whileHover={{ rotate: 90, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <CloseIcon />
          </motion.button>

          <motion.div
            className="qad__inner"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            {product ? (
              <>
                <h3 className="qad__title">{product.title}</h3>
                <p className="qad__price">{product.price}</p>
                {product.inStock && (
                  <p className="qad__stock">
                    <svg viewBox="0 0 256 256" fill="none" width="16" height="16">
                      <path d="m40 144 56 56L224 72" stroke="currentColor" strokeWidth="24"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    In stock and ready to ship
                  </p>
                )}
                <a href={product.href} className="qad__view-btn">View more details →</a>
              </>
            ) : (
              <p className="qad__empty">Select a product to quick add.</p>
            )}
          </motion.div>
        </motion.aside>
      </>
    )}
  </AnimatePresence>
);

export default QuickAddDrawer;
