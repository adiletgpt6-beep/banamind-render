// Вступление: двое часов на разной высоте, два вопроса фильма, книга и честные
// метки, легенда меток, «пульт масштаба» воображаемой лаборатории.
import React from "react";
import { CLAIMS } from "../components/ClaimBadge";
import { C, FONT } from "../theme";
import type { Claim } from "../types";
import { Arrow, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Clock, Earth, Galaxy, Note, Stage, Sun } from "./space";

// ── h01 / z01: двое часов — внизу и наверху; верхние «спешат» (разница увеличена) ──
export const TwoClocks: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const up = ramp(t, at(c, 1), 1.4);
  const diff = ramp(t, at(c, 2), 2.2);
  const base = t * 0.25;
  const topY = 330 - up * 90;
  return (
    <Stage host={c.p.host}>
      {/* земля и башня */}
      <path d="M 0 900 Q 640 820 1280 900 L 1280 1080 L 0 1080 Z" fill="#2c3a6e" />
      <rect x={300} y={topY + 90} width={70} height={900 - topY - 90} rx={10} fill={C.deep} stroke={C.glassLine} strokeWidth={3} opacity={clamp01(up * 2)} />
      <Pop t={t} at={0.2} x={335} y={780}>
        <Clock x={0} y={0} r={95} phase={base} color={C.sky} />
      </Pop>
      <Pop t={t} at={0.5} x={335} y={topY}>
        <Clock x={0} y={0} r={95} phase={base + diff * 0.12} color={C.yellow} glow={diff} />
      </Pop>
      {diff > 0 && (
        <g opacity={diff}>
          <Panel x={560} y={330} w={620} h={330} />
          <Txt x={870} y={420} size={40} color={C.yellow}>
            наверху: быстрее
          </Txt>
          <Txt x={870} y={490} size={40} color={C.sky}>
            внизу: медленнее
          </Txt>
          <Txt x={870} y={580} size={30} color={C.dim}>
            никто часы не ломал
          </Txt>
          <Arrow x1={560} y1={420} x2={450} y2={topY} k={ramp(t, at(c, 2) + 0.6, 0.6)} color={C.yellow} w={7} />
          <Arrow x1={560} y1={490} x2={450} y2={770} k={ramp(t, at(c, 2) + 0.9, 0.6)} color={C.sky} w={7} />
        </g>
      )}
      <Note x={870} y={720} text="разница в кадре сильно увеличена" o={diff} />
    </Stage>
  );
};

// ── h02: два больших вопроса ──
export const BigQuestion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const q2 = pop(t, at(c, 1));
  return (
    <Stage host={c.p.host}>
      <g transform={`translate(640 300) rotate(${Math.sin(t * 0.8) * 2})`}>
        <Clock x={-360} y={0} r={110} phase={t * 0.6} color={C.sky} />
        <Txt x={120} y={-20} size={64} color={C.text}>
          Что такое
        </Txt>
        <Txt x={120} y={60} size={80} color={C.yellow}>
          время?
        </Txt>
      </g>
      {q2 > 0 && (
        <g transform={`translate(640 650) scale(${q2})`}>
          <Panel x={-560} y={-110} w={1120} h={220} />
          <Txt x={0} y={-15} size={50} color={C.text}>
            Было ли у него начало —
          </Txt>
          <Txt x={0} y={60} size={50} color={C.amber}>
            и где кончается знание?
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// обложка-книга BanaMind (своя схема, не обложка издательства)
export const BookCover: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 0.7) * 2})`}>
    <rect x={-170} y={-230} width={340} height={460} rx={18} fill="#1a2350" stroke={C.yellow} strokeWidth={6} />
    <rect x={-170} y={-230} width={34} height={460} rx={8} fill="#121a3e" />
    <Galaxy x={18} y={-50} s={0.9} t={t} color={C.violet} />
    <circle cx={18} cy={-50} r={34} fill="#000" stroke="#ffb347" strokeWidth={5} />
    <text x={18} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.text}>
      Краткая история
    </text>
    <text x={18} y={152} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.yellow}>
      времени
    </text>
    <text x={18} y={196} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.dim}>
      Стивен Хокинг
    </text>
  </g>
);

// ── h03: книга, эпоха, три автора ──
export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const era = pop(t, at(c, 1));
  const honest = ramp(t, at(c, 2), 0.6);
  const voices = at(c, 3);
  const people = [
    { name: "Хокинг", sub: "главы 1–11", color: C.skyDeep },
    { name: "Саган", sub: "предисловие", color: C.violetDeep },
    { name: "Смородинский", sub: "послесловие", color: C.coral },
  ];
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.2} x={300} y={460}>
        <BookCover x={0} y={0} t={t} />
      </Pop>
      {era > 0 && (
        <g transform={`translate(860 230) scale(${era})`}>
          <Tag x={0} y={0} text="конец 1980-х" color={C.yellow} size={42} />
          <Txt x={0} y={80} size={30} color={C.dim}>
            новое после книги — оранжевой меткой
          </Txt>
        </g>
      )}
      {honest > 0 && t < voices && (
        <g opacity={honest * clamp01((voices - t) * 2)}>
          <Panel x={570} y={380} w={600} h={190} />
          <Txt x={870} y={460} size={38} color={C.text}>
            не аудиокнига
          </Txt>
          <Txt x={870} y={520} size={34} color={C.yellow}>
            свои слова и примеры
          </Txt>
        </g>
      )}
      {people.map((p, i) => {
        const k = pop(t, voices + 0.3 + i * 0.5);
        if (k <= 0) return null;
        return (
          <g key={p.name} transform={`translate(${650 + i * 230} 520) scale(${k})`}>
            <circle r={78} fill={p.color} opacity={0.9} />
            <circle r={78} fill="none" stroke={C.white} strokeWidth={4} opacity={0.6} />
            <Txt x={0} y={22} size={64} color={C.white}>
              {p.name.charAt(0)}
            </Txt>
            <Txt x={0} y={122} size={28} color={C.text}>
              {p.name}
            </Txt>
            <Txt x={0} y={160} size={24} color={C.dim}>
              {p.sub}
            </Txt>
          </g>
        );
      })}
      {t > voices + 1.8 && <Note x={880} y={760} text="три разных голоса — не смешиваем" o={ramp(t, voices + 1.8)} />}
    </Stage>
  );
};

// ── h04: легенда меток ──
export const Legend: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const order: { k: Claim; beat: number }[] = [
    { k: "book", beat: 0.25 },
    { k: "fact", beat: 0.65 },
    { k: "model", beat: 1.05 },
    { k: "hypo", beat: 1.55 },
    { k: "opinion", beat: 2.05 },
    { k: "update", beat: 2.55 },
    { k: "lab", beat: 3.05 },
    { k: "film", beat: 3.6 },
  ];
  return (
    <Stage host={c.p.host}>
      {order.map((o, i) => {
        const k = pop(t, at(c, o.beat));
        if (k <= 0) return null;
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cl = CLAIMS[o.k];
        return (
          <g key={o.k} transform={`translate(${30 + col * 620} ${190 + row * 160}) scale(${0.85 + 0.15 * k})`} opacity={clamp01(k * 1.4)}>
            <rect x={0} y={-50} width={590} height={110} rx={55} fill="rgba(14,20,48,0.85)" stroke={cl.color} strokeWidth={4} />
            <circle cx={58} cy={5} r={34} fill={cl.color} />
            <text x={110} y={18} fontFamily={FONT} fontWeight={800} fontSize={cl.label.length > 24 ? 27 : 31} fill={C.text}>
              {cl.label}
            </text>
          </g>
        );
      })}
    </Stage>
  );
};

// ── h05: пульт масштаба: атом ← человек → звёзды → галактики ──
export const ScaleDial: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const turnR = ramp(t, at(c, 1.2), 1.4);
  const turnL = ramp(t, at(c, 1.6), 1.4);
  const ang = -60 + 120 * turnR - 220 * turnL * 0 + (turnL > 0 ? -170 * turnL : 0);
  const both = ramp(t, at(c, 2), 1);
  const back = ramp(t, at(c, 3), 1);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={560}>
        <circle r={210} fill={C.deep} stroke={C.glassLine} strokeWidth={6} />
        {Array.from({ length: 25 }).map((_, i) => {
          const q = ((-120 + i * 10) * Math.PI) / 180;
          return <line key={i} x1={Math.sin(q) * 170} y1={-Math.cos(q) * 170} x2={Math.sin(q) * 195} y2={-Math.cos(q) * 195} stroke={i % 6 === 0 ? C.yellow : C.faint} strokeWidth={i % 6 === 0 ? 6 : 3} />;
        })}
        <g transform={`rotate(${ang})`}>
          <circle r={120} fill="#26326a" />
          <rect x={-12} y={-150} width={24} height={110} rx={12} fill={C.yellow} />
        </g>
        <circle r={28} fill={C.yellow} />
        <Txt x={0} y={290} size={34} color={C.dim}>
          пульт масштаба
        </Txt>
      </Pop>
      {/* левый конец — атом */}
      <g opacity={Math.max(ramp(t, at(c, 1.6), 0.6), both)} transform="translate(170 300)">
        <circle r={22} fill={C.coral} />
        {[0, 60, 120].map((a) => (
          <ellipse key={a} rx={90} ry={30} fill="none" stroke={C.sky} strokeWidth={4} transform={`rotate(${a + t * 20})`} />
        ))}
        <Txt x={0} y={150} size={32}>
          атом
        </Txt>
      </g>
      {/* правый конец — звёзды и галактики */}
      <g opacity={Math.max(ramp(t, at(c, 1.2), 0.6), both)} transform="translate(1100 290)">
        <Galaxy x={0} y={0} s={0.9} t={t} color={C.violet} />
        <Sun x={-120} y={-80} r={22} t={t} />
        <Txt x={0} y={160} size={32}>
          галактики
        </Txt>
      </g>
      {both > 0 && (
        <g opacity={both}>
          <Arrow x1={380} y1={260} x2={900} y2={260} k={both} color={C.yellow} w={8} />
          <Arrow x1={900} y1={300} x2={380} y2={300} k={both} color={C.sky} w={8} />
        </g>
      )}
      {back > 0 && (
        <g opacity={back} transform="translate(640 160)">
          <Earth x={-80} y={0} r={36} t={t} />
          <Clock x={40} y={-6} r={38} phase={t * 0.4} color={C.yellow} />
          <Clock x={140} y={-6} r={38} phase={t * 0.4 + 0.05} color={C.sky} />
        </g>
      )}
    </Stage>
  );
};
