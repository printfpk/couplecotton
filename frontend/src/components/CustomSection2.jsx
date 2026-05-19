import React from 'react';
import { motion } from 'framer-motion';
import './CustomSection2.css';

const CDN = '/assets';

const ICONS = [
  { img: `${CDN}/icon-1.webp?v=1772617897&width=270`, title: 'Premium Cotton',    desc: '100% organic cotton that feels soft against your skin all day long' },
  { img: `${CDN}/icon-2.webp?v=1772617894&width=270`, title: 'His & Hers Fit',    desc: 'Tailored sizing for both him and her — no more one-size-fits-all' },
  { img: `${CDN}/icon-3.webp?v=1772617900&width=269`, title: 'Matching Design',   desc: 'Coordinated patterns and colors that complement without being identical' },
  { img: `${CDN}/icon-4.webp?v=1772617890&width=270`, title: 'Sustainable',       desc: 'Eco-friendly materials and ethical manufacturing for a better tomorrow' },
];

const CustomSection2 = () => (
  <section className="cs2">
    <div className="cs2__container">
      <motion.h2
        className="cs2__heading"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        The future of couple fashion
      </motion.h2>

      <div className="cs2__grid">
        {ICONS.map(({ img, title, desc }, i) => (
          <motion.div
            key={title}
            className="cs2__card"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
          >
            <motion.div
              className="cs2__card-icon"
              whileHover={{ rotate: [0, -6, 6, 0], transition: { duration: 0.45 } }}
            >
              <img src={img} alt={title} width={270} height={270} loading="lazy" />
            </motion.div>
            <div className="cs2__card-body">
              <h3 className="cs2__card-title">{title}</h3>
              <p className="cs2__card-desc">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CustomSection2;
