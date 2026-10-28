/**
 * AI Tool Scout - Conservative Link Health Checker
 * Verifies official tool links without aggressive hammering.
 * Uses HEAD with GET fallback, conservative timeouts, and polite delays.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (compatible; AIToolScout-LinkBot/1.0; +https://aitoolscout.pages.dev/about.html)';
const TIMEOUT_MS = 8000;
const DELAY_BETWEEN_REQUESTS_MS = 300;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Try HEAD request first
    let res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html,*/*' },
      signal: controller.signal,
      redirect: 'follow'
    }).catch(async () => null);

    // If HEAD is rejected with 405 Method Not Allowed or failed to fetch, fallback to GET
    if (!res || res.status === 405) {
      res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,*/*',
          'Range': 'bytes=0-1024'
        },
        signal: controller.signal,
        redirect: 'follow'
      }).catch(() => null);
    }


    clearTimeout(timeoutId);

    if (!res) {
      return { ok: false, status: 0, message: 'No response received' };
    }

    // Some sites return 403 or 405 to bots with Cloudflare protection (e.g. Turnstile)
    // 200, 301, 302, 307, 308, and even 403 on Cloudflare challenge are live
    const isLive = res.status >= 200 && res.status < 400;
    const isProtected = res.status === 403 || res.status === 429;

    return {
      ok: isLive || isProtected,
      status: res.status,
      finalUrl: res.url,
      redirected: res.redirected,
      isProtected: isProtected,
      message: isLive ? 'OK' : isProtected ? 'Live (Protected by Cloudflare/DDoS filter)' : `HTTP ${res.status}`
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { ok: false, status: 'TIMEOUT', message: `Request timed out after ${TIMEOUT_MS}ms` };
    }
    return { ok: false, status: 'ERROR', message: err.message };
  }
}

export async function runLinkCheck() {
  const toolsPath = path.join(ROOT_DIR, 'data', 'tools.json');
  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));

  console.log(`📡 Checking ${tools.length} tool links conservatively...`);
  const results = [];

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    process.stdout.write(`[${i + 1}/${tools.length}] Checking ${tool.name} (${tool.officialUrl})... `);

    const check = await checkUrl(tool.officialUrl);
    results.push({
      id: tool.id,
      name: tool.name,
      url: tool.officialUrl,
      ...check
    });

    console.log(check.ok ? `✅ ${check.message}` : `❌ ${check.message}`);
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  // Generate Report
  const reportsDir = path.join(ROOT_DIR, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const passedCount = results.filter(r => r.ok).length;
  const failedCount = results.length - passedCount;

  const reportMd = [
    `# Link Health Verification Report`,
    `Generated on: ${new Date().toISOString()}`,
    ``,
    `## Summary`,
    `- Total Tools Checked: **${results.length}**`,
    `- Accessible / Verified: **${passedCount}**`,
    `- Flagged / Attention Needed: **${failedCount}**`,
    ``,
    `## Detailed Results`,
    `| Tool | Status | Code | Official URL | Details |`,
    `| :--- | :---: | :---: | :--- | :--- |`,
    ...results.map(r => `| **${r.name}** | ${r.ok ? '🟢 OK' : '🔴 ISSUE'} | \`${r.status}\` | [${r.url}](${r.url}) | ${r.message} |`),
    ``,
    `> **Note**: Modern AI tools frequently use Cloudflare or bot protection that returns status 403 to automated scripts. These are marked as "Live (Protected)" and treated as functional.`
  ].join('\n');

  const reportPath = path.join(reportsDir, 'link-health-report.md');
  fs.writeFileSync(reportPath, reportMd, 'utf8');
  console.log(`\n📄 Report generated successfully at: ${reportPath}`);

  return { results, passedCount, failedCount };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runLinkCheck().catch(err => {
    console.error('Fatal link check error:', err);
    process.exit(1);
  });
}
