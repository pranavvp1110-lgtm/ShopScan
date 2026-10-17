# ScanGuard AI — Deployment & PWA Installation Guide

This guide walks you through deploying **ScanGuard AI** to the cloud and installing it directly as a native-feel Progressive Web App (PWA) on your **Android, iPhone/iPad, or Desktop (PC/Mac)**.

---

## Part 1: Why Deployment & App Installation Failed Previously

| Problem | Root Cause | Solution Applied |
|---|---|---|
| **Deploy Failed** | Missing `requirements.txt` in backend. Cloud platforms couldn't detect Python dependencies. | Created `backend/requirements.txt` and root `requirements.txt` with `opencv-python-headless`. |
| **Deploy Crash on Linux** | Standard `opencv-python` crashes on cloud Linux due to missing `libGL.so.1` system libraries. | Switched to `opencv-python-headless` which requires zero GUI dependencies. |
| **Port Binding Timeout** | Backend was hardcoded to `127.0.0.1:8000`. Cloud hosts assign dynamic `$PORT` and require binding to `0.0.0.0`. | Added dynamic `$PORT` and `$HOST` (0.0.0.0) environment variable binding in `backend/main.py`. |
| **Separate Host Headaches** | Deploying frontend and backend separately created CORS, domain proxy, and HTTPS mismatch issues. | FastAPI now mounts and serves the production React build (`frontend/dist`) directly. Fullstack app runs on **1 single service/port**! |
| **Install in App Failed** | Browser PWA installation strictly requires 192x192 and 512x512 PNG icons and HTTPS. The project only had an SVG icon and no fallback instructions. | Generated crisp PNG icons (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`), updated manifest, and built an interactive in-app `InstallAppModal`. |

---

## Part 2: Deployment Options

### Method 1: 1-Click Single-Service Fullstack Deployment (Recommended)

Deploy both the React PWA frontend and the FastAPI backend on **Render.com** (Free tier supported).

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: complete pwa installation and deployment configuration"
   git remote add origin https://github.com/<your-username>/scanguard-ai.git
   git push -u origin main
   ```

2. Log into [Render.com](https://render.com) and click **New +** $\to$ **Blueprint**.
3. Select your `scanguard-ai` repository.
4. Render will automatically read `render.yaml` and configure:
   - **Environment:** Python 3.11.9
   - **Build Command:**
     ```bash
     npm --prefix frontend install && npm --prefix frontend run build && pip install -r backend/requirements.txt
     ```
   - **Start Command:**
     ```bash
     cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
5. Click **Apply**.
6. Render will build the frontend, install backend requirements, and give you a live HTTPS URL (e.g., `https://scanguard-ai.onrender.com`).

---

### Method 2: Split Deployment (Frontend on Vercel + Backend on Render/Railway)

If you prefer hosting the React frontend on Vercel and the backend on Render/Railway:

#### Step 1: Deploy Backend to Render or Railway
- **Root Directory:** `backend` (or project root)
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- Copy your deployed backend URL (e.g., `https://scanguard-backend.onrender.com`).

#### Step 2: Deploy Frontend to Vercel
1. In Vercel, import your repository and set the **Root Directory** to `frontend`.
2. In **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://scanguard-backend.onrender.com`
3. Click **Deploy**. Vercel will build the frontend and apply `vercel.json` rewrites automatically.

---

### Method 3: 1-Command Container Deployment (Docker)

Deploy anywhere Docker is supported (Railway, Fly.io, Google Cloud Run, VPS):

```bash
# Build and run container locally or on your server
docker compose up --build
```
Your application will be live at `http://localhost:8000` with the complete React PWA and FastAPI backend running together!

---

## Part 3: How to Install ScanGuard AI as an App

Once deployed over HTTPS (or tested on `localhost`):

### In-App Installation Trigger
1. Open the website on your device.
2. Look at the top blue banner and tap **"Install"**, or tap the **"📲 Install App (PWA)"** button in the top navigation bar.
3. If your browser supports 1-click install (Chrome on Android or Desktop), a browser prompt will appear—tap **"Install"**.
4. Otherwise, the built-in **ScanGuard Installation Guide** will open with tailored instructions for your device.

---

### Installing on Android (Google Chrome / Edge / Brave)
1. Open your deployed URL in **Chrome**.
2. Tap the **three dots menu (⋮)** in the top-right corner.
3. Tap **"Install app"** or **"Add to Home screen"**.
4. Tap **"Install"** to confirm. ScanGuard AI will be installed with its own app icon in your app drawer and home screen.

---

### Installing on iPhone / iPad (Apple Safari)
1. Open your deployed URL in **Safari** (*Note: Apple requires Safari for PWA home screen installation*).
2. Tap the **Share button** (box with arrow pointing up) at the bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top-right corner.
5. The ScanGuard AI icon will appear on your iOS home screen!

---

### Installing on Desktop (PC / Mac)
1. Open your deployed URL in **Google Chrome**, **Microsoft Edge**, or **Brave**.
2. Click the **Install App icon** (a monitor with download arrow or `+`) on the right side of the address bar.
3. Click **"Install"**. The app opens in a standalone, borderless window!

---

## Part 4: Testing Fullstack Locally Before Deploying

You can run the fullstack app locally in production mode with a single command:

```bash
# 1. Build the React frontend
cd frontend
npm run build
cd ..

# 2. Start the backend (serves both API & Frontend on http://127.0.0.1:8000)
cd backend
python main.py
```
Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser. Both the web application and all `/api/*` endpoints are live on port 8000!
