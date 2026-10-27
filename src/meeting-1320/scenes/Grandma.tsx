// Сцена 6 «Бабушка».
// 6a. N08: лестничная площадка. Дверь открывается — бабушка улыбается внуку.
//     Сын подходит к порогу, оборачивается и машет отцу; бабушка кладёт ему
//     руку на плечо, сын уходит в квартиру. Бабушка кивает отцу — отец кивает
//     в ответ и поднимает ладонь: убедился, что сын дома.
// 6b. N09: один кадр — мама в офисе в другом районе: печатает, бросает
//     взгляд на часы (после обеда), коллега приносит папку — она кивает и
//     берёт её. Без конфликта.
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { Shot, camMove, usePlan, useScene } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, glide, keys, lerp } from "../rig/motion";
import { H, seatOf } from "./common";
import { gdS, GD_POS, GrandmaDoor, MO_POS, MomOffice } from "../sets/Home31";
import { sfxAt, type M13Sfx } from "./sfx";

export const grandmaPlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "grandma");
  const n8 = T.from("N08");
  const n9 = T.from("N09");
  const doorA = Math.max(12, n8 - 24);
  const doorB = doorA + 22;
  const sonGo = Math.max(doorB - 6, n8 + 2);
  const sonAt = sonGo + 34;
  const wave = [sonAt, sonAt + 16] as const;
  const sonIn = sonAt + 18;
  const sonGone = sonIn + 32;
  const gNod = sonIn + 20;
  const fNod = gNod + 8;
  const cutB = Math.min(n9 - 4, Math.max(fNod + 24, T.to("N08") + 10));
  const after = T.word("N09", "Түштөн");
  const clock = [after - 4, after + 34] as const;
  const colIn = Math.min(T.len - 70, after + 40);
  const colAt = colIn + 36;
  return { len: T.len, doorA, doorB, sonGo, sonAt, wave, sonIn, sonGone, gNod, fNod, cutB, clock, colIn, colAt, put: colAt + 6, take: colAt + 16 };
};

export const grandmaSfx = (tl: M13Timeline): M13Sfx[] => {
  const P = grandmaPlan(tl);
  return [sfxAt(tl, "grandma", P.doorA, "flat-door", 0.35), sfxAt(tl, "grandma", P.put, "paper-place", 0.3)];
};

export const grandmaSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  void tl;
  return [];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));
const pulse = (f: number, a: number, b: number) => Math.sin(Math.PI * ramp(f, a, b));

export const GrandmaScene: React.FC = () => {
  const { f } = useScene("grandma");
  const P = usePlan(grandmaPlan);

  // ---- 6a: площадка
  const sonPath = [
    { x: 400, y: 1740 },
    { x: 566, y: 1600 },
  ];
  const sonInPath = [
    { x: 566, y: 1600 },
    { x: 640, y: 1572 },
    { x: 880, y: 1560 },
  ];
  const sonAt = (t: number) => (t < P.sonIn ? glide(t, P.sonGo, P.sonAt, sonPath, (x) => cruise(x, 0.25)) : glide(t, P.sonIn, P.sonGone, sonInPath, (x) => cruise(x, 0.2)));
  const sonPlace = (t: number) => {
    const p = sonAt(t);
    return { x: p.x, y: p.y, h: H.son * gdS(p.y) };
  };
  const sonInside = f >= P.sonIn + 4;
  const sonFace = (t: number) => (t < P.sonGo ? 0.35 : t < P.sonAt - 4 ? 0.85 : t < P.wave[1] ? lerp(0.85, -0.6, easeInOut(ramp(t, P.sonAt - 4, P.sonAt + 4))) : 0.9);
  const sonPose = (t: number): PoseIn => {
    const w = pulse(t, P.wave[0], P.wave[1]);
    const q = sonPlace(t);
    return {
      expr: t > P.doorB - 4 ? "smile" : "calm",
      armL: w > 0.05 ? { target: { x: q.x - q.h * 0.28, y: q.y - q.h * (0.8 + 0.22 * w) + 10 * Math.sin(t * 0.9) }, elbow: "down", shape: "open" } : undefined,
    };
  };
  const son = <Actor uid="g-son" look="m13Son" f={f} place={sonPlace} face={sonFace} pose={sonPose} seed={5} blinkShift={7} walkFrom={P.sonGo - 2} />;

  const G = GD_POS.grandma;
  const gH = H.grandma * G.s;
  const gFace = (t: number) => keys(t, [
    [P.doorB, -0.35],
    [P.sonIn + 4, -0.35],
    [P.sonIn + 12, 0.45],
    [P.gNod - 6, 0.45],
    [P.gNod, -0.55],
  ]);
  const gPose = (t: number): PoseIn => {
    const touch = ramp(t, P.sonAt - 2, P.sonAt + 8) * (1 - ramp(t, P.sonIn + 10, P.sonIn + 20));
    const q = sonPlace(t);
    return {
      expr: "smile",
      lean: 6 * touch,
      nod: pulse(t, P.gNod, P.gNod + 18),
      armL: touch > 0.02 ? { target: { x: lerp(G.x - 40, q.x + q.h * 0.06, touch), y: lerp(G.y - gH * 0.45, q.y - q.h * 0.78, touch) }, elbow: "down", shape: "open" } : undefined,
    };
  };
  const grandma = <Actor uid="g-gm" look="m13Grandma" f={f} place={() => ({ x: G.x, y: G.y, h: gH })} face={gFace} pose={gPose} seed={9} blinkShift={3} />;

  const D = { x: 250, y: 1790 };
  const dH = H.dad * gdS(D.y);
  const dPose = (t: number): PoseIn => {
    const hand = pulse(t, P.wave[0] + 6, P.wave[1] + 14) + pulse(t, P.fNod + 4, P.fNod + 30) * 0.8;
    return {
      expr: t > P.doorB ? "softSmile" : "calm",
      nod: pulse(t, P.fNod, P.fNod + 18),
      armR: hand > 0.05 ? { target: { x: D.x + dH * 0.2, y: D.y - dH * (0.6 + 0.12 * hand) }, elbow: "down", shape: "open" } : undefined,
    };
  };
  const father = <Actor uid="g-dad" look="m13Director" f={f} place={() => ({ x: D.x, y: D.y, h: dH })} face={(t) => (t < P.sonGo ? 0.3 : 0.5)} pose={dPose} seed={3} blinkShift={1} />;

  // ---- 6b: офис мамы
  const M = MO_POS.mom;
  const kb = MO_POS.keyboard;
  const lookClock = easeInOut(ramp(f, P.clock[0], P.clock[0] + 8)) * (1 - easeInOut(ramp(f, P.clock[1] - 8, P.clock[1])));
  const toCol = easeInOut(ramp(f, P.colAt - 8, P.colAt)) * (1 - easeInOut(ramp(f, P.take + 26, P.take + 36)));
  const typing = (t: number) => (lookClock > 0.3 || t > P.colAt - 10 ? 0 : 1);
  const take = easeInOut(ramp(f, P.take, P.take + 12));
  const momPose = (t: number): PoseIn => {
    const ty = typing(t);
    return {
      sit: 1,
      seat: seatOf(H.mom),
      expr: toCol > 0.5 ? "softSmile" : "calm",
      lookY: lerp(0.15, -0.65, lookClock),
      lookX: 0.2 * lookClock,
      nod: pulse(t, P.take - 4, P.take + 12) * 0.8,
      armL: { target: { x: kb.x - 46, y: kb.y - 4 - 6 * ty * Math.max(0, Math.sin(t * 1.3)) }, elbow: "down" },
      armR: { target: take > 0 ? { x: lerp(kb.x + 40, MO_POS.folder.x - 70, take), y: lerp(kb.y - 2, MO_POS.folder.y - 6, take) } : { x: kb.x + 40, y: kb.y - 2 - 6 * ty * Math.max(0, Math.sin(t * 1.3 + 1.7)) }, elbow: "down" },
    };
  };
  const momFace = () => lerp(0.85, 0.75, toCol);
  const colPath = [
    { x: 1260, y: 1560 },
    { x: 990, y: 1560 },
  ];
  const colPlace = (t: number) => {
    const p = glide(t, P.colIn, P.colAt, colPath, (x) => cruise(x, 0.25));
    return { x: p.x, y: p.y, h: H.colleagueW * 0.8 };
  };
  const onDesk = f >= P.put;
  const colPose = (t: number): PoseIn => {
    const u = easeInOut(ramp(t, P.colAt - 4, P.put));
    const back = easeInOut(ramp(t, P.put + 4, P.put + 16));
    const q = colPlace(t);
    return {
      expr: "softSmile",
      armR: t < P.put ? { target: { x: lerp(q.x - 30, MO_POS.folder.x + 20, u), y: lerp(q.y - q.h * 0.42, MO_POS.folder.y - 10, u) }, elbow: "down", item: "notebook", itemColor: "#5E9A93" } : { target: back < 1 ? { x: lerp(MO_POS.folder.x + 20, q.x - 10, back), y: lerp(MO_POS.folder.y - 10, q.y - q.h * 0.36, back) } : null, elbow: "down" },
    };
  };
  const folderX = take > 0 ? lerp(MO_POS.folder.x, MO_POS.folder.x - 60, take) : MO_POS.folder.x;

  return (
    <>
      <Shot f={f} from={0} to={P.cutB} cam={camMove(f, 0, P.cutB, { x: 530, y: 1340, zoom: 1.34 }, { x: 546, y: 1330, zoom: 1.4 })}>
        <GrandmaDoor
          open={ramp(f, P.doorA, P.doorB)}
          inside={
            <>
              {grandma}
              {sonInside ? son : null}
            </>
          }
          front={
            <>
              {sonInside ? null : son}
              {father}
            </>
          }
        />
      </Shot>
      <Shot f={f} from={P.cutB} to={P.len} cam={camMove(f, P.cutB, P.len, { x: 600, y: 1090, zoom: 1.2 }, { x: 590, y: 1110, zoom: 1.26 })}>
        <MomOffice
          typing={Math.floor(f / 5) * typing(f)}
          back={f >= P.colIn ? <Actor uid="g-col" look="m13ColleagueW" f={f} place={colPlace} face={(t) => (t < P.colAt ? -0.85 : -0.6)} pose={colPose} seed={8} blinkShift={4} walkFrom={P.colIn} layer="body" /> : null}
          mid={<Actor uid="g-mom" look="m13Mom" f={f} place={() => ({ x: M.x, y: M.y, h: H.mom })} face={momFace} pose={momPose} seed={6} blinkShift={9} />}
          front={
            <>
              {onDesk ? (
                <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                  <path d={`M ${folderX - 70} ${MO_POS.folder.y + 8} L ${folderX + 70} ${MO_POS.folder.y + 8} L ${folderX + 60} ${MO_POS.folder.y - 6} L ${folderX - 60} ${MO_POS.folder.y - 6} Z`} fill="#5E9A93" stroke="#3F6E69" strokeWidth={3} />
                </svg>
              ) : null}
              {f >= P.colIn ? <Actor uid="g-col" look="m13ColleagueW" f={f} place={colPlace} face={(t) => (t < P.colAt ? -0.85 : -0.6)} pose={colPose} seed={8} blinkShift={4} walkFrom={P.colIn} layer="arms" /> : null}
            </>
          }
        />
      </Shot>
    </>
  );
};

