// Часть «Две системы»: знакомство с Системой 1 и Системой 2, оговорка «не отделы мозга»,
// ленивый контролёр, иллюзия Мюллер-Лайера, невидимая горилла, когнитивная лёгкость,
// «что вижу, то и есть» и подмена вопроса. Всё привязано к репликам через at().
import React from "react";
import { C, S1, S2 } from "../theme";
import { MetaphorNote, SystemOne, SystemTwo, Dot } from "./chars";
import { Bubble, Heart, OL, Person } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

const HEAD = "Rubik";
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// видимость: появляется в a, исчезает в b
const vis = (t: number, a: number, b = 1e9, d = 0.5) => ramp(t, a, d) * (1 - ramp(t, b, d));

const Fade: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) => (o <= 0.001 ? null : <g opacity={clamp01(o)}>{children}</g>);

// подпись персонажа отдельно (чтобы можно было разворачивать фигурку)
const NameTag: React.FC<{ x: number; y: number; s?: number; two?: boolean }> = ({ x, y, s = 1, two }) => (
  <g transform={`translate(${x} ${y + 52 * s}) scale(${s})`}>
    <rect x={-110} y={-26} width={220} height={48} rx={24} fill={two ? S2.deep : S1.deep} />
    <Txt x={0} y={9} size={30} weight={900} color="#fff">
      {two ? "Система 2" : "Система 1"}
    </Txt>
  </g>
);

// заголовок с шрифтом Rubik
const Head: React.FC<{ x: number; y: number; size?: number; color?: string; children: string }> = ({ x, y, size = 56, color = C.ink, children }) => (
  <text x={x} y={y} fontFamily={HEAD} fontWeight={700} fontSize={size} fill={color} textAnchor="middle">
    {children.split("\n").map((l, i) => (
      <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.15}>
        {l}
      </tspan>
    ))}
  </text>
);

// мысли-пузырь из кружков
const ThoughtDots: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({ x1, y1, x2, y2 }) => (
  <g>
    {[0.2, 0.5, 0.8].map((k, i) => (
      <circle key={i} cx={lerp(x1, x2, k)} cy={lerp(y1, y2, k)} r={8 + i * 5} fill="#fff" stroke={OL} strokeWidth={4} />
    ))}
  </g>
);

const AngryFace: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={92} fill="#f6b48c" stroke={OL} strokeWidth={6} />
    <circle cx={-52} cy={22} r={16} fill={C.red} opacity={0.35} />
    <circle cx={52} cy={22} r={16} fill={C.red} opacity={0.35} />
    <path d="M -58 -44 L -14 -24 M 58 -44 L 14 -24" stroke={OL} strokeWidth={10} strokeLinecap="round" />
    <circle cx={-34} cy={-6} r={9} fill={OL} />
    <circle cx={34} cy={-6} r={9} fill={OL} />
    <path d="M -38 50 Q 0 20 38 50" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
    {/* «пар» злости */}
    {[-1, 1].map((sd) => (
      <path key={sd} d={`M ${sd * 84} -78 q ${sd * 12} -16 0 -30 q ${-sd * 12} -14 0 -28`} stroke={C.red} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6 + 0.3 * Math.sin(t * 6 + sd)} />
    ))}
  </g>
);

const Burst: React.FC<{ x: number; y: number; r: number; k: number; t: number; text: string }> = ({ x, y, r, k, t, text }) => {
  if (k <= 0) return null;
  const n = 12;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.62 : r;
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(" ");
  return (
    <g transform={`translate(${x} ${y}) rotate(${wob(t, 2, 4)}) scale(${0.4 + 0.6 * clamp01(k)})`} opacity={clamp01(k * 2)}>
      <polygon points={pts} fill={C.yellow} stroke={S1.deep} strokeWidth={6} strokeLinejoin="round" />
      <Txt x={0} y={16} size={r * 0.42} weight={900} color={C.red}>
        {text}
      </Txt>
    </g>
  );
};

// ─────────────────────────────── k06: Система 1 ───────────────────────────────
export const MeetS1: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const runK = ramp(t, 0.1, 1.1);
  const sx = lerp(1980, 860, runK);
  const running = runK > 0.02 && runK < 0.98 ? 1 : 0;
  const bang = at(c, 2.55);
  // разворот: бежит влево → смотрит вправо → оборачивается на звук → снова вправо
  const f = -1 + 2 * ramp(t, 1.2, 0.3) - 2 * ramp(t, bang + 0.12, 0.25) + 2 * ramp(t, at(c, 3), 0.35);
  const fx = Math.sign(f || 1) * Math.max(0.06, Math.abs(f));
  const tAngry = at(c, 1.15);
  const mood = t > bang && t < at(c, 3) ? "shock" : t > tAngry + 0.3 && t < at(c, 2) ? "think" : "happy";
  const bubbleK = vis(t, at(c, 1.35), at(c, 3));
  const four = pop(t, at(c, 2.12) + 0.3);
  return (
    <g>
      {/* свойства: быстро, само, без усилий */}
      {["быстро", "само", "без усилий"].map((s, i) => (
        <Pop key={s} t={t} at={at(c, 0.35 + i * 0.16)} x={1080 + i * 290} y={170}>
          <g transform={`rotate(${wob(t, i, 1.5)})`}>
            <Tag x={0} y={0} text={s} size={40} color={i === 0 ? C.yellow : S1.light} />
          </g>
        </Pop>
      ))}
      {/* звук за спиной */}
      <Burst x={630} y={430} r={110} k={pop(t, bang) * (1 - ramp(t, at(c, 3), 0.4))} t={t} text="БАХ!" />
      {pop(t, bang) > 0 &&
        t < at(c, 3) + 0.4 &&
        [0, 1, 2].map((i) => {
          const k = clamp01((t - bang - i * 0.12) * 2.5);
          return k > 0 ? <path key={i} d={`M ${735 + i * 22} ${370 + i * -8} q 22 60 0 120`} stroke={S1.deep} strokeWidth={8} fill="none" strokeLinecap="round" opacity={(1 - ramp(t, at(c, 3), 0.4)) * k} /> : null;
        })}
      {/* Система 1 */}
      <g transform={`translate(${sx} 0) scale(${fx} 1) translate(${-sx} 0)`}>
        <SystemOne x={sx} y={790} t={t} run={running} mood={mood} label={false} look={t > tAngry && t < at(c, 3) ? 1 : 0} />
      </g>
      <NameTag x={sx} y={790} />
      <Pop t={t} at={bang + 0.1} x={sx - 120} y={540}>
        <g opacity={1 - ramp(t, at(c, 3), 0.3)} transform={`rotate(${-12 + wob(t, 4, 4)})`}>
          <Txt x={0} y={0} size={90} weight={900} color={C.red}>
            !
          </Txt>
        </g>
      </Pop>
      {/* сердитое лицо */}
      <Pop t={t} at={tAngry} x={1180} y={420}>
        <g>
          <Panel x={-160} y={-150} w={320} h={300} fill="#fff" />
          <AngryFace x={0} y={-10} s={1.15} t={t} />
        </g>
      </Pop>
      <Fade o={bubbleK}>
        <ThoughtDots x1={950} y1={610} x2={1010} y2={640} />
        <Bubble x={1000} y={600} w={400} h={104} />
        <Txt x={1200} y={665} size={38} weight={900} color={C.red}>
          сейчас накричит!
        </Txt>
      </Fade>
      {/* 2 + 2 */}
      <Pop t={t} at={at(c, 2.08)} x={1580} y={420}>
        <g>
          <Panel x={-160} y={-150} w={320} h={300} fill="#fff" />
          <Txt x={0} y={-20} size={88} weight={900}>
            2 + 2 =
          </Txt>
          {four > 0 && (
            <g transform={`translate(0 92) scale(${0.3 + 0.7 * four})`}>
              <circle r={56} fill={S1.light} />
              <Txt x={0} y={30} size={96} weight={900} color={S1.deep}>
                4
              </Txt>
            </g>
          )}
        </g>
      </Pop>
      {/* итог: что такое Система 1 */}
      {["впечатления", "чувства", "догадки", "всегда включена"].map((s, i) => (
        <Pop key={s} t={t} at={at(c, 3.25 + i * 0.13)} x={i % 2 === 0 ? 1180 : 1590} y={i < 2 ? 680 : 790}>
          <g transform={`rotate(${wob(t, i + 3, 1.2)})`}>
            <Tag x={0} y={0} text={s} size={40} color={i === 3 ? C.green : i === 0 ? C.yellow : S1.light} textColor={i === 3 ? "#fff" : C.ink} />
          </g>
        </Pop>
      ))}
    </g>
  );
};

// ─────────────────────────────── k07: Система 2 ───────────────────────────────
const Gear: React.FC<{ x: number; y: number; r: number; a: number; color: string }> = ({ x, y, r, a, color }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-r * 0.18} y={-r * 1.25} width={r * 0.36} height={r * 0.5} rx={3} fill={color} transform={`rotate(${i * 45})`} />
    ))}
    <circle r={r} fill={color} />
    <circle r={r * 0.4} fill="#fff" />
  </g>
);

const EyeIcon: React.FC<{ x: number; y: number; pupil: number }> = ({ x, y, pupil }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -130 0 Q 0 -100 130 0 Q 0 100 -130 0 Z" fill="#fff" stroke={OL} strokeWidth={6} />
    <circle r={54} fill={S2.main} stroke={OL} strokeWidth={4} />
    <circle r={pupil} fill="#1b1b1b" />
    <circle cx={-16} cy={-18} r={9} fill="#fff" />
  </g>
);

export const MeetS2: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const walk = ramp(t, 0.1, 1.8);
  const s2x = lerp(-160, 300, walk);
  const pauseA = c.ends[1] ?? at(c, 1.9);
  const pauseB = c.beats[2] ?? at(c, 2);
  const inPause = t > pauseA && t < pauseB + 0.3;
  const thinkK = vis(t, at(c, 1.4), pauseB + 0.3);
  const col = ramp(t, at(c, 2), 0.7); // заголовок уезжает вверх
  const qK = pop(t, at(c, 1.1));
  const step = (b: number) => ramp(t, at(c, b), 0.35);
  const R = 900; // правый край столбика
  const D = 42; // ширина цифры
  const answer = ramp(t, at(c, 2.75), 0.4);
  const dil = ramp(t, at(c, 3.2), 1.4);
  const pulseSpeed = 1.2 + dil * 0.9;
  const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * pulseSpeed)), 6);
  const effortK = ramp(t, at(c, 3.05), 0.5);
  const mood = t > at(c, 3) ? "shock" : "think";
  return (
    <g>
      {["медленно", "внимание", "усилие"].map((s, i) => (
        <Pop key={s} t={t} at={at(c, 0.35 + i * 0.16)} x={600 + i * 290} y={170}>
          <g opacity={1 - ramp(t, at(c, 1), 0.4)}>
            <Tag x={0} y={0} text={s} size={40} color={i === 0 ? S2.light : i === 1 ? "#dfe9ff" : C.yellow} />
          </g>
        </Pop>
      ))}
      {/* Система 2 с блокнотом */}
      <SystemTwo x={s2x} y={820} s={1.05} t={t} mood={mood} write={t > at(c, 2) && t < at(c, 3) ? 1 : 0.3} label={false} />
      <NameTag x={s2x} y={820} s={1.05} two />
      {/* капли пота при усилии */}
      {effortK > 0 &&
        [0, 1].map((i) => {
          const fall = ((t * 0.8 + i * 0.5) % 1) * 40;
          return <path key={i} d={`M ${s2x + 100 + i * 24} ${520 + fall} q -10 18 0 24 q 10 -6 0 -24 Z`} fill={C.sky} stroke={OL} strokeWidth={3} opacity={effortK * (1 - fall / 50)} />;
        })}
      {/* думает в паузе */}
      <Fade o={thinkK}>
        <ThoughtDots x1={s2x - 20} y1={490} x2={s2x - 60} y2={440} />
        <rect x={s2x - 230} y={280} width={270} height={140} rx={60} fill="#fff" stroke={OL} strokeWidth={4} />
        <Gear x={s2x - 170} y={350} r={30} a={t * (inPause ? 70 : 30)} color={S2.main} />
        <Gear x={s2x - 108} y={325} r={20} a={-t * (inPause ? 100 : 45)} color={S2.deep} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={s2x - 60 + i * 30} cy={370} r={9} fill={C.inkSoft} opacity={0.3 + 0.7 * clamp01(Math.sin(t * 4 - i * 0.8))} />
        ))}
      </Fade>
      {/* задача */}
      {qK > 0 && (
        <g transform={`translate(${lerp(820, 820, col)} ${lerp(390, 200, col)}) scale(${(0.6 + 0.4 * qK) * lerp(1, 0.7, col) * (inPause ? 1 + 0.03 * Math.sin(t * 4) : 1)})`} opacity={clamp01(qK * 1.5)}>
          <Panel x={-440} y={-120} w={880} h={180} fill="#fff" />
          <text x={0} y={18} fontFamily={HEAD} fontWeight={700} fontSize={116} fill={C.ink} textAnchor="middle">
            17 × 24 ={" "}
            <tspan fill={answer > 0.5 ? C.green : C.ink}>{answer > 0.5 ? "408" : "?"}</tspan>
          </text>
        </g>
      )}
      {/* умножение столбиком */}
      <Fade o={step(2.08)}>
        <Txt x={R} y={390} size={74} anchor="end" weight={900}>
          17
        </Txt>
      </Fade>
      <Fade o={step(2.12)}>
        <Txt x={R} y={470} size={74} anchor="end" weight={900}>
          24
        </Txt>
        <Txt x={R - 3.4 * D} y={466} size={62} anchor="middle" weight={900} color={S2.deep}>
          ×
        </Txt>
      </Fade>
      <line x1={R - 4.4 * D} y1={496} x2={lerp(R - 4.4 * D, R + 10, step(2.24))} y2={496} stroke={OL} strokeWidth={6} strokeLinecap="round" opacity={step(2.24) > 0 ? 1 : 0} />
      <Fade o={step(2.34)}>
        <Txt x={R} y={570} size={74} anchor="end" weight={900} color={S2.deep}>
          68
        </Txt>
      </Fade>
      <Fade o={step(2.48)}>
        <Txt x={R - D} y={650} size={74} anchor="end" weight={900} color={S2.deep}>
          34
        </Txt>
        <Txt x={R - 3.4 * D} y={646} size={58} anchor="middle" weight={900} color={S2.deep}>
          +
        </Txt>
      </Fade>
      <line x1={R - 4.4 * D} y1={676} x2={lerp(R - 4.4 * D, R + 10, step(2.6))} y2={676} stroke={OL} strokeWidth={6} strokeLinecap="round" opacity={step(2.6) > 0 ? 1 : 0} />
      <Pop t={t} at={at(c, 2.7)} x={R} y={760}>
        <g>
          <rect x={-3.6 * D} y={-70} width={3.6 * D + 22} height={92} rx={18} fill={C.green} opacity={0.18} stroke={C.green} strokeWidth={5} />
          <Txt x={0} y={0} size={80} anchor="end" weight={900} color={C.greenDeep}>
            408
          </Txt>
        </g>
      </Pop>
      {/* усилие видно снаружи: зрачки и пульс */}
      <Pop t={t} at={at(c, 3.1)} x={1170} y={360}>
        <g>
          <EyeIcon x={0} y={0} pupil={lerp(17, 42, dil)} />
          {dil > 0.3 &&
            [-1, 1].map((sd) => <Arrow key={sd} x1={sd * 62} y1={-70} x2={sd * 96} y2={-70} k={dil} w={6} color={S2.deep} />)}
          <Txt x={0} y={140} size={34}>
            зрачки шире
          </Txt>
        </g>
      </Pop>
      <Pop t={t} at={at(c, 3.4)} x={1170} y={620}>
        <g>
          <g transform={`scale(${1.9 * (1 + 0.14 * beat)})`}>
            <Heart x={0} y={8} s={1} color={C.red} />
          </g>
          <Txt x={0} y={110} size={34}>
            пульс чаще
          </Txt>
        </g>
      </Pop>
    </g>
  );
};

// ─────────────────────────────── k08: не отделы мозга ───────────────────────────────
const BrainOutline: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -110 C -60 -140 -150 -110 -160 -40 C -200 -10 -190 70 -130 90 C -100 130 -30 125 0 100 Z" fill={S1.light} stroke={OL} strokeWidth={6} />
    <path d="M 0 -110 C 60 -140 150 -110 160 -40 C 200 -10 190 70 130 90 C 100 130 30 125 0 100 Z" fill={S2.light} stroke={OL} strokeWidth={6} />
    <path d="M -110 -50 q 30 10 40 40 M -120 30 q 40 -10 60 20 M -60 -90 q 0 30 -20 50" stroke={S1.deep} strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d="M 110 -50 q -30 10 -40 40 M 120 30 q -40 -10 -60 20 M 60 -90 q 0 30 20 50" stroke={S2.deep} strokeWidth={5} fill="none" strokeLinecap="round" />
    <Txt x={-85} y={10} size={40} weight={900} color={S1.deep}>
      С1
    </Txt>
    <Txt x={85} y={10} size={40} weight={900} color={S2.deep}>
      С2
    </Txt>
  </g>
);

const Curtain: React.FC<{ x: number; side: 1 | -1; k: number }> = ({ x, side, k }) => {
  if (k <= 0) return null;
  const w = 120;
  const off = (1 - k) * 200 * -side;
  return (
    <g transform={`translate(${off} 0)`} opacity={clamp01(k * 1.5)}>
      <path d={`M ${x} 90 L ${x + side * w} 90 Q ${x + side * (w - 30)} 480 ${x + side * (w + 10)} 870 L ${x} 870 Z`} fill="#c8414b" stroke={OL} strokeWidth={5} />
      {[0.3, 0.6].map((q, i) => (
        <path key={i} d={`M ${x + side * w * q} 100 Q ${x + side * (w * q - 14)} 480 ${x + side * w * q} 860`} stroke="#9c2b35" strokeWidth={6} fill="none" />
      ))}
    </g>
  );
};

const TASKS = ["лица", "речь", "дорога", "2 + 2", "чувства", "привычки"];

export const NotBrain: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const brainK = pop(t, at(c, 0.12)) * (1 - ramp(t, at(c, 0.55), 0.5));
  const crossK = ramp(t, at(c, 0.38), 0.6);
  const stage = ramp(t, at(c, 0.6), 0.9);
  const crownK = vis(t, at(c, 1), at(c, 1.4), 0.4);
  const okK = pop(t, at(c, 1.7));
  const nod = okK > 0 ? Math.sin(t * 5) * 3 : 0;
  const lightK = stage * (0.75 + 0.1 * Math.sin(t * 1.3));
  return (
    <g>
      {/* театральная сцена */}
      <Fade o={stage}>
        <rect x={40} y={800} width={1840} height={70} fill="#d79b5c" stroke={OL} strokeWidth={5} opacity={0.85} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={i} x1={40 + i * 230} y1={800} x2={40 + i * 230} y2={870} stroke="#a8713b" strokeWidth={4} />
        ))}
        {[470, 1450].map((x, i) => (
          <polygon key={i} points={`${x - 30},100 ${x + 30},100 ${x + 230},810 ${x - 230},810`} fill={C.yellow} opacity={0.22 * lightK} />
        ))}
      </Fade>
      <Curtain x={40} side={1} k={stage} />
      <Curtain x={1880} side={-1} k={stage} />
      {stage > 0 && (
        <g opacity={stage}>
          <rect x={40} y={86} width={1840} height={50} fill="#a8323c" stroke={OL} strokeWidth={5} />
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M ${40 + i * 115} 136 q 57 46 115 0`} fill="#a8323c" stroke={OL} strokeWidth={4} />
          ))}
        </g>
      )}
      {/* мозг с «отделами» — зачёркнут */}
      <Fade o={brainK}>
        <g transform={`translate(0 ${wob(t, 1, 3)})`}>
          <BrainOutline x={470} y={340} s={0.9} />
          <Cross x={470} y={340} s={260} k={crossK} />
          <Fade o={ramp(t, at(c, 0.42), 0.4)}>
            <Tag x={1450} y={380} text="не отделы мозга" size={40} color={C.coral} textColor="#fff" />
          </Fade>
        </g>
      </Fade>
      {/* персонажи-актёры */}
      <Pop t={t} at={at(c, 0.05)} x={0} y={0}>
        <g>
          <SystemOne x={470} y={800} s={0.9} t={t} mood={t > at(c, 1.45) ? "think" : "happy"} run={t > at(c, 1.45) ? 0.3 : 0} />
        </g>
      </Pop>
      <Pop t={t} at={at(c, 0.2)} x={0} y={0}>
        <g>
          {okK > 0 && (
            <g>
              <rect x={1350} y={600} width={200} height={190} rx={30} fill="#7c5a3a" stroke={OL} strokeWidth={5} />
              <rect x={1330} y={720} width={240} height={50} rx={18} fill="#9c7350" stroke={OL} strokeWidth={5} />
            </g>
          )}
          <g transform={`rotate(${nod} 1450 800)`}>
            <SystemTwo x={1450} y={800} s={0.9} t={t} mood={okK > 0 ? "sleepy" : "think"} />
          </g>
        </g>
      </Pop>
      {/* корона «главный герой?» над Системой 2 */}
      <Fade o={crownK}>
        <g transform={`translate(1450 ${495 + wob(t, 2, 4)})`}>
          <path d="M -60 20 L -60 -30 L -30 0 L 0 -40 L 30 0 L 60 -30 L 60 20 Z" fill={C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <Txt x={95} y={0} size={60} weight={900} color={C.red}>
            ?
          </Txt>
        </g>
      </Fade>
      {/* надписи сверху */}
      <Pop t={t} at={at(c, 0.7)} x={960} y={230}>
        <g opacity={1 - ramp(t, at(c, 1), 0.35)}>
          <Tag x={0} y={0} text="полезные персонажи" size={44} color={C.yellow} />
        </g>
      </Pop>
      <MetaphorNote x={470} y={420} k={ramp(t, at(c, 0.8), 0.6) * (1 - ramp(t, at(c, 1), 0.35))} />
      <Fade o={crownK}>
        <Tag x={960} y={230} text="кажется: главный — Система 2" size={40} color={S2.light} />
      </Fade>
      <Pop t={t} at={at(c, 1.45)} x={960} y={230}>
        <Tag x={0} y={0} text="на деле больше работает Система 1" size={40} color={S1.light} />
      </Pop>
      {/* гора задач у Системы 1 */}
      {TASKS.map((s, i) => (
        <Pop key={s} t={t} at={at(c, 1.5) + i * 0.18} x={262 + (i % 2 ? 6 : -6)} y={770 - i * 60}>
          <g transform={`rotate(${(i % 3) - 1 + wob(t, i, 1)})`}>
            <rect x={-92} y={-27} width={184} height={54} rx={12} fill="#fff" stroke={S1.deep} strokeWidth={4} />
            <Txt x={0} y={11} size={30} weight={800}>
              {s}
            </Txt>
          </g>
        </Pop>
      ))}
      {/* «ок» от Системы 2 */}
      <Pop t={t} at={at(c, 1.7)} x={1640} y={470}>
        <g>
          <Bubble x={-90} y={-60} w={180} h={100} tail={[-100, 70]} />
          <Txt x={0} y={8} size={48} weight={900} color={S2.deep}>
            ок
          </Txt>
        </g>
      </Pop>
    </g>
  );
};

// ─────────────────────────────── k09: ленивый контролёр ───────────────────────────────
const Armchair: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-150} y={-330} width={300} height={300} rx={60} fill="#d9735f" stroke={OL} strokeWidth={6} />
    <rect x={-180} y={-150} width={70} height={150} rx={30} fill="#c2604d" stroke={OL} strokeWidth={6} />
    <rect x={110} y={-150} width={70} height={150} rx={30} fill="#c2604d" stroke={OL} strokeWidth={6} />
    <rect x={-120} y={-70} width={240} height={60} rx={20} fill="#e88d77" stroke={OL} strokeWidth={6} />
    <path d="M -140 0 L -140 30 M 140 0 L 140 30" stroke={OL} strokeWidth={10} strokeLinecap="round" />
  </g>
);

const Lake: React.FC<{ x: number; y: number; frac: number; id: string; half?: boolean }> = ({ x, y, frac, id, half }) => {
  const rx = 190;
  const ry = 120;
  const pads: { px: number; py: number; o: number }[] = [];
  for (let gy = -ry; gy <= ry; gy += 46) {
    for (let gx = -rx; gx <= rx; gx += 50) {
      const px = gx + ((gy / 46) % 2 ? 25 : 0);
      if ((px / rx) ** 2 + (gy / ry) ** 2 > 1.05) continue;
      // порядок «зарастания»: слева направо
      const o = (px + rx) / (2 * rx);
      pads.push({ px, py: gy, o });
    }
  }
  const lim = half ? 0.5 : 1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={id}>
          <ellipse rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse rx={rx + 14} ry={ry + 12} fill="#bfe3a6" />
      <ellipse rx={rx} ry={ry} fill="#7cc6ee" stroke={OL} strokeWidth={5} />
      <g clipPath={`url(#${id})`}>
        {pads.map((p, i) =>
          p.o <= frac * lim + 0.001 && p.o <= lim ? (
            <g key={i} transform={`translate(${p.px} ${p.py}) rotate(${-30 + ((i * 37) % 60)})`}>
              <circle r={19} fill={C.green} stroke={C.greenDeep} strokeWidth={3} />
              <path d="M 0 0 L 21 -6 L 21 6 Z" fill="#7cc6ee" />
            </g>
          ) : null,
        )}
      </g>
      {half && <line x1={0} y1={-ry - 10} x2={0} y2={ry + 10} stroke={OL} strokeWidth={4} strokeDasharray="12 10" opacity={0.6 * clamp01(frac * 3)} />}
    </g>
  );
};

export const LazyController: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const walkStart = at(c, 1) + 0.2;
  const stopAt = at(c, 1.42);
  const walkK = clamp01((t - walkStart) / Math.max(0.5, stopAt - walkStart));
  const px = lerp(1080, 1400, walkK);
  const walking = t > walkStart && t < stopAt;
  const fly = ramp(t, at(c, 2.25), 0.7);
  const stamp = at(c, 2.55);
  const stampK = ramp(t, stamp, 0.25);
  const lake48 = ramp(t, at(c, 3.25), 1.6);
  const lake47 = ramp(t, at(c, 3.55), 1.2);
  const s2Mood = t > at(c, 2) && t < at(c, 3) ? "sleepy" : "sleepy";
  return (
    <g>
      {/* Система 2 отдыхает в кресле */}
      <Pop t={t} at={0.15} x={0} y={0}>
        <g>
          <Armchair x={760} y={820} />
          <g transform="rotate(-6 760 800)">
            <SystemTwo x={760} y={800} s={0.85} t={t} mood={s2Mood} label={false} />
          </g>
          <NameTag x={760} y={820} s={0.9} two />
          {["z", "z", "Z"].map((z, i) => {
            const k = ((t * 0.5 + i / 3) % 1);
            return (
              <Txt key={i} x={850 + k * 60 + i * 10} y={480 - k * 90} size={30 + i * 8} weight={900} color={S2.deep} opacity={Math.sin(k * Math.PI) * (t > at(c, 3) ? 0.4 : 0.9)}>
                {z}
              </Txt>
            );
          })}
        </g>
      </Pop>
      <Pop t={t} at={at(c, 0.4)} x={1300} y={150}>
        <Tag x={0} y={0} text="закон наименьшего усилия" size={42} color={C.yellow} />
      </Pop>
      {/* батарейка: экономит силы */}
      <Fade o={vis(t, at(c, 0.55), at(c, 1), 0.4)}>
        <g transform={`translate(1350 ${470 + wob(t, 1, 4)})`}>
          <rect x={-150} y={-70} width={280} height={140} rx={24} fill="#fff" stroke={OL} strokeWidth={6} />
          <rect x={130} y={-28} width={26} height={56} rx={8} fill={OL} />
          <rect x={-134} y={-54} width={lerp(240, 90, ramp(t, at(c, 0.6), 1))} height={108} rx={14} fill={C.green} />
          <Txt x={0} y={150} size={40}>
            экономит силы
          </Txt>
        </g>
      </Fade>
      {/* прогулка и 23 × 78 */}
      <Fade o={vis(t, at(c, 1), at(c, 2), 0.4)}>
        <Panel x={1000} y={250} w={840} h={500} fill="#f3fbff" />
        <rect x={1020} y={640} width={800} height={50} rx={20} fill="#cfe8c0" />
        {[0, 1, 2, 3, 4].map((i) => {
          const fx = 1100 + i * 60;
          return fx < px - 40 ? <ellipse key={i} cx={fx} cy={662 + (i % 2) * 14} rx={14} ry={7} fill="#9cbf89" /> : null;
        })}
        <g transform={`translate(0 ${walking ? -Math.abs(Math.sin(t * 9)) * 8 : 0})`}>
          <Person x={px} y={640} s={1.1} color={C.violet} t={0} arms={t > stopAt ? 0.6 : 0} />
        </g>
        <Pop t={t} at={at(c, 1.25)} x={px} y={420}>
          <g>
            <Bubble x={-170} y={-60} w={340} h={100} tail={[-20, 66]} />
            <Txt x={0} y={10} size={46} weight={900}>
              23 × 78 = ?
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={stopAt} x={1660} y={470}>
          <g>
            <polygon points="-50,-20 -20,-50 20,-50 50,-20 50,20 20,50 -20,50 -50,20" fill={C.red} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={10} size={28} weight={900} color="#fff">
              стоп
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 1.6)} x={1420} y={300}>
          <Tag x={0} y={0} text="думать и идти — трудно" size={36} color={S2.light} />
        </Pop>
      </Fade>
      {/* бита и мяч: Система 1 подсовывает «10 ¢» */}
      <Fade o={vis(t, at(c, 2), at(c, 3), 0.4)}>
        <g>
          <SystemOne x={lerp(1950, 1560, ramp(t, at(c, 2), 0.8))} y={800} s={0.8} t={t} run={t < at(c, 2) + 0.8 ? 1 : 0} mood="proud" look={-1} />
        </g>
        {(() => {
          const cx = lerp(1450, 1120, fly);
          const cy = lerp(640, 560, fly) - Math.sin(fly * Math.PI) * 120;
          return (
            <g transform={`translate(${cx} ${cy}) rotate(${lerp(10, -4, fly)})`} opacity={clamp01((t - at(c, 2.2)) * 4)}>
              <Panel x={-170} y={-100} w={340} h={220} fill="#fff" r={24} />
              <Txt x={0} y={-48} size={32} weight={700} color={C.inkSoft}>
                мяч стоит
              </Txt>
              <Txt x={-70} y={36} size={70} weight={900} color={S1.deep}>
                10 ¢
              </Txt>
              {stampK > 0 && (
                <g transform={`translate(70 62) rotate(-10) scale(${lerp(2.2, 1, stampK)})`} opacity={stampK}>
                  <rect x={-92} y={-30} width={184} height={56} rx={10} fill="#fff" fillOpacity={0.7} stroke={C.green} strokeWidth={6} />
                  <Txt x={0} y={10} size={30} weight={900} color={C.green}>
                    ОДОБРЕНО
                  </Txt>
                </g>
              )}
            </g>
          );
        })()}
        {/* печать опускается */}
        {t > stamp - 0.4 && t < stamp + 0.6 && (
          <g transform={`translate(1200 ${lerp(300, 590, ramp(t, stamp - 0.4, 0.4)) - ramp(t, stamp + 0.1, 0.4) * 220})`}>
            <rect x={-22} y={-110} width={44} height={90} rx={18} fill="#8b5a2b" stroke={OL} strokeWidth={4} />
            <rect x={-60} y={-24} width={120} height={30} rx={8} fill={C.green} stroke={OL} strokeWidth={4} />
          </g>
        )}
        <Pop t={t} at={at(c, 2.7)} x={1320} y={300}>
          <Tag x={0} y={0} text="подписала не проверяя" size={38} color={C.coral} textColor="#fff" />
        </Pop>
      </Fade>
      {/* кувшинки */}
      <Fade o={ramp(t, at(c, 3.05), 0.5)}>
        <Txt x={1150} y={300} size={40} weight={900} color={S2.deep}>
          день 47
        </Txt>
        <Txt x={1600} y={300} size={40} weight={900} color={C.greenDeep}>
          день 48
        </Txt>
        <Lake x={1150} y={470} frac={lake47} id="sys-lake47" half />
        <Lake x={1600} y={470} frac={lake48} id="sys-lake48" />
        <Arrow x1={1250} y1={340} x2={1500} y2={340} k={ramp(t, at(c, 3.6), 0.5)} bend={-0.25} w={7} color={C.inkSoft} />
        <Fade o={ramp(t, at(c, 3.65), 0.4)}>
          <Txt x={1375} y={268} size={36} weight={900} color={C.red}>
            ×2
          </Txt>
        </Fade>
        <Txt x={1150} y={640} size={34} weight={800} opacity={ramp(t, at(c, 3.6), 0.4)}>
          половина
        </Txt>
        <Txt x={1600} y={640} size={34} weight={800} opacity={ramp(t, at(c, 3.35), 0.4)}>
          всё озеро
        </Txt>
      </Fade>
      <Pop t={t} at={at(c, 3.72)} x={1150} y={745}>
        <g>
          <Tag x={0} y={0} text="24 — первая мысль" size={34} color="#f4d6d6" />
          <line x1={-170} y1={-8} x2={lerp(-170, -112, ramp(t, at(c, 3.78), 0.3))} y2={-8} stroke={C.red} strokeWidth={7} strokeLinecap="round" />
        </g>
      </Pop>
      <Pop t={t} at={at(c, 3.84)} x={1610} y={745}>
        <g>
          <Tag x={0} y={0} text="47 — верно!" size={40} color={C.green} textColor="#fff" />
          <Check x={170} y={-14} s={40} k={ramp(t, at(c, 3.9), 0.4)} color={C.greenDeep} />
        </g>
      </Pop>
    </g>
  );
};

// ─────────────────────────────── k10: Мюллер-Лайер ───────────────────────────────
export const MullerLyer: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x0 = 370;
  const x1 = 990;
  const yT = 320;
  const yB = 560;
  const F = 80;
  const drawT = ramp(t, 0.2, 0.8);
  const drawB = ramp(t, 0.6, 0.8);
  const finT = ramp(t, 1.0, 0.5);
  const finB = ramp(t, 1.3, 0.5);
  const rulerIn = ramp(t, at(c, 1.05), 0.7);
  const rulerOut = ramp(t, at(c, 1.55), 0.7);
  const rulerX = rulerOut > 0 ? lerp(0, -1300, rulerOut) : lerp(-1300, 0, rulerIn);
  const guides = vis(t, at(c, 1.2), at(c, 1.6), 0.4);
  const line = (y: number, k: number) => <line x1={x0} y1={y} x2={lerp(x0, x1, k)} y2={y} stroke={OL} strokeWidth={14} strokeLinecap="round" />;
  const fin = (x: number, y: number, dir: number, k: number, color: string) =>
    k > 0 && (
      <path d={`M ${x + dir * F * k} ${y - F * k} L ${x} ${y} L ${x + dir * F * k} ${y + F * k}`} stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    );
  const glow = t > at(c, 1.7) ? 0.5 + 0.5 * Math.sin(t * 3) : 0;
  return (
    <g>
      <Panel x={160} y={200} w={1040} h={480} fill="#fff" />
      {/* верхняя: стрелки внутрь */}
      {line(yT, drawT)}
      {fin(x0, yT, 1, finT, S2.deep)}
      {fin(x1, yT, -1, finT, S2.deep)}
      {/* нижняя: «хвосты» наружу */}
      {glow > 0 && <line x1={x0 - 60} y1={yB} x2={x1 + 60} y2={yB} stroke={C.yellow} strokeWidth={40} strokeLinecap="round" opacity={0.35 * glow} />}
      {line(yB, drawB)}
      {fin(x0, yB, -1, finB, S1.deep)}
      {fin(x1, yB, 1, finB, S1.deep)}
      {/* пунктирные направляющие */}
      <Fade o={guides}>
        {[x0, x1].map((x) => (
          <line key={x} x1={x} y1={235} x2={x} y2={650} stroke={C.red} strokeWidth={5} strokeDasharray="16 12" />
        ))}
      </Fade>
      {/* линейка */}
      {rulerIn > 0 && rulerOut < 1 && (
        <g transform={`translate(${rulerX} 0)`}>
          <rect x={x0 - 50} y={410} width={x1 - x0 + 100} height={80} rx={10} fill="#ffe08a" stroke={OL} strokeWidth={5} />
          {Array.from({ length: 32 }, (_, i) => {
            const xx = x0 + i * 20;
            if (xx > x1 + 1) return null;
            return <line key={i} x1={xx} y1={410} x2={xx} y2={i % 5 === 0 ? 450 : 432} stroke={OL} strokeWidth={4} />;
          })}
          <Txt x={(x0 + x1) / 2} y={478} size={30} weight={900} color={C.inkSoft}>
            одинаковые
          </Txt>
        </g>
      )}
      {/* подписи */}
      <Pop t={t} at={at(c, 0.55)} x={680} y={130}>
        <g opacity={1 - ramp(t, at(c, 1.25), 0.3)}>
          <Tag x={0} y={0} text="нижняя длиннее?" size={44} color={C.yellow} />
        </g>
      </Pop>
      <Pop t={t} at={at(c, 1.3)} x={680} y={130}>
        <g opacity={1 - ramp(t, at(c, 1.65), 0.3)}>
          <Tag x={0} y={0} text="равны!" size={44} color={C.green} textColor="#fff" />
        </g>
      </Pop>
      <Pop t={t} at={at(c, 1.7)} x={680} y={130}>
        <Tag x={0} y={0} text="а всё равно кажется длиннее!" size={42} color={C.coral} textColor="#fff" />
      </Pop>
      {/* вывод */}
      <Pop t={t} at={at(c, 2.3)} x={680} y={790}>
        <g>
          <Panel x={-470} y={-80} w={940} h={160} fill="#fff7e0" stroke={C.yellowDeep} />
          <g transform="translate(-390 0)">
            <polygon points="0,-50 50,40 -50,40" fill={C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
            <Txt x={0} y={30} size={56} weight={900}>
              !
            </Txt>
          </g>
          <Txt x={50} y={-12} size={42} weight={900}>
            {"интуицию не выключить —\nможно узнавать ловушки"}
          </Txt>
        </g>
      </Pop>
    </g>
  );
};

// ─────────────────────────────── k10g: невидимая горилла ───────────────────────────────
const GorillaShape: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const step = Math.sin(t * 6);
  const G = "#2b2b30";
  return (
    <g transform={`translate(${x} ${y - Math.abs(step) * 6}) scale(${s})`}>
      <path d={`M -30 -60 L ${-38 + step * 12} 0 M 30 -60 L ${38 - step * 12} 0`} stroke={G} strokeWidth={34} strokeLinecap="round" />
      <ellipse cx={0} cy={-120} rx={70} ry={80} fill={G} />
      <path d={`M -55 -160 Q -110 -100 ${-90 - step * 10} -30 M 55 -160 Q 110 -100 ${90 + step * 10} -30`} stroke={G} strokeWidth={34} strokeLinecap="round" fill="none" />
      <circle cx={0} cy={-215} r={46} fill={G} />
      <ellipse cx={0} cy={-205} rx={28} ry={22} fill="#5a5560" />
      <circle cx={-12} cy={-220} r={5} fill="#fff" />
      <circle cx={12} cy={-220} r={5} fill="#fff" />
      <ellipse cx={0} cy={-118} rx={36} ry={44} fill="#4a4550" />
    </g>
  );
};

export const Gorilla: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const court = pop(t, 0.1);
  const P = 1.05;
  const passStart = at(c, 0.35);
  const whites: [number, number][] = [
    [780, 360],
    [1010, 560],
    [1250, 350],
  ];
  const blacks: [number, number][] = [
    [900, 540],
    [1130, 300],
    [1330, 560],
  ];
  const drift = (i: number) => [Math.sin(t * 1.3 + i * 2) * 26, Math.cos(t * 1.1 + i) * 14];
  const wp = whites.map(([x, y], i) => [x + drift(i)[0], y + drift(i)[1]]);
  const bp = blacks.map(([x, y], i) => [x + drift(i + 5)[0], y + drift(i + 5)[1]]);
  const n = t > passStart ? Math.floor((t - passStart) / P) : -1;
  const frac = t > passStart ? ((t - passStart) % P) / P : 0;
  const a = wp[((n % 3) + 3) % 3];
  const b = wp[(((n + 1) % 3) + 3) % 3];
  const bf = clamp01(frac / 0.55);
  const bx = lerp(a[0], b[0], bf);
  const by = lerp(a[1] - 70, b[1] - 70, bf) - Math.sin(bf * Math.PI) * 50;
  const tally = Math.max(0, Math.min(20, n));
  const gA = at(c, 1.05);
  const gB = at(c, 1.85);
  const gK = clamp01((t - gA) / Math.max(1, gB - gA));
  const gx = lerp(1540, 520, gK);
  const blind = ramp(t, at(c, 2.05), 0.6);
  return (
    <g>
      <defs>
        <clipPath id="sys-court">
          <rect x={600} y={150} width={860} height={520} rx={30} />
        </clipPath>
      </defs>
      <g transform={`translate(1030 410) scale(${0.7 + 0.3 * court}) translate(-1030 -410)`} opacity={clamp01(court * 1.5)}>
        <Panel x={600} y={150} w={860} h={520} fill="#e8b87e" r={30} />
        <g clipPath="url(#sys-court)">
          <g stroke="#fff" strokeWidth={6} fill="none" opacity={0.9}>
            <rect x={630} y={180} width={800} height={460} rx={8} />
            <line x1={1030} y1={180} x2={1030} y2={640} />
            <circle cx={1030} cy={410} r={70} />
          </g>
          {bp.map(([x, y], i) => (
            <Person key={`b${i}`} x={x} y={y} s={0.62} color="#2f2f36" t={t} arms={0.3} />
          ))}
          {wp.map(([x, y], i) => (
            <Person key={`w${i}`} x={x} y={y} s={0.62} color="#ffffff" t={t} arms={0.5} />
          ))}
          {gK > 0 && gK < 1 && <GorillaShape x={gx} y={600} s={0.95} t={t} />}
          {n >= 0 && <circle cx={bx} cy={by} r={15} fill="#e0752d" stroke={OL} strokeWidth={4} />}
          {blind > 0 && <rect x={600} y={150} width={860} height={520} fill="#fff" opacity={0.55 * blind} />}
        </g>
      </g>
      <Pop t={t} at={at(c, 0.6)} x={1030} y={745}>
        <g opacity={1 - ramp(t, at(c, 2), 0.4)}>
          <Tag x={0} y={0} text="считаем передачи белых" size={36} color="#fff" />
        </g>
      </Pop>
      {/* пометки-черточки, а не таймер */}
      <Pop t={t} at={at(c, 0.4)} x={1680} y={250}>
        <g>
          <Panel x={-170} y={-100} w={340} h={200} fill="#fff" r={28} />
          <Txt x={0} y={-45} size={32} weight={800} color={C.inkSoft}>
            передачи
          </Txt>
          {Array.from({ length: tally }, (_, i) => {
            const g = Math.floor(i / 5);
            const j = i % 5;
            const gx0 = -135 + g * 70;
            if (j === 4) return <line key={i} x1={gx0 - 6} y1={50} x2={gx0 + 54} y2={0} stroke={OL} strokeWidth={6} strokeLinecap="round" />;
            return <line key={i} x1={gx0 + j * 14} y1={0} x2={gx0 + j * 14} y2={56} stroke={OL} strokeWidth={6} strokeLinecap="round" />;
          })}
        </g>
      </Pop>
      {/* половина не заметила */}
      <Pop t={t} at={at(c, 1.55)} x={1680} y={510}>
        <g>
          <Panel x={-170} y={-120} w={340} h={250} fill="#fff" r={28} />
          {Array.from({ length: 10 }, (_, i) => (
            <Dot key={i} x={-120 + (i % 5) * 60} y={-60 + Math.floor(i / 5) * 70} r={18} color={i < 5 ? C.skyDeep : "#c4c8d0"} k={ramp(t, at(c, 1.6) + i * 0.05, 0.3)} />
          ))}
          <Txt x={0} y={66} size={32} weight={900}>
            {"≈ половина\nне заметила"}
          </Txt>
        </g>
      </Pop>
      {/* слепы к собственной слепоте */}
      <Pop t={t} at={at(c, 2.45)} x={1030} y={410}>
        <g>
          <Panel x={-400} y={-115} w={800} h={220} fill="#fff" stroke={S2.deep} />
          <Head x={0} y={-12} size={52}>
            {"слепы к собственной\nслепоте"}
          </Head>
        </g>
      </Pop>
      <Pop t={t} at={at(c, 2.05)} x={790} y={830}>
        <Person x={0} y={0} s={0.85} color={C.skyDeep} t={t} arms={0.6} />
      </Pop>
      <Pop t={t} at={at(c, 2.1)} x={1080} y={740}>
        <g>
          <Bubble x={-200} y={-50} w={400} h={90} tail={[-250, 20]} />
          <Txt x={0} y={10} size={36} weight={900} color={C.red}>
            «гориллы не было!»
          </Txt>
        </g>
      </Pop>
    </g>
  );
};

// ─────────────────────────────── k11: когнитивная лёгкость ───────────────────────────────
const Gauge: React.FC<{ x: number; y: number; r: number; v: number }> = ({ x, y, r, v }) => {
  const segs = 24;
  const col = (k: number) => {
    // зелёный → жёлтый → красный
    const a = [63, 182, 124];
    const b = [255, 210, 63];
    const d = [229, 72, 77];
    const m = k < 0.5 ? a.map((q, i) => lerp(q, b[i], k * 2)) : b.map((q, i) => lerp(q, d[i], (k - 0.5) * 2));
    return `rgb(${m.map(Math.round).join(",")})`;
  };
  const ang = Math.PI * (1 - v);
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: segs }, (_, i) => {
        const a0 = Math.PI * (1 - i / segs);
        const a1 = Math.PI * (1 - (i + 1) / segs) - 0.01;
        const R0 = r;
        const R1 = r - 60;
        return (
          <path
            key={i}
            d={`M ${Math.cos(a0) * R0} ${-Math.sin(a0) * R0} A ${R0} ${R0} 0 0 1 ${Math.cos(a1) * R0} ${-Math.sin(a1) * R0} L ${Math.cos(a1) * R1} ${-Math.sin(a1) * R1} A ${R1} ${R1} 0 0 0 ${Math.cos(a0) * R1} ${-Math.sin(a0) * R1} Z`}
            fill={col(i / (segs - 1))}
          />
        );
      })}
      <path d={`M ${-r - 8} 0 A ${r + 8} ${r + 8} 0 0 1 ${r + 8} 0`} fill="none" stroke={OL} strokeWidth={6} />
      <line x1={0} y1={0} x2={Math.cos(ang) * (r - 30)} y2={-Math.sin(ang) * (r - 30)} stroke={OL} strokeWidth={12} strokeLinecap="round" />
      <circle r={22} fill={OL} />
      <Txt x={-r + 30} y={60} size={36} weight={900} color={C.greenDeep}>
        лёгкость
      </Txt>
      <Txt x={r - 40} y={60} size={36} weight={900} color={C.red}>
        напряжение
      </Txt>
    </g>
  );
};

export const CognitiveEase: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const endAll = at(c, 3);
  const gaugeK = pop(t, 0.15) * (1 - ramp(t, endAll, 0.5));
  const v = lerp(0.45 + Math.sin(t * 1.4) * 0.06, 0.12 + Math.sin(t * 1.4) * 0.03, ramp(t, at(c, 1.3), 1.2));
  const dim = 1 - 0.65 * ramp(t, at(c, 2.05), 0.5);
  const l1 = 1 - ramp(t, endAll, 0.5);
  const blurK = ramp(t, at(c, 1.55), 0.6);
  return (
    <g>
      <defs>
        <filter id="sys-blur" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation={5} />
        </filter>
      </defs>
      <Fade o={gaugeK}>
        <Gauge x={880} y={560} r={230} v={v} />
      </Fade>
      <Pop t={t} at={at(c, 0.4)} x={880} y={200}>
        <g opacity={1 - ramp(t, endAll, 0.5)}>
          <Tag x={0} y={0} text="когнитивная лёгкость" size={42} color={C.yellow} />
        </g>
      </Pop>
      {/* Система 1 проверяет */}
      <Fade o={vis(t, at(c, 0.3), at(c, 1), 0.4)}>
        <SystemOne x={1560} y={790} s={0.75} t={t} mood="think" look={-1} />
        <Bubble x={1360} y={360} w={400} h={110} tail={[1520, 560]} />
        <Txt x={1560} y={430} size={38} weight={900}>
          всё привычно?
        </Txt>
      </Fade>
      {/* повторение */}
      <Fade o={l1 * dim}>
        <Pop t={t} at={at(c, 1.02)} x={1500} y={185}>
          <Tag x={0} y={0} text="повторение" size={38} color={S1.light} />
        </Pop>
        {[0, 1, 2, 3].map((i) => (
          <Pop key={i} t={t} at={at(c, 1.06) + i * 0.25} x={1480 + i * 14} y={270 + i * 16}>
            <g>
              <rect x={-170} y={-40} width={340} height={80} rx={18} fill="#fff" stroke={C.inkSoft} strokeWidth={4} />
              <Txt x={0} y={11} size={32} weight={800}>
                «та же фраза»
              </Txt>
            </g>
          </Pop>
        ))}
        <Arrow x1={1500} y1={350} x2={1500} y2={420} k={ramp(t, at(c, 1.3), 0.4)} w={8} />
        <Pop t={t} at={at(c, 1.35)} x={1500} y={470}>
          <Tag x={0} y={0} text="кажется правдой" size={36} color={C.green} textColor="#fff" />
        </Pop>
        {/* чёткий и размытый шрифт */}
        <Pop t={t} at={at(c, 1.55)} x={1390} y={630}>
          <g>
            <Panel x={-150} y={-70} w={300} h={140} fill="#fff" r={24} />
            <Txt x={0} y={22} size={64} weight={900}>
              Факт
            </Txt>
            <Txt x={0} y={118} size={30} weight={800} color={C.greenDeep}>
              верим
            </Txt>
          </g>
        </Pop>
        <Pop t={t} at={at(c, 1.65)} x={1720} y={630}>
          <g>
            <Panel x={-150} y={-70} w={300} h={140} fill="#fff" r={24} />
            <g filter={blurK > 0.2 ? "url(#sys-blur)" : undefined} opacity={0.75}>
              <Txt x={0} y={22} size={64} weight={300} color="#7a8296">
                Факт
              </Txt>
            </g>
            <Txt x={0} y={118} size={30} weight={800} color={C.red}>
              сомневаемся
            </Txt>
          </g>
        </Pop>
      </Fade>
      {/* ощущение ≠ доказательство */}
      <Pop t={t} at={at(c, 2.15)} x={1530} y={470}>
        <g opacity={1 - ramp(t, endAll, 0.5)}>
          <Panel x={-330} y={-80} w={660} h={140} fill="#fff" stroke={C.red} />
          <Head x={0} y={6} size={42}>
            ощущение ≠ доказательство
          </Head>
        </g>
      </Pop>
      {/* прайминг: не подтвердилось */}
      <Fade o={ramp(t, at(c, 3.05), 0.6)}>
        <Tag x={1180} y={180} text="опыты о прайминге" size={40} color={S2.light} />
        {[0, 1, 2, 3, 4].map((i) => {
          const px = 940 + i * 120;
          const py = 470 + (i % 2) * 30;
          const crossK = ramp(t, at(c, 3.2 + 0.6 * ((px - 900) / 540)) + 0.15, 0.4);
          return (
            <g key={i} transform={`translate(${px} ${py}) rotate(${(i - 2) * 4})`}>
              <rect x={-80} y={-110} width={160} height={220} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
              {[0, 1, 2, 3, 4].map((j) => (
                <line key={j} x1={-55} y1={-70 + j * 32} x2={j === 0 ? 30 : 55 - ((i + j) % 3) * 15} y2={-70 + j * 32} stroke={j === 0 ? S2.deep : "#b6bccb"} strokeWidth={j === 0 ? 10 : 7} strokeLinecap="round" />
              ))}
              <Cross x={0} y={10} s={90} k={crossK} />
            </g>
          );
        })}
        {(() => {
          const mk = ramp(t, at(c, 3.2), Math.max(1, at(c, 3.8) - at(c, 3.2)));
          const mx = lerp(900, 1440, mk);
          return (
            <g transform={`translate(${mx} ${400 + Math.sin(mk * Math.PI * 3) * 30})`}>
              <circle r={70} fill="#dff3ff" opacity={0.5} stroke={OL} strokeWidth={10} />
              <line x1={50} y1={50} x2={120} y2={120} stroke={OL} strokeWidth={20} strokeLinecap="round" />
            </g>
          );
        })()}
        <Pop t={t} at={at(c, 3.5)} x={1180} y={730}>
          <Tag x={0} y={0} text="не подтвердилось при повторе" size={40} color={C.red} textColor="#fff" />
        </Pop>
      </Fade>
    </g>
  );
};

// ─────────────────────────────── k12: что вижу, то и есть ───────────────────────────────
const TRAITS = ["умный", "трудолюбивый", "импульсивный", "критичный", "упрямый", "завистливый"];

const Piece: React.FC<{ x: number; y: number; w: number; h: number; fill: string; dashed?: boolean; o?: number }> = ({ x, y, w, h, fill, dashed, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <path
      d={`M ${-w / 2} ${-h / 2} L ${w / 2} ${-h / 2} L ${w / 2} ${-18} a 18 18 0 1 1 0 36 L ${w / 2} ${h / 2} L ${-w / 2} ${h / 2} Z`}
      fill={dashed ? "none" : fill}
      stroke={dashed ? C.inkSoft : OL}
      strokeWidth={5}
      strokeDasharray={dashed ? "14 10" : undefined}
    />
    {dashed && (
      <Txt x={0} y={18} size={52} weight={900} color={C.inkSoft}>
        ?
      </Txt>
    )}
  </g>
);

export const Wysiati: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cardsK = 1 - ramp(t, at(c, 2), 0.5);
  const tint = ramp(t, at(c, 1.15), 0.8);
  const puzzleK = vis(t, at(c, 2.05), at(c, 4), 0.5);
  const conf = ramp(t, at(c, 3.15), 1.4);
  const card = (cx: number, name: string, words: string[], warm: boolean, b0: number) => {
    const fill = warm ? `rgb(255,${Math.round(lerp(255, 238, tint))},${Math.round(lerp(255, 200, tint))})` : `rgb(${Math.round(lerp(255, 218, tint))},${Math.round(lerp(255, 230, tint))},${Math.round(lerp(255, 246, tint))})`;
    return (
      <Pop t={t} at={at(c, b0)} x={cx} y={480}>
        <g>
          <Panel x={-250} y={-300} w={500} h={600} fill={fill} stroke={tint > 0.3 ? (warm ? C.yellowDeep : S2.main) : undefined} />
          <Head x={0} y={-215} size={52} color={warm ? "#a0600a" : S2.deep}>
            {name}
          </Head>
          {words.map((w, i) => {
            const k = ramp(t, at(c, b0 + 0.05 + i * 0.06), 0.3);
            const first = i === 0;
            const glow = first ? tint : 0;
            return (
              <g key={w} opacity={k} transform={`translate(${(1 - k) * 30} 0)`}>
                {glow > 0 && <rect x={-150} y={-140 + i * 72} width={300} height={56} rx={28} fill={warm ? C.yellow : "#9cc0f0"} opacity={glow * (0.75 + 0.2 * Math.sin(t * 3))} />}
                <Txt x={0} y={-100 + i * 72} size={38} weight={first ? 900 : 700} color={tint > 0.5 && !first ? (warm ? "#7a5520" : "#3d5878") : C.ink}>
                  {w}
                </Txt>
              </g>
            );
          })}
        </g>
      </Pop>
    );
  };
  // кусочки пазла: 3×2, два «невидимы»
  const PW = 210;
  const PH = 170;
  const pieces = [0, 1, 2, 3, 4, 5].map((i) => ({ col: i % 3, row: Math.floor(i / 3), missing: i === 2 || i === 4 }));
  const pcols = ["#ffb35c", "#7cc6ee", "", "#8ad27c", "", "#ff8fa3"];
  const examK = ramp(t, at(c, 4.05), 0.5);
  return (
    <g>
      <Fade o={cardsK}>
        {card(380, "Алан", TRAITS, true, 0.05)}
        {card(960, "Бен", [...TRAITS].reverse(), false, 0.5)}
        {/* ореол */}
        <Fade o={tint}>
          <ellipse cx={380} cy={160} rx={110} ry={26} fill="none" stroke={C.yellow} strokeWidth={14} opacity={0.85 + 0.15 * Math.sin(t * 3)} transform={`translate(0 ${wob(t, 3, 4)})`} />
          <g transform={`translate(560 230) scale(${1.4 + 0.1 * Math.sin(t * 4)})`}>
            <Heart x={0} y={0} color={C.red} />
          </g>
        </Fade>
        <Pop t={t} at={at(c, 1.5)} x={670} y={840}>
          <Tag x={0} y={0} text="эффект ореола" size={42} color={C.yellow} />
        </Pop>
      </Fade>
      {/* что вижу, то и есть */}
      <Fade o={puzzleK}>
        {pieces.map((p, i) => {
          const tx = 300 + p.col * PW;
          const ty = 370 + p.row * PH;
          if (p.missing) return <Piece key={i} x={tx} y={ty} w={PW - 10} h={PH - 10} fill="" dashed o={0.25 + 0.1 * Math.sin(t * 2 + i)} />;
          const k = ramp(t, at(c, 2.2 + i * 0.08), 0.6);
          const sx = tx + [-260, 220, 0, -300, 0, 320][i];
          const sy = ty + [-40, -60, 0, 80, 0, 60][i];
          return <Piece key={i} x={lerp(sx, tx, k)} y={lerp(sy, ty, k)} w={PW - 10} h={PH - 10} fill={pcols[i]} o={k} />;
        })}
        <Tag x={560} y={170} text="что вижу, то и есть" size={44} color={C.yellow} />
        <Pop t={t} at={at(c, 2.75)} x={510} y={690}>
          <Tag x={0} y={0} text="связная история ✓" size={38} color={C.green} textColor="#fff" />
        </Pop>
        <SystemOne x={950} y={800} s={0.6} t={t} mood="proud" look={-1} />
        {/* уверенность растёт */}
        <Fade o={ramp(t, at(c, 3.05), 0.5)}>
          <Txt x={1150} y={240} size={34} weight={900}>
            уверенность
          </Txt>
          <rect x={1100} y={280} width={100} height={420} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
          <rect x={1108} y={288 + 404 * (1 - 0.92 * conf)} width={84} height={404 * 0.92 * conf} rx={14} fill={C.green} />
          <Txt x={1150} y={750} size={32} weight={800} color={C.inkSoft}>
            фактов мало
          </Txt>
        </Fade>
      </Fade>
      {/* экзамены по одному вопросу и стикеры */}
      <Fade o={examK}>
        <Tag x={500} y={180} text="один вопрос у всех подряд" size={38} color={S2.light} />
        {[0, 1, 2, 3].map((i) => {
          const x = 200 + i * 200;
          return (
            <g key={i} transform={`translate(${x} 450)`}>
              <rect x={-82} y={-160} width={164} height={300} rx={12} fill="#fff" stroke={OL} strokeWidth={4} />
              <circle cx={0} cy={-120} r={18} fill="#d6dbe6" />
              {[0, 1, 2].map((r) => {
                const k = ramp(t, at(c, 4.2 + r * 0.22) + i * 0.15, 0.3);
                return (
                  <g key={r}>
                    <Txt x={-40} y={-50 + r * 75} size={30} weight={800} color={C.inkSoft}>
                      {`в${r + 1}`}
                    </Txt>
                    <line x1={-10} y1={-60 + r * 75} x2={56} y2={-60 + r * 75} stroke="#c4c9d6" strokeWidth={6} strokeLinecap="round" />
                    <Check x={30} y={-40 + r * 75} s={30} k={k} />
                  </g>
                );
              })}
            </g>
          );
        })}
        {[0, 1, 2].map((r) => {
          const a0 = at(c, 4.2 + r * 0.22);
          const k = clamp01((t - a0) / 0.75);
          return k > 0 && k < 1 ? <rect key={r} x={110 + k * 600} y={-80 + r * 75 + 450} width={170} height={56} rx={16} fill={C.yellow} opacity={0.35} /> : null;
        })}
        <Arrow x1={160} y1={650} x2={840} y2={650} k={ramp(t, at(c, 4.2), 0.6)} w={8} color={S2.deep} />
        <Pop t={t} at={at(c, 4.6)} x={1150} y={450}>
          <g transform={`rotate(${-4 + wob(t, 1, 1)})`}>
            <rect x={-150} y={-120} width={300} height={260} fill="#ffb3c1" transform="rotate(8) translate(16 10)" />
            <rect x={-150} y={-120} width={300} height={260} fill="#a8e6c1" transform="rotate(-6) translate(-10 12)" />
            <rect x={-160} y={-130} width={320} height={270} fill={C.yellow} stroke={OL} strokeWidth={3} />
            <rect x={-50} y={-146} width={100} height={30} fill="#fff" opacity={0.7} />
            <Txt x={0} y={-48} size={38} weight={900}>
              {"запишите\nмнение\nдо обсуждения"}
            </Txt>
          </g>
        </Pop>
      </Fade>
    </g>
  );
};

// ─────────────────────────────── k13: подмена вопроса ───────────────────────────────
const QCard: React.FC<{ x: number; y: number; s: number; hard: boolean; body: string; o?: number; dim?: number }> = ({ x, y, s, hard, body, o = 1, dim = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <Panel x={-320} y={-140} w={640} h={280} fill={hard ? "#3a4766" : "#fff6d0"} stroke={hard ? undefined : C.yellowDeep} />
    <Txt x={0} y={-80} size={30} weight={900} color={hard ? C.yellow : C.yellowDeep}>
      {hard ? "ТРУДНЫЙ ВОПРОС" : "ЛЁГКИЙ ВОПРОС"}
    </Txt>
    <Txt x={0} y={-6} size={48} weight={900} color={hard ? "#fff" : C.ink}>
      {body}
    </Txt>
    {dim > 0 && <rect x={-320} y={-140} width={640} height={280} rx={36} fill="#fff" opacity={dim * 0.45} />}
  </g>
);

const Link: React.FC<{ x: number; y: number; broken?: boolean; k: number }> = ({ x, y, broken, k }) => {
  if (k <= 0) return null;
  const gap = broken ? 26 * k : 0;
  const color = broken ? "#9aa1b0" : C.greenDeep;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * k})`} opacity={clamp01(k * 1.5)}>
      <rect x={-70 - gap} y={-22} width={80} height={44} rx={22} fill="none" stroke={color} strokeWidth={broken ? 8 : 14} />
      <rect x={-10 + gap} y={-22} width={80} height={44} rx={22} fill="none" stroke={color} strokeWidth={broken ? 8 : 14} />
      {broken && <path d="M -4 -40 L 4 -20 M 4 20 L -4 40" stroke={C.red} strokeWidth={6} strokeLinecap="round" />}
    </g>
  );
};

export const Substitution: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const swap0 = ramp(t, at(c, 0.55), 0.8);
  const reset = ramp(t, at(c, 1), 0.5);
  const swap1 = ramp(t, at(c, 1.42), 0.8);
  const s = swap0 * (1 - reset) + swap1;
  const concrete = t > at(c, 1) + 0.25;
  const cardsK = pop(t, 0.15) * (1 - ramp(t, at(c, 2), 0.5));
  const F: [number, number] = [1260, 520];
  const B: [number, number] = [1610, 235];
  const Hd: [number, number] = [870, 640];
  const hardBody = concrete ? "Насколько я\nсчастлив?" : "сложно\nоценить";
  const easyBody = concrete ? "Какое настроение\nсейчас?" : "легко\nответить";
  const sneaky = s > 0.02 && s < 0.98;
  return (
    <g>
      <Fade o={cardsK}>
        {/* жёсткая карточка уходит назад, лёгкая выходит из руки Системы 1 */}
        <QCard x={lerp(F[0], B[0], s)} y={lerp(F[1], B[1], s)} s={lerp(1, 0.7, s)} hard body={hardBody} dim={s} />
        <QCard x={lerp(Hd[0], F[0], s)} y={lerp(Hd[1], F[1], s)} s={lerp(0.2, 1, s)} hard={false} body={easyBody} o={clamp01(s * 4)} />
        <SystemOne x={760} y={810} s={0.85} t={t} mood={sneaky ? "proud" : "happy"} look={sneaky ? 1 : -0.6} />
        {sneaky && (
          <g opacity={0.8}>
            <Txt x={660} y={500} size={40} weight={900} color={S1.deep}>
              тсс…
            </Txt>
          </g>
        )}
        <Pop t={t} at={at(c, 1.7)} x={1030} y={230}>
          <g>
            <Tag x={0} y={0} text="а думаем — ответили на этот" size={34} color={C.coral} textColor="#fff" />
          </g>
        </Pop>
        <Arrow x1={1310} y1={218} x2={1372} y2={218} k={ramp(t, at(c, 1.75), 0.3)} w={7} color={C.coral} />
        <Pop t={t} at={at(c, 1.7)} x={1260} y={740}>
          <Tag x={0} y={0} text="отвечаем на этот" size={34} color={C.green} textColor="#fff" />
        </Pop>
      </Fade>
      {/* опрос студентов: порядок вопросов */}
      <Fade o={vis(t, at(c, 2.05), at(c, 3), 0.5)}>
        <Tag x={1220} y={170} text="опрос студентов" size={42} color={C.yellow} />
        {[0, 1].map((r) => {
          const y = r === 0 ? 350 : 590;
          const first = r === 0 ? "1. свидания" : "1. счастье";
          const second = r === 0 ? "2. счастье" : "2. свидания";
          const b = 2.15 + r * 0.35;
          return (
            <g key={r}>
              <Pop t={t} at={at(c, b)} x={790} y={y}>
                <g>
                  <Panel x={-150} y={-50} w={300} h={100} fill="#fff" r={24} />
                  <Txt x={0} y={12} size={36} weight={900}>
                    {first}
                  </Txt>
                </g>
              </Pop>
              <Pop t={t} at={at(c, b + 0.08)} x={1290} y={y}>
                <g>
                  <Panel x={-150} y={-50} w={300} h={100} fill="#fff" r={24} />
                  <Txt x={0} y={12} size={36} weight={900}>
                    {second}
                  </Txt>
                </g>
              </Pop>
              <Link x={1040} y={y} broken={r === 1} k={ramp(t, at(c, b + 0.15), 0.5)} />
              <Pop t={t} at={at(c, b + 0.2)} x={1665} y={y + 8}>
                <Tag x={0} y={0} text={r === 0 ? "сильная связь" : "почти нет связи"} size={34} color={r === 0 ? C.green : "#d4d8e0"} textColor={r === 0 ? "#fff" : C.ink} />
              </Pop>
            </g>
          );
        })}
      </Fade>
      {/* главный вопрос себе */}
      <Pop t={t} at={at(c, 3.1)} x={1220} y={430}>
        <g>
          <Panel x={-520} y={-130} w={1040} h={250} fill="#fff" stroke={S2.main} />
          <Head x={0} y={-18} size={66}>
            {"На какой вопрос\nя отвечаю?"}
          </Head>
        </g>
      </Pop>
      {[0, 1, 2].map((i) => (
        <Pop key={i} t={t} at={at(c, 3.25) + i * 0.15} x={[700, 1790, 1840][i]} y={[260, 260, 560][i] + wob(t, i, 8)}>
          <Txt x={0} y={0} size={80} weight={900} color={i === 1 ? S1.deep : S2.deep}>
            ?
          </Txt>
        </Pop>
      ))}
      <Fade o={ramp(t, at(c, 3.2), 0.5)}>
        <SystemTwo x={1720} y={800} s={0.7} t={t} mood="think" />
      </Fade>
    </g>
  );
};
