/**
 * AI Tool Scout - Global Application Logic
 * Mobile nav, saved bookmarks, modals, share toasts, and security helpers.
 */

// Safe HTML Escape helper
export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Toast notification dispatcher
export function showToast(message, duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// LocalStorage Bookmark Manager
export const Bookmarks = {
  KEY: 'ai_tool_scout_bookmarks',
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch {
      return [];
    }
  },
  toggle(toolId) {
    const list = this.getAll();
    const index = list.indexOf(toolId);
    let added = false;
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(toolId);
      added = true;
    }
    localStorage.setItem(this.KEY, JSON.stringify(list));
    this.updateUI();
    return added;
  },
  has(toolId) {
    return this.getAll().includes(toolId);
  },
  updateUI() {
    const list = this.getAll();
    document.querySelectorAll('[data-bookmark-id]').forEach(btn => {
      const id = btn.getAttribute('data-bookmark-id');
      const isSaved = list.includes(id);
      btn.classList.toggle('active', isSaved);
      btn.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
      btn.title = isSaved ? 'Remove from saved tools' : 'Save tool to favorites';
    });

    const countElem = document.getElementById('saved-count-badge');
    if (countElem) {
      countElem.textContent = list.length;
      countElem.style.display = list.length > 0 ? 'inline-flex' : 'none';
    }
  }
};

// Global DOM Initialization
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Mobile Nav Toggle
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Close on click outside
      document.addEventListener('click', (e) => {
        if (!mobileToggle.contains(e.target) && !mobileDrawer.contains(e.target) && mobileDrawer.classList.contains('open')) {
          mobileDrawer.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Bookmark Button Click Delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-bookmark-id]');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-bookmark-id');
        const isAdded = Bookmarks.toggle(id);
        showToast(isAdded ? 'Saved to your bookmarked tools!' : 'Removed from bookmarks');
      }
    });

    // Modal Openers & Closers
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-modal-open');
        const modal = document.getElementById(targetId);
        if (modal) {
          modal.classList.add('open');
          modal.setAttribute('aria-hidden', 'false');
        }
      });
    });

    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('open');
          modal.setAttribute('aria-hidden', 'true');
        }
      });
    });

    // Share Page Buttons
    document.querySelectorAll('[data-share-url]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const url = btn.getAttribute('data-share-url') || window.location.href;
        const title = btn.getAttribute('data-share-title') || document.title;

        if (navigator.share) {
          try {
            await navigator.share({ title, url });
          } catch {
            // User cancelled
          }
        } else {
          await navigator.clipboard.writeText(url);
          showToast('Link copied to clipboard!');
        }
      });
    });

    // Submit Tool Form (Client-Side Mock/Honeypot Protection)
    const submitForm = document.getElementById('submit-tool-form');
    if (submitForm) {
      submitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Honeypot check
        const hp = submitForm.querySelector('input[name="website_hp"]');
        if (hp && hp.value !== '') {
          // Spam bot detected
          return;
        }

        showToast('Tool submission received! Our editors verify all tools before publishing.');
        submitForm.reset();
        const modal = submitForm.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
      });
    }

    // Sync bookmarks state
    Bookmarks.updateUI();
  });
}

