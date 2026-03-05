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
  function createDomainTask(domainKey, message) {
    return function runTask() {
      const state = loadState();
      if (!state || !state.initialized) {
        return;
      }
      incrementDomain(state, domainKey);
      saveState(state);
      showPopup(message, state.progress[domainKey]);
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
      animation: "bookmarklet-fadein 0.2s ease"
    });
    const style = document.createElement("style");
    style.textContent = "@keyframes bookmarklet-fadein{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}";
    document.head.appendChild(style);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
  function youtubeTask() {
    const run2 = createDomainTask("youtube.com", "YouTube");
    run2();
  }
  function twitterTask() {
    const run2 = createDomainTask("twitter.com", "Twitter");
    run2();
  }
  function googleTask() {
    const run2 = createDomainTask("google.com", "Google");
    run2();
  }
  function netflixTask() {
    const run2 = createDomainTask("netflix.com", "Netflix");
    run2();
  }
  var domainDatabase = {
    "youtube.com": youtubeTask,
    "twitter.com": twitterTask,
    "x.com": twitterTask,
    "google.com": googleTask,
    "netflix.com": netflixTask
  };

  // src/ui-stub.js
  function updateProgressUI() {
  }

  // src/engine-inline.js
  var HOME_DOMAIN = "example.com";
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
