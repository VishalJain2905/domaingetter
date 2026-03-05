# Testing & Client Approval

This document answers: **how to test**, **how the client approves**, and **whether a separate UI is needed**. It also provides an acceptance checklist tied to the client spec.

---

## 1. Do we need a separate UI?

**No.** The bookmarklet already includes the UI required by the spec:

- **Progress tracking:** Floating progress widget (bottom-right) showing completion %, completed domains list, and elapsed time.
- **Per-domain feedback:** Popup message when the bookmarklet runs on a known domain (e.g. “YouTube task completed (2)”).
- **Timer:** Elapsed time since initialization, shown in the widget (HH:MM:SS).

There is **no separate web app or dashboard**. All interaction is: click bookmarklet → see widget + popups. For **client approval**, a **demo page** is provided so they can verify behavior without visiting real sites (see below).

---

## 2. How to test

### Option A – Demo page (recommended for client approval)

Simulates different domains on one page. No need to visit YouTube/Google.

1. **Build and serve:**
   ```bash
   npm install
   npm run build
   npm run test
   ```
2. **Open in browser:** http://localhost:3333/test/
3. **Use the buttons in order:**
   - **1. Init (home domain)** – Initializes state and timer; progress widget appears.
   - **2–4** – Simulate YouTube, Twitter, Google; each click updates progress, shows a popup, and updates the widget.
   - **5. Unsupported domain** – Simulates a domain not in the database (warning if not initialized; otherwise no action).
   - **Clear state** – Clears `localStorage` so you can run “Init” again.
4. **Verify:** Progress bar, “Completed” list, and “Time” in the widget update as expected; popups appear for known domains.

### Option B – Real bookmarklet on real sites

1. Build: `npm run build`
2. Create a bookmark whose URL is the **entire** contents of `build/bookmarklet.js`.
3. Set **home domain** in `src/domainEngine.js` (`HOME_DOMAIN`) to a domain you can open (e.g. `localhost` or your site).
4. Serve the project (e.g. `npx serve -p 3333`) and open that URL. Click the bookmarklet once to **initialize**.
5. Visit youtube.com, google.com, etc., and click the bookmarklet there to run domain-specific behavior.

---

## 3. How the client approves

### Step 1 – Run the demo

Share the repo (or a built copy) and ask the client to:

1. Run `npm run test` and open http://localhost:3333/test/
2. Click **1. Init (home domain)** and confirm the progress widget appears with 0% and a timer.
3. Click **2. YouTube**, **3. Twitter**, **4. Google** and confirm:
   - A popup appears each time (e.g. “YouTube task completed (1)”).
   - The widget shows increasing progress % and lists completed domains.
   - Elapsed time increases.
4. Click **5. Unsupported domain** and confirm nothing breaks and (if they didn’t init) they see the “run on home domain first” warning.
5. Click **Clear state**, then **1. Init** again, and confirm the flow can be repeated.

### Step 2 – Sign off on the acceptance checklist

The client can approve by confirming each line item below. Each item maps to the spec.

| # | Requirement | How to verify |
|---|-------------|----------------|
| 1 | **Home domain** hard-coded; used for init and tracking | Set in `src/domainEngine.js`; init only when bookmarklet runs on home domain. |
| 2 | **Domain database** (domain → function) | See `src/domainDatabase.js`; only listed domains run tasks. |
| 3 | **localStorage** for state (counts, progress, timer) | State in `bookmarklet_domain_state`; visible in DevTools → Application → Local Storage. |
| 4 | **Domain detection** via `window.location.hostname` | Demo simulates domains; real bookmarklet uses current site hostname. |
| 5 | **Domain-specific execution** when domain in database | Demo buttons 2–4 trigger popup + progress update; others do nothing (or warn). |
| 6 | **Unsupported domains** do nothing (or log) | Demo button 5; no task runs. |
| 7 | **Home domain** initializes progress/timer | Demo button 1 creates state and starts timer; widget appears. |
| 8 | **Per-domain interaction tracking** in localStorage | Progress and completedDomains update per domain; persist after refresh. |
| 9 | **Optional timer** from home domain init | Widget shows “Time: HH:MM:SS” from `startTime`. |
| 10 | **Single-line bookmarklet** for bookmarks bar | `build/bookmarklet.js` is one line starting with `javascript:(function(){...})();`. |
| 11 | **Progress bar + popups** | Floating widget with bar and list; popup per known-domain run. |
| 12 | **Docs** for adding domains and state behavior | README: “How to Add New Domains”, “How State Tracking Works”, “Resetting State”. |

**Client sign-off:** “I have run the demo and confirm the above requirements are met. Approved by: ___________ Date: ___________”

---

## 4. Spec summary (for dev)

- **Home domain:** Hard-coded; init and state context.
- **Domain database:** domain → function; only those domains run actions.
- **State:** localStorage; per-domain counts, progress, timer.
- **Domain detection:** hostname (www stripped).
- **Execution:** In DB → run function; not in DB → do nothing (or log).
- **Home domain behavior:** Init tracking/timer when clicked on home domain.
- **Unsupported sites:** Safely do nothing (or console warning).
- **Optional timer:** Started on home init; progress/elapsed in state and UI.
- **Deliverables:** Single-line bookmarklet, domain database, state management, documentation.

All of the above are implemented; the demo page and this doc support testing and client approval.
