import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './FlexCarousel.css';

const CDN = '/assets';

const CARDS = [
  { poster: 'https://loremflickr.com/880/1200/couple,clothing?lock=60', videoSrc: '/assets/videos/cc50794483174d7b9ceae5f7a87f4f72.HD-1080p-7.2Mbps-76909254.mp4', avatar: 'https://loremflickr.com/200/200/face?lock=4', title: 'Perfect Couple Fit', quote: '"We both love how the matching set fits. Stylish and so comfortable."' },
  { poster: 'https://loremflickr.com/880/1200/couple,clothing?lock=61', videoSrc: '/assets/videos/8775bd18e1254504b78b0c76a41dae58.HD-1080p-7.2Mbps-76909253.mp4', avatar: 'https://loremflickr.com/200/200/face?lock=5', title: 'Twinning Goals', quote: '"Everyone asks where we got our matching outfits. Love this brand!"' },
  { poster: 'https://loremflickr.com/880/1200/couple,clothing?lock=62', videoSrc: '/assets/videos/013672845d014287a9bc45097a020cac.HD-1080p-7.2Mbps-76909252.mp4', avatar: 'https://loremflickr.com/200/200/face?lock=6', title: 'Date Night Ready', quote: '"The date night set made our anniversary dinner extra special."' },
];

const PlayIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" width="24" height="24">
    <path d="M18.75 10a1.23 1.23 0 0 1-.594 1.055L6.9 17.941a1.25 1.25 0 0 1-1.266.023A1.239 1.239 0 0 1 5 16.885V3.115a1.239 1.239 0 0 1 .634-1.08 1.25 1.25 0 0 1 1.266.023L18.156 8.945A1.23 1.23 0 0 1 18.75 10z" fill="currentColor"/>
  </svg>
);

const VideoCard = ({ card, index }) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => { videoRef.current?.play().catch(() => {}); }, 50);
  };

  return (
    <motion.div
      className="fc__card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
    >
      {!playing ? (
        <button className="fc__poster" onClick={handlePlay} aria-label="Play video">
          <img src={card.poster} alt={card.title} className="fc__poster-img" loading="lazy" />
          <motion.span
            className="fc__play-btn"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.18 }}
          >
            <PlayIcon />
          </motion.span>
        </button>
      ) : (
        <video ref={videoRef} className="fc__video" src={card.videoSrc} autoPlay loop muted playsInline controls />
      )}
      <div className="fc__card-content">
        <img src={card.avatar} alt={card.title} className="fc__avatar" loading="lazy" />
        <div className="fc__card-info">
          <p className="fc__card-title">{card.title}</p>
          <p className="fc__card-quote">{card.quote}</p>
        </div>
      </div>
    </motion.div>
  );
};

const FlexCarousel = () => (
  <section className="fc">
    <div className="fc__container">
      <motion.div
        className="fc__header"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p className="fc__supertitle">happy reviews</p>
        <h2 className="fc__heading">Real Couple Stories</h2>
      </motion.div>
      <div className="fc__grid">
        {CARDS.map((card, i) => <VideoCard key={card.title} card={card} index={i} />)}
      </div>
    </div>
  </section>
);

export default FlexCarousel;
