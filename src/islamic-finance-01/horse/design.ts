// FINANCE HORSE — character design system (internal working name; no name
// appears in the video). Every shot uses these colours and proportions so the
// character stays recognisable: chestnut fur, darker mane, navy blazer, white
// shirt, emerald tie, a small gold tie bar.
//
// Rig space: 600 × 900 units, half-body (waist up). Head pivot at the neck.
export const HORSE = {
  fur: "#B86A3C",
  furShade: "#9A5530",
  furLight: "#D08A5A",
  muzzle: "#E3B48E",
  muzzleShade: "#C9956D",
  mane: "#5E3320",
  maneLight: "#7A4529",
  hoof: "#4A2E22",
  eyeWhite: "#FFFFFF",
  iris: "#3B2314",
  pupil: "#15100C",
  lid: "#B86A3C",
  brow: "#4A2A1A",
  nostril: "#8E5A3A",
  mouthInside: "#4A1F17",
  tongue: "#D9676C",
  teeth: "#FDF8F2",
  lip: "#A6613B",
  blazer: "#111B32",
  blazerLight: "#1E2C4F",
  blazerLine: "#0B1224",
  shirt: "#FFFFFF",
  shirtShade: "#E6E9F2",
  tie: "#20B66A",
  tieDark: "#086D49",
  gold: "#E6B94A",
  innerEar: "#E7A98B",
  outline: "#2A1810",
} as const;

export const RIG = {
  width: 600,
  height: 900,
  /** neck pivot: the head rotates/tilts around this point */
  neck: { x: 300, y: 560 },
  /** head centre (eyes line) in rig units */
  head: { cx: 300, cy: 300 },
  eyeL: { x: 232, y: 262 },
  eyeR: { x: 368, y: 262 },
  eyeRx: 30,
  eyeRy: 36,
  muzzle: { cx: 300, cy: 452, rx: 112, ry: 112 },
  mouth: { x: 300, y: 498, width: 112, maxOpen: 62 },
  earL: { x: 212, y: 150 },
  earR: { x: 388, y: 150 },
  shoulderL: { x: 122, y: 652 },
  shoulderR: { x: 478, y: 652 },
  upperArm: 126,
  foreArm: 118,
} as const;
