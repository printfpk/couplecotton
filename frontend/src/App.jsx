import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './theme-styles.css';
import Navbar from './components/Navbar';
import HeroSlideshow from './components/HeroSlideshow';
import ProductTabs from './components/ProductTabs';
import CustomSection1 from './components/CustomSection1';
import CustomSection2 from './components/CustomSection2';
import TestimonialsSlider from './components/TestimonialsSlider';
import ProgressTimeline from './components/ProgressTimeline';
import CustomSection3 from './components/CustomSection3';
import CustomSection4 from './components/CustomSection4';
import CollectionHighlight from './components/CollectionHighlight';
import ComparisonGallery from './components/ComparisonGallery';
import ScrollingLayers from './components/ScrollingLayers';
import FlexCarousel from './components/FlexCarousel';
import PressSlider from './components/PressSlider';
import Slideshow2 from './components/Slideshow2';
import BlogPosts from './components/BlogPosts';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchDrawer from './components/SearchDrawer';
import QuickAddDrawer from './components/QuickAddDrawer';
import Popup from './components/Popup';
import TryOnPage from './components/tryon/TryOnPage';
import ProductPage from './components/ProductPage';

/* ── Home Page (original store layout) ─────────────────────── */
function HomePage() {
  const [cartOpen,        setCartOpen]        = React.useState(false);
  const [searchOpen,      setSearchOpen]      = React.useState(false);
  const [quickAddOpen,    setQuickAddOpen]    = React.useState(false);
  const [quickAddProduct, setQuickAddProduct] = React.useState(null);

  // Escape key closes any open drawer
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
        setSearchOpen(false);
        setQuickAddOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Navbar
        onSearchOpen={() => setSearchOpen(true)}
        onCartOpen={() => setCartOpen(true)}
      />

      <main id="MainContent" role="main" tabIndex="-1">
        <HeroSlideshow />
        <ProductTabs />
        <CustomSection1 />
        <CustomSection2 />
        <TestimonialsSlider />
        <ProgressTimeline />
        <CustomSection3 />
        <CustomSection4 />
        <CollectionHighlight />
        <ComparisonGallery />
        <ScrollingLayers />
        <FlexCarousel />
        <PressSlider />
        <Slideshow2 />
        <BlogPosts />
        <Newsletter />
      </main>

      <Footer />

      <CartDrawer   open={cartOpen}     onClose={() => setCartOpen(false)} />
      <SearchDrawer open={searchOpen}   onClose={() => setSearchOpen(false)} />
      <QuickAddDrawer
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        product={quickAddProduct}
      />
      <Popup />
    </>
  );
}

/* ── Product Page with Navbar+Footer shell ─────────────────── */
function ProductPageWrapper() {
  const [cartOpen, setCartOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <Navbar
        onSearchOpen={() => setSearchOpen(true)}
        onCartOpen={() => setCartOpen(true)}
      />
      <ProductPage />
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

/* ── Try-On Page Wrapper ───────────────────────────────────── */
function TryOnPageWrapper() {
  const navigate = useNavigate();
  return <TryOnPage onBack={() => navigate('/')} />;
}

/* ── App with Router ───────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:slug" element={<ProductPageWrapper />} />
        <Route path="/try-on" element={<TryOnPageWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
