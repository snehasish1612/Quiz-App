// Final clean Quiz App script
const quizContainer = document.getElementById('quiz-container');

let questions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 20;

document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', () => document.body.classList.toggle('dark'));
  showStartScreen();
});

function showStartScreen() {
  quizContainer.innerHTML = `
    <div class="start-form fade-in">
      <h2 class="text-center mb-4">Welcome to the Quiz App</h2>
      <div class="mb-3">
        <label class="form-label">Category</label>
        <select id="category" class="form-select">
          <option value="9">General Knowledge</option>
          <option value="18">Computers</option>
          <option value="21">Sports</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Difficulty</label>
        <select id="difficulty" class="form-select">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Questions</label>
        <input type="number" id="amount" class="form-control" value="5" min="3" max="20">
      </div>
      <div class="d-grid gap-2">
        <button class="btn btn-info" onclick="startQuiz()">Start Quiz</button>
      </div>
    </div>
  `;
}

async function startQuiz() {
  const category = document.getElementById('category').value;
  const difficulty = document.getElementById('difficulty').value;
  const amount = document.getElementById('amount').value;
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    questions = data.results || [];
  } catch (e) {
    questions = [];
    console.error('Fetch error', e);
  }

  currentIndex = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  if (!questions.length) return showStartScreen();
  if (currentIndex >= questions.length) return showResult();

  const q = questions[currentIndex];
  const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

  quizContainer.innerHTML = `
    <div class="meta mb-2">
      <div><strong>Question ${currentIndex + 1}/${questions.length}</strong></div>
      <div class="timer" id="timer">⏱ ${timeLeft}s</div>
    </div>
    <h3 class="question-title">${decodeHTML(q.question)}</h3>
    <div id="answers" class="answers"></div>
    <div class="mt-3 controls">
      <button class="btn btn-outline-secondary" onclick="skipQuestion()">Skip</button>
      <button class="btn btn-outline-secondary" onclick="showStartScreen()">Quit</button>
    </div>
  `;

  const answersDiv = document.getElementById('answers');
  answers.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = decodeHTML(a);
    btn.onclick = () => checkAnswer(btn, a, q.correct_answer);
    answersDiv.appendChild(btn);
  });

  timeLeft = 20;
  startTimer();
}

function startTimer() {
  const timerEl = document.getElementById('timer');
  if (!timerEl) return;
  clearInterval(timer);
  timerEl.textContent = `⏱ ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      revealAnswer();
    }
  }, 1000);
}

function skipQuestion() {
  clearInterval(timer);
  currentIndex++;
  showQuestion();
}

function checkAnswer(btn, selected, correct) {
  clearInterval(timer);
  const all = Array.from(document.querySelectorAll('#answers button'));
  const correctBtn = all.find(b => decodeHTML(b.innerHTML) === decodeHTML(correct));
  if (selected === correct) {
    btn.classList.add('correct');
    score++;
  } else {
    btn.classList.add('wrong');
    if (correctBtn) correctBtn.classList.add('correct');
  }
  setTimeout(() => { currentIndex++; showQuestion(); }, 900);
}

function revealAnswer() {
  const all = Array.from(document.querySelectorAll('#answers button'));
  const q = questions[currentIndex];
  const correct = q ? q.correct_answer : null;
  all.forEach(b => { if (decodeHTML(b.innerHTML) === decodeHTML(correct)) b.classList.add('correct'); });
  setTimeout(() => { currentIndex++; showQuestion(); }, 900);
}

function decodeHTML(s) { const txt = document.createElement('textarea'); txt.innerHTML = s; return txt.value; }

function showResult() {
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
  quizContainer.innerHTML = `
    <div class="result fade-in">
      <h3>Quiz Finished 🎉</h3>
      <p>Score: <strong>${score}</strong> / ${questions.length} — ${pct}%</p>
      <div class="d-grid gap-2 mt-3">
        <button class="btn btn-info" onclick="showStartScreen()">Play Again</button>
      </div>
    </div>
  `;
}
