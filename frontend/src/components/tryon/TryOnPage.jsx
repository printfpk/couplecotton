import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useCameraView from './CameraView';
import GarmentPicker from './GarmentPicker';
import './TryOnPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── Fallback product data (used when backend is unavailable) ── */
const FALLBACK_PRODUCTS = [
  {
    _id: '1', name: 'Cotton Polo Pair', slug: 'cc-cotton-polo-pair', type: 'Couple Set',
    price: 52, images: ['https://loremflickr.com/600/800/clothing?lock=19'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    colors: [{ name: 'Navy', hex: '#1B2A4A' }, { name: 'White', hex: '#F5F5F0' }, { name: 'Olive', hex: '#556B2F' }],
    garmentMeta: { category: 'top' },
  },
];

const TryOnPage = ({ onBack }) => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [cameraStarted, setCameraStarted] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | detecting | waiting | error

  /* Fetch real products from backend */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const res = await fetch(`${API_BASE}/api/products`);
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setProducts(json.data);
          setSelectedProduct(json.data[0]);
          setSelectedColor(json.data[0].colors?.[0] || null);
        } else {
          setProducts(FALLBACK_PRODUCTS);
          setSelectedProduct(FALLBACK_PRODUCTS[0]);
          setSelectedColor(FALLBACK_PRODUCTS[0].colors?.[0] || null);
        }
      } catch {
        setProducts(FALLBACK_PRODUCTS);
        setSelectedProduct(FALLBACK_PRODUCTS[0]);
        setSelectedColor(FALLBACK_PRODUCTS[0].colors?.[0] || null);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const {
    videoRef,
    canvasRef,
    cameraReady,
    poseReady,
    detecting,
    startCamera,
    takeScreenshot,
  } = useCameraView({
    product: selectedProduct,
    color: selectedColor,
    onStatusChange: setStatus,
  });

  const handleStartCamera = useCallback(async () => {
    setCameraStarted(true);
    await startCamera();
  }, [startCamera]);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors?.[0] || null);
    setSelectedSize(product.sizes?.includes('M') ? 'M' : product.sizes?.[0] || null);
  }, []);

  const statusText = {
    idle: 'Start camera to begin',
    loading: 'Loading body detection…',
    ready: 'Camera ready — stand in frame',
    detecting: 'Body detected — try on clothes!',
    waiting: 'Stand in front of camera',
    error: 'Camera or detection unavailable',
  };

  const statusDotClass = {
    detecting: 'tryon__status-dot--detecting',
    waiting: 'tryon__status-dot--waiting',
    error: 'tryon__status-dot--error',
    loading: 'tryon__status-dot--waiting',
    ready: 'tryon__status-dot--waiting',
    idle: 'tryon__status-dot--waiting',
  };

  return (
    <div className="tryon">
      {/* ── Sidebar ──────────────────────────────────────── */}
      <motion.aside
        className="tryon__sidebar"
        initial={{ x: -380, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        <div className="tryon__sidebar-header">
          <button className="tryon__back-btn" onClick={onBack}>
            ← Back to Store
          </button>
          <h1 className="tryon__title">Live Try-On</h1>
          <p className="tryon__subtitle">Try clothes on your body using your camera</p>
        </div>

        {/* Garment Picker */}
        <GarmentPicker
          products={products}
          selected={selectedProduct}
          onSelect={handleProductSelect}
          loading={productsLoading}
        />

        {/* Color & Size */}
        {selectedProduct && (
          <div className="tryon__section">
            <h4 className="tryon__section-title">Color & Size</h4>

            {selectedProduct.colors?.length > 0 && (
              <div className="tryon__colors">
                {selectedProduct.colors.map((c) => (
                  <button
                    key={c.hex}
                    className={`tryon__color-chip${selectedColor?.hex === c.hex ? ' tryon__color-chip--active' : ''}`}
                    style={{ background: c.hex }}
                    title={c.name}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            )}

            {selectedProduct.sizes?.length > 0 && (
              <div className="tryon__sizes">
                {selectedProduct.sizes.map((s) => (
                  <button
                    key={s}
                    className={`tryon__size-btn${selectedSize === s ? ' tryon__size-btn--active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add to Cart */}
        <div className="tryon__cart-bar">
          <button className="tryon__add-cart-btn" onClick={onBack}>
            Add to Cart — ${selectedProduct?.price?.toFixed(2)}
          </button>
        </div>
      </motion.aside>

      {/* ── Camera Area ──────────────────────────────────── */}
      <div className="tryon__camera-area">
        {/* Camera prompt (before camera starts) */}
        <AnimatePresence>
          {!cameraStarted && (
            <motion.div
              className="tryon__camera-prompt"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="tryon__camera-icon">📸</div>
              <h2>Virtual Try-On</h2>
              <p>
                Stand in front of your camera and see how {selectedProduct?.name || 'our clothes'} look
                on you in real-time. We'll detect your body and overlay the clothing.
              </p>
              <button className="tryon__camera-start-btn" onClick={handleStartCamera}>
                Start Camera
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay */}
        <AnimatePresence>
          {cameraStarted && (!cameraReady || !poseReady) && (
            <motion.div
              className="tryon__loading"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tryon__spinner" />
              <p className="tryon__loading-text">
                {!cameraReady ? 'Accessing camera…' : 'Loading body detection AI…'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status bar */}
        {cameraStarted && cameraReady && (
          <div className="tryon__status-bar">
            <span className={`tryon__status-dot ${statusDotClass[status] || ''}`} />
            <span className="tryon__status-text">{statusText[status]}</span>
          </div>
        )}

        {/* Video + Canvas */}
        <div className="tryon__camera-container">
          <video
            ref={videoRef}
            className="tryon__video"
            playsInline
            muted
            style={{ display: cameraReady ? 'block' : 'none' }}
          />
          <canvas
            ref={canvasRef}
            className="tryon__canvas-overlay"
            style={{ display: cameraReady ? 'block' : 'none' }}
          />
        </div>

        {/* Floating controls */}
        {cameraReady && (
          <motion.div
            className="tryon__floating-controls"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <button className="tryon__float-btn" onClick={takeScreenshot}>
              📷 Capture Look
            </button>
            <button className="tryon__float-btn tryon__float-btn--primary" onClick={onBack}>
              🛒 Add to Cart
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TryOnPage;
