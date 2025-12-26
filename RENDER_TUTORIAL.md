# How to Deploy to Render.com (Step-by-Step)

Since you are new to Render, follow these exact steps. It is free and very easy.

## Phase 1: Sign Up
1.  Open your browser to: **[https://dashboard.render.com/register](https://dashboard.render.com/register)**
2.  Click **"Sign up with GitHub"**.
    *   *Why?* This automatically gives Render permission to see your repositories so you don't have to configure keys manually.
3.  Authorize Render when asked.

## Phase 2: Creates the Backend Service
1.  Once logged in, you will see a dashboard. Click the **"New +"** button at the top right.
2.  Select **"Web Service"**.
3.  You will see a list of your GitHub repositories. Click **"Connect"** next to `multi-saas-platform`.
    *   *If you don't see it, there is a link on the right that says "Configure account" – click that and ensure your new repo is selected.*

## Phase 3: Configuration (Copy these EXACTLY)
You will see a form. Fill it out like this:

*   **Name**: `multi-saas-backend` (or anything you like)
*   **Region**: Leave as default (e.g., Oregon or Frankfurt).
*   **Branch**: `main`
*   **Root Directory**: `Backend`  <-- **CRITICAL!** Do not miss this used.
*   **Runtime**: `Node`
*   **Build Command**: `npm install`
*   **Start Command**: `npm start`
*   **Instance Type**: Select **"Free"**.

## Phase 4: Secrets (The Environment Variables)
Scroll down to the section called **"Environment Variables"**. You need to add 2 variables here.

**Variable 1:**
*   **Key**: `FIREBASE_SERVICE_ACCOUNT`
*   **Value**: *[Go to your Desktop > Open `MULTI SAAS - Copy` > Open `Backend` > Open `serviceAccountKey.json`. Copy the ENTIRE content (starts with `{` and ends with `}`). Paste it here.]*

**Variable 2:**
*   **Key**: `FRONTEND_URL`
*   **Value**: `*`
    *   *(Note: This allows any website to access your API. Once your frontend is deployed on Netlify, come back here and paste that URL instead for better security.)*

## Phase 5: Launch!
1.  Click the big blue **"Create Web Service"** button at the bottom.
2.  You will be taken to a log screen.
3.  Wait for about 2-3 minutes.
4.  Watch the logs. You want to see: `Server started on port ...`
5.  Once it's done, look at the top left of the screen under your service name. You will see a URL like:
    `https://multi-saas-backend.onrender.com`
    **COPY THIS URL.** You will need it for the Frontend.

---

**That's it! Your backend is now live on the internet.**
