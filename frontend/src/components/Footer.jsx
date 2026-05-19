import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Footer.css';

const CDN = '/assets';

const COMPANY_LINKS = [
  { label: 'Our Story',    href: '/pages/a-new-standard-of-wellness-crafted-with-intention' },
  { label: 'Contact',      href: '/pages/contact' },
  { label: 'FAQs',         href: '/pages/frequently-asked-questions' },
  { label: 'Blog',         href: '/blogs/news' },
  { label: 'Find a Store', href: '/pages/store-location' },
];
const HELP_LINKS = [
  { label: 'Help Center',   href: '/pages/need-a-hand' },
  { label: 'Live Chat',     href: '/pages/contact' },
  { label: 'Return Policy', href: '/pages/returns-refunds' },
  { label: 'Shipping Info', href: '/pages/orders-shipping' },
  { label: 'Bulk Orders',   href: '/pages/track-order' },
];
const LEGAL_LINKS = [
  { label: 'Accessibility',    href: '/pages/frequently-asked-questions' },
  { label: 'Terms of Service', href: '/pages/need-a-hand' },
  { label: 'Privacy Policy',   href: '/policies/privacy-policy' },
];
const IG_IMAGES = [1,2,3,4,5,6].map(n => `https://loremflickr.com/300/300/couple,clothing?lock=${n + 100}`);

const stop = e => e.preventDefault();

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path d="M4.04 4.33L10.31 12.72 4 19.54h1.42l5.53-5.97 4.46 5.97h4.83L13.62 10.68l5.87-6.35h-1.42L12.99 9.83 8.87 4.33H4.04z" fill="currentColor"/>
  </svg>
);
const IGIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path d="M12 3.27c-2.37 0-2.67.01-3.6.05-.93.04-1.57.19-2.12.4-.58.22-1.07.52-1.55 1-.48.49-.78.97-1 1.55-.22.55-.36 1.19-.4 2.12C3.28 9.33 3.27 9.63 3.27 12c0 2.37.01 2.67.05 3.6.04.93.18 1.57.4 2.12.22.57.52 1.07 1 1.55.48.48.97.78 1.55 1 .55.22 1.19.36 2.12.4.93.04 1.23.05 3.6.05s2.67-.01 3.6-.05c.93-.04 1.57-.18 2.12-.4.57-.22 1.07-.52 1.55-1 .48-.48.78-.97 1-1.55.22-.55.36-1.19.4-2.12.04-.93.05-1.23.05-3.6s-.01-2.67-.05-3.6c-.04-.93-.18-1.57-.4-2.12a3.16 3.16 0 0 0-1-1.55 3.16 3.16 0 0 0-1.55-1c-.55-.22-1.19-.36-2.12-.4C14.67 3.28 14.37 3.27 12 3.27zm0 1.58c2.33 0 2.6.01 3.52.05.85.04 1.31.18 1.62.3.4.16.7.35 1 .65.3.3.49.6.65 1 .12.31.26.77.3 1.62.04.92.05 1.19.05 3.52s-.01 2.6-.05 3.52c-.04.85-.18 1.31-.3 1.62-.16.4-.35.7-.65 1-.3.3-.6.49-1 .65-.31.12-.77.26-1.62.3-.92.04-1.19.05-3.52.05s-2.6-.01-3.52-.05c-.85-.04-1.31-.18-1.62-.3-.4-.16-.7-.35-1-.65a2.7 2.7 0 0 1-.65-1c-.12-.31-.26-.77-.3-1.62C4.86 14.6 4.85 14.33 4.85 12s.01-2.6.05-3.52c.04-.85.18-1.31.3-1.62.16-.4.35-.7.65-1 .3-.3.6-.49 1-.65.31-.12.77-.26 1.62-.3C9.4 4.86 9.67 4.85 12 4.85zm4.66-1.55a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 7.52A4.48 4.48 0 1 0 12 16.48 4.48 4.48 0 0 0 12 7.52zm0 1.57a2.91 2.91 0 1 1 0 5.82 2.91 2.91 0 0 1 0-5.82z" fill="currentColor"/>
  </svg>
);
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
    <path d="M9.99 17.26c1.33 0 2.41-.96 2.41-2.42V4h2.9c-.16 1.98 1.8 3.89 3.97 3.84v2.73c-1.85 0-3.43-.78-3.98-1.21v5.49c0 2.42-1.9 5.15-5.3 5.15C6.58 20 4.72 17.26 4.72 14.84c0-3.41 3.61-5.39 6-4.91v2.78c-.12-.04-.3-.07-.57-.07C8.68 12.6 7.57 13.65 7.57 14.84c0 1.34 1.08 2.42 2.42 2.42z" fill="currentColor"/>
  </svg>
);

const AccordionSection = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="footer__col">
      <button className="footer__col-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="footer__col-title">{title}</span>
        <motion.svg
          viewBox="0 0 20 20" fill="none" width="16" height="16"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <path d="M16.25 7.5L10 13.75L3.75 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="footer__col-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Footer = () => (
  <motion.footer
    className="site-footer"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.7, ease: 'easeOut' }}
  >
    <div className="footer__top">
      <div className="footer__top-inner">
        <div className="footer__brand">
          <h2 style={{ fontSize: '32px', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>CoupleCotton</h2>
          <p className="footer__tagline">Made for couples, <br />crafted with love.</p>
        </div>

        <AccordionSection title="Company">
          <ul className="footer__links-list">
            {COMPANY_LINKS.map(({ label, href }) => (
              <li key={label}><a href={href} onClick={stop}>{label}</a></li>
            ))}
          </ul>
        </AccordionSection>

        <AccordionSection title="Get Help">
          <ul className="footer__links-list">
            {HELP_LINKS.map(({ label, href }) => (
              <li key={label}><a href={href} onClick={stop}>{label}</a></li>
            ))}
          </ul>
        </AccordionSection>

        <AccordionSection title="Information">
          <address className="footer__address">
            <p>3772 Village View Drive, Immokalee, Florida</p>
            <p><a href="mailto:hello@couplecoton.com">hello@couplecoton.com</a></p>
            <p>+1 888-234-1234 (toll-free)</p>
          </address>
        </AccordionSection>
      </div>

      <hr className="footer__divider" />

      <div className="footer__ig-row">
        <div className="footer__ig-label">
          <p className="footer__ig-title">Follow Us on Instagram</p>
          <p className="footer__ig-handle">@couplecoton</p>
        </div>
        <div className="footer__ig-grid">
          {IG_IMAGES.map((src, i) => (
            <motion.a
              key={i}
              href="https://instagram.com/couplecoton"
              className="footer__ig-item"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ scale: 1.06 }}
            >
              <img src={src} alt="Instagram" loading="lazy" />
            </motion.a>
          ))}
        </div>
      </div>
    </div>

    <div className="footer__bottom">
      <div className="footer__bottom-inner">
        <ul className="footer__socials">
          {[
            { href: 'https://x.com/couplecoton', Icon: XIcon, label: 'X' },
            { href: 'https://instagram.com/couplecoton', Icon: IGIcon, label: 'Instagram' },
            { href: 'https://tiktok.com/@couplecoton', Icon: TikTokIcon, label: 'TikTok' },
          ].map(({ href, Icon, label }) => (
            <li key={label}>
              <motion.a
                href={href}
                className="footer__social-btn"
                aria-label={label}
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.18 }}
              >
                <Icon />
              </motion.a>
            </li>
          ))}
        </ul>

        <ul className="footer__legal">
          {LEGAL_LINKS.map(({ label, href }) => (
            <li key={label}><a href={href} onClick={stop}>{label}</a></li>
          ))}
        </ul>

        <p className="footer__copy">© {new Date().getFullYear()} CoupleCotton</p>
      </div>
    </div>
  </motion.footer>
);

export default Footer;
