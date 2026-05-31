import express from 'express';
import createAuthMiddleware from '../middlewares/auth.middleware.js';
import * as cartController from '../controllers/cart.controller.js';
import * as validation from '../middlewares/validation.middleware.js';

const router = express.Router();

router.get('/', createAuthMiddleware(['user']), cartController.getCart);
router.post('/items', validation.validateAddItemToCart, createAuthMiddleware(['user']), cartController.addItemToCart);
router.patch('/items/:productId', validation.validateUpdateCartItem, createAuthMiddleware(['user']), cartController.updateItemQuantity);

export default router;
