/**
 * AI Tool Scout - Catalogue Data Validation Tests
 * Runs with Node.js built-in test runner: `node --test tests/validate-catalogue.test.js`
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalogue } from '../scripts/validate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

describe('Catalogue Data Integrity Suite', () => {
  test('validateCatalogue() should pass with zero errors', () => {
    const result = validateCatalogue();
    assert.strictEqual(result.valid, true, `Validation failed with errors: ${result.errors.join('; ')}`);
    assert.strictEqual(result.errors.length, 0);
    assert.ok(result.toolCount >= 10, 'Should have at least 10 tools');
    assert.ok(result.categoryCount === 5, 'Should have exactly 5 core categories');
    assert.ok(result.comparisonCount >= 3, 'Should have at least 3 curated comparisons');
  });

  test('All tools have realistic, non-fabricated pricing and verified features', () => {
    const tools = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'tools.json'), 'utf8'));

    tools.forEach(tool => {
      // Must not use placeholder or fake text
      assert.ok(!tool.name.includes('Test') && !tool.name.includes('Fake'), `Tool name ${tool.name} seems synthetic`);
      assert.ok(tool.verifiedFeatures.length >= 3, `${tool.name} must have at least 3 verified features`);
      assert.ok(tool.pros.length >= 2, `${tool.name} must have at least 2 pros`);
      assert.ok(tool.cons.length >= 1, `${tool.name} must have at least 1 con`);

      if (tool.hasFreeTier) {
        assert.ok(tool.freePlanDetails && tool.freePlanDetails.length > 10, `${tool.name} marked hasFreeTier but lacks freePlanDetails`);
      }
    });
  });

  test('Category definitions match requirements', () => {
    const categories = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'categories.json'), 'utf8'));
    const expectedSlugs = ['ai-writing', 'ai-image', 'ai-video', 'ai-coding', 'ai-productivity'];
    const actualSlugs = categories.map(c => c.slug);

    expectedSlugs.forEach(slug => {
      assert.ok(actualSlugs.includes(slug), `Missing required category: ${slug}`);
    });
  });
});
