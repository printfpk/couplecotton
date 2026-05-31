import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const AIBuddyContext = createContext();

export const AIBuddyProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, removeFromCart, toggleCart } = useCart();
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const conversationIdRef = useRef(Math.random().toString(36).substring(7));

  // Add initial greeting when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = user?.name 
        ? `Hey ${user.name.split(' ')[0]}! 😄 Aaj kya shopping karni hai?`
        : "Hey! 😄 Main tumhara shopping buddy hoon. Kya dhundh rahe ho?";
        
      setMessages([{ role: 'ai', text: greeting }]);
      speak(greeting);
    }
  }, [isOpen, messages.length, user, speak]);

  const togglePanel = useCallback(() => setIsOpen(prev => !prev), []);

  const resetChat = useCallback(async () => {
    stopSpeaking();
    
    // Reset backend memory
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id || 'guest',
          conversationId: conversationIdRef.current
        })
      });
    } catch (e) {
      // Ignore network errors for reset
    }

    // Generate new conversation ID
    conversationIdRef.current = Math.random().toString(36).substring(7);
    
    // Reset local state
    const greeting = "Hey! 😄 Naya chat shuru. Kya dhundh rahe ho?";
    setMessages([{ role: 'ai', text: greeting }]);
    speak(greeting);
  }, [user, speak, stopSpeaking]);

  const sendMessage = async (text) => {
    if (!text.trim() || isProcessing) return;

    const newMsg = { role: 'user', text };
    setMessages(prev => [...prev, newMsg]);
    setIsProcessing(true);
    stopSpeaking();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: user?._id || 'guest',
          userName: user?.fullName?.firstName || user?.username || 'Guest',
          conversationId: conversationIdRef.current
        })
      });

      const data = await response.json();
      
      const aiMsg = { 
        role: 'ai', 
        text: data.reply,
        action: data.action,
        products: data.products
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      // Handle UI actions
      if (data.action === 'SHOW_PRODUCTS' && data.products) {
        toggleCart(false); // Ensure cart is closed when showing products
        navigate('/collections/all', { state: { aiProducts: data.products, query: text } });
      } else if (data.action === 'CART_ADDED' && data.cartUpdate) {
        const p = data.cartUpdate;
        const prod = { _id: p.id, slug: p.slug, title: p.title, price: { finalPrice: p.price }, images: [{ url: p.image }] };
        addToCart(prod, p.qty || 1, p.size, p.color ? { name: p.color } : null);
      } else if (data.action === 'CART_REMOVED' && data.cartUpdate) {
        removeFromCart(data.cartUpdate);
      }

      // Handle UI control actions
      if (data.uiAction) {
        const ua = data.uiAction;
        
        if (ua.type === 'SCROLL') {
          const scrollAmounts = { small: 300, medium: 600, large: 1200 };
          if (ua.amount === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (ua.amount === 'bottom') {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          } else {
            const px = scrollAmounts[ua.amount] || 600;
            window.scrollBy({ top: ua.direction === 'up' ? -px : px, behavior: 'smooth' });
          }
        }
        
        if (ua.type === 'NAVIGATE_PRODUCT' && ua.slug) {
          toggleCart(false);
          navigate(`/products/${ua.slug}`);
        }
        
        if (ua.type === 'NAVIGATE_PAGE') {
          if (ua.page === 'cart') {
            toggleCart(true);
          } else {
            toggleCart(false);
            const pageRoutes = { home: '/', collections: '/collections/all', profile: '/profile' };
            navigate(pageRoutes[ua.page] || '/');
          }
        }
      }

      // Speak the reply (strip emojis for cleaner audio)
      const cleanText = (data.reply || '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim();
      if (cleanText) {
        speak(cleanText);
      }
      
    } catch (err) {
      console.error('AI Chat Error:', err);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Network issue lag raha hai. Wapas try karo! 😅' 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AIBuddyContext.Provider value={{
      isOpen,
      togglePanel,
      messages,
      sendMessage,
      isProcessing,
      isSpeaking,
      stopSpeaking,
      resetChat
    }}>
      {children}
    </AIBuddyContext.Provider>
  );
};

export const useAIBuddy = () => useContext(AIBuddyContext);
