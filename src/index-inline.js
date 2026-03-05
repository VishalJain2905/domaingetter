/**
 * Entry for inline bookmarklet (no widget). Runs in bookmark's javascript: URL so no Trusted Types.
 */
import { run } from './engine-inline.js';

(function () {
  try {
    run();
  } catch (err) {}
})();
