const CARD_I18N = {
  en:    { title:'Rest Your Eyes',    flying:'Flying',  rider:'Rider', wait:'Please wait…',       ok:'OK, Continue →' },
  zh_CN: { title:'休息一下，保护眼睛', flying:'飞翔中',  rider:'骑士',  wait:'请稍候…',            ok:'好的，继续 →'   },
  zh_TW: { title:'休息一下，保護眼睛', flying:'飛翔中',  rider:'騎士',  wait:'請稍候…',            ok:'好的，繼續 →'   },
  ja:    { title:'目を休めましょう',    flying:'飛行中',  rider:'ライダー', wait:'少々お待ちを…',    ok:'OK、続ける →'   },
  ko:    { title:'눈을 쉬게 하세요',   flying:'비행 중', rider:'라이더', wait:'잠시만요…',          ok:'계속하기 →'    },
  es:    { title:'Descansa la vista',  flying:'Volando', rider:'Jinete', wait:'Por favor espera…',  ok:'OK, Continuar →'},
  pt:    { title:'Descanse os olhos',  flying:'Voando',  rider:'Cavaleiro', wait:'Aguarde…',        ok:'OK, Continuar →'},
  vi:    { title:'Nghỉ ngơi mắt',      flying:'Đang bay',rider:'Kỵ sĩ', wait:'Vui lòng chờ…',     ok:'OK, Tiếp tục →' },
  fr:    { title:'Reposez vos yeux',   flying:'En vol',  rider:'Cavalier', wait:'Veuillez patienter…', ok:'OK, Continuer →'},
  de:    { title:'Augen ausruhen',     flying:'Fliegend',rider:'Reiter', wait:'Bitte warten…',      ok:'OK, Weiter →'   },
};
const MBTI_ANIMAL = {
  INTJ:'龙',INTP:'凤凰',ENTJ:'马',ENTP:'虎',INFJ:'凤凰',INFP:'猫',ENFJ:'雄狮',ENFP:'马',
  ISTJ:'牛',ISFJ:'雄狮',ESTJ:'马',ESFJ:'猫',ISTP:'虎',ISFP:'猫',ESTP:'龙',ESFP:'雄狮',
};
const FLYING = new Set(['龙','凤凰']);

let restLeft = 0, totalRest = 0, timerInt = null;
const wrapEl  = document.getElementById('wrap');
const timerEl = document.getElementById('timer');
const btnEl   = document.getElementById('btn');

function fmt(s){ return String(Math.floor(s/60)).padStart(2,'0')+' : '+String(s%60).padStart(2,'0'); }

function done() {
  clearInterval(timerInt);
  chrome.runtime.sendMessage({ type: 'WEWEWEAI_REST_DONE' }).catch(()=>{});
  window.close();
}

function sizeWrap() {
  const sz = Math.min(window.innerWidth * 0.88, window.innerHeight * 0.90);
  wrapEl.style.width  = sz + 'px';
  wrapEl.style.height = sz + 'px';
}
function sizeRings() {
  const sz = Math.min(window.innerWidth, window.innerHeight) * 0.92;
  ['ring1','ring2','ring3'].forEach((id,i) => {
    const r = document.getElementById(id);
    r.style.width = r.style.height = sz + 'px';
    r.style.animation = `ring ${1.8 + i*0.6}s ease-out ${i*0.55}s infinite`;
  });
}

function startRadiate() {
  wrapEl.style.opacity = '';
  wrapEl.style.transform = '';
  wrapEl.style.animation = 'radiate 2.0s cubic-bezier(0.16,1,0.3,1) forwards';
  wrapEl.addEventListener('animationend', () => {
    wrapEl.style.opacity   = '1';
    wrapEl.style.transform = 'translate(-50%,-50%) scale(1)';
    wrapEl.style.animation = 'breathe 3.5s ease-in-out infinite';
  }, { once: true });
}

chrome.storage.local.get(['weweweai_mbti_result','mbti_lang','weweweai_eye_rest_seconds'], (data) => {
  const res    = data.weweweai_mbti_result || {};
  const lang   = data.mbti_lang || 'zh_CN';
  const secs   = data.weweweai_eye_rest_seconds || 300;
  const T      = CARD_I18N[lang] || CARD_I18N.zh_CN;
  const mbti   = (res.mbtiType || '').toUpperCase();
  const gender = res.gender || 'female';
  const animal = MBTI_ANIMAL[mbti] || '猫';
  const flying = FLYING.has(animal);

  document.getElementById('title').textContent = T.title;
  document.getElementById('sub').textContent   = mbti ? `${mbti} · ${animal} ${flying ? T.flying : T.rider}` : T.title;
  btnEl.textContent = T.wait;

  sizeWrap();
  sizeRings();

  const imgEl = document.getElementById('avatar');
  imgEl.addEventListener('load',  startRadiate, { once: true });
  imgEl.addEventListener('error', () => {
    imgEl.removeEventListener('load', startRadiate);
    imgEl.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + (mbti || 'cat') + '&size=512';
    imgEl.addEventListener('load',  startRadiate, { once: true });
    imgEl.addEventListener('error', startRadiate, { once: true });
  }, { once: true });
  imgEl.src = 'https://weweweai.com/avatars/' + (mbti||'isfp').toLowerCase() + '-' + (gender==='male'?1:2) + '.png?v3';

  restLeft = totalRest = secs;
  timerEl.textContent = fmt(restLeft);

  timerInt = setInterval(() => {
    restLeft = Math.max(0, restLeft - 1);
    timerEl.textContent = fmt(restLeft);
    if ((totalRest - restLeft) >= 15 && !btnEl.classList.contains('ready')) {
      btnEl.classList.add('ready');
      btnEl.textContent = (CARD_I18N[lang] || CARD_I18N.zh_CN).ok;
    }
    if (restLeft <= 0) done();
  }, 1000);
});

btnEl.addEventListener('click', () => { if (btnEl.classList.contains('ready')) done(); });
window.addEventListener('resize', () => { sizeWrap(); sizeRings(); });
