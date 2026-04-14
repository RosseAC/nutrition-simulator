// ═══════════════════════════════════════════════
//  NUTRITION SIMULATOR  ·  script.js
// ═══════════════════════════════════════════════

/* ─── Elements ──────────────────────────────────── */
const startScreen    = document.getElementById("startScreen");
const gameScreen     = document.getElementById("gameScreen");
const questionScreen = document.getElementById("questionScreen");

const bgMusic   = document.getElementById("bgMusic");
const dropSound = document.getElementById("dropSound");
const eatSound  = document.getElementById("eatSound");

const bodyImg    = document.getElementById("bodyImg");
const bodyLabel  = document.getElementById("bodyLabel");
const plateItems = document.getElementById("plateItems");
const plateHint  = document.getElementById("plateHint");
const eatBtn     = document.getElementById("eatBtn");

let draggedEmoji = "";
let draggedType  = "";
let currentQ     = 0;

/* ─── Background music ──────────────────────────── */
window.addEventListener("load", () => {
  bgMusic.volume = 0.4;
  bgMusic.play().catch(() => {
    const unlock = () => {
      bgMusic.play().catch(() => {});
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("click", unlock);
  });

  // Initialise bars to Normal state with a short delay so CSS transition is visible
  setTimeout(() => setBodyState("Normal", "assets/images/normal.png"), 300);
});

/* ─── Screen helpers ────────────────────────────── */
function showOnly(el) {
  [startScreen, gameScreen, questionScreen].forEach(s => {
    s.classList.remove("active");
  });
  el.classList.add("active");
}

function goHome() {
  showOnly(startScreen);
}

/* ─── Navigation ────────────────────────────────── */
document.getElementById("startBtn").onclick = () => {
  showOnly(gameScreen);
};

document.getElementById("questionBtn").onclick = () => {
  currentQ = 0;
  showOnly(questionScreen);
  loadQuestion();
};

/* ═══════════════════════════════════════════════
   GAME / DRAG & DROP
   ═══════════════════════════════════════════════ */

document.querySelectorAll(".food").forEach(food => {
  food.addEventListener("dragstart", e => {
    draggedEmoji = food.dataset.emoji || food.textContent.trim();
    draggedType  = food.dataset.type;
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", draggedEmoji);
  });
});

function onDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drag-over");
}

function onDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function dropFood(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");

  if (!draggedEmoji) return;

  // Hard cap: plate holds 5 items max
  if (plateItems.children.length >= 5) {
    draggedEmoji = "";
    draggedType  = "";
    return;
  }

  plateHint.style.display = "none";

  const span = document.createElement("span");
  span.textContent = draggedEmoji;
  span.dataset.type = draggedType;
  span.classList.add("pop");
  span.title = "Click to remove";
  span.style.cursor = "pointer";
  span.onclick = () => {
    span.remove();
    syncPlateState();
  };
  plateItems.appendChild(span);

  dropSound.currentTime = 0;
  dropSound.play().catch(() => {});

  eatBtn.classList.remove("hidden");

  draggedEmoji = "";
  draggedType  = "";
}

function syncPlateState() {
  if (plateItems.children.length === 0) {
    plateHint.style.display = "";
    eatBtn.classList.add("hidden");
  }
}

/* ─── Eat logic ─────────────────────────────────── */
function eatFood() {
  const items = plateItems.querySelectorAll("span");
  if (!items.length) return;

  eatSound.currentTime = 0;
  eatSound.play().catch(() => {});

  let good = 0, bad = 0;
  items.forEach(item => {
    item.dataset.type === "good" ? good++ : bad++;
  });

  const total = good + bad;

  if (total === 1) {
    setBodyState("Malnourished", "assets/images/malnourished.png");
  } else if (total >= 2 && total <= 4) {
    setBodyState("Normal", "assets/images/normal.png");
  } else if (total === 5) {
    if (bad > 0) {
      setBodyState("Obese", "assets/images/obese.png");
    } else {
      setBodyState("Fit", "assets/images/fit.png");
    }
  }

  plateItems.innerHTML = "";
  plateHint.style.display = "";
  eatBtn.classList.add("hidden");
}

// Bar configs per state
// bmi:  { pct, color }   — no percent shown, just fill + color
// risk: { pct, color }
const stateConfig = {
  Normal:      { bmi: { pct: 40, color: "#a3e635" }, risk: { pct: 50, color: "#facc15" }, bmiLabel: "Normal Range",  riskLabel: "Moderate" },
  Malnourished:{ bmi: { pct: 10, color: "#ef4444" }, risk: { pct: 82, color: "#ef4444" }, bmiLabel: "Very Low",      riskLabel: "High" },
  Fit:         { bmi: { pct: 70, color: "#22c55e" }, risk: { pct: 12, color: "#22c55e" }, bmiLabel: "Healthy",       riskLabel: "Low" },
  Obese:       { bmi: { pct: 92, color: "#ef4444" }, risk: { pct: 90, color: "#ef4444" }, bmiLabel: "Very High",     riskLabel: "High" },
};

function setBodyState(label, imgSrc) {
  bodyLabel.textContent = label;
  bodyImg.src = imgSrc;

  const cfg = stateConfig[label];
  if (!cfg) return;

  const bmiBar   = document.getElementById("bmiBar");
  const riskBar  = document.getElementById("riskBar");
  const bmiLbl   = document.getElementById("bmiLabel");
  const riskLbl  = document.getElementById("riskLabel");

  // Small delay so the transition is visible after the image swap
  setTimeout(() => {
    bmiBar.style.width      = cfg.bmi.pct  + "%";
    bmiBar.style.background = cfg.bmi.color;
    riskBar.style.width     = cfg.risk.pct + "%";
    riskBar.style.background= cfg.risk.color;
    bmiLbl.textContent      = cfg.bmiLabel;
    bmiLbl.style.color      = cfg.bmi.color;
    riskLbl.textContent     = cfg.riskLabel;
    riskLbl.style.color     = cfg.risk.color;
  }, 80);
}

/* ═══════════════════════════════════════════════
   QUESTIONS
   ═══════════════════════════════════════════════ */

const questions = [
  {
    q: "What happens to your body if you eat too much unhealthy food?",
    a: ["You can become obese", "You become taller", "You sleep more", "Nothing happens"],
    correct: 0
  },
  {
    q: "What nutritional disorder results from eating too little food?",
    a: ["Malnourishment", "Increased strength", "Energy boost", "Obesity"],
    correct: 0
  },
  {
    q: "Which of the following is the healthiest food choice?",
    a: ["Vegetables", "Soda", "Candy bar", "Fast food"],
    correct: 0
  },
  {
    q: "Which nutritional disorder is caused by excess calorie intake?",
    a: ["Obesity", "Scurvy", "Rickets", "Anemia"],
    correct: 0
  },
  {
    q: "How can eating right benefit us physically and mentally?",
    a: ["To be healthier", "To make us more responsible", "To give up health", "To talk better"],
    correct: 0
  }
];

function loadQuestion() {
  const q = questions[currentQ];
  const total = questions.length;

  document.getElementById("questionText").textContent = q.q;
  document.getElementById("qCounter").textContent = `Question ${currentQ + 1} of ${total}`;
  document.getElementById("progressFill").style.width = `${((currentQ + 1) / total) * 100}%`;

  document.getElementById("prevBtn").disabled = currentQ === 0;
  document.getElementById("nextBtn").disabled = currentQ === total - 1;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  let answered = false;

  // Track correct answer by its text so position doesn't matter after shuffle
  const correctText = q.a[q.correct];

  // Shuffle a copy (Fisher-Yates) so correct answer lands in a random slot each time
  const shuffled = [...q.a];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  shuffled.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    const isCorrect = choice === correctText;

    btn.onclick = () => {
      if (answered) return;
      answered = true;

      choicesDiv.querySelectorAll("button").forEach(b => (b.disabled = true));

      if (isCorrect) {
        btn.classList.add("correct");
        btn.textContent = "✔  " + choice;
      } else {
        btn.classList.add("wrong");
        btn.textContent = "✖  " + choice;
        // Reveal correct button regardless of its shuffled position
        choicesDiv.querySelectorAll("button").forEach(b => {
          if (b.textContent.trim() === correctText) {
            b.classList.add("correct");
            b.textContent = "✔  " + correctText;
          }
        });
      }
    };

    choicesDiv.appendChild(btn);
  });
}

function nextQ() {
  if (currentQ < questions.length - 1) {
    currentQ++;
    loadQuestion();
  }
}

function prevQ() {
  if (currentQ > 0) {
    currentQ--;
    loadQuestion();
  }
}