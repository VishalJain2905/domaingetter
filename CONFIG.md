# Bookmarklet configuration

This document describes what the system does and where to change it.

## Steps to follow (user flow)

1. **Initialize on home domain** – User visits **https://domaingetters.onrender.com/** and clicks the bookmarklet. A popup shows the steps for the reward.
2. **Complete each site** – User goes to **YouTube**, **Netflix**, **X**, **Google** and clicks the bookmarklet on each. Each click shows a “completed” popup and counts toward the reward.
3. **Unlock reward** – After all 4 sites are completed, a reward popup appears and the user is redirected to the reward page.

Supported domains (no twitter.com): **youtube.com**, **netflix.com**, **x.com**, **google.com**.

---

## Site URL (production)

For **https://domaingetters.onrender.com/** the following are set:

| What | Where | Current value |
|------|--------|----------------|
| **Home domain** (where the bookmarklet “initializes” progress) | `src/domainEngine.js`, `src/engine-inline.js`, `src/universal.js` → `HOME_DOMAIN` | `domaingetters.onrender.com` |
| **Reward redirect** (after all tasks completed) | `src/domainDatabase.js` → `REWARD_REDIRECT_URL`, `src/universal.js` → `REWARD_REDIRECT_URL` | `https://domaingetters.onrender.com/test/reward.html` |
| **Loader base URL** (fetch script from your server) | Not stored in source. On the install page it uses `location.origin`, so when users open your install page at `https://domaingetters.onrender.com/install.html`, the loader bookmarklet automatically points to your site. | (dynamic) |

To use a different domain or reward URL, change `HOME_DOMAIN` and `REWARD_REDIRECT_URL` in the files above, then run `npm run build` (and redeploy if needed).

## Supported domains

The bookmarklet runs **domain-specific actions** only on these hosts (without `www.`):

- youtube.com  
- netflix.com  
- x.com  
- google.com  

**To add or change domains:** edit the `DOMAIN_CONFIG` array in `src/domainDatabase.js`. For the **universal** bookmarklet (single-file), also edit the `DOMAINS` array in `src/universal.js` so both stay in sync.

---

## Domain actions (what happens on each domain)

On each supported domain, when the user runs the bookmarklet:

1. **Increment counter** – The visit/action count for that domain is incremented and stored in `localStorage`.
2. **Show popup** – A small popup shows the domain label and current count (e.g. “YouTube completed (3)”).
3. **Optional redirect** – If you set a `redirectAfter` URL for that domain in config, the user is redirected there after ~1.5 seconds.
4. **Track interactions** – Progress and `completedDomains` are updated so completion and rewards can be calculated.

---

## Home domain behavior

- **Home domain:** `domaingetters.onrender.com` (set in `src/domainEngine.js`, `src/engine-inline.js`, and `src/universal.js` as `HOME_DOMAIN`).
- **When the bookmarklet is run on the home domain:**  
  State is **initialized** (or reset), and a **popup shows the steps for the reward** (YouTube → Netflix → X → Google). User must start here first.
- **When the bookmarklet is run on any other domain:**  
  If state is not initialized yet, it is **auto-initialized** on first run on a *supported* domain so the bookmarklet works per-site without requiring a prior visit to the home domain.

---

## Progress tracking

Stored in `localStorage` under the key `bds`:

- **Click counts** – Per-domain counts in `state.progress[domain]`.
- **Task completion per domain** – A domain is added to `completedDomains` the first time the user runs the action there.
- **Time spent** – `startTime` is stored; the full build’s progress widget shows elapsed time.
- **Progress percentage** – In the full build, the widget shows `completedDomains.length / total domains * 100%`.

---

## Completion / reward logic

- **When are “all tasks” completed?**  
  When the user has run the bookmarklet on **every** supported domain at least once (i.e. `completedDomains.length === total domains`).
- **What happens then?**
  1. **Reward unlocked** – `state.rewardUnlocked` is set and saved.
  2. **Reward popup** – A centered popup appears: “All tasks complete! Reward unlocked.” (with a short animation).
  3. **Optional redirect** – If `REWARD_REDIRECT_URL` is set in `src/domainDatabase.js` (and in `src/universal.js` as `REWARD_REDIRECT_URL` for the universal build), the user is redirected to that URL after ~2.5 seconds.

**Where to set the reward redirect:**

- Full / inline build: `src/domainDatabase.js` → `REWARD_REDIRECT_URL`.
- Universal build: `src/universal.js` → `REWARD_REDIRECT_URL`.

---

## Per-domain redirect

To redirect the user after the action on a **specific** domain:

- Full / inline: In `src/domainDatabase.js`, set `redirectAfter: 'https://...'` for that domain in `DOMAIN_CONFIG`.
- Universal: In `src/universal.js`, set `r: 'https://...'` for that domain in `DOMAINS`.

---

## Where rewards and redirects run

| Feature              | Full build (widget) | Inline build | Universal build |
|----------------------|---------------------|-------------|------------------|
| Increment counters   | Yes                 | Yes         | Yes              |
| Popups               | Yes                 | Yes         | Yes              |
| Per-domain redirect  | Yes                 | Yes         | Yes              |
| Reward unlock popup  | Yes                 | Yes         | Yes              |
| Reward redirect URL  | Yes                 | Yes         | Yes              |
| Progress widget      | Yes                 | No          | No               |

All of this runs **on the site where the bookmarklet is executed** (e.g. on YouTube, Netflix, or your home domain). The only “our site” behavior is when you set the **home domain** to your own domain; then the bookmarklet on that domain only initializes (or resets) progress.
