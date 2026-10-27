// Банан-ведущий в кадре (как в lesson-traktat и BM-018): место по сцене, поза и выражение по
// реплике (плавный переход), рот по озвучке, моргание, «слушает» во время пауз-вопросов.
// BM-024: банан — участник истории: в сценах с walk он проходит по кадру (шаги с
// покачиванием) от своего места к другому; в сценах-разборах надевает очки.
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Banana, MOODS, POSES, blinkAt, mixFace, mixPose, mouthAt, type MoodName, type PoseName } from "../../../../banana-host";
import { FPS } from "../theme";
import type { Timeline } from "../timeline";
import type { HostSpot, Scene } from "../types";

const SPOT: Record<HostSpot, { x: number; y: number; s: number }> = {
  center: { x: 960, y: 1010, s: 1.18 },
  close: { x: 960, y: 1460, s: 2.15 },
  left: { x: 300, y: 1000, s: 0.98 },
  right: { x: 1620, y: 1000, s: 0.98 },
  corner: { x: 170, y: 1040, s: 0.58 },
  off: { x: -320, y: 1040, s: 0.7 },
  // крупный план из-за правого края кадра — для реакций
  peek: { x: 1580, y: 1230, s: 1.55 },
};

const ease = Easing.bezier(0.45, 0, 0.25, 1);

type State = { pose: PoseName; mood: MoodName; t: number };

export const Host: React.FC<{ tl: Timeline; scenes: Scene[] }> = ({ tl, scenes }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // текущая сцена и предыдущая (для перехода места)
  let si = 0;
  while (si + 1 < tl.scenes.length && tl.scenes[si + 1].from <= t) si++;
  const sc = scenes[si];
  const ts = tl.scenes[si];
  const to = SPOT[sc.host];
  const endOf = (i: number) => SPOT[scenes[i].walk ?? scenes[i].host];
  // первая сцена: банан «выныривает» снизу на своё место
  const fromSpot = si > 0 ? endOf(si - 1) : { ...to, y: to.y + 520 };
  const k = si === 0 ? interpolate(t, [0, 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) : interpolate(t, [ts.from, ts.from + 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  // прогулка внутри сцены: после первой реплики, 2.6 с, шагами
  const dest = sc.walk ? SPOT[sc.walk] : to;
  const w0 = ts.lines[0] ? ts.lines[0].speechTo + 0.2 : ts.from + 1;
  const wk = sc.walk ? interpolate(t, [w0, w0 + 2.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) : 0;
  const bx = fromSpot.x + (to.x - fromSpot.x) * k;
  const by = fromSpot.y + (to.y - fromSpot.y) * k;
  const bs = fromSpot.s + (to.s - fromSpot.s) * k;
  const x = bx + (dest.x - to.x) * wk;
  const y = by + (dest.y - to.y) * wk;
  const s = bs + (dest.s - to.s) * wk;
  const walking = wk > 0 && wk < 1;
  const step = walking ? Math.abs(Math.sin(t * Math.PI * 3.2)) * 16 : 0;
  const tilt = walking ? Math.sin(t * Math.PI * 3.2) * 3 * Math.sign(dest.x - to.x) : 0;
  // лёгкий прыжок при перемещении
  const jump = Math.sin(k * Math.PI) * (fromSpot.x !== to.x ? 40 : 0) + step;

  // поза/выражение: последняя начавшаяся реплика (с небольшим опережением)
  const states: State[] = [];
  tl.scenes.forEach((tsc, i) =>
    tsc.lines.forEach((ln, j) => {
      const l = scenes[i].lines[j];
      states.push({ pose: l.pose ?? "idle", mood: l.mood ?? "happy", t: ln.speechFrom - 0.25 });
      if (ln.waitFrom !== undefined) states.push({ pose: "think", mood: "think", t: ln.waitFrom + 0.1 });
    }),
  );
  let cur = 0;
  while (cur + 1 < states.length && states[cur + 1].t <= t) cur++;
  const a = states[Math.max(0, cur - 1)];
  const b = states[cur];
  const mix = cur === 0 ? 1 : interpolate(t, [b.t, b.t + 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const pose = mixPose(POSES[a.pose], POSES[b.pose], mix);
  const face = mixFace(MOODS[a.mood], MOODS[b.mood], mix);

  const m = mouthAt(tl.lines, frame, FPS);
  const blink = blinkAt(t);

  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <ellipse cx={x} cy={y + 4} rx={150 * s} ry={20 * s} fill="#000" opacity={0.08} />
      <g transform={`translate(${x} ${y - jump}) rotate(${tilt}) scale(${s})`}>
        <Banana pose={pose} face={face} mouthOpen={m.open} mouthRound={m.round} blink={blink} t={t} talk={m.speaking} glasses={!!sc.glasses} />
      </g>
    </svg>
  );
};
