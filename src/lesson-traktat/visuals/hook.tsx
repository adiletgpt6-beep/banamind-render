// Новое вступление (≈1 мин): крючок с опрокинутыми баночками, три удивительных
// вопроса, главный вопрос, «трейлер» урока и открытие книги. Только примеры из записи.
import React from "react";
import { interpolate } from "remotion";
import { C } from "../theme";
import { Book, Drop, Fly, Flower, Jar, OL, Palace, Person, Seed, Shard, Sun, Tree } from "./draw";
import { Crossroads } from "./intro";
import { Pop, Tag, Txt, at, clamp01, ease, pop, ramp, wob, type VisualProps } from "./kit";

const JAR_COLORS = ["#ff8fa3", "#7fd1ae", "#ffd166", "#9bb8ff", "#c79bff", "#ffad7a", "#7ad3e6", "#e6a3d4"];

// большой знак «?!» над головой банана
const Exclaim: React.FC<{ x: number; y: number; k: number; t: number; text?: string; color?: string }> = ({ x, y, k, t, text = "?!", color = C.red }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) rotate(${wob(t * 3, 1, 6)})`}>
      <Txt x={0} y={0} size={120} weight={900} color={color}>
        {text}
      </Txt>
    </g>
  );
};

// ── 1. Крючок: ветер опрокидывает баночки в аптеке ──
export const HookPharmacy: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const wind = ramp(t, 0.05, 0.5) * (1 - ramp(t, at(c, 1), 0.6));
  const fall = ramp(t, 0.35, 1.8);
  const mix = ramp(t, 1.2, 1.4);
  const cure = pop(t, at(c, 1.4));
  const doubt = ramp(t, at(c, 1.72), 0.5);
  const bowlX = 640;
  const bowlY = 800;
  return (
    <g>
      {/* полки */}
      <rect x={110} y={120} width={1060} height={470} rx={36} fill="#fff7ea" />
      {[0, 1].map((r) => (
        <rect key={r} x={140} y={330 + r * 220} width={1000} height={16} rx={8} fill="#c98b4a" />
      ))}
      {Array.from({ length: 12 }).map((_, i) => {
        const row = Math.floor(i / 6);
        const col = i % 6;
        const jx = 230 + col * 165;
        const jy = 326 + row * 220;
        const my = clamp01(fall * 1.7 - ((i * 5) % 12) / 14);
        const tilt = wob(t * 2, i, 6) * wind + my * (i % 2 ? 110 : -110);
        const dx = (bowlX - jx) * ease(my) * 0.55;
        const dy = my * my * (bowlY - 120 - jy);
        return <Jar key={i} x={jx + dx} y={jy + dy} color={JAR_COLORS[i % 8]} level={0.7} s={1.1} tilt={tilt} />;
      })}
      {/* струйки разноцветных веществ */}
      {fall > 0.2 &&
        mix < 1 &&
        Array.from({ length: 6 }).map((_, i) => (
          <path key={i} d={`M ${bowlX - 120 + i * 48} ${560 + ((t * 300 + i * 40) % 120)} q 10 40 ${(i - 2.5) * -12} 90`} stroke={JAR_COLORS[i]} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.8 * (1 - mix)} />
        ))}
      {/* ветер */}
      {wind > 0 &&
        [0, 1, 2, 3].map((i) => {
          const x0 = -300 + ((t * 900 + i * 320) % 1500);
          return <path key={i} d={`M ${x0} ${170 + i * 120} q 70 -36 140 0 t 140 0`} stroke="#9cb3c9" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.85 * wind} />;
        })}
      {/* миска: смесь → «точное лекарство»?! → сомнение */}
      <g transform={`translate(${bowlX} ${bowlY})`}>
        <path d="M -150 -50 Q -150 90 0 90 Q 150 90 150 -50 Z" fill="#fff" stroke={OL} strokeWidth={6} />
        <ellipse cx={0} cy={-50} rx={140 * mix} ry={26 * mix} fill={doubt > 0.5 ? "#8d7b68" : interpolate(mix, [0, 1], [0, 1]) > 0.9 ? "#ff9fb4" : "#c9a0d8"} />
        <ellipse cx={0} cy={-50} rx={150} ry={30} fill="none" stroke={OL} strokeWidth={6} />
      </g>
      {cure > 0 && (
        <g transform={`translate(${bowlX + 300} ${bowlY - 110}) scale(${cure}) rotate(${wob(t, 2, 4)})`} opacity={1 - doubt * 0.6}>
          <path d="M -40 -110 L 40 -110 L 40 -80 Q 70 -60 70 -20 L 70 60 Q 70 80 50 80 L -50 80 Q -70 80 -70 60 L -70 -20 Q -70 -60 -40 -80 Z" fill="#cdeaff" stroke={OL} strokeWidth={5} />
          <rect x={-46} y={-140} width={92} height={32} rx={8} fill={C.coral} stroke={OL} strokeWidth={4} />
          <path d="M -12 -10 L 12 -10 L 12 10 L 32 10 L 32 34 L 12 34 L 12 54 L -12 54 L -12 34 L -32 34 L -32 10 L -12 10 Z" fill={C.red} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={C.yellowDeep} transform={`translate(${Math.cos(i * 1.6 + t * 2) * 110} ${-40 + Math.sin(i * 1.6 + t * 2) * 90}) scale(${0.7 + 0.4 * Math.sin(t * 6 + i)})`} />
          ))}
        </g>
      )}
      <Pop t={t} at={at(c, 1.45)} x={bowlX} y={655}>
        <Tag x={0} y={0} text="точное лекарство — само?!" size={40} color={C.yellow} />
      </Pop>
      <Exclaim x={1330} y={420} k={pop(t, at(c, 0.15)) * (1 - ramp(t, at(c, 1.7), 0.15))} t={t} text="!" color={C.coral} />
      <Exclaim x={1330} y={420} k={pop(t, at(c, 1.72))} t={t} />
    </g>
  );
};

// ── 2. Три удивительных вопроса (карточки въезжают по очереди) ──
const Card: React.FC<{ k: number; small: number; slot: number; children: React.ReactNode; color: string }> = ({ k, small, slot, children, color }) => {
  if (k <= 0) return null;
  // большая карточка в центре зоны → маленькая миниатюра наверху
  const bx = interpolate(k, [0, 1], [2300, 1170]);
  const x = interpolate(small, [0, 1], [bx, 760 + slot * 300]);
  const y = interpolate(small, [0, 1], [540, 190]);
  const s = interpolate(small, [0, 1], [1, 0.32]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${(1 - k) * 8})`}>
      <rect x={-380} y={-290} width={760} height={560} rx={44} fill="#24324a" opacity={0.12} transform="translate(10 14)" />
      <rect x={-380} y={-290} width={760} height={560} rx={44} fill={color} stroke={OL} strokeWidth={6} />
      {children}
      <g transform="translate(320 -230)">
        <circle r={56} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <Txt x={0} y={26} size={78} weight={900}>
          ?
        </Txt>
      </g>
    </g>
  );
};

export const Teaser: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kA = pop(t, 0);
  const kB = pop(t, at(c, 1) - 0.15);
  const kC = pop(t, at(c, 2) - 0.15);
  const sA = ramp(t, at(c, 1) - 0.25, 0.5);
  const sB = ramp(t, at(c, 2) - 0.25, 0.5);
  const pull = ramp(t, at(c, 0.3), 1.6);
  const grow = ramp(t, at(c, 2.35), 1.6);
  const causes = [
    <Sun key="s" x={0} y={0} r={36} t={t} />,
    <ellipse key="c" rx={56} ry={32} fill="#e8eef5" stroke={OL} strokeWidth={4} />,
    <circle key="e" r={40} fill="#b98b5a" stroke={OL} strokeWidth={4} />,
    <Drop key="d" x={0} y={0} s={1} glint={0} />,
    <path key="w" d="M -44 0 q 22 -26 44 0 t 44 0" stroke="#7d93ab" strokeWidth={11} fill="none" strokeLinecap="round" />,
    <path key="f" d="M 0 -42 Q 34 0 0 38 Q -34 0 0 -42 Z" fill="#ff9f43" stroke={OL} strokeWidth={4} />,
  ];
  return (
    <g>
      <Card k={kA} small={sA} slot={0} color="#eaf6ff">
        <Fly x={0} y={40} s={2.1} t={t} />
        {causes.map((el, i) => {
          const a = (i / causes.length) * Math.PI * 2 + t * 0.6;
          const r = 250 * (1 - pull * 0.78);
          return (
            <g key={i} transform={`translate(${Math.cos(a) * r} ${30 + Math.sin(a) * r * 0.75}) scale(${1 - pull * 0.6})`}>
              {el}
            </g>
          );
        })}
        <Txt x={0} y={240} size={38}>
          весь мир — в мухе?
        </Txt>
      </Card>
      <Card k={kB} small={sB} slot={1} color="#fff8dc">
        <Sun x={250} y={-170} r={60} t={t} />
        {[0, 1, 2, 3, 4].map((i) =>
          i % 2 ? (
            <Shard key={i} x={-280 + i * 130} y={110 + (i % 2) * 30} s={1.5} rot={i * 30} glint={0.8 + 0.4 * Math.sin(t * 5 + i)} />
          ) : (
            <Drop key={i} x={-280 + i * 130} y={100} s={1.4} glint={0.8 + 0.4 * Math.sin(t * 5 + i)} />
          ),
        )}
        <Txt x={0} y={240} size={38}>
          солнце в каждой капле?
        </Txt>
      </Card>
      <Card k={kC} small={0} slot={2} color="#eafbef">
        <path d="M -380 200 Q 0 170 380 200 L 380 270 L -380 270 Z" fill="#cfe9b5" />
        <g transform="translate(-180 120)">
          <Seed x={0} y={0} s={2.6 * (1 - grow * 0.4)} />
        </g>
        <g transform="translate(140 210)">
          <Tree x={0} y={0} s={0.85} pine grow={grow} />
        </g>
        <Txt x={0} y={-200} size={38}>
          семечко → огромная сосна?
        </Txt>
      </Card>
    </g>
  );
};

// ── 3. Главный вопрос ──
export const BigQuestion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const q = pop(t, at(c, 1));
  const shake = ramp(t, at(c, 1.5), 0.3);
  const items = [
    { k: pop(t, at(c, 0.05)), x: 330, y: 830, el: <Flower x={0} y={0} color={C.coral} s={1.6} t={t} /> },
    { k: pop(t, at(c, 0.25)), x: 1650, y: 900, el: <Tree x={0} y={0} s={1.2} t={t} fruits={7} /> },
    { k: pop(t, at(c, 0.6)), x: 1380, y: 900, el: <Person x={0} y={0} s={1.6} color={C.sky} t={t} arms={0.7} /> },
  ];
  // муха кружит вокруг головы банана
  const fa = t * 1.4;
  return (
    <g>
      {q > 0 && (
        <g transform={`translate(960 430) scale(${q * (1 + 0.04 * Math.sin(t * 4))})`} opacity={0.22}>
          <Txt x={0} y={260} size={900} weight={900} color={C.yellowDeep}>
            ?
          </Txt>
        </g>
      )}
      {items.map((it, i) => (
        <Pop key={i} t={t} at={0} x={it.x + wob(t * 8, i, 6) * shake} y={it.y}>
          <g transform={`scale(${it.k})`}>{it.el}</g>
        </Pop>
      ))}
      <Pop t={t} at={at(c, 0.15)} x={960 + Math.cos(fa) * 330} y={360 + Math.sin(fa * 1.3) * 90}>
        <Fly x={0} y={0} s={0.9} t={t} />
      </Pop>
      {shake > 0 &&
        [
          [330, 560],
          [1650, 390],
          [1380, 600],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${pop(t, at(c, 1.5) + i * 0.12)})`}>
            <circle r={34} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={42} weight={900}>
              ?
            </Txt>
          </g>
        ))}
      <Pop t={t} at={at(c, 1.45)} x={960} y={170}>
        <g>
          <rect x={-330} y={-70} width={660} height={110} rx={36} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={10} size={56} weight={900}>
            Само собой?
          </Txt>
        </g>
      </Pop>
    </g>
  );
};

// ── 4. «Трейлер»: книга и окошки с будущими примерами ──
const Frame: React.FC<{ x: number; y: number; k: number; label: string; children: React.ReactNode }> = ({ x, y, k, label, children }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect x={-200} y={-160} width={400} height={330} rx={22} fill="#2b3550" />
      {[-150, -90, -30, 30, 90, 150].map((dx) => (
        <g key={dx}>
          <rect x={dx - 10} y={-152} width={20} height={14} rx={3} fill="#fff" opacity={0.8} />
          <rect x={dx - 10} y={148} width={20} height={14} rx={3} fill="#fff" opacity={0.8} />
        </g>
      ))}
      <rect x={-184} y={-130} width={368} height={270} rx={12} fill="#fffdf6" />
      <svg x={-184} y={-130} width={368} height={270} viewBox="-184 -130 368 270" overflow="hidden">
        {children}
      </svg>
      <Tag x={0} y={220} text={label} size={28} color={C.white} />
    </g>
  );
};

export const Trailer: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const book = pop(t, at(c, 0) - 0.1);
  const shrink = ramp(t, at(c, 1) - 0.4, 0.6);
  const f1 = pop(t, at(c, 1.05));
  const f2 = pop(t, at(c, 1.5));
  const f3 = pop(t, at(c, 2));
  const swing = Math.sin(t * 2.2) * 10;
  const walk = ramp(t, at(c, 1.5), 2);
  const roads = [1, 1, 1, 1];
  const blocked = [0.25, 0.45, 0.65].map((f) => ramp(t, at(c, 2 + f), 0.4));
  return (
    <g>
      {book > 0 && (
        <g transform={`translate(${interpolate(shrink, [0, 1], [700, 700])} ${interpolate(shrink, [0, 1], [500, 190])}) scale(${book * interpolate(shrink, [0, 1], [1.5, 0.55])}) rotate(${wob(t, 1, 3)})`}>
          <Book x={0} y={0} color="#2f8f6a" title={"Трактат\nо природе"} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={C.yellowDeep} transform={`translate(${Math.cos(i * 1.3 + t) * 170} ${Math.sin(i * 1.3 + t) * 200}) scale(${0.8 + 0.4 * Math.sin(t * 5 + i)})`} />
          ))}
        </g>
      )}
      <Frame x={260} y={590} k={f1} label="аптека: всё до грамма">
        <g transform={`translate(0 20) rotate(${swing})`}>
          <rect x={-6} y={-90} width={12} height={110} fill="#8a5a2b" />
          <rect x={-130} y={-96} width={260} height={10} rx={5} fill="#8a5a2b" transform={`rotate(${swing * 0.5})`} />
          <Jar x={-100} y={-40} color="#ff8fa3" s={0.8} />
          <rect x={70} y={-70} width={60} height={34} rx={6} fill="#cbd5e1" stroke={OL} strokeWidth={3} />
          <Txt x={100} y={-44} size={22}>
            1 г
          </Txt>
        </g>
      </Frame>
      <Frame x={700} y={590} k={f2} label="дворец в пустыне">
        <path d="M -184 60 Q 0 30 184 60 L 184 140 L -184 140 Z" fill="#f3d9a4" />
        <Palace x={40} y={80} s={0.42} />
        <Person x={interpolate(walk, [0, 1], [-170, -90])} y={110} s={0.55} color="#d18b47" hat t={t * 3} />
        <g transform={`translate(40 -70) scale(${0.18 + 0.02 * Math.sin(t * 4)})`}>
          <Book x={0} y={0} color={C.skyDeep} />
        </g>
      </Frame>
      <Frame x={1140} y={590} k={f3} label="четыре дороги">
        <g transform="translate(0 -10) scale(0.3) translate(-960 -560)">
          <Crossroads t={t} cx={960} show={roads} blocked={blocked} open={ramp(t, at(c, 2.8), 0.5)} />
        </g>
      </Frame>
    </g>
  );
};

// ── 5. Начало путешествия: банан открывает книгу ──
export const JourneyStart: React.FC<VisualProps> = (c) => {
  const { t, dur } = c;
  const book = pop(t, 0.05);
  const open = ramp(t, at(c, 1.2), 1.1);
  const zoom = ramp(t, dur - 1.1, 1.0);
  const cx = 1170;
  return (
    <g>
      <g transform={`translate(${cx} 560) scale(${book * (1.25 + zoom * 2.8)})`} opacity={1 - zoom * 0.9}>
        {/* страницы со светом */}
        <rect x={-230} y={-160} width={460} height={320} rx={16} fill="#fffdf6" stroke={OL} strokeWidth={5} />
        <line x1={0} y1={-160} x2={0} y2={160} stroke="#e5d9bd" strokeWidth={4} />
        {open > 0 && (
          <g opacity={open}>
            <circle r={120 + 20 * Math.sin(t * 3)} fill={C.yellow} opacity={0.35} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path key={i} d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={C.yellowDeep} transform={`translate(${Math.cos(i + t * 1.5) * (90 + open * 80)} ${-60 - open * 120 + Math.sin(i * 2 + t) * 40}) scale(${0.8 + 0.5 * Math.sin(t * 4 + i)})`} />
            ))}
            <Flower x={-120} y={120} color={C.coral} s={0.7 * open} t={t} />
            <g transform={`translate(110 120) scale(${0.5 * open})`}>
              <Tree x={0} y={0} t={t} fruits={4} />
            </g>
          </g>
        )}
        {/* обложка поворачивается, как дверца */}
        <g transform={`translate(-230 0) scale(${1 - open * 2} 1) translate(230 0)`}>
          <g transform="translate(0 0) scale(1.07)">
            <rect x={-215} y={-150} width={430} height={300} rx={14} fill="#2f8f6a" stroke={OL} strokeWidth={5} />
            {open < 0.5 && (
              <g>
                <rect x={-140} y={-90} width={280} height={110} rx={12} fill="#fff" opacity={0.92} />
                <Txt x={0} y={-46} size={40}>
                  {"Трактат\nо природе"}
                </Txt>
              </g>
            )}
          </g>
        </g>
      </g>
      <Pop t={t} at={at(c, 1.5)} x={cx} y={150}>
        <Tag x={0} y={0} text="Открываем книгу" size={50} color={C.yellow} />
      </Pop>
      {zoom > 0 && <rect x={0} y={0} width={1920} height={1080} fill="#fffdf6" opacity={zoom * 0.85} />}
    </g>
  );
};

