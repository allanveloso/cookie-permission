import { siteOfUrl, patternFor } from './site.js';
import { showPrompt } from './prompt.js';

const SETTINGS = new Set(['allow', 'session_only', 'block']);

// ---- Stored decisions (source of truth for the rules this extension sets) ----

async function loadDecisions() {
  const { decisions = {} } = await chrome.storage.local.get('decisions');
  return decisions;
}

async function saveDecisions(decisions) {
  await chrome.storage.local.set({ decisions });
}

async function applyAllRules(decisions) {
  await chrome.contentSettings.cookies.clear({});
  for (const [site, setting] of Object.entries(decisions)) {
    await chrome.contentSettings.cookies.set({ primaryPattern: patternFor(site), setting });
  }
}

// Re-apply on install/update/startup so storage and browser rules never drift apart.
chrome.runtime.onInstalled.addListener(async () => applyAllRules(await loadDecisions()));
chrome.runtime.onStartup.addListener(async () => applyAllRules(await loadDecisions()));

// ---- Per-tab prompt state (session storage survives service worker restarts) ----

const inFlight = new Set();

async function loadTabState() {
  const { prompted = {}, pending = {} } = await chrome.storage.session.get(['prompted', 'pending']);
  return { prompted, pending };
}

async function saveTabState(state) {
  await chrome.storage.session.set(state);
}

// ---- Prompt ----

async function openPrompt(tabId, site, url) {
  const decisions = await loadDecisions();
  const hasDecision = site in decisions;
  const current = hasDecision
    ? decisions[site]
    : (await chrome.contentSettings.cookies.get({ primaryUrl: url })).setting;

  await chrome.action.setBadgeText({ tabId, text: !hasDecision && current === 'block' ? '?' : '' });
  await chrome.action.setBadgeBackgroundColor({ tabId, color: '#b3261e' });

  await chrome.scripting
    .executeScript({ target: { tabId }, func: showPrompt, args: [site, current, hasDecision] })
    .catch(() => { /* chrome://, Web Store and PDF viewer pages can't be scripted */ });
}

async function considerPrompt(tabId, site, url) {
  const key = `${tabId}|${site}`;
  if (inFlight.has(key)) return;
  inFlight.add(key);
  try {
    const decisions = await loadDecisions();
    if (site in decisions) return;

    const { setting } = await chrome.contentSettings.cookies.get({ primaryUrl: url });
    if (setting !== 'block') return; // allowed by Chrome settings or another rule

    const state = await loadTabState();
    if (state.prompted[tabId] === site) return; // already asked in this tab
    state.prompted[tabId] = site;

    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (tab?.status === 'complete') {
      await saveTabState(state);
      await openPrompt(tabId, site, url);
    } else {
      state.pending[tabId] = { site, url };
      await saveTabState(state);
    }
  } finally {
    inFlight.delete(key);
  }
}

// ---- Detection: a first-party response tries to set a cookie ----

chrome.webRequest.onHeadersReceived.addListener(
  (details) => { handleResponse(details); },
  { urls: ['http://*/*', 'https://*/*'] },
  ['responseHeaders', 'extraHeaders'] // extraHeaders is required to see Set-Cookie
);

async function handleResponse({ tabId, url, type, responseHeaders }) {
  if (tabId < 0) return;
  if (!responseHeaders?.some((h) => h.name.toLowerCase() === 'set-cookie')) return;

  const topUrl = type === 'main_frame'
    ? url
    : (await chrome.tabs.get(tabId).catch(() => null))?.url;
  if (!topUrl) return;

  const site = siteOfUrl(topUrl);
  if (!site || siteOfUrl(url) !== site) return; // ignore third-party cookies

  await considerPrompt(tabId, site, topUrl);
}

// ---- Tab lifecycle ----

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // Navigated to another site: allow asking again for the new one.
    const site = siteOfUrl(changeInfo.url);
    const state = await loadTabState();
    if (state.prompted[tabId] && state.prompted[tabId] !== site) delete state.prompted[tabId];
    if (state.pending[tabId] && state.pending[tabId].site !== site) delete state.pending[tabId];
    await saveTabState(state);
  }

  if (changeInfo.status === 'complete') {
    const state = await loadTabState();
    const pending = state.pending[tabId];
    if (!pending) return;
    delete state.pending[tabId];
    await saveTabState(state);
    if (siteOfUrl(tab.url) === pending.site) await openPrompt(tabId, pending.site, tab.url);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const state = await loadTabState();
  delete state.prompted[tabId];
  delete state.pending[tabId];
  await saveTabState(state);
});

// ---- Toolbar button: open the prompt on demand ----

chrome.action.onClicked.addListener(async (tab) => {
  const site = siteOfUrl(tab.url ?? '');
  if (site) await openPrompt(tab.id, site, tab.url);
});

// ---- Decisions coming back from the prompt ----

chrome.runtime.onMessage.addListener((message, sender) => {
  const tab = sender.tab;
  const site = tab && siteOfUrl(tab.url ?? ''); // trust the sender's tab, not the message
  if (!site) return;

  if (message?.type === 'cookie-permission:decide' && SETTINGS.has(message.setting)) {
    decide(tab.id, site, message.setting);
  } else if (message?.type === 'cookie-permission:forget') {
    forget(tab.id, site);
  }
});

async function decide(tabId, site, setting) {
  const decisions = await loadDecisions();
  const previous = decisions[site] ?? 'block';
  decisions[site] = setting;
  await saveDecisions(decisions);
  await chrome.contentSettings.cookies.set({ primaryPattern: patternFor(site), setting });
  await chrome.action.setBadgeText({ tabId, text: '' });
  if (setting !== previous) chrome.tabs.reload(tabId);
}

async function forget(tabId, site) {
  const decisions = await loadDecisions();
  delete decisions[site];
  await saveDecisions(decisions);
  // The API can't remove a single rule, so rebuild all of them.
  await applyAllRules(decisions);

  const state = await loadTabState();
  delete state.prompted[tabId];
  await saveTabState(state);
  chrome.tabs.reload(tabId);
}
