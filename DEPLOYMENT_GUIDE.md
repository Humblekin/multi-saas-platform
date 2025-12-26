# Deploying Your SaaS Platform

This guide covers deploying your **Backend (Node/Express)** to **Render.com** and your **Frontend (Vite/React)** to **Vercel** or **Netlify**.

---

## Part 1: Backend Deployment (Render.com)

1.  **Preparation**
    *   Push your `Backend` folder to GitHub. (Make sure you have a `package.json` and `server.js` inside).
    *   **CRITICAL**: Do NOT upload `.env` or `serviceAccountKey.json`.

2.  **Create Service on Render**
    *   Go to [Render.com](https://render.com) and create an account.
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.
    *   **Root Directory**: `Backend` (Important! Since your repo has subfolders).
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`

3.  **Environment Variables (Secrets)**
    *   In the Render dashboard for your new service, go to **Environment**.
    *   Add the contents of your Backend `.env` file here.
    *   **Frontend URL (CORS)**:
        *   Key: `FRONTEND_URL`
        *   Value: `https://your-frontend-app.vercel.app` (You will get this after deploying Frontend, but you can update it later).
        *   *Tip*: For now, you can set it to `*` to allow all (less secure), or update it after Part 2.
    *   **Firebase Secret**:
        *   Create a variable named `FIREBASE_SERVICE_ACCOUNT`.
        *   Open your local `Backend/serviceAccountKey.json`, copy the *entire* JSON content, and paste it as the value.
    *   Save Changes.

4.  **Finish**
    *   Render will deploy your backend. once done, it will give you a URL (e.g., `https://my-saas-backend.onrender.com`).
    *   **Copy this URL**. You need it for the frontend.

---

## Part 2: Frontend Deployment (Vercel/Netlify)

1.  **Preparation**
    *   Push your `Frontend` folder to GitHub.

2.  **Create Project**
    *   Go to Vercel/Netlify and import your repository.
    *   **Root Directory**: `Frontend`.
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`

3.  **Environment Variables**
    *   Go to **Settings** -> **Environment Variables**.
    *   Add all variables from your `Frontend/.env` file:
        *   `VITE_FIREBASE_API_KEY`: ...
        *   `VITE_FIREBASE_APP_ID`: ...
        *   (And all others)
    *   **API URL**:
        *   Key: `VITE_API_URL`
        *   Value: `https://my-saas-backend.onrender.com/api` (The URL from Part 1, plus `/api` if that's your route prefix).

4.  **Deploy**
    *   Click **Deploy**.
    *   Your app will be live!

---

## Troubleshooting

*   **Allowed Origins (CORS)**: If your frontend can't talk to the backend, check `server.js` in the Backend. ensure your `cors` configuration allows your new Frontend URL.
*   **Firebase Errors**: Check the Render logs. If it says "Credential implementation provided ... failed", re-check your `FIREBASE_SERVICE_ACCOUNT` variable.
