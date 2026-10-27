// Сцена 1. Детское заявление.
// A. Вид сверху со стороны папы: руки папы на клавиатуре; детская рука
//    (жёлтый рукав) кладёт лист на стол и отпускает — мягкий звук бумаги;
//    папины пальцы останавливаются.
// B. Фронтальный план: папа переводит взгляд с листа на сына; лёгкое
//    удивление. Сын стоит у края стола, спокоен. Рты закрыты — говорит
//    рассказчик.
// C. Крупно: «АРЫЗ» и текст просьбы (читается).
// D. На «тогуз»: «9 ЖАШ» на оранжевом поле — цифра входит с подготовкой и
//    быстро успокаивается; бумажный круг падает и коротко сплющивается.
// E. Название фильма тяжёлыми строками; под ним тот же лист — он
//    заполняет кадр и становится плоскостью стола (Transitions).
import { AbsoluteFill } from "remotion";
import { Actor } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { NY2_TEXT } from "../script";
import { C, F } from "../theme";
import { box, HeavyLine, Paper, settle, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { LetterArt } from "../props/Letter";
import { CloseHand, SKIN } from "../props/CloseHand";
import { LaptopFront } from "../props/Laptop";
import { DadChairBack, DadDeskFront, GuestChairBack, GuestChairSeat, OFFICE, OfficeWall, PaperOnDesk } from "../sets/Office";
import { H, seatOf } from "./common";

// Лист под названием фильма (кадр 1080×1920) — из него вырастает переход.
export const LETTER_FINAL = { x: 380, y: 1010, w: 320, h: 442 } as const;

export const letterPlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "letter");
  return {
    handIn: 2,
    land: 26,
    release: 34,
    handOut: 50,
    shotB: 58,
    shotC: Math.max(110, T.word("N01", "Анда") - 3),
    shotD: T.word("N01", "тогуз") - 2,
    shotE: Math.max(T.word("N01", "тогуз") + 40, T.to("N01") + 8),
    len: T.len,
  };
};

// ---------- A. Вид сверху ----------
const TopDown: React.FC<{ f: number; p: ReturnType<typeof letterPlan> }> = ({ f, p }) => {
  // путь листа: из-за верхнего правого края к месту на столе
  const u = easeOut(clamp((f - p.handIn) / (p.land - p.handIn)));
  const pos = { x: lerp(980, 610, u), y: lerp(-260, 860, u) };
  const rot = lerp(-24, -5, u);
  const sc = f < p.land ? 1.05 : 1 + 0.05 * (1 - easeOut(clamp((f - p.land) / 6)));
  // рука отпускает угол листа и уходит
  const off = easeInOut(clamp((f - p.release) / (p.handOut - p.release)));
  const corner = { x: pos.x + 250, y: pos.y - 330 };
  const hand = { x: corner.x + 30 + off * 420, y: corner.y - 30 - off * 560 };
  // пальцы папы печатают, на касании листа останавливаются
  const typing = f < p.land - 4;
  const lift = (k: number) => (typing ? (Math.sin(f * 1.3 + k * 2.1) > 0.2 ? 1 : 0) : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#F7F4EC" }}>
      <Paper color="#F7F4EC" dots="rgba(17,17,17,0.06)" step={64} x={0} y={0} w={1080} h={1920} />
      {/* край стола и пол за ним */}
      <div style={box({ left: 0, top: 0, width: 1080, height: 120, backgroundColor: C.floor })} />
      <div style={box({ left: 0, top: 110, width: 1080, height: 16, backgroundColor: "#DCD5C6" })} />
      {/* ноутбук: верхний край крышки (тонкая планка) и клавиатура */}
      <Svg>
        <path d="M 40 1350 L 760 1350 L 790 1920 L 10 1920 Z" fill="#C3C8D0" />
        <rect x={34} y={1318} width={732} height={36} rx={12} fill="#2B2F38" />
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 11 }).map((__, c) => <rect key={`${r}-${c}`} x={70 + c * 62 - r * 3} y={1392 + r * 64} width={52} height={52} rx={8} fill="#5B616C" />),
        )}
        <CloseHand x={250} y={1860} angle={170} size={190} {...SKIN.dad} shape="rest" mirror lift={lift(0)} />
        <CloseHand x={560} y={1870} angle={186} size={190} {...SKIN.dad} shape="rest" lift={lift(1)} />
        <g transform={`translate(${pos.x} ${pos.y}) rotate(${rot}) scale(${sc})`}>
          <LetterArt w={540} />
        </g>
        {f < p.handOut + 2 ? <CloseHand x={hand.x} y={hand.y} angle={34} size={150} {...SKIN.boy} shape="pinch" armLen={5} mirror /> : null}
      </Svg>
    </AbsoluteFill>
  );
};

// ---------- B. Фронтальный план ----------
const Front: React.FC<{ f: number; p: ReturnType<typeof letterPlan> }> = ({ f, p }) => {
  const t = f - p.shotB; // кадры от начала плана
  const dad = { x: OFFICE.dadSeat.x, y: OFFICE.floorY, h: H.dad };
  const boy = { x: 770, y: OFFICE.seatY + 8, h: H.boy };
  const dadPose = (tt: number) => {
    const k = tt - p.shotB;
    return {
      sit: 1,
      seat: seatOf(H.dad),
      expr: k < 14 ? ("neutral" as const) : k < 40 ? ("surprised" as const) : ("calm" as const),
      // взгляд: лист → (голова за глазами) → сын
      lookY: keys(k, [[0, 0.75], [12, 0.75], [18, 0.05]]),
      lookX: keys(k, [[0, 0.4], [12, 0.4], [18, 0.2]]),
      armL: { target: { x: 340, y: 1150 }, shape: "relax" as const, elbow: "down" as const },
      armR: { target: { x: 470, y: 1150 }, shape: "relax" as const, elbow: "down" as const },
    };
  };
  const dadFace = (tt: number) => keys(tt - p.shotB, [[0, 0.25], [14, 0.25], [24, 0.6]]);
  const boyPose = () => ({
    expr: "neutral" as const,
    armL: { target: { x: boy.x - 0.12 * boy.h, y: boy.y - 0.42 * boy.h }, shape: "relax" as const, elbow: "down" as const },
    armR: { target: { x: boy.x + 0.12 * boy.h, y: boy.y - 0.42 * boy.h }, shape: "relax" as const, elbow: "down" as const },
    lookY: 0.15,
    badge: 1,
  });
  // камера: чуть ближе к лицам к концу плана
  const zoom = lerp(1.42, 1.5, easeInOut(clamp(t / 60)));
  return (
    <Shot f={f} cam={{ x: 600, y: 1040, zoom }} bg={C.wall}>
      <OfficeWall />
      <GuestChairBack x={OFFICE.dadChair.x} color={C.yellow} />
      <GuestChairSeat x={OFFICE.dadChair.x} color={C.yellow} />
      <DadChairBack />
      <Actor uid="l1-dad" look="dadIT" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} />
      <LaptopFront x={OFFICE.laptop.x} y={OFFICE.laptop.y} w={OFFICE.laptop.w} open={1} />
      <DadDeskFront />
      <PaperOnDesk x={OFFICE.paper.x} y={OFFICE.paper.y} />
      <GuestChairBack x={OFFICE.boyChair.x} />
      <GuestChairSeat x={OFFICE.boyChair.x} />
      <Actor uid="l1-boy" look="bektur" f={f} place={() => boy} face={() => -0.45} pose={boyPose} role="son" seed={4} blinkShift={37} />
    </Shot>
  );
};

// ---------- C. Лист крупно ----------
const Close: React.FC<{ f: number; p: ReturnType<typeof letterPlan> }> = ({ f, p }) => {
  const t = f - p.shotC;
  const z = lerp(1.07, 1, easeOut(clamp(t / 12)));
  return (
    <AbsoluteFill>
      <Paper />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <g transform={`translate(540 1010) scale(${z}) rotate(-2)`}>
          <LetterArt w={790} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- D. «9 ЖАШ» ----------
const Age: React.FC<{ f: number; p: ReturnType<typeof letterPlan> }> = ({ f, p }) => {
  const t = f - p.shotD;
  // цифра: подготовка (опускается) → резко вверх → короткая остановка
  const prep = t < 4 ? easeOut(t / 4) * 30 : 0;
  const k = settle(t - 4, 12);
  const y9 = t < 4 ? 260 + prep : lerp(260, 0, k);
  // бумажный круг: падает, касается, коротко сплющивается и выпрямляется
  const fall = clamp((t - 2) / 12);
  const cy = lerp(-200, 1530, fall * fall);
  const land = t - 14;
  const squash = land >= 0 && land < 8 ? Math.sin((Math.PI * land) / 8) * 0.22 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.orange, overflow: "hidden" }}>
      <div style={box({ left: 190 - 120 * (1 + squash), top: cy - 120 * (1 - squash) * 2 + 120, width: 240 * (1 + squash), height: 240 * (1 - squash), borderRadius: "50%", backgroundColor: C.paper })} />
      <div style={box({ left: 70, top: 300, transform: `translateY(${y9}px)`, opacity: clamp(t / 3) })}>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 1100, lineHeight: 0.8, color: C.ink, letterSpacing: -40 }}>9</div>
      </div>
      <div style={box({ right: 70, top: 1180 })}>
        <HeavyLine text={NY2_TEXT.age.split(" ")[1]} t={t - 7} size={250} from="right" dist={500} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- E. Название ----------
const Title: React.FC<{ f: number; p: ReturnType<typeof letterPlan> }> = ({ f, p }) => {
  const t = f - p.shotE;
  const r = LETTER_FINAL;
  const k = settle(t - 10, 14);
  return (
    <AbsoluteFill>
      <Paper />
      <div style={box({ left: 80, top: 330 })}>
        <HeavyLine text={NY2_TEXT.filmTitle[0]} t={t} size={112} />
        <HeavyLine text={NY2_TEXT.filmTitle[1]} t={t - 4} size={112} from="right" />
        <HeavyLine text={NY2_TEXT.filmTitle[2]} t={t - 8} size={150} color={C.orange} />
      </div>
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <g transform={`translate(${r.x + r.w / 2} ${r.y + r.h / 2 + (1 - k) * 160}) rotate(${-2 + (1 - k) * 6})`} opacity={clamp((t - 10) / 4)}>
          <LetterArt w={r.w} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const LetterScene: React.FC = () => {
  const { f } = useScene("letter");
  const p = usePlan(letterPlan);
  if (f < p.shotB) return <TopDown f={f} p={p} />;
  if (f < p.shotC) return <Front f={f} p={p} />;
  if (f < p.shotD) return <Close f={f} p={p} />;
  if (f < p.shotE) return <Age f={f} p={p} />;
  return <Title f={f} p={p} />;
};

