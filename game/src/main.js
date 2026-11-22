// Solarium Vault — game loop and rules: move, climb, hide, steal, escape.
// One job: the state machine that ties the other files together.
import { VIEW, STEP, THIEF, ALARM, TOOLS, LOOT } from './config.js';
import { FLOORS, GEAR_SPOTS, DIAMOND, EXIT, tierNameForY, floorTopAt, ladderAt } from './world.js';
import { makeGuards, stepGuards, anyGuardSees, freezeGuards, bendNearestGuardCone } from './guards.js';
import { makeWheels, nearestWheel, turnWheel, inShadow, makeSmokes, dropSmoke, stepSmokes } from './prisms.js';
import { makeCameras, anyCameraSees } from './cameras.js';
import { makeInput, attachInput, consumePresses } from './input.js';
import { render, SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN, SCREEN_OVER } from './render.js';
import { stageShot } from './shots.js';
import { playGear, playDiamond, playWheel, playWarn, playAlarm, playWin, unlockAudio } from './audio.js';

export function freshState() {
  return {
    time: 0, screen: SCREEN_TITLE,
    thief: { x: THIEF.startX, y: THIEF.startY, vx: 0, vy: 0, onGround: true },
    facing: 1, crouch: false,
    guards: makeGuards(), wheels: makeWheels(), cameras: makeCameras(), smokes: makeSmokes(),
    gears: GEAR_SPOTS.map((g) => ({ ...g, taken: false })),
    gearsCollected: 0, diamondTaken: false, pegs: TOOLS.startPegs,
    alarm: 0, peakAlarm: 0, warn: 0, spotted: false,
    score: 0, nearWheel: null, won: false, over: false,
    tierName: 'TIER 1 · BRASS GALLERY', message: '',
  };
}

// One fixed step of the live game. Returns an event bitmask (see world.js).
export function stepGame(state, input, dt) {
  const p = state.thief;
  const presses = consumePresses(input);
  state.time += dt;
  if (state.screen !== SCREEN_PLAY) return 0;
  let events = 0;

  // Ladders: Up/Down while overlapping climbs between tiers.
  const ladder = ladderAt(p.x, p.y);
  if (ladder && (input.up || input.down)) {
    p.y += (input.down ? 1 : -1) * 160 * dt;
    p.y = Math.max(ladder.toY, Math.min(ladder.fromY, p.y));
    p.vy = 0; p.onGround = true;
  } else {
    // Horizontal move + gravity platformer.
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    p.vx = dir * THIEF.speed;
    if (dir !== 0) state.facing = dir;
    p.x = Math.max(14, Math.min(VIEW.width - 14, p.x + p.vx * dt));
    if (input.jump && p.onGround) { p.vy = -THIEF.jumpSpeed; p.onGround = false; }
    p.vy += THIEF.gravity * dt;
    p.y += p.vy * dt;
    const top = floorTopAt(p.x, p.y);
    if (top !== null && p.vy >= 0 && p.y >= top - 1) {
      p.y = top; p.vy = 0; p.onGround = true;
    } else if (p.y > 720) { p.y = 660; p.vy = 0; p.onGround = true; }
    else p.onGround = false;
  }
  state.crouch = input.down && !ladder && p.onGround;

  // Tools: wheel, smoke, freeze — each costs Tuning Pegs.
  state.nearWheel = nearestWheel(state.wheels, p.x, p.y);
  if (presses.interact && state.nearWheel) {
    if (turnWheel(state.nearWheel, state)) {
      bendNearestGuardCone(state.guards, state.nearWheel.x, state.nearWheel.y);
      playWheel();
    }
  }
  if (presses.smoke) { if (dropSmoke(state.smokes, state, p.x, p.y - 20)) playWheel(); }
  if (presses.freeze && state.pegs >= TOOLS.freezeCost) {
    state.pegs -= TOOLS.freezeCost;
    freezeGuards(state.guards, TOOLS.freezeSeconds);
    playWheel();
  }

  stepGuards(state.guards, dt, state.time);
  stepSmokes(state.smokes, dt);

  // Loot: gears, then the Solar Diamond, then the skylight exit.
  for (const g of state.gears) {
    if (!g.taken && Math.hypot(g.x - p.x, g.y - (p.y - 22)) < 34) {
      g.taken = true; state.gearsCollected += 1;
      state.score += LOOT.gearScore; events |= 4; playGear();
    }
  }
  if (!state.diamondTaken && Math.hypot(DIAMOND.x - p.x, DIAMOND.y - (p.y - 22)) < 48) {
    state.diamondTaken = true; state.score += LOOT.diamondScore;
    events |= 8; playDiamond();
  }
  if (state.diamondTaken && p.x > EXIT.x && p.x < EXIT.x + EXIT.w && p.y < EXIT.y + EXIT.h + 20 && p.y > 60) {
    state.screen = SCREEN_WIN; state.won = true; events |= 1; playWin();
    return events;
  }

  // Detection: cones and laser beams. Shadow hides you; a grace warning
  // comes first, so being caught is fair, never instant.
  const centre = { x: p.x, y: p.y - 22 };
  const hidden = inShadow(state.wheels, state.smokes, centre.x, centre.y);
  const seenByGuard = hidden ? null : anyGuardSees(state.guards, centre.x, centre.y, state.time);
  const seenByCamera = hidden ? null : anyCameraSees(state.cameras, centre.x, centre.y, state.time);
  if (seenByGuard || seenByCamera) {
    if (state.warn <= 0 && !state.spotted) { state.warn = ALARM.warnSeconds; playWarn(); }
    state.spotted = true;
    if (state.warn > 0) state.warn -= dt;
    else {
      state.alarm += (seenByCamera ? ALARM.laserRisePerSecond : ALARM.risePerSecond) * dt;
      if (Math.random() < dt * 2) playAlarm();
    }
  } else {
    state.spotted = false; state.warn = 0;
    state.alarm -= (hidden ? ALARM.shadowDecayPerSecond : ALARM.decayPerSecond) * dt;
  }
  state.alarm = Math.max(0, Math.min(ALARM.max, state.alarm));
  state.peakAlarm = Math.max(state.peakAlarm, state.alarm);
  if (state.alarm >= ALARM.max) {
    state.screen = SCREEN_OVER; state.over = true; events |= 2; playAlarm();
  }
  state.tierName = tierNameForY(p.y);
  return events;
}

function boot() {
  const canvas = document.getElementById('game');
  canvas.width = VIEW.width; canvas.height = VIEW.height;
  const ctx = canvas.getContext('2d');
  const input = makeInput();
  attachInput(input, canvas);
  const state = freshState();
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    state.screen = stageShot(shot, state);
  }
  let last = performance.now();
  let acc = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (state.screen === SCREEN_PLAY) {
      acc += dt;
      while (acc >= STEP) { stepGame(state, input, STEP); acc -= STEP; }
    } else if ((input.interactPressed || input.mouseClicked) && (state.screen === SCREEN_TITLE || state.screen === SCREEN_WIN || state.screen === SCREEN_OVER)) {
      unlockAudio();
      const s = freshState();
      Object.assign(state, s);
      state.screen = SCREEN_PLAY;
      input.interactPressed = false; input.mouseClicked = false;
    }
    if (state.screen === SCREEN_TITLE && (input.interactPressed || input.mouseClicked)) {
      unlockAudio();
      state.screen = SCREEN_PLAY;
      input.interactPressed = false; input.mouseClicked = false;
    }
    render(ctx, state, state.screen);
    requestAnimationFrame(frame);
  }
  // Keep the title screen alive even before the first keypress.
  render(ctx, state, state.screen);
  requestAnimationFrame(frame);
}

document.addEventListener('DOMContentLoaded', boot);
