/**
 * AI Tool Scout - Static Site Generator
 * Compiles data/ into 100% pre-rendered static HTML, sitemap.xml, and robots.txt.
 * Zero external dependencies. Fast, accessible, SEO-optimized, Cloudflare Pages ready.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalogue } from './validate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Site Config
const SITE = {
  name: 'AI Tool Scout',
  title: 'AI Tool Scout | Verified Directory of Modern AI Tools',
  tagline: 'Discover, Compare, and Choose Verified AI Tools',
  description: 'The curated, independently verified directory of artificial intelligence tools. Real pricing, verified free tiers, and authentic comparisons with zero fake reviews.',
  url: 'https://aitoolscout.pages.dev', // Default Cloudflare Pages domain placeholder
  author: 'AI Tool Scout Editorial Team'
};

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getCategoryIconSvg(iconName) {
  switch (iconName) {
    case 'pen-tool':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`;
    case 'image':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
    case 'video':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;
    case 'code':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
    case 'zap':
    default:
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
  }
}

function renderHeader(activePage = '') {
  return `
  <header class="site-header">
    <div class="container nav-wrapper">
      <a href="/" class="brand-logo" aria-label="AI Tool Scout Home">
        <div class="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
        </div>
        <span>AI Tool <span class="gradient-text">Scout</span></span>
      </a>

      <nav aria-label="Main Navigation">
        <ul class="nav-links">
          <li><a href="/" class="nav-link ${activePage === 'home' ? 'active' : ''}">Explore Tools</a></li>
          <li><a href="/categories/index.html" class="nav-link ${activePage === 'categories' ? 'active' : ''}">Categories</a></li>
          <li><a href="/compare/index.html" class="nav-link ${activePage === 'compare' ? 'active' : ''}">Compare</a></li>
          <li><a href="/about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About & Integrity</a></li>
          <li><a href="/contact.html" class="nav-link ${activePage === 'contact' ? 'active' : ''}">Contact</a></li>
        </ul>
      </nav>

      <div class="nav-actions">
        <button class="btn-icon" data-modal-open="saved-tools-modal" title="View Saved Tools" aria-label="Saved Tools">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button class="btn btn-primary btn-sm" data-modal-open="submit-tool-modal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Submit Tool
        </button>
        <button class="btn-icon mobile-toggle" id="mobile-nav-toggle" aria-label="Toggle Navigation Menu" aria-expanded="false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <div class="mobile-nav-drawer" id="mobile-nav-drawer">
    <ul class="mobile-nav-links">
      <li><a href="/" class="${activePage === 'home' ? 'active' : ''}">Explore Tools</a></li>
      <li><a href="/categories/index.html" class="${activePage === 'categories' ? 'active' : ''}">Categories Hub</a></li>
      <li><a href="/compare/index.html" class="${activePage === 'compare' ? 'active' : ''}">Compare AI Tools</a></li>
      <li><a href="/about.html" class="${activePage === 'about' ? 'active' : ''}">About & Methodology</a></li>
      <li><a href="/contact.html" class="${activePage === 'contact' ? 'active' : ''}">Contact & Submit</a></li>
      <li><a href="/disclosure.html">Affiliate Disclosure</a></li>
    </ul>
    <div style="margin-top: auto;">
      <button class="btn btn-primary" style="width: 100%;" data-modal-open="submit-tool-modal">
        Submit an AI Tool
      </button>
    </div>
  </div>
  `;
}

function renderFooter() {
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-disclosure">
        <strong>Affiliate & Advertising Transparency Disclosure:</strong> AI Tool Scout is independently owned and operated. Some of the outbound links to software providers on this site may be affiliate links. If you click an affiliate link and make a purchase, we may receive a commission at no additional cost to you. This does not influence our editorial assessments, pricing verifications, or tool inclusion criteria. We do not accept payment to falsify reviews or conceal product limitations. <a href="/disclosure.html" style="color: var(--accent-cyan); text-decoration: underline;">Read our complete disclosure policy</a>.
      </div>

      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand-logo">
            <div class="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
            </div>
            <span>AI Tool Scout</span>
          </div>
          <p>The curated directory of artificial intelligence software. Tested by practitioners, verified with authentic pricing, and maintained without paid bias.</p>
        </div>

        <div class="footer-col">
          <h4>Directory Categories</h4>
          <ul class="footer-links">
            <li><a href="/category/ai-writing.html">AI Writing Assistants</a></li>
            <li><a href="/category/ai-image.html">AI Image Generation</a></li>
            <li><a href="/category/ai-video.html">AI Video & Avatars</a></li>
            <li><a href="/category/ai-coding.html">AI Code Assistants</a></li>
            <li><a href="/category/ai-productivity.html">AI Productivity & Notes</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Popular Comparisons</h4>
          <ul class="footer-links">
            <li><a href="/compare/cursor-vs-github-copilot.html">Cursor vs GitHub Copilot</a></li>
            <li><a href="/compare/chatgpt-vs-claude.html">ChatGPT vs Claude</a></li>
            <li><a href="/compare/midjourney-vs-stable-diffusion.html">Midjourney vs Stable Diffusion</a></li>
            <li><a href="/compare/notion-ai-vs-perplexity.html">Notion AI vs Perplexity</a></li>
            <li><a href="/compare/index.html">Interactive Tool Comparator</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Trust & Legal</h4>
          <ul class="footer-links">
            <li><a href="/about.html">About AI Tool Scout</a></li>
            <li><a href="/contact.html">Contact Editorial Desk</a></li>
            <li><a href="/disclosure.html">Affiliate Disclosure</a></li>
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="/terms.html">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} AI Tool Scout. All rights reserved. Zero fake reviews.</p>
        <p>Built for zero-cost static hosting on Cloudflare Pages.</p>
      </div>
    </div>
  </footer>

  <!-- Submit Tool Modal -->
  <div class="modal-overlay" id="submit-tool-modal" aria-hidden="true" role="dialog">
    <div class="modal-card">
      <button class="modal-close-btn" data-modal-close aria-label="Close dialog">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem;">Submit an AI Tool for Verification</h3>
      <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
        We review all submissions against public documentation. Submissions with fabricated free tiers or fake pricing will be rejected.
      </p>

      <form id="submit-tool-form">
        <!-- Honeypot field for anti-spam bots -->
        <input type="text" name="website_hp" style="display:none !important;" tabindex="-1" autocomplete="off">

        <div class="form-group">
          <label class="form-label" for="sub-name">Tool Name *</label>
          <input type="text" id="sub-name" class="form-control" placeholder="e.g. Cursor" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="sub-url">Official Website URL *</label>
          <input type="url" id="sub-url" class="form-control" placeholder="https://example.com" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="sub-cat">Category *</label>
          <select id="sub-cat" class="form-control" required>
            <option value="ai-writing">AI Writing</option>
            <option value="ai-image">AI Image</option>
            <option value="ai-video">AI Video</option>
            <option value="ai-coding">AI Coding</option>
            <option value="ai-productivity">AI Productivity</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="sub-free">Free Tier or Free Trial Details *</label>
          <textarea id="sub-free" class="form-control" placeholder="Detail the exact limits, queries per month, or trial duration..." required></textarea>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">
          Submit for Editorial Review
        </button>
      </form>
    </div>
  </div>

  <!-- Saved Tools Modal -->
  <div class="modal-overlay" id="saved-tools-modal" aria-hidden="true" role="dialog">
    <div class="modal-card">
      <button class="modal-close-btn" data-modal-close aria-label="Close dialog">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem;">Your Bookmarked AI Tools</h3>
      <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
        Tools you save using the heart icon are stored locally on your device for fast reference.
      </p>
      <div id="saved-tools-list" style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 320px; overflow-y: auto;">
        <p style="color: var(--text-muted); font-size: 0.875rem; text-align: center; padding: 2rem 0;">No tools saved yet. Click the heart icon on any tool card to bookmark it!</p>
      </div>
    </div>
  </div>
  `;
}

function renderHtmlDocument({ title, description, canonicalPath, content, activePage = '', structuredData = null }) {
  const canonicalUrl = `${SITE.url}${canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath}`;
  const jsonLd = structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph / Social Sharing -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHTML(title)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="${SITE.name}">

  <!-- Twitter Meta -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(title)}">
  <meta name="twitter:description" content="${escapeHTML(description)}">

  <!-- Typography: Google Fonts Inter & Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">

  <!-- Core Stylesheets -->
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/components.css">

  ${jsonLd}
</head>
<body>
  ${renderHeader(activePage)}

  <main id="main-content">
    ${content}
  </main>

  ${renderFooter()}

  <!-- Global Client App Script -->
  <script type="module" src="/js/app.js"></script>
</body>
</html>`;
}

function renderToolCard(tool) {
  const pricingBadgeClass = tool.pricingType === 'Free' ? 'badge-free' : tool.pricingType === 'Freemium' ? 'badge-freemium' : 'badge-paid';
  const outboundUrl = tool.affiliateUrl || tool.officialUrl;
  const isAffiliate = Boolean(tool.affiliateUrl);

  return `
  <article class="tool-card"
    data-tool-id="${escapeHTML(tool.id)}"
    data-tool-name="${escapeHTML(tool.name)}"
    data-tool-category="${escapeHTML(tool.category)}"
    data-tool-pricing="${escapeHTML(tool.pricingType)}"
    data-tool-tagline="${escapeHTML(tool.tagline)}"
    data-tool-tags="${escapeHTML(tool.tags.join(' '))}"
    data-tool-featured="${tool.featured}"
    data-tool-date="${escapeHTML(tool.lastVerified)}">

    <div class="tool-card-header">
      <div class="tool-title-group">
        <div class="tool-avatar">
          ${escapeHTML(tool.name.substring(0, 2).toUpperCase())}
        </div>
        <div class="tool-name-container">
          <h3 class="tool-name">
            <a href="/tool/${escapeHTML(tool.slug)}.html">${escapeHTML(tool.name)}</a>
            <span class="badge badge-verified" title="Verified by AI Tool Scout on ${tool.lastVerified}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Verified
            </span>
          </h3>
          <span class="tool-category-badge">${escapeHTML(tool.category.toUpperCase().replace('-', ' '))}</span>
        </div>
      </div>

      <button class="bookmark-btn" data-bookmark-id="${escapeHTML(tool.id)}" aria-label="Bookmark ${escapeHTML(tool.name)}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>

    <p class="tool-tagline">${escapeHTML(tool.tagline)}</p>

    ${tool.hasFreeTier && tool.freePlanDetails ? `
    <div class="tool-free-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span><strong>Verified Free Tier:</strong> ${escapeHTML(tool.freePlanDetails)}</span>
    </div>
    ` : ''}

    <div class="tool-tags">
      ${tool.tags.slice(0, 3).map(tag => `<span class="tool-tag">${escapeHTML(tag)}</span>`).join('')}
    </div>

    <div class="tool-card-footer">
      <div class="tool-pricing-info">
        <span class="pricing-label">Starting Price</span>
        <span class="pricing-value">
          <span class="badge ${pricingBadgeClass}">${escapeHTML(tool.pricingType)}</span>
          ${escapeHTML(tool.startingPrice)}
        </span>
      </div>

      <div class="tool-card-actions">
        <a href="/tool/${escapeHTML(tool.slug)}.html" class="btn btn-secondary btn-sm">Specs</a>
        <a href="${escapeHTML(outboundUrl)}" target="_blank" rel="noopener noreferrer nofollow" class="btn btn-primary btn-sm">
          Visit
          ${isAffiliate ? '<span class="badge badge-affiliate" title="Affiliate Link">Ad</span>' : ''}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
          </svg>
        </a>
      </div>
    </div>
  </article>
  `;
}

export function buildStaticSite() {
  console.log('🚀 Starting AI Tool Scout build process...');

  // 1. Validate data integrity
  const validation = validateCatalogue();
  if (!validation.valid) {
    console.error('Build aborted due to catalogue validation errors:');
    validation.errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  // Ensure clean dist directories
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
  ['css', 'js', 'categories', 'category', 'tool', 'compare', 'data'].forEach(sub => {
    const p = path.join(DIST_DIR, sub);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  });

  // Read data
  const tools = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'tools.json'), 'utf8'));
  const categories = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'categories.json'), 'utf8'));
  const comparisons = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'comparisons.json'), 'utf8'));

  // Calculate tool counts per category
  categories.forEach(cat => {
    cat.toolsCount = tools.filter(t => t.category === cat.id).length;
  });

  // Copy CSS and JS static files
  fs.copyFileSync(path.join(ROOT_DIR, 'src', 'css', 'style.css'), path.join(DIST_DIR, 'css', 'style.css'));
  fs.copyFileSync(path.join(ROOT_DIR, 'src', 'css', 'components.css'), path.join(DIST_DIR, 'css', 'components.css'));
  fs.copyFileSync(path.join(ROOT_DIR, 'src', 'js', 'app.js'), path.join(DIST_DIR, 'js', 'app.js'));
  fs.copyFileSync(path.join(ROOT_DIR, 'src', 'js', 'search.js'), path.join(DIST_DIR, 'js', 'search.js'));
  fs.copyFileSync(path.join(ROOT_DIR, 'src', 'js', 'compare.js'), path.join(DIST_DIR, 'js', 'compare.js'));

  // Copy data JSON for dynamic client-side interactions
  fs.writeFileSync(path.join(DIST_DIR, 'data', 'tools.json'), JSON.stringify(tools, null, 2), 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'data', 'categories.json'), JSON.stringify(categories, null, 2), 'utf8');

  const sitemapUrls = [];

  // ==========================================
  // PAGE 1: Home Page (index.html)
  // ==========================================
  const homeContent = `
  <section class="hero-section">
    <div class="hero-glow"></div>
    <div class="container">
      <div class="hero-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        100% Manually Verified & Audited Pricing
      </div>
      <h1 class="hero-title">
        Discover Verified <span class="gradient-text">AI Tools</span> for Serious Builders
      </h1>
      <p class="hero-subtitle">
        Independent directory comparing pricing tiers, authentic free quotas, and real developer workflows. Zero synthetic reviews.
      </p>

      <!-- Instant Search Bar -->
      <div class="search-container">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" id="search-input" class="search-input" placeholder="Search by tool name, feature, or keyword (e.g. 'code completion', 'avatars')..." aria-label="Search tools">
          <button id="search-clear-btn" class="search-clear-btn" aria-label="Clear search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <span class="search-shortcut" title="Press / anywhere on the page to search">/</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Optional Advertising Integration Placeholder (Disabled by default per prompt) -->
  <div class="container">
    <aside class="ad-slot-placeholder" id="home-banner-ad" aria-label="Sponsored Partner Slot">
      <div class="ad-slot-label">Sponsored Partner Notice</div>
      <p style="font-size: 0.8125rem; color: var(--text-muted); margin: 0;">
        Advertising placeholder slot. Disabled by default. Contact our team for ethical sponsorship inquiries.
      </p>
    </aside>
  </div>

  <section class="container" style="padding-bottom: 5rem;">
    <!-- Interactive Filter & Sort Bar -->
    <div class="filters-bar">
      <div class="filters-row">
        <div class="filter-group">
          <span class="filter-label">Category:</span>
          <button class="filter-chip active" data-category-filter="all">All (${tools.length})</button>
          ${categories.map(c => `
            <button class="filter-chip" data-category-filter="${c.id}">${c.name} (${c.toolsCount})</button>
          `).join('')}
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <label for="sort-select" class="filter-label" style="display: inline-block;">Sort By:</label>
          <select id="sort-select" class="sort-select">
            <option value="featured">Featured First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="newest">Recently Verified</option>
          </select>
        </div>
      </div>

      <div class="filters-row" style="border-top: 1px solid var(--border-subtle); padding-top: 0.85rem;">
        <div class="filter-group">
          <span class="filter-label">Pricing Plan:</span>
          <button class="filter-chip active" data-pricing-filter="all">Any Pricing</button>
          <button class="filter-chip" data-pricing-filter="Free">100% Free</button>
          <button class="filter-chip" data-pricing-filter="Freemium">Freemium (Free Tier)</button>
          <button class="filter-chip" data-pricing-filter="Paid">Paid / Trial</button>
        </div>

        <div id="results-count" style="font-size: 0.8125rem; color: var(--text-muted);">
          Showing ${tools.length} verified tools
        </div>
      </div>
    </div>

    <!-- Live Tools Grid -->
    <div class="tools-grid" id="tools-grid">
      ${tools.map(renderToolCard).join('')}
    </div>

    <!-- Empty State -->
    <div class="empty-results" id="empty-search-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 1rem; color: var(--text-muted);">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">No AI tools match your current search criteria</h3>
      <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.5rem;">
        Try adjusting your keywords, selecting a different category, or resetting all filters.
      </p>
      <button class="btn btn-secondary btn-sm" id="reset-filters-btn">Reset All Filters</button>
    </div>

    <!-- Categories Section -->
    <div style="margin-top: 4rem; padding-top: 3rem; border-top: 1px solid var(--border-subtle);">
      <div style="text-align: center; margin-bottom: 2.5rem;">
        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Explore AI by Core Discipline</h2>
        <p style="color: var(--text-secondary);">Browse dedicated hubs with specialized feature matrices.</p>
      </div>

      <div class="categories-grid">
        ${categories.map(cat => `
          <a href="/category/${cat.slug}.html" class="category-card">
            <div class="category-icon-box" style="background: rgba(${cat.accentColor === '#38bdf8' ? '56,189,248' : cat.accentColor === '#ec4899' ? '236,72,153' : cat.accentColor === '#8b5cf6' ? '139,92,246' : cat.accentColor === '#10b981' ? '16,185,129' : '245,158,11'}, 0.15); color: ${cat.accentColor};">
              ${getCategoryIconSvg(cat.icon)}
            </div>
            <h3 class="category-title">${escapeHTML(cat.name)}</h3>
            <p class="category-desc">${escapeHTML(cat.tagline)}</p>
            <span style="font-size: 0.8125rem; color: var(--accent-cyan); font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem;">
              View ${cat.toolsCount} Tools
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </a>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Client-side script for home search -->
  <script type="module" src="/js/search.js"></script>
  `;

  const homeHtml = renderHtmlDocument({
    title: SITE.title,
    description: SITE.description,
    canonicalPath: '/',
    content: homeContent,
    activePage: 'home'
  });

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), homeHtml, 'utf8');
  sitemapUrls.push({ loc: '/', priority: '1.0' });

  // ==========================================
  // PAGE 2: Categories Hub (/categories/index.html)
  // ==========================================
  const categoriesHubContent = `
  <section class="hero-section" style="padding: 3.5rem 0 2.5rem;">
    <div class="container">
      <div class="breadcrumbs" style="justify-content: center;">
        <a href="/">Home</a> <span>/</span> <span>Categories Hub</span>
      </div>
      <h1 class="hero-title">AI Tool Categories</h1>
      <p class="hero-subtitle">
        Browse curated artificial intelligence solutions organized by practical domain and verified capability.
      </p>
    </div>
  </section>

  <section class="container" style="padding-bottom: 5rem;">
    <div class="categories-grid">
      ${categories.map(cat => `
        <div class="category-card">
          <div class="category-icon-box" style="background: rgba(${cat.accentColor === '#38bdf8' ? '56,189,248' : cat.accentColor === '#ec4899' ? '236,72,153' : cat.accentColor === '#8b5cf6' ? '139,92,246' : cat.accentColor === '#10b981' ? '16,185,129' : '245,158,11'}, 0.15); color: ${cat.accentColor};">
            ${getCategoryIconSvg(cat.icon)}
          </div>
          <h2 class="category-title" style="font-size: 1.35rem;">
            <a href="/category/${cat.slug}.html">${escapeHTML(cat.name)}</a>
          </h2>
          <p class="category-desc">${escapeHTML(cat.description)}</p>
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.8125rem; color: var(--text-muted);">${cat.toolsCount} Verified Tools</span>
            <a href="/category/${cat.slug}.html" class="btn btn-secondary btn-sm">Explore Category</a>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  `;

  const categoriesHubHtml = renderHtmlDocument({
    title: 'Browse AI Tool Categories | AI Tool Scout',
    description: 'Explore artificial intelligence tools organized by Writing, Image generation, Video creation, Coding assistants, and Productivity.',
    canonicalPath: '/categories/index.html',
    content: categoriesHubContent,
    activePage: 'categories'
  });

  fs.writeFileSync(path.join(DIST_DIR, 'categories', 'index.html'), categoriesHubHtml, 'utf8');
  sitemapUrls.push({ loc: '/categories/index.html', priority: '0.8' });

  // ==========================================
  // PAGE 3: Individual Category Detail Pages (/category/[slug].html)
  // ==========================================
  categories.forEach(cat => {
    const catTools = tools.filter(t => t.category === cat.id);
    const catContent = `
    <section class="hero-section" style="padding: 3.5rem 0 2.5rem;">
      <div class="container">
        <div class="breadcrumbs" style="justify-content: center;">
          <a href="/">Home</a> <span>/</span> <a href="/categories/index.html">Categories</a> <span>/</span> <span>${escapeHTML(cat.name)}</span>
        </div>
        <h1 class="hero-title">${escapeHTML(cat.name)} Tools</h1>
        <p class="hero-subtitle">${escapeHTML(cat.description)}</p>
      </div>
    </section>

    <section class="container" style="padding-bottom: 5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem;">Verified ${escapeHTML(cat.name)} Directory (${catTools.length})</h2>
        <a href="/" class="btn btn-secondary btn-sm">&larr; Back to All Tools</a>
      </div>

      <div class="tools-grid">
        ${catTools.map(renderToolCard).join('')}
      </div>
    </section>
    `;

    const catHtml = renderHtmlDocument({
      title: `${cat.name} AI Tools - Verified Pricing & Real Benchmarks | AI Tool Scout`,
      description: `Curated directory of the best ${cat.name} software. Verified free plans, starting prices, and authentic feature comparisons.`,
      canonicalPath: `/category/${cat.slug}.html`,
      content: catContent,
      activePage: 'categories'
    });

    fs.writeFileSync(path.join(DIST_DIR, 'category', `${cat.slug}.html`), catHtml, 'utf8');
    sitemapUrls.push({ loc: `/category/${cat.slug}.html`, priority: '0.8' });
  });

  // ==========================================
  // PAGE 4: Tool Detail Pages (/tool/[slug].html)
  // ==========================================
  tools.forEach(tool => {
    const categoryObj = categories.find(c => c.id === tool.category) || { name: tool.category };
    const relatedTools = tools.filter(t => t.category === tool.category && t.id !== tool.id).slice(0, 3);
    const outboundUrl = tool.affiliateUrl || tool.officialUrl;
    const isAffiliate = Boolean(tool.affiliateUrl);

    // Schema.org SoftwareApplication JSON-LD
    const toolSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": tool.name,
      "description": tool.description,
      "applicationCategory": categoryObj.name,
      "operatingSystem": "Web, Windows, macOS, Linux",
      "offers": {
        "@type": "Offer",
        "price": tool.startingPrice === 'Free' || tool.startingPrice.includes('Free') ? '0' : tool.startingPrice.replace(/[^0-9.]/g, '') || '0',
        "priceCurrency": "USD",
        "priceValidUntil": "2026-12-31"
      }
    };

    const toolContent = `
    <section class="tool-detail-header">
      <div class="container">
        <div class="breadcrumbs">
          <a href="/">Home</a> <span>/</span>
          <a href="/category/${tool.category}.html">${escapeHTML(categoryObj.name)}</a> <span>/</span>
          <span>${escapeHTML(tool.name)}</span>
        </div>

        <div class="tool-hero-top">
          <div class="tool-title-group">
            <div class="tool-avatar" style="width: 3.5rem; height: 3.5rem; font-size: 1.5rem;">
              ${escapeHTML(tool.name.substring(0, 2).toUpperCase())}
            </div>
            <div>
              <h1 style="font-size: 2.25rem; display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                ${escapeHTML(tool.name)}
                <span class="badge badge-verified" style="font-size: 0.8125rem;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Verified Directory Entry
                </span>
              </h1>
              <p style="font-size: 1.125rem; color: var(--text-secondary); margin-top: 0.35rem;">
                ${escapeHTML(tool.tagline)}
              </p>
            </div>
          </div>

          <div class="tool-detail-actions">
            <button class="btn btn-secondary" data-bookmark-id="${escapeHTML(tool.id)}" aria-label="Bookmark this tool">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Save Tool
            </button>
            <button class="btn btn-secondary" data-share-url="${SITE.url}/tool/${tool.slug}.html" data-share-title="${escapeHTML(tool.name)} Review on AI Tool Scout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
            <a href="${escapeHTML(outboundUrl)}" target="_blank" rel="noopener noreferrer nofollow" class="btn btn-primary">
              Visit Official Website
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </a>
          </div>
        </div>

        ${isAffiliate ? `
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
          * Outbound links may include an affiliate tracking code. AI Tool Scout evaluates all tools under identical criteria regardless of referral agreements. <a href="/disclosure.html" style="text-decoration: underline;">Read disclosure</a>.
        </div>
        ` : ''}
      </div>
    </section>

    <div class="container tool-content-grid">
      <!-- Main Content Column -->
      <div class="tool-main-content">
        <!-- Overview & Description -->
        <section class="content-box">
          <h2>About ${escapeHTML(tool.name)}</h2>
          <p style="font-size: 1.0625rem; line-height: 1.7; color: var(--text-secondary); margin-bottom: 1.5rem;">
            ${escapeHTML(tool.description)}
          </p>

          <h3 style="font-size: 1.1875rem;">Verified Features</h3>
          <ul class="feature-list" style="margin-top: 1rem;">
            ${tool.verifiedFeatures.map(feat => `
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-emerald)">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>${escapeHTML(feat)}</span>
              </li>
            `).join('')}
          </ul>
        </section>

        <!-- Pros and Cons -->
        <section class="content-box">
          <h2>Pros & Cons Analysis</h2>
          <div class="pros-cons-grid">
            <div class="pros-box">
              <h3 style="color: var(--accent-emerald); font-size: 1.125rem; margin-bottom: 1rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Strengths
              </h3>
              <ul class="pro-con-list">
                ${tool.pros.map(p => `
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-emerald)"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>${escapeHTML(p)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="cons-box">
              <h3 style="color: var(--accent-amber); font-size: 1.125rem; margin-bottom: 1rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Trade-offs & Limits
              </h3>
              <ul class="pro-con-list">
                ${tool.cons.map(c => `
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-amber)"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <span>${escapeHTML(c)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </section>

        <!-- Related Tools in same category -->
        ${relatedTools.length > 0 ? `
        <section>
          <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">Alternative ${escapeHTML(categoryObj.name)} Tools</h2>
          <div class="tools-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
            ${relatedTools.map(renderToolCard).join('')}
          </div>
        </section>
        ` : ''}
      </div>

      <!-- Sidebar Column -->
      <aside class="tool-sidebar">
        <!-- Verified Free Tier Callout Box -->
        <div class="content-box" style="border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.04);">
          <h3 style="color: var(--accent-emerald); font-size: 1.125rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Verified Free Tier
          </h3>
          <p style="font-size: 0.9375rem; color: var(--text-primary); margin: 0.75rem 0 1rem; line-height: 1.5;">
            ${escapeHTML(tool.freePlanDetails || 'No perpetual free tier available. Check official trial terms.')}
          </p>
          <div style="font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid rgba(16, 185, 129, 0.2); padding-top: 0.75rem;">
            Last verified: <strong>${escapeHTML(tool.lastVerified)}</strong>
          </div>
        </div>

        <!-- Pricing Specifications -->
        <div class="content-box">
          <h3 style="font-size: 1.125rem;">Pricing Summary</h3>
          <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-top: 1rem;">
            <div>
              <span class="pricing-label">Billing Model</span>
              <div style="margin-top: 0.25rem;"><span class="badge ${tool.pricingType === 'Free' ? 'badge-free' : tool.pricingType === 'Freemium' ? 'badge-freemium' : 'badge-paid'}">${escapeHTML(tool.pricingType)}</span></div>
            </div>
            <div>
              <span class="pricing-label">Starting Price</span>
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${escapeHTML(tool.startingPrice)}</div>
            </div>
            <div>
              <span class="pricing-label">Ideal For</span>
              <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">${escapeHTML(tool.bestFor)}</div>
            </div>
          </div>

          <a href="${escapeHTML(outboundUrl)}" target="_blank" rel="noopener noreferrer nofollow" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;">
            Visit Official Site
          </a>
        </div>

        <!-- Quick Comparison Link -->
        <div class="content-box">
          <h3 style="font-size: 1.125rem;">Compare ${escapeHTML(tool.name)}</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Evaluate ${escapeHTML(tool.name)} against other tools in our dynamic comparator.
          </p>
          <a href="/compare/index.html?toolA=${encodeURIComponent(tool.id)}" class="btn btn-secondary btn-sm" style="width: 100%;">
            Launch Head-to-Head Comparison
          </a>
        </div>
      </aside>
    </div>
    `;

    const toolHtml = renderHtmlDocument({
      title: `${tool.name} Review: Pricing, Free Tier & Features (${new Date().getFullYear()}) | AI Tool Scout`,
      description: `Comprehensive analysis of ${tool.name}. Verified starting price (${tool.startingPrice}), free tier specifications, pros, cons, and alternatives.`,
      canonicalPath: `/tool/${tool.slug}.html`,
      content: toolContent,
      activePage: 'categories',
      structuredData: toolSchema
    });

    fs.writeFileSync(path.join(DIST_DIR, 'tool', `${tool.slug}.html`), toolHtml, 'utf8');
    sitemapUrls.push({ loc: `/tool/${tool.slug}.html`, priority: '0.9' });
  });

  // ==========================================
  // PAGE 5: Comparisons Hub (/compare/index.html)
  // ==========================================
  const compareHubContent = `
  <section class="hero-section" style="padding: 3.5rem 0 2.5rem;">
    <div class="container">
      <div class="breadcrumbs" style="justify-content: center;">
        <a href="/">Home</a> <span>/</span> <span>Tool Comparisons</span>
      </div>
      <h1 class="hero-title">Compare Any Two <span class="gradient-text">AI Tools</span></h1>
      <p class="hero-subtitle">
        Select any two artificial intelligence tools to review side-by-side specs, verified free tiers, and direct pricing without marketing fluff.
      </p>

      <!-- Dynamic Selector Dropdowns -->
      <div style="max-width: 720px; margin: 2rem auto; display: flex; gap: 1rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 260px;">
          <label for="compare-select-a" style="font-size: 0.8125rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.5rem; text-align: left;">Tool A</label>
          <select id="compare-select-a" class="form-control" style="width: 100%;">
            <option value="">Loading tools...</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 260px;">
          <label for="compare-select-b" style="font-size: 0.8125rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.5rem; text-align: left;">Tool B</label>
          <select id="compare-select-b" class="form-control" style="width: 100%;">
            <option value="">Loading tools...</option>
          </select>
        </div>
      </div>
    </div>
  </section>

  <section class="container" style="padding-bottom: 5rem;">
    <!-- Dynamic Comparison Output -->
    <div id="compare-output-container"></div>

    <!-- Curated Comparison Presets -->
    <div style="margin-top: 4rem;">
      <h2 style="font-size: 1.75rem; margin-bottom: 1.5rem; text-align: center;">Curated Editorial Comparisons</h2>
      <div class="tools-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
        ${comparisons.map(comp => {
          const toolA = tools.find(t => t.id === comp.toolAId);
          const toolB = tools.find(t => t.id === comp.toolBId);
          return `
          <div class="tool-card">
            <span class="badge badge-verified" style="align-self: flex-start; margin-bottom: 0.75rem;">Verified Comparison</span>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">
              <a href="/compare/${comp.slug}.html">${escapeHTML(comp.title)}</a>
            </h3>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.25rem; flex-grow: 1;">
              ${escapeHTML(comp.tagline)}
            </p>
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
              <span style="font-size: 0.8125rem; color: var(--text-muted);">${toolA ? toolA.name : ''} vs ${toolB ? toolB.name : ''}</span>
              <a href="/compare/${comp.slug}.html" class="btn btn-primary btn-sm">Read Comparison</a>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  </section>

  <!-- Embed tools data for instant dynamic comparator without extra fetch roundtrips -->
  <script>
    window.__TOOLS_DATA__ = ${JSON.stringify(tools)};
  </script>
  <script type="module" src="/js/compare.js"></script>
  `;

  const compareHubHtml = renderHtmlDocument({
    title: 'Compare AI Tools Side-by-Side: Features, Free Tiers & Pricing | AI Tool Scout',
    description: 'Interactive comparison engine for AI tools. Compare Cursor vs GitHub Copilot, ChatGPT vs Claude, Midjourney vs Stable Diffusion, and any custom pair.',
    canonicalPath: '/compare/index.html',
    content: compareHubContent,
    activePage: 'compare'
  });

  fs.writeFileSync(path.join(DIST_DIR, 'compare', 'index.html'), compareHubHtml, 'utf8');
  sitemapUrls.push({ loc: '/compare/index.html', priority: '0.8' });

  // ==========================================
  // PAGE 6: Curated Dedicated Comparison Pages (/compare/[slug].html)
  // ==========================================
  comparisons.forEach(comp => {
    const toolA = tools.find(t => t.id === comp.toolAId);
    const toolB = tools.find(t => t.id === comp.toolBId);
    if (!toolA || !toolB) return;

    const compContent = `
    <section class="hero-section" style="padding: 3.5rem 0 2.5rem;">
      <div class="container">
        <div class="breadcrumbs" style="justify-content: center;">
          <a href="/">Home</a> <span>/</span> <a href="/compare/index.html">Comparisons</a> <span>/</span> <span>${escapeHTML(toolA.name)} vs ${escapeHTML(toolB.name)}</span>
        </div>
        <h1 class="hero-title" style="max-width: 900px;">${escapeHTML(comp.title)}</h1>
        <p class="hero-subtitle">${escapeHTML(comp.tagline)}</p>
      </div>
    </section>

    <section class="container" style="padding-bottom: 5rem;">
      <!-- Verdict Card -->
      <div class="content-box" style="border-left: 4px solid var(--accent-indigo); margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.35rem; color: var(--accent-cyan); margin-bottom: 0.75rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Editorial Verdict
        </h2>
        <p style="font-size: 1.0625rem; line-height: 1.7; color: var(--text-primary); margin: 0;">
          ${escapeHTML(comp.verdict)}
        </p>
      </div>

      <!-- Side by Side Comparison Table -->
      <div class="comparison-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th style="width: 25%;">Feature / Spec</th>
              <th style="width: 37.5%; font-size: 1.125rem;">${escapeHTML(toolA.name)}</th>
              <th style="width: 37.5%; font-size: 1.125rem;">${escapeHTML(toolB.name)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Tagline</strong></td>
              <td>${escapeHTML(toolA.tagline)}</td>
              <td>${escapeHTML(toolB.tagline)}</td>
            </tr>
            <tr>
              <td><strong>Starting Price</strong></td>
              <td><strong>${escapeHTML(toolA.startingPrice)}</strong> <span class="badge badge-freemium">${escapeHTML(toolA.pricingType)}</span></td>
              <td><strong>${escapeHTML(toolB.startingPrice)}</strong> <span class="badge badge-freemium">${escapeHTML(toolB.pricingType)}</span></td>
            </tr>
            <tr>
              <td><strong>Verified Free Tier</strong></td>
              <td>${escapeHTML(toolA.freePlanDetails || 'None')}</td>
              <td>${escapeHTML(toolB.freePlanDetails || 'None')}</td>
            </tr>
            <tr>
              <td><strong>Best Suited For</strong></td>
              <td>${escapeHTML(toolA.bestFor)}</td>
              <td>${escapeHTML(toolB.bestFor)}</td>
            </tr>
            ${comp.keyDifferences.map(kd => `
              <tr>
                <td><strong>${escapeHTML(kd.aspect)}</strong></td>
                <td>${escapeHTML(kd.toolA)}</td>
                <td>${escapeHTML(kd.toolB)}</td>
              </tr>
            `).join('')}
            <tr>
              <td><strong>Direct Links</strong></td>
              <td>
                <a href="${toolA.affiliateUrl || toolA.officialUrl}" target="_blank" rel="noopener noreferrer nofollow" class="btn btn-primary btn-sm">
                  Visit ${escapeHTML(toolA.name)}
                </a>
                <a href="/tool/${toolA.slug}.html" class="btn btn-secondary btn-sm" style="margin-left: 0.5rem;">
                  Specs
                </a>
              </td>
              <td>
                <a href="${toolB.affiliateUrl || toolB.officialUrl}" target="_blank" rel="noopener noreferrer nofollow" class="btn btn-primary btn-sm">
                  Visit ${escapeHTML(toolB.name)}
                </a>
                <a href="/tool/${toolB.slug}.html" class="btn btn-secondary btn-sm" style="margin-left: 0.5rem;">
                  Specs
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="text-align: center; margin-top: 3rem;">
        <a href="/compare/index.html" class="btn btn-secondary">&larr; Compare other AI tools in the directory</a>
      </div>
    </section>
    `;

    const compHtml = renderHtmlDocument({
      title: `${comp.title} | AI Tool Scout`,
      description: comp.tagline,
      canonicalPath: `/compare/${comp.slug}.html`,
      content: compContent,
      activePage: 'compare'
    });

    fs.writeFileSync(path.join(DIST_DIR, 'compare', `${comp.slug}.html`), compHtml, 'utf8');
    sitemapUrls.push({ loc: `/compare/${comp.slug}.html`, priority: '0.8' });
  });

  // ==========================================
  // PAGE 7: About & Editorial Integrity (about.html)
  // ==========================================
  const aboutContent = `
  <section class="hero-section" style="padding: 4rem 0 2.5rem;">
    <div class="container">
      <div class="breadcrumbs" style="justify-content: center;">
        <a href="/">Home</a> <span>/</span> <span>About</span>
      </div>
      <h1 class="hero-title">About AI Tool Scout</h1>
      <p class="hero-subtitle">
        An independent, practitioner-driven directory built to restore truth, clarity, and verified facts to the AI software market.
      </p>
    </div>
  </section>

  <section class="container container-narrow" style="padding-bottom: 5rem;">
    <div class="content-box" style="margin-bottom: 2rem;">
      <h2>Our Mission</h2>
      <p style="font-size: 1.0625rem; line-height: 1.7; color: var(--text-secondary); margin-bottom: 1.5rem;">
        The rapid explosion of generative AI software has generated thousands of low-quality directory sites filled with synthetic ratings, fabricated review scores, and unverified pricing tables. Users spend hours signing up for "free" tools only to encounter hidden paywalls, crippled output quotas, or watermarks.
      </p>
      <p style="font-size: 1.0625rem; line-height: 1.7; color: var(--text-secondary);">
        <strong>AI Tool Scout exists to solve this problem.</strong> We curate a tight, high-signal directory of legitimate AI solutions. We verify every pricing claim, test real free-tier capabilities, and publish objective evaluations.
      </p>
    </div>

    <div class="content-box" style="margin-bottom: 2rem;">
      <h2>The 5-Point Verification Methodology</h2>
      <div style="display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1.25rem;">
        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          <div style="background: var(--accent-indigo); color: white; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">1</div>
          <div>
            <h3 style="font-size: 1.0625rem; margin-bottom: 0.25rem;">Domain & Ownership Verification</h3>
            <p style="font-size: 0.9375rem; color: var(--text-secondary);">We confirm the tool has an active, legitimate registered company, official domain with valid TLS/SSL, and genuine maintainers.</p>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          <div style="background: var(--accent-indigo); color: white; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">2</div>
          <div>
            <h3 style="font-size: 1.0625rem; margin-bottom: 0.25rem;">Authentic Free-Tier Testing</h3>
            <p style="font-size: 0.9375rem; color: var(--text-secondary);">We sign up for standard free tiers to document exact monthly query quotas, token allowances, export resolutions, and trial duration limits.</p>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          <div style="background: var(--accent-indigo); color: white; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">3</div>
          <div>
            <h3 style="font-size: 1.0625rem; margin-bottom: 0.25rem;">Direct Pricing Cross-Checks</h3>
            <p style="font-size: 0.9375rem; color: var(--text-secondary);">We check prices directly on official vendor billing pages and document whether seat minimums, annual commitments, or usage metering apply.</p>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          <div style="background: var(--accent-indigo); color: white; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">4</div>
          <div>
            <h3 style="font-size: 1.0625rem; margin-bottom: 0.25rem;">Documented Trade-offs (Cons)</h3>
            <p style="font-size: 0.9375rem; color: var(--text-secondary);">Every single tool profile must highlight real technical limitations and constraints. We never publish one-sided promotional brochures.</p>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          <div style="background: var(--accent-indigo); color: white; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">5</div>
          <div>
            <h3 style="font-size: 1.0625rem; margin-bottom: 0.25rem;">Zero Pay-for-Play Ranking</h3>
            <p style="font-size: 0.9375rem; color: var(--text-secondary);">Affiliate relationships never dictate editorial inclusion or ranking order. If a tool fails our standards, it is rejected regardless of commercial offers.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="content-box">
      <h2>Affiliate & Monetization Policy</h2>
      <p style="font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
        AI Tool Scout is a free resource operated with zero subscription fees for readers. To support ongoing server hosting, link health monitoring, and editorial testing, some outbound links contain affiliate referral codes. If you purchase through these links, we may receive a commission.
      </p>
      <p style="font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.6;">
        For complete legal details, read our <a href="/disclosure.html" style="color: var(--accent-cyan); text-decoration: underline;">Full Affiliate Disclosure</a>.
      </p>
    </div>
  </section>
  `;

  const aboutHtml = renderHtmlDocument({
    title: 'About Us & Editorial Standards | AI Tool Scout',
    description: 'Learn how AI Tool Scout verifies AI software, tests free tiers, audits pricing, and maintains strict editorial independence.',
    canonicalPath: '/about.html',
    content: aboutContent,
    activePage: 'about'
  });

  fs.writeFileSync(path.join(DIST_DIR, 'about.html'), aboutHtml, 'utf8');
  sitemapUrls.push({ loc: '/about.html', priority: '0.6' });

  // ==========================================
  // PAGE 8: Contact Page (contact.html)
  // ==========================================
  const contactContent = `
  <section class="hero-section" style="padding: 4rem 0 2.5rem;">
    <div class="container">
      <div class="breadcrumbs" style="justify-content: center;">
        <a href="/">Home</a> <span>/</span> <span>Contact</span>
      </div>
      <h1 class="hero-title">Contact Editorial Team</h1>
      <p class="hero-subtitle">
        Have a tool correction, submission request, or partnership inquiry? Reach out directly.
      </p>
    </div>
  </section>

  <section class="container container-narrow" style="padding-bottom: 5rem;">
    <div class="content-box">
      <form id="contact-form" onsubmit="event.preventDefault(); alert('Thank you! Your message has been received. Our editorial team will review your inquiry.'); this.reset();">
        <div class="form-group">
          <label class="form-label" for="contact-name">Full Name *</label>
          <input type="text" id="contact-name" class="form-control" placeholder="Jane Doe" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="contact-email">Email Address *</label>
          <input type="email" id="contact-email" class="form-control" placeholder="jane@example.com" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="contact-subject">Topic *</label>
          <select id="contact-subject" class="form-control" required>
            <option value="submission">New Tool Submission</option>
            <option value="correction">Pricing or Feature Correction</option>
            <option value="partnership">Affiliate or Advertising Inquiry</option>
            <option value="feedback">General Site Feedback</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="contact-message">Message *</label>
          <textarea id="contact-message" class="form-control" placeholder="Please provide specific URLs, pricing documentation, or your query..." required></textarea>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">
          Send Message
        </button>
      </form>
    </div>
  </section>
  `;

  const contactHtml = renderHtmlDocument({
    title: 'Contact AI Tool Scout | Submissions & Inquiries',
    description: 'Get in touch with the editorial team at AI Tool Scout for tool submissions, pricing updates, corrections, or partnerships.',
    canonicalPath: '/contact.html',
    content: contactContent,
    activePage: 'contact'
  });

  fs.writeFileSync(path.join(DIST_DIR, 'contact.html'), contactHtml, 'utf8');
  sitemapUrls.push({ loc: '/contact.html', priority: '0.6' });

  // ==========================================
  // PAGE 9: Privacy Policy (privacy.html)
  // ==========================================
  const privacyContent = `
  <section class="hero-section" style="padding: 3.5rem 0 2rem;">
    <div class="container">
      <div class="breadcrumbs" style="justify-content: center;">
        <a href="/">Home</a> <span>/</span> <span>Privacy Policy</span>
      </div>
      <h1 class="hero-title">Privacy Policy</h1>
      <p class="hero-subtitle">Last updated: January 2025</p>
    </div>
  </section>

  <section class="container container-narrow" style="padding-bottom: 5rem;">
    <div class="content-box" style="display: flex; flex-direction: column; gap: 1.5rem; font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.7;">
      <p>AI Tool Scout ("we," "us," or "our") respects your privacy. This Privacy Policy explains how information is collected, used, and disclosed when you visit our website.</p>

      <h3 style="color: var(--text-primary);">1. Information We Collect</h3>
      <p>We do not require user account registration. We may collect anonymous technical access logs (such as IP addresses, browser user-agents, referring pages, and visit timestamps) via standard web server metrics to ensure site security and CDN performance.</p>

      <h3 style="color: var(--text-primary);">2. Cookies & Local Storage</h3>
      <p>We use browser <code>localStorage</code> strictly to store your bookmarked/saved tools locally on your own device. This data is never transmitted to our servers. Third-party partners (such as Cloudflare or affiliate networks) may use cookies to confirm referral routing when you click outbound links.</p>

      <h3 style="color: var(--text-primary);">3. External Links</h3>
      <p>Our website contains links to third-party software websites. We are not responsible for the privacy practices or terms of external sites. We encourage you to inspect their privacy policies upon visiting.</p>

      <h3 style="color: var(--text-primary);">4. Compliance (GDPR & CCPA)</h3>
      <p>We do not sell personal data. If you have questions regarding your data privacy, contact us via our contact form.</p>
    </div>
  </section>
  `;

  const privacyHtml = renderHtmlDocument({
    title: 'Privacy Policy | AI Tool Scout',
    description: 'Privacy policy for AI Tool Scout. Learn how we handle cookies, localStorage bookmarks, and data transparency.',
    canonicalPath: '/privacy.html',
    content: privacyContent
  });

  fs.writeFileSync(path.join(DIST_DIR, 'privacy.html'), privacyHtml, 'utf8');
  sitemapUrls.push({ loc: '/privacy.html', priority: '0.4' });

  // ==========================================
  // PAGE 10: Terms of Service (terms.html)
  // ==========================================
  const termsContent = `
  <section class="hero-section" style="padding: 3.5rem 0 2rem;">
    <div class="container">
      <div class="breadcrumbs" style="justify-content: center;">
        <a href="/">Home</a> <span>/</span> <span>Terms of Service</span>
      </div>
      <h1 class="hero-title">Terms of Service</h1>
      <p class="hero-subtitle">Last updated: January 2025</p>
    </div>
  </section>

  <section class="container container-narrow" style="padding-bottom: 5rem;">
    <div class="content-box" style="display: flex; flex-direction: column; gap: 1.5rem; font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.7;">
      <p>By accessing or using AI Tool Scout, you agree to be bound by these Terms of Service.</p>

      <h3 style="color: var(--text-primary);">1. Information Accuracy</h3>
      <p>AI Tool Scout strives to maintain accurate pricing, features, and free tier data. However, AI software vendors frequently alter their pricing tiers and terms without advance notice. We cannot guarantee that third-party terms remain identical between verification audits. Always verify final terms directly on the vendor's checkout page.</p>

      <h3 style="color: var(--text-primary);">2. Intellectual Property</h3>
      <p>Product names, logos, and trademarks displayed on this site are the property of their respective owners. Their inclusion in this directory is for identification, editorial commentary, and comparative purposes only.</p>

      <h3 style="color: var(--text-primary);">3. Disclaimer of Warranties</h3>
      <p>This website is provided on an "as-is" and "as-available" basis without warranties of any kind.</p>
    </div>
  </section>
  `;

  const termsHtml = renderHtmlDocument({
    title: 'Terms of Service | AI Tool Scout',
    description: 'Terms of service and acceptable use policy for AI Tool Scout.',
    canonicalPath: '/terms.html',
    content: termsContent
  });

  fs.writeFileSync(path.join(DIST_DIR, 'terms.html'), termsHtml, 'utf8');
  sitemapUrls.push({ loc: '/terms.html', priority: '0.4' });

  // ==========================================
  // PAGE 11: FTC Affiliate Disclosure (disclosure.html)
  // ==========================================
  const disclosureContent = `
  <section class="hero-section" style="padding: 3.5rem 0 2rem;">
    <div class="container">
      <div class="breadcrumbs" style="justify-content: center;">
        <a href="/">Home</a> <span>/</span> <span>Affiliate Disclosure</span>
      </div>
      <h1 class="hero-title">Affiliate Disclosure</h1>
      <p class="hero-subtitle">Compliance with United States FTC Guidelines & International Transparency Standards</p>
    </div>
  </section>

  <section class="container container-narrow" style="padding-bottom: 5rem;">
    <div class="content-box" style="display: flex; flex-direction: column; gap: 1.5rem; font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.7;">
      <p>
        In accordance with the Federal Trade Commission (FTC) guidelines concerning the use of endorsements and testimonials in advertising, this policy outlines our commercial relationships and editorial independence.
      </p>

      <h3 style="color: var(--text-primary);">1. What is an Affiliate Link?</h3>
      <p>
        Some outbound buttons and text links on AI Tool Scout contain special tracking parameters ("affiliate links"). If you click an affiliate link and subsequently purchase a subscription or product, the vendor pays us a referral commission.
      </p>

      <h3 style="color: var(--text-primary);">2. Does This Cost You Extra?</h3>
      <p>
        <strong>No.</strong> You pay the exact same price (and in some instances, a discounted rate via exclusive coupons) whether you use our link or navigate directly to the vendor. The commission is paid by the software vendor out of their standard marketing budget.
      </p>

      <h3 style="color: var(--text-primary);">3. Editorial Integrity Pledge</h3>
      <p>
        Our evaluations, ratings, pros/cons lists, and comparison conclusions are made independently by our editorial team. We strictly adhere to these policies:
      </p>
      <ul class="feature-list">
        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-emerald)"><polyline points="20 6 9 17 4 12"/></svg> We do not accept payment to write positive reviews or delete negative points.</li>
        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-emerald)"><polyline points="20 6 9 17 4 12"/></svg> If an affiliate partner's tool has notable drawbacks, we list those trade-offs clearly.</li>
        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-emerald)"><polyline points="20 6 9 17 4 12"/></svg> We list excellent free and open-source tools (such as Stable Diffusion) that have zero affiliate monetization because they provide immense value to our users.</li>
      </ul>

      <h3 style="color: var(--text-primary);">4. Display Advertising</h3>
      <p>
        We may reserve designated advertising units on this site. All promotional placements will be clearly demarcated with "Sponsored" or "Advertisement" labels.
      </p>
    </div>
  </section>
  `;

  const disclosureHtml = renderHtmlDocument({
    title: 'Affiliate Disclosure & Transparency Policy | AI Tool Scout',
    description: 'FTC-compliant affiliate disclosure explaining how AI Tool Scout earns commissions and maintains editorial neutrality.',
    canonicalPath: '/disclosure.html',
    content: disclosureContent
  });

  fs.writeFileSync(path.join(DIST_DIR, 'disclosure.html'), disclosureHtml, 'utf8');
  sitemapUrls.push({ loc: '/disclosure.html', priority: '0.5' });

  // ==========================================
  // PAGE 12: Custom 404 Page (404.html)
  // ==========================================
  const notFoundContent = `
  <section class="hero-section" style="padding: 6rem 0 4rem; text-align: center;">
    <div class="container">
      <div style="font-size: 5rem; font-weight: 800; font-family: var(--font-heading); color: var(--accent-indigo); line-height: 1; margin-bottom: 1rem;">
        404
      </div>
      <h1 class="hero-title" style="font-size: 2.25rem;">Page Not Found</h1>
      <p class="hero-subtitle" style="margin-bottom: 2rem;">
        The AI tool or comparison page you requested does not exist or may have been updated.
      </p>
      <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
        <a href="/" class="btn btn-primary">Return to Directory</a>
        <a href="/categories/index.html" class="btn btn-secondary">Explore Categories</a>
      </div>
    </div>
  </section>
  `;

  const notFoundHtml = renderHtmlDocument({
    title: '404 - Page Not Found | AI Tool Scout',
    description: 'The requested page could not be found on AI Tool Scout.',
    canonicalPath: '/404.html',
    content: notFoundContent
  });

  fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf8');

  // ==========================================
  // SITEMAP & ROBOTS.TXT
  // ==========================================
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url>
    <loc>${SITE.url}${u.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');

  const robotsTxt = `# AI Tool Scout - robots.txt
User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`;

  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf8');

  console.log(`\n🎉 Build complete!`);
  console.log(`  - Total Pages Generated: ${sitemapUrls.length + 1}`);
  console.log(`  - Tools: ${tools.length}`);
  console.log(`  - Categories: ${categories.length}`);
  console.log(`  - Comparisons: ${comparisons.length}`);
  console.log(`  - Destination: ${DIST_DIR}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildStaticSite();
}
