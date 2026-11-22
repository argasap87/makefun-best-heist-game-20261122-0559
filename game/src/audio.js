// Solarium Vault — sound, made only with WebAudio oscillators. No audio
// files, no network: every bleep is synthesised here.
let ctx = null;
function audioContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function unlockAudio() { audioContext(); }

function blip(freq, seconds, type, gain) {
  const ac = audioContext();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain || 0.08, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + seconds);
  osc.connect(g); g.connect(ac.destination);
  osc.start(); osc.stop(ac.currentTime + seconds);
}

export function playGear() { blip(880, 0.12, 'triangle', 0.09); blip(1320, 0.1, 'sine', 0.05); }
export function playDiamond() { [660, 880, 1100, 1320].forEach((f, i) => setTimeout(() => blip(f, 0.25, 'sine', 0.08), i * 90)); }
export function playWheel() { blip(220, 0.18, 'square', 0.05); blip(330, 0.18, 'square', 0.05); }
export function playWarn() { blip(440, 0.15, 'sawtooth', 0.06); }
export function playAlarm() { blip(180, 0.4, 'sawtooth', 0.09); }
export function playWin() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.3, 'triangle', 0.09), i * 120)); }
export function playStep() { blip(140, 0.05, 'sine', 0.02); }
