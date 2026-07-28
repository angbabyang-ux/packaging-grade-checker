/* 화장품 포장재 재질·구조 간이평가 - UI 로직 */

const TIPS = {
  glass: {
    body_color: "무색(투명) 유리로 설계하면 몸체 등급이 올라갑니다.",
    body_coating: "표면 도색·코팅을 없애면 몸체 등급이 올라갑니다.",
    label: "라벨을 없애거나 종이 라벨, 절취선이 있는 비접착식 라벨로 바꾸면 등급이 올라갑니다.",
    cap: "캡을 열 때 몸체와 완전히 분리되는 구조(뚜껑·테 일체형)로 설계하면 등급이 올라갑니다.",
  },
  pet_bottle: {
    body: "무색 PET 단일재질로 설계하면 몸체 등급이 올라갑니다.",
    label: "라벨을 없애거나, 열알칼리성 분리 접착제와 절취선을 적용하면 등급을 크게 높일 수 있습니다.",
    cap: "무색 PET 또는 비중 1미만의 가벼운 합성수지(PP 등)로 캡·펌프를 설계하면 등급이 올라갑니다.",
  },
  rigid_container: {
    body: "PET를 쓴다면 무색 단일재질로, 그 외에는 PE·PP 단일재질로 설계하면 등급이 올라갑니다.",
    label_cap: "라벨·캡을 없애거나, 몸체와 동일 계열 재질(PP+PE 등)로 통일하면 등급이 올라갑니다.",
  },
  composite: {
    body: "알루미늄을 쓴다면 두께 20㎛ 이하로 설계하고, 그 외 비합성수지 재질 병용은 피하세요.",
    label_cap: "라벨·캡을 없애거나 합성수지 재질로 통일하면 등급이 올라갑니다.",
  },
  metal_can: {
    body: "단일 금속재질(철 또는 알루미늄)로 설계하면 등급이 올라갑니다.",
    label: "라벨을 없애거나 직접 인쇄로 대체하면 등급이 올라갑니다.",
    cap: "몸체와 동일한 재질, 혹은 알루미늄 부속으로 설계하면 등급이 올라갑니다.",
  },
};

const state = {
  categoryId: null,
  answers: {},
};

/* ------------------------- 화면 전환 ------------------------- */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ------------------------- STEP 1: 카테고리 ------------------------- */
function renderCategoryGrid() {
  const grid = document.getElementById("category-grid");
  grid.innerHTML = "";
  Object.values(CATEGORIES).forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-card";
    const photos = (cat.photos || []).slice(0, 4);
    const mediaHtml = photos.length
      ? `<div class="cat-photo-grid count-${photos.length}">${photos
          .map((src) => `<img src="${src}" alt="${cat.name} 예시 제품" loading="lazy" />`)
          .join("")}</div>`
      : `<span class="cat-icon">${cat.icon}</span>`;
    btn.innerHTML = `
      ${mediaHtml}
      <h3>${cat.name}</h3>
      <p>${cat.desc}</p>
      <p><em>${cat.examples}</em></p>
    `;
    btn.addEventListener("click", () => selectCategory(cat.id));
    grid.appendChild(btn);
  });
}

function selectCategory(id) {
  state.categoryId = id;
  state.answers = {};
  renderQuestions();
  showScreen("screen-questions");
}

/* ------------------------- STEP 2: 질문 ------------------------- */
function renderQuestions() {
  const cat = CATEGORIES[state.categoryId];
  document.getElementById("questions-title").textContent = `2. ${cat.name} — 재질·구조를 알려주세요`;
  document.getElementById("questions-sub").textContent = cat.examples;

  const sgBox = document.getElementById("sg-glossary");
  if (cat.sgExamples) {
    sgBox.innerHTML = `
      <div class="sg-item sg-light"><span class="sg-icon">💧</span><div><strong>비중 1 미만 재질 (물에 뜸)</strong><p>${cat.sgExamples.light}</p></div></div>
      <div class="sg-item sg-heavy"><span class="sg-icon">🪨</span><div><strong>비중 1 이상 재질 (물에 가라앉음)</strong><p>${cat.sgExamples.heavy}</p></div></div>
    `;
    sgBox.classList.remove("hidden");
  } else {
    sgBox.classList.add("hidden");
    sgBox.innerHTML = "";
  }

  const form = document.getElementById("question-form");
  form.innerHTML = "";

  cat.parts.forEach((part) => {
    const group = document.createElement("div");
    group.className = "question-group";
    group.innerHTML = `
      <h3>${part.title}</h3>
      <p class="q-text">${part.question}</p>
      ${part.help ? `<p class="q-help">${part.help}</p>` : ""}
      ${part.companyNote ? `<div class="hint-box">💡 ${part.companyNote}</div>` : ""}
      <div class="option-list" data-part="${part.id}"></div>
    `;
    const list = group.querySelector(".option-list");
    part.options.forEach((opt) => {
      const label = document.createElement("label");
      label.className = "option-item";
      label.innerHTML = `
        <input type="radio" name="${part.id}" value="${opt.value}" />
        <span>${opt.name ? `<span class="opt-name">${opt.name}</span>` : ""}${opt.common ? '<span class="opt-badge">당사 대표 사례</span>' : ""}<span class="opt-detail">${opt.label}</span></span>
      `;
      label.addEventListener("click", () => {
        list.querySelectorAll(".option-item").forEach((el) => el.classList.remove("checked"));
        label.classList.add("checked");
        state.answers[part.id] = opt.value;
        updateEvaluateButton();
      });
      list.appendChild(label);
    });
    form.appendChild(group);
  });

  updateEvaluateButton();
}

function updateEvaluateButton() {
  const cat = CATEGORIES[state.categoryId];
  const allAnswered = cat.parts.every((part) => state.answers[part.id]);
  document.getElementById("btn-evaluate").disabled = !allAnswered;
}

/* ------------------------- STEP 3: 결과 ------------------------- */
function renderResult() {
  const cat = CATEGORIES[state.categoryId];
  const result = cat.evaluate(state.answers);
  const meta = GRADE_META[result.finalGrade];

  const badge = document.getElementById("result-grade-badge");
  badge.className = `result-grade ${meta.className}`;
  badge.innerHTML = `<span class="badge-symbol">${meta.badge}</span><span>${meta.short}</span>`;

  document.getElementById("result-headline").textContent = `${cat.name} · ${meta.label}`;
  document.getElementById("result-sub").textContent =
    result.finalGrade === GRADE.POOR
      ? "재활용이 어려운 재질·구조입니다. 등급 표시가 의무이며, 재질·구조 개선이 권장됩니다."
      : result.finalGrade === GRADE.ELITE
      ? "재활용이 매우 용이한 재질·구조입니다."
      : "재활용이 비교적 용이한 재질·구조입니다.";

  // 구성항목 테이블
  const table = document.getElementById("component-table");
  table.innerHTML = `
    <thead><tr><th>구성항목</th><th>판정 등급</th></tr></thead>
    <tbody>
      ${result.components
        .map((c) => {
          const m = GRADE_META[c.grade];
          return `<tr><td>${c.title}</td><td><span class="pill ${m.className}">${m.short}</span></td></tr>`;
        })
        .join("")}
    </tbody>
  `;

  // 주의사항 (사용금지 재질 등)
  const notesPanel = document.getElementById("notes-panel");
  const notesList = document.getElementById("notes-list");
  if (result.notes && result.notes.length) {
    notesList.innerHTML = result.notes.map((n) => `<li>${n}</li>`).join("");
    notesPanel.style.display = "";
  } else {
    notesPanel.style.display = "none";
  }

  // 개선 팁
  const tipsPanel = document.getElementById("tips-panel");
  const tipsList = document.getElementById("tips-list");
  const tipTexts = [];
  const catTips = TIPS[cat.id] || {};
  cat.parts.forEach((part) => {
    const comp = result.components.find((c) => c.title === part.title);
    if (comp && comp.grade < GRADE.GOOD && catTips[part.id]) {
      tipTexts.push(catTips[part.id]);
    }
  });
  if (result.finalGrade === GRADE.GOOD && ELITE_ALLOWED[cat.id]) {
    tipTexts.push("모든 항목이 '우수'입니다. 조건을 조금 더 다듬으면 '재활용 최우수' 등급도 가능합니다 — 상단 '판정 기준 안내'에서 최우수 조건을 확인해보세요.");
  }
  if (tipTexts.length) {
    tipsList.innerHTML = tipTexts.map((t) => `<li>${t}</li>`).join("");
    tipsPanel.style.display = "";
  } else {
    tipsPanel.style.display = "none";
  }

  // 용량 입력 초기화
  document.getElementById("capacity-value").value = "";
  document.getElementById("capacity-result").textContent = "";

  state.lastResult = result;
  showScreen("screen-result");
}

function checkCapacityExemption() {
  const val = parseFloat(document.getElementById("capacity-value").value);
  const el = document.getElementById("capacity-result");
  if (isNaN(val)) {
    el.textContent = "";
    return;
  }
  if (val <= 30) {
    el.textContent = "✅ 30ml/30g 이하 표시 면제 대상으로 보입니다. 등급 표시를 생략할 수 있습니다.";
    el.style.color = "var(--grade-good)";
  } else {
    el.textContent = "표시 면제 대상이 아닙니다. 「재활용 어려움」 등급이면 등급 표시가 의무입니다.";
    el.style.color = "var(--text-muted)";
  }
}

function buildCopyText() {
  const cat = CATEGORIES[state.categoryId];
  const result = state.lastResult;
  const meta = GRADE_META[result.finalGrade];
  const lines = [
    "[화장품 포장재 재질·구조 간이평가 결과]",
    `포장재 종류: ${cat.name}`,
    `종합 등급: ${meta.label}`,
    ...result.components.map((c) => `- ${c.title}: ${GRADE_META[c.grade].short}`),
    "※ 사내 간이평가 결과이며, 한국환경공단 공식 평가결과서를 대체하지 않습니다.",
  ];
  return lines.join("\n");
}

/* ------------------------- 이벤트 바인딩 ------------------------- */
document.getElementById("btn-back-to-category").addEventListener("click", () => showScreen("screen-category"));
document.getElementById("btn-back-to-questions").addEventListener("click", () => showScreen("screen-questions"));
document.getElementById("btn-evaluate").addEventListener("click", renderResult);
document.getElementById("btn-restart").addEventListener("click", () => {
  state.categoryId = null;
  state.answers = {};
  showScreen("screen-category");
});
document.getElementById("capacity-value").addEventListener("input", checkCapacityExemption);

document.getElementById("btn-copy").addEventListener("click", async () => {
  const text = buildCopyText();
  const btn = document.getElementById("btn-copy");
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = "복사되었습니다 ✓";
    setTimeout(() => (btn.textContent = original), 1600);
  } catch (e) {
    alert(text);
  }
});

const infoModal = document.getElementById("info-modal");
document.getElementById("btn-info").addEventListener("click", () => infoModal.classList.remove("hidden"));
document.getElementById("info-modal-close").addEventListener("click", () => infoModal.classList.add("hidden"));
document.getElementById("info-modal-backdrop").addEventListener("click", () => infoModal.classList.add("hidden"));

renderCategoryGrid();
