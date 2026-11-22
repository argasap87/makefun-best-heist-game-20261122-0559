// Solarium Vault — keyboard and mouse input. One job: turn keys and clicks
// into the intent the game loop reads each step.
export function makeInput() {
  return {
    left: false, right: false, up: false, down: false,
    jump: false, interact: false, smoke: false, freeze: false,
    interactPressed: false, smokePressed: false, freezePressed: false,
    mouseX: 0, mouseY: 0, mouseClicked: false,
  };
}

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  Space: 'jump',
  KeyE: 'interact', Enter: 'interact',
  KeyQ: 'smoke',
  KeyF: 'freeze',
};

export function attachInput(input, canvas) {
  window.addEventListener('keydown', (e) => {
    const field = KEYMAP[e.code];
    if (!field) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
    if (field === 'interact' && !input.interact) input.interactPressed = true;
    if (field === 'smoke' && !input.smoke) input.smokePressed = true;
    if (field === 'freeze' && !input.freeze) input.freezePressed = true;
    input[field] = true;
  });
  window.addEventListener('keyup', (e) => {
    const field = KEYMAP[e.code];
    if (field) input[field] = false;
  });
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    input.mouseX = (e.clientX - r.left) * (canvas.width / r.width);
    input.mouseY = (e.clientY - r.top) * (canvas.height / r.height);
  });
  canvas.addEventListener('mousedown', () => { input.mouseClicked = true; });
}

// Edge-triggered actions are consumed once per step by the game loop.
export function consumePresses(input) {
  const out = {
    interact: input.interactPressed, smoke: input.smokePressed,
    freeze: input.freezePressed, click: input.mouseClicked,
  };
  input.interactPressed = false; input.smokePressed = false;
  input.freezePressed = false; input.mouseClicked = false;
  return out;
}
