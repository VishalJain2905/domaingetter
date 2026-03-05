/**
 * Domain configuration and actions.
 * Supports: increment counters, popups, redirects, reward unlock when all domains completed.
 */

import { loadState, saveState, incrementDomain } from './stateManager.js';

// --- Config: set these for your use case ---
/** When all domains are completed, redirect user here (e.g. reward page). Leave '' to only show popup. */
export const REWARD_REDIRECT_URL = 'https://domaingetters.onrender.com/test/reward.html';

/** Per-domain: optional redirect URL after running this domain's action. '' = no redirect. */
const DOMAIN_CONFIG = [
  { domain: 'youtube.com', label: 'YouTube', redirectAfter: '' },
  { domain: 'twitter.com', label: 'Twitter', redirectAfter: '' },
  { domain: 'google.com', label: 'Google', redirectAfter: '' },
];

const DOMAIN_MAP = {};
DOMAIN_CONFIG.forEach(function (c) {
  DOMAIN_MAP[c.domain] = c;
});

export const domainDatabase = {};
DOMAIN_CONFIG.forEach(function (c) {
  domainDatabase[c.domain] = createTask(c.domain, c.label, c.redirectAfter);
});

function createTask(domainKey, label, redirectUrl) {
  return function runTask() {
    const state = loadState();
    if (!state || !state.initialized) return;
    incrementDomain(state, domainKey);
    saveState(state);
    showPopup(label + ' completed', state.progress[domainKey]);
    if (redirectUrl) {
      setTimeout(function () { window.location.href = redirectUrl; }, 1500);
    }
    checkRewardUnlock();
  };
}

function showPopup(text, count) {
  const existing = document.getElementById('bookmarklet-popup');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'bookmarklet-popup';
  el.textContent = count !== undefined ? text + ' (' + count + ')' : text;
  Object.assign(el.style, {
    position: 'fixed', top: '16px', right: '16px', padding: '12px 20px',
    background: '#1a1a2e', color: '#eee', borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: '2147483647',
    fontFamily: 'system-ui, sans-serif', fontSize: '14px', maxWidth: '320px',
    animation: 'bookmarklet-fadein 0.2s ease',
  });
  const style = document.createElement('style');
  style.textContent = '@keyframes bookmarklet-fadein{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}';
  if (!document.getElementById('bookmarklet-popup-style')) {
    style.id = 'bookmarklet-popup-style';
    document.head.appendChild(style);
  }
  document.body.appendChild(el);
  setTimeout(function () { el.remove(); }, 2500);
}

function showRewardPopup() {
  const existing = document.getElementById('bookmarklet-reward');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'bookmarklet-reward';
  el.innerHTML = '&#127873; All tasks complete! Reward unlocked.';
  Object.assign(el.style, {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    padding: '24px 32px', background: 'linear-gradient(135deg,#1a1a2e,#2d1b4e)',
    color: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    fontFamily: 'system-ui, sans-serif', fontSize: '18px', fontWeight: '600',
    zIndex: '2147483647', textAlign: 'center',
    animation: 'bookmarklet-reward-in 0.4s ease',
  });
  const style = document.createElement('style');
  style.textContent = '@keyframes bookmarklet-reward-in{0%{opacity:0;transform:translate(-50%,-50%) scale(0.9)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}';
  if (!document.getElementById('bookmarklet-reward-style')) {
    style.id = 'bookmarklet-reward-style';
    document.head.appendChild(style);
  }
  document.body.appendChild(el);
  setTimeout(function () { el.remove(); }, 3000);
}

function checkRewardUnlock() {
  const state = loadState();
  if (!state || !state.completedDomains) return;
  const total = DOMAIN_CONFIG.length;
  const completed = state.completedDomains.length;
  if (completed < total) return;
  if (state.rewardUnlocked) return;
  state.rewardUnlocked = true;
  saveState(state);
  showRewardPopup();
  if (REWARD_REDIRECT_URL) {
    setTimeout(function () { window.location.href = REWARD_REDIRECT_URL; }, 2500);
  }
}

export { DOMAIN_CONFIG, DOMAIN_MAP };
