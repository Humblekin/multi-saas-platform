import express from 'express';
import axios from 'axios';
import auth from '../middleware/auth.js';
import { db } from '../firebaseAdmin.js';
import { sendSubscriptionEmail } from '../utils/emailService.js';

const router = express.Router();

// Verify Payment (Paystack)
router.post('/verify', auth, async (req, res) => {
    const { reference, planType } = req.body;

    try {
        // Verify transaction with Paystack
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        const data = response.data;

        if (data.status && data.data.status === 'success') {
            // Payment successful, update user subscription
            const docRef = db.collection('users').doc(req.user.id);
            const doc = await docRef.get();

            if (!doc.exists) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);

            const subscription = {
                isActive: true,
                planType,
                paymentReference: reference,
                startDate: new Date().toISOString(),
                endDate: endDate.toISOString()
            };

            await docRef.update({ subscription });

            // Send confirmation email
            const userData = doc.data();
            await sendSubscriptionEmail(userData.email, userData.name, planType, endDate);

            res.json({ msg: 'Subscription successful', subscription });
        } else {
            res.status(400).json({ msg: 'Payment verification failed' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;

