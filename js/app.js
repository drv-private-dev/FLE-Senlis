// ===== VERSION =====
const APP_VERSION = "1.0.101";
// ====================

// ===== VERSION IN FOOTER =====
document.getElementById("appVersion").textContent = "v" + APP_VERSION;
// =============================

/* ======================================================
   THEME TOGGLE (light / dark)
====================================================== */
const body = document.body;
const toggleBtn = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  body.classList.add("dark");
  if (toggleBtn) toggleBtn.textContent = "☀ Light";
}

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    toggleBtn.textContent = isDark ? "☀ Light" : "🌙 Dark";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

/* ======================================================
   MENU RENDER (INDEX PAGE)
====================================================== */
const menuGrid = document.getElementById("menuGrid");

/* ---- helper: auto-scale titles by actual length ---- */
function autoScaleTitles() {
  document.querySelectorAll(".menu-tile .tile-title").forEach((title) => {
    const len = title.textContent.trim().length;

    if (len >= 100) {
      title.style.fontSize = "1.05rem";
    } else if (len >= 80) {
      title.style.fontSize = "1.15rem";
    } else if (len >= 65) {
      title.style.fontSize = "1.35rem";
    } else if (len >= 50) {
      title.style.fontSize = "1.65rem";
    } else {
      title.style.fontSize = "2rem";
    }
  });
}

function autoScaleSubTitles() {
  document.querySelectorAll(".menu-tile .tile-subtitle").forEach((subtitle) => {
    const len = subtitle.textContent.trim().length;

    if (len >= 100) {
      subtitle.style.fontSize = "0.50rem";
    } else if (len >= 80) {
      subtitle.style.fontSize = "0.60rem";
    } else if (len >= 65) {
      subtitle.style.fontSize = "0.75rem";
    } else if (len >= 50) {
      subtitle.style.fontSize = "0.85rem";
    } else {
      subtitle.style.fontSize = "1rem";
    }
  });
}

/* ---- load menu.json ---- */
if (menuGrid) {
  fetch("data/menu.json")
    .then((res) => res.json())
    .then((data) => {
      data.sections.forEach((item) => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

        col.innerHTML = `
          <a
            href="${item.path}"
            class="menu-tile"
            data-full="${item.title}"
          >
            <div class="tile-title">${item.title}</div>
            ${
              item.subtitle
                ? `<div class="tile-subtitle">${item.subtitle}</div>`
                : ""
            }
          </a>
        `;

        menuGrid.appendChild(col);
      });

      autoScaleTitles();
      autoScaleSubTitles();
    })
    .catch((err) => {
      console.error("Failed to load menu.json", err);
    });
}
