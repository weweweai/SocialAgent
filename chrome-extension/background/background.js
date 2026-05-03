// ── weweweai Background Service Worker ────────────────────────────────────

const DEFAULTS = {
  weweweai_auto_translate: true,
  weweweai_google_target_language: 'zh-CN',
  weweweai_translated_count: 0,
  weweweai_char_count: 0,
  weweweai_eye_work_minutes: 45,
  weweweai_eye_rest_seconds: 300,
  weweweai_eye_enabled: true,
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set(DEFAULTS);
  scheduleEyeAlarm(DEFAULTS.weweweai_eye_work_minutes);
});

// ── Twitter/X page load notification ─────────────────────────────────────
chrome.webNavigation?.onCompleted?.addListener(
  (details) => {
    if (details.url.includes('twitter.com') || details.url.includes('x.com')) {
      chrome.tabs.sendMessage(details.tabId, { type: 'PAGE_LOADED' }).catch(() => {});
    }
  },
  { url: [{ hostContains: 'twitter.com' }, { hostContains: 'x.com' }] }
);

// ── Eye Protection Timer ──────────────────────────────────────────────────
const ALARM_NAME = 'weweweai-eye-rest';

// Track the standalone overlay window (when no injectable webpage is open)
let overlayWindowId = null;

function scheduleEyeAlarm(workMinutes) {
  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: workMinutes || 45,
    });
  });
}

// Returns true if a URL can receive content script injection
function isInjectable(url) {
  if (!url) return false;
  if (url.startsWith('chrome://'))           return false;
  if (url.startsWith('chrome-extension://')) return false;
  if (url.startsWith('about:'))              return false;
  if (url.startsWith('edge://'))             return false;
  if (url.startsWith('data:'))               return false;
  return true;
}

// Open the standalone overlay page in a maximised popup window
async function openOverlayWindow() {
  // Close any existing overlay window first
  if (overlayWindowId !== null) {
    try { await chrome.windows.remove(overlayWindowId); } catch (_) {}
    overlayWindowId = null;
  }
  const overlayUrl = chrome.runtime.getURL('overlay/overlay.html');
  const screen = await new Promise(r => chrome.system?.display
    ? chrome.system.display.getInfo(d => r(d[0]?.bounds || { width:1440, height:900 }))
    : r({ width:1440, height:900 }));
  const win = await chrome.windows.create({
    url: overlayUrl,
    type: 'normal',
    state: 'fullscreen',
    focused: true,
  });
  overlayWindowId = win.id;
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const prefs = await chrome.storage.local.get([
    'weweweai_eye_enabled', 'weweweai_eye_work_minutes', 'weweweai_eye_rest_seconds',
  ]);
  if (!prefs.weweweai_eye_enabled) {
    scheduleEyeAlarm(prefs.weweweai_eye_work_minutes || 45);
    return;
  }

  const workMin  = prefs.weweweai_eye_work_minutes  || 45;
  const restSecs = prefs.weweweai_eye_rest_seconds   || 300;

  // Try to inject into the active tab of the focused window
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  let injected = false;

  for (const tab of tabs) {
    if (!tab.id || !isInjectable(tab.url)) continue;
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'WEWEWEAI_EYE_REST',
        workMinutes: workMin,
        restSeconds: restSecs,
      });
      injected = true;
    } catch (_) {
      // Content script not yet loaded — inject it first, then retry
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/eye-overlay.js'],
        });
        await new Promise(r => setTimeout(r, 120));
        await chrome.tabs.sendMessage(tab.id, {
          type: 'WEWEWEAI_EYE_REST',
          workMinutes: workMin,
          restSeconds: restSecs,
        });
        injected = true;
      } catch (e) {
        console.warn('[weweweai] Could not inject eye overlay:', e?.message);
      }
    }
    if (injected) break;
  }

  // No injectable webpage found — open our standalone full-screen overlay page
  if (!injected) {
    await openOverlayWindow();
  }
});

// Clean up overlay window reference when it's closed by the user
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === overlayWindowId) {
    overlayWindowId = null;
  }
});

// ── Message handling ──────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'WEWEWEAI_REST_DONE') {
    // Close standalone overlay window if open
    if (overlayWindowId !== null) {
      try { await chrome.windows.remove(overlayWindowId); } catch (_) {}
      overlayWindowId = null;
    }
    // Restart work timer
    const prefs = await chrome.storage.local.get(['weweweai_eye_work_minutes','weweweai_eye_enabled']);
    if (prefs.weweweai_eye_enabled !== false) scheduleEyeAlarm(prefs.weweweai_eye_work_minutes || 45);
  }
  if (msg.type === 'WEWEWEAI_RESCHEDULE') {
    if (msg.enabled === false) {
      chrome.alarms.clear('weweweai-eye-rest');
    } else {
      scheduleEyeAlarm(msg.workMinutes || 45);
    }
  }
});
