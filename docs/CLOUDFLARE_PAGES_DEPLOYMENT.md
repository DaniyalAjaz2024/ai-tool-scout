# AI Tool Scout - Cloudflare Pages Deployment Guide

This guide walks you through deploying **AI Tool Scout** to **Cloudflare Pages** for 100% free hosting with automatic continuous deployment on every Git push.

---

## 1. Prerequisites (Free Tier)
- A free **GitHub Account** (https://github.com)
- A free **Cloudflare Account** (https://dash.cloudflare.com)
- No credit card is required. Cloudflare Pages offers unlimited bandwidth, free SSL, and 500 builds per month on the free tier.

---

## 2. GitHub Repository Setup

Open **Windows PowerShell** in the project directory (`d:\AI\TECHNOLOGY`) and run:

```powershell
# 1. Initialize local git repository
git init

# 2. Add all files to version control
git add .

# 3. Create initial commit
git commit -m "feat: complete initial build of AI Tool Scout directory"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub repository (replace with your actual GitHub username and repo)
git remote add origin https://github.com/YOUR_USERNAME/ai-tool-scout.git

# 6. Push to GitHub
git push -u origin main
```

---

## 3. Connecting GitHub to Cloudflare Pages

1. Log into your **Cloudflare Dashboard** at https://dash.cloudflare.com.
2. In the left navigation menu, click **Workers & Pages**.
3. Click the blue **Create application** button.
4. Select the **Pages** tab, then click **Connect to Git**.
5. Select your GitHub account and authorize Cloudflare to access your `ai-tool-scout` repository.
6. Click **Begin setup**.

---

## 4. Build Configuration Settings

On the setup screen, enter the following exact settings:

| Setting Field | Value | Notes |
| :--- | :--- | :--- |
| **Project Name** | `ai-tool-scout` | Will create `https://ai-tool-scout.pages.dev` |
| **Production Branch** | `main` | Deploys live on push to `main` |
| **Framework Preset** | `None` | (Do not choose Next.js/Vite; our builder is zero-dependency) |
| **Build Command** | `npm run build` | Compiles data and assets into `dist/` |
| **Build Output Directory** | `dist` | Cloudflare will serve all files from here |
| **Root Directory** | `/` (leave empty) | Top level of repository |

### Environment Variables:
- No environment variables are required for basic deployment.
- (Optional) Set `NODE_VERSION` to `22` in **Environment Variables** if prompted.

Click **Save and Deploy**.

---

## 5. Automatic Continuous Deployment

- Every time you push a change to the `main` branch:
  ```powershell
  git add .
  git commit -m "update: add verified tool entry"
  git push
  ```
- Cloudflare Pages will automatically detect the commit, run `npm run build`, and deploy the updated static website globally across Cloudflare's edge network within ~30 seconds.
- Every Pull Request automatically gets its own **Preview URL** so you can review changes before merging.

---

## 6. Custom Domain (Optional & Free)
1. In Cloudflare Pages, go to your project > **Custom domains**.
2. Click **Set up a custom domain**.
3. Enter your domain (e.g. `aitoolscout.com`).
4. Cloudflare automatically generates and renews a free TLS/SSL certificate.

---

## 7. Google Search Console Verification
1. Once deployed, go to https://search.google.com/search-console.
2. Add your property (e.g. `https://ai-tool-scout.pages.dev`).
3. Choose the **HTML Tag** or **Cloudflare DNS** verification method.
4. Submit your sitemap: `https://ai-tool-scout.pages.dev/sitemap.xml`.
