// Сцена 3 (≈18–32 с). Крупно телефон в руке мамы у окна; за окном улица
// продолжает двигаться. Мама листает сайт BalaGo до формы, сама вводит
// точный адрес, школу и время уроков (подписи — как на сайте), нажимает
// «Арыз калтыруу» — открывается предзаполненный WhatsApp, и мама сама
// нажимает «отправить». Без ложного «заявка принята» и без ответа.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys } from "../anim";
import { Mountains, PanelHouse, Poplar, Sky, Street, TrafficCar, Wires, type PanelSpec } from "../art/city";
import { ChatScreen, PhoneFrame, SiteScreen, screenPt, SCREEN, type SiteState } from "../art/phone";
import { Caption } from "../art/ui";
import { useSceneFrame } from "../context";
import { C } from "../palette";
import { BG30_TEXT } from "../script";

// Кадры событий (и для звука).
export const SITE = {
  swipe: 14,
  tap0: 70,
  type0: [76, 118] as const,
  tap1: 122,
  type1: [128, 150] as const,
  tap2: 156,
  type2: [160, 176] as const,
  tap3: 182,
  type3: [186, 202] as const,
  consent: 214,
  button: 240,
  chat: 256,
  send: 338,
} as const;

const ACROSS_A: PanelSpec = { x: -60, y: 1260, w: 560, floors: 6, cols: 4, color: C.panelD, seed: 4, floorH: 130 };
const ACROSS_B: PanelSpec = { x: 600, y: 1260, w: 600, floors: 7, cols: 4, color: C.panelA, seed: 8, floorH: 130 };

// Вид из окна (слегка размыт — фокус на телефоне); машины идут по улице.
const Outside: React.FC<{ readonly f: number }> = ({ f }) => {
  const run = (k: number, speed: number, span = 1700) => ((((f + k) * speed) % span) + span) % span;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <Sky id="site-out" />
      <Mountains x={-200} y={380} w={1500} h={420} seed={21} />
      <PanelHouse p={ACROSS_A} />
      <PanelHouse p={ACROSS_B} />
      <Poplar x={540} y={1260} h={760} sway={Math.sin(f / 30) * 1.4} />
      <Poplar x={1040} y={1260} h={700} sway={Math.sin(f / 34 + 2) * 1.4} />
      <Wires x0={-200} x1={1400} y={980} ground={1260} step={700} />
      <g transform="translate(0 -40)">
        <Street x0={-200} x1={1400} y={1300} dash={f * 4} />
        <TrafficCar x={-300 + run(0, 7)} y={1650} color="#D8746A" s={1.3} />
        <TrafficCar x={1400 - run(90, 6)} y={1790} color="#7E93B8" dir={-1} s={1.4} />
        <TrafficCar x={-300 + run(170, 8)} y={1650} color="#5FA39A" s={1.3} />
      </g>
    </svg>
  );
};

// Руки: левая держит телефон снизу, правая — указательный палец.
const HoldHand: React.FC<{ readonly dy: number }> = ({ dy }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <g transform={`translate(0 ${dy})`}>
      <path d="M150 1920 Q190 1560 300 1330 L420 1350 Q330 1620 360 1920 Z" fill={C.momTop} />
      <path d="M280 1360 Q300 1250 380 1238 Q460 1236 470 1300 L450 1420 Q360 1450 300 1420 Z" fill={C.skin} />
      {/* большой палец на краю корпуса */}
      <rect x={262} y={1150} width={44} height={150} rx={22} fill={C.skin} transform="rotate(-12 284 1300)" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={762} y={1150 + i * 58} width={64} height={44} rx={22} fill={C.skin} />
      ))}
    </g>
  </svg>
);

const Pointer: React.FC<{ readonly x: number; readonly y: number; readonly press: number }> = ({ x, y, press }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <g transform={`translate(${x} ${y + press * 10}) rotate(-18)`}>
      <path d="M-70 220 Q-80 520 -120 900 L140 900 Q110 520 110 220 Z" fill={C.momTop} />
      <rect x={-74} y={150} width={186} height={82} rx={30} fill={C.momTopShade} />
      <path d="M-62 160 Q-70 80 -30 60 L80 60 Q120 80 110 160 Z" fill={C.skin} />
      {/* указательный */}
      <rect x={-18} y={-6} width={40} height={110} rx={20} fill={C.skin} />
      <rect x={30} y={64} width={36} height={60} rx={18} fill={C.skinShade} />
      <rect x={70} y={74} width={34} height={56} rx={17} fill={C.skinShade} />
      {press > 0.01 ? <circle cx={2} cy={-2} r={26 + press * 20} fill="#FFFFFF" opacity={0.35 * (1 - press)} /> : null}
    </g>
  </svg>
);

export const SiteScene: React.FC = () => {
  const f = Math.max(0, useSceneFrame());
  const T = BG30_TEXT.site;
  // состояние сайта
  const prog = (r: readonly [number, number]) => clamp((f - r[0]) / (r[1] - r[0]));
  const s: SiteState = {
    scroll: clamp((f - SITE.swipe) / 44),
    typed: [prog(SITE.type0), prog(SITE.type1), prog(SITE.type2), prog(SITE.type3)],
    focus: f >= SITE.tap3 ? 3 : f >= SITE.tap2 ? 2 : f >= SITE.tap1 ? 1 : f >= SITE.tap0 ? 0 : -1,
    consent: f >= SITE.consent + 3 ? 1 : 0,
    press: clamp((f - SITE.button) / 8),
  };
  const chatIn = easeInOut((f - SITE.chat) / 16);
  const sendPress = clamp((f - SITE.send) / 8);
  const sent = clamp((f - SITE.send - 4) / 18);
  // палец: точки на экране (координаты экрана телефона)
  const fieldY = [140, 240, 340, 440].map((y) => y + 120);
  const pts: [number, number, number][] = [
    [0, 330, 980],
    [SITE.swipe - 2, 300, 900],
    [SITE.swipe + 40, 300, 520],
    [SITE.tap0 - 14, 260, fieldY[0]],
    [SITE.tap1 - 10, 260, fieldY[1]],
    [SITE.tap2 - 10, 230, fieldY[2]],
    [SITE.tap3 - 10, 230, fieldY[3]],
    [SITE.consent - 10, 40, 712],
    [SITE.button - 10, 230, 820],
    [SITE.chat + 10, 300, 900],
    [SITE.send - 12, SCREEN.w - 44, SCREEN.h - 56],
    [SITE.send + 40, SCREEN.w - 30, SCREEN.h + 120],
  ];
  const px = keys(f, pts.map(([k, x]) => [k, x] as const));
  const py = keys(f, pts.map(([k, , y]) => [k, y] as const));
  const finger = screenPt(px, py);
  const taps = [SITE.tap0, SITE.tap1, SITE.tap2, SITE.tap3, SITE.consent, SITE.button, SITE.send];
  const press = Math.max(0, ...taps.map((t) => Math.sin(Math.PI * clamp((f - t + 4) / 8))));
  const float = Math.sin(f / 28) * 4;
  // камера: телефон целиком → крупно поля формы → кнопка → поле ввода
  // чата и «отправить» → отправленное сообщение
  const zoom = keys(f, [
    [0, 1.0],
    [40, 1.0],
    [66, 1.55],
    [206, 1.55],
    [230, 1.2],
    [262, 1.2],
    [292, 1.42],
    [352, 1.42],
    [384, 1.12],
  ]);
  const fx = keys(f, [
    [40, 540],
    [66, 540],
    [262, 560],
    [292, 640],
    [352, 640],
    [384, 560],
  ]);
  const fy = keys(f, [
    [40, 800],
    [66, 640],
    [206, 640],
    [230, 980],
    [262, 980],
    [292, 1080],
    [352, 1080],
    [384, 780],
  ]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall }}>
      <AbsoluteFill style={{ filter: "blur(5px)", transform: "scale(1.04)" }}>
        <Outside f={f} />
      </AbsoluteFill>
      {/* рама окна у края кадра */}
      <AbsoluteFill style={{ border: "26px solid #FFFFFF", boxShadow: "inset 0 0 0 4px #E5DED2" }} />
      <AbsoluteFill style={{ transform: `translate(${540 - fx}px, ${(960 - fy) * 0.55}px) scale(${zoom})`, transformOrigin: `${fx}px ${fy}px` }}>
        <HoldHand dy={float} />
        <PhoneFrame dy={float} rot={-1.2}>
          {chatIn < 1 ? <SiteScreen f={f} s={s} /> : null}
          {chatIn > 0 ? (
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - chatIn) * 100}%)` }}>
              <ChatScreen f={f} sent={sent} press={sendPress} />
            </div>
          ) : null}
        </PhoneFrame>
        <Pointer x={finger.x} y={finger.y + float} press={press} />
      </AbsoluteFill>
      <Caption f={f} at={104} text={T.caption} top={226} size={46} />
    </AbsoluteFill>
  );
};

