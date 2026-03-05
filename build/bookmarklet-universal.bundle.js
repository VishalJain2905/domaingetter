(() => {
  // src/universal.js
  var STATE_KEY = "bds";
  var HOME_DOMAIN = "example.com";
  var REWARD_REDIRECT_URL = "/test/reward.html";
  var DOMAINS = [
    { d: "youtube.com", l: "YouTube", r: "" },
    { d: "twitter.com", l: "Twitter", r: "" },
    { d: "google.com", l: "Google", r: "" }
  ];
  function normalizeDomain(h) {
    return (h || "").replace(/^www\./i, "");
  }
  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY));
    } catch (e) {
      return null;
    }
  }
  function saveState(s) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(s));
    } catch (e) {
    }
  }
  function incrementDomain(state, domain) {
    if (!state.progress) state.progress = {};
    state.progress[domain] = (state.progress[domain] || 0) + 1;
    if (!state.completedDomains) state.completedDomains = [];
    if (state.completedDomains.indexOf(domain) === -1) state.completedDomains.push(domain);
  }
  function showPopup(text, count) {
    var el = document.createElement("div");
    el.id = "bookmarklet-popup";
    el.textContent = count !== void 0 ? text + " (" + count + ")" : text;
    el.style.cssText = "position:fixed;top:16px;right:16px;padding:12px 20px;background:#1a1a2e;color:#eee;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:2147483647;font:14px system-ui,sans-serif;max-width:320px";
    var old = document.getElementById("bookmarklet-popup");
    if (old) old.remove();
    document.body.appendChild(el);
    setTimeout(function() {
      el.remove();
    }, 2500);
  }
  function showReward() {
    var el = document.createElement("div");
    el.id = "bookmarklet-reward";
    el.textContent = "All tasks complete! Reward unlocked.";
    el.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:24px 32px;background:linear-gradient(135deg,#1a1a2e,#2d1b4e);color:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);font:18px system-ui,sans-serif;font-weight:600;z-index:2147483647;text-align:center";
    var old = document.getElementById("bookmarklet-reward");
    if (old) old.remove();
    document.body.appendChild(el);
    setTimeout(function() {
      el.remove();
    }, 3e3);
  }
  function checkReward(state) {
    var total = DOMAINS.length;
    var completed = state.completedDomains ? state.completedDomains.length : 0;
    if (completed < total || state.rewardUnlocked) return;
    state.rewardUnlocked = true;
    saveState(state);
    showReward();
    if (REWARD_REDIRECT_URL) setTimeout(function() {
      window.location.href = REWARD_REDIRECT_URL;
    }, 2500);
  }
  function run() {
    var domain = normalizeDomain(window.location.hostname);
    if (domain === HOME_DOMAIN) {
      saveState({ initialized: true, startTime: Date.now(), progress: {}, completedDomains: [] });
      return;
    }
    var state = loadState();
    var cfg = null;
    for (var i = 0; i < DOMAINS.length; i++) {
      if (DOMAINS[i].d === domain) {
        cfg = DOMAINS[i];
        break;
      }
    }
    if (!state || !state.initialized) {
      if (cfg) {
        state = { initialized: true, startTime: Date.now(), progress: {}, completedDomains: [] };
        saveState(state);
      } else {
        return;
      }
    }
    if (cfg) {
      incrementDomain(state, domain);
      saveState(state);
      showPopup(cfg.l + " completed", state.progress[domain]);
      if (cfg.r) setTimeout(function() {
        window.location.href = cfg.r;
      }, 1500);
      checkReward(state);
    }
  }
  run();
})();
