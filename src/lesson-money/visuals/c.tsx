// Схемы группы c (сцены s27–s38): свобода, время, запас, скромность, запас прочности.
// Всё зависит только от времени сцены (c.t) и начала реплик (at).
import React from "react";
import { Banana, MOODS, POSES, type MoodName, type PoseName } from "../../banana-host";
import { C, FONT } from "../theme";
import { Book, Bubble, Heart, OL, Sprout, Worker } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps, type VisualCtx } from "./kit";
import { Bill, Car, Coin, CoinStack, Cottage, Jar, Key, Mansion, Scales, Watch } from "./props";

// окно видимости: появляется в a, исчезает в b
const win = (t: number, a: number, b: number, d = 0.5) => ramp(t, a, d) * (1 - ramp(t, b, d));
// конец фазы — чуть раньше начала следующей реплики
const cut = (c: VisualCtx, n: number) => at(c, n) - 0.35;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const MiniBanana: React.FC<{ x: number; y: number; s: number; t: number; sleep?: number; pose?: PoseName; mood?: MoodName; rot?: number }> = ({ x, y, s, t, sleep = 0, pose = "idle", mood = "calm", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Banana pose={POSES[pose]} face={MOODS[mood]} mouthOpen={0} mouthRound={0} blink={sleep} t={t} talk={0} />
  </g>
);

// ───────────────────────── s27 · руль-часы ─────────────────────────
const SteerClock: React.FC<{ x: number; y: number; r: number; rot: number; t: number; glow?: number }> = ({ x, y, r, rot, t, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {glow > 0.01 && <circle r={r + 70} fill={C.yellow} opacity={0.28 * glow} />}
    <circle r={r - 16} fill={C.cream} stroke={OL} strokeWidth={4} />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={-5} y={-(r - 34)} width={10} height={i % 3 === 0 ? 30 : 18} rx={4} fill={i % 3 === 0 ? C.navy : C.inkSoft} transform={`rotate(${i * 30})`} />
    ))}
    {[0, 120, 240].map((a) => (
      <rect key={a} x={-15} y={0} width={30} height={r - 18} rx={12} fill={C.navy} stroke={OL} strokeWidth={3} transform={`rotate(${a})`} />
    ))}
    <rect x={-7} y={-r * 0.46} width={14} height={r * 0.5} rx={7} fill={OL} transform={`rotate(${-62 + Math.sin(t * 0.5) * 8})`} />
    <rect x={-5} y={-r * 0.72} width={10} height={r * 0.76} rx={5} fill={C.coral} transform={`rotate(${38 + Math.sin(t * 0.37) * 10})`} />
    <circle r={r * 0.2} fill={C.gold} stroke={OL} strokeWidth={5} />
    <circle r={r * 0.08} fill="#fff" opacity={0.7} />
    <circle r={r} fill="none" stroke={C.navy} strokeWidth={40} />
    <circle r={r} fill="none" stroke="#fff" strokeWidth={6} opacity={0.3} strokeDasharray="40 60" />
    <circle r={r + 20} fill="none" stroke={OL} strokeWidth={4} />
    <circle r={r - 20} fill="none" stroke={OL} strokeWidth={4} />
  </g>
);

const Canister: React.FC<{ x: number; y: number; level: number }> = ({ x, y, level }) => {
  const lv = clamp01(level);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id="timeWheel-can">
          <rect x={-70} y={-90} width={140} height={180} rx={22} />
        </clipPath>
      </defs>
      <rect x={-70} y={-90} width={140} height={180} rx={22} fill="#fff" />
      <g clipPath="url(#timeWheel-can)">
        <rect x={-70} y={90 - 180 * lv} width={140} height={180 * lv} fill={C.gold} />
        <rect x={-70} y={90 - 180 * lv} width={140} height={8} fill="#fff" opacity={0.5} />
      </g>
      <rect x={-70} y={-90} width={140} height={180} rx={22} fill="none" stroke={OL} strokeWidth={5} />
      <rect x={-26} y={-116} width={52} height={28} rx={8} fill={C.red} stroke={OL} strokeWidth={4} />
      <path d="M -40 -40 L 40 40 M 40 -40 L -40 40" stroke={OL} strokeWidth={3} opacity={0.15} />
    </g>
  );
};

export const TimeWheel: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const title = pop(t, 0.3);
  const fill = ramp(t, at(c, 0.3), 9);
  const ph1 = win(t, at(c, 1), cut(c, 2));
  const ph2 = win(t, at(c, 2), cut(c, 3));
  const ph3 = ramp(t, at(c, 3), 0.5);
  const wheelX = 960;
  const wheelY = 470;
  const rot = Math.sin(t * 0.8) * 14 + Math.sin(t * 0.33) * 6;
  const leave = ramp(t, at(c, 3.78), 1.6);
  return (
    <g>
      <g transform={`translate(1230 160) scale(${title})`} opacity={clamp01(title * 1.5)}>
        <Tag x={0} y={0} text="Глава 7 · Свобода" size={50} color={C.yellow} />
      </g>
      {/* топливо-деньги по трубке к рулю */}
      <path d={`M 720 610 Q 720 ${wheelY + 260} ${wheelX - 120} ${wheelY + 200}`} fill="none" stroke={C.gold} strokeWidth={16} strokeLinecap="round" opacity={0.8} strokeDasharray="20 18" strokeDashoffset={-t * 60} />
      <Canister x={720} y={700} level={0.15 + fill * 0.75} />
      <Txt x={720} y={830} size={36} color={C.moneyDeep}>
        деньги
      </Txt>
      {[0, 1, 2].map((i) => {
        const ph = (((t - 0.6) * 0.7 + i / 3) % 1 + 1) % 1;
        const o = t > at(c, 0.3) ? Math.sin(ph * Math.PI) : 0;
        return (
          <g key={i} opacity={o}>
            <Coin x={720 + Math.sin(ph * 6 + i) * 10} y={400 + ph * 180} s={0.55} spin={Math.cos(t * 4 + i * 2)} />
          </g>
        );
      })}
      <SteerClock x={wheelX} y={wheelY} r={175} rot={rot} t={t} glow={ph2 + ramp(t, at(c, 1), 0.6) * 0.5} />
      {/* что / когда / с кем */}
      {ph1 > 0 && (
        <g opacity={ph1}>
          {[
            ["что хочу", C.yellow, 320],
            ["когда хочу", C.sky, 450],
            ["с кем хочу", C.pink, 580],
          ].map(([txt, col, y], i) => (
            <g key={i}>
              <Pop t={t} at={at(c, 1.12 + i * 0.12)} x={1530 + wob(t, i, 6)} y={y as number}>
                <Tag x={0} y={0} text={txt as string} size={46} color={col as string} />
              </Pop>
              <Arrow x1={1160} y1={470} x2={1330} y2={(y as number) - 14} k={ramp(t, at(c, 1.08 + i * 0.12), 0.5)} color={C.inkSoft} w={6} bend={0.1} />
            </g>
          ))}
        </g>
      )}
      {/* контроль над жизнью ярче вещей */}
      {ph2 > 0 && (
        <g opacity={ph2}>
          <Pop t={t} at={at(c, 2.2)} x={1530} y={330}>
            <g>
              <circle r={210} fill={C.yellow} opacity={0.25 + 0.08 * Math.sin(t * 3)} />
              <Bubble x={0} y={0} w={520} h={190} fill="#fff8d8" />
              <Txt x={0} y={-10} size={50} color={C.ink}>
                {"контроль\nнад жизнью"}
              </Txt>
              <Heart x={250} y={-90} s={1.5 + 0.1 * Math.sin(t * 4)} />
            </g>
          </Pop>
          <Pop t={t} at={at(c, 2.45)} x={1530} y={640}>
            <g opacity={0.55}>
              <Bubble x={0} y={0} w={400} h={150} fill="#eceff4" />
              <Car x={-120} y={20} s={0.28} color={C.grey} />
              <Bill x={0} y={-6} s={0.55} rot={-10} color="#cfd6df" />
              <Txt x={120} y={14} size={36} color={C.inkSoft}>
                вещи
              </Txt>
            </g>
          </Pop>
          <Tag x={1530} y={490} text="сильнее" size={36} color={C.green} textColor="#fff" />
        </g>
      )}
      {/* клетка инвестбанка: план 4 месяца — выдержал один */}
      {ph3 > 0 && (
        <g opacity={ph3}>
          <Pop t={t} at={at(c, 3.1)} x={1530} y={250}>
            <Tag x={0} y={0} text="практика: 4 месяца" size={40} color="#fff" />
          </Pop>
          <g transform="translate(1530 540)">
            <rect x={-200} y={-200} width={400} height={360} rx={18} fill="#e9eef5" stroke={OL} strokeWidth={5} />
            <rect x={-200} y={-200} width={400} height={50} rx={18} fill={C.navy} />
            <text y={-163} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">
              офис
            </text>
            <Worker x={lerp(-40, 360, leave)} y={130 - Math.abs(Math.sin(leave * Math.PI * 3)) * 20 * (leave > 0 && leave < 1 ? 1 : 0)} s={1.05} role="clerk" t={t} mood={leave > 0.1 ? "smile" : "sad"} arms={leave > 0.1 ? 1 : 0} />
            {/* решётка; правая часть — «дверь» уезжает вверх */}
            {[-150, -90, -30].map((bx) => (
              <rect key={bx} x={bx - 7} y={-150} width={14} height={310} rx={6} fill={C.inkSoft} stroke={OL} strokeWidth={3} />
            ))}
            <g transform={`translate(0 ${-ramp(t, at(c, 3.7), 0.8) * 330})`}>
              {[30, 90, 150].map((bx) => (
                <rect key={bx} x={bx - 7} y={-150} width={14} height={310} rx={6} fill={C.inkSoft} stroke={OL} strokeWidth={3} />
              ))}
            </g>
          </g>
          <Pop t={t} at={at(c, 3.62)} x={1530} y={790}>
            <Tag x={0} y={0} text="выдержал 1 месяц" size={40} color={C.coral} textColor="#fff" />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ───────────────────────── s28 · лестница свободы ─────────────────────────
const STEPS = ["переждать\nболезнь", "не хвататься\nза первую\nработу", "полгода —\nне бояться\nначальника", "работа\nближе к дому"];
const STEP_COL = [C.teal, C.skyDeep, C.violet, C.greenDeep];

export const FreedomStairs: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const W = 285;
  const x0 = (i: number) => 130 + i * W;
  const top = (i: number) => 720 - i * 125;
  const showAt = [at(c, 1.03), at(c, 1.5), at(c, 2.03), at(c, 2.5)];
  const shown = showAt.map((a) => ramp(t, a, 0.6));
  const climbed = showAt.reduce((s, a, i) => s + (i === 0 ? 0 : ramp(t, a + 0.5, 1.0)), 0);
  const kc = climbed - Math.floor(climbed);
  const wx = x0(0) + 140 + climbed * W;
  const wy = top(0) - climbed * 125 - Math.sin(kc * Math.PI) * 50;
  const fin = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      <Pop t={t} at={0.3} x={420} y={190}>
        <Tag x={0} y={0} text="Лестница свободы" size={52} color={C.yellow} />
      </Pop>
      <rect x={90} y={845} width={1200} height={14} rx={7} fill={OL} opacity={0.2} />
      {STEPS.map((lab, i) => {
        const k = shown[i];
        if (k <= 0.001 && i > 0) return null;
        const kk = i === 0 ? Math.max(k, ramp(t, 0.5, 0.6) * 0.999) : k;
        const h = (850 - top(i)) * kk;
        const open = ramp(t, showAt[i] + 0.6, 0.8);
        const glow = fin * (0.6 + 0.4 * Math.sin(t * 3 + i));
        return (
          <g key={i}>
            <rect x={x0(i)} y={850 - h} width={W} height={h} rx={10} fill={STEP_COL[i]} stroke={OL} strokeWidth={5} />
            <rect x={x0(i)} y={850 - h} width={W} height={18} rx={8} fill="#fff" opacity={0.3} />
            {k > 0.6 && (
              <g opacity={(k - 0.6) * 2.5}>
                <Txt x={x0(i) + W / 2} y={top(i) + 54} size={34} color="#fff">
                  {lab}
                </Txt>
                <CoinStack x={x0(i) + 58} y={top(i) - 8} n={2 + i * 2} s={0.55} />
                {/* дверь-выбор */}
                <g transform={`translate(${x0(i) + W - 90} ${top(i)})`}>
                  {glow > 0 && <ellipse cx={40} cy={-75} rx={80} ry={100} fill={C.yellow} opacity={0.35 * glow} />}
                  <rect x={0} y={-150} width={80} height={150} rx={8} fill="#fff1a8" stroke={OL} strokeWidth={4} />
                  <path d="M 10 -40 L 40 -130 L 70 -40 Z" fill={C.yellow} opacity={0.8 * open} />
                  <g transform={`scale(${1 - open * 0.8} 1)`}>
                    <rect x={0} y={-150} width={80} height={150} rx={8} fill={C.wood} stroke={OL} strokeWidth={4} />
                    <circle cx={64} cy={-72} r={6} fill={C.gold} />
                  </g>
                </g>
              </g>
            )}
          </g>
        );
      })}
      <Worker x={wx} y={wy - 8} s={0.95} role="plain" color={C.orange} t={t} arms={fin} />
      <Pop t={t} at={at(c, 3.1)} x={560} y={300}>
        <Tag x={0} y={0} text="не вещь, а новый выбор" size={44} color="#fff" />
      </Pop>
    </g>
  );
};

// ───────────────────────── s29 · банка Сайверса ─────────────────────────
const Guitar: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-9} y={-190} width={18} height={150} rx={4} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
    <rect x={-16} y={-215} width={32} height={34} rx={6} fill="#5d3a1a" stroke={OL} strokeWidth={3} />
    <circle cx={0} cy={-20} r={46} fill={C.orange} stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={42} r={60} fill={C.orange} stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={10} r={16} fill={OL} />
    <rect x={-22} y={62} width={44} height={10} rx={3} fill="#5d3a1a" />
    <path d="M -3 -190 L -3 66 M 3 -190 L 3 66" stroke="#fff" strokeWidth={1.5} opacity={0.8} />
  </g>
);

const Note: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.violet }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={16} ry={12} fill={color} transform="rotate(-20)" />
    <path d="M 14 -4 L 14 -60 Q 34 -50 38 -30" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

const Smiley: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => (
  <g transform={`translate(${x} ${y + wob(t, 2, 4)})`}>
    <circle r={r} fill={C.yellow} stroke={OL} strokeWidth={6} />
    <circle cx={-r * 0.33} cy={-r * 0.2} r={r * 0.1} fill={OL} />
    <circle cx={r * 0.33} cy={-r * 0.2} r={r * 0.1} fill={OL} />
    <path d={`M ${-r * 0.4} ${r * 0.32} Q 0 ${r * 0.45} ${r * 0.4} ${r * 0.32}`} stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);

export const SiversJar: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = 1 - ramp(t, cut(c, 2), 0.6);
  const B = ramp(t, at(c, 2), 0.6);
  const bars = ramp(t, at(c, 0.25), 0.8);
  const exp = ramp(t, at(c, 0.45), 0.8);
  const drip = t > at(c, 0.6) && t < at(c, 1.3);
  const lvl = ramp(t, at(c, 0.6), at(c, 1.25) - at(c, 0.6));
  const free = ramp(t, at(c, 1.35), 1.2);
  const grow = ramp(t, at(c, 2.15), 6);
  const BW = 400;
  return (
    <g>
      {A > 0 && (
        <g opacity={A}>
          <Panel x={660} y={120} w={700} h={300} />
          <Txt x={690} y={215} size={38} anchor="start">
            доход
          </Txt>
          <rect x={900} y={170} width={BW * bars} height={66} rx={14} fill={C.money} stroke={OL} strokeWidth={4} />
          {bars > 0.8 && (
            <Txt x={1100} y={216} size={36} color="#fff">
              1800 $
            </Txt>
          )}
          <Txt x={690} y={330} size={38} anchor="start" opacity={exp}>
            расходы
          </Txt>
          <rect x={900} y={285} width={BW * (1000 / 1800) * exp} height={66} rx={14} fill={C.coral} stroke={OL} strokeWidth={4} />
          {exp > 0.8 && (
            <Txt x={1011} y={331} size={36} color="#fff">
              1000 $
            </Txt>
          )}
          {exp > 0.9 && (
            <g>
              <rect x={1130} y={285} width={168} height={66} rx={14} fill="#fff6d0" stroke={C.yellowDeep} strokeWidth={5} strokeDasharray="12 9" />
              <Txt x={1214} y={330} size={34} color="#9a6c12">
                разница
              </Txt>
            </g>
          )}
          {drip &&
            [0, 1, 2].map((i) => {
              const ph = ((t * 0.9 + i / 3) % 1 + 1) % 1;
              return <Coin key={i} x={1214} y={390 + ph * 140} s={0.45} spin={Math.cos(t * 5 + i)} />;
            })}
          <Jar x={1214} y={640} s={1.05} level={0.05 + lvl * 0.9} t={t} />
          {lvl > 0.95 && (
            <Pop t={t} at={at(c, 1.25)} x={1214} y={810}>
              <Tag x={0} y={0} text="12 000 $" size={42} color={C.gold} />
            </Pop>
          )}
          <Pop t={t} at={at(c, 0.1)} x={1620} y={210}>
            <Tag x={0} y={0} text="Дерек Сайверс" size={38} color="#fff" />
          </Pop>
          <Pop t={t} at={at(c, 1.05)} x={1620} y={300}>
            <Tag x={0} y={0} text="2 года" size={40} color={C.sky} />
          </Pop>
          <Worker x={1620} y={760} s={1.35} role="plain" color={C.teal} t={t} arms={free} />
          {free > 0 && (
            <g>
              <Guitar x={lerp(1214, 1690, free)} y={lerp(520, 640, free) - Math.sin(free * Math.PI) * 220} s={0.75} rot={lerp(0, 25, free) + (1 - free) * 360} />
              {[0, 1, 2, 3].map((i) => {
                const ph = ((t * 0.45 + i / 4) % 1 + 1) % 1;
                return (
                  <g key={i} opacity={free * Math.sin(ph * Math.PI)}>
                    <Note x={1500 + i * 70 + Math.sin(t * 2 + i) * 20} y={600 - ph * 220} s={1.1} color={[C.violet, C.coral, C.skyDeep, C.greenDeep][i]} />
                  </g>
                );
              })}
              <Pop t={t} at={at(c, 1.5)} x={1600} y={420}>
                <Tag x={0} y={0} text="свобода в 22 года" size={44} color={C.yellow} />
              </Pop>
            </g>
          )}
        </g>
      )}
      {B > 0 && (
        <g opacity={B}>
          <g transform={`translate(950 790)`}>
            <g opacity={1 - clamp01(grow * 3)}>
              <Cottage x={0} y={0} s={1.1} />
            </g>
            <g opacity={clamp01(grow * 3)}>
              <Mansion x={0} y={0} s={0.6 + grow * 0.55} />
            </g>
          </g>
          <Pop t={t} at={at(c, 2.1)} x={950} y={190}>
            <Tag x={0} y={0} text="богаче, дома просторнее" size={40} color={C.green} textColor="#fff" />
          </Pop>
          <Arrow x1={1290} y1={720} x2={1290} y2={720 - 240 * grow} k={ramp(t, at(c, 2.15), 0.6)} color={C.greenDeep} w={12} />
          <Smiley x={1580} y={500} r={130} t={t} />
          <Pop t={t} at={at(c, 2.3)} x={1580} y={730}>
            <Tag x={0} y={0} text="счастливее? нет" size={40} color={C.coral} textColor="#fff" />
          </Pop>
          <Pop t={t} at={at(c, 2.45)} x={1580} y={280}>
            <Tag x={0} y={0} text="своего времени — столько же" size={34} color="#fff" />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ───────────────────────── s30 · пожилые на скамейке ─────────────────────────
const Elder: React.FC<{ x: number; y: number; t: number; color: string; seed: number; glasses?: boolean; bun?: boolean }> = ({ x, y, t, color, seed, glasses, bun }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 1.6 + seed) * 2})`}>
    <path d="M -18 0 L -22 70 M 18 0 L 26 70" stroke={OL} strokeWidth={10} strokeLinecap="round" />
    <rect x={-38} y={-100} width={76} height={110} rx={28} fill={color} stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={-136} r={36} fill="#f2c79b" stroke={OL} strokeWidth={4} />
    <path d="M -36 -140 Q -34 -178 0 -176 Q 34 -178 36 -140 Q 22 -160 0 -160 Q -22 -160 -36 -140 Z" fill="#e8ebf0" stroke={OL} strokeWidth={3} />
    {bun && <circle cx={0} cy={-180} r={14} fill="#e8ebf0" stroke={OL} strokeWidth={3} />}
    {glasses ? (
      <g fill="none" stroke={OL} strokeWidth={3}>
        <circle cx={-13} cy={-136} r={10} />
        <circle cx={13} cy={-136} r={10} />
        <path d="M -3 -136 L 3 -136" />
      </g>
    ) : (
      <g fill={OL}>
        <circle cx={-12} cy={-138} r={4} />
        <circle cx={12} cy={-138} r={4} />
      </g>
    )}
    <path d="M -12 -116 Q 0 -106 12 -116" stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
    <circle cx={-24} cy={-122} r={6} fill={C.pink} opacity={0.5} />
    <circle cx={24} cy={-122} r={6} fill={C.pink} opacity={0.5} />
  </g>
);

export const Elders: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const mem = ramp(t, at(c, 1.45), 0.6);
  const crossK = [ramp(t, at(c, 1.15), 0.8), ramp(t, at(c, 1.3), 0.8)];
  const wrong = win(t, at(c, 1), cut(c, 2));
  const hug = ramp(t, at(c, 2.2), 0.6);
  return (
    <g>
      {/* скамейка */}
      <g>
        <rect x={110} y={615} width={540} height={22} rx={8} fill={C.wood} stroke={OL} strokeWidth={4} />
        <rect x={110} y={650} width={540} height={22} rx={8} fill={C.wood} stroke={OL} strokeWidth={4} />
        <rect x={100} y={730} width={560} height={28} rx={10} fill="#c98a4b" stroke={OL} strokeWidth={5} />
        <path d="M 140 758 L 140 830 M 620 758 L 620 830 M 140 637 L 140 730 M 620 637 L 620 730" stroke={OL} strokeWidth={10} strokeLinecap="round" />
      </g>
      <Elder x={220} y={740} t={t} color={C.skyDeep} seed={0} glasses />
      <Elder x={380} y={740} t={t} color={C.coral} seed={1.5} bun />
      <Elder x={540} y={740} t={t} color={C.teal} seed={3} />
      <Pop t={t} at={0.4} x={380} y={470}>
        <Tag x={0} y={0} text="1000 пожилых людей" size={38} color={C.yellow} />
      </Pop>
      {/* воспоминания */}
      {mem > 0 &&
        [
          ["друзья", C.sky],
          ["любимое дело", C.yellow],
          ["время с детьми", C.pink],
        ].map(([txt, col], i) => (
          <Pop key={i} t={t} at={at(c, 1.45 + i * 0.12)} x={330 + wob(t, i, 5)} y={140 + i * 110}>
            <g>
              <Bubble x={0} y={0} w={430} h={88} fill="#fff" />
              <circle cx={-170} cy={0} r={26} fill={col as string} stroke={OL} strokeWidth={3} />
              {i === 0 && <Heart x={-170} y={8} s={0.6} color="#fff" />}
              {i === 1 && <path d="M -184 6 L -170 -14 L -156 6 Z" fill="#fff" stroke={OL} strokeWidth={2} />}
              {i === 2 && <circle cx={-170} cy={-2} r={10} fill="#f2c79b" stroke={OL} strokeWidth={2} />}
              <Txt x={20} y={12} size={36}>
                {txt as string}
              </Txt>
            </g>
          </Pop>
        ))}
      {/* «больше денег», «дом побольше» — зачёркнуто */}
      {wrong > 0 && (
        <g opacity={wrong}>
          {["больше денег", "дом побольше"].map((txt, i) => (
            <Pop key={i} t={t} at={at(c, 1.05 + i * 0.1)} x={1570} y={250 + i * 190}>
              <g>
                <Bubble x={0} y={0} w={440} h={120} fill="#eceff4" />
                {i === 0 ? <Bill x={-150} y={0} s={0.6} rot={-8} /> : <Mansion x={-150} y={36} s={0.2} />}
                <Txt x={40} y={12} size={36} color={C.inkSoft}>
                  {txt}
                </Txt>
                <path d="M -60 2 L 140 2" stroke={C.red} strokeWidth={6} strokeLinecap="round" strokeDasharray={200} strokeDashoffset={200 * (1 - crossK[i])} />
                <Cross x={-150} y={0} s={70} k={crossK[i]} />
              </g>
            </Pop>
          ))}
        </g>
      )}
      {/* им нужны вы */}
      {hug > 0 && (
        <g opacity={hug}>
          <Pop t={t} at={at(c, 2.12)} x={960} y={150}>
            <Tag x={0} y={0} text="Им нужны вы" size={60} color={C.yellow} />
          </Pop>
          <g transform="translate(1560 0)">
            <circle cx={0} cy={600} r={230} fill={C.yellow} opacity={0.2 + 0.06 * Math.sin(t * 3)} />
            <Worker x={-50} y={790} s={1.5} role="plain" color={C.violet} t={t} arms={0.5} />
            <Worker x={lerp(150, 60, hug)} y={800} s={0.85} role="plain" color={C.orange} t={t} arms={1} flip />
            <Heart x={10} y={440 + Math.sin(t * 2.4) * 10} s={2 + 0.15 * Math.sin(t * 5)} />
            <g opacity={ramp(t, at(c, 2.2), 0.5)}>
              <Bill x={-30} y={300} s={0.7} rot={-8} color="#cfd6df" />
              <Cross x={-30} y={300} s={90} k={ramp(t, at(c, 2.3), 0.6)} />
            </g>
          </g>
        </g>
      )}
    </g>
  );
};

// ───────────────────────── s31 · парадокс человека в машине ─────────────────────────
// машина с головой водителя в окне
const DriveCar: React.FC<{ x: number; y: number; s: number; color: string; head: string; shine?: number; t: number; wheel?: number }> = ({ x, y, s, color, head, shine = 0, t, wheel = 0 }) => (
  <g>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={95} cy={-82} r={24} fill="#f2c79b" stroke={OL} strokeWidth={4} />
      <path d="M 72 -92 Q 95 -118 118 -92 Z" fill={head} stroke={OL} strokeWidth={3} />
    </g>
    <Car x={x} y={y} s={s} color={color} shine={shine} t={wheel} />
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={95} cy={-82} r={24} fill="#f2c79b" stroke={OL} strokeWidth={4} opacity={0.85} />
      <circle cx={103} cy={-86} r={3.5} fill={OL} />
      <path d="M 92 -74 Q 100 -68 108 -74" stroke={OL} strokeWidth={3} fill="none" />
      <path d="M 72 -92 Q 95 -118 118 -92 Z" fill={head} stroke={OL} strokeWidth={3} />
    </g>
  </g>
);

export const CarParadox: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = 1 - ramp(t, cut(c, 3), 0.6);
  const B = ramp(t, at(c, 3), 0.6);
  const wash = 1 - ramp(t, at(c, 1), 0.6);
  const shine = ramp(t, at(c, 1), 0.8);
  const dream = win(t, at(c, 1.4), cut(c, 2));
  const crowd = ramp(t, at(c, 2), 0.6);
  const PASS: [number, string][] = [
    [940, C.violet],
    [1080, C.teal],
    [1220, C.orange],
  ];
  return (
    <g>
      {A > 0 && (
        <g opacity={A}>
          {/* отель на фоне */}
          <rect x={120} y={260} width={520} height={460} rx={12} fill="#f3e6cf" stroke={OL} strokeWidth={4} opacity={0.9} />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={160 + (i % 4) * 120} y={300 + Math.floor(i / 4) * 110} width={70} height={64} rx={6} fill="#bfe6ff" stroke={OL} strokeWidth={3} opacity={0.8} />
          ))}
          <rect x={250} y={210} width={260} height={64} rx={14} fill={C.navy} stroke={OL} strokeWidth={4} />
          <Txt x={380} y={256} size={38} color={C.gold}>
            ОТЕЛЬ
          </Txt>
          <rect x={80} y={720} width={1220} height={90} fill="#8f98a8" />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={100 + i * 180} y={760} width={90} height={10} rx={5} fill="#fff" opacity={0.8} />
          ))}
          <DriveCar x={460} y={690} s={1.05} color={C.red} head={OL} shine={shine} t={t} />
          {/* мойщик с губкой и пеной */}
          <Worker x={800} y={760} s={1.25} role="janitor" t={t} arms={wash > 0.5 ? 0.6 + Math.sin(t * 6) * 0.3 : 0.1} flip />
          {wash > 0.01 &&
            Array.from({ length: 8 }).map((_, i) => {
              const ph = ((t * 0.5 + i / 8) % 1 + 1) % 1;
              return <circle key={i} cx={380 + (i % 4) * 90 + Math.sin(t * 2 + i) * 14} cy={620 - ph * 220} r={14 + (i % 3) * 8} fill="#fff" stroke={C.sky} strokeWidth={3} opacity={wash * Math.sin(ph * Math.PI)} />;
            })}
          <Pop t={t} at={0.4} x={800} y={210}>
            <Tag x={0} y={0} text="мойщик машин" size={40} color={C.sky} />
          </Pop>
          {dream > 0 && (
            <g opacity={dream}>
              <Bubble x={900} y={430} w={360} h={170} fill="#fff8d8" />
              <DriveCar x={895} y={470} s={0.42} color={C.red} head={C.teal} t={t} />
              <circle cx={830} cy={545} r={10} fill="#fff8d8" stroke={OL} strokeWidth={3} />
            </g>
          )}
          {crowd > 0 && (
            <g opacity={crowd}>
              {PASS.map(([px, col], i) => (
                <g key={i}>
                  <Worker x={px} y={770} s={1.0} role="plain" color={col} t={t} />
                  <Pop t={t} at={at(c, 2.15 + i * 0.1)} x={px} y={460 - (i % 2) * 70}>
                    <g>
                      <Bubble x={0} y={0} w={170} h={110} fill="#fff" />
                      <DriveCar x={-4} y={30} s={0.3} color={C.red} head={col} t={t} />
                    </g>
                  </Pop>
                </g>
              ))}
              <Pop t={t} at={at(c, 2.05)} x={420} y={430}>
                <g>
                  <Bubble x={0} y={0} w={420} h={96} fill="#ffe3e3" />
                  <Txt x={0} y={12} size={34} color={C.red}>
                    восхищайтесь мной!
                  </Txt>
                </g>
              </Pop>
              <Pop t={t} at={at(c, 2.6)} x={760} y={170}>
                <Tag x={0} y={0} text="смотрят на машину, а не на вас" size={38} color={C.yellow} />
              </Pop>
            </g>
          )}
        </g>
      )}
      {B > 0 && (
        <g opacity={B}>
          <Pop t={t} at={at(c, 3.05)} x={700} y={170}>
            <Tag x={0} y={0} text="Что весит больше?" size={48} color={C.yellow} />
          </Pop>
          <Scales
            x={700}
            y={380}
            s={1.15}
            tilt={0.85 * ramp(t, at(c, 3.25), 1.2) + Math.sin(t * 2) * 0.03}
            left={
              <g>
                <Car x={0} y={-36} s={0.3} color={C.red} shine={1} t={t} />
              </g>
            }
            right={<Heart x={0} y={-6} s={2.2 + 0.1 * Math.sin(t * 4)} />}
          />
          <Pop t={t} at={at(c, 3.4)} x={700} y={790}>
            <Tag x={0} y={0} text="скромность · доброта · сочувствие" size={38} color={C.green} textColor="#fff" />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ───────────────────────── s32 · айсберг богатства ─────────────────────────
export const Iceberg: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const WL = 430;
  const tip = pop(t, 0.3);
  const deep = 0.3 + 0.7 * ramp(t, at(c, 2), 1);
  const minus = ramp(t, at(c, 1.2), 0.6);
  const bob = Math.sin(t * 1.1) * 6;
  const wave = (yy: number, ph: number) => {
    let d = `M 620 ${yy}`;
    for (let x = 620; x <= 1840; x += 40) d += ` L ${x} ${yy + Math.sin(x * 0.03 + t * 2 + ph) * 6}`;
    return d;
  };
  return (
    <g>
      <rect x={620} y={WL} width={1220} height={430} rx={20} fill={C.skyDeep} opacity={0.32} />
      <rect x={620} y={WL + 200} width={1220} height={230} rx={20} fill={C.navy} opacity={0.12} />
      <g transform={`translate(0 ${bob})`}>
        {/* подводная часть */}
        <path d="M 1040 430 L 1420 430 L 1560 520 L 1620 700 L 1490 830 L 1110 845 L 880 770 L 820 610 L 930 500 Z" fill="#e8f6ff" stroke={OL} strokeWidth={5} strokeLinejoin="round" opacity={deep} />
        <path d="M 1080 470 L 1360 470 L 1480 560" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.6 * deep} />
        {/* верхушка */}
        <g transform={`translate(1230 430) scale(${tip}) translate(-1230 -430)`}>
          <path d="M 1040 430 L 1100 330 L 1150 300 L 1330 300 L 1380 340 L 1420 430 Z" fill="#fff" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 1160 318 L 1300 318" stroke={C.sky} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          <Car x={1190} y={274} s={0.4} color={C.red} shine={0.6} t={0} />
          <Watch x={1330} y={256} s={0.34} a={t * 8} />
        </g>
      </g>
      <path d={wave(WL, 0)} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
      <Txt x={660} y={400} size={34} anchor="start" color={C.inkSoft} opacity={tip}>
        видно
      </Txt>
      <Txt x={660} y={490} size={34} anchor="start" color="#fff" opacity={tip}>
        не видно
      </Txt>
      <Pop t={t} at={0.5} x={1230} y={170}>
        <Tag x={0} y={0} text="состоятельность" size={42} color={C.yellow} />
      </Pop>
      {/* −100 000 $ */}
      {minus > 0 && (
        <g opacity={minus * (1 - ramp(t, cut(c, 3), 0.5))}>
          <Pop t={t} at={at(c, 1.2)} x={1620} y={250}>
            <Tag x={0} y={0} text="−100 000 $" size={46} color={C.red} textColor="#fff" />
          </Pop>
          <Arrow x1={1500} y1={270} x2={1290} y2={262 + bob} k={ramp(t, at(c, 1.3), 0.5)} color={C.red} w={8} bend={-0.15} />
        </g>
      )}
      {/* богатство */}
      <Pop t={t} at={at(c, 2.05)} x={1220} y={555 + bob}>
        <Txt x={0} y={0} size={58} color={C.navy} weight={900}>
          богатство
        </Txt>
      </Pop>
      {[
        ["сбережения", 990],
        ["возможности", 1230],
        ["свобода", 1460],
      ].map(([lab, x], i) => {
        const a = at(c, 2.3 + i * 0.18);
        const k = pop(t, a);
        if (k <= 0.001) return null;
        const X = x as number;
        return (
          <g key={i} opacity={clamp01(k * 1.5)} transform={`translate(0 ${bob})`}>
            <g transform={`translate(${X} 690) scale(${k})`}>
              {i === 0 && <CoinStack x={0} y={30} n={5} s={0.85} />}
              {i === 1 && <Key x={10} y={0} s={0.55} rot={-20 + wob(t, 1, 6)} />}
              {i === 2 && <Sprout x={0} y={40} s={1.15} grow={ramp(t, a, 2)} t={t} color={C.yellow} />}
            </g>
            <Txt x={X} y={790} size={34} color={C.ink}>
              {lab as string}
            </Txt>
          </g>
        );
      })}
      {/* тихие бережливые — их не видно */}
      {t > at(c, 3) && (
        <g opacity={ramp(t, at(c, 3), 0.6)}>
          <circle cx={1735} cy={720} r={90} fill={C.yellow} opacity={0.25 + 0.1 * Math.sin(t * 3)} />
          <Worker x={1735} y={800} s={0.85} role="janitor" t={t} />
          <Pop t={t} at={at(c, 3.4)} x={1700} y={560}>
            <Tag x={0} y={0} text="Рональд Рид" size={36} color="#fff" />
          </Pop>
          <Pop t={t} at={at(c, 3.15)} x={1650} y={360}>
            <Tag x={0} y={0} text="тихих не видно" size={36} color={C.sky} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ───────────────────────── s33 · кран и ведро ─────────────────────────
export const SavingsTap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const plug = ramp(t, at(c, 2.45), 0.6);
  const lvl = 0.16 + Math.sin(t * 1.3) * 0.02 + ramp(t, at(c, 2.5), 5) * 0.68;
  const surf = 800 - lvl * 360;
  const leak = 1 - plug;
  const side = (y: number) => 30 * ((y - 420) / 380); // наклон стенки ведра
  const right = ramp(t, at(c, 3), 0.6);
  const card1 = win(t, at(c, 1), cut(c, 2));
  const card2 = win(t, at(c, 2), cut(c, 3));
  return (
    <g>
      {/* труба и кран «доход» */}
      <rect x={80} y={180} width={330} height={48} fill="#9aa5b8" stroke={OL} strokeWidth={5} />
      <rect x={390} y={170} width={90} height={70} rx={12} fill="#c9d3e0" stroke={OL} strokeWidth={5} />
      <rect x={418} y={236} width={34} height={44} fill="#c9d3e0" stroke={OL} strokeWidth={5} />
      <rect x={410} y={130} width={50} height={18} rx={8} fill={C.red} stroke={OL} strokeWidth={4} transform={`rotate(${Math.sin(t) * 6} 435 140)`} />
      <rect x={430} y={146} width={10} height={26} fill={OL} />
      <Tag x={240} y={140} text="доход" size={40} color={C.sky} />
      {/* струя */}
      <path d={`M 424 280 Q ${430 + Math.sin(t * 8) * 3} ${(280 + surf) / 2} 426 ${surf} L 446 ${surf} Q ${442 + Math.sin(t * 8 + 1) * 3} ${(280 + surf) / 2} 446 280 Z`} fill={C.sky} opacity={0.85} />
      {/* ведро */}
      <defs>
        <clipPath id="savingsTap-bucket">
          <path d="M 280 420 L 600 420 L 570 800 L 310 800 Z" />
        </clipPath>
      </defs>
      <path d="M 280 420 L 600 420 L 570 800 L 310 800 Z" fill="#f4f7fb" />
      <g clipPath="url(#savingsTap-bucket)">
        <path d={`M 270 ${surf} Q 360 ${surf - 10 + Math.sin(t * 3) * 5} 440 ${surf} T 610 ${surf} L 610 820 L 270 820 Z`} fill={C.skyDeep} opacity={0.8} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={440 + Math.sin(t * 3 + i * 2) * 20} cy={surf + 20 + ((t * 40 + i * 50) % 120)} r={6} fill="#fff" opacity={0.5} />
        ))}
      </g>
      <path d="M 280 420 L 600 420 L 570 800 L 310 800 Z" fill="none" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 280 420 Q 440 330 600 420" fill="none" stroke={OL} strokeWidth={5} />
      <path d={`M ${300 + side(500) * 0} 500 L 580 500`} stroke={OL} strokeWidth={3} opacity={0.2} />
      {/* дырка и утечка */}
      <circle cx={576} cy={735} r={12} fill={OL} />
      {leak > 0.02 && <path d={`M 582 735 Q 650 ${740 + Math.sin(t * 7) * 3} 690 850`} fill="none" stroke={C.sky} strokeWidth={14 * leak} strokeLinecap="round" />}
      {leak > 0.02 && <ellipse cx={700} cy={852} rx={70 * leak} ry={10} fill={C.sky} opacity={0.6} />}
      <g transform={`translate(${lerp(700, 590, plug)} ${lerp(600, 735, plug)}) rotate(${lerp(-40, 0, plug)})`} opacity={ramp(t, at(c, 2.2), 0.4)}>
        <rect x={-6} y={-16} width={44} height={32} rx={8} fill={C.wood} stroke={OL} strokeWidth={4} />
      </g>
      <Pop t={t} at={at(c, 1.4)} x={700} y={560}>
        <Tag x={0} y={0} text="самолюбие" size={36} color={C.coral} textColor="#fff" />
      </Pop>
      {t > at(c, 1.5) && <Arrow x1={680} y1={595} x2={600} y2={712} k={ramp(t, at(c, 1.5), 0.5)} color={C.coral} w={7} />}
      {plug > 0.5 && (
        <Pop t={t} at={at(c, 2.9)} x={440} y={lerp(700, surf + 70, 1)}>
          <Tag x={0} y={0} text="сбережения" size={38} color={C.gold} />
        </Pop>
      )}
      {/* правая колонка */}
      <g opacity={1 - right}>
        <Pop t={t} at={0.3} x={1060} y={210}>
          <Tag x={0} y={0} text="Копите деньги!" size={52} color={C.yellow} />
        </Pop>
        {card1 > 0 && (
          <g opacity={card1}>
            <Panel x={840} y={320} w={440} h={330} />
            <Txt x={1060} y={400} size={40}>
              богатство
            </Txt>
            <Txt x={1060} y={470} size={36} color={C.inkSoft}>
              зависит не от
            </Txt>
            <Txt x={1060} y={530} size={36} color={C.inkSoft} opacity={1}>
              дохода, а от того,
            </Txt>
            <Txt x={1060} y={600} size={40} color={C.moneyDeep}>
              что сохранили
            </Txt>
          </g>
        )}
        {card2 > 0 && (
          <g opacity={card2}>
            <Panel x={840} y={320} w={440} h={330} />
            <Txt x={1060} y={410} size={42} color={C.moneyDeep}>
              сбережения
            </Txt>
            <Txt x={1060} y={480} size={42}>
              =
            </Txt>
            <Txt x={1060} y={550} size={38}>
              доход
            </Txt>
            <Txt x={1060} y={610} size={38} color={C.coral}>
              − самолюбие
            </Txt>
          </g>
        )}
      </g>
      {/* сюрпризы и зонт-запас */}
      {right > 0 && (
        <g opacity={right}>
          <Tag x={1030} y={160} text="сюрпризы" size={44} color={C.coral} textColor="#fff" />
          {[0, 1, 2, 3, 4].map((i) => {
            const ph = ((t * 0.55 + i * 0.21) % 1 + 1) % 1;
            const hitY = 470;
            const y = 220 + ph * 380;
            const bounced = y > hitY;
            const bx = 860 + i * 85 + (bounced ? (i % 2 ? 1 : -1) * (y - hitY) * 1.4 : 0);
            const by = bounced ? hitY - (y - hitY) * 0.6 : y;
            return (
              <g key={i} transform={`translate(${bx} ${by}) rotate(${t * 90 + i * 40})`} opacity={1 - clamp01((y - hitY) / 140)}>
                <path d="M 0 -26 L 8 -6 L 26 -4 L 12 10 L 16 28 L 0 18 L -16 28 L -12 10 L -26 -4 L -8 -6 Z" fill={[C.red, C.orange, C.violet][i % 3]} stroke={OL} strokeWidth={3} />
              </g>
            );
          })}
          <g transform={`translate(1040 ${520 + wob(t, 1, 3)})`}>
            <path d="M -230 0 Q -230 -150 0 -160 Q 230 -150 230 0 Q 190 -30 153 0 Q 115 -30 77 0 Q 38 -30 0 0 Q -38 -30 -77 0 Q -115 -30 -153 0 Q -190 -30 -230 0 Z" fill={C.green} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
            <path d="M 0 -160 L 0 200 Q 0 230 -30 230" fill="none" stroke={OL} strokeWidth={8} strokeLinecap="round" />
            <Txt x={0} y={-62} size={44} color="#fff">
              запас
            </Txt>
          </g>
          <Worker x={1080} y={790} s={1.1} role="plain" color={C.yellowDeep} t={t} arms={0.4} />
        </g>
      )}
    </g>
  );
};

// ───────────────────────── s34 · гибкость: указатели от запаса ─────────────────────────
const MortarCap: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 -144 L 0 -164 L 46 -144 L 0 -124 Z" fill={OL} />
    <rect x={-22} y={-140} width={44} height={14} fill={OL} />
    <path d="M 40 -144 L 44 -116" stroke={C.gold} strokeWidth={4} />
  </g>
);

export const FlexOptions: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const PX = 980;
  const SIGNS: [string, number, 1 | -1, string][] = [
    ["сменить профессию", 340, 1, C.skyDeep],
    ["подождать", 440, -1, C.teal],
    ["учиться", 540, 1, C.violet],
    ["пауза", 640, -1, C.coral],
  ];
  const crowd = win(t, at(c, 1.5), cut(c, 2));
  const q = ramp(t, at(c, 2), 0.6);
  const coinFly = ramp(t, at(c, 2.3), 1.2);
  return (
    <g>
      <Pop t={t} at={0.3} x={1230} y={170}>
        <Tag x={0} y={0} text="невидимый доход: гибкость" size={46} color={C.yellow} />
      </Pop>
      {/* столб-перекрёсток на запасе */}
      <rect x={PX - 11} y={260} width={22} height={560} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
      <circle cx={PX} cy={258} r={18} fill={C.gold} stroke={OL} strokeWidth={4} />
      <CoinStack x={PX - 90} y={830} n={4} s={0.85} />
      <CoinStack x={PX + 90} y={830} n={5} s={0.85} />
      <CoinStack x={PX} y={838} n={3} s={0.9} />
      <Pop t={t} at={0.6} x={770} y={790}>
        <Tag x={0} y={0} text="запас" size={40} color={C.gold} />
      </Pop>
      {SIGNS.map(([txt, y, dir, col], i) => {
        const k = pop(t, at(c, 1.05 + i * 0.11));
        if (k <= 0.001) return null;
        const w = txt.length * 36 * 0.6 + 90;
        const sw = Math.sin(t * 1.5 + i) * 1.5;
        return (
          <g key={i} transform={`translate(${PX} ${y}) rotate(${sw}) scale(${k} 1)`} opacity={clamp01(k * 1.5)}>
            <path
              d={dir === 1 ? `M 0 -36 L ${w - 36} -36 L ${w} 0 L ${w - 36} 36 L 0 36 Z` : `M 0 -36 L ${-w + 36} -36 L ${-w} 0 L ${-w + 36} 36 L 0 36 Z`}
              fill={col}
              stroke={OL}
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <Txt x={(dir * (w - 20)) / 2} y={13} size={36} color="#fff">
              {txt}
            </Txt>
          </g>
        );
      })}
      {/* толпа «умных»: выделяется тот, у кого запас */}
      {crowd > 0 && (
        <g opacity={crowd}>
          <Pop t={t} at={at(c, 1.55)} x={1640} y={480}>
            <Tag x={0} y={0} text="все умные" size={38} color="#fff" />
          </Pop>
          {[1475, 1560, 1645, 1730, 1805].map((x, i) => {
            const hero = i === 2;
            const lift = hero ? ramp(t, at(c, 1.75), 0.6) : 0;
            return (
              <g key={i}>
                {hero && <circle cx={x} cy={700} r={110 * lift} fill={C.yellow} opacity={0.35} />}
                <Worker x={x} y={800 - lift * 20} s={0.85} role="plain" color={hero ? C.green : C.grey} t={t} arms={lift} />
                <MortarCap x={x} y={800 - lift * 20} s={0.85} />
                {hero && lift > 0 && <CoinStack x={x + 40} y={830} n={3} s={0.5} />}
              </g>
            );
          })}
        </g>
      )}
      {/* вопрос: одна трата → запас свободы */}
      {q > 0 && (
        <g opacity={q}>
          <Pop t={t} at={at(c, 2.05)} x={1630} y={260}>
            <Tag x={0} y={0} text="одна трата в месяц" size={36} color={C.coral} textColor="#fff" />
          </Pop>
          <g transform={`translate(1630 ${390 + wob(t, 3, 4)})`}>
            <path d="M -50 -50 L 50 -50 L 40 50 Q 0 64 -40 50 Z" fill="#fff" stroke={OL} strokeWidth={5} />
            <path d="M 50 -26 Q 84 -20 72 12 Q 64 26 44 22" fill="none" stroke={OL} strokeWidth={6} />
            <path d="M -20 -70 Q -10 -90 -20 -110 M 10 -70 Q 20 -90 10 -110" stroke={C.inkSoft} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
          <Coin x={1630} y={lerp(450, 560, coinFly)} s={0.55} spin={Math.cos(t * 5)} />
          <Jar x={1630} y={640} s={0.7} level={0.15 + coinFly * 0.45} t={t} />
          <Pop t={t} at={at(c, 2.35)} x={1630} y={800}>
            <Tag x={0} y={0} text="запас свободы" size={36} color={C.gold} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ───────────────────────── s35 · робот и банан в лодках ─────────────────────────
const Robot: React.FC<{ x: number; y: number; s?: number; t: number; panic: number }> = ({ x, y, s = 1, t, panic }) => {
  const shake = panic * Math.sin(t * 25) * 4;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s})`}>
      <rect x={-70} y={-150} width={140} height={150} rx={20} fill="#c9d3e0" stroke={OL} strokeWidth={5} />
      <rect x={-50} y={-128} width={100} height={70} rx={10} fill={C.navy} />
      <text x={0} y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.gold}>
        ∑σ²
      </text>
      <rect x={-60} y={-270} width={120} height={104} rx={24} fill="#dfe6ef" stroke={OL} strokeWidth={5} />
      <rect x={-6} y={-308} width={12} height={40} fill={OL} />
      <circle cx={0} cy={-312} r={12} fill={panic > 0.3 ? C.red : C.green} stroke={OL} strokeWidth={3} />
      <circle cx={-24} cy={-224} r={14} fill={panic > 0.3 ? "#fff" : C.sky} stroke={OL} strokeWidth={3} />
      <circle cx={24} cy={-224} r={14} fill={panic > 0.3 ? "#fff" : C.sky} stroke={OL} strokeWidth={3} />
      {panic > 0.3 ? <ellipse cx={0} cy={-190} rx={14} ry={10} fill={OL} /> : <rect x={-24} y={-196} width={48} height={8} rx={4} fill={OL} />}
      <path d={`M -70 -120 L ${-110} ${-60 - panic * 90} M 70 -120 L 110 ${-60 - panic * 90}`} stroke={OL} strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};

const Boat: React.FC<{ x: number; y: number; rot: number; children?: React.ReactNode; color?: string }> = ({ x, y, rot, children, color = C.wood }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {children}
    <path d="M -190 -10 L 190 -10 L 140 70 L -140 70 Z" fill={color} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -170 14 L 170 14" stroke="#fff" strokeWidth={6} opacity={0.35} />
  </g>
);

export const RobotVsBanana: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const storm = ramp(t, at(c, 2.05), 1.5);
  const toss = ramp(t, at(c, 2.2), 1.6);
  const sleep = ramp(t, at(c, 2.38), 0.6);
  const labels = win(t, 0.4, cut(c, 1));
  const card = win(t, at(c, 1), cut(c, 2));
  const rk = (seed: number) => Math.sin(t * (1.2 + storm * 1.8) + seed) * (3 + storm * 9);
  const sea = (yy: number, amp: number, ph: number) => {
    let d = `M 0 ${yy}`;
    for (let x = 0; x <= 1920; x += 30) d += ` L ${x} ${yy + Math.sin(x * 0.02 + t * (1.5 + storm * 2) + ph) * amp}`;
    return d + ` L 1920 870 L 0 870 Z`;
  };
  return (
    <g>
      <defs>
        <linearGradient id="robotVsBanana-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyDeep} stopOpacity={0.8} />
          <stop offset="0.75" stopColor={C.skyDeep} stopOpacity={0.6} />
          <stop offset="1" stopColor={C.skyDeep} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* тучи и дождь */}
      {storm > 0 && (
        <g opacity={storm}>
          {[200, 520, 840, 1160].map((x, i) => (
            <g key={i} transform={`translate(${x + Math.sin(t * 0.6 + i) * 20} ${190 + (i % 2) * 30})`}>
              <ellipse cx={0} cy={0} rx={150} ry={56} fill="#7d8799" />
              <ellipse cx={-60} cy={-30} rx={80} ry={52} fill="#8a94a6" />
              <ellipse cx={50} cy={-34} rx={90} ry={58} fill="#8a94a6" />
            </g>
          ))}
          {Array.from({ length: 26 }).map((_, i) => {
            const ph = ((t * 1.4 + i * 0.137) % 1 + 1) % 1;
            const x = 80 + ((i * 97) % 1220);
            return <line key={i} x1={x - ph * 40} y1={220 + ph * 420} x2={x - ph * 40 - 14} y2={250 + ph * 420} stroke={C.skyDeep} strokeWidth={5} strokeLinecap="round" opacity={0.7} />;
          })}
          {Math.sin(t * 2.3) > 0.93 && <path d="M 640 200 L 600 300 L 640 300 L 590 410" fill="none" stroke={C.yellow} strokeWidth={10} strokeLinejoin="round" />}
        </g>
      )}
      {/* лодки */}
      <Boat x={360} y={660} rot={rk(0)} color="#7f8da3">
        <Robot x={0} y={-10} s={0.95} t={t} panic={storm} />
        {toss < 1 && (
          <g transform={`translate(${lerp(110, -330, toss)} ${lerp(-150, 150, toss) - Math.sin(toss * Math.PI) * 140}) rotate(${toss * 400})`} opacity={1 - ramp(t, at(c, 2.2) + 1.4, 0.3)}>
            <rect x={-56} y={-40} width={112} height={80} rx={6} fill="#fff" stroke={OL} strokeWidth={4} />
            <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.navy}>
              ∫ f(x)
            </text>
          </g>
        )}
      </Boat>
      <Boat x={980} y={660} rot={rk(1.7) * (1 - sleep * 0.6)} color={C.wood}>
        <MiniBanana x={-20} y={-10} s={0.36} t={t} sleep={sleep} mood={storm > 0.5 ? "calm" : "happy"} />
        {/* плед */}
        <g opacity={sleep}>
          <path d="M -130 -10 Q -120 -110 -20 -100 Q 80 -110 110 -10 Z" fill={C.pink} stroke={OL} strokeWidth={4} />
          <path d="M -90 -70 L -60 -20 M -40 -90 L -10 -20 M 20 -95 L 50 -20" stroke="#fff" strokeWidth={6} opacity={0.6} strokeLinecap="round" />
        </g>
        {/* простой план на мачте-шесте */}
        <rect x={120} y={-210} width={10} height={200} fill={OL} />
        <g transform={`translate(125 -190) rotate(${Math.sin(t * 2) * 3})`}>
          <rect x={6} y={-6} width={130} height={92} rx={6} fill="#fff" stroke={OL} strokeWidth={4} />
          <text x={71} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.greenDeep}>
            план
          </text>
          <Check x={71} y={56} s={28} k={1} />
        </g>
      </Boat>
      {sleep > 0 &&
        [0, 1, 2].map((i) => {
          const ph = ((t * 0.5 + i / 3) % 1 + 1) % 1;
          return (
            <text key={i} x={940 + ph * 60 + i * 10} y={520 - ph * 120} fontFamily={FONT} fontWeight={900} fontSize={34 + i * 8} fill={C.navy} opacity={sleep * Math.sin(ph * Math.PI)}>
              z
            </text>
          );
        })}
      <path d={sea(705, 10 + storm * 18, 0)} fill="url(#robotVsBanana-sea)" />
      <path d={sea(735, 8 + storm * 14, 1.5)} fill="url(#robotVsBanana-sea)" opacity={0.6} />
      {labels > 0 && (
        <g opacity={labels}>
          <Tag x={360} y={280} text="программа" size={40} color="#dfe6ef" />
          <Tag x={980} y={280} text="человек" size={40} color={C.yellow} />
        </g>
      )}
      {card > 0 && (
        <g opacity={card}>
          <Panel x={240} y={130} w={900} h={250} />
          <g transform={`translate(380 255) rotate(${Math.sin(t * 1.5) * 4})`}>
            <path d="M -30 -110 L 0 -40 L 30 -110" fill="none" stroke={C.red} strokeWidth={18} />
            <circle r={62} fill={C.gold} stroke={OL} strokeWidth={5} />
            <circle r={44} fill="none" stroke="#c9952a" strokeWidth={5} />
            <path d="M 0 -24 L 7 -7 L 25 -7 L 11 4 L 16 22 L 0 11 L -16 22 L -11 4 L -25 -7 L -7 -7 Z" fill="#fff" opacity={0.85} />
          </g>
          <Txt x={760} y={225} size={40}>
            нобелевский лауреат
          </Txt>
          <Txt x={760} y={300} size={40} color={C.greenDeep}>
            выбрал «меньше огорчаться»
          </Txt>
        </g>
      )}
      {sleep > 0 && (
        <Pop t={t} at={at(c, 2.45)} x={980} y={330}>
          <Tag x={0} y={0} text="спокойный сон" size={44} color={C.yellow} />
        </Pop>
      )}
    </g>
  );
};

// ───────────────────────── s36 · зеркало заднего вида ─────────────────────────
export const RearMirror: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const P0 = 1 - ramp(t, cut(c, 1), 0.5);
  const P1 = win(t, at(c, 1), cut(c, 2));
  const P2 = win(t, at(c, 2), cut(c, 3));
  const P3 = win(t, at(c, 3), cut(c, 4));
  const P4 = ramp(t, at(c, 4), 0.6);
  const q = ramp(t, at(c, 2.1), 2.5);
  const roll = t * 260;
  return (
    <g>
      {P0 > 0 && (
        <g opacity={P0}>
          <Pop t={t} at={0.3} x={1230} y={330}>
            <g transform={`rotate(${Math.sin(t * 2) * 3})`}>
              <path d={Array.from({ length: 16 }).map((_, i) => `${i ? "L" : "M"} ${Math.cos((i * Math.PI) / 8) * (i % 2 ? 190 : 270)} ${Math.sin((i * Math.PI) / 8) * (i % 2 ? 120 : 170)}`).join(" ") + " Z"} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <Txt x={0} y={30} size={88} weight={900}>
                Сюрприз!
              </Txt>
            </g>
          </Pop>
          <Pop t={t} at={at(c, 0.5)} x={1230} y={650}>
            <g>
              <Book x={-300} y={0} s={0.7} color={C.skyDeep} />
              <Txt x={60} y={16} size={46}>
                история — не пророк
              </Txt>
            </g>
          </Pop>
        </g>
      )}
      {P1 > 0 && (
        <g opacity={P1}>
          <Pop t={t} at={at(c, 1.05)} x={1230} y={210}>
            <Tag x={0} y={0} text="случилось впервые" size={46} color={C.yellow} />
          </Pop>
          {[C.coral, C.sky, C.violet, C.green].map((col, i) => (
            <Pop key={i} t={t} at={at(c, 1.08 + i * 0.08)} x={790 + i * 280} y={500 + wob(t, i, 5)}>
              <g transform={`rotate(${(i % 2 ? 1 : -1) * 3})`}>
                <rect x={-115} y={-150} width={230} height={300} rx={22} fill="#fff" stroke={OL} strokeWidth={5} />
                <rect x={-115} y={-150} width={230} height={70} rx={22} fill={col} />
                <rect x={-115} y={-100} width={230} height={20} fill={col} />
                <Txt x={0} y={50} size={110} color={col} weight={900}>
                  ?
                </Txt>
                <g transform="translate(0 115) rotate(-8)">
                  <rect x={-95} y={-26} width={190} height={50} rx={10} fill="none" stroke={C.red} strokeWidth={5} />
                  <Txt x={0} y={12} size={34} color={C.red}>
                    впервые
                  </Txt>
                </g>
              </g>
            </Pop>
          ))}
        </g>
      )}
      {P2 > 0 && (
        <g opacity={P2}>
          <rect x={620} y={740} width={1220} height={100} fill="#8f98a8" />
          {Array.from({ length: 8 }).map((_, i) => {
            const x = 620 + ((((i * 170 - roll) % 1360) + 1360) % 1360);
            return x < 1800 ? <rect key={i} x={x} y={785} width={90} height={10} rx={5} fill="#fff" /> : null;
          })}
          {/* машина: водитель смотрит назад */}
          <Car x={900} y={700} s={0.95} color={C.skyDeep} t={t} />
          <g transform="translate(900 700) scale(0.95)">
            <circle cx={95} cy={-82} r={24} fill="#f2c79b" stroke={OL} strokeWidth={4} />
            <circle cx={84} cy={-86} r={3.5} fill={OL} />
            <path d="M 72 -96 Q 95 -118 118 -96 Z" fill={OL} />
            <rect x={110} y={-130} width={36} height={16} rx={6} fill="#dfe6ef" stroke={OL} strokeWidth={3} />
          </g>
          <path d="M 1035 578 L 1010 430" stroke={OL} strokeWidth={3} strokeDasharray="8 8" />
          {/* зеркало с прошлым */}
          <g transform="translate(1000 330)">
            <rect x={-250} y={-110} width={500} height={210} rx={90} fill="#2b3a67" stroke={OL} strokeWidth={6} />
            <rect x={-232} y={-92} width={464} height={174} rx={78} fill="#e7f1ff" />
            <path d="M -200 40 L -150 -10 L -100 30 L -50 -40 L 0 20 L 50 -20 L 100 50 L 150 0 L 200 30" fill="none" stroke={C.coral} strokeWidth={8} strokeLinejoin="round" />
            <Txt x={0} y={-36} size={36} color={C.inkSoft}>
              прошлое
            </Txt>
          </g>
          {/* впереди — большой вопрос */}
          <g transform={`translate(1640 ${600}) scale(${0.3 + q * 0.9})`}>
            <circle r={150} fill={C.coral} opacity={0.18} />
            <Txt x={0} y={90} size={260} color={C.coral} weight={900}>
              ?
            </Txt>
          </g>
          <Pop t={t} at={at(c, 2.3)} x={1640} y={230}>
            <Tag x={0} y={0} text="впереди" size={40} color="#fff" />
          </Pop>
        </g>
      )}
      {P3 > 0 && (
        <g opacity={P3}>
          <Pop t={t} at={at(c, 3.05)} x={1230} y={170}>
            <Tag x={0} y={0} text="Бенджамин Грэм переписывал формулы" size={38} color={C.yellow} />
          </Pop>
          {[0, 1, 2].map((i) => {
            const a = at(c, 3.08 + i * 0.13);
            const k = pop(t, a);
            if (k <= 0.001) return null;
            const x = 820 + i * 350;
            return (
              <g key={i} transform={`translate(${x} ${500 + wob(t, i, 4)}) scale(${k})`} opacity={clamp01(k * 1.5)}>
                <rect x={-150} y={-190} width={300} height={380} rx={16} fill="#fffdf6" stroke={OL} strokeWidth={5} />
                <rect x={-150} y={-190} width={36} height={380} rx={10} fill={[C.skyDeep, C.teal, C.violet][i]} stroke={OL} strokeWidth={4} />
                <Txt x={20} y={-120} size={36} color={C.inkSoft}>
                  {`издание ${i + 1}`}
                </Txt>
                <Txt x={20} y={10} size={44} color={C.navy}>
                  {["A + B", "A × C", "B − D"][i]}
                </Txt>
                {[60, 100, 140].map((ly) => (
                  <rect key={ly} x={-100} y={ly} width={ly === 140 ? 140 : 220} height={12} rx={6} fill="#e0dccf" />
                ))}
                {i < 2 && <path d="M -80 0 L 120 0" stroke={C.red} strokeWidth={9} strokeLinecap="round" strokeDasharray={200} strokeDashoffset={200 * (1 - ramp(t, at(c, 3.18 + i * 0.13), 0.5))} />}
                {i < 2 && <Arrow x1={160} y1={-20} x2={190} y2={-20} k={ramp(t, a + 0.4, 0.3)} color={C.inkSoft} w={8} />}
              </g>
            );
          })}
          <Pop t={t} at={at(c, 3.5)} x={1170} y={790}>
            <Tag x={0} y={0} text="мир менялся" size={40} color={C.coral} textColor="#fff" />
          </Pop>
        </g>
      )}
      {P4 > 0 && (
        <g opacity={P4}>
          <Pop t={t} at={at(c, 4.05)} x={1230} y={210}>
            <Tag x={0} y={0} text="мир полон сюрпризов" size={54} color={C.yellow} />
          </Pop>
          <Pop t={t} at={at(c, 4.15)} x={1230} y={360}>
            <Txt x={0} y={0} size={40} color={C.inkSoft}>
              из истории берём вечное:
            </Txt>
          </Pop>
          {[
            ["жадность", C.gold, 960],
            ["страх", C.sky, 1500],
          ].map(([lab, col, x], i) => (
            <Pop key={i} t={t} at={at(c, 4.22 + i * 0.08)} x={x as number} y={590 + wob(t, i, 5)}>
              <g>
                <circle r={120} fill={col as string} stroke={OL} strokeWidth={6} />
                {i === 0 ? (
                  <g>
                    <Coin x={-40} y={-20} s={0.5} />
                    <Coin x={40} y={-20} s={0.5} />
                    <path d="M -40 40 Q 0 70 40 40" stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />
                  </g>
                ) : (
                  <g>
                    <circle cx={-38} cy={-20} r={20} fill="#fff" stroke={OL} strokeWidth={4} />
                    <circle cx={38} cy={-20} r={20} fill="#fff" stroke={OL} strokeWidth={4} />
                    <circle cx={-38} cy={-16} r={7} fill={OL} />
                    <circle cx={38} cy={-16} r={7} fill={OL} />
                    <ellipse cx={0} cy={50} rx={22} ry={28} fill={OL} />
                  </g>
                )}
                <Txt x={0} y={190} size={44}>
                  {lab as string}
                </Txt>
              </g>
            </Pop>
          ))}
        </g>
      )}
    </g>
  );
};

// ───────────────────────── s37 · мост с запасом прочности ─────────────────────────
const Truck: React.FC<{ x: number; y: number; s?: number; t: number; body?: string; cargo?: string; snow?: boolean }> = ({ x, y, s = 1, t, body = C.orange, cargo = "#c9d3e0", snow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-180} y={-150} width={210} height={120} rx={10} fill={cargo} stroke={OL} strokeWidth={5} />
    <path d="M 30 -30 L 30 -150 L 100 -150 L 128 -94 L 196 -86 L 196 -30 Z" fill={body} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 46 -136 L 92 -136 L 112 -96 L 46 -96 Z" fill="#bfe6ff" stroke={OL} strokeWidth={4} />
    <rect x={180} y={-74} width={18} height={14} rx={4} fill="#fff6c2" stroke={OL} strokeWidth={3} />
    {snow && (
      <g fill="#fff" stroke={OL} strokeWidth={3}>
        <path d="M -186 -150 Q -180 -176 -140 -170 Q -80 -184 -20 -172 Q 20 -178 36 -150 Z" />
        <path d="M 28 -150 Q 40 -170 70 -164 Q 96 -170 104 -150 Z" />
      </g>
    )}
    {[-120, 130].map((wx) => (
      <g key={wx} transform={`translate(${wx} -26) rotate(${t * 200})`}>
        <circle r={38} fill="#2b2b3a" stroke={OL} strokeWidth={5} />
        <circle r={15} fill="#c9d3e0" />
        <rect x={-3} y={-34} width={6} height={18} fill="#c9d3e0" />
      </g>
    ))}
  </g>
);

export const SafetyBridge: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = 1 - ramp(t, cut(c, 2), 0.6);
  const B = ramp(t, at(c, 2), 0.6);
  const thick = ramp(t, at(c, 1.1), 1.4);
  const shaky = 1 - thick;
  const tx = 480 + ((((t * 110) % 1120) + 1120) % 1120);
  const sag = shaky * (0.6 + 0.4 * Math.sin(t * 5)) * 22;
  const est = ramp(t, at(c, 3.05), 0.6);
  const real = ramp(t, at(c, 3.35), 1.4);
  return (
    <g>
      {A > 0 && (
        <g opacity={A}>
          <Pop t={t} at={0.3} x={960} y={170}>
            <Tag x={0} y={0} text="Оставьте место для ошибок" size={50} color={C.yellow} />
          </Pop>
          <rect x={400} y={700} width={1120} height={140} rx={20} fill={C.sky} opacity={0.45} />
          <path d={`M 400 ${712 + Math.sin(t * 2) * 4} Q 680 ${700 + Math.sin(t * 2 + 1) * 6} 960 712 T 1520 712`} fill="none" stroke="#fff" strokeWidth={6} opacity={0.7} />
          {[640, 960, 1280].map((px, i) => {
            const w = 18 + thick * 70;
            const rot = shaky * Math.sin(t * 6 + i * 1.3) * 3.5;
            return (
              <g key={px} transform={`rotate(${rot} ${px} 800)`}>
                <rect x={px - w / 2} y={560} width={w} height={250} rx={6} fill={thick > 0.5 ? "#9aa5b8" : "#c9a37a"} stroke={OL} strokeWidth={4} />
                {thick > 0.3 && <rect x={px - w / 2 + 8} y={570} width={10} height={230} rx={4} fill="#fff" opacity={0.35 * thick} />}
              </g>
            );
          })}
          <path d={`M 440 530 Q 800 ${530 + sag} 960 ${530 + sag * 0.6} T 1480 530 L 1480 562 Q 1120 ${562 + sag} 960 ${562 + sag * 0.6} T 440 562 Z`} fill={C.wood} stroke={OL} strokeWidth={5} />
          <rect x={420} y={520} width={60} height={300} fill="#b8a48a" stroke={OL} strokeWidth={4} />
          <rect x={1440} y={520} width={60} height={300} fill="#b8a48a" stroke={OL} strokeWidth={4} />
          <Truck x={tx} y={530 + sag * Math.sin(((tx - 440) / 1040) * Math.PI) * 0.8} s={0.6} t={t} />
          {shaky > 0.2 &&
            [640, 960, 1280].map((px, i) => (
              <Txt key={px} x={px + 50} y={640} size={44} color={C.red} opacity={shaky * (0.5 + 0.5 * Math.sin(t * 8 + i))}>
                !
              </Txt>
            ))}
          {thick > 0 && (
            <g opacity={thick}>
              <Tag x={960} y={330} text="запас прочности" size={46} color={C.green} textColor="#fff" />
              <Txt x={960} y={430} size={36} color={C.inkSoft}>
                предсказания не нужны
              </Txt>
              <Check x={1560} y={460} s={60} k={ramp(t, at(c, 1.5), 0.6)} />
            </g>
          )}
        </g>
      )}
      {B > 0 && (
        <g opacity={B}>
          {/* маленький офис и копилка зарплат на год */}
          <Pop t={t} at={at(c, 2.05)} x={700} y={200}>
            <Tag x={0} y={0} text="Билл Гейтс, первые годы" size={38} color="#fff" />
          </Pop>
          <g>
            <rect x={400} y={470} width={260} height={300} rx={10} fill="#f3e6cf" stroke={OL} strokeWidth={5} />
            <path d="M 380 480 L 530 380 L 680 480 Z" fill={C.skyDeep} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={430 + (i % 2) * 120} y={510 + Math.floor(i / 2) * 90} width={80} height={60} rx={6} fill="#bfe6ff" stroke={OL} strokeWidth={3} />
            ))}
            <rect x={500} y={690} width={60} height={80} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
          </g>
          <Jar x={880} y={620} s={1.05} level={0.2 + ramp(t, at(c, 2.2), 3) * 0.72} t={t} />
          <Pop t={t} at={at(c, 2.4)} x={720} y={300}>
            <Tag x={0} y={0} text="зарплаты на год" size={42} color={C.gold} />
          </Pop>
          {[0, 1, 2, 3].map((i) => {
            const ph = ((t * 0.7 + i / 4) % 1 + 1) % 1;
            return t > at(c, 2.2) ? <Coin key={i} x={880 + Math.sin(i * 2) * 30} y={360 + ph * 120} s={0.4} spin={Math.cos(t * 5 + i)} /> : null;
          })}
          {/* смета ремонта */}
          {est > 0 && (
            <g opacity={est}>
              <Tag x={1470} y={200} text="смета ремонта" size={42} color={C.yellow} />
              <rect x={1250} y={520} width={150} height={250} rx={12} fill={C.sky} stroke={OL} strokeWidth={5} />
              <rect x={1490} y={770 - lerp(250, 400, real)} width={150} height={lerp(250, 400, real)} rx={12} fill={C.coral} stroke={OL} strokeWidth={5} />
              <path d="M 1230 520 L 1660 520" stroke={OL} strokeWidth={4} strokeDasharray="12 10" />
              <Txt x={1325} y={815} size={36}>
                план
              </Txt>
              <Txt x={1565} y={815} size={36}>
                на деле
              </Txt>
              <Pop t={t} at={at(c, 3.6)} x={1470} y={300}>
                <Tag x={0} y={0} text="отложите больше" size={38} color={C.green} textColor="#fff" />
              </Pop>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ───────────────────────── s38 · полевые мыши ─────────────────────────
const Mouse: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean }> = ({ x, y, s = 1, t, flip }) => {
  const nib = Math.sin(t * 14) * 2;
  return (
    <g transform={`translate(${x} ${y + nib * 0.5}) scale(${flip ? -s : s} ${s})`}>
      <path d={`M -26 4 Q -60 ${-10 + Math.sin(t * 3) * 8} -70 14`} stroke="#c78b8b" strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={0} rx={30} ry={20} fill="#9a9aa6" stroke={OL} strokeWidth={3} />
      <circle cx={28} cy={-8} r={15} fill="#a9a9b4" stroke={OL} strokeWidth={3} />
      <circle cx={22} cy={-24} r={10} fill="#f0b7c4" stroke={OL} strokeWidth={3} />
      <circle cx={33} cy={-11} r={3} fill={OL} />
      <circle cx={43 + nib} cy={-5} r={4} fill={C.pink} />
    </g>
  );
};

export const FieldMice: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = 1 - ramp(t, cut(c, 2), 0.6);
  const B = ramp(t, at(c, 2), 0.6);
  const stone = ramp(t, at(c, 2.45), 0.7);
  const snap = clamp01((t - (at(c, 2.45) + 0.7)) / 0.9);
  const fallY = snap * snap * 260;
  const flakes = Array.from({ length: 34 }).map((_, i) => {
    const ph = ((t * 0.12 + i * 0.173) % 1 + 1) % 1;
    return { x: 90 + ((i * 131) % 1200) + Math.sin(t + i) * 14, y: 100 + ph * 760, r: 4 + (i % 3) * 2 };
  });
  return (
    <g>
      {A > 0 && (
        <g opacity={A}>
          <path d="M 80 640 Q 400 600 700 630 T 1300 620 L 1300 860 L 80 860 Z" fill="#f4fbff" stroke="#c9dceb" strokeWidth={4} />
          {[260, 650, 1040].map((x, i) => (
            <g key={i}>
              <Truck x={x} y={760} s={0.85} t={0} body={C.skyDeep} cargo="#e9d27a" snow />
              {/* провода под капотом */}
              <path d={`M ${x + 90} 735 Q ${x + 120} 770 ${x + 160} 752`} stroke={C.red} strokeWidth={6} fill="none" />
              <path d={`M ${x + 96} 742 Q ${x + 130} 790 ${x + 170} 762`} stroke={C.skyDeep} strokeWidth={6} fill="none" />
              <Mouse x={x + 120 + Math.sin(t * 0.8 + i) * 6} y={805} s={1.25} t={t + i} flip={i === 1} />
              <Pop t={t} at={at(c, 0.3 + i * 0.06)} x={x + 20} y={540}>
                <g opacity={0.7 + 0.3 * Math.sin(t * 4 + i)}>
                  <circle r={42} fill="#fff" stroke={OL} strokeWidth={4} />
                  <path d="M 6 -26 L -12 4 L 4 4 L -6 28 L 16 -6 L 0 -6 Z" fill={C.yellow} stroke={OL} strokeWidth={3} />
                  <Cross x={0} y={0} s={60} k={1} />
                </g>
              </Pop>
            </g>
          ))}
          <Pop t={t} at={0.3} x={420} y={180}>
            <Tag x={0} y={0} text="зима 1942 года" size={42} color={C.sky} />
          </Pop>
          <Pop t={t} at={at(c, 0.5)} x={940} y={180}>
            <Tag x={0} y={0} text="техника не завелась" size={38} color="#fff" />
          </Pop>
          {t > at(c, 1) && (
            <g opacity={ramp(t, at(c, 1), 0.5)}>
              <Pop t={t} at={at(c, 1.1)} x={690} y={330}>
                <Tag x={0} y={0} text="где тонко, там и рвётся" size={52} color={C.yellow} />
              </Pop>
            </g>
          )}
        </g>
      )}
      {B > 0 && (
        <g opacity={B}>
          <rect x={120} y={300} width={1140} height={18} rx={9} fill={C.wood} stroke={OL} strokeWidth={4} />
          {/* без запаса: полка на одной нитке */}
          <g>
            <path d={`M 420 318 L 420 ${snap > 0 ? 420 : 555}`} stroke={OL} strokeWidth={3} />
            {snap > 0 && <path d={`M 420 ${555 + fallY} L 420 ${470 + fallY}`} stroke={OL} strokeWidth={3} />}
            <g transform={`translate(420 ${560 + fallY}) rotate(${snap * 18})`}>
              <rect x={-170} y={0} width={340} height={22} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
              <Cottage x={-70} y={0} s={0.5} />
              <CoinStack x={80} y={-6} n={3} s={0.7} />
            </g>
            <Pop t={t} at={at(c, 2.1)} x={420} y={410}>
              <Tag x={0} y={0} text="одна зарплата" size={36} color={C.coral} textColor="#fff" />
            </Pop>
            {/* камень-неприятность */}
            <g transform={`translate(${470 + snap * 60} ${lerp(330, 530, stone) + fallY})`} opacity={stone > 0 ? 1 : 0}>
              <ellipse rx={30} ry={24} fill="#7d8799" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={12} size={34} color="#fff">
                !
              </Txt>
            </g>
          </g>
          {/* с запасом: полка на прочной коробке */}
          <g>
            <path d="M 960 318 L 960 555" stroke={OL} strokeWidth={3} />
            <rect x={790} y={560} width={340} height={22} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
            <Cottage x={890} y={560} s={0.5} />
            <CoinStack x={1040} y={554} n={3} s={0.7} />
            <rect x={820} y={582} width={280} height={240} rx={14} fill={C.gold} stroke={OL} strokeWidth={6} />
            <path d="M 820 640 L 1100 640" stroke={OL} strokeWidth={4} opacity={0.3} />
            <Txt x={960} y={730} size={52} weight={900}>
              запас
            </Txt>
            <g transform={`translate(${1010 + ramp(t, at(c, 2.6), 0.8) * 120} ${lerp(330, 530, stone) - Math.sin(ramp(t, at(c, 2.6), 0.8) * Math.PI) * 60})`} opacity={stone > 0 ? 1 - ramp(t, at(c, 2.9), 0.4) : 0}>
              <ellipse rx={30} ry={24} fill="#7d8799" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={12} size={34} color="#fff">
                !
              </Txt>
            </g>
            <Check x={1180} y={620} s={50} k={ramp(t, at(c, 2.75), 0.5)} />
          </g>
          {t > at(c, 3) && (
            <Pop t={t} at={at(c, 3.05)} x={690} y={170}>
              <g>
                <Panel x={-470} y={-75} w={940} h={150} fill="#fff" r={30} />
                <Txt x={0} y={-12} size={42} color={C.greenDeep}>
                  рисковать — можно,
                </Txt>
                <Txt x={0} y={44} size={42} color={C.red}>
                  выбыть из игры — нельзя
                </Txt>
              </g>
            </Pop>
          )}
        </g>
      )}
      {/* снег */}
      {flakes.map((f, i) => (
        <circle key={i} cx={f.x} cy={f.y} r={f.r} fill="#fff" stroke="#c9dceb" strokeWidth={1.5} opacity={0.9 * A} />
      ))}
    </g>
  );
};
