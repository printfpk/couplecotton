import React from 'react';
import { Link } from 'react-router-dom';
import '../components/ProductTabs.css';
import './CollectionsAll.css';

const CDN = '/assets';

const PRODUCTS = [
  {
    name: 'Skin Synbiotic',
    type: 'Vitamin',
    badge: 'Sale',
    href: '/products/skin-synbiotic',
    img1: `${CDN}/DailySkinSynbiotic1.webp`,
    img2: `${CDN}/DailySkinSynbiotic2.webp`,
    price: '$50.00',
    compareAt: '$110.00',
  },
  {
    name: 'Enduro Fuel',
    type: 'Vitamin',
    badge: null,
    href: '/products/enduro-fuel',
    img1: `${CDN}/WellinaEnduroFuel1597881502.webp`,
    img2: `${CDN}/WellinaEnduroFuel1597881503.webp`,
    price: '$54.00',
    compareAt: null,
  },
  {
    name: 'Pure Balance',
    type: 'Vitamin',
    badge: 'Best Sellers',
    href: '/products/pure-balance',
    img1: `${CDN}/WellinaPureBalance1597881490.webp`,
    img2: `${CDN}/WellinaPureBalance1597881491.webp`,
    price: '$48.00',
    compareAt: null,
  },
  {
    name: 'Omega Complex',
    type: 'Vitamin',
    badge: null,
    href: '/products/omega-complex',
    img1: `${CDN}/DailyOmegaComplex1597881476.webp`,
    img2: `${CDN}/DailyOmegaComplex1597881477.webp`,
    price: '$49.00',
    compareAt: null,
  },
  {
    name: 'Detox Support',
    type: 'Vitamin',
    badge: 'New',
    href: '/products/detox-support',
    img1: `${CDN}/DailyDetoxSupport1597881463.webp`,
    img2: `${CDN}/DailyDetoxSupport1597881464.webp`,
    price: '$52.00',
    compareAt: null,
  },
  {
    name: 'Metabolism Boost',
    type: 'Vitamin',
    badge: 'New',
    href: '/products/metabolism-boost',
    img1: `${CDN}/DailyMetabolismBoost1597881470.webp`,
    img2: `${CDN}/DailyMetabolismBoost1597881471.webp`,
    price: '$56.00',
    compareAt: null,
  },
  {
    name: 'Vitality Softgels',
    type: 'Vitamin',
    badge: null,
    href: '/products/vitality-softgels',
    img1: `${CDN}/DailyVitalitySoftgels1597881482.webp`,
    img2: `${CDN}/DailyVitalitySoftgels1597881482.webp`,
    price: '$47.00',
    compareAt: null,
  },
  {
    name: 'Plant Protein',
    type: 'Vitamin',
    badge: 'New',
    href: '/products/plant-protein',
    img1: `${CDN}/WellinaPlantProtein1597881526.webp`,
    img2: `${CDN}/WellinaPlantProtein1597881527.webp`,
    price: '$58.00',
    compareAt: null,
  },
];

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const CollectionsAll = () => {
  return (
    <section className="collection-page">
      <div className="ptabs__container collection-page__container">
        <div className="collection-page__header">
          <div>
            <p className="collection-page__eyebrow">Collections</p>
            <h1 className="collection-page__heading">All products</h1>
          </div>
          <Link to="/" className="collection-page__back">
            Back to store
          </Link>
        </div>

        <div className="ptabs__grid" role="list">
          {PRODUCTS.map((product) => (
            <div className="ptabs__card" key={product.name} role="listitem">
              {product.badge && (
                <span
                  className={`ptabs__badge ptabs__badge--${product.badge.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {product.badge}
                </span>
              )}

              <Link to={product.href} className="ptabs__card-img-link" tabIndex="-1" aria-hidden="true">
                <div className="ptabs__card-media">
                  <img
                    src={product.img1}
                    alt={product.name}
                    className="ptabs__card-img"
                    loading="lazy"
                  />
                </div>
              </Link>

              <div className="ptabs__card-info">
                <span className="ptabs__card-type">{product.type}</span>
                <Link to={product.href} className="ptabs__card-name">
                  {product.name}
                </Link>
                <div className="ptabs__card-price">
                  <span className={`ptabs__price${product.compareAt ? ' ptabs__price--sale' : ''}`}>
                    {product.price}
                  </span>
                  {product.compareAt && (
                    <span className="ptabs__price ptabs__price--compare">{product.compareAt}</span>
                  )}
                </div>
              </div>

              <Link to={product.href} className="ptabs__quick-add" aria-label={`Add ${product.name} to cart`}>
                <CartIcon />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsAll;
