import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import ProductTryOnModal from './ProductTryOnModal';
import './ProductPage.css';

/* ── Icons ────────────────────────────────────────────────────── */
const ChevronDown = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" width="16" height="16" className={className}>
    <path d="M16.25 7.5L10 13.75L3.75 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="1.5">
    <path d="M16 16V3H1v13h15zm0 0h6v-5l-3-3h-3v8zM5.5 20a2 2 0 100-4 2 2 0 000 4zm13 0a2 2 0 100-4 2 2 0 000 4z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ReturnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9l1-4h16l1 4M3 9h18M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21V13h6v8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const stop = e => e.preventDefault();

/* ── Countdown Timer Hook ─────────────────────────────────────── */
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: true });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, expired: true });
        return;
      }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

/* ── Accordion Component ──────────────────────────────────────── */
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pdp__accordion">
      <button className="pdp__accordion-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="pdp__accordion-title">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="pdp__accordion-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Helper to get image URL from the new schema ──────────────── */
const getImgUrl = (images, index) => {
  if (!images || !images[index]) return '';
  return images[index]?.url || images[index] || '';
};

/* ── ProductPage Component ────────────────────────────────────── */
const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [showSticky, setShowSticky] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const addCartRef = useRef(null);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
    if (sizes.length > 0 && !selectedSize) {
      alert("Please select a size first.");
      return;
    }
    addToCart(product, qty, selectedSize, product.fashion?.color ? { name: product.fashion.color } : null);
  };

  // Fetch product by slug
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/slug/${slug}`);
        const data = await res.json();
        if (res.ok && data.data) {
          setProduct(data.data);
          // Fetch couple recommendations
          try {
            const recRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${data.data._id}/recommend?limit=10`);
            const recData = await recRes.json();
            if (recRes.ok && recData.recommendations) {
              // API returns { sourceProduct, recommendations: [{ product, score, reasons }] }
              setRecommendations(recData.recommendations);
            }
          } catch (err) {
            console.error('Failed to fetch recommendations:', err);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // Countdown
  const countdown = useCountdown(product?.saleEndsAt);

  // Defaults when product changes
  useEffect(() => {
    if (product) {
      setSelectedImg(0);
      const sizes = product.business?.sizes || [];
      const defaultSize = sizes.includes('M') ? 'M' : sizes[0] || null;
      setSelectedSize(defaultSize);
      setQty(1);
      window.scrollTo(0, 0);
    }
  }, [product]);

  // Sticky bar on scroll
  useEffect(() => {
    const onScroll = () => {
      if (addCartRef.current) {
        const rect = addCartRef.current.getBoundingClientRect();
        setShowSticky(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <div className="pdp">
        <div className="pdp__not-found">
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp">
        <div className="pdp__not-found">
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/">← Back to Store</Link>
        </div>
      </div>
    );
  }

  const finalPrice = product.price?.finalPrice ?? product.price?.amount ?? 0;
  const originalPrice = product.price?.discountPercentage > 0 ? product.price?.amount : null;
  const savePercent = originalPrice ? Math.round(product.price.discountPercentage) : 0;
  const stock = product.business?.stock ?? 0;
  const sizes = product.business?.sizes || [];

  const genderLabel = product.gender === 'male' ? 'His' : product.gender === 'female' ? 'Hers' : 'Unisex';
  const partnerLabel = product.gender === 'male' ? 'Shop for Her' : 'Shop for Him';
  const pad = n => String(n).padStart(2, '0');

  // Partner products = scored recommendations (already sorted high→low by backend)
  const partnerProducts = recommendations.slice(0, 10);
  // Complete the look = not used in current layout
  const completeLook = [];

  return (
    <div className="pdp">
      <div className="pdp__main">
        {/* ══════════ LEFT PANEL ══════════ */}
        <div className="pdp__left">
          {/* Image Gallery */}
          <div className="pdp__gallery">
            <div className="pdp__gallery-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`pdp__thumb${selectedImg === i ? ' pdp__thumb--active' : ''}`}
                  onClick={() => setSelectedImg(i)}
                >
                  <img src={getImgUrl(product.images, i)} alt={`${product.title} view ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>

            <div className="pdp__split-container">
              <div className="pdp__split-header">
                <div className="pdp__split-header-left">You</div>
                <div className="pdp__split-header-right">{partnerLabel}</div>
              </div>

              <div className="pdp__split">
                {/* LEFT: Main */}
                <div className="pdp__split-side pdp__split-side--main">
                  <motion.div
                  className="pdp__split-img-wrap"
                  key={selectedImg}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={getImgUrl(product.images, selectedImg)} alt={product.title} />
                  {savePercent > 0 && (
                    <span className="pdp__badge pdp__badge--sale">Save {savePercent}%</span>
                  )}
                </motion.div>
              </div>

              {/* DIVIDER */}
              <div className="pdp__split-divider">
                <div className="pdp__split-line"></div>
                <div className="pdp__split-heart">
                  {/* Outline heart */}
                  <svg className="pdp__heart-outline" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {/* Fill wave heart */}
                  <svg className="pdp__heart-wave" viewBox="0 0 24 24" width="24" height="24" fill="#ef4444" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
              </div>

              {/* RIGHT: Partner */}
              <div className="pdp__split-side pdp__split-side--partner">
                {partnerProducts.length > 0 ? (
                  <div className="pdp__partner-swipe">
                    {partnerProducts.map(rec => {
                      const p = rec.product;
                      const scoreColor = rec.score >= 85 ? '#16a34a' : rec.score >= 70 ? '#ca8a04' : rec.score >= 50 ? '#ea580c' : '#94a3b8';
                      return (
                        <div key={p._id || p.slug} className="pdp__partner-swipe-item">
                          <Link to={`/products/${p.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                            <img src={getImgUrl(p.images, 0)} alt={p.title} loading="lazy" />
                          </Link>
                          
                          <span className="pdp__partner-score-badge" style={{ background: scoreColor }}>
                            {rec.score}%
                          </span>
                          <div className="pdp__partner-scroll-indicator">
                            <motion.span 
                              className="pdp__partner-scroll-text"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                              SCROLL
                            </motion.span>
                            <div className="pdp__partner-mouse">
                              <motion.div 
                                className="pdp__partner-wheel"
                                animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pdp__split-empty">No matches found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div className="pdp__info">
          {/* Breadcrumb */}
          <div className="pdp__breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span>{product.title}</span>
          </div>

          {/* Badge */}
          {savePercent > 0 && (
            <span className="pdp__sale-badge">Save {savePercent}%</span>
          )}

          {/* Title */}
          <h1 className="pdp__name">{product.title}</h1>

          {/* Price */}
          <div className="pdp__price-row">
            <span className={`pdp__price${originalPrice ? ' pdp__price--sale' : ''}`}>
              ₹{finalPrice.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="pdp__price pdp__price--compare">₹{originalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Countdown */}
          {product.saleEndsAt && !countdown.expired && (
            <div className="pdp__countdown">
              <span className="pdp__countdown-label">⏱ Hurry Up ! Sale end in</span>
              <div className="pdp__countdown-timer">
                <span className="pdp__countdown-digit">{pad(countdown.h)}</span>
                <span className="pdp__countdown-sep">:</span>
                <span className="pdp__countdown-digit">{pad(countdown.m)}</span>
                <span className="pdp__countdown-sep">:</span>
                <span className="pdp__countdown-digit">{pad(countdown.s)}</span>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="pdp__description">{product.description}</p>

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="pdp__option-group">
              <p className="pdp__option-label">Size: <strong>{selectedSize}</strong></p>
              <div className="pdp__sizes">
                {sizes.map(s => (
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
          )}

          {/* Fashion info */}
          {product.fashion?.color && (
            <div className="pdp__option-group">
              <p className="pdp__option-label">Color: <strong>{product.fashion.color}</strong></p>
            </div>
          )}

          {/* Stock Warning */}
          {stock > 0 && stock <= 5 && (
            <p className="pdp__stock-warn">
              ⚠ Only {stock} items in stock!
            </p>
          )}

          {/* Quantity + Add to Cart */}
          <div className="pdp__action-row" ref={addCartRef}>
            <div className="pdp__qty">
              <button className="pdp__qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="pdp__qty-value">{qty}</span>
              <button className="pdp__qty-btn" onClick={() => setQty(q => Math.min(stock || 99, q + 1))}>+</button>
            </div>
            <button className="pdp__add-cart" onClick={handleAddToCart}>Add To Cart</button>
          </div>

          {/* Buy Now */}
          <button className="pdp__buy-now">Buy It Now</button>

          {/* Virtual Try-On */}
          <button className="pdp__tryon-btn" onClick={() => setTryOnOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            ✨ Virtual Try-On — See It On You
          </button>

          {/* Trust Badges */}
          <div className="pdp__trust">
            <div className="pdp__trust-item">
              <div className="pdp__trust-icon"><TruckIcon /></div>
              <span>Free shipping</span>
            </div>
            <div className="pdp__trust-item">
              <div className="pdp__trust-icon"><ReturnIcon /></div>
              <span>Easy return</span>
            </div>
            <div className="pdp__trust-item">
              <div className="pdp__trust-icon"><ShieldIcon /></div>
              <span>Safe checkout</span>
            </div>
          </div>

          {/* Pickup */}
          <div className="pdp__pickup">
            <StoreIcon />
            <div>
              <p className="pdp__pickup-title">Pickup available at <strong>LA Store</strong></p>
              <p className="pdp__pickup-sub">Usually ready in 24 hours</p>
            </div>
            <ChevronDown className="pdp__pickup-chevron" />
          </div>

          {/* Accordions */}
          {product.description && (
            <Accordion title="Product Details" defaultOpen={true}>
              <p className="pdp__care-text">{product.description}</p>
              {product.fashion?.fabric && <p className="pdp__care-text">Fabric: {product.fashion.fabric}</p>}
              {product.fashion?.fit && <p className="pdp__care-text">Fit: {product.fashion.fit}</p>}
              {product.fashion?.style && <p className="pdp__care-text">Style: {product.fashion.style}</p>}
            </Accordion>
          )}

          <Accordion title="Shipping & Returns">
            <p className="pdp__care-text">Free standard shipping on all orders. Easy returns within 30 days of purchase.</p>
          </Accordion>

          {/* Share + Help */}
          <div className="pdp__share-row">
            <div className="pdp__share">
              <span>Share:</span>
              <a href="#" onClick={stop} aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"/></svg>
              </a>
              <a href="#" onClick={stop} aria-label="Pinterest">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12c0 4.1 2.5 7.6 6 9.2-.1-.7-.2-1.9 0-2.7.2-.7 1.2-5 1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .8-.5 2.1-.8 3.2-.2 1 .5 1.7 1.4 1.7 1.7 0 3-1.8 3-4.4 0-2.3-1.7-3.9-4-3.9-2.7 0-4.3 2-4.3 4.1 0 .8.3 1.7.7 2.1.1.1.1.2.1.3l-.3 1c0 .2-.1.2-.3.1-1.2-.5-1.9-2.2-1.9-3.5 0-2.9 2.1-5.5 6-5.5 3.1 0 5.6 2.2 5.6 5.2 0 3.1-2 5.6-4.7 5.6-1 0-1.9-.5-2.2-1.1l-.6 2.3c-.2.8-.8 1.8-1.2 2.4.9.3 1.8.4 2.8.4 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
              </a>
              <a href="#" onClick={stop} aria-label="X">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4.04 4.33L10.31 12.72 4 19.54h1.42l5.53-5.97 4.46 5.97h4.83L13.62 10.68l5.87-6.35h-1.42L12.99 9.83 8.87 4.33H4.04z"/></svg>
              </a>
            </div>
            <a href="#" onClick={stop} className="pdp__help-btn">Need Help ?</a>
          </div>

          {/* Complete The Look */}
          {completeLook.length > 0 && (
            <div className="pdp__complete">
              <h3 className="pdp__complete-title">Complete The Look</h3>
              {completeLook.map(p => (
                <Link to={`/products/${p.slug}`} key={p._id || p.slug} className="pdp__complete-card">
                  <img src={getImgUrl(p.images, 0)} alt={p.title} className="pdp__complete-img" loading="lazy" />
                  <div className="pdp__complete-info">
                    <span className="pdp__complete-name">{p.title}</span>
                    <span className="pdp__complete-price">₹{(p.price?.finalPrice ?? p.price?.amount ?? 0).toFixed(2)}</span>
                  </div>
                  <button className="pdp__complete-cart" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                    <CartIcon />
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* ══════════ STICKY BAR ══════════ */}
      <div className={`pdp__sticky-bar${showSticky ? ' pdp__sticky-bar--visible' : ''}`}>
        <div className="pdp__sticky-inner">
          <img src={getImgUrl(product.images, 0)} alt={product.title} className="pdp__sticky-img" />
          <div className="pdp__sticky-info">
            <span className="pdp__sticky-name">{product.title}</span>
            <span className="pdp__sticky-price">
              ₹{finalPrice.toFixed(2)}
              {originalPrice && <s>₹{originalPrice.toFixed(2)}</s>}
            </span>
            {selectedSize && <span className="pdp__sticky-size">{selectedSize}</span>}
          </div>
          <button className="pdp__sticky-add" onClick={handleAddToCart}>Add</button>
        </div>
      </div>

      {/* Virtual Try-On Modal */}
      <ProductTryOnModal
        open={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
        product={product}
      />
    </div>
  );
};

export default ProductPage;
