import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AIBuddyProvider } from './context/AIBuddyContext';
import './theme-styles.css';
import Navbar from './components/Navbar';
import HeroSlideshow from './components/HeroSlideshow';
import ProductTabs from './components/ProductTabs';
import CustomSection1 from './components/CustomSection1';
import CustomSection2 from './components/CustomSection2';
import TestimonialsSlider from './components/TestimonialsSlider';
import ProgressTimeline from './components/ProgressTimeline';
import CustomSection3 from './components/CustomSection3';
// Optional sections removed from homepage for now
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchDrawer from './components/SearchDrawer';
import QuickAddDrawer from './components/QuickAddDrawer';
import Popup from './components/Popup';
import TryOnPage from './components/tryon/TryOnPage';
import CollectionsAll from './pages/CollectionsAll';
import ProductPage from './components/ProductPage';
import AuthModal from './components/AuthModal';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './admin/AdminLayout';
import ProductList from './admin/ProductList';
import AddProduct from './admin/AddProduct';
import EditProduct from './admin/EditProduct';
import AIBuddyWidget from './components/ai-buddy/AIBuddyWidget';

/* ── Home Page (original store layout) ─────────────────────── */
function HomePage() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const [quickAddProduct, setQuickAddProduct] = React.useState(null);

  // Escape key closes any open drawer
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setAuthOpen(false);
        setQuickAddOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <main id="MainContent" role="main" tabIndex="-1">
        <HeroSlideshow>
          <Navbar
            onSearchOpen={() => setSearchOpen(true)}
            onAuthOpen={() => setAuthOpen(true)}
          />
        </HeroSlideshow>
        <div className="content-wrapper-mobile">
          <ProductTabs />
          <CustomSection1 />
          <CustomSection2 />
          <TestimonialsSlider />
          <ProgressTimeline />
          <CustomSection3 />
          {/* sections removed */}
          <Newsletter />
        </div>
      </main>

      <Footer />

      <CartDrawer />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
      <QuickAddDrawer
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        product={quickAddProduct}
      />
      <Popup />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

/* ── Product Page with Navbar+Footer shell ─────────────────── */
function ProductPageWrapper() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);

  return (
    <>
      <Navbar
        onSearchOpen={() => setSearchOpen(true)}
        onAuthOpen={() => setAuthOpen(true)}
      />
      <ProductPage />
      <Footer />
      <CartDrawer />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

/* ── Collections All Wrapper ─────────────────────────────── */
function CollectionsAllWrapper() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);

  return (
    <>
      <Navbar
        onSearchOpen={() => setSearchOpen(true)}
        onAuthOpen={() => setAuthOpen(true)}
      />
      <CollectionsAll />
      <Footer />
      <CartDrawer />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

/* ── Profile Page Wrapper ──────────────────────────────────── */
function ProfilePageWrapper() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);

  return (
    <>
      <Navbar
        onSearchOpen={() => setSearchOpen(true)}
        onAuthOpen={() => setAuthOpen(true)}
      />
      <ProfilePage />
      <CartDrawer />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

/* ── Try-On Page Wrapper ───────────────────────────────────── */
function TryOnPageWrapper() {
  const navigate = useNavigate();
  return <TryOnPage onBack={() => navigate('/')} />;
}

/* ── App with Router ───────────────────────────────────────── */
function ScrollRestoration() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    // Reset any stuck overflow styles when navigating between pages
    document.body.style.overflow = '';
  }, [pathname]);
  return null;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollRestoration />
        <AIBuddyProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:slug" element={<ProductPageWrapper />} />
            <Route path="/collections/:categoryId" element={<CollectionsAllWrapper />} />
            <Route path="/try-on" element={<TryOnPageWrapper />} />
            <Route path="/profile" element={<ProfilePageWrapper />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<AddProduct />} />
              <Route path="products/:id/edit" element={<EditProduct />} />
            </Route>
          </Routes>
          {/* Global UI Components */}
          <AIBuddyWidget />
        </AIBuddyProvider>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
