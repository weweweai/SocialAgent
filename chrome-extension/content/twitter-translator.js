// weweweai Extension Version 3.0.0 - Free Google Translate only
const EXTENSION_VERSION = '3.0.0';

class WeweweaiTranslator {
  constructor() {
    this.isEnabled = true;
    this.googleTargetLanguage = 'zh-CN';
    this.observer = null;

    // Cache: text hash -> translation
    this.translationCache = new Map();
    // Track in-flight requests to avoid duplicates
    this.pendingTranslations = new Set();
    this.maxConcurrent = 10;
    this.activeRequests = 0;
    this.translationQueue = [];

    this.translatedCount = 0;
    this.charCount = 0;

    this.injectStyles();
    this.init();
  }

  injectStyles() {
    if (document.getElementById('weweweai-translator-styles')) return;

    const style = document.createElement('style');
    style.id = 'weweweai-translator-styles';
    style.textContent = `
      .weweweai-loading {
        filter: blur(4px);
        opacity: 0.5;
        transition: filter 0.15s, opacity 0.15s;
        pointer-events: none;
      }
      .weweweai-ready {
        filter: none;
        opacity: 1;
        transition: filter 0.1s, opacity 0.1s;
      }
    `;
    document.head.appendChild(style);
  }

  async init() {
    console.log(`[weweweai] v${EXTENSION_VERSION} Initializing translator on:`, window.location.hostname);
    await this.loadSettings();
    await this.loadStats();
    this.setupObserver();
    this.translateExistingTweets();
    this.listenForMessages();
    this.startQueueProcessor();

    setInterval(() => this.translateExistingTweets(), 500);

    console.log('[weweweai] Translator initialized with Google Free');
  }

  async loadSettings() {
    const result = await chrome.storage.local.get([
      'weweweai_auto_translate',
      'weweweai_google_target_language'
    ]);
    this.isEnabled = result.weweweai_auto_translate !== false;
    this.googleTargetLanguage = result.weweweai_google_target_language || 'zh-CN';
  }

  async loadStats() {
    const result = await chrome.storage.local.get([
      'weweweai_translated_count',
      'weweweai_char_count'
    ]);
    this.translatedCount = result.weweweai_translated_count || 0;
    this.charCount = result.weweweai_char_count || 0;
  }

  async saveStats() {
    await chrome.storage.local.set({
      weweweai_translated_count: this.translatedCount,
      weweweai_char_count: this.charCount
    });
  }

  listenForMessages() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'GOOGLE_SETTINGS_UPDATED') {
        this.googleTargetLanguage = message.settings.weweweai_google_target_language || 'zh-CN';
        if (this.isEnabled) {
          this.translationCache.clear();
          this.translateExistingTweets();
        }
      }

      if (message.type === 'TOGGLE_TRANSLATE') {
        this.isEnabled = message.enabled;
        if (!this.isEnabled) {
          document.querySelectorAll('[data-weweweai-translated="true"]').forEach(el => {
            const orig = el.dataset.weweweaiOriginal;
            if (orig) el.innerText = orig;
          });
        } else {
          this.translationCache.clear();
          this.translateExistingTweets();
        }
      }
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;

      if (changes.weweweai_google_target_language) {
        this.googleTargetLanguage = changes.weweweai_google_target_language.newValue || 'zh-CN';
        if (this.isEnabled) {
          this.translationCache.clear();
          this.translateExistingTweets();
        }
      }
    });
  }

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      if (!this.isEnabled) return;

      let needsRescan = false;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.findAndTranslateTweets(node);
            needsRescan = true;
          }
        });

        if (mutation.type === 'characterData') {
          const tweetText = mutation.target.parentElement?.closest('[data-testid="tweetText"]');
          if (tweetText) {
            this.checkAndRetranslate(tweetText);
          }
        }

        if (mutation.type === 'attributes' && mutation.attributeName === 'data-testid') {
          needsRescan = true;
        }
      });

      if (needsRescan) {
        this.translateExistingTweets();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-testid']
    });
  }

  translateExistingTweets() {
    if (!this.isEnabled) return;
    this.findAndTranslateTweets(document.body);
  }

  findAndTranslateTweets(container) {
    const tweetTextElements = container.querySelectorAll('[data-testid="tweetText"]');
    tweetTextElements.forEach((element) => {
      this.queueTranslation(element);
    });
  }

  checkAndRetranslate(element) {
    const currentText = element.innerText.trim();
    if (!currentText) return;

    if (element.dataset.weweweaiTranslated === 'true') {
      if (!this.isTargetLanguage(currentText)) {
        delete element.dataset.weweweaiTranslated;
        delete element.dataset.weweweaiPending;
        this.queueTranslation(element);
      }
    }
  }

  queueTranslation(element) {
    const originalText = element.innerText.trim();
    if (!originalText) return;

    if (element.dataset.weweweaiTranslated === 'true' && this.isTargetLanguage(element.innerText)) {
      return;
    }

    if (this.isTargetLanguage(originalText)) return;

    const textKey = this.hashText(originalText);

    if (this.translationCache.has(textKey)) {
      this.applyTranslation(element, this.translationCache.get(textKey), originalText);
      return;
    }

    if (element.dataset.weweweaiPending === 'true') return;

    if (this.pendingTranslations.has(textKey)) {
      this.showLoading(element);
      element.dataset.weweweaiPending = 'true';
      element.dataset.weweweaiTextKey = textKey;
      return;
    }

    this.showLoading(element);
    element.dataset.weweweaiPending = 'true';
    element.dataset.weweweaiTextKey = textKey;

    this.pendingTranslations.add(textKey);
    this.translationQueue.push({ element, originalText, textKey });
  }

  showLoading(element) {
    element.classList.add('weweweai-loading');
    element.classList.remove('weweweai-ready');
  }

  hideLoading(element) {
    element.classList.remove('weweweai-loading');
    element.classList.add('weweweai-ready');
  }

  startQueueProcessor() {
    setInterval(() => this.processQueue(), 30);
  }

  async processQueue() {
    while (this.translationQueue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const item = this.translationQueue.shift();
      if (!item) break;

      if (!document.contains(item.element)) {
        this.pendingTranslations.delete(item.textKey);
        continue;
      }

      if (this.translationCache.has(item.textKey)) {
        this.applyTranslation(item.element, this.translationCache.get(item.textKey), item.originalText);
        this.pendingTranslations.delete(item.textKey);
        this.applyToWaitingElements(item.textKey, this.translationCache.get(item.textKey));
        continue;
      }

      this.activeRequests++;
      this.translateItem(item).finally(() => {
        this.activeRequests--;
        this.pendingTranslations.delete(item.textKey);
      });
    }
  }

  applyToWaitingElements(textKey, translation) {
    document.querySelectorAll(`[data-weweweai-text-key="${textKey}"][data-weweweai-pending="true"]`).forEach(el => {
      if (el.dataset.weweweaiTranslated !== 'true') {
        const origText = el.innerText.trim();
        this.applyTranslation(el, translation, origText);
      }
    });
  }

  async translateItem(item) {
    const { element, originalText, textKey } = item;

    try {
      const translation = await this.translateWithGoogle(originalText);

      if (translation && translation !== originalText) {
        this.translationCache.set(textKey, translation);

        if (document.contains(element)) {
          this.applyTranslation(element, translation, originalText);
        }

        this.applyToWaitingElements(textKey, translation);

        this.translatedCount++;
        this.charCount += originalText.length;
        this.saveStats();
      } else {
        this.hideLoading(element);
        delete element.dataset.weweweaiPending;
      }
    } catch (error) {
      console.error('[weweweai] Translation failed:', error);
      this.hideLoading(element);
      delete element.dataset.weweweaiPending;
    }
  }

  applyTranslation(element, translation, originalText) {
    this.hideLoading(element);
    element.dataset.weweweaiTranslated = 'true';
    element.dataset.weweweaiOriginal = originalText;
    delete element.dataset.weweweaiPending;
    delete element.dataset.weweweaiTextKey;

    element.innerText = translation;
  }

  hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  isTargetLanguage(text) {
    const targetLang = this.googleTargetLanguage || 'zh-CN';

    if (targetLang.startsWith('zh') || targetLang === 'ZH') {
      const chineseRegex = /[\u4e00-\u9fff]/g;
      const matches = text.match(chineseRegex) || [];
      return matches.length / text.length > 0.3;
    }
    if (targetLang === 'ja') {
      const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g;
      const matches = text.match(japaneseRegex) || [];
      return matches.length / text.length > 0.3;
    }
    if (targetLang === 'ko') {
      const koreanRegex = /[\uac00-\ud7af]/g;
      const matches = text.match(koreanRegex) || [];
      return matches.length / text.length > 0.3;
    }
    if (targetLang === 'vi') {
      const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;
      const matches = text.match(vietnameseRegex) || [];
      return matches.length / text.length > 0.1;
    }
    return false;
  }

  // Google Translate free API — no API key required
  async translateWithGoogle(text) {
    const targetLang = this.googleTargetLanguage || 'zh-CN';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Google Translate error: ${response.status}`);

    const data = await response.json();
    const translated = data[0]?.map(item => item[0]).filter(Boolean).join('') || null;
    return translated;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new WeweweaiTranslator());
} else {
  new WeweweaiTranslator();
}
