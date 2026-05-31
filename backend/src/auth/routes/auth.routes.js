import express from 'express';
import * as validators from '../middlewares/validator.middleware.js';
import * as authController from '../controllers/auth.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', validators.registerUserValidations, authController.registerUser);
router.post('/login', validators.loginUserValidations, authController.loginUser);
router.get('/me', authMiddleware.authMiddleware, authController.getCurrentUser);
router.get('/logout', authController.logoutUser);
router.get('/users/me/addresses', authMiddleware.authMiddleware, authController.getUserAddresses);
router.post('/users/me/addresses', validators.addUserAddressValidations, authMiddleware.authMiddleware, authController.addUserAddress);
router.delete('/users/me/addresses/:addressId', authMiddleware.authMiddleware, authController.deleteUserAddress);

export default router;
