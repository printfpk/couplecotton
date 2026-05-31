import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import productModel from './product/models/product.model.js';

await connectDB();

const products = [
  {
    title: 'Cotton Polo Pair',
    slug: 'cc-cotton-polo-pair',
    description: 'Classic cotton polo in matching his & hers cuts. Breathable, timeless, and perfect for casual outings.',
    shortDescription: 'Classic matching couple polo shirts.',
    price: { amount: 5200, currency: 'INR', discountPercentage: 10 },
    gender: 'unisex',
    category: 'tshirt',
    pairGroupId: 'polo-pair-01',
    fashion: {
        color: 'Navy',
        style: 'casual',
        fit: 'regular',
        occasion: 'daily',
        season: 'summer',
        fabric: 'cotton'
    },
    business: {
        brand: 'CoupleCotton',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stock: 50,
        sku: 'CC-POLO-001',
        isFeatured: true,
        isTrending: true
    },
    images: [
        { url: 'https://loremflickr.com/600/800/clothing?lock=19' }, 
        { url: 'https://loremflickr.com/600/800/clothing?lock=20' }
    ],
    tags: ['polo', 'cotton', 'summer', 'couple'],
    isActive: true,
  },
  {
    title: 'Linen Couple Shirt - Him',
    slug: 'cc-linen-couple-shirt-him',
    description: 'Lightweight linen shirt designed for him. Relaxed fit.',
    shortDescription: 'Lightweight linen shirt.',
    price: { amount: 4800, currency: 'INR' },
    gender: 'male',
    category: 'shirt',
    pairGroupId: 'linen-set-01',
    fashion: {
        color: 'Sky Blue',
        style: 'korean',
        fit: 'relaxed',
        occasion: 'daily',
        season: 'summer',
        fabric: 'linen'
    },
    business: {
        brand: 'CoupleCotton',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 30,
        isFeatured: true
    },
    images: [{ url: 'https://loremflickr.com/600/800/clothing?lock=21' }],
    tags: ['linen', 'shirt', 'korean'],
    isActive: true,
  },
  {
    title: 'Linen Couple Shirt - Her',
    slug: 'cc-linen-couple-shirt-her',
    description: 'Lightweight linen shirt designed for her. Relaxed fit with matching details.',
    shortDescription: 'Lightweight linen shirt.',
    price: { amount: 4800, currency: 'INR' },
    gender: 'female',
    category: 'shirt',
    pairGroupId: 'linen-set-01',
    fashion: {
        color: 'Sky Blue',
        style: 'korean',
        fit: 'relaxed',
        occasion: 'daily',
        season: 'summer',
        fabric: 'linen'
    },
    business: {
        brand: 'CoupleCotton',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 30,
        isFeatured: true
    },
    images: [{ url: 'https://loremflickr.com/600/800/clothing?lock=22' }],
    tags: ['linen', 'shirt', 'korean'],
    isActive: true,
  },
  {
    title: 'Matching Hoodie Duo',
    slug: 'cc-matching-hoodie-duo',
    description: 'Cozy couple hoodies with matching embroidery. Oversized fit for ultimate comfort.',
    shortDescription: 'Cozy oversized hoodies.',
    price: { amount: 6800, currency: 'INR', discountPercentage: 20 },
    gender: 'unisex',
    category: 'hoodie',
    pairGroupId: 'hoodie-duo-01',
    fashion: {
        color: 'Charcoal',
        style: 'streetwear',
        fit: 'oversized',
        occasion: 'lounge',
        season: 'winter',
        fabric: 'fleece'
    },
    business: {
        brand: 'CoupleCotton',
        sizes: ['S', 'M', 'L', 'XL', '2XL'],
        stock: 100,
        isFeatured: false,
        isTrending: true
    },
    images: [{ url: 'https://loremflickr.com/600/800/hoodie?lock=1' }],
    tags: ['hoodie', 'winter', 'oversized', 'streetwear'],
    isActive: true,
  }
];

try {
  await productModel.deleteMany({});
  const inserted = await productModel.insertMany(products);
  console.log(`✅ Seeded ${inserted.length} products`);
} catch (err) {
  console.error('❌ Seed error:', err);
} finally {
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}
