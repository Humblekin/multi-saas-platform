# How to Deploy Frontend to Netlify

Deploying the frontend is even easier than the backend.

## Phase 1: Sign up
1.  Go to **[https://app.netlify.com/signup](https://app.netlify.com/signup)**
2.  Click **"Sign up with GitHub"**.
3.  Authorize Netlify.

## Phase 2: Import Project
1.  Once logged in, look for **"Add new site"** (usually a teal button).
2.  Select **"Import an existing project"**.
3.  Choose **GitHub**.
4.  Select your repo: `multi-saas-platform`.

## Phase 3: Configure Build
Netlify should auto-detect most things, but double-check these:

*   **Base directory**: `Frontend`   <-- **IMPORTANT**
*   **Build command**: `npm run build`
*   **Publish directory**: `dist`

## Phase 4: Environment Variables (The Important Part)
Before clicking Deploy, click **"Show advanced"** or look for the **"Environment variables"** button.

You need to add ALL the keys from your local `Frontend/.env` file.
Click **"New variable"** for each one:

1.  `VITE_FIREBASE_API_KEY` : (Value from your file)
2.  `VITE_FIREBASE_AUTH_DOMAIN` : (Value from your file)
3.  `VITE_FIREBASE_PROJECT_ID` : (Value from your file)
4.  `VITE_FIREBASE_STORAGE_BUCKET` : (Value from your file)
5.  `VITE_FIREBASE_MESSAGING_SENDER_ID` : (Value from your file)
6.  `VITE_FIREBASE_APP_ID` : (Value from your file)
7.  `VITE_FIREBASE_MEASUREMENT_ID` : (Value from your file)

**And the Backend Connection:**
8.  `VITE_API_URL`
    *   **Value**: Since we haven't deployed the backend yet, just put `https://REPLACE_ME_LATER.com/api` for now.
    *   *We will come back and update this once the Render backend is live.*

## Phase 5: Deploy
1.  Click **"Deploy site"**.
2.  Netlify will build your site. It takes about 1 minute.
3.  Once done, you will get a green link like `https://funny-pika-123456.netlify.app`.

**Your Frontend is now online!**
*(Note: It won't be able to log in or save data until we finish the backend deployment and update that `VITE_API_URL` variable).*
