/**
 * Engine for inline bookmarklet: same as domainEngine but uses ui-stub (no widget).
 * Use this entry so the bundle is smaller and works on Trusted Types sites (YouTube).
 */

const HOME_DOMAIN = 'example.com';

import { loadState, saveState, incrementDomain } from './stateManager.js';
import { domainDatabase } from './domainDatabase.js';
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
