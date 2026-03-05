/**
 * Progress UI - Floating widget showing progress %, completed domains, and elapsed time.
 */

import { loadState } from './stateManager.js';
import { getElapsedSeconds, formatElapsed } from './timer.js';
import { domainDatabase } from './domainDatabase.js';

const WIDGET_ID = 'bw';
const TOTAL_DOMAINS = Object.keys(domainDatabase).length;

/**
 * Compute progress percentage from state (completed domains / total known domains).
 * @param {Object} state
 * @returns {number} 0-100
 */
function getProgressPercent(state) {
  if (!state || !state.completedDomains) return 0;
  const completed = state.completedDomains.length;
  return TOTAL_DOMAINS ? Math.min(100, Math.round((completed / TOTAL_DOMAINS) * 100)) : 0;
}

/**
 * Ensure widget styles are injected once.
 */
function ensureStyles() {
  if (document.getElementById('bookmarklet-widget-styles')) return;
  const style = document.createElement('style');
  style.id = 'bookmarklet-widget-styles';
  const id = WIDGET_ID;
  style.textContent = '#' + id + '{position:fixed;bottom:16px;right:16px;padding:12px 16px;background:#1a1a2e;color:#eaeaea;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.35);z-index:2147483646;font:12px system-ui,sans-serif;min-width:160px;line-height:1.4}#' + id + ' .t{font-weight:600;margin-bottom:6px}#' + id + ' .r{margin:4px 0}#' + id + ' .bar{height:6px;background:rgba(255,255,255,0.15);border-radius:3px;overflow:hidden;margin-top:6px}#' + id + ' .fill{height:100%;background:linear-gradient(90deg,#4361ee,#3a0ca3);border-radius:3px;transition:width 0.2s ease}';
  document.head.appendChild(style);
}

/**
 * Create or update the floating progress widget.
 */
export function updateProgressUI() {
  ensureStyles();
  let widget = document.getElementById(WIDGET_ID);
  if (!widget) {
    widget = document.createElement('div');
    widget.id = WIDGET_ID;
    document.body.appendChild(widget);
  }

  const state = loadState();
  const percent = getProgressPercent(state);
  const elapsed = getElapsedSeconds();
  const timeStr = formatElapsed(elapsed);
  const completedList = state && state.completedDomains && state.completedDomains.length
    ? state.completedDomains.join(', ')
    : 'None';

  widget.innerHTML = '<div class="t">Progress</div><div class="r">' + percent + '%</div><div class="r">' + completedList + '</div><div class="r">' + timeStr + '</div><div class="bar"><div class="fill" style="width:' + percent + '%"></div></div>';
}

/**
 * Remove the progress widget from the DOM.
 */
export function removeProgressUI() {
  const widget = document.getElementById(WIDGET_ID);
  if (widget) widget.remove();
}
