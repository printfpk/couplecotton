import React from 'react';
import { motion } from 'framer-motion';
import './BlogPosts.css';

const CDN = '/assets';

const POSTS = [
  {
    img:    'https://loremflickr.com/800/600/couple,fashion?lock=66',
    href:   '/blogs/news/5-ways-to-style-matching-outfits',
    tag:    'Style Tips',
    title:  '5 Ways to Style Matching Outfits',
    date:   'Feb 26, 2026',
    author: 'Steve N.',
  },
  {
    img:    'https://loremflickr.com/800/600/couple,fashion?lock=67',
    href:   '/blogs/news/the-couple-that-dresses-together',
    tag:    'Fashion',
    title:  'The Couple That Dresses Together',
    date:   'Feb 24, 2026',
    author: 'Steve N.',
  },
  {
    img:    'https://loremflickr.com/800/600/couple,fashion?lock=68',
    href:   '/blogs/news/date-night-outfit-guide',
    tag:    'Fashion',
    title:  'Date Night Outfit Guide for Couples',
    date:   'Feb 22, 2026',
    author: 'Steve N.',
  },
];

const ArrowRight = () => (
  <svg viewBox="0 0 20 20" fill="none" className="blog__btn-icon">
    <path d="M7.5 3.75L13.75 10L7.5 16.25"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.25, 0, 0, 1] },
  }),
};

const BlogPosts = () => (
  <section className="blog">
    <div className="blog__container">
      <motion.h2 className="blog__heading"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.25, 0, 0, 1] }}>
        Our Style Journal
      </motion.h2>

      <div className="blog__grid">
        {POSTS.map(({ img, href, tag, title, date, author }, i) => (
          <motion.article key={href} className="blog__card"
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}>
            <a href={href} onClick={e => e.preventDefault()}
              className="blog__card-img-wrap" aria-label={title}>
              <img src={img} alt={title} className="blog__card-img"
                loading="lazy" width={832} height={487} />
              <span className="blog__tag">{tag}</span>
            </a>
            <div className="blog__card-body">
              <h3 className="blog__card-title">
                <a href={href} onClick={e => e.preventDefault()}>{title}</a>
              </h3>
              <div className="blog__meta">
                <time>{date}</time>
                <span className="blog__meta-sep" />
                <span>{author}</span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <motion.div className="blog__footer"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: 0.3 }}>
        <a href="/blogs/news" onClick={e => e.preventDefault()} className="blog__learn-btn">
          Learn More <ArrowRight />
        </a>
      </motion.div>
    </div>
  </section>
);

export default BlogPosts;
