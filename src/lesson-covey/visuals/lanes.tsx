// Сквозная метафора фильма «Семь развилок одного дня»: две дорожки одного дня Марата —
// верхняя коралловая «Автопилот» и нижняя бирюзовая «Выбор» (учебная метафора BanaMind,
// не схема Кови). Плюс холодный старт (суматошный день) и главный вопрос фильма.
import React from "react";
import { interpolate, interpolateColors } from "remotion";
import { C, DISPLAY, FONT, HABIT } from "../theme";
import { Bubble, Card, Dot, House, Icon, Laptop, OL, Person, Phone, Sun, Tree, WeekGrid, Label } from "./draw";
import { Appear, area, at, clamp01, Drift, ease, pop, Pop, ramp, Txt, type VisualProps } from "./kit";

// ───────────── дорога ─────────────
const Road: React.FC<{ x0: number; x1: number; y: number; color: string; soft: string; t: number; k?: number; label: string; dim?: number }> = ({ x0, x1, y, color, soft, t, k = 1, label, dim = 0 }) => {
  const w = (x1 - x0) * clamp01(k);
  const dash = (t * 90) % 80;
  return (
    <g opacity={1 - dim * 0.55}>
      <rect x={x0} y={y - 52} width={w} height={104} rx={52} fill={soft} stroke={OL} strokeWidth={4} />
      <rect x={x0 + 10} y={y - 40} width={Math.max(0, w - 20)} height={80} rx={40} fill={color} opacity={0.88} />
      <line x1={x0 + 40} y1={y} x2={x0 + Math.max(40, w - 40)} y2={y} stroke="#fff" strokeWidth={7} strokeDasharray="44 36" strokeDashoffset={-dash} strokeLinecap="round" opacity={0.85} />
      {k > 0.3 && (
        <g transform={`translate(${x0 + 30} ${y - 74})`} opacity={clamp01((k - 0.3) * 3)}>
          <rect x={0} y={-26} width={label.length * 21 + 40} height={46} rx={23} fill={C.white} stroke={OL} strokeWidth={3} />
          <circle cx={22} cy={-3} r={9} fill={color} />
          <text x={40} y={7} fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.ink}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

// событие развилки — небольшой «кадр» между дорожками
const ForkEvent: React.FC<{ fork: number; x: number; y: number; t: number }> = ({ fork, x, y, t }) => {
  const c = HABIT[fork].color;
  const box = (children: React.ReactNode, label: string) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-200} y={-120} width={400} height={240} rx={34} fill={C.white} stroke={OL} strokeWidth={5} />
      <rect x={-200} y={-120} width={400} height={22} rx={11} fill={c} />
      {children}
      <Label x={0} y={150} text={label} size={28} bg={HABIT[fork].soft} />
    </g>
  );
  switch (fork) {
    case 1:
      return box(
        <g>
          <path d="M -150 60 L -40 60 L -50 10 L -120 10 Z" fill={C.coral} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={-120} cy={66} r={14} fill={OL} />
          <circle cx={-60} cy={66} r={14} fill={OL} />
          <Phone x={80} y={4} s={0.62} t={t} ring={0.8} count={1} />
        </g>,
        "пробка + «Где отчёт?!»",
      );
    case 2:
      return box(
        <g>
          <rect x={-120} y={-60} width={170} height={130} rx={10} fill={C.sun} stroke={OL} strokeWidth={4} />
          <rect x={-120} y={-76} width={70} height={24} rx={8} fill={C.sun} stroke={OL} strokeWidth={4} />
          <Icon name="star" x={-36} y={6} s={1.1} color={C.white} />
          <Txt x={110} y={10} size={60} color={C.ink}>+1</Txt>
        </g>,
        "ещё один проект",
      );
    case 3:
      return box(
        <g>
          <Phone x={-80} y={4} s={0.6} t={t} ring={1} count={3} />
          <Icon name="mail" x={70} y={-30} s={1.3} color={C.coral} />
          <Label x={70} y={40} text="срочно!" size={26} bg={C.coralSoft} />
        </g>,
        "звонок против важного",
      );
    case 4:
      return box(
        <g>
          <Person who="marat" x={-100} y={96} s={0.36} t={t} mood="tense" pose="point" />
          <Person who="dina" x={100} y={96} s={0.36} t={t} mood="tense" pose="point" flip />
          <Icon name="coin" x={0} y={-40} s={1.3} />
        </g>,
        "один бюджет на двоих",
      );
    case 5:
      return box(
        <g>
          <Person who="timur" x={0} y={100} s={0.42} t={t} mood="angry" pose="cross" />
          <Bubble x={80} y={-64} text="Кому нужна…" w={230} size={26} tail="left" />
        </g>,
        "сын и школа",
      );
    case 6:
      return box(
        <g>
          <ellipse cx={-90} cy={30} rx={80} ry={36} fill={C.sky} stroke={OL} strokeWidth={4} />
          <Txt x={-90} y={-40} size={26}>озеро</Txt>
          <House x={100} y={70} s={0.42} />
          <Txt x={100} y={-80} size={26}>мама</Txt>
        </g>,
        "отпуск: куда?",
      );
    default:
      return box(
        <g>
          <Icon name="moon" x={-100} y={-30} s={1.4} color={C.sun} />
          <Laptop x={60} y={60} s={0.62} screen={C.coralSoft} />
        </g>,
        "ещё час работы?",
      );
  }
};

type LanesP = { mode: "intro" | "fork" | "result" | "merge"; fork?: number; host?: string };

export const Lanes: React.FC<VisualProps<LanesP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const x0 = A.x0 + 10;
  const x1 = A.x1 - 10;
  const yTop = 340;
  const yBot = 700;
  const fork = p.fork ?? 1;

  if (p.mode === "merge") {
    // две дорожки сходятся в одну, на ней — семь цветных точек-инструментов
    const k = ramp(t, 0.3, 2.2);
    const cx = x0 + 420;
    const yMid = 560;
    const top = `M ${x0} ${yTop} C ${x0 + 220} ${yTop} ${cx - 200} ${yMid} ${cx} ${yMid}`;
    const bot = `M ${x0} ${yBot} C ${x0 + 220} ${yBot} ${cx - 200} ${yMid} ${cx} ${yMid}`;
    const topColor = interpolateColors(k, [0, 1], [C.coral, C.teal]);
    const span = x1 - cx - 150;
    const mx = cx + 40 + Math.min(span * 0.9, Math.max(0, t - 1) * 26);
    return (
      <Drift t={t} dur={dur} cx={(x0 + x1) / 2} cy={540}>
        <Sun x={x1 - 110} y={150} r={50} t={t} color="#ffb84a" />
        {[top, bot].map((d, i) => (
          <g key={i}>
            <path d={d} stroke={OL} strokeWidth={112} fill="none" strokeLinecap="round" />
            <path d={d} stroke={i === 0 ? topColor : C.teal} strokeWidth={100} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <rect x={cx - 10} y={yMid - 56} width={Math.max(60, (x1 - cx) * k)} height={112} rx={56} fill={OL} />
        <rect x={cx - 4} y={yMid - 50} width={Math.max(48, (x1 - cx) * k - 12)} height={100} rx={50} fill={C.teal} />
        {[1, 2, 3, 4, 5, 6, 7].map((n, i) => {
          const a = at(ctx, 1) + i * 0.55;
          const px = cx + 70 + i * (span / 6.4);
          const up = i % 2 === 0;
          return (
            <Pop key={n} t={t} at={a} x={px} y={yMid}>
              <circle r={34} fill={HABIT[n].color} stroke={C.white} strokeWidth={8} />
              <text y={13} fontFamily={DISPLAY} fontWeight={800} fontSize={36} fill={C.white} textAnchor="middle">
                {n}
              </text>
              <Label x={0} y={up ? -96 : 104} text={HABIT[n].short} size={21} bg={HABIT[n].soft} />
            </Pop>
          );
        })}
        <Person who="marat" x={mx} y={yMid + 34} s={0.42} t={t} pose="walk" mood="happy" accent={C.teal} />
      </Drift>
    );
  }

  const roadK = p.mode === "intro" ? ramp(t, at(ctx, 1), 1.4) : 1;
  const evK = p.mode === "fork" ? pop(t, 0.3) : 0;
  const reactT = p.mode === "fork" ? at(ctx, 1) : 0;
  const pauseK = p.mode === "fork" ? ramp(t, at(ctx, 1.55), 0.8) : p.mode === "result" ? 1 : 0;
  const sunX = (x0 + x1) / 2 + 60 + (fork - 4) * 40;
  const sunY = 120 + Math.abs(fork - 3.5) * 8;
  const walkX = x0 + 230 + (p.mode === "fork" ? Math.min(160, t * 30) : 0);
  return (
    <Drift t={t} dur={dur} cx={(x0 + x1) / 2} cy={520} amount={0.03}>
      <Sun x={sunX} y={sunY} r={40} t={t} color={fork >= 6 ? "#ffb84a" : C.sun} />
      {[0.05, 0.62].map((f, i) => (
        <Tree key={i} x={x0 + 60 + f * (x1 - x0)} y={yTop - 60} s={0.34} t={t} color={i % 2 ? C.grass : C.grassDeep} />
      ))}
      <Road x0={x0} x1={x1} y={yTop} color={C.coral} soft={C.coralSoft} t={p.mode === "fork" && t > reactT ? t * 1.8 : t} k={p.mode === "intro" ? ramp(t, at(ctx, 1), 1.2) : 1} label="Автопилот" dim={p.mode === "result" ? 0.6 : 0} />
      <Road x0={x0} x1={x1} y={yBot} color={C.teal} soft={C.tealSoft} t={t * (1 - pauseK * 0.8)} k={roadK} label="Выбор" />
      {p.mode === "intro" && (
        <g>
          <Person who="marat" x={x0 + 200 + Math.min(300, t * 22)} y={yTop + 30} s={0.5} t={t} pose="walk" mood="tense" accent={C.coral} />
          <Person who="marat" x={x0 + 200 + Math.min(300, t * 22)} y={yBot + 30} s={0.5} t={t} pose="walk" mood="calm" accent={C.teal} />
          {[1, 2, 3, 4, 5, 6, 7].map((n, i) => {
            const fx = x0 + 330 + i * ((x1 - x0 - 420) / 6);
            const a = at(ctx, 2) + i * 0.45;
            return (
              <Pop key={n} t={t} at={a} x={fx} y={yBot}>
                <circle r={30} fill={HABIT[n].color} stroke={C.white} strokeWidth={7} />
                <text y={11} fontFamily={DISPLAY} fontWeight={800} fontSize={32} fill={C.white} textAnchor="middle">
                  {n}
                </text>
              </Pop>
            );
          })}
          <Appear t={t} at={at(ctx, 2.4)} x={x1 - 330} y={520}>
            <Label x={0} y={0} text="Семь развилок одного дня" size={34} bg={C.white} />
          </Appear>
        </g>
      )}
      {(p.mode === "fork" || p.mode === "result") && (
        <g>
          {/* верхний Марат реагирует сразу */}
          <Person who="marat" x={walkX} y={yTop + 30} s={0.5} t={t} pose={t > reactT ? "point" : "walk"} mood={t > reactT ? "angry" : "neutral"} accent={C.coral} />
          {p.mode === "fork" && t > reactT && (
            <g>
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M ${walkX + 60 + i * 16} ${yTop - 210} l 14 -22`} stroke={C.coralDeep} strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 8 + i)} />
              ))}
            </g>
          )}
          {/* нижний Марат делает паузу: точка выбора → линия действия → результат */}
          <Person who="marat" x={walkX} y={yBot + 30} s={0.5} t={t} pose={pauseK > 0.5 ? "think" : "walk"} mood={pauseK > 0.5 ? "calm" : "neutral"} accent={C.teal} />
          {pauseK > 0 && (
            <g>
              <Dot x={walkX + 150} y={yBot} r={18} color={HABIT[fork].color} t={t} glow={pauseK} />
              <path d={`M ${walkX + 150} ${yBot} L ${walkX + 150 + 360 * pauseK} ${yBot}`} stroke={HABIT[fork].color} strokeWidth={12} strokeLinecap="round" strokeDasharray="2 22" />
              <Label x={walkX + 170} y={yBot + 118} text={HABIT[fork].short} size={28} bg={HABIT[fork].soft} opacity={pauseK} />
            </g>
          )}
          {p.mode === "result" && (
            <g>
              <Pop t={t} at={0.6} x={x1 - 180} y={yBot}>
                <circle r={54} fill={C.white} stroke={OL} strokeWidth={5} />
                <path d="M -24 0 L -6 18 L 26 -18" stroke={C.green} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Pop>
              <Pop t={t} at={1} x={x1 - 180} y={yTop}>
                <circle r={46} fill={C.white} stroke={OL} strokeWidth={5} />
                <path d="M -16 -16 L 16 16 M 16 -16 L -16 16" stroke={C.coral} strokeWidth={10} strokeLinecap="round" />
              </Pop>
            </g>
          )}
          {p.mode === "fork" && (
            <g transform={`translate(0 0) scale(1)`} opacity={clamp01(evK * 1.4)}>
              <g transform={`translate(${x1 - 260} 520) scale(${0.6 + 0.4 * evK}) translate(${-(x1 - 260)} -520)`}>
                <ForkEvent fork={fork} x={x1 - 260} y={520} t={t} />
              </g>
              <g transform={`translate(${x1 - 260} 330)`}>
                <circle r={40} fill={HABIT[fork].color} stroke={C.white} strokeWidth={8} />
                <text y={15} fontFamily={DISPLAY} fontWeight={800} fontSize={42} fill={C.white} textAnchor="middle">
                  {fork}
                </text>
              </g>
            </g>
          )}
        </g>
      )}
    </Drift>
  );
};

// ───────────── холодный старт ─────────────
type RushP = { stage: number; host?: string };
export const Rush: React.FC<VisualProps<RushP>> = (ctx) => {
  const { t, dur, p } = ctx;
  if (p.stage === 0) {
    const n = Math.min(40, Math.floor(interpolate(t, [0.4, at(ctx, 0.7)], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })));
    const tasks = ["презентация", "отчёт", "созвон", "письмо", "таблица", "встреча", "правки", "звонок"];
    const fast = at(ctx, 1);
    return (
      <Drift t={t} dur={dur} cx={620} cy={540}>
        <Sun x={170} y={170} r={44} t={t} />
        <Person who="marat" x={440 + (t > fast ? Math.sin(t * 3) * 40 : 0)} y={900} s={1.05} t={t} pose={t > fast ? "run" : "phone"} mood={t > fast ? "tense" : "think"} accent={C.coral} />
        <Phone x={740} y={330} s={1.1} t={t} ring={t < fast ? 0.6 : 1} count={n} rot={-6} />
        {tasks.map((label, i) => {
          const a = 0.8 + i * ((Math.max(2, at(ctx, 1.6)) - 0.8) / tasks.length);
          const k = pop(t, a);
          if (k <= 0) return null;
          const col = i % 2;
          const x = 930 + col * 210 + Math.sin(i * 1.7) * 18;
          const y = 760 - Math.floor(i / 2) * 118;
          return (
            <g key={i} transform={`translate(${x} ${y + (1 - k) * -120}) rotate(${Math.sin(i * 2.3) * 7})`} opacity={clamp01(k * 1.3)}>
              <rect x={-96} y={-44} width={192} height={88} rx={18} fill={i % 3 === 0 ? C.coralSoft : C.white} stroke={OL} strokeWidth={4} />
              <text y={11} fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.ink} textAnchor="middle">
                {label}
              </text>
            </g>
          );
        })}
        {t > fast &&
          [0, 1, 2, 3].map((i) => <path key={i} d={`M ${230 - i * 20} ${560 + i * 70} l -120 0`} stroke={C.white} strokeWidth={8} strokeLinecap="round" opacity={0.4 + 0.3 * Math.sin(t * 9 + i)} />)}
      </Drift>
    );
  }
  // вечер: забытый разговор, «Не сейчас!», календарь чужой срочности
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const blocks = [];
  for (let d = 0; d < 7; d++)
    for (let r = 0; r < 6; r++) {
      const idx = d * 6 + r;
      blocks.push({ day: d, row: r, color: (idx * 7) % 5 === 0 ? C.sun : C.coralSoft, label: (idx * 7) % 5 === 0 ? "" : "срочно", k: ramp(t, b2 + 0.3 + idx * 0.05, 0.4) });
    }
  const showCal = t > b2 - 0.2;
  return (
    <Drift t={t} dur={dur} cx={620} cy={540}>
      {!showCal && (
        <g>
          <rect x={80} y={180} width={1080} height={640} rx={40} fill="#ffe9c7" stroke={OL} strokeWidth={5} opacity={0.92} />
          <rect x={160} y={260} width={170} height={420} rx={14} fill={C.wood} stroke={OL} strokeWidth={5} />
          <circle cx={300} cy={480} r={10} fill={C.gold} stroke={OL} strokeWidth={3} />
          <Appear t={t} at={0.4} x={0} y={0}>
            <Bubble x={300} y={210} text="Пап, поговорим?" w={330} size={30} think />
          </Appear>
          <Person who="marat" x={620} y={860} s={0.95} t={t} pose={t > b1 ? "open" : "phone"} mood={t > b1 ? "angry" : "think"} accent={C.coral} />
          <Person who="leila" x={940} y={860} s={0.9} t={t} pose="stand" mood={t > b1 + 1.2 ? "sad" : "calm"} flip />
          <Appear t={t} at={b1 - 0.3}>
            <Bubble x={980} y={300} text={"Как прошёл\nдень?"} w={260} size={30} />
          </Appear>
          <Appear t={t} at={b1 + 0.9}>
            <Bubble x={600} y={330} text="Не сейчас!" w={280} size={38} bg={C.coralSoft} />
          </Appear>
        </g>
      )}
      {showCal && (
        <Appear t={t} at={b2 - 0.2} x={0} y={0}>
          <WeekGrid x={110} y={200} w={1040} h={600} blocks={blocks} />
          <Pop t={t} at={b2 + 3} x={640} y={500}>
            <rect x={-300} y={-70} width={600} height={140} rx={34} fill={C.white} stroke={OL} strokeWidth={5} />
            <text y={-6} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink} textAnchor="middle">
              а где мой день?
            </text>
            <text y={44} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.coralDeep} textAnchor="middle">
              всё — чужая срочность
            </text>
          </Pop>
        </Appear>
      )}
    </Drift>
  );
};

// ───────────── главный вопрос ─────────────
export const BigQuestion: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b1 = at(ctx, 1);
  return (
    <Drift t={t} dur={dur} cx={A.cx} cy={520}>
      <Appear t={t} at={0.2} x={A.cx} y={250}>
        <Card x={0} y={0} w={900} h={250} color={C.coral} title="Почему проблемы возвращаются," lines={["даже когда мы работаем", "быстрее?"]} size={44} titleSize={46} />
      </Appear>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${A.cx - 420 + i * 30} ${470 + i * 18} l ${-180 + Math.sin(t * 5 + i) * 20} 0`} stroke={C.white} strokeWidth={7} strokeLinecap="round" opacity={(1 - ramp(t, b1, 0.6)) * 0.6} />
      ))}
      <Appear t={t} at={b1} x={A.cx} y={640}>
        <g>
          <Label x={-260} y={0} text="скорость" size={40} bg={C.coralSoft} />
          <path d="M -330 6 L -190 -6" stroke={C.red} strokeWidth={10} strokeLinecap="round" />
          <path d="M -110 0 L 30 0" stroke={C.white} strokeWidth={10} strokeLinecap="round" />
          <path d="M 30 0 L 10 -18 M 30 0 L 10 18" stroke={C.white} strokeWidth={10} strokeLinecap="round" />
          <Label x={260} y={0} text="способ выбирать" size={40} bg={C.tealSoft} />
        </g>
      </Appear>
      <Appear t={t} at={b1 + 1.6} x={A.cx} y={790}>
        <g>
          <Label x={-200} y={0} text="действовать" size={34} bg={C.white} />
          <Label x={200} y={0} text="договариваться" size={34} bg={C.white} />
        </g>
      </Appear>
    </Drift>
  );
};
