import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './RecommendationSlider.css';

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const getImgUrl = (images) => {
  if (!images || !images[0]) return '';
  return images[0]?.url || images[0] || '';
};

const getScoreColor = (score) => {
  if (score >= 85) return '#16a34a'; // green
  if (score >= 70) return '#ca8a04'; // amber
  if (score >= 50) return '#ea580c'; // orange
  return '#94a3b8'; // grey
};

const RecommendationSlider = ({ productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!productId) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/products/${productId}/recommend?limit=8`);
        const data = await res.json();
        if (res.ok && data.recommendations) {
          setRecommendations(data.recommendations);
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError('Could not load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  if (loading) {
    return (
      <section className="rec-slider">
        <div className="rec-slider__header">
          <span className="rec-slider__icon"><HeartIcon /></span>
          <h2 className="rec-slider__title">Perfect Match For Your Partner ❤️</h2>
        </div>
        <div className="rec-slider__loading">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rec-slider__skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Don't render section if no recommendations
  }

  return (
    <section className="rec-slider">
      <div className="rec-slider__header">
        <span className="rec-slider__icon"><HeartIcon /></span>
        <h2 className="rec-slider__title">Perfect Match For Your Partner ❤️</h2>
        <p className="rec-slider__subtitle">Curated couple outfits ranked by compatibility</p>
      </div>

      <div className="rec-slider__track">
        {recommendations.map((rec) => {
          const product = rec.product;
          const price = product.price?.finalPrice ?? product.price?.amount ?? 0;
          const originalPrice = product.price?.discountPercentage > 0 ? product.price?.amount : null;
          const imgUrl = getImgUrl(product.images);
          const scoreColor = getScoreColor(rec.score);

          return (
            <div className="rec-card" key={product._id}>
              {/* Score Badge */}
              <div className="rec-card__score" style={{ '--score-color': scoreColor }}>
                <span className="rec-card__score-value">{rec.score}%</span>
                <span className="rec-card__score-label">match</span>
              </div>

              {/* Image */}
              <Link to={`/products/${product.slug}`} className="rec-card__img-link">
                <div className="rec-card__img-wrap">
                  {imgUrl ? (
                    <img src={imgUrl} alt={product.title} loading="lazy" />
                  ) : (
                    <div className="rec-card__img-placeholder">No Image</div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="rec-card__info">
                <span className="rec-card__category">{product.category}</span>
                <Link to={`/products/${product.slug}`} className="rec-card__name">
                  {product.title}
                </Link>

                <div className="rec-card__price-row">
                  <span className={`rec-card__price${originalPrice ? ' rec-card__price--sale' : ''}`}>
                    ₹{price.toFixed(2)}
                  </span>
                  {originalPrice && (
                    <span className="rec-card__price rec-card__price--compare">
                      ₹{originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Reasons */}
                {rec.reasons && rec.reasons.length > 0 && (
                  <div className="rec-card__reasons">
                    {rec.reasons.slice(0, 2).map((reason, i) => (
                      <span key={i} className="rec-card__reason">{reason}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Add */}
              <button
                className="rec-card__add"
                aria-label={`Add ${product.title} to cart`}
                onClick={(e) => {
                  e.preventDefault();
                  const sizes = product.business?.sizes || [];
                  const defaultSize = sizes.includes('M') ? 'M' : sizes[0] || null;
                  addToCart(product, 1, defaultSize, product.fashion?.color ? { name: product.fashion.color } : null);
                }}
              >
                <CartIcon />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecommendationSlider;
