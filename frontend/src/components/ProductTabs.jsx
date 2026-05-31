import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductTabs.css';

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
  const { addToCart } = useCart();
  const imgUrl = (i) => product.images?.[i]?.url || product.images?.[i] || '';
  const finalPrice = product.price?.finalPrice ?? product.price?.amount ?? 0;
  const originalPrice = product.price?.discountPercentage > 0 ? product.price?.amount : null;
  const badge = product.business?.isTrending ? 'Trending' : product.business?.isFeatured ? 'Featured' : null;

  return (
    <motion.div
      className="ptabs__card"
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {badge && (
        <span className={`ptabs__badge ptabs__badge--${badge.toLowerCase()}`}>
          {badge}
        </span>
      )}

      <Link to={`/products/${product.slug}`} className="ptabs__card-img-link" tabIndex="-1" aria-hidden="true">
        <div className="ptabs__card-media">
          <img
            src={hovered && imgUrl(1) ? imgUrl(1) : imgUrl(0)}
            alt={product.title}
            className="ptabs__card-img"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="ptabs__card-info">
        <span className="ptabs__card-type">{product.category}</span>
        <Link to={`/products/${product.slug}`} className="ptabs__card-name">{product.title}</Link>
        <div className="ptabs__card-price">
          <span className={`ptabs__price${originalPrice ? ' ptabs__price--sale' : ''}`}>₹{finalPrice.toFixed(2)}</span>
          {originalPrice && <span className="ptabs__price ptabs__price--compare">₹{originalPrice.toFixed(2)}</span>}
        </div>
      </div>

      <button className="ptabs__quick-add" aria-label={`Add ${product.title} to cart`} onClick={(e) => {
        e.preventDefault();
        const sizes = product.business?.sizes || [];
        const defaultSize = sizes.includes('M') ? 'M' : sizes[0] || null;
        addToCart(product, 1, defaultSize, product.fashion?.color ? { name: product.fashion.color } : null);
      }}>
        <CartIcon />
      </button>
    </motion.div>
  );
};

/* ── Main ProductTabs component ──────────────────────────────── */
const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState('featured');
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products?limit=8`);
        const data = await res.json();
        const all = data.data || [];
        setFeatured(all.filter(p => p.business?.isFeatured).slice(0, 4));
        setTrending(all.filter(p => p.business?.isTrending).slice(0, 4));
        // If not enough featured/trending, fill with whatever we have
        if (featured.length === 0 && trending.length === 0) {
          setFeatured(all.slice(0, 4));
          setTrending(all.slice(4, 8));
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const TABS = [
    { key: 'featured', label: 'Featured', products: featured },
    { key: 'trending', label: 'Trending', products: trending },
  ];

  const tab = TABS.find(t => t.key === activeTab);

  if (loading) return null;

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
          <h2 className="ptabs__heading">Our Collection</h2>
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
              <ProductCard key={p._id || p.slug} product={p} />
            ))}
            {tab.products.length === 0 && (
              <p style={{ textAlign: 'center', padding: '40px 0', color: '#888', gridColumn: '1 / -1' }}>No products yet</p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* View all CTA */}
        <div className="ptabs__footer">
          <Link to="/collections/all" className="ptabs__view-all">
            View all products →
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default ProductTabs;
