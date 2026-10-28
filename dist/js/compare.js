/**
 * AI Tool Scout - Dynamic Tool Comparator Engine
 * Enables head-to-head comparison between any two AI tools in the directory.
 */

import { escapeHTML } from './app.js';

class ToolComparator {
  constructor() {
    this.selectA = document.getElementById('compare-select-a');
    this.selectB = document.getElementById('compare-select-b');
    this.compareOutput = document.getElementById('compare-output-container');
    this.toolsData = [];
    this.init();
  }

  async init() {
    if (!this.selectA || !this.selectB || !this.compareOutput) return;

    try {
      // In static multi-page generation, we either have window.__TOOLS_DATA__ or fetch data/tools.json
      if (window.__TOOLS_DATA__) {
        this.toolsData = window.__TOOLS_DATA__;
      } else {
        const res = await fetch('/data/tools.json');
        if (res.ok) {
          this.toolsData = await res.json();
        }
      }

      this.populateSelects();
      this.handleUrlParams();
      this.bindEvents();
    } catch (err) {
      console.warn('Could not load tools for dynamic comparison:', err);
    }
  }

  populateSelects() {
    this.selectA.innerHTML = '<option value="">Select First Tool...</option>';
    this.selectB.innerHTML = '<option value="">Select Second Tool...</option>';

    this.toolsData.forEach(tool => {
      const optA = document.createElement('option');
      optA.value = tool.id;
      optA.textContent = `${tool.name} (${tool.category.replace('ai-', 'AI ')})`;
      this.selectA.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = tool.id;
      optB.textContent = `${tool.name} (${tool.category.replace('ai-', 'AI ')})`;
      this.selectB.appendChild(optB);
    });
  }

  handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const a = params.get('toolA') || 'cursor';
    const b = params.get('toolB') || 'github-copilot';

    if (this.selectA.querySelector(`option[value="${a}"]`)) {
      this.selectA.value = a;
    }
    if (this.selectB.querySelector(`option[value="${b}"]`)) {
      this.selectB.value = b;
    }

    if (this.selectA.value && this.selectB.value) {
      this.renderComparison();
    }
  }

  bindEvents() {
    this.selectA.addEventListener('change', () => this.renderComparison());
    this.selectB.addEventListener('change', () => this.renderComparison());
  }

  renderComparison() {
    const idA = this.selectA.value;
    const idB = this.selectB.value;

    if (!idA || !idB) {
      this.compareOutput.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-medium);">
          <p>Please select two tools from the dropdowns above to view their head-to-head comparison.</p>
        </div>
      `;
      return;
    }

    if (idA === idB) {
      this.compareOutput.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--accent-amber); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid rgba(245, 158, 11, 0.3);">
          <p>Please select two different tools to perform a comparison.</p>
        </div>
      `;
      return;
    }

    const toolA = this.toolsData.find(t => t.id === idA);
    const toolB = this.toolsData.find(t => t.id === idB);

    if (!toolA || !toolB) return;

    // Update URL query string without reloading
    const newUrl = `${window.location.pathname}?toolA=${encodeURIComponent(idA)}&toolB=${encodeURIComponent(idB)}`;
    window.history.replaceState({}, '', newUrl);

    this.compareOutput.innerHTML = `
      <div class="comparison-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th style="width: 25%;">Feature / Spec</th>
              <th style="width: 37.5%;">${escapeHTML(toolA.name)}</th>
              <th style="width: 37.5%;">${escapeHTML(toolB.name)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Tagline</strong></td>
              <td>${escapeHTML(toolA.tagline)}</td>
              <td>${escapeHTML(toolB.tagline)}</td>
            </tr>
            <tr>
              <td><strong>Category</strong></td>
              <td><span class="badge badge-verified">${escapeHTML(toolA.category.toUpperCase().replace('-', ' '))}</span></td>
              <td><span class="badge badge-verified">${escapeHTML(toolB.category.toUpperCase().replace('-', ' '))}</span></td>
            </tr>
            <tr>
              <td><strong>Pricing Model</strong></td>
              <td><span class="badge ${toolA.pricingType === 'Free' ? 'badge-free' : toolA.pricingType === 'Freemium' ? 'badge-freemium' : 'badge-paid'}">${escapeHTML(toolA.pricingType)}</span></td>
              <td><span class="badge ${toolB.pricingType === 'Free' ? 'badge-free' : toolB.pricingType === 'Freemium' ? 'badge-freemium' : 'badge-paid'}">${escapeHTML(toolB.pricingType)}</span></td>
            </tr>
            <tr>
              <td><strong>Starting Price</strong></td>
              <td><strong>${escapeHTML(toolA.startingPrice)}</strong></td>
              <td><strong>${escapeHTML(toolB.startingPrice)}</strong></td>
            </tr>
            <tr>
              <td><strong>Free Tier Details</strong></td>
              <td>${escapeHTML(toolA.freePlanDetails || 'No permanent free plan')}</td>
              <td>${escapeHTML(toolB.freePlanDetails || 'No permanent free plan')}</td>
            </tr>
            <tr>
              <td><strong>Best For</strong></td>
              <td>${escapeHTML(toolA.bestFor)}</td>
              <td>${escapeHTML(toolB.bestFor)}</td>
            </tr>
            <tr>
              <td><strong>Key Features</strong></td>
              <td>
                <ul class="feature-list">
                  ${toolA.verifiedFeatures.map(f => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-emerald)"><polyline points="20 6 9 17 4 12"/></svg> ${escapeHTML(f)}</li>`).join('')}
                </ul>
              </td>
              <td>
                <ul class="feature-list">
                  ${toolB.verifiedFeatures.map(f => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-emerald)"><polyline points="20 6 9 17 4 12"/></svg> ${escapeHTML(f)}</li>`).join('')}
                </ul>
              </td>
            </tr>
            <tr>
              <td><strong>Strengths (Pros)</strong></td>
              <td>
                <ul class="pro-con-list">
                  ${toolA.pros.map(p => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-emerald)"><polyline points="20 6 9 17 4 12"/></svg> ${escapeHTML(p)}</li>`).join('')}
                </ul>
              </td>
              <td>
                <ul class="pro-con-list">
                  ${toolB.pros.map(p => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-emerald)"><polyline points="20 6 9 17 4 12"/></svg> ${escapeHTML(p)}</li>`).join('')}
                </ul>
              </td>
            </tr>
            <tr>
              <td><strong>Trade-offs (Cons)</strong></td>
              <td>
                <ul class="pro-con-list">
                  ${toolA.cons.map(c => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-amber)"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ${escapeHTML(c)}</li>`).join('')}
                </ul>
              </td>
              <td>
                <ul class="pro-con-list">
                  ${toolB.cons.map(c => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-amber)"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ${escapeHTML(c)}</li>`).join('')}
                </ul>
              </td>
            </tr>
            <tr>
              <td><strong>Action / Visit</strong></td>
              <td>
                <a href="${toolA.affiliateUrl || toolA.officialUrl}" target="_blank" rel="noopener noreferrer nofollow" class="btn btn-primary btn-sm">
                  Visit ${escapeHTML(toolA.name)}
                </a>
                <a href="/tool/${toolA.slug}.html" class="btn btn-secondary btn-sm" style="margin-top: 0.5rem; display: inline-flex;">
                  Read Full Review
                </a>
              </td>
              <td>
                <a href="${toolB.affiliateUrl || toolB.officialUrl}" target="_blank" rel="noopener noreferrer nofollow" class="btn btn-primary btn-sm">
                  Visit ${escapeHTML(toolB.name)}
                </a>
                <a href="/tool/${toolB.slug}.html" class="btn btn-secondary btn-sm" style="margin-top: 0.5rem; display: inline-flex;">
                  Read Full Review
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ToolComparator();
});
