// Сцена 3 «fill» BG-035: кольцо-счётчик 20 + 2 = 22.
//
// Сюжет движения (все моменты — от фактической озвучки, useLine/useWordAt):
//  a) 0 → «жыйырма»: кинетический заголовок «20 + 2 толук сапар» падает
//     сверху по словам; лоток проявляется из 0,9 с пружиной, 20 пустых гнёзд
//     «волной» по часовой стрелке, затем пара «+2»; в центре — счётчик 00;
//     на слове «BalaGo'нун» слева выпрыгивает логотип-«раздатчик».
//  b) «жыйырма» → конец «төлөйсүз»: из-за логотипа один за другим вылетают
//     20 жёлтых жетонов; каждый облетает кольцо снаружи (разные дуги,
//     вращение, шлейф скорости) и магнитом защёлкивается в своё гнездо
//     (по часовой стрелке от верха): растяжение → удар → сплющивание с
//     перелётом, вспышка гнезда, кольцо-волна. Дорожка желтеет, счётчик
//     катится 00 → 20; 20-й жетон — точно на конце n02, волна по кольцу.
//     Камера медленно наезжает 1,00 → 1,03.
//  c) n03: слева въезжает коробка «БОНУС»; на «эки» — замах, крышка
//     открывается, ровно ДВА мятных жетона выпрыгивают в пару «+2»; счётчик
//     20 → 22 и становится мятным, площадка «+2» подсвечена. На «бонус»
//     заголовок уходит вверх, появляется итог «20 төлөйсүз → 22 толук сапар
//     аласыз» и мятный стикер «+2 сапар акысыз» справа от пары. Коробка
//     закрывается и уезжает.
//  d) хвост: волна света по всем 22 жетонам, «дыхание» бонусной пары,
//     камера возвращается; последние кадры = FullTray в TRAY_HOME (сцена 4
//     продолжает без скачка): подписи, логотип и подсветки гаснут.
//
// Факты: 20 оплаченных + ровно 2 бонусных = 22 полных поездки; пробная
// поездка здесь не показывается (она отдельно, сцена 5).
import type React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  clamp,
  easeIn,
  easeInOut,
  easeOut,
  hash01,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import { useLine, useScene, useWordAt } from "../context";
import { C } from "../palette";
import { BG35_TEXT, BG35_TOKENS, BG35_WORDS } from "../script";
import {
  BonusBox,
  bonusPos,
  Odometer,
  ringPos,
  Socket,
  Token,
  TRAY,
  TRAY_HOME,
  TrayBase,
  TrayFrame,
} from "../tokens";
import { box, Logo, pop, Txt } from "../ui";

const N = BG35_TOKENS.paid;
const TAU = Math.PI * 2;

// Постоянные кадры сцены (от её начала) и длительности движений.
export const FILL_KEYS = {
  title: 0, // заголовок по словам (с первого кадра — без пустой бумаги)
  tray: 0, // лоток: проявление и пружина 0,9 → 1
  sockets: 7, // первое пустое гнездо (дальше — волной по кольцу)
  bonusSockets: 25, // пара гнёзд «+2»
  odometer: 12, // счётчик 00
  label: 17, // «толук сапар»
  snap: 6, // кадров магнитного «защёлкивания» в гнездо
  bonusFly: 16, // полёт бонусного жетона из коробки
  bonusGap: 8, // второй бонусный жетон — позже первого
  endFade: 14, // за столько кадров до конца гаснут подписи и логотип
} as const;

// Раскладка (мир 1080 × 1920; вне зон Reels: сверху 250, снизу 400,
// справа 150; ниже y ≈ 1360 — субтитры).
export const FILL_LOGO = { x: 122, y: 590, size: 132 } as const;
export const FILL_BOX = { x: 250, y: 1330 } as const; // центр низа коробки
export const FILL_BADGE = { x: 800, y: 1250, w: 168 } as const;

// ---------- Траектории ----------

// Жетон вылетает из-за логотипа (полярные координаты вокруг центра кольца),
// облетает кольцо снаружи и «падает» в гнездо по радиусу.
const A0 = Math.atan2(FILL_LOGO.y - TRAY.cy, FILL_LOGO.x - TRAY.cx);
const RHO0 = Math.hypot(FILL_LOGO.x - TRAY.cx, FILL_LOGO.y - TRAY.cy);
const slotA = (i: number) => -Math.PI / 2 + (i * TAU) / N;
// Угол облёта: по часовой стрелке через верх, если путь не длиннее 250°,
// иначе — против часовой через левый низ.
const sweepOf = (i: number) => {
  const cw = (((slotA(i) - A0) % TAU) + TAU) % TAU;
  return cw <= (250 / 180) * Math.PI ? cw : cw - TAU;
};
// Радиус облёта: снаружи кольца, внизу ниже (не задевать площадку «+2»),
// у каждого жетона чуть свой.
const orbitR = (a: number, i: number) =>
  TRAY.R +
  102 -
  56 * Math.pow(Math.max(0, Math.sin(a)), 2) +
  12 * (hash01(i + 3) - 0.5);
const flightDur = (i: number) => 14 + (Math.abs(sweepOf(i)) / TAU) * 40;

type Fly = {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly lift: number;
  readonly rot: number;
};

const paidFly = (i: number, tau: number): Fly => {
  const dur = flightDur(i);
  const t = clamp(tau / dur);
  const d = sweepOf(i);
  // скорость по дуге ровнее (полу-линейный профиль): без «телепорта»
  const s = clamp(t / 0.9);
  const a = A0 + d * (0.5 * s + 0.5 * (0.5 - 0.5 * Math.cos(Math.PI * s)));
  const entry = 1 - easeOut(clamp(t / 0.3));
  const pre = orbitR(a, i) + (RHO0 - orbitR(A0, i)) * entry;
  const tS = 1 - FILL_KEYS.snap / dur;
  const snap = easeIn(clamp((t - tS) / (1 - tS)));
  const rho = lerp(pre, TRAY.R, snap);
  const lift = 1 - snap;
  const grow = 0.55 + 0.45 * easeOut(clamp(tau / 5));
  const spin = Math.sign(d) * (150 + 150 * hash01(i * 7.1 + 1));
  return {
    x: TRAY.cx + rho * Math.cos(a),
    y: TRAY.cy + rho * Math.sin(a),
    r: TRAY.r * grow * (1 + 0.1 * lift),
    lift,
    rot: -spin * (1 - easeOut(t)),
  };
};

// Посадки ровным ритмом: первая — после полёта первого жетона, 20-я —
// точно в конце реплики n02.
const paidPlan = (start: number, end: number) => {
  const land0 = start + flightDur(0);
  const last = Math.max(end, land0 + 2 * (N - 1));
  const step = (last - land0) / (N - 1);
  return Array.from({ length: N }, (_, i) => {
    // 20-я посадка — ровно last (без ошибки округления суммы)
    const land = i === N - 1 ? last : land0 + i * step;
    return { emit: land - flightDur(i), land };
  });
};

// Первый жетон вылетает за столько кадров до первого «жыйырма».
const PAID_LEAD = 4;
// План 20 жетонов от слова «жыйырма» (twentyAt) и конца n02 (n02To) —
// в любой системе кадров (сцены или ролика), лишь бы общей для обоих.
const fillPlan = (twentyAt: number, n02To: number) =>
  paidPlan(twentyAt - PAID_LEAD, n02To);

// Для звука (Bg35Audio): кадры ролика, в которые 20 жетонов садятся в
// гнёзда, — первый кадр, где жетон нарисован в гнезде (f ≥ land).
// twentyAtAbs — кадр ролика слова «жыйырма» (n02), n02ToAbs — конца n02.
export const fillTokenLands = (twentyAtAbs: number, n02ToAbs: number): number[] =>
  fillPlan(twentyAtAbs, n02ToAbs).map((p) => Math.ceil(p.land - 1e-9));

// Бонусный жетон: изнутри коробки — дугой — в своё гнездо пары «+2».
const BONUS_MOUTH = { x: FILL_BOX.x, y: FILL_BOX.y - 62 };
const BONUS_CTRL = [
  { x: 326, y: 1088 },
  { x: 424, y: 1046 },
] as const;

const bonusFly = (j: number, tau: number): Fly => {
  const t = clamp(tau / FILL_KEYS.bonusFly);
  const u = 0.6 * easeOut(t) + 0.4 * t * t;
  const p0 = BONUS_MOUTH;
  const p1 = BONUS_CTRL[j];
  const p2 = bonusPos(j);
  const q = 1 - u;
  const grow = 0.5 + 0.8 * easeOut(clamp(t / 0.35));
  const shrink = easeIn(clamp((t - 0.62) / 0.38));
  return {
    x: q * q * p0.x + 2 * q * u * p1.x + u * u * p2.x,
    y: q * q * p0.y + 2 * q * u * p1.y + u * u * p2.y,
    r: TRAY.bonusR * lerp(grow, 1, shrink),
    lift: 1 - shrink,
    rot: -(200 + 60 * j) * (1 - easeOut(t)),
  };
};

// ---------- Мелкие функции движения ----------

// Колокол 0 → 1 → 0 за d кадров.
const bump = (x: number, d: number) =>
  x <= 0 || x >= d ? 0 : Math.sin((Math.PI * x) / d);
// «Защёлкивание»: k — кадры от посадки. До удара — лёгкое растяжение,
// в момент удара — сплющивание, затем затухающая пружина (ровно 0 к 12-му).
const settle = (k: number) => {
  if (k < -3 || k >= 12) return 0;
  if (k < 0) return -0.3 * easeIn((k + 3) / 3);
  return Math.cos(k * 0.9) * Math.exp(-k / 2.8) * (1 - k / 12);
};
// Вспышка ободка в момент посадки (ровно 0 к 12-му кадру).
const flash = (k: number) => (k < 0 || k >= 12 ? 0 : Math.pow(1 - k / 12, 2));

// ---------- Кинетическая типографика ----------

const isNum = (w: string) => /^\+?\d+$/.test(w);
// Числа — на «жетонных» плашках: 20 — жёлтая (оплаченные), 2 / 22 — мятная.
const chipStyle = (w: string, size: number): React.CSSProperties => {
  const paid = w === "20";
  return {
    padding: `0 ${size * 0.2}px`,
    borderRadius: size * 0.3,
    backgroundColor: paid ? C.yellow : C.mint,
    boxShadow: `0 ${size * 0.08}px 0 ${paid ? C.yellowDeep : C.mintDeep}`,
    color: C.navy,
  };
};

// Слово падает сверху с пружиной; уходит вверх с прозрачностью.
const Word: React.FC<{
  readonly w: string;
  readonly f: number;
  readonly at: number;
  readonly out?: number;
  readonly size: number;
}> = ({ w, f, at, out, size }) => {
  const e = clamp((f - at) / 9);
  const s = pop(f, at, 11);
  const x = out === undefined ? 0 : easeIn(clamp((f - out) / 7));
  return (
    <span
      style={{
        display: "inline-block",
        margin: `0 ${size * 0.12}px`,
        opacity: easeOut(e * 1.5) * (1 - x),
        transform: `translateY(${-34 * (1 - easeOut(e)) - 28 * x}px) scale(${0.55 + 0.45 * s})`,
        ...(isNum(w) ? chipStyle(w, size) : {}),
      }}
    >
      <Txt>{w}</Txt>
    </span>
  );
};

const Line: React.FC<{
  readonly words: readonly string[];
  readonly f: number;
  readonly at: number;
  readonly stagger: number;
  readonly out?: number;
  readonly size: number;
}> = ({ words, f, at, stagger, out, size }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      whiteSpace: "nowrap",
      fontSize: size,
      lineHeight: 1.22,
    }}
  >
    {words.map((w, k) => (
      <Word
        key={k}
        w={w}
        f={f}
        at={at + k * stagger}
        out={out === undefined ? undefined : out + k * 1.5}
        size={size}
      />
    ))}
  </div>
);

const TITLE_WORDS = BG35_TEXT.title.split(" ");
// «20 төлөйсүз → 22 толук сапар аласыз» — две строки по стрелке.
const [PAY_A, PAY_B] = BG35_TEXT.fill.paid.split("→").map((s) => s.trim());
const PAY_LINE1 = [...PAY_A.split(" "), "→"];
const PAY_LINE2 = PAY_B.split(" ");
// «+2 сапар акысыз»: число крупно, слова ниже.
const BADGE_PARTS = BG35_TEXT.fill.badge.split(/(\+?\d+)/).filter((p) => p.trim());

// Мятный стикер справа от пары «+2» (с «хвостиком» к жетонам).
const Badge: React.FC<{ readonly f: number; readonly at: number; readonly a: number }> = ({ f, at, a }) => {
  const p = pop(f, at, 13);
  if (p <= 0 || a <= 0) return null;
  const e = easeOut((f - at) / 13);
  const float = 3 * Math.sin((f - at) / 11);
  return (
    <div
      style={box({
        left: FILL_BADGE.x - FILL_BADGE.w / 2,
        top: FILL_BADGE.y - 78,
        width: FILL_BADGE.w,
        opacity: a * clamp(e * 2),
        transform: `translateY(${float * e}px) rotate(${-5 - 14 * (1 - e)}deg) scale(${p})`,
        transformOrigin: "20% 50%",
        fontFamily,
      })}
    >
      <svg
        width={30}
        height={36}
        viewBox="0 0 30 36"
        style={box({ left: -24, top: 60, overflow: "visible" })}
      >
        <path d="M 30 0 L 2 18 L 30 36 Z" fill={C.mintDeep} />
      </svg>
      <div
        style={{
          borderRadius: 30,
          backgroundColor: C.mintDeep,
          color: "#FFFFFF",
          padding: "8px 10px 14px",
          textAlign: "center",
          boxShadow: "0 12px 26px rgba(20,60,40,0.25)",
          border: "4px solid #FFFFFF",
        }}
      >
        {BADGE_PARTS.map((t, k) =>
          isNum(t) ? (
            <div key={k} style={{ fontSize: 62, fontWeight: 1000, lineHeight: 1.04 }}>
              {t}
            </div>
          ) : (
            <div key={k} style={{ fontSize: 31, fontWeight: 900, lineHeight: 1.08 }}>
              {t.trim()}
            </div>
          ),
        )}
      </div>
    </div>
  );
};

// ---------- Сцена ----------

export const FillScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const n02 = useLine("n02");
  const n03 = useLine("n03");
  const brandAt = useWordAt("n02", BG35_WORDS.n02.brand);
  const twentyAt = useWordAt("n02", BG35_WORDS.n02.firstTwenty);
  const twoAt = useWordAt("n03", BG35_WORDS.n03.two);
  const bonusAt = useWordAt("n03", BG35_WORDS.n03.bonus);
  const end = frames - 1;

  // --- план жетонов
  const plan = fillPlan(twentyAt, n02.to);
  const land20 = plan[N - 1].land;
  const launch = [0, 1].map((j) => twoAt + 2 + j * FILL_KEYS.bonusGap);
  const bland = launch.map((l) => l + FILL_KEYS.bonusFly);
  const lastLand = bland[1];

  const paidV = plan.reduce((s, p) => s + easeOut((f - p.land) / 5), 0);
  const bonusV = bland.reduce((s, b) => s + easeOut((f - b) / 7), 0);
  const v = paidV + bonusV;

  // --- общие огибающие
  const endA =
    1 - easeInOut((f - (end - FILL_KEYS.endFade)) / (FILL_KEYS.endFade - 2));
  const endGlow = 1 - easeInOut((f - (end - 18)) / 14);

  // --- камера: наезд к центру кольца (центр неподвижен в кадре)
  const intro = 0.9 + 0.1 * pop(f, FILL_KEYS.tray, 22);
  const fillZ =
    0.03 * easeInOut((f - twentyAt) / Math.max(1, n02.to - twentyAt));
  const pushFrom = n03.from - 6;
  const push = easeInOut((f - pushFrom) / Math.max(1, twoAt + 6 - pushFrom));
  const backFrom = Math.min(Math.max(lastLand + 16, n03.to - 10), end - 46);
  const backTo = end - 16;
  const back = easeInOut((f - backFrom) / Math.max(1, backTo - backFrom));
  const zoom = intro * (1 + (fillZ + 0.006 * push) * (1 - back));

  // --- лоток
  const trayA = easeOut((f - FILL_KEYS.tray) / 12);
  const bonusOpen = easeOut((f - (FILL_KEYS.bonusSockets - 4)) / 10);
  const haloY = 0.28 * (paidV / N) * endA;
  const haloM = 0.4 * (bonusV / 2) * endA;
  const hl =
    easeOut((f - (twoAt - 4)) / 8) *
    (1 - 0.55 * easeInOut((f - (lastLand + 8)) / 16)) *
    endA;

  // --- волны-«подскоки» по кольцу: «20 готово», затем по всем 22
  // (в длинном хвосте повторяются каждые 78 кадров, тише)
  const wave20 = (i: number) => bump(f - (land20 + 3 + i * 0.8), 10);
  const sheenAt = Math.max(lastLand + 10, n03.to - 4);
  const sheens: number[] = [];
  for (let s = sheenAt; s + 38 <= end - 22; s += 78) sheens.push(s);
  const sheen = (k: number) =>
    Math.max(
      0,
      ...sheens.map((s, m) => (m === 0 ? 1 : 0.6) * bump(f - (s + k * 1.1), 12)),
    );
  // бонусная пара переворачивается, как монеты (между волнами)
  const flipAt = sheenAt + 40;
  const flip = (j: number) =>
    flipAt + 40 <= end - 22 ? easeInOut((f - (flipAt + 6 * j)) / 16) : 0;
  const breathFrom = lastLand + 10;
  const breath =
    (0.3 + 0.3 * (0.5 - 0.5 * Math.cos((TAU * (f - breathFrom)) / 40))) *
    easeOut((f - breathFrom) / 12) *
    endGlow;

  // --- счётчик
  const odoA = easeOut((f - FILL_KEYS.odometer) / 10);
  const labelA = easeOut((f - FILL_KEYS.label) / 10);
  const odoPulse = Math.max(
    0,
    ...plan.map((p) => 0.035 * bump(f - p.land, 8)),
    0.1 * bump(f - land20, 12),
    0.07 * bump(f - bland[0], 10),
    0.12 * bump(f - bland[1], 12),
  );

  // --- логотип-раздатчик
  const logoAt = Math.max(8, brandAt - 6);
  const logoP = pop(f, logoAt, 14);
  const kick = Math.max(0, ...plan.map((p) => bump(f - p.emit, 7)));
  const logoRot = -30 * (1 - easeOut((f - logoAt) / 14)) + 4 * kick;
  // дробный сдвиг — в transform (top округляется до целых пикселей)
  const logoBob = 4 * Math.sin((f - logoAt) / 17) * easeOut((f - logoAt - 10) / 20);

  // --- коробка «БОНУС»
  const boxIn = Math.min(n03.from - 4, twoAt - 24);
  const boxP = pop(f, boxIn, 16);
  const boxExit = lastLand + 4;
  const boxOut = easeIn((f - boxExit) / 14);
  const boxX =
    -170 + (FILL_BOX.x + 170) * boxP - 520 * boxOut + 14 * bump(f - (boxExit - 6), 10);
  const preSq = bump(f - (twoAt - 7), 8);
  const recoil = bump(f - (twoAt + 1), 7);
  const boxSx = 1 + 0.06 * preSq - 0.03 * recoil;
  const boxSy = 1 - 0.09 * preSq + 0.06 * recoil;
  // крышка открыта, только пока жетоны выходят из коробки
  const lid =
    easeOut((f - (twoAt - 1)) / 6) * (1 - easeInOut((f - (launch[1] + 6)) / 7));
  const showBox = boxP > 0 && f < boxExit + 16;

  // --- подписи: заголовок уходит (5 слов × 1,5 кадра + 7 кадров) до
  // появления плашки итога (payAt − 2) — без «призраков» за плашкой
  const titleOut = bonusAt - 16;
  const payAt = bonusAt + 1;
  const plateP = pop(f, payAt - 2, 12);

  // Шлейф скорости летящего жетона.
  const streak = (
    key: string,
    at: (tau: number) => Fly,
    tau: number,
    color: string,
  ) => {
    if (tau < 3) return null;
    const p0 = at(tau - 2.2);
    const p1 = at(tau - 1.1);
    const p2 = at(tau);
    const speed = Math.hypot(p2.x - p0.x, p2.y - p0.y) / 2.2;
    const a = 0.32 * clamp((speed - 6) / 18) * p2.lift;
    if (a <= 0.01) return null;
    return (
      <path
        key={key}
        d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
        fill="none"
        stroke={color}
        strokeOpacity={a}
        strokeWidth={p2.r * 1.25}
        strokeLinecap="round"
      />
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.paper,
        overflow: "hidden",
        fontFamily,
      }}
    >
      {/* ---------- мир: камера → лоток в TRAY_HOME ---------- */}
      <div
        style={box({
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transformOrigin: `${TRAY.cx}px ${TRAY.cy}px`,
          transform: `scale(${zoom})`,
        })}
      >
        <TrayFrame v={TRAY_HOME}>
          {/* мягкий ореол: желтеет с жетонами, у пары «+2» — мятный */}
          {haloY + haloM > 0.005 ? (
            <div
              style={box({
                left: 0,
                top: 0,
                width: 1080,
                height: 1920,
                background: `radial-gradient(circle at ${TRAY.cx}px ${TRAY.cy}px, rgba(255,201,14,${haloY}) 0px, rgba(255,201,14,0) 560px), radial-gradient(ellipse 280px 150px at ${TRAY.cx}px ${TRAY.bonusY}px, rgba(159,221,184,${haloM}) 0px, rgba(159,221,184,0) 100%)`,
              })}
            />
          ) : null}

          {trayA > 0 ? (
            <TrayBase opacity={trayA} fill={paidV / N} bonusOpen={bonusOpen} />
          ) : null}

          {/* подсветка площадки «+2» */}
          {hl > 0.005 ? (
            <div
              style={box({
                left: TRAY.cx - 150 - 6,
                top: TRAY.bonusY - 66 - 6,
                width: 312,
                height: 144,
                borderRadius: 72,
                border: `5px solid ${C.mintDeep}`,
                boxSizing: "border-box",
                opacity: hl,
                boxShadow: `0 0 0 ${10 * hl}px rgba(46,139,87,0.14), 0 0 34px rgba(159,221,184,0.9)`,
              })}
            />
          ) : null}

          {/* пустые гнёзда: волной по кольцу; гаснут под севшим жетоном */}
          {plan.map((p, i) => {
            const s = pop(f, FILL_KEYS.sockets + i * 0.9, 10);
            const fade = 1 - clamp((f - p.land - 1) / 6);
            if (s <= 0 || fade <= 0) return null;
            const q = ringPos(i);
            const lit = f < p.land ? easeIn(clamp(1 - (p.land - f) / 8)) : 1;
            return (
              <Socket
                key={`s${i}`}
                x={q.x}
                y={q.y}
                r={TRAY.r * s}
                opacity={clamp((f - FILL_KEYS.sockets - i * 0.9) / 4) * fade}
                lit={lit}
              />
            );
          })}
          {[0, 1].map((j) => {
            const at = FILL_KEYS.bonusSockets + 3 * j;
            const s = pop(f, at, 11);
            const fade = 1 - clamp((f - bland[j] - 1) / 6);
            if (s <= 0 || fade <= 0) return null;
            const q = bonusPos(j);
            const lit = f < bland[j] ? easeIn(clamp(1 - (bland[j] - f) / 8)) : 1;
            return (
              <Socket
                key={`bs${j}`}
                x={q.x}
                y={q.y}
                r={TRAY.bonusR * s}
                bonus
                opacity={clamp((f - at) / 4) * fade}
                lit={lit * 0.6}
              />
            );
          })}

          {/* севшие жетоны */}
          {plan.map((p, i) => {
            if (f < p.land) return null;
            const q = ringPos(i);
            const k = f - p.land;
            const h = Math.max(wave20(i), sheen(i));
            return (
              <Token
                key={`p${i}`}
                kind="paid"
                x={q.x}
                y={q.y}
                r={TRAY.r * (1 + 0.13 * h)}
                lift={0.8 * h}
                squash={settle(k)}
                glow={Math.min(1, flash(k) + 0.5 * h)}
              />
            );
          })}
          {[0, 1].map((j) => {
            if (f < bland[j]) return null;
            const q = bonusPos(j);
            const k = f - bland[j];
            const h = sheen(N + j * 1.5);
            const fl = flip(j);
            const tok = (
              <Token
                key={`b${j}`}
                kind="bonus"
                x={q.x}
                y={q.y}
                r={TRAY.bonusR * (1 + 0.13 * h)}
                lift={0.8 * h}
                squash={settle(k)}
                glow={Math.min(1, flash(k) + breath + 0.5 * h)}
              />
            );
            if (fl <= 0 || fl >= 1) return tok;
            // переворот монеты: ширина cos(2π·t), подъём в середине
            const up = 1 + 0.16 * Math.sin(Math.PI * fl);
            return (
              <div
                key={`bf${j}`}
                style={box({
                  left: 0,
                  top: 0,
                  width: 1080,
                  height: 1920,
                  transformOrigin: `${q.x}px ${q.y}px`,
                  transform: `translateY(${-14 * Math.sin(Math.PI * fl)}px) scale(${Math.cos(TAU * fl) * up}, ${up})`,
                })}
              >
                {tok}
              </div>
            );
          })}

          {/* кольца-волны от посадок */}
          <svg
            width={1080}
            height={1920}
            style={box({ left: 0, top: 0, overflow: "visible" })}
          >
            {plan.map((p, i) => {
              const k = f - p.land;
              if (k < 0 || k >= 14) return null;
              const q = ringPos(i);
              const big = i === N - 1 ? 1.8 : 1;
              const e = easeOut(k / 14);
              return (
                <circle
                  key={`w${i}`}
                  cx={q.x}
                  cy={q.y}
                  r={TRAY.r + 4 + 30 * big * e}
                  fill="none"
                  stroke={C.yellow}
                  strokeWidth={7 * (1 - e)}
                  opacity={0.75 * (1 - e)}
                />
              );
            })}
            {[0, 1].map((j) => {
              const k = f - bland[j];
              if (k < 0 || k >= 16) return null;
              const q = bonusPos(j);
              const e = easeOut(k / 16);
              return (
                <circle
                  key={`bw${j}`}
                  cx={q.x}
                  cy={q.y}
                  r={TRAY.bonusR + 4 + 46 * e}
                  fill="none"
                  stroke={C.mintDeep}
                  strokeWidth={8 * (1 - e)}
                  opacity={0.7 * (1 - e)}
                />
              );
            })}
          </svg>

          {/* счётчик и подпись (как в FullTray) */}
          {odoA > 0 ? (
            <div
              style={box({
                left: 0,
                top: 0,
                width: 1080,
                height: 1920,
                opacity: odoA,
                transformOrigin: `${TRAY.cx}px ${TRAY.cy - 26}px`,
                transform: `translateY(${-18 * (1 - odoA)}px) scale(${1 + odoPulse})`,
              })}
            >
              <Odometer
                v={v}
                x={TRAY.cx}
                y={TRAY.cy - 26}
                color={interpolateColors(
                  clamp((f - bland[0]) / 6),
                  [0, 1],
                  [C.navy, C.mintDeep],
                )}
              />
            </div>
          ) : null}
          {labelA > 0 ? (
            <div
              style={box({
                left: TRAY.cx - 200,
                top: TRAY.cy + 72,
                width: 400,
                textAlign: "center",
                fontFamily,
                fontWeight: 900,
                fontSize: 36,
                color: C.muted,
                opacity: labelA,
              })}
            >
              {BG35_TEXT.fill.counterOf}
            </div>
          ) : null}

          {/* летящие жетоны со шлейфом */}
          <svg
            width={1080}
            height={1920}
            style={box({ left: 0, top: 0, overflow: "visible" })}
          >
            {plan.map((p, i) =>
              f >= p.emit && f < p.land
                ? streak(`ps${i}`, (t) => paidFly(i, t), f - p.emit, C.yellow)
                : null,
            )}
            {launch.map((l, j) =>
              f >= l && f < bland[j]
                ? streak(`bs${j}`, (t) => bonusFly(j, t), f - l, C.mint)
                : null,
            )}
          </svg>
          {plan.map((p, i) => {
            if (f < p.emit || f >= p.land) return null;
            const q = paidFly(i, f - p.emit);
            return (
              <Token
                key={`fp${i}`}
                kind="paid"
                x={q.x}
                y={q.y}
                r={q.r}
                rot={q.rot}
                lift={q.lift}
                squash={settle(f - p.land)}
              />
            );
          })}
          {launch.map((l, j) => {
            if (f < l || f >= bland[j]) return null;
            const q = bonusFly(j, f - l);
            return (
              <Token
                key={`fb${j}`}
                kind="bonus"
                x={q.x}
                y={q.y}
                r={q.r}
                rot={q.rot}
                lift={q.lift}
                glow={0.6 * q.lift}
                squash={settle(f - bland[j])}
              />
            );
          })}

          {/* коробка «БОНУС»: въезд, замах, крышка, отдача, выезд */}
          {showBox ? (
            <div
              style={box({
                left: 0,
                top: 0,
                width: 1080,
                height: 1920,
                transformOrigin: `${FILL_BOX.x}px ${FILL_BOX.y}px`,
                transform: `translateX(${boxX - FILL_BOX.x}px) rotate(${-7 * (1 - Math.min(1, boxP)) + 5 * boxOut}deg) scale(${boxSx}, ${boxSy})`,
              })}
            >
              <BonusBox x={FILL_BOX.x} y={FILL_BOX.y} open={lid} />
            </div>
          ) : null}

          {/* логотип BalaGo — «раздатчик» жетонов */}
          {logoP > 0 && endA > 0 ? (
            <div
              style={box({
                left: 0,
                top: 0,
                width: 1080,
                height: 1920,
                transformOrigin: `${FILL_LOGO.x}px ${FILL_LOGO.y}px`,
                transform: `rotate(${logoRot}deg)`,
              })}
            >
              {/* круглый медальон: у файла логотипа белые углы */}
              <div
                style={box({
                  left: FILL_LOGO.x - FILL_LOGO.size / 2,
                  top: FILL_LOGO.y - FILL_LOGO.size / 2,
                  width: FILL_LOGO.size,
                  height: FILL_LOGO.size,
                  borderRadius: "50%",
                  overflow: "hidden",
                  opacity: endA,
                  transform: `translateY(${logoBob}px) scale(${logoP * (1 + 0.05 * kick)})`,
                  boxShadow:
                    "0 0 0 5px #FFFFFF, 0 12px 26px rgba(20,40,90,0.22)",
                })}
              >
                <Logo
                  x={FILL_LOGO.size / 2}
                  y={FILL_LOGO.size / 2}
                  size={FILL_LOGO.size * 1.02}
                />
              </div>
            </div>
          ) : null}

          <Badge f={f} at={bonusAt + 6} a={endA} />
        </TrayFrame>
      </div>

      {/* ---------- подписи (экран) ---------- */}
      {f < titleOut + 14 ? (
        <div style={box({ left: 150, right: 150, top: 268, fontWeight: 900, color: C.navy, letterSpacing: -0.5 })}>
          <Line words={TITLE_WORDS} f={f} at={FILL_KEYS.title} stagger={3} out={titleOut} size={66} />
        </div>
      ) : null}
      {plateP > 0 && endA > 0 ? (
        <div
          style={box({
            left: 150,
            right: 150,
            top: 254,
            display: "flex",
            justifyContent: "center",
            opacity: endA,
          })}
        >
          <div
            style={{
              padding: "12px 26px 16px",
              borderRadius: 30,
              backgroundColor: "rgba(255,255,255,0.96)",
              boxShadow: "0 12px 30px rgba(20,40,90,0.14)",
              border: `3px solid ${C.line}`,
              transform: `scale(${0.85 + 0.15 * plateP}, ${plateP})`,
              opacity: clamp(plateP * 2),
              fontWeight: 900,
              color: C.navy,
              letterSpacing: -0.5,
            }}
          >
            <Line words={PAY_LINE1} f={f} at={payAt} stagger={3} size={48} />
            <div style={{ height: 4 }} />
            <Line words={PAY_LINE2} f={f} at={payAt + 5} stagger={2.5} size={48} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
