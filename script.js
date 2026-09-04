/* ================================================================
   KRISHNA JANMASHTAMI — PREMIUM CINEMATIC WEBSITE
   script.js
================================================================ */

'use strict';

/* ── DOM REFERENCES ───────────────────────────────────────────── */
const pages       = document.querySelectorAll('.page');
const bgMusic     = document.getElementById('bgMusic');
const musicBtn    = document.getElementById('musicBtn');
const musicLabel  = document.getElementById('musicLabel');
const musicBtnP1  = document.getElementById('musicBtnPage1');
const canvas      = document.getElementById('particleCanvas');
const ctx         = canvas.getContext('2d');

/* ── STATE ────────────────────────────────────────────────────── */
let currentPage   = 1;
let isPlaying     = false;
let transitioning = false;

/* ================================================================
   PARTICLE SYSTEM
================================================================ */
const PARTICLE_COUNT = 70;
const PETAL_COUNT    = 22;
const particles      = [];
const petals         = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* ── Particle factory ─────────────────────────────────────────── */
function createParticle() {
  const colors = [
    'rgba(240,192,96,',
    'rgba(255,228,154,',
    'rgba(200,146,42,',
    'rgba(255,200,220,',
    'rgba(180,200,255,',
    'rgba(255,255,255,',
  ];
  return {
    x:           Math.random() * canvas.width,
    y:           Math.random() * canvas.height,
    r:           Math.random() * 1.8 + 0.4,
    speedY:      -(Math.random() * 0.4 + 0.1),
    speedX:      (Math.random() - 0.5) * 0.2,
    opacity:     Math.random() * 0.7 + 0.15,
    flicker:     Math.random() * Math.PI * 2,
    flickerSpeed:Math.random() * 0.02 + 0.008,
    color:       colors[Math.floor(Math.random() * colors.length)],
  };
}

/* ── Petal factory ────────────────────────────────────────────── */
const PETAL_EMOJIS = ['🌸', '🌺', '✿', '❀', '🌼'];

function createPetal() {
  return {
    x:          Math.random() * canvas.width,
    y:          -40 - Math.random() * 200,
    size:       Math.random() * 14 + 8,
    speedY:     Math.random() * 0.7 + 0.3,
    speedX:     (Math.random() - 0.5) * 0.5,
    rotation:   Math.random() * 360,
    rotSpeed:   (Math.random() - 0.5) * 1.2,
    opacity:    Math.random() * 0.55 + 0.15,
    emoji:      PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)],
    wobble:     Math.random() * Math.PI * 2,
    wobbleSpeed:Math.random() * 0.02 + 0.005,
  };
}

/* ── Init pools ───────────────────────────────────────────────── */
for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
for (let i = 0; i < PETAL_COUNT; i++) {
  const p = createPetal();
  p.y = Math.random() * canvas.height; // spread on load
  petals.push(p);
}

/* ── Draw loop ────────────────────────────────────────────────── */
function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Glowing particles */
  for (const p of particles) {
    p.flicker += p.flickerSpeed;
    const alpha = p.opacity * (0.7 + 0.3 * Math.sin(p.flicker));

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color + alpha + ')';
    ctx.fill();

    if (p.r > 1.2) {
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grd.addColorStop(0, p.color + (alpha * 0.4) + ')');
      grd.addColorStop(1, p.color + '0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    p.y += p.speedY;
    p.x += p.speedX;
    if (p.y < -5)                          { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
    if (p.x < -5 || p.x > canvas.width + 5) p.x = Math.random() * canvas.width;
  }

  /* Floating petals */
  ctx.save();
  for (const p of petals) {
    p.wobble   += p.wobbleSpeed;
    p.rotation += p.rotSpeed;
    p.y        += p.speedY;
    p.x        += p.speedX + Math.sin(p.wobble) * 0.4;

    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.font = `${p.size}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.emoji, 0, 0);
    ctx.restore();

    if (p.y > canvas.height + 40) {
      p.y = -40;
      p.x = Math.random() * canvas.width;
    }
  }
  ctx.restore();

  requestAnimationFrame(drawLoop);
}

drawLoop();

/* ================================================================
   MUSIC SYSTEM
   - No autoplay
   - Play/Pause toggle
   - Loops via `loop` attribute on <audio>
   - Persists across all pages (single <audio> element outside pages)
   - Volume set to 0.65
================================================================ */
function updateMusicUI() {
  if (isPlaying) {
    musicBtn.classList.add('playing');
    musicLabel.textContent = '❚❚ Pause Music';
    if (musicBtnP1) musicBtnP1.textContent = '❚❚ Pause Music';
  } else {
    musicBtn.classList.remove('playing');
    musicLabel.textContent = '▶ Play Music';
    if (musicBtnP1) musicBtnP1.textContent = '🎵 Play Music';
  }
}

async function toggleMusic() {
  if (isPlaying) {
    bgMusic.pause();
    isPlaying = false;
    updateMusicUI();
  } else {
    bgMusic.volume = 0.65;
    try {
      await bgMusic.play();
      isPlaying = true;
    } catch (err) {
      console.warn('Music autoplay blocked by browser:', err.message);
    }
    updateMusicUI();
  }
}

/* Sync state if browser pauses audio externally */
bgMusic.addEventListener('pause', () => {
  isPlaying = false;
  updateMusicUI();
});
bgMusic.addEventListener('play', () => {
  isPlaying = true;
  updateMusicUI();
});

musicBtn.addEventListener('click',  toggleMusic);
if (musicBtnP1) musicBtnP1.addEventListener('click', toggleMusic);

/* ================================================================
   PAGE NAVIGATION — cinematic transitions
================================================================ */
function goToPage(to, dir = 'forward') {
  if (transitioning || to === currentPage) return;
  transitioning = true;

  const fromEl = document.getElementById('page' + currentPage);
  const toEl   = document.getElementById('page' + to);

  /* Position incoming page off-screen */
  toEl.style.transition = 'none';
  toEl.style.opacity    = '0';
  toEl.style.transform  = dir === 'forward' ? 'translateY(40px)' : 'translateY(-40px)';
  toEl.classList.add('active');
  void toEl.offsetHeight; /* force reflow */

  /* Animate outgoing */
  fromEl.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  fromEl.style.opacity    = '0';
  fromEl.style.transform  = dir === 'forward' ? 'translateY(-25px)' : 'translateY(25px)';

  /* Animate incoming */
  toEl.style.transition = 'opacity 0.65s ease 0.15s, transform 0.65s ease 0.15s';
  toEl.style.opacity    = '1';
  toEl.style.transform  = 'translateY(0)';

  setTimeout(() => {
    fromEl.classList.remove('active');
    fromEl.style.cssText = '';
    toEl.style.transition = '';
    toEl.style.opacity    = '';
    toEl.style.transform  = '';

    currentPage   = to;
    transitioning = false;

    toEl.scrollTop = 0;

    if (to === 4) triggerPage4Animations();
    if (to === 1) resetPage1Animations();
  }, 880);
}

/* ── Button wiring ────────────────────────────────────────────── */
/* Page 1 → 2 */
document.getElementById('startBtn').addEventListener('click', () => {
  pulseButton(document.getElementById('startBtn'));
  setTimeout(() => goToPage(2, 'forward'), 160);
});

/* Page 2 → 3 / back to 1 */
document.getElementById('nextBtn2').addEventListener('click', () => goToPage(3, 'forward'));
document.getElementById('backBtn2').addEventListener('click', () => goToPage(1, 'back'));

/* Page 3 → 4 / back to 2 */
document.getElementById('nextBtn3').addEventListener('click', () => {
  heartBurst(document.getElementById('nextBtn3'));
  setTimeout(() => goToPage(4, 'forward'), 400);
});
document.getElementById('backBtn3').addEventListener('click', () => goToPage(2, 'back'));

/* Page 4 → back to 3 */
document.getElementById('backBtn4').addEventListener('click', () => goToPage(3, 'back'));

/* Page 4 — Exit Surprise */
document.getElementById('exitBtn').addEventListener('click', () => {
  const msg = document.getElementById('exitMsg');

  /* Attempt to close the tab */
  window.close();

  /* window.close() is synchronous but may be blocked silently.
     Check a moment later if the window is still open. */
  setTimeout(() => {
    /* If we're still here the browser blocked close */
    msg.textContent = 'You can close this tab whenever you\'re ready ❤️';
    msg.classList.add('visible');

    /* Auto-hide message after 6 seconds */
    setTimeout(() => msg.classList.remove('visible'), 6000);
  }, 300);
});

/* ================================================================
   BUTTON EFFECTS
================================================================ */
function pulseButton(btn) {
  btn.style.transform = 'scale(0.96)';
  setTimeout(() => { btn.style.transform = ''; }, 150);
}

function heartBurst(btn) {
  const rect   = btn.getBoundingClientRect();
  const cx     = rect.left + rect.width  / 2;
  const cy     = rect.top  + rect.height / 2;
  const emojis = ['❤️','💙','🌸','✨','💕','🕉️'];

  for (let i = 0; i < 10; i++) {
    const el = document.createElement('span');
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.cssText = [
      'position:fixed',
      `left:${cx}px`,
      `top:${cy}px`,
      `font-size:${12 + Math.random() * 18}px`,
      'pointer-events:none',
      'z-index:9999',
      'transform:translate(-50%,-50%)',
      'transition:all 0.85s ease-out',
      'opacity:1',
    ].join(';');
    document.body.appendChild(el);

    const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.6;
    const dist  = 55 + Math.random() * 85;
    const dx    = Math.cos(angle) * dist;
    const dy    = Math.sin(angle) * dist;

    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.2)`;
      el.style.opacity   = '0';
    });
    setTimeout(() => el.remove(), 950);
  }
}

/* ================================================================
   PAGE 4 — REVEAL ANIMATIONS
================================================================ */
function triggerPage4Animations() {
  const photo   = document.getElementById('ourPhotoWrapper');
  const wishes  = document.getElementById('wishesCard');
  const exitBtn = document.getElementById('exitBtn');
  const exitMsg = document.getElementById('exitMsg');

  /* Reset all */
  photo.classList.remove('in-view');
  wishes.classList.remove('in-view');
  photo.style.opacity  = '0';
  wishes.style.opacity = '0';

  /* Clear any leftover exit message */
  if (exitMsg) { exitMsg.textContent = ''; exitMsg.classList.remove('visible'); }

  /* Staggered reveal */
  setTimeout(() => photo.classList.add('in-view'),  100);
  setTimeout(() => wishes.classList.add('in-view'), 620);
}

/* ================================================================
   PAGE 1 — RE-TRIGGER ANIMATIONS ON RETURN
================================================================ */
function resetPage1Animations() {
  document.querySelectorAll('#page1 .animate-fade-up').forEach(el => {
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = '';
  });
}

/* ================================================================
   KEYBOARD NAVIGATION
================================================================ */
document.addEventListener('keydown', e => {
  if (transitioning) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    if (currentPage < 4) goToPage(currentPage + 1, 'forward');
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (currentPage > 1) goToPage(currentPage - 1, 'back');
  }
  if (e.key === ' ') { e.preventDefault(); toggleMusic(); }
});

/* ================================================================
   SWIPE NAVIGATION (touch devices)
================================================================ */
let touchX0 = 0, touchY0 = 0, touchT0 = 0;

document.addEventListener('touchstart', e => {
  touchX0 = e.touches[0].clientX;
  touchY0 = e.touches[0].clientY;
  touchT0 = Date.now();
}, { passive: true });

document.addEventListener('touchend', e => {
  if (transitioning) return;
  const dx  = e.changedTouches[0].clientX - touchX0;
  const dy  = e.changedTouches[0].clientY - touchY0;
  const dt  = Date.now() - touchT0;
  if (dt > 400 || Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 1.5) return;
  if (dx < 0 && currentPage < 4) goToPage(currentPage + 1, 'forward');
  if (dx > 0 && currentPage > 1) goToPage(currentPage - 1, 'back');
}, { passive: true });

/* ================================================================
   IMAGE FALLBACK
================================================================ */
function imgFallback(id, label) {
  const img = document.getElementById(id);
  if (!img) return;
  img.addEventListener('error', function onErr() {
    this.removeEventListener('error', onErr);
    this.style.display = 'none';
    const fb = document.createElement('div');
    fb.style.cssText = [
      'width:100%', 'min-height:260px', 'display:flex',
      'align-items:center', 'justify-content:center',
      'background:rgba(240,192,96,0.04)', 'border-radius:14px',
      'color:rgba(240,192,96,0.45)', 'font-family:Cinzel,serif',
      'font-size:0.82rem', 'text-align:center', 'padding:20px',
      'letter-spacing:0.08em',
    ].join(';');
    fb.textContent = label;
    this.parentNode.insertBefore(fb, this);
  });
}

imgFallback('radhaImg',   '[ Add assets/radha.png ]');
imgFallback('krishnaImg', '[ Add assets/krishna.png ]');
imgFallback('ourPhoto',   '[ Add assets/our-photo.png ]');

bgMusic.addEventListener('error', () => {
  console.warn('Music not found — place assets/music.mp3 in the assets folder.');
  [musicBtn, musicBtnP1].forEach(b => {
    if (!b) return;
    b.style.opacity = '0.45';
    b.title = 'Music unavailable — add assets/music.mp3';
  });
});

/* ================================================================
   AMBIENT TWINKLE STARS (sporadic bright flashes on top layer)
================================================================ */
(function twinkleStars() {
  function spawn() {
    const star = document.createElement('div');
    const size = Math.random() * 3 + 1;
    Object.assign(star.style, {
      position:    'fixed',
      left:        Math.random() * 100 + '%',
      top:         Math.random() * 65  + '%',
      width:       size + 'px',
      height:      size + 'px',
      background:  'radial-gradient(circle, rgba(255,255,210,0.95) 0%, transparent 70%)',
      borderRadius:'50%',
      pointerEvents:'none',
      zIndex:      '0',
      opacity:     '0',
      transition:  'opacity 0.6s ease',
    });
    document.body.appendChild(star);
    requestAnimationFrame(() => { star.style.opacity = '0.95'; });
    setTimeout(() => { star.style.opacity = '0'; }, 1100);
    setTimeout(() => star.remove(), 1800);
  }
  setInterval(spawn, 650);
})();

/* ================================================================
   INIT — ensure correct starting state on page load / refresh
================================================================ */
(function init() {
  pages.forEach((p, i) => {
    if (i === 0) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
      p.style.opacity   = '0';
      p.style.transform = 'translateY(30px)';
    }
  });
  currentPage = 1;
  updateMusicUI();
})();
