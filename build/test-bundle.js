(() => {
  // src/stateManager.js
  var STATE_KEY = "bds";
  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[Bookmarklet] Failed to load state:", e);
      return null;
    }
  }
  function saveState(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("[Bookmarklet] Failed to save state:", e);
    }
  }
  function incrementDomain(state, domain, count = 1) {
    if (!state.progress) state.progress = {};
    state.progress[domain] = (state.progress[domain] || 0) + count;
    if (!state.completedDomains) state.completedDomains = [];
    if (!state.completedDomains.includes(domain)) {
      state.completedDomains.push(domain);
    }
  }

  // src/domainDatabase.js
  var REWARD_REDIRECT_URL = "https://domaingetters.onrender.com/test/reward.html";
  var DOMAIN_CONFIG = [
    { domain: "youtube.com", label: "YouTube", redirectAfter: "" },
    { domain: "netflix.com", label: "Netflix", redirectAfter: "" },
    { domain: "google.com", label: "Google", redirectAfter: "" }
  ];
  var DOMAIN_MAP = {};
  DOMAIN_CONFIG.forEach(function(c) {
    DOMAIN_MAP[c.domain] = c;
  });
  var domainDatabase = {};
  DOMAIN_CONFIG.forEach(function(c) {
    domainDatabase[c.domain] = createTask(c.domain, c.label, c.redirectAfter);
  });
  function createTask(domainKey, label, redirectUrl) {
    return function runTask() {
      const state = loadState();
      if (!state || !state.initialized) return;
      incrementDomain(state, domainKey);
      saveState(state);
      showPopup(label + " completed", state.progress[domainKey]);
      if (redirectUrl) {
        setTimeout(function() {
          window.location.href = redirectUrl;
        }, 1500);
      }
      checkRewardUnlock();
    };
  }
  function showPopup(text, count) {
    const existing = document.getElementById("bookmarklet-popup");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.id = "bookmarklet-popup";
    el.textContent = count !== void 0 ? text + " (" + count + ")" : text;
    Object.assign(el.style, {
      position: "fixed",
      top: "16px",
      right: "16px",
      padding: "12px 20px",
      background: "#1a1a2e",
      color: "#eee",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      zIndex: "2147483647",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      maxWidth: "320px",
      whiteSpace: "pre-line",
      animation: "bookmarklet-fadein 0.2s ease"
    });
    const style = document.createElement("style");
    style.textContent = "@keyframes bookmarklet-fadein{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}";
    if (!document.getElementById("bookmarklet-popup-style")) {
      style.id = "bookmarklet-popup-style";
      document.head.appendChild(style);
    }
    document.body.appendChild(el);
    setTimeout(function() {
      el.remove();
    }, 2500);
  }
  function showMessage(text) {
    showPopup(text);
  }
  function showRewardPopup() {
    const existing = document.getElementById("bookmarklet-reward");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.id = "bookmarklet-reward";
    el.innerHTML = "&#127873; All tasks complete! Reward unlocked.";
    Object.assign(el.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      padding: "24px 32px",
      background: "linear-gradient(135deg,#1a1a2e,#2d1b4e)",
      color: "#fff",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      fontFamily: "system-ui, sans-serif",
      fontSize: "18px",
      fontWeight: "600",
      zIndex: "2147483647",
      textAlign: "center",
      animation: "bookmarklet-reward-in 0.4s ease"
    });
    const style = document.createElement("style");
    style.textContent = "@keyframes bookmarklet-reward-in{0%{opacity:0;transform:translate(-50%,-50%) scale(0.9)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}";
    if (!document.getElementById("bookmarklet-reward-style")) {
      style.id = "bookmarklet-reward-style";
      document.head.appendChild(style);
    }
    document.body.appendChild(el);
    setTimeout(function() {
      el.remove();
    }, 3e3);
  }
  function checkRewardUnlock() {
    const state = loadState();
    if (!state || !state.completedDomains) return;
    const total = DOMAIN_CONFIG.length;
    const completed = state.completedDomains.length;
    if (completed < total) return;
    if (state.rewardUnlocked) return;
    state.rewardUnlocked = true;
    saveState(state);
    showRewardPopup();
    if (REWARD_REDIRECT_URL) {
      var sep = REWARD_REDIRECT_URL.indexOf("?") >= 0 ? "&" : "?";
      setTimeout(function() {
        window.location.replace(REWARD_REDIRECT_URL + sep + "unlocked=1");
      }, 2e3);
    }
  }

  // src/timer.js
  function getElapsedSeconds() {
    const state = loadState();
    if (!state || !state.initialized || !state.startTime) return 0;
    return Math.floor((Date.now() - state.startTime) / 1e3);
  }
  function formatElapsed(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor(totalSeconds % 3600 / 60);
    const s = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return pad(h) + ":" + pad(m) + ":" + pad(s);
  }

  // src/ui.js
  var WIDGET_ID = "bw";
  var TOTAL_DOMAINS = Object.keys(domainDatabase).length;
  function getProgressPercent(state) {
    if (!state || !state.completedDomains) return 0;
    const completed = state.completedDomains.length;
    return TOTAL_DOMAINS ? Math.min(100, Math.round(completed / TOTAL_DOMAINS * 100)) : 0;
  }
  function ensureStyles() {
    if (document.getElementById("bookmarklet-widget-styles")) return;
    const style = document.createElement("style");
    style.id = "bookmarklet-widget-styles";
    const id = WIDGET_ID;
    style.textContent = "#" + id + "{position:fixed;bottom:16px;right:16px;padding:12px 16px;background:#1a1a2e;color:#eaeaea;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.35);z-index:2147483646;font:12px system-ui,sans-serif;min-width:160px;line-height:1.4}#" + id + " .t{font-weight:600;margin-bottom:6px}#" + id + " .r{margin:4px 0}#" + id + " .bar{height:6px;background:rgba(255,255,255,0.15);border-radius:3px;overflow:hidden;margin-top:6px}#" + id + " .fill{height:100%;background:linear-gradient(90deg,#4361ee,#3a0ca3);border-radius:3px;transition:width 0.2s ease}";
    document.head.appendChild(style);
  }
  function updateProgressUI() {
    ensureStyles();
    let widget = document.getElementById(WIDGET_ID);
    if (!widget) {
      widget = document.createElement("div");
      widget.id = WIDGET_ID;
      document.body.appendChild(widget);
    }
    const state = loadState();
    const percent = getProgressPercent(state);
    const elapsed = getElapsedSeconds();
    const timeStr = formatElapsed(elapsed);
    const completedList = state && state.completedDomains && state.completedDomains.length ? state.completedDomains.join(", ") : "None";
    widget.innerHTML = '<div class="t">Progress</div><div class="r">' + percent + '%</div><div class="r">' + completedList + '</div><div class="r">' + timeStr + '</div><div class="bar"><div class="fill" style="width:' + percent + '%"></div></div>';
  }

  // src/domainEngine.js
  var HOME_DOMAIN = "domaingetters.onrender.com";
  function normalizeDomain(hostname) {
    if (!hostname || typeof hostname !== "string") return "";
    return hostname.replace(/^www\./i, "");
  }
  function getCurrentDomain() {
    if (typeof window !== "undefined" && window.__BOOKMARKLET_TEST_DOMAIN__ !== void 0) {
      return normalizeDomain(String(window.__BOOKMARKLET_TEST_DOMAIN__));
    }
    return normalizeDomain(window.location.hostname);
  }
  function initializeState() {
    const state = {
      initialized: true,
      startTime: Date.now(),
      progress: {},
      completedDomains: []
    };
    saveState(state);
    console.log("[Bookmarklet] Initialized on home domain. Start time:", new Date(state.startTime).toISOString());
    return state;
  }
  function run() {
    const domain = getCurrentDomain();
    if (domain === HOME_DOMAIN) {
      initializeState();
      var steps = [
        "Steps for reward:",
        "1. You're here (started!)",
        "2. Go to YouTube \u2192 click bookmarklet",
        "3. Go to Netflix \u2192 click bookmarklet",
        "4. Go to Google \u2192 click bookmarklet",
        "Complete all 3 sites to unlock your reward!"
      ].join("\n");
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
          completedDomains: []
        };
        saveState(state);
        console.log("[Bookmarklet] Auto-initialized on", domain, "(first run on this site).");
      } else {
        console.warn("[Bookmarklet] Run on home domain first to initialize, or visit a supported domain.");
        return;
      }
    }
    if (domainHasTask) {
      const task = domainDatabase[domain];
      task();
      const updatedState = loadState();
      if (updatedState) saveState(updatedState);
    }
    updateProgressUI();
  }

  // src/test-runner.js
  if (typeof window !== "undefined") {
    window.__BOOKMARKLET_RUN__ = run;
  }
})();
