# Payment System - Final Setup Checklist

## ✅ Current Status

### Frontend
- ✅ Public Key: `pk_live_528361c736310e808e627b76286b49187ca98d99`
- ✅ Amount: GHS 350 (35000 pesewas)
- ✅ Payment integration code ready

### Backend
- ⚠️ Secret Key: Still shows test key in .env file
- ✅ Payment verification route ready
- ✅ Subscription logic implemented

---

## 🔧 How to Add Your Secret Key

### Option 1: Edit .env file directly
1. Open `Backend/.env` in your text editor
2. Find line 3: `PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. Replace with: `PAYSTACK_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY`
4. **Save the file** (Ctrl+S or Cmd+S)
5. **Restart the backend server**

### Option 2: Use this exact format
Your .env file should look like this:

```env
MONGO_URI=mongodb://localhost:27017/saas_system
JWT_SECRET=supersimplehumbledev123@%@$<>?/\\\
PAYSTACK_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY_HERE
PORT=5000
```

---

## 🔄 How to Restart Backend Server

### In your terminal where backend is running:
1. Press `Ctrl+C` to stop the server
2. Run `npm run dev` again
3. You should see "Server running on port 5000"

**OR**

### If using VS Code terminal:
1. Click on the terminal running backend
2. Press `Ctrl+C`
3. Type: `npm run dev`
4. Press Enter

---

## ✅ Verification Steps

After adding the secret key and restarting:

1. **Check Backend Console**
   - Should show "Server running on port 5000"
   - No errors about missing environment variables

2. **Test Payment Flow**
   - Go to payment page
   - Click "Pay GHS 350"
   - Paystack popup should appear
   - Complete test payment
   - Should redirect to dashboard

3. **Check Database**
   - User's subscription should be updated
   - `isActive: true`
   - `endDate: 1 year from now`

---

## 🐛 Troubleshooting

### If .env changes don't take effect:
- ✅ Make sure you saved the file (check for unsaved indicator in editor)
- ✅ Restart the backend server (Ctrl+C then npm run dev)
- ✅ Check there are no spaces before/after the = sign
- ✅ Secret key should NOT have quotes around it

### Correct Format:
```env
PAYSTACK_SECRET_KEY=sk_live_abc123xyz789
```

### Incorrect Formats:
```env
PAYSTACK_SECRET_KEY = sk_live_abc123xyz789  ❌ (spaces)
PAYSTACK_SECRET_KEY="sk_live_abc123xyz789" ❌ (quotes)
PAYSTACK_SECRET_KEY='sk_live_abc123xyz789' ❌ (quotes)
```

---

## 📝 Next Steps

1. ✅ Verify your .env file is saved with the live secret key
2. ✅ Restart the backend server
3. ✅ Test a payment
4. ✅ Verify subscription is activated

---

## 🎯 Expected Behavior

**When payment succeeds:**
- Backend receives payment reference
- Verifies with Paystack API using secret key
- Updates user subscription in database
- Returns success response
- Frontend redirects to dashboard

**When payment fails:**
- User sees error message
- Subscription remains inactive
- User can try again

---

## 🔐 Security Reminder

- Never commit .env file to Git
- Keep secret keys private
- Use test keys for development
- Use live keys for production only

Your payment system is ready - just need to ensure the secret key is properly saved and backend is restarted! 🚀
