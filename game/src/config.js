// Solarium Vault — tuning constants. One job: every number the game balances on.
export const VIEW = { width: 1280, height: 720 };
export const HUD_HEIGHT = 64;
export const STEP = 1 / 60;
export const THIEF = {
  width: 26, height: 44, speed: 230, jumpSpeed: 560, gravity: 1500,
  startX: 90, startY: 600,
};
export const ALARM = {
  warnSeconds: 0.8, risePerSecond: 26, laserRisePerSecond: 34,
  decayPerSecond: 4, shadowDecayPerSecond: 12, max: 100,
};
export const TOOLS = {
  startPegs: 6, wheelCost: 1, smokeCost: 1, freezeCost: 2,
  smokeSeconds: 4, freezeSeconds: 3,
};
export const GUARD = { speed: 55, coneLength: 260, coneHalfAngle: 0.42, sweepSeconds: 3.2 };
export const CAMERA = { beamLength: 300, beamHalfAngle: 0.16, sweepSeconds: 2.6 };
export const LOOT = { gearsTotal: 6, gearScore: 100, diamondScore: 1000 };
export const COLORS = {
  bg: '#120a24', glass: ['#c0392b', '#2471a3', '#d4ac0d', '#1e8449', '#8e44ad', '#e67e22'],
  gold: '#f5c542', amber: '#ffb347', shadow: '#2a0a4a', violet: '#a86bff',
  thief: '#050208', brass: '#c9973f', laser: '#ff3355', diamond: '#7ef9ff',
};
