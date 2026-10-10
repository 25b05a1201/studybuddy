/**
 * StudyBuddy - Core Application Logic
 * Features: Pomodoro Clock, Flashcard System, Quiz Arena, and Full Customization.
 */

// ==========================================================================
// 1. DEFAULT DATA & STATE
// ==========================================================================

const STARTER_DECKS = [
  {
    id: "deck_study_skills",
    title: "Effective Study Techniques",
    description: "Evidence-based learning techniques for high retention",
    cards: [
      {
        id: "c_1",
        front: "What is Active Recall?",
        back: "Testing yourself on information rather than passively re-reading or highlighting notes.",
        mastered: false
      },
      {
        id: "c_2",
        front: "What is Spaced Repetition?",
        back: "Reviewing material at systematic, increasing intervals to combat the Ebbinghaus forgetting curve.",
        mastered: false
      },
      {
        id: "c_3",
        front: "What is the Feynman Technique?",
        back: "A 4-step mental model: explain a concept in simple, layman terms as if teaching a child to find gaps in your understanding.",
        mastered: false
      },
      {
        id: "c_4",
        front: "What is Interleaving in studying?",
        back: "Mixing different topics or problem types in a single study session rather than blocking one topic for hours.",
        mastered: false
      },
      {
        id: "c_5",
        front: "Why does the Pomodoro Technique work?",
        back: "It prevents cognitive fatigue through structured 25-minute sprints followed by intentional rest periods.",
        mastered: false
      }
    ]
  },
  {
    id: "deck_cs_basics",
    title: "Computer Science Essentials",
    description: "Core algorithms, data structures, and web concepts",
    cards: [
      {
        id: "cs_1",
        front: "What is the time complexity of Binary Search?",
        back: "O(log n) logarithmic time, requiring a sorted array.",
        mastered: false
      },
      {
        id: "cs_2",
        front: "What is the difference between a Stack and a Queue?",
        back: "A Stack is LIFO (Last In First Out); a Queue is FIFO (First In First Out).",
        mastered: false
      },
      {
        id: "cs_3",
        front: "What is an idempotent HTTP method?",
        back: "An HTTP method (like GET, PUT, DELETE) where multiple identical requests produce the same server state as a single request.",
        mastered: false
      },
      {
        id: "cs_4",
        front: "What is Recursion?",
        back: "A programming technique where a function calls itself to solve a smaller instance of the same problem until a base case is reached.",
        mastered: false
      },
      {
        id: "cs_5",
        front: "What is the main role of a DNS server?",
        back: "Translating human-friendly domain names (e.g. google.com) into machine-routable IP addresses.",
        mastered: false
      }
    ]
  }
];

const STARTER_CUSTOM_QUIZZES = [
  {
    id: "quiz_starter",
    title: "Study Skills Master Quiz",
    questions: [
      {
        id: "q_1",
        question: "Which learning method has been scientifically proven to produce the strongest long-term retention?",
        options: [
          "Re-reading the chapter 5 times",
          "Active recall and self-testing",
          "Highlighting every key sentence",
          "Listening to audiobooks while sleeping"
        ],
        correctIndex: 1,
        explanation: "Active recall forces the brain to retrieve information from memory, strengthening neural connections far more than passive reading."
      },
      {
        id: "q_2",
        question: "What is the core idea behind the Feynman Technique?",
        options: [
          "Memorize formulas by rote recitation",
          "Explain the topic in simple terms to spot gaps in knowledge",
          "Study for 10 hours continuously without breaks",
          "Only read peer-reviewed journals"
        ],
        correctIndex: 1,
        explanation: "Richard Feynman advocated teaching a concept in plain English as if explaining to a 10-year-old."
      },
      {
        id: "q_3",
        question: "In the standard Pomodoro Technique, how long is the primary focus interval?",
        options: ["10 minutes", "25 minutes", "45 minutes", "60 minutes"],
        correctIndex: 1,
        explanation: "Francesco Cirillo developed the standard Pomodoro interval as 25 minutes of uninterrupted work."
      }
    ]
  }
];

const BUDDY_QUOTES = [
  "Small daily improvements over time lead to stunning results! 🌱",
  "Focus is a muscle. The more you train it, the stronger it gets! 💪",
  "Don't practice until you get it right; practice until you can't get it wrong. 🎯",
  "Take deep breaths. One pomodoro at a time! 🍅",
  "Active recall feels harder than re-reading because your brain is actually learning! 🧠",
  "You are capable of mastering tough subjects. Let's make progress today! ✨"
];

// Application State Object
const AppState = {
  settings: {
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    cycleCount: 4,
    soundEnabled: true,
    chimeStyle: "bell",
    autoStartBreak: false,
    autoStartPomodoro: false,
    themeColor: "indigo",
    darkMode: false
  },
  stats: {
    todayDate: "",
    todayPomodoros: 0,
    streak: 1,
    lastActiveDate: ""
  },
  decks: [],
  customQuizzes: [],
  activeDeckId: "",
  activeCardIndex: 0,
  isCardFlipped: false,

  // Save to LocalStorage
  save() {
    try {
      localStorage.setItem("studybuddy_settings", JSON.stringify(this.settings));
      localStorage.setItem("studybuddy_stats", JSON.stringify(this.stats));
      localStorage.setItem("studybuddy_decks", JSON.stringify(this.decks));
      localStorage.setItem("studybuddy_quizzes", JSON.stringify(this.customQuizzes));
    } catch (e) {
      console.error("Failed to save StudyBuddy state:", e);
    }
  },

  // Load from LocalStorage
  load() {
    try {
      const savedSettings = localStorage.getItem("studybuddy_settings");
      if (savedSettings) this.settings = Object.assign(this.settings, JSON.parse(savedSettings));

      const savedStats = localStorage.getItem("studybuddy_stats");
      if (savedStats) this.stats = Object.assign(this.stats, JSON.parse(savedStats));

      const savedDecks = localStorage.getItem("studybuddy_decks");
      this.decks = savedDecks ? JSON.parse(savedDecks) : JSON.parse(JSON.stringify(STARTER_DECKS));

      const savedQuizzes = localStorage.getItem("studybuddy_quizzes");
      this.customQuizzes = savedQuizzes ? JSON.parse(savedQuizzes) : JSON.parse(JSON.stringify(STARTER_CUSTOM_QUIZZES));
    } catch (e) {
      console.error("Error loading state, using starter defaults:", e);
      this.decks = JSON.parse(JSON.stringify(STARTER_DECKS));
      this.customQuizzes = JSON.parse(JSON.stringify(STARTER_CUSTOM_QUIZZES));
    }

    // Daily streak & counter check
    const today = new Date().toISOString().split("T")[0];
    if (this.stats.todayDate !== today) {
      if (this.stats.todayDate) {
        // Calculate day difference for streak
        const prev = new Date(this.stats.todayDate);
        const curr = new Date(today);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          // consecutive day
          this.stats.streak = (this.stats.streak || 0) + 1;
        } else if (diffDays > 1) {
          this.stats.streak = 1;
        }
      } else {
        this.stats.streak = 1;
      }
      this.stats.todayDate = today;
      this.stats.todayPomodoros = 0;
    }
  }
};

// ==========================================================================
// 2. SYNTHESIZED WEB AUDIO ENGINE (Zero external dependencies)
// ==========================================================================

const SoundEngine = {
  ctx: null,

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  },

  play(style = "bell") {
    if (!AppState.settings.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    if (style === "bell") {
      // Warm gong/singing bell sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(528, now); // 528 Hz Love/Focus frequency
      osc.frequency.exponentialRampToValueAtTime(520, now + 1.8);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      // Add soft overtone harmonic
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1056, now);
      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 1.8);
      osc2.stop(now + 1.2);

    } else if (style === "digital") {
      // Modern double beep
      [0, 0.16].forEach((delay, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(idx === 0 ? 880 : 1320, now + delay);
        gain.gain.setValueAtTime(0.3, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });

    } else if (style === "harp") {
      // Soft arpeggio chords: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = now + idx * 0.12;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);
        gain.gain.setValueAtTime(0.25, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.9);
      });
    }
  }
};

// ==========================================================================
// 3. POMODORO TIMER MODULE
// ==========================================================================

const Pomodoro = {
  mode: "pomodoro", // "pomodoro" | "shortBreak" | "longBreak"
  timeRemaining: 25 * 60,
  totalTime: 25 * 60,
  timerId: null,
  completedCycles: 0,

  init() {
    this.mode = "pomodoro";
    this.totalTime = AppState.settings.focusTime * 60;
    this.timeRemaining = this.totalTime;
    this.updateUI();
  },

  setMode(newMode) {
    this.pause();
    this.mode = newMode;
    let mins = AppState.settings.focusTime;
    if (newMode === "shortBreak") mins = AppState.settings.shortBreak;
    if (newMode === "longBreak") mins = AppState.settings.longBreak;

    this.totalTime = mins * 60;
    this.timeRemaining = this.totalTime;

    // Update active pill
    document.querySelectorAll(".mode-pill").forEach(pill => {
      pill.classList.toggle("active", pill.dataset.mode === newMode);
    });

    const statusLabel = document.getElementById("timerStatusLabel");
    if (newMode === "pomodoro") statusLabel.textContent = "Focus Session";
    else if (newMode === "shortBreak") statusLabel.textContent = "Short Break";
    else if (newMode === "longBreak") statusLabel.textContent = "Long Break";

    this.updateUI();
  },

  toggle() {
    if (this.timerId) {
      this.pause();
    } else {
      this.start();
    }
  },

  start() {
    SoundEngine.init();
    if (this.timerId) return;

    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);

    document.getElementById("playIcon").textContent = "⏸";
    document.getElementById("playText").textContent = "Pause";
    StudyBuddy.setMood("focusing");
  },

  pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    document.getElementById("playIcon").textContent = "▶";
    document.getElementById("playText").textContent = "Start " + (this.mode === "pomodoro" ? "Focus" : "Break");
    StudyBuddy.setMood("idle");
  },

  reset() {
    this.pause();
    let mins = AppState.settings.focusTime;
    if (this.mode === "shortBreak") mins = AppState.settings.shortBreak;
    if (this.mode === "longBreak") mins = AppState.settings.longBreak;
    this.totalTime = mins * 60;
    this.timeRemaining = this.totalTime;
    this.updateUI();
  },

  adjustMinutes(delta) {
    const newRemaining = Math.max(60, this.timeRemaining + delta * 60);
    this.timeRemaining = newRemaining;
    if (newRemaining > this.totalTime) {
      this.totalTime = newRemaining;
    }
    this.updateUI();
  },

  skip() {
    this.pause();
    this.handleSessionComplete(true);
  },

  tick() {
    if (this.timeRemaining > 0) {
      this.timeRemaining--;
      this.updateUI();
    } else {
      this.handleSessionComplete(false);
    }
  },

  handleSessionComplete(wasSkipped = false) {
    this.pause();
    SoundEngine.play(AppState.settings.chimeStyle);

    if (!wasSkipped && this.mode === "pomodoro") {
      AppState.stats.todayPomodoros++;
      AppState.save();
      updateHeaderStats();
      this.completedCycles++;
      StudyBuddy.say("Awesome session finished! 🍅 Take a well-deserved breather!");
    }

    // Determine next mode
    let nextMode = "pomodoro";
    if (this.mode === "pomodoro") {
      if (this.completedCycles >= AppState.settings.cycleCount) {
        nextMode = "longBreak";
        this.completedCycles = 0;
      } else {
        nextMode = "shortBreak";
      }
    } else {
      nextMode = "pomodoro";
      StudyBuddy.say("Break finished! Ready to lock in for another round? 🎯");
    }

    this.setMode(nextMode);

    // Auto start checks
    if (nextMode === "pomodoro" && AppState.settings.autoStartPomodoro) {
      this.start();
    } else if ((nextMode === "shortBreak" || nextMode === "longBreak") && AppState.settings.autoStartBreak) {
      this.start();
    }
  },

  updateUI() {
    const mins = Math.floor(this.timeRemaining / 60);
    const secs = this.timeRemaining % 60;
    const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    document.getElementById("timerDisplay").textContent = timeStr;
    document.title = `${timeStr} - StudyBuddy`;

    // Progress Ring Calculation (r = 120, circumference ≈ 753.98)
    const ringBar = document.getElementById("progressRingBar");
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const fraction = this.totalTime > 0 ? this.timeRemaining / this.totalTime : 0;
    const offset = circumference * (1 - fraction);
    ringBar.style.strokeDashoffset = offset;

    // Cycle dots display
    const cycleDotsContainer = document.getElementById("cycleDots");
    cycleDotsContainer.innerHTML = "";
    for (let i = 0; i < AppState.settings.cycleCount; i++) {
      const dot = document.createElement("span");
      dot.className = "dot" + (i < this.completedCycles ? " active" : "");
      cycleDotsContainer.appendChild(dot);
    }
  }
};

// ==========================================================================
// 4. FLASHCARD SYSTEM MODULE
// ==========================================================================

const Flashcards = {
  currentDeck: null,

  init() {
    this.populateDeckSelect();
    this.selectDeck(AppState.decks[0] ? AppState.decks[0].id : null);
  },

  populateDeckSelect() {
    const select = document.getElementById("deckSelect");
    const quizDeckSelect = document.getElementById("quizDeckSelect");
    select.innerHTML = "";
    quizDeckSelect.innerHTML = "";

    AppState.decks.forEach(deck => {
      const opt = document.createElement("option");
      opt.value = deck.id;
      opt.textContent = `${deck.title} (${deck.cards.length} cards)`;
      select.appendChild(opt);

      const quizOpt = document.createElement("option");
      quizOpt.value = deck.id;
      quizOpt.textContent = `${deck.title} (${deck.cards.length} cards)`;
      quizDeckSelect.appendChild(quizOpt);
    });
  },

  selectDeck(deckId) {
    if (!deckId && AppState.decks.length > 0) {
      deckId = AppState.decks[0].id;
    }
    this.currentDeck = AppState.decks.find(d => d.id === deckId) || null;
    AppState.activeDeckId = deckId;
    AppState.activeCardIndex = 0;
    AppState.isCardFlipped = false;

    const select = document.getElementById("deckSelect");
    if (this.currentDeck) {
      select.value = this.currentDeck.id;
    }

    this.renderCard();
    this.renderCardsTable();
  },

  getActiveCard() {
    if (!this.currentDeck || this.currentDeck.cards.length === 0) return null;
    return this.currentDeck.cards[AppState.activeCardIndex] || null;
  },

  flipCard() {
    AppState.isCardFlipped = !AppState.isCardFlipped;
    const wrapper = document.getElementById("flipCardWrapper");
    wrapper.classList.toggle("flipped", AppState.isCardFlipped);
  },

  unflipCard() {
    AppState.isCardFlipped = false;
    document.getElementById("flipCardWrapper").classList.remove("flipped");
  },

  nextCard() {
    if (!this.currentDeck || this.currentDeck.cards.length === 0) return;
    this.unflipCard();
    AppState.activeCardIndex = (AppState.activeCardIndex + 1) % this.currentDeck.cards.length;
    this.renderCard();
  },

  prevCard() {
    if (!this.currentDeck || this.currentDeck.cards.length === 0) return;
    this.unflipCard();
    AppState.activeCardIndex = (AppState.activeCardIndex - 1 + this.currentDeck.cards.length) % this.currentDeck.cards.length;
    this.renderCard();
  },

  shuffle() {
    if (!this.currentDeck || this.currentDeck.cards.length <= 1) return;
    for (let i = this.currentDeck.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentDeck.cards[i], this.currentDeck.cards[j]] = [this.currentDeck.cards[j], this.currentDeck.cards[i]];
    }
    AppState.activeCardIndex = 0;
    this.unflipCard();
    this.renderCard();
    this.renderCardsTable();
    StudyBuddy.say("Cards shuffled! Testing your memory fresh! 🔀");
  },

  setMastery(isMastered) {
    const card = this.getActiveCard();
    if (!card) return;
    card.mastered = isMastered;
    AppState.save();
    this.updateStats();
    this.renderCardsTable();

    if (isMastered) {
      StudyBuddy.say("Card marked Mastered! You're crushing it! 🌟");
    } else {
      StudyBuddy.say("Flagged for review. Repetition will cement it! 💡");
    }

    // Auto advance to next card after a brief moment
    setTimeout(() => {
      this.nextCard();
    }, 280);
  },

  resetMastery() {
    if (!this.currentDeck) return;
    this.currentDeck.cards.forEach(c => c.mastered = false);
    AppState.save();
    this.updateStats();
    this.renderCardsTable();
    StudyBuddy.say("Mastery reset for this deck. Ready for a clean run!");
  },

  renderCard() {
    const card = this.getActiveCard();
    const frontEl = document.getElementById("cardFrontText");
    const backEl = document.getElementById("cardBackText");
    const counterEl = document.getElementById("cardCounter");
    const totalCountEl = document.getElementById("totalCardsCount");

    if (!card) {
      frontEl.textContent = "This deck is empty! Click '+ Add Card' to create your first flashcard.";
      backEl.textContent = "No answer available.";
      counterEl.textContent = "0 of 0";
      totalCountEl.textContent = "0";
      this.updateStats();
      return;
    }

    frontEl.textContent = card.front;
    backEl.textContent = card.back;
    counterEl.textContent = `Card ${AppState.activeCardIndex + 1} of ${this.currentDeck.cards.length}`;
    totalCountEl.textContent = this.currentDeck.cards.length;
    this.updateStats();
  },

  updateStats() {
    if (!this.currentDeck) {
      document.getElementById("deckMasteredCount").textContent = "0 Mastered";
      document.getElementById("deckReviewCount").textContent = "0 Needs Review";
      return;
    }
    const mastered = this.currentDeck.cards.filter(c => c.mastered).length;
    const review = this.currentDeck.cards.length - mastered;
    document.getElementById("deckMasteredCount").textContent = `${mastered} Mastered`;
    document.getElementById("deckReviewCount").textContent = `${review} Needs Review`;
  },

  renderCardsTable() {
    const tbody = document.getElementById("cardsTableBody");
    tbody.innerHTML = "";
    if (!this.currentDeck || this.currentDeck.cards.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No cards yet in this deck.</td></tr>`;
      return;
    }

    this.currentDeck.cards.forEach((card, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>#${idx + 1}</strong> ${escapeHtml(card.front)}</td>
        <td>${escapeHtml(card.back)}</td>
        <td>
          <span class="badge ${card.mastered ? 'mastered-badge' : 'learning-badge'}">
            ${card.mastered ? 'Mastered' : 'Review'}
          </span>
        </td>
        <td>
          <button class="btn btn-danger-outline btn-xs delete-card-btn" data-card-id="${card.id}" title="Delete card">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach delete handlers
    tbody.querySelectorAll(".delete-card-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const cardId = e.currentTarget.dataset.cardId;
        this.deleteCard(cardId);
      });
    });
  },

  deleteCard(cardId) {
    if (!this.currentDeck) return;
    this.currentDeck.cards = this.currentDeck.cards.filter(c => c.id !== cardId);
    if (AppState.activeCardIndex >= this.currentDeck.cards.length) {
      AppState.activeCardIndex = Math.max(0, this.currentDeck.cards.length - 1);
    }
    AppState.save();
    this.populateDeckSelect();
    document.getElementById("deckSelect").value = this.currentDeck.id;
    this.renderCard();
    this.renderCardsTable();
  },

  createDeck(title, description) {
    const newDeck = {
      id: "deck_" + Date.now(),
      title: title.trim(),
      description: description.trim(),
      cards: []
    };
    AppState.decks.push(newDeck);
    AppState.save();
    this.populateDeckSelect();
    this.selectDeck(newDeck.id);
    StudyBuddy.say(`Created deck "${title}"! Now add some flashcards to it.`);
  },

  deleteCurrentDeck() {
    if (!this.currentDeck) return;
    if (AppState.decks.length <= 1) {
      alert("You must keep at least one deck. Add a new deck before deleting this one.");
      return;
    }
    if (confirm(`Are you sure you want to delete deck "${this.currentDeck.title}"?`)) {
      AppState.decks = AppState.decks.filter(d => d.id !== this.currentDeck.id);
      AppState.save();
      this.populateDeckSelect();
      this.selectDeck(AppState.decks[0].id);
      StudyBuddy.say("Deck deleted.");
    }
  },

  addCard(front, back) {
    if (!this.currentDeck) return;
    const newCard = {
      id: "c_" + Date.now(),
      front: front.trim(),
      back: back.trim(),
      mastered: false
    };
    this.currentDeck.cards.push(newCard);
    AppState.save();
    this.populateDeckSelect();
    document.getElementById("deckSelect").value = this.currentDeck.id;
    AppState.activeCardIndex = this.currentDeck.cards.length - 1;
    this.unflipCard();
    this.renderCard();
    this.renderCardsTable();
    StudyBuddy.say("Flashcard added! High five! ✋");
  }
};

// ==========================================================================
// 5. QUIZ ARENA MODULE
// ==========================================================================

const QuizArena = {
  activeQuiz: null,
  currentIndex: 0,
  score: 0,
  timerInterval: null,
  secondsElapsed: 0,
  userResponses: [],

  init() {
    this.populateCustomQuizzesSelect();
  },

  populateCustomQuizzesSelect() {
    const select = document.getElementById("customQuizSelect");
    select.innerHTML = "";
    if (AppState.customQuizzes.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No custom quizzes yet";
      select.appendChild(opt);
      return;
    }
    AppState.customQuizzes.forEach(quiz => {
      const opt = document.createElement("option");
      opt.value = quiz.id;
      opt.textContent = `${quiz.title} (${quiz.questions.length} questions)`;
      select.appendChild(opt);
    });
  },

  startDeckQuiz(deckId, countOpt) {
    const deck = AppState.decks.find(d => d.id === deckId);
    if (!deck || deck.cards.length === 0) {
      alert("This deck has no flashcards! Add some cards to take a quiz.");
      return;
    }

    // Generate multiple choice questions from deck cards
    let cardsPool = [...deck.cards];
    // Shuffle cards pool
    cardsPool.sort(() => Math.random() - 0.5);

    const questionCount = countOpt === "all" ? cardsPool.length : Math.min(parseInt(countOpt, 10), cardsPool.length);
    const selectedCards = cardsPool.slice(0, questionCount);

    const questions = selectedCards.map((card, idx) => {
      const correctAns = card.back;
      // Get other distinct cards as wrong options
      const distractors = deck.cards
        .filter(c => c.id !== card.id && c.back !== correctAns)
        .map(c => c.back);

      distractors.sort(() => Math.random() - 0.5);
      const chosenDistractors = distractors.slice(0, 3);

      // Fallback sensible distractors if deck has fewer than 4 cards
      const fallbacks = [
        "None of the above",
        "Passive review through spaced intervals",
        "It applies only to non-linear dynamic problems",
        "Information is stored without indexing"
      ];
      while (chosenDistractors.length < 3) {
        const fb = fallbacks[chosenDistractors.length % fallbacks.length];
        if (!chosenDistractors.includes(fb) && fb !== correctAns) {
          chosenDistractors.push(fb);
        } else {
          chosenDistractors.push(`Option ${chosenDistractors.length + 1}`);
        }
      }

      const options = [correctAns, ...chosenDistractors];
      options.sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctAns);

      return {
        id: `deck_q_${idx}`,
        question: `Question: ${card.front}`,
        options: options,
        correctIndex: correctIndex,
        explanation: `Answer: ${correctAns}`
      };
    });

    this.runQuiz({
      title: `${deck.title} (Flashcard Quiz)`,
      deckId: deck.id,
      questions: questions
    });
  },

  startCustomQuiz(quizId) {
    const quiz = AppState.customQuizzes.find(q => q.id === quizId);
    if (!quiz || quiz.questions.length === 0) {
      alert("This custom quiz has no questions yet! Click '+ Add Question' to add some.");
      return;
    }
    this.runQuiz(JSON.parse(JSON.stringify(quiz)));
  },

  runQuiz(quizData) {
    this.activeQuiz = quizData;
    this.currentIndex = 0;
    this.score = 0;
    this.userResponses = [];
    this.secondsElapsed = 0;

    // Switch panels
    document.getElementById("quizHomePanel").classList.add("hidden");
    document.getElementById("quizResultPanel").classList.add("hidden");
    document.getElementById("quizRunnerPanel").classList.remove("hidden");

    document.getElementById("activeQuizTitle").textContent = quizData.title;

    // Timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.secondsElapsed++;
      const m = Math.floor(this.secondsElapsed / 60);
      const s = this.secondsElapsed % 60;
      document.getElementById("quizTimerReadout").textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }, 1000);

    StudyBuddy.say("Quiz started! Choose the best answer for each question. 🧠");
    this.renderCurrentQuestion();
  },

  renderCurrentQuestion() {
    const q = this.activeQuiz.questions[this.currentIndex];
    const total = this.activeQuiz.questions.length;

    document.getElementById("quizProgressLabel").textContent = `Question ${this.currentIndex + 1} of ${total}`;
    const progressPercent = ((this.currentIndex) / total) * 100;
    document.getElementById("quizProgressBar").style.width = `${progressPercent}%`;

    document.getElementById("quizQuestionText").textContent = q.question;

    const optionsContainer = document.getElementById("quizOptionsContainer");
    optionsContainer.innerHTML = "";

    const letters = ["A", "B", "C", "D"];
    q.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option-btn";
      btn.innerHTML = `
        <span class="letter-indicator">${letters[idx] || (idx + 1)}</span>
        <span class="option-text">${escapeHtml(optText)}</span>
      `;
      btn.addEventListener("click", () => this.handleOptionSelect(idx));
      optionsContainer.appendChild(btn);
    });

    // Reset feedback & next button
    const feedbackText = document.getElementById("feedbackText");
    feedbackText.textContent = "";
    document.getElementById("quizExplanationBox").classList.add("hidden");
    document.getElementById("nextQuestionBtn").classList.add("hidden");
  },

  handleOptionSelect(selectedIndex) {
    const q = this.activeQuiz.questions[this.currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;
    const allOptionBtns = document.querySelectorAll(".quiz-option-btn");

    // Disable all option buttons
    allOptionBtns.forEach(btn => btn.disabled = true);

    if (isCorrect) {
      this.score++;
      allOptionBtns[selectedIndex].classList.add("correct");
      document.getElementById("feedbackText").innerHTML = `<span style="color: var(--success)">✅ Correct!</span>`;
      SoundEngine.play("digital");
    } else {
      allOptionBtns[selectedIndex].classList.add("wrong");
      allOptionBtns[q.correctIndex].classList.add("correct");
      document.getElementById("feedbackText").innerHTML = `<span style="color: var(--danger)">❌ Incorrect!</span>`;
    }

    // Save response for review
    this.userResponses.push({
      question: q.question,
      selectedAnswer: q.options[selectedIndex],
      correctAnswer: q.options[q.correctIndex],
      isCorrect: isCorrect,
      explanation: q.explanation || ""
    });

    // Show explanation if exists
    if (q.explanation) {
      const expBox = document.getElementById("quizExplanationBox");
      expBox.textContent = `💡 Note: ${q.explanation}`;
      expBox.classList.remove("hidden");
    }

    // Reveal next or finish button
    const nextBtn = document.getElementById("nextQuestionBtn");
    const isLast = this.currentIndex === this.activeQuiz.questions.length - 1;
    nextBtn.textContent = isLast ? "View Quiz Results 🏆" : "Next Question ▶";
    nextBtn.classList.remove("hidden");
  },

  nextQuestion() {
    this.currentIndex++;
    if (this.currentIndex < this.activeQuiz.questions.length) {
      this.renderCurrentQuestion();
    } else {
      this.finishQuiz();
    }
  },

  finishQuiz() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    document.getElementById("quizRunnerPanel").classList.add("hidden");
    document.getElementById("quizResultPanel").classList.remove("hidden");

    const total = this.activeQuiz.questions.length;
    const percent = Math.round((this.score / total) * 100);

    document.getElementById("scorePercent").textContent = `${percent}%`;
    document.getElementById("scoreFraction").textContent = `${this.score} / ${total} Correct`;

    // Dynamic reaction
    const trophy = document.getElementById("resultTrophy");
    const heading = document.getElementById("resultHeading");
    const subheading = document.getElementById("resultSubheading");

    if (percent === 100) {
      trophy.textContent = "🏆";
      heading.textContent = "Flawless Score!";
      subheading.textContent = "You answered every single question correctly! Outstanding retention.";
      StudyBuddy.say("100% on the quiz! You're a true subject master! 🎓🌟");
    } else if (percent >= 80) {
      trophy.textContent = "🎉";
      heading.textContent = "Great Job!";
      subheading.textContent = "Strong grasp of the material! Review the flagged items below to lock in 100%.";
      StudyBuddy.say("Awesome score! You're making real learning gains! 🚀");
    } else if (percent >= 50) {
      trophy.textContent = "👍";
      heading.textContent = "Good Effort!";
      subheading.textContent = "Solid start. Practice with the flashcards a bit more and retake to improve.";
      StudyBuddy.say("Good try! Active recall will help turn those tricky ones into second nature.");
    } else {
      trophy.textContent = "🌱";
      heading.textContent = "Keep Practicing!";
      subheading.textContent = "Learning takes repetition. Spend 1-2 Pomodoros reviewing your deck and try again!";
      StudyBuddy.say("Every mistake is a learning checkpoint. You'll nail it next round! 💪");
    }

    // Breakdown list
    const breakdown = document.getElementById("resultBreakdown");
    breakdown.innerHTML = "";

    this.userResponses.forEach((res, i) => {
      const item = document.createElement("div");
      item.className = `review-item ${res.isCorrect ? 'review-correct' : 'review-wrong'}`;
      item.innerHTML = `
        <div class="review-q-text">#${i + 1}. ${escapeHtml(res.question)}</div>
        <div>Your Answer: <strong>${escapeHtml(res.selectedAnswer)}</strong> ${res.isCorrect ? '✅' : '❌'}</div>
        ${!res.isCorrect ? `<div>Correct Answer: <strong style="color: var(--success);">${escapeHtml(res.correctAnswer)}</strong></div>` : ''}
        ${res.explanation ? `<div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.2rem;">${escapeHtml(res.explanation)}</div>` : ''}
      `;
      breakdown.appendChild(item);
    });

    // Study deck shortcut button
    const studyDeckBtn = document.getElementById("studyDeckFromQuizBtn");
    if (this.activeQuiz.deckId) {
      studyDeckBtn.classList.remove("hidden");
    } else {
      studyDeckBtn.classList.add("hidden");
    }
  },

  quit() {
    if (confirm("Are you sure you want to exit the quiz? Your current progress will not be saved.")) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      document.getElementById("quizRunnerPanel").classList.add("hidden");
      document.getElementById("quizResultPanel").classList.add("hidden");
      document.getElementById("quizHomePanel").classList.remove("hidden");
      StudyBuddy.setMood("idle");
    }
  },

  createCustomQuiz(title) {
    const newQuiz = {
      id: "quiz_" + Date.now(),
      title: title.trim(),
      questions: []
    };
    AppState.customQuizzes.push(newQuiz);
    AppState.save();
    this.populateCustomQuizzesSelect();
    document.getElementById("customQuizSelect").value = newQuiz.id;
    StudyBuddy.say(`Created custom quiz "${title}"! Now add some questions to it.`);
  },

  deleteCustomQuiz(quizId) {
    if (!quizId) return;
    const quiz = AppState.customQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    if (confirm(`Delete custom quiz "${quiz.title}"?`)) {
      AppState.customQuizzes = AppState.customQuizzes.filter(q => q.id !== quizId);
      AppState.save();
      this.populateCustomQuizzesSelect();
      StudyBuddy.say("Custom quiz deleted.");
    }
  },

  addQuestionToQuiz(quizId, questionData) {
    const quiz = AppState.customQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    quiz.questions.push({
      id: "q_" + Date.now(),
      question: questionData.question,
      options: questionData.options,
      correctIndex: questionData.correctIndex,
      explanation: questionData.explanation || ""
    });
    AppState.save();
    this.populateCustomQuizzesSelect();
    document.getElementById("customQuizSelect").value = quiz.id;
    StudyBuddy.say(`Question added to "${quiz.title}"!`);
  }
};

// ==========================================================================
// 6. STUDY BUDDY MASCOT & SPEECH
// ==========================================================================

const StudyBuddy = {
  say(text) {
    const speechEl = document.getElementById("buddySpeech");
    speechEl.textContent = text;
    // Animate mascot
    const avatar = document.getElementById("mascotIcon");
    avatar.style.transform = "scale(1.25) rotate(-10deg)";
    setTimeout(() => {
      avatar.style.transform = "";
    }, 300);
  },

  setMood(mood) {
    const avatar = document.getElementById("mascotIcon");
    if (mood === "focusing") {
      avatar.textContent = "🦉";
      this.say("Focus mode active! Keep distractions away.");
    } else if (mood === "idle") {
      avatar.textContent = "🦉";
    }
  },

  randomTip() {
    const quote = BUDDY_QUOTES[Math.floor(Math.random() * BUDDY_QUOTES.length)];
    this.say(quote);
  }
};

// ==========================================================================
// 7. SETTINGS & BACKUP/RESTORE
// ==========================================================================

const SettingsManager = {
  open() {
    document.getElementById("settingFocusTime").value = AppState.settings.focusTime;
    document.getElementById("settingShortBreak").value = AppState.settings.shortBreak;
    document.getElementById("settingLongBreak").value = AppState.settings.longBreak;
    document.getElementById("settingCycleCount").value = AppState.settings.cycleCount;
    document.getElementById("settingSoundToggle").checked = AppState.settings.soundEnabled;
    document.getElementById("settingAutoStartBreak").checked = AppState.settings.autoStartBreak;
    document.getElementById("settingAutoStartPomodoro").checked = AppState.settings.autoStartPomodoro;
    document.getElementById("settingChimeStyle").value = AppState.settings.chimeStyle;

    // Highlight active color theme button
    document.querySelectorAll(".theme-pick-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.colorTheme === AppState.settings.themeColor);
    });

    document.getElementById("settingsModal").showModal();
  },

  save() {
    AppState.settings.focusTime = Math.max(1, parseInt(document.getElementById("settingFocusTime").value, 10) || 25);
    AppState.settings.shortBreak = Math.max(1, parseInt(document.getElementById("settingShortBreak").value, 10) || 5);
    AppState.settings.longBreak = Math.max(1, parseInt(document.getElementById("settingLongBreak").value, 10) || 15);
    AppState.settings.cycleCount = Math.max(1, parseInt(document.getElementById("settingCycleCount").value, 10) || 4);
    AppState.settings.soundEnabled = document.getElementById("settingSoundToggle").checked;
    AppState.settings.autoStartBreak = document.getElementById("settingAutoStartBreak").checked;
    AppState.settings.autoStartPomodoro = document.getElementById("settingAutoStartPomodoro").checked;
    AppState.settings.chimeStyle = document.getElementById("settingChimeStyle").value;

    AppState.save();
    Pomodoro.reset();
    document.getElementById("settingsModal").close();
    StudyBuddy.say("Settings updated and applied! ✨");
  },

  applyTheme(themeName) {
    AppState.settings.themeColor = themeName;
    document.body.setAttribute("data-theme", themeName);
    document.querySelectorAll(".theme-pick-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.colorTheme === themeName);
    });
    AppState.save();
  },

  toggleDarkMode() {
    AppState.settings.darkMode = !AppState.settings.darkMode;
    document.body.classList.toggle("dark-mode", AppState.settings.darkMode);
    AppState.save();
  },

  exportBackup() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: AppState.settings,
      stats: AppState.stats,
      decks: AppState.decks,
      quizzes: AppState.customQuizzes
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studybuddy_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    StudyBuddy.say("Backup exported successfully! 📁");
  },

  importBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.settings) AppState.settings = Object.assign(AppState.settings, data.settings);
        if (data.decks) AppState.decks = data.decks;
        if (data.quizzes) AppState.customQuizzes = data.quizzes;
        AppState.save();

        // Refresh UI
        SettingsManager.applyTheme(AppState.settings.themeColor);
        document.body.classList.toggle("dark-mode", AppState.settings.darkMode);
        Pomodoro.reset();
        Flashcards.init();
        QuizArena.init();
        updateHeaderStats();

        alert("Data imported successfully!");
        StudyBuddy.say("Data restored from backup! Welcome back! 🎉");
      } catch (err) {
        alert("Error reading JSON backup file: " + err.message);
      }
    };
    reader.readAsText(file);
  },

  loadStarters() {
    if (confirm("Load starter decks? This will add curated study decks without deleting your custom ones.")) {
      STARTER_DECKS.forEach(starter => {
        if (!AppState.decks.some(d => d.title === starter.title)) {
          AppState.decks.push(JSON.parse(JSON.stringify(starter)));
        }
      });
      AppState.save();
      Flashcards.init();
      StudyBuddy.say("Starter decks loaded! Check them out in Flashcards.");
    }
  },

  resetAll() {
    if (confirm("⚠️ Are you sure you want to reset all StudyBuddy data? This will restore factory starter decks and settings.")) {
      localStorage.clear();
      AppState.settings = {
        focusTime: 25,
        shortBreak: 5,
        longBreak: 15,
        cycleCount: 4,
        soundEnabled: true,
        chimeStyle: "bell",
        autoStartBreak: false,
        autoStartPomodoro: false,
        themeColor: "indigo",
        darkMode: false
      };
      AppState.decks = JSON.parse(JSON.stringify(STARTER_DECKS));
      AppState.customQuizzes = JSON.parse(JSON.stringify(STARTER_CUSTOM_QUIZZES));
      AppState.stats = {
        todayDate: new Date().toISOString().split("T")[0],
        todayPomodoros: 0,
        streak: 1,
        lastActiveDate: ""
      };
      AppState.save();
      location.reload();
    }
  }
};

// ==========================================================================
// 8. HELPER FUNCTIONS & UI BINDINGS
// ==========================================================================

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function updateHeaderStats() {
  document.getElementById("todayCount").textContent = AppState.stats.todayPomodoros || 0;
  document.getElementById("streakCount").textContent = AppState.stats.streak || 1;
}

// Switch between main navigation tabs
function switchTab(tabKey) {
  document.querySelectorAll(".nav-tab").forEach(tab => {
    const isActive = tab.dataset.tab === tabKey;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive);
  });

  document.querySelectorAll(".tab-view").forEach(view => {
    view.classList.remove("active");
  });

  if (tabKey === "timer") {
    document.getElementById("timerView").classList.add("active");
  } else if (tabKey === "flashcards") {
    document.getElementById("flashcardsView").classList.add("active");
    Flashcards.renderCard();
  } else if (tabKey === "quiz") {
    document.getElementById("quizView").classList.add("active");
  }
}

// ==========================================================================
// 9. EVENT LISTENERS INITIALIZATION
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Load State
  AppState.load();

  // 2. Apply saved theme & dark mode
  SettingsManager.applyTheme(AppState.settings.themeColor);
  if (AppState.settings.darkMode) {
    document.body.classList.add("dark-mode");
  }

  // 3. Update Header
  updateHeaderStats();

  // 4. Initialize Modules
  Pomodoro.init();
  Flashcards.init();
  QuizArena.init();

  // Navigation tab clicks
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Mascot click -> random motivation
  document.getElementById("mascotIcon").addEventListener("click", () => {
    StudyBuddy.randomTip();
  });

  // Theme & Settings toggle
  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    SettingsManager.toggleDarkMode();
  });
  document.getElementById("settingsBtn").addEventListener("click", () => {
    SettingsManager.open();
  });

  // Pomodoro Controls
  document.querySelectorAll(".mode-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      Pomodoro.setMode(pill.dataset.mode);
    });
  });

  document.getElementById("toggleTimerBtn").addEventListener("click", () => {
    Pomodoro.toggle();
  });

  document.getElementById("resetTimerBtn").addEventListener("click", () => {
    Pomodoro.reset();
  });

  document.getElementById("skipTimerBtn").addEventListener("click", () => {
    Pomodoro.skip();
  });

  document.querySelectorAll(".quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const delta = parseInt(btn.dataset.adjust, 10);
      Pomodoro.adjustMinutes(delta);
    });
  });

  // Flashcards Controls
  document.getElementById("deckSelect").addEventListener("change", (e) => {
    Flashcards.selectDeck(e.target.value);
  });

  const flipWrapper = document.getElementById("flipCardWrapper");
  flipWrapper.addEventListener("click", () => {
    Flashcards.flipCard();
  });
  flipWrapper.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      Flashcards.flipCard();
    }
  });

  document.getElementById("flipCardBtn").addEventListener("click", () => {
    Flashcards.flipCard();
  });
  document.getElementById("nextCardBtn").addEventListener("click", () => {
    Flashcards.nextCard();
  });
  document.getElementById("prevCardBtn").addEventListener("click", () => {
    Flashcards.prevCard();
  });
  document.getElementById("markMasteredBtn").addEventListener("click", () => {
    Flashcards.setMastery(true);
  });
  document.getElementById("markReviewBtn").addEventListener("click", () => {
    Flashcards.setMastery(false);
  });
  document.getElementById("shuffleDeckBtn").addEventListener("click", () => {
    Flashcards.shuffle();
  });
  document.getElementById("resetMasteryBtn").addEventListener("click", () => {
    Flashcards.resetMastery();
  });

  // Toggle card manager table
  document.getElementById("toggleCardListBtn").addEventListener("click", () => {
    const sec = document.getElementById("cardsListSection");
    sec.classList.toggle("hidden");
  });
  document.getElementById("closeCardListBtn").addEventListener("click", () => {
    document.getElementById("cardsListSection").classList.add("hidden");
  });

  // Add Card Modal
  const cardModal = document.getElementById("cardModal");
  document.getElementById("addCardModalBtn").addEventListener("click", () => {
    document.getElementById("cardForm").reset();
    cardModal.showModal();
  });
  document.getElementById("closeCardModalBtn").addEventListener("click", () => cardModal.close());
  document.getElementById("cancelCardModalBtn").addEventListener("click", () => cardModal.close());
  document.getElementById("cardForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const front = document.getElementById("cardFrontInput").value;
    const back = document.getElementById("cardBackInput").value;
    Flashcards.addCard(front, back);
    cardModal.close();
  });

  // New Deck Modal
  const newDeckModal = document.getElementById("newDeckModal");
  document.getElementById("newDeckBtn").addEventListener("click", () => {
    document.getElementById("newDeckForm").reset();
    newDeckModal.showModal();
  });
  document.getElementById("closeDeckModalBtn").addEventListener("click", () => newDeckModal.close());
  document.getElementById("cancelDeckModalBtn").addEventListener("click", () => newDeckModal.close());
  document.getElementById("newDeckForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("newDeckNameInput").value;
    const desc = document.getElementById("newDeckDescInput").value;
    Flashcards.createDeck(name, desc);
    newDeckModal.close();
  });

  document.getElementById("deleteDeckBtn").addEventListener("click", () => {
    Flashcards.deleteCurrentDeck();
  });

  // Shortcut: "Quiz This Deck" from flashcards tab
  document.getElementById("quizFromDeckBtn").addEventListener("click", () => {
    if (!Flashcards.currentDeck) return;
    switchTab("quiz");
    document.getElementById("quizDeckSelect").value = Flashcards.currentDeck.id;
    QuizArena.startDeckQuiz(Flashcards.currentDeck.id, "all");
  });

  // Quiz Arena Controls
  document.getElementById("startDeckQuizBtn").addEventListener("click", () => {
    const deckId = document.getElementById("quizDeckSelect").value;
    const count = document.getElementById("quizCountSelect").value;
    QuizArena.startDeckQuiz(deckId, count);
  });

  document.getElementById("startCustomQuizBtn").addEventListener("click", () => {
    const quizId = document.getElementById("customQuizSelect").value;
    QuizArena.startCustomQuiz(quizId);
  });

  document.getElementById("nextQuestionBtn").addEventListener("click", () => {
    QuizArena.nextQuestion();
  });

  document.getElementById("quitQuizBtn").addEventListener("click", () => {
    QuizArena.quit();
  });

  document.getElementById("retakeQuizBtn").addEventListener("click", () => {
    if (QuizArena.activeQuiz) {
      QuizArena.runQuiz(QuizArena.activeQuiz);
    }
  });

  document.getElementById("backToQuizHubBtn").addEventListener("click", () => {
    document.getElementById("quizResultPanel").classList.add("hidden");
    document.getElementById("quizHomePanel").classList.remove("hidden");
  });

  document.getElementById("studyDeckFromQuizBtn").addEventListener("click", () => {
    if (QuizArena.activeQuiz && QuizArena.activeQuiz.deckId) {
      switchTab("flashcards");
      Flashcards.selectDeck(QuizArena.activeQuiz.deckId);
    }
  });

  // Custom Quiz Maker Modals
  const customQuizModal = document.getElementById("customQuizModal");
  document.getElementById("createCustomQuizBtn").addEventListener("click", () => {
    document.getElementById("customQuizForm").reset();
    customQuizModal.showModal();
  });
  document.getElementById("closeCustomQuizModalBtn").addEventListener("click", () => customQuizModal.close());
  document.getElementById("cancelCustomQuizModalBtn").addEventListener("click", () => customQuizModal.close());
  document.getElementById("customQuizForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("customQuizTitleInput").value;
    QuizArena.createCustomQuiz(title);
    customQuizModal.close();
  });

  document.getElementById("deleteCustomQuizBtn").addEventListener("click", () => {
    const quizId = document.getElementById("customQuizSelect").value;
    QuizArena.deleteCustomQuiz(quizId);
  });

  // Add Question to Custom Quiz Modal
  const quizQuestionModal = document.getElementById("quizQuestionModal");
  document.getElementById("addCustomQuestionBtn").addEventListener("click", () => {
    const quizId = document.getElementById("customQuizSelect").value;
    if (!quizId) {
      alert("Please select or create a custom quiz first!");
      return;
    }
    document.getElementById("quizQuestionForm").reset();
    quizQuestionModal.showModal();
  });
  document.getElementById("closeQuizQuestionModalBtn").addEventListener("click", () => quizQuestionModal.close());
  document.getElementById("cancelQuizQuestionModalBtn").addEventListener("click", () => quizQuestionModal.close());
  document.getElementById("quizQuestionForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const quizId = document.getElementById("customQuizSelect").value;
    const questionText = document.getElementById("questionTextInput").value;
    const options = [
      document.getElementById("option0Input").value,
      document.getElementById("option1Input").value,
      document.getElementById("option2Input").value,
      document.getElementById("option3Input").value
    ];
    const correctRadio = document.querySelector('input[name="correctOption"]:checked');
    const correctIndex = correctRadio ? parseInt(correctRadio.value, 10) : 0;
    const explanation = document.getElementById("explanationInput").value;

    QuizArena.addQuestionToQuiz(quizId, {
      question: questionText,
      options: options,
      correctIndex: correctIndex,
      explanation: explanation
    });
    quizQuestionModal.close();
  });

  // Settings Modal Handlers
  document.getElementById("closeSettingsModalBtn").addEventListener("click", () => {
    document.getElementById("settingsModal").close();
  });
  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    SettingsManager.save();
  });
  document.getElementById("testSoundBtn").addEventListener("click", () => {
    const style = document.getElementById("settingChimeStyle").value;
    SoundEngine.play(style);
  });

  document.querySelectorAll(".theme-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      SettingsManager.applyTheme(btn.dataset.colorTheme);
    });
  });

  document.getElementById("exportDataBtn").addEventListener("click", () => {
    SettingsManager.exportBackup();
  });
  document.getElementById("importDataInput").addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      SettingsManager.importBackup(e.target.files[0]);
    }
  });
  document.getElementById("loadSampleDecksBtn").addEventListener("click", () => {
    SettingsManager.loadStarters();
  });
  document.getElementById("resetAllDataBtn").addEventListener("click", () => {
    SettingsManager.resetAll();
  });

  // Global Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    // If inside an input or textarea or modal, do not trigger study shortcuts
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
    if (document.querySelector("dialog[open]")) return;

    const activeTab = document.querySelector(".nav-tab.active").dataset.tab;

    if (activeTab === "flashcards") {
      if (e.code === "ArrowRight") {
        Flashcards.nextCard();
      } else if (e.code === "ArrowLeft") {
        Flashcards.prevCard();
      } else if (e.code === "KeyM") {
        Flashcards.setMastery(true);
      } else if (e.code === "KeyR") {
        Flashcards.setMastery(false);
      }
    } else if (activeTab === "timer") {
      if (e.code === "Space") {
        e.preventDefault();
        Pomodoro.toggle();
      }
    }
  });
});
