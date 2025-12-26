import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import api from '../api';
import './PaymentPage.css';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const selectedSystem = location.state?.system || 'Pharmacy';

    const [loading, setLoading] = useState(false);

    const publicKey = 'pk_live_528361c736310e808e627b76286b49187ca98d99'; // Paystack live public key
    const amount = 35000; // 350 GHS in pesewas (Paystack uses smallest currency unit)
    const email = user?.email || '';

    const componentProps = {
        email,
        amount,
        currency: 'GHS', // Specify Ghanaian Cedis
        metadata: {
            name: user?.name,
            phone: '',
        },
        publicKey,
        text: 'Pay GHS 350',
        onSuccess: (reference) => handlePaymentSuccess(reference),
        onClose: () => console.log('Payment closed'),
    };

    const handlePaymentSuccess = async (reference) => {
        setLoading(true);
        try {
            // Verify payment with backend
            const res = await api.post('/payment/verify', {
                reference: reference.reference,
                planType: selectedSystem,
            });

            // Update user in localStorage
            const updatedUser = { ...user, subscription: res.data.subscription };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Redirect to the system dashboard
            navigate(`/${selectedSystem.toLowerCase()}`);
        } catch (err) {
            console.error('Payment verification failed', err);
            alert('Payment verification failed. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-container" >
            <div className="payment-card" >
                <h2>Complete Your Subscription</h2>
                <div className="payment-details">
                    <div className="detail-row">
                        <span>Selected System:</span>
                        <strong>{selectedSystem}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Subscription Period:</span>
                        <strong>1 Year</strong>
                    </div>
                    <div className="detail-row total">
                        <span>Total Amount:</span>
                        <strong>GHS 350.00</strong>
                    </div>
                </div>

                <div className="payment-actions">
                    {loading ? (
                        <div className="loading">Processing payment...</div>
                    ) : (
                        <PaystackButton className="paystack-button" {...componentProps} />
                    )}
                    <button
                        className="btn-cancel"
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            navigate('/login');
                        }}
                    >
                        Cancel / Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
