import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../components/ProductTabs.css';
import './CollectionsAll.css';

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const CollectionsAll = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const aiProducts = location.state?.aiProducts;
  const aiQuery = location.state?.query;

  useEffect(() => {
    if (aiProducts) {
      // Normalize AI product shape to match full API product shape
      const normalized = aiProducts.map(p => ({
        _id: p.id || p._id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        gender: p.gender,
        images: p.images || [{ url: p.image }],
        price: p.price && typeof p.price === 'object'
          ? p.price
          : { finalPrice: p.price, amount: p.price },
        business: p.business || {},
        fashion: p.fashion || {}
      }));
      setProducts(normalized);
      setLoading(false);
      // Scroll to top when AI results arrive
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        if (res.ok) {
          let items = data.data || [];
          
          if (categoryId && categoryId !== 'all') {
            if (categoryId === 'shop-for-him') {
              items = items.filter(p => p.gender === 'male');
            } else if (categoryId === 'shop-for-her' || categoryId === 'all-her') {
              items = items.filter(p => p.gender === 'female');
            } else if (categoryId === 'shop-bestsellers') {
              items = items.filter(p => p.business?.isTrending || p.business?.isFeatured);
            } else {
              // Custom string matching for categories (e.g. tshirts, hoodies, couple-tees)
              const searchStr = categoryId.toLowerCase().replace(/-/g, ' ');
              // e.g. "tshirts" -> "tshirts", "couple hoodies" -> "couple hoodies"
              items = items.filter(p => 
                (p.category && p.category.toLowerCase().includes(searchStr)) || 
                (p.title && p.title.toLowerCase().includes(searchStr)) ||
                (p.tags && p.tags.some(t => t.toLowerCase().includes(searchStr)))
              );
            }
          }
          
          setProducts(items);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [aiProducts, categoryId]);

  if (loading) {
    return (
      <section className="collection-page">
        <div className="ptabs__container collection-page__container">
          <p style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>Loading products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="collection-page">
      <div className="ptabs__container collection-page__container">
        {aiProducts && (
          <div style={{ background: '#eef8eb', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '18px', marginRight: '10px' }}>✨</span>
              <strong>AI Search Results for:</strong> "{aiQuery}"
            </div>
            <button
              onClick={() => navigate('/collections/all', { replace: true })}
              style={{ background: 'white', border: '1px solid #ddd', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Clear Search
            </button>
          </div>
        )}

        <div className="collection-page__header">
          <div>
            <p className="collection-page__eyebrow">Collections</p>
            <h1 className="collection-page__heading">{aiProducts ? 'AI Recommendations' : 'All products'}</h1>
          </div>
          <Link to="/" className="collection-page__back">
            Back to store
          </Link>
        </div>

        <div className="ptabs__grid" role="list">
          {products.map((product) => {
            const imgUrl = product.images?.[0]?.url || product.images?.[0] || '';
            const badge = product.business?.isTrending ? 'Trending' : product.business?.isFeatured ? 'Featured' : null;
            const finalPrice = product.price?.finalPrice ?? product.price?.amount ?? 0;
            const originalPrice = product.price?.discountPercentage > 0 ? product.price?.amount : null;

            return (
              <div className="ptabs__card" key={product._id || product.slug} role="listitem">
                {badge && (
                  <span className={`ptabs__badge ptabs__badge--${badge.toLowerCase()}`}>
                    {badge}
                  </span>
                )}

                <Link to={`/products/${product.slug}`} className="ptabs__card-img-link" tabIndex="-1" aria-hidden="true">
                  <div className="ptabs__card-media">
                    <img
                      src={imgUrl}
                      alt={product.title}
                      className="ptabs__card-img"
                      loading="lazy"
                    />
                  </div>
                </Link>

                <div className="ptabs__card-info">
                  <span className="ptabs__card-type">{product.category}</span>
                  <Link to={`/products/${product.slug}`} className="ptabs__card-name">
                    {product.title}
                  </Link>
                  <div className="ptabs__card-price">
                    <span className={`ptabs__price${originalPrice ? ' ptabs__price--sale' : ''}`}>
                      ₹{finalPrice.toFixed(2)}
                    </span>
                    {originalPrice && (
                      <span className="ptabs__price ptabs__price--compare">₹{originalPrice.toFixed(2)}</span>
                    )}
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
              </div>
            );
          })}
          {products.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px 0', color: '#888', gridColumn: '1 / -1' }}>No products found. Add some from the Admin Panel!</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CollectionsAll;
