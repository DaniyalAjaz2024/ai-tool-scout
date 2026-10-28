/**
 * AI Tool Scout - Instant Search & Filter Engine
 * Fast client-side search across name, tagline, description, tags, pricing, and category.
 */

import { Bookmarks } from './app.js';

class SearchEngine {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.searchClearBtn = document.getElementById('search-clear-btn');
    this.categoryChips = document.querySelectorAll('[data-category-filter]');
    this.pricingChips = document.querySelectorAll('[data-pricing-filter]');
    this.sortSelect = document.getElementById('sort-select');
    this.toolsGrid = document.getElementById('tools-grid');
    this.emptyState = document.getElementById('empty-search-state');
    this.resultsCount = document.getElementById('results-count');
    this.resetBtn = document.getElementById('reset-filters-btn');

    this.currentQuery = '';
    this.currentCategory = 'all';
    this.currentPricing = 'all';
    this.currentSort = 'featured';

    this.toolCards = [];
    this.init();
  }

  init() {
    if (!this.toolsGrid) return;

    // Cache tool card elements and their searchable metadata
    this.toolCards = Array.from(this.toolsGrid.querySelectorAll('.tool-card')).map(card => {
      return {
        el: card,
        id: card.getAttribute('data-tool-id') || '',
        name: (card.getAttribute('data-tool-name') || '').toLowerCase(),
        category: card.getAttribute('data-tool-category') || '',
        pricing: card.getAttribute('data-tool-pricing') || '',
        tagline: (card.getAttribute('data-tool-tagline') || '').toLowerCase(),
        tags: (card.getAttribute('data-tool-tags') || '').toLowerCase(),
        featured: card.getAttribute('data-tool-featured') === 'true',
        date: card.getAttribute('data-tool-date') || ''
      };
    });

    this.bindEvents();
    this.applyFilters();
  }

  bindEvents() {
    // Search input typing
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.currentQuery = e.target.value.trim().toLowerCase();
        if (this.searchClearBtn) {
          this.searchClearBtn.style.display = this.currentQuery.length > 0 ? 'inline-flex' : 'none';
        }
        this.applyFilters();
      });

      // Clear search button
      if (this.searchClearBtn) {
        this.searchClearBtn.addEventListener('click', () => {
          this.searchInput.value = '';
          this.currentQuery = '';
          this.searchClearBtn.style.display = 'none';
          this.searchInput.focus();
          this.applyFilters();
        });
      }

      // Keyboard shortcut "/" to focus search
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== this.searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          e.preventDefault();
          this.searchInput.focus();
        } else if (e.key === 'Escape' && document.activeElement === this.searchInput) {
          this.searchInput.value = '';
          this.currentQuery = '';
          if (this.searchClearBtn) this.searchClearBtn.style.display = 'none';
          this.searchInput.blur();
          this.applyFilters();
        }
      });
    }

    // Category filter chips
    this.categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategory = chip.getAttribute('data-category-filter') || 'all';
        this.applyFilters();
      });
    });

    // Pricing filter chips
    this.pricingChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.pricingChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentPricing = chip.getAttribute('data-pricing-filter') || 'all';
        this.applyFilters();
      });
    });

    // Sort select
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.applyFilters();
      });
    }

    // Reset button in empty state
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.resetAll();
      });
    }
  }

  applyFilters() {
    let visibleCards = this.toolCards.filter(item => {
      // Category match
      if (this.currentCategory !== 'all' && item.category !== this.currentCategory) {
        return false;
      }

      // Pricing match
      if (this.currentPricing !== 'all' && item.pricing.toLowerCase() !== this.currentPricing.toLowerCase()) {
        return false;
      }

      // Query search match
      if (this.currentQuery) {
        const query = this.currentQuery;
        const matchesName = item.name.includes(query);
        const matchesTagline = item.tagline.includes(query);
        const matchesTags = item.tags.includes(query);
        if (!matchesName && !matchesTagline && !matchesTags) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    visibleCards.sort((a, b) => {
      switch (this.currentSort) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
          return b.date.localeCompare(a.date);
        case 'featured':
        default:
          if (a.featured === b.featured) {
            return a.name.localeCompare(b.name);
          }
          return a.featured ? -1 : 1;
      }
    });

    // Update DOM visibility & order
    this.toolCards.forEach(item => {
      item.el.style.display = 'none';
    });

    visibleCards.forEach(item => {
      item.el.style.display = 'flex';
      this.toolsGrid.appendChild(item.el); // Reparent to ensure sort order
    });

    // Update results counter
    if (this.resultsCount) {
      this.resultsCount.textContent = `Showing ${visibleCards.length} verified tool${visibleCards.length === 1 ? '' : 's'}`;
    }

    // Empty state display
    if (this.emptyState) {
      if (visibleCards.length === 0) {
        this.emptyState.classList.add('active');
        this.toolsGrid.style.display = 'none';
      } else {
        this.emptyState.classList.remove('active');
        this.toolsGrid.style.display = 'grid';
      }
    }
  }

  resetAll() {
    this.currentQuery = '';
    this.currentCategory = 'all';
    this.currentPricing = 'all';
    this.currentSort = 'featured';

    if (this.searchInput) {
      this.searchInput.value = '';
    }
    if (this.searchClearBtn) {
      this.searchClearBtn.style.display = 'none';
    }

    this.categoryChips.forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-category-filter') === 'all');
    });

    this.pricingChips.forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-pricing-filter') === 'all');
    });

    if (this.sortSelect) {
      this.sortSelect.value = 'featured';
    }

    this.applyFilters();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SearchEngine();
});
