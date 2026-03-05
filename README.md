# Domain-Aware Bookmarklet System

A JavaScript bookmarklet that runs different behavior depending on the website domain. State is stored in `localStorage`, and a floating progress UI shows completion and elapsed time.

## How the Bookmarklet Works

1. **You click the bookmarklet** on any page.
2. **Domain is detected** via `window.location.hostname` (with `www.` stripped).
3. **If the current site is the home domain** (see below), the system **initializes**: it creates a state object in `localStorage` and starts the timer. The progress widget appears.
4. **If the domain is in the domain database**, its **task function** runs: it updates progress, shows a popup, and logs to the console.
5. **State is saved** and the **progress UI** is updated (progress %, completed domains, elapsed time).

Execution flow:

```
User clicks bookmarklet
  → detect domain (normalize: remove www)
  → if home domain → initialize state in localStorage
  → if domain in database → run its task (update progress, popup, console log)
  → save state
  → update floating progress UI
```

## How State Tracking Works

- **Storage key:** `bds` in `localStorage`.
- **State shape:**
  ```json
  {
    "initialized": true,
    "startTime": 1234567890123,
    "progress": { "youtube.com": 2, "google.com": 1 },
    "completedDomains": ["youtube.com", "google.com"]
  }
  ```
- **Initialization** happens when you run the bookmarklet on the **home domain**, or on **first run on a supported domain** (so it works on real sites; see below).
- **Progress** is updated per domain when you run the bookmarklet on a known domain; each domain can be counted multiple times.
- **Elapsed time** is computed from `startTime` and shown in the UI.

### Why it didn’t work on real sites (YouTube, Google, etc.)

**localStorage is per-origin.** The demo runs on `localhost:3333`, so state lives in localhost’s storage. When you open youtube.com and click the bookmarklet, it runs in YouTube’s origin and only sees **YouTube’s** localStorage—which is empty, so it used to say “Run on home domain first” and do nothing.

**Fix:** On a **supported domain** (one in the domain database), if there’s no state yet, the bookmarklet now **auto-initializes** for that origin and runs the domain task. So the first click on YouTube/Google/etc. creates state and runs the task; later clicks update progress. Progress is **per-site** (each site has its own state). For one shared progress across all sites you’d need a small API on your home domain to store state; the current build uses only localStorage.

## Testing & client approval

- **How to test:** Use the demo page (simulate domains in one place) or the real bookmarklet on real sites. See **[TESTING_AND_APPROVAL.md](TESTING_AND_APPROVAL.md)** for step-by-step instructions.
- **How the client approves:** Run the demo at `http://localhost:3333/test/` (after `npm run test`) and sign off on the acceptance checklist in that doc.
- **UI:** The bookmarklet already includes a progress widget and per-domain popups; no separate app UI is required. The demo page is only for testing and approval.

## Deploy (Render, Vercel, Netlify)

Deploy to get an **HTTPS URL** so the loader works on Netflix and other strict sites. See **[DEPLOY.md](DEPLOY.md)** for step-by-step instructions. On **Render**, use a **Web Service** (not Static Site) so the server sends CORS: Build `npm install && npm run build:static`, Start `npm start`, then open `https://your-app.onrender.com/install.html` and use the loader bookmark.

## Home Domain

The home domain is set in `src/domainEngine.js`:

```js
const HOME_DOMAIN = 'example.com';
```

Change this to a domain you control (e.g. `localhost` or your own site). You must run the bookmarklet once on this domain to initialize state before using it on other domains.

## How to Add New Domains

1. Open **`src/domainDatabase.js`**.
2. Add a **task function** (or reuse the pattern from `createDomainTask`):
   ```js
   export function mySiteTask() {
     const run = createDomainTask('mysite.com', 'MySite task completed');
     run();
   }
   ```
3. Register it in **`domainDatabase`**:
   ```js
   export const domainDatabase = {
     // ...
     'mysite.com': mySiteTask,
   };
   ```
4. Run **`npm run build`** and use the new bookmarklet.

## How to Install the Bookmarklet

**Important:** Use only the bookmarklet from **this** project. If your bookmark URL contains `bookmarkletState`, "Home Domain Logic", or `alert("Hello from YouTube!")`, that’s a different script—replace it with the one below.

**Option A – Install page (no copy‑paste)**

1. Build and serve: `npm run build` then `npm run test`.
2. Open **http://localhost:3333/install.html** in your browser.
3. Drag the **“Domain Bookmarklet”** link to your bookmarks bar (or right‑click it → Add to bookmarks). Prefer the "Domain Bookmarklet (loader)" link to avoid Chrome truncation; if you get "Unexpected identifier $" on real sites, use the loader.

**Option B – Manual**

1. **Build** the bookmarklet:
   ```bash
   npm install
   npm run build
   ```
2. Open **`build/bookmarklet.js`**. It contains a single line: `javascript:(function(){...})();`
3. **Create a bookmark** in your browser:
   - **Chrome / Edge:** Bookmark any page, then edit the bookmark and set the **URL** to the full contents of `build/bookmarklet.js`.
   - **Firefox:** Right‑click the bookmarks bar → New Bookmark. Name it (e.g. “Domain Bookmarklet”), paste the contents of `build/bookmarklet.js` into the **URL** field.
   - **Safari:** Add a bookmark, then edit it and paste the bookmarklet code into the address field.
4. **Initialize:** Visit your home domain (see above) and click the bookmarklet once. Or just use it on YouTube/Google—it will auto-initialize on first click there.

## Loader on Netflix / HTTPS sites (CORS and CSP)

If the **loader** bookmarklet shows **CORS** or **"Failed to fetch"** on a site (e.g. Netflix):

1. **CORS:** The dev server must send `Access-Control-Allow-Origin`. Use **`npm run test`** (it runs `server.js` with CORS). Do not rely on `npx serve` alone—it does not add CORS.
2. **Netflix / strict HTTPS sites:** Their Content Security Policy allows only **https:**. So **`http://localhost` is blocked** on Netflix. To use the loader there:
   - **Option A:** Host `build/bookmarklet-core.js` on an **HTTPS** URL (your own site, Vercel, Netlify, etc.). Build with `BOOKMARKLET_BASE_URL=https://your-site.com npm run build`, then use the loader bookmark from the new `build/bookmarklet-loader.js`.
   - **Option B:** Use a tunnel (e.g. [ngrok](https://ngrok.com)): `ngrok http 3333`, then set `BOOKMARKLET_BASE_URL` to the `https://` URL ngrok gives you, rebuild, and use the loader so it fetches the core from that HTTPS URL.

The **"Unexpected end of input"** errors happen when the fetch fails (e.g. CORS/CSP) and the loader tried to run empty or non-JS content; the loader now checks the response and length before running the script.

**YouTube / TrustedScriptURL:** The loader cannot run on YouTube (Trusted Types block script injection). Use the **inline** bookmarklet: on the install page, drag "Inline (for YouTube)" to your bookmarks bar. It is under 2KB and works on YouTube. Run npm run build, redeploy, then use that link.

## Project Structure

```
src/
  index.js          # Entry; runs the engine
  domainEngine.js   # Domain detection, HOME_DOMAIN, execution flow
  domainDatabase.js # Domain → task mapping and task implementations
  stateManager.js   # loadState, saveState, incrementDomain, resetState
  ui.js             # Floating progress widget
  timer.js          # Elapsed time helpers
build/
  bookmarklet.js   # Built one-line bookmarklet (after npm run build)
build.js           # Node build script (bundle + minify → bookmarklet)
```

## Resetting State

To clear progress and start over, you can:

- **Re-initialize:** Run the bookmarklet again on the home domain. This overwrites state with a new `startTime` and empty progress.
- **Programmatic reset:** The `resetState()` function in `stateManager.js` clears state and saves a fresh structure. You can expose it via a second bookmarklet or a small script in the console that imports/calls it (e.g. in a dev build or by running the bundled code with a different entry that calls `resetState()`).

## Development

- Source is **ES modules** in `src/`.
- Build uses **esbuild** (bundle) and **terser** (minify), then wraps the result as `javascript:(function(){...})();`.
- Edit `src/*.js`, then run `npm run build` to regenerate `build/bookmarklet.js`.
# domaingetter
