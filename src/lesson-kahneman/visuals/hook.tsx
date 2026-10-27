// Вступление BM-004: задачка о бите и мяче, ответ «10 центов» и проверка,
// главный вопрос фильма, книга и авторы, маршрут по пяти частям.
import React from "react";
import { C, FONT, S1, S2 } from "../theme";
import { SystemOne } from "./chars";
import { OL, Person } from "./draw";
import { Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

const RUBIK = "Rubik, 'Segoe UI', sans-serif";

// ── общие рисованные детали ──

// деревянная бейсбольная бита (рукоять слева, бочка справа)
const Bat: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={10} cy={58} rx={200} ry={12} fill="#000" opacity={0.07} />
    <path d="M -206 -10 L -40 -15 Q 80 -36 196 -34 Q 222 -34 222 0 Q 222 34 196 34 Q 80 36 -40 15 L -206 10 Z" fill="#dca468" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -150 -6 L -40 -9 Q 80 -26 190 -24" stroke="#f3cf9c" strokeWidth={7} fill="none" strokeLinecap="round" />
    <path d="M 40 18 Q 120 26 200 22" stroke="#b97c3e" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
    <rect x={-200} y={-12} width={80} height={24} rx={6} fill="#3a4766" stroke={OL} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M ${-190 + i * 20} -11 L ${-180 + i * 20} 11`} stroke="#5a6a8f" strokeWidth={4} />
    ))}
    <ellipse cx={-212} cy={0} rx={12} ry={22} fill="#b97c3e" stroke={OL} strokeWidth={5} />
  </g>
);

// бейсбольный мяч с красными швами
const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 70, rot = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={r + 10} rx={r * 0.8} ry={r * 0.14} fill="#000" opacity={0.07} />
    <g transform={`rotate(${rot})`}>
    <circle r={r} fill="#fbfaf4" stroke={OL} strokeWidth={5} />
    <circle cx={-r * 0.32} cy={-r * 0.36} r={r * 0.2} fill="#fff" />
    {[-1, 1].map((d) => (
      <g key={d}>
        <path d={`M ${d * r * 0.62} ${-r * 0.78} Q ${d * r * 0.28} 0 ${d * r * 0.62} ${r * 0.78}`} stroke={C.red} strokeWidth={4} fill="none" />
        {[-3, -2, -1, 0, 1, 2, 3].map((i) => {
          const yy = i * r * 0.2;
          const xx = d * (r * 0.62 - (r * 0.34 * (1 - (yy / (r * 0.78)) ** 2)));
          return <path key={i} d={`M ${xx - 7} ${yy - 4} L ${xx + 7} ${yy + 4}`} stroke={C.red} strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${d * 30} ${xx} ${yy})`} />;
        })}
      </g>
    ))}
    </g>
  </g>
);

// бумажный ценник на верёвочке
const PriceTag: React.FC<{ x: number; y: number; text: string; w?: number; h?: number; size?: number; fill?: string; color?: string; rot?: number; s?: number }> = ({
  x,
  y,
  text,
  w = 300,
  h = 130,
  size = 72,
  fill = C.yellow,
  color = C.ink,
  rot = 0,
  s = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path
      d={`M ${-w / 2} 0 L ${-w / 2 + 40} ${-h / 2} L ${w / 2 - 16} ${-h / 2} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 16} L ${w / 2} ${h / 2 - 16} Q ${w / 2} ${h / 2} ${w / 2 - 16} ${h / 2} L ${-w / 2 + 40} ${h / 2} Z`}
      fill={fill}
      stroke={OL}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <circle cx={-w / 2 + 34} cy={0} r={10} fill="#fff" stroke={OL} strokeWidth={4} />
    <Txt x={20} y={size * 0.35} size={size} weight={900} color={color}>
      {text}
    </Txt>
  </g>
);

// зелёная купюра «$1»
const Bill: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-95} y={-50} width={190} height={100} rx={12} fill="#9fdcae" stroke={OL} strokeWidth={5} />
    <rect x={-80} y={-36} width={160} height={72} rx={8} fill="none" stroke={C.greenDeep} strokeWidth={3} />
    <ellipse cx={0} cy={0} rx={38} ry={30} fill="#e6f7ea" stroke={C.greenDeep} strokeWidth={3} />
    <Txt x={0} y={14} size={40} weight={900} color={C.greenDeep}>
      $1
    </Txt>
  </g>
);

// выражение из отдельных «жетонов» в ряд
const Expr: React.FC<{ x: number; y: number; parts: string[]; gap?: number[]; size?: number; colors?: (string | undefined)[]; k: number }> = ({ x, y, parts, gap, size = 70, colors = [], k }) => {
  if (k <= 0) return null;
  let cx = x;
  return (
    <g>
      {parts.map((p, i) => {
        const w = gap?.[i] ?? (p.length > 1 ? 150 : 90);
        const kx = clamp01(k * parts.length - i);
        const node = (
          <g key={i} opacity={kx} transform={`translate(0 ${(1 - kx) * 20})`}>
            <Txt x={cx + w / 2} y={y} size={size} weight={900} color={colors[i] ?? C.ink}>
              {p}
            </Txt>
          </g>
        );
        cx += w;
        return node;
      })}
    </g>
  );
};

// ── k01. Задачка о бите и мяче ──
export const BatBall: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kBat = pop(t, at(c, 0.05));
  const kBall = pop(t, at(c, 0.3));
  const kSum = pop(t, at(c, 0.62));
  const kRow2 = ramp(t, at(c, 1), 0.5);
  const kQ = pop(t, at(c, 2));
  const glow = kQ > 0 ? 0.5 + 0.5 * Math.sin(t * 3) : 0;
  return (
    <g>
      {/* ряд 1: бита + мяч = $1,10 */}
      <Panel x={80} y={180} w={1250} h={300} />
      {kBat > 0 && (
        <g opacity={clamp01(kBat * 1.5)} transform={`translate(0 ${(1 - kBat) * 40})`}>
          <Bat x={330} y={330 + wob(t, 0, 3)} rot={-14 + wob(t, 1, 1.5)} s={0.95} />
        </g>
      )}
      <Pop t={t} at={at(c, 0.25)} x={630} y={355}>
        <Txt x={0} y={0} size={90} weight={900} color={C.inkSoft}>
          +
        </Txt>
      </Pop>
      {kBall > 0 && (
        <g transform={`translate(760 ${330 + wob(t, 2, 3)}) scale(${kBall * (1 + glow * 0.06)})`}>
          {kQ > 0 && <circle r={96} fill={C.yellow} opacity={0.25 + glow * 0.25} />}
          <Ball x={0} y={0} r={72} rot={t * 8} />
        </g>
      )}
      <Pop t={t} at={at(c, 0.55)} x={890} y={355}>
        <Txt x={0} y={0} size={90} weight={900} color={C.inkSoft}>
          =
        </Txt>
      </Pop>
      {kSum > 0 && <PriceTag x={1130} y={330} text="$1,10" s={kSum} rot={-4 + wob(t, 3, 2)} />}
      <Pop t={t} at={at(c, 0.8)} x={545} y={440}>
        <path d="M -330 -26 Q -330 0 -300 0 L -20 0 Q 0 0 0 16 Q 0 0 20 0 L 300 0 Q 330 0 330 -26" fill="none" stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" />
      </Pop>
      <Pop t={t} at={at(c, 0.85)} x={545} y={530}>
        <Tag x={0} y={0} text="вместе" color={C.cream} size={34} />
      </Pop>

      {/* ряд 2: бита = мяч + $1 */}
      {kRow2 > 0 && (
        <g opacity={kRow2} transform={`translate(0 ${(1 - kRow2) * 30})`}>
          <Panel x={80} y={580} w={1250} h={180} fill="#fffdf6" />
          <Bat x={290} y={670} s={0.55} rot={-8} />
          <Txt x={505} y={700} size={80} weight={900} color={C.inkSoft}>
            =
          </Txt>
          <Ball x={610} y={668} r={44} />
          <Txt x={715} y={700} size={80} weight={900} color={C.inkSoft}>
            +
          </Txt>
        </g>
      )}
      <Pop t={t} at={at(c, 1.35)} x={850} y={668}>
        <Bill x={0} y={0} rot={wob(t, 4, 3)} />
      </Pop>
      <Pop t={t} at={at(c, 1.6)} x={1140} y={680}>
        <Tag x={0} y={0} text="дороже на $1" color={S1.light} size={36} />
      </Pop>

      {/* вопрос: сколько стоит мяч? */}
      {kQ > 0 && (
        <g transform={`translate(760 150) scale(${kQ}) rotate(${wob(t * 1.4, 5, 6)})`}>
          <circle r={64} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={30} size={92} weight={900} color={C.ink}>
            ?
          </Txt>
        </g>
      )}
    </g>
  );
};

// оранжевое «облако» Системы 1 с зубчатым краем
const SparkBubble: React.FC<{ x: number; y: number; w: number; h: number; tail: [number, number]; t: number }> = ({ x, y, w, h, tail, t }) => {
  const n = 22;
  const pts = Array.from({ length: n * 2 }).map((_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? 1 : 1.07 + 0.02 * Math.sin(t * 4 + i);
    return `${x + Math.cos(a) * (w / 2) * rr},${y + Math.sin(a) * (h / 2) * rr}`;
  });
  return (
    <g>
      <path d={`M ${x - w * 0.12} ${y + h * 0.4} L ${tail[0]} ${tail[1]} L ${x + w * 0.06} ${y + h * 0.42} Z`} fill={S1.light} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <polygon points={pts.join(" ")} fill={S1.light} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

// вымпел университета
const Pennant: React.FC<{ x: number; y: number; name: string; fill: string; text?: string; band?: string; k: number; t: number; seed: number }> = ({ x, y, name, fill, text = "#fff", band, k, t, seed }) => {
  if (k <= 0) return null;
  const flap = Math.sin(t * 2.4 + seed) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp01(k * 1.5)}>
      <rect x={-8} y={-80} width={14} height={190} rx={6} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
      <g transform={`rotate(${flap} 6 -60)`}>
        <path d="M 6 -78 L 236 -18 L 6 42 Z" fill={fill} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        {band && <path d="M 6 26 L 70 9 L 70 25 L 6 42 Z" fill={band} />}
        <Txt x={92} y={-6} size={30} weight={900} color={text}>
          {name}
        </Txt>
      </g>
    </g>
  );
};

// ── k02. Ответ «10 центов» и проверка ──
export const BatBallAnswer: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kBub = pop(t, at(c, 0.1));
  const dim = ramp(t, at(c, 1), 0.5);
  const kWrong = ramp(t, at(c, 1.05), 1.2);
  const kStrike = ramp(t, at(c, 1.6), 0.5);
  const kRight = ramp(t, at(c, 2.02), 1);
  const kCheck = ramp(t, at(c, 2.3), 0.5);
  const shock = t > at(c, 1.6);
  return (
    <g>
      {/* Система 1 и её мгновенный ответ */}
      <SystemOne x={250} y={800} s={0.72} t={t} mood={shock ? "shock" : "happy"} talk={t < at(c, 0.6) ? 1 : 0} />
      {kBub > 0 && (
        <g opacity={1 - dim * 0.45} transform={`translate(285 330) scale(${kBub * (1 + 0.025 * Math.sin(t * 5))}) translate(-285 -330)`}>
          <SparkBubble x={285} y={330} w={440} h={250} tail={[250, 560]} t={t} />
          <Txt x={285} y={330} size={66} weight={900} color={C.ink}>
            10 центов!
          </Txt>
          <Txt x={285} y={400} size={30} weight={800} color={S1.deep}>
            легко и уверенно
          </Txt>
        </g>
      )}

      {/* проверка: 0,10 + 1,10 = 1,20 */}
      {kWrong > 0 && (
        <g opacity={clamp01(kWrong * 3)}>
          <Panel x={560} y={150} w={790} h={190} />
          <Expr x={590} y={262} parts={["0,10", "+", "1,10", "=", "1,20"]} gap={[150, 80, 150, 80, 150]} colors={[undefined, C.inkSoft, undefined, C.inkSoft, kStrike > 0.5 ? C.red : undefined]} k={kWrong} />
          {[
            ["мяч", 665],
            ["бита", 895],
          ].map(([s, x]) => (
            <Txt key={s} x={x as number} y={312} size={28} weight={700} color={C.inkSoft}>
              {s as string}
            </Txt>
          ))}
          {kStrike > 0 && <line x1={590} y1={240} x2={590 + 640 * kStrike} y2={240} stroke={C.red} strokeWidth={10} strokeLinecap="round" />}
          {kStrike > 0.9 && (
            <Pop t={t} at={at(c, 1.75)} x={1290} y={245}>
              <circle r={36} fill={C.red} />
              <path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
            </Pop>
          )}
        </g>
      )}

      {/* верно: 0,05 + 1,05 = 1,10 */}
      {kRight > 0 && (
        <g opacity={clamp01(kRight * 3)}>
          <Panel x={560} y={370} w={790} h={160} fill="#effbf3" stroke={kCheck > 0.5 ? C.green : undefined} />
          <Expr x={590} y={474} parts={["0,05", "+", "1,05", "=", "1,10"]} gap={[150, 80, 150, 80, 150]} colors={[C.greenDeep, C.inkSoft, undefined, C.inkSoft, C.greenDeep]} k={kRight} />
          <Check x={1290} y={448} s={46} k={kCheck} />
        </g>
      )}

      {/* больше половины студентов ошиблись */}
      <Pennant x={590} y={660} name="Гарвард" fill="#a51c30" k={pop(t, at(c, 2.5))} t={t} seed={0} />
      <Pennant x={840} y={660} name="Принстон" fill="#f58025" text={C.ink} k={pop(t, at(c, 2.6))} t={t} seed={1.3} />
      <Pennant x={1090} y={660} name="MIT" fill="#8a8b8c" band="#a31f34" k={pop(t, at(c, 2.7))} t={t} seed={2.1} />
      <Pop t={t} at={at(c, 2.8)} x={955} y={830}>
        <rect x={-210} y={-50} width={420} height={78} rx={39} fill={C.red} />
        <Txt x={0} y={4} size={46} weight={900} color="#fff">
          {">50% ошиблись"}
        </Txt>
      </Pop>
    </g>
  );
};

// карточка ответа с одинаково «светящимся» индикатором уверенности
const AnswerCard: React.FC<{ x: number; y: number; answer: string; right: boolean; t: number; k: number; kFill: number; kStamp: number; seed: number }> = ({ x, y, answer, right, t, k, kFill, kStamp, seed }) => {
  if (k <= 0) return null;
  const w = 480;
  const glow = 0.55 + 0.45 * Math.sin(t * 3);
  const fillW = 400 * 0.92 * kFill;
  return (
    <g transform={`translate(${x} ${y + wob(t, seed, 4)}) scale(${k})`} opacity={clamp01(k * 1.5)}>
      <Panel x={-w / 2} y={0} w={w} h={430} />
      <Txt x={0} y={118} size={74} weight={900} color={C.ink}>
        {answer}
      </Txt>
      <Txt x={0} y={196} size={32} weight={800} color={C.inkSoft}>
        уверенность
      </Txt>
      <rect x={-200} y={222} width={400} height={50} rx={25} fill="#eef0f5" stroke={OL} strokeWidth={4} />
      {kFill > 0 && <rect x={-206} y={216} width={fillW + 12} height={62} rx={31} fill={C.yellow} opacity={0.35 * glow} />}
      {kFill > 0 && <rect x={-196} y={226} width={fillW} height={42} rx={21} fill={S1.main} />}
      {kFill > 0 && <rect x={-190} y={230} width={Math.max(0, fillW - 16)} height={12} rx={6} fill="#fff" opacity={0.35} />}
      {kStamp > 0 && (
        <g transform={`translate(0 ${352}) rotate(${right ? 4 : -5}) scale(${0.6 + 0.4 * kStamp})`} opacity={clamp01(kStamp * 1.5)}>
          <rect x={-150} y={-46} width={300} height={84} rx={18} fill="#fff" stroke={right ? C.green : C.red} strokeWidth={7} />
          <Txt x={0} y={14} size={50} weight={900} color={right ? C.greenDeep : C.red}>
            {right ? "верно" : "неверно"}
          </Txt>
        </g>
      )}
    </g>
  );
};

// лупа
const Magnifier: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 52 52 L 120 120" stroke="#8a5a2b" strokeWidth={26} strokeLinecap="round" />
    <path d="M 52 52 L 120 120" stroke={OL} strokeWidth={4} strokeLinecap="round" opacity={0.3} />
    <circle r={76} fill="#e9f6ff" opacity={0.55} stroke={OL} strokeWidth={12} />
    <path d="M -40 -30 Q -30 -50 -6 -56" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" />
  </g>
);

// ── k03. Главный вопрос фильма ──
export const BigQuestion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kL = pop(t, at(c, 0.05));
  const kR = pop(t, at(c, 0.18));
  const kFill = ramp(t, at(c, 0.2), 1.1);
  const kStamp = pop(t, at(c, 0.62));
  const kEq = pop(t, at(c, 0.82));
  const kQ = pop(t, at(c, 1));
  const kMag = ramp(t, at(c, 1.6), 0.8);
  return (
    <g>
      <AnswerCard x={320} y={kQ > 0 ? 360 : 330} answer="10 центов" right={false} t={t} k={kL} kFill={kFill} kStamp={kStamp} seed={0} />
      <AnswerCard x={1600} y={kQ > 0 ? 360 : 330} answer="5 центов" right t={t} k={kR} kFill={kFill} kStamp={pop(t, at(c, 0.7))} seed={2} />
      {kEq > 0 && kQ <= 0 && (
        <g transform={`translate(960 225) scale(${kEq})`}>
          <rect x={-180} y={-46} width={360} height={84} rx={42} fill={C.ink} />
          <Txt x={0} y={12} size={44} weight={900} color={C.yellow}>
            одинаково
          </Txt>
        </g>
      )}
      {kQ > 0 && (
        <g transform={`translate(960 172) scale(${0.7 + 0.3 * kQ})`} opacity={clamp01(kQ * 1.5)}>
          <rect x={-640} y={-82} width={1280} height={164} rx={40} fill={C.ink} />
          <rect x={-640} y={-82} width={1280} height={164} rx={40} fill="none" stroke={C.yellow} strokeWidth={6} />
          <text x={0} y={-12} textAnchor="middle" fontFamily={RUBIK} fontWeight={800} fontSize={58} fill="#fff">
            Почему мы уверены,
          </text>
          <text x={0} y={56} textAnchor="middle" fontFamily={RUBIK} fontWeight={800} fontSize={58} fill={C.yellow}>
            даже когда ошибаемся?
          </text>
        </g>
      )}
      {kMag > 0 && (
        <g opacity={clamp01(kMag * 2)}>
          <Magnifier x={200 + 140 * kMag} y={740 - 40 * kMag + wob(t, 6, 5)} rot={-10} s={0.9} />
        </g>
      )}
    </g>
  );
};

// стилизованная обложка: верх — синий «медленно», низ — оранжевый «быстро»
const Cover: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => {
  const w = 380;
  const h = 520;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-w / 2 + 12} y={-h / 2 + 16} width={w} height={h} rx={18} fill="#000" opacity={0.12} />
      <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w} height={h} rx={18} fill="#fffdf4" stroke={OL} strokeWidth={5} />
      <clipPath id="bm4-cover">
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} />
      </clipPath>
      <g clipPath="url(#bm4-cover)">
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={S2.main} />
        <path d={`M ${-w / 2} ${40} L ${w / 2} ${-30} L ${w / 2} ${h / 2} L ${-w / 2} ${h / 2} Z`} fill={S1.main} />
        <path d={`M ${-w / 2} ${40} L ${w / 2} ${-30}`} stroke="#fff" strokeWidth={8} />
        <rect x={-w / 2} y={-h / 2} width={22} height={h} fill="#000" opacity={0.16} />
        {/* очки на синей половине, молния на оранжевой */}
        <g fill="none" stroke="#fff" strokeWidth={6} opacity={0.5}>
          <circle cx={108} cy={-150} r={22} />
          <circle cx={160} cy={-150} r={22} />
          <path d="M 130 -152 L 138 -152" />
        </g>
        <path d="M -128 60 L -96 60 L -108 84 L -84 84 L -122 134 L -114 100 L -138 100 Z" fill={C.yellow} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
      </g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill="none" stroke={OL} strokeWidth={5} />
      <text x={-w / 2 + 44} y={-h / 2 + 60} fontFamily={FONT} fontWeight={800} fontSize={28} fill="#fff">
        Даниэль Канеман
      </text>
      <text x={-w / 2 + 44} y={-h / 2 + 158} fontFamily={RUBIK} fontWeight={800} fontSize={58} fill="#fff">
        Думай
      </text>
      <text x={-w / 2 + 44} y={-h / 2 + 222} fontFamily={RUBIK} fontWeight={800} fontSize={52} fill="#fff">
        медленно…
      </text>
      <text x={w / 2 - 36} y={h / 2 - 108} textAnchor="end" fontFamily={RUBIK} fontWeight={800} fontSize={52} fill="#fff">
        …решай
      </text>
      <text x={w / 2 - 36} y={h / 2 - 46} textAnchor="end" fontFamily={RUBIK} fontWeight={800} fontSize={58} fill="#fff">
        быстро
      </text>
    </g>
  );
};

// листок исследовательских заметок
const Note: React.FC<{ x: number; y: number; rot?: number; label: string; chart?: boolean }> = ({ x, y, rot = 0, label, chart }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(0.9)`}>
    <rect x={-90} y={-110} width={180} height={220} rx={10} fill="#fffdf4" stroke={OL} strokeWidth={4} />
    <rect x={-26} y={-122} width={52} height={22} rx={5} fill={C.yellow} opacity={0.85} />
    <Txt x={0} y={-60} size={30} weight={900} color={S2.deep}>
      {label}
    </Txt>
    {chart ? (
      <g>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-58 + i * 44} y={60 - (i + 1) * 30} width={30} height={(i + 1) * 30} rx={5} fill={[S1.main, C.green, S2.main][i]} />
        ))}
        <path d="M -66 62 L 70 62" stroke={OL} strokeWidth={3} />
      </g>
    ) : (
      [0, 1, 2, 3].map((i) => <path key={i} d={`M -60 ${-20 + i * 28} L ${40 - ((i * 23) % 40)} ${-20 + i * 28}`} stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" opacity={0.45} />)
    )}
  </g>
);

// медаль в нобелевском стиле (без воспроизведения реальной медали)
const Medal: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${wob(t, 7, 3)})`}>
    <path d="M -40 -110 L -10 -20 L 10 -20 L -10 -110 Z" fill={S2.main} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 40 -110 L 10 -20 L -10 -20 L 10 -110 Z" fill={C.coral} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <circle cy={30} r={62} fill={C.yellowDeep} stroke={OL} strokeWidth={5} />
    <circle cy={30} r={46} fill={C.yellow} stroke={C.bananaDark} strokeWidth={4} />
    <path d="M -20 44 Q -24 14 0 8 Q 24 14 20 44" fill="none" stroke={C.bananaDark} strokeWidth={5} strokeLinecap="round" />
    <path d="M -24 50 L 24 50" stroke={C.bananaDark} strokeWidth={5} strokeLinecap="round" />
    <circle cx={-22} cy={4} r={9} fill="#fff" opacity={0.6} />
  </g>
);

// ── k04. Книга, авторы, канал ──
export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kBook = pop(t, at(c, 0.05));
  const out = ramp(t, at(c, 2), 0.5);
  const kWord = pop(t, at(c, 2.3));
  const bookX = 840 - out * 40;
  const bookS = 1 - out * 0.12;
  return (
    <g>
      {kBook > 0 && (
        <g transform={`translate(${bookX} 470) scale(${kBook * bookS}) translate(${-bookX} -470)`} opacity={clamp01(kBook * 1.5)}>
          <Cover x={bookX} y={460 + wob(t, 0, 4)} rot={-4 + wob(t, 1, 1.5)} />
        </g>
      )}
      <Pop t={t} at={at(c, 0.55)} x={890} y={800}>
        <Tag x={0} y={0} text="Даниэль Канеман, психолог" color="#fff" size={32} />
      </Pop>

      {/* Канеман и Тверски */}
      {out < 1 && (
        <g opacity={1 - out} transform={`translate(${out * 60} 0)`}>
          <Pop t={t} at={at(c, 1)} x={0} y={0}>
            <Panel x={1120} y={150} w={730} h={380} />
            <Txt x={1485} y={222} size={42} weight={900} color={C.ink}>
              Канеман и Тверски
            </Txt>
          </Pop>
          <Pop t={t} at={at(c, 1.08)} x={1250} y={480}>
            <Person x={0} y={0} s={1.15} color={C.sky} t={t} />
          </Pop>
          <Pop t={t} at={at(c, 1.15)} x={1420} y={480}>
            <Person x={0} y={0} s={1.15} color={C.green} t={t + 1} />
          </Pop>
          <Pop t={t} at={at(c, 1.3)} x={1600} y={380 + wob(t, 2, 5)} from={0.9}>
            <Note x={0} y={0} rot={-8} label="суждения" />
          </Pop>
          <Pop t={t} at={at(c, 1.4)} x={1765} y={410 + wob(t, 3, 5)}>
            <Note x={0} y={0} rot={7} label="выбор" chart />
          </Pop>
          {/* Нобелевская премия */}
          <Pop t={t} at={at(c, 1.58)} x={0} y={0}>
            <Panel x={1120} y={570} w={730} h={220} fill="#fff8e1" />
          </Pop>
          <Pop t={t} at={at(c, 1.62)} x={1230} y={680}>
            <Medal x={0} y={0} s={0.95} t={t} />
          </Pop>
          <Pop t={t} at={at(c, 1.68)} x={1560} y={680}>
            <Txt x={0} y={-6} size={42} weight={900} color={C.ink}>
              Нобелевская премия
            </Txt>
            <Txt x={0} y={46} size={38} weight={800} color={C.inkSoft}>
              по экономике
            </Txt>
          </Pop>
        </g>
      )}

      {/* BanaMind */}
      {kWord > 0 && (
        <g transform={`translate(1450 440) scale(${kWord}) rotate(${wob(t, 4, 1)})`}>
          <rect x={-380} y={-120} width={760} height={220} rx={60} fill={C.ink} />
          <rect x={-380} y={-120} width={760} height={220} rx={60} fill="none" stroke={C.yellow} strokeWidth={6} />
          <text x={0} y={36} textAnchor="middle" fontFamily={RUBIK} fontWeight={900} fontSize={128}>
            <tspan fill="#fff">Bana</tspan>
            <tspan fill={C.yellow}>Mind</tspan>
          </text>
        </g>
      )}
      <Pop t={t} at={at(c, 2.55)} x={1450} y={650}>
        <Tag x={0} y={0} text="главные идеи книги" color={C.yellow} size={40} />
      </Pop>
    </g>
  );
};

// ── k05. Маршрут фильма ──
type Pt = [number, number];
const STOPS: { p: Pt; label: string; color: string; lx: number; ly: number }[] = [
  { p: [560, 690], label: "Две системы", color: S2.main, lx: 560, ly: 800 },
  { p: [830, 500], label: "Ловушки", color: C.coral, lx: 830, ly: 390 },
  { p: [1110, 640], label: "Уверенность", color: C.violet, lx: 1110, ly: 750 },
  { p: [1380, 440], label: "Выбор", color: C.green, lx: 1380, ly: 330 },
  { p: [1630, 600], label: "Два «я»", color: "#e86aa6", lx: 1630, ly: 710 },
];
const START: Pt = [330, 800];
const FLAG: Pt = [1780, 330];

// гладкая дорога через точки (Catmull-Rom → кубические Безье)
const ROUTE: Pt[] = [START, ...STOPS.map((s) => s.p), FLAG];
const SEGS = ROUTE.slice(0, -1).map((p1, i) => {
  const p0 = ROUTE[Math.max(0, i - 1)];
  const p2 = ROUTE[i + 1];
  const p3 = ROUTE[Math.min(ROUTE.length - 1, i + 2)];
  const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
  const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
  return [p1, c1, c2, p2] as [Pt, Pt, Pt, Pt];
});
const ROAD_D = `M ${START[0]} ${START[1]} ` + SEGS.map(([, a, b, d]) => `C ${a[0]} ${a[1]} ${b[0]} ${b[1]} ${d[0]} ${d[1]}`).join(" ");
const bez = (s: [Pt, Pt, Pt, Pt], u: number): Pt => {
  const v = 1 - u;
  return [0, 1].map((k) => v * v * v * s[0][k] + 3 * v * v * u * s[1][k] + 3 * v * u * u * s[2][k] + u * u * u * s[3][k]) as Pt;
};
// точка на дороге по «номеру остановки» (0 — старт, 6 — флаг)
const roadAt = (q: number): Pt => {
  const i = Math.max(0, Math.min(SEGS.length - 1, Math.floor(q)));
  return bez(SEGS[i], clamp01(q - i));
};

export const Roadmap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kRoad = ramp(t, 0.15, 1.2);
  const lit = [0.12, 0.42, 0.58, 0.74, 0.9].map((f) => at(c, f));
  const flagAt = at(c, 1.25);
  // ведущая точка едет к последней зажжённой остановке
  let target = 0;
  lit.forEach((a) => {
    target += ramp(t, a - 0.5, 0.6);
  });
  target += ramp(t, flagAt - 0.5, 0.8);
  const car = roadAt(target);
  const moving = Math.sin(Math.PI * clamp01(target - Math.floor(target)));
  return (
    <g>
      {/* заголовок */}
      <Pop t={t} at={0.1} x={480} y={180}>
        <text x={0} y={0} textAnchor="middle" fontFamily={RUBIK} fontWeight={800} fontSize={58} fill={C.ink}>
          Наш маршрут
        </text>
        <rect x={-170} y={20} width={340} height={10} rx={5} fill={C.yellow} />
      </Pop>
      {/* дорога */}
      <path d={ROAD_D} fill="none" stroke="#000" strokeOpacity={0.08} strokeWidth={96} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - kRoad} transform="translate(6 10)" />
      <path d={ROAD_D} fill="none" stroke="#5d6882" strokeWidth={84} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - kRoad} />
      <path d={ROAD_D} fill="none" stroke="#6f7b96" strokeWidth={66} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - kRoad} />
      {kRoad > 0.98 && <path d={ROAD_D} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeDasharray="26 22" opacity={0.85} />}

      {/* остановки */}
      {STOPS.map((s, i) => {
        const appear = ramp(t, 0.4 + i * 0.15, 0.4);
        const on = pop(t, lit[i]);
        const [x, y] = s.p;
        const pulse = on > 0 ? 1 + 0.04 * Math.sin(t * 3 + i) : 1;
        return (
          <g key={i} opacity={appear}>
            {on > 0 && <circle cx={x} cy={y} r={70 * on} fill={s.color} opacity={0.25} />}
            <g transform={`translate(${x} ${y}) scale(${pulse})`}>
              <circle r={50} fill={on > 0.5 ? s.color : "#fff"} stroke={OL} strokeWidth={6} />
              <text x={0} y={18} textAnchor="middle" fontFamily={RUBIK} fontWeight={900} fontSize={50} fill={on > 0.5 ? "#fff" : C.inkSoft}>
                {String(i + 1)}
              </text>
            </g>
            {on > 0 && (
              <g transform={`translate(${s.lx} ${s.ly}) scale(${on})`}>
                <Tag x={0} y={0} text={s.label} color={s.color} textColor="#fff" size={40} />
              </g>
            )}
          </g>
        );
      })}

      {/* финальный флаг «Памятка» */}
      {kRoad > 0.95 && (
        <g transform={`translate(${FLAG[0]} ${FLAG[1]})`}>
          <rect x={-7} y={-150} width={14} height={160} rx={6} fill={OL} />
          <g transform={`translate(0 -150) scale(${0.35 + 0.65 * pop(t, flagAt)})`}>
            <path d={`M 7 0 Q 60 ${-12 + wob(t, 3, 6)} 120 0 L 120 70 Q 60 ${58 + wob(t, 4, 6)} 7 70 Z`} fill={pop(t, flagAt) > 0.5 ? C.yellow : "#fff"} stroke={OL} strokeWidth={5} />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M 30 ${20 + i * 16} L ${92 - i * 10} ${20 + i * 16}`} stroke={OL} strokeWidth={5} strokeLinecap="round" opacity={0.5} />
            ))}
          </g>
        </g>
      )}
      <Pop t={t} at={flagAt + 0.15} x={1600} y={210}>
        <Tag x={0} y={0} text="Памятка" color={C.ink} textColor={C.yellow} size={44} />
      </Pop>

      {/* бегунок «вы здесь» */}
      {moving > 0.05 && (
        <g transform={`translate(${car[0]} ${car[1]}) scale(${clamp01(moving * 2)})`}>
          <circle r={26} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <circle r={10} fill={OL} />
        </g>
      )}
    </g>
  );
};
