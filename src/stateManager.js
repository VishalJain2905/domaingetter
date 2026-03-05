/**
 * State Manager - Persists and manages bookmarklet state in localStorage.
 */

const STATE_KEY = 'bds';

/**
 * Load state from localStorage.
 * @returns {Object} State object or default empty state.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[Bookmarklet] Failed to load state:', e);
    return null;
  }
}

/**
 * Save state to localStorage.
 * @param {Object} state - State object to persist.
 */
export function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[Bookmarklet] Failed to save state:', e);
  }
}

/**
 * Increment progress for a domain and mark as completed if not already.
 * @param {Object} state - Current state object (will be mutated).
 * @param {string} domain - Domain key to increment.
 * @param {number} [count=1] - Amount to add to progress.
 */
export function incrementDomain(state, domain, count = 1) {
  if (!state.progress) state.progress = {};
  state.progress[domain] = (state.progress[domain] || 0) + count;
  if (!state.completedDomains) state.completedDomains = [];
  if (!state.completedDomains.includes(domain)) {
    state.completedDomains.push(domain);
  }
}

/**
 * Reset state (clear progress, keep structure).
 * @returns {Object} Fresh state with initialized: false.
 */
export function resetState() {
  const newState = {
    initialized: false,
    startTime: null,
    progress: {},
    completedDomains: [],
  };
  saveState(newState);
  return newState;
}
