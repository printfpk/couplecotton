import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './CustomSection4.css';

const STATS = [
  { target: 86, suffix: '%', desc: 'of couples say they feel more connected wearing matching outfits.' },
  { target: 67, suffix: '%', desc: 'reported getting more compliments as a couple.' },
  { target: 80, suffix: '%', desc: 'loved the fabric quality and would reorder.*' },
  { target: 75, suffix: '%', desc: 'said CoupleCotton is their go-to for couple gifts.' },
];

/* Animated counter hook */
const useCounter = (target, active, duration = 1800) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return val;
};

const StatCard = ({ target, suffix, desc, active, index }) => {
  const val = useCounter(target, active);
  return (
    <motion.div
      className="cs4__stat"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: 'easeOut' }}
    >
      <div className="cs4__number">
        <span className="cs4__num-val">{val}</span>
        <span className="cs4__num-suffix">{suffix}</span>
      </div>
      <p className="cs4__desc">{desc}</p>
    </motion.div>
  );
};

const CustomSection4 = () => {
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="cs4" ref={ref}>
      <div className="cs4__container">
        <motion.div
          className="cs4__header"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="cs4__subheading">Comfort First, Style Always</p>
          <h2 className="cs4__heading">Designed to truly connect</h2>
        </motion.div>

        <div className="cs4__grid">
          {STATS.map((s, i) => (
            <StatCard key={s.target + s.desc} {...s} active={active} index={i} />
          ))}
        </div>

        <motion.p
          className="cs4__footnote"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          *Based on a survey of 2,000+ CoupleCotton customers across<br />
          multiple collections and product lines.
        </motion.p>
      </div>
    </section>
  );
};

export default CustomSection4;
