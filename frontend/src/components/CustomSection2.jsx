import React from 'react';
import { motion } from 'framer-motion';
import './CustomSection2.css';

const CDN = '/assets';

const ICONS = [
  { 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>, 
    title: 'Premium Cotton',    
    desc: '100% organic cotton that feels soft against your skin all day long' 
  },
  { 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, 
    title: 'His & Hers Fit',    
    desc: 'Tailored sizing for both him and her — no more one-size-fits-all' 
  },
  { 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>, 
    title: 'Matching Design',   
    desc: 'Coordinated patterns and colors that complement without being identical' 
  },
  { 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>, 
    title: 'Sustainable',       
    desc: 'Eco-friendly materials and ethical manufacturing for a better tomorrow' 
  },
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
        {ICONS.map(({ icon, title, desc }, i) => (
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
              {icon}
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
