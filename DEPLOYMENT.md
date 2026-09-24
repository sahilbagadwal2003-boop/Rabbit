# 🐇 Rabbit — Vercel Deployment Guide

This guide covers deploying both the **Backend (Express + MongoDB)** and **Frontend (React + Vite)** to Vercel as two separate projects.

---

## Prerequisites

- [Vercel account](https://vercel.com) (free tier works)
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
- MongoDB Atlas cluster set up and running
- Cloudinary account (for product image uploads)

---

## 1. Deploy the Backend

### Step 1 — Prepare Backend

The backend is already configured for Vercel. Key files:
- `Backend/vercel.json` — routes all requests to `server.js`
- `Backend/server.js` — exports `module.exports = app` at the bottom

### Step 2 — Deploy from Backend directory

```bash
cd Backend
vercel
```

Follow the prompts:
- Link to existing project or create new → **Create new**
- Project name → e.g., `rabbit-backend`
- Root directory → press Enter (current dir)
- Framework preset → **Other**
- Build command → leave blank (press Enter)
- Output directory → leave blank (press Enter)
- Override development command → **No**

### Step 3 — Add Environment Variables in Vercel Dashboard

Go to your Vercel project → **Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `NODE_ENV` | `production` |

### Step 4 — Redeploy with env vars

```bash
vercel --prod
```

Copy the deployment URL, e.g., `https://rabbit-backend.vercel.app`

---

## 2. Deploy the Frontend

### Step 1 — Set backend URL

In `Frontend/.env` (create if not exists):

```env
VITE_BACKEND_URL=https://rabbit-backend.vercel.app
```

### Step 2 — Deploy from Frontend directory

```bash
cd Frontend
vercel
```

Follow the prompts:
- Project name → e.g., `rabbit-frontend`
- Framework preset → **Vite** (auto-detected)
- Build command → `npm run build` (auto-detected)
- Output directory → `dist` (auto-detected)

### Step 3 — Add Environment Variables

Go to Frontend Vercel project → **Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_BACKEND_URL` | `https://rabbit-backend.vercel.app` |

### Step 4 — Deploy to production

```bash
vercel --prod
```

Your frontend will be live at `https://rabbit-frontend.vercel.app`

---

## 3. Update CORS on Backend

After deploying, update `Backend/server.js` CORS config to allow your frontend domain:

```js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://rabbit-frontend.vercel.app',
    // add any custom domain here
  ],
  credentials: true,
}));
```

Then redeploy the backend: `vercel --prod` from the `Backend/` folder.

---

## 4. Seeding the Database (Optional)

To seed products and admin user in production:

```bash
cd Backend
node seeder.js
```

Default admin credentials after seeding:
- Email: `admin@example.com`
- Password: `123456`

---

## 5. Architecture on Vercel

```
User Browser
    │
    ├─ Frontend (Vite React SPA) ─── Vercel Edge Network
    │     vercel.json: all routes → /index.html (SPA support)
    │
    └─ Backend (Express API) ─── Vercel Serverless Functions
          vercel.json: all requests → server.js via @vercel/node
          MongoDB Atlas ← connected via MONGO_URI
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Add frontend URL to backend CORS whitelist |
| 404 on refresh | Frontend `vercel.json` rewrites all paths to index.html ✓ |
| Env vars not loading | Redeploy after adding env vars in Vercel dashboard |
| MongoDB timeout | Whitelist `0.0.0.0/0` in Atlas Network Access |
| Cold start delays | Normal for serverless — first request takes ~2s |
