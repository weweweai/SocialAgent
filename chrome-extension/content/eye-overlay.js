// weweweai Eye Protection Overlay v7
// Design: square avatar image radiates from screen center → fills screen
//         transparent info card overlaid directly on image (top-right)
//         NO background removal, NO walking animation, NO sparks
// i18n: reads lang from chrome.storage.local (NOT host localStorage)
(function () {
  'use strict';
  if (window.__weweweaiEyeInit) return;
  window.__weweweaiEyeInit = true;
  if (window !== window.top) return;

  // ── i18n ───────────────────────────────────────────────────────────────────
  const CARD_I18N = {
    en:    { title:'Rest Your Eyes',     flying:'Flying',   rider:'Rider',    wait:'Please wait…',        ok:'OK, Continue →'  },
    zh_CN: { title:'休息一下，保护眼睛',   flying:'飞翔中',   rider:'骑士',     wait:'请稍候…',             ok:'好的，继续 →'    },
    zh_TW: { title:'休息一下，保護眼睛',   flying:'飛翔中',   rider:'騎士',     wait:'請稍候…',             ok:'好的，繼續 →'    },
    ja:    { title:'目を休めましょう',      flying:'飛行中',   rider:'ライダー', wait:'少々お待ちを…',        ok:'OK、続ける →'    },
    ko:    { title:'눈을 쉬게 하세요',     flying:'비행 중',  rider:'라이더',   wait:'잠시만요…',            ok:'계속하기 →'     },
    es:    { title:'Descansa la vista',   flying:'Volando',  rider:'Jinete',   wait:'Por favor espera…',   ok:'OK, Continuar →' },
    pt:    { title:'Descanse os olhos',   flying:'Voando',   rider:'Cavaleiro',wait:'Aguarde…',             ok:'OK, Continuar →' },
    vi:    { title:'Nghỉ ngơi mắt',       flying:'Đang bay', rider:'Kỵ sĩ',   wait:'Vui lòng chờ…',       ok:'OK, Tiếp tục →'  },
    fr:    { title:'Reposez vos yeux',    flying:'En vol',   rider:'Cavalier', wait:'Veuillez patienter…', ok:'OK, Continuer →' },
    de:    { title:'Augen ausruhen',      flying:'Fliegend', rider:'Reiter',   wait:'Bitte warten…',       ok:'OK, Weiter →'    },
  };

  let currentLang = 'zh_CN';
  try {
    chrome.storage.local.get('mbti_lang', d => { if (d && d.mbti_lang) currentLang = d.mbti_lang; });
    chrome.storage.onChanged.addListener((ch, area) => {
      if (area === 'local' && ch.mbti_lang) currentLang = ch.mbti_lang.newValue || 'zh_CN';
    });
  } catch(_) {}

  function tr() { return CARD_I18N[currentLang] || CARD_I18N.zh_CN; }

  const MBTI_ANIMAL = {
    INTJ:'龙',INTP:'凤凰',ENTJ:'马',ENTP:'虎',
    INFJ:'凤凰',INFP:'猫',ENFJ:'雄狮',ENFP:'马',
    ISTJ:'牛',ISFJ:'雄狮',ESTJ:'马',ESFJ:'猫',
    ISTP:'虎',ISFP:'猫',ESTP:'龙',ESFP:'雄狮',
  };
  const FLYING = new Set(['龙','凤凰']);

  function avatarUrl(type, gender) {
    return 'https://weweweai.com/avatars/' + (type||'isfp').toLowerCase()
      + '-' + (gender==='male'?1:2) + '.png?v3';
  }

  // ── Cached MBTI result ─────────────────────────────────────────────────────
  let cachedResult = null;
  try {
    chrome.storage.local.get('weweweai_mbti_result', d => {
      if (d && d.weweweai_mbti_result) cachedResult = d.weweweai_mbti_result;
    });
    chrome.storage.onChanged.addListener(ch => {
      if (ch.weweweai_mbti_result) cachedResult = ch.weweweai_mbti_result.newValue;
    });
  } catch(_) {}

  // ── State ──────────────────────────────────────────────────────────────────
  let overlayEl=null, wrapEl=null, timerEl=null, dismissBtn=null;
  let timerInt=null, dismissed=false;
  let restLeft=0, totalRest=0;

  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'WEWEWEAI_EYE_REST') showOverlay(msg.restSeconds || 300);
    if (msg.type === 'WEWEWEAI_EYE_HIDE') hideOverlay(false);
  });

  // ── CSS (once) ─────────────────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('__wew_css_v7')) return;
    const s = document.createElement('style');
    s.id = '__wew_css_v7';
    s.textContent = `
      /* Radiate-in: square image expands slowly from a tiny center dot */
      @keyframes __wew_radiate {
        0%   { transform: translate(-50%,-50%) scale(0.02); opacity: 0; }
        15%  { opacity: 1; }
        75%  { transform: translate(-50%,-50%) scale(1.05); }
        100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
      }
      /* Pronounced breathing after arriving */
      @keyframes __wew_breathe {
        0%,100% { transform: translate(-50%,-50%) scale(1); }
        50%     { transform: translate(-50%,-50%) scale(1.055); }
      }
      /* Radiate ripple rings */
      @keyframes __wew_ring {
        0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.6; }
        100% { transform: translate(-50%,-50%) scale(1.9); opacity: 0; }
      }
      /* Card text fade-in */
      @keyframes __wew_fadein {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    (document.head || document.documentElement).appendChild(s);
  }

  // ── Show overlay ───────────────────────────────────────────────────────────
  function showOverlay(restSeconds) {
    if (overlayEl) return;
    dismissed = false; restLeft = restSeconds; totalRest = restSeconds;

    const res    = cachedResult || {};
    const mbti   = (res.mbtiType || '').toUpperCase();
    const gender = res.gender || 'female';
    const animal = MBTI_ANIMAL[mbti] || '猫';
    const flying = FLYING.has(animal);
    const url    = avatarUrl(mbti, gender);
    const T      = tr();

    injectCSS();

    // ── Full-screen backdrop ─────────────────────────────────────────────────
    overlayEl = document.createElement('div');
    Object.assign(overlayEl.style, {
      position: 'fixed', inset: '0',
      background: 'rgba(0,0,12,0.35)',
      zIndex: '2147483640',
      pointerEvents: 'auto',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif',
    });
    document.documentElement.appendChild(overlayEl);

    // ── Radiate ripple rings (3 rings behind the image) ───────────────────────
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      const sz   = Math.min(window.innerWidth, window.innerHeight) * 0.92;
      Object.assign(ring.style, {
        position:   'fixed',
        left:       '50%', top: '50%',
        width:      sz + 'px', height: sz + 'px',
        borderRadius: '12px',
        border:     '3px solid rgba(168,85,247,0.55)',
        zIndex:     '2147483641',
        pointerEvents: 'none',
        animation:  `__wew_ring ${1.8 + i * 0.6}s ease-out ${i * 0.55}s infinite`,
      });
      overlayEl.appendChild(ring);
    }

    // ── Image wrapper — square, centered, expands from center ─────────────────
    const imgSz = Math.min(window.innerWidth * 0.88, window.innerHeight * 0.90);
    wrapEl = document.createElement('div');
    Object.assign(wrapEl.style, {
      position:   'fixed',
      left:       '50%', top: '50%',
      width:      imgSz + 'px', height: imgSz + 'px',
      zIndex:     '2147483645',
      pointerEvents: 'none',
      overflow:   'hidden',
      borderRadius: '14px',
      boxShadow:  '0 0 80px rgba(168,85,247,0.6), 0 0 200px rgba(168,85,247,0.25)',
      opacity:    '0',
      willChange: 'transform, opacity',
      transform:  'translate(-50%,-50%) scale(0.02)',
    });

    // ── Avatar image ──────────────────────────────────────────────────────────
    const imgEl = document.createElement('img');
    Object.assign(imgEl.style, {
      width: '100%', height: '100%',
      display: 'block',
      objectFit: 'cover',
      objectPosition: 'center',
      userSelect: 'none',
      pointerEvents: 'none',
    });
    imgEl.alt = 'weweweai avatar';

    // Only start the expand animation AFTER the image is loaded (no white-edge flash)
    function startRadiate() {
      if (dismissed || !wrapEl) return;
      // Clear inline hidden-state so the forwards-fill lands correctly
      wrapEl.style.opacity   = '';
      wrapEl.style.transform = '';
      wrapEl.style.animation = '__wew_radiate 2.0s cubic-bezier(0.16,1,0.3,1) forwards';
      wrapEl.addEventListener('animationend', () => {
        if (!dismissed && wrapEl) {
          // Lock final state in inline styles BEFORE removing the forwards fill
          wrapEl.style.opacity   = '1';
          wrapEl.style.transform = 'translate(-50%,-50%) scale(1)';
          wrapEl.style.animation = '__wew_breathe 3.5s ease-in-out infinite';
        }
      }, { once: true });
    }

    imgEl.addEventListener('load',  startRadiate, { once: true });
    imgEl.addEventListener('error', () => {
      imgEl.removeEventListener('load', startRadiate);
      imgEl.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + (mbti || 'cat') + '&size=512';
      imgEl.addEventListener('load',  startRadiate, { once: true });
      imgEl.addEventListener('error', startRadiate, { once: true });
    }, { once: true });

    imgEl.src = url;
    wrapEl.appendChild(imgEl);

    // ── Transparent card overlaid top-right of image ──────────────────────────
    const cardEl = document.createElement('div');
    Object.assign(cardEl.style, {
      position:   'absolute',
      top:        '0', right: '0',
      padding:    '18px 20px 18px 28px',
      textAlign:  'right',
      background: 'transparent',
      border:     'none',
      pointerEvents: 'auto',
      animation:  '__wew_fadein 0.5s ease 0.6s both',
    });

    // Semi-dark scrim only behind text area (top-right triangle gradient)
    const scrim = document.createElement('div');
    Object.assign(scrim.style, {
      position:   'absolute', inset: '0',
      background: 'transparent',
      borderRadius: '14px 14px 0 0',
      pointerEvents: 'none',
    });
    cardEl.appendChild(scrim);

    function mkText(tag, css, text) {
      const e = document.createElement(tag);
      Object.assign(e.style, { position:'relative', zIndex:'1', ...css });
      if (text !== undefined) e.textContent = text;
      return e;
    }

    const eyeDiv = mkText('div', {
      fontSize:'24px', display:'block', marginBottom:'4px',
    }, '👀');

    const titleDiv = mkText('div', {
      fontSize:'11px', fontWeight:'800', color:'#ffffff',
      textShadow:'0 2px 12px rgba(0,0,0,1), 0 0 28px rgba(0,0,0,0.95)', marginBottom:'2px',
      letterSpacing:'0.4px',
    }, T.title);

    const subDiv = mkText('div', {
      fontSize:'10px', color:'rgba(255,255,255,0.80)',
      textShadow:'0 2px 10px rgba(0,0,0,1), 0 0 22px rgba(0,0,0,0.9)', marginBottom:'10px',
      lineHeight:'1.5',
    }, mbti ? `${mbti} · ${animal} ${flying ? T.flying : T.rider}` : T.title);

    timerEl = mkText('div', {
      fontSize:'38px', fontWeight:'900', color:'#c084fc',
      letterSpacing:'3px', fontVariantNumeric:'tabular-nums',
      marginBottom:'12px',
      textShadow:'0 0 18px rgba(168,85,247,0.9), 0 2px 8px rgba(0,0,0,0.8)',
    });

    dismissBtn = document.createElement('button');
    Object.assign(dismissBtn.style, {
      position:   'relative', zIndex:'1',
      background: 'rgba(168,85,247,0.22)',
      border:     '1.5px solid rgba(192,132,252,0.75)',
      backdropFilter: 'blur(6px)',
      borderRadius: '10px',
      padding:    '8px 16px',
      color:      '#ffffff',
      fontSize:   '11px', fontWeight:'700',
      cursor:     'pointer', opacity:'0.4',
      transition: 'all 0.3s',
      textShadow: '0 2px 8px rgba(0,0,0,1)',
    });
    dismissBtn.textContent = T.wait;
    dismissBtn.disabled = true;
    dismissBtn.addEventListener('mouseenter', () => {
      if (!dismissBtn.disabled) dismissBtn.style.background = 'rgba(168,85,247,0.55)';
    });
    dismissBtn.addEventListener('mouseleave', () => {
      dismissBtn.style.background = 'rgba(168,85,247,0.22)';
    });
    dismissBtn.addEventListener('click', () => hideOverlay(true));

    cardEl.append(eyeDiv, titleDiv, subDiv, timerEl, dismissBtn);
    wrapEl.appendChild(cardEl);
    document.documentElement.appendChild(wrapEl);

    updateTimer();

    timerInt = setInterval(() => {
      restLeft = Math.max(0, restLeft - 1);
      updateTimer();
      if ((totalRest - restLeft) >= 15 && dismissBtn.disabled) {
        dismissBtn.disabled = false;
        dismissBtn.style.opacity = '1';
        dismissBtn.textContent = tr().ok;
      }
      if (restLeft <= 0) hideOverlay(true);
    }, 1000);
  }

  // ── Hide ───────────────────────────────────────────────────────────────────
  function hideOverlay(notify) {
    dismissed = true;
    clearInterval(timerInt); timerInt = null;
    overlayEl?.remove(); overlayEl = null;
    wrapEl?.remove();   wrapEl = null;
    timerEl = null; dismissBtn = null;
    if (notify) chrome.runtime.sendMessage({type:'WEWEWEAI_REST_DONE'}).catch(()=>{});
  }

  function updateTimer() {
    if (!timerEl) return;
    const m = Math.floor(restLeft / 60), s = restLeft % 60;
    timerEl.textContent = `${String(m).padStart(2,'0')} : ${String(s).padStart(2,'0')}`;
  }

})();
