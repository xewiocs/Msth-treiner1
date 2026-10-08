// Переменные состояния
let currentExample = {};
let userAnswer = "";
let currentStudent = {
  className: "",
  firstName: "",
  lastName: "",
  fullName: "",
};
let stats = {
  correct: 0,
  wrong: 0,
  total: 0,
};

let operations = {
  addition: true,
  subtraction: true,
  multiplication: true,
  division: true,
};

let currentMode = "normal";

function getCurrentDate() {
  return new Date().toLocaleDateString("ru-RU");
}

function getStoredResults() {
  try {
    const fromLocal = localStorage.getItem("mathResults");
    if (fromLocal) return JSON.parse(fromLocal) || {};

    const fromSession = sessionStorage.getItem("mathResults");
    if (fromSession) return JSON.parse(fromSession) || {};

    return {};
  } catch (e) {
    console.warn("Не удалось прочитать результаты из localStorage:", e);
    return {};
  }
}

function saveStoredResults(allResults) {
  try {
    localStorage.setItem("mathResults", JSON.stringify(allResults));
    try {
      sessionStorage.setItem("mathResults", JSON.stringify(allResults));
    } catch (e) {}
  } catch (e) {
    console.warn("Не удалось сохранить результаты в localStorage:", e);
  }
}

function parseSortableDate(value) {
  if (!value) return 0;
  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    const parsed = Date.parse(trimmed.replace(/\./g, "/"));
    if (!Number.isNaN(parsed)) {
      return parsed;
    }

    const [day, month, year] = trimmed.split(/[./-]/).map(Number);
    if (day && month && year) {
      return new Date(year, month - 1, day).getTime();
    }
  }
  return 0;
}

// Получение элементов DOM
const num1Element = document.getElementById("num1");
const num2Element = document.getElementById("num2");
const operatorElement = document.getElementById("operator");
const answerInput = document.getElementById("answer-input");
const answerText = document.getElementById("answer-text");
const feedback = document.getElementById("feedback");
const submitBtn = document.getElementById("submit-btn");
const nextBtn = document.getElementById("next-btn");
const deleteBtn = document.getElementById("delete-btn");
const virtualKeyboard = document.getElementById("virtual-keyboard");

// Счетчики
const correctCount = document.getElementById("correct-count");
const wrongCount = document.getElementById("wrong-count");
const totalCount = document.getElementById("total-count");
const percentageCount = document.getElementById("percentage-count");

// Модальные окна
const welcomeModal = document.getElementById("welcome-modal");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const nameModal = document.getElementById("name-modal");
const leaderboardModal = document.getElementById("leaderboard-modal");
const mistakesModal = document.getElementById("mistakes-modal");
const studentFirstName = document.getElementById("student-firstname");
const studentLastName = document.getElementById("student-lastname");
const authActionBtn = document.getElementById("auth-action-btn");
const authBackBtn = document.getElementById("auth-back-btn");
const authTitle = document.getElementById("auth-title");
const authError = document.getElementById("auth-error");
const currentStudentName = document.getElementById("current-student-name");
const changeNameBtn = document.getElementById("change-name-btn");
const profileLink = document.getElementById("profile-link");
const clearProgressBtn = document.getElementById("clear-progress-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const closeLeaderboardBtn = document.getElementById("close-leaderboard");
const closeMistakesBtn = document.getElementById("close-mistakes");
const mistakesContainer = document.getElementById("mistakes-container");
const mistakesTitle = document.getElementById("mistakes-title");

// Таблица лидеров
const leaderboardTable = document.getElementById("leaderboard-table");
const leaderboardBody = document.getElementById("leaderboard-body");

// Вкладки и панели
const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const panels = {
  home: document.getElementById("panel-home"),
  lessons: document.getElementById("panel-lessons"),
  integers: document.getElementById("panel-integers"),
  fractions: document.getElementById("panel-fractions"),
  equations: document.getElementById("panel-equations"),
  percents: document.getElementById("panel-percents"),
  geometry: document.getElementById("panel-geometry"),
};
const lessonsList = document.getElementById("video-lessons-list");
const topicContainers = {
  fractions: document.getElementById("topic-fractions"),
  equations: document.getElementById("topic-equations"),
  percents: document.getElementById("topic-percents"),
  geometry: document.getElementById("topic-geometry"),
};
const inlineLeaderboardList = document.getElementById(
  "inline-leaderboard-list",
);
const leaderboardInlineBtn = document.getElementById("leaderboard-inline-btn");
const heroLeaderboardBtn = document.getElementById("hero-leaderboard-btn");
const practiceModal = document.getElementById("practice-modal");
const closePracticeBtn = document.getElementById("close-practice");
const practiceTitle = document.getElementById("practice-title");
const practiceSubtitle = document.getElementById("practice-subtitle");
const practiceQuestion = document.getElementById("practice-question");
const practiceHint = document.getElementById("practice-hint");
const practiceExample = document.getElementById("practice-example");
const practiceNum1 = document.getElementById("practice-num1");
const practiceNum2 = document.getElementById("practice-num2");
const practiceOperator = document.getElementById("practice-operator");
const geometryFigure = document.getElementById("geometry-figure");
const geometryOptions = document.getElementById("geometry-options");
const practiceAnswerInput = document.getElementById("practice-answer-input");
const practiceAnswerText = document.getElementById("practice-answer-text");
const practiceFeedback = document.getElementById("practice-feedback");
const practiceSubmitBtn = document.getElementById("practice-submit-btn");
const practiceNextBtn = document.getElementById("practice-next-btn");
const practiceDeleteBtn = document.getElementById("practice-delete-btn");
const topicStartButtons = Array.from(
  document.querySelectorAll(".topic-start-btn"),
);
let activeTab = "home";
let activePracticeTopic = null;
let practiceState = {
  currentExample: null,
  userAnswer: "",
  stats: { correct: 0, wrong: 0, total: 0 },
};

// Firebase (optional). Синхронизация включается только при явной активации.
let db = null;
(function initFirebase() {
  const enableFirebase = true; // Включаем Firebase для синхронизации с учителем

  if (!enableFirebase || !window.firebase) {
    db = null;
    return;
  }

  try {
    const firebaseConfig = {
      apiKey: "AIzaSyDdoa8hTe4hUnXZYDbg_OTpv-yzvKW01uA",
      authDomain: "sixclassproject.firebaseapp.com",
      projectId: "sixclassproject",
      storageBucket: "sixclassproject.appspot.com",
      messagingSenderId: "1025060862423",
      appId: "1:1025060862423:web:b65e0b4f8e361ae1e07392",
      measurementId: "G-GY41TSJE2G",
    };
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  } catch (e) {
    console.warn("Firebase init failed:", e);
    db = null;
  }
})();

// Чекбоксы операций
const additionCheck = document.getElementById("addition");
const subtractionCheck = document.getElementById("subtraction");
const multiplicationCheck = document.getElementById("multiplication");
const divisionCheck = document.getElementById("division");

// Панели настройки
const normalSettings = document.getElementById("normal-settings");

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderLessons();
  renderTopicCards();
  switchTab("home");

  // Проверяем, нужно ли показать окно смены аккаунта
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("changeAccount") === "true") {
    showWelcomeModal();
    // Очищаем параметр из URL
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    restoreLastStudent();
    if (!currentStudent.fullName) {
      showWelcomeModal();
    } else {
      hideWelcomeModal();
      hideNameModal();
    }
  }

  loadLeaderboard();
  renderInlineLeaderboard();
});

function restoreLastStudent() {
  const lastStudent = localStorage.getItem("mathLastStudent");
  if (!lastStudent) return;

  currentStudent.fullName = lastStudent;
  const parts = lastStudent.split(" ");
  currentStudent.lastName = parts[0] || "";
  currentStudent.firstName = parts.slice(1).join(" ") || "";
  if (currentStudentName) {
    currentStudentName.textContent = currentStudent.fullName;
  }
  loadStudentStats(currentStudent.fullName);
  updateProfileLink();
}

function updateProfileLink() {
  if (!profileLink || !currentStudent.fullName) return;
  profileLink.href = `profile.html?student=${encodeURIComponent(currentStudent.fullName)}`;
}

function syncProfileSessionData() {
  if (!currentStudent.fullName) return;
  try {
    sessionStorage.setItem("mathLastStudent", currentStudent.fullName);
    sessionStorage.setItem(
      "mathResults",
      localStorage.getItem("mathResults") || "{}",
    );
  } catch (e) {
    console.warn("Не удалось сохранить данные для профиля:", e);
  }
}

function showWelcomeModal() {
  welcomeModal.classList.remove("hidden");
  setTimeout(() => {
    if (loginBtn) {
      loginBtn.focus();
    }
  }, 50);
}

function hideWelcomeModal() {
  welcomeModal.classList.add("hidden");
}

// Показать модальное окно для ввода данных
function showNameModal() {
  nameModal.classList.remove("hidden");
  authError.classList.add("hidden");
  authError.textContent = "";
  setTimeout(() => {
    if (studentLastName) {
      studentLastName.focus();
    }
  }, 50);
}

function setAuthMode(mode) {
  authMode = mode;
  if (mode === "login") {
    authTitle.textContent = "🔐 Войти в аккаунт";
    authActionBtn.textContent = "Войти";
  } else {
    authTitle.textContent = "🆕 Зарегистрироваться";
    authActionBtn.textContent = "Зарегистрироваться";
  }
  authError.classList.add("hidden");
  authError.textContent = "";
  showNameModal();
}

function handleAuthAction() {
  const firstName = studentFirstName.value.trim();
  const lastName = studentLastName.value.trim();
  const fullName = `${lastName} ${firstName}`.trim();
  const allResults = getStoredResults();

  if (!firstName || !lastName) {
    authError.textContent = "Введите фамилию и имя.";
    authError.classList.remove("hidden");
    return;
  }

  const exists = Boolean(allResults[fullName]);

  if (authMode === "register") {
    if (exists) {
      authError.textContent =
        "Вы уже зарегистрированы. Нажмите Войти и введите свои данные.";
      authError.classList.remove("hidden");
      return;
    }

    allResults[fullName] = {
      correct: 0,
      wrong: 0,
      total: 0,
      mistakes: [],
      date: getCurrentDate(),
    };
    saveStoredResults(allResults);
  } else {
    if (!exists) {
      authError.textContent =
        "Пользователь не найден. Зарегистрируйтесь или проверьте имя.";
      authError.classList.remove("hidden");
      return;
    }
  }

  currentStudent.firstName = firstName;
  currentStudent.lastName = lastName;
  currentStudent.fullName = fullName;
  if (currentStudentName) {
    currentStudentName.textContent = currentStudent.fullName;
  }
  localStorage.setItem("mathLastStudent", currentStudent.fullName);
  loadStudentStats(currentStudent.fullName);
  updateProfileLink();
  hideNameModal();
  hideWelcomeModal();
  generateNewExample();
}

// Скрыть модальное окно для ввода имени
function hideNameModal() {
  nameModal.classList.add("hidden");
  setTimeout(() => {
    if (answerInput) {
      answerInput.click();
      answerInput.focus();
    }
  }, 100);
}

function switchTab(tabName) {
  activeTab = tabName;

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle("active", isActive);
  });

  Object.entries(panels).forEach(([key, panel]) => {
    if (panel) {
      panel.classList.toggle("hidden", key !== tabName);
    }
  });

  if (leaderboardBtn) {
    leaderboardBtn.classList.toggle("hidden", tabName !== "integers");
  }

  if (tabName === "integers") {
    generateNewExample();
  }
}

function hidePracticeModal() {
  practiceModal?.classList.add("hidden");
  activePracticeTopic = null;
}

function openPracticeModal(topic) {
  activePracticeTopic = topic;
  practiceModal?.classList.remove("hidden");
  practiceFeedback.textContent = "";
  practiceFeedback.className = "feedback";
  practiceSubmitBtn.style.display = "block";
  practiceNextBtn.classList.remove("show");
  practiceAnswerInput.classList.remove("active");

  const topicNames = {
    integers: {
      title: "🔢 Целые числа",
      subtitle: "Решай примеры и тренируйся быстро.",
    },
    fractions: {
      title: "🧩 Дроби",
      subtitle: "Сложение, вычитание, умножение и деление дробей.",
    },
    equations: {
      title: "🧮 Уравнения",
      subtitle: "Находи неизвестное и проверяй ответ.",
    },
    percents: {
      title: "📊 Проценты",
      subtitle: "Решай задачи на проценты и доли.",
    },
    geometry: {
      title: "📐 Геометрия",
      subtitle: "Повторяй площадь, периметр и фигуры.",
    },
  };

  const topicInfo = topicNames[topic] || topicNames.integers;
  practiceTitle.textContent = topicInfo.title;
  practiceSubtitle.textContent = topicInfo.subtitle;
  practiceQuestion.textContent =
    "Сначала прочитай теорию, а потом реши несколько задач.";
  generatePracticeExample();
}

function isNegativeValue(value) {
  if (typeof value === "number") return value < 0;
  return String(value).trim().startsWith("-");
}

function formatIntegerOperand(value, isSecondOperand) {
  const str = String(value);
  if (isSecondOperand && isNegativeValue(value)) {
    return `(${str})`;
  }
  return str;
}

function updatePracticeAnswerDisplay() {
  practiceAnswerText.textContent = practiceState.userAnswer || "...";
}

function setPracticeInputMode(mode) {
  const isGeometry = mode === "geometry";

  practiceModal?.classList.toggle("geometry-mode", isGeometry);
  geometryFigure?.classList.toggle("hidden", !isGeometry);
  geometryOptions?.classList.toggle("hidden", !isGeometry);
  practiceAnswerInput?.parentElement?.classList.toggle("hidden", isGeometry);
  document.querySelector(".keyboard-section")?.classList.toggle("hidden", isGeometry);
  practiceDeleteBtn?.classList.toggle("hidden", isGeometry);
}

function renderPracticeExpression(left, operator, right) {
  if (practiceExample) {
    practiceExample.classList.remove("word-problem");
    practiceExample.classList.remove("hidden");
  }
  geometryFigure.innerHTML = "";
  geometryOptions.innerHTML = "";
  practiceNum1.innerHTML = left;
  practiceOperator.textContent = operator;
  practiceNum2.innerHTML = right;
}

function renderPracticeWordProblem(text) {
  if (practiceExample) {
    practiceExample.classList.add("word-problem");
    practiceExample.classList.remove("hidden");
  }
  geometryFigure.innerHTML = "";
  geometryOptions.innerHTML = "";
  practiceNum1.innerHTML = text;
  practiceOperator.textContent = "";
  practiceNum2.innerHTML = "";
}

function renderGeometryTask(task) {
  if (practiceExample) {
    practiceExample.classList.add("hidden");
  }
  practiceNum1.innerHTML = "";
  practiceOperator.textContent = "";
  practiceNum2.innerHTML = "";
  const equalsElement = document.querySelector("#practice-example .equals");
  if (equalsElement) {
    equalsElement.textContent = "";
  }
  if (geometryFigure) {
    geometryFigure.innerHTML = task.figure;
  }
  if (geometryOptions) {
    geometryOptions.innerHTML = task.options
      .map(
        (option, index) => `
          <button class="geometry-option" type="button" data-value="${option.value}">
            ${String.fromCharCode(1040 + index)}. ${option.label}
          </button>
        `,
      )
      .join("");

    geometryOptions.querySelectorAll(".geometry-option").forEach((button) => {
      button.addEventListener("click", () => {
        practiceState.userAnswer = button.dataset.value || "";
        geometryOptions.querySelectorAll(".geometry-option").forEach((item) => {
          item.classList.remove("selected");
        });
        button.classList.add("selected");
      });
    });
  }
}

function getGeometryTasks() {
  return [
    {
      question: "Какая прямая является высотой треугольника ABC?",
      figure: `
        <svg viewBox="0 0 320 220" class="geometry-svg" aria-label="Высота треугольника">
          <polygon points="70,175 250,175 130,45" fill="rgba(42,82,152,0.08)" stroke="#1e3c72" stroke-width="5" />
          <line x1="130" y1="45" x2="130" y2="175" stroke="#e67e22" stroke-width="5" stroke-dasharray="8 6" />
          <rect x="130" y="154" width="22" height="21" fill="rgba(42,82,152,0.12)" stroke="#2a5298" stroke-width="3" />
          <text x="58" y="194" class="geometry-label">A</text>
          <text x="255" y="194" class="geometry-label">B</text>
          <text x="122" y="34" class="geometry-label">C</text>
          <text x="136" y="194" class="geometry-label">H</text>
        </svg>
      `,
      options: [
        { label: "CH", value: "altitude" },
        { label: "AB", value: "side_ab" },
        { label: "AC", value: "side_ac" },
      ],
      result: "altitude",
      answerLabel: "CH — высота (перпендикуляр к AB)",
      explanation:
        "Высота — это отрезок (прямая), который проведён под прямым углом к стороне треугольника. На рисунке CH образует прямой угол с AB.",
      answerType: "geometry-choice",
    },
    {
      question: "Какое утверждение можно доказать по отметкам на рисунке?",
      figure: `
        <svg viewBox="0 0 320 220" class="geometry-svg" aria-label="Равнобедренный треугольник">
          <polygon points="160,30 65,180 255,180" fill="rgba(42,82,152,0.08)" stroke="#1e3c72" stroke-width="5" />
          <line x1="110" y1="104" x2="125" y2="114" stroke="#2a5298" stroke-width="4" />
          <line x1="195" y1="114" x2="210" y2="104" stroke="#2a5298" stroke-width="4" />
          <line x1="102" y1="118" x2="117" y2="128" stroke="#2a5298" stroke-width="4" />
          <line x1="203" y1="128" x2="218" y2="118" stroke="#2a5298" stroke-width="4" />
          <text x="152" y="22" class="geometry-label">A</text>
          <text x="52" y="198" class="geometry-label">B</text>
          <text x="260" y="198" class="geometry-label">C</text>
        </svg>
      `,
      options: [
        { label: "AB = AC, значит треугольник равнобедренный", value: "isosceles" },
        { label: "У треугольника все стороны разные", value: "scalene" },
        { label: "Треугольник обязательно прямоугольный", value: "right" },
      ],
      result: "isosceles",
      answerLabel: "AB = AC, значит треугольник равнобедренный",
      explanation:
        "Если у треугольника две стороны равны (AB = AC), то он называется равнобедренным. Это доказывается прямо по отметкам на рисунке.",
      answerType: "geometry-choice",
    },
    {
      question: "Какие прямые изображены на рисунке?",
      figure: `
        <svg viewBox="0 0 320 220" class="geometry-svg" aria-label="Параллельные прямые">
          <line x1="45" y1="75" x2="275" y2="75" stroke="#1e3c72" stroke-width="6" />
          <line x1="45" y1="150" x2="275" y2="150" stroke="#1e3c72" stroke-width="6" />
          <line x1="90" y1="35" x2="220" y2="190" stroke="#e67e22" stroke-width="5" />
          <text x="285" y="82" class="geometry-label">a</text>
          <text x="285" y="157" class="geometry-label">b</text>
          <text x="226" y="196" class="geometry-label">c</text>
        </svg>
      `,
      options: [
        { label: "a и b параллельны", value: "parallel" },
        { label: "a и b пересекаются", value: "intersect" },
        { label: "Все три прямые параллельны", value: "all_parallel" },
      ],
      result: "parallel",
      answerLabel: "a и b параллельны",
      explanation:
        "Параллельные прямые идут рядом и не пересекаются. На рисунке прямые a и b имеют одинаковое направление.",
      answerType: "geometry-choice",
    },
    {
      question: "Какая точка принадлежит окружности?",
      figure: `
        <svg viewBox="0 0 320 220" class="geometry-svg" aria-label="Окружность с точками">
          <circle cx="160" cy="110" r="70" fill="rgba(42,82,152,0.06)" stroke="#1e3c72" stroke-width="5" />
          <circle cx="160" cy="110" r="5" fill="#2a5298" />
          <circle cx="230" cy="110" r="5" fill="#e67e22" />
          <circle cx="160" cy="60" r="5" fill="#2ecc71" />
          <circle cx="95" cy="110" r="5" fill="#9b59b6" />
          <text x="148" y="102" class="geometry-label">O</text>
          <text x="238" y="116" class="geometry-label">A</text>
          <text x="148" y="52" class="geometry-label">B</text>
          <text x="78" y="116" class="geometry-label">C</text>
        </svg>
      `,
      options: [
        { label: "Точка B принадлежит окружности", value: "point_b" },
        { label: "Точка O принадлежит окружности", value: "point_o" },
        { label: "Точка A лежит вне окружности", value: "point_a_outside" },
      ],
      result: "point_b",
      answerLabel: "Точка B принадлежит окружности",
      explanation:
        "Точка принадлежит окружности, если она лежит на линии окружности. Точка B нарисована именно на самой линии.",
      answerType: "geometry-choice",
    },
    {
      question: "Как называется отрезок CD на рисунке?",
      figure: `
        <svg viewBox="0 0 320 220" class="geometry-svg" aria-label="Медиана треугольника">
          <polygon points="160,35 70,180 250,180" fill="rgba(42,82,152,0.08)" stroke="#1e3c72" stroke-width="5" />
          <line x1="160" y1="35" x2="160" y2="180" stroke="#e67e22" stroke-width="5" />
          <line x1="110" y1="180" x2="110" y2="168" stroke="#2a5298" stroke-width="4" />
          <line x1="210" y1="180" x2="210" y2="168" stroke="#2a5298" stroke-width="4" />
          <text x="152" y="25" class="geometry-label">C</text>
          <text x="55" y="196" class="geometry-label">A</text>
          <text x="255" y="196" class="geometry-label">B</text>
          <text x="152" y="196" class="geometry-label">D</text>
        </svg>
      `,
      options: [
        { label: "Медиана", value: "median" },
        { label: "Биссектриса", value: "bisector" },
        { label: "Диагональ", value: "diagonal" },
      ],
      result: "median",
      answerLabel: "Медиана",
      explanation:
        "Медиана проводится из вершины треугольника в середину противоположной стороны. На рисунке отрезок идёт из вершины к точке, которая является серединой основания.",
      answerType: "geometry-choice",
    },
  ];
}

function generatePracticeExample() {
  practiceFeedback.textContent = "";
  practiceFeedback.className = "feedback";
  practiceState.userAnswer = "";
  if (practiceHint) practiceHint.textContent = "";
  updatePracticeAnswerDisplay();
  practiceSubmitBtn.style.display = "block";
  practiceNextBtn.classList.remove("show");
  practiceAnswerInput.classList.remove("active");
  setPracticeInputMode(activePracticeTopic === "geometry" ? "geometry" : "default");

  if (activePracticeTopic === "integers") {
    const operation = ["+", "-", "×", "÷"][Math.floor(Math.random() * 4)];
    let num1, num2, result;
    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 21) - 10; // -10..10
        num2 = Math.floor(Math.random() * 10) + 1;  // 1..10
        result = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 21) - 10; // -10..10
        num2 = Math.floor(Math.random() * 10) + 1;  // 1..10
        result = num1 - num2;
        break;
      case "×":
        num1 = Math.floor(Math.random() * 9) + 1;   // 1..9
        num2 = Math.floor(Math.random() * 9) + 1;   // 1..9
        result = num1 * num2;
        break;
      case "÷":
        num2 = Math.floor(Math.random() * 9) + 1;   // 1..9
        const quotient = Math.floor(Math.random() * 9) + 1;
        num1 = num2 * quotient;
        result = num1 / num2;
        break;
    }
    practiceState.currentExample = { num1, num2, operator: operation, result };
    renderPracticeExpression(
      formatIntegerOperand(num1, false),
      operation,
      formatIntegerOperand(num2, true),
    );
    practiceQuestion.textContent = "Реши пример и проверь результат.";
    return;
  }

  if (activePracticeTopic === "fractions") {
    const fractionA = generateProperFraction();
    const fractionB = generateProperFraction();
    const operation = ["+", "-", "×", "÷"][Math.floor(Math.random() * 4)];
    let result;
    switch (operation) {
      case "+":
        result = addFractions(fractionA, fractionB);
        break;
      case "-":
        result = subtractFractions(fractionA, fractionB);
        break;
      case "×":
        result = multiplyFractions(fractionA, fractionB);
        break;
      case "÷":
        if (fractionB.numerator === 0) {
          fractionB.numerator = 1;
        }
        result = divideFractions(fractionA, fractionB);
        break;
    }
    practiceState.currentExample = {
      num1: formatFraction(fractionA),
      num2: formatFraction(fractionB),
      operator: operation,
      result: formatFraction(result),
      answerType: "fraction",
    };
    renderPracticeExpression(
      renderFractionDisplay(practiceState.currentExample.num1, operation, false),
      operation,
      renderFractionDisplay(practiceState.currentExample.num2, operation, true),
    );
    practiceQuestion.textContent = "Введи ответ в виде a/b или целого числа.";
    if (practiceHint) {
      practiceHint.textContent = "⚠️ Не забудь сократить дробь!";
    }
    return;
  }

  if (activePracticeTopic === "equations") {
    const x = Math.floor(Math.random() * 9) + 2;
    const n = Math.floor(Math.random() * 8) + 2;
    const operation = ["+", "-", "×"][Math.floor(Math.random() * 3)];
    let equationText = "";

    if (operation === "+") {
      equationText = `x + ${n} = ${x + n}`;
    } else if (operation === "-") {
      equationText = `x − ${n} = ${x - n}`;
    } else {
      equationText = `${n} × x = ${n * x}`;
    }

    practiceState.currentExample = {
      num1: equationText,
      num2: "",
      operator: "",
      result: x,
      answerType: "integer",
    };
    renderPracticeWordProblem(equationText);
    practiceQuestion.textContent = "Реши уравнение и найди x.";
    return;
  }

  if (activePracticeTopic === "percents") {
    const variants = [
      () => {
        const total = (Math.floor(Math.random() * 9) + 2) * 10;
        const percent = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
        return {
          text: `Найди ${percent}% от числа ${total}.`,
          result: Math.round((total * percent) / 100),
        };
      },
      () => {
        const total = (Math.floor(Math.random() * 7) + 4) * 10;
        const percent = [10, 20, 30, 40, 50][Math.floor(Math.random() * 5)];
        const result = Math.round((total * percent) / 100);
        return {
          text: `В классе ${total} учеников. ${percent}% из них любят математику. Сколько это учеников?`,
          result,
        };
      },
      () => {
        const price = (Math.floor(Math.random() * 8) + 2) * 10;
        const discount = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
        const result = Math.round((price * discount) / 100);
        return {
          text: `Скидка на тетрадь ${discount}%. Цена тетради ${price} рублей. Сколько рублей составляет скидка?`,
          result,
        };
      },
    ];
    const task = variants[Math.floor(Math.random() * variants.length)]();
    practiceState.currentExample = {
      num1: task.text,
      num2: "",
      operator: "",
      result: task.result,
      answerType: "integer",
    };
    renderPracticeWordProblem(task.text);
    practiceQuestion.textContent = "Прочитай задачу и запиши только ответ.";
    return;
  }

  if (activePracticeTopic === "geometry") {
    const tasks = getGeometryTasks();
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    practiceState.currentExample = {
      result: task.result,
      answerLabel: task.answerLabel,
      answerType: task.answerType,
    };
    renderGeometryTask(task);
    practiceQuestion.textContent = task.question;
    return;
  }

  practiceFeedback.textContent = "Тема пока не доступна.";
}

function normalizePracticeAnswer(answer, expected) {
  const trimmed = String(answer).trim();
  if (!trimmed) return false;
  if (expected.includes("/")) {
    const parts = expected.split("/");
    const expectedNum = Number(parts[0]);
    const expectedDen = Number(parts[1]);
    const userParts = trimmed.split("/");
    if (userParts.length === 2) {
      return (
        Number(userParts[0]) === expectedNum &&
        Number(userParts[1]) === expectedDen
      );
    }
  }
  if (Number.isNaN(Number(expected))) {
    return trimmed.toLowerCase() === String(expected).trim().toLowerCase();
  }
  return Number(trimmed) === Number(expected);
}

function checkPracticeAnswer() {
  if (!practiceState.currentExample) return;
  const expected = String(practiceState.currentExample.result);
  const isCorrect = normalizePracticeAnswer(practiceState.userAnswer, expected);
  const explanation = practiceState.currentExample.explanation;
  if (isCorrect) {
    practiceFeedback.innerHTML =
      "✅ Правильно! Молодец! 🌟" +
      (explanation
        ? `<div class="practice-explanation">${explanation}</div>`
        : "");
    practiceFeedback.className = "feedback correct";
    practiceState.stats.correct++;
    stats.correct++;
  } else {
    const correctAnswer =
      practiceState.currentExample.answerLabel || expected;
    practiceFeedback.innerHTML =
      `❌ Неправильно! Правильный ответ: <strong>${correctAnswer}</strong>` +
      (explanation
        ? `<div class="practice-explanation">${explanation}</div>`
        : "");
    practiceFeedback.className = "feedback wrong";
    practiceState.stats.wrong++;
    stats.wrong++;
  }
  practiceState.stats.total++;
  stats.total++;
  updateStats();
  saveStudentResults();
  renderInlineLeaderboard();
  practiceSubmitBtn.style.display = "none";
  practiceNextBtn.classList.add("show");
}

function renderLessons() {
  const lessons = [
    {
      title: "Сложение и вычитание целых чисел",
      description:
        "Повтори правила работы с положительными и отрицательными числами.",
      videoUrl:
        "https://www.youtube.com/results?search_query=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0+6+%D0%BA%D0%BB%D0%B0%D1%81+%D1%81%D0%B5%D0%BB%D1%8B%D0%B5+%D1%87%D0%B8%D1%81%D0%BB%D0%B0",
    },
    {
      title: "Умножение и деление целых чисел",
      description:
        "Разберись, как правильно работать со знаками при умножении и делении.",
      videoUrl:
        "https://www.youtube.com/results?search_query=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0+6+%D0%BA%D0%BB%D0%B0%D1%81+%D1%83%D0%BC%D0%BD%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5+%D0%B8+%D0%B4%D0%B5%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5",
    },
    {
      title: "Дроби и действия с ними",
      description: "Понять дроби проще — значит быстрее решать сложные задачи.",
      videoUrl:
        "https://www.youtube.com/results?search_query=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0+6+%D0%BA%D0%BB%D0%B0%D1%81+%D0%B4%D1%80%D0%BE%D0%B1%D0%B8",
    },
    {
      title: "Уравнения и поиск неизвестного",
      description: "Учимся разбирать уравнения шаг за шагом.",
      videoUrl:
        "https://www.youtube.com/results?search_query=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0+6+%D0%BA%D0%BB%D0%B0%D1%81+%D1%83%D1%80%D0%B0%D0%B2%D0%BD%D0%B5%D0%BD%D0%B8%D1%8F",
    },
    {
      title: "Проценты в жизни",
      description:
        "Отрабатывай проценты на реальных примерах из повседневности.",
      videoUrl:
        "https://www.youtube.com/results?search_query=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0+6+%D0%BA%D0%BB%D0%B0%D1%81+%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D0%BD%D1%82%D1%8B",
    },
    {
      title: "Площади и периметры",
      description: "Повтори, как быстро находить площадь и периметр фигур.",
      videoUrl:
        "https://www.youtube.com/results?search_query=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0+6+%D0%BA%D0%BB%D0%B0%D1%81+%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D0%B8+%D0%B8+%D0%BF%D0%B5%D1%80%D0%B8%D0%BC%D0%B5%D1%82%D1%80",
    },
  ];

  if (!lessonsList) return;

  lessonsList.innerHTML = lessons
    .map(
      (lesson) => `
        <article class="lesson-card">
          <h3>${lesson.title}</h3>
          <p>${lesson.description}</p>
          <a href="${lesson.videoUrl}" target="_blank" rel="noreferrer">▶ Смотреть видео</a>
        </article>
      `,
    )
    .join("");
}

function renderTopicCards() {
  const topics = [
    {
      key: "fractions",
      title: "Дроби",
      shortText: "Сложение, вычитание и сравнение дробей.",
      hint: "Подсказка: открой видео про дроби и повтори правила.",
      videoUrl:
        "https://www.youtube.com/results?search_query=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0+6+%D0%BA%D0%BB%D0%B0%D1%81+%D0%B4%D1%80%D0%BE%D0%B1%D0%B8",
      practice: "Пример: 1/2 + 1/4 = ?",
    },
    {
      key: "equations",
      title: "Уравнения",
      shortText: "Находи неизвестное, выполняя шаги по порядку.",
      hint: "Подсказка: посмотри видео по решению уравнений.",
      videoUrl:
        "https://www.youtube.com/results?search_query=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0+6+%D0%BA%D0%BB%D0%B0%D1%81+%D1%83%D1%80%D0%B0%D0%B2%D0%BD%D0%B5%D0%BD%D0%B8%D1%8F",
      practice: "Пример: 4x + 8 = 24",
    },
    {
      key: "percents",
      title: "Проценты",
      shortText: "Учись находить процент от числа и сравнивать части.",
      hint: "Подсказка: повтори видео про проценты с простыми примерами.",
      videoUrl:
        "https://www.youtube.com/results?search_query=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0+6+%D0%BA%D0%BB%D0%B0%D1%81+%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D0%BD%D1%82%D1%8B",
      practice: "Пример: 25% от 80",
    },
    {
      key: "geometry",
      title: "Геометрия",
      shortText: "Повторяй периметр, площадь и свойства фигур.",
      hint: "Подсказка: открой урок по площади и периметру.",
      videoUrl:
        "https://www.youtube.com/results?search_query=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0+6+%D0%BA%D0%BB%D0%B0%D1%81+%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D0%B8+%D0%B8+%D0%BF%D0%B5%D1%80%D0%B8%D0%BC%D0%B5%D1%82%D1%80",
      practice: "Пример: площадь прямоугольника 4 × 6",
    },
  ];

  Object.entries(topicContainers).forEach(([key, container]) => {
    if (!container) return;
    const topic = topics.find((item) => item.key === key);
    if (!topic) return;

    container.innerHTML = `
      <div class="topic-card-inner">
        <h3>${topic.title}</h3>
        <p>${topic.shortText}</p>
        <div class="topic-practice">${topic.practice}</div>
        <div class="topic-hint">${topic.hint}</div>
        <a href="${topic.videoUrl}" target="_blank" rel="noreferrer">🎥 Открыть подсказку</a>
      </div>
    `;
  });
}

function renderInlineLeaderboard() {
  const allResults = getStoredResults();
  const sortedResults = Object.entries(allResults)
    .map(([name, data]) => ({
      name,
      correct: data.correct || 0,
      wrong: data.wrong || 0,
      total: data.total || 0,
      percentage:
        data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }))
    .sort((a, b) => {
      if (b.correct !== a.correct) return b.correct - a.correct;
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return b.total - a.total;
    })
    .slice(0, 5);

  if (!inlineLeaderboardList) return;

  if (sortedResults.length === 0) {
    inlineLeaderboardList.innerHTML =
      '<p class="inline-empty">Пока нет данных. Реши несколько примеров, чтобы попасть в рейтинг.</p>';
    return;
  }

  inlineLeaderboardList.innerHTML = sortedResults
    .map(
      (student, index) => `
      <div class="inline-leaderboard-item">
        <span class="inline-rank">#${index + 1}</span>
        <span class="inline-name">${student.name}</span>
        <span class="inline-score">${student.correct}/${student.total}</span>
      </div>
    `,
    )
    .join("");
}

function loadStudentStats(fullName) {
  const allResults = getStoredResults();
  const studentData = allResults[fullName];

  if (!studentData) {
    stats.correct = 0;
    stats.wrong = 0;
    stats.total = 0;
    updateStats();
    return;
  }

  stats.correct = Number(studentData.correct) || 0;
  stats.wrong = Number(studentData.wrong) || 0;
  stats.total = Number(studentData.total) || 0;
  updateStats();
}

// Настройка обработчиков событий
function setupEventListeners() {
  profileLink?.addEventListener("click", syncProfileSessionData);

  loginBtn?.addEventListener("click", () => {
    hideWelcomeModal();
    setAuthMode("login");
  });

  registerBtn?.addEventListener("click", () => {
    hideWelcomeModal();
    setAuthMode("register");
  });

  authActionBtn?.addEventListener("click", handleAuthAction);
  authBackBtn?.addEventListener("click", () => {
    hideNameModal();
    showWelcomeModal();
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button.dataset.tab);
    });
  });

  leaderboardInlineBtn?.addEventListener("click", showLeaderboard);
  heroLeaderboardBtn?.addEventListener("click", () => {
    switchTab("integers");
    showLeaderboard();
  });

  topicStartButtons.forEach((button) => {
    button.addEventListener("click", () =>
      openPracticeModal(button.dataset.topic),
    );
  });

  closePracticeBtn?.addEventListener("click", hidePracticeModal);
  practiceModal?.addEventListener("click", (event) => {
    if (event.target === practiceModal) {
      hidePracticeModal();
    }
  });

  // Обработчик Enter в поле фамилии
  studentLastName?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      studentFirstName.focus();
    }
  });

  // Обработчик Enter в поле имени
  studentFirstName?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      authActionBtn?.click();
      e.preventDefault();
    }
  });

  // Кнопка изменить данные
  changeNameBtn?.addEventListener("click", () => {
    // studentClass.value = "";
    studentFirstName.value = "";
    studentLastName.value = "";
    setAuthMode("login");
  });

  clearProgressBtn?.addEventListener("click", () => {
    if (!currentStudent.fullName) {
      alert("Сначала введите имя и фамилию!");
      return;
    }

    const confirmed = confirm(
      `Очистить прогресс для ученика ${currentStudent.fullName}?`,
    );

    if (!confirmed) return;

    const allResults = getStoredResults();

    delete allResults[currentStudent.fullName];
    saveStoredResults(allResults);

    // Удаляем запись из Firestore, если настроен
    if (db) {
      try {
        const docId = encodeURIComponent(currentStudent.fullName);
        db.collection("mathResults")
          .doc(docId)
          .delete()
          .catch((e) => console.warn("Failed to delete Firestore doc:", e));
      } catch (e) {
        console.warn("Firestore delete error:", e);
      }
    }

    stats.correct = 0;
    stats.wrong = 0;
    stats.total = 0;
    updateStats();
    loadLeaderboard();

    alert("Прогресс очищен!");
  });

  // Кнопка таблица лидеров
  leaderboardBtn?.addEventListener("click", () => {
    switchTab("integers");
    showLeaderboard();
  });
  closeLeaderboardBtn?.addEventListener("click", hideLeaderboard);

  // Закрытие таблицы при клике вне её
  leaderboardModal?.addEventListener("click", (e) => {
    if (e.target === leaderboardModal) {
      hideLeaderboard();
    }
  });

  // Закрытие модального окна с ошибками
  closeMistakesBtn?.addEventListener("click", hideMistakes);
  mistakesModal?.addEventListener("click", (e) => {
    if (e.target === mistakesModal) {
      hideMistakes();
    }
  });

  // Виртуальная клавиатура
  const keyButtons = document.querySelectorAll(".key-button");
  keyButtons.forEach((button) => {
    if (button.closest("#practice-virtual-keyboard")) return;
    button.addEventListener("click", () => {
      const value = button.getAttribute("data-value");
      if (value !== null) {
        addToAnswer(value);
      }
    });
  });

  // Кнопка удалить
  deleteBtn?.addEventListener("click", deleteLastChar);

  // Кнопка ответить
  submitBtn?.addEventListener("click", checkAnswer);

  // Кнопка дальше
  nextBtn?.addEventListener("click", nextExample);
  practiceSubmitBtn?.addEventListener("click", () => checkPracticeAnswer());
  practiceNextBtn?.addEventListener("click", () => generatePracticeExample());
  practiceDeleteBtn?.addEventListener("click", () => {
    practiceState.userAnswer = practiceState.userAnswer.slice(0, -1);
    updatePracticeAnswerDisplay();
  });
  practiceAnswerInput?.addEventListener("click", () => {
    practiceAnswerInput.classList.add("active");
    practiceAnswerInput.focus();
  });
  document
    .querySelectorAll("#practice-virtual-keyboard .key-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.getAttribute("data-value");
        if (value !== null) {
          practiceState.userAnswer += value;
          updatePracticeAnswerDisplay();
        }
      });
    });
  // Режимы рациональных чисел удалены — оставляем только целые числа

  // Клик на поле ввода
  answerInput?.addEventListener("click", () => {
    answerInput.classList.add("active");
    answerInput.focus();
  });

  // Физическая клавиатура (для удобства)
  document.addEventListener("keydown", (e) => {
    // Если фокус на полях ввода данных - позволяем стандартное поведение браузера
    if (
      document.activeElement === studentFirstName ||
      document.activeElement === studentLastName
    ) {
      // Enter подтверждает действие на форме авторизации
      if (e.key === "Enter" && document.activeElement === studentLastName) {
        authActionBtn?.click();
        e.preventDefault();
      }
      return;
    }

    // Для поля ввода ответа
    if (e.key === "Backspace") {
      if (practiceModal && !practiceModal.classList.contains("hidden")) {
        practiceState.userAnswer = practiceState.userAnswer.slice(0, -1);
        updatePracticeAnswerDisplay();
      } else {
        deleteLastChar();
      }
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (practiceModal && !practiceModal.classList.contains("hidden")) {
        if (practiceNextBtn.classList.contains("show")) {
          generatePracticeExample();
        } else {
          checkPracticeAnswer();
        }
      } else {
        if (nextBtn.classList.contains("show")) {
          nextExample();
        } else {
          checkAnswer();
        }
      }
      e.preventDefault();
    } else if (/^[0-9\-\/]$/.test(e.key)) {
      if (practiceModal && !practiceModal.classList.contains("hidden")) {
        practiceState.userAnswer += e.key;
        updatePracticeAnswerDisplay();
      } else {
        addToAnswer(e.key);
      }
      e.preventDefault();
    }
  });

  // Обновление операций
  additionCheck?.addEventListener("change", updateOperations);
  subtractionCheck?.addEventListener("change", updateOperations);
  multiplicationCheck?.addEventListener("change", updateOperations);
  divisionCheck?.addEventListener("change", updateOperations);
}

function switchMode(mode) {
  if (currentMode === mode) return;
  currentMode = mode;
  normalSettings?.classList.toggle("hidden", mode !== "normal");
  if (mode === "normal" && activeTab === "integers") {
    generateNewExample();
  }
}

function updateRationalOperations() {
  rationalOperations.addition = rationalAdditionCheck.checked;
  rationalOperations.subtraction = rationalSubtractionCheck.checked;
  rationalOperations.multiplication = rationalMultiplicationCheck.checked;
  rationalOperations.division = rationalDivisionCheck.checked;

  const hasAny = Object.values(rationalOperations).some((v) => v);
  if (!hasAny) {
    rationalAdditionCheck.checked = true;
    rationalOperations.addition = true;
  }

  if (currentMode === "rational") {
    generateNewExample();
  }
}

function updateRationalTypes() {
  rationalTypes.decimal = decimalCheckbox.checked;
  rationalTypes.fraction = fractionCheckbox.checked;

  if (!rationalTypes.decimal && !rationalTypes.fraction) {
    decimalCheckbox.checked = true;
    rationalTypes.decimal = true;
  }

  if (currentMode === "rational") {
    generateNewExample();
  }
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function normalizeFraction(frac) {
  let numerator = frac.numerator;
  let denominator = frac.denominator;

  if (denominator < 0) {
    numerator = -numerator;
    denominator = -denominator;
  }

  if (numerator === 0) {
    return { numerator: 0, denominator: 1 };
  }

  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function parseFraction(value) {
  const parts = value.split("/");
  if (parts.length === 1) {
    const num = parseInt(parts[0], 10);
    if (Number.isNaN(num)) return null;
    return normalizeFraction({ numerator: num, denominator: 1 });
  }

  if (parts.length !== 2) return null;

  const numerator = parseInt(parts[0], 10);
  const denominator = parseInt(parts[1], 10);
  if (Number.isNaN(numerator) || Number.isNaN(denominator) || denominator === 0)
    return null;

  return normalizeFraction({ numerator, denominator });
}

function fractionsEqual(a, b) {
  const fracA = normalizeFraction(a);
  const fracB = normalizeFraction(b);
  return (
    fracA.numerator === fracB.numerator &&
    fracA.denominator === fracB.denominator
  );
}

function addFractions(a, b) {
  return normalizeFraction({
    numerator: a.numerator * b.denominator + b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  });
}

function subtractFractions(a, b) {
  return normalizeFraction({
    numerator: a.numerator * b.denominator - b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  });
}

function multiplyFractions(a, b) {
  return normalizeFraction({
    numerator: a.numerator * b.numerator,
    denominator: a.denominator * b.denominator,
  });
}

function divideFractions(a, b) {
  return normalizeFraction({
    numerator: a.numerator * b.denominator,
    denominator: a.denominator * b.numerator,
  });
}

function formatFraction(frac) {
  if (frac.denominator === 1) return `${frac.numerator}`;
  return `${frac.numerator}/${frac.denominator}`;
}

function generateProperFraction() {
  let fraction;
  let attempts = 0;

  do {
    fraction = normalizeFraction({
      numerator: getRandomInt(1, 6),
      denominator: getRandomInt(2, 6),
    });
    attempts++;
  } while (
    (fraction.denominator === 1 || fraction.numerator === 0) &&
    attempts < 50
  );

  if (fraction.denominator === 1 || fraction.numerator === 0) {
    return { numerator: 1, denominator: 3 };
  }

  return fraction;
}

function normalizeDecimalString(value) {
  const stringValue = String(value);
  const negative = stringValue.startsWith("-");
  const rawValue = negative ? stringValue.slice(1) : stringValue;

  if (!rawValue.includes(".")) {
    return stringValue;
  }

  let normalized = rawValue;
  if (normalized.endsWith(".0")) {
    normalized = normalized.slice(0, -2);
  } else {
    normalized = normalized.replace(".", ",");
  }

  return negative ? `-${normalized}` : normalized;
}

function formatDecimal(value) {
  const formatted = value.toFixed(1);
  return normalizeDecimalString(formatted);
}

function getRandomDecimal(min, max) {
  const factor = 10;
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRationalExample() {
  let availableOps = Object.keys(rationalOperations).filter(
    (op) => rationalOperations[op],
  );
  if (availableOps.length === 0) {
    rationalOperations = {
      addition: true,
      subtraction: true,
      multiplication: true,
      division: true,
    };
    rationalAdditionCheck.checked = true;
    rationalSubtractionCheck.checked = true;
    rationalMultiplicationCheck.checked = true;
    rationalDivisionCheck.checked = true;
    availableOps = Object.keys(rationalOperations).filter(
      (op) => rationalOperations[op],
    );
  }

  const operation =
    availableOps[Math.floor(Math.random() * availableOps.length)] || "addition";
  const useDecimal =
    rationalTypes.decimal && rationalTypes.fraction
      ? Math.random() < 0.5
      : rationalTypes.decimal;

  if (useDecimal) {
    let num1;
    let num2;
    let result;
    let operator;

    switch (operation) {
      case "addition":
        // Простые десятичные дроби для сложения: второй операнд только положительный,
        // чтобы примеры оставались удобными для устного счёта.
        num1 = getRandomDecimal(-4.9, 4.9);
        num2 = getRandomDecimal(0, 4.9); // Только положительное
        operator = "+";
        result = num1 + num2;
        break;
      case "subtraction":
        // Простые десятичные дроби для вычитания: второй операнд только положительный.
        num1 = getRandomDecimal(-4.9, 4.9);
        num2 = getRandomDecimal(0, 4.9); // Только положительное
        operator = "-";
        result = num1 - num2;
        break;
      case "multiplication":
        // Умножение упрощено: маленькие значения для удобного умножения в уме.
        num1 = getRandomDecimal(-3.5, 3.5);
        num2 = getRandomDecimal(-3.5, 3.5);
        operator = "×";
        result = num1 * num2;
        break;
      case "division":
        // Деление упрощено: делитель небольшой, результат тоже небольшой.
        const divisor = getRandomDecimal(0.5, 2.5);
        const quotient = getRandomDecimal(-4.5, 4.5);
        num1 = Math.round(quotient * divisor * 10) / 10;
        num2 = divisor;
        // Случайно второй операнд может быть отрицательным для простых примеров.
        if (Math.random() < 0.2) {
          num2 = -num2;
        }
        operator = "÷";
        result = num1 / num2;
        break;
    }

    currentExample = {
      num1: formatDecimal(num1),
      num2: formatDecimal(num2),
      operator,
      result: Math.round(result * 10) / 10,
      answerType: "decimal",
    };
  } else {
    let fractionA = normalizeFraction({
      numerator: getRandomInt(-8, 8),
      denominator: getRandomInt(2, 6),
    });
    let fractionB = normalizeFraction({
      numerator: getRandomInt(1, 8),
      denominator: getRandomInt(2, 6),
    });
    let result;
    let operator;

    switch (operation) {
      case "addition":
        result = addFractions(fractionA, fractionB);
        operator = "+";
        break;
      case "subtraction":
        result = subtractFractions(fractionA, fractionB);
        operator = "-";
        break;
      case "multiplication":
        result = multiplyFractions(fractionA, fractionB);
        operator = "×";
        break;
      case "division":
        if (fractionB.numerator === 0) {
          fractionB.numerator = 1;
        }
        result = divideFractions(fractionA, fractionB);
        operator = "÷";
        break;
    }

    currentExample = {
      num1: formatFraction(fractionA),
      num2: formatFraction(fractionB),
      operator,
      result,
      answerType: "fraction",
    };
  }

  updateDisplay();
}

// Обновить таблицу лидеров на экране
function showLeaderboard() {
  loadLeaderboard();
  renderInlineLeaderboard();
  leaderboardModal.classList.remove("hidden");
}

function hideLeaderboard() {
  leaderboardModal.classList.add("hidden");
}

// Загрузить данные таблицы лидеров
function renderLeaderboardFrom(allResults) {
  // Сортируем по количеству правильных ответов, потом по проценту, потом по дате
  const sortedResults = Object.entries(allResults)
    .map(([name, data]) => ({
      name,
      correct: data.correct || 0,
      wrong: data.wrong || 0,
      total: data.total || 0,
      date:
        data.date ||
        (data.date && data.date.toDate
          ? data.date.toDate().toLocaleDateString("ru-RU")
          : new Date().toLocaleDateString("ru-RU")),
      percentage:
        data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }))
    .sort((a, b) => {
      if (b.correct !== a.correct) return b.correct - a.correct;
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return parseSortableDate(b.date) - parseSortableDate(a.date);
    });

  // Очистить таблицу
  leaderboardBody.innerHTML = "";

  if (sortedResults.length === 0) {
    leaderboardBody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">Нет данных. Решите примеры, чтобы попасть в таблицу!</td></tr>';
    return;
  }

  // Заполнить таблицу
  sortedResults.forEach((student, index) => {
    const row = document.createElement("tr");

    if (index === 0) row.classList.add("gold");
    else if (index === 1) row.classList.add("silver");
    else if (index === 2) row.classList.add("bronze");

    if (student.wrong > 0) {
      row.classList.add("clickable");
      row.addEventListener("click", () => showMistakes(student.name));
    }

    row.innerHTML = `
            <td class="rank">${index + 1}</td>
            <td class="name">${student.name}</td>
            <td class="correct">${student.correct}</td>
            <td class="wrong">${student.wrong}</td>
            <td class="total">${student.total}</td>
            <td class="percentage">${student.percentage}%</td>
        `;
    leaderboardBody.appendChild(row);
  });
}

function loadLeaderboard() {
  if (db) {
    db.collection("mathResults")
      .get()
      .then((snapshot) => {
        const allResults = {};
        snapshot.forEach((doc) => {
          const data = doc.data() || {};
          const name = decodeURIComponent(doc.id);
          allResults[name] = data;
        });
        renderLeaderboardFrom(allResults);
      })
      .catch((err) => {
        console.warn(
          "Failed to load from Firestore, falling back to localStorage",
          err,
        );
        const local = getStoredResults();
        renderLeaderboardFrom(local);
      });
    return;
  }

  const allResults = getStoredResults();
  renderLeaderboardFrom(allResults);
}

// Сохранить текущие результаты
function saveStudentResults() {
  if (!currentStudent.fullName) return;

  const allResults = getStoredResults();

  // Инициализируем результаты студента, если их еще нет
  if (!allResults[currentStudent.fullName]) {
    allResults[currentStudent.fullName] = {
      correct: 0,
      wrong: 0,
      total: 0,
      mistakes: [],
      date: new Date().toLocaleDateString("ru-RU"),
    };
  }

  const studentData = allResults[currentStudent.fullName] || {};
  allResults[currentStudent.fullName] = {
    correct: stats.correct,
    wrong: stats.wrong,
    total: stats.total,
    mistakes: studentData.mistakes || [],
    date: studentData.date || getCurrentDate(),
  };

  saveStoredResults(allResults);
  syncProfileSessionData();
  // Синхронизируем с Firestore, если инициализирован
  if (db && currentStudent.fullName) {
    try {
      const docId = encodeURIComponent(currentStudent.fullName);
      db.collection("mathResults")
        .doc(docId)
        .set(
          {
            correct: stats.correct,
            wrong: stats.wrong,
            total: stats.total,
            date: getCurrentDate(),
          },
          { merge: true },
        )
        .catch((e) => console.warn("Failed to save to Firestore:", e));
    } catch (e) {
      console.warn("Firestore save error:", e);
    }
  }
}

// Обновление выбранных операций
function updateOperations() {
  if (additionCheck) operations.addition = additionCheck.checked;
  if (subtractionCheck) operations.subtraction = subtractionCheck.checked;
  if (multiplicationCheck)
    operations.multiplication = multiplicationCheck.checked;
  if (divisionCheck) operations.division = divisionCheck.checked;

  const hasAny = Object.values(operations).some((v) => v);
  if (!hasAny && additionCheck) {
    additionCheck.checked = true;
    operations.addition = true;
  }

  generateNewExample();
}

// Генерирование нового примера
function generateNewExample() {
  if (feedback) {
    feedback.textContent = "";
    feedback.className = "feedback";
  }
  userAnswer = "";
  if (answerText) answerText.textContent = "";
  if (submitBtn) submitBtn.style.display = "block";
  if (nextBtn) nextBtn.classList.remove("show");
  if (answerInput) answerInput.classList.remove("active");

  if (!num1Element || !num2Element || !operatorElement) {
    return;
  }

  if (currentMode === "normal") {
    const availableOps = Object.keys(operations).filter((op) => operations[op]);
    const operation =
      availableOps[Math.floor(Math.random() * availableOps.length)];

    let num1, num2, operator, result;

    switch (operation) {
      case "addition":
        // Сложение: второй операнд всегда положительный (1..20)
        num1 = Math.floor(Math.random() * 41) - 20; // -20..20
        num2 = Math.floor(Math.random() * 20) + 1; // 1..20
        operator = "+";
        result = num1 + num2;
        break;

      case "subtraction":
        // Вычитание: второй операнд всегда положительный (1..20)
        num1 = Math.floor(Math.random() * 41) - 20; // -20..20
        num2 = Math.floor(Math.random() * 20) + 1; // 1..20
        operator = "-";
        result = num1 - num2;
        break;

      case "multiplication":
        // Умножение: оба операнда положительные (1..9), избегаем отрицательных
        num1 = Math.floor(Math.random() * 9) + 1; // 1..9
        num2 = Math.floor(Math.random() * 9) + 1; // 1..9
        operator = "×";
        result = num1 * num2;
        break;

      case "division":
        // Деление: оба операнда положительные, избегаем скобок
        const divisor = Math.floor(Math.random() * 10) + 1; // 1..10
        const quotient = Math.floor(Math.random() * 12) + 1; // 1..12
        num1 = divisor * quotient;
        num2 = divisor;
        operator = "÷";
        result = num1 / num2;
        break;
    }

    currentExample = {
      num1: num1,
      num2: num2,
      operator: operator,
      result: result,
      answerType: "integer",
    };
  } else {
    generateRationalExample();
    return;
  }

  updateDisplay();
}

// Помогает отобразить второй операнд
function formatSecondOperand(value, isSecondOperand) {
  const str = String(value);
  if (isSecondOperand && isNegativeValue(value)) {
    return `(${str})`;
  }
  return str;
}

function renderFractionDisplay(value, operator, isSecondOperand = false) {
  const textValue = String(value).trim();
  const negative = textValue.startsWith("-");
  const normalized = negative ? textValue.slice(1) : textValue;
  const parts = normalized.split("/");
  if (parts.length !== 2) {
    return formatSecondOperand(value, isSecondOperand);
  }

  const top = parts[0] === "" ? "0" : parts[0];
  const bottom = parts[1] === "" ? "1" : parts[1];

  const fractionHtml = `<span class="fraction-display"><span class="fraction-top">${top}</span><span class="fraction-line"></span><span class="fraction-bottom">${bottom}</span></span>`;

  const sign = negative ? "−" : "";

  if (negative && isSecondOperand) {
    return `<span class="fraction-parenthesis">(${sign}${fractionHtml})</span>`;
  }

  return `<span class="fraction-wrapper">${sign}${fractionHtml}</span>`;
}

function formatRationalSecondOperand(value, isSecondOperand) {
  const stringValue = String(value);
  const normalized = normalizeDecimalString(stringValue);
  const isNegative = stringValue.startsWith("-");

  if (isSecondOperand && isNegative) {
    return `(${normalized})`;
  }

  return normalized;
}

function formatDisplayValue(value, operator, isSecondOperand) {
  if (typeof value === "string" && value.includes("/")) {
    return renderFractionDisplay(value, operator, isSecondOperand);
  }

  if (
    currentMode === "rational" &&
    typeof value === "string" &&
    value.includes(".")
  ) {
    return formatRationalSecondOperand(value, isSecondOperand);
  }

  return formatSecondOperand(value, isSecondOperand);
}

// Обновление отображения примера
function updateDisplay() {
  if (!num1Element || !num2Element || !operatorElement) return;

  num1Element.innerHTML = formatDisplayValue(
    currentExample.num1,
    currentExample.operator,
    false,
  );
  num2Element.innerHTML = formatDisplayValue(
    currentExample.num2,
    currentExample.operator,
    true,
  );
  operatorElement.textContent = currentExample.operator;
}

// Добавление символа к ответу
function addToAnswer(char) {
  // Ограничиваем длину ответа
  if (userAnswer.length >= 10) return;

  if (char === "-") {
    if (userAnswer.length === 0) {
      userAnswer = "-";
    } else if (userAnswer === "-") {
      userAnswer = "";
    }
  } else {
    userAnswer += char;
  }

  updateAnswerDisplay();
}

// Удаление последнего символа
function deleteLastChar() {
  userAnswer = userAnswer.slice(0, -1);
  updateAnswerDisplay();
}

// Обновление отображения ответа
function updateAnswerDisplay() {
  answerText.textContent = userAnswer || "...";
}

// Проверка ответа
function checkAnswer() {
  if (!feedback || !answerText || !submitBtn || !nextBtn) return;

  if (userAnswer === "") {
    feedback.textContent = "❌ Введите ответ!";
    feedback.className = "feedback wrong";
    return;
  }
  let isCorrect = false;
  let correctAnswerText = currentExample.result;
  let userAnswerText = userAnswer;

  // Только целые числа поддерживаются
  const userInteger = parseInt(userAnswer, 10);
  if (!Number.isNaN(userInteger)) {
    isCorrect = userInteger === currentExample.result;
  } else {
    isCorrect = false;
  }

  if (isCorrect) {
    feedback.innerHTML = "✅ Правильно! Молодец! 🌟";
    feedback.className = "feedback correct";
    stats.correct++;
  } else {
    feedback.innerHTML = `❌ Неправильно! Правильный ответ: <strong>${correctAnswerText}</strong>`;
    feedback.className = "feedback wrong";
    stats.wrong++;

    saveMistake({
      num1: currentExample.num1,
      operator: currentExample.operator,
      num2: currentExample.num2,
      correctAnswer: correctAnswerText,
      userAnswer: userAnswerText,
    });
  }

  stats.total++;
  updateStats();
  saveStudentResults();
  renderInlineLeaderboard();
  submitBtn.style.display = "none";
  nextBtn.classList.add("show");
}

// Следующий пример
function nextExample() {
  userAnswer = "";
  generateNewExample();
}

// Обновление статистики
function updateStats() {
  if (correctCount) correctCount.textContent = stats.correct;
  if (wrongCount) wrongCount.textContent = stats.wrong;
  if (totalCount) totalCount.textContent = stats.total;

  if (stats.total > 0) {
    const percentage = Math.round((stats.correct / stats.total) * 100);
    if (percentageCount) percentageCount.textContent = percentage + "%";
  } else if (percentageCount) {
    percentageCount.textContent = "0%";
  }
}

// Сохранение неправильного примера
function saveMistake(mistake) {
  if (!currentStudent.fullName) return;

  const allResults = getStoredResults();

  if (!allResults[currentStudent.fullName]) {
    allResults[currentStudent.fullName] = {
      correct: 0,
      wrong: 0,
      total: 0,
      mistakes: [],
      date: new Date().toLocaleDateString("ru-RU"),
    };
  }

  if (!allResults[currentStudent.fullName].mistakes) {
    allResults[currentStudent.fullName].mistakes = [];
  }

  allResults[currentStudent.fullName].mistakes.push(mistake);
  saveStoredResults(allResults);
  // Синхронизируем ошибку с Firestore (если настроен)
  if (db) {
    try {
      const docId = encodeURIComponent(currentStudent.fullName);
      const docRef = db.collection("mathResults").doc(docId);
      const currentMistakes = allResults[currentStudent.fullName].mistakes || [];

      // Обновляем счётчики и массив ошибок одновременно
      docRef
        .set(
          {
            correct: stats.correct,
            wrong: stats.wrong,
            total: stats.total,
            mistakes: currentMistakes,
            date: getCurrentDate(),
          },
          { merge: true },
        )
        .catch((e) => console.warn("Failed to update Firestore:", e));
    } catch (e) {
      console.warn("Firestore mistake sync error:", e);
    }
  }
}

// Показать неправильные примеры для ученика
function showMistakes(studentName) {
  // Если настроен Firestore, пытаемся загрузить оттуда
  if (db) {
    const docId = encodeURIComponent(studentName);
    db.collection("mathResults")
      .doc(docId)
      .get()
      .then((doc) => {
        const data = doc.exists ? doc.data() : null;
        const mistakes = data && data.mistakes ? data.mistakes : [];
        renderMistakesList(mistakes, studentName);
      })
      .catch((e) => {
        console.warn("Failed to fetch mistakes from Firestore:", e);
        // fallback to localStorage
        const allResults = getStoredResults();
        const studentData = allResults[studentName];
        const mistakes =
          studentData && studentData.mistakes ? studentData.mistakes : [];
        renderMistakesList(mistakes, studentName);
      });
    return;
  }

  // fallback: localStorage
  const allResults = getStoredResults();
  const studentData = allResults[studentName];
  const mistakes =
    studentData && studentData.mistakes ? studentData.mistakes : [];
  renderMistakesList(mistakes, studentName);
}

function renderMistakesList(mistakes, studentName) {
  if (!mistakes || mistakes.length === 0) {
    mistakesContainer.innerHTML =
      '<p style="text-align: center; color: #999; padding: 20px;">Нет ошибок</p>';
  } else {
    mistakesContainer.innerHTML = "";

    mistakes.forEach((mistake, index) => {
      const mistakeCard = document.createElement("div");
      mistakeCard.className = "mistake-card";

      const num2Display = isNegativeValue(mistake.num2)
        ? `(${mistake.num2})`
        : mistake.num2;

      mistakeCard.innerHTML = `
        <div class="mistake-number">#${index + 1}</div>
        <div class="mistake-example">
          <span class="mistake-num">${mistake.num1}</span>
          <span class="mistake-op">${mistake.operator}</span>
          <span class="mistake-num">${num2Display}</span>
          <span class="mistake-equals">=</span>
          <span class="mistake-answer">?</span>
        </div>
        <div class="mistake-details">
          <div class="mistake-detail-row">
            <span>Правильный ответ: <strong>${mistake.correctAnswer}</strong></span>
          </div>
          <div class="mistake-detail-row">
            <span>Твой ответ: <strong style="color: #e74c3c;">${mistake.userAnswer}</strong></span>
          </div>
        </div>
      `;

      mistakesContainer.appendChild(mistakeCard);
    });
  }

  mistakesTitle.textContent = `❌ Неправильные примеры (${studentName})`;
  mistakesModal.classList.remove("hidden");
}

// Скрыть модальное окно с ошибками
function hideMistakes() {
  mistakesModal.classList.add("hidden");
}

// Фокус на поле ввода при загрузке
window.addEventListener("load", () => {
  studentLastName.focus();
});
