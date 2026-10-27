// Сцена 7. Почему он не сказал раньше.
// A. Папа держит фото, поднимает взгляд на сына: «Айтсаң болмок да» (F03).
// B. Бектур касается бейджа на первой фразе S03; короткая вставка «вчера»
//    (тёплый жёлтый тон, без слов): папа показывает на бейдж и улыбается.
//    На второй фразе — снова лицо мальчика.
// C. Реакция папы без слов. Он спокойно встаёт (смена опоры → корпус →
//    шаг), обходит край стола, останавливается у стула рядом с сыном,
//    поворачивается и садится на уровне сына. Ответ F04 — в устойчивой позе.
// D. Мальчик поднимает глаза и немного улыбается; пауза. Фон и камера
//    спокойны, без лент и вращения.
import { AbsoluteFill } from "remotion";
import { type Place } from "../rig/Actor";
import { clamp, cruise, easeInOut, keys, lerp } from "../rig/motion";
import { C } from "../theme";
import { box, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { OFFICE } from "../sets/Office";
import { BOY_CHAIR, BOY_SEAT, CHAIR_SEAT, DAD_DESK, DAD_SEAT, OfficeFront } from "./OfficeFront";
import { H, sitDown, standUp } from "./common";

export const badgePlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "badge");
  const s03End = T.to("S03");
  const react = s03End + 6;
  const stand = react + 24;
  const walk: [number, number] = [stand + 26, stand + 26 + 84];
  const sit = walk[1] + 10;
  return {
    f03: T.from("F03"),
    s03: T.from("S03"),
    touch: [T.from("S03") - 4, T.word("S03", "жардамчымсың")] as const,
    yesterday: [T.word("S03", "көрсөтүп") - 2, T.word("S03", "Мен") - 4] as const,
    s03End,
    react,
    stand,
    walk,
    sit,
    f04: T.from("F04"),
    f04End: T.to("F04"),
    len: T.len,
  };
};
type P = ReturnType<typeof badgePlan>;

// Путь папы: из-за стола вдоль стены к краю стола, затем вперёд к стулу.
const DAD_CHAIR_PLACE: Place = { x: OFFICE.dadChair.x, y: OFFICE.seatY, h: H.dad };
const dadPlace = (p: P) => (tt: number): Place => {
  const u = cruise(clamp((tt - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.25);
  const a = { x: DAD_DESK.x, y: DAD_DESK.y };
  const b = { x: 730, y: OFFICE.floorY };
  const c = { x: DAD_CHAIR_PLACE.x, y: DAD_CHAIR_PLACE.y };
  const l1 = Math.hypot(b.x - a.x, b.y - a.y);
  const l2 = Math.hypot(c.x - b.x, c.y - b.y);
  const d = u * (l1 + l2);
  const pt = d <= l1 ? { x: lerp(a.x, b.x, d / l1), y: lerp(a.y, b.y, d / l1) } : { x: lerp(b.x, c.x, (d - l1) / l2), y: lerp(b.y, c.y, (d - l1) / l2) };
  return { x: pt.x, y: pt.y, h: H.dad };
};

export const BadgeScene: React.FC = () => {
  const { f } = useScene("badge");
  const p = usePlan(badgePlan);
  const place = dadPlace(p);
  const dadPose = (tt: number) => {
    const up = standUp(tt, p.stand, 30);
    const down = sitDown(tt, p.sit, 34);
    const seated = tt < p.stand + 10 ? 1 : tt >= p.sit ? down.sit : up.sit;
    const lean = tt < p.sit ? up.lean : down.lean;
    const seat = tt >= p.walk[1] ? CHAIR_SEAT : DAD_SEAT;
    const pl = place(tt);
    const holdPhoto = tt < p.stand + 4;
    return {
      sit: seated,
      seat,
      lean,
      expr: tt < p.f03 ? ("calm" as const) : tt < p.s03End ? ("softSmile" as const) : tt < p.react + 20 ? ({ browIn: 5, browOut: 0, lid: 0.15, smile: 0.1 } as const) : ("softSmile" as const),
      lookY: tt < p.f03 - 14 ? 0.55 : 0.05,
      lookX: 0.3,
      // до вставания фото в руке; затем кладёт его на стол и опирается
      armR: holdPhoto
        ? { target: { x: 480, y: 1050 }, shape: "pinch" as const, item: "photo" as const, elbow: "down" as const, behind: false }
        : { target: tt < p.walk[0] ? { x: 560, y: 1160 } : null, shape: "relax" as const, elbow: "down" as const },
      armL: tt < p.walk[0] ? { target: { x: 330, y: 1155 }, shape: "relax" as const, elbow: "down" as const } : tt >= p.sit + 20 ? { target: { x: pl.x - 40, y: OFFICE.seatY - CHAIR_SEAT - 26 }, shape: "relax" as const, elbow: "down" as const } : undefined,
      nod: keys(tt, [[p.react, 0], [p.react + 10, 4], [p.react + 22, 1]]),
      // сидя — корпус развёрнут к сыну меньше, колени не заходят на его стул
      turnBody: tt >= p.sit ? 0.55 : 0.8,
    };
  };
  // лицо: на сына (вправо); в пути — по направлению шага; садясь — к сыну
  const dadFace = (tt: number) => (tt < p.walk[0] ? 0.55 : tt < p.walk[1] ? 0.7 : tt < p.sit ? 0.6 : 0.45);
  const boyPose = (tt: number) => {
    const touching = tt >= p.touch[0] && tt < p.touch[1] + 20;
    const rest = { x: BOY_CHAIR.x + 50, y: OFFICE.seatY - BOY_SEAT - 20 };
    // бейдж на груди слева (у зрителя справа от центра груди)
    const badge = { x: BOY_CHAIR.x + 22, y: OFFICE.seatY - 292 };
    return {
      sit: 1,
      seat: BOY_SEAT,
      badge: 1,
      expr: tt < p.f04End ? ({ browIn: 4, browOut: -1, lid: 0.15, smile: -0.05 } as const) : tt < p.f04End + 12 ? ("calm" as const) : ("softSmile" as const),
      lookY: tt < p.f04 ? 0.25 : keys(tt, [[p.f04End - 10, 0.25], [p.f04End + 4, -0.2]]),
      lookX: tt < p.walk[1] ? -0.3 : -0.4,
      nod: tt < p.f04End ? 4 : keys(tt, [[p.f04End, 4], [p.f04End + 12, 0]]),
      armR: { target: touching ? keys(tt, [[p.touch[0], 0], [p.touch[0] + 10, 1], [p.touch[1] + 8, 1], [p.touch[1] + 20, 0]]) > 0.5 ? badge : rest : rest, shape: touching ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false, wrist: touching ? -30 : 0 },
      armL: { target: { x: BOY_CHAIR.x - 50, y: OFFICE.seatY - BOY_SEAT - 20 }, shape: "relax" as const, elbow: "down" as const },
    };
  };
  const boyFace = (tt: number) => (tt < p.walk[1] ? -0.4 : -0.55);
  // камера: двое (A); лицо мальчика (B); общий план прохода (C); двое рядом (D)
  const close = f >= p.s03 - 4 && f < p.s03End + 4 && !(f >= p.yesterday[0] && f < p.yesterday[1]);
  const wide = f >= p.stand - 6 && f < p.sit + 40;
  const cam = close
    ? { x: BOY_CHAIR.x - 40, y: 1110, zoom: 2.3 }
    : wide
      ? { x: 640, y: 1060, zoom: 1.32 }
      : f >= p.sit + 40
        ? { x: 860, y: 1080, zoom: lerp(1.7, 1.78, clamp((f - p.sit - 40) / 120)) }
        : { x: 620, y: 1060, zoom: 1.5 };
  const front = place(f).x > 720; // вышел из-за стола — рисуется перед столешницей
  return (
    <AbsoluteFill>
      <OfficeFront
        f={f}
        cam={cam}
        dad={{ place, face: dadFace, pose: dadPose, walkFrom: p.walk[0] - 2, front }}
        boy={{ place: () => BOY_CHAIR, face: boyFace, pose: boyPose }}
        extra={f >= p.stand + 4 ? <PhotoFlat /> : null}
      />
      {f >= p.yesterday[0] && f < p.yesterday[1] ? <Yesterday f={f - p.yesterday[0]} /> : null}
    </AbsoluteFill>
  );
};

// Фото лежит на столе после того, как папа его положил.
const PhotoFlat: React.FC = () => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform="translate(600 1186) rotate(4) scale(1 0.24)">
      <rect x={-70} y={-56} width={140} height={112} fill="#FFFFFF" stroke="#D9D3C6" strokeWidth={4} />
      <rect x={-60} y={-46} width={120} height={70} fill="#CFE3F2" />
      <rect x={-60} y={10} width={120} height={14} fill="#B9C98C" />
    </g>
  </svg>
);

// Вставка «вчера»: тот же офис в тёплом жёлтом тоне — папа показывает на
// бейдж сына и улыбается (без реплик).
const Yesterday: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(clamp(f / 8));
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <OfficeFront
        f={f}
        cam={{ x: 700, y: 1060, zoom: 1.6 }}
        dad={{
          place: () => ({ x: 860, y: OFFICE.floorY - 10, h: H.dad }),
          face: () => 0.5,
          pose: (tt) => ({ expr: "smile", armR: { target: { x: 945, y: lerp(1150, 1112, clamp(tt / 10)) }, shape: "point", elbow: "down", behind: false }, armL: { target: null }, lookY: 0.4 }),
        }}
        boy={{ place: () => BOY_CHAIR, face: () => -0.4, pose: () => ({ sit: 1, seat: BOY_SEAT, badge: 1, expr: "smile", lookY: -0.35, armL: { target: { x: BOY_CHAIR.x - 50, y: OFFICE.seatY - BOY_SEAT - 20 }, elbow: "down" }, armR: { target: { x: BOY_CHAIR.x + 50, y: OFFICE.seatY - BOY_SEAT - 20 }, elbow: "down" } }) }}
        paperOnDesk={false}
      />
      <div style={box({ inset: 0, backgroundColor: C.yellow, mixBlendMode: "multiply", opacity: 0.55 })} />
      <div style={box({ inset: 26, border: `14px solid ${C.paper}` })} />
    </AbsoluteFill>
  );
};
