const COURSE_TITLE = "Grammaire progressive du Français";
const APP_VERSION = "1.0.007"; // Updated version

async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load " + url);
  return res.json();
}

function setCourseTitle(title) {
  const el = document.getElementById("courseTitle");
  if (el) el.textContent = title || COURSE_TITLE;
}

function renderSectionCard(s) {
  const col = document.createElement("div");
  col.className = "col-12 col-md-4";
  const card = document.createElement("div");
  card.className = "card section-card";
  card.tabIndex = 0;
  card.role = "button";
  card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${s.title}</h5>
      <p class="card-text">Відкрийте розділ та потренуйтеся.</p>
      <button class="btn btn-sm btn-outline-primary select-btn" data-file="${s.file}">Відкрити</button>
    </div>
  `;
  col.appendChild(card);
  return col;
}

// ==== Create question block ====
function createQuestionElement(q) {
  const section = document.createElement("section");
  section.className = "mb-4 position-relative";
  section.dataset.id = q.id;

  const header = document.createElement("div");
  header.className = "d-flex justify-content-between align-items-center";

  const h2 = document.createElement("h2");
  h2.textContent = `Питання ${q.id}`;

  const hintBtn = document.createElement("button");
  hintBtn.className = "btn btn-sm btn-outline-info";
  hintBtn.innerHTML = '<i class="bi bi-info-circle"></i> Підказка';

  header.append(h2, hintBtn);

  const label = document.createElement("label");
  label.htmlFor = `q_${q.id}`;
  label.className = "form-label mt-2";
  label.textContent = q.text;

  const wrapper = document.createElement("div");
  wrapper.className = "position-relative d-flex align-items-center";
  wrapper.style.maxWidth = "400px";

  const input = document.createElement("input");
  input.type = "text";
  input.id = `q_${q.id}`;
  input.className = "form-control";
  input.style.paddingRight = "60px";

  const badge = document.createElement("span");
  badge.id = `badge_${q.id}`;
  badge.className = "badge position-absolute answer-badge";
  badge.style.fontSize = "1rem";
  badge.style.display = "none";
  badge.style.right = "10px";

  const checkBtn = document.createElement("button");
  checkBtn.className = "btn btn-sm btn-primary ms-2";
  checkBtn.textContent = "Check";

  const hintBox = document.createElement("div");
  hintBox.className = "alert alert-info mt-2";
  hintBox.style.display = "none";
  hintBox.textContent = q.hint;

  hintBtn.onclick = () => {
    hintBox.style.display = hintBox.style.display === "none" ? "block" : "none";
  };

  checkBtn.onclick = () => {
    const user = input.value;

    const expected = q.answer || decodeBase64(q.answer_b64 || "");

    const ok = checkAnswer(expected, user);

    if (ok) {
      input.classList.add("is-valid");
      input.classList.remove("is-invalid");
      // badge.textContent = "✔";
      // badge.className = "badge bg-success position-absolute answer-badge";
    } else {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      // badge.textContent = "✘";
      // badge.className = "badge bg-danger position-absolute answer-badge";
    }

    badge.style.display = "inline-block";
    updateProgress();
    updateCorrectCountFromInputs();
  };

  wrapper.append(input, checkBtn, badge);

  section.append(header, label, wrapper, hintBox);
  return section;
}

// === Base64 decode ===
function decodeBase64(s) {
  try {
    return atob(s);
  } catch {
    return "";
  }
}

function showQuiz(data) {
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("quizArea").classList.remove("hidden");
  document.getElementById("sectionTitle").textContent = data.title || "";

  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";
  data.questions.forEach((q) =>
    container.appendChild(createQuestionElement(q))
  );

  updateProgress();
  updateCorrectCount(0, data.questions.length);

  document.getElementById("backBtn").onclick = () => {
    document.getElementById("quizArea").classList.add("hidden");
    document.getElementById("landing").classList.remove("hidden");
    document.getElementById("result").innerHTML = "";
  };
}

// === Progress ===
function updateProgress() {
  const inputs = [...document.querySelectorAll("#questionsContainer input")];
  const filled = inputs.filter((i) => i.value.trim()).length;
  const total = inputs.length;
  const pct = total ? Math.round((filled / total) * 100) : 0;

  document.getElementById(
    "progressText"
  ).textContent = `Виконано ${filled} з ${total}`;

  const bar = document.getElementById("progressBar");
  bar.style.width = pct + "%";
  bar.textContent = pct + "%";
}

function updateCorrectCountFromInputs() {
  const inputs = [...document.querySelectorAll("#questionsContainer input")];
  const correct = inputs.filter((i) => i.classList.contains("is-valid")).length;
  updateCorrectCount(correct, inputs.length);
}

function updateCorrectCount(correct, total) {
  document.getElementById(
    "correctAnswersInfo"
  ).textContent = `Правильних: ${correct} з ${total}`;
}

// === Answer check ===
export function checkAnswer(
  expected,
  actual,
  options = { allowNormalization: true }
) {
  const removeDiacritics = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (options.allowNormalization) {
    expected = removeDiacritics(expected.trim().toLowerCase());
    actual = removeDiacritics(actual.trim().toLowerCase());
  }

  return expected === actual;
}

// INIT
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const sectionsData = await loadJSON("./data/sections.json");
    setCourseTitle(sectionsData.courseTitle || COURSE_TITLE);

    const sel = document.getElementById("sectionSelector");
    const grid = document.getElementById("sectionsGrid");

    sectionsData.sections.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.file;
      opt.textContent = s.title;
      sel.appendChild(opt);

      grid.appendChild(renderSectionCard(s));
    });

    sel.onchange = (e) => {
      if (e.target.value) loadJSON(e.target.value).then(showQuiz);
    };

    grid.onclick = (e) => {
      const btn = e.target.closest(".select-btn");
      if (btn) loadJSON(btn.dataset.file).then(showQuiz);
    };

    document.getElementById("appVersion").textContent = "v" + APP_VERSION;
  } catch (err) {
    alert("Помилка під час завантаження списку розділів: " + err.message);
  }
});
