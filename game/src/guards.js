// Solarium Vault — brass automaton guards: patrols, sweeping vision cones,
// and the fair caught moment (a warning grace before the alarm spikes).
import { GUARD, STEP } from './config.js';

export function makeGuards() {
  return [
    { id: 'G1', x: 300, floorY: 660, minX: 180, maxX: 620, dir: 1, phase: 0.0, frozen: 0, coneBent: 0 },
    { id: 'G2', x: 900, floorY: 660, minX: 700, maxX: 1180, dir: -1, phase: 1.4, frozen: 0, coneBent: 0 },
    { id: 'G3', x: 500, floorY: 480, minX: 240, maxX: 760, dir: 1, phase: 0.7, frozen: 0, coneBent: 0 },
    { id: 'G4', x: 1000, floorY: 480, minX: 820, maxX: 1200, dir: -1, phase: 2.1, frozen: 0, coneBent: 0 },
    { id: 'G5', x: 640, floorY: 300, minX: 380, maxX: 900, dir: 1, phase: 1.0, frozen: 0, coneBent: 0 },
  ];
}

// Current sweep angle of a guard's cone, in radians (0 = facing right).
export function guardConeAngle(g, time) {
  const sweep = Math.sin((time + g.phase) / GUARD.sweepSeconds * Math.PI * 2) * 0.55;
  const base = g.dir > 0 ? 0 : Math.PI;
  return base + sweep + g.coneBent;
}

export function stepGuards(guards, dt, time) {
  for (const g of guards) {
    if (g.frozen > 0) { g.frozen -= dt; continue; }
    g.x += g.dir * GUARD.speed * dt;
    if (g.x > g.maxX) { g.x = g.maxX; g.dir = -1; }
    if (g.x < g.minX) { g.x = g.minX; g.dir = 1; }
  }
}

// Is point (px,py) inside guard g's vision cone right now?
export function pointInGuardCone(g, px, py, time) {
  const ox = g.x, oy = g.floorY - 34; // cone starts at the automaton's lamp-eye
  const dx = px - ox, dy = py - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > GUARD.coneLength || dist < 6) return dist < 6;
  const angle = guardConeAngle(g, time);
  let diff = Math.atan2(dy, dx) - angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) < GUARD.coneHalfAngle;
}

export function anyGuardSees(guards, px, py, time) {
  for (const g of guards) if (pointInGuardCone(g, px, py, time)) return g;
  return null;
}

export function freezeGuards(guards, seconds) {
  for (const g of guards) g.frozen = seconds;
}

// A turned wheel bends the nearest guard's cone away (refracted light).
export function bendNearestGuardCone(guards, wx, wy) {
  let best = null, bestD = Infinity;
  for (const g of guards) {
    const d = Math.hypot(g.x - wx, g.floorY - wy);
    if (d < bestD) { bestD = d; best = g; }
  }
  if (best) best.coneBent = best.coneBent > 0 ? -0.9 : 0.9;
  return best;
}

export function stepSeconds() { return STEP; }
