// Сцена 5 (≈43–56 с): снова два зеркала одного утра.
// Слева «АЗЫР»: мама сама за руку ведёт сына по улице Бишкека к школе,
// у калитки он машет ей — тёплая, уважительная сцена без насмешки.
// Справа «ЭГЕР КАТТАМ УЮШУЛСА • шарттуу мисал» (подпись всё время):
//   «Топ түзүлсө» — у подъезда белая машина, сын и ещё один ребёнок
//   на заднем сиденье пристёгнуты, водитель держит руль, мама машет;
//   «биринчи толук сыноо сапары акысыз» — машина уезжает к школе,
//   полоска ҮЙ → МЕКТЕП → ҮЙ, жёлтая карточка «… — акысыз»;
//   «сабактан кийин» — сын снова у подъезда рядом с мамой;
//   «Эгер ата-эне улантууну тандаса» — карточка «Сыноо → чечим»,
//   мама сама нажимает «Улантуу»;
//   «жолду алдын ала пландоо жеңилирээк болушу мүмкүн» — условная
//   мама спокойно работает в офисе.
// Диктор: «Топ түзүлсө, биринчи толук сыноо сапары акысыз өтөт. Эгер
// ата-эне улантууну тандаса, жолду алдын ала пландоо жеңилирээк болушу
// мүмкүн.»
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { useScene, useTimeline } from "../context";
import { DIV_X, GAP, HALF, LeftPanel, MirrorLine, NowLabel, RightPanel } from "../mirror";
import { C } from "../palette";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, keys, keysV, lerp, vec } from "../rig/motion";
import { PlannedWeek, RouteIcon } from "../screens";
import { BG45_TEXT } from "../script";
import { Belt, Driver, STREET, StreetBack, WhiteCar } from "../sets/Street";
import type { Cam } from "../shots";
import { CAM_HALF, H, OFFICE_AXIS, typePose, wordFrame } from "./common";
import { OfficeWorld } from "./OfficeWorld";
import { trialBeats } from "../beats";

const S = STREET;
const CAR_S = 2.6;
const CAR_X = 980; // машина у подъезда (центр)
const MOM_CAR = { x: 1010, y: S.walkY - 40 } as const; // мама на тротуаре за машиной

// ---------- левая половина: мама сама ведёт и забирает сына ----------
// Та же грамматика, что справа: «Эртең менен» — мама за руку доводит сына
// до школы, он машет и уходит в калитку; синхронный монтажный стык на
// «өтөт» → «Сабактан кийин»: мама снова у калитки, сын выходит, берёт её
// за руку, и на «жолду…» они вместе идут домой.
export type LeftBeats = { readonly back: number; readonly office: number };
const LB0: LeftBeats = { back: 1e9, office: 1e9 };
const WALK = { x0: 2100, x1: 2780, t1: 70 } as const;
const LET_GO = WALK.t1 + 8; // сын отпускает руку у калитки
const GATE_IN = S.gateX + 420; // сын ушёл в школьный двор (за кадр)
const morningMom = (t: number) => lerp(WALK.x0, WALK.x1, cruise(t / WALK.t1, 0.18));
export const momWalk = (t: number, lb: LeftBeats = LB0): Place => {
  if (t < lb.back) return { x: morningMom(t), y: S.walkY, h: H.mom };
  // после уроков: ждёт у калитки, на «жолду» вместе с сыном идут домой
  return { x: WALK.x1 - 900 * cruise((t - lb.office) / 110, 0.2), y: S.walkY, h: H.mom };
};
const sonWalk = (lb: LeftBeats) => (t: number): Place => {
  if (t < lb.back) {
    const go = cruise((t - (LET_GO + 22)) / 40, 0.3);
    const m = morningMom(t);
    return { x: m + 165 + (GATE_IN - m - 165) * go, y: S.walkY + 6, h: H.son };
  }
  // выходит со школьного двора (из-за кадра) к маме и дальше идёт рядом с ней
  const out = cruise((t - lb.back - 4) / 46, 0.3);
  const m = momWalk(t, lb);
  return { x: lerp(GATE_IN, m.x + 165, out), y: S.walkY + 6, h: H.son };
};
// Камера чуть выше пояса: вывеска школы не заходит под подпись времени.
export const TRIAL_CAM_L = (t: number, lb: LeftBeats = LB0): Cam => ({ x: momWalk(t, lb).x + 130, y: 1100, zoom: 0.9 });

export const TrialLeftWorld: React.FC<{ readonly f: number; readonly lb?: LeftBeats }> = ({ f, lb = LB0 }) => {
  const son = sonWalk(lb);
  const hand = (t: number) => {
    const m = momWalk(t, lb);
    return vec(m.x + 88, S.walkY - 0.43 * H.mom + 6 * Math.sin(t / 5));
  };
  // мама отпускает руку и машет; после уроков снова берёт сына за руку,
  // когда он подошёл
  const momHolding = (t: number) => t < LET_GO || t >= lb.back + 46;
  const sonHolding = (t: number) => t < LET_GO || t >= lb.back + 46;
  // взмах: рука сначала поднимается у тела (выше головы сына), затем
  // отходит в сторону — не проходит через головы
  const momWave = (t: number) => {
    // после взмаха рука остаётся опущенной перед собой (без рывка) до стыка
    if (t < LET_GO) return null;
    const up = t < lb.back ? keys(t, [[LET_GO, 0], [LET_GO + 12, 1], [LET_GO + 40, 1], [LET_GO + 50, 0]]) : keys(t, [[lb.back + 4, 0], [lb.back + 14, 1], [lb.back + 30, 1], [lb.back + 44, 0]]);
    const m = momWalk(t, lb);
    return { up, target: vec(m.x + 88 + 62 * up ** 3, S.walkY - (0.43 + 0.43 * up) * H.mom + Math.sin(t / 3) * 10 * up) };
  };
  // сын машет свободной стороной: рука уходит вниз и вбок, потом вверх
  const sonWave = (t: number) => {
    if (t < LET_GO || t >= LET_GO + 30) return null;
    const s = son(t);
    const o = keysV(t, [
      [LET_GO, vec(88 - 165, -0.43 * H.mom)],
      [LET_GO + 4, vec(-10, -0.36 * H.son)],
      [LET_GO + 8, vec(90, -0.5 * H.son)],
      [LET_GO + 12, vec(45, -1.0 * H.son)],
      [LET_GO + 22, vec(45, -1.0 * H.son)],
      [LET_GO + 30, vec(20, -0.42 * H.son)],
    ]);
    const sway = keys(t, [[LET_GO + 12, 0], [LET_GO + 14, 1], [LET_GO + 20, 1], [LET_GO + 22, 0]]);
    return vec(s.x + o.x, S.walkY + o.y + Math.sin(t / 2.6) * 10 * sway);
  };
  const momPose = (t: number): PoseIn => {
    const wv = momWave(t);
    return {
      armR: momHolding(t)
        ? { target: hand(t), shape: "relax", elbow: "down", behind: false }
        : wv
          ? { target: wv.target, shape: wv.up > 0.3 ? "wave" : "relax", elbow: wv.up > 0.3 ? "out" : "down", behind: false }
          : { target: null, shape: "relax", behind: false },
      expr: momHolding(t) ? "softSmile" : "smile",
      lookY: 0.2,
    };
  };
  const sonPose = (t: number): PoseIn => {
    const wv = sonWave(t);
    return {
      armR: sonHolding(t)
        ? { target: hand(t), shape: "relax", elbow: "down", behind: false }
        : wv
          ? { target: wv, shape: "wave", elbow: "out", behind: false }
          : { target: null, shape: "relax", behind: false },
      expr: "smile",
      lookY: -0.35,
      strapTug: 0.4,
    };
  };
  // утро: к маме (машет), затем к школе; после уроков — к маме и домой
  const sonFace = (t: number) =>
    t < lb.back ? keys(t, [[LET_GO, 0.6], [LET_GO + 6, -0.7], [LET_GO + 22, -0.7], [LET_GO + 30, 0.7]]) : keys(t, [[lb.back, -0.7], [lb.office, -0.7], [lb.office + 12, -0.8]]);
  const momFace = (t: number) => (t < lb.back ? keys(t, [[0, 0.75], [LET_GO, 0.75], [LET_GO + 10, 0.5]]) : keys(t, [[lb.back, 0.6], [lb.office, 0.6], [lb.office + 12, -0.8]]));
  return (
    <>
      <StreetBack label={BG45_TEXT.trial.route[0]} school={BG45_TEXT.trial.school} offset={0} />
      <Actor uid="t-son" look="son" f={f} place={son} face={sonFace} pose={sonPose} seed={4} />
      <Actor uid="t-mom" look="mom" f={f} place={(t) => momWalk(t, lb)} face={momFace} pose={momPose} seed={6} />
    </>
  );
};

// Подпись времени суток над левой половиной (под «АЗЫР»), в пару
// к подписи полоски маршрута справа.
export const TimeChip: React.FC<{ readonly text: string; readonly a: number }> = ({ text, a }) =>
  a > 0.01 ? (
    <div style={{ position: "absolute", left: 0, width: HALF, top: 338, display: "flex", justifyContent: "center", opacity: a, pointerEvents: "none" }}>
      <div style={{ padding: "6px 20px 8px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.94)", border: "3px solid #DCE3EE", fontFamily, fontSize: 28, fontWeight: 900, color: C.navy }}>{text}</div>
    </div>
  ) : null;

// ---------- правая половина: условный пример ----------
export const TRIAL_AXIS = 1080;
type RightBeats = { formed: number; go: number; back: number; choose: number; office: number };
const BEATS0: RightBeats = { formed: 1e9, go: 1e9, back: 1e9, choose: 1e9, office: 1e9 };
// Машина: подъезжает на «Топ түзүлсө» (до этого мама одна у подъезда),
// на «биринчи» трогается и уезжает к школе.
const carAt = (t: number, b: RightBeats) =>
  t >= b.back ? CAR_X + 2600 : t < b.go ? CAR_X - 2000 * (1 - easeOut((t - b.formed) / 20)) : CAR_X + 2400 * cruise((t - b.go) / 56, 0.45);
// Камера правой половины: при отъезде на секунду ведёт машину — видно
// водителя за рулём (обе руки на руле), затем машина уходит из кадра.
// В отражённом мире точка мира x оказывается в центре при cam.x = 2·ось − x.
export const TRIAL_CAM_R = (t: number, b: RightBeats = BEATS0): Cam => {
  const follow = t >= b.back ? 0 : keys(t, [[b.go - 4, 0], [b.go + 14, 1], [b.go + 30, 1], [b.go + 44, 0.85]]);
  const target = lerp(TRIAL_AXIS, Math.min(carAt(t, b), CAR_X + 260) + 360, follow);
  return { x: 2 * TRIAL_AXIS - target, y: 900, zoom: keys(t, [[0, 0.86], [90, 0.9]]) };
};

export const TrialRightWorld: React.FC<{ readonly f: number; readonly b?: RightBeats }> = ({ f, b = BEATS0 }) => {
  const inBack = f >= b.back;
  // сын ждёт у подъезда рядом с мамой и садится, когда машина остановилась
  const board = keys(f, [[b.formed + 20, 0], [b.formed + 28, 1]]);
  const carX = carAt(f, b);
  const wheel = ((carX - CAR_X) / (52 * CAR_S)) * 57.3;
  const momPlace = (): Place => ({ x: inBack ? MOM_CAR.x + 60 : MOM_CAR.x, y: MOM_CAR.y, h: H.mom });
  // до посадки сын стоит за мамой (взмах её руки идёт в свободную сторону),
  // после уроков — перед ней
  const sonHome = (): Place => ({ x: inBack ? MOM_CAR.x + 210 : MOM_CAR.x - 170, y: MOM_CAR.y + 8, h: H.son });
  const momPose = (t: number): PoseIn =>
    inBack
      ? {
          armR: { target: vec(MOM_CAR.x + 200, MOM_CAR.y + 8 - 0.7 * H.son), shape: "open", elbow: "down", behind: false },
          expr: "smile",
          lookY: 0.35,
          headTilt: 5,
        }
      : {
          // рука поднимается, когда машина подъехала: по дуге вокруг плеча
          // (почти прямая рука, мимо головы сына), в конце сгибается для взмаха
          armR: ((k: number) => {
            const th = (lerp(-70, 39.5, k) * Math.PI) / 180;
            const r = lerp(430, 155, clamp((k - 0.6) / 0.4));
            const sway = Math.sin(t / 3) * 14 * keys(t, [[b.go - 20, 0], [b.go - 10, 1]]);
            return {
              target: vec(MOM_CAR.x + 20 + r * Math.cos(th), MOM_CAR.y - 0.8 * H.mom - r * Math.sin(th) + sway),
              shape: keys(t, [[b.go - 20, 0], [b.go - 10, 1]]) > 0.5 ? ("wave" as const) : k > 0.5 ? ("open" as const) : ("relax" as const),
              elbow: k > 0.7 ? ("out" as const) : ("down" as const),
              behind: false,
            };
          })(keys(t, [[b.formed + 8, 0], [b.formed + 22, 1]])),
          expr: "smile",
          lookY: 0.3,
        };
  // Дети группы на заднем сиденье, у спинки (px мира от точки машины): сын
  // у окна, двое других чуть дальше (меньше и выше). Все пристёгнуты.
  const kid = (dx: number, h: number, dy = 0) => (): Place => ({ x: dx, y: dy, h });
  const kidPose = (seat: number) => (): PoseIn => ({ sit: 1, seat, armL: { target: null, shape: "relax" }, armR: { target: null, shape: "relax" }, expr: "smile", lookY: -0.1, packOff: true });
  const KIDS = [
    { uid: "r-kid3", look: "kidB" as const, x: 40, h: 620, dy: -34, seat: 330, o: 0.85 },
    { uid: "r-kid2", look: "kidA" as const, x: 92, h: 655, dy: -18, seat: 345, o: 0.92 },
    { uid: "r-son-car", look: "son" as const, x: 150, h: H.son, dy: 0, seat: 360, o: 1 },
  ];
  return (
    <>
      <StreetBack label={BG45_TEXT.trial.route[0]} school={BG45_TEXT.trial.school} />
      <Actor uid="r-mom" look="mom" f={f} place={momPlace} face={() => (inBack ? 0.55 : 0.6)} pose={momPose} seed={7} />
      {inBack || board < 1 ? <Actor uid="r-son" look="son" f={f} opacity={inBack ? 1 : 1 - board} place={sonHome} face={() => -0.6} pose={() => ({ expr: "smile", lookY: -0.4, armL: { target: null, shape: "relax" } })} seed={5} /> : null}
      <WhiteCar x={carX} y={S.carY} s={CAR_S} wheel={wheel}>
        {KIDS.map((k) => (
          <div key={k.uid} style={{ opacity: k.uid === "r-son-car" ? board : 1 }}>
            <Actor uid={k.uid} look={k.look} f={f} place={kid(k.x, k.h, k.dy)} face={() => 0.6} pose={kidPose(k.seat)} seed={k.x} opacity={k.o} />
            <Belt x0={k.x - 34} y0={k.dy - k.seat - 0.27 * k.h} x1={k.x + 30} y1={k.dy - k.seat + 20} />
          </div>
        ))}
        <Driver s={CAR_S} />
      </WhiteCar>
    </>
  );
};

// Полоска маршрута ҮЙ → МЕКТЕП → ҮЙ с бегущей точкой (p 0…1).
const RouteStrip: React.FC<{ readonly p: number; readonly a: number; readonly caption: string }> = ({ p, a, caption }) => {
  const r = BG45_TEXT.trial.route;
  const W = 440;
  return (
    <div style={{ position: "absolute", left: DIV_X + GAP / 2 + (HALF - W) / 2, top: 420, width: W, opacity: a, fontFamily, color: C.navy }}>
      <div style={{ position: "relative", height: 182, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 12px 26px rgba(20,40,90,0.14)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 10, textAlign: "center", fontSize: 28, fontWeight: 900 }}>{caption}</div>
        <div style={{ position: "absolute", left: 66, right: 66, top: 84, height: 8, borderRadius: 4, backgroundColor: "#DCE3EE" }} />
        <div style={{ position: "absolute", left: 66, width: (W - 132) * p, top: 84, height: 8, borderRadius: 4, backgroundColor: C.yellow }} />
        {/* точка под значками: видна на линии между остановками */}
        <div style={{ position: "absolute", left: 66 + (W - 132) * p - 14, top: 74, width: 28, height: 28, borderRadius: 14, backgroundColor: C.navy, border: "5px solid #FFFFFF", boxSizing: "border-box" }} />
        {(["home", "school", "home"] as const).map((k, i) => (
          <div key={i} style={{ position: "absolute", left: 66 + i * ((W - 132) / 2) - 36, top: 52, width: 72, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <RouteIcon kind={k} size={70} />
            <span style={{ fontSize: 24, fontWeight: 900 }}>{r[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Плашка «Топ түзүлсө» (4 силуэта собираются вместе) в верхнем слоте
// условной половины — на словах «Топ түзүлсө», чуть раньше машины:
// условие показано до результата.
export const FormedChip: React.FC<{ readonly a: number; readonly gather: number }> = ({ a, gather }) =>
  a > 0.01 ? (
    <div style={{ position: "absolute", left: DIV_X + GAP / 2, width: HALF, top: 430, display: "flex", justifyContent: "center", opacity: a, pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.95)", border: `4px solid ${C.yellow}`, fontFamily, fontSize: 34, fontWeight: 900, color: C.navy, boxShadow: "0 10px 24px rgba(20,40,90,0.15)" }}>
        {[0, 1, 2, 3].map((i) => (
          <svg key={i} width={34} height={40} viewBox="0 0 34 40" style={{ opacity: i < 3 ? 1 : 0.55, transform: `translateX(${(1 - gather) * (i - 1.5) * 30}px)` }}>
            <circle cx={17} cy={11} r={9} fill={C.navy} />
            <path d="M 3 40 C 3 26 9 21 17 21 C 25 21 31 26 31 40 Z" fill={C.navy} />
          </svg>
        ))}
        <span style={{ marginLeft: (1 - gather) * 45 }}>{BG45_TEXT.trial.formed}</span>
      </div>
    </div>
  ) : null;

export { trialBeats };

export const TrialScene: React.FC = () => {
  const f = useCurrentFrame();
  const { from } = useScene();
  const tl = useTimeline();
  const cue = tl.cues.find((c) => c.id === "n04")!;
  const t = BG45_TEXT.trial;
  const w = (p: string, fb: number) => wordFrame(cue, p, fb, from);
  const { formed, first, free, back, choose, tap, office } = trialBeats(w);
  const b: RightBeats = { formed, go: first + 10, back, choose, office };
  const lb: LeftBeats = { back, office };
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  // карточка и полоска уходят до того, как правая половина растворяется в офис
  const toOffice = keys(f, [[office - 4, 0], [office + 8, 1]]);
  const card = keys(f, [[choose, 0], [choose + 8, 1], [office - 12, 1], [office - 2, 0]]);
  const free1 = keys(f, [[free - 4, 0], [free + 6, 1], [choose - 8, 1], [choose, 0]]);
  const strip = keys(f, [[first + 2, 0], [first + 10, 1], [office - 12, 1], [office - 2, 0]]);
  // утро: ҮЙ → МЕКТЕП; после монтажного стыка — МЕКТЕП → ҮЙ
  const p = f < back ? 0.5 * easeInOut((f - b.go) / 46) : 0.5 + 0.5 * easeInOut((f - back) / 12);
  const rx = DIV_X + GAP / 2;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }}>
      <LeftPanel cam={TRIAL_CAM_L(f, lb)}>
        <TrialLeftWorld f={f} lb={lb} />
      </LeftPanel>
      <TimeChip text={f < back ? t.am : t.pm} a={1} />
      {toOffice < 1 ? (
        <RightPanel cam={TRIAL_CAM_R(f, b)} mirror={TRIAL_AXIS} open={1} f={f}>
          <TrialRightWorld f={f} b={b} />
        </RightPanel>
      ) : null}
      {toOffice > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: toOffice }}>
          <RightPanel cam={CAM_HALF} mirror={OFFICE_AXIS} open={1} f={f}>
            <OfficeWorld f={f} minutes={15 * 60 + 10 + Math.max(0, f - office) / 60} uid="t-o" pose={(tt) => ({ ...typePose(tt, 1, 5), expr: "softSmile" })} seed={6} screen={<PlannedWeek />} />
          </RightPanel>
        </div>
      ) : null}
      {/* «Топ түзүлсө» — на словах диктора, до приезда машины */}
      <FormedChip a={keys(f, [[formed - 4, 0], [formed + 4, 1], [first - 2, 1], [first + 6, 0]])} gather={easeOut((f - formed + 4) / 16)} />
      <RouteStrip p={p} a={strip} caption={f < back ? t.am : t.pm} />
      {/* «Биринчи толук сыноо сапары — акысыз» */}
      <div style={{ position: "absolute", left: rx + 30, width: HALF - 60, top: 1210, opacity: free1, transform: `scale(${0.85 + 0.15 * a(free - 4, 10)})` }}>
        <div style={{ padding: "16px 20px 18px", borderRadius: 26, backgroundColor: C.yellow, color: C.navy, fontFamily, textAlign: "center", boxShadow: "0 10px 0 #E0A800, 0 18px 30px rgba(20,40,90,0.18)" }}>
          <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>{t.badgeTop}</div>
          <div style={{ fontSize: 50, fontWeight: 900, lineHeight: 1.05, letterSpacing: 1 }}>{t.badgeFree}</div>
        </div>
      </div>
      {/* «Сыноо → чечим»: мама сама выбирает «Улантуу» */}
      {card > 0.01 ? (
        <div style={{ position: "absolute", left: rx + 34, width: HALF - 68, top: 1090, opacity: card, transform: `translateY(${(1 - card) * 30}px)`, scale: "0.88", transformOrigin: "50% 0%", fontFamily, color: C.navy }}>
          <div style={{ padding: "26px 24px 30px", borderRadius: 34, backgroundColor: "#FFFFFF", boxShadow: "0 20px 44px rgba(20,40,90,0.22)", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 40, fontWeight: 900 }}>{t.choice}</div>
            <div style={{ width: "100%", padding: "20px 0 22px", borderRadius: 999, backgroundColor: C.yellow, textAlign: "center", fontSize: 40, fontWeight: 900, scale: `${1 - 0.05 * keys(f, [[tap - 3, 0], [tap, 1], [tap + 6, 0]])}`, boxShadow: f >= tap ? "0 0 0 8px rgba(255,201,14,0.35)" : "0 8px 0 #E0A800" }}>
              {f >= tap ? (
                <svg width={34} height={30} viewBox="0 0 40 34" style={{ marginRight: 10, verticalAlign: "-3px" }}>
                  <path d="M 4 18 L 14 28 L 36 4" stroke={C.navy} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
              {t.yes}
            </div>
            <div style={{ width: "100%", padding: "16px 0 18px", borderRadius: 999, backgroundColor: "#F1F4F8", textAlign: "center", fontSize: 34, fontWeight: 800, color: C.muted }}>{t.no}</div>
          </div>
        </div>
      ) : null}
      <MirrorLine draw={1} glow={0.3} />
      <NowLabel a={1} />
    </div>
  );
};
