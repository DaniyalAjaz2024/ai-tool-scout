# AI Tool Scout - Affiliate Monetization & Advertising Guide

This document outlines how to manage affiliate relationships, configure tracking URLs, maintain legal compliance, and enable display advertising on **AI Tool Scout**.

---

## 1. How Affiliate Links Work in AI Tool Scout

In `data/tools.json`, every tool entry includes an `affiliateUrl` field:

```json
{
  "id": "cursor",
  "name": "Cursor",
  "officialUrl": "https://cursor.com",
  "affiliateUrl": null
}
```

### Fallback Logic:
- **When `affiliateUrl` is `null` or empty string**: All outbound buttons on the website link directly to `officialUrl` with standard security attributes (`rel="noopener noreferrer"`).
- **When `affiliateUrl` is populated**:
  - The outbound button points to the tracking link with `rel="noopener noreferrer nofollow"` (instructing search engines that the link is commercial).
  - An inline badge `Ad` or `Affiliate Link` automatically appears on the card.
  - A subtle legal disclosure notice is displayed on the tool profile.

---

## 2. Real Affiliate Programs for AI Tools

To earn affiliate commissions, you must apply to legitimate partner programs directly with each provider or affiliate network. Do not fabricate referral codes or assume approval.

| Tool Name | Typical Affiliate Network / Partner Platform | Application Notes |
| :--- | :--- | :--- |
| **Notion** | PartnerStack (https://www.notion.so/affiliates) | Typically offers recurring percentage for new team subscriptions |
| **Grammarly** | Impact.com / CJ Affiliate | Free account sign-up and premium upgrade payouts |
| **Descript** | FirstPromoter / Direct Partner Program | Tiered commission on monthly or annual creator plans |
| **HeyGen** | Rewardful / Direct Affiliate Portal | Video generation credit subscriptions |
| **Perplexity** | Direct Referral & Partner Programs | Periodically opens creator referral programs |
| **Cursor / Copilot** | GitHub Partner / Enterprise Sales referrals | Check vendor partner pages for active developer referral programs |

---

## 3. How to Update an Affiliate URL

1. Open `data/tools.json`.
2. Locate the tool entry you were approved for.
3. Replace `"affiliateUrl": null` with your unique tracking URL:
   ```json
   "affiliateUrl": "https://partner.vendor.com/c/your-tracking-id"
   ```
4. Run validation and rebuild:
   ```powershell
   npm run validate
   npm run build
   ```
5. Commit and push:
   ```powershell
   git add data/tools.json
   git commit -m "monetization: add verified affiliate link for Notion"
   git push
   ```
   Cloudflare Pages will automatically redeploy the updated site with the tracking link and compliance badges in place.

---

## 4. Enabling the Optional Advertising Placeholder

By default, display advertising is **disabled** to maintain a clean aesthetic and avoid intrusive popups.

To enable the sponsored ad banner on the homepage:
1. Open `dist/index.html` (or `scripts/build.js` for persistent builds).
2. Locate the element:
   ```html
   <aside class="ad-slot-placeholder" id="home-banner-ad">
   ```
3. Add the CSS class `ad-enabled`:
   ```html
   <aside class="ad-slot-placeholder ad-enabled" id="home-banner-ad">
   ```
4. Insert your ethical sponsorship banner or direct partner creative inside the container.

---

## 5. FTC Legal Compliance Checklist

- [x] Clear global affiliate disclosure link in the site footer.
- [x] Full disclosure page published at `/disclosure.html`.
- [x] Outbound affiliate links tagged with `nofollow` and `noopener noreferrer`.
- [x] Editorial pros and cons remain 100% independent and honest.
- [x] No claims of guaranteed earnings or fake review scores.
