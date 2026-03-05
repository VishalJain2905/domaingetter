/**
 * Timer - Elapsed time since startTime from state.
 */

import { loadState } from './stateManager.js';

/**
 * Get elapsed time in seconds since state.startTime.
 * @returns {number} Elapsed seconds, or 0 if not initialized.
 */
export function getElapsedSeconds() {
  const state = loadState();
  if (!state || !state.initialized || !state.startTime) return 0;
  return Math.floor((Date.now() - state.startTime) / 1000);
}

/**
 * Format seconds as HH:MM:SS.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatElapsed(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return pad(h) + ':' + pad(m) + ':' + pad(s);
}
