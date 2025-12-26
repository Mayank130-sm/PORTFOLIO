const cards = document.querySelectorAll(".card");
const body = document.body;

/* CARD GLOW EFFECT */
cards.forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Use refined colours depending on theme (or generic light/shadow)
    // We stay subtle.
    card.style.background = `
      radial-gradient(
        circle at ${x}px ${y}px,
        rgba(255,255,255,0.08),
        rgba(22, 22, 22, 0.95)
      )
    `;
  });

  card.addEventListener("mouseleave", () => {
    // Reset to CSS default (handled by CSS, but good to clear inline style)
    card.style.background = "";
  });
});

/* START BACKGROUND */
const starContainer = document.querySelector(".stars");
const STAR_COUNT = 120; // adjust for density

if (starContainer) {
  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    // random position
    star.style.top = Math.random() * 100 + "vh";
    star.style.left = Math.random() * 100 + "vw";
    // random twinkle speed & delay
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 5;

    star.style.animationDuration = `${duration}s`;
    star.style.animationDelay = `${delay}s`;

    starContainer.appendChild(star);
  }
}

/* ===================== CHAIN TOGGLE LOGIC ===================== */
const chainContainer = document.querySelector(".chain-container");
let isDragging = false;
let startY = 0;
let currentY = 0;

// Load saved theme
if (localStorage.getItem("theme") === "light") {
  body.classList.add("light");
}

if (chainContainer) {
  // MOUSE EVENTS
  chainContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    startY = e.clientY;
    chainContainer.style.transition = "none"; // Remove transition for instant drag
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const diff = e.clientY - startY;
    if (diff > 0 && diff < 150) { // Limit drag distance
      currentY = diff;
      chainContainer.style.transform = `translateY(${currentY}px)`;
    }
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    chainContainer.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

    if (currentY > 50) { // Threshold to toggle
      toggleTheme();
    }

    // Reset position
    chainContainer.style.transform = "translateY(0)";
    currentY = 0;
  });

  // TOUCH EVENTS (Mobile)
  chainContainer.addEventListener("touchstart", (e) => {
    isDragging = true;
    startY = e.touches[0].clientY;
    chainContainer.style.transition = "none";
  });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0 && diff < 150) {
      currentY = diff;
      chainContainer.style.transform = `translateY(${currentY}px)`;
    }
  });

  window.addEventListener("touchend", () => {
    if (!isDragging) return;
    isDragging = false;
    chainContainer.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

    if (currentY > 50) {
      toggleTheme();
    }

    chainContainer.style.transform = "translateY(0)";
    currentY = 0;
  });

  // CLICK FALLBACK
  chainContainer.addEventListener("click", () => {
    // If no drag happened (or very small), treat as click
    if (currentY < 10) {
      toggleTheme();
    }
  });
}

function toggleTheme() {
  body.classList.toggle("light");
  const isLight = body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
}
