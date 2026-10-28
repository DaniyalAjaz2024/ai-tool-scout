/**
 * AI Tool Scout - Zero-Dependency Local Development Server
 * Fast local preview server with MIME types, clean URL rewriting, and auto-build.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildStaticSite } from './build.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp'
};

// Ensure build exists
if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  console.log('Building static site before launch...');
  buildStaticSite();
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize path
  if (pathname === '/') {
    pathname = '/index.html';
  } else if (!path.extname(pathname)) {
    // Check if directory index exists or append .html
    const dirIndex = path.join(DIST_DIR, pathname, 'index.html');
    const htmlFile = path.join(DIST_DIR, `${pathname}.html`);
    if (fs.existsSync(dirIndex)) {
      pathname = path.join(pathname, 'index.html');
    } else if (fs.existsSync(htmlFile)) {
      pathname = `${pathname}.html`;
    }
  }

  const filePath = path.join(DIST_DIR, pathname);

  // Prevent path traversal outside DIST_DIR
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Serve custom 404
      const notFoundPath = path.join(DIST_DIR, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(notFoundPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Page Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 AI Tool Scout local server running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to terminate.\n`);
});
