// QA: the line never teleports, the camera never jumps.
// Run: node --experimental-strip-types scripts/qa-line.ts
import { JOURNEY, JOURNEY_PROBLEMS, camera, tip } from "../src/episodes/ep001/episode.ts";
import { worldToScreen } from "../src/engines/CameraController.ts";
import { DURATION } from "../src/episodes/ep001/world.ts";

let fail = 0;
console.log(`Strokes: ${JOURNEY.length}`);
for (const p of JOURNEY_PROBLEMS) {
  console.log("CONTINUITY", p);
  fail++;
}
let prevWorld = tip(0).p;
let prevCam = camera(0);
let maxTip = { v: 0, f: 0 };
let maxCam = { v: 0, f: 0 };
const offscreen: number[] = [];
for (let f = 1; f < DURATION; f++) {
  const t = tip(f);
  const c = camera(f);
  const jump = Math.hypot(t.p.x - prevWorld.x, t.p.y - prevWorld.y) * c.zoom; // px on screen
  if (jump > maxTip.v) maxTip = { v: jump, f };
  if (jump > 140) {
    console.log(`TIP JUMP f${f}: ${jump.toFixed(1)}px (${t.stroke?.id})`);
    fail++;
  }
  const cj = Math.hypot((c.x - prevCam.x) * c.zoom, (c.y - prevCam.y) * c.zoom) + Math.abs(Math.log(c.zoom / prevCam.zoom)) * 1000 + Math.abs(c.rot - prevCam.rot) * 900;
  if (cj > maxCam.v) maxCam = { v: cj, f };
  const s = worldToScreen(c, t.p);
  if (f > 10 && (s.x < -40 || s.x > 1120 || s.y < -40 || s.y > 1960)) offscreen.push(f);
  prevWorld = t.p;
  prevCam = c;
}
console.log(`max tip step ${maxTip.v.toFixed(1)}px at f${maxTip.f}; max camera step ${maxCam.v.toFixed(1)} at f${maxCam.f}`);
const ranges: string[] = [];
for (let i = 0; i < offscreen.length; i++) {
  let k = i;
  while (k + 1 < offscreen.length && offscreen[k + 1] === offscreen[k] + 1) k++;
  ranges.push(`${offscreen[i]}–${offscreen[k]}`);
  i = k;
}
console.log(`tip off-screen frames: ${ranges.join(", ") || "none"}`);
process.exit(fail ? 1 : 0);
