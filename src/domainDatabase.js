/**
 * Domain Database - Maps domains to task functions.
 * Each task updates progress, shows a popup, and logs to console.
 */

import { loadState, saveState, incrementDomain } from './stateManager.js';

/**
 * Create a standard domain task that updates progress, shows popup, and logs.
 * @param {string} domainKey - Domain key for progress.
 * @param {string} message - Message to show in popup and log.
 * @returns {Function} Task function to run when bookmarklet is used on that domain.
 */
function createDomainTask(domainKey, message) {
  return function runTask() {
    const state = loadState();
    if (!state || !state.initialized) {
      console.warn('[Bookmarklet] Initialize first on home domain.');
      return;
    }
    incrementDomain(state, domainKey);
    saveState(state);
    showPopup(message, state.progress[domainKey]);
    console.log('[Bookmarklet]', message, 'Progress:', state.progress[domainKey]);
  };
}

/**
 * Show a brief popup message on the page.
 * @param {string} text - Message text.
 * @param {number} [count] - Optional count to display.
 */
function showPopup(text, count) {
  const existing = document.getElementById('bookmarklet-popup');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'bookmarklet-popup';
  el.textContent = count !== undefined ? text + ' (' + count + ')' : text;
  Object.assign(el.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    padding: '12px 20px',
    background: '#1a1a2e',
    color: '#eee',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: '2147483647',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px',
    maxWidth: '320px',
    animation: 'bookmarklet-fadein 0.2s ease',
  });
  const style = document.createElement('style');
  style.textContent = '@keyframes bookmarklet-fadein{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(style);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

/**
 * Example: YouTube task.
 */
export function youtubeTask() {
  const run = createDomainTask('youtube.com', 'YouTube');
  run();
}

/**
 * Example: Twitter task.
 */
export function twitterTask() {
  const run = createDomainTask('twitter.com', 'Twitter');
  run();
}

/**
 * Example: Google task.
 */
export function googleTask() {
  const run = createDomainTask('google.com', 'Google');
  run();
}

/**
 * Domain database: hostname (no www) -> task function.
 */
export const domainDatabase = {
  'youtube.com': youtubeTask,
  'twitter.com': twitterTask,
  'x.com': twitterTask,
  'google.com': googleTask,
};
