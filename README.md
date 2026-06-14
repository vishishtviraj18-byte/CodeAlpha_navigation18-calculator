# 🧮 Navigation 18 Calculator

A modern, production-ready **Calculator Web App** built with pure **HTML, CSS, and JavaScript** — no frameworks, no dependencies. Designed with a premium **Glassmorphism dark/light theme**, smooth animations, calculation history, and full keyboard support.

> Built as part of the **CodeAlpha Frontend Development Internship Program.**

---

---

## ✨ Features

### 🎨 UI / Design
- Premium **Glassmorphism** styling with animated background orbs
- **Dark & Light mode** toggle with smooth transition
- Responsive layout — works on mobile, tablet, and desktop
- Smooth **hover, click, and result-pop animations**
- CSS Grid button layout with active operator highlight

### 🔢 Calculator
- Basic arithmetic — `+` `-` `×` `÷`
- Percentage `%`
- Decimal point support
- Clear `C` and Backspace `⌫`
- **Chain calculations** (e.g. `5 + 3 × 2`)
- **Divide-by-zero** error handling
- Floating-point precision correction (fixes `0.1 + 0.2` drift)
- Input length cap (max 15 digits)

### 📜 History Panel
- Stores up to **50 calculations**
- Shows expression, result, and timestamp
- Click any history entry to **restore it** to the display
- One-click **Clear History**

### ⌨️ Keyboard Support

| Key | Action |
|-----|--------|
| `0–9` | Number input |
| `+` `-` `*` `/` | Operators |
| `.` | Decimal |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete last digit |
| `Escape` or `C` | Clear all |
| `%` | Percentage |

---

## 📂 Project Structure

```
navigation18-calculator/
├── index.html       # Semantic HTML structure with ARIA labels
├── style.css        # Glassmorphism theme, animations, responsive design
└── script.js        # Calculator logic, keyboard support, history, theme toggle
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| **HTML5** | Semantic structure, ARIA accessibility |
| **CSS3** | Glassmorphism, CSS Grid, Custom Properties, Animations |
| **JavaScript (ES6+)** | Calculator logic, DOM manipulation, event handling |

> Zero external libraries or frameworks used.

---

## 🚀 Getting Started

### Run Locally
```bash
git clone https://github.com/<your-username>/navigation18-calculator.git
cd navigation18-calculator
# Open index.html in any browser
open index.html
```

No build step, no `npm install`, no server required.

### Deploy on Netlify
1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from GitHub**
3. Select your repo
4. Build command: *(leave empty)*
5. Publish directory: `/` *(root)*
6. Click **Deploy Site** ✅

---

## 🧠 Code Highlights

```js
// Floating-point precision fix
function formatResult(num) {
  const rounded = parseFloat(num.toPrecision(12));
  return String(rounded);
}

// Chain calculation support
if (state.operator && !state.waitingForNext) {
  const result = calculate(state.prevValue, state.operator, currentNum);
  state.prevValue = parseFloat(formatResult(result));
}
```

---

## ♿ Accessibility

- All buttons have `aria-label` attributes
- Live region (`aria-live`) on display for screen readers
- Full keyboard navigation support
- Respects `prefers-reduced-motion` media query

---

## 🔮 Future Improvements

- [ ] Scientific calculator mode (sin, cos, log, √)
- [ ] Sound effects on button click
- [ ] Swipe gesture support for mobile
- [ ] PWA support (installable offline app)
- [ ] LocalStorage for history persistence

---

## 👤 Author

**Vishisht Viraj**
Frontend Developer Intern — CodeAlpha
[GitHub](https://github.com/<your-username>) · [LinkedIn](https://linkedin.com/in/<your-profile>)

---

## 📄 License

This project is open source under the [MIT License](LICENSE).
