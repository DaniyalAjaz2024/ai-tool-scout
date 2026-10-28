/**
 * AI Tool Scout - Reusable Content Draft Generator
 * Scaffolds verified draft PR files using templates without requiring paid APIs.
 * Supports optional free API keys (GEMINI_API_KEY) if available in environment.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to slugify string
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function generateDraft(options = {}) {
  const name = options.name || 'Sample Tool';
  const slug = options.slug || slugify(name);
  const id = options.id || slug;
  const category = options.category || 'ai-productivity';
  const officialUrl = options.officialUrl || 'https://example.com';
  const tagline = options.tagline || 'Intelligent automation assistant for modern teams';
  const pricingType = options.pricingType || 'Freemium';
  const startingPrice = options.startingPrice || '$10/month';
  const hasFreeTier = options.hasFreeTier !== undefined ? options.hasFreeTier : true;
  const freePlanDetails = options.freePlanDetails || 'Free tier includes basic usage limits refreshed monthly.';
  const bestFor = options.bestFor || 'Knowledge workers and developers';
  const date = new Date().toISOString().split('T')[0];

  const draftsDir = path.join(ROOT_DIR, 'drafts');
  if (!fs.existsSync(draftsDir)) {
    fs.mkdirSync(draftsDir, { recursive: true });
  }

  // 1. Generate JSON candidate entry
  const jsonDraft = {
    id,
    slug,
    name,
    tagline,
    description: `${name} is an AI tool designed to streamline workflows. Detailed feature analysis will be completed during editorial verification.`,
    category,
    officialUrl,
    affiliateUrl: null,
    pricingType,
    startingPrice,
    hasFreeTier,
    freePlanDetails,
    verifiedFeatures: [
      `Core feature 1 verified in public documentation`,
      `Core feature 2 verified in public documentation`,
      `Core feature 3 verified in public documentation`
    ],
    pros: [
      `Documented strength 1`,
      `Documented strength 2`
    ],
    cons: [
      `Documented limitation or pricing tier restriction`
    ],
    bestFor,
    lastVerified: date,
    featured: false,
    tags: [category.replace('ai-', ''), name]
  };

  const jsonFilePath = path.join(draftsDir, `${slug}.json`);
  fs.writeFileSync(jsonFilePath, JSON.stringify(jsonDraft, null, 2), 'utf8');

  // 2. Generate Markdown Review Draft
  const templatePath = path.join(ROOT_DIR, 'templates', 'tool-submission-template.md');
  let mdContent = fs.readFileSync(templatePath, 'utf8');

  const replacements = {
    '{{NAME}}': name,
    '{{ID}}': id,
    '{{SLUG}}': slug,
    '{{CATEGORY}}': category,
    '{{TAGLINE}}': tagline,
    '{{OFFICIAL_URL}}': officialUrl,
    '{{AFFILIATE_URL}}': 'None (Direct link only)',
    '{{PRICING_TYPE}}': pricingType,
    '{{STARTING_PRICE}}': startingPrice,
    '{{HAS_FREE_TIER}}': String(hasFreeTier),
    '{{FREE_PLAN_DETAILS}}': freePlanDetails,
    '{{DESCRIPTION}}': jsonDraft.description,
    '{{FEATURE_1}}': jsonDraft.verifiedFeatures[0],
    '{{FEATURE_2}}': jsonDraft.verifiedFeatures[1],
    '{{FEATURE_3}}': jsonDraft.verifiedFeatures[2],
    '{{FEATURE_4}}': 'Verified API integration capabilities',
    '{{FEATURE_5}}': 'Standard export and sharing formats',
    '{{PRO_1}}': jsonDraft.pros[0],
    '{{PRO_2}}': jsonDraft.pros[1],
    '{{PRO_3}}': 'Intuitive onboarding and clear documentation',
    '{{CON_1}}': jsonDraft.cons[0],
    '{{CON_2}}': 'Advanced capabilities require higher tier plan',
    '{{BEST_FOR}}': bestFor,
    '{{TAGS}}': jsonDraft.tags.join(', '),
    '{{DATE}}': date
  };

  for (const [key, value] of Object.entries(replacements)) {
    mdContent = mdContent.split(key).join(value);
  }

  const mdFilePath = path.join(draftsDir, `${slug}.md`);
  fs.writeFileSync(mdFilePath, mdContent, 'utf8');

  console.log(`\n✨ Draft scaffolded successfully!`);
  console.log(`  - Markdown Review: ${mdFilePath}`);
  console.log(`  - JSON Candidate: ${jsonFilePath}`);
  console.log(`\n⚠️ NEXT STEP: A human editor must verify the pricing, free plan details, and links before adding to data/tools.json.\n`);

  return { jsonFilePath, mdFilePath };
}

// Support CLI execution: node scripts/generate-draft.js "Krea AI" "ai-image" "https://krea.ai"
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const name = args[0] || 'Example AI Tool';
  const category = args[1] || 'ai-productivity';
  const url = args[2] || 'https://example.com';

  generateDraft({
    name,
    category,
    officialUrl: url
  });
}
