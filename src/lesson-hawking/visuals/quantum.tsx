// Часть «Кванты»: мечта Лапласа и кванты Планка, принцип неопределённости,
// опыт с двумя щелями (точки складываются в полосы), сумма по историям,
// строение вещества, принцип Паули и античастицы, четыре силы, великое
// объединение и бозон Хиггса.
import React from "react";
import { C } from "../theme";
import { Arrow, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Note, Photon, Spark, Stage, Wave } from "./space";

const rnd = (i: number) => {
  const x = Math.sin(i * 91.17 + 3.3) * 10000;
  return x - Math.floor(x);
};

// ── q01: часы Лапласа → «бесконечная энергия» → порции-кванты ──
export const Laplace: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const inf = pop(t, at(c, 1));
  const q = ramp(t, at(c, 2), 0.8);
  const balls = Array.from({ length: 7 }).map((_, i) => ({ x: 200 + i * 60, y: 300 + Math.sin(t * 1.5 + i) * 60 }));
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={370} y={320}>
        <Panel x={-280} y={-170} w={560} h={340} />
        {balls.map((b, i) => (
          <g key={i}>
            <circle cx={b.x - 370} cy={b.y - 320} r={14} fill={C.sky} />
            <line x1={b.x - 370} y1={b.y - 320} x2={b.x - 370 + 40} y2={b.y - 320 + Math.cos(t * 1.5 + i) * 30} stroke={C.yellow} strokeWidth={3} />
          </g>
        ))}
        <Txt x={0} y={130} size={28} color={C.dim}>
          знаем всё сейчас → знаем будущее?
        </Txt>
      </Pop>
      {inf > 0 && (
        <g transform={`translate(970 300) scale(${inf})`}>
          <rect x={-90} y={-60} width={180} height={120} rx={20} fill={C.orange} />
          <Txt x={0} y={20} size={60} color={C.night}>
            ∞
          </Txt>
          <Txt x={0} y={110} size={28} color={C.coral}>
            расчёт: бесконечная энергия
          </Txt>
          <Cross x={0} y={0} s={160} k={ramp(t, at(c, 2), 0.6)} />
        </g>
      )}
      {q > 0 && (
        <g opacity={q} transform="translate(640 690)">
          <Tag x={0} y={-130} text="1900 · Планк: порции-кванты" color={C.yellow} size={36} />
          {[0, 1, 2, 3, 4].map((i) => {
            const x = -400 + ((t * 180 + i * 180) % 900);
            return <Photon key={i} x={x} y={-10} r={10} color={i % 2 ? C.violet : C.sky} />;
          })}
          {[0.3, 0.6, 1].map((f, i) => (
            <g key={i} transform={`translate(${-280 + i * 280} 90)`}>
              <Wave x={-90} y={0} w={180} amp={18} len={90 / (1 + i)} phase={t * 4} color={[C.red, C.green, C.violet][i]} />
              <rect x={-40} y={40} width={80} height={10 + f * 50} rx={6} fill={C.yellow} transform={`translate(0 ${-f * 50})`} />
            </g>
          ))}
          <Note x={0} y={180} text="выше частота — больше энергия порции" />
        </g>
      )}
    </Stage>
  );
};

// ── q02: «посветить» на частицу: короткая волна — сильный толчок ──
export const Uncertainty: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const short = ramp(t, at(c, 0.5), 1);
  const bars = ramp(t, at(c, 1), 1);
  const nature = pop(t, at(c, 2));
  const len = 160 - short * 110;
  const kick = short * Math.sin(t * 9) * 30;
  const pos = 0.2 + 0.7 * bars * (0.5 + 0.5 * Math.sin(t * 0.8));
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 330)">
        <Wave x={-280} y={0} w={240} amp={26} len={len} phase={t * 6} color={short > 0.5 ? C.violet : C.red} sw={6} />
        <circle cx={60 + kick} cy={-kick * 0.5} r={24} fill={C.coral} />
        <circle cx={60} cy={0} r={60 - short * 35} fill="none" stroke={C.yellow} strokeWidth={3} strokeDasharray="6 6" />
        {short > 0.3 && <Arrow x1={60} y1={0} x2={60 + 90 * Math.cos(t * 7)} y2={-90 * Math.abs(Math.sin(t * 7))} k={1} color={C.red} w={5} />}
        <Txt x={-60} y={150} size={28} color={C.dim}>
          {short > 0.5 ? "короткая волна — точнее «где», но сильный толчок" : "длинная волна — мягко, но размыто"}
        </Txt>
      </g>
      {bars > 0 && (
        <g opacity={bars} transform="translate(980 260)">
          {[
            ["положение", pos, C.sky],
            ["скорость", 1.1 - pos, C.coral],
          ].map(([label, v, col], i) => (
            <g key={i} transform={`translate(0 ${i * 160})`}>
              <Txt x={-200} y={-20} size={28} anchor="start">
                {`неопределённость: ${label}`}
              </Txt>
              <rect x={-200} y={0} width={400} height={50} rx={14} fill={C.glass} stroke={C.glassLine} strokeWidth={2} />
              <rect x={-200} y={0} width={400 * (v as number)} height={50} rx={14} fill={col as string} />
            </g>
          ))}
          <Txt x={0} y={340} size={28} color={C.yellow}>
            одно точнее — другое хуже
          </Txt>
        </g>
      )}
      {nature > 0 && (
        <g transform={`translate(640 800) scale(${nature})`}>
          <Tag x={0} y={0} text="не плохие приборы — так устроена природа" color={C.green} size={32} textColor={C.night} />
        </g>
      )}
    </Stage>
  );
};

// ── q03: две щели — волны, затем электроны по одному складываются в полосы ──
export const DoubleSlit: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const waves = ramp(t, 0.3, 0.8) * (1 - ramp(t, at(c, 1), 0.6));
  const dotsOn = at(c, 1);
  const n = Math.floor(clamp01((t - dotsOn) / (c.dur - dotsOn - 1)) * 420);
  const prob = ramp(t, at(c, 3), 1);
  const screenX = 1000;
  // плотность вероятности: интерференция двух щелей
  const pdf = (y: number) => Math.cos(y * 0.05) ** 2 * Math.exp(-((y / 210) ** 2));
  const sample = (i: number) => {
    for (let k = 0; k < 30; k++) {
      const y = (rnd(i * 31 + k) - 0.5) * 560;
      if (rnd(i * 17 + k + 999) < pdf(y)) return y;
    }
    return 0;
  };
  return (
    <Stage host={c.p.host}>
      <g transform="translate(0 470)">
        <rect x={160} y={-28} width={60} height={56} rx={10} fill={C.amber} />
        <rect x={560} y={-300} width={24} height={250} fill={C.steel} />
        <rect x={560} y={-30} width={24} height={60} fill={C.steel} />
        <rect x={560} y={50} width={24} height={250} fill={C.steel} />
        <rect x={screenX} y={-300} width={30} height={600} rx={6} fill={C.deep} stroke={C.glassLine} strokeWidth={2} />
        {waves > 0 &&
          [0, 1, 2, 3, 4].map((i) => {
            const r = ((t * 120 + i * 90) % 450) + 10;
            return (
              <g key={i} opacity={waves * (1 - r / 460)}>
                <path d={`M ${572} ${-40 - r} A ${r} ${r} 0 0 1 ${572} ${-40 + r}`} fill="none" stroke={C.sky} strokeWidth={3} transform="translate(0 0)" />
                <path d={`M ${572} ${40 - r} A ${r} ${r} 0 0 1 ${572} ${40 + r}`} fill="none" stroke={C.sky} strokeWidth={3} />
              </g>
            );
          })}
        {Array.from({ length: n }).map((_, i) => (
          <circle key={i} cx={screenX + 6 + rnd(i + 5000) * 18} cy={sample(i)} r={3.2} fill={C.yellow} opacity={0.85} />
        ))}
        {n > 0 && n < 420 && <Photon x={220 + ((t * 3) % 1) * 340} y={0} r={7} color={C.yellow} />}
        {prob > 0 && (
          <path
            d={Array.from({ length: 120 })
              .map((_, i) => {
                const y = -290 + (i / 119) * 580;
                return `${i ? "L" : "M"} ${screenX + 50 + pdf(y) * 140 * prob} ${y}`;
              })
              .join(" ")}
            fill="none"
            stroke={C.green}
            strokeWidth={5}
          />
        )}
        <Txt x={190} y={90} size={24} color={C.dim}>
          по одному
        </Txt>
        <Txt x={572} y={340} size={24} color={C.dim}>
          две щели
        </Txt>
        <Txt x={screenX + 15} y={340} size={24} color={C.dim}>
          экран
        </Txt>
      </g>
      {prob > 0 && (
        <g opacity={prob}>
          <Tag x={640} y={150} text="теория даёт вероятность, а не путь" color={C.green} size={32} textColor={C.night} />
        </g>
      )}
    </Stage>
  );
};

// ── q04: сумма по историям: все пути, остаётся главный ──
export const Paths: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const all = ramp(t, at(c, 1), 1.2);
  const cancel = ramp(t, at(c, 2), 1.6);
  const note = pop(t, at(c, 3));
  const A = { x: 160, y: 520 };
  const B = { x: 1120, y: 520 };
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={170}>
        <Tag x={0} y={0} text="Фейнман: сумма по историям" color={C.violet} size={36} textColor={C.white} />
      </Pop>
      {Array.from({ length: 22 }).map((_, i) => {
        const off = i === 10 ? 0 : (i - 10.5) * 34 + Math.sin(i * 3.1) * 40;
        const wig = i === 10 ? 0 : Math.sin(i * 1.7) * 60;
        const main = i === 10;
        const op = all * (main ? 1 : 1 - cancel * 0.92);
        return (
          <path
            key={i}
            d={`M ${A.x} ${A.y} C ${420} ${A.y - off * 2 + wig} ${860} ${B.y - off * 2 - wig} ${B.x} ${B.y}`}
            fill="none"
            stroke={main ? C.yellow : i % 2 ? C.violet : C.sky}
            strokeWidth={main ? 7 : 3}
            opacity={op * (main ? 1 : 0.7)}
          />
        );
      })}
      <circle cx={A.x} cy={A.y} r={20} fill={C.white} />
      <circle cx={B.x} cy={B.y} r={20} fill={C.white} />
      <Txt x={A.x} y={A.y + 60} size={34}>
        А
      </Txt>
      <Txt x={B.x} y={B.y + 60} size={34}>
        Б
      </Txt>
      {cancel > 0.5 && (
        <Txt x={640} y={760} size={30} color={C.yellow} opacity={cancel}>
          почти все пути гасят друг друга
        </Txt>
      )}
      {note > 0 && (
        <g transform={`translate(640 840) scale(${note})`}>
          <Note x={0} y={0} text="способ расчёта — не «мячик летит всеми путями»" />
        </g>
      )}
    </Stage>
  );
};

// ── q05: атом → ядро → протон из кварков; облако вместо орбит ──
export const Atom: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const nuc = ramp(t, at(c, 0.6), 1);
  const quarks = pop(t, at(c, 1));
  const colors = ramp(t, at(c, 2), 0.8);
  const cloud = ramp(t, at(c, 3), 1.2);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 470)">
        {cloud < 1 &&
          [0, 60, 120].map((a) => (
            <g key={a} opacity={1 - cloud}>
              <ellipse rx={230} ry={80} fill="none" stroke={C.sky} strokeWidth={4} transform={`rotate(${a})`} />
              <circle cx={Math.cos(t * 2 + a) * 230} cy={Math.sin(t * 2 + a) * 80} r={12} fill={C.sky} transform={`rotate(${a})`} />
            </g>
          ))}
        {cloud > 0 &&
          Array.from({ length: 260 }).map((_, i) => {
            const r = Math.sqrt(-Math.log(rnd(i) + 1e-3)) * 110;
            const a = rnd(i + 300) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={3} fill={C.sky} opacity={cloud * 0.55} />;
          })}
        <circle r={22 + nuc * 6} fill={C.coral} />
        <Txt x={0} y={300} size={28} color={cloud > 0.5 ? C.green : C.dim}>
          {cloud > 0.5 ? "облако вероятности — точнее" : "условная картинка"}
        </Txt>
      </g>
      {nuc > 0 && (
        <g opacity={nuc}>
          <Arrow x1={380} y1={450} x2={760} y2={380} k={nuc} color={C.dim} w={4} />
          <g transform="translate(870 350)">
            {[
              [-30, -20, C.coral],
              [25, -25, C.steel],
              [0, 22, C.coral],
              [-40, 30, C.steel],
              [40, 20, C.coral],
            ].map(([x, y, col], i) => (
              <circle key={i} cx={x as number} cy={y as number} r={34} fill={col as string} stroke={C.night} strokeWidth={3} />
            ))}
            <Txt x={0} y={-80} size={28}>
              ядро: протоны и нейтроны
            </Txt>
          </g>
        </g>
      )}
      {quarks > 0 && (
        <g transform={`translate(870 680) scale(${quarks})`}>
          <circle r={110} fill="rgba(255,138,122,0.2)" stroke={C.coral} strokeWidth={4} />
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2 + t * 0.8;
            const col = colors > 0 ? [C.red, C.green, C.skyDeep][i] : C.yellow;
            return (
              <g key={i}>
                <circle cx={Math.cos(a) * 52} cy={Math.sin(a) * 52} r={26} fill={col} />
                <Txt x={Math.cos(a) * 52} y={Math.sin(a) * 52 + 10} size={28} color={C.white}>
                  {i === 2 ? "d" : "u"}
                </Txt>
              </g>
            );
          })}
          <Txt x={0} y={160} size={24} color={C.dim}>
            {colors > 0 ? "«цвет» кварка — лишь имя" : "протон: кварки"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── q06: принцип Паули и античастица ──
export const SpinPauli: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const two = pop(t, 0.4);
  const pauli = ramp(t, at(c, 1), 1);
  const anti = ramp(t, at(c, 2), 0.6);
  const meet = ramp(t, at(c, 2) + 1, 1.4);
  return (
    <Stage host={c.p.host}>
      {two > 0 && (
        <g transform={`scale(${two})`}>
          <Panel x={60} y={140} w={520} h={140} />
          <Txt x={320} y={200} size={30} color={C.sky}>
            частицы вещества
          </Txt>
          <Txt x={320} y={245} size={24} color={C.dim}>
            электроны, кварки
          </Txt>
          <Panel x={700} y={140} w={520} h={140} />
          <Txt x={960} y={200} size={30} color={C.yellow}>
            переносчики сил
          </Txt>
          <Txt x={960} y={245} size={24} color={C.dim}>
            фотон, глюон, W и Z…
          </Txt>
        </g>
      )}
      {pauli > 0 && (
        <g opacity={pauli} transform="translate(330 530)">
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={-180} y={90 - i * 70} width={360} height={8} rx={4} fill={C.glassLine} />
            </g>
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const lvl = Math.floor(i / 2);
            return <circle key={i} cx={(i % 2 ? 40 : -40) + Math.sin(t * 2 + i) * 4} cy={70 - lvl * 70} r={20} fill={C.sky} />;
          })}
          <Txt x={0} y={170} size={26}>
            одно состояние — не больше одной
          </Txt>
          <Txt x={0} y={210} size={24} color={C.dim}>
            иначе вещество сжалось бы в «желе»
          </Txt>
        </g>
      )}
      {anti > 0 && (
        <g opacity={anti} transform="translate(960 560)">
          <circle cx={-200 + meet * 170} cy={0} r={36} fill={C.sky} opacity={1 - ramp(t, at(c, 2) + 2.3, 0.3)} />
          <Txt x={-200 + meet * 170} y={12} size={34} color={C.night}>
            −
          </Txt>
          <circle cx={200 - meet * 170} cy={0} r={36} fill={C.coral} opacity={1 - ramp(t, at(c, 2) + 2.3, 0.3)} />
          <Txt x={200 - meet * 170} y={12} size={34} color={C.night}>
            +
          </Txt>
          {meet >= 1 && <Spark x={0} y={0} r={80 * ramp(t, at(c, 2) + 2.3, 0.4)} color={C.yellow} />}
          <Txt x={0} y={110} size={26}>
            частица + античастица → энергия
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── q07: четыре силы ──
export const Forces: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const F = [
    { name: "гравитация", sub: "слабее всех, но всегда притягивает", col: C.violet, at: at(c, 0.2) },
    { name: "электромагнитная", sub: "держит атомы", col: C.sky, at: at(c, 2) },
    { name: "слабая", sub: "радиоактивность", col: C.green, at: at(c, 2.3) },
    { name: "сильная", sub: "склеивает кварки (глюоны)", col: C.coral, at: at(c, 3) },
  ];
  const ratio = pop(t, at(c, 1));
  const unite = ramp(t, at(c, 2.55), 1);
  return (
    <Stage host={c.p.host}>
      {F.map((f, i) => {
        const k = pop(t, f.at);
        if (k <= 0) return null;
        const y = 220 + i * 150;
        return (
          <g key={f.name} transform={`translate(330 ${y}) scale(${k})`}>
            <rect x={-280} y={-55} width={560} height={110} rx={55} fill="rgba(14,20,48,0.85)" stroke={f.col} strokeWidth={4} />
            <circle cx={-225} cy={0} r={32} fill={f.col} />
            <Txt x={-170} y={-6} size={30} anchor="start">
              {f.name}
            </Txt>
            <Txt x={-170} y={32} size={22} color={C.dim} anchor="start">
              {f.sub}
            </Txt>
          </g>
        );
      })}
      {unite > 0 && (
        <g opacity={unite}>
          <path d="M 630 370 Q 690 445 630 520" fill="none" stroke={C.yellow} strokeWidth={6} />
          <Txt x={700} y={455} size={26} color={C.yellow} anchor="start">
            объединены в теории; W и Z найдены
          </Txt>
        </g>
      )}
      {ratio > 0 && (
        <g transform={`translate(980 230) scale(${ratio})`}>
          <circle cx={-90} cy={0} r={22} fill={C.sky} />
          <circle cx={90} cy={0} r={22} fill={C.sky} />
          <Arrow x1={-60} y1={0} x2={-10} y2={0} k={1} color={C.coral} w={5} />
          <Arrow x1={60} y1={0} x2={10} y2={0} k={1} color={C.coral} w={5} />
          <Txt x={0} y={80} size={30} color={C.yellow}>
            ≈ 10⁴² раз сильнее
          </Txt>
          <Txt x={0} y={118} size={22} color={C.dim}>
            электричество против гравитации
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── q08: великое объединение (гипотеза), распад протона не найден, бозон Хиггса ──
export const Gut: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const merge = ramp(t, 0.5, 1.6);
  const tank = pop(t, at(c, 1.4));
  const none = ramp(t, at(c, 2), 1);
  const higgs = pop(t, at(c, 3));
  const cols = [C.sky, C.green, C.coral];
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 360)">
        {cols.map((col, i) => {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
          const r = 130 * (1 - merge * 0.75);
          return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={56} fill={col} opacity={0.75} />;
        })}
        <Txt x={0} y={220} size={30}>
          три силы → одна?
        </Txt>
        <Tag x={0} y={-200} text="гипотеза" color={C.pink} size={30} />
      </g>
      {tank > 0 && (
        <g transform={`translate(330 720) scale(${tank})`}>
          <rect x={-200} y={-80} width={400} height={160} rx={20} fill="#1b4d8a" stroke={C.sky} strokeWidth={4} />
          <path d={`M -200 ${-40 + Math.sin(t * 2) * 5} Q 0 ${-60 + Math.sin(t * 2) * 5} 200 ${-40 + Math.sin(t * 2) * 5}`} fill="none" stroke={C.sky} strokeWidth={3} />
          <Txt x={0} y={20} size={26}>
            ищут распад протона
          </Txt>
          {none > 0 && (
            <Txt x={0} y={120} size={28} color={C.coral} opacity={none}>
              не найден — ни тогда, ни сейчас
            </Txt>
          )}
        </g>
      )}
      {higgs > 0 && (
        <g transform={`translate(980 470) scale(${higgs})`}>
          <Panel x={-250} y={-230} w={500} h={460} stroke={C.orange} sw={4} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r = 60 + (i % 3) * 40 + ((t * 40) % 40);
            return <line key={i} x1={0} y1={-20} x2={Math.cos(a) * r} y2={-20 + Math.sin(a) * r} stroke={i % 2 ? C.yellow : C.cyan} strokeWidth={3} />;
          })}
          <circle cx={0} cy={-20} r={18} fill={C.white} />
          <Txt x={0} y={150} size={32} color={C.orange}>
            2012 · бозон Хиггса
          </Txt>
          <Txt x={0} y={195} size={22} color={C.dim}>
            ЦЕРН · после книги
          </Txt>
          <Note x={0} y={-200} text="схема столкновения, не снимок" />
        </g>
      )}
    </Stage>
  );
};
