import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import { env } from './config/env.js';

import authRoutes from './auth/routes/auth.routes.js';
import productRoutes from './product/routes/product.routes.js';
import adminRoutes from './product/routes/admin.routes.js';
import cartRoutes from './cart/routes/cart.routes.js';
import orderRoutes from './orders/routes/order.routes.js';
import paymentRoutes from './payment/routes/payment.routes.js';
import tryOnRoutes from './routes/tryon.routes.js';
import aiRoutes from './ai-buddy/routes/ai.routes.js';

const app = express();

// Global Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tryon', tryOnRoutes);
app.use('/api/ai', aiRoutes);

// Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;

