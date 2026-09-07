# Gyanivo AI — SIH26101 Deployment Guide

## 🚀 Complete Deployment in 3 Steps (Free)

### Architecture
```
Vercel (Next.js Frontend)  ←→  Railway (NestJS API + PostgreSQL)
                                         ↕
                       Hugging Face Spaces (FastAPI ML Service)
```

---

## STEP 1: Push to GitHub

```bash
# Open terminal in project root (Gyanivo AI folder)
git init
git add .
git commit -m "feat: Gyanivo AI SIH26101 complete prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gyanivo-ai.git
git push -u origin main
```

---

## STEP 2: Deploy Backend on Railway (Free)

1. Go to → **https://railway.app** → Login with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your `gyanivo-ai` repo
4. Click **"Add Service"** → **"Database"** → **"PostgreSQL"**
   - Copy the `DATABASE_URL` from Railway PostgreSQL dashboard

5. Go back to your API service → **Variables** tab → Add these:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | (paste from PostgreSQL service) |
   | `JWT_SECRET` | `gyanivo-sih26101-enterprise-secret-2026` |
   | `JWT_REFRESH_SECRET` | `gyanivo-sih26101-refresh-2026` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://gyanivo-ai.vercel.app` |

6. Under **Settings** → set **Root Directory** = `api`
7. Railway auto-detects and builds! It runs: `npx prisma migrate deploy && node dist/main`
8. Copy your Railway URL → e.g. `https://gyanivo-api.up.railway.app`

---
 
## STEP 2.5: Deploy ML Service on Hugging Face Spaces (Free 24/7)
 
1. Go to → **https://huggingface.co/spaces** → Click **"Create new Space"**
2. Settings:
   - **Space name**: `gyanivo-ml`
   - **License**: MIT
   - **Select the Space SDK**: **Docker** -> **Blank**
   - **Space Hardware**: CPU Basic (Free)
   - Click **"Create Space"**
3. Push or upload your `ml-service` files to the Space repo:
   ```bash
   cd "ml-service"
   git init
   git remote add space https://huggingface.co/spaces/YOUR_HF_USERNAME/gyanivo-ml
   git add .
   git commit -m "feat: deploy Gyanivo AI ML engine"
   git push --force space main
   ```
4. Space will build automatically using the [Dockerfile](file:///c:/Users/Krishna/Desktop/Gyanivo%20AI/ml-service/Dockerfile) & [README.md](file:///c:/Users/Krishna/Desktop/Gyanivo%20AI/ml-service/README.md) we prepared!
5. Once running, copy your Space URL:
   `https://YOUR_HF_USERNAME-gyanivo-ml.hf.space`
6. In Railway API variables, add:
   `ML_SERVICE_URL=https://YOUR_HF_USERNAME-gyanivo-ml.hf.space`
 
---

## STEP 3: Deploy Frontend on Vercel (Free)

1. Go to → **https://vercel.com** → Login with GitHub
2. Click **"New Project"** → Import your `gyanivo-ai` repo
3. Set:
   - **Root Directory**: `web`
   - **Framework**: Next.js (auto-detected)
4. Under **Environment Variables**:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://gyanivo-api.up.railway.app` |

5. Click **Deploy** → Done in ~2 minutes ✅

---

## STEP 4: Seed the Database (One Time)

After Railway backend is live, open Railway **Shell**:

```bash
npx prisma db push
npx prisma db seed
```

This creates:
- Admin account: `admin@mospi.gov.in` / `Admin@2026`
- Employee account: `ramesh.kumar@mospi.gov.in` / `Employee@2026`
- Trainer account: `trainer@mospi.gov.in` / `Trainer@2026`
- Full competency framework, job roles, departments
- Course catalog (iGOT + NSSTA courses with semantic mappings)
- Assessment question bank (60 questions)

---

## Demo URLs after deployment

| Page | URL |
|---|---|
| Login | `https://gyanivo-ai.vercel.app/login` |
| Employee Dashboard | `https://gyanivo-ai.vercel.app/employee/dashboard` |
| Skill Gaps | `https://gyanivo-ai.vercel.app/employee/skill-gaps` |
| Course Catalog | `https://gyanivo-ai.vercel.app/employee/courses` |
| Learning Path | `https://gyanivo-ai.vercel.app/employee/learning-path` |
| Adaptive Assessment | `https://gyanivo-ai.vercel.app/employee/assessments` |
| Admin Dashboard | `https://gyanivo-ai.vercel.app/admin/dashboard` |
| Admin Role Matrix | `https://gyanivo-ai.vercel.app/admin/role-matrix` |

---

## For College Competition Demo Script

1. Open **Employee login** → show Dashboard with real competency scores
2. Show **Skill Gaps** page → automatic gap calculation
3. Show **Course Recommendations** → AI-ranked with explainable reasons
4. Show **Learning Path** → sequenced milestone roadmap
5. Start an **Adaptive Assessment** → live BKT scoring
6. Switch to **Admin** → show Role Matrix, Course Catalog with semantic mappings
7. Show **ML API** → https://gyanivo-api.up.railway.app/docs (FastAPI Swagger)

---

## Troubleshooting

**Frontend shows "Network Error":**
- Check `NEXT_PUBLIC_API_BASE_URL` is set correctly on Vercel
- Backend must be running on Railway

**Login fails:**
- Run seed command in Railway shell
- Check `DATABASE_URL` is set

**CORS error in browser:**
- Add Vercel URL to `FRONTEND_URL` on Railway variables
