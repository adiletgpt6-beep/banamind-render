// Шаг 1/6 «Маалымат калтырасыз». Начало — тот же отправленный пузырь,
// что в конце хука. Из-под его нижнего края выдвигается сложенная
// гармошкой бумажная лента; телефон растворяется, камера въезжает в
// сообщение — и мы уже в мире ленты. Руки мамы берут ленту за нижние
// углы и тянут: панель 1 разворачивается на сгибе. Карточки Үй / Мектеп /
// Убакыт ложатся штампами на словах диктора, строка — на «билдиресиз»,
// пунктир с машинкой на паузе — на «Бул … дароо». В конце камера уходит
// к сгибу 2, руки перехватывают ленту ниже, язычок «2/6» покачивается.
import { useCurrentFrame } from "remotion";
import { useLine, useScene, useWordMatch } from "../context";
import { box, camKeys, Paper, Shot, StepHead, type Cam } from "../kit";
import { P1Art, p1CardCenter } from "../panels/P1";
import { SCR } from "../props/Phone";
import { panelTop, Ribbon, RIB, RIB_X } from "../ribbon";
import { clamp, easeIn, easeInOut, easeOut, lerp, smoothstep } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { SFX, type SceneSfx } from "../sfx";
import { camOnFold } from "../stage";
import { C, F } from "../theme";
import { lineIn, wordMatchIn } from "../timing";
import { bubbleBottomFrame, PhoneInHands, SentBubble, SentChat } from "./hook-phone";
import { HoldHands } from "./step1-hands";
import { MomWithRibbon } from "./step1-insert";

// Телефон крупного плана (координаты кадра) кладётся в мир ленты с
// масштабом G так, что низ отправленного пузыря — ровно над верхним
// краем ленты (пачка сложенных листов выходит из-под пузыря).
const G = 2.0;
const BB = bubbleBottomFrame();
const Y0 = -2;
const GT = { x: 540 - BB.x * G, y: Y0 - BB.y * G };
const SCR_C = { x: SCR.x + SCR.w / 2, y: SCR.y + SCR.h / 2 };
const SC_W = { x: GT.x + SCR_C.x * G, y: GT.y + SCR_C.y * G };
// камера, при которой телефон выглядит как в конце хука (экран в той же
// точке кадра и того же размера)
const CAM0: Cam = { x: SC_W.x, y: SC_W.y + (960 - SCR_C.y) * G, zoom: 1 / G };

// Планы ленты: тексты панели — в безопасной зоне x 70…930.
const CAM_PANEL: Cam = { x: 580, y: 383, zoom: 1.08 };
const CAM_CARDS: Cam = { x: 578, y: 360, zoom: 1.14 };
const CAM_PATH: Cam = { x: 578, y: 420, zoom: 1.12 };

// Толщина пачки сложенных листов, пока она висит под пузырём.
const PACK_K = 3.2;

// Низ панели, которая разворачивается (как в Ribbon).
const panelBottom = (n: number, u: number) => panelTop(n) + RIB.h * Math.cos(((90 * (1 - easeInOut(clamp(u)))) * Math.PI) / 180);

export const Step1Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const n01 = useLine("n01");
  const wDar = useWordMatch("n01", "дарегин");
  const wMek = useWordMatch("n01", "мектепти");
  const wUb = useWordMatch("n01", "убактысын");
  const wBil = useWordMatch("n01", "билдиресиз");
  const wBul = useWordMatch("n01", "бул");
  const wNow = useWordMatch("n01", "дароо");

  // --- разворот панели 1 до начала речи ---
  const U1 = Math.max(34, n01.from - 4);
  const U0 = U1 - 20;
  const unfold = clamp((f - U0) / (U1 - U0));
  const packIn = easeOut((f - (U0 - 15)) / 11); // пачка выходит из-под пузыря
  // телефон уходит вниз и растворяется, пузырь остаётся висеть
  const phoneOut = easeIn((f - (U0 - 17)) / 15);
  const phoneO = 1 - smoothstep((f - (U0 - 12)) / 10);
  const bubbleO = 1 - smoothstep((f - (U0 + 4)) / 12);
  const warmO = 1 - smoothstep((f - (U0 - 12)) / 16);
  // пачка сложенных листов сначала толще (видна издалека), при развороте
  // становится обычным краем ленты
  const packK = lerp(PACK_K, 1, easeInOut(unfold));
  const edgeY = panelBottom(1, unfold) - 4;

  // --- камера ---
  const endA = frames - 34;
  const endB = frames - 6;
  const cam0z: Cam = { ...CAM0, zoom: CAM0.zoom * 1.04 };
  let cam = camKeys(f, [
    [0, CAM0],
    [U0 - 8, cam0z],
    [U1 + 6, CAM_PANEL],
    [wDar, { ...CAM_PANEL, y: 376, zoom: 1.1 }],
    [wUb + 12, CAM_CARDS],
    [wBul - 4, { ...CAM_CARDS, y: 380 }],
    [wNow + 8, CAM_PATH],
    [endA, { ...CAM_PATH, y: 440 }],
    [endB, camOnFold(2)],
  ]);
  // лёгкий дрейф, пока камера «стоит»
  const drift = smoothstep((f - U1) / 20) * (1 - smoothstep((f - endA) / 10));
  cam = { ...cam, x: cam.x + Math.sin(f / 47) * 4 * drift, y: cam.y + Math.sin(f / 61) * 5 * drift };

  // --- руки мамы ---
  const handsShow = easeOut((f - (U0 - 9)) / 12);
  const regrip = easeInOut((f - endA) / 22);
  // руки держат пачку ещё сложенных листов под последней панелью
  const holdY = edgeY + 18 * packK + 10 * regrip;
  const lift = Math.sin(Math.PI * clamp(regrip * 1.15)) * 1;
  const spread = Math.sin(Math.PI * regrip) * 26;
  const hold = { y: holdY, show: handsShow, lift, spread, size: 1.0 };
  const wobble = smoothstep((f - (endA + 6)) / 10) * (0.5 - 0.5 * Math.cos((f - endA) / 4.2));

  // --- печать панели 1 по словам ---
  const show = {
    cards: [f - wDar, f - wMek, f - wUb] as const,
    row: f - wBil,
    path: f - wNow,
  };
  const art = <P1Art t={f - U1} show={show} />;

  // врезка: мама смотрит на ленту в руках (пауза после «билдиресиз.»)
  const insA = wBil + 12;
  const insB = wBul + 4;
  const insO = smoothstep((f - insA) / 6) * (1 - smoothstep((f - (insB - 6)) / 6));
  const headT = f - (U1 - 4);
  const headOut = smoothstep((f - (frames - 22)) / 12);
  return (
    <div style={box({ inset: 0, backgroundColor: C.bg })}>
      <Shot f={f} cam={cam} bg={C.bg}>
        <Paper />
        {/* тёплый фон крупного плана хука растворяется при въезде в ленту */}
        {warmO > 0.001 ? <div style={box({ left: -3000, top: -4000, width: 7000, height: 8000, backgroundColor: "#F5E6CB", opacity: warmO })} /> : null}
        <div style={box({ left: RIB_X + 30, top: panelTop(1) + 40, width: RIB.w - 60, height: RIB.h * unfold - 20, borderRadius: 30, backgroundColor: "rgba(20,40,90,0.05)", filter: "blur(18px)", opacity: unfold })} />
        {/* телефон крупного плана в мире ленты (чат без пузыря: пузырь —
            отдельным слоем сверху, он остаётся, когда телефон уходит) */}
        {phoneO > 0.001 ? (
          <div style={box({ left: GT.x, top: GT.y, width: 1080, height: 1920, transformOrigin: "0 0", transform: `scale(${G}) translateY(${phoneOut * 760}px)`, opacity: phoneO })}>
            <PhoneInHands f={f} taps={[]} pointer={false}>
              <SentChat draft={false} sent={0} />
            </PhoneInHands>
          </div>
        ) : null}
        <HoldHands f={f} spec={hold} layer="back" />
        {/* лента: панель 1 на сгибе; край ещё сложенных листов — свой,
            толще, пока лента — пачка под пузырём */}
        {unfold > 0.001 ? <Ribbon panels={[{ n: 1, unfold, art }]} showEdge={false} /> : null}
        {unfold > 0.001 ? (
          <PackEdge x={RIB_X} y={edgeY} rest={RIB.count - 1} thick={packK} next={2} wobble={wobble} />
        ) : (
          <PackEdge x={RIB_X} y={-4 - (1 - packIn) * 70} rest={RIB.count} thick={packK} />
        )}
        {/* пузырь поверх пачки (лента выходит именно из него) */}
        {bubbleO > 0.001 ? (
          <div style={box({ left: GT.x, top: GT.y, width: 1080, height: 1920, transformOrigin: "0 0", transform: `scale(${G})`, opacity: bubbleO })}>
            <div style={box({ left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h })}>
              <SentBubble mark={smoothstep((f - (U0 - 14)) / 8) * bubbleO} />
            </div>
          </div>
        ) : null}
        <StampSparks f={f} at={[wDar, wMek, wUb]} />
        <HoldHands f={f} spec={hold} layer="front" />
      </Shot>
      <MomWithRibbon f={f} t={f - insA} opacity={insO} />
      <StepHead n={1} text={BG25_TEXT.step1.head} t={headT} out={headOut} />
    </div>
  );
};

// Край ещё сложенных листов под последней панелью — как FoldedEdge из
// ribbon.tsx (при thick = 1 совпадает с ним), но толщину пачки можно
// увеличить: пока лента висит под пузырём, пачка видна издалека.
// Язычок с номером не растягивается.
const PackEdge: React.FC<{ readonly x: number; readonly y: number; readonly rest: number; readonly thick: number; readonly wobble?: number; readonly next?: number }> = ({ x, y, rest, thick, wobble = 0, next }) => {
  const layers = Math.min(rest, 4);
  return (
    // isolation: слои с отрицательным zIndex остаются над фоном сцены
    <div style={box({ left: x, top: y, width: RIB.w, height: 40 * thick, isolation: "isolate" })}>
      {Array.from({ length: layers }, (_, i) => (
        <div
          key={i}
          style={box({
            left: 6 + i * 3,
            right: 6 + i * 3,
            top: (-2 + i * 7) * thick + wobble * 3 * (i + 1),
            height: 12 * thick,
            borderRadius: `0 0 ${6 * thick}px ${6 * thick}px`,
            backgroundColor: i % 2 ? C.paperShade : C.paperWarm,
            boxShadow: "0 3px 6px rgba(20,40,90,0.12)",
            borderBottom: "2px solid rgba(150,120,70,0.22)",
            boxSizing: "border-box",
            zIndex: -i,
          })}
        />
      ))}
      {next ? (
        <div
          style={box({
            left: RIB.w / 2 - 46,
            top: layers * 7 * thick + 4 + wobble * 8,
            width: 92,
            height: 46,
            borderRadius: "0 0 18px 18px",
            backgroundColor: C.yellow,
            color: C.navy,
            fontFamily: F.text,
            fontWeight: 900,
            fontSize: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 12px rgba(20,40,90,0.16)",
          })}
        >
          {next}/6
        </div>
      ) : null}
    </div>
  );
};

// Мягкие «чернильные» кольца, когда карточка ложится штампом.
const StampSparks: React.FC<{ readonly f: number; readonly at: readonly number[] }> = ({ f, at }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    {at.map((a, i) => {
      const t = f - a - 6;
      if (t < 0 || t > 16) return null;
      const c = p1CardCenter(i);
      const k = easeOut(t / 16);
      return <rect key={i} x={RIB_X + c.x - 107 - 20 * k} y={panelTop(1) + c.y - 107 - 20 * k} width={214 + 40 * k} height={214 + 40 * k} rx={30 + 10 * k} fill="none" stroke={C.yellow} strokeWidth={6} opacity={0.7 * (1 - k)} />;
    })}
  </svg>
);

// Звуки шага 1: шелест пачки, разворот, штампы карточек, строка, пауза
// машинки, перехват ленты в конце.
export const step1Sfx: SceneSfx = (tl) => {
  const sc = tl.scenes.find((s) => s.id === "step1")!;
  const n01 = lineIn(tl, "step1", "n01");
  const U1 = Math.max(34, n01.from - 4);
  const U0 = U1 - 20;
  const w = (p: string) => wordMatchIn(tl, "step1", "n01", p);
  return [
    { at: U0 - 16, src: SFX.rustle, volume: 0.22 },
    { at: U0, src: SFX.unfold, volume: 0.36 },
    { at: w("дарегин") + 6, src: SFX.pop, volume: 0.24 },
    { at: w("мектепти") + 6, src: SFX.pop, volume: 0.24 },
    { at: w("убактысын") + 6, src: SFX.pop, volume: 0.24 },
    { at: w("билдиресиз") + 2, src: SFX.tick, volume: 0.2 },
    { at: w("дароо") + 2, src: SFX.slide, volume: 0.14 },
    { at: w("дароо") + 22, src: SFX.tick, volume: 0.18 },
    { at: sc.frames - 32, src: SFX.rustle, volume: 0.16 },
  ];
};
