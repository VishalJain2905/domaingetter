/**
 * Domain Engine - Detects domain, runs tasks, orchestrates execution flow.
 */

const HOME_DOMAIN = 'example.com';

import { loadState, saveState, incrementDomain } from './stateManager.js';
import { domainDatabase } from './domainDatabase.js';
import { updateProgressUI } from './ui.js';

/**
 * Normalize hostname by removing "www." prefix.
 * @param {string} hostname
 * @returns {string}
 */
export function normalizeDomain(hostname) {
  if (!hostname || typeof hostname !== 'string') return '';
  return hostname.replace(/^www\./i, '');
}

/**
 * Get current page domain (normalized).
 * In test/demo mode, uses window.__BOOKMARKLET_TEST_DOMAIN__ if set.
 * @returns {string}
 */
export function getCurrentDomain() {
  if (typeof window !== 'undefined' && window.__BOOKMARKLET_TEST_DOMAIN__ !== undefined) {
    return normalizeDomain(String(window.__BOOKMARKLET_TEST_DOMAIN__));
  }
  return normalizeDomain(window.location.hostname);
}

/**
 * Initialize state when on home domain. Creates state in localStorage.
 * @returns {Object} New state.
 */
function initializeState() {
  const state = {
    initialized: true,
    startTime: Date.now(),
    progress: {},
    completedDomains: [],
  };
  saveState(state);
  console.log('[Bookmarklet] Initialized on home domain. Start time:', new Date(state.startTime).toISOString());
  return state;
}

/**
 * Main execution: run when bookmarklet is clicked.
 * Flow: detect domain → if home init state → if domain in DB run task → update progress → save → update UI.
 * On a known domain with no state, auto-initialize for this origin so it works on real sites (progress is per-origin).
 */
export function run() {
  const domain = getCurrentDomain();

  if (domain === HOME_DOMAIN) {
    initializeState();
    updateProgressUI();
    return;
  }

  let state = loadState();
  const domainHasTask = !!domainDatabase[domain];

  // No state yet: on a known domain, init for this origin so real-site use works (localStorage is per-origin).
  if (!state || !state.initialized) {
    if (domainHasTask) {
      state = {
        initialized: true,
        startTime: Date.now(),
        progress: {},
        completedDomains: [],
      };
      saveState(state);
      console.log('[Bookmarklet] Auto-initialized on', domain, '(first run on this site).');
    } else {
      console.warn('[Bookmarklet] Run on home domain first to initialize, or visit a supported domain.');
      return;
    }
  }

  if (domainHasTask) {
    const task = domainDatabase[domain];
    task();
    const updatedState = loadState();
    if (updatedState) saveState(updatedState);
  }

  updateProgressUI();
}

export { HOME_DOMAIN };
