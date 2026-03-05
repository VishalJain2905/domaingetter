/**
 * Bookmarklet entry point. Invoked when user clicks the bookmarklet.
 */

import { run } from './domainEngine.js';

(function () {
  try {
    run();
    if (typeof window !== 'undefined' && window.__BOOKMARKLET_TEST_DOMAIN__ !== undefined) {
      window.__BOOKMARKLET_RUN__ = run;
    }
  } catch (err) {
    console.error('[Bookmarklet] Error:', err);
  }
})();
