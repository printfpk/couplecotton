import express from 'express';
import multer from 'multer';
import * as adminController from '../controllers/admin.controller.js';
import requireAdmin from '../middlewares/admin.middleware.js';
import { createProductValidators, updateProductValidators } from '../validators/product.validators.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require admin
router.use(requireAdmin);

router.get('/products', adminController.adminGetProducts);

router.post(
    '/products',
    upload.none(),
    createProductValidators,
    adminController.adminCreateProduct
);

router.put(
    '/products/:id',
    upload.none(),
    updateProductValidators,
    adminController.adminUpdateProduct
);

router.delete('/products/:id', adminController.adminDeleteProduct);

export default router;
