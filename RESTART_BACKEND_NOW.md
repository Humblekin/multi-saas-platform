# ✅ RESTART BACKEND SERVER - QUICK GUIDE

## Your .env file is now saved! 🎉

Now you need to restart the backend server to load the new Paystack secret key.

---

## 🔄 How to Restart the Backend Server

### Step 1: Stop the Server
1. Click on the terminal window where the backend is running
2. You should see something like: `Server running on port 5000`
3. Press **`Ctrl + C`** on your keyboard
4. The server will stop

### Step 2: Start the Server Again
1. In the same terminal, type: `npm run dev`
2. Press **Enter**
3. Wait for the message: `Server running on port 5000`
4. You should also see: `MongoDB connected`

---

## ✅ Verification

After restarting, your backend will now use the live Paystack secret key!

### What to Check:
- ✅ No error messages in the terminal
- ✅ Server shows "running on port 5000"
- ✅ MongoDB connected successfully

---

## 🧪 Test Your Payment System

Now you can test the payment:

1. **Go to your app** (http://localhost:5173 or wherever frontend is running)
2. **Navigate to payment page**
3. **Click "Pay GHS 350"**
4. **Paystack popup should appear**
5. **Complete the payment**
6. **You should be redirected to your dashboard**
7. **Subscription should be active for 1 year**

---

## 🎯 Expected Flow

```
User clicks "Subscribe Now" 
    ↓
Payment Page loads
    ↓
User clicks "Pay GHS 350"
    ↓
Paystack popup appears
    ↓
User completes payment
    ↓
Backend verifies with Paystack (using your secret key)
    ↓
User subscription updated in database
    ↓
User redirected to dashboard
    ↓
✅ SUCCESS! User can now use the system for 1 year
```

---

## 🐛 If Something Goes Wrong

### Payment verification fails:
- Check backend terminal for error messages
- Verify secret key is correct (starts with `sk_live_`)
- Make sure you restarted the backend server

### Paystack popup doesn't appear:
- Check frontend console (F12 in browser)
- Verify public key is correct in PaymentPage.jsx

### Server won't start:
- Check for syntax errors in .env file
- Make sure MongoDB is running
- Check if port 5000 is already in use

---

## 📞 Quick Commands Reference

**Stop Backend:**
```
Ctrl + C
```

**Start Backend:**
```
npm run dev
```

**Check if MongoDB is running:**
```
mongod --version
```

---

## 🎉 You're Almost Done!

Just restart the backend and your payment system will be fully functional! 🚀

**Steps:**
1. ✅ Secret key added to .env
2. ✅ File saved
3. ⏳ Restart backend server ← DO THIS NOW
4. ⏳ Test payment

Good luck! 💪
