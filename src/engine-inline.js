/**
 * Engine for inline bookmarklet: same as domainEngine but uses ui-stub (no widget).
 * Use this entry so the bundle is smaller and works on Trusted Types sites (YouTube).
 */

const HOME_DOMAIN = 'domaingetters.onrender.com';

import { loadState, saveState, incrementDomain } from './stateManager.js';
import { domainDatabase, showMessage, DOMAIN_CONFIG } from './domainDatabase.js';
import { updateProgressUI } from './ui-stub.js';

function normalizeDomain(hostname) {
  if (!hostname || typeof hostname !== 'string') return '';
  return hostname.replace(/^www\./i, '');
}

function getCurrentDomain() {
  return normalizeDomain(window.location.hostname);
}

function initializeState() {
  const state = {
    initialized: true,
    startTime: Date.now(),
    progress: {},
    completedDomains: [],
  };
  saveState(state);
  return state;
}

export function run() {
  const domain = getCurrentDomain();

  if (domain === HOME_DOMAIN) {
    initializeState();
    var steps = [
      'Steps for reward:',
      '1. You\'re here (started!)',
      '2. Go to YouTube → click bookmarklet',
      '3. Go to Netflix → click bookmarklet',
      '4. Go to X → click bookmarklet',
      '5. Go to Google → click bookmarklet',
      'Complete all 4 sites to unlock your reward!'
    ].join('\n');
    showMessage(steps);
    updateProgressUI();
    return;
  }

  let state = loadState();
  const domainHasTask = !!domainDatabase[domain];

  if (!state || !state.initialized) {
    if (domainHasTask) {
      state = {
        initialized: true,
        startTime: Date.now(),
        progress: {},
        completedDomains: [],
      };
      saveState(state);
    } else {
      return;
    }
  }

  if (domainHasTask) {
    domainDatabase[domain]();
    const updatedState = loadState();
    if (updatedState) saveState(updatedState);
  }

  updateProgressUI();
}
