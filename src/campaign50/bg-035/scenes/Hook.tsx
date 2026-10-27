// Сцена 1 «hook» BG-035 (≈ 6,5 с): остановить прокрутку большим вопросом.
//
// Сюжет движения (моменты речи — от фактической озвучки n01, useLine /
// useWordAt; длина сцены — useScene().frames):
//  a) 0–12: на светлой бумаге формула «20 + 2 = ?» падает по знакам с
//     пружиной (жёлтое «20», мятное «2», большой жёлтый «?», тёмно-синий
//     контур) и полностью читается к 12-му кадру. Ответа «22» в сцене нет —
//     он открывается в сцене 3.
//  b) −4…16 магнитная дорожка (светлая скруглённая колея) прорисовывается
//     «змейкой» из трёх рядов (y ≈ 700–1370, над субтитрами): вход снизу
//     слева → разворот справа → средний ряд → разворот слева → верхний ряд
//     к мятной табличке «+2» справа, под «?» (читается слева направо, как
//     формула). С 4-го кадра 20 жёлтых жетонов въезжают поездом (шлейф
//     скорости, вращение), тормозят и защёлкиваются магнитом друг за другом
//     от таблички назад: удар — сплющивание вдоль колеи — отскок, вспышка
//     ободка; колея под ними желтеет. Голова — на 46-м кадре (табличка
//     вздрагивает), хвост ≈ 61 — в конце правого разворота; нижний ряд
//     остаётся путём, по которому пришли. Совпадает с «Жыйырма сапарга
//     төлөп». Разметка колеи и линии поля в разворотах всё время текут.
//  c) на «эки» (n01, слово 4): табличка дрожит, из-за неё вверх выглядывают
//     два мятных бонусных жетона и покачиваются — продолжение, но в дорожку
//     ещё не встают; позже по очереди прячутся и выглядывают снова.
//  d) камера мира: наклон −3° → +1,4° и наезд 1,00 → 1,06 за сцену, лёгкий
//     толчок при ударе головы поезда. Формула — отдельный слой без наклона.
//  e) конец n01: «?» дважды пульсирует (кольца-волны); затем по поезду
//     бежит световая волна от хвоста к табличке — бонусы подпрыгивают.
//  f) последние 12 кадров: наезд в «?» (≈ ×3,2, «?» к центру кадра), мир
//     притухает раньше формулы, затем растворение в бумагу C.paper —
//     сцена 2 раскрывается ирисом из бумаги.
// Подписи-слова не нужны: формула из цифр и знаков; субтитры — общие.
import type React from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { clamp, easeIn, easeInOut, easeOut, keys, lerp } from "../../../two-schedules-2d/rig/motion";
import { useLine, useScene, useWordAt } from "../context";
import { C } from "../palette";
import { BG35_TEXT, BG35_TOKENS, BG35_WORDS } from "../script";
import { Token } from "../tokens";
import { box, pop } from "../ui";

type P = { readonly x: number; readonly y: number };

// ---------- Магнитная дорожка (мир 1080 × 1920) ----------
// «Змейка» из трёх рядов, читается слева направо, как формула:
// вход из-за левого края снизу (низ колеи ≤ 1372 и при наклоне камеры —
// над полосой субтитров) → нижний ряд → разворот справа → средний ряд
// справа налево → разворот слева → верхний ряд к табличке «+2» справа
// (под «?»). Развороты — полуокружности радиуса 121; правый край дорожки
// ≤ 870 (с наездом камеры ≤ 905: правая зона Reels свободна). Конец
// дорожки = левый край таблички.
const ROWS = [758, 1000, 1242] as const; // верхний, средний, нижний ряд
const TURN_L = 250; // центры разворотов по x
const TURN_R = 690;
const TURN_K = ((4 / 3) * (ROWS[1] - ROWS[0])) / 2; // контрольные точки полуокружности
export const HOOK_SIGN = { x: 786, y: ROWS[0], w: 176, h: 150 } as const;
const TRACK_END = HOOK_SIGN.x - HOOK_SIGN.w / 2;
const SEGS: readonly (readonly [P, P, P, P])[] = [
  [{ x: -260, y: 1320 }, { x: 80, y: 1262 }, { x: 400, y: 1236 }, { x: TURN_R, y: ROWS[2] }],
  [{ x: TURN_R, y: ROWS[2] }, { x: TURN_R + TURN_K, y: ROWS[2] }, { x: TURN_R + TURN_K, y: ROWS[1] }, { x: TURN_R, y: ROWS[1] }],
  [{ x: TURN_R, y: ROWS[1] }, { x: 560, y: ROWS[1] - 8 }, { x: 380, y: ROWS[1] + 10 }, { x: TURN_L, y: ROWS[1] }],
  [{ x: TURN_L, y: ROWS[1] }, { x: TURN_L - TURN_K, y: ROWS[1] }, { x: TURN_L - TURN_K, y: ROWS[0] }, { x: TURN_L, y: ROWS[0] }],
  [{ x: TURN_L, y: ROWS[0] }, { x: 420, y: ROWS[0] - 8 }, { x: 560, y: ROWS[0] + 6 }, { x: TRACK_END, y: ROWS[0] }],
];
const TRACK_D = SEGS.map(
  (s, i) =>
    `${i === 0 ? `M ${s[0].x} ${s[0].y} ` : ""}C ${s[1].x} ${s[1].y} ${s[2].x} ${s[2].y} ${s[3].x} ${s[3].y}`,
).join(" ");

const bez = (s: readonly [P, P, P, P], t: number): P => {
  const u = 1 - t;
  const k0 = u * u * u;
  const k1 = 3 * u * u * t;
  const k2 = 3 * u * t * t;
  const k3 = t * t * t;
  return {
    x: k0 * s[0].x + k1 * s[1].x + k2 * s[2].x + k3 * s[3].x,
    y: k0 * s[0].y + k1 * s[1].y + k2 * s[2].y + k3 * s[3].y,
  };
};

// Таблица «длина пути → точка» (равномерное движение по колее).
const LUT: readonly { readonly s: number; readonly x: number; readonly y: number }[] = (() => {
  const out: { s: number; x: number; y: number }[] = [];
  let len = 0;
  let prev: P | null = null;
  for (const seg of SEGS) {
    for (let i = prev ? 1 : 0; i <= 240; i++) {
      const p = bez(seg, i / 240);
      if (prev) len += Math.hypot(p.x - prev.x, p.y - prev.y);
      out.push({ s: len, x: p.x, y: p.y });
      prev = p;
    }
  }
  return out;
})();
const TRACK_LEN = LUT[LUT.length - 1].s;

// Точка колеи на расстоянии s и направление (градусы). До начала —
// продолжение по касательной (за кадром).
const trackAt = (s: number): P & { readonly a: number } => {
  const n = LUT.length;
  if (s <= 0) {
    const a0 = LUT[0];
    const a1 = LUT[1];
    const d = Math.hypot(a1.x - a0.x, a1.y - a0.y) || 1;
    return {
      x: a0.x + ((a1.x - a0.x) / d) * s,
      y: a0.y + ((a1.y - a0.y) / d) * s,
      a: (Math.atan2(a1.y - a0.y, a1.x - a0.x) * 180) / Math.PI,
    };
  }
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (LUT[mid].s <= s) lo = mid;
    else hi = mid;
  }
  const a = LUT[lo];
  const b = LUT[hi];
  const t = b.s > a.s ? clamp((s - a.s) / (b.s - a.s)) : 0;
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
  };
};

// ---------- Табличка «+2» и жетоны ----------
const SIGN_TOP = HOOK_SIGN.y - HOOK_SIGN.h / 2;
const N = BG35_TOKENS.paid;
const R = 42; // радиус жетона
// Шаг жетонов в поезде (почти касаются — магниты): хвост встаёт ровно в
// конце правого разворота, нижний ряд остаётся «путём, по которому
// пришли».
const GAP = 86;
const HEAD_S = TRACK_LEN - R - 4; // голова поезда — у таблички
// Вход в кадр: точка колеи, где жетон только показывается слева.
const ENTRY_S = (LUT.find((p) => p.x >= -R - 6) ?? LUT[0]).s;

// Центр наклона и наезда камеры мира — середина «змейки».
const CAM_PIVOT: P = { x: 470, y: ROWS[1] };

// Постоянные кадры сцены (от её начала).
export const HOOK_KEYS = {
  trackIn: -4, // дорожка прорисовывается с «−4» (уже видна в кадре 0)
  trackFrames: 20,
  signIn: 3,
  trainIn: 4, // голова поезда въезжает в кадр
  headStop: 46, // голова защёлкивается у таблички
  stagger: 0.8, // остановки жетонов от головы к хвосту (кадры)
  decel: 16, // торможение (кадры)
  outFrames: 12, // наезд в «?» и растворение в бумагу
} as const;

const TAIL_STOP = HOOK_KEYS.headStop + HOOK_KEYS.stagger * (N - 1);
// Скорость поезда на ходу (px/кадр): голова успевает от входа до таблички.
const V =
  (HEAD_S - ENTRY_S) /
  (HOOK_KEYS.headStop - HOOK_KEYS.trainIn - HOOK_KEYS.decel / 2);
// Оставшийся путь и скорость за u кадров до остановки (равное торможение).
const remain = (u: number) =>
  u <= 0 ? 0 : u < HOOK_KEYS.decel ? (V * u * u) / (2 * HOOK_KEYS.decel) : V * (u - HOOK_KEYS.decel / 2);
const speed = (u: number) => (u <= 0 ? 0 : u < HOOK_KEYS.decel ? (V * u) / HOOK_KEYS.decel : V);
// Удар магнита: 0 → сплющивание (+1) → отскок (−) → покой.
const impact = (t: number) => (t <= 0 ? 0 : 1.6 * Math.exp(-t / 3.2) * Math.sin(0.95 * t));
// Короткий «горб» 0 → 1 → 0 за d кадров.
const bump = (f: number, at: number, d: number) => Math.sin(Math.PI * clamp((f - at) / d));

// ---------- Формула «20 + 2 = ?» ----------
const FORM_BASE = 520; // базовая линия
const FORM_PIVOT: P = { x: 515, y: 452 };
type GlyphDef = {
  readonly id: "left" | "plus" | "right" | "eq" | "question";
  readonly x: number;
  readonly size: number;
  readonly fill: string;
  readonly outline: boolean;
  readonly at: number; // кадр появления
};
const GLYPHS: readonly GlyphDef[] = [
  { id: "left", x: 252, size: 186, fill: C.yellow, outline: true, at: -3 },
  { id: "plus", x: 440, size: 186, fill: C.navy, outline: false, at: -1 },
  { id: "right", x: 566, size: 186, fill: C.mint, outline: true, at: 1 },
  { id: "eq", x: 694, size: 186, fill: C.navy, outline: false, at: 3 },
  { id: "question", x: 830, size: 236, fill: C.yellow, outline: true, at: 5 },
];
const Q_DEF = GLYPHS[4];
const glyphCy = (g: GlyphDef) => FORM_BASE - 0.36 * g.size;

const Glyph: React.FC<{
  readonly g: GlyphDef;
  readonly dy: number;
  readonly s: number;
  readonly rot: number;
  readonly opacity: number;
}> = ({ g, dy, s, rot, opacity }) => {
  const text = BG35_TEXT.hook[g.id];
  const common = {
    textAnchor: "middle" as const,
    y: 0.36 * g.size,
    fontFamily,
    fontWeight: 900,
    fontSize: g.size,
    strokeLinejoin: "round" as const,
    paintOrder: "stroke",
  };
  return (
    <g
      transform={`translate(${g.x} ${glyphCy(g) + dy}) rotate(${rot}) scale(${s})`}
      opacity={opacity}
    >
      {/* мягкая «наклейная» тень */}
      <text
        {...common}
        y={0.36 * g.size + 10}
        fill="rgba(20,40,90,0.13)"
        stroke="rgba(20,40,90,0.13)"
        strokeWidth={g.outline ? 16 : 6}
      >
        {text}
      </text>
      <text
        {...common}
        fill={g.fill}
        stroke={g.outline ? C.navy : g.fill}
        strokeWidth={g.outline ? 15 : 2}
      >
        {text}
      </text>
    </g>
  );
};

// Табличка «+2» (конец дорожки): мятная плашка, как у бонусов.
const Sign: React.FC<{ readonly s: number; readonly rot: number; readonly dx: number; readonly glow: number }> = ({
  s,
  rot,
  dx,
  glow,
}) => {
  const { x, y, w, h } = HOOK_SIGN;
  return (
    <svg
      width={1080}
      height={1920}
      style={box({ left: 0, top: 0, overflow: "visible" })}
    >
      <g transform={`translate(${x + dx} ${y}) rotate(${rot}) scale(${s})`}>
        {glow > 0 ? (
          <rect
            x={-w / 2 - 14 - 10 * glow}
            y={-h / 2 - 14 - 10 * glow}
            width={w + 28 + 20 * glow}
            height={h + 28 + 20 * glow}
            rx={46}
            fill="none"
            stroke={C.mint}
            strokeWidth={10}
            opacity={0.7 * glow}
          />
        ) : null}
        <rect x={-w / 2} y={-h / 2 + 10} width={w} height={h} rx={38} fill="rgba(20,40,90,0.14)" />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={38} fill={C.mint} stroke={C.mintDeep} strokeWidth={7} />
        <rect
          x={-w / 2 + 12}
          y={-h / 2 + 12}
          width={w - 24}
          height={h - 24}
          rx={28}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={4}
        />
        <text
          y={40}
          textAnchor="middle"
          fontFamily={fontFamily}
          fontWeight={900}
          fontSize={118}
          fill="#FFFFFF"
          stroke={C.mintDeep}
          strokeWidth={14}
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {`${BG35_TEXT.hook.plus}${BG35_TEXT.hook.right}`}
        </text>
        {/* буфер, в который упирается поезд (поезд приходит слева) */}
        <rect x={-w / 2 - 8} y={-30} width={14} height={60} rx={7} fill={C.navy} />
      </g>
    </svg>
  );
};

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const n01 = useLine("n01");
  const wTwenty = useWordAt("n01", BG35_WORDS.n01.twenty);
  const wTwentyTwo = useWordAt("n01", BG35_WORDS.n01.twentyTwo);
  // «эки» — слово сразу после второго «жыйырма»
  const wTwo = useWordAt("n01", BG35_WORDS.n01.twentyTwo + 1);
  const wAsk = useWordAt("n01", BG35_WORDS.n01.ask);

  const outAt = frames - HOOK_KEYS.outFrames;
  // Бонусы выглядывают на «эки», но не раньше, чем поезд встал.
  const peekAt = Math.min(Math.max(wTwo, TAIL_STOP + 3), outAt - 30);
  // Две пульсации «?» в конце реплики, затем волна света по поезду.
  const pulseAt = Math.min(n01.to, outAt - 40);
  const waveAt = Math.min(pulseAt + 26, outAt - 36);
  const waveHit = waveAt + 1.1 * (N - 1) + 4; // волна дошла до таблички

  // ---------- Камера мира ----------
  const kick = f >= HOOK_KEYS.headStop ? Math.exp(-(f - HOOK_KEYS.headStop) / 5) * Math.sin((f - HOOK_KEYS.headStop) * 1.1) : 0;
  const camRot =
    keys(f, [
      [0, -3],
      [HOOK_KEYS.headStop + 6, -0.9],
      [outAt, 1.4],
    ]) +
    0.45 * kick;
  const camZoom = keys(f, [
    [0, 1],
    [outAt, 1.06],
  ]);
  const camX = keys(f, [
    [0, 12],
    [outAt, 0],
  ]);
  const camY = keys(f, [
    [0, 8],
    [outAt, -6],
  ]) + 3 * kick;

  // ---------- Финальный наезд в «?» ----------
  const zt = clamp((f - outAt) / HOOK_KEYS.outFrames);
  const ze = 0.35 * easeIn(clamp(zt / 0.45)) + 0.65 * easeInOut(clamp((zt - 0.2) / 0.75));
  const formScale = keys(f, [
    [0, 1],
    [outAt, 1.025],
  ]);
  const qScreen: P = {
    x: FORM_PIVOT.x + (Q_DEF.x - FORM_PIVOT.x) * formScale,
    y: FORM_PIVOT.y + (glyphCy(Q_DEF) - FORM_PIVOT.y) * formScale,
  };
  // бумага закрывает кадр к последнему кадру сцены (zt = 11/12); мир
  // (дорожка, табличка) гаснет раньше — последним виден «?»
  const paper = easeInOut(clamp((zt - 0.4) / 0.5));
  const worldA = 1 - 0.7 * easeIn(clamp(zt / 0.55));

  // ---------- Формула ----------
  const qPulse = bump(f, pulseAt, 10) + bump(f, pulseAt + 12, 10);
  const glyphState = (g: GlyphDef, i: number) => {
    const t = clamp((f - g.at) / 8);
    let s = pop(f, g.at, 10);
    let dy = -(1 - easeOut(t)) * 80 + 3.5 * Math.sin(f * 0.09 + i * 1.1);
    let rot = (1 - easeOut(t)) * (i % 2 ? 10 : -10);
    if (g.id === "left") {
      const b = bump(f, wTwenty, 10) + bump(f, wTwentyTwo, 10);
      dy -= 22 * b;
      s *= 1 + 0.09 * b;
    }
    if (g.id === "plus" || g.id === "right") {
      const b = bump(f, wTwo + (g.id === "right" ? 2 : 0), 11);
      dy -= 20 * b;
      s *= 1 + 0.1 * b;
      // «+» кивает в сторону «2» (поворот вокруг центра знака)
      if (g.id === "plus") rot += 14 * b;
    }
    if (g.id === "question") {
      const wob = f >= wAsk ? 12 * Math.exp(-(f - wAsk) / 10) * Math.sin((f - wAsk) * 0.7) : 0;
      rot += wob + 4 * Math.sin(f * 0.11) * clamp((f - 14) / 20);
      s *= 1 + 0.17 * qPulse;
      // замах перед наездом
      s *= 1 - 0.06 * bump(f, outAt - 7, 9);
    }
    return { s, dy, rot, opacity: clamp((f - g.at + 1) / 3) };
  };

  // ---------- Поезд жетонов ----------
  const tokens = Array.from({ length: N }, (_, k) => {
    const stopAt = HOOK_KEYS.headStop + HOOK_KEYS.stagger * k;
    const u = stopAt - f;
    const rem = remain(u);
    const s = HEAD_S - GAP * k - rem;
    const v = speed(u);
    const p = trackAt(s);
    const tau = f - stopAt;
    const imp = impact(tau);
    const run = clamp(v / V);
    const glowStop = tau >= 0 ? Math.pow(clamp(1 - tau / 12), 2) : 0;
    const wave = bump(f, waveAt + 1.1 * (N - 1 - k), 9);
    return {
      k,
      s,
      v,
      p,
      visible: p.x > -R - 10,
      // вдоль колеи: растяжение на ходу, сплющивание при ударе
      along: 1 + 0.14 * run - 0.13 * imp,
      across: 1 - 0.06 * run + 0.1 * imp,
      rot: -(rem / R) * 7,
      lift: 0.7 * run + 0.6 * wave,
      glow: Math.max(glowStop, 0.9 * wave),
      dy: -9 * wave,
      stopped: tau >= 0,
    };
  });
  // «Намагниченная» часть колеи: от последнего вставшего жетона до таблички.
  const stoppedTail = tokens.filter((t) => t.stopped).reduce((m, t) => Math.min(m, t.s), Infinity);
  const magFrom = Number.isFinite(stoppedTail) ? stoppedTail - R : TRACK_LEN;

  // ---------- Табличка ----------
  const signPop = pop(f, HOOK_KEYS.signIn, 12);
  const headHit = f >= HOOK_KEYS.headStop ? Math.exp(-(f - HOOK_KEYS.headStop) / 5) * Math.sin((f - HOOK_KEYS.headStop) * 0.9) : 0;
  const shiver = f >= peekAt - 7 && f < peekAt ? Math.sin((f - peekAt) * 2.6) * 1.6 : 0;
  const signHit = bump(f, waveHit, 8);
  const signRot = 4.5 * headHit + shiver + 3 * signHit * Math.sin((f - waveHit) * 1.2);
  const signDx = 6 * Math.max(0, headHit);
  const signS = signPop * (1 + 0.05 * signHit);

  // ---------- Бонусные жетоны за табличкой ----------
  const bonus = [0, 1].map((j) => {
    const at = peekAt + 5 * j;
    let peek = f < at ? 0 : pop(f, at, 13);
    // по очереди прячутся и выглядывают снова
    const duckAt = at + 40 + 16 * j;
    peek *= 1 - 0.75 * bump(f, duckAt, 14);
    // волна по поезду дошла: подпрыгивают
    peek += 0.45 * bump(f, waveHit + 2 * j, 10);
    const hiddenY = HOOK_SIGN.y + 6;
    const peekY = SIGN_TOP - 40; // над табличкой видна почти вся монета со звездой
    const wig = f >= at ? Math.exp(-(f - at) / 26) * Math.sin((f - at) * 0.62) : 0;
    const idle = f >= at ? Math.sin(f * 0.12 + j * 2.1) * clamp((f - at) / 20) : 0;
    return {
      // правая монета не заходит в правую зону Reels (x ≤ 880)
      x: HOOK_SIGN.x + (j === 0 ? -46 : 36) + 6 * wig + 2.5 * idle,
      y: lerp(hiddenY, peekY, peek),
      rot: (j === 0 ? -1 : 1) * (16 * wig + 6 * idle) + (j === 0 ? -8 : 8) * clamp(peek),
      on: f >= at,
    };
  });

  const trackDraw = easeOut(clamp((f - HOOK_KEYS.trackIn) / HOOK_KEYS.trackFrames));
  const fieldFlow = f * 1.6;
  const formula = GLYPHS.map((g, i) => ({ g, ...glyphState(g, i) }));
  // кольца-волны от «?» при пульсации
  const rings = [pulseAt, pulseAt + 12].map((at) => clamp((f - at) / 16));

  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: C.paper })}>
      <div
        style={box({
          inset: 0,
          transformOrigin: `${qScreen.x}px ${qScreen.y}px`,
          transform: `translate(${(540 - qScreen.x) * ze}px, ${(820 - qScreen.y) * ze}px) scale(${1 + 2.2 * ze})`,
        })}
      >
        {/* ---------- Мир: дорожка, поезд, табличка (наклон камеры) ---------- */}
        <div
          style={box({
            left: 0,
            top: 0,
            width: 1080,
            height: 1920,
            opacity: worldA,
            transformOrigin: `${CAM_PIVOT.x}px ${CAM_PIVOT.y}px`,
            transform: `translate(${camX}px, ${camY}px) rotate(${camRot}deg) scale(${camZoom})`,
          })}
        >
          <svg width={1080} height={1920} style={box({ left: 0, top: 0, overflow: "visible" })}>
            <defs>
              <pattern id="bg35-hook-dots" width={44} height={44} patternUnits="userSpaceOnUse">
                <circle cx={22} cy={22} r={2.6} fill={C.line} />
              </pattern>
              <radialGradient id="bg35-hook-glow">
                <stop offset="0%" stopColor={C.yellowSoft} stopOpacity={0.75} />
                <stop offset="100%" stopColor={C.yellowSoft} stopOpacity={0} />
              </radialGradient>
            </defs>
            {/* бумага в точку: видны наклон и наезд камеры */}
            <rect x={-300} y={-300} width={1680} height={2520} fill="url(#bg35-hook-dots)" opacity={0.75} />
            <ellipse cx={CAM_PIVOT.x} cy={CAM_PIVOT.y} rx={560} ry={380} fill="url(#bg35-hook-glow)" opacity={0.55 + 0.25 * Math.sin(f * 0.05)} />
            {/* магнитное поле внутри разворотов (линии текут) */}
            <g fill="none" stroke={C.skyDeep} strokeWidth={5} strokeLinecap="round" opacity={0.8 * trackDraw}>
              {[26, 46].map((rr, i) => {
                const yl = (ROWS[0] + ROWS[1]) / 2;
                const yr = (ROWS[1] + ROWS[2]) / 2;
                return (
                  <g key={rr}>
                    <path
                      d={`M ${TURN_L + 30} ${yl - rr} A ${rr} ${rr} 0 0 0 ${TURN_L + 30} ${yl + rr}`}
                      strokeDasharray="4 16"
                      strokeDashoffset={fieldFlow * (i ? 1.3 : 1)}
                    />
                    <path
                      d={`M ${TURN_R - 30} ${yr - rr} A ${rr} ${rr} 0 0 1 ${TURN_R - 30} ${yr + rr}`}
                      strokeDasharray="4 16"
                      strokeDashoffset={-fieldFlow * (i ? 1.3 : 1)}
                    />
                  </g>
                );
              })}
            </g>
            {/* продолжение за табличкой (бонусный путь), уходит вправо за кадр */}
            <path
              d={`M ${HOOK_SIGN.x} ${HOOK_SIGN.y} L 1240 ${HOOK_SIGN.y}`}
              stroke={C.mintSoft}
              strokeWidth={100}
              strokeLinecap="round"
              fill="none"
              opacity={signPop}
            />
            <path
              d={`M ${HOOK_SIGN.x} ${HOOK_SIGN.y} L 1240 ${HOOK_SIGN.y}`}
              stroke={C.mint}
              strokeWidth={6}
              strokeDasharray="10 14"
              strokeDashoffset={-fieldFlow * 0.8}
              fill="none"
              opacity={signPop}
            />
            {/* колея: тень, кромка, полотно, жёлоб, магнитная разметка */}
            {(
              [
                { stroke: "rgba(20,40,90,0.07)", w: 132, dy: 10 },
                { stroke: C.line, w: 118, dy: 0 },
                { stroke: "#FFFFFF", w: 106, dy: 0 },
                { stroke: C.sky, w: 82, dy: 0 },
              ] as const
            ).map((l, i) => (
              <path
                key={i}
                d={TRACK_D}
                transform={l.dy ? `translate(0 ${l.dy})` : undefined}
                stroke={l.stroke}
                strokeWidth={l.w}
                strokeLinecap="round"
                fill="none"
                pathLength={TRACK_LEN}
                strokeDasharray={`${TRACK_LEN * trackDraw} ${TRACK_LEN}`}
              />
            ))}
            {/* под вставшими жетонами колея «намагничивается» (жёлтая) */}
            {magFrom < TRACK_LEN ? (
              <path
                d={TRACK_D}
                stroke={C.yellowSoft}
                strokeWidth={90}
                strokeLinecap="round"
                fill="none"
                pathLength={TRACK_LEN}
                strokeDasharray={`0 ${magFrom} ${TRACK_LEN - magFrom} ${TRACK_LEN}`}
              />
            ) : null}
            <path
              d={TRACK_D}
              stroke={C.skyDeep}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
              pathLength={TRACK_LEN}
              strokeDasharray={`0.1 22`}
              // магнитный «ток» по колее: разметка медленно течёт к табличке
              strokeDashoffset={-trackDraw * 30 - f * 0.9}
              opacity={trackDraw}
            />
            {/* шлейфы скорости жетонов на ходу */}
            {tokens.map((t) =>
              t.v > 6 && t.visible ? (
                <path
                  key={`tr${t.k}`}
                  d={TRACK_D}
                  stroke={C.yellow}
                  strokeWidth={2 * R * 0.72}
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.32 * clamp(t.v / V)}
                  pathLength={TRACK_LEN}
                  strokeDasharray={`0 ${Math.max(0, t.s - Math.min(150, t.v * 2.3))} ${Math.min(150, t.v * 2.3, t.s)} ${TRACK_LEN * 2}`}
                />
              ) : null,
            )}
          </svg>
          {/* бонусные жетоны — за табличкой */}
          {bonus.map((b, j) =>
            b.on ? <Token key={`b${j}`} kind="bonus" x={b.x} y={b.y} r={R} rot={b.rot} lift={0.3} /> : null,
          )}
          <Sign s={signS} rot={signRot} dx={signDx} glow={Math.max(signHit, bump(f, peekAt, 14) * 0.6)} />
          {/* поезд: хвост рисуется первым, голова — сверху */}
          {[...tokens].reverse().map((t) =>
            t.visible ? (
              <div
                key={`p${t.k}`}
                style={box({
                  left: 0,
                  top: 0,
                  width: 1080,
                  height: 1920,
                  transformOrigin: `${t.p.x}px ${t.p.y}px`,
                  transform: `translateY(${t.dy}px) rotate(${t.p.a}deg) scale(${t.along}, ${t.across}) rotate(${-t.p.a}deg)`,
                })}
              >
                <Token kind="paid" x={t.p.x} y={t.p.y} r={R} rot={t.rot} lift={t.lift} glow={t.glow} />
              </div>
            ) : null,
          )}
        </div>

        {/* ---------- Формула (без наклона камеры) ---------- */}
        <svg
          width={1080}
          height={1920}
          style={box({ left: 0, top: 0, overflow: "visible" })}
        >
          <g transform={`translate(${FORM_PIVOT.x} ${FORM_PIVOT.y}) scale(${formScale}) translate(${-FORM_PIVOT.x} ${-FORM_PIVOT.y})`}>
            {rings.map((r, i) =>
              r > 0 && r < 1 ? (
                <circle
                  key={i}
                  cx={Q_DEF.x}
                  cy={glyphCy(Q_DEF) + 6}
                  r={112 + 64 * easeOut(r)}
                  fill="none"
                  stroke={C.yellow}
                  strokeWidth={12 * (1 - r) + 2}
                  opacity={0.85 * (1 - r)}
                />
              ) : null,
            )}
            {formula.map(({ g, s, dy, rot, opacity }) => (
              <Glyph key={g.id} g={g} s={s} dy={dy} rot={rot} opacity={opacity} />
            ))}
          </g>
        </svg>
      </div>
      {paper > 0 ? <div style={box({ inset: 0, backgroundColor: C.paper, opacity: paper })} /> : null}
    </div>
  );
};
