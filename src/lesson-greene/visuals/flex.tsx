// Часть «Защита и границы»: аферы Люстига (Капоне, Эйфелева башня, машина для денег),
// алхимик Брагадино, семь пленений Миньюэ, Кир и Томирис, Козимо Медичи, Спарта и вода.
// Все появления привязаны к репликам через at(c, n); сцена живёт всё время (облака, дым, вода).
import React from "react";
import { C, FONT, SERIF } from "../theme";
import { Coin, Crown, Figure, Ribbon, Scroll, Throne, Year, type Mood } from "./court";
import { Bubble, Flower, Heart, OL } from "./draw";
import { Check, Cross, Tag, Txt, at, clamp01, ease, pop, ramp, wob, type VisualProps } from "./kit";

// ───────────── общие помощники ─────────────

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
type Key = [number, number, number]; // [время, x, y]
// плавное перемещение по ключевым точкам
const track = (t: number, keys: Key[]): [number, number] => {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    const [t1, x1, y1] = keys[i];
    const [t0, x0, y0] = keys[i - 1];
    if (t <= t1) {
      const k = ease(clamp01((t - t0) / Math.max(0.001, t1 - t0)));
      return [lerp(x0, x1, k), lerp(y0, y1, k)];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
};
// видно в окне [a, b): плавно появляется и плавно уходит
const win = (t: number, a: number, b: number, d = 0.5) => ramp(t, a, d) * (1 - ramp(t, b, d));
// положение кисти Figure (без покачивания), side −1 — левая рука
const hand = (x: number, y: number, s: number, deg: number, side: 1 | -1 = 1): [number, number] => {
  const r = (deg * Math.PI) / 180;
  const ex = side * 30 + side * Math.sin(r) * 44;
  const ey = -170 + Math.cos(r) * 44;
  return [x + (ex + side * Math.sin(r * 1.04) * 40) * s, y + (ey + Math.cos(r * 1.04) * 40) * s];
};

// рамка-иллюстрация: фон сцены обрезается по скруглённому прямоугольнику
const Stage: React.FC<{ id: string; x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ id, x, y, w, h, children }) => (
  <g>
    <rect x={x + 8} y={y + 12} width={w} height={h} rx={40} fill="#24324a" opacity={0.12} />
    <clipPath id={id}>
      <rect x={x} y={y} width={w} height={h} rx={40} />
    </clipPath>
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={x} y={y} width={w} height={h} rx={40} fill="none" stroke={OL} strokeWidth={5} />
  </g>
);

// подпись на светлой плашке
const Label: React.FC<{ x: number; y: number; text: string; k?: number; size?: number; color?: string; bg?: string; rot?: number; serif?: boolean }> = ({ x, y, text, k = 1, size = 32, color = C.ink, bg = "#fffdf6", rot = 0, serif }) => {
  if (k <= 0.01) return null;
  const w = text.length * size * 0.58 + size * 1.1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.75 + 0.25 * clamp01(k)})`} opacity={clamp01(k * 1.6)}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.55} rx={size * 0.5} fill={bg} stroke={OL} strokeWidth={3.5} />
      <text x={0} y={size * 0.12} textAnchor="middle" fontFamily={serif ? SERIF : FONT} fontWeight={serif ? 700 : 800} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};

const Cloud: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 0.9 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill="#fff">
    <ellipse cx={0} cy={0} rx={70} ry={30} />
    <circle cx={-30} cy={-16} r={30} />
    <circle cx={18} cy={-26} r={36} />
  </g>
);
// облака, медленно плывущие по кругу внутри полосы [x0, x1]
const drift = (t: number, x0: number, x1: number, speed: number, phase: number) => x0 + ((((t * speed + phase) % (x1 - x0)) + (x1 - x0)) % (x1 - x0));

// дымок (сигара, благовония)
const Smoke: React.FC<{ x: number; y: number; t: number; color?: string }> = ({ x, y, t, color = "#c9ced8" }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const ph = (t * 0.35 + i / 4) % 1;
      return <circle key={i} cx={x + Math.sin(ph * 6 + i) * 10} cy={y - ph * 90} r={6 + ph * 14} fill={color} opacity={(1 - ph) * 0.55} />;
    })}
  </g>
);

// шляпы поверх головы Figure: повторяем трансформацию фигуры
type FigProps = React.ComponentProps<typeof Figure>;
const figT = (p: FigProps) => {
  const s = p.s ?? 1;
  const t = p.t ?? 0;
  const walk = p.walk ?? 0;
  const bob = Math.sin(t * 2.6 + p.x * 0.01) * 2 + (walk ? Math.abs(Math.sin(t * 7)) * -6 * walk : 0);
  return `translate(${p.x} ${p.y + bob}) scale(${p.flip ? -s : s} ${s}) rotate(${(p.bow ?? 0) * 28} 0 -70)`;
};
// «граф» Люстиг — цилиндр и монокль
const Graf: React.FC<FigProps> = (p) => (
  <g opacity={p.opacity ?? 1}>
    <Figure role="modern" body="#2d3550" {...p} opacity={1} />
    <g transform={figT(p)}>
      <rect x={-34} y={-338} width={68} height={74} rx={6} fill="#1f2433" stroke={OL} strokeWidth={4} />
      <rect x={-34} y={-284} width={68} height={12} fill={C.velvet} />
      <ellipse cx={0} cy={-264} rx={54} ry={10} fill="#1f2433" stroke={OL} strokeWidth={4} />
      <circle cx={13 + (p.look ?? 0) * 4} cy={-232} r={12} fill="#e6f6ff" fillOpacity={0.35} stroke={C.gold} strokeWidth={3.5} />
      <path d={`M ${25 + (p.look ?? 0) * 4} -228 Q 34 -206 26 -188`} stroke={C.gold} strokeWidth={2.5} fill="none" />
    </g>
  </g>
);
// гангстер в шляпе-федоре
const Gangster: React.FC<FigProps> = (p) => (
  <g>
    <Figure role="boss" body="#4a4f5c" {...p} />
    <g transform={figT(p)}>
      <path d="M -36 -262 Q -38 -310 0 -312 Q 38 -310 36 -262 Z" fill="#6a5a48" stroke={OL} strokeWidth={4} />
      <path d="M -6 -310 Q 0 -300 6 -310" stroke={OL} strokeWidth={3} fill="none" />
      <rect x={-37} y={-280} width={74} height={12} fill="#2b2b2b" />
      <ellipse cx={0} cy={-262} rx={58} ry={11} fill="#6a5a48" stroke={OL} strokeWidth={4} />
    </g>
  </g>
);

// пачка купюр
const Cash: React.FC<{ x: number; y: number; s?: number; n?: number }> = ({ x, y, s = 1, n = 4 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }).map((_, i) => (
      <g key={i} transform={`translate(${(i % 2) * 6 - 3} ${-i * 11})`}>
        <rect x={-66} y={-20} width={132} height={40} rx={6} fill="#9ed9a8" stroke={OL} strokeWidth={4} />
        <circle r={11} fill="#5fb378" />
      </g>
    ))}
    <rect x={-14} y={-22 - (n - 1) * 11} width={28} height={44 + (n - 1) * 11} fill={C.cream} stroke={OL} strokeWidth={3} />
  </g>
);

// банковский сейф: open 0…1, spin — поворот штурвала
const Safe: React.FC<{ x: number; y: number; open: number; spin: number }> = ({ x, y, open, spin }) => {
  const dw = 170 * Math.cos(clamp01(open) * 1.35);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-110} y={-250} width={220} height={250} rx={18} fill="#7d8aa3" stroke={OL} strokeWidth={5} />
      <rect x={-85} y={-225} width={170} height={200} rx={10} fill="#2f3546" />
      <rect x={-75} y={-120} width={150} height={8} fill="#4a5265" />
      <g transform={`translate(-85 0)`}>
        <rect x={0} y={-225} width={Math.max(6, dw)} height={200} rx={10} fill="#a6b2c8" stroke={OL} strokeWidth={4} />
        {open < 0.25 && (
          <g transform={`translate(${dw / 2} -125) rotate(${spin})`}>
            <circle r={36} fill="#cfd7e6" stroke={OL} strokeWidth={4} />
            {[0, 60, 120].map((a) => (
              <rect key={a} x={-48} y={-5} width={96} height={10} rx={5} fill={OL} transform={`rotate(${a})`} />
            ))}
            <circle r={10} fill={C.gold} stroke={OL} strokeWidth={3} />
          </g>
        )}
      </g>
      <rect x={-96} y={-4} width={30} height={16} rx={4} fill={OL} />
      <rect x={66} y={-4} width={30} height={16} rx={4} fill={OL} />
    </g>
  );
};

const CalSheet: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-60} y={-70} width={120} height={140} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
    <rect x={-60} y={-70} width={120} height={34} rx={10} fill={C.red} stroke={OL} strokeWidth={4} />
    {[-30, 0, 30].map((dx) => (
      <rect key={dx} x={dx - 4} y={-82} width={8} height={22} rx={4} fill={OL} />
    ))}
    {[0, 1, 2, 3].map((r) =>
      [0, 1, 2, 3].map((cc) => <rect key={`${r}${cc}`} x={-44 + cc * 24} y={-22 + r * 22} width={16} height={12} rx={3} fill="#d5dbe6" />),
    )}
  </g>
);

// ───────────── g31 · Люстиг и Капоне ─────────────

export const Capone: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = (b: number) => at(c, b);
  const GX = 520;
  const GY = 812;
  const KX = 960;
  const KY = 812;
  const S = 1.08;
  const holding = t > A(0.62) && t < A(1.05);
  const gArm = holding || (t > A(1.42) && t < A(1.5)) || t > A(1.88) ? 62 : 14;
  const gHand = hand(GX, GY, S, 62);
  const desk: [number, number] = [1120, 676];
  const safeIn: [number, number] = [230, 650];
  const money = track(t, [[A(0.55), desk[0], desk[1]], [A(0.68), gHand[0], gHand[1]], [A(1.05), gHand[0], gHand[1]], [A(1.14), safeIn[0], safeIn[1]], [A(1.38), safeIn[0], safeIn[1]], [A(1.44), gHand[0], gHand[1]], [A(1.46), gHand[0], gHand[1]], [A(1.52), desk[0], desk[1]]]);
  const moneyK = pop(t, A(0.55));
  const safeOpen = t < A(1.2) ? ramp(t, A(0.98), 0.5) * (1 - ramp(t, A(1.14), 0.5)) : ramp(t, A(1.34), 0.5) * (1 - ramp(t, A(1.46), 0.5));
  const spin = ramp(t, A(1.16), 1.6) * 270;
  const gift = track(t, [[A(1.84), 1050, 620], [A(1.92), gHand[0], gHand[1]]]);
  const shock = t > A(1.5) && t < A(2.0);
  const kMood: Mood = shock ? "shock" : t > A(2.0) ? "happy" : t > A(1.05) ? "neutral" : "sly";
  const kArms: [number, number] = shock ? [125, 125] : t > A(1.82) && t < A(1.95) ? [14, 70] : [14, 18];
  const lamp = Math.sin(t * 1.3) * 4;
  return (
    <g>
      <Stage id="flx-capone" x={70} y={110} w={1260} h={720}>
        <rect x={70} y={110} width={1260} height={720} fill="#f3e6cf" />
        {Array.from({ length: 13 }).map((_, i) => (
          <rect key={i} x={70 + i * 100} y={110} width={50} height={480} fill="#ecdcbf" />
        ))}
        <rect x={70} y={590} width={1260} height={240} fill="#b07a4a" />
        <rect x={70} y={590} width={1260} height={14} fill="#8a5a2b" />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={100 + i * 180} y={630} width={140} height={150} rx={8} fill="none" stroke="#8a5a2b" strokeWidth={4} />
        ))}
        {/* окно с городом */}
        <rect x={700} y={170} width={300} height={260} rx={10} fill="#bfe3f7" stroke={OL} strokeWidth={5} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const h = [120, 170, 90, 200, 140, 110][i];
          return (
            <g key={i}>
              <rect x={705 + i * 50} y={430 - h} width={44} height={h} fill={i % 2 ? "#8fa6c4" : "#a9bdd6"} />
              {[0, 1, 2].map((j) => (
                <rect key={j} x={715 + i * 50} y={445 - h + j * 30} width={10} height={12} fill={C.goldLight} opacity={0.5 + 0.5 * Math.sin(t * 1.5 + i * 2 + j)} />
              ))}
            </g>
          );
        })}
        <Cloud x={drift(t, 640, 1060, 12, 40)} y={215} s={0.5} />
        <path d="M 850 170 L 850 430 M 700 300 L 1000 300" stroke={OL} strokeWidth={5} />
        {/* лампа */}
        <g transform={`rotate(${lamp} 400 110)`}>
          <path d="M 400 110 L 400 200" stroke={OL} strokeWidth={4} />
          <path d="M 360 230 Q 400 180 440 230 Z" fill={C.greenDeep} stroke={OL} strokeWidth={4} />
          <ellipse cx={400} cy={236} rx={18} ry={8} fill={C.goldLight} />
          <path d="M 340 240 L 300 420 L 500 420 L 460 240 Z" fill="#fff6c8" opacity={0.25} />
        </g>
      </Stage>
      {/* стол Капоне */}
      <rect x={1000} y={690} width={300} height={24} rx={6} fill="#7a4a24" stroke={OL} strokeWidth={5} />
      <rect x={1020} y={712} width={260} height={110} fill="#8f5a2c" stroke={OL} strokeWidth={5} />
      <rect x={1240} y={672} width={40} height={18} rx={6} fill="#c9ced8" stroke={OL} strokeWidth={3} />
      <rect x={1240} y={664} width={30} height={6} rx={3} fill="#6b4a1e" />
      <circle cx={1272} cy={667} r={3} fill={C.red} />
      <Smoke x={1272} y={656} t={t} />
      <Safe x={230} y={810} open={safeOpen} spin={spin} />
      <Label x={230} y={530} text="банк" k={ramp(t, A(1.02))} size={30} />
      <Graf x={GX} y={GY} s={S} t={t} arms={[14, gArm]} look={0.6} mood={t > A(1.9) ? "sly" : "happy"} talk={t < A(0.95) && t > A(0.4) ? 0.7 : 0} />
      <Gangster x={KX} y={KY} s={S} t={t} arms={kArms} look={-0.6} mood={kMood} />
      {/* «удвою за 2 месяца» */}
      {(() => {
        const k = pop(t, A(0.74)) * (1 - ramp(t, A(1.05)));
        if (k <= 0.01) return null;
        return (
          <g opacity={clamp01(k * 1.5)} transform={`translate(${430 * (1 - k)} ${380 * (1 - k)}) scale(${k})`}>
            <Bubble x={300} y={250} w={420} h={110} tail={[480, 440]} />
            <Txt x={510} y={322} size={44} weight={900}>×2 за 2 месяца</Txt>
          </g>
        );
      })()}
      {/* два листка календаря */}
      {t > A(1.22) && (
        <g opacity={1 - ramp(t, A(1.42))}>
          <g transform={`scale(${pop(t, A(1.22))})`} style={{ transformOrigin: "190px 330px" }}>
            <CalSheet x={180} y={330} rot={-8} />
          </g>
          {t > A(1.29) && <CalSheet x={290} y={330 + (1 - pop(t, A(1.29))) * -60} rot={6} />}
          <Label x={235} y={445} text="2 месяца" k={pop(t, A(1.3))} size={32} />
        </g>
      )}
      {/* ожидание Капоне */}
      {(() => {
        const k = pop(t, A(1.56)) * (1 - ramp(t, A(2.0)));
        if (k <= 0.01) return null;
        return (
          <g opacity={clamp01(k * 1.5)}>
            <circle cx={1010} cy={470} r={10 * k} fill="#fff" stroke={OL} strokeWidth={3} />
            <circle cx={1030} cy={440} r={16 * k} fill="#fff" stroke={OL} strokeWidth={3} />
            <g transform={`translate(1000 340) scale(${k})`}>
              <ellipse cx={0} cy={0} rx={260} ry={74} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={38} weight={900}>100 000 $ или ничего</Txt>
            </g>
          </g>
        );
      })()}
      {/* пачка 50 000 */}
      {moneyK > 0.01 && t < A(2.05) && (
        <g opacity={(1 - ramp(t, A(1.98))) * clamp01(moneyK * 1.5)} transform={`translate(${money[0]} ${money[1] - wob(t, 1, 3)}) scale(${0.6 + 0.4 * moneyK})`}>
          <Cash x={0} y={0} s={0.85} />
          <Label x={0} y={62} text="50 000 $" size={30} k={1} />
        </g>
      )}
      {/* подарок 5 000 */}
      {t > A(1.84) && (
        <g transform={`translate(${gift[0]} ${gift[1] - wob(t, 2, 3)})`}>
          {t > A(2.05) && <circle r={84 + Math.sin(t * 3) * 4} fill="none" stroke={C.red} strokeWidth={7} strokeDasharray="18 12" opacity={ramp(t, A(2.05))} />}
          <Cash x={0} y={0} s={0.6} n={2} />
          <Label x={0} y={52} text="5 000 $" size={30} color={t > A(2.05) ? C.red : C.ink} />
        </g>
      )}
      <Tag x={230} y={168} text="Закон 12" size={34} color={C.yellow} />
      <Year x={430} y={162} text="≈1926" k={pop(t, A(0.2))} />
      <Label x={GX} y={GY - 410} text="«граф» Люстиг" k={pop(t, A(0.3)) * (1 - win(t, A(0.7), A(1.05), 0.3))} size={30} />
      <Label x={KX + 20} y={KY - 370} text="Аль Капоне" k={pop(t, A(0.45)) * (1 - win(t, A(1.53), A(2.0), 0.3))} size={30} />
      <Ribbon x={760} y={200} text="ради этих 5 000 $" size={44} color={C.red} k={pop(t, A(2.1))} />
    </g>
  );
};

// ───────────── g32 · «продажа» Эйфелевой башни ─────────────

const Eiffel: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const steel = "#9a7458";
  const dark = "#6f4f38";
  const flag = Math.sin(t * 3) * 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -150 0 Q -100 -150 -46 -300 Q -22 -440 -12 -560 L -8 -610 L 8 -610 L 12 -560 Q 22 -440 46 -300 Q 100 -150 150 0 L 96 0 Q 60 -100 0 -104 Q -60 -100 -96 0 Z" fill={steel} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      {/* решётка */}
      <g stroke={dark} strokeWidth={3} opacity={0.8}>
        {[[-128, -40, -82, -110], [-82, -40, -128, -110], [82, -40, 128, -110], [128, -40, 82, -110], [-96, -140, -56, -290], [-56, -140, -96, -290], [96, -140, 56, -290], [56, -140, 96, -290], [-40, -300, 40, -300], [-40, -310, -16, -450], [40, -310, 16, -450], [-16, -310, 30, -450], [16, -310, -30, -450], [-18, -460, 14, -550], [18, -460, -14, -550]].map(([a, b, cc, d], i) => (
          <line key={i} x1={a} y1={b} x2={cc} y2={d} />
        ))}
      </g>
      <rect x={-118} y={-132} width={236} height={22} rx={4} fill={dark} stroke={OL} strokeWidth={4} />
      <rect x={-58} y={-312} width={116} height={18} rx={4} fill={dark} stroke={OL} strokeWidth={4} />
      <rect x={-20} y={-566} width={40} height={16} rx={4} fill={dark} stroke={OL} strokeWidth={4} />
      <path d="M 0 -610 L 0 -660" stroke={OL} strokeWidth={4} />
      <path d={`M 0 -660 Q 24 ${-656 + flag} 44 -650 L 0 -638 Z`} fill={C.skyDeep} stroke={OL} strokeWidth={3} />
    </g>
  );
};

const SoldSign: React.FC<{ x: number; y: number; k: number; rot: number }> = ({ x, y, k, rot }) => {
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.4 + 0.6 * k})`} opacity={clamp01(k * 1.5)}>
      <path d="M -60 -50 L 0 -96 L 60 -50" stroke={OL} strokeWidth={4} fill="none" />
      <circle cx={0} cy={-96} r={6} fill={C.gold} stroke={OL} strokeWidth={3} />
      <rect x={-120} y={-50} width={240} height={76} rx={12} fill={C.red} stroke={OL} strokeWidth={5} />
      <Txt x={0} y={2} size={40} weight={900} color="#fff">ПРОДАНО</Txt>
    </g>
  );
};

export const Eiffel32: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = (b: number) => at(c, b);
  const docsK = 1 - ramp(t, A(1.0));
  const buyerMood: Mood = t < A(1.0) ? "neutral" : t < A(1.55) ? "worried" : t < A(2.0) ? "happy" : "sad";
  const merchants = [700, 800, 900, 1000, 1100];
  return (
    <g>
      <Stage id="flx-eiffel" x={590} y={110} w={1260} h={720}>
        <rect x={590} y={110} width={1260} height={720} fill="#d9efff" />
        <rect x={590} y={520} width={1260} height={300} fill="#eaf5ff" opacity={0.7} />
        <Cloud x={drift(t, 560, 1900, 14, 100)} y={200} s={0.8} />
        <Cloud x={drift(t, 560, 1900, 9, 900)} y={300} s={0.6} />
        {/* крыши Парижа */}
        {Array.from({ length: 14 }).map((_, i) => {
          const h = 70 + ((i * 37) % 60);
          return (
            <g key={i}>
              <rect x={590 + i * 92} y={740 - h} width={86} height={h} fill={i % 2 ? "#c8d4e6" : "#b9c8dd"} />
              <path d={`M ${586 + i * 92} ${740 - h} L ${633 + i * 92} ${712 - h} L ${680 + i * 92} ${740 - h} Z`} fill="#8fa2bf" />
            </g>
          );
        })}
        <rect x={590} y={740} width={1260} height={90} fill="#e2d6bf" />
      </Stage>
      <Eiffel x={1650} y={810} s={1.0} t={t} />
      {/* стол конфиденциальной встречи */}
      {merchants.map((mx, i) => {
        const k = pop(t, A(0.38 + i * 0.04));
        if (k <= 0.01) return null;
        const buyer = i === 4;
        return (
          <g key={i} opacity={clamp01(k * 1.5)}>
            <Figure x={mx} y={800 + (1 - k) * 30} s={0.74} t={t + i} role="merchant" body={["#c98a0b", "#7a6a55", "#5a7a9a", "#9a5a4a", "#3f8f6f"][i]} look={0.8} mood={buyer ? buyerMood : t > A(0.7) ? "happy" : "neutral"} arms={buyer && t > A(1.55) && t < A(2.0) ? [14, 120] : [14, 14]} />
          </g>
        );
      })}
      <rect x={640} y={728} width={520} height={22} rx={6} fill="#8a5a2b" stroke={OL} strokeWidth={5} opacity={ramp(t, A(0.36))} />
      <rect x={660} y={748} width={480} height={70} fill="#a86d39" stroke={OL} strokeWidth={5} opacity={ramp(t, A(0.36))} />
      <Graf x={1290} y={800} s={0.8} t={t} look={-0.7} arms={[t < A(1.0) ? 100 : 14, t > A(0.3) && t < A(0.9) ? 120 : 20]} mood={t > A(2.0) ? "sly" : "happy"} talk={(t > A(0.3) && t < A(0.9)) || (t > A(1.05) && t < A(1.4)) ? 0.7 : 0} />
      {/* папка «секретно» и бланк «снос» */}
      <g opacity={docsK}>
        {(() => {
          const k = pop(t, A(0.25));
          if (k <= 0.01) return null;
          return (
            <g transform={`translate(760 ${400 + wob(t, 1, 3)}) rotate(-5) scale(${k})`}>
              <path d="M -110 -80 L -40 -80 L -24 -96 L 110 -96 L 110 80 L -110 80 Z" fill="#e7c46a" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
              <rect x={-110} y={-70} width={220} height={150} rx={6} fill="#f2d27e" stroke={OL} strokeWidth={5} />
              <g transform="rotate(-10)">
                <rect x={-96} y={-26} width={192} height={52} rx={8} fill="none" stroke={C.red} strokeWidth={5} />
                <Txt x={0} y={12} size={32} weight={900} color={C.red}>СЕКРЕТНО</Txt>
              </g>
            </g>
          );
        })()}
        {(() => {
          const k = pop(t, A(0.66));
          if (k <= 0.01) return null;
          return (
            <g transform={`translate(1040 ${380 + wob(t, 2, 3)}) rotate(4) scale(${k})`}>
              <rect x={-140} y={-130} width={280} height={250} rx={10} fill="#fff" stroke={OL} strokeWidth={5} />
              <Txt x={0} y={-72} size={46} weight={900} color={C.red}>СНОС</Txt>
              <path d="M -100 -40 L 100 -40 M -100 -10 L 60 -10" stroke="#c9d0dc" strokeWidth={8} strokeLinecap="round" />
              <Txt x={0} y={44} size={32} weight={900}>заявки</Txt>
              <Txt x={0} y={86} size={32} weight={900}>за 4 дня</Txt>
            </g>
          );
        })()}
      </g>
      {/* жалоба на жалованье */}
      {(() => {
        const k = pop(t, A(1.12)) * (1 - ramp(t, A(1.95)));
        if (k <= 0.01) return null;
        return (
          <g opacity={clamp01(k * 1.5)}>
            <g transform={`translate(1280 410) scale(${k}) translate(-1280 -410)`}>
              <Bubble x={1090} y={300} w={400} h={120} tail={[1290, 500]} />
              <Coin x={1150} y={360} r={30} rot={Math.sin(t * 2) * 0.5} />
              <Txt x={1320} y={350} size={32} weight={900}>жалованье</Txt>
              <Txt x={1320} y={392} size={32} weight={900}>маленькое…</Txt>
            </g>
          </g>
        );
      })()}
      {/* сомнение покупателя → «настоящий чиновник!» */}
      {t > A(1.0) && t < A(1.6) && (
        <g opacity={win(t, A(1.0), A(1.5))}>
          <Txt x={1100} y={540} size={64} weight={900} color={C.red}>?</Txt>
        </g>
      )}
      {(() => {
        const k = pop(t, A(1.62)) * (1 - ramp(t, A(2.0)));
        if (k <= 0.01) return null;
        return (
          <g opacity={clamp01(k * 1.5)} transform={`translate(960 520) scale(${k}) translate(-960 -520)`}>
            <circle cx={1080} cy={590} r={9} fill="#fff" stroke={OL} strokeWidth={3} />
            <circle cx={1060} cy={562} r={14} fill="#fff" stroke={OL} strokeWidth={3} />
            <ellipse cx={920} cy={500} rx={230} ry={58} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={920} y={512} size={34} weight={900} color={C.greenDeep}>настоящий чиновник!</Txt>
          </g>
        );
      })()}
      {/* молчание от стыда */}
      {t > A(2.0) && (
        <g opacity={ramp(t, A(2.02))}>
          <circle cx={1084} cy={640} r={9} fill="#ff8a8a" opacity={0.7} />
          <circle cx={1116} cy={640} r={9} fill="#ff8a8a" opacity={0.7} />
          <Label x={960} y={520} text="молчит от стыда" size={30} k={pop(t, A(2.05))} />
        </g>
      )}
      <SoldSign x={1650} y={430} k={pop(t, A(2.12))} rot={-8 + wob(t, 1, 1.5)} />
      <SoldSign x={1650} y={640} k={pop(t, A(2.62))} rot={6 + wob(t, 2, 1.5)} />
      <Label x={1650} y={740} text="через полгода" size={30} k={pop(t, A(2.66))} />
      <Tag x={720} y={168} text="Люстиг" size={34} color={C.yellow} />
      <Year x={900} y={162} text="1925" k={pop(t, A(0.08))} />
      <Label x={1290} y={510} text="«граф»" size={30} k={pop(t, A(0.2)) * (1 - ramp(t, A(1.05)))} />
    </g>
  );
};

// ───────────── g33 · алхимик Брагадино ─────────────

const Mastiff: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean }> = ({ x, y, s = 1, t, flip }) => {
  const br = 1 + Math.sin(t * 2.4 + x) * 0.02;
  const tail = Math.sin(t * 4 + x) * 10;
  const fur = "#2c2c36";
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={110} ry={12} fill="#000" opacity={0.1} />
      <path d={`M -88 -110 Q -120 ${-140 + tail} -112 ${-170 + tail}`} stroke={fur} strokeWidth={14} strokeLinecap="round" fill="none" />
      {[-70, -40, 50, 78].map((lx, i) => (
        <rect key={i} x={lx - 13} y={-80} width={26} height={80} rx={10} fill={i % 3 ? "#24242c" : fur} stroke={OL} strokeWidth={4} />
      ))}
      <g transform={`scale(1 ${br})`} style={{ transformOrigin: "0px -60px" }}>
        <ellipse cx={0} cy={-100} rx={100} ry={52} fill={fur} stroke={OL} strokeWidth={4} />
        <ellipse cx={-20} cy={-120} rx={50} ry={16} fill="#454556" opacity={0.7} />
      </g>
      <g transform={`rotate(${Math.sin(t * 1.2 + x) * 3} 80 -130)`}>
        <rect x={64} y={-152} width={34} height={20} rx={6} fill={C.gold} stroke={OL} strokeWidth={3} />
        <circle cx={112} cy={-166} r={46} fill={fur} stroke={OL} strokeWidth={4} />
        <path d="M 82 -200 Q 70 -168 86 -150 Q 96 -176 96 -200 Z" fill="#1a1a22" stroke={OL} strokeWidth={3} />
        <rect x={120} y={-170} width={52} height={40} rx={16} fill="#3a3a48" stroke={OL} strokeWidth={4} />
        <ellipse cx={168} cy={-164} rx={9} ry={7} fill="#111" />
        <circle cx={118} cy={-180} r={7} fill="#fff" />
        <circle cx={120} cy={-180} r={3.5} fill="#111" />
        <path d="M 140 -132 Q 150 -122 160 -132" stroke="#ff7a8a" strokeWidth={6} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
};

// алхимик: мягкий берет поверх шапочки учёного
const AlchHat: React.FC<FigProps> = (p) => (
  <g>
    <Figure {...p} />
    <g transform={figT(p)}>
      <path d="M -58 -258 Q -64 -300 -10 -306 Q 52 -310 62 -272 Q 30 -248 -58 -258 Z" fill="#3c2560" stroke={OL} strokeWidth={4} />
      <circle cx={40} cy={-290} r={9} fill={C.gold} stroke={OL} strokeWidth={3} />
    </g>
  </g>
);

const Flask: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-12} y={-130} width={24} height={60} fill="#e8f6ff" stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={-44} r={44} fill="#e8f6ff" stroke={OL} strokeWidth={4} />
    <path d="M -40 -30 Q 0 -20 40 -30 Q 36 0 0 0 Q -36 0 -40 -30 Z" fill="#a37ff0" opacity={0.85} />
    {[0, 1, 2].map((i) => {
      const ph = (t * 0.7 + i / 3) % 1;
      return <circle key={i} cx={-14 + i * 14} cy={-20 - ph * 100} r={5 + i} fill="#d9ccfb" opacity={1 - ph} stroke={OL} strokeWidth={1.5} />;
    })}
  </g>
);

const Venice: React.FC<{ t: number }> = ({ t }) => {
  const cols = ["#f2c38b", "#e98f6f", "#f5d7a8", "#d9a3b8", "#f2b27a", "#e6c7a0"];
  const gx = 1500 - ((t * 22) % 1800);
  return (
    <g>
      <rect x={70} y={110} width={1260} height={720} fill="#ffe7cf" />
      <Cloud x={drift(t, 0, 1400, 10, 300)} y={170} s={0.7} />
      {cols.map((col, i) => {
        const h = [330, 280, 360, 300, 340, 290][i];
        const x0 = 70 + i * 205;
        return (
          <g key={i}>
            <rect x={x0} y={620 - h} width={205} height={h} fill={col} stroke={OL} strokeWidth={4} />
            <rect x={x0} y={620 - h} width={205} height={16} fill="#fff" opacity={0.5} />
            {[0, 1, 2].map((j) =>
              [0, 1].map((r) => <path key={`${j}${r}`} d={`M ${x0 + 34 + j * 56} ${580 - r * 110} l 0 -50 q 14 -24 28 0 l 0 50 Z`} fill="#6c5c88" opacity={0.75} />),
            )}
          </g>
        );
      })}
      {/* кампанила */}
      <rect x={1180} y={180} width={70} height={440} fill="#d98b6a" stroke={OL} strokeWidth={4} />
      <path d="M 1170 180 L 1215 110 L 1260 180 Z" fill="#7aa36b" stroke={OL} strokeWidth={4} />
      <rect x={70} y={612} width={1260} height={90} fill="#d8cdb8" stroke={OL} strokeWidth={4} />
      <rect x={70} y={700} width={1260} height={140} fill="#5fb3d6" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${40 + ((t * 30 + i * 140) % 160)} ${728 + i * 30} q 40 -12 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`} stroke="#bfe8f7" strokeWidth={5} fill="none" opacity={0.7} transform="translate(-160 0)" />
      ))}
      {/* гондола */}
      <g transform={`translate(${gx} ${770 + Math.sin(t * 2) * 3})`}>
        <path d="M -150 0 Q 0 30 150 -4 Q 170 -30 160 -50 Q 150 -20 120 -14 L -120 -14 Q -150 -20 -160 -36 Q -168 -14 -150 0 Z" fill="#1f2433" stroke={OL} strokeWidth={4} />
        <path d="M 156 -52 L 172 -52 M 156 -44 L 172 -44" stroke="#c9ced8" strokeWidth={4} />
        <circle cx={-80} cy={-60} r={14} fill="#f2c79b" stroke={OL} strokeWidth={3} />
        <rect x={-94} y={-48} width={28} height={36} rx={8} fill="#fff" stroke={OL} strokeWidth={3} />
        <path d="M -94 -44 L -66 -44 M -94 -32 L -66 -32" stroke={C.red} strokeWidth={4} />
        <path d="M -60 -50 L 10 30" stroke="#8a5a2b" strokeWidth={6} strokeLinecap="round" />
      </g>
    </g>
  );
};

export const Alchemist: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = (b: number) => at(c, b);
  const AX = 650;
  const AY = 700;
  const [hx, hy] = hand(AX, AY, 1, 98);
  const bowl: [number, number] = [790, 580];
  const pouring = t > A(0.55) && t < A(1.0);
  const goldLevel = ramp(t, A(0.55), 5);
  return (
    <g>
      <Stage id="flx-alch" x={70} y={110} w={1260} h={720}>
        <Venice t={t} />
      </Stage>
      {/* стол со склянками */}
      <rect x={700} y={590} width={260} height={20} rx={6} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
      <rect x={720} y={608} width={18} height={100} fill="#7a4a24" stroke={OL} strokeWidth={3} />
      <rect x={922} y={608} width={18} height={100} fill="#7a4a24" stroke={OL} strokeWidth={3} />
      <Flask x={900} y={590} t={t} />
      <g>
        <path d={`M ${bowl[0] - 50} ${bowl[1] - 18} Q ${bowl[0]} ${bowl[1] + 30} ${bowl[0] + 50} ${bowl[1] - 18} Z`} fill="#c9a96a" stroke={OL} strokeWidth={4} />
        {goldLevel > 0 && <ellipse cx={bowl[0]} cy={bowl[1] - 18 - goldLevel * 8} rx={42 * (0.5 + 0.5 * goldLevel)} ry={8 + goldLevel * 6} fill={C.gold} stroke={C.goldDeep} strokeWidth={2} />}
      </g>
      <Mastiff x={380} y={705} s={0.95} t={t} flip />
      <Mastiff x={1060} y={705} s={0.95} t={t} />
      {[1190, 1275].map((nx, i) => (
        <Figure key={i} x={nx} y={705} s={0.68} t={t + i} role={i ? "lady" : "minister"} look={-0.9} mood={t < A(1.0) ? (t > A(0.6) ? "shock" : "happy") : t < A(2.0) ? "happy" : "worried"} arms={t > A(0.6) && t < A(1.0) ? [100, 100] : [12, 12]} />
      ))}
      <AlchHat x={AX} y={AY} s={1} t={t} role="scholar" body="#5a3a8a" look={0.5} arms={[14, pouring ? 98 : t > A(1.0) && t < A(2.0) ? 140 : 40]} mood={t > A(2.3) ? "worried" : t > A(1.0) ? "talk" : "sly"} talk={t > A(1.05) && t < A(1.95) ? 0.8 : 0} />
      {/* золотой песок */}
      {pouring &&
        Array.from({ length: 14 }).map((_, i) => {
          const ph = (t * 1.6 + i / 14) % 1;
          return <circle key={i} cx={lerp(hx, bowl[0], ph) + Math.sin(i * 3) * 4} cy={lerp(hy + 10, bowl[1] - 20, ph)} r={4} fill={C.gold} stroke={C.goldDeep} strokeWidth={1} opacity={win(t, A(0.55), A(0.95))} />;
        })}
      {[0, 1, 2, 3, 4].map((i) => {
        const ph = (t * 0.8 + i / 5) % 1;
        return goldLevel > 0.2 ? <path key={i} d="M 0 -10 L 3 -3 L 10 0 L 3 3 L 0 10 L -3 3 L -10 0 L -3 -3 Z" transform={`translate(${bowl[0] - 40 + i * 20} ${bowl[1] - 40 - ph * 40}) scale(${1 - ph})`} fill="#fff6c8" /> : null;
      })}
      {/* растущие обещания */}
      {(() => {
        const k1 = pop(t, A(1.45)) * (1 - ramp(t, A(2.0)));
        const k2 = pop(t, A(1.72)) * (1 - ramp(t, A(2.0)));
        return (
          <g>
            {k1 > 0.01 && (
              <g transform={`translate(490 ${310 + wob(t, 1, 5)}) scale(${k1})`} opacity={clamp01(k1 * 1.5)}>
                <circle r={86} fill={C.goldLight} stroke={C.goldDeep} strokeWidth={6} />
                <Txt x={0} y={26} size={78} weight={900} color={C.goldDeep}>×2</Txt>
              </g>
            )}
            {k2 > 0.01 && (
              <g transform={`translate(890 ${300 + wob(t, 2, 6)}) scale(${k2 * (1 + 0.04 * Math.sin(t * 3))})`} opacity={clamp01(k2 * 1.5)}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <path key={i} d="M -14 -112 L 0 -150 L 14 -112 Z" fill={C.gold} transform={`rotate(${i * 22.5 + t * 8})`} />
                ))}
                <circle r={112} fill={C.yellow} stroke={C.goldDeep} strokeWidth={6} />
                <Txt x={0} y={14} size={84} weight={900} color={C.velvetDeep}>×30</Txt>
                <Txt x={0} y={62} size={34} weight={900} color={C.ink}>за 7 лет</Txt>
              </g>
            )}
            <Label x={830} y={350} text="а золота всё нет" size={30} k={pop(t, A(1.15)) * (1 - ramp(t, A(1.45)))} />
          </g>
        );
      })()}
      {/* лупа: трубка в рукаве */}
      {(() => {
        const k = pop(t, A(2.08));
        if (k <= 0.01) return null;
        const [ex, ey] = [AX + 72, AY - 170];
        const cx = 1000;
        const cy = 300;
        return (
          <g opacity={clamp01(k * 1.5)}>
            <circle cx={ex} cy={ey} r={30} fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="8 6" />
            <path d={`M ${ex + 24} ${ey - 18} L ${cx - 90} ${cy + 96} M ${ex + 30} ${ey + 4} L ${cx - 40} ${cy + 124}`} stroke={C.ink} strokeWidth={3} opacity={0.5} />
            <g transform={`translate(${cx} ${cy}) scale(${k})`}>
              <clipPath id="flx-lens">
                <circle r={128} />
              </clipPath>
              <circle r={128} fill="#f6efff" />
              <g clipPath="url(#flx-lens)">
                <path d="M -160 -40 L 160 -100 L 160 80 L -160 140 Z" fill="#5a3a8a" />
                <path d="M -160 -40 L 160 -100" stroke="#3c2560" strokeWidth={10} />
                <g transform="rotate(-11)">
                  <rect x={-110} y={-6} width={190} height={38} rx={19} fill="#e8f6ff" fillOpacity={0.9} stroke={OL} strokeWidth={4} />
                  <rect x={-104} y={2} width={150} height={24} rx={12} fill={C.gold} />
                  {[0, 1, 2].map((i) => {
                    const ph = (t * 1.2 + i / 3) % 1;
                    return <circle key={i} cx={86} cy={14 + ph * 70} r={5} fill={C.gold} stroke={C.goldDeep} strokeWidth={1} />;
                  })}
                </g>
              </g>
              <circle r={128} fill="none" stroke="#3b3b4a" strokeWidth={14} />
              <path d="M -60 -96 Q -96 -70 -106 -30" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.7} fill="none" />
              <rect x={86} y={-196} width={34} height={110} rx={14} fill="#6b4a1e" stroke={OL} strokeWidth={4} transform="rotate(45 103 -141)" />
            </g>
            <Label x={cx - 10} y={cy + 178} text="трубка в рукаве" size={32} k={pop(t, A(2.2))} />
          </g>
        );
      })()}
      <Tag x={230} y={168} text="Закон 32" size={34} color={C.yellow} />
      <Year x={420} y={162} text="1589" k={pop(t, A(0.18))} />
      <Label x={620} y={168} text="Венеция" size={30} serif k={pop(t, A(0.12))} />
      <Label x={AX} y={360} text="Брагадино" size={30} k={pop(t, A(0.4)) * (1 - ramp(t, A(1.4)))} />
      <Ribbon x={470} y={260} text="люди хотят чуда" size={44} color={C.purple} k={pop(t, A(2.55))} />
    </g>
  );
};

// ───────────── g34 · машина для денег ─────────────

const Bill: React.FC<{ x: number; y: number; rot?: number; wet?: boolean; t?: number }> = ({ x, y, rot = 0, wet, t = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-80} y={-36} width={160} height={72} rx={6} fill="#a8dcb0" stroke={OL} strokeWidth={4} />
    <rect x={-68} y={-26} width={136} height={52} rx={4} fill="none" stroke="#5fb378" strokeWidth={3} />
    <circle r={20} fill="#d6f0da" stroke="#5fb378" strokeWidth={3} />
    <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#2f7a46">$</text>
    {wet &&
      [0, 1, 2].map((i) => {
        const ph = (t * 0.9 + i / 3) % 1;
        return <path key={i} d="M 0 -10 Q 7 0 0 6 Q -7 0 0 -10 Z" transform={`translate(${-50 + i * 50} ${44 + ph * 40}) scale(1.4)`} fill="#9ad8ff" stroke={C.skyDeep} strokeWidth={1.5} opacity={1 - ph} />;
      })}
  </g>
);

// посыльный отеля: шапочка-таблетка
const Bellboy: React.FC<FigProps> = (p) => (
  <g opacity={p.opacity ?? 1}>
    <Figure {...p} opacity={1} />
    <g transform={figT(p)}>
      <rect x={-26} y={-290} width={52} height={30} rx={6} fill={C.velvet} stroke={OL} strokeWidth={4} transform="rotate(-8 0 -275)" />
      <rect x={-26} y={-268} width={52} height={7} fill={C.gold} transform="rotate(-8 0 -275)" />
    </g>
  </g>
);

const MoneyBox: React.FC<{ x: number; y: number; t: number; k: number }> = ({ x, y, t, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-170} y={-150} width={340} height={170} rx={14} fill="#8a3b22" stroke={OL} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M -160 ${-130 + i * 40} Q 0 ${-120 + i * 40 + Math.sin(i) * 10} 160 ${-134 + i * 40}`} stroke="#6e2c17" strokeWidth={3} fill="none" opacity={0.6} />
    ))}
    {[-90, 0].map((dx, i) => (
      <g key={i} transform={`translate(${dx} -80)`}>
        <circle r={36} fill="#fff6e0" stroke={C.gold} strokeWidth={6} />
        {[0, 1, 2, 3, 4, 5].map((j) => (
          <line key={j} x1={0} y1={-28} x2={0} y2={-22} stroke={OL} strokeWidth={3} transform={`rotate(${j * 60})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-24} stroke={C.red} strokeWidth={4} strokeLinecap="round" transform={`rotate(${Math.sin(t * (1.3 + i) + i) * 70})`} />
        <circle r={5} fill={OL} />
      </g>
    ))}
    {[80, 120].map((lx, i) => (
      <g key={i} transform={`rotate(${Math.sin(t * 1.6 + i * 2) * 18} ${lx} -60)`}>
        <rect x={lx - 5} y={-140} width={10} height={80} rx={5} fill="#c9ced8" stroke={OL} strokeWidth={3} />
        <circle cx={lx} cy={-140} r={12} fill={i ? C.red : C.gold} stroke={OL} strokeWidth={3} />
      </g>
    ))}
    <rect x={-120} y={-22} width={240} height={14} rx={7} fill="#2a1208" />
    <rect x={-150} y={20} width={30} height={20} fill="#6e2c17" stroke={OL} strokeWidth={3} />
    <rect x={120} y={20} width={30} height={20} fill="#6e2c17" stroke={OL} strokeWidth={3} />
  </g>
);

export const MoneyBox34: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = (b: number) => at(c, b);
  const VX = 880;
  const VY = 800;
  const GX = 1700;
  const GY = 800;
  const thinkK = pop(t, A(0.12)) * (1 - ramp(t, A(1.0)));
  const boxK = pop(t, A(1.06));
  const BX = 1260;
  const BY = 640;
  const one = track(t, [[A(1.18), ...hand(VX, VY, 0.9, 80)], [A(1.28), BX, BY - 30]]);
  const cash = track(t, [[A(1.76), ...hand(VX, VY, 0.9, 70)], [A(1.9), ...hand(GX, GY, 0.9, 70, -1)]]);
  const swing = Math.sin(t * 1.1) * 3;
  const fooled = t > A(1.45);
  return (
    <g>
      <Stage id="flx-hotel" x={590} y={110} w={1260} h={720}>
        <rect x={590} y={110} width={1260} height={720} fill="#f7ead4" />
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M ${640 + i * 150} 110 L ${640 + i * 150} 560`} stroke="#ecd9b8" strokeWidth={40} />
        ))}
        <rect x={590} y={560} width={1260} height={150} fill="#d9b88a" />
        <rect x={590} y={556} width={1260} height={10} fill="#b08a55" />
        <rect x={590} y={700} width={1260} height={140} fill="#b84a52" />
        <path d="M 590 740 L 1850 740" stroke="#d9767c" strokeWidth={6} />
        {[700, 1480].map((cx) => (
          <g key={cx}>
            <rect x={cx - 34} y={140} width={68} height={570} fill="#fff6e6" stroke={OL} strokeWidth={4} />
            <rect x={cx - 46} y={120} width={92} height={30} rx={4} fill="#efe0c4" stroke={OL} strokeWidth={4} />
            <rect x={cx - 46} y={690} width={92} height={22} rx={4} fill="#efe0c4" stroke={OL} strokeWidth={4} />
          </g>
        ))}
        {/* люстра */}
        <g transform={`rotate(${swing} 1100 110)`}>
          <path d="M 1100 110 L 1100 180" stroke={C.goldDeep} strokeWidth={4} />
          <path d="M 1030 200 Q 1100 250 1170 200" stroke={C.gold} strokeWidth={8} fill="none" />
          {[1030, 1065, 1100, 1135, 1170].map((lx, i) => (
            <g key={i}>
              <rect x={lx - 5} y={180 + (i === 2 ? 30 : i % 2 ? 22 : 0)} width={10} height={24} fill="#fff" stroke={OL} strokeWidth={2} />
              <ellipse cx={lx} cy={172 + (i === 2 ? 30 : i % 2 ? 22 : 0)} rx={6} ry={10} fill={C.yellow} opacity={0.8 + 0.2 * Math.sin(t * 6 + i)} />
            </g>
          ))}
        </g>
        {/* пальма */}
        <g transform="translate(1790 700)">
          <rect x={-34} y={-70} width={68} height={70} rx={8} fill="#c98a5a" stroke={OL} strokeWidth={4} />
          <path d="M 0 -70 L 0 -230" stroke="#8a5a2b" strokeWidth={10} />
          {[-60, -25, 15, 50].map((a, i) => (
            <path key={i} d="M 0 0 Q 50 -30 110 10" fill="none" stroke={C.green} strokeWidth={18} strokeLinecap="round" transform={`translate(0 -230) rotate(${a + 170 + Math.sin(t + i) * 3})`} />
          ))}
        </g>
      </Stage>
      {/* постоялец и посыльный */}
      <Bellboy x={680} y={800} s={0.74} t={t} role="modern" body={C.velvet} look={0.6} mood="happy" arms={[14, t > A(0.25) && t < A(0.9) ? 70 : 14]} opacity={1 - ramp(t, A(1.0))} />
      {(() => {
        const k = win(t, A(0.22), A(0.95));
        if (k <= 0.01) return null;
        const p = track(t, [[A(0.22), ...hand(VX, VY, 0.9, 70, -1)], [A(0.32), ...hand(680, 800, 0.74, 70)]]);
        return (
          <g opacity={k} transform={`translate(${p[0]} ${p[1] - 14}) scale(0.55)`}>
            <Bill x={0} y={0} rot={-12} />
          </g>
        );
      })()}
      <Figure x={VX} y={VY} s={0.9} t={t * (fooled ? 1 : 1.6)} role="merchant" body="#3f7fbf" look={t < A(1.0) ? -0.6 : 0.8} mood={t > A(1.9) ? "happy" : fooled ? "shock" : "worried"} arms={t < A(1.0) ? [t > A(0.22) && t < A(0.34) ? 70 : 14, t > A(0.5) && t < A(0.8) ? 50 + Math.sin(t * 6) * 20 : 14] : t > A(1.15) && t < A(1.3) ? [14, 80] : fooled && t < A(1.9) ? [110, 110] : [14, 14]} talk={t > A(0.45) && t < A(0.85) ? 0.8 : 0} />
      <Graf x={GX} y={GY} s={0.9} t={t} look={-1} mood="sly" arms={[t > A(1.9) ? 70 : 20, 20]} />
      {/* мысль «графа»: признаки жертвы */}
      {thinkK > 0.01 && (
        <g opacity={clamp01(thinkK * 1.5)} transform={`translate(1640 500) scale(${thinkK}) translate(-1640 -500)`}>
          <circle cx={1668} cy={500} r={10} fill="#fff" stroke={OL} strokeWidth={3} />
          <circle cx={1640} cy={466} r={16} fill="#fff" stroke={OL} strokeWidth={3} />
          <rect x={1010} y={210} width={600} height={230} rx={60} fill="#fff" stroke={OL} strokeWidth={4} />
          {["слишком большие чаевые", "нервные разговоры о делах", "жажда признания"].map((s, i) => (
            <g key={i} opacity={ramp(t, A(0.2 + i * 0.27))}>
              <Check x={1060} y={262 + i * 64} s={34} k={ramp(t, A(0.2 + i * 0.27), 0.5)} />
              <Txt x={1100} y={274 + i * 64} size={32} anchor="start" weight={800}>
                {s}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {t < A(1.0) && t > A(0.4) && (
        <g opacity={win(t, A(0.4), A(0.95))}>
          {[0, 1].map((i) => (
            <path key={i} d="M 0 -12 Q 8 0 0 8 Q -8 0 0 -12 Z" transform={`translate(${VX + 46 + i * 14} ${VY - 280 + ((t * 30 + i * 12) % 30)}) scale(1.6)`} fill="#9ad8ff" stroke={C.skyDeep} strokeWidth={1.5} />
          ))}
        </g>
      )}
      {/* ящик красного дерева */}
      {boxK > 0.01 && (
        <g opacity={clamp01(boxK * 1.5)}>
          <rect x={BX - 150} y={BY + 20} width={300} height={24} rx={6} fill="#7a4a24" stroke={OL} strokeWidth={4} />
          <rect x={BX - 130} y={BY + 42} width={20} height={110} fill="#6e3e1c" stroke={OL} strokeWidth={3} />
          <rect x={BX + 110} y={BY + 42} width={20} height={110} fill="#6e3e1c" stroke={OL} strokeWidth={3} />
          <MoneyBox x={BX} y={BY} t={t} k={boxK} />
          <Label x={BX} y={BY - 210} text="1 $ → 2 $ ?" size={36} k={pop(t, A(1.12)) * (1 - ramp(t, A(1.36)))} />
        </g>
      )}
      {t > A(1.18) && t < A(1.3) && <Bill x={one[0]} y={one[1]} rot={-6} />}
      {/* две влажные купюры и банк */}
      {(() => {
        const k = pop(t, A(1.38));
        if (k <= 0.01) return null;
        const up = ease(clamp01((t - A(1.38)) / 1.2));
        return (
          <g opacity={clamp01(k * 1.5)}>
            <Bill x={BX - 100} y={lerp(BY - 20, BY - 320, up) + wob(t, 1, 3)} rot={-8} wet t={t} />
            <Bill x={BX + 100} y={lerp(BY - 20, BY - 330, up) + wob(t, 2, 3)} rot={7} wet t={t + 0.4} />
          </g>
        );
      })()}
      {(() => {
        const k = pop(t, A(1.55));
        if (k <= 0.01) return null;
        return (
          <g transform={`translate(${BX} ${BY - 300}) rotate(-10) scale(${2 - k})`} opacity={clamp01(k * 1.4)}>
            <rect x={-170} y={-40} width={340} height={80} rx={12} fill="#fff" fillOpacity={0.35} stroke={C.red} strokeWidth={7} />
            <Txt x={0} y={16} size={44} weight={900} color={C.red}>ПОДЛИННЫЕ</Txt>
          </g>
        );
      })()}
      <Label x={BX} y={BY - 222} text="проверено в банке" size={30} k={pop(t, A(1.6))} />
      {t > A(1.76) && (
        <g transform={`translate(${cash[0]} ${cash[1] - wob(t, 3, 3)})`}>
          <Cash x={0} y={0} s={0.8} n={5} />
          <Label x={0} y={64} text="25 000 $" size={32} color={C.red} />
        </g>
      )}
      <Tag x={720} y={168} text="Закон 33" size={34} color={C.yellow} />
      <Year x={900} y={162} text="1925" k={pop(t, A(0.05))} />
      <Label x={1070} y={168} text="Палм-Бич" size={30} k={pop(t, A(0.08))} />
    </g>
  );
};

// ───────────── g36 · семь пленений Миньюэ ─────────────

const Steed: React.FC<{ x: number; y: number; s?: number; t: number; color?: string; mule?: boolean; flip?: boolean; walk?: number }> = ({ x, y, s = 1, t, color = "#a8723f", mule, flip, walk = 0 }) => {
  const sw = Math.sin(t * 6) * 14 * walk;
  const nod = Math.sin(t * 1.7 + x) * 3;
  const mane = mule ? "#5a4a3a" : "#4a2e14";
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={130} ry={12} fill="#000" opacity={0.1} />
      <path d={`M -104 -130 Q -140 -110 -130 ${-50 + Math.sin(t * 2) * 6}`} stroke={mane} strokeWidth={mule ? 8 : 18} strokeLinecap="round" fill="none" />
      {[
        [-80, sw],
        [-56, -sw],
        [70, -sw],
        [94, sw],
      ].map(([lx, d], i) => (
        <g key={i} transform={`rotate(${d} ${lx} -100)`}>
          <rect x={lx - 11} y={-100} width={22} height={100} rx={9} fill={color} stroke={OL} strokeWidth={4} opacity={i % 2 ? 1 : 0.85} />
          <rect x={lx - 12} y={-14} width={24} height={14} rx={4} fill="#3b2a10" />
        </g>
      ))}
      <ellipse cx={0} cy={-128} rx={120} ry={50} fill={color} stroke={OL} strokeWidth={4} />
      <g transform={`rotate(${nod} 90 -150)`}>
        <path d="M 80 -150 L 120 -240 L 160 -230 L 130 -130 Z" fill={color} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 116 -246 Q 150 -262 196 -214 Q 200 -194 180 -190 L 140 -200 Z" fill={color} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        {mule ? (
          <g>
            <path d="M 124 -244 L 112 -300 L 136 -252 Z" fill={color} stroke={OL} strokeWidth={4} />
            <path d="M 138 -246 L 140 -302 L 150 -248 Z" fill={color} stroke={OL} strokeWidth={4} />
          </g>
        ) : (
          <g>
            <path d="M 126 -248 L 124 -272 L 140 -252 Z" fill={color} stroke={OL} strokeWidth={4} />
            <path d="M 118 -244 Q 92 -200 82 -150 L 96 -150 Q 108 -200 128 -236 Z" fill={mane} />
          </g>
        )}
        <circle cx={150} cy={-226} r={5} fill={OL} />
        <circle cx={186} cy={-202} r={3} fill={OL} />
      </g>
    </g>
  );
};

// вождь: тканевая повязка с узлом
const Headdress: React.FC<FigProps> = (p) => (
  <g transform={figT(p)}>
    <path d="M -40 -244 Q -42 -282 0 -286 Q 42 -282 40 -244 Q 0 -256 -40 -244 Z" fill={C.velvet} stroke={OL} strokeWidth={4} />
    <path d="M -38 -256 Q 0 -266 38 -256" stroke={C.gold} strokeWidth={5} fill="none" />
    <path d="M 36 -258 Q 64 -262 70 -236 M 36 -254 Q 58 -238 54 -218" stroke={C.velvet} strokeWidth={10} strokeLinecap="round" fill="none" />
    <circle cx={0} cy={-262} r={7} fill={C.gold} stroke={OL} strokeWidth={3} />
  </g>
);
// учёный-полководец: чёрная шапка-гуань поверх шапочки
const GuanHat: React.FC<FigProps> = (p) => (
  <g transform={figT(p)}>
    <path d="M -44 -250 Q -46 -280 0 -284 Q 46 -280 44 -250 Z" fill="#24324a" stroke={OL} strokeWidth={4} />
    <rect x={-18} y={-310} width={36} height={32} rx={8} fill="#24324a" stroke={OL} strokeWidth={4} />
    <path d="M -44 -262 L -70 -270 M 44 -262 L 70 -270" stroke="#24324a" strokeWidth={6} strokeLinecap="round" />
  </g>
);

const Mountains: React.FC<{ x: number; w: number; t: number }> = ({ x, w, t }) => (
  <g>
    <rect x={x} y={110} width={w} height={720} fill="#dff3ee" />
    <circle cx={x + w - 220} cy={220} r={56} fill="#fff1b8" />
    <path d={`M ${x} 520 L ${x + 160} 300 L ${x + 300} 440 L ${x + 470} 250 L ${x + 640} 450 L ${x + 820} 280 L ${x + 1000} 430 L ${x + 1150} 320 L ${x + w} 420 L ${x + w} 830 L ${x} 830 Z`} fill="#a8d5c8" />
    <path d={`M ${x} 600 L ${x + 220} 420 L ${x + 420} 560 L ${x + 640} 400 L ${x + 860} 560 L ${x + 1080} 430 L ${x + w} 560 L ${x + w} 830 L ${x} 830 Z`} fill="#7fbfa8" />
    <Cloud x={drift(t, x - 100, x + w + 100, 12, 200)} y={380} s={0.9} o={0.7} />
    <Cloud x={drift(t, x - 100, x + w + 100, 8, 900)} y={300} s={0.6} o={0.7} />
    <rect x={x} y={720} width={w} height={110} fill="#8cc97a" />
    <path d={`M ${x} 720 Q ${x + w / 2} 700 ${x + w} 720`} stroke="#6fae5e" strokeWidth={6} fill="none" />
  </g>
);

const Fist: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-44} y={-30} width={88} height={70} rx={20} fill="#f2c79b" stroke={OL} strokeWidth={4} />
    {[-30, -10, 10, 30].map((fx) => (
      <rect key={fx} x={fx - 10} y={-50} width={20} height={34} rx={10} fill="#f2c79b" stroke={OL} strokeWidth={3.5} />
    ))}
    <rect x={-30} y={38} width={60} height={30} fill="#8e9bb0" stroke={OL} strokeWidth={4} />
  </g>
);

export const SevenCaptures: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = (b: number) => at(c, b);
  const LX = 800;
  const MX = 1200;
  const FY = 800;
  const ropeK = win(t, A(0.48), A(0.74), 0.4);
  const bowK = ramp(t, A(1.45), 0.8) * (1 - ramp(t, A(1.62), 0.8));
  const crownP = track(t, [[A(1.62), ...hand(LX, FY, 0.95, 120)], [A(1.74), MX, FY - 0.95 * 276]]);
  const crownK = pop(t, A(1.6));
  const cellsK = 1 - ramp(t, A(2.0));
  const mMood: Mood = t < A(0.48) ? "proud" : t < A(0.74) ? "angry" : t < A(1.0) ? "shock" : t < A(1.45) ? "angry" : t < A(1.62) ? "sad" : "happy";
  const mp: FigProps = { x: MX, y: FY, s: 0.95, t, bow: bowK, flip: true };
  return (
    <g>
      <Stage id="flx-south" x={590} y={110} w={1260} h={720}>
        <Mountains x={590} w={1260} t={t} />
      </Stage>
      {t > A(1.64) && (
        <g opacity={ramp(t, A(1.64))} transform={`translate(${MX} ${FY}) scale(${0.6 + 0.4 * pop(t, A(1.64))}) translate(${-MX} ${-FY})`}>
          <Throne x={MX + 10} y={FY - 10} s={0.62} glow={ramp(t, A(1.7))} />
        </g>
      )}
      <Steed x={1560} y={FY} s={0.85} t={t} color="#c98a4a" walk={0} />
      <Figure x={LX} y={FY} s={0.95} t={t} role="peasant" body="#f1ead8" look={0.6} arms={[14, t > A(0.74) && t < A(0.9) ? 100 : t > A(1.6) && t < A(1.76) ? 120 : 40]} mood={t > A(1.6) ? "happy" : "neutral"} talk={t > A(0.75) && t < A(0.9) ? 0.6 : 0} hold={
          <g transform={`rotate(${-20 + Math.sin(t * 2) * 8})`}>
            <path d="M 0 4 L 0 -26" stroke="#6b4a1e" strokeWidth={6} strokeLinecap="round" />
            <path d="M 0 -24 Q -34 -50 -22 -90 Q 0 -110 22 -90 Q 34 -50 0 -24 Z" fill="#fff" stroke={OL} strokeWidth={3} />
            <path d="M 0 -28 L 0 -100 M 0 -40 L -16 -80 M 0 -40 L 16 -80" stroke="#c9ced8" strokeWidth={2} />
          </g>
        } />
      <GuanHat x={LX} y={FY} s={0.95} t={t} />
      <Figure {...mp} role="peasant" body="#b0563a" look={t > A(0.82) && t < A(1.0) ? -0.8 : 0.7} mood={mMood} arms={ropeK > 0.3 ? [6, 6] : t > A(1.74) ? [130, 130] : [14, 14]} />
      <Headdress {...mp} />
      {/* слёзы */}
      {t > A(1.45) && t < A(1.75) &&
        [0, 1].map((i) => {
          const ph = (t * 1.4 + i / 2) % 1;
          return <path key={i} d="M 0 -8 Q 6 0 0 5 Q -6 0 0 -8 Z" transform={`translate(${MX + (i ? 14 : -14)} ${FY - 205 + ph * 40}) scale(1.6)`} fill="#9ad8ff" stroke={C.skyDeep} strokeWidth={1.5} opacity={1 - ph} />;
        })}
      {/* верёвка */}
      {ropeK > 0.01 && (
        <g opacity={ropeK} transform={`translate(0 ${t > A(0.74) ? ramp(t, A(0.74), 0.4) * 60 : 0})`}>
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={MX} cy={FY - 150 + i * 24} rx={44} ry={10} fill="none" stroke="#a0743a" strokeWidth={8} />
          ))}
        </g>
      )}
      {crownK > 0.01 && t > A(1.6) && <Crown x={crownP[0]} y={crownP[1]} s={0.42} glow={win(t, A(1.7), A(1.95))} />}
      {/* семь пленений */}
      {cellsK > 0.01 &&
        Array.from({ length: 7 }).map((_, i) => {
          const k = pop(t, A(1.04 + i * 0.05));
          const cx = 700 + i * 160 + 40;
          return (
            <g key={i} opacity={cellsK * ramp(t, A(1.0), 0.4)} transform={`translate(${cx} 290)`}>
              <rect x={-62} y={-62} width={124} height={124} rx={22} fill={k > 0.01 ? "#fff3d6" : "#ffffff"} stroke={OL} strokeWidth={4} opacity={0.95} />
              {k > 0.01 && (
                <g transform={`scale(${k})`}>
                  <circle r={30} fill="none" stroke="#a0743a" strokeWidth={9} />
                  <path d="M -10 22 L -18 48 M 10 22 L 18 48" stroke="#a0743a" strokeWidth={8} strokeLinecap="round" />
                </g>
              )}
              <Txt x={0} y={-30} size={30} weight={900} color={C.inkSoft} opacity={k > 0.01 ? 0 : 0.6}>
                {String(i + 1)}
              </Txt>
              <Txt x={44} y={-34} size={30} weight={900} color={C.velvetDeep} opacity={k > 0.01 ? 1 : 0}>
                {String(i + 1)}
              </Txt>
            </g>
          );
        })}
      <Label x={1110} y={168} text="7 пленений" size={34} bg={C.goldLight} k={pop(t, A(1.38)) * cellsK} />
      {/* сердца против принуждения */}
      {(() => {
        const k1 = pop(t, A(2.05));
        const k2 = pop(t, A(2.3));
        return (
          <g>
            {k2 > 0.01 && (
              <g transform={`translate(1530 ${316 + wob(t, 2, 3)}) scale(${k2})`} opacity={clamp01(k2 * 1.5)}>
                <rect x={-220} y={-100} width={440} height={190} rx={30} fill="#eef1f6" stroke={OL} strokeWidth={4} />
                <Fist x={-150} y={-6} s={0.8} />
                <Txt x={50} y={-6} size={34} weight={900} color={C.inkSoft}>принуждение</Txt>
                <Txt x={50} y={44} size={30} weight={800} color={C.red}>→ сопротивление</Txt>
              </g>
            )}
            {k1 > 0.01 && (
              <g transform={`translate(910 ${316 + wob(t, 1, 3)}) scale(${k1})`} opacity={clamp01(k1 * 1.5)}>
                <rect x={-230} y={-100} width={460} height={190} rx={30} fill="#fff" stroke={C.green} strokeWidth={6} />
                <g transform={`translate(-150 0) scale(${1.9 + 0.1 * Math.sin(t * 3)})`}>
                  <Heart x={0} y={10} s={1} color={C.coral} />
                </g>
                <Txt x={50} y={-6} size={40} weight={900} color={C.greenDeep}>сердца</Txt>
                <Txt x={50} y={44} size={30} weight={800} color={C.ink}>→ прочная власть</Txt>
              </g>
            )}
            <Txt x={1215} y={328} size={40} weight={900} color={C.inkSoft} opacity={ramp(t, A(2.3))}>vs</Txt>
          </g>
        );
      })()}
      <Label x={1220} y={456} text="«преданных легче обмануть» — цинизм автора" size={30} color="#7d8596" bg="#eef0f4" k={pop(t, A(2.62))} />
      <Tag x={720} y={168} text="Закон 43" size={34} color={C.yellow} />
      <Year x={920} y={162} text="225 г." k={pop(t, A(0.18)) * (1 - ramp(t, A(1.3)))} />
      <Label x={LX} y={FY - 330} text="Чжугэ Лян" size={30} k={pop(t, A(0.3)) * (1 - ramp(t, A(2.55)))} />
      <Label x={MX} y={FY - 360} text="вождь Миньюэ" size={30} k={pop(t, A(0.42)) * (1 - ramp(t, A(2.55)))} />
      <Label x={1560} y={FY - 300} text="подарок — конь" size={30} k={pop(t, A(0.86)) * (1 - ramp(t, A(1.05)))} />
      <Label x={1560} y={FY - 300} text="верный союзник" size={30} color={C.greenDeep} k={pop(t, A(1.86)) * (1 - ramp(t, A(2.55)))} />
    </g>
  );
};

// ───────────── g37 · Кир и Томирис ─────────────

const Flag: React.FC<{ x: number; y: number; t: number; k: number; fall: number; color?: string }> = ({ x, y, t, k, fall, color = C.velvet }) => {
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y + fall * 10}) rotate(${fall * 75}) scale(${k})`} opacity={1 - fall * 0.6}>
      <path d="M 0 0 L 0 -56" stroke={OL} strokeWidth={4} />
      <path d={`M 0 -56 Q 16 ${-60 + Math.sin(t * 3 + x) * 4} 34 -52 L 0 -36 Z`} fill={fall > 0.5 ? "#a9a9b4" : color} stroke={OL} strokeWidth={3} />
    </g>
  );
};

const Tent: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#e8d6b0" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 0 L -70 -50 Q 0 -110 70 -50 L 70 0 Z" fill={color} stroke={OL} strokeWidth={4} />
    <path d="M -70 -50 Q 0 -30 70 -50" stroke={C.velvet} strokeWidth={6} fill="none" />
    <path d="M -16 0 L -16 -36 L 16 -36 L 16 0 Z" fill="#7a5530" stroke={OL} strokeWidth={3} />
  </g>
);

const Helmet: React.FC<{ x: number; y: number; s?: number; tight: number; t: number }> = ({ x, y, s = 1, tight, t }) => {
  const sy = lerp(150, 110, tight);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -96 10 Q -80 ${sy} 0 ${sy + 20} Q 80 ${sy} 96 10`} stroke="#7a2e1e" strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d={`M -60 ${sy + 4} L -22 ${sy + 18} M 60 ${sy + 4} L 22 ${sy + 18}`} stroke="#9a4e2e" strokeWidth={4} />
      <circle cx={0} cy={sy + 20} r={14} fill={C.gold} stroke={OL} strokeWidth={4} />
      <path d="M -170 40 Q -150 -10 -110 0 L 110 0 Q 150 -10 170 40 Q 120 30 100 20 L -100 20 Q -120 30 -170 40 Z" fill="#3b4a6a" stroke={OL} strokeWidth={5} />
      <path d="M -120 4 Q -120 -150 0 -156 Q 120 -150 120 4 Z" fill="#4a5e86" stroke={OL} strokeWidth={5} />
      {[-80, -40, 0, 40, 80].map((dx) => (
        <path key={dx} d={`M ${dx} -150 Q ${dx * 1.15} -70 ${dx * 1.2} 0`} stroke="#2f3d5a" strokeWidth={4} fill="none" />
      ))}
      <path d="M -40 -150 Q 0 -250 40 -150 Z" fill={C.gold} stroke={OL} strokeWidth={4} />
      <path d="M -80 -170 Q -60 -230 -20 -150 M 80 -170 Q 60 -230 20 -150" stroke={C.gold} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M -70 -110 Q -40 -130 -20 -120" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.5} fill="none" />
      <circle cx={0} cy={-60} r={150} fill={C.goldLight} opacity={0.12 + 0.06 * Math.sin(t * 2)} />
    </g>
  );
};

const BrokenCrown: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0.01) return null;
  return (
    <g opacity={clamp01(k * 1.5)}>
      <clipPath id="flx-crL">
        <path d={`M ${x - 100} ${y - 120} L ${x + 4} ${y - 120} L ${x - 10} ${y - 60} L ${x + 8} ${y - 20} L ${x - 6} ${y + 40} L ${x - 100} ${y + 40} Z`} />
      </clipPath>
      <clipPath id="flx-crR">
        <path d={`M ${x + 100} ${y - 120} L ${x + 4} ${y - 120} L ${x - 10} ${y - 60} L ${x + 8} ${y - 20} L ${x - 6} ${y + 40} L ${x + 100} ${y + 40} Z`} />
      </clipPath>
      <g transform={`rotate(${-14 * k} ${x - 40} ${y})`}>
        <g clipPath="url(#flx-crL)">
          <Crown x={x} y={y - 20} s={0.9} />
        </g>
      </g>
      <g transform={`translate(${16 * k} ${6 * k}) rotate(${18 * k} ${x + 40} ${y})`}>
        <g clipPath="url(#flx-crR)">
          <Crown x={x} y={y - 20} s={0.9} />
        </g>
      </g>
      <ellipse cx={x} cy={y + 18} rx={120} ry={12} fill="#000" opacity={0.12} />
    </g>
  );
};

export const Cyrus: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = (b: number) => at(c, b);
  const KX = 300;
  const KY = 810;
  const defeat = ramp(t, A(1.72), 1.0);
  const kirGone = ramp(t, A(1.78), 1.4);
  const mapDim = ramp(t, A(2.0)) * 1.2;
  const flags: [number, number][] = [[200, 330], [260, 260], [330, 380], [390, 300], [450, 220], [470, 350], [540, 280], [600, 360], [640, 240], [690, 320]];
  const letter = track(t, [[A(1.3), 1150, 560], [A(1.4), 1000, 290]]);
  const letterK = pop(t, A(1.3)) * (1 - ramp(t, A(1.72)));
  const sonK = pop(t, A(1.12)) * (1 - ramp(t, A(1.72)));
  const laugh = t > A(1.5) && t < A(1.72);
  const tight = ramp(t, A(2.55), 1.6);
  return (
    <g>
      <Stage id="flx-steppe" x={70} y={110} w={1260} h={720}>
        <rect x={70} y={110} width={1260} height={720} fill="#e7f2fb" />
        <Cloud x={drift(t, 0, 1400, 10, 500)} y={180} s={0.8} />
        <Cloud x={drift(t, 0, 1400, 7, 1100)} y={240} s={0.5} />
        <path d="M 70 520 Q 300 470 600 510 Q 900 540 1330 490 L 1330 830 L 70 830 Z" fill="#e9d9a8" />
        <path d="M 70 600 Q 500 570 1330 600 L 1330 830 L 70 830 Z" fill="#dcc890" />
        {/* река Аракс */}
        <path d={`M 940 500 Q 880 600 920 680 Q 960 760 880 840 L 980 840 Q 1050 760 1010 680 Q 970 600 1000 500 Z`} fill="#6cc5f0" stroke={C.skyDeep} strokeWidth={4} />
        {[0, 1, 2].map((i) => {
          const ph = (t * 0.25 + i / 3) % 1;
          return <path key={i} d="M -14 0 q 7 -6 14 0 t 14 0" transform={`translate(${lerp(968, 930, ph)} ${lerp(530, 820, ph)})`} stroke="#e6f7ff" strokeWidth={4} fill="none" />;
        })}
      </Stage>
      {/* карта империи */}
      <g opacity={1 - 0.65 * mapDim}>
        <rect x={110} y={140} width={660} height={300} rx={20} fill="#fbf0d4" stroke={OL} strokeWidth={4} transform={`rotate(-1 440 290)`} />
        <path d="M 150 340 Q 170 230 280 220 Q 360 170 470 200 Q 560 180 650 210 Q 740 250 720 330 Q 700 410 590 400 Q 480 420 380 400 Q 240 420 170 390 Z" fill={defeat > 0.5 ? "#d8d4c8" : "#e8c97a"} stroke={OL} strokeWidth={4} />
        {flags.map(([fx, fy], i) => (
          <Flag key={i} x={fx} y={fy} t={t} k={pop(t, A(0.18 + i * 0.035))} fall={ramp(t, A(1.74) + i * 0.08, 0.5)} />
        ))}
      </g>
      <Ribbon x={440} y={140} text="«царь мира»" size={38} color={C.purple} k={pop(t, A(0.55)) * (1 - ramp(t, A(1.72)))} />
      {/* лагерь массагетов */}
      <Tent x={1060} y={575} s={0.8} />
      <Tent x={1290} y={560} s={0.7} color="#d9c49a" />
      <Tent x={1150} y={545} s={0.6} color="#d9c49a" />
      <Label x={1040} y={470} text="массагеты" size={30} k={pop(t, A(0.72))} />
      <Label x={950} y={560} text="Аракс" size={30} k={pop(t, A(0.65))} />
      <Steed x={1190} y={810} s={0.8} t={t} color="#f2f2f2" flip />
      <Figure x={1200} y={710} s={0.78} t={t} role="queen" body="#2f8fd0" look={-0.8} mood={t > A(1.3) && t < A(1.8) ? "angry" : "proud"} arms={[t > A(1.28) && t < A(1.42) ? 110 : 30, 30]} flip />
      <path d="M 1134 662 L 1266 662 L 1258 734 Q 1200 746 1142 734 Z" fill={C.velvet} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 1142 722 Q 1200 734 1258 722" stroke={C.gold} strokeWidth={5} fill="none" />
      <Label x={1190} y={414} text="царица Томирис" size={30} k={pop(t, A(0.85))} />
      {/* Кир */}
      <g opacity={1 - kirGone}>
        <Figure x={KX} y={KY} s={0.95} t={t} role="king" look={0.7} mood={laugh ? "happy" : t > A(1.72) ? "shock" : "proud"} arms={laugh ? [40, 130] : [14, 60]} talk={laugh ? 0.9 : 0} />
      </g>
      <Label x={KX} y={KY - 340} text="Кир Великий" size={30} k={pop(t, A(0.4)) * (1 - kirGone)} />
      {laugh && (
        <Txt x={KX + 150} y={KY - 230 + wob(t, 1, 4)} size={40} weight={900} color={C.velvetDeep}>ха-ха!</Txt>
      )}
      {/* пленный сын */}
      {sonK > 0.01 && (
        <g opacity={clamp01(sonK * 1.5)}>
          <Figure x={560} y={KY} s={0.72} t={t} role="peasant" body="#5a9a8a" look={1} mood="worried" arms={[4, 4]} />
          {[0, 1].map((i) => (
            <ellipse key={i} cx={560} cy={KY - 105 + i * 18} rx={32} ry={8} fill="none" stroke="#a0743a" strokeWidth={6} />
          ))}
          <Label x={560} y={KY - 260} text="сын" size={30} />
        </g>
      )}
      {letterK > 0.01 && (
        <g opacity={clamp01(letterK * 1.5)}>
          <Scroll x={letter[0]} y={letter[1]} w={290} h={150} open={ramp(t, A(1.38), 0.6)} lines={["Верни сына", "и уходи"]} size={32} />
        </g>
      )}
      <BrokenCrown x={KX} y={760} k={pop(t, A(1.85)) * (1 - ramp(t, A(2.05)))} />
      {/* шлем */}
      {(() => {
        const k = pop(t, A(2.12));
        if (k <= 0.01) return null;
        return (
          <g opacity={clamp01(k * 1.5)} transform={`translate(400 ${560 + wob(t, 1, 4)}) scale(${k}) translate(-400 -560)`}>
            <Helmet x={400} y={560} s={0.92} tight={tight} t={t} />
          </g>
        );
      })()}
      <Ribbon x={640} y={790} text="одержав победу — затяни шлем" size={38} color={C.greenDeep} k={pop(t, A(2.6))} />
      <Tag x={1180} y={168} text="Закон 47" size={34} color={C.yellow} />
    </g>
  );
};

// ───────────── g37b · Козимо Медичи и сорняк зависти ─────────────

const Florence: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={70} y={110} width={1260} height={720} fill="#fff1dc" />
    <Cloud x={drift(t, 0, 1400, 9, 200)} y={180} s={0.7} />
    <path d="M 70 560 Q 300 470 560 530 Q 820 470 1100 520 Q 1250 490 1330 520 L 1330 830 L 70 830 Z" fill="#cfe0b0" />
    {Array.from({ length: 13 }).map((_, i) => {
      const h = 60 + ((i * 53) % 70);
      return (
        <g key={i}>
          <rect x={70 + i * 98} y={640 - h} width={92} height={h} fill={i % 3 ? "#f5dcb6" : "#efc9a0"} stroke={OL} strokeWidth={3} />
          <path d={`M ${66 + i * 98} ${640 - h} L ${116 + i * 98} ${612 - h} L ${166 + i * 98} ${640 - h} Z`} fill="#d9774f" stroke={OL} strokeWidth={3} />
        </g>
      );
    })}
    {/* купол собора и башня */}
    <rect x={930} y={470} width={180} height={100} fill="#f5e6cc" stroke={OL} strokeWidth={4} />
    <path d="M 940 470 Q 940 330 1020 320 Q 1100 330 1100 470 Z" fill="#d9774f" stroke={OL} strokeWidth={4} />
    {[970, 1020, 1070].map((dx) => (
      <path key={dx} d={`M ${dx} 470 Q ${dx + (1020 - dx) * 0.2} 380 1020 322`} stroke="#b85a36" strokeWidth={4} fill="none" />
    ))}
    <rect x={1008} y={292} width={24} height={30} fill="#f5e6cc" stroke={OL} strokeWidth={3} />
    <rect x={1180} y={340} width={56} height={230} fill="#f2dcc0" stroke={OL} strokeWidth={4} />
    <path d="M 1174 340 L 1208 300 L 1242 340 Z" fill="#d9774f" stroke={OL} strokeWidth={4} />
    <rect x={70} y={700} width={1260} height={130} fill="#d8c8a8" />
  </g>
);

const PalaceModel: React.FC<{ x: number; y: number; lux?: boolean; t: number }> = ({ x, y, lux, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-130} y={0} width={260} height={30} rx={6} fill="#fff" stroke={OL} strokeWidth={4} />
    <rect x={-110} y={30} width={220} height={80} fill="#efe6d6" stroke={OL} strokeWidth={4} />
    {lux ? (
      <g>
        <rect x={-110} y={-120} width={220} height={120} fill="#fff6e0" stroke={OL} strokeWidth={4} />
        {[-80, -40, 0, 40, 80].map((cx) => (
          <rect key={cx} x={cx - 8} y={-110} width={16} height={100} fill={C.goldLight} stroke={OL} strokeWidth={2} />
        ))}
        <path d="M -60 -120 Q -60 -210 0 -220 Q 60 -210 60 -120 Z" fill={C.gold} stroke={OL} strokeWidth={4} />
        {[-100, 100].map((cx) => (
          <g key={cx}>
            <rect x={cx - 18} y={-190} width={36} height={70} fill="#fff6e0" stroke={OL} strokeWidth={4} />
            <path d={`M ${cx - 24} -190 L ${cx} -236 L ${cx + 24} -190 Z`} fill={C.gold} stroke={OL} strokeWidth={4} />
          </g>
        ))}
        {[0, 1, 2, 3].map((i) => {
          const ph = (t * 0.6 + i / 4) % 1;
          return <path key={i} d="M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z" transform={`translate(${-90 + i * 60} ${-150 - ph * 60}) scale(${1.5 * (1 - ph)})`} fill={C.yellow} />;
        })}
      </g>
    ) : (
      <g>
        <rect x={-100} y={-110} width={200} height={110} fill="#e6d2b0" stroke={OL} strokeWidth={4} />
        <rect x={-100} y={-120} width={200} height={14} fill="#c9ad80" stroke={OL} strokeWidth={3} />
        {[-60, -20, 20, 60].map((cx) =>
          [0, 1].map((r) => <path key={`${cx}${r}`} d={`M ${cx - 10} ${-30 - r * 46} l 0 -20 q 10 -14 20 0 l 0 20 Z`} fill="#6c5c88" opacity={0.75} />),
        )}
      </g>
    )}
  </g>
);

const Weed: React.FC<{ x: number; y: number; g: number; t: number; wilt: number }> = ({ x, y, g, t, wilt }) => {
  if (g <= 0.01) return null;
  const sway = Math.sin(t * 1.5) * 4 + wilt * 20;
  return (
    <g transform={`translate(${x} ${y}) scale(${g})`}>
      {[-1, 0, 1].map((d) => (
        <g key={d} transform={`rotate(${d * 28 + sway * (d === 0 ? 0.5 : 1)})`}>
          <path d="M 0 0 Q -10 -90 0 -180" stroke={wilt > 0.5 ? "#7a8a5a" : "#2f6b3a"} strokeWidth={10} fill="none" strokeLinecap="round" />
          {[50, 90, 130].map((ly, i) => (
            <g key={i}>
              <path d={`M ${-4} ${-ly} L ${-46} ${-ly - 26} L ${-28} ${-ly - 4} L ${-50} ${-ly + 6} Z`} fill={wilt > 0.5 ? "#9aa878" : "#3f8a4a"} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
              <path d={`M ${4} ${-ly - 10} L ${46} ${-ly - 36} L ${28} ${-ly - 14} L ${50} ${-ly - 4} Z`} fill={wilt > 0.5 ? "#9aa878" : "#3f8a4a"} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
            </g>
          ))}
          <path d="M 0 -180 L -10 -200 M 0 -180 L 10 -202 M 0 -180 L 0 -206" stroke="#2f6b3a" strokeWidth={4} />
        </g>
      ))}
    </g>
  );
};

const Can: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M -60 -50 L 60 -50 L 50 50 L -50 50 Z" fill="#6cc5f0" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -60 -20 L -150 -80 L -160 -66 L -60 10" fill="#6cc5f0" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-176} y={-100} width={30} height={40} rx={8} fill="#2f8fd0" stroke={OL} strokeWidth={4} transform="rotate(-30 -160 -80)" />
    <path d="M 30 -50 Q 80 -110 60 -10" stroke={OL} strokeWidth={10} fill="none" />
  </g>
);

export const EnvyWeed: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = (b: number) => at(c, b);
  const modelsK = 1 - ramp(t, A(1.0), 0.8);
  const gardenK = ramp(t, A(1.02), 0.8);
  const weedG = ramp(t, A(1.08), 2.2);
  const water = win(t, A(1.3), A(1.52), 0.4);
  const canPos = track(t, [[A(1.22), 1350, 300], [A(1.3), 1060, 420], [A(1.52), 1060, 420], [A(1.62), 1250, 300]]);
  const canK = win(t, A(1.2), A(1.7), 0.4);
  const wilt = ramp(t, A(1.7), 1.6);
  const rider: FigProps = { x: 300, y: 690, s: 0.9, t, role: "merchant", body: "#7a6a55", look: 0.7, mood: "happy", arms: [14, 40] };
  return (
    <g>
      <Stage id="flx-flor" x={70} y={110} w={1260} h={720}>
        <Florence t={t} />
      </Stage>
      <Steed x={290} y={815} s={0.95} t={t} color="#9a8a7a" mule walk={0} />
      <Figure {...rider} />
      <path d="M 226 640 L 374 640 L 366 724 Q 300 738 234 724 Z" fill="#b0563a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 234 712 Q 300 726 366 712" stroke={C.goldLight} strokeWidth={5} fill="none" />
      <Label x={300} y={390} text="Козимо Медичи" size={30} k={pop(t, A(0.12))} />
      <Label x={300} y={322} text="≈30 лет у власти" size={30} bg={C.goldLight} k={pop(t, A(0.3)) * (1 - ramp(t, A(1.0)))} />
      <Label x={470} y={530} text="мул" size={30} k={win(t, A(0.52), A(1.0))} />
      {/* два проекта дворца */}
      {modelsK > 0.01 && (
        <g opacity={modelsK}>
          {(() => {
            const k1 = pop(t, A(0.62));
            const k2 = pop(t, A(0.7));
            return (
              <g>
                {k1 > 0.01 && (
                  <g transform={`translate(720 ${560 + wob(t, 1, 3)}) scale(${k1}) translate(-720 -560)`}>
                    <PalaceModel x={720} y={560} lux t={t} />
                    <Label x={720} y={720} text="роскошный" size={30} />
                    <Cross x={720} y={460} s={240} k={ramp(t, A(0.82), 0.6)} />
                  </g>
                )}
                {k2 > 0.01 && (
                  <g transform={`translate(1110 ${560 + wob(t, 2, 3)}) scale(${k2}) translate(-1110 -560)`}>
                    {t > A(0.86) && <ellipse cx={1110} cy={500} rx={170} ry={130} fill={C.goldLight} opacity={0.6 * ramp(t, A(0.86))} />}
                    <PalaceModel x={1110} y={560} t={t} />
                    <Label x={1110} y={720} text="простой" size={30} />
                    <circle cx={1210} cy={380} r={44} fill="#fff" stroke={C.green} strokeWidth={5} opacity={ramp(t, A(0.86))} />
                    <Check x={1210} y={384} s={40} k={ramp(t, A(0.86), 0.5)} />
                  </g>
                )}
              </g>
            );
          })()}
        </g>
      )}
      {/* сад и сорняк */}
      {gardenK > 0.01 && (
        <g opacity={gardenK}>
          <path d="M 600 780 Q 900 740 1250 780 L 1260 820 L 590 820 Z" fill="#7a5530" stroke={OL} strokeWidth={4} />
          <Flower x={660} y={790} color={C.coral} s={0.9} t={t} />
          <Flower x={740} y={790} color={C.yellow} s={0.8} t={t} kind={1} />
          <Flower x={1100} y={790} color={C.violet} s={0.85} t={t} kind={2} />
          <Flower x={1190} y={790} color={C.sky} s={0.9} t={t} />
          <Weed x={920} y={790} g={weedG} t={t} wilt={wilt} />
          <Label x={920} y={548} text="зависть" size={34} color="#fff" bg="#2f6b3a" k={pop(t, A(1.18))} />
        </g>
      )}
      {canK > 0.01 && (
        <g opacity={canK}>
          <Can x={canPos[0]} y={canPos[1]} rot={water > 0.2 ? -28 : -8} />
          {water > 0.01 &&
            Array.from({ length: 8 }).map((_, i) => {
              const ph = (t * 1.8 + i / 8) % 1;
              return <path key={i} d="M 0 -8 Q 6 0 0 5 Q -6 0 0 -8 Z" transform={`translate(${canPos[0] - 150 - ph * 30 + (i % 3) * 8} ${canPos[1] - 20 + ph * 200}) scale(1.4)`} fill="#9ad8ff" stroke={C.skyDeep} strokeWidth={1.5} opacity={water * (1 - ph)} />;
            })}
          <Cross x={canPos[0]} y={canPos[1]} s={170} k={ramp(t, A(1.55), 0.5)} />
        </g>
      )}
      <Ribbon x={830} y={220} text="зависть не поливать" size={44} color={C.greenDeep} k={pop(t, A(1.58))} />
      <Label x={830} y={330} text="скромность — не слабость" size={32} k={pop(t, A(1.75))} />
      <Tag x={230} y={168} text="Закон 46" size={34} color={C.yellow} />
      <Label x={450} y={168} text="Флоренция" size={30} serif k={pop(t, A(0.06))} />
    </g>
  );
};

// ───────────── g38 · Спарта и вода ─────────────

const Aspis: React.FC<{ x: number; y: number; r: number; crack: number; t: number }> = ({ x, y, r, crack, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 14} fill="#b8762a" stroke={OL} strokeWidth={5} />
    <circle r={r} fill="#d99a3a" stroke={OL} strokeWidth={4} />
    <circle r={r * 0.82} fill="none" stroke="#b8762a" strokeWidth={6} />
    <path d={`M ${-r * 0.42} ${r * 0.42} L 0 ${-r * 0.5} L ${r * 0.42} ${r * 0.42}`} stroke={C.velvetDeep} strokeWidth={r * 0.16} fill="none" strokeLinejoin="round" />
    <path d={`M ${-r * 0.6} ${-r * 0.55} Q ${-r * 0.3} ${-r * 0.8} 0 ${-r * 0.82}`} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.3 + 0.1 * Math.sin(t * 2)} fill="none" />
    {crack > 0 && (
      <path d={`M ${r * 0.7} ${-r * 0.7} L ${r * 0.35} ${-r * 0.3} L ${r * 0.5} ${-r * 0.1} L ${r * 0.05} ${r * 0.25} L ${r * 0.2} ${r * 0.45} L ${-r * 0.2} ${r * 0.9}`} stroke="#2a1a0a" strokeWidth={9} fill="none" strokeLinejoin="round" strokeDasharray={r * 2.6} strokeDashoffset={r * 2.6 * (1 - clamp01(crack))} />
    )}
  </g>
);

const Badge: React.FC<{ x: number; y: number; k: number; cross: number; children: React.ReactNode; label: string }> = ({ x, y, k, cross, children, label }) => {
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp01(k * 1.5)}>
      <circle r={70} fill="#fff" stroke={OL} strokeWidth={4} />
      <g opacity={1 - 0.4 * cross}>{children}</g>
      <Cross x={0} y={0} s={110} k={cross} />
      <Txt x={0} y={118} size={30} weight={800} color={C.inkSoft}>
        {label}
      </Txt>
    </g>
  );
};

const Lyre: React.FC = () => (
  <g fill="none" stroke={OL} strokeWidth={6} strokeLinecap="round">
    <path d="M -30 34 Q -46 -10 -24 -44 M 30 34 Q 46 -10 24 -44" />
    <path d="M -36 -30 L 36 -30 M -30 34 L 30 34" />
    <path d="M -12 -30 L -12 34 M 0 -30 L 0 34 M 12 -30 L 12 34" strokeWidth={3} />
  </g>
);

const Scales: React.FC = () => (
  <g stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round">
    <path d="M 0 -40 L 0 34 M -20 34 L 20 34 M -40 -26 L 40 -26" />
    <path d="M -40 -26 L -52 6 L -28 6 Z M 40 -26 L 28 6 L 52 6 Z" fill={C.goldLight} />
  </g>
);

const Vessel: React.FC<{ x: number; y: number; shape: 0 | 1 | 2; fill: number; t: number; heart: number }> = ({ x, y, shape, fill, t, heart }) => {
  const paths = [
    "M -30 -160 L 30 -160 L 26 -130 Q 70 -90 64 -40 Q 58 0 0 0 Q -58 0 -64 -40 Q -70 -90 -26 -130 Z",
    "M -90 -90 L 90 -90 Q 86 0 0 0 Q -86 0 -90 -90 Z",
    "M -56 -150 L 56 -150 L 56 0 L -56 0 Z",
  ];
  const top = [-160, -90, -150][shape];
  const id = `flx-ves${shape}`;
  const level = top * clamp01(fill) * 0.92;
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={id}>
        <path d={paths[shape]} />
      </clipPath>
      <path d={paths[shape]} fill="#f4fbff" />
      <g clipPath={`url(#${id})`}>
        <path d={`M -120 ${level + Math.sin(t * 3 + x) * 4} Q -60 ${level - 8} 0 ${level + Math.sin(t * 3 + x + 1) * 4} T 120 ${level} L 120 10 L -120 10 Z`} fill="#6cc5f0" opacity={0.9} />
      </g>
      <path d={paths[shape]} fill="none" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      {heart > 0.01 && (
        <g transform={`translate(0 ${top * 0.4}) scale(${heart * (1.4 + 0.08 * Math.sin(t * 3))})`}>
          <Heart x={0} y={8} s={1} color={C.gold} />
        </g>
      )}
    </g>
  );
};

export const Water: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = (b: number) => at(c, b);
  const sparta = 1 - ramp(t, A(2.0), 0.8);
  const waterK = ramp(t, A(2.05), 0.8);
  const crack = ramp(t, A(1.5), 1.6);
  const coins = win(t, A(1.3), A(1.75), 0.5);
  const SX = 860;
  const SY = 430;
  return (
    <g>
      <Stage id="flx-sparta" x={590} y={110} w={1260} h={720}>
        <rect x={590} y={110} width={1260} height={720} fill={waterK > 0.5 ? "#e4f4ff" : "#fdf0dc"} />
        <g opacity={sparta}>
          <path d="M 590 600 L 760 470 L 900 560 L 1120 430 L 1320 560 L 1520 450 L 1850 580 L 1850 830 L 590 830 Z" fill="#e3c99a" />
          <g transform="translate(1200 560)">
            <rect x={-110} y={-20} width={220} height={20} fill="#efe6d6" stroke={OL} strokeWidth={3} />
            {[-90, -50, -10, 30, 70].map((dx) => (
              <rect key={dx} x={dx} y={-100} width={18} height={80} fill="#efe6d6" stroke={OL} strokeWidth={3} />
            ))}
            <path d="M -120 -100 L 0 -140 L 120 -100 Z" fill="#efe6d6" stroke={OL} strokeWidth={3} />
          </g>
          <rect x={590} y={700} width={1260} height={130} fill="#d4b47e" />
        </g>
        <g opacity={waterK}>
          <path d={`M 590 640 Q 900 610 1220 640 T 1850 640 L 1850 830 L 590 830 Z`} fill="#cfe9f7" />
          <Cloud x={drift(t, 560, 1900, 10, 300)} y={200} s={0.7} />
        </g>
        <Cloud x={drift(t, 560, 1900, 13, 900)} y={170} s={0.6} o={0.8 * sparta} />
      </Stage>
      {/* Спарта: щит-панцирь, строй, запреты */}
      {sparta > 0.01 && (
        <g opacity={sparta}>
          {(() => {
            const k = pop(t, A(0.15));
            return k > 0.01 ? (
              <g transform={`translate(${SX} ${SY + wob(t, 1, 3)}) scale(${k}) translate(${-SX} ${-SY})`}>
                <Aspis x={SX} y={SY} r={170} crack={crack} t={t} />
              </g>
            ) : null;
          })()}
          {[1170, 1290, 1410, 1530, 1650, 1770].map((hx, i) => {
            const k = pop(t, A(0.6 + i * 0.03));
            return k > 0.01 ? (
              <g key={i} opacity={clamp01(k * 1.5) * (1 - 0.5 * ramp(t, A(1.7)))}>
                <Figure x={hx} y={800} s={0.62} t={t + i * 0.3} role="soldier" body={C.velvet} look={-0.5} mood={t > A(1.7) ? "worried" : "proud"} arms={[14, 150]} hold={<path d="M 0 40 L 0 -150" stroke="#6b4a1e" strokeWidth={8} strokeLinecap="round" />} />
                <circle cx={hx - 30} cy={800 - 0.62 * 110} r={38} fill="#d99a3a" stroke={OL} strokeWidth={4} />
                <path d={`M ${hx - 42} ${800 - 0.62 * 110 + 14} L ${hx - 30} ${800 - 0.62 * 110 - 16} L ${hx - 18} ${800 - 0.62 * 110 + 14}`} stroke={C.velvetDeep} strokeWidth={5} fill="none" />
              </g>
            ) : null;
          })}
          <g opacity={1 - ramp(t, A(1.05))}>
            <Badge x={1250} y={230} k={pop(t, A(0.42))} cross={ramp(t, A(0.48), 0.5)} label="деньги">
              <Coin x={0} y={0} r={38} rot={t} />
            </Badge>
            <Badge x={1460} y={230} k={pop(t, A(0.5))} cross={ramp(t, A(0.56), 0.5)} label="торговля">
              <Scales />
            </Badge>
            <Badge x={1670} y={230} k={pop(t, A(0.58))} cross={ramp(t, A(0.64), 0.5)} label="музыка">
              <Lyre />
            </Badge>
          </g>
          <Label x={1460} y={420} text="только армия" size={34} k={pop(t, A(0.8)) * (1 - ramp(t, A(1.05)))} />
          {/* победа над Афинами */}
          {(() => {
            const k = pop(t, A(1.06)) * (1 - ramp(t, A(1.4)));
            if (k <= 0.01) return null;
            return (
              <g transform={`translate(1460 250) scale(${k})`} opacity={clamp01(k * 1.5)}>
                {[-1, 1].map((d) => (
                  <g key={d}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <ellipse key={i} cx={d * (70 + Math.sin(i * 0.5) * 6)} cy={-50 + i * 24} rx={10} ry={22} fill={C.green} stroke={OL} strokeWidth={3} transform={`rotate(${d * (30 - i * 12)} ${d * 70} ${-50 + i * 24})`} />
                    ))}
                  </g>
                ))}
                <Txt x={0} y={14} size={34} weight={900} color={C.greenDeep}>победа</Txt>
                <Label x={0} y={120} text="над Афинами" size={30} />
              </g>
            );
          })()}
          {/* поток монет */}
          {coins > 0.01 &&
            Array.from({ length: 12 }).map((_, i) => {
              const ph = (t * 0.7 + i / 12) % 1;
              const x = lerp(1820, SX + 40, ph);
              const y = lerp(140 + (i % 3) * 40, SY - 30 + (i % 4) * 20, ph) - Math.sin(ph * Math.PI) * 80;
              return (
                <g key={i} opacity={coins}>
                  <Coin x={x} y={y} r={24} rot={Math.sin(t * 3 + i) * 0.9} />
                </g>
              );
            })}
          <Label x={1460} y={180} text="хлынули деньги" size={32} k={pop(t, A(1.3)) * (1 - ramp(t, A(1.78)))} />
          {(() => {
            const k = pop(t, A(1.62));
            if (k <= 0.01) return null;
            return (
              <g transform={`translate(1430 ${300 + wob(t, 2, 3)}) rotate(-4) scale(${k})`} opacity={clamp01(k * 1.5)}>
                <rect x={-150} y={-60} width={300} height={110} rx={14} fill={C.night} stroke={OL} strokeWidth={4} />
                <text x={0} y={-10} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={30} fill="#fff">поражение от</text>
                <text x={0} y={34} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.goldLight}>Фив</text>
              </g>
            );
          })()}
          <Label x={SX} y={SY + 250} text="жёсткий панцирь" size={30} k={pop(t, A(1.85)) * (1 - ramp(t, A(2.0)))} />
        </g>
      )}
      {/* вода: обтекает камень, принимает форму сосудов */}
      {waterK > 0.01 && (
        <g opacity={waterK}>
          {/* родник → камень → желоб → сосуды */}
          <path d="M 860 150 L 1000 150 L 1000 196 L 930 196 Z" fill="#9aa6b8" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
          {[
            "M 950 196 Q 960 290 1060 360",
            "M 1060 360 Q 1060 300 1160 290 Q 1290 300 1300 400 Q 1310 480 1420 520",
            "M 1060 360 Q 1080 470 1170 480 Q 1270 490 1320 500 Q 1370 512 1420 520",
            "M 1420 520 Q 1500 540 1560 560",
          ].map((d, i) => (
            <g key={i} opacity={i === 3 ? ramp(t, A(2.2)) : 1}>
              <path d={d} stroke="#6cc5f0" strokeWidth={i === 0 ? 34 : 26} fill="none" strokeLinecap="round" />
              <path d={d} stroke="#e6f7ff" strokeWidth={7} fill="none" strokeDasharray="14 22" strokeDashoffset={-t * 60} strokeLinecap="round" />
            </g>
          ))}
          <ellipse cx={1180} cy={400} rx={100} ry={66} fill="#9aa6b8" stroke={OL} strokeWidth={5} />
          <ellipse cx={1156} cy={376} rx={44} ry={16} fill="#c4ccd8" />
          {/* желоб над сосудами */}
          <g opacity={ramp(t, A(2.2))}>
            <path d="M 1240 580 L 1800 580 L 1790 606 L 1250 606 Z" fill="#c9a96a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
            <path d="M 1256 584 L 1786 584" stroke="#6cc5f0" strokeWidth={6} strokeLinecap="round" />
            {[1300, 1520, 1740].map((vx, j) =>
              [0, 1, 2, 3].map((i) => {
                const ph = (t * 1.5 + i / 4 + j * 0.3) % 1;
                return <ellipse key={`${j}${i}`} cx={vx + Math.sin(i * 2) * 3} cy={612 + ph * 50} rx={6} ry={10} fill="#6cc5f0" opacity={(1 - ph) * ramp(t, A(2.25 + j * 0.07))} />;
              }),
            )}
          </g>
          <Vessel x={1300} y={800} shape={0} fill={ramp(t, A(2.25), 1.6)} t={t} heart={pop(t, A(2.62))} />
          <Vessel x={1520} y={800} shape={1} fill={ramp(t, A(2.32), 1.6)} t={t} heart={pop(t, A(2.66))} />
          <Vessel x={1740} y={800} shape={2} fill={ramp(t, A(2.4), 1.6)} t={t} heart={pop(t, A(2.7))} />
          <Label x={900} y={520} text="как вода" size={36} k={pop(t, A(2.12))} />
          <Ribbon x={1430} y={236} text="меняется форма — не ценности" size={36} color={C.skyDeep} k={pop(t, A(2.72))} />
        </g>
      )}
      <Tag x={720} y={168} text="Закон 48" size={34} color={C.yellow} />
      <Label x={900} y={168} text="Спарта" size={30} serif k={pop(t, A(0.08)) * sparta} />
    </g>
  );
};

// реестр схем части «flex»
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FLEX_VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  capone: Capone,
  eiffel: Eiffel32,
  alchemist: Alchemist,
  moneyBox: MoneyBox34,
  sevenCaptures: SevenCaptures,
  cyrus: Cyrus,
  envyWeed: EnvyWeed,
  water: Water,
};
