/* ==========================
   script.js - Final Modern
   Features:
   - dark mode (persist via localStorage) with icon swap & rotate
   - hamburger animated -> X and mobile menu slide
   - smooth scroll for anchor links
   - infinite-loop sliders for projects & news (cloning strategy)
   - auto-slide for news + prev/next controls
   - pointer drag support for sliders
   - about "more detail" toggles
   - automatic copyright year
   ========================== */

(() => {
  // Short helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /* ---------------------------
     Dark mode (persist)
  --------------------------- */
  const root = document.documentElement;
  const darkBtn = $('#darkModeBtn');
  const mobileDarkBtn = $('#mobileDarkBtn');
  const DARK_KEY = 'site-dark-mode';

  function applyInitialTheme() {
    const saved = localStorage.getItem(DARK_KEY);
    if (saved !== null) {
      root.dataset.theme = saved === 'true' ? 'dark' : 'light';
    } else {
      // prefer OS setting
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = prefersDark ? 'dark' : 'light';
    }
    updateIcons();
  }

  function toggleTheme(button) {
    const isDark = root.dataset.theme === 'dark';
    root.dataset.theme = isDark ? 'light' : 'dark';
    localStorage.setItem(DARK_KEY, root.dataset.theme === 'dark');
    if (button) {
      button.classList.add('rotate');
      setTimeout(()=> button.classList.remove('rotate'), 420);
    }
    updateIcons();
  }

  function updateIcons() {
    const isDark = root.dataset.theme === 'dark';
    if (darkBtn && darkBtn.querySelector('i')) darkBtn.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    if (mobileDarkBtn && mobileDarkBtn.querySelector('i')) mobileDarkBtn.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }

  if (darkBtn) darkBtn.addEventListener('click', ()=> toggleTheme(darkBtn));
  if (mobileDarkBtn) mobileDarkBtn.addEventListener('click', ()=> toggleTheme(mobileDarkBtn));
  applyInitialTheme();

  /* ---------------------------
     Mobile menu / hamburger
  --------------------------- */
  const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

hamburgerBtn.addEventListener("click", () => {
    hamburgerBtn.classList.toggle("active");
    mobileMenu.classList.toggle("show");
});

  /* ---------------------------
     Smooth scroll for anchors
  --------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 72; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // close mobile menu if open
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  /* ---------------------------
     About: More Detail toggles
  --------------------------- */
  $$('button.more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const more = btn.nextElementSibling;
      if (!more) return;
      more.style.display = more.style.display === 'block' ? 'none' : 'block';
    });
  });

  /* ---------------------------
     Infinite slider factory
     selectorParent: container that holds .slider-track
     trackSel: selector for track (children are cards)
  --------------------------- */
  function initInfiniteSlider(parentSelector, trackSel, prevSel, nextSel, options = {}) {
    const parent = document.querySelector(parentSelector);
    if (!parent) return null;
    const track = parent.querySelector(trackSel);
    if (!track) return null;

    let cards = Array.from(track.children);
    if (cards.length < 2) return null;

    // clone nodes
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, track.firstChild);

    // update cards ref
    cards = Array.from(track.children);

    // compute widths
    const gap = parseFloat(getComputedStyle(track).gap || 14) || 14;
    function cardWidth() {
      return Math.round(cards[0].getBoundingClientRect().width + gap);
    }

    let index = 1;
    function setPosition(animate = true) {
      const w = cardWidth();
      if (animate) track.style.transition = 'transform .38s cubic-bezier(.2,.9,.2,1)';
      else track.style.transition = 'none';
      track.style.transform = `translateX(${-w * index}px)`;
    }

    // initial
    window.addEventListener('load', ()=> setPosition(false));
    window.addEventListener('resize', ()=> setPosition(false));
    setTimeout(()=> setPosition(false), 120);

    // prev/next buttons
    const prevBtn = parent.querySelector(prevSel);
    const nextBtn = parent.querySelector(nextSel);
    if (nextBtn) nextBtn.addEventListener('click', ()=> { index++; setPosition(true); restartAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', ()=> { index--; setPosition(true); restartAuto(); });

    // loop correction after transition
    track.addEventListener('transitionend', ()=> {
      if (cards[index].isSameNode(firstClone)) {
        track.style.transition = 'none';
        index = 1;
        setPosition(false);
      } else if (cards[index].isSameNode(lastClone)) {
        track.style.transition = 'none';
        index = cards.length - 2;
        setPosition(false);
      }
    });

    // pointer drag
    let isDown = false, startX = 0, prevTranslate = 0;
    track.style.touchAction = 'pan-y';
    track.addEventListener('pointerdown', (e) => {
      isDown = true;
      startX = e.clientX;
      prevTranslate = getTranslateX(track);
      track.style.transition = 'none';
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      track.style.transform = `translateX(${prevTranslate + dx}px)`;
    });
    function release(e) {
      if (!isDown) return;
      isDown = false;
      const dx = (e.clientX || startX) - startX;
      const w = cardWidth();
      // determine swipe by checking final transform relative to prevTranslate
      const final = getTranslateX(track);
      const moved = final - prevTranslate;
      if (moved < -w * 0.25) index++;
      else if (moved > w * 0.25) index--;
      setPosition(true);
      restartAuto();
    }
    track.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);
    track.addEventListener('pointerleave', release);

    function getTranslateX(el) {
      const st = getComputedStyle(el).transform;
      if (!st || st === 'none') return 0;
      const m = st.match(/matrix.*\((.+)\)/);
      if (!m) return 0;
      const values = m[1].split(',').map(n => parseFloat(n));
      return values[4];
    }

    // auto sliding (optional)
    let autoTimer = null;
    function startAuto() {
      if (!options.auto) return;
      stopAuto();
      autoTimer = setInterval(()=> {
        index++;
        setPosition(true);
      }, options.delay || 4000);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function restartAuto() { stopAuto(); startAuto(); }

    startAuto();

    return { startAuto, stopAuto, track };
  
  // Toggle More Details
document.querySelectorAll('.proj-more-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const content = btn.nextElementSibling;
    content.style.display = content.style.display === "block" ? "none" : "block";
  });
});

// Duplicate slider items for infinite loop effect
const slider = document.getElementById("projectsSlider");
slider.innerHTML += slider.innerHTML;

  }

/* More detail toggles */
document.querySelectorAll(".proj-more-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const content = btn.nextElementSibling;
    content.style.display = content.style.display === "block" ? "none" : "block";
  });
});

/* PROJECT SLIDER ANIMATION */
/* ============================
   PORTFOLIO SLIDER LOGIC
============================ */

const slider = document.getElementById("portfolioSlider");

let direction = 1;     // 1 = kanan, -1 = kiri
let scrollSpeed = 1.2; // speed slider
let autoSlide;

function startSliding() {
  autoSlide = setInterval(() => {
    slider.scrollLeft += direction * scrollSpeed;

    // ⬅️ bounce kiri
    if (slider.scrollLeft <= 0) {
      direction = 1;
    }

    // ➡️ bounce kanan
    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 1) {
      direction = -1;
    }
  }, 16);
}

function stopSliding() {
  clearInterval(autoSlide);
}

startSliding();

/* Pause slider ketika hover pada card */
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("mouseenter", stopSliding);
  card.addEventListener("mouseleave", startSliding);
});

/* More Detail Toggle */
document.querySelectorAll(".project-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const detail = btn.nextElementSibling;
    detail.style.display = detail.style.display === "block" ? "none" : "block";
  });
});

/* ==== RECENT UPDATES SLIDER ==== */
/* ========== RECENT UPDATES SLIDER (FINAL BOUNCE + HOVER PAUSE) ========== */
/* RECENT UPDATES SLIDER */
const updatesTrack = document.querySelector(".updates-track");
let updatesDirection = 1; 
let updatesPos = 0;
let updatesSpeed = 1;
let stopUpdates = false;

const updateCards = document.querySelectorAll(".update-card");
const cardWidth = updateCards[0].offsetWidth + 20; 
const maxMove = (updateCards.length * cardWidth) - document.querySelector(".updates-wrapper").offsetWidth;

function updatesSlide() {
  if (!stopUpdates) {
    updatesPos += updatesSpeed * updatesDirection;

    if (updatesPos >= maxMove || updatesPos <= 0) {
      updatesDirection *= -1; 
    }

    updatesTrack.style.transform = `translateX(${-updatesPos}px)`;
  }

  requestAnimationFrame(updatesSlide);
}

updatesSlide();

/* Pause on hover */
updateCards.forEach(card => {
  card.addEventListener("mouseenter", () => (stopUpdates = true));
  card.addEventListener("mouseleave", () => (stopUpdates = false));
});

/* More Detail Toggle */
document.querySelectorAll(".update-more").forEach(btn => {
  btn.addEventListener("click", () => {
    const detail = btn.nextElementSibling;
    detail.style.display = detail.style.display === "block" ? "none" : "block";
  });
});


  /* ---------------------------
     Footer year
  --------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------
     Close mobile menu on ESC
  --------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      if (hamburger) hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

})();

// Auto-update copyright year
const yearSpan = document.getElementById("copyYear");
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}


/* email request form */
emailjs.init("PUBLIC_KEY");

document.getElementById("contactForm").addEventListener("submit", function(e){
    e.preventDefault();

    emailjs.send("SERVICE_ID", "TEMPLATE_ID", {
        fullname: document.getElementById("fullname").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        topic: document.getElementById("topic").value,
        message: document.getElementById("message").value
    })
    .then(function(){
        alert("Message sent!");
    }, function(error){
        alert("FAILED: " + JSON.stringify(error));
    });
});


