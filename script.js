/* ============================
   DARK MODE
================================*/
const html = document.documentElement;
const btnDesktop = document.getElementById("darkModeBtn");
const btnMobile = document.getElementById("mobileDarkBtn");

function toggleDark(btn) {
  html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
  btn.classList.add("rotate");
  setTimeout(() => btn.classList.remove("rotate"), 400);
}

btnDesktop.addEventListener("click", () => toggleDark(btnDesktop));
btnMobile.addEventListener("click", () => toggleDark(btnMobile));

/* ============================
   HAMBURGER MENU
================================*/
const ham = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

ham.addEventListener("click", () => {
  mobileMenu.style.right = mobileMenu.style.right === "0px" ? "-100%" : "0px";
});

/* ============================
   SMOOTH SCROLL EXTRA (for JS)
================================*/
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: "smooth"
      });
      mobileMenu.style.right = "-100%";
    }
  });
});

/* ============================
   INFINITE LOOP SLIDER
================================*/
function initInfiniteSlider(selector, nextBtn, prevBtn) {
  const track = document.querySelector(selector);
  const cards = Array.from(track.children);

  // Clone first & last for infinite loop
  const firstClone = cards[0].cloneNode(true);
  const lastClone = cards[cards.length - 1].cloneNode(true);

  track.appendChild(firstClone);
  track.insertBefore(lastClone, cards[0]);

  let index = 1;
  const cardWidth = cards[0].offsetWidth + 24; 
  track.style.transform = `translateX(${-cardWidth * index}px)`;

  function moveToIndex() {
    track.style.transition = ".4s ease";
    track.style.transform = `translateX(${-cardWidth * index}px)`;
  }

  document.querySelector(nextBtn).addEventListener("click", () => {
    index++;
    moveToIndex();
    if (index >= cards.length + 1) {
      setTimeout(() => {
        track.style.transition = "none";
        index = 1;
        track.style.transform = `translateX(${-cardWidth * index}px)`;
      }, 420);
    }
  });

  document.querySelector(prevBtn).addEventListener("click", () => {
    index--;
    moveToIndex();
    if (index <= 0) {
      setTimeout(() => {
        track.style.transition = "none";
        index = cards.length;
        track.style.transform = `translateX(${-cardWidth * index}px)`;
      }, 420);
    }
  });

  // Auto-slide every 4s
  setInterval(() => {
    index++;
    moveToIndex();
    if (index >= cards.length + 1) {
      setTimeout(() => {
        track.style.transition = "none";
        index = 1;
        track.style.transform = `translateX(${-cardWidth * index}px)`;
      }, 420);
    }
  }, 4000);
}

/* INIT SLIDERS */
initInfiniteSlider(".project-slider", "#projectNext", "#projectPrev");
initInfiniteSlider(".news-slider", "#newsNext", "#newsPrev");

/* ============================
   AUTO UPDATE COPYRIGHT YEAR
================================*/
document.getElementById("year").textContent = new Date().getFullYear();
