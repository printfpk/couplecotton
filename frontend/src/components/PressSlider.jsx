import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PressSlider.css';

const CDN = '/assets';

const ITEMS = [
  { quote: '"The most thoughtfully designed matching outfits we\'ve ever seen. Comfortable, stylish, and truly made for couples."', img: `${CDN}/press-1.webp?v=1772677265&width=420` },
  { quote: '"CoupleCotton is redefining couple fashion. Finally, matching outfits that don\'t feel forced or cheesy."', img: `${CDN}/press-2.webp?v=1772677265&width=420` },
  { quote: '"Premium fabrics, perfect fits, and designs that make couples look effortlessly coordinated every time."', img: `${CDN}/press-3.webp?v=1772677265&width=420` },
  { quote: '"A brand that truly understands modern couples. Every piece feels intentional, premium, and uniquely wearable."', img: `${CDN}/press-4.webp?v=1772677265&width=420` },
];

const PressSlider = () => {
  const [active, setActive] = useState(0);
  const total = ITEMS.length;
  const goTo = useCallback(i => setActive((i + total) % total), [total]);

  return (
    <motion.section
      className="ps"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ps__container">
        <motion.p
          className="ps__supertitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Featured in Press, <br />Style Communities
        </motion.p>

        <div className="ps__main">
          {/* Animated quote */}
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={active}
              className="ps__quote"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
            >
              {ITEMS[active].quote}
            </motion.blockquote>
          </AnimatePresence>

          {/* Thumbnail nav */}
          <div className="ps__thumbs">
            {ITEMS.map((item, i) => (
              <motion.button
                key={i}
                className={`ps__thumb${i === active ? ' ps__thumb--active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.18 }}
              >
                <img src={item.img} alt="" loading="lazy" />
              </motion.button>
            ))}
          </div>

          {/* Arrow controls */}
          <div className="ps__controls">
            <motion.button
              className="ps__arrow"
              aria-label="Previous"
              onClick={() => goTo(active - 1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <svg viewBox="0 0 20 20" fill="none"><path d="M12.5 16.25L6.25 10L12.5 3.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.button>
            <motion.button
              className="ps__arrow"
              aria-label="Next"
              onClick={() => goTo(active + 1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <svg viewBox="0 0 20 20" fill="none"><path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default PressSlider;
