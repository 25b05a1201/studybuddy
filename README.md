# 🦉 StudyBuddy App

A modern, distraction-free study companion featuring an interactive **Pomodoro Clock**, **Flashcard Decks**, and a **Quiz Arena** where you can customize your timers, create your own decks, and take quizzes to test your recall.

---

## ✨ Key Features

### 1. ⏱️ Customizable Pomodoro Clock
- **Multiple Modes**: Focus Session, Short Break, Long Break.
- **Interactive SVG Progress Ring**: Visual circular countdown showing time remaining and progress percentage.
- **Customizable Intervals**: User can set custom Focus (1–120m), Short Break (1–60m), Long Break (1–90m), and Long Break Frequency in Settings (`⚙️`).
- **Quick Time Adjusters**: `+1m`, `-1m`, `+5m`, `-5m` buttons directly on the clock interface.
- **Web Audio Chimes**: Built-in sound synthesis with selectable chime styles (*Zen Bell*, *Digital Chime*, or *Harp Arpeggio*) that work offline without missing sound files.
- **Task Tracking**: Input field to set your active study goal for the session.

### 2. 🗂️ Interactive Flashcards
- **3D Flip Card Effect**: Smooth 3D card flip animation revealing prompts and answers.
- **Deck Management**: Create new custom decks, delete decks, and switch between active subjects.
- **Card Creator & Manager**: Add new cards with front/back prompts, review existing cards in a collapsible manager table, and delete cards.
- **Active Recall Self-Grading**: Mark cards as `✅ Mastered` or `⚠️ Needs Review` to track mastery progress.
- **Shuffle & Reset**: Shuffle deck order or reset mastery levels anytime.
- **One-Click Quiz**: Hit `🎯 Quiz This Deck` to instantly generate an interactive quiz from the cards.

### 3. 📝 Quiz Arena
- **Flashcard Quiz Generator**: Automatically converts any flashcard deck into a multiple-choice practice quiz with randomized answer choices.
- **Custom Quiz Maker**: Build your own multi-question quizzes with custom questions, choices (A, B, C, D), correct answers, and explanations.
- **Live Scoring & Progress**: Real-time progress bar, timer, and immediate feedback on each question.
- **Comprehensive Scorecard**: Performance percentage, dynamic trophy feedback, and detailed question-by-question review showing your response versus the correct answer.

### 4. ⚙️ Full Customization & Companion
- **Theme Color Palettes**: Choose between *Indigo Modern*, *Sunset Warmth*, *Emerald Grove*, *Rose Berry*, and *Slate Minimal*.
- **Dark / Light Mode**: Instant toggle with system/user preference persistence.
- **Backup & Restore**: Export all your decks, quizzes, and stats to a JSON file or restore from a backup.
- **Study Buddy Companion (🦉)**: Provides encouraging motivational tips and tracking for your daily pomodoro count and study streak.

---

## 🚀 How to Run

### Method 1: Open Directly in Any Web Browser (Zero Setup)
Simply double-click `index.html` in your file explorer, or right-click and choose **Open with > Google Chrome** (or Edge / Firefox / Safari).

### Method 2: Run with Local Node Server
Open PowerShell or your terminal in this directory:
```bash
npm start
```
Then visit:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Start / Pause Pomodoro Timer (on Timer tab) |
| `Space` or `Enter` | Flip Flashcard (on Flashcard tab) |
| `Right Arrow (→)` | Next Flashcard |
| `Left Arrow (←)` | Previous Flashcard |
| `M` | Mark Flashcard as Mastered |
| `R` | Mark Flashcard as Needs Review |
