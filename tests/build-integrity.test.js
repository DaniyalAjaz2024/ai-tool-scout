/**
 * AI Tool Scout - Static Build & Security Integrity Tests
 * Validates output files, links, XSS escaping, and secret safety.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildStaticSite } from '../scripts/build.js';
import { escapeHTML } from '../src/js/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

describe('Build & Security Integrity Suite', () => {
  test('buildStaticSite() executes successfully and generates all critical files', () => {
    buildStaticSite();

    const expectedFiles = [
      'index.html',
      'categories/index.html',
      'compare/index.html',
      'about.html',
      'contact.html',
      'privacy.html',
      'terms.html',
      'disclosure.html',
      '404.html',
      'sitemap.xml',
      'robots.txt',
      'css/style.css',
      'css/components.css',
      'js/app.js',
      'js/search.js',
      'js/compare.js',
      'category/ai-writing.html',
      'category/ai-coding.html',
      'tool/cursor.html',
      'tool/chatgpt.html',
      'compare/cursor-vs-github-copilot.html'
    ];

    expectedFiles.forEach(rel => {
      const p = path.join(DIST_DIR, rel);
      assert.ok(fs.existsSync(p), `Missing expected build artifact: ${rel}`);
      const stats = fs.statSync(p);
      assert.ok(stats.size > 50, `File ${rel} appears empty or corrupted (${stats.size} bytes)`);
    });
  });

  test('External links enforce rel="noopener noreferrer" for security', () => {
    const htmlFiles = [
      path.join(DIST_DIR, 'index.html'),
      path.join(DIST_DIR, 'tool', 'cursor.html'),
      path.join(DIST_DIR, 'compare', 'cursor-vs-github-copilot.html')
    ];

    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const targetBlankRegex = /<a\s+[^>]*target="_blank"[^>]*>/gi;
      let match;
      while ((match = targetBlankRegex.exec(content)) !== null) {
        const tag = match[0];
        assert.ok(
          tag.includes('rel="noopener') && tag.includes('noreferrer'),
          `External link missing noopener noreferrer in ${path.basename(file)}: ${tag}`
        );
      }
    });
  });

  test('escapeHTML helper properly neutralizes XSS payloads', () => {
    const maliciousInput = '<script>alert("XSS")</script>&"\'';
    const escaped = escapeHTML(maliciousInput);
    assert.strictEqual(escaped.includes('<script>'), false);
    assert.strictEqual(escaped, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;&amp;&quot;&#039;');
  });

  test('No API keys or private secrets leaked in code or output', () => {
    const sensitiveTokens = ['AIzaSy', 'sk-proj-', 'ghp_', 'AKIA'];
    const filesToCheck = [
      path.join(DIST_DIR, 'js', 'app.js'),
      path.join(DIST_DIR, 'js', 'search.js'),
      path.join(DIST_DIR, 'js', 'compare.js'),
      path.join(DIST_DIR, 'index.html')
    ];

    filesToCheck.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      sensitiveTokens.forEach(token => {
        assert.strictEqual(content.includes(token), false, `Sensitive token signature detected in ${file}`);
      });
    });
  });

  test('sitemap.xml has valid format and contains proper URLs', () => {
    const sitemap = fs.readFileSync(path.join(DIST_DIR, 'sitemap.xml'), 'utf8');
    assert.ok(sitemap.startsWith('<?xml'), 'Sitemap must start with XML declaration');
    assert.ok(sitemap.includes('<urlset'), 'Sitemap must have urlset container');
    assert.ok(sitemap.includes('/tool/cursor.html'), 'Sitemap should contain tool URL');
    assert.ok(sitemap.includes('/categories/index.html'), 'Sitemap should contain categories URL');
  });
});
