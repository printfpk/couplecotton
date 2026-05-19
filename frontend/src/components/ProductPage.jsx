import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductPage.css';

// Lazy-load heavy 3D/AR components
const CameraView = lazy(() => import('./tryon/CameraView'));
const ARViewer = lazy(() => import('./tryon/ARViewer'));

/* ── All products catalog ────────────────────────────────────── */
const ALL_PRODUCTS = [
  {
    slug: 'cc-classic-duo-tee', name: 'Classic Duo Tee', type: 'Couple Set',
    price: 50, compareAt: 110,
    description: 'Our signature couple tee in butter-soft ring-spun cotton. Matching designs that complement each other perfectly.',
    images: ['https://loremflickr.com/600/800/clothing?lock=11', 'https://loremflickr.com/600/800/clothing?lock=12'],
    sizes: ['XS','S','M','L','XL','2XL'],
    colors: [{ name:'Navy', hex:'#1B2A4A' }, { name:'White', hex:'#F5F5F0' }, { name:'Sage', hex:'#87A878' }],
    garmentMeta: { category: 'top' },
  },
  {
    slug: 'cc-weekend-hoodie-set', name: 'Weekend Hoodie Set', type: 'Couple Set',
    price: 54, compareAt: null,
    description: 'Cozy oversized hoodies for two. Premium fleece interior, matching embroidered logo on chest.',
    images: ['https://loremflickr.com/600/800/clothing?lock=13', 'https://loremflickr.com/600/800/clothing?lock=14'],
    sizes: ['S','M','L','XL','2XL'],
    colors: [{ name:'Charcoal', hex:'#36454F' }, { name:'Blush', hex:'#DE6FA1' }],
    garmentMeta: { category: 'top' },
  },
  {
    slug: 'cc-linen-couple-shirt', name: 'Linen Couple Shirt', type: 'Matching Set',
    price: 48, compareAt: null,
    description: 'Lightweight linen shirts designed for couples. Relaxed fit with matching embroidered details.',
    images: ['https://loremflickr.com/600/800/clothing?lock=15', 'https://loremflickr.com/600/800/clothing?lock=16'],
    sizes: ['S','M','L','XL'],
    colors: [{ name:'Sky Blue', hex:'#87CEEB' }, { name:'Beige', hex:'#D4C5A0' }],
    garmentMeta: { category: 'top' },
  },
  {
    slug: 'cc-matching-jogger-set', name: 'Matching Jogger Set', type: 'Duo Pack',
    price: 46, compareAt: 92,
    description: 'Soft-touch joggers with tapered fit. Matching drawstring details and embroidered ankle logos.',
    images: ['https://loremflickr.com/600/800/clothing?lock=17', 'https://loremflickr.com/600/800/clothing?lock=18'],
    sizes: ['S','M','L','XL','2XL'],
    colors: [{ name:'Black', hex:'#1A1A1A' }, { name:'Olive', hex:'#556B2F' }],
    garmentMeta: { category: 'bottom' },
  },
  {
    slug: 'cc-cotton-polo-pair', name: 'Cotton Polo Pair', type: 'Couple Set',
    price: 52, compareAt: null,
    description: 'Classic cotton polo in matching his & hers cuts. Breathable, timeless, and perfect for casual outings.',
    images: ['https://loremflickr.com/600/800/clothing?lock=19', 'https://loremflickr.com/600/800/clothing?lock=20'],
    sizes: ['XS','S','M','L','XL','2XL'],
    colors: [{ name:'Navy', hex:'#1B2A4A' }, { name:'White', hex:'#F5F5F0' }, { name:'Olive', hex:'#556B2F' }],
    garmentMeta: { category: 'top' },
  },
  {
    slug: 'cc-date-night-dress-set', name: 'Date Night Dress Set', type: 'Matching Set',
    price: 49, compareAt: null,
    description: 'Elegant matching set for special evenings. Flowing silhouette meets structured tailoring.',
    images: ['https://loremflickr.com/600/800/clothing?lock=21', 'https://loremflickr.com/600/800/clothing?lock=22'],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name:'Burgundy', hex:'#722F37' }, { name:'Midnight', hex:'#191970' }],
    garmentMeta: { category: 'full-body' },
  },
  {
    slug: 'cc-summer-short-set', name: 'Summer Short Set', type: 'Matching Set',
    price: 45, compareAt: 90,
    description: 'Matching couple shorts set with breathable cotton blend. Perfect for beach days and summer vibes.',
    images: ['https://loremflickr.com/600/800/clothing?lock=25', 'https://loremflickr.com/600/800/clothing?lock=26'],
    sizes: ['S','M','L','XL','2XL'],
    colors: [{ name:'Black', hex:'#1A1A1A' }, { name:'Terracotta', hex:'#CC6B49' }],
    garmentMeta: { category: 'full-body' },
  },
  {
    slug: 'cc-cozy-lounge-set', name: 'Cozy Lounge Set', type: 'Matching Set',
    price: 51, compareAt: null,
    description: 'Ultra-soft lounge set for lazy weekends together. Matching top and bottom in plush fabric.',
    images: ['https://loremflickr.com/600/800/clothing?lock=23', 'https://loremflickr.com/600/800/clothing?lock=24'],
    sizes: ['S','M','L','XL'],
    colors: [{ name:'Cream', hex:'#F5F0E1' }, { name:'Dusty Rose', hex:'#C9A9A6' }],
    garmentMeta: { category: 'full-body' },
  },
  {
    slug: 'cc-matching-hoodie-duo', name: 'Matching Hoodie Duo', type: 'Couple Set',
    price: 68, compareAt: 85,
    description: 'Cozy couple hoodies with matching embroidery. Oversized fit for ultimate comfort.',
    images: ['https://loremflickr.com/600/800/hoodie?lock=1', 'https://loremflickr.com/600/800/hoodie?lock=2'],
    sizes: ['S','M','L','XL','2XL'],
    colors: [{ name:'Charcoal', hex:'#36454F' }, { name:'Blush Pink', hex:'#DE6FA1' }, { name:'Forest', hex:'#228B22' }],
    garmentMeta: { category: 'top' },
  },
  {
    slug: 'cc-couple-graphic-tee', name: 'Couple Graphic Tee', type: 'Couple Set',
    price: 35, compareAt: null,
    description: 'Fun couple graphic tees with complementary designs. Soft ring-spun cotton.',
    images: ['https://loremflickr.com/600/800/tshirt?lock=5', 'https://loremflickr.com/600/800/tshirt?lock=6'],
    sizes: ['XS','S','M','L','XL'],
    colors: [{ name:'White', hex:'#F5F5F0' }, { name:'Black', hex:'#1A1A1A' }],
    garmentMeta: { category: 'top' },
  },
];

/* ── ProductPage Component ───────────────────────────────────── */
const ProductPage = () => {
  const { slug } = useParams();
  const product = ALL_PRODUCTS.find(p => p.slug === slug);

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [tryOnMode, setTryOnMode] = useState(null); // null | 'camera' | 'ar'

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes.includes('M') ? 'M' : product.sizes[0]);
      setTryOnMode(null);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="pdp">
        <div style={{ padding: 60, textAlign: 'center' }}>
          <h2>Product not found</h2>
          <p style={{ color: '#8a9a8a', marginTop: 8 }}>The product you're looking for doesn't exist.</p>
          <Link to="/" style={{ color: '#1e3b2a', fontWeight: 600, marginTop: 16, display: 'inline-block' }}>
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pdp">
      <div className="pdp__main">
        {/* ── Left: Image Gallery ──────────────────────────── */}
        <div className="pdp__gallery">
          <motion.div
            className="pdp__gallery-main"
            key={selectedImg}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img src={product.images[selectedImg]} alt={product.name} />
          </motion.div>
          <div className="pdp__gallery-thumbs">
            {product.images.map((img, i) => (
              <button
                key={i}
                className={`pdp__thumb${selectedImg === i ? ' pdp__thumb--active' : ''}`}
                onClick={() => setSelectedImg(i)}
              >
                <img src={img} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Product Info ──────────────────────────── */}
        <div className="pdp__info">
          <div className="pdp__breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <span>{product.type}</span>
            <span>›</span>
            <span>{product.name}</span>
          </div>

          <span className="pdp__type">{product.type}</span>
          <h1 className="pdp__name">{product.name}</h1>

          <div className="pdp__price-row">
            <span className={`pdp__price${product.compareAt ? ' pdp__price--sale' : ''}`}>
              ${product.price.toFixed(2)}
            </span>
            {product.compareAt && (
              <span className="pdp__price pdp__price--compare">${product.compareAt.toFixed(2)}</span>
            )}
          </div>

          <p className="pdp__description">{product.description}</p>

          {/* Colors */}
          <div>
            <p className="pdp__option-label">Color — {selectedColor?.name}</p>
            <div className="pdp__colors">
              {product.colors.map(c => (
                <button
                  key={c.hex}
                  className={`pdp__color-swatch${selectedColor?.hex === c.hex ? ' pdp__color-swatch--active' : ''}`}
                  style={{ background: c.hex }}
                  title={c.name}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="pdp__option-label">Size — {selectedSize}</p>
            <div className="pdp__sizes">
              {product.sizes.map(s => (
                <button
                  key={s}
                  className={`pdp__size-btn${selectedSize === s ? ' pdp__size-btn--active' : ''}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ── TRY-ON SECTION ─────────────────────────────── */}
          <div className="pdp__tryon-section">
            {/* Header with two mode buttons */}
            <div className="pdp__tryon-header" style={{ flexWrap: 'wrap', gap: 8 }}>
              <div className="pdp__tryon-header-left">
                <span className="pdp__tryon-icon">👕</span>
                <div>
                  <div className="pdp__tryon-title">Virtual Try-On</div>
                  <div className="pdp__tryon-subtitle">
                    Live camera + 3D model overlay using AI body detection
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {/* Camera + Three.js + MediaPipe mode */}
                <button
                  className={`pdp__tryon-toggle${tryOnMode === 'camera' ? ' pdp__tryon-toggle--active' : ''}`}
                  onClick={() => setTryOnMode(tryOnMode === 'camera' ? null : 'camera')}
                >
                  📷 {tryOnMode === 'camera' ? 'Close' : 'Live Camera'}
                </button>
                {/* A-Frame + WebXR AR mode */}
                <button
                  className={`pdp__tryon-toggle${tryOnMode === 'ar' ? ' pdp__tryon-toggle--active' : ''}`}
                  onClick={() => setTryOnMode(tryOnMode === 'ar' ? null : 'ar')}
                >
                  🥽 {tryOnMode === 'ar' ? 'Close' : '3D / AR View'}
                </button>
              </div>
            </div>

            {/* Try-on content area */}
            <AnimatePresence>
              {tryOnMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <Suspense fallback={
                    <div style={{
                      height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#111', flexDirection: 'column', gap: 12,
                    }}>
                      <div style={{
                        width: 40, height: 40, border: '3px solid rgba(201,232,107,0.2)',
                        borderTopColor: '#c9e86b', borderRadius: '50%',
                        animation: 'pdp-spin 0.8s linear infinite',
                      }} />
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                        Loading {tryOnMode === 'ar' ? 'A-Frame 3D scene' : 'camera + AI'}…
                      </span>
                      <style>{`@keyframes pdp-spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                  }>
                    {/* Mode: Camera + MediaPipe + Three.js .glb overlay */}
                    {tryOnMode === 'camera' && (
                      <CameraView
                        product={product}
                        color={selectedColor}
                        showDebug={true}
                      />
                    )}

                    {/* Mode: A-Frame + WebXR AR */}
                    {tryOnMode === 'ar' && (
                      <ARViewer
                        product={product}
                        color={selectedColor}
                        onClose={() => setTryOnMode(null)}
                      />
                    )}
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="pdp__actions">
            <button className="pdp__add-cart">
              Add to Cart — ${product.price.toFixed(2)}
            </button>
            <button className="pdp__buy-now">
              Buy Now
            </button>
          </div>

          {/* Features */}
          <div className="pdp__features">
            <div className="pdp__feature">
              <span className="pdp__feature-icon">🚚</span>
              Free shipping on orders over $75
            </div>
            <div className="pdp__feature">
              <span className="pdp__feature-icon">↩️</span>
              30-day easy returns
            </div>
            <div className="pdp__feature">
              <span className="pdp__feature-icon">🌿</span>
              100% organic cotton
            </div>
            <div className="pdp__feature">
              <span className="pdp__feature-icon">💑</span>
              Matching couple design
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
