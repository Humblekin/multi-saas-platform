# 🚀 How to Add Environment Variables in Render

## What You're Doing
You need to tell your backend (on Render) two important things:
1. **Where your frontend is** (FRONTEND_URL) - so it allows connections from Netlify
2. **Your Firebase credentials** (FIREBASE_SERVICE_ACCOUNT) - so it can access your database

---

## 📝 Step-by-Step Instructions

### **STEP 1: Go to Render Dashboard**

1. Open your browser
2. Go to: **https://dashboard.render.com/**
3. Log in if you're not already logged in

---

### **STEP 2: Find Your Backend Service**

1. You'll see a list of your services
2. Click on **`multi-saas-platform`** (your backend service)
3. This opens your service's dashboard

---

### **STEP 3: Open Environment Settings**

1. Look at the tabs at the top of the page
2. You'll see: Events, Logs, Shell, **Environment**, Settings
3. Click on **Environment** (it might also say "Environment Variables")

---

### **STEP 4: Add First Variable - FRONTEND_URL**

Now you'll see a section where you can add environment variables.

1. Look for a button that says **"Add Environment Variable"** or just **"Add"**
2. Click it
3. You'll see two empty boxes:
   - **Key** (or Name): Type `FRONTEND_URL`
   - **Value**: Type `https://totaltracks.netlify.app`
4. Click **Save** or **Add**

**What it should look like:**
```
Key:   FRONTEND_URL
Value: https://totaltracks.netlify.app
```

---

### **STEP 5: Add Second Variable - FIREBASE_SERVICE_ACCOUNT**

This one is a bit longer because it's a JSON file.

1. Click **"Add Environment Variable"** again
2. In the **Key** box: Type `FIREBASE_SERVICE_ACCOUNT`
3. In the **Value** box: 
   - Open your file: `Backend/serviceAccountKey.json`
   - Copy **EVERYTHING** inside the file (all the text from the first `{` to the last `}`)
   - Paste it into the Value box

**What the Key box should have:**
```
FIREBASE_SERVICE_ACCOUNT
```

**What the Value box should have:**
```json
{
  "type": "service_account",
  "project_id": "totaltrack-d69fa",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  ...rest of your JSON file...
}
```

4. Click **Save** or **Add**

---

### **STEP 6: Save Changes**

1. After adding both variables, look for a **"Save Changes"** button
2. Click it
3. Render will automatically restart your backend with the new settings
4. Wait 1-2 minutes for it to redeploy

---

## ✅ How to Verify It Worked

1. On the same Environment page, you should now see two variables listed:
   - `FRONTEND_URL` with value `https://totaltracks.netlify.app`
   - `FIREBASE_SERVICE_ACCOUNT` with value `{...` (it will hide the full value for security)

2. Go to the **Logs** tab to see if your backend restarted successfully
   - You should see: `Server started on port XXXX`
   - No errors about Firebase or CORS

---

## 🆘 Troubleshooting

### "I don't see an 'Add Environment Variable' button"
- Make sure you clicked on your service name first (`multi-saas-platform`)
- Make sure you're on the **Environment** tab (not Settings or Events)
- Try refreshing the page

### "The JSON value is too long"
- That's okay! The Value box should accept large text
- Just paste the entire JSON file content
- Make sure you include the opening `{` and closing `}`

### "It says 'Invalid JSON'"
- Double-check that you copied the ENTIRE file content
- Make sure there are no extra spaces before the first `{`
- Make sure the last character is `}`

---

## 📸 Visual Reference

The interface should look something like this:

- Left sidebar with tabs
- "Environment" tab selected
- A section showing your environment variables
- Button to add new variables
- Each variable has a Key and Value field

---

## ⏭️ What's Next?

After you add these two variables to Render:

1. ✅ Render backend is configured
2. ⏳ Next: Set up Netlify environment variables (for the frontend)
3. ⏳ Test your deployed site

---

**Need help?** Just let me know which step you're stuck on, and I'll help you!
