// Сцена 6. Картонный корабль.
// A. Руки: сын передаёт фотографию (держит за край), папа берёт её за другой
//    край — видимый контакт, затем сын отпускает (тихий звук).
// B. Снимок крупно (как видит папа): трое друзей у картонного корабля,
//    рубка собрана, мачта лежит; Бектура на фото нет. Говорит сын (S02).
// C. На «Кечээ» рамка снимка раскрывается в короткое воспоминание: двор,
//    друзья крепят рубку и несут будущую мачту; за кораблём — жёлтый круг
//    (графическая подложка), детали не закрыты.
// D. На «Мен да…» — лицо Бектура в офисе: тихое сожаление, без слёз.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { C } from "../theme";
import { box, Paper, settle, Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { CloseHand, SKIN } from "../props/CloseHand";
import { PHOTO_RATIO, PhotoArt } from "../props/Photo";
import { SHIP, ShipReal } from "../props/Ship";
import { OFFICE } from "../sets/Office";
import { BOY_CHAIR, BOY_SEAT, DAD_DESK, DAD_SEAT, OfficeFront } from "./OfficeFront";

export const shipPlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "ship");
  return {
    take: 28, // папа берёт фото за край
    release: 40,
    photo: 56,
    memory: T.word("S02", "Кечээ") - 6,
    face: T.word("S02", "Мен") - 4,
    len: T.len,
  };
};
type P = ReturnType<typeof shipPlan>;

// ---------- A. Передача ----------
const Handover: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const bring = easeOut(clamp(f / 26));
  const away = easeInOut(clamp((f - p.release) / 16));
  const pos = { x: lerp(820, 560, bring) - lerp(0, 120, easeInOut(clamp((f - p.release - 4) / 14))), y: 900 };
  const W = 520;
  const H = W * PHOTO_RATIO;
  const dadIn = easeInOut(clamp((f - 10) / 18));
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Paper />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        {/* оборот фотографии */}
        <g transform={`translate(${pos.x} ${pos.y}) rotate(-3)`}>
          <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#FFFFFF" stroke="#D9D3C6" strokeWidth={4} />
          <rect x={-W / 2 + 20} y={-H / 2 + 20} width={W - 40} height={H - 40} fill="#F4F1EA" />
        </g>
        {/* рука сына — справа, держит правый край */}
        <CloseHand x={pos.x + W / 2 + 120 + away * 300} y={pos.y + 40 + away * 260} angle={100} size={190} {...SKIN.boy} shape="pinch" armLen={5} />
        {/* рука папы — слева, берёт левый край */}
        <CloseHand x={lerp(-260, pos.x - W / 2 - 120, dadIn)} y={pos.y + 30} angle={-100} size={210} {...SKIN.dad} shape={f >= p.take ? "pinch" : "open"} mirror armLen={5} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- B. Снимок крупно ----------
const PhotoClose: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t = f - p.photo;
  const z = lerp(1.05, 1.12, easeInOut(clamp(t / 120)));
  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep }}>
      <Paper color={C.paperDeep} />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <g transform={`translate(540 900) scale(${z}) rotate(-2)`}>
          <PhotoArt w={880} />
        </g>
        {/* пальцы папы держат нижние углы */}
        <CloseHand x={140} y={1420} angle={150} size={200} {...SKIN.dad} shape="pinch" mirror armLen={4} />
        <CloseHand x={940} y={1420} angle={-150} size={200} {...SKIN.dad} shape="pinch" armLen={4} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- C. Воспоминание: двор, корабль строится ----------
const MEM_SHIP = { x: 560, y: 1450, s: 0.8 };
const KID_A: Place = { x: 190, y: 1500, h: 560 };
const KID_C: Place = { x: 900, y: 1520, h: 610 };
const KID_B: Place = { x: 820, y: 1560, h: 560 };
const Memory: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t = f - p.memory;
  // рамка снимка раскрывается на весь кадр
  const open = easeInOut(clamp(t / 14));
  const frame = { x: lerp(540 - 440 * 1.1, -20, open), y: lerp(900 - 352 * 1.1, -20, open), w: lerp(968, 1120, open), h: lerp(774, 1960, open) };
  const circle = settle(t - 10, 16);
  const deckY = MEM_SHIP.y + SHIP.deckY * MEM_SHIP.s;
  const cabinTop = MEM_SHIP.y + SHIP.cabin.top * MEM_SHIP.s;
  const tape = keys(t, [[10, 0], [40, 1]]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.paperDeep }}>
      <div style={box({ left: frame.x, top: frame.y, width: frame.w, height: frame.h, overflow: "hidden", border: `${lerp(24, 0, open)}px solid #FFFFFF`, boxSizing: "border-box" })}>
        <div style={box({ left: 0, top: 0, width: 1120, height: 1960, transform: `translate(${-frame.x - 20}px, ${-frame.y - 20}px)` })}>
          <Shot f={f} cam={{ x: 540, y: 1100, zoom: 1 }} bg="#CFE3F2">
            <div style={box({ left: -200, top: 0, width: 1500, height: 1250, backgroundColor: "#CFE3F2" })} />
            <div style={box({ left: 40, top: 520, width: 520, height: 720, backgroundColor: "#E9DCC7" })} />
            {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => <div key={`${r}${c}`} style={box({ left: 80 + c * 160, top: 560 + r * 160, width: 100, height: 110, backgroundColor: "#9FB6CE" })} />))}
            <div style={box({ left: -200, top: 1240, width: 1500, height: 900, backgroundColor: "#B9C98C" })} />
            {/* жёлтый круг — графическая подложка за кораблём */}
            <div style={box({ left: 560 - 380 * circle, top: 1180 - 380 * circle, width: 760 * circle, height: 760 * circle, borderRadius: "50%", backgroundColor: C.yellow, opacity: 0.9 })} />
            <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
              <g transform={`translate(${MEM_SHIP.x} ${MEM_SHIP.y}) scale(${MEM_SHIP.s})`}>
                <ShipReal stage={{ cabin: true, mast: "lying" }} />
              </g>
              {/* свежая полоса скотча на рубке */}
              <rect x={MEM_SHIP.x + (SHIP.cabin.x0 + 20) * MEM_SHIP.s} y={cabinTop + 60} width={180 * tape * MEM_SHIP.s} height={26} fill="#E9D9B9" />
            </svg>
            {/* девочка в розовом приклеивает скотч к рубке */}
            <Actor uid="m6-a" look="friendA" f={f} place={() => KID_A} face={() => 0.6} pose={() => ({ expr: "smile", armR: { target: { x: MEM_SHIP.x + (SHIP.cabin.x0 + 20 + 180 * tape) * MEM_SHIP.s, y: cabinTop + 72 }, shape: "pinch", elbow: "down", behind: false }, armL: { target: { x: 270, y: cabinTop + 90 }, shape: "open", elbow: "down" } })} seed={11} />
            {/* мальчик в зелёном придерживает борт */}
            <Actor uid="m6-b" look="friendB" f={f} place={() => KID_B} face={() => -0.5} pose={() => ({ expr: "calm", armL: { target: { x: 740, y: deckY + 40 }, shape: "open", elbow: "down", behind: false }, armR: { target: { x: 860, y: deckY + 60 }, shape: "relax", elbow: "down" } })} seed={12} />
            {/* старший в оранжевом показывает на будущую мачту */}
            <Actor uid="m6-c" look="friendC" f={f} place={() => KID_C} face={() => -0.6} pose={(tt) => ({ expr: "smile", armR: { target: { x: 1000, y: 1180 }, shape: "relax", elbow: "down" }, armL: { target: { x: lerp(860, 780, clamp((tt - p.memory - 20) / 12)), y: 1300 }, shape: "point", elbow: "down", behind: false } })} seed={13} />
          </Shot>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- D. Лицо Бектура ----------
const Face: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const boyPose = () => ({
    sit: 1,
    seat: BOY_SEAT,
    badge: 1,
    expr: { browIn: 5, browOut: -2, lid: 0.22, smile: -0.12 },
    lookY: 0.35,
    lookX: -0.2,
    nod: 4,
    armL: { target: { x: BOY_CHAIR.x - 50, y: OFFICE.seatY - BOY_SEAT - 20 }, shape: "relax" as const, elbow: "down" as const },
    armR: { target: { x: BOY_CHAIR.x + 50, y: OFFICE.seatY - BOY_SEAT - 20 }, shape: "relax" as const, elbow: "down" as const },
  });
  const dadPose = () => ({ sit: 1, seat: DAD_SEAT, expr: "calm" as const, lookY: 0.4, armR: { target: { x: 470, y: 1060 }, shape: "pinch" as const, item: "photo" as const, elbow: "down" as const }, armL: { target: { x: 340, y: 1150 }, elbow: "down" as const } });
  return (
    <OfficeFront
      f={f}
      cam={{ x: BOY_CHAIR.x - 60, y: 1110, zoom: lerp(2.3, 2.4, clamp((f - p.face) / 60)) }}
      dad={{ place: () => DAD_DESK, face: () => 0.5, pose: dadPose }}
      boy={{ place: () => BOY_CHAIR, face: () => -0.35, pose: boyPose }}
    />
  );
};

export const ShipScene: React.FC = () => {
  const { f } = useScene("ship");
  const p = usePlan(shipPlan);
  if (f < p.photo) return <Handover f={f} p={p} />;
  if (f < p.memory) return <PhotoClose f={f} p={p} />;
  if (f < p.face) return <Memory f={f} p={p} />;
  return <Face f={f} p={p} />;
};

