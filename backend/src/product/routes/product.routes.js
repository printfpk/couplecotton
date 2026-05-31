import express from 'express';
import multer from 'multer';
import * as productController from '../controllers/product.controller.js';
import createAuthMiddleware from '../middlewares/auth.middleware.js';
import { createProductValidators, updateProductValidators } from '../validators/product.validators.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id/recommend', productController.getRecommendations);

// Authenticated routes
router.get('/seller/me', createAuthMiddleware(['seller']), productController.getProductsBySeller);

router.post(
    '/',
    createAuthMiddleware(['admin', 'seller']),
    upload.array('images', 5),
    createProductValidators,
    productController.createProduct
);

router.patch(
    '/:id',
    createAuthMiddleware(['admin', 'seller']),
    upload.array('images', 5),
    updateProductValidators,
    productController.updateProduct
);

router.delete('/:id', createAuthMiddleware(['admin', 'seller']), productController.deleteProduct);

export default router;
