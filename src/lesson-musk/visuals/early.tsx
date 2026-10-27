// Сцены BM-029 о книге и раннем пути: доступ автора, пять голосов, иск из
// Приложения 1, Blastar, деликатная сцена о детстве, дорога в Канаду, три сферы.
import React from "react";
import { C, DC, DISPLAY, FONT } from "../theme";
import { BookSymbol, DateCard } from "./objects";
import { Appear, area, Arrow, at, clamp01, Cross, Drift, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { Card, Label, OL, Person } from "./people";

// ── Как автор получил доступ ──
export const Access: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const nCards = t < b1 ? 0 : Math.min(10, Math.floor((t - b1 - 0.6) / 0.35) + 1);
  const net = ramp(t, b2, 1.2);
  const who = ["brother", "engineer", "investor", "assistant", "welder", "designer"] as const;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={500} amount={0.035}>
      {/* стол-ресторан и автор с блокнотом */}
      <g opacity={ramp(t, 0.1, 0.6)}>
        <rect x={cx - 420} y={650} width={420} height={26} rx={12} fill="#f7f3ea" stroke={OL} strokeWidth={4} />
        <path d={`M ${cx - 380} 676 L ${cx - 390} 800 M ${cx - 40} 676 L ${cx - 30} 800`} stroke={OL} strokeWidth={9} strokeLinecap="round" />
        <Person who="author" x={cx - 300} y={800} s={0.62} mood={t < b1 ? "think" : "smile"} pose="hold" t={t} flip />
        <BookSymbol x={cx - 120} y={600} s={0.22} rot={-8} />
      </g>
      {/* вопрос героя */}
      <Appear t={t} at={0.8}>
        <g transform={`translate(${cx - 60} 300)`}>
          <path d="M -230 -70 Q -230 -110 -190 -110 L 190 -110 Q 230 -110 230 -70 L 230 30 Q 230 70 190 70 L -60 70 L -110 130 L -100 70 L -190 70 Q -230 70 -230 30 Z" fill="#fff" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-6} size={38}>
            {"«Я похож\nна сумасшедшего?»"}
          </Txt>
        </g>
      </Appear>
      {/* одно интервью — или десять */}
      {Array.from({ length: nCards }, (_, i) => {
        const k = pop(t, b1 + 0.6 + i * 0.35);
        return (
          <g key={i} transform={`translate(${cx + 240 + (i % 5) * 34} ${300 + Math.floor(i / 5) * 160 + i * 6}) rotate(${-8 + i * 3}) scale(${k})`}>
            <rect x={-80} y={-55} width={160} height={110} rx={12} fill={C.paper} stroke={OL} strokeWidth={4} />
            <path d="M -50 -20 L 50 -20 M -50 5 L 40 5 M -50 30 L 20 30" stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" />
          </g>
        );
      })}
      {t > b1 && (
        <Appear t={t} at={b1 + 0.3}>
          <Label x={cx + 320} y={190} text="одно интервью — или десять?" size={30} bg={C.yellow} />
        </Appear>
      )}
      {/* сеть разговоров: семья, сотрудники, бывшие сотрудники */}
      {net > 0 &&
        who.map((w, i) => {
          const x = cx - 470 + i * 150;
          const y = 760 + (i % 2) * 40;
          const k = ramp(t, b2 + i * 0.25, 0.5);
          return (
            <g key={w} opacity={k}>
              <Person who={w} x={x} y={y + 80} s={0.26} mood="smile" t={t} seed={i} />
            </g>
          );
        })}
      {net > 0 && (
        <Appear t={t} at={b2 + 1.6}>
          <Label x={cx + 360} y={860} text="более двух лет работы" size={32} bg={C.paper} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Пять голосов: сортировка утверждений ──
export const VOICES = [
  { key: "vance", name: "Вэнс", sub: "наблюдение автора", color: "#3d7bd9" },
  { key: "musk", name: "Маск", sub: "его слова", color: "#5d6f93" },
  { key: "witness", name: "участник", sub: "воспоминание", color: DC.ppl.color },
  { key: "forecast", name: "прогноз", sub: "план того времени", color: DC.res.color },
  { key: "ours", name: "BanaMind", sub: "наш вывод", color: C.yellow },
];
export const Voices: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const span = Math.min(1150, A.x1 - A.x0 - 40);
  const gap = span / 5;
  const show = (i: number) => (i < 4 ? at(ctx, 1 + i * 0.22) : at(ctx, 2));
  return (
    <Drift t={t} dur={dur} cx={cx} cy={500} amount={0.03}>
      {VOICES.map((v, i) => {
        const x = cx - span / 2 + gap * (i + 0.5);
        const k = ramp(t, show(i), 0.5);
        // карточки-утверждения падают в свою корзину
        const drop = clamp01((t - show(i) - 0.3) / 0.8);
        return (
          <g key={v.key} opacity={Math.max(0.25, k)}>
            <g transform={`translate(${x} 640)`}>
              <path d={`M ${-gap * 0.42} -90 L ${gap * 0.42} -90 L ${gap * 0.34} 90 L ${-gap * 0.34} 90 Z`} fill={v.color} stroke={OL} strokeWidth={5} strokeDasharray={v.key === "forecast" ? "16 10" : undefined} fillOpacity={v.key === "forecast" ? 0.55 : 1} />
              <text x={0} y={-10} fontFamily={FONT} fontWeight={900} fontSize={34} textAnchor="middle" fill={v.key === "ours" ? C.ink : "#fff"} stroke={v.key === "ours" ? "none" : OL} strokeWidth={5} paintOrder="stroke">
                {v.name}
              </text>
              <text x={0} y={36} fontFamily={FONT} fontWeight={800} fontSize={22} textAnchor="middle" fill={v.key === "ours" ? C.ink : "#fff"}>
                {v.sub}
              </text>
            </g>
            {k > 0 && drop < 1 && (
              <g transform={`translate(${x} ${260 + drop * 300}) rotate(${(1 - drop) * 12 * (i % 2 ? 1 : -1)})`} opacity={1 - drop * 0.6}>
                <rect x={-60} y={-38} width={120} height={76} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
                <path d="M -36 -12 L 36 -12 M -36 12 L 20 12" stroke={v.color} strokeWidth={7} strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 0.2)}>
        <Label x={cx} y={190} text="кто это говорит?" size={40} bg={C.paper} />
      </Appear>
      {t > at(ctx, 2.5) && (
        <Appear t={t} at={at(ctx, 2.5)}>
          <g transform={`translate(${cx} 340) rotate(-3)`}>
            <rect x={-360} y={-48} width={720} height={86} rx={20} fill={C.paper} stroke={C.red} strokeWidth={5} />
            <Txt x={0} y={12} size={34} color={C.ink}>
              воспоминание ≠ бесспорный факт
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Приложение 1: обвинение — не доказательство (весы) ──
export const Lawsuit: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  // весы сначала качаются в сторону иска, затем уравновешиваются
  const tilt = (t < b1 ? 9 * ramp(t, 0.8, 1) : 9 * (1 - ramp(t, b1 + 0.5, 1.4))) + Math.sin(t * 1.4) * 1.2;
  const r = (tilt * Math.PI) / 180;
  const arm = 330;
  const lx = cx - Math.cos(r) * arm;
  const ly = 380 + Math.sin(r) * arm;
  const rx = cx + Math.cos(r) * arm;
  const ry = 380 - Math.sin(r) * arm;
  const Pan: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
    <g>
      <path d={`M ${x} ${y} L ${x - 110} ${y + 170} M ${x} ${y} L ${x + 110} ${y + 170}`} stroke={OL} strokeWidth={4} />
      <path d={`M ${x - 140} ${y + 170} L ${x + 140} ${y + 170} Q ${x + 120} ${y + 220} ${x} ${y + 222} Q ${x - 120} ${y + 220} ${x - 140} ${y + 170} Z`} fill={C.metal} stroke={OL} strokeWidth={5} />
      <g transform={`translate(${x} ${y + 120})`}>{children}</g>
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <path d={`M ${cx} 380 L ${cx} 820 M ${cx - 120} 830 L ${cx + 120} 830`} stroke={OL} strokeWidth={14} strokeLinecap="round" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={OL} strokeWidth={12} strokeLinecap="round" />
      <circle cx={cx} cy={380} r={18} fill={C.yellow} stroke={OL} strokeWidth={4} />
      <Pan x={lx} y={ly}>
        <Appear t={t} at={0.5}>
          <Card x={0} y={0} w={240} h={120} lines={["иск", "2007"]} edge={C.red} />
        </Appear>
      </Pan>
      <Pan x={rx} y={ry}>
        <Appear t={t} at={b1 + 0.1}>
          <g>
            <Card x={-40} y={10} w={180} h={110} lines={["ответ"]} edge={DC.eng.color} rot={-6} />
            <Card x={50} y={-10} w={180} h={110} lines={["документы"]} edge={DC.res.color} rot={5} />
          </g>
        </Appear>
      </Pan>
      {t > at(ctx, 1.5) && (
        <Appear t={t} at={at(ctx, 1.5)}>
          <g transform={`translate(${cx} 190) rotate(-2)`}>
            <rect x={-420} y={-50} width={840} height={90} rx={22} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={38}>
              утверждение стороны ≠ доказательство
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Blastar: экран старого компьютера ──
export const Blastar: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const rows = Math.floor(clamp01((t - 0.4) / 4) * 12);
  const ship = (t * 120) % 520;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.04}>
      <DateCard x={cx - 420} y={190} text="1984" />
      <g transform={`translate(${cx - 60} 470)`}>
        <rect x={-330} y={-230} width={660} height={430} rx={40} fill="#d8cdb6" stroke={OL} strokeWidth={6} />
        <rect x={-290} y={-195} width={580} height={330} rx={22} fill="#1d3a2a" stroke={OL} strokeWidth={5} />
        {Array.from({ length: rows }, (_, i) => (
          <rect key={i} x={-260} y={-170 + i * 24} width={60 + ((i * 97) % 300)} height={12} rx={4} fill="#6dff9a" opacity={0.85} />
        ))}
        {t > b1 - 0.8 && (
          <g opacity={ramp(t, b1 - 0.8, 0.5)}>
            <rect x={-290} y={-195} width={580} height={330} rx={22} fill="#0f2418" />
            <path d={`M ${-240 + ship} 60 l 30 -18 l 30 18 z`} fill="#6dff9a" />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={-200 + i * 120} y={-120 + ((t * 60 + i * 50) % 160)} width={34} height={20} fill="#ffd23f" />
            ))}
            <text x={0} y={-140} fontFamily={DISPLAY} fontSize={44} fill="#6dff9a" textAnchor="middle">
              BLASTAR
            </text>
          </g>
        )}
        <rect x={-180} y={200} width={360} height={46} rx={10} fill="#bfb39a" stroke={OL} strokeWidth={5} />
      </g>
      <Appear t={t} at={at(ctx, 0.55)}>
        <Label x={cx + 380} y={330} text="167 строк" size={36} bg={DC.eng.light} />
      </Appear>
      <Appear t={t} at={at(ctx, 0.75)}>
        <Label x={cx + 380} y={450} text="500 $" size={44} bg={DC.res.light} />
      </Appear>
      {t > b1 + 0.6 && (
        <g>
          <Arrow x1={cx + 200} y1={720} x2={cx + 300} y2={790} k={ramp(t, b1 + 0.6, 0.6)} color="#fff" w={8} />
          <g opacity={ramp(t, b1 + 1, 0.5)} transform="translate(-60 40) scale(0.8)" style={{ transformOrigin: `${cx + 430}px 760px` }}>
            <text x={cx + 430} y={790} fontFamily={DISPLAY} fontSize={110} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
              ракеты?
            </text>
            <Cross x={cx + 430} y={760} s={150} k={ramp(t, b1 + 1.6, 0.6)} />
          </g>
        </g>
      )}
    </Drift>
  );
};

// ── Деликатно: детство — без объяснения всего ──
export const Caution: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  // извилистая дорога из точек — путь не прямой
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    pts.push({ x: A.x0 + 60 + u * (A.x1 - A.x0 - 160), y: 640 + Math.sin(u * Math.PI * 3.2) * 110 * (1 - u * 0.3) - u * 220 });
  }
  const shown = Math.floor(ramp(t, 0.3, 4) * pts.length);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520} amount={0.03}>
      {pts.slice(0, shown).map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={9} fill={i % 3 ? "#fff" : C.yellow} stroke={OL} strokeOpacity={0.35} strokeWidth={1.4} />
      ))}
      <Appear t={t} at={0.6}>
        <g transform={`translate(${cx} 210)`}>
          <rect x={-410} y={-56} width={820} height={100} rx={26} fill={C.paper} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={14} size={36}>
            детство — со слов Маска и его брата
          </Txt>
        </g>
      </Appear>
      {t > b1 && (
        <Appear t={t} at={b1 + 0.2}>
          <g transform={`translate(${cx - 220} 820)`}>
            <Card x={0} y={0} w={380} h={110} lines={["без диагнозов"]} edge={DC.ppl.color} />
          </g>
          <g transform={`translate(${cx + 220} 820)`}>
            <Card x={0} y={0} w={380} h={110} lines={["без простых формул"]} edge={DC.ppl.color} />
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Дорога в Канаду и котельная ──
export const Journey: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const routeK = clamp01((t - b1) / 3);
  const x0 = A.x0 + 120;
  const x1 = A.x1 - 120;
  const bx = x0 + (x1 - x0) * routeK;
  const room = ramp(t, b2 - 0.3, 0.7);
  const stay = (i: number) => i === 4 || i === 15 || i === 25;
  const leave = clamp01((t - b2 - 0.4) / 2.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <Appear t={t} at={0.3}>
        <Label x={cx} y={180} text="17 лет · Канада" size={40} bg={C.paper} />
      </Appear>
      <g opacity={1 - room * 0.75}>
        {/* дорога через страну */}
        <path d={`M ${x0} 520 C ${x0 + 200} 420 ${x1 - 300} 640 ${x1} 520`} fill="none" stroke="#fff" strokeWidth={10} strokeDasharray="26 18" opacity={0.85} />
        <circle cx={x0} cy={520} r={18} fill={C.yellow} stroke={OL} strokeWidth={4} />
        <circle cx={x1} cy={520} r={18} fill={C.yellow} stroke={OL} strokeWidth={4} />
        {t > b1 && (
          <g transform={`translate(${bx} ${520 - Math.sin(routeK * Math.PI) * 40 - 46})`}>
            <rect x={-70} y={-36} width={140} height={64} rx={14} fill={DC.res.color} stroke={OL} strokeWidth={4} />
            <rect x={-56} y={-26} width={40} height={24} rx={4} fill={C.sky} />
            <rect x={-6} y={-26} width={40} height={24} rx={4} fill={C.sky} />
            <circle cx={-40} cy={32} r={13} fill="#2a2e44" />
            <circle cx={40} cy={32} r={13} fill="#2a2e44" />
          </g>
        )}
        <Appear t={t} at={b1 + 0.4}>
          <Label x={x0 + 160} y={680} text="билет: 100 $" size={32} bg={DC.res.light} />
        </Appear>
        <Appear t={t} at={b1 + 1.4}>
          <Label x={x1 - 160} y={680} text="1900 миль" size={32} bg={C.paper} />
        </Appear>
      </g>
      {room > 0 && (
        <g opacity={room}>
          <rect x={cx - 520} y={300} width={1040} height={470} rx={30} fill="#6b6f80" stroke={OL} strokeWidth={6} />
          <rect x={cx - 500} y={320} width={1000} height={430} rx={22} fill="#8a8f9f" />
          <Txt x={cx} y={380} size={36} color="#fff">
            котельная · 18 $ в час
          </Txt>
          {Array.from({ length: 30 }, (_, i) => {
            const col = i % 10;
            const row = Math.floor(i / 10);
            const gone = stay(i) ? 0 : clamp01(leave * 1.5 - ((i * 37) % 30) / 30);
            const x = cx - 420 + col * 93;
            const y = 500 + row * 90;
            return (
              <g key={i} transform={`translate(${x + gone * (col < 5 ? -300 : 300)} ${y})`} opacity={1 - gone}>
                <circle cx={0} cy={-18} r={14} fill={stay(i) ? C.yellow : "#fff"} stroke={OL} strokeWidth={3} />
                <path d="M -20 30 Q -20 0 0 0 Q 20 0 20 30 Z" fill={stay(i) ? C.yellow : "#fff"} stroke={OL} strokeWidth={3} />
              </g>
            );
          })}
          {leave > 0.9 && (
            <Appear t={t} at={b2 + 2.3}>
              <Label x={cx} y={830} text="из 30 остались трое" size={36} bg={C.yellow} />
            </Appear>
          )}
        </g>
      )}
    </Drift>
  );
};

// ── Три сферы и ретроспектива ──
export const Seeds: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const names = ["Интернет", "энергия", "космос"];
  const cols = [DC.ppl.color, DC.res.color, DC.eng.color];
  const straight = ramp(t, b1, 1);
  const wiggly = ramp(t, b2, 1.4);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      {names.map((n, i) => {
        const x = cx - 330 + i * 330;
        const g = ramp(t, at(ctx, 0.4 + i * 0.15), 0.9);
        return (
          <g key={n} transform={`translate(${x} 720)`} opacity={1 - straight * 0.35}>
            <ellipse cx={0} cy={20} rx={110} ry={26} fill="#6b4a2a" stroke={OL} strokeWidth={4} />
            <path d={`M 0 20 L 0 ${20 - 180 * g}`} stroke="#2f8a4a" strokeWidth={10} strokeLinecap="round" />
            {g > 0.5 && <ellipse cx={-34} cy={-120 * g} rx={36 * g} ry={18 * g} fill="#3fbf6a" stroke={OL} strokeWidth={3} transform={`rotate(-30 -34 ${-120 * g})`} />}
            {g > 0.5 && <ellipse cx={34} cy={-90 * g} rx={36 * g} ry={18 * g} fill="#3fbf6a" stroke={OL} strokeWidth={3} transform={`rotate(30 34 ${-90 * g})`} />}
            <g transform={`translate(0 ${-200 * g - 40})`} opacity={g}>
              <rect x={-110} y={-36} width={220} height={64} rx={20} fill={cols[i]} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={10} size={32} color="#fff">
                {n}
              </Txt>
            </g>
          </g>
        );
      })}
      {straight > 0 && (
        <g>
          <line x1={cx - 520} y1={300} x2={cx - 520 + 1040 * straight} y2={300} stroke="#fff" strokeWidth={8} strokeDasharray="20 14" />
          <g opacity={straight}>
            <Label x={cx - 360} y={240} text="история «по прямой»" size={30} bg={C.paper} />
          </g>
        </g>
      )}
      {wiggly > 0 && (
        <g>
          <path
            d={`M ${cx - 520} 360 ${Array.from({ length: 21 }, (_, i) => `L ${cx - 520 + i * 52} ${360 + Math.sin(i * 1.3) * 50 + wob(t, i, 3)}`).join(" ")}`}
            fill="none"
            stroke={C.yellow}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={1600}
            strokeDashoffset={1600 * (1 - wiggly)}
          />
          <g opacity={wiggly}>
            <Label x={cx - 340} y={450} text="настоящий путь" size={30} bg={C.yellow} />
          </g>
        </g>
      )}
    </Drift>
  );
};
