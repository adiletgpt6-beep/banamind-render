// Сцена 6. Другая среда.
// A. Короткий план: папа в своём офисе печатает — он тоже работает.
// B. Совпадение прямоугольников: клетка рабочего календаря «Шаршемби»
//    раскрывается в экран домашнего ноутбука (через плечо): среди задач —
//    заранее выделенные окна «Мектепке жеткирүү» и «Мектептен алып келүү».
// C. Дома спереди: папа печатает (крышка к зрителю), заканчивает фрагмент,
//    сохраняет, закрывает ноутбук и берёт ключи со стола.
// D. У школы: дочка выходит к папе, он встречает её у машины.
import { Actor, type Place } from "../rig/Actor";
import { CloseHand } from "../props/CloseHand";
import { LaptopFront } from "../props/Laptop";
import { ScheduleScreen } from "../props/Schedule";
import { anticipate, clamp, cruise, easeInOut, keysV, lerp } from "../rig/motion";
import { box, settle, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { C, F, TINT } from "../theme";
import { DadChairBack, DadDeskFront, OFFICE, OfficeWall } from "../sets/Office";
import { CarSide } from "../props/Car";
import { SchoolFacade, STREET } from "../sets/Street";
import { SU2_TEXT } from "../script";
import { H, HANDS, seatOf } from "./common";
import { STREET_CAR } from "./CarBits";

export const wednesdayPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "wednesday");
  const card = Math.max(54, T.word("N06", "Бирок") - 4);
  const morph = card + 22;
  const screen = morph + 16;
  const hi = T.word("N06", "алып") - 4;
  const home = Math.max(screen + 60, T.word("N06", "Ал") - 2);
  const save = home + 34;
  const lid: [number, number] = [save + 14, save + 32];
  const keysAt = lid[1] + 10;
  const school = keysAt + 26;
  return { card, morph, screen, hi, home, save, lid, keysAt, school, len: T.len };
};
type P = ReturnType<typeof wednesdayPlan>;

// A. Офис папы
const DadOffice: React.FC<{ f: number }> = ({ f }) => {
  const dad: Place = { x: OFFICE.dadSeat.x, y: OFFICE.floorY - 20, h: H.dad };
  const tap = (t: number, ph: number) => 6 * Math.max(0, Math.sin(t / 2.2 + ph));
  return (
    <Shot f={f} cam={{ x: 470, y: 1000, zoom: 1.35 }} bg={C.wallOffice}>
      <OfficeWall />
      <DadChairBack />
      <Actor uid="w6-dad" look="su2Dad" f={f} place={() => dad} face={() => 0} pose={(t) => ({ sit: 1, seat: seatOf(H.dad) + 20, expr: "thinking", lookY: 0.55, armL: { target: { x: 330, y: OFFICE.desk.top - 4 - tap(t, 0) }, shape: "relax", elbow: "down", behind: false }, armR: { target: { x: 480, y: OFFICE.desk.top - 4 - tap(t, 1.7) }, shape: "relax", elbow: "down", behind: false } })} seed={2} layer="body" />
      <Actor uid="w6-dad" look="su2Dad" f={f} place={() => dad} face={() => 0} pose={(t) => ({ sit: 1, seat: seatOf(H.dad) + 20, expr: "thinking", lookY: 0.55, armL: { target: { x: 330, y: OFFICE.desk.top - 4 - tap(t, 0) }, shape: "relax", elbow: "down", behind: false }, armR: { target: { x: 480, y: OFFICE.desk.top - 4 - tap(t, 1.7) }, shape: "relax", elbow: "down", behind: false } })} seed={2} layer="arms" />
      <DadDeskFront />
      <LaptopFront x={OFFICE.laptop.x} y={OFFICE.laptop.y} w={OFFICE.laptop.w} open={1} />
      <div style={box({ left: -700, top: -600, width: 2600, height: 3200, backgroundColor: TINT.cool })} />
    </Shot>
  );
};

// B. Карточка «Шаршемби» → экран ноутбука с расписанием
const SCR = { x: 90, y: 470, w: 900, h: 620 };
const CardToScreen: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const k = easeInOut(clamp((f - p.morph) / (p.screen - p.morph)));
  const card = { x: 290, y: 760, w: 500, h: 300 };
  const r = { x: lerp(card.x, SCR.x, k), y: lerp(card.y, SCR.y, k), w: lerp(card.w, SCR.w, k), h: lerp(card.h, SCR.h, k) };
  const t = f - p.card;
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg={C.paper}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: C.paper })} />
      {/* соседние клетки рабочей недели уходят, «Шаршемби» остаётся */}
      {[-1, 1].map((d) => (
        <div key={d} style={box({ left: card.x + d * 540, top: card.y, width: card.w, height: card.h, backgroundColor: C.white, borderRadius: 22, boxShadow: `0 16px 34px ${C.shadow}`, opacity: 1 - k, transform: `translateX(${d * 300 * k}px)` })} />
      ))}
      <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, backgroundColor: k > 0.6 ? "#2B2F38" : C.white, borderRadius: 22, boxShadow: `0 18px 40px ${C.shadow}`, transform: `translateY(${(1 - settle(t, 14)) * 50}px)`, overflow: "hidden" })}>
        {k < 0.6 ? (
          <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontSize: 84, color: C.navy, opacity: 1 - k / 0.6 }}>{SU2_TEXT.wednesday}</div>
        ) : null}
      </div>
    </Shot>
  );
};

const ScreenShot: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const hi = clamp((f - p.hi) / 10);
  const tap = (ph: number) => (Math.sin(f / 2.1 + ph) > 0.4 ? 1 : 0);
  return (
    <Shot f={f} cam={{ x: 540, y: 960, zoom: 1 }} bg="#E8E2D6">
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "linear-gradient(180deg, #F2EBDD, #E5DCCB)" })} />
      <div style={box({ left: SCR.x - 26, top: SCR.y - 26, width: SCR.w + 52, height: SCR.h + 52, backgroundColor: "#2B2F38", borderRadius: 30 })} />
      <div style={box({ left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h })}>
        <ScheduleScreen w={SCR.w} h={SCR.h} hi={hi} typed={clamp((f - p.screen) / 30)} />
      </div>
      {/* клавиатура и руки (печатают, потом пауза) */}
      <Svg>
        <path d={`M ${SCR.x - 30} ${SCR.y + SCR.h + 30} L ${SCR.x + SCR.w + 30} ${SCR.y + SCR.h + 30} L ${SCR.x + SCR.w + 120} ${SCR.y + SCR.h + 420} L ${SCR.x - 120} ${SCR.y + SCR.h + 420} Z`} fill="#C3C8D0" />
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 12 }).map((__, c) => <rect key={`${r}-${c}`} x={SCR.x + 10 + c * 75 - r * 14} y={SCR.y + SCR.h + 60 + r * 70} width={64} height={56} rx={8} fill="#5B616C" />),
        )}
        <CloseHand x={360} y={SCR.y + SCR.h + 190} angle={-170} size={190} {...HANDS.dad} shape="rest" lift={f < p.hi ? tap(0) : 0} />
        <CloseHand x={720} y={SCR.y + SCR.h + 190} angle={170} size={190} {...HANDS.dad} shape="rest" mirror lift={f < p.hi ? tap(1.3) : 0} />
      </Svg>
      <div style={box({ left: -100, top: -100, width: 1280, height: 2120, backgroundColor: TINT.warm })} />
    </Shot>
  );
};

// C. Дома спереди: папа печатает, сохраняет, закрывает ноутбук, берёт ключи
const HOME_DESK = { top: 1220, x0: 160, x1: 900, floor: 1560 };
const KEYS = { x: 780, y: HOME_DESK.top - 6 };
const DadHome: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const dad: Place = { x: 470, y: HOME_DESK.floor - 10, h: H.dad };
  const lid = 1 - easeInOut(clamp((f - p.lid[0]) / (p.lid[1] - p.lid[0])));
  const typing = f < p.save - 4;
  const tap = (ph: number) => (typing ? 6 * Math.max(0, Math.sin(f / 2.2 + ph)) : 0);
  const hasKeys = f >= p.keysAt + 8;
  const pose = () => ({
    sit: 1,
    seat: seatOf(H.dad) + 20,
    expr: f > p.save ? ("softSmile" as const) : ("thinking" as const),
    lookY: f > p.keysAt ? 0.3 : 0.5,
    armL: f >= p.lid[0] - 6 && f < p.lid[1] + 4 ? { target: { x: 470, y: HOME_DESK.top - 170 * lid - 10 }, shape: "open" as const, elbow: "down" as const, behind: false } : { target: { x: 400, y: HOME_DESK.top - 6 - tap(0) }, shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: {
      target: f < p.keysAt - 8 ? { x: 560, y: HOME_DESK.top - 6 - tap(1.7) } : keysV(f, [[p.keysAt - 8, { x: 560, y: HOME_DESK.top - 6 }], [p.keysAt, KEYS], [p.keysAt + 8, KEYS], [p.keysAt + 22, { x: 650, y: HOME_DESK.top - 120 }]], anticipate),
      shape: hasKeys ? ("fist" as const) : ("relax" as const),
      item: hasKeys ? ("keys" as const) : ("none" as const),
      elbow: "down" as const,
      behind: false,
    },
  });
  return (
    <Shot f={f} cam={{ x: 520, y: 1060, zoom: 1.45 }} bg={C.wallHome}>
      <div style={box({ left: -600, top: -400, width: 2400, height: 2400, backgroundColor: C.wallHome })} />
      {/* окно и растение дома */}
      <div style={box({ left: 640, top: 520, width: 380, height: 460, backgroundColor: C.sky, border: `16px solid ${C.white}`, boxSizing: "border-box" })} />
      <div style={box({ left: 90, top: 1040, width: 90, height: 180, backgroundColor: C.orange, borderRadius: "0 0 16px 16px" })} />
      {[-30, 0, 30].map((a) => (
        <div key={a} style={box({ left: 112, top: 860, width: 46, height: 200, backgroundColor: C.green, borderRadius: "50%", transform: `rotate(${a}deg)`, transformOrigin: "50% 100%" })} />
      ))}
      <div style={box({ left: 380, top: HOME_DESK.top - 280, width: 180, height: 260, backgroundColor: "#5E6A7E", borderRadius: "40px 40px 10px 10px" })} />
      <Actor uid="w6-dadh" look="su2Dad" f={f} place={() => dad} face={() => 0.05} pose={pose} seed={2} layer="body" />
      <div style={box({ left: HOME_DESK.x0, top: HOME_DESK.top, width: HOME_DESK.x1 - HOME_DESK.x0, height: 28, backgroundColor: C.woodLight })} />
      <div style={box({ left: HOME_DESK.x0 + 20, top: HOME_DESK.top + 28, width: HOME_DESK.x1 - HOME_DESK.x0 - 40, height: 400, backgroundColor: C.wood })} />
      {typing ? <Actor uid="w6-dadh" look="su2Dad" f={f} place={() => dad} face={() => 0.05} pose={pose} seed={2} layer="arms" /> : null}
      <LaptopFront x={470} y={HOME_DESK.top - 4} w={250} open={lid} />
      {!hasKeys && f < p.keysAt + 8 ? (
        <Svg>
          <g transform={`translate(${KEYS.x} ${KEYS.y}) scale(1 0.5)`}>
            <circle r={12} fill="none" stroke="#B9BEC8" strokeWidth={4} />
            <rect x={8} y={-5} width={36} height={10} rx={4} fill="#C9A646" />
            <rect x={-40} y={-4} width={30} height={10} rx={4} fill="#3A4A7A" />
          </g>
        </Svg>
      ) : null}
      {typing ? null : <Actor uid="w6-dadh" look="su2Dad" f={f} place={() => dad} face={() => 0.05} pose={pose} seed={2} layer="arms" />}
      <div style={box({ left: -600, top: -400, width: 2400, height: 2400, backgroundColor: TINT.warm })} />
    </Shot>
  );
};

// D. У школы: папа ждёт у машины, дочка выходит к нему
const SchoolMeet: React.FC<{ f: number; p: P; len: number }> = ({ f, p, len }) => {
  const t0 = p.school;
  const dad: Place = { x: 470, y: STREET.curbY + 90, h: H.dad };
  const girlPlace = (t: number): Place => ({ x: lerp(1080, 690, cruise(clamp((t - t0 - 6) / Math.max(20, len - t0 - 30)), 0.3)), y: STREET.curbY + 96, h: H.girl });
  const near = clamp((f - (len - 26)) / 14);
  return (
    <Shot f={f} cam={{ x: 760, y: 1560, zoom: 0.78 }} bg="#E9D9C2">
      <SchoolFacade warm={1} />
      <CarSide x={STREET_CAR.x - 1020} y={STREET_CAR.y} s={STREET_CAR.s} layer="back" />
      <CarSide x={STREET_CAR.x - 1020} y={STREET_CAR.y} s={STREET_CAR.s} layer="body" />
      <Actor uid="w6-dads" look="su2Dad" f={f} place={() => dad} face={() => 0.6} pose={() => ({ expr: "smile", lean: 6 * near, armR: { target: { x: dad.x + lerp(110, 190, near), y: dad.y - lerp(330, 380, near) }, shape: near > 0.5 ? "open" : "relax", elbow: "down", behind: false } })} seed={2} />
      <Actor uid="w6-girls" look="su2Girl" f={f} place={girlPlace} face={() => -0.65} pose={() => ({ expr: "smile", lookY: -0.2 })} seed={7} blinkShift={23} walkFrom={t0} />
      <div style={box({ left: -600, top: -400, width: 3000, height: 3000, backgroundColor: TINT.warm })} />
    </Shot>
  );
};

export const WednesdayScene: React.FC = () => {
  const { f } = useScene("wednesday");
  const p = usePlan(wednesdayPlan);
  if (f < p.card) return <DadOffice f={f} />;
  if (f < p.screen) return <CardToScreen f={f} p={p} />;
  if (f < p.home) return <ScreenShot f={f} p={p} />;
  if (f < p.school) return <DadHome f={f} p={p} />;
  return <SchoolMeet f={f} p={p} len={p.len} />;
};

