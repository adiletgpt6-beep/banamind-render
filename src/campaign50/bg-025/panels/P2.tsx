// Печать панели 2/6 бумажной ленты (координаты панели RIB.w × RIB.h):
// бумажная карта Бишкека — мягкая сетка улиц, широкий проспект с
// тополями, хребет Ала-Тоо со снегом вдоль верхнего края, метка школы,
// семь меток семей с крошечными бирками времени и напечатанный ползунок
// времени внизу. Совпавшие по адресу, школе и времени метки подсвечены
// жёлтым и соединены со школой пунктиром; остальные — спокойно-серые,
// отдельно, без крестов и «ошибок».
// t — кадры с момента, когда панель легла плашмя (DONE — итог).
// Сцена шага 2 управляет картой по речи через P2Map и состояние P2State.
import { IconPath, Mountains } from "../art";
import { box, settle } from "../kit";
import { RIB } from "../ribbon";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { C, F } from "../theme";

const T = BG25_TEXT.step2;

// ---------- Геометрия карты (координаты панели) ----------
const MAP = { x: 30, y: 30, w: 760, h: 452 } as const;
const MTN_H = 92; // полоса гор у верхнего края карты
const CITY_Y = MAP.y + MTN_H; // где начинается город
const AVE_Y = 322; // широкий проспект (с запада на восток)
const AVE_W = 26;

export const P2_SCHOOL = { x: 478, y: 262 } as const;

export type P2Home = { readonly x: number; readonly y: number; readonly time: string; readonly match: boolean; readonly tag: "below" | "above" };
// Три совпавшие метки — рядом друг с другом и со школой, время 07:30–07:40.
// Остальные: дальняя метка с тем же временем (не по пути), другое время.
export const P2_HOMES: readonly P2Home[] = [
  { x: 400, y: 206, time: "07:30", match: true, tag: "above" },
  { x: 606, y: 214, time: "07:35", match: true, tag: "above" },
  { x: 392, y: 410, time: "07:40", match: true, tag: "below" },
  { x: 168, y: 196, time: "07:30", match: false, tag: "below" },
  { x: 712, y: 176, time: "08:20", match: false, tag: "below" },
  { x: 212, y: 408, time: "13:00", match: false, tag: "below" },
  { x: 664, y: 410, time: "14:00", match: false, tag: "below" },
];
export const P2_MATCH = P2_HOMES.map((h, i) => (h.match ? i : -1)).filter((i) => i >= 0);
export const p2Dist = (h: P2Home) => Math.hypot(h.x - P2_SCHOOL.x, h.y - P2_SCHOOL.y);

// Ползунок времени (07:00 … 14:00) внизу панели — между нижними углами,
// которые держат руки мамы (края полосы свободны).
const SL = { y: 556, x0: 380, x1: 706, h0: 7, h1: 14, label: 206 } as const;
const knobX = (hours: number) => SL.x0 + ((clamp(hours, SL.h0, SL.h1) - SL.h0) / (SL.h1 - SL.h0)) * (SL.x1 - SL.x0);
export const P2_KNOB_START = 11;
export const P2_KNOB_END = 7 + 35 / 60;
const WIN = [7 + 25 / 60, 7 + 45 / 60] as const;
const hhmm = (hours: number) => {
  const m = Math.round((hours * 60) / 5) * 5;
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

// ---------- Состояние карты ----------
export type P2State = {
  readonly homes: number; // 0…1 — метки семей появляются по очереди
  readonly school: number; // 0…1 — метка школы
  readonly times: number; // 0…1 — бирки времени
  readonly slider: number; // 0…1 — ползунок «оживает» (подсветка подписи)
  readonly knob: number; // положение ручки, часы
  readonly ring: number; // 0…1 — кольцо поиска проходит по карте (0 — нет)
  readonly match: readonly number[]; // по совпавшим меткам: 0…1 — подсветка
  readonly lines: readonly number[]; // по совпавшим меткам: 0…1 — пунктир к школе
  readonly glow: number; // −1…1 — мягкое «дыхание» подсветки (0 — неподвижно)
};

export const P2_FINAL: P2State = {
  homes: 1,
  school: 1,
  times: 1,
  slider: 0,
  knob: P2_KNOB_END,
  ring: 0,
  match: P2_MATCH.map(() => 1),
  lines: P2_MATCH.map(() => 1),
  glow: 0,
};

// Состояние по t, если сцена не управляет картой сама (итог — P2_FINAL).
export const p2StateAt = (t: number): P2State => {
  if (t >= 600) return P2_FINAL;
  return {
    homes: clamp((t - 6) / 24),
    school: clamp((t - 20) / 12),
    times: clamp((t - 34) / 20),
    slider: 0,
    knob: lerp(P2_KNOB_START, P2_KNOB_END, easeInOut((t - 60) / 26)),
    ring: t > 64 && t < 112 ? (t - 64) / 48 : 0,
    match: P2_MATCH.map((_, i) => clamp((t - 84 - i * 7) / 10)),
    lines: P2_MATCH.map((_, i) => clamp((t - 90 - i * 7) / 14)),
    glow: 0,
  };
};

// Плавный бугорок: 0 вне [a, b], 1 в середине.
const bump = (x: number, a: number, b: number) => (x <= a || x >= b ? 0 : Math.sin((Math.PI * (x - a)) / (b - a)));
const mix = (a: string, b: string, t: number) => {
  const p = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = p(a);
  const B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(t)))).join(",")})`;
};

const GREY_FILL = "#F3F5F9";
const GREY_LINE = "#A7B2C5";
const GREY_ICON = "#8C99B3";

// Бирка времени у метки.
const TimeTag: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly k: number; readonly lit: number }> = ({ x, y, text, k, lit }) => {
  if (k <= 0.001) return null;
  const w = 80;
  const h = 32;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * settle(k * 14, 14)})`} opacity={clamp(k * 2)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={mix("#FFFFFF", C.yellowSoft, lit)} stroke={mix("#C9D2E0", C.yellowDeep, lit)} strokeWidth={2.5} />
      <text x={0} y={8} textAnchor="middle" fontFamily={F.text} fontWeight={900} fontSize={23} fill={mix("#6A7896", C.navy, lit)}>
        {text}
      </text>
    </g>
  );
};

export const P2Map: React.FC<{ readonly s: P2State }> = ({ s }) => {
  const R = 27; // радиус метки семьи
  const ringR = lerp(30, 470, s.ring);
  const ringA = s.ring > 0 ? clamp(s.ring * 6) * (1 - easeInOut(clamp((s.ring - 0.55) / 0.45))) : 0;
  const winK = Math.max(...s.match, 0);
  const kx = knobX(s.knob);
  return (
    <div style={box({ left: 0, top: 0, width: RIB.w, height: RIB.h })}>
      <svg width={RIB.w} height={RIB.h} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <defs>
          <clipPath id="bg25-p2-map">
            <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} rx={20} />
          </clipPath>
          <linearGradient id="bg25-p2-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E3EEFA" />
            <stop offset="1" stopColor="#F2F6FB" />
          </linearGradient>
        </defs>
        {/* ---------- карта ---------- */}
        <g clipPath="url(#bg25-p2-map)">
          <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} fill="#E9EEF5" />
          {/* небо и хребет Ала-Тоо со снегом вдоль верхнего края */}
          <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MTN_H + 6} fill="url(#bg25-p2-sky)" />
          <Mountains w={MAP.w + 40} h={MTN_H - 8} x={MAP.x - 20} y={CITY_Y + 4} far />
          <Mountains w={MAP.w * 0.62} h={MTN_H * 0.55} x={MAP.x + MAP.w * 0.42} y={CITY_Y + 6} />
          {/* предгорье: мягкая полоса */}
          <rect x={MAP.x} y={CITY_Y} width={MAP.w} height={10} fill="#DDE7D6" />
          {/* кварталы: белые улицы сеткой */}
          {Array.from({ length: 10 }, (_, i) => MAP.x + 34 + i * 80).map((x) => (
            <rect key={`v${x}`} x={x - 5} y={CITY_Y + 10} width={10} height={MAP.h} fill="#FFFFFF" />
          ))}
          {[CITY_Y + 58, CITY_Y + 128, AVE_Y + 74, AVE_Y + 140].map((y) => (
            <rect key={`h${y}`} x={MAP.x} y={y - 5} width={MAP.w} height={10} fill="#FFFFFF" />
          ))}
          {/* канал под предгорьем */}
          <path d={`M ${MAP.x} ${CITY_Y + 36} C ${MAP.x + 160} ${CITY_Y + 22}, ${MAP.x + 300} ${CITY_Y + 50}, ${MAP.x + 440} ${CITY_Y + 34} S ${MAP.x + 660} ${CITY_Y + 26}, ${MAP.x + MAP.w} ${CITY_Y + 40}`} fill="none" stroke="#CFE2F5" strokeWidth={9} strokeLinecap="round" />
          {/* скверы */}
          <rect x={MAP.x + 359} y={AVE_Y + 22} width={66} height={42} rx={6} fill="#D8EACF" />
          <rect x={MAP.x + 39} y={CITY_Y + 68} width={66} height={50} rx={6} fill="#D8EACF" />
          <rect x={MAP.x + 599} y={AVE_Y + 84} width={66} height={46} rx={6} fill="#D8EACF" />
          {/* широкий проспект с тополями по обеим сторонам */}
          <rect x={MAP.x} y={AVE_Y - AVE_W / 2} width={MAP.w} height={AVE_W} fill="#FFFFFF" />
          <line x1={MAP.x} y1={AVE_Y} x2={MAP.x + MAP.w} y2={AVE_Y} stroke="#D3DCE8" strokeWidth={2.5} strokeDasharray="14 12" />
          {Array.from({ length: 19 }, (_, i) => MAP.x + 22 + i * 40).map((x) => (
            <g key={`p${x}`}>
              <circle cx={x} cy={AVE_Y - AVE_W / 2 - 7} r={5.5} fill={C.poplar} opacity={0.75} />
              <circle cx={x + 20} cy={AVE_Y + AVE_W / 2 + 7} r={5.5} fill={C.poplar} opacity={0.75} />
            </g>
          ))}
          {/* кольцо поиска: мягко расходится от школы по всей карте */}
          {ringA > 0.001 ? (
            <g opacity={ringA}>
              <circle cx={P2_SCHOOL.x} cy={P2_SCHOOL.y} r={ringR} fill="none" stroke={C.yellow} strokeWidth={26} opacity={0.22} />
              <circle cx={P2_SCHOOL.x} cy={P2_SCHOOL.y} r={ringR} fill="none" stroke={C.yellow} strokeWidth={7} />
              <circle cx={P2_SCHOOL.x} cy={P2_SCHOOL.y} r={Math.max(0, ringR - 70)} fill="none" stroke={C.yellow} strokeWidth={3} opacity={0.55} />
            </g>
          ) : null}
        </g>
        <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} rx={20} fill="none" stroke="#CBD5E3" strokeWidth={3} />
        {/* название города мелко в углу карты */}
        <text x={MAP.x + 22} y={MAP.y + 36} fontFamily={F.text} fontWeight={900} fontSize={25} letterSpacing={3} fill={C.navy} opacity={0.72}>
          {T.city}
        </text>

        {/* ---------- пунктир от совпавших меток к школе ---------- */}
        {P2_MATCH.map((hi, i) => {
          const h = P2_HOMES[hi];
          const p = easeInOut(s.lines[i] ?? 0);
          if (p <= 0.001) return null;
          const d = p2Dist(h);
          const ux = (P2_SCHOOL.x - h.x) / d;
          const uy = (P2_SCHOOL.y - h.y) / d;
          const a = { x: h.x + ux * (R + 4), y: h.y + uy * (R + 4) };
          const L = d - R - 4 - 40;
          const b = { x: a.x + ux * L * p, y: a.y + uy * L * p };
          return <line key={hi} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.yellowDeep} strokeWidth={6} strokeDasharray="13 10" strokeLinecap="round" />;
        })}

        {/* ---------- школа ---------- */}
        {s.school > 0.001 ? (
          <g transform={`translate(${P2_SCHOOL.x} ${P2_SCHOOL.y}) scale(${settle(s.school * 14, 14)})`} opacity={clamp(s.school * 2)}>
            <circle r={40 + 6 * winK} fill={C.yellow} opacity={0.25 * winK} />
            <circle r={36} fill={C.navy} />
            <circle r={31} fill="#FFFFFF" />
            <g transform="translate(-21 -22) scale(0.88)">
              <IconPath kind="school" color={C.navy} w={4.6} />
            </g>
            <g transform="translate(0 62)">
              <rect x={-58} y={-17} width={116} height={34} rx={17} fill={C.navy} />
              <text x={0} y={8.5} textAnchor="middle" fontFamily={F.text} fontWeight={900} fontSize={23} fill="#FFFFFF">
                {T.school}
              </text>
            </g>
          </g>
        ) : null}

        {/* ---------- метки семей ---------- */}
        {P2_HOMES.map((h, i) => {
          const k = clamp(s.homes * 1.8 - i * (0.8 / (P2_HOMES.length - 1)));
          if (k <= 0.001) return null;
          const mi = P2_MATCH.indexOf(i);
          const lit = mi >= 0 ? easeInOut(s.match[mi] ?? 0) : 0;
          const pop = mi >= 0 ? bump(s.match[mi] ?? 0, 0, 1) : 0;
          // кольцо поиска «проверяет» серую метку — лёгкий серый отклик
          const checked = mi < 0 && ringA > 0 ? bump(ringR - p2Dist(h), -30, 70) * ringA : 0;
          const breathe = lit * s.glow;
          const sc = settle(k * 14, 14) * (1 + 0.14 * pop + 0.04 * breathe);
          const ty = h.tag === "above" ? -R - 22 : R + 22;
          return (
            <g key={i}>
              <g transform={`translate(${h.x} ${h.y}) scale(${sc})`} opacity={clamp(k * 2)}>
                {lit > 0.01 ? <circle r={R + 12 + 3 * breathe} fill={C.yellow} opacity={0.3 * lit} /> : null}
                {checked > 0.01 ? <circle r={R + 8 + 10 * checked} fill="none" stroke={GREY_LINE} strokeWidth={3} opacity={0.6 * checked} /> : null}
                <circle r={R} fill={mix(GREY_FILL, C.yellow, lit)} stroke={mix(GREY_LINE, C.navy, lit)} strokeWidth={3.5} />
                <g transform="translate(-15.6 -16.2) scale(0.65)">
                  <IconPath kind="home" color={mix(GREY_ICON, C.navy, lit)} w={5.5} />
                </g>
              </g>
              <TimeTag x={h.x} y={h.y + ty} text={h.time} k={clamp(s.times * 1.6 - i * 0.09)} lit={lit} />
            </g>
          );
        })}

        {/* ---------- ползунок времени ---------- */}
        <g>
          <rect x={MAP.x} y={SL.y - 38} width={MAP.w} height={84} rx={40} fill="#FFFFFF" stroke="#E2E7F0" strokeWidth={2.5} />
          <g transform={`translate(${SL.label - 20} ${SL.y - 20})`}>
            <circle cx={20} cy={20} r={22 + 4 * s.slider} fill={C.yellow} opacity={0.35 + 0.4 * s.slider} />
            <g transform="translate(1 0) scale(0.8)">
              <IconPath kind="clock" color={C.navy} w={5} />
            </g>
          </g>
          <text x={SL.label + 30} y={SL.y + 10} fontFamily={F.text} fontWeight={900} fontSize={28} fill={C.navy}>
            {T.time}
          </text>
          {/* дорожка и часовые риски */}
          <rect x={SL.x0 - 6} y={SL.y - 6} width={SL.x1 - SL.x0 + 12} height={12} rx={6} fill="#DCE3EE" />
          {Array.from({ length: SL.h1 - SL.h0 + 1 }, (_, i) => SL.h0 + i).map((hr) => (
            <line key={hr} x1={knobX(hr)} y1={SL.y + 11} x2={knobX(hr)} y2={SL.y + 18} stroke="#B8C3D6" strokeWidth={3} strokeLinecap="round" />
          ))}
          {[SL.h0, 10, SL.h1].map((hr) => (
            <text key={hr} x={knobX(hr)} y={SL.y + 38} textAnchor="middle" fontFamily={F.text} fontWeight={800} fontSize={19} fill={C.inkSoft}>
              {hhmm(hr)}
            </text>
          ))}
          {/* окно совпадения по времени */}
          {winK > 0.01 ? <rect x={knobX(WIN[0]) - 6} y={SL.y - 11} width={knobX(WIN[1]) - knobX(WIN[0]) + 12} height={22} rx={11} fill={C.yellow} opacity={0.75 * winK} /> : null}
          {/* ручка и время над ней */}
          <g transform={`translate(${kx} ${SL.y})`}>
            <circle r={21} fill="#FFFFFF" stroke={C.navy} strokeWidth={4.5} />
            <circle r={9} fill={C.yellow} />
          </g>
        </g>
        <g transform={`translate(${kx} ${SL.y - 46})`}>
          <path d="M -40 -20 H 40 Q 48 -20 48 -12 V 4 Q 48 12 40 12 H 8 L 0 20 L -8 12 H -40 Q -48 12 -48 4 V -12 Q -48 -20 -40 -20 Z" fill={C.navy} />
          <text x={0} y={4} textAnchor="middle" fontFamily={F.text} fontWeight={900} fontSize={23} fill="#FFFFFF">
            {hhmm(s.knob)}
          </text>
        </g>
      </svg>
    </div>
  );
};

export const P2Art: React.FC<{ readonly t: number }> = ({ t }) => <P2Map s={p2StateAt(t)} />;
