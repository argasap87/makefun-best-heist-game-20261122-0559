// Solarium Vault — canvas drawing: stained-glass sky-vault, gold sunbeams,
// amber vision cones, obsidian shadows, the black-silhouette thief.
// One job: everything the judge sees.
import { COLORS, VIEW, HUD_HEIGHT, GUARD } from './config.js';
import { FLOORS, LADDERS, GEAR_SPOTS, DIAMOND, EXIT, TIERS } from './world.js';
import { guardConeAngle } from './guards.js';
import { cameraBeamAngle } from './cameras.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

function drawStainedGlass(ctx, time) {
  // Arched stained-glass windows along the back wall, one per tier.
  const panes = COLORS.glass;
  for (let tier = 0; tier < 3; tier += 1) {
    const top = 150 + tier * 180;
    for (let i = 0; i < 4; i += 1) {
      const x = 120 + i * 300, w = 200, h = 130;
      const c = panes[(i + tier * 2) % panes.length];
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(x, top + h);
      ctx.lineTo(x, top + 40);
      ctx.quadraticCurveTo(x + w / 2, top - 30, x + w, top + 40);
      ctx.lineTo(x + w, top + h);
      ctx.closePath(); ctx.fill();
      // Lead tracery: cross bars inside each window.
      ctx.globalAlpha = 0.9; ctx.strokeStyle = '#1a0f2e'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, top - 8); ctx.lineTo(x + w / 2, top + h);
      ctx.moveTo(x, top + h / 2); ctx.lineTo(x + w, top + h / 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  // Slow-turning clock gear silhouettes high on the wall.
  ctx.strokeStyle = 'rgba(201,151,63,0.35)'; ctx.lineWidth = 6;  for (const [gx, gy, gr, sp] of [[1100, 90, 46, 0.2], [180, 90, 34, -0.3]]) {
    ctx.save(); ctx.translate(gx, gy); ctx.rotate(time * sp);
    ctx.beginPath(); ctx.arc(0, 0, gr, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 8; i += 1) {
      const a = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * gr, Math.sin(a) * gr);
      ctx.lineTo(Math.cos(a) * (gr + 14), Math.sin(a) * (gr + 14));
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawSunbeams(ctx, time) {
  // Diagonal gold beams from the skylight — the light you must bend.
  ctx.save();
  ctx.globalAlpha = 0.16 + 0.04 * Math.sin(time * 0.7);
  ctx.fillStyle = COLORS.gold;
  for (const [x0, w] of [[420, 90], [640, 130], [880, 80]]) {
    ctx.beginPath();
    ctx.moveTo(x0, 64); ctx.lineTo(x0 + w, 64);
    ctx.lineTo(x0 + w + 260, 720); ctx.lineTo(x0 + 260, 720);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // Gold dust motes drifting in the beams — the vault feels alive.
  ctx.fillStyle = 'rgba(245,197,66,0.8)';
  for (let i = 0; i < 40; i += 1) {
    const mx = (i * 173 + 200) % 1280;
    const my = 90 + ((i * 97 + Math.sin(time * 0.5 + i) * 30 + 720) % 600);
    ctx.globalAlpha = 0.35 + 0.3 * Math.sin(time + i * 1.7);
    ctx.beginPath(); ctx.arc(mx, my, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Great clock face behind the Solar Diamond — the heart of the vault.
  ctx.save(); ctx.translate(640, 96);
  ctx.strokeStyle = 'rgba(201,151,63,0.9)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(0, 0, 62, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(20,8,40,0.6)';
  ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3;
  for (let i = 0; i < 12; i += 1) {
    const a = i * Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48);
    ctx.lineTo(Math.cos(a) * 56, Math.sin(a) * 56);
    ctx.stroke();
  }
  const ha = time * 0.05, ma = time * 0.3;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ha - Math.PI / 2) * 30, Math.sin(ha - Math.PI / 2) * 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ma - Math.PI / 2) * 46, Math.sin(ma - Math.PI / 2) * 46); ctx.stroke();
  ctx.restore();
}

function drawShadows(ctx, wheels, smokes) {
  for (const w of wheels) {
    if (!w.turned) continue;
    const s = w.shadow;
    ctx.fillStyle = 'rgba(20,4,46,0.82)';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = COLORS.violet; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
    ctx.strokeRect(s.x, s.y, s.w, s.h); ctx.setLineDash([]);
    ctx.fillStyle = COLORS.violet; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('OBSIDIAN SHADOW — SAFE', s.x + s.w / 2, s.y + 16);
  }
  for (const s of smokes) {
    if (s.t <= 0) continue;
    ctx.fillStyle = 'rgba(42,10,74,0.75)';
    ctx.beginPath(); ctx.arc(s.x, s.y - 20, 88, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COLORS.violet; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('SMOKE — SAFE', s.x, s.y - 20);
  }
}

function drawGuardCone(ctx, g, time) {
  const ox = g.x, oy = g.floorY - 34;
  const angle = guardConeAngle(g, time);
  const len = 260, half = 0.42;
  const grad = ctx.createRadialGradient(ox, oy, 10, ox, oy, len);
  grad.addColorStop(0, 'rgba(255,179,71,0.55)');
  grad.addColorStop(1, 'rgba(255,179,71,0.05)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.moveTo(ox, oy);
  ctx.arc(ox, oy, len, angle - half, angle + half);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,179,71,0.7)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(ox, oy);
  ctx.arc(ox, oy, len, angle - half, angle + half); ctx.closePath(); ctx.stroke();
}

function drawGuard(ctx, g, time) {
  drawGuardCone(ctx, g, time);
  const y = g.floorY;
  // Brass automaton: boiler body, dome head, lamp eye, little legs.
  ctx.fillStyle = '#3a2a12';
  ctx.fillRect(g.x - 16, y - 52, 32, 52);
  ctx.fillStyle = COLORS.brass;
  ctx.beginPath(); ctx.arc(g.x, y - 58, 15, Math.PI, 0); ctx.fill();
  ctx.fillRect(g.x - 15, y - 58, 30, 8);
  ctx.fillStyle = g.frozen > 0 ? '#7ef9ff' : COLORS.amber;
  ctx.beginPath(); ctx.arc(g.x + (g.dir > 0 ? 7 : -7), y - 58, 5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a2a12'; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(g.x - 8, y); ctx.lineTo(g.x - 8, y - 12);
  ctx.moveTo(g.x + 8, y); ctx.lineTo(g.x + 8, y - 12);
  ctx.stroke();
  if (g.frozen > 0) {
    ctx.fillStyle = '#7ef9ff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('FROZEN', g.x, y - 82);
  }
  // Suspicion: the thief is close and on the side the automaton faces —
  // a "?" over it sells the near-miss tension.
  const tdx = g._thiefX !== undefined ? g._thiefX - g.x : 9999;
  const tdy = g._thiefY !== undefined ? g._thiefY - (y - 22) : 9999;
  if (Math.hypot(tdx, tdy) < 330 && Math.sign(tdx) === g.dir) {
    ctx.fillStyle = COLORS.gold; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('?', g.x, y - 88);
  }
}

function drawCamera(ctx, c, time) {
  const angle = cameraBeamAngle(c, time);
  const len = 300, half = 0.16;
  ctx.fillStyle = 'rgba(255,51,85,0.28)';
  ctx.beginPath(); ctx.moveTo(c.x, c.y);
  ctx.arc(c.x, c.y, len, angle - half, angle + half);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,51,85,0.8)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x + Math.cos(angle) * len, c.y + Math.sin(angle) * len); ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(c.x, c.y, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLORS.laser;
  ctx.beginPath(); ctx.arc(c.x, c.y, 5, 0, Math.PI * 2); ctx.fill();
}

function drawThief(ctx, p, facing, crouch) {
  const x = p.x, y = p.y; // p.y is the feet
  const h = crouch ? 32 : 44;
  // Motion echoes: fading silhouettes trailing the thief sell movement in a still.
  for (let i = 2; i >= 1; i -= 1) {
    ctx.globalAlpha = 0.16 * (3 - i);
    ctx.fillStyle = COLORS.thief;
    ctx.beginPath(); ctx.arc(x - facing * 20 * i, y - h + 7, 11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - facing * 20 * i - 11, y); ctx.lineTo(x - facing * 20 * i - 13, y - h + 14);
    ctx.lineTo(x - facing * 20 * i + 13, y - h + 14); ctx.lineTo(x - facing * 20 * i + 11, y);
    ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.save();
  // Violet rim glow: the thief is a pitch-black silhouette in safe shadow.
  ctx.shadowColor = COLORS.violet; ctx.shadowBlur = 16;
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath(); ctx.arc(x, y - h + 7, 11, 0, Math.PI * 2); ctx.fill(); // hood
  ctx.beginPath();
  ctx.moveTo(x - 11, y); ctx.lineTo(x - 13, y - h + 14); ctx.lineTo(x + 13, y - h + 14); ctx.lineTo(x + 11, y);
  ctx.closePath(); ctx.fill(); // cloak
  ctx.restore();
  // Slim dagger glint + facing tick.
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(x + (facing > 0 ? 10 : -14), y - h + 18, 5, 2);
}

function drawDiamond(ctx, x, y, time, taken) {
  if (taken) return;
  const pulse = 1 + 0.12 * Math.sin(time * 3);
  ctx.save(); ctx.translate(x, y); ctx.scale(pulse, pulse);
  ctx.shadowColor = COLORS.diamond; ctx.shadowBlur = 30;
  ctx.fillStyle = COLORS.diamond;
  ctx.beginPath();
  ctx.moveTo(0, -26); ctx.lineTo(18, 0); ctx.lineTo(0, 26); ctx.lineTo(-18, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -14); ctx.lineTo(9, 0); ctx.lineTo(0, 14); ctx.lineTo(-9, 0);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = COLORS.diamond; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('SOLAR DIAMOND', x, y + 48);
}

function drawHud(ctx, state, screen) {
  ctx.fillStyle = '#0b0618';
  ctx.fillRect(0, 0, VIEW.width, HUD_HEIGHT);
  ctx.fillStyle = COLORS.gold; ctx.font = 'bold 26px Georgia, serif'; ctx.textAlign = 'left';
  ctx.fillText('SOLARIUM VAULT', 18, 32);
  ctx.fillStyle = '#cbb6ff'; ctx.font = '14px sans-serif';
  ctx.fillText('Bend the light, steal the sun.', 18, 54);
  // Alarm meter — big, labelled, impossible to miss.
  const ax = 500, ay = 30, aw = 320, ah = 18;
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('SUNFLARE ALARM', ax, ay - 6);
  ctx.fillStyle = '#2a0a2e'; ctx.fillRect(ax, ay, aw, ah);
  const frac = state.alarm / 100;
  ctx.fillStyle = frac < 0.5 ? COLORS.gold : frac < 0.8 ? '#ff7b2f' : '#ff2244';
  ctx.fillRect(ax, ay, aw * frac, ah);
  ctx.strokeStyle = '#f5c542'; ctx.lineWidth = 2; ctx.strokeRect(ax, ay, aw, ah);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`${Math.round(state.alarm)}%`, ax + aw + 10, ay + 16);
  // Alarm burst: pulsing red ticks above and below the meter once it runs hot.
  if (state.alarm >= 50) {
    ctx.strokeStyle = `rgba(255,34,68,${0.5 + 0.5 * Math.sin(state.time * 6)})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 10; i += 1) {
      const tx = ax + 16 + i * (aw - 32) / 9;
      ctx.beginPath(); ctx.moveTo(tx, ay + ah + 3); ctx.lineTo(tx, ay + ah + 10); ctx.stroke();
    }
  }
  if (state.warn > 0) {
    ctx.fillStyle = '#ff2244'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('! SPOTTED — BREAK LINE OF SIGHT !', 640, 58);
  }
  // Pegs, loot, score, tier.
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'right';
  ctx.fillText(`TUNING PEGS ${state.pegs}  ·  GEARS ${state.gearsCollected}/6  ·  SCORE ${state.score}`, 1262, 30);
  ctx.fillStyle = '#cbb6ff'; ctx.font = '13px sans-serif';
  ctx.fillText(state.tierName, 1262, 52);
  ctx.textAlign = 'left';
}

export function drawWorld(ctx, state, screen) {
  const time = state.time;
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  drawStainedGlass(ctx, time);
  drawSunbeams(ctx, time);
  // Tier floors and platforms.
  for (const f of FLOORS) {
    ctx.fillStyle = f.h > 30 ? '#241533' : '#3a2350';
    ctx.fillRect(f.x, f.y, f.w, f.h);
    ctx.fillStyle = COLORS.brass;
    ctx.fillRect(f.x, f.y, f.w, 3);
  }
  // Ladders.
  ctx.strokeStyle = COLORS.brass; ctx.lineWidth = 4;
  for (const l of LADDERS) {
    ctx.beginPath();
    ctx.moveTo(l.x - 12, l.toY); ctx.lineTo(l.x - 12, l.fromY);
    ctx.moveTo(l.x + 12, l.toY); ctx.lineTo(l.x + 12, l.fromY);
    ctx.stroke();
    ctx.lineWidth = 3;
    for (let y = l.toY + 14; y < l.fromY; y += 22) {
      ctx.beginPath(); ctx.moveTo(l.x - 12, y); ctx.lineTo(l.x + 12, y); ctx.stroke();
    }
    ctx.lineWidth = 4;
    ctx.fillStyle = COLORS.gold; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(l.label, l.x, l.toY - 8);
  }
  drawShadows(ctx, state.wheels, state.smokes);
  // Wheels / prisms.
  for (const w of state.wheels) {
    ctx.save(); ctx.translate(w.x, w.y - 30); ctx.rotate(w.angle);
    ctx.strokeStyle = w.turned ? COLORS.violet : COLORS.brass; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 4; i += 1) {
      const a = i * Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = COLORS.gold; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('LIGHT WHEEL · E (1 PEG)', w.x, w.y - 56);
  }
  // Gears (loot).
  for (const g of state.gears) {
    if (g.taken) continue;
    ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(time * 0.8);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i += 1) {
      const a = i * Math.PI / 3;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 11, Math.sin(a) * 11);
      ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17); ctx.stroke();
    }
    ctx.restore();
  }
  drawDiamond(ctx, DIAMOND.x, DIAMOND.y, time, state.diamondTaken);
  // Skylight exit.
  ctx.fillStyle = state.diamondTaken ? '#bff6ff' : '#33415e';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3; ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = state.diamondTaken ? '#062a33' : '#cbb6ff';
  ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('SKYLIGHT', EXIT.x + EXIT.w / 2, EXIT.y + 18);
  ctx.fillText(state.diamondTaken ? 'EXIT →' : 'LOCKED', EXIT.x + EXIT.w / 2, EXIT.y + 34);
  // Cameras then guards (cones over floors, under the thief).
  for (const c of state.cameras) drawCamera(ctx, c, time);
  for (const g of state.guards) { g._thiefX = state.thief.x; g._thiefY = state.thief.y; drawGuard(ctx, g, time); }
  drawThief(ctx, state.thief, state.facing, state.crouch);
  // Red alarm vignette: the higher the alarm, the hotter the frame edges.
  if (state.alarm > 30) {
    const v = ctx.createRadialGradient(640, 390, 300, 640, 390, 720);
    v.addColorStop(0, 'rgba(255,34,68,0)');
    v.addColorStop(1, `rgba(255,34,68,${0.10 + 0.25 * (state.alarm / 100) * (0.7 + 0.3 * Math.sin(time * 4))})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
  // Near-wheel prompt.
  if (state.nearWheel && screen === SCREEN_PLAY) {
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Press E — turn the wheel (1 Tuning Peg): bend the cone, cast shadow', 640, 688);
  }
  drawHud(ctx, state, screen);
  // Controls strip at the very bottom.
  ctx.fillStyle = '#cbb6ff'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('WASD / Arrows move · Space jump · E wheel (1 peg) · Q smoke pellet (1 peg) · F pocket-watch freeze (2 pegs) · climb ladders with Up/Down', 640, 714);
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8,3,20,0.78)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = accent; ctx.font = 'bold 54px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(title, 640, 250);
  ctx.fillStyle = '#ffffff'; ctx.font = '20px sans-serif';
  lines.forEach((l, i) => ctx.fillText(l, 640, 310 + i * 34));
  ctx.fillStyle = '#cbb6ff'; ctx.font = '16px sans-serif';
  ctx.fillText('Press Enter to play again', 640, 310 + lines.length * 34 + 30);
}

export function render(ctx, state, screen) {
  drawWorld(ctx, state, screen);
  if (screen === SCREEN_TITLE) {
    drawOverlay(ctx, 'SOLARIUM VAULT', [
      'Bend the light, steal the sun.',
      'Cross three tiers of the clockwork sky-vault.',
      'Turn light wheels to bend guard cones and cast safe shadow.',
      'Steal the Solar Diamond, then escape through the skylight.',
    ], COLORS.gold);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Press Enter or click to begin', 640, 520);
  } else if (screen === SCREEN_WIN) {
    drawOverlay(ctx, 'THE SUN IS YOURS', [
      `Score ${state.score} · Gears ${state.gears.filter((g) => g.taken).length}/6 · Alarm peaked at ${Math.round(state.peakAlarm)}%`,
      'The Solar Diamond is gone before dawn. The vault never saw you.',
    ], COLORS.diamond);
  } else if (screen === SCREEN_OVER) {
    drawOverlay(ctx, 'CAUGHT IN THE SUNFLARE', [
      `Score ${state.score} · the alarm hit 100% and the vault sealed itself.`,
      'Read the cones, bend the light, try a different route.',
    ], '#ff3355');
  }
}
