import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Product from './models/Product.js';

await connectDB();

// ─── Seed Products ──────────────────────────────────────────────────
const products = [
  {
    name: 'Cotton Polo Pair',
    slug: 'cc-cotton-polo-pair',
    type: 'Couple Set',
    description: 'Classic cotton polo in matching his & hers cuts. Breathable, timeless, and perfect for casual outings.',
    price: 52.00,
    images: ['https://loremflickr.com/600/800/clothing?lock=19', 'https://loremflickr.com/600/800/clothing?lock=20'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    colors: [
      { name: 'Navy', hex: '#1B2A4A' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Olive', hex: '#556B2F' },
    ],
    garmentMeta: { category: 'top' },
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Linen Couple Shirt',
    slug: 'cc-linen-couple-shirt',
    type: 'Matching Set',
    description: 'Lightweight linen shirts designed for couples. Relaxed fit with matching embroidered details.',
    price: 48.00,
    images: ['https://loremflickr.com/600/800/clothing?lock=21', 'https://loremflickr.com/600/800/clothing?lock=22'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Sky Blue', hex: '#87CEEB' },
      { name: 'Beige', hex: '#F5E6CC' },
    ],
    garmentMeta: { category: 'top' },
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Summer Short Set',
    slug: 'cc-summer-short-set',
    type: 'Matching Set',
    description: 'Matching couple shorts set with breathable cotton blend. Perfect for beach days and summer vibes.',
    price: 45.00,
    images: ['https://loremflickr.com/600/800/clothing?lock=23', 'https://loremflickr.com/600/800/clothing?lock=24'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: [
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Terracotta', hex: '#CC6B49' },
    ],
    garmentMeta: { category: 'full-body' },
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Matching Hoodie Duo',
    slug: 'cc-matching-hoodie-duo',
    type: 'Couple Set',
    description: 'Cozy couple hoodies with matching embroidery. Oversized fit for ultimate comfort.',
    price: 68.00,
    compareAt: 85.00,
    images: ['https://loremflickr.com/600/800/hoodie?lock=1', 'https://loremflickr.com/600/800/hoodie?lock=2'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: [
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Blush Pink', hex: '#DE6FA1' },
      { name: 'Forest', hex: '#228B22' },
    ],
    garmentMeta: { category: 'top' },
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Couple Graphic Tee',
    slug: 'cc-couple-graphic-tee',
    type: 'Couple Set',
    description: 'Fun couple graphic tees with complementary designs. Soft ring-spun cotton.',
    price: 35.00,
    images: ['https://loremflickr.com/600/800/tshirt?lock=5', 'https://loremflickr.com/600/800/tshirt?lock=6'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#1A1A1A' },
    ],
    garmentMeta: { category: 'top' },
    isFeatured: false,
    isActive: true,
  },
];

// ─── Run Seed ───────────────────────────────────────────────────────
try {
  await Product.deleteMany({});
  const inserted = await Product.insertMany(products);
  console.log(`✅ Seeded ${inserted.length} products`);
} catch (err) {
  console.error('❌ Seed error:', err);
} finally {
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}
