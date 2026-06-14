/**
 * ============================================================
 * Navigation 18 Calculator — script.js
 * Author  : CodeAlpha Internship Project
 * Features: Arithmetic, Percentage, History, Theme Toggle,
 *           Keyboard Support, Error Handling, Animations
 * ============================================================
 */

'use strict';

/* ── 1. State ───────────────────────────────────────────────── */
const state = {
  current:       '0',      // value shown on display
  expression:    '',       // full expression string (shown above result)
  prevValue:     null,     // stored operand before operator
  operator:      null,     // pending operator
  waitingForNext: false,   // flag: next digit starts a fresh number
  justCalculated: false,   // flag: "=" was just pressed
  history:       [],       // array of { expr, result, time }
};

/* ── 2. DOM References ─────────────────────────────────────── */
const $ = id => document.getElementById(id);

const displayResult  = $('result');
const displayExpr    = $('expression');
const themeToggle    = $('themeToggle');
const themeIcon      = $('themeIcon');
const historyToggle  = $('historyToggle');
const historyPanel   = $('historyPanel');
const historyList    = $('historyList');
const clearHistoryBtn = $('clearHistory');

/* ── 3. Display Update ─────────────────────────────────────── */

/**
 * Updates the result display with proper formatting.
 * Truncates very long decimals and handles large integers.
 * @param {string} value
 */
function updateDisplay(value) {
  displayResult.classList.remove('error');

  // Format number for display
  let display = value;

  if (!isNaN(parseFloat(value)) && isFinite(value)) {
    const num = parseFloat(value);

    // Handle overflow
    if (Math.abs(num) > 1e15) {
      display = num.toExponential(4);
    } else {
      // Limit decimal places to avoid overflow on screen
      const str = String(value);
      if (str.includes('.') && str.split('.')[1]?.length > 10) {
        display = parseFloat(num.toFixed(10)).toString();
      }
    }
  }

  displayResult.textContent = display;
  state.current = display;
}

/**
 * Show the expression above the result.
 * @param {string} expr
 */
function updateExpression(expr) {
  displayExpr.textContent = expr;
}

/**
 * Show an error message on the result display.
 * @param {string} msg
 */
function showError(msg) {
  displayResult.textContent = msg;
  displayResult.classList.add('error');
  state.current = '0';
  state.expression = '';
  state.prevValue = null;
  state.operator = null;
  state.waitingForNext = false;
  state.justCalculated = false;
}

/**
 * Animate result with a quick pop.
 */
function animateResult() {
  displayResult.classList.remove('pop');
  // Force reflow to restart animation
  void displayResult.offsetWidth;
  displayResult.classList.add('pop');
}

/* ── 4. Core Calculator Logic ──────────────────────────────── */

/**
 * Perform arithmetic between two numbers.
 * @param {number} a
 * @param {string} op
 * @param {number} b
 * @returns {number}
 */
function calculate(a, op, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷':
      if (b === 0) throw new Error('Cannot divide by zero');
      return a / b;
    default:
      throw new Error('Unknown operator');
  }
}

/**
 * Format a number result cleanly (no trailing zeros, precision guard).
 * @param {number} num
 * @returns {string}
 */
function formatResult(num) {
  if (!isFinite(num)) return 'Error';
  // Avoid floating-point drift e.g. 0.1 + 0.2 = 0.30000000004
  const rounded = parseFloat(num.toPrecision(12));
  return String(rounded);
}

/* ── 5. Button Action Handlers ─────────────────────────────── */

/** Handle digit input (0–9) */
function handleDigit(digit) {
  if (state.waitingForNext || state.justCalculated) {
    // Start fresh number (but keep expression if after operator)
    if (state.justCalculated) state.expression = '';
    state.current = digit === '0' ? '0' : digit;
    state.waitingForNext = false;
    state.justCalculated = false;
  } else {
    // Prevent leading zeros (e.g., "007")
    if (state.current === '0' && digit !== '.') {
      state.current = digit;
    } else {
      // Cap input length at 15 chars
      if (state.current.replace('-', '').length >= 15) return;
      state.current += digit;
    }
  }
  updateDisplay(state.current);
}

/** Handle decimal point */
function handleDecimal() {
  if (state.waitingForNext || state.justCalculated) {
    state.current = '0.';
    state.waitingForNext = false;
    state.justCalculated = false;
    updateDisplay(state.current);
    return;
  }
  // Only one decimal allowed per number
  if (state.current.includes('.')) return;
  state.current += '.';
  updateDisplay(state.current);
}

/** Handle operator (+, -, ×, ÷) */
function handleOperator(op) {
  const currentNum = parseFloat(state.current);

  if (state.operator && !state.waitingForNext) {
    // Chain calculation: evaluate previous pending operation
    try {
      const result = calculate(state.prevValue, state.operator, currentNum);
      const formatted = formatResult(result);
      updateDisplay(formatted);
      state.expression = `${formatted} ${op}`;
      state.prevValue = parseFloat(formatted);
    } catch (e) {
      showError(e.message);
      return;
    }
  } else {
    state.prevValue = currentNum;
    state.expression = `${state.current} ${op}`;
  }

  // Highlight the active operator button
  highlightOperator(op);

  state.operator = op;
  state.waitingForNext = true;
  state.justCalculated = false;

  updateExpression(state.expression);
}

/** Handle equals */
function handleEquals() {
  if (state.operator === null || state.waitingForNext) return;

  const currentNum = parseFloat(state.current);
  const fullExpr   = `${state.prevValue} ${state.operator} ${state.current} =`;

  try {
    const result    = calculate(state.prevValue, state.operator, currentNum);
    const formatted = formatResult(result);

    updateExpression(fullExpr);
    updateDisplay(formatted);
    animateResult();

    // Save to history
    addToHistory(fullExpr, formatted);

    // Reset state but remember result for chaining
    state.prevValue     = null;
    state.operator      = null;
    state.waitingForNext = false;
    state.justCalculated = true;
    clearOperatorHighlight();

  } catch (e) {
    showError(e.message);
  }
}

/** Handle percentage */
function handlePercent() {
  const num = parseFloat(state.current);
  if (isNaN(num)) return;
  const result = formatResult(num / 100);
  updateDisplay(result);
  if (state.operator && state.prevValue !== null) {
    state.expression = `${state.prevValue} ${state.operator} ${result}`;
    updateExpression(state.expression);
  }
}

/** Handle clear (C) */
function handleClear() {
  state.current        = '0';
  state.expression     = '';
  state.prevValue      = null;
  state.operator       = null;
  state.waitingForNext = false;
  state.justCalculated = false;
  updateDisplay('0');
  updateExpression('');
  clearOperatorHighlight();
}

/** Handle backspace (⌫) */
function handleBackspace() {
  if (state.waitingForNext || state.justCalculated) {
    handleClear();
    return;
  }
  if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith('-'))) {
    state.current = '0';
  } else {
    state.current = state.current.slice(0, -1);
  }
  updateDisplay(state.current);
}

/* ── 6. Operator Button Highlight ──────────────────────────── */
function highlightOperator(op) {
  clearOperatorHighlight();
  // Find the op button with that value
  document.querySelectorAll('.btn-op').forEach(btn => {
    if (btn.dataset.value === op) btn.classList.add('active-op');
  });
}

function clearOperatorHighlight() {
  document.querySelectorAll('.btn-op').forEach(btn => btn.classList.remove('active-op'));
}

/* ── 7. Button Click Routing ───────────────────────────────── */

/**
 * Dispatch button actions based on data-action attribute.
 * @param {HTMLElement} btn
 */
function dispatchAction(btn) {
  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  switch (action) {
    case 'digit':    handleDigit(value);    break;
    case 'decimal':  handleDecimal();       break;
    case 'operator': handleOperator(value); break;
    case 'equals':   handleEquals();        break;
    case 'percent':  handlePercent();       break;
    case 'clear':    handleClear();         break;
    case 'backspace': handleBackspace();    break;
  }
}

// Delegate click to all calculator buttons
document.querySelector('.btn-grid').addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (btn) dispatchAction(btn);
});

/* ── 8. Keyboard Support ───────────────────────────────────── */
document.addEventListener('keydown', e => {
  // Ignore if user is in a text field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const key = e.key;
  let handled = true;

  if (key >= '0' && key <= '9') {
    handleDigit(key);
    flashKey(`[data-value="${key}"]`);
  } else if (key === '.') {
    handleDecimal();
    flashKey('[data-action="decimal"]');
  } else if (key === '+') {
    handleOperator('+');
    flashKey('[data-value="+"]');
  } else if (key === '-') {
    handleOperator('-');
    flashKey('[data-value="-"]');
  } else if (key === '*') {
    handleOperator('×');
    flashKey('[data-value="×"]');
  } else if (key === '/') {
    e.preventDefault(); // prevent browser quick-find
    handleOperator('÷');
    flashKey('[data-value="÷"]');
  } else if (key === '%') {
    handlePercent();
    flashKey('[data-action="percent"]');
  } else if (key === 'Enter' || key === '=') {
    handleEquals();
    flashKey('[data-action="equals"]');
  } else if (key === 'Backspace') {
    handleBackspace();
    flashKey('[data-action="backspace"]');
  } else if (key === 'Escape' || key === 'c' || key === 'C') {
    handleClear();
    flashKey('[data-action="clear"]');
  } else {
    handled = false;
  }

  if (handled) e.preventDefault();
});

/**
 * Briefly flash a button to indicate keyboard press.
 * @param {string} selector
 */
function flashKey(selector) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.classList.add('active-op');
  setTimeout(() => btn.classList.remove('active-op'), 120);
}

/* ── 9. History ────────────────────────────────────────────── */

/**
 * Add a calculation to history.
 * @param {string} expr
 * @param {string} result
 */
function addToHistory(expr, result) {
  const now  = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const entry = { expr, result, time };

  state.history.unshift(entry); // newest first
  if (state.history.length > 50) state.history.pop(); // cap at 50

  renderHistory();
}

/** Render the history list from state */
function renderHistory() {
  if (state.history.length === 0) {
    historyList.innerHTML = '<li class="history-empty">No calculations yet</li>';
    return;
  }

  historyList.innerHTML = '';
  state.history.forEach((entry, idx) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.setAttribute('aria-label', `${entry.expr} ${entry.result} at ${entry.time}`);
    li.innerHTML = `
      <div class="h-expr">${entry.expr}</div>
      <div class="h-result">${entry.result}</div>
      <div class="h-time">${entry.time}</div>
    `;
    // Click history item to restore result
    li.addEventListener('click', () => {
      handleClear();
      state.current = entry.result;
      updateDisplay(entry.result);
      updateExpression(entry.expr);
    });
    historyList.appendChild(li);
  });
}

/** Clear all history */
clearHistoryBtn.addEventListener('click', () => {
  state.history = [];
  renderHistory();
});

/* ── 10. Theme Toggle ──────────────────────────────────────── */
let isDark = true;

themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeIcon.textContent = isDark ? '☀️' : '🌙';
});

/* ── 11. History Panel Toggle ──────────────────────────────── */
historyToggle.addEventListener('click', () => {
  historyPanel.classList.toggle('open');
});

// Close history panel when clicking outside of it
document.addEventListener('click', e => {
  if (
    historyPanel.classList.contains('open') &&
    !historyPanel.contains(e.target) &&
    e.target !== historyToggle
  ) {
    historyPanel.classList.remove('open');
  }
});

/* ── 12. Init ──────────────────────────────────────────────── */
updateDisplay('0');
updateExpression('');
