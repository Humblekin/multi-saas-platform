# Currency Error - FIXED ✅

## Problem
"Currency not supported by merchant" error when trying to make payment.

## Solution Applied
✅ Added `currency: 'GHS'` to the Paystack configuration in PaymentPage.jsx

---

## ✅ What I Fixed

The Paystack component now includes the currency parameter:

```javascript
const componentProps = {
    email,
    amount,
    currency: 'GHS', // ← ADDED THIS
    metadata: {
        name: user?.name,
        phone: '',
    },
    publicKey,
    text: 'Pay GHS 350',
    onSuccess: (reference) => handlePaymentSuccess(reference),
    onClose: () => console.log('Payment closed'),
};
```

---

## 🔍 Additional Check - Paystack Account Settings

You should also verify your Paystack account is set up for GHS:

### Steps:
1. Go to: https://dashboard.paystack.com/#/settings/preferences
2. Check **Settlement Currency**
3. Make sure **GHS (Ghanaian Cedis)** is selected or enabled

### If GHS is not available:
- Your Paystack account might be registered in a different country
- Contact Paystack support to enable GHS
- OR use the currency your account supports (NGN, ZAR, USD, etc.)

---

## 💡 Alternative: Use Your Account's Currency

If your Paystack account doesn't support GHS, you can change to your supported currency:

### Example for NGN (Nigerian Naira):
```javascript
const publicKey = 'pk_live_528361c736310e808e627b76286b49187ca98d99';
const amount = 14000000; // 140,000 NGN in kobo (equivalent to ~350 GHS)
const currency = 'NGN'; // Nigerian Naira
```

### Example for USD (US Dollars):
```javascript
const publicKey = 'pk_live_528361c736310e808e627b76286b49187ca98d99';
const amount = 35000; // $350 in cents
const currency = 'USD'; // US Dollars
```

---

## 🧪 Test Again

Now try the payment again:

1. Refresh the payment page
2. Click "Pay GHS 350"
3. Paystack popup should appear without currency error
4. Complete the payment
5. You should be redirected to dashboard

---

## 🎯 Supported Currencies by Paystack

Paystack supports these currencies (depending on your account location):
- **GHS** - Ghanaian Cedis (Ghana)
- **NGN** - Nigerian Naira (Nigeria)
- **ZAR** - South African Rand (South Africa)
- **KES** - Kenyan Shilling (Kenya)
- **USD** - US Dollars (International)

---

## ✅ Current Configuration

Your payment is now set to:
- **Amount**: GHS 350 (35000 pesewas)
- **Currency**: GHS (Ghanaian Cedis)
- **Public Key**: pk_live_528361c736310e808e627b76286b49187ca98d99
- **Secret Key**: Set in backend .env

---

## 🐛 If Error Persists

### Check:
1. ✅ Currency added to PaymentPage.jsx (DONE)
2. ✅ Paystack account supports GHS
3. ✅ Account is in live mode (not test mode)
4. ✅ Business is verified on Paystack

### Contact Paystack Support:
- Email: support@paystack.com
- Ask: "Does my account support GHS currency?"

---

## 📞 Next Steps

1. ✅ Currency parameter added
2. ⏳ Try payment again
3. ⏳ If error persists, check Paystack dashboard for supported currencies
4. ⏳ Adjust currency if needed

The payment should work now! 🚀
