import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './CustomSection3.css';

const ITEMS = [
  { text: 'Matching Tees',     href: '/collections/matching-tees' },
  { text: 'Couple Hoodies',    href: '/collections/couple-hoodies' },
  { text: 'Lounge Sets',       href: '/collections/lounge-sets' },
  { text: 'Date Night Looks',  href: '/collections/date-night' },
];

/* duplicate for seamless loop */
const TRACK = [...ITEMS, ...ITEMS, ...ITEMS];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const CustomSection3 = () => {
  const trackRef = useRef(null);
  const animRef  = useRef(null);
  const paused   = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    const speed = 0.6; // px per frame

    const step = () => {
      if (!paused.current) {
        pos -= speed;
        // reset when one third scrolled (original set width)
        const third = track.scrollWidth / 3;
        if (Math.abs(pos) >= third) pos = 0;
        track.style.transform = `translateX(${pos}px)`;
      }
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const stop = (e) => e.preventDefault();

  return (
    <motion.section
      className="cs3"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div
        className="cs3__viewport"
        onPointerEnter={() => (paused.current = true)}
        onPointerLeave={() => (paused.current = false)}
      >
        <div className="cs3__track" ref={trackRef}>
          {TRACK.map(({ text, href }, i) => (
            <React.Fragment key={i}>
              <span className="cs3__text">{text}</span>
              <motion.a
                href={href}
                onClick={stop}
                className="cs3__btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                Shop
              </motion.a>
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default CustomSection3;
