import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import productModel from '../../product/models/product.model.js';
import cartModel from '../../cart/models/cart.model.js';
import { getPartnerRecommendations } from '../../product/services/recommendation.service.js';

export const searchProduct = tool(
  async ({ query, category, gender, color, style }) => {
    console.log('🔧 searchProduct called:', { query, category, gender, color, style });
    
    // Map common gender terms
    const genderMap = { 'women': 'female', 'woman': 'female', 'men': 'male', 'man': 'male', 'girls': 'female', 'boys': 'male', 'ladki': 'female', 'ladka': 'male' };
    const mappedGender = gender ? (genderMap[gender.toLowerCase()] || gender.toLowerCase()) : null;
    
    const filter = { isActive: true };
    
    // Use regex for category to handle partial matches (kurta matches kurti, etc.)
    if (category) filter.category = new RegExp(category.replace(/[aie]$/, ''), 'i');
    if (mappedGender && mappedGender !== 'all') filter.gender = { $in: [mappedGender, 'unisex'] };
    if (color) filter['fashion.color'] = new RegExp(color, 'i');
    if (style) filter['fashion.style'] = new RegExp(style, 'i');

    // Try with text search first if query is provided
    let products = [];
    if (query) {
      try {
        products = await productModel.find({ ...filter, $text: { $search: query } }).limit(6).lean();
      } catch (e) {
        // $text might fail if no text index; fall through
      }
    }
    
    // If no results with text search, try without text search (just filters)
    if (products.length === 0) {
      products = await productModel.find(filter).limit(6).lean();
    }
    
    // If still no results, try with just the query as a title regex
    if (products.length === 0 && query) {
      products = await productModel.find({ 
        isActive: true, 
        title: new RegExp(query, 'i') 
      }).limit(6).lean();
    }

    return JSON.stringify({
      count: products.length,
      products: products.map(p => ({
        id: p._id,
        slug: p.slug,
        title: p.title,
        price: p.price?.finalPrice || p.price?.amount,
        image: p.images?.[0]?.url || p.images?.[0],
        gender: p.gender,
        category: p.category
      }))
    });
  },
  {
    name: 'searchProduct',
    description: 'Search for products. Categories in DB: tshirt, shirt, hoodie, cargo, kurti, dress. Gender in DB: male, female, unisex. Map user language accordingly.',
    schema: z.object({
      query: z.string().optional().describe('Search text (e.g., "black hoodie", "cotton kurta")'),
      category: z.string().optional().describe('Product category: tshirt, shirt, hoodie, cargo, kurti, dress'),
      gender: z.string().optional().describe('Gender: male, female, unisex, women, men'),
      color: z.string().optional().describe('Color of the product'),
      style: z.string().optional().describe('Fashion style (streetwear, casual, ethnic)')
    })
  }
);

export const recommendProducts = tool(
  async ({ productId }) => {
    console.log('🔧 recommendProducts called:', { productId });
    try {
      const { sourceProduct, recommendations } = await getPartnerRecommendations(productId, 6);
      
      const format = (r) => ({
        id: r.product._id,
        slug: r.product.slug,
        title: r.product.title,
        price: r.product.price?.finalPrice || r.product.price?.amount,
        image: r.product.images?.[0]?.url || r.product.images?.[0],
        gender: r.product.gender,
        category: r.product.category,
        score: r.score,
        reasons: r.reasons,
      });

      return JSON.stringify({
        sourceProduct: {
          id: sourceProduct._id,
          title: sourceProduct.title,
          gender: sourceProduct.gender,
          category: sourceProduct.category,
        },
        recommendations: recommendations.map(format),
      });
    } catch (err) {
      console.error('Recommend tool error:', err);
      return JSON.stringify({ error: 'Could not fetch recommendations at this time.' });
    }
  },
  {
    name: 'recommendProducts',
    description: 'Get couple matching outfit recommendations for a product. Returns scored recommendations with reasons explaining why each product is a good match. Use this when users ask for matching partner outfits.',
    schema: z.object({
      productId: z.string().describe('The ID of the product to base recommendations on')
    })
  }
);

export const getProductDetails = tool(
  async ({ identifier }) => {
    console.log('🔧 getProductDetails called:', { identifier });
    let product;
    // Check if it's an object ID or slug
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await productModel.findById(identifier);
    } else {
      product = await productModel.findOne({ slug: identifier });
    }

    if (!product) return JSON.stringify({ error: 'Product not found' });

    return JSON.stringify({
      id: product._id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      sizes: product.business?.sizes,
      stock: product.business?.stock,
      image: product.images?.[0]?.url || product.images?.[0],
      fashion: product.fashion
    });
  },
  {
    name: 'getProductDetails',
    description: 'Get detailed information about a specific product.',
    schema: z.object({
      identifier: z.string().describe('The product ID or slug')
    })
  }
);

// We handle cart operations mostly by returning structured intents back to the frontend,
// because the frontend manages a local-first CartContext.
// The tool just confirms to the LLM that the intent is registered.
export const addProductToCart = tool(
  async ({ productId, qty = 1, size, color }) => {
    console.log('🔧 addProductToCart called:', { productId, qty, size });
    
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return JSON.stringify({ error: 'Invalid Product ID. You must use the actual MongoDB _id (24 char hex string) from the previous search results. Do not make up IDs like "first_product_id".' });
    }
    
    const product = await productModel.findById(productId);
    if (!product) return JSON.stringify({ error: 'Product not found' });
    
    return JSON.stringify({
      status: 'success',
      message: 'Product added to cart',
      item: {
        id: product._id,
        slug: product.slug,
        title: product.title,
        price: product.price?.finalPrice || product.price?.amount,
        image: product.images?.[0]?.url || product.images?.[0],
        qty,
        size,
        color
      }
    });
  },
  {
    name: 'addProductToCart',
    description: 'Intent to add a product to the user\'s shopping cart.',
    schema: z.object({
      productId: z.string().describe('The ID of the product to add'),
      qty: z.number().optional().default(1).describe('Quantity'),
      size: z.string().optional().describe('Selected size (e.g., S, M, L)'),
      color: z.string().optional().describe('Selected color')
    })
  }
);

export const removeProductFromCart = tool(
  async ({ cartItemId }) => {
    console.log('🔧 removeProductFromCart called:', { cartItemId });
    return JSON.stringify({ status: 'success', message: 'Product removed from cart', cartItemId });
  },
  {
    name: 'removeProductFromCart',
    description: 'Intent to remove an item from the user\'s shopping cart.',
    schema: z.object({
      cartItemId: z.string().describe('The ID of the item in the cart to remove')
    })
  }
);

export const scrollPage = tool(
  async ({ direction, amount }) => {
    console.log('🔧 scrollPage called:', { direction, amount });
    
    // Normalize inputs
    const dir = (direction || '').toLowerCase().includes('up') ? 'up' : 'down';
    const amt = amount || 'medium';
    
    return JSON.stringify({ 
      action: 'SCROLL', 
      direction: dir, 
      amount: amt
    });
  },
  {
    name: 'scrollPage',
    description: 'Scroll the webpage up or down. Use when user says "upar scroll karo", "neeche jao", "scroll up/down" etc.',
    schema: z.object({
      direction: z.string().describe('Scroll direction: "up" or "down"'),
      amount: z.string().optional().describe('How much to scroll: "small", "medium", "large", "top", or "bottom"')
    })
  }
);

export const navigateToProduct = tool(
  async ({ slug, productId }) => {
    console.log('🔧 navigateToProduct called:', { slug, productId });
    // If we have a slug, use it directly. Otherwise look up by ID.
    let productSlug = slug;
    if (!productSlug && productId) {
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
         return JSON.stringify({ error: 'Invalid Product ID. You must use the actual MongoDB _id from previous search results, not words like "first_product_id".' });
      }
      const product = await productModel.findById(productId).lean();
      productSlug = product?.slug;
    }
    if (!productSlug) return JSON.stringify({ error: 'Product not found' });
    
    return JSON.stringify({
      action: 'NAVIGATE_PRODUCT',
      slug: productSlug
    });
  },
  {
    name: 'navigateToProduct',
    description: 'Open a specific product detail page. Use when user says "pehla wala dikhao", "iske baare me batao". You MUST pass the actual "slug" or "id" from the previous search results.',
    schema: z.object({
      slug: z.string().optional().describe('The product slug to navigate to'),
      productId: z.string().optional().describe('The product ID to navigate to')
    })
  }
);

export const navigateToPage = tool(
  async ({ page }) => {
    console.log('🔧 navigateToPage called:', { page });
    
    let pg = (page || '').toLowerCase();
    if (pg.includes('home')) pg = 'home';
    else if (pg.includes('collection') || pg.includes('product')) pg = 'collections';
    else if (pg.includes('cart')) pg = 'cart';
    else if (pg.includes('profile')) pg = 'profile';
    else pg = 'home';

    return JSON.stringify({ action: 'NAVIGATE_PAGE', page: pg });
  },
  {
    name: 'navigateToPage',
    description: 'Navigate to a page on the website. Use when user says "home jao", "all products dikhao", "cart dikhao", "profile jao" etc.',
    schema: z.object({
      page: z.string().describe('The page to navigate to: "home", "collections", "cart", or "profile"')
    })
  }
);
