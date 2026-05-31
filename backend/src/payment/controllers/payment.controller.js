import paymentModel from '../models/payment.model.js';
import orderModel from '../../orders/models/order.model.js';
import Razorpay from 'razorpay';
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

export async function createPayment(req, res) {
    try {
        const orderId = req.params.orderId;
        const orderDoc = await orderModel.findById(orderId);

        if (!orderDoc) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const price = orderDoc.totalPrice;

        const order = await razorpay.orders.create({
            amount: price.amount,
            currency: price.currency
        });

        const payment = await paymentModel.create({
            order: orderId,
            razorpayOrderId: order.id,
            user: req.user.id,
            price: {
                amount: order.amount,
                currency: order.currency
            }
        });

        res.status(201).json({ message: 'Payment created successfully', order, payment });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function verifyPayment(req, res) {
    const { razorpayOrderId, paymentId, signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

    try {
        const isValid = validatePaymentVerification({
            order_id: razorpayOrderId,
            payment_id: paymentId
        }, signature, secret);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const payment = await paymentModel.findOne({ razorpayOrderId, status: 'PENDING' });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        payment.paymentId = paymentId;
        payment.signature = signature;
        payment.status = 'COMPLETED';

        await payment.save();

        res.status(200).json({ message: 'Payment verified', payment });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

