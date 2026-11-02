import { TUNING } from './content/tuning';
import { createSpeaker } from './view/speech';

type Target = 'Home' | 'WordBook' | 'Parent';

const root = document.getElementById('landing');
let enterCb: ((t: Target) => void) | null = null;
let isReady = false;
let entered = false;
let speaker: ReturnType<typeof createSpeaker> | null = null;

export function showProgress(p: number): void {
  document.getElementById('bar')?.style.setProperty('--p', String(Math.min(1, Math.max(0, p))));
}

/** Loading is over (or gave up): the bar fades and the buttons appear. */
export function ready(): void {
  isReady = true;
  root?.classList.add('ready');
}

export function onEnter(cb: (t: Target) => void): void {
  enterCb = cb;
}

/** Invisible but still in place for settleMs, so the second tap of a double tap cannot reach the scene below. */
export function hideLanding(): void {
  if (!root) return;
  root.style.opacity = '0';
  setTimeout(() => root.remove(), TUNING.landing.settleMs);
}

// Phaser listens on window too; taps on the landing (and its settle time) must never reach it.
for (const ev of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend']) root?.addEventListener(ev, (e) => e.stopPropagation());

function enter(t: Target): void {
  if (!isReady || entered) return; // buttons are hidden until ready; a double tap enters once
  entered = true;
  enterCb?.(t);
}

root?.querySelectorAll<HTMLElement>('[data-go]').forEach((b) => b.addEventListener('click', () => enter(b.dataset.go as Target)));

const mimi = document.getElementById('mimi');
mimi?.addEventListener('animationend', (e) => e.animationName === 'wave' && mimi.classList.remove('wave')); // back to bobbing
let calm: ReturnType<typeof setTimeout> | undefined;
mimi?.addEventListener('click', () => {
  mimi.classList.remove('wave');
  void mimi.offsetWidth; // restart the wave on a repeat tap
  mimi.classList.add('wave', 'happy');
  clearTimeout(calm);
  calm = setTimeout(() => mimi.classList.remove('happy'), TUNING.landing.happyMs);
  try {
    speaker ??= createSpeaker({
      synth: typeof speechSynthesis === 'undefined' ? null : speechSynthesis,
      makeUtterance: (text) => new SpeechSynthesisUtterance(text),
      playFile: () => { throw new Error('no recorded clips on the landing'); },
      setTimer: (ms, fn) => { const id = setTimeout(fn, ms); return () => clearTimeout(id); },
    });
    speaker.say('mimi.hi').catch(() => {}); // speech never blocks the page
  } catch (e) {
    console.error(e);
  }
});
