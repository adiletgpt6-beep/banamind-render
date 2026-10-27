// Часть «Стрелы времени»: падающая чашка и обратная запись, пазл и энтропия,
// три стрелы, память компьютера и тепло, горячая модель ранней Вселенной,
// инфляция (гипотеза), признанная ошибка Хокинга.
import React from "react";
import { C, FONT } from "../theme";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Cup, Galaxy, Note, Spark, Stage, Sun } from "./space";

const rnd = (i: number) => {
  const x = Math.sin(i * 47.77 + 1.9) * 10000;
  return x - Math.floor(x);
};

// кадр «киноплёнки»
const Frame: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode; label: string; col: string }> = ({ x, y, w, h, children, label, col }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={C.night} stroke={col} strokeWidth={5} />
    {Array.from({ length: 6 }).map((_, i) => (
      <g key={i}>
        <rect x={-w / 2 + 16 + i * ((w - 40) / 5)} y={-h / 2 - 26} width={18} height={14} rx={3} fill={col} opacity={0.6} />
        <rect x={-w / 2 + 16 + i * ((w - 40) / 5)} y={h / 2 + 12} width={18} height={14} rx={3} fill={col} opacity={0.6} />
      </g>
    ))}
    {children}
    <text y={h / 2 + 70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={col}>
      {label}
    </text>
  </g>
);

// ── a01: «вперёд» и «назад» ──
export const CupFilm: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const laws = pop(t, 0.4);
  const play = at(c, 1);
  const cyc = (t - play) % 4;
  const fwd = t > play ? clamp01(cyc / 2.2) : 0;
  const rev = t > at(c, 1.6) ? 1 - clamp01(((t - at(c, 1.6)) % 4) / 2.2) : 1;
  const why = pop(t, at(c, 2));
  const fallY = (k: number) => (k < 0.5 ? -90 + k * 2 * 170 : 80);
  const broke = (k: number) => (k < 0.5 ? 0 : (k - 0.5) * 2);
  return (
    <Stage host={c.p.host}>
      {laws > 0 && (
        <g transform={`translate(640 160) scale(${laws})`}>
          <Tag x={0} y={0} text="законы: вперёд = назад" color={C.white} size={34} />
        </g>
      )}
      {t > play && (
        <>
          <Frame x={330} y={470} w={460} h={360} label="запись" col={C.green}>
            <rect x={-200} y={-30} width={160} height={14} fill={C.amber} />
            <Cup x={-120 + fwd * 120} y={fallY(fwd) - 40} s={0.6} k={broke(fwd)} />
          </Frame>
          {t > at(c, 1.6) && (
            <Frame x={950} y={470} w={460} h={360} label="задом наперёд" col={C.red}>
              <rect x={-200} y={-30} width={160} height={14} fill={C.amber} />
              <Cup x={-120 + rev * 120} y={fallY(rev) - 40} s={0.6} k={broke(rev)} />
              <Cross x={160} y={-120} s={70} k={ramp(t, at(c, 1.6) + 2.2, 0.5)} />
            </Frame>
          )}
        </>
      )}
      {why > 0 && (
        <g transform={`translate(640 820) scale(${why})`}>
          <Tag x={0} y={0} text="почему мы отличаем прошлое от будущего?" color={C.yellow} size={32} />
        </g>
      )}
    </Stage>
  );
};

// ── a02: пазл — порядок один, беспорядков множество ──
export const Puzzle: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const shake = ramp(t, at(c, 0.6), at(c, 1.5) - at(c, 0.6));
  const count = ramp(t, at(c, 1), 1.2);
  const law = pop(t, at(c, 3));
  const N = 4;
  const S = 90;
  const cols = [C.sky, C.violet, C.yellow, C.green];
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 440)">
        <rect x={-210} y={-210} width={420} height={420} rx={20} fill={C.glass} stroke={C.glassLine} strokeWidth={3} transform={`rotate(${Math.sin(t * 18) * 4 * (shake > 0 && shake < 1 ? 1 : 0)})`} />
        {Array.from({ length: N * N }).map((_, i) => {
          const gx = (i % N) * S - (N * S) / 2 + S / 2;
          const gy = Math.floor(i / N) * S - (N * S) / 2 + S / 2;
          const rx = (rnd(i) - 0.5) * 300;
          const ry = (rnd(i + 50) - 0.5) * 300;
          const x = gx + (rx - gx) * shake;
          const y = gy + (ry - gy) * shake;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${shake * (rnd(i + 90) - 0.5) * 180})`}>
              <rect x={-S / 2 + 3} y={-S / 2 + 3} width={S - 6} height={S - 6} rx={10} fill={cols[Math.floor(i / N)]} opacity={0.9} />
              <circle cx={S / 2 - 6} cy={0} r={11} fill={cols[Math.floor(i / N)]} />
            </g>
          );
        })}
        <Txt x={0} y={280} size={28} color={C.dim}>
          {shake > 0.5 ? "после встряхивания" : "собранная картинка"}
        </Txt>
      </g>
      {count > 0 && (
        <g opacity={count} transform="translate(980 340)">
          <Panel x={-240} y={-120} w={480} h={260} />
          <Txt x={0} y={-50} size={30}>
            порядок:
          </Txt>
          <Txt x={0} y={0} size={44} color={C.green}>
            1 способ
          </Txt>
          <Txt x={0} y={60} size={30}>
            беспорядок:
          </Txt>
          <Txt x={0} y={110} size={44} color={C.coral}>
            ≈ бесчисленно
          </Txt>
        </g>
      )}
      {law > 0 && (
        <g transform={`translate(980 680) scale(${law})`}>
          <Tag x={0} y={0} text="второй закон термодинамики" color={C.green} size={32} textColor={C.night} />
          <Txt x={0} y={70} size={26} color={C.dim}>
            энтропия замкнутой системы растёт
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── a03: три стрелы ──
export const ThreeArrows: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const A = [
    { at: at(c, 1), label: "термодинамическая", sub: "растёт беспорядок", col: C.coral },
    { at: at(c, 1.55), label: "психологическая", sub: "помним прошлое", col: C.violet },
    { at: at(c, 2), label: "космологическая", sub: "Вселенная расширяется", col: C.sky },
  ];
  const same = ramp(t, at(c, 3), 1);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={170}>
        <Txt x={0} y={0} size={42} color={C.yellow}>
          три стрелы времени
        </Txt>
      </Pop>
      {A.map((a, i) => {
        const k = ramp(t, a.at, 0.8);
        if (k <= 0) return null;
        const y = 300 + i * 170;
        const wig = (1 - same) * (i - 1) * 0.25;
        return (
          <g key={i} transform={`translate(640 ${y}) rotate(${wig * 40})`} opacity={k}>
            <Arrow x1={-500} y1={0} x2={-500 + 1000 * k} y2={0} k={1} color={a.col} w={14} />
            <Txt x={-470} y={-30} size={30} anchor="start">
              {a.label}
            </Txt>
            <Txt x={480} y={-30} size={24} color={C.dim} anchor="end">
              {a.sub}
            </Txt>
          </g>
        );
      })}
      {same > 0 && (
        <g opacity={same}>
          <Txt x={640} y={860} size={36} color={C.yellow}>
            все смотрят в одну сторону — почему?
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── a04: память и тепло ──
export const Memory: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const write = ramp(t, at(c, 1), 1.6);
  const heat = ramp(t, at(c, 1.5), 1.2);
  const bal = pop(t, at(c, 2));
  const past = pop(t, at(c, 3));
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 400)">
        <rect x={-230} y={-160} width={460} height={300} rx={24} fill="#1c2756" stroke={C.glassLine} strokeWidth={3} />
        {Array.from({ length: 24 }).map((_, i) => {
          const on = i / 24 < write;
          const ordered = i % 2 === 0;
          return <rect key={i} x={-200 + (i % 8) * 50} y={-130 + Math.floor(i / 8) * 80} width={40} height={60} rx={8} fill={on ? (ordered ? C.yellow : C.sky) : rnd(i + Math.floor(t * 3)) > 0.5 ? C.faint : C.deep} />;
        })}
        <g transform={`translate(200 -190) rotate(${t * 500})`} opacity={heat}>
          {[0, 1, 2].map((i) => (
            <ellipse key={i} rx={16} ry={44} fill={C.dim} transform={`rotate(${i * 120}) translate(0 -36)`} />
          ))}
        </g>
        {heat > 0 &&
          Array.from({ length: 10 }).map((_, i) => {
            const p = ((t * 0.6 + i * 0.1) % 1);
            return <path key={i} d={`M ${-180 + i * 40} ${150 + p * 10} q 10 ${-30 - p * 60} 0 ${-60 - p * 120}`} fill="none" stroke={C.orange} strokeWidth={4} opacity={(1 - p) * heat} transform={`translate(0 ${p * 120})`} />;
          })}
        <Txt x={0} y={240} size={28} color={C.dim}>
          память + вентилятор
        </Txt>
      </g>
      {bal > 0 && (
        <g transform={`translate(980 340) scale(${bal})`}>
          <line x1={-200} y1={0} x2={200} y2={0} stroke={C.text} strokeWidth={6} transform="rotate(12)" />
          <polygon points="-20,40 20,40 0,0" fill={C.text} />
          <rect x={-230} y={-90} width={110} height={80} rx={10} fill={C.yellow} transform="rotate(12) translate(0 30)" />
          <rect x={110} y={-110} width={130} height={130} rx={10} fill={C.orange} transform="rotate(12) translate(0 30)" />
          <Txt x={-150} y={130} size={24} color={C.yellow}>
            порядок в памяти
          </Txt>
          <Txt x={150} y={170} size={24} color={C.orange}>
            беспорядок от тепла
          </Txt>
        </g>
      )}
      {past > 0 && (
        <g transform={`translate(980 700) scale(${past})`}>
          <Tag x={0} y={0} text="помним то, где энтропии было меньше" color={C.violet} size={30} textColor={C.white} />
        </g>
      )}
    </Stage>
  );
};

// ── a05: горячая модель: остывание, гелий, галактики и звёзды ──
export const HotStart: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cool = ramp(t, at(c, 1), c.dur - at(c, 1) - 1);
  const sec = pop(t, at(c, 1.4));
  const he = pop(t, at(c, 2));
  const gal = ramp(t, at(c, 3), 1.4);
  const R = 120 + cool * 260;
  const bg = `rgb(${Math.round(255 - cool * 200)}, ${Math.round(160 - cool * 120)}, ${Math.round(60 + cool * 30)})`;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(400 470)">
        <circle r={R} fill={bg} opacity={0.35 + 0.3 * (1 - cool)} />
        {Array.from({ length: 50 }).map((_, i) => {
          const a = rnd(i) * Math.PI * 2;
          const r = rnd(i + 70) * R * 0.92;
          const isHe = i % 4 === 0 && he > 0;
          return <circle key={i} cx={Math.cos(a + t * 0.05) * r} cy={Math.sin(a + t * 0.05) * r} r={isHe ? 12 : 7} fill={isHe ? C.violet : C.yellow} opacity={gal > 0.5 ? 0.2 : 0.85} />;
        })}
        {gal > 0 &&
          [0, 1, 2, 3].map((i) => (
            <Galaxy key={i} x={Math.cos(i * 1.7) * R * 0.55} y={Math.sin(i * 1.7) * R * 0.5} s={0.35 * gal} t={t + i} color={[C.sky, C.pink, C.amber, C.violet][i]} />
          ))}
      </g>
      {sec > 0 && (
        <g transform={`translate(1020 260) scale(${sec})`}>
          <Txt x={0} y={0} size={30}>
            через 1 секунду:
          </Txt>
          <Txt x={0} y={50} size={40} color={C.orange}>
            ~10 млрд градусов
          </Txt>
        </g>
      )}
      {he > 0 && (
        <g transform={`translate(1020 450) scale(${he})`}>
          <circle cx={-170} cy={-10} r={14} fill={C.violet} />
          <Txt x={20} y={0} size={30}>
            гелий ≈ ¼ вещества
          </Txt>
          <Check x={-210} y={50} s={30} k={ramp(t, at(c, 2) + 1)} />
          <Txt x={20} y={60} size={24} color={C.green}>
            подтверждают наблюдения
          </Txt>
        </g>
      )}
      {gal > 0 && (
        <g opacity={gal} transform="translate(1020 680)">
          <Sun x={-180} y={0} r={26} t={t} />
          <Spark x={-100} y={-10} r={30} color={C.white} />
          <Txt x={40} y={10} size={28}>
            звёзды «сварили»
          </Txt>
          <Txt x={40} y={50} size={28}>
            тяжёлые элементы
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── a06: загадки и инфляция ──
export const Inflation: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const q2 = pop(t, at(c, 1));
  const inf = ramp(t, at(c, 2), 1.6);
  const hyp = pop(t, at(c, 3));
  const R = 40 + inf * 210;
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={330} y={200}>
        <Txt x={0} y={0} size={30}>
          почему так одинаково?
        </Txt>
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${(i ? 1 : -1) * 180} 90)`}>
            <circle r={40} fill={C.sky} opacity={0.6} />
            <Txt x={0} y={10} size={24} color={C.night}>
              2,7 K
            </Txt>
          </g>
        ))}
        <path d="M -130 90 Q 0 40 130 90" fill="none" stroke={C.coral} strokeWidth={3} strokeDasharray="6 8" />
        <Txt x={0} y={180} size={22} color={C.dim}>
          «не успели договориться»?
        </Txt>
      </Pop>
      {q2 > 0 && (
        <g transform={`translate(330 560) scale(${q2})`}>
          <Txt x={0} y={0} size={28}>
            и скорость — точно на границе?
          </Txt>
        </g>
      )}
      {inf > 0 && (
        <g transform="translate(960 450)">
          <clipPath id="infl-clip">
            <circle r={R} />
          </clipPath>
          <circle r={R} fill="#24306a" />
          <g clipPath="url(#infl-clip)">
            <path d={Array.from({ length: 40 }).map((_, i) => `${i ? "L" : "M"} ${-R + (i / 39) * 2 * R} ${Math.sin(i * 1.3) * 40 * (1 - inf)}`).join(" ")} fill="none" stroke={C.cyan} strokeWidth={4} opacity={1 - inf} />
          </g>
          <circle r={R} fill="none" stroke={C.cyan} strokeWidth={3} />
          <Txt x={0} y={R + 46} size={26} opacity={inf}>
            быстрое раздувание сглаживает
          </Txt>
        </g>
      )}
      {hyp > 0 && (
        <g transform={`translate(330 760) scale(${hyp})`}>
          <Tag x={0} y={0} text="инфляция: согласуется, но не доказана" color={C.pink} size={32} />
        </g>
      )}
      <Note x={960} y={190} text="идея Алана Гута" o={ramp(t, at(c, 2))} />
    </Stage>
  );
};

// ── a07: «я ошибся» ──
export const Mistake: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const idea = pop(t, 0.4);
  const fix = ramp(t, at(c, 1), 0.8);
  const ein = pop(t, at(c, 2));
  const lesson = pop(t, at(c, 3));
  return (
    <Stage host={c.p.host}>
      {idea > 0 && (
        <g transform={`translate(330 300) scale(${idea})`}>
          <Panel x={-270} y={-110} w={540} h={220} />
          <Txt x={0} y={-30} size={28}>
            «при сжатии стрела
          </Txt>
          <Txt x={0} y={20} size={28}>
            повернёт назад»
          </Txt>
          <Cross x={210} y={-70} s={70} k={fix} />
        </g>
      )}
      {fix > 0 && (
        <g opacity={fix} transform="translate(330 560)">
          <Txt x={0} y={0} size={28} color={C.dim}>
            Дон Пейдж и Реймонд Лафламм
          </Txt>
          <Txt x={0} y={80} size={60} color={C.yellow}>
            «Я ошибся»
          </Txt>
        </g>
      )}
      {ein > 0 && (
        <g transform={`translate(960 330) scale(${ein})`}>
          <Txt x={0} y={0} size={28}>
            даже Эйнштейн:
          </Txt>
          <Txt x={0} y={44} size={28} color={C.sky}>
            постоянная — «ошибка»
          </Txt>
        </g>
      )}
      {lesson > 0 && (
        <g transform={`translate(960 620) scale(${lesson})`}>
          <Panel x={-270} y={-100} w={540} h={210} stroke={C.yellow} sw={3} />
          <Txt x={0} y={-20} size={30}>
            сила науки —
          </Txt>
          <Txt x={0} y={30} size={30} color={C.yellow}>
            ошибки находят
          </Txt>
          <Txt x={0} y={74} size={30} color={C.yellow}>
            и исправляют
          </Txt>
        </g>
      )}
    </Stage>
  );
};
