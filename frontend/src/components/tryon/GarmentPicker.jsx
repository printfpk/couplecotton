import React from 'react';
import { motion } from 'framer-motion';

const GarmentPicker = ({ products = [], selected, onSelect, loading }) => {
  return (
    <div className="tryon__section">
      <h4 className="tryon__section-title">Select Garment</h4>
      <div className="tryon__garments">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="tryon__garment-card" style={{ opacity: 0.3, pointerEvents: 'none' }}>
                <div className="tryon__garment-img" />
                <div className="tryon__garment-info">
                  <p className="tryon__garment-name" style={{ background: '#e8e4dc', height: 14, borderRadius: 4, width: '70%' }}>&nbsp;</p>
                  <p className="tryon__garment-type" style={{ background: '#f0ece4', height: 10, borderRadius: 4, width: '40%', marginTop: 6 }}>&nbsp;</p>
                </div>
              </div>
            ))
          : products.map((p, i) => (
              <motion.div
                key={p._id || p.slug || i}
                className={`tryon__garment-card${(selected?._id === p._id || selected?.slug === p.slug) ? ' tryon__garment-card--active' : ''}`}
                onClick={() => onSelect(p)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                whileHover={{ x: 3 }}
              >
                <div className="tryon__garment-img">
                  <img src={p.images?.[0]} alt={p.name} loading="lazy" />
                </div>
                <div className="tryon__garment-info">
                  <p className="tryon__garment-name">{p.name}</p>
                  <span className="tryon__garment-type">{p.type}</span>
                </div>
                <span className="tryon__garment-price">${p.price?.toFixed(2)}</span>
              </motion.div>
            ))}
      </div>
    </div>
  );
};

export default GarmentPicker;
