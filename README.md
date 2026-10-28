# AI Tool Scout 🔍

**AI Tool Scout** is a modern, high-performance web directory for discovering, comparing, and evaluating verified Artificial Intelligence software. Built with vanilla HTML5, CSS3, and JavaScript, designed for 100% free hosting on **Cloudflare Pages** and automated continuous delivery via **GitHub Actions**.

![AI Tool Scout Banner](https://img.shields.io/badge/Hosting-Cloudflare%20Pages%20(Free)-f38020?style=for-the-badge&logo=cloudflare)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions%20(Free)-2088FF?style=for-the-badge&logo=github-actions)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🌟 Key Features

- **Dark Navy SaaS Aesthetics**: Polished UI with glassmorphic sticky header, vibrant indigo and violet accents, modern typography, responsive cards, and smooth micro-interactions.
- **Zero Cost Stack ($0)**: Static HTML generation, zero mandatory backend, zero paid databases, and zero required AI API subscriptions.
- **Instant Client-Side Search & Filters**: Live searching across names, tags, and descriptions with keyboard shortcut (`/` to search, `Escape` to clear).
- **Multi-Dimension Filtering & Sorting**: Filter by 5 core disciplines (AI Writing, AI Image, AI Video, AI Coding, AI Productivity) and pricing models (Free, Freemium, Paid).
- **Authentic Free-Tier Verification**: Every profile documents verifiable monthly query limits, token caps, and trial durations. Zero synthetic reviews or fabricated pricing.
- **Dynamic & Curated Comparisons**: Interactive comparator allowing side-by-side spec sheets for any 2 tools, plus pre-rendered SEO comparison pages.
- **Bookmarking Engine**: Save favorite tools locally in browser storage with instant UI sync.
- **Ethical Affiliate & Ad Architecture**: Configurable affiliate URLs with automatic `nofollow` and disclosure badges; fallback direct links to official sites; optional disabled-by-default ad placeholder.
- **Full SEO Suite**: Valid `sitemap.xml`, `robots.txt`, Open Graph social tags, semantic HTML, and `SoftwareApplication` JSON-LD structured data.

---

## 📁 Project Architecture

```
d:\AI\TECHNOLOGY\
├── .github\
│   └── workflows\
│       ├── validate-catalogue.yml     # Schema validation, security tests, and build check
│       ├── scheduled-link-health.yml  # Conservative weekly link monitor & report generator
│       └── draft-content-generator.yml# Draft scaffolding PR workflow
├── data\
│   ├── tools.json                    # Canonical verified tools catalogue
│   ├── categories.json               # Categories metadata & icons
│   └── comparisons.json              # Curated comparison presets
├── src\
│   ├── css\
│   │   ├── style.css                 # Global design system & typography tokens
│   │   └── components.css            # Tool cards, search, filters, modals, tables
│   └── js\
│       ├── app.js                    # Nav drawer, bookmarks, modals, toasts, XSS protection
│       ├── search.js                 # Instant search, filter chips, keyboard shortcuts
│       └── compare.js                # Dynamic two-tool comparator engine
├── templates\
│   └── tool-submission-template.md   # Editorial review schema & verification checklist
├── scripts\
│   ├── build.js                      # Static site generator (compiles data to dist/)
│   ├── validate.js                   # Validates schema and detects duplicate entries
│   ├── check-links.js                # Conservative link health checker
│   ├── generate-draft.js             # CLI draft generator for new tool entries
│   └── dev-server.js                 # Zero-dependency local development preview server
├── tests\
│   ├── validate-catalogue.test.js    # Data integrity & schema test suite
│   └── build-integrity.test.js       # Build output, security & XSS tests
├── docs\
│   ├── WORKFLOWS.md                  # GitHub Actions workflow management
│   ├── CLOUDFLARE_PAGES_DEPLOYMENT.md# Complete deployment guide
│   └── AFFILIATE_SETUP.md            # Monetization & partner configuration
├── dist\                             # Production output ready for Cloudflare Pages
├── package.json
└── README.md
```

---

## 🚀 Quickstart (Windows PowerShell)

### 1. Run Data Validation
```powershell
npm run validate
```

### 2. Run Automated Test Suite
```powershell
npm test
```

### 3. Build Static Production Site
```powershell
npm run build
```

### 4. Start Local Development Server
```powershell
npm start
```
Open **http://localhost:3000** in your browser to explore the website.

### 5. Check Official Link Health
```powershell
npm run check-links
```

### 6. Scaffold a New Verified Tool Draft
```powershell
node scripts/generate-draft.js "Krea AI" "ai-image" "https://krea.ai"
```

---

## 🚢 Cloudflare Pages Deployment Summary

1. Push your repository to GitHub:
   ```powershell
   git init
   git add .
   git commit -m "feat: initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ai-tool-scout.git
   git push -u origin main
   ```
2. In Cloudflare Dashboard > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Set **Build command**: `npm run build`
4. Set **Build output directory**: `dist`
5. Click **Save and Deploy**. Your site goes live at `https://ai-tool-scout.pages.dev` with automatic deployment on every push!

Read [CLOUDFLARE_PAGES_DEPLOYMENT.md](docs/CLOUDFLARE_PAGES_DEPLOYMENT.md) for full instructions.

---

## ⚖️ Editorial Policy & Disclosure

AI Tool Scout operates under strict editorial independence. Tools are evaluated by practitioner standards. We do not accept payment to falsify reviews, alter rating criteria, or conceal product limitations. For details, see [docs/AFFILIATE_SETUP.md](docs/AFFILIATE_SETUP.md) and `/disclosure.html`.
