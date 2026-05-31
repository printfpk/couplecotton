import orderModel from '../models/order.model.js';
import cartModel from '../../cart/models/cart.model.js';
import productModel from '../../product/models/product.model.js';

export async function createOrder(req, res) {
    const user = req.user; // Assuming authentication middleware sets req.user
    
    try{
        let cart = await cartModel.findOne({ user: user.id });

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const products = await Promise.all(cart.items.map(async (item) => {
            return await productModel.findById(item.productId);
        }));

        let priceAmount = 0;

        const orderItems = cart.items.map((item) => {
            const product = products.find(p => p._id.toString() === item.productId.toString());

            if (!product) {
                throw new Error('Product not found');
            }

            if (product.stock < item.quantity) {
                throw new Error('Product is out of stock or insufficient stock');
            }

            const itemTotal = product.price.amount * item.quantity;
            priceAmount += itemTotal;

            return {
                product: item.productId,
                quantity: item.quantity,
                price: {
                    amount: itemTotal,
                    currency: product.price.currency
                }
            };
        });

        const order = await orderModel.create({
            user: user.id,
            items: orderItems,
            status: 'PENDING',
            totalPrice: {
                amount: priceAmount,
                currency: 'INR'
            },
            shippingAddress: {
                street: req.body.shippingAddress.street,
                city: req.body.shippingAddress.city,
                state: req.body.shippingAddress.state,
                zip: req.body.shippingAddress.pincode || req.body.shippingAddress.zip,
                country: req.body.shippingAddress.country,
            }
        });

        res.status(201).json({ message: 'Order created', order });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

