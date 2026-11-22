// Solarium Vault — brass light-steering wheels, prisms and the obsidian
// shadows they cast: the thief's stealth routes. One job: light as a tool.
import { TOOLS } from './config.js';

export function makeWheels() {
  return [
    { id: 'W1', x: 640, y: 660, angle: 0, turned: false, shadow: { x: 520, y: 600, w: 240, h: 60 } },
    { id: 'W2', x: 330, y: 480, angle: 0, turned: false, shadow: { x: 180, y: 420, w: 300, h: 60 } },
    { id: 'W3', x: 950, y: 480, angle: 0, turned: false, shadow: { x: 820, y: 420, w: 300, h: 60 } },
    { id: 'W4', x: 640, y: 300, angle: 0, turned: false, shadow: { x: 480, y: 240, w: 320, h: 60 } },
  ];
}

export function nearestWheel(wheels, px, py) {
  let best = null, bestD = Infinity;
  for (const w of wheels) {
    const d = Math.hypot(w.x - px, w.y - 30 - py);
    if (d < bestD) { bestD = d; best = w; }
  }
  return bestD < 70 ? best : null;
}

// Turn a wheel: costs one Tuning Peg, rotates its prism, casts its shadow.
export function turnWheel(wheel, state) {
  if (state.pegs < TOOLS.wheelCost) return false;
  state.pegs -= TOOLS.wheelCost;
  wheel.turned = !wheel.turned;
  wheel.angle += Math.PI / 4;
  return true;
}

// Is the thief standing in a cast shadow (turned wheel) or a smoke cloud?
export function inShadow(wheels, smokes, px, py) {
  for (const w of wheels) {
    if (!w.turned) continue;
    const s = w.shadow;
    if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) return true;
  }
  for (const s of smokes) {
    if (s.t > 0 && Math.hypot(px - s.x, py - s.y) < 90) return true;
  }
  return false;
}

export function makeSmokes() { return []; }

export function dropSmoke(smokes, state, px, py) {
  if (state.pegs < TOOLS.smokeCost) return false;
  state.pegs -= TOOLS.smokeCost;
  smokes.push({ x: px, y: py, t: TOOLS.smokeSeconds });
  return true;
}

export function stepSmokes(smokes, dt) {
  for (const s of smokes) s.t -= dt;
}
