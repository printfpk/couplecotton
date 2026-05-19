import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

// GET /api/products — list all active products
router.get('/', async (req, res, next) => {
  try {
    const { type, featured, has3D } = req.query;
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (featured === 'true') filter.isFeatured = true;
    if (has3D === 'true') filter['model3D.url'] = { $ne: null };

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug — single product by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

export default router;
