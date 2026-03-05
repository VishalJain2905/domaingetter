(() => {
  // src/stateManager.js
  var STATE_KEY = "bds";
  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
  function saveState(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
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

  // src/ui-stub.js
  function updateProgressUI() {
  }

  // src/engine-inline.js
  var HOME_DOMAIN = "domaingetters.onrender.com";
  function normalizeDomain(hostname) {
    if (!hostname || typeof hostname !== "string") return "";
    return hostname.replace(/^www\./i, "");
  }
  function getCurrentDomain() {
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

  // src/index-inline.js
  (function() {
    try {
      run();
    } catch (err) {
    }
  })();
})();
