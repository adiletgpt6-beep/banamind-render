// Сцена 1 (0–≈5,5 с): хук. Крупно на шырдаке — ярко-красные кроссовки
// на ногах сына. Шнурки сами завязываются в бант покадрово (стоп-моушн),
// вокруг пролетают рабочие блокноты, звенит будильник. Бант готов —
// кроссовки подпрыгивают, наклейка «Мен даярмын!». Камера поднимается
// от кроссовок к лицу мальчика у входной двери: «Мен даярмын! А сиздерчи?»
// — и он поворачивается к родителям (они дома, в глубине комнаты).
import { useCurrentFrame } from "remotion";
import { useLine, useScene } from "../context";
import { Actor, type Place } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { BG14_TEXT } from "../script";
import { HomeBack } from "../sets/Home";
import { Ornament } from "../sets/Apartment";
import { camMove, Shot } from "../shots";
import { C } from "../palette";
import { Sneakers, stopKeys } from "../sneakers";
import { AlarmClock, FLOOR, H, Notebook, SPOT, Sticker } from "./common";

export const HK = { tie0: 6, tie1: 44, hop: 46, sticker: 16 } as const;

const NOTEBOOKS = [
  { y: 260, v: 34, d: 1, color: C.navy, rot: -14, t0: -6 },
  { y: 760, v: -30, d: -1, color: C.yellow, rot: 12, t0: 4 },
  { y: 520, v: 40, d: 1, color: "#9FB3D6", rot: 8, t0: 18 },
  { y: 980, v: -36, d: -1, color: "#FFFFFF", rot: -10, t0: 30 },
];

export const SON_HOOK = (): Place => ({ x: SPOT.son, y: FLOOR, h: H.son });

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const s01 = useLine("s01");
  const cut = Math.max(HK.hop + 8, s01.from - 4);
  const tie = stopKeys(f, HK.tie0, HK.tie1);
  const hop = keys(f, [[HK.hop, 0], [HK.hop + 5, 34], [HK.hop + 10, 0], [HK.hop + 13, 8], [HK.hop + 16, 0]]);
  const ring = 1 - clamp((f - HK.hop) / 6);
  const closeUp = (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#FFFFFF" }}>
      {/* низ стены и шырдак крупно */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 900, background: "linear-gradient(180deg, #FFFFFF, #FBF7EE)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, height: 26, backgroundColor: "#FFFFFF", boxShadow: "0 2px 0 #E6E0D2" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 906, bottom: 0, background: "linear-gradient(180deg, #E4CFAE, #D6BC96)" }} />
      <svg width={1300} height={720} viewBox="0 0 1300 720" style={{ position: "absolute", left: -110, top: 1180 }}>
        <rect x={0} y={0} width={1300} height={720} rx={40} fill="#2A3E74" />
        <rect x={24} y={24} width={1252} height={672} rx={26} fill="none" stroke={C.yellow} strokeWidth={10} strokeDasharray="34 18" />
        <Ornament x={260} y={250} s={1.4} color={C.yellow} />
        <Ornament x={1040} y={250} s={1.4} color={C.yellow} />
        <Ornament x={650} y={470} s={1.0} color="#FFFFFF" />
      </svg>
      {NOTEBOOKS.map((n, i) => {
        const t = f - n.t0;
        const x = n.d > 0 ? -260 + t * n.v : 1100 + t * n.v;
        return x > -300 && x < 1200 ? <Notebook key={i} x={x} y={n.y} rot={n.rot + t * n.d * 2.2} color={n.color} s={0.9} /> : null;
      })}
      <AlarmClock x={850} y={660} f={f} ringing={ring} s={0.9} />
      <Sneakers x={70} y={1430} s={1.32} f={f} tie={tie} legs={LOOKS.son.bottom} bounce={hop} />
    </div>
  );
  // наклон камеры от ног к лицу
  const look = (t: number) => keys(t, [[cut, 0.15], [s01.to - 18, 0.15], [s01.to - 4, 0.75]]);
  const pose = (t: number) => {
    const p = SON_HOOK();
    const open = keys(t, [[cut + 4, 0], [cut + 14, 1], [s01.to - 20, 1], [s01.to - 6, 0.4]]);
    return {
      expr: "smile" as const,
      strapTug: keys(t, [[cut, 0.9], [cut + 10, 0.3]]),
      armL: { target: { x: lerp(p.x - 0.14 * p.h, p.x - 0.36 * p.h, open), y: lerp(p.y - 0.4 * p.h, p.y - 0.62 * p.h, open) }, shape: open > 0.5 ? ("open" as const) : ("relax" as const), elbow: "out" as const },
      armR: { target: { x: lerp(p.x + 0.14 * p.h, p.x + 0.36 * p.h, open), y: lerp(p.y - 0.4 * p.h, p.y - 0.62 * p.h, open) }, shape: open > 0.5 ? ("open" as const) : ("relax" as const), elbow: "out" as const },
      headTilt: keys(t, [[s01.from, 0], [s01.from + 12, -6], [s01.to - 10, -6], [s01.to + 6, 4]]),
      lookY: keys(t, [[s01.to - 16, 0], [s01.to, -0.25]]),
      nod: keys(t, [[s01.from + 2, 0], [s01.from + 8, 4], [s01.from + 14, 0]]),
    };
  };
  const tilt = (t: number) => easeInOut(clamp((t - cut) / 22));
  const cam = {
    x: lerp(SPOT.son, SPOT.son + 30, tilt(f)),
    y: lerp(FLOOR - 120, FLOOR - 0.68 * H.son, tilt(f)),
    zoom: lerp(1.9, 1.55, tilt(f)),
  };
  return (
    <>
      {f < cut ? closeUp : null}
      <Shot f={f} from={cut} to={frames + 1} cam={camMove(f, cut + 22, frames, cam, { ...cam, zoom: 1.62 })}>
        <HomeBack minutes={7 * 60 + 40} />
        <Actor uid="h-son" look="son" f={f} place={SON_HOOK} face={look} pose={pose} role="son" seed={4} />
      </Shot>
      <Sticker f={f} at={HK.sticker} text={BG14_TEXT.hook} y={f < cut ? 300 : 280} />
      {/* лёгкая вспышка-склейка при смене плана */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", opacity: keys(f, [[cut - 2, 0], [cut, 0.5], [cut + 5, 0]]), pointerEvents: "none" }} />
    </>
  );
};
