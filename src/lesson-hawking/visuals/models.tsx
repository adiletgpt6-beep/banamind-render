// Часть «Модели»: башня черепах, доводы Аристотеля, модель Птолемея, Коперник —
// Галилей — Кеплер, Ньютон и неподвижная Вселенная, что такое хорошая теория,
// две частичные теории.
import React from "react";
import { C } from "../theme";
import { Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Earth, Note, Spark, Stage, Sun, Telescope } from "./space";

const Turtle: React.FC<{ x: number; y: number; s: number; t: number; seed: number }> = ({ x, y, s, t, seed }) => (
  <g transform={`translate(${x + wob(t, seed, 3)} ${y}) scale(${s})`}>
    <ellipse cx={-120} cy={10} rx={40} ry={28} fill="#5fbf7a" />
    <circle cx={-136} cy={2} r={5} fill={C.night} />
    <rect x={-80} y={20} width={30} height={40} rx={12} fill="#5fbf7a" />
    <rect x={50} y={20} width={30} height={40} rx={12} fill="#5fbf7a" />
    <path d="M -95 30 Q -90 -70 0 -75 Q 90 -70 95 30 Z" fill="#2f8f55" stroke="#1d6b3c" strokeWidth={6} />
    <path d="M -50 -20 L 0 -50 L 50 -20 L 30 25 L -30 25 Z" fill="none" stroke="#7fe0a0" strokeWidth={5} opacity={0.6} />
  </g>
);

// ── m01: тарелка-мир на башне черепах ──
export const Turtles: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const n = Math.min(6, Math.floor(1 + ramp(t, at(c, 1), 3) * 5));
  const ask = pop(t, at(c, 2));
  const unseen = ramp(t, at(c, 3), 0.8);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={430} y={230}>
        <ellipse cx={0} cy={0} rx={250} ry={50} fill="#3d6fd1" stroke="#9fd3ff" strokeWidth={4} />
        <path d="M -160 -10 Q -60 -40 40 -14 Q 120 -4 180 -20" fill="none" stroke="#46c27a" strokeWidth={22} strokeLinecap="round" />
        <Txt x={0} y={-66} size={30} color={C.dim}>
          мир — плоская плита
        </Txt>
      </Pop>
      {Array.from({ length: n }).map((_, i) => (
        <Turtle key={i} x={430} y={330 + i * 88} s={0.9 - i * 0.08} t={t} seed={i} />
      ))}
      {n >= 5 && (
        <Txt x={430} y={880} size={34} color={C.yellow} opacity={ramp(t, at(c, 1.7), 0.6)}>
          …и так до самого низа
        </Txt>
      )}
      {ask > 0 && (
        <g transform={`translate(970 330) scale(${ask})`}>
          <Panel x={-260} y={-110} w={520} h={220} />
          <Txt x={0} y={-10} size={44} color={C.text}>
            А почему правы
          </Txt>
          <Txt x={0} y={60} size={52} color={C.yellow}>
            именно мы?
          </Txt>
        </g>
      )}
      {unseen > 0 && (
        <g opacity={unseen} transform="translate(970 640)">
          <Earth x={-120} y={0} r={70} t={t} />
          <Turtle x={130} y={10} s={0.5} t={t} seed={9} />
          <Txt x={0} y={150} size={30} color={C.dim}>
            целиком не видели ни то, ни другое
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── m02: три довода Аристотеля ──
export const RoundEarth: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const e1 = ramp(t, at(c, 1), 1.2);
  const e2 = pop(t, at(c, 2));
  const e3 = pop(t, at(c, 2.5));
  const sum = pop(t, at(c, 3));
  const ship = ramp(t, at(c, 2.5) + 0.3, 3);
  return (
    <Stage host={c.p.host}>
      {/* 1. лунное затмение: круглая тень */}
      <g transform="translate(230 330)">
        <circle r={120} fill="#c9c3b0" />
        <circle cx={160 - e1 * 140} cy={0} r={130} fill="#1a1f3a" opacity={0.86} />
        <Txt x={0} y={190} size={30}>
          тень на Луне круглая
        </Txt>
        <Txt x={0} y={-150} size={36} color={C.yellow}>
          1
        </Txt>
      </g>
      {/* 2. Полярная звезда ниже на юге */}
      {e2 > 0 && (
        <g transform={`translate(640 330) scale(${e2})`}>
          <line x1={-150} y1={90} x2={150} y2={90} stroke={C.dim} strokeWidth={4} />
          <Spark x={-80} y={-110} r={18} color={C.yellow} />
          <Spark x={90} y={10} r={18} color={C.yellow} />
          <Txt x={-80} y={135} size={26} color={C.dim}>
            север
          </Txt>
          <Txt x={90} y={135} size={26} color={C.dim}>
            юг
          </Txt>
          <Txt x={0} y={190} size={30}>
            Полярная звезда ниже
          </Txt>
          <Txt x={0} y={-150} size={36} color={C.yellow}>
            2
          </Txt>
        </g>
      )}
      {/* 3. корабль из-за горизонта: сначала паруса */}
      {e3 > 0 && (
        <g transform={`translate(1050 330) scale(${e3})`}>
          <defs>
            <clipPath id="sea-clip">
              <rect x={-170} y={-140} width={340} height={200} />
            </clipPath>
          </defs>
          <path d="M -170 60 Q 0 20 170 60 L 170 120 L -170 120 Z" fill="#2f6fd6" />
          <g clipPath="url(#sea-clip)">
            <g transform={`translate(0 ${90 - ship * 80})`}>
              <rect x={-60} y={0} width={120} height={30} rx={10} fill={C.amber} />
              <line x1={0} y1={0} x2={0} y2={-110} stroke={C.text} strokeWidth={5} />
              <path d="M 4 -100 L 60 -20 L 4 -20 Z" fill={C.text} />
            </g>
          </g>
          <Txt x={0} y={190} size={30}>
            сначала паруса
          </Txt>
          <Txt x={0} y={-150} size={36} color={C.yellow}>
            3
          </Txt>
        </g>
      )}
      {sum > 0 && (
        <g transform={`translate(640 700) scale(${sum})`}>
          <Tag x={0} y={0} text="картина мира ↔ наблюдения" color={C.yellow} size={42} />
        </g>
      )}
    </Stage>
  );
};

// ── m03: геоцентрическая модель с эпициклами ──
export const Ptolemy: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const epi = ramp(t, at(c, 1), 1);
  const warn = pop(t, at(c, 2));
  const rings = [90, 140, 195, 250, 300];
  return (
    <Stage host={c.p.host}>
      <g transform="translate(420 500)">
        {rings.map((r, i) => (
          <circle key={r} r={r} fill="none" stroke={C.glassLine} strokeWidth={3} opacity={ramp(t, 0.2 + i * 0.2)} />
        ))}
        <circle r={340} fill="none" stroke={C.yellow} strokeWidth={3} strokeDasharray="4 14" opacity={ramp(t, 1.2)} />
        <Earth x={0} y={0} r={46} t={t} />
        {rings.map((r, i) => {
          const a = t * (0.5 - i * 0.07) + i;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          const ea = t * 2.2 + i;
          const er = 26 * epi;
          return (
            <g key={i}>
              {epi > 0 && <circle cx={px} cy={py} r={er} fill="none" stroke={C.violet} strokeWidth={2.5} />}
              <circle cx={px + Math.cos(ea) * er} cy={py + Math.sin(ea) * er} r={i === 2 ? 20 : 11} fill={i === 2 ? C.amber : [C.text, C.coral, C.amber, C.sky, C.pink][i]} />
            </g>
          );
        })}
      </g>
      <Pop t={t} at={at(c, 1) + 0.4} x={1000} y={260}>
        <Tag x={0} y={0} text="эпициклы" color={C.violet} size={40} textColor={C.white} />
      </Pop>
      {warn > 0 && (
        <g transform={`translate(1000 560) scale(${warn})`}>
          <Panel x={-250} y={-130} w={500} h={260} />
          <Check x={-150} y={-50} s={50} k={ramp(t, at(c, 2) + 0.2)} />
          <Txt x={40} y={-36} size={34}>
            предсказывает
          </Txt>
          <Cross x={-150} y={60} s={60} k={ramp(t, at(c, 2) + 0.8)} />
          <Txt x={40} y={74} size={34} color={C.coral}>
            но картина
          </Txt>
          <Txt x={40} y={114} size={34} color={C.coral}>
            неверна
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── m04: Солнце в центре, спутники Юпитера, эллипсы ──
export const Copernicus: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const jup = ramp(t, at(c, 1), 0.8);
  const ell = ramp(t, at(c, 2), 1.2);
  const ex = 1 + 0.35 * ell;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(400 520)">
        <Sun x={0} y={0} r={55} t={t} />
        {[130, 200, 280].map((r, i) => {
          const a = t * (0.7 - i * 0.18) + i * 2;
          const rx = r * (i === 1 ? ex : 1);
          const ry = r;
          return (
            <g key={r}>
              <ellipse cx={i === 1 ? (rx - r) * 0.6 : 0} cy={0} rx={rx} ry={ry} fill="none" stroke={C.glassLine} strokeWidth={3} />
              {i === 1 ? (
                <Earth x={(rx - r) * 0.6 + Math.cos(a) * rx} y={Math.sin(a) * ry} r={20} t={t} />
              ) : (
                <circle cx={Math.cos(a) * rx} cy={Math.sin(a) * ry} r={14} fill={i ? C.coral : C.dim} />
              )}
            </g>
          );
        })}
      </g>
      <Pop t={t} at={0.4} x={400} y={150}>
        <Tag x={0} y={0} text="Коперник: Солнце в центре" color={C.yellow} size={36} />
      </Pop>
      {jup > 0 && (
        <g opacity={jup} transform="translate(980 380)">
          <Telescope x={-170} y={140} s={0.8} ang={-30} />
          <circle r={60} fill="#d9a066" />
          <path d="M -58 -12 Q 0 -4 58 -12 M -55 14 Q 0 20 55 14" stroke="#a8673a" strokeWidth={8} fill="none" />
          {[0, 1, 2, 3].map((i) => {
            const a = t * (1.6 - i * 0.3) + i * 1.7;
            const r = 90 + i * 32;
            return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.3} r={7} fill={C.text} />;
          })}
          <Txt x={0} y={-110} size={32}>
            Галилей: спутники Юпитера
          </Txt>
        </g>
      )}
      {ell > 0 && (
        <g opacity={ell}>
          <Tag x={980} y={700} text="Кеплер: эллипсы вместо кругов" color={C.sky} size={34} />
        </g>
      )}
    </Stage>
  );
};

// ── m05: Ньютон — одна сила для яблока и Луны; почему звёзды не слиплись ──
export const Newton: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fall = clamp01((t - 0.6) / 1.2);
  const puzzle = ramp(t, at(c, 1), 1);
  const collapse = ramp(t, at(c, 1) + 1, 3);
  const static_ = pop(t, at(c, 2));
  const stars = Array.from({ length: 14 }).map((_, i) => ({ x: 860 + Math.cos(i * 2.3) * (90 + (i % 5) * 45), y: 480 + Math.sin(i * 2.3) * (90 + (i % 5) * 40) }));
  return (
    <Stage host={c.p.host}>
      <g transform="translate(300 520)">
        <Earth x={0} y={160} r={140} t={t} />
        <circle cx={-60} cy={-80 + fall * 140} r={18} fill={C.red} opacity={1 - ramp(t, 2.2, 0.3)} />
        <path d={`M -60 ${-98 + fall * 140} q 4 -10 10 -12`} stroke={C.green} strokeWidth={4} fill="none" opacity={1 - ramp(t, 2.2, 0.3)} />
        <ellipse cx={0} cy={160} rx={330} ry={330} fill="none" stroke={C.glassLine} strokeWidth={3} strokeDasharray="8 10" />
        <circle cx={Math.cos(t * 0.4) * 330} cy={160 + Math.sin(t * 0.4) * 330} r={30} fill="#c9c3b0" />
        <Txt x={0} y={-260} size={32} color={C.yellow}>
          одна сила — яблоко и Луна
        </Txt>
      </g>
      {puzzle > 0 && (
        <g opacity={puzzle}>
          {stars.map((s, i) => {
            const k = collapse * (static_ > 0 ? 1 - ramp(t, at(c, 2), 1) : 1);
            return <Spark key={i} x={s.x + (860 - s.x) * k * 0.7} y={s.y + (480 - s.y) * k * 0.7} r={12} color={C.yellow} />;
          })}
          <Txt x={860} y={230} size={36}>
            почему звёзды не слетелись?
          </Txt>
        </g>
      )}
      {static_ > 0 && (
        <g transform={`translate(860 800) scale(${static_})`}>
          <Tag x={0} y={0} text="верили: Вселенная неизменна" color={C.white} size={34} />
        </g>
      )}
    </Stage>
  );
};

// ── m06: теория = модель + правила; проверка ──
export const GoodTheory: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const two = at(c, 1);
  const test = at(c, 2);
  const word = pop(t, at(c, 3));
  const checks = Math.floor(ramp(t, test, 2.2) * 5);
  const broken = t > at(c, 2.75);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={330} y={330}>
        <Panel x={-260} y={-150} w={520} h={300} />
        <circle cx={-120} cy={-20} r={70} fill={C.violetDeep} />
        <Txt x={-120} y={-8} size={30} color={C.white}>
          модель
        </Txt>
        <Txt x={30} y={0} size={60} color={C.yellow}>
          +
        </Txt>
        <rect x={80} y={-80} width={140} height={120} rx={14} fill={C.skyDeep} />
        <Txt x={150} y={-12} size={28} color={C.white}>
          правила
        </Txt>
        <Txt x={0} y={110} size={28} color={C.dim}>
          связь с наблюдениями
        </Txt>
      </Pop>
      {[0, 1].map((i) => {
        const k = pop(t, two + 0.4 + i * 1.2);
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(940 ${250 + i * 160}) scale(${k})`}>
            <Tag x={0} y={0} text={i ? "предсказывает новое" : "много фактов — мало деталей"} color={i ? C.green : C.sky} size={32} />
          </g>
        );
      })}
      {t > test && (
        <g transform="translate(640 600)">
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i} transform={`translate(${-400 + i * 160} 0)`}>
              <rect x={-55} y={-55} width={110} height={110} rx={20} fill={C.glass} stroke={C.glassLine} strokeWidth={2} />
              {i < checks && <Check x={0} y={0} s={36} k={1} />}
            </g>
          ))}
          {broken && (
            <g transform="translate(400 0)">
              <rect x={-55} y={-55} width={110} height={110} rx={20} fill="rgba(255,90,95,0.25)" stroke={C.red} strokeWidth={4} />
              <Cross x={0} y={0} s={60} k={ramp(t, at(c, 2.75), 0.5)} />
            </g>
          )}
          <Txt x={0} y={120} size={30} color={C.dim}>
            {broken ? "одно надёжное «нет» — и теорию меняют" : "каждое «да» — ещё не доказательство"}
          </Txt>
        </g>
      )}
      {word > 0 && (
        <g transform={`translate(640 830) scale(${word})`}>
          <Tag x={0} y={0} text="теория ≠ догадка" color={C.yellow} size={40} />
        </g>
      )}
    </Stage>
  );
};

// ── m07: две частичные теории ──
export const TwoTheories: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const gr = pop(t, at(c, 1));
  const qm = pop(t, at(c, 1.5));
  const clash = ramp(t, at(c, 2), 1);
  const gap = 60 + 40 * Math.sin(t * 3) * clash;
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={170}>
        <Txt x={0} y={0} size={40} color={C.dim}>
          частичные теории
        </Txt>
      </Pop>
      {gr > 0 && (
        <g transform={`translate(${380 - gap} 470) scale(${gr})`}>
          <circle r={210} fill="rgba(59,156,255,0.18)" stroke={C.skyDeep} strokeWidth={6} />
          <ellipse rx={150} ry={50} fill="none" stroke={C.sky} strokeWidth={4} transform={`rotate(${t * 10})`} />
          <Sun x={0} y={0} r={30} t={t} />
          <Txt x={0} y={110} size={30}>
            общая теория
          </Txt>
          <Txt x={0} y={148} size={30}>
            относительности
          </Txt>
          <Txt x={0} y={-130} size={28} color={C.sky}>
            звёзды, галактики
          </Txt>
        </g>
      )}
      {qm > 0 && (
        <g transform={`translate(${900 + gap} 470) scale(${qm})`}>
          <circle r={210} fill="rgba(169,139,255,0.18)" stroke={C.violetDeep} strokeWidth={6} />
          <circle r={18} fill={C.coral} />
          {[0, 60, 120].map((a) => (
            <ellipse key={a} rx={90} ry={30} fill="none" stroke={C.violet} strokeWidth={3} transform={`rotate(${a + t * 30})`} />
          ))}
          <Txt x={0} y={130} size={30}>
            квантовая механика
          </Txt>
          <Txt x={0} y={-130} size={28} color={C.violet}>
            атомы, частицы
          </Txt>
        </g>
      )}
      {clash > 0 && (
        <g opacity={clash}>
          <Txt x={640} y={490} size={90} color={C.red}>
            ≠
          </Txt>
          <Tag x={640} y={800} text="как объединить?" color={C.yellow} size={44} />
          <Note x={640} y={870} text="главный вопрос книги" />
        </g>
      )}
    </Stage>
  );
};
