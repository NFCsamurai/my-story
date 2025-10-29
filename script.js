const parts = [
  { part: 1, code: 'start', content: '<p class="me">I have Built walls wIth people some that i love some that i hate that keep dRagging me back inTo tHem even when im feeling my greatest. I have been in this place called <span class="shadow">home</span> for a long time now i think it finally time i escape this and find a real place to rebel what keeps bringing me back to be where i need to be. </p>', type: 'html' },
  { part: 2, code: 'birth', content: '<p class="me">birth</p>', type: 'html' }
];

const STORAGE_KEY = 'arg_unlocked_parts_simple_v1';

function toHex(str) { return Array.from(new TextEncoder().encode(str)).map(b => b.toString(16).padStart(2,'0')).join(''); }
function normalizeCode(code) { if (!code) return ''; return String(code).trim().toLowerCase().replace(/^0x/, ''); }
function loadUnlocked() { try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); } }
function saveUnlocked(set) { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])); }

function showMessage(msg, ok = true) { const el = document.getElementById('unlock-feedback'); if (!el) return; el.textContent = msg; el.className = ok ? 'feedback-ok' : 'feedback-error'; }

function displayPart(partMeta) {
  const out = document.getElementById('unlocked-area'); if (!out) return; out.innerHTML = ''; const title = document.createElement('h3'); title.textContent = `Part ${partMeta.part}`; out.appendChild(title);
  if (partMeta.type === 'html') { const wrap = document.createElement('div'); wrap.innerHTML = partMeta.content; out.appendChild(wrap); }
  else if (partMeta.type === 'image') { try { const bytes = Uint8Array.from(atob(partMeta.content), c => c.charCodeAt(0)); const blob = new Blob([bytes], { type: 'image/png' }); const url = URL.createObjectURL(blob); const img = document.createElement('img'); img.src = url; img.alt = `Part ${partMeta.part}`; img.style.maxWidth = '100%'; out.appendChild(img); } catch (e) { const p = document.createElement('p'); p.textContent = 'Image data invalid.'; out.appendChild(p); } }
  else { const pre = document.createElement('pre'); pre.style.whiteSpace = 'pre-wrap'; pre.textContent = partMeta.content; out.appendChild(pre); }
}

function tryUnlockSimple(input) {
  const codeInput = normalizeCode(input); if (!codeInput) { showMessage('Enter a code.', false); return; }
  const inputHex = toHex(input);
  for (const p of parts) {
    const stored = normalizeCode(p.code);
    if (codeInput === stored || inputHex === stored || codeInput === toHex(stored)) {
      const unlocked = loadUnlocked(); unlocked.add(p.part); saveUnlocked(unlocked); displayPart(p); showMessage(`Unlocked part ${p.part}`, true); return;
    }
  }
  showMessage('Wrong code or nothing unlocked.', false);
}

function resetProgress() { localStorage.removeItem(STORAGE_KEY); const out = document.getElementById('unlocked-area'); if (out) out.innerHTML = ''; showMessage('Progress cleared.', true); }

document.addEventListener('DOMContentLoaded', () => {
  const unlockBtn = document.getElementById('unlock'); const pwEl = document.getElementById('pw'); if (unlockBtn && pwEl) { unlockBtn.addEventListener('click', () => tryUnlockSimple(pwEl.value)); pwEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') unlockBtn.click(); }); }
});
