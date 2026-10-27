// Сцена 2 «ask» (≈ 9 с): видимый человеческий вопрос.
//
// Светлая бишкекская гостиная (окно с Ала-Тоо, панельными домами и
// тополями, ширдак на стене, жёлтое кресло, торшер, растение). Сцена
// открывается ирисом из бумажного фона (хук закончился наездом в «?» и
// светлой бумагой).
//   a) общий план, медленный наезд: мама в кресле перечитывает карточку
//      пакета на телефоне — пролистывает большим пальцем, моргает,
//      спокойное лицо становится задумчивым;
//   b) к реплике m01 камера подъезжает к лицу: мама опускает телефон,
//      поднимает брови, наклоняет голову и спрашивает в камеру
//      «Кошумча эки сапар эмнеге берилет?» (губы — общий риг); рядом
//      всплывает пузырь «+2 ?» (на «эки» и «эмнеге»);
//   c) взгляд мамы (POV): телефон в руке — карточка пакета «20 сапар»
//      (20 жёлтых + 2 мятных жетона, «+2 сапар акысыз», 1 сапар = ҮЙ →
//      МЕКТЕП → ҮЙ, сыноо — өзүнчө). Без цены и без кнопок: ничего не
//      выбрано и не оплачено. Указательный палец левой руки подходит к
//      «+2» и останавливается у края плашки; плашка мягко пульсирует.
//      Кинетическая подпись «20 САПАР ТОПТОМУ»;
//   d) последние 16 кадров: наезд в «+2» (≈ ×3) и растворение в светлую
//      бумагу — следующая сцена собирает лоток жетонов на бумаге.
// Все моменты — от фактической реплики m01 (useLine / useWordAt).
import type React from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { Actor, type Place, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { LOOKS } from "../../../two-schedules-2d/rig/looks";
import { anticipate, clamp, easeIn, easeInOut, easeOut, keys, keysV, smoothstep, type Vec } from "../../../two-schedules-2d/rig/motion";
import { EXPR, mixExpr, type Expression } from "../../../two-schedules-2d/rig/pose";
import { HoldingHand, PhoneFrame } from "../../../two-schedules-2d/screens";
import { Mountains, Ornament, Shyrdak } from "../../../two-schedules-2d/sets/Apartment";
import { seatH } from "../../../two-schedules-2d/sets/Home";
import { PanelHouse, Tree } from "../../../two-schedules-2d/sets/Outdoor";
import { camMove, Depth, Shot, type Cam } from "../../../two-schedules-2d/shots";
import { useLine, useScene, useWordAt } from "../context";
import { C } from "../palette";
import { BG35_TEXT } from "../script";
import { Token, TrialChip } from "../tokens";
import { box, Caption, Logo, pop, Txt } from "../ui";

// Индексы слов реплики m01 «Кошумча эки сапар эмнеге берилет?»
// (в BG35_WORDS их нет — считаем по тексту реплики).
const M01_WORDS = { two: 1, why: 3 } as const;

// ---------- Мир гостиной (px) ----------
const FLOOR = 1390; // низ стены
const WIN = { x: 40, y: 270, w: 430, h: 790 } as const;
const LAMP_X = 968;
const PLANT_X = 150;
// Мама сидит в кресле: точка между ступнями и рост.
const MOM: Place = { x: 650, y: 1600, h: 1000 };
const MOM_AT = () => MOM;
const SEAT = seatH(MOM.h);
const HEAD: Vec = { x: MOM.x, y: MOM.y - 670 };
// Кисти (мировые px)
// (обе руки — плечо вдоль корпуса, локоть у бока: elbow "hang"; локоть
// правой руки ≈ (734, 1203…1209). Цели держат предплечье длинным
// (≈ 110–130 px): часы мамы сидят на видимом запястье, а не на ладони.)
const PHONE_READ: Vec = { x: 766, y: 1084 }; // предплечье вверх: телефон у плеча
const PHONE_LOW: Vec = { x: 842, y: 1216 }; // предплечье на подлокотнике
const L_REST: Vec = { x: 585, y: 1300 }; // кисть на бедре у края кардигана
const L_ASK: Vec = { x: 546, y: 1098 };
const L_REST_WRIST = -50; // кисть вдоль бедра

// Камера
const WIDE_A: Cam = { x: 610, y: 1030, zoom: 1.1 };
const WIDE_B: Cam = { x: 640, y: 1030, zoom: 1.22 };
const CLOSE_A: Cam = { x: 722, y: 1075, zoom: 2.05 };
const CLOSE_B: Cam = { x: 716, y: 1068, zoom: 2.16 };
const PHONE_CAM: Cam = { x: PHONE_READ.x, y: PHONE_READ.y - 36, zoom: 3.8 };
const POV_BG: Cam = { x: 560, y: 1080, zoom: 1.35 };

const toScreen = (p: Vec, c: Cam): Vec => ({ x: 540 + (p.x - c.x) * c.zoom, y: 960 + (p.y - c.y) * c.zoom });

// ---------- Телефон крупно (POV) ----------
const PH = { x: 214, y: 396, w: 640 } as const;
const PH_H = PH.w * 2.05;
const PH_IN = PH.w * 0.035;
const PH_C: Vec = { x: PH.x + PH.w / 2, y: PH.y + PH_H / 2 };
const IW = PH.w - 2 * PH_IN; // ширина экрана
// Карточка (координаты экрана телефона)
const CARD = { left: 22, top: 200, w: IW - 44, h: 716 } as const;
const PILL = { left: 26, top: 306, h: 92, pad: 30, border: 4, plusW: 70 } as const;
const TOK = { top: 205, gap: 50, r: 21 } as const;
// центр «+2» и кончик пальца (экран телефона)
const PLUS2_IN: Vec = {
  x: CARD.left + PILL.left + PILL.border + PILL.pad + PILL.plusW / 2,
  y: CARD.top + PILL.top + PILL.h / 2,
};
const TIP_IN: Vec = { x: CARD.left + PILL.left + 12, y: PLUS2_IN.y + 10 };
const inToPage = (p: Vec): Vec => ({ x: PH.x + PH_IN + p.x, y: PH.y + PH_IN + p.y });
// Кадрирование POV: телефон крупнее (×POV_S) и ниже — карточка заполняет
// кадр, пустой низ экрана уходит за нижний край (там только пальцы).
const POV_S = 1.3;
const POV_TOP = 400; // верх корпуса на экране (под подписью)
const POV_OFF: Vec = { x: 540 - POV_S * PH_C.x, y: POV_TOP - POV_S * PH.y };
const pageToScreen = (p: Vec): Vec => ({ x: POV_OFF.x + POV_S * p.x, y: POV_OFF.y + POV_S * p.y });
// HoldingHand рисуется от этой высоты (ладонь и рукав — за корпусом).
const HOLD_Y = PH.y + 210;
const rotAbout = (p: Vec, c: Vec, deg: number): Vec => {
  const a = (deg * Math.PI) / 180;
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
};

// Ключевые кадры сцены при оценочной озвучке (для справки соседним сценам;
// в самой сцене всё считается от фактической реплики m01).
export const ASK = {
  iris: 14, // ирис из бумаги раскрыт
  closeBefore: 8, // наезд к лицу начинается за 8 кадров до m01
  pushAfter: 2, // камера едет к телефону через 2 кадра после конца m01
  povAfter: 7, // POV-вставка проявляется через 7 кадров после конца m01
  outFrames: 16, // финальный наезд в «+2» и растворение в бумагу
} as const;

// ---------- Декорации ----------
const Outside: React.FC<{ readonly f: number }> = ({ f }) => (
  <>
    <div style={box({ left: WIN.x - 300, top: WIN.y - 200, width: WIN.w + 600, height: WIN.h + 400, background: "linear-gradient(180deg, #B9DAF2 0%, #DCEAF5 52%, #F6EEDF 100%)" })} />
    {/* лёгкие облака плывут */}
    {[0, 1].map((i) => (
      <div
        key={i}
        style={box({
          left: WIN.x - 120 + i * 260 + ((f * 0.35 + i * 90) % 520) - 120,
          top: WIN.y + 60 + i * 70,
          width: 170 - i * 30,
          height: 46 - i * 8,
          borderRadius: 30,
          backgroundColor: "rgba(255,255,255,0.75)",
        })}
      />
    ))}
    <Mountains x={WIN.x - 260} y={WIN.y + 250} w={980} h={260} />
    <div style={box({ left: WIN.x - 30, top: WIN.y + WIN.h + 30, transform: "scale(0.34)", transformOrigin: "0 0" })}>
      <PanelHouse x={0} y={0} w={620} floors={9} color="#EDE4D6" seed={3} />
    </div>
    <div style={box({ left: WIN.x + 240, top: WIN.y + WIN.h + 30, transform: "scale(0.28)", transformOrigin: "0 0" })}>
      <PanelHouse x={0} y={0} w={760} floors={7} color="#E3E8EE" seed={5} />
    </div>
    <Tree x={WIN.x + 205} y={WIN.y + WIN.h + 40} s={0.62} kind="poplar" />
    <Tree x={WIN.x + 40} y={WIN.y + WIN.h + 40} s={0.5} kind="poplar" tone={1} />
    <Tree x={WIN.x + 400} y={WIN.y + WIN.h + 40} s={0.45} kind="round" />
  </>
);

const RoomBack: React.FC<{ readonly f: number }> = ({ f }) => {
  const sway = Math.sin(f / 34) * 4;
  return (
    <>
      {/* стена */}
      <div style={box({ left: -500, top: -600, width: 2200, height: FLOOR + 600, background: "linear-gradient(180deg, #FCFAF5 0%, #F5EFE5 100%)" })} />
      {/* пол — светлый ламинат */}
      <div
        style={box({
          left: -500,
          top: FLOOR,
          width: 2200,
          height: 1200,
          backgroundColor: "#EAD8BC",
          backgroundImage: "repeating-linear-gradient(180deg, rgba(150,110,70,0.10) 0 3px, transparent 3px 64px)",
        })}
      />
      {/* плинтус */}
      <div style={box({ left: -500, top: FLOOR - 10, width: 2200, height: 26, backgroundColor: "#FFFFFF", boxShadow: "0 4px 8px rgba(120,90,60,0.12)" })} />
      {/* солнечное пятно от окна на полу */}
      <svg width={1400} height={700} viewBox={`-200 ${FLOOR} 1400 700`} style={box({ left: -200, top: FLOOR })}>
        <path d={`M ${WIN.x + 20} ${FLOOR + 10} L ${WIN.x + WIN.w - 10} ${FLOOR + 10} L ${WIN.x + WIN.w + 420} ${FLOOR + 560} L ${WIN.x + 180} ${FLOOR + 560} Z`} fill="#FFF6DD" opacity={0.55} />
      </svg>
      {/* окно: вид на двор, горы */}
      <div style={box({ left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, overflow: "hidden" })}>
        <div style={box({ left: -WIN.x, top: -WIN.y, width: 1, height: 1 })}>
          <Depth depth={0.5}>
            <Outside f={f} />
          </Depth>
        </div>
        {/* блики на стекле */}
        <div style={box({ left: 40, top: -100, width: 70, height: WIN.h + 300, backgroundColor: "rgba(255,255,255,0.18)", rotate: "24deg" })} />
        <div style={box({ left: 170, top: -100, width: 26, height: WIN.h + 300, backgroundColor: "rgba(255,255,255,0.16)", rotate: "24deg" })} />
      </div>
      {/* рама */}
      <div style={box({ left: WIN.x - 18, top: WIN.y - 18, width: WIN.w + 36, height: WIN.h + 36, border: "22px solid #FFFFFF", borderRadius: 8, boxSizing: "border-box", boxShadow: "0 10px 26px rgba(120,90,60,0.16), inset 0 0 0 2px #E6DED2" })} />
      <div style={box({ left: WIN.x + WIN.w / 2 - 9, top: WIN.y, width: 18, height: WIN.h, backgroundColor: "#FFFFFF", boxShadow: "0 0 0 2px #EAE2D6" })} />
      <div style={box({ left: WIN.x, top: WIN.y + 250, width: WIN.w, height: 18, backgroundColor: "#FFFFFF", boxShadow: "0 0 0 2px #EAE2D6" })} />
      {/* подоконник и батарея */}
      <div style={box({ left: WIN.x - 34, top: WIN.y + WIN.h + 10, width: WIN.w + 68, height: 30, borderRadius: 6, backgroundColor: "#FFFFFF", boxShadow: "0 10px 14px rgba(120,90,60,0.16)" })} />
      <div style={box({ left: WIN.x + 50, top: WIN.y + WIN.h + 90, width: WIN.w - 100, height: 170, borderRadius: 12, backgroundColor: "#F7F7F4", backgroundImage: "repeating-linear-gradient(90deg, rgba(150,150,150,0.18) 0 4px, transparent 4px 30px)", boxShadow: "0 6px 12px rgba(120,90,60,0.12)" })} />
      {/* тюль и карниз */}
      <div style={box({ left: WIN.x - 70, top: WIN.y - 64, width: WIN.w + 140, height: 12, borderRadius: 6, backgroundColor: "#C9B79F" })} />
      {[
        { x: WIN.x - 62, w: 120 },
        { x: WIN.x + WIN.w - 58, w: 120 },
      ].map((c, i) => (
        <div
          key={i}
          style={box({
            left: c.x,
            top: WIN.y - 56,
            width: c.w,
            height: FLOOR - WIN.y + 30,
            transformOrigin: "50% 0%",
            rotate: `${(i ? -1 : 1) * 0.3 * Math.sin(f / 40 + i)}deg`,
            background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.62) 0 26px, rgba(240,234,224,0.5) 34px, rgba(255,255,255,0.62) 44px)",
            borderRadius: "0 0 18px 18px",
            boxShadow: "0 8px 18px rgba(120,90,60,0.10)",
          })}
        />
      ))}
      {/* ширдак на стене */}
      <Shyrdak x={705} y={400} w={300} h={196} />
      {/* торшер: тёплый свет на стене */}
      <div style={box({ left: LAMP_X - 260, top: 520, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,226,150,0.45) 0%, rgba(255,226,150,0) 70%)" })} />
      <svg width={300} height={900} viewBox="-150 640 300 900" style={box({ left: LAMP_X - 150, top: 640 })}>
        <ellipse cx={0} cy={1500} rx={80} ry={14} fill="rgba(80,60,40,0.16)" />
        <rect x={-6} y={790} width={12} height={706} rx={6} fill="#B79A6E" />
        <ellipse cx={0} cy={1494} rx={58} ry={14} fill="#A88C62" />
        <path d="M -84 800 L -58 690 L 58 690 L 84 800 Z" fill="#FFF3D6" stroke="#E9D5AE" strokeWidth={4} />
        <path d="M -84 800 L 84 800" stroke="#E2C996" strokeWidth={6} strokeLinecap="round" />
      </svg>
      {/* растение у окна */}
      <svg width={420} height={620} viewBox="-210 960 420 620" style={box({ left: PLANT_X - 210, top: 960, overflow: "visible" })}>
        <ellipse cx={0} cy={1512} rx={86} ry={14} fill="rgba(80,60,40,0.16)" />
        <g transform={`rotate(${sway * 0.4} 0 1380)`}>
          {[
            [-120, 1180, -38, 1],
            [-60, 1080, -14, 0],
            [40, 1060, 16, 1],
            [110, 1170, 40, 0],
            [-10, 1150, 2, 0],
            [-150, 1290, -60, 0],
            [140, 1290, 62, 1],
          ].map(([x, y, r, d], i) => (
            <g key={i} transform={`rotate(${r + Math.sin(f / 30 + i) * 1.6} ${x} ${y})`}>
              <path d={`M 0 1390 Q ${x * 0.5} ${(y + 1390) / 2} ${x} ${y}`} stroke="#5E8A4E" strokeWidth={6} fill="none" />
              <ellipse cx={x} cy={y} rx={42} ry={74} fill={d ? "#6FA35C" : "#5F954F"} />
              <path d={`M ${x} ${y - 66} L ${x} ${y + 66}`} stroke="rgba(255,255,255,0.35)" strokeWidth={4} />
            </g>
          ))}
        </g>
        <path d="M -76 1380 L 76 1380 L 62 1510 L -62 1510 Z" fill="#F4F1EA" stroke="#DDD3C4" strokeWidth={4} />
        <rect x={-82} y={1370} width={164} height={22} rx={8} fill="#E9E2D5" />
      </svg>
    </>
  );
};

// Кресло: спинка и сиденье (за мамой) и подлокотники (перед корпусом).
const CHAIR = { x: MOM.x, back: 870, seat: 1292 } as const;
const YEL = "#F8C93C";
const YEL_D = "#E4AF1E";
const YEL_L = "#FFDA6A";

const ArmchairBack: React.FC = () => (
  <svg width={640} height={720} viewBox={`${CHAIR.x - 320} 840 640 720`} style={box({ left: CHAIR.x - 320, top: 840, overflow: "visible" })}>
    <ellipse cx={CHAIR.x} cy={1508} rx={250} ry={22} fill="rgba(80,60,40,0.18)" />
    {/* ножки */}
    <path d={`M ${CHAIR.x - 186} 1462 L ${CHAIR.x - 196} 1508 L ${CHAIR.x - 178} 1508 L ${CHAIR.x - 166} 1462 Z`} fill="#9C6B43" />
    <path d={`M ${CHAIR.x + 186} 1462 L ${CHAIR.x + 196} 1508 L ${CHAIR.x + 178} 1508 L ${CHAIR.x + 166} 1462 Z`} fill="#9C6B43" />
    {/* спинка */}
    <rect x={CHAIR.x - 214} y={CHAIR.back} width={428} height={500} rx={96} fill={YEL} />
    <rect x={CHAIR.x - 184} y={CHAIR.back + 30} width={368} height={430} rx={76} fill={YEL_D} opacity={0.32} />
    {[-90, 0, 90].map((dx) => (
      <circle key={dx} cx={CHAIR.x + dx} cy={CHAIR.back + 150} r={6} fill={YEL_D} />
    ))}
    {/* подушка с орнаментом у левого подлокотника */}
    <g transform={`rotate(-9 ${CHAIR.x - 150} 1150)`}>
      <rect x={CHAIR.x - 214} y={1090} width={128} height={118} rx={26} fill="#FFFFFF" stroke="#E5DCCB" strokeWidth={4} />
      <Ornament x={CHAIR.x - 150} y={1149} s={0.62} color={C.navy} />
    </g>
    {/* сиденье */}
    <rect x={CHAIR.x - 200} y={CHAIR.seat} width={400} height={96} rx={30} fill={YEL_L} />
    <rect x={CHAIR.x - 206} y={CHAIR.seat + 78} width={412} height={98} rx={24} fill={YEL} />
    <rect x={CHAIR.x - 206} y={CHAIR.seat + 150} width={412} height={26} rx={12} fill={YEL_D} opacity={0.5} />
  </svg>
);

const ArmchairFront: React.FC = () => (
  <svg width={640} height={420} viewBox={`${CHAIR.x - 320} 1100 640 420`} style={box({ left: CHAIR.x - 320, top: 1100, overflow: "visible" })}>
    {[-1, 1].map((s) => {
      const x0 = s < 0 ? CHAIR.x - 236 : CHAIR.x + 128;
      return (
        <g key={s}>
          <rect x={x0} y={1140} width={108} height={330} rx={46} fill={YEL} />
          <rect x={x0 + (s < 0 ? 64 : 0)} y={1150} width={44} height={316} rx={22} fill={YEL_D} opacity={0.35} />
          <rect x={x0 + 6} y={1144} width={96} height={30} rx={15} fill={YEL_L} />
        </g>
      );
    })}
  </svg>
);

// Указательный палец левой руки мамы (вид сверху): кончик в (0, 0),
// палец направлен по +x; кисть и рукав — сзади.
const PointingHand: React.FC<{ readonly x: number; readonly y: number; readonly rot: number; readonly lift: number }> = ({ x, y, rot, lift }) => {
  const L = LOOKS.mom;
  const sk = { stroke: L.skinShade, strokeWidth: 3 };
  return (
    <svg
      width={1}
      height={1}
      style={box({
        left: x,
        top: y,
        overflow: "visible",
        filter: `drop-shadow(0 ${10 + 12 * lift}px ${12 + 10 * lift}px rgba(20,30,60,${0.22 + 0.08 * lift}))`,
      })}
    >
      <g transform={`rotate(${rot})`}>
        <rect x={-820} y={-104} width={540} height={210} rx={92} fill={L.topColor} />
        <rect x={-330} y={-98} width={46} height={198} rx={22} fill={L.topShade} />
        {/* тыльная сторона кисти */}
        <path d="M -300 -70 Q -240 -96 -168 -72 Q -120 -56 -112 -20 L -110 56 Q -120 98 -178 102 L -268 98 Q -312 90 -314 40 Z" fill={L.skin} {...sk} />
        {/* согнутые пальцы (костяшки) */}
        <path d="M -186 -78 Q -128 -86 -112 -48 Q -104 -28 -122 -18 L -176 -24 Z" fill={L.skin} {...sk} />
        <path d="M -150 -64 Q -136 -46 -146 -26" stroke={L.skinShade} strokeWidth={3} fill="none" />
        {/* большой палец под указательным */}
        <rect x={-236} y={34} width={132} height={48} rx={24} fill={L.skin} {...sk} transform="rotate(10 -170 58)" />
        {/* указательный */}
        <rect x={-182} y={-29} width={182} height={58} rx={29} fill={L.skin} {...sk} />
        <path d="M -92 -22 Q -86 0 -92 22" stroke={L.skinShade} strokeWidth={3} fill="none" opacity={0.7} />
        <rect x={-44} y={-18} width={34} height={34} rx={14} fill="#F5D7C0" stroke={L.skinShade} strokeWidth={2} />
      </g>
    </svg>
  );
};

// Передние части держащей (правой) руки — поверх корпуса: большой палец на
// правой рамке и кончики трёх пальцев на левой. Ладонь и рукав — общий
// HoldingHand, он рисуется ДО телефона («ладонь за корпусом»).
const HoldingFront: React.FC = () => {
  const L = LOOKS.mom;
  const edge = { border: `3px solid ${L.skinShade}`, boxSizing: "border-box" } as const;
  return (
    <>
      <div
        style={box({
          left: PH.x + PH.w * 0.85,
          top: HOLD_Y + PH_H * 0.56 + 24, // ниже края карточки
          width: PH.w * 0.13,
          height: PH.w * 0.3,
          borderRadius: PH.w * 0.07,
          backgroundColor: L.skin,
          rotate: "-32deg",
          boxShadow: "-4px 6px 12px rgba(20,30,60,0.22)",
          ...edge,
        })}
      >
        {/* ноготь */}
        <div style={box({ left: "22%", top: 8, width: "50%", height: PH.w * 0.07, borderRadius: PH.w * 0.03, backgroundColor: "#F5D7C0" })} />
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={box({
            left: PH.x - PH.w * 0.05,
            top: HOLD_Y + PH_H * (0.62 + i * 0.08),
            width: PH.w * 0.1,
            height: PH.w * 0.12,
            borderRadius: PH.w * 0.05,
            backgroundColor: L.skin,
            boxShadow: "2px 4px 8px rgba(20,30,60,0.18)",
            ...edge,
          })}
        />
      ))}
    </>
  );
};

// Карточка пакета на экране телефона (без цены и без кнопок).
const PackageCard: React.FC<{
  readonly scroll: number;
  readonly wave: number; // пробег подсветки по 20 жетонам (0…1)
  readonly ring: number; // пульс плашки «+2» (0…1)
  readonly bonusHi: number; // мятные жетоны оживают (0…1)
  readonly plusScale: number;
}> = ({ scroll, wave, ring, bonusHi, plusScale }) => {
  const t = BG35_TEXT.ask;
  const [num, ...word] = t.cardTitle.split(" ");
  const sp = t.cardBadge.indexOf(" ");
  const plus = t.cardBadge.slice(0, sp);
  const badgeRest = t.cardBadge.slice(sp + 1);
  const [rideLbl, route] = t.cardRoute.split(" = ");
  const tokX = (i: number) => (CARD.w - 9 * TOK.gap) / 2 + i * TOK.gap;
  const ringA = Math.sin(Math.PI * ring);
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #FFFFFF 0%, #F3F6FB 100%)", fontFamily, color: C.navy })}>
      {/* строка состояния */}
      <div style={box({ left: 44, top: 24, fontSize: 27, fontWeight: 800 })}>16:40</div>
      <div style={box({ right: 44, top: 30, display: "flex", alignItems: "flex-end", gap: 5 })}>
        {[10, 15, 20].map((h) => (
          <div key={h} style={{ width: 7, height: h, borderRadius: 2, backgroundColor: C.navy }} />
        ))}
        <div style={{ marginLeft: 10, width: 42, height: 20, borderRadius: 6, border: `3px solid ${C.navy}`, boxSizing: "border-box", padding: 2 }}>
          <div style={{ width: "72%", height: "100%", borderRadius: 2, backgroundColor: C.navy }} />
        </div>
      </div>
      <div style={box({ left: 0, top: 0, width: IW, height: 1400, translate: `0 ${scroll}px` })}>
        <Logo x={78} y={130} size={84} />
        <div style={box({ left: 134, top: 98, fontSize: 48, fontWeight: 900 })}>{BG35_TEXT.cta.brand}</div>
        <div
          style={box({
            left: CARD.left,
            top: CARD.top,
            width: CARD.w,
            height: CARD.h,
            borderRadius: 40,
            backgroundColor: "#FFFFFF",
            border: `3px solid ${C.line}`,
            boxSizing: "border-box",
            boxShadow: "0 18px 40px rgba(20,40,90,0.12)",
            overflow: "hidden",
          })}
        >
          <div style={box({ left: 0, right: 0, top: 0, height: 16, backgroundColor: C.yellow })} />
        </div>
        <div style={box({ left: CARD.left, top: CARD.top, width: CARD.w, height: CARD.h })}>
          {/* «20 сапар» */}
          <div style={box({ left: 0, width: CARD.w, top: 42, textAlign: "center", fontSize: 112, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1 })}>
            <span style={{ background: `linear-gradient(180deg, transparent 60%, ${C.yellow} 60%, ${C.yellow} 86%, transparent 86%)`, padding: "0 6px" }}>{num}</span> {word.join(" ")}
          </div>
          {/* 20 оплаченных жетонов */}
          {Array.from({ length: 20 }).map((_, i) => {
            const k = i % 10;
            const row = Math.floor(i / 10);
            // волна по жетонам слева направо (оба ряда — по столбцам)
            const g = clamp(1 - Math.abs(wave * 1.4 - 0.2 - (k / 9) * 1.0) / 0.2);
            return <Token key={i} kind="paid" x={tokX(k)} y={TOK.top + row * TOK.gap - 10 * g} r={TOK.r * (1 + 0.12 * g)} glow={g} lift={0.8 * g} />;
          })}
          {/* «+2 сапар акысыз» */}
          <div
            style={box({
              left: PILL.left,
              top: PILL.top,
              width: CARD.w - 2 * PILL.left,
              height: PILL.h,
              borderRadius: PILL.h / 2,
              backgroundColor: C.mintSoft,
              border: `${PILL.border}px solid ${C.mint}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              paddingLeft: PILL.pad,
              boxShadow: `0 0 0 ${4 + 18 * ring}px rgba(159,221,184,${0.55 * ringA}), 0 8px 18px rgba(46,139,87,${0.12 + 0.1 * bonusHi})`,
            })}
          >
            <span style={{ width: PILL.plusW, textAlign: "center", fontSize: 58, fontWeight: 900, color: C.mintDeep, flex: "none", scale: `${plusScale}` }}>{plus}</span>
            <span style={{ marginLeft: 8, fontSize: 36, fontWeight: 900, color: C.mintDeep, whiteSpace: "nowrap", flex: "none" }}>{badgeRest}</span>
            <div style={{ position: "relative", marginLeft: "auto", marginRight: 22, width: 82, height: 40, flex: "none" }}>
              {[0, 1].map((j) => (
                <Token key={j} kind="bonus" x={19 + j * 44} y={20 - 8 * Math.sin(Math.PI * clamp(bonusHi * 1.6 - j * 0.4))} r={19} glow={bonusHi} />
              ))}
            </div>
          </div>
          {/* разделитель */}
          <div style={box({ left: 34, right: 34, top: 428, height: 0, borderTop: `3px dashed ${C.line}` })} />
          {/* 1 сапар = ҮЙ → МЕКТЕП → ҮЙ */}
          <div style={box({ left: 0, width: CARD.w, top: 448, textAlign: "center", fontSize: 32, fontWeight: 800, color: C.muted })}>{`${rideLbl} =`}</div>
          <div
            style={box({
              left: 26,
              width: CARD.w - 52,
              top: 494,
              height: 84,
              borderRadius: 26,
              backgroundColor: C.yellowSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 900,
              whiteSpace: "nowrap",
            })}
          >
            <Txt>{route}</Txt>
          </div>
          {/* сыноо — өзүнчө */}
          <TrialChip x={30 + 34} y={612 + 36} size={68} />
          <div style={box({ left: 118, right: 24, top: 610, fontSize: 31, fontWeight: 800, color: C.ink, lineHeight: 1.2 })}>{t.cardTrial}</div>
        </div>
      </div>
    </div>
  );
};

// Пузырь вопроса рядом с лицом: «+2» и «?» (без слов).
const AskBubble: React.FC<{ readonly x: number; readonly y: number; readonly a: number; readonly q: number; readonly wob: number }> = ({ x, y, a, q, wob }) => {
  if (a <= 0) return null;
  return (
    <div style={box({ left: x, top: y, width: 1, height: 1, scale: `${1.18 * a}`, transformOrigin: "0 0", opacity: clamp(a * 2) })}>
      <svg width={300} height={200} viewBox="0 0 300 200" style={box({ left: -36, top: -196, overflow: "visible" })}>
        <path d="M 60 150 Q 30 186 4 192 Q 46 184 92 156 Z" fill="#FFFFFF" stroke={C.navy} strokeWidth={6} strokeLinejoin="round" />
        <rect x={20} y={6} width={276} height={150} rx={52} fill="#FFFFFF" stroke={C.navy} strokeWidth={6} />
        <path d="M 58 152 Q 72 150 92 154" stroke="#FFFFFF" strokeWidth={10} />
      </svg>
      <div style={box({ left: 6, top: -176, width: 140, height: 104, borderRadius: 52, backgroundColor: C.mint, border: `5px solid ${C.mintDeep}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily, fontSize: 64, fontWeight: 900, color: "#FFFFFF", textShadow: `0 3px 0 ${C.mintDeep}` })}>
        +2
      </div>
      <div
        style={box({
          left: 160,
          top: -196,
          width: 90,
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          fontSize: 120,
          fontWeight: 900,
          color: C.yellow,
          WebkitTextStroke: `5px ${C.navy}`,
          paintOrder: "stroke fill",
          scale: `${q}`,
          rotate: `${wob}deg`,
          opacity: clamp(q * 3),
        })}
      >
        ?
      </div>
    </div>
  );
};

// Отдельная гладкая «вспышка»: 0 → 1 → 0 за d кадров с начала t0.
const bump = (f: number, t0: number, d: number) => {
  const u = (f - t0) / d;
  return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u);
};

export const AskScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const m01 = useLine("m01");
  const wTwo = useWordAt("m01", M01_WORDS.two);
  const wWhy = useWordAt("m01", M01_WORDS.why);

  // ---------- шкала сцены (от фактической речи) ----------
  const outAt = frames - ASK.outFrames; // наезд в «+2»
  const bStart = Math.max(30, m01.from - ASK.closeBefore); // подъезд к лицу
  // после вопроса: камера к телефону в руке, затем POV (полностью — cStart)
  const pushAt = Math.max(bStart + 26, Math.min(m01.to + ASK.pushAfter, outAt - 86));
  const povFrom = pushAt + (ASK.povAfter - ASK.pushAfter); // POV проявляется
  const cStart = povFrom + 7; // POV полностью
  const backAt = Math.max(m01.from + 14, m01.to - 4); // мама снова смотрит в телефон
  const cLen = outAt - cStart;
  const fingerIn = cStart + Math.round(clamp(cLen * 0.16, 10, 22));
  const fingerAt = fingerIn + Math.round(clamp(cLen * 0.2, 14, 22));

  // ---------- камера комнаты ----------
  const cam: Cam =
    f < bStart - 12
      ? camMove(f, 0, bStart - 12, WIDE_A, WIDE_B)
      : f < bStart + 6
        ? camMove(f, bStart - 12, bStart + 6, WIDE_B, CLOSE_A, anticipate)
        : f < pushAt
          ? camMove(f, bStart + 6, pushAt, CLOSE_A, CLOSE_B)
          : camMove(f, pushAt, pushAt + 14, CLOSE_B, PHONE_CAM, easeInOut);
  const roomBlur = 18 * easeInOut((f - pushAt) / 10);

  // ---------- мама ----------
  // чтение (веки опущены к экрану) → задумчиво → вопрос (брови вверх)
  const READING: Expression = { ...EXPR.calm, lid: 0.26 };
  const THINK: Expression = { ...EXPR.thinking, lid: 0.24 };
  const CURIOUS: Expression = { browIn: 5, browOut: 6, lid: 0.03, smile: 0.16 };
  const exprAt = (t: number): Expression => {
    const think = clamp((t - 30) / 12);
    const cur = clamp((t - (m01.from - 4)) / 8) * (1 - clamp((t - backAt) / 12));
    const back = clamp((t - backAt) / 12);
    const base = mixExpr(mixExpr(READING, THINK, think), READING, back);
    return mixExpr(base, CURIOUS, cur);
  };
  // пролистывание большим пальцем: короткие «щелчки» кисти
  const flicks = [12, 40, bStart - 22];
  const flick = (t: number) => flicks.reduce((s, t0) => s + bump(t, t0, 8), 0);
  const phoneHand = (t: number): Vec => {
    const base = keysV(
      t,
      [
        [0, PHONE_READ],
        [m01.from - 2, PHONE_READ],
        [m01.from + 10, PHONE_LOW],
        [backAt, PHONE_LOW],
        [backAt + 14, PHONE_READ],
      ],
      anticipate,
    );
    return { x: base.x, y: base.y - 4 * flick(t) };
  };
  const gestureUp = wWhy - 6;
  const gestureDown = Math.max(gestureUp + 14, m01.to - 8);
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: SEAT,
    lean: keys(t, [
      [0, 5],
      [bStart, 5],
      [bStart + 10, 1],
      [backAt, 1],
      [backAt + 14, 5],
    ]),
    expr: exprAt(t),
    // чтение: глаза бегут по строкам, голова чуть опущена
    lookX: keys(t, [
      [m01.from - 4, 0.12 * Math.sin(t / 7)],
      [m01.from + 4, 0],
    ]),
    lookY: keys(t, [
      [0, 1],
      [m01.from - 3, 1],
      [m01.from + 5, 0.02],
      [backAt + 2, 0.02],
      [backAt + 10, 1],
    ]),
    nod: keys(t, [
      [0, 8 + 1.2 * Math.sin(t / 9)],
      [m01.from - 4, 8],
      [m01.from + 6, -1],
      [backAt + 2, -1],
      [backAt + 12, 8],
    ]),
    headTilt: keys(t, [
      [m01.from, 0],
      [m01.from + 12, 6],
      [backAt + 2, 5],
      [backAt + 14, 1],
    ]),
    armR: {
      target: phoneHand(t),
      shape: "phone",
      item: "phone",
      glow: 1,
      itemTilt: -6 + 5 * flick(t),
      wrist: -8 * flick(t),
      elbow: "hang",
      behind: false,
    },
    armL: {
      target: keysV(
        t,
        [
          [gestureUp, L_REST],
          [gestureUp + 10, L_ASK],
          [gestureDown, L_ASK],
          [gestureDown + 12, L_REST],
        ],
        anticipate,
      ),
      shape: t > gestureUp + 2 && t < gestureDown + 6 ? "open" : "relax",
      // в покое кисть лежит вдоль бедра; на вопросе — открытая ладонь
      wrist: keys(t, [
        [gestureUp, L_REST_WRIST],
        [gestureUp + 8, -16],
        [gestureDown + 2, -16],
        [gestureDown + 10, L_REST_WRIST],
      ]),
      elbow: "hang",
      behind: false,
    },
  });
  const momFace = (t: number) =>
    keys(t, [
      [0, 0.24],
      [m01.from - 4, 0.24],
      [m01.from + 6, 0.06],
      [backAt + 2, 0.06],
      [backAt + 14, 0.2],
    ]);
  const blinks = [34, Math.max(bStart + 10, m01.to - 2)];

  const room = (uid: string, withMom: boolean) => (
    <>
      <RoomBack f={f} />
      <ArmchairBack />
      {withMom ? <Actor uid={`${uid}-mom`} look="mom" f={f} place={MOM_AT} face={momFace} pose={momPose} role="mother" seed={3} blinks={blinks} layer="body" /> : null}
      <ArmchairFront />
      {withMom ? <Actor uid={`${uid}-mom`} look="mom" f={f} place={MOM_AT} face={momFace} pose={momPose} role="mother" seed={3} blinks={blinks} layer="arms" /> : null}
    </>
  );

  // ---------- ирис из бумаги ----------
  // (виден с первого кадра: стыкуется с бумагой в конце хука без пустых кадров)
  const iris = easeOut(f / ASK.iris);
  const irisC = toScreen(HEAD, WIDE_A);
  const irisR = 120 + 1380 * iris;

  // ---------- пузырь вопроса ----------
  const headS = toScreen(HEAD, cam);
  const bubbleA = pop(f, wTwo - 2, 12) * (1 - easeIn((f - backAt) / 10));
  const qA = pop(f, wWhy, 12);
  const wob = 8 * Math.sin((f - wWhy) / 5) * Math.exp(-Math.max(0, f - wWhy) / 18);
  const bubbleX = Math.min(930 - 1.18 * 300, headS.x + 200);
  const bubbleY = Math.max(260 + 1.18 * 196, headS.y - 110);

  // ---------- POV: телефон в руке ----------
  const povT = easeOut((f - povFrom) / 7);
  const rise = 1 - easeOut((f - povFrom) / 15);
  const out = easeIn((f - outAt) / ASK.outFrames);
  const settle = 1 - out;
  const rot = -1.4 + 0.45 * Math.sin(f / 31) * settle;
  const wx = 3 * Math.sin(f / 23) * settle;
  const wy = 4 * Math.sin(f / 29 + 1) * settle + 520 * rise;
  const scroll = 64 * (1 - easeInOut((f - (cStart + 2)) / 16));
  const wave = clamp((f - (cStart + 6)) / 26);
  const ringCycle = f >= fingerAt ? ((f - fingerAt) % 30) / 30 : 0;
  const ring = f >= fingerAt ? ringCycle : 0;
  const bonusHi = clamp((f - fingerAt + 2) / 12);
  const plusScale = 1 + 0.06 * (f >= fingerAt ? Math.sin(Math.PI * ringCycle) : 0) + 0.12 * bump(f, fingerAt - 2, 10);
  // кончик пальца: из-за левого края кадра к краю плашки «+2»
  const tipRest = inToPage(TIP_IN);
  const tip = keysV(
    f,
    [
      [fingerIn, { x: -260, y: 1480 }],
      [fingerAt - 6, { x: tipRest.x + 12, y: tipRest.y - 8 }],
      [fingerAt + 4, tipRest],
    ],
    (x) => easeOut(x),
  );
  const tipRot = keys(f, [
    [fingerIn, -40],
    [fingerAt - 4, -14],
    [fingerAt + 6, -17],
  ]);
  const tipLift = 1 - clamp((f - fingerAt + 6) / 10);
  const breathe = f >= fingerAt + 4 ? 1.6 * Math.sin((f - fingerAt) / 9) : 0;
  // наезд: в центр «+2» на экране (сдвиг и зум разгоняются вместе — без рывка)
  const plusScr = pageToScreen(rotAbout(inToPage(PLUS2_IN), PH_C, -1.4));
  const outU = clamp((f - outAt) / ASK.outFrames);
  const zoomOut = 1 + 2.4 * Math.pow(outU, 1.6);
  const toCenter = smoothstep(clamp(outU * 1.4));
  // бумага: полностью за 3 кадра до конца сцены (последний кадр — чистый C.paper)
  const paper = easeInOut((f - (outAt + 3)) / (ASK.outFrames - 6));
  const showPov = f >= povFrom;
  const showRoom = f < cStart + 8;

  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: C.paper })}>
      {showRoom ? (
        <div
          style={box({
            inset: 0,
            clipPath: iris < 1 ? `circle(${irisR}px at ${irisC.x}px ${irisC.y}px)` : undefined,
            filter: roomBlur > 0.2 ? `blur(${roomBlur}px)` : undefined,
          })}
        >
          <Shot f={f} from={0} to={frames} cam={cam} base={WIDE_A} bg="#F5EFE5">
            {room("ask", true)}
          </Shot>
        </div>
      ) : null}
      {iris < 1 ? (
        <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
          <circle cx={irisC.x} cy={irisC.y} r={irisR} fill="none" stroke={C.yellow} strokeWidth={14} opacity={1 - iris} />
        </svg>
      ) : null}
      {showRoom ? <AskBubble x={bubbleX} y={bubbleY} a={bubbleA} q={qA} wob={wob} /> : null}
      {showPov ? (
        <div style={box({ inset: 0, opacity: povT })}>
          {/* фон: та же гостиная, не в фокусе */}
          <div style={box({ inset: -40, filter: "blur(18px) brightness(1.04) saturate(0.9)" })}>
            <Shot f={f} from={0} to={frames} cam={POV_BG} bg="#F5EFE5">
              <RoomBack f={f} />
              <ArmchairBack />
            </Shot>
          </div>
          <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 52%, rgba(255,253,247,0.25) 0%, rgba(255,253,247,0.55) 75%)" })} />
          <div
            style={box({
              inset: 0,
              transform: `translate(${(540 - plusScr.x) * toCenter}px, ${(900 - plusScr.y) * toCenter}px) scale(${zoomOut})`,
              transformOrigin: `${plusScr.x}px ${plusScr.y}px`,
            })}
          >
            {/* кадрирование POV (координаты страницы → экран) */}
            <div style={box({ left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${POV_OFF.x}px, ${POV_OFF.y}px) scale(${POV_S})`, transformOrigin: "0 0" })}>
              <div style={box({ inset: 0, transform: `translate(${wx}px, ${wy}px) rotate(${rot}deg)`, transformOrigin: `${PH_C.x}px ${PH_C.y}px` })}>
                {/* ладонь и рукав — за корпусом телефона */}
                <HoldingHand x={PH.x} y={HOLD_Y} w={PH.w} sleeve={LOOKS.mom.topColor} skin={LOOKS.mom.skin} side={1} />
                <PhoneFrame x={PH.x} y={PH.y} w={PH.w}>
                  <PackageCard scroll={scroll} wave={wave} ring={ring} bonusHi={bonusHi} plusScale={plusScale} />
                </PhoneFrame>
                <HoldingFront />
                {f >= fingerIn ? <PointingHand x={tip.x} y={tip.y + breathe} rot={tipRot} lift={tipLift} /> : null}
              </div>
            </div>
          </div>
          {/* подпись уходит до начала наезда (затухание — 8 кадров) */}
          <Caption f={f} at={cStart + 4} out={outAt - 8} text={BG35_TEXT.ask.caption} top={272} size={62} />
        </div>
      ) : null}
      {paper > 0 ? <div style={box({ inset: 0, backgroundColor: C.paper, opacity: paper })} /> : null}
      {/* лёгкая «мягкая» подсветка кадра при переходе к телефону */}
      {f >= pushAt && f < cStart + 4 ? <div style={box({ inset: 0, backgroundColor: "#FFFFFF", opacity: 0.18 * bump(f, pushAt + 2, 16) })} /> : null}
    </div>
  );
};
