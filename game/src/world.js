// Solarium Vault — the vault itself: three tiers, floors, platforms, ladders,
// loot and the skylight exit. One job: the static shape of every room.
import { VIEW } from './config.js';

export const EVENT_WIN = 1;
export const EVENT_CAUGHT = 2;
export const EVENT_GEAR = 4;
export const EVENT_DIAMOND = 8;
export const EVENT_ALARM = 16;

// Floors are walkable rectangles {x, y, w, h}; the thief stands on their tops.
export const FLOORS = [
  { x: 0, y: 660, w: 1280, h: 60 },   // Tier 1 — Brass Gallery
  { x: 0, y: 480, w: 1280, h: 18 },   // Tier 2 — Clockwork Nave
  { x: 0, y: 300, w: 1280, h: 18 },   // Tier 3 — Sun Chamber
  { x: 0, y: 128, w: 1280, h: 14 },   // Roof walk by the skylight
  // Mid platforms: the second and third route through each tier.
  { x: 330, y: 580, w: 220, h: 14 },
  { x: 760, y: 580, w: 220, h: 14 },
  { x: 180, y: 400, w: 220, h: 14 },
  { x: 880, y: 400, w: 220, h: 14 },
  { x: 480, y: 220, w: 320, h: 14 },
];

// Ladders join tiers: {x, fromY, toY} — climb with Up/Down while overlapping.
export const LADDERS = [
  { x: 96, fromY: 660, toY: 480, label: 'TIER 1' },
  { x: 1184, fromY: 480, toY: 300, label: 'TIER 2' },
  { x: 96, fromY: 300, toY: 128, label: 'TIER 3' },
];

export const TIERS = [
  { name: 'TIER 1 · BRASS GALLERY', floorY: 660 },
  { name: 'TIER 2 · CLOCKWORK NAVE', floorY: 480 },
  { name: 'TIER 3 · SUN CHAMBER', floorY: 300 },
];

export const GEAR_SPOTS = [
  { x: 420, y: 552 }, { x: 860, y: 552 }, { x: 280, y: 372 },
  { x: 980, y: 372 }, { x: 560, y: 192 }, { x: 760, y: 192 },
];
export const DIAMOND = { x: 640, y: 96 };
export const EXIT = { x: 1180, y: 84, w: 90, h: 44 }; // skylight, top right of roof walk

export function tierNameForY(y) {
  for (let i = TIERS.length - 1; i >= 0; i -= 1) if (y <= TIERS[i].floorY + 4) return TIERS[i].name;
  return TIERS[0].name;
}

export function floorTopAt(x, y) {
  // Highest floor top at or below y that spans x (the floor the thief lands on).
  let best = null;
  for (const f of FLOORS) {
    if (x >= f.x - 4 && x <= f.x + f.w + 4 && f.y >= y - 2 && (best === null || f.y < best)) best = f.y;
  }
  return best;
}

export function ladderAt(x, y) {
  for (const l of LADDERS) {
    if (Math.abs(x - l.x) < 26 && y <= l.fromY + 6 && y >= l.toY - 30) return l;
  }
  return null;
}

export function viewWidth() { return VIEW.width; }
