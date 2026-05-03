class WeweweaiPopup {
  constructor() {
    this.init();
  }

  async init() {
    this.bindElements();
    await this.loadSettings();
    await this.loadStats();
    this.bindEvents();
  }

  bindElements() {
    this.googleTargetLanguageEl = document.getElementById('google-target-language');
    this.toggleEnabled = document.getElementById('toggle-enabled');
    this.translatedCount = document.getElementById('translated-count');
    this.charCount = document.getElementById('char-count');
    this.toast = document.getElementById('toast');
    this.btnLocalAgent = document.getElementById('btn-local-agent');
    this.btnEyePreview    = document.getElementById('btn-eye-preview');
    this.toggleEyeEnabled = document.getElementById('toggle-eye-enabled');
    this.eyeIntervalEl    = document.getElementById('eye-interval');
    this.eyeCountdownEl   = document.getElementById('eye-countdown');
  }

  async loadSettings() {
    const result = await chrome.storage.local.get([
      'weweweai_auto_translate',
      'weweweai_google_target_language',
      'weweweai_eye_enabled',
      'weweweai_eye_work_minutes',
    ]);
    this.toggleEnabled.checked = result.weweweai_auto_translate !== false;
    if (this.googleTargetLanguageEl) {
      this.googleTargetLanguageEl.value = result.weweweai_google_target_language || 'zh-CN';
    }
    if (this.toggleEyeEnabled) {
      this.toggleEyeEnabled.checked = result.weweweai_eye_enabled !== false;
    }
    if (this.eyeIntervalEl) {
      const mins = result.weweweai_eye_work_minutes || 45;
      this.eyeIntervalEl.value = [20,30,45,60,90,120].includes(mins) ? mins : 45;
    }
    this.updateCountdown();
  }

  async loadStats() {
    const result = await chrome.storage.local.get([
      'weweweai_translated_count',
      'weweweai_char_count'
    ]);
    this.translatedCount.textContent = result.weweweai_translated_count || 0;
    this.charCount.textContent = this.formatNumber(result.weweweai_char_count || 0);
  }

  bindEvents() {
    this.toggleEnabled.addEventListener('change', () => this.saveToggle());
    if (this.googleTargetLanguageEl) {
      this.googleTargetLanguageEl.addEventListener('change', () => this.saveGoogleSettings());
    }
    if (this.btnLocalAgent) {
      this.btnLocalAgent.addEventListener('click', () => this.openLocalAgent());
    }
    if (this.btnEyePreview) {
      this.btnEyePreview.addEventListener('click', () => this.previewEyeOverlay());
    }
    if (this.toggleEyeEnabled) {
      this.toggleEyeEnabled.addEventListener('change', () => this.saveEyeSettings());
    }
    if (this.eyeIntervalEl) {
      this.eyeIntervalEl.addEventListener('change', () => this.saveEyeSettings());
    }
  }

  async saveToggle() {
    const enabled = this.toggleEnabled.checked;
    await chrome.storage.local.set({ weweweai_auto_translate: enabled });
    this.notifyContentScript({ type: 'TOGGLE_TRANSLATE', enabled });
    this.showToast(enabled ? 'Translation enabled' : 'Translation disabled', 'success');
  }

  async saveGoogleSettings() {
    const settings = {
      weweweai_google_target_language: this.googleTargetLanguageEl?.value || 'zh-CN'
    };
    await chrome.storage.local.set(settings);
    this.showToast('Language saved', 'success');
    this.notifyContentScript({ type: 'GOOGLE_SETTINGS_UPDATED', settings });
  }

  openLocalAgent() {
    const sw = window.screen.width;
    const sh = window.screen.height;
    const w = Math.max(640, Math.round(sw * 0.38));
    const h = Math.max(820, Math.round(sh * 0.88));
    const left = Math.round((sw - w) / 2);
    const top = Math.round((sh - h) / 2);
    chrome.windows.create({
      url: chrome.runtime.getURL('quiz/quiz.html'),
      type: 'popup',
      width: w,
      height: h,
      left: left,
      top: top,
      focused: true
    });
  }

  notifyContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || '';
      if (url.includes('twitter.com') || url.includes('x.com')) {
        chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {});
      }
    });
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  async saveEyeSettings() {
    const enabled = this.toggleEyeEnabled ? this.toggleEyeEnabled.checked : true;
    const mins    = parseInt(this.eyeIntervalEl ? this.eyeIntervalEl.value : '45', 10);
    await chrome.storage.local.set({
      weweweai_eye_enabled: enabled,
      weweweai_eye_work_minutes: mins,
    });
    // Tell background to reschedule the alarm
    chrome.runtime.sendMessage({ type: 'WEWEWEAI_RESCHEDULE', workMinutes: mins, enabled });
    this.showToast(enabled ? `Eye reminder set to ${mins} min` : 'Eye protection disabled', 'success');
    this.updateCountdown();
  }

  async updateCountdown() {
    if (!this.eyeCountdownEl) return;
    try {
      const alarm = await chrome.alarms.get('weweweai-eye-rest');
      if (alarm) {
        const diffMs  = alarm.scheduledTime - Date.now();
        const diffMin = Math.max(0, Math.round(diffMs / 60000));
        const diffSec = Math.max(0, Math.round((diffMs % 60000) / 1000));
        this.eyeCountdownEl.textContent = diffMin > 0 ? `${diffMin} min` : `${diffSec} sec`;
      } else {
        this.eyeCountdownEl.textContent = 'disabled';
      }
    } catch(_) { this.eyeCountdownEl.textContent = '—'; }
  }

  // Returns true if the URL can accept content script injection
  _canInject(url) {
    if (!url) return false;
    const blocked = ['chrome://', 'chrome-extension://', 'about:', 'edge://', 'data:'];
    return !blocked.some(p => url.startsWith(p));
  }

  // Open overlay.html as a fullscreen normal window (works on any page)
  _openOverlayWindow() {
    const overlayUrl = chrome.runtime.getURL('overlay/overlay.html');
    chrome.windows.create({ url: overlayUrl, type: 'normal', state: 'fullscreen', focused: true });
  }

  async previewEyeOverlay() {
    const prefs = await chrome.storage.local.get(['weweweai_eye_rest_seconds']);
    const restSecs = prefs.weweweai_eye_rest_seconds || 20;
    const msg = { type: 'WEWEWEAI_EYE_REST', workMinutes: 45, restSeconds: restSecs };

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];

      // If no tab or URL is not injectable → open standalone overlay window directly
      if (!tab || !tab.id || !this._canInject(tab.url)) {
        this._openOverlayWindow();
        return;
      }

      // Injectable page: try to send to existing content script
      try {
        await chrome.tabs.sendMessage(tab.id, msg);
      } catch (_) {
        // Content script not loaded yet — inject it first, then retry
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content/eye-overlay.js']
          });
          await new Promise(r => setTimeout(r, 120));
          await chrome.tabs.sendMessage(tab.id, msg);
        } catch (e) {
          // Injection still failed (e.g. file:// or other restricted URL) → fallback window
          this._openOverlayWindow();
        }
      }
    });
  }

  showToast(message, type = 'info') {
    this.toast.textContent = message;
    this.toast.className = 'toast ' + type;
    setTimeout(() => { this.toast.classList.add('hidden'); }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => { new WeweweaiPopup(); });
