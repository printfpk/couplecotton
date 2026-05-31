import express from 'express';
import createAuthMiddleware from '../middlewares/auth.middleware.js';
import * as orderController from '../controllers/order.controller.js';
import * as validation from '../middlewares/validation.middleware.js';

const router = express.Router();

router.post('/', createAuthMiddleware(['user']), validation.createOrderValidation, orderController.createOrder);

export default router;
