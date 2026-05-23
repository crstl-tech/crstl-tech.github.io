/* ============================================================
   Material 3 Expressive Calculator — Logic
   ============================================================ */

'use strict';

// ── DOM refs ──────────────────────────────────────────────────
const resultEl     = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const keypad       = document.querySelector('.keypad');
const themeToggle  = document.getElementById('themeToggle');
const themeIcon    = document.getElementById('themeIcon');
const html         = document.documentElement;

// ── State ─────────────────────────────────────────────────────
let state = {
  current:      '0',   // what's shown in the big display
  previous:     null,  // stored operand (string)
  operator:     null,  // current operator
  justEvaled:   false, // did we just press "="
  resetOnDigit: false, // next digit resets display
};

// ── Helpers ───────────────────────────────────────────────────

function fmt(numStr) {
  const n = parseFloat(numStr);
  if (!isFinite(n)) return numStr;

  // Avoid floating-point noise (e.g. 0.1+0.2)
  const fixed = parseFloat(n.toPrecision(12));
  const str   = String(fixed);

  // If too long, use exponential
  if (str.replace('-', '').replace('.', '').length > 12) {
    return n.toExponential(6);
  }
  return str;
}

function updateDisplay(animate = false) {
  const value = fmt(state.current);

  resultEl.classList.remove('error', 'shrink', 'pop');

  // Shrink large numbers
  if (value.length > 9)  resultEl.classList.add('shrink');

  // Pop animation on result
  if (animate) {
    void resultEl.offsetWidth; // reflow to re-trigger
    resultEl.classList.add('pop');
  }

  resultEl.textContent = value;
  expressionEl.textContent =
    state.previous !== null
      ? `${fmt(state.previous)} ${state.operator}`
      : '';
}

function showError(msg = 'Error') {
  resultEl.textContent = msg;
  resultEl.classList.add('error');
  expressionEl.textContent = '';
  resetState();
}

function resetState() {
  state = {
    current:      '0',
    previous:     null,
    operator:     null,
    justEvaled:   false,
    resetOnDigit: false,
  };
}

// ── Math engine ───────────────────────────────────────────────

function calculate(a, op, b) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  switch (op) {
    case '+': return x + y;
    case '−': return x - y;
    case '×': return x * y;
    case '÷':
      if (y === 0) return null; // division by zero
      return x / y;
    default:  return y;
  }
}

// ── Actions ───────────────────────────────────────────────────

function handleDigit(digit) {
  if (state.resetOnDigit || state.current === '0' && digit !== '.') {
    state.current     = digit;
    state.resetOnDigit = false;
  } else {
    // Don't allow more than 12 chars
    if (state.current.replace('.', '').replace('-', '').length >= 12) return;
    state.current += digit;
  }
  state.justEvaled = false;
  updateDisplay();
}

function handleDot() {
  if (state.resetOnDigit) {
    state.current     = '0.';
    state.resetOnDigit = false;
    updateDisplay();
    return;
  }
  if (state.current.includes('.')) return;
  state.current += '.';
  updateDisplay();
}

function handleOperator(op) {
  // If we have pending operation, evaluate it first
  if (state.operator && !state.resetOnDigit) {
    const result = calculate(state.previous, state.operator, state.current);
    if (result === null) { showError('Can\'t ÷ 0'); return; }
    state.current = String(fmt(result));
    updateDisplay(true);
  }

  state.previous     = state.current;
  state.operator     = op;
  state.resetOnDigit = true;
  state.justEvaled   = false;

  // Highlight active operator key
  document.querySelectorAll('.key--operator').forEach(k => {
    k.classList.toggle('active', k.dataset.value === op);
  });

  expressionEl.textContent = `${fmt(state.previous)} ${op}`;
}

function handleEquals() {
  if (!state.operator || state.previous === null) return;

  const result = calculate(state.previous, state.operator, state.current);
  if (result === null) { showError('Can\'t ÷ 0'); return; }

  expressionEl.textContent =
    `${fmt(state.previous)} ${state.operator} ${fmt(state.current)} =`;

  state.current      = String(result);
  state.previous     = null;
  state.operator     = null;
  state.resetOnDigit = true;
  state.justEvaled   = true;

  // Remove operator highlights
  document.querySelectorAll('.key--operator.active')
    .forEach(k => k.classList.remove('active'));

  updateDisplay(true);
}

function handleClear() {
  resetState();
  resultEl.classList.remove('error', 'shrink', 'pop');
  document.querySelectorAll('.key--operator.active')
    .forEach(k => k.classList.remove('active'));
  updateDisplay();
}

function handleSign() {
  if (state.current === '0') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  updateDisplay();
}

function handlePercent() {
  const val = parseFloat(state.current);
  if (!isFinite(val)) return;

  if (state.operator && state.previous !== null) {
    // 100 + 20% → 100 + 20 (i.e. 20% of 100)
    state.current = String((parseFloat(state.previous) * val) / 100);
  } else {
    state.current = String(val / 100);
  }
  updateDisplay();
}

// ── Ripple effect ─────────────────────────────────────────────

function spawnRipple(btn, e) {
  btn.classList.remove('ripple');
  const rect = btn.getBoundingClientRect();
  const x    = (e.clientX - rect.left) / rect.width  * 100;
  const y    = (e.clientY - rect.top)  / rect.height * 100;
  btn.style.setProperty('--ripple-x', x + '%');
  btn.style.setProperty('--ripple-y', y + '%');
  // tiny reflow trick
  void btn.offsetWidth;
  btn.classList.add('ripple');
}

// ── Event delegation on keypad ────────────────────────────────

keypad.addEventListener('click', (e) => {
  const btn = e.target.closest('.key');
  if (!btn) return;

  spawnRipple(btn, e);

  const { action, value } = btn.dataset;

  switch (action) {
    case 'digit':   handleDigit(value);    break;
    case 'dot':     handleDot();           break;
    case 'operator':handleOperator(value); break;
    case 'equals':  handleEquals();        break;
    case 'clear':   handleClear();         break;
    case 'sign':    handleSign();          break;
    case 'percent': handlePercent();       break;
  }
});

// ── Keyboard support ──────────────────────────────────────────

const KEY_MAP = {
  '0':'0','1':'1','2':'2','3':'3','4':'4',
  '5':'5','6':'6','7':'7','8':'8','9':'9',
  '.':'.',',':'.',
  '+':'+', '-':'−', '*':'×', '/':'÷',
  'Enter':'=', '=':'=',
  'Backspace': 'back',
  'Escape':    'clear',
  '%':         '%',
};

document.addEventListener('keydown', (e) => {
  const mapped = KEY_MAP[e.key];
  if (!mapped) return;
  e.preventDefault();

  // Visually flash the matching key
  const selector = (() => {
    if ('0123456789'.includes(mapped)) return `[data-value="${mapped}"]`;
    if (['+','−','×','÷'].includes(mapped)) return `[data-value="${mapped}"]`;
    if (mapped === '.')   return '[data-action="dot"]';
    if (mapped === '=')   return '[data-action="equals"]';
    if (mapped === 'clear')  return '[data-action="clear"]';
    if (mapped === '%')  return '[data-action="percent"]';
    return null;
  })();

  if (selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.classList.add('ripple');
      el.focus();
      setTimeout(() => el.classList.remove('ripple'), 400);
    }
  }

  if ('0123456789'.includes(mapped))        handleDigit(mapped);
  else if (mapped === '.')                   handleDot();
  else if (['+','−','×','÷'].includes(mapped)) handleOperator(mapped);
  else if (mapped === '=')                   handleEquals();
  else if (mapped === 'clear')               handleClear();
  else if (mapped === '%')                   handlePercent();
  else if (mapped === 'back') {
    if (state.current.length > 1 && !state.resetOnDigit) {
      state.current = state.current.slice(0, -1) || '0';
    } else {
      state.current = '0';
    }
    updateDisplay();
  }
});

// ── Theme toggle ──────────────────────────────────────────────

function applyTheme(theme) {
  html.dataset.theme  = theme;
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeIcon.style.transform = 'rotate(360deg) scale(1.2)';
  setTimeout(() => { themeIcon.style.transform = ''; }, 350);
  try { localStorage.setItem('m3-calc-theme', theme); } catch(_) {}
}

themeToggle.addEventListener('click', () => {
  applyTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
});

// Respect system preference + saved choice
(function initTheme() {
  const saved  = (() => { try { return localStorage.getItem('m3-calc-theme'); } catch(_) { return null; } })();
  const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || prefer);
})();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const saved = (() => { try { return localStorage.getItem('m3-calc-theme'); } catch(_) { return null; } })();
  if (!saved) applyTheme(e.matches ? 'dark' : 'light');
});

// ── Initial render ────────────────────────────────────────────
updateDisplay();
