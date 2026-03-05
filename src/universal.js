/**
 * Universal bookmarklet entry: compact, works on all sites including YouTube.
 * Uses data URI to bypass Trusted Types on YouTube while staying under 2KB.
 */

const STATE_KEY = 'bds';
const HOME_DOMAIN = 'example.com';

function normalizeDomain(h) {
  return (h || '').replace(/^www\./i, '');
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY));
  } catch (e) {
    return null;
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch (e) {}
}

function incrementDomain(state, domain) {
  if (!state.progress) state.progress = {};
  state.progress[domain] = (state.progress[domain] || 0) + 1;
  if (!state.completedDomains) state.completedDomains = [];
  if (!state.completedDomains.includes(domain)) {
    state.completedDomains.push(domain);
  }
}

function showPopup(text, count) {
  const el = document.createElement('div');
  el.id = 'bookmarklet-popup';
  el.textContent = count !== undefined ? text + ' (' + count + ')' : text;
  Object.assign(el.style, {
    position: 'fixed', top: '16px', right: '16px', padding: '12px 20px',
    background: '#1a1a2e', color: '#eee', borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: '2147483647',
    fontFamily: 'system-ui, sans-serif', fontSize: '14px', maxWidth: '320px',
    animation: 'bookmarklet-fadein 0.2s ease'
  });
  const existing = document.getElementById('bookmarklet-popup');
  if (existing) existing.remove();
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

const domainDatabase = {
  'youtube.com': function() { showPopup('YouTube', arguments[0]); },
  'netflix.com': function() { showPopup('Netflix', arguments[0]); },
  'twitter.com': function() { showPopup('Twitter', arguments[0]); },
  'x.com': function() { showPopup('X', arguments[0]); },
  'google.com': function() { showPopup('Google', arguments[0]); }
};

function run() {
  const domain = normalizeDomain(window.location.hostname);

  if (domain === HOME_DOMAIN) {
    const state = { initialized: true, startTime: Date.now(), progress: {}, completedDomains: [] };
    saveState(state);
    return;
  }

  let state = loadState();
  const task = domainDatabase[domain];

  if (!state || !state.initialized) {
    if (task) {
      state = { initialized: true, startTime: Date.now(), progress: {}, completedDomains: [] };
      saveState(state);
    } else {
      return;
    }
  }

  if (task) {
    incrementDomain(state, domain);
    saveState(state);
    task(state.progress[domain]);
  }
}

run();
