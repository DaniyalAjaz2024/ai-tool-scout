/**
 * AI Tool Scout - Data Validator
 * Validates catalogue integrity, schema, duplicate IDs/slugs/URLs, and pricing fields.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export function validateCatalogue() {
  const toolsPath = path.join(ROOT_DIR, 'data', 'tools.json');
  const categoriesPath = path.join(ROOT_DIR, 'data', 'categories.json');
  const comparisonsPath = path.join(ROOT_DIR, 'data', 'comparisons.json');

  if (!fs.existsSync(toolsPath)) {
    throw new Error(`Tools data file not found at ${toolsPath}`);
  }
  if (!fs.existsSync(categoriesPath)) {
    throw new Error(`Categories data file not found at ${categoriesPath}`);
  }

  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  const comparisons = fs.existsSync(comparisonsPath) ? JSON.parse(fs.readFileSync(comparisonsPath, 'utf8')) : [];

  const errors = [];
  const warnings = [];

  const validCategoryIds = new Set(categories.map(c => c.id));
  const seenIds = new Set();
  const seenSlugs = new Set();
  const seenOfficialUrls = new Set();

  if (!Array.isArray(tools) || tools.length === 0) {
    errors.push('Tools catalogue is empty or not an array');
  }

  tools.forEach((tool, index) => {
    const loc = `Tool #${index + 1} (${tool.name || 'unnamed'})`;

    // Required fields check
    const requiredFields = ['id', 'slug', 'name', 'tagline', 'description', 'category', 'officialUrl', 'pricingType', 'startingPrice', 'verifiedFeatures', 'pros', 'cons', 'bestFor'];
    for (const field of requiredFields) {
      if (tool[field] === undefined || tool[field] === null || tool[field] === '') {
        errors.push(`${loc} is missing required field: "${field}"`);
      }
    }

    // Unique ID check
    if (tool.id) {
      if (seenIds.has(tool.id)) {
        errors.push(`${loc} has duplicate ID: "${tool.id}"`);
      }
      seenIds.add(tool.id);
    }

    // Unique Slug check
    if (tool.slug) {
      if (!/^[a-z0-9-]+$/.test(tool.slug)) {
        errors.push(`${loc} has invalid slug format: "${tool.slug}". Use lowercase letters, numbers, and hyphens only.`);
      }
      if (seenSlugs.has(tool.slug)) {
        errors.push(`${loc} has duplicate slug: "${tool.slug}"`);
      }
      seenSlugs.add(tool.slug);
    }

    // Category validity
    if (tool.category && !validCategoryIds.has(tool.category)) {
      errors.push(`${loc} references invalid category "${tool.category}". Valid categories are: ${Array.from(validCategoryIds).join(', ')}`);
    }

    // Official URL check
    if (tool.officialUrl) {
      try {
        const parsed = new URL(tool.officialUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          errors.push(`${loc} has invalid URL protocol: "${tool.officialUrl}"`);
        }
        if (seenOfficialUrls.has(tool.officialUrl)) {
          warnings.push(`${loc} shares official URL with another entry: "${tool.officialUrl}"`);
        }
        seenOfficialUrls.add(tool.officialUrl);
      } catch {
        errors.push(`${loc} has malformed official URL: "${tool.officialUrl}"`);
      }
    }

    // Affiliate URL validation if present
    if (tool.affiliateUrl) {
      try {
        const parsedAff = new URL(tool.affiliateUrl);
        if (!['http:', 'https:'].includes(parsedAff.protocol)) {
          errors.push(`${loc} has invalid affiliate URL protocol: "${tool.affiliateUrl}"`);
        }
      } catch {
        errors.push(`${loc} has malformed affiliate URL: "${tool.affiliateUrl}"`);
      }
    }

    // Pricing type check
    const validPricingTypes = ['Free', 'Freemium', 'Paid', 'Free Trial'];
    if (tool.pricingType && !validPricingTypes.includes(tool.pricingType)) {
      errors.push(`${loc} has invalid pricingType "${tool.pricingType}". Expected one of: ${validPricingTypes.join(', ')}`);
    }

    // Features, pros, cons must be non-empty arrays
    if (Array.isArray(tool.verifiedFeatures)) {
      if (tool.verifiedFeatures.length === 0) {
        warnings.push(`${loc} has empty verifiedFeatures array`);
      }
    } else {
      errors.push(`${loc} verifiedFeatures must be an array`);
    }

    if (Array.isArray(tool.pros)) {
      if (tool.pros.length === 0) warnings.push(`${loc} has empty pros array`);
    } else {
      errors.push(`${loc} pros must be an array`);
    }

    if (Array.isArray(tool.cons)) {
      if (tool.cons.length === 0) warnings.push(`${loc} has empty cons array`);
    } else {
      errors.push(`${loc} cons must be an array`);
    }
  });

  // Validate Comparisons
  comparisons.forEach((comp, idx) => {
    const cLoc = `Comparison #${idx + 1} (${comp.slug || comp.id})`;
    if (!seenIds.has(comp.toolAId)) {
      errors.push(`${cLoc} references unknown toolAId: "${comp.toolAId}"`);
    }
    if (!seenIds.has(comp.toolBId)) {
      errors.push(`${cLoc} references unknown toolBId: "${comp.toolBId}"`);
    }
    if (comp.toolAId === comp.toolBId) {
      errors.push(`${cLoc} compares the same tool against itself`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    toolCount: tools.length,
    categoryCount: categories.length,
    comparisonCount: comparisons.length
  };
}

// Execute directly if run via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('🔍 Validating AI Tool Scout catalogue...');
  const result = validateCatalogue();

  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (!result.valid) {
    console.error('\n❌ Validation Failed with Errors:');
    result.errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log(`\n✅ Validation Passed! Found ${result.toolCount} tools across ${result.categoryCount} categories and ${result.comparisonCount} comparisons.`);
    process.exit(0);
  }
}
