# weweweai Social Agent

> Your personality. Your spirit beast. Your anime guardian. Your future social identity.

weweweai is a Chrome extension built on one conviction: the apps you use every day should know who you are.

Three features ship right now. A fourth is in development.

1. **Auto-translate Twitter / X** -- Google Translate under the hood, no API key, no cost, no friction
2. **Enneagram x MBTI personality test with spirit beast mounts** -- nine questions, one complete identity profile, one mythical beast that has apparently been carrying you this whole time
3. **Eye protection enforced by your anime AI agent** -- when you've been online too long, your character (riding their spirit beast) charges onto the screen and physically blocks the view until you rest
4. **Social agent with your personality injected** -- in development; your profile becomes the identity layer of an AI that actually knows who it's representing

---

## What's Inside

### 1. Twitter / X Auto-Translation

Powered by Google Translate's free public API. No API key. No account. No cost. Ever.

- Tweets translate **inline** -- no clicking, no pop-ups, no mode-switching. You just read.
- Supports **12 languages**: Simplified Chinese, Traditional Chinese, Japanese, Korean, Vietnamese, French, German, Spanish, Portuguese, Arabic, Russian, and English
- Results are **cached locally** -- the same content never hits the network twice
- Toggle on/off and switch target language anytime from the popup

---

### 2. Personality Test -- Find Your Spirit Beast

Legend says every person has a spirit beast that has been carrying them, invisibly, all along. This test finds yours.

The quiz fuses **Enneagram** (all 9 types with wing variants) and **color-psychology MBTI** into one short session. Nine questions. One result. A personality breakdown that actually says something useful.

**Take the test:** Visit [weweweai.com](https://weweweai.com) -- the personality test is currently the site's only feature. A backup domain is listed at the bottom of the page if the primary one is unreachable. You can also launch the quiz directly from the extension popup.

**What you get:**

- Your **MBTI type** (one of 16) paired with your **Enneagram type and wing** -- e.g., Type 5 Investigator, 5w6
- A **title** that nails your energy -- "The Unelected CEO of Everything", "Galaxy-Brain Overthinker", and 14 others
- Your **anime character archetype** mapped to a real character and series
- Your **color profile** -- the psychological color palette tied to your type
- Core fear, core desire, shadow side, and AI agent power profile from Enneagram theory
- Celebrity lookalikes (proceed at your own risk)
- A **downloadable result card** -- a styled image of your full profile, built for sharing

**Spirit beast mount -- matched to your MBTI type:**

| Beast | MBTI Types | Personality |
|-------|-----------|-------------|
| Dragon | INTJ, ESTP | Dominates the sky. Strategic and untamable. |
| Phoenix | INTP, INFJ | Reborn through knowledge and vision. |
| Tiger | ENTP, ISTP | Fierce, independent. Moves entirely on instinct. |
| Horse | ENTJ, ENFP, ESTJ | Powerful, relentless. Built to run and to lead. |
| Lion | ENFJ, ISFJ, ESFP | Guardian energy. Commanding presence. |
| Cat | INFP, ESFJ, ISFP | Independent, intuitive, quietly revolutionary. |
| Ox | ISTJ | Unshakeable, methodical. The one who actually finishes things. |

Available in **English** and **Simplified Chinese**. Switch languages anytime without losing your result.

---

### 3. Eye Protection -- Your Anime AI Agent Enforces the Break

You set a screen time limit. When it expires, your AI agent -- the anime character matched to your own Enneagram x MBTI profile, riding their spirit beast -- charges in from the right edge of the screen and takes over the view. They don't leave until you've rested.

Not a notification. Not a nudge. A full-screen animated intervention.

This is built specifically to interrupt doomscrolling: the kind of passive, compounding screen use you didn't consciously choose and can't easily stop. The guardian makes the choice for you.

**Session time limits -- pick one in the popup:**

| Limit | Best for |
|-------|----------|
| 20 min | Short focused sprints |
| 45 min | Standard work block |
| 60 min | Default -- one solid hour |
| 2 hrs | Long sessions, infrequent breaks |

**What happens when the timer fires:**

- Your guardian charges in from the right, riding their spirit mount, and covers the screen
- A **5-minute rest countdown** begins -- fully customizable in the popup
- The dismiss button is **locked for the first 20 seconds** -- minimum break is non-negotiable
- After the countdown, you can close the overlay and continue
- The session timer resets automatically for the next round

**Your guardian is specific to your type.** INTJ and ESTP get a Dragon rider. INTP and INFJ get a Phoenix. ENFJ, ISFJ, and ESFP get a Lion. The character you see is the one your personality test unlocked -- not a generic placeholder.

The timer runs via Chrome's Alarms API and keeps counting even when the browser is minimized or in the background.

Hit **Preview** in the popup anytime to trigger your guardian without waiting for the timer.

> Currently Chrome-only, browser-scoped. A desktop app -- covering all apps at the OS level, not just the browser -- is on the roadmap for Windows and macOS.

---

## Privacy and Security

- **No data leaves your device. Period.**
- Translation requests go directly to `translate.googleapis.com` -- no weweweai server is ever involved.
- Personality results are stored locally via `chrome.storage.local`.
- Avatar images load from `weweweai.com/avatars/` or `api.dicebear.com` as a fallback -- both public, no account needed.
- No API keys. No user accounts. No tracking. No analytics. No telemetry.
- Full source is open. Read every file.

---

## Installation

1. Download and unzip `weweweai-socialagent.zip`
2. In Chrome, navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle, top-right corner)
4. Click **Load unpacked** -- select the `chrome-extension/` folder
5. The weweweai icon appears in your toolbar
6. Open [x.com](https://x.com) or [twitter.com](https://twitter.com) -- tweets auto-translate within seconds

---

## File Structure

```
chrome-extension/
├── manifest.json
├── LICENSE
├── README.md
├── background/
│   └── background.js           # Alarm scheduler, overlay window launcher
├── content/
│   ├── twitter-translator.js   # Inline tweet translation
│   ├── twitter-translator.css
│   └── eye-overlay.js          # Anime guardian injection into active tabs
├── overlay/
│   ├── overlay.html            # Fullscreen rest overlay page
│   └── overlay.js              # Overlay logic (MV3 CSP-compliant)
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js                # Settings, language picker, preview button
├── quiz/
│   ├── quiz.html
│   ├── quiz.js                 # Full test engine + i18n (EN / zh-CN)
│   └── avatar.js               # Canvas portrait renderer -- runs fully local
├── lib/
│   └── html2canvas.min.js      # Client-side result card image export
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Tech Stack

| Layer | Details |
|-------|---------|
| Translation | Google Translate free public API -- no key required |
| Personality engine | Vanilla JS, fully local, zero network calls |
| Eye protection | HTML5 Canvas, Chrome Alarms API |
| Result image export | Canvas 2D API, client-side PNG download |
| Avatar rendering | Local Canvas (avatar.js) + DiceBear API as fallback |
| Storage | `chrome.storage.local` |
| Extension format | Chrome MV3 |

---

## Roadmap

- **Personality-injected AI agent** -- your Enneagram x MBTI profile becomes the identity layer of an AI agent that knows who it's working for
- **Desktop app** -- system-level screen time enforcement across all apps, not just Chrome (Windows + macOS)
- **More browsers** -- Firefox, Safari, Edge

---

[weweweai.com](https://weweweai.com)
