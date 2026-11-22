// Solarium Vault — deterministic screenshot scenes behind ?shot=cover|prism|getaway.
// Each one places the real game state (thief, guards, cones, cameras, loot,
// alarm) so the frame is what a short game really looks like; the same
// seed always gives the same frame.
import { SCREEN_PLAY } from './render.js';

function placeThief(state, x, y, facing) {
  state.thief.x = x; state.thief.y = y;
  state.thief.vx = 0; state.thief.vy = 0; state.thief.onGround = true;
  state.facing = facing || 1;
}

// Steer the guards' patrol clocks so the cover frame has two cones crossing
// the thief's tier and one camera beam sweeping low.
function setGuardTime(state, phase) {
  for (const g of state.guards) g.phase = phase + (g.id.charCodeAt(1) % 3) * 0.5;
}

export function stageShot(name, state) {
  state.screen = SCREEN_PLAY;
  state.time = 42.0; // fixed clock: cones, beams and gears sit identically each run
  if (name === 'prism') {
    // The thief turns the tier-2 wheel; its cone bends and shadow is cast.
    placeThief(state, 330, 480, 1);
    const wheel = state.wheels[1];
    wheel.turned = true; wheel.angle = Math.PI / 4;
    state.guards[2].coneBent = 0.9;
    state.alarm = 28; state.pegs = 5;
    state.gears[0].taken = true; state.gearsCollected = 1; state.score = 100;
    setGuardTime(state, 0.9);
    return SCREEN_PLAY;
  }
  if (name === 'getaway') {
    // Diamond stolen, thief at the skylight, alarm climbing high.
    placeThief(state, 1215, 128, 1);
    state.diamondTaken = true;
    state.alarm = 86; state.pegs = 1;
    for (const g of state.gears) g.taken = true;
    state.gearsCollected = 6; state.score = 1600;
    state.wheels[3].turned = true;
    setGuardTime(state, 2.2);
    return SCREEN_PLAY;
  }
  // Cover: mid-heist on tier 2 — thief crouched in cast shadow by a wheel,
  // two guards with amber cones, a camera laser, the diamond glowing above,
  // alarm meter at 45%.
  placeThief(state, 335, 480, 1);
  state.crouch = true;
  state.wheels[1].turned = true; state.wheels[1].angle = Math.PI / 4;
  state.guards[2].coneBent = 0.9;
  state.alarm = 62; state.pegs = 4;
  state.gears[0].taken = true; state.gears[2].taken = true;
  state.gearsCollected = 2; state.score = 200;
  state.time = 42.0;
  // Guard G3 patrols just right of the thief, cone sweeping toward them;
  // G4 patrols the far side of tier 2; G2's cone is visible below.
  state.guards[2].x = 560; state.guards[2].dir = -1;
  state.guards[3].x = 1050; state.guards[3].dir = -1;
  state.guards[1].x = 900; state.guards[1].dir = -1;
  setGuardTime(state, 0.4);
  return SCREEN_PLAY;
}
