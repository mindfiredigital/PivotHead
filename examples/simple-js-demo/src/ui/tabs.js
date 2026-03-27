'use strict';
import { appState } from '../../state.js';
import { logger } from '../../logger.js';

// Switch between tabs
export function switchTab(tabName) {
  // Update all tab buttons (there's one set in each tab content)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });

  // If switching to analytics tab, initialize or re-initialize with current data
  if (tabName === 'analytics') {
    // Delegate to chart module via the registered callback
    if (typeof appState.onInitializeAnalyticsTab === 'function') {
      appState.onInitializeAnalyticsTab();
    }
  }
}

// Setup tab event listeners
export function setupTabEventListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
}
