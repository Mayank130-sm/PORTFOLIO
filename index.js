const cards = document.querySelectorAll(".card");
const body = document.body;

/* CARD GLOW EFFECT */
cards.forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Read the accent rgb from CSS variables
    const accentRgb = getComputedStyle(card).getPropertyValue('--accent-rgb').trim() || '255, 255, 255';
    const isLight = body.classList.contains("light");
    
    const glowOpacity = isLight ? '0.12' : '0.1';
    const bgBase = isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(22, 22, 22, 0.45)';

    card.style.background = `
      radial-gradient(
        circle 120px at ${x}px ${y}px,
        rgba(${accentRgb}, ${glowOpacity}),
        transparent 80%
      ),
      ${bgBase}
    `;
  });

  card.addEventListener("mouseleave", () => {
    card.style.background = "";
  });
});

/* PARALLAX STARS EFFECT */
window.addEventListener("mousemove", (e) => {
  const stars = document.querySelector(".stars");
  if (stars) {
    const x = (e.clientX - window.innerWidth / 2) * -0.015;
    const y = (e.clientY - window.innerHeight / 2) * -0.015;
    stars.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }
});

/* BACKGROUND UPGRADE: ELEGANT AURORA BLOBS & GRID */
const bgContainer = document.querySelector(".stars");
if (bgContainer) {
  bgContainer.innerHTML = `
    <div class="aurora-blob blob-1"></div>
    <div class="aurora-blob blob-2"></div>
    <div class="aurora-blob blob-3"></div>
    <div class="aurora-grid"></div>
  `;
}

/* ===================== CHAIN TOGGLE LOGIC ===================== */
const chainContainer = document.querySelector(".chain-container");
const chainLinks = document.querySelectorAll(".chain span");
const chainBall = document.querySelector(".chain-ball");

// Load saved theme
if (localStorage.getItem("theme") === "light") {
  body.classList.add("light");
}

if (chainContainer && chainLinks.length > 0 && chainBall) {
  const points = [];
  const numPoints = chainLinks.length + 2; // 1 anchor + 8 links + 1 ball = 10 points
  const spacing = 12; // vertical rest distance between links
  const gravity = 0.45;
  const damping = 0.985;
  const iterations = 6;

  const anchorX = 20; // center of container (40px width)
  const anchorY = 0;

  // Initialize points vertically
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: anchorX,
      y: anchorY + i * spacing,
      oldX: anchorX,
      oldY: anchorY + i * spacing
    });
  }

  let isDragging = false;
  let dragMoved = false;
  let startDragY = 0;
  let containerRect = null;

  let mouseX = anchorX;
  let mouseY = anchorY + (numPoints - 1) * spacing;
  let prevMouseX = mouseX;
  let prevMouseY = mouseY;

  function updateContainerRect() {
    containerRect = chainContainer.getBoundingClientRect();
  }

  // Update container rect initially and on resize/scroll
  updateContainerRect();
  window.addEventListener("resize", updateContainerRect);
  window.addEventListener("scroll", updateContainerRect);

  // Mouse drag start
  chainContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    updateContainerRect();
    mouseX = e.clientX - containerRect.left;
    mouseY = e.clientY - containerRect.top;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    dragMoved = false;
    startDragY = mouseY;
    e.preventDefault();
  });

  // Touch drag start
  chainContainer.addEventListener("touchstart", (e) => {
    isDragging = true;
    updateContainerRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - containerRect.left;
    mouseY = touch.clientY - containerRect.top;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    dragMoved = false;
    startDragY = mouseY;
    e.preventDefault();
  }, { passive: false });

  // Tracking mouse move across window to capture swiping force as well
  window.addEventListener("mousemove", (e) => {
    if (!containerRect) updateContainerRect();
    mouseX = e.clientX - containerRect.left;
    mouseY = e.clientY - containerRect.top;
    if (isDragging) {
      if (Math.abs(mouseY - startDragY) > 8) {
        dragMoved = true;
      }
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (!containerRect) updateContainerRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - containerRect.left;
    mouseY = touch.clientY - containerRect.top;
    if (isDragging) {
      if (Math.abs(mouseY - startDragY) > 8) {
        dragMoved = true;
      }
      e.preventDefault();
    }
  }, { passive: false });

  function clickJerk() {
    // Apply downward velocity impulse to simulate a tug and bounce
    points[numPoints - 1].y += 45;
    points[numPoints - 2].y += 25;
    points[numPoints - 3].y += 15;
  }

  function handleRelease() {
    if (!isDragging) return;
    isDragging = false;

    const ballPt = points[numPoints - 1];
    const restY = anchorY + (numPoints - 1) * spacing;

    if (dragMoved) {
      // If pulled down past threshold
      if (ballPt.y - restY > 35) {
        toggleTheme();
      }
    } else {
      // Simple click
      toggleTheme();
      clickJerk();
    }
  }

  window.addEventListener("mouseup", handleRelease);
  window.addEventListener("touchend", handleRelease);

  function updatePhysics() {
    // 1. Verlet Integration (Points 1 to 9)
    for (let i = 1; i < numPoints; i++) {
      const p = points[i];
      let vx = (p.x - p.oldX) * damping;
      let vy = (p.y - p.oldY) * damping;

      p.oldX = p.x;
      p.oldY = p.y;

      p.x += vx;
      p.y += vy + gravity;
    }

    // 2. Mouse Hover force (swiping) when not dragging
    if (!isDragging) {
      const mouseVx = mouseX - prevMouseX;
      const mouseVy = mouseY - prevMouseY;
      const speed = Math.hypot(mouseVx, mouseVy);

      if (speed > 0.5) {
        const maxVel = 18;
        const scale = speed > maxVel ? maxVel / speed : 1;
        const hoverVx = mouseVx * scale;
        const hoverVy = mouseVy * scale;

        for (let i = 1; i < numPoints; i++) {
          const p = points[i];
          const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
          if (dist < 35) {
            const force = (1 - dist / 35) * 0.22;
            p.x += hoverVx * force;
            p.y += hoverVy * force;
          }
        }
      }
    } else {
      // Elastic stretch limit for dragging
      const targetBall = points[numPoints - 1];
      targetBall.oldX = targetBall.x;
      targetBall.oldY = targetBall.y;

      const dx = mouseX - anchorX;
      const dy = mouseY - anchorY;
      const dist = Math.hypot(dx, dy);
      const maxDragDist = 175;

      if (dist > maxDragDist) {
        targetBall.x = anchorX + (dx / dist) * maxDragDist;
        targetBall.y = anchorY + (dy / dist) * maxDragDist;
      } else {
        targetBall.x = mouseX;
        targetBall.y = mouseY;
      }
    }

    // Keep updating prevMouse coords
    prevMouseX = mouseX;
    prevMouseY = mouseY;

    // 3. Resolve Link Constraints
    for (let iter = 0; iter < iterations; iter++) {
      // Anchor is fixed
      points[0].x = anchorX;
      points[0].y = anchorY;

      for (let i = 0; i < numPoints - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) continue;

        const diff = spacing - dist;
        const percent = (diff / dist) * 0.5;
        const offsetX = dx * percent;
        const offsetY = dy * percent;

        if (i === 0) {
          // Point 0 is anchor (cannot move)
          p2.x += offsetX * 2;
          p2.y += offsetY * 2;
        } else if (i + 1 === numPoints - 1 && isDragging) {
          // Point 9 is ball (locked to drag)
          p1.x -= offsetX * 2;
          p1.y -= offsetY * 2;
        } else {
          p1.x -= offsetX;
          p1.y -= offsetY;
          p2.x += offsetX;
          p2.y += offsetY;
        }
      }
    }
  }

  function render() {
    // Render chain links (spans)
    for (let i = 0; i < chainLinks.length; i++) {
      const link = chainLinks[i];
      const pt = points[i + 1];
      link.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -50%)`;
    }
    // Render ball
    const ballPt = points[numPoints - 1];
    chainBall.style.transform = `translate3d(${ballPt.x}px, ${ballPt.y}px, 0) translate(-50%, -50%)`;
  }

  function tick() {
    updatePhysics();
    render();
    requestAnimationFrame(tick);
  }

  // Start the physics loop
  requestAnimationFrame(tick);
}

function toggleTheme() {
  body.classList.toggle("light");
  const isLight = body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
}
