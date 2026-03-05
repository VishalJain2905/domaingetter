/**
 * Demo/test entry. Exposes run() on window so the demo page can
 * set __BOOKMARKLET_TEST_DOMAIN__ and call __BOOKMARKLET_RUN__().
 */
import { run } from './domainEngine.js';

if (typeof window !== 'undefined') {
  window.__BOOKMARKLET_RUN__ = run;
}
