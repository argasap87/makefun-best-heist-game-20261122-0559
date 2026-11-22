// Solarium Vault — sweeping laser cameras on the ceilings. One job: the
// red beams that punish a careless crossing.
import { CAMERA } from './config.js';

export function makeCameras() {
  return [
    { id: 'C1', x: 430, y: 470, baseAngle: Math.PI / 2, phase: 0.0 },
    { id: 'C2', x: 850, y: 470, baseAngle: Math.PI / 2, phase: 1.6 },
    { id: 'C3', x: 640, y: 290, baseAngle: Math.PI / 2, phase: 0.8 },
    { id: 'C4', x: 1080, y: 118, baseAngle: Math.PI / 2, phase: 2.4 },
  ];
}

export function cameraBeamAngle(c, time) {
  return c.baseAngle + Math.sin((time + c.phase) / CAMERA.sweepSeconds * Math.PI * 2) * 0.5;
}

export function pointInCameraBeam(c, px, py, time) {
  const dx = px - c.x, dy = py - c.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CAMERA.beamLength || dist < 4) return dist < 4;
  const angle = cameraBeamAngle(c, time);
  let diff = Math.atan2(dy, dx) - angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) < CAMERA.beamHalfAngle;
}

export function anyCameraSees(cameras, px, py, time) {
  for (const c of cameras) if (pointInCameraBeam(c, px, py, time)) return c;
  return null;
}
