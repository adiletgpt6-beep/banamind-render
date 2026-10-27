// Навык 2 «Начинайте, представляя конечную цель»: лестница не у той стены, «не те
// джунгли», всё создаётся дважды, мягкая версия упражнения «что о вас скажут»
// (праздник через много лет), миссия-компас и роли, очки разных «центров».
import React from "react";
import { C, DISPLAY, FONT, HABIT } from "../theme";
import { Bubble, Card, House, Icon, Label, OL, Person, Tree } from "./draw";
import { Appear, area, Arrow, at, Check, clamp01, Cross, Drift, Pop, ramp, Txt, type VisualProps } from "./kit";

const H2 = HABIT[2].color;

// ───────────── лестница ─────────────
export const Ladder: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const climb = ramp(t, 0.6, Math.max(1, b1 + 2 - 0.6));
  const move = ramp(t, b2 + 0.8, 1.4);
  const wallA = cx - 260;
  const wallB = cx + 300;
  const lx = wallA + (wallB - wallA) * move;
  const steps = 9;
  const climberY = 840 - climb * (1 - move) * 520;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      <rect x={wallA - 130} y={200} width={200} height={660} rx={8} fill="#c98a6a" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={wallA - 130} y1={260 + i * 60} x2={wallA + 70} y2={260 + i * 60} stroke="#a86f52" strokeWidth={3} />)}
      <Label x={wallA - 30} y={180} text="«успех»" size={28} bg={C.white} />
      <rect x={wallB - 50} y={260} width={220} height={600} rx={8} fill="#8fb6e0" stroke={OL} strokeWidth={5} />
      <Icon name="heart" x={wallB + 60} y={400} s={1.6} color={C.rose} />
      <Icon name="people" x={wallB + 60} y={560} s={1.4} color={C.white} />
      <Label x={wallB + 60} y={235} text="важное для вас" size={28} bg={C.white} />
      <g transform={`translate(${lx + 40} 860) rotate(${-12})`}>
        <line x1={-40} y1={0} x2={-40} y2={-640} stroke={C.wood} strokeWidth={14} strokeLinecap="round" />
        <line x1={40} y1={0} x2={40} y2={-640} stroke={C.wood} strokeWidth={14} strokeLinecap="round" />
        {Array.from({ length: steps }).map((_, i) => <line key={i} x1={-40} y1={-40 - i * 68} x2={40} y2={-40 - i * 68} stroke={C.woodDeep} strokeWidth={10} strokeLinecap="round" />)}
      </g>
      <Person who="marat" x={lx + 60 + (840 - climberY) * 0.2} y={climberY} s={0.42} t={t} pose={climb < 1 && move < 0.05 ? "walk" : move > 0.9 ? "wave" : "hold"} mood={t > b1 + 1.2 && move < 0.5 ? "shock" : "happy"} accent={C.teal} />
      <Appear t={t} at={b1 + 1.4} x={wallA + 210} y={240}>
        <Label x={0} y={0} text="не та стена!" size={34} bg={C.coralSoft} />
      </Appear>
      <Appear t={t} at={b2} x={cx} y={130}>
        <Label x={0} y={0} text="занятость ≠ движение к важному" size={30} bg={C.white} />
      </Appear>
    </Drift>
  );
};

// ───────────── не те джунгли ─────────────
export const Jungle: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const x0 = A.x0;
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const shout = ramp(t, b1, 0.4);
  const leaderClimb = ramp(t, b1 - 1.2, 1.2);
  const lab = ramp(t, b2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      {Array.from({ length: 7 }).map((_, i) => (
        <Tree key={i} x={x0 + 90 + i * ((A.x1 - x0 - 160) / 6)} y={820} s={0.62 + (i % 3) * 0.08} t={t} color={i % 2 ? C.grassDeep : "#3f8a5a"} />
      ))}
      <Tree x={cx + 240} y={830} s={1.05} t={t} color="#2f7a4a" />
      <g opacity={1 - lab}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <Person who="worker" x={x0 + 150 + i * 150} y={880} s={0.5} t={t} pose="point" mood="happy" seed={i} />
            <path d={`M ${x0 + 150 + i * 150 + 64} ${700} l ${30 + Math.sin(t * 8 + i) * 20} ${-30}`} stroke="#c9d2e6" strokeWidth={9} strokeLinecap="round" />
          </g>
        ))}
        <Person who="man" x={cx - 60} y={880} s={0.52} t={t} pose="write" mood="happy" />
        <Label x={cx - 60} y={600} text="инструкции" size={22} bg={C.white} />
        <Person who="marat" x={cx + 240} y={830 - leaderClimb * 430} s={0.45} t={t} pose={shout > 0.5 ? "point" : "hold"} mood={shout > 0.5 ? "shock" : "neutral"} accent={H2} />
        <Pop t={t} at={b1} x={cx + 40} y={220}>
          <Bubble x={0} y={0} text="Это не те джунгли!" w={380} size={34} tail="right" bg={HABIT[2].soft} />
        </Pop>
        <Pop t={t} at={b1 + 1.8} x={x0 + 300} y={470}>
          <Bubble x={0} y={0} text={"Не мешай!\nМы отлично продвигаемся!"} w={400} size={28} />
        </Pop>
      </g>
      {lab > 0 && (
        <g opacity={lab}>
          <Card x={cx - 250} y={460} w={460} h={200} color={C.teal} title="управление" lines={["делать дела", "правильно"]} size={32} />
          <Card x={cx + 250} y={460} w={460} h={200} color={H2} title="лидерство" lines={["выбирать", "правильные дела"]} size={32} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── всё создаётся дважды ─────────────
export const Twice: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const draw = ramp(t, 0.4, 2);
  const build = ramp(t, at(ctx, 0.55), 1.6);
  const def = ramp(t, b1, 0.6);
  const len = 2600;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g transform={`translate(${cx - 270} 460)`} opacity={1 - def * 0.25}>
        <rect x={-230} y={-230} width={460} height={460} rx={20} fill="#2f6fb3" stroke={OL} strokeWidth={5} />
        {Array.from({ length: 9 }).map((_, i) => (
          <g key={i} stroke="#5c93cc" strokeWidth={2}>
            <line x1={-230 + i * 57} y1={-230} x2={-230 + i * 57} y2={230} />
            <line x1={-230} y1={-230 + i * 57} x2={230} y2={-230 + i * 57} />
          </g>
        ))}
        <path d="M -150 150 L -150 -20 L 0 -140 L 150 -20 L 150 150 Z M -40 150 L -40 50 L 40 50 L 40 150 M -120 0 L -70 0 L -70 40 L -120 40 Z M 70 0 L 120 0 L 120 40 L 70 40 Z" stroke="#fff" strokeWidth={6} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} strokeLinejoin="round" />
        <Txt x={0} y={-250} size={30} color={C.white} weight={900}>
          1 · мысленно
        </Txt>
        {def > 0 &&
          ["привычки семьи", "ожидания коллег", "случай"].map((s, i) => (
            <g key={s} opacity={ramp(t, b1 + 0.3 + i * 0.6, 0.4)}>
              <Label x={(i - 1) * 120} y={-150 + i * 120} text={s} size={24} bg={C.coralSoft} rot={-8 + i * 8} />
            </g>
          ))}
        {def > 0 && (
          <g transform={`translate(70 175) rotate(-12) scale(${ramp(t, b1 + 2.2, 0.3)})`}>
            <rect x={-150} y={-36} width={300} height={72} rx={12} fill="none" stroke={C.coral} strokeWidth={8} />
            <text y={14} fontFamily={DISPLAY} fontWeight={800} fontSize={38} fill={C.coral} textAnchor="middle">
              ПО УМОЛЧАНИЮ
            </text>
          </g>
        )}
      </g>
      <Arrow x1={cx - 20} y1={460} x2={cx + 60} y2={460} k={ramp(t, at(ctx, 0.5), 0.5)} color={C.white} w={12} />
      <g transform={`translate(${cx + 300} 690)`}>
        <rect x={-240} y={-10} width={480} height={20} rx={10} fill="#8a6a4a" />
        <g transform={`scale(1 ${Math.max(0.02, build)})`}>
          <House x={0} y={0} s={1.1} roof={H2} />
        </g>
        <Txt x={0} y={-430} size={30} color={C.white} weight={900}>
          2 · физически
        </Txt>
      </g>
    </Drift>
  );
};

// ───────────── праздник через много лет ─────────────
export const Jubilee: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const q = ramp(t, b2, 0.7);
  const speakers = [
    { who: "leila" as const, label: "семья" },
    { who: "man" as const, label: "друг" },
    { who: "dina" as const, label: "коллега" },
    { who: "elder" as const, label: "сообщество" },
  ];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      <rect x={A.x0 + 30} y={170} width={A.x1 - A.x0 - 60} height={680} rx={40} fill="#fff4dc" stroke={OL} strokeWidth={5} opacity={0.96} />
      <path d={`M ${A.x0 + 60} 220 ${Array.from({ length: 12 }).map((_, i) => `Q ${A.x0 + 60 + (i + 0.5) * ((A.x1 - A.x0 - 120) / 12)} 280 ${A.x0 + 60 + (i + 1) * ((A.x1 - A.x0 - 120) / 12)} 220`).join(" ")}`} stroke={C.coral} strokeWidth={5} fill="none" />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M ${A.x0 + 60 + (i + 0.5) * ((A.x1 - A.x0 - 120) / 12) - 16} 252 l 16 34 l 16 -34 Z`} fill={[C.sun, C.teal, H2, C.rose][i % 4]} stroke={OL} strokeWidth={2} />
      ))}
      <Label x={cx} y={330} text="праздник через много лет" size={30} bg={C.white} />
      <g opacity={1 - q}>
        {speakers.map((s, i) => {
          const k = ramp(t, b1 + i * 0.8, 0.5);
          const x = A.x0 + 150 + i * ((A.x1 - A.x0 - 300) / 3);
          return (
            <g key={s.label} opacity={k}>
              <Person who={s.who} x={x} y={800} s={0.55} t={t} pose={t > b1 + i * 0.8 + 0.6 && t < b1 + i * 0.8 + 2 ? "open" : "stand"} mood="happy" seed={i} />
              <Label x={x} y={420} text={s.label} size={26} bg={HABIT[2].soft} />
            </g>
          );
        })}
      </g>
      {q > 0 && (
        <g transform={`translate(${cx} 560) scale(${0.85 + 0.15 * q})`} opacity={q}>
          <Card x={0} y={0} w={880} h={240} color={H2} title="Как вы хотите," lines={["чтобы ваши поступки вспоминали?"]} size={40} titleSize={46} />
          <Icon name="heart" x={-390} y={80} s={0.8} color={C.rose} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── миссия — компас ─────────────
export const Compass: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const write = ramp(t, 0.4, 2.4);
  const comp = ramp(t, b2, 0.7);
  const needle = comp > 0 ? Math.sin(t * 6) * 60 * Math.max(0, 1 - (t - b2) / 2.5) : 0;
  const roles = ["родитель", "специалист", "друг", "сосед"];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g opacity={1 - comp} transform={`translate(${cx - (comp > 0 ? 0 : 0)} 470) rotate(-3)`}>
        <rect x={-230} y={-290} width={460} height={580} rx={18} fill={C.paper} stroke={OL} strokeWidth={5} />
        <text y={-220} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={H2} textAnchor="middle">
          моя миссия
        </text>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={-180} y={-160 + i * 60} width={360 * clamp01(write * 6 - i) * (i % 2 ? 0.75 : 1)} height={14} rx={7} fill={C.inkSoft} opacity={0.5} />
        ))}
        <Txt x={0} y={240} size={26} color={C.inkSoft}>
          каким быть · что сделать
        </Txt>
      </g>
      {roles.map((r, i) => {
        const a = (i / roles.length) * Math.PI * 2 - Math.PI / 4;
        const k = ramp(t, b1 + 0.8 + i * 0.4, 0.4) * (1 - comp * 0.8);
        return (
          <g key={r} opacity={k} transform={`translate(${cx + Math.cos(a) * 400} ${470 + Math.sin(a) * 300})`}>
            <Label x={0} y={0} text={r} size={30} bg={HABIT[2].soft} />
          </g>
        );
      })}
      {comp > 0 && (
        <g opacity={comp}>
          <g transform={`translate(${cx - 220} 480) scale(${0.8 + 0.2 * comp})`}>
            <circle r={210} fill={C.white} stroke={OL} strokeWidth={8} />
            <circle r={186} fill="none" stroke="#dfe5f0" strokeWidth={4} />
            {["С", "В", "Ю", "З"].map((d, i) => (
              <text key={d} x={Math.sin((i * Math.PI) / 2) * 150} y={-Math.cos((i * Math.PI) / 2) * 150 + 14} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={C.inkSoft} textAnchor="middle">
                {d}
              </text>
            ))}
            <g transform={`rotate(${20 + needle})`}>
              <path d="M 0 -150 L 24 0 L 0 150 L -24 0 Z" fill={C.white} stroke={OL} strokeWidth={4} />
              <path d="M 0 -150 L 24 0 L -24 0 Z" fill={C.coral} stroke={OL} strokeWidth={4} />
            </g>
            <circle r={14} fill={OL} />
          </g>
          <g transform={`translate(${cx + 250} 470) rotate(8)`}>
            <path d="M -150 -100 L -50 -120 L 50 -100 L 150 -120 L 150 100 L 50 120 L -50 100 L -150 120 Z" fill={C.paperDark} stroke={OL} strokeWidth={4} opacity={0.8} />
            <path d="M -120 40 Q -40 -60 30 10 Q 90 60 130 -40" stroke={C.inkSoft} strokeWidth={6} fill="none" strokeDasharray="10 10" />
            <Cross x={0} y={0} s={140} k={ramp(t, b2 + 1.2, 0.6)} />
          </g>
          <Label x={cx - 220} y={760} text="компас: направление" size={30} bg={C.white} />
          <Label x={cx + 250} y={700} text="карта: каждый поворот" size={26} bg={C.white} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── очки разных центров ─────────────
const LENSES = [
  { name: "деньги", color: C.gold, verdict: "останусь: премия!" },
  { name: "работа", color: "#7d8db0", verdict: "останусь: карьера" },
  { name: "удовольствия", color: C.rose, verdict: "уйду, мне скучно" },
  { name: "страх перед начальником", color: "#a08ad8", verdict: "останусь: вдруг накажут" },
];

export const Centers: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const cycle = t < b1 ? Math.floor(clamp01(t / Math.max(1, b1)) * 4) : t < b2 ? Math.min(3, Math.floor(((t - b1) / Math.max(1, b2 - b1)) * 4)) : -1;
  const lens = cycle >= 0 ? LENSES[cycle] : { name: "принципы", color: "#e6f7ff", verdict: "честно: сроки и семья" };
  const dilemma = ramp(t, b1, 0.6);
  const done = ramp(t, b3, 0.6);
  const headY = 430;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g transform={`translate(${dilemma > 0 ? cx - 300 * dilemma : cx} 0)`} opacity={1 - done}>
        <circle cx={0} cy={headY} r={170} fill="#e9c19c" stroke={OL} strokeWidth={6} />
        <path d="M -170 400 Q -180 230 0 230 Q 170 230 170 390 Q 140 300 40 300 Q -80 290 -170 400 Z" fill="#2a1f1a" stroke={OL} strokeWidth={4} />
        <g transform={`translate(0 ${headY - 10})`}>
          {[-70, 70].map((gx) => (
            <circle key={gx} cx={gx} cy={0} r={60} fill={lens.color} opacity={0.6} stroke={OL} strokeWidth={8} />
          ))}
          <path d="M -10 0 L 10 0 M -130 0 L -170 -10 M 130 0 L 170 -10" stroke={OL} strokeWidth={8} />
        </g>
        <path d="M -50 520 Q 0 545 50 520" stroke={OL} strokeWidth={6} fill="none" strokeLinecap="round" />
        <Label x={0} y={680} text={`очки: ${lens.name}`} size={30} bg={C.white} />
      </g>
      {dilemma > 0 && (
        <g opacity={dilemma * (1 - done * 0.7)}>
          <Card x={cx + 240} y={300} w={420} h={130} color={C.rose} title="концерт с женой" size={28} titleSize={34} />
          <Card x={cx + 240} y={470} w={420} h={130} color="#7d8db0" title="задержаться" size={28} titleSize={34} />
          <g transform={`translate(${cx + 240} 640)`}>
            <rect x={-230} y={-44} width={460} height={88} rx={30} fill={cycle < 0 ? C.tealSoft : C.coralSoft} stroke={OL} strokeWidth={4} />
            <text y={12} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink} textAnchor="middle">
              {lens.verdict}
            </text>
          </g>
        </g>
      )}
      {cycle < 0 && t > b2 && (
        <Appear t={t} at={b2 + 0.3} x={cx} y={130}>
          <Label x={0} y={0} text="честность · справедливость · достоинство" size={28} bg={C.white} />
        </Appear>
      )}
      {cycle < 0 && t > b2 + 2 && (
        <Appear t={t} at={b2 + 2} x={cx - 300} y={800}>
          <Label x={0} y={0} text="ценности — ваш выбор" size={28} bg={HABIT[2].soft} />
        </Appear>
      )}
      {done > 0 && (
        <g opacity={done}>
          <Card x={cx} y={480} w={760} h={280} color={H2} title="ответ Марата" lines={["«Какие сроки? Эти вечера", "уже отданы семье»"]} size={34} titleSize={40} />
          <Check x={cx + 320} y={400} s={50} k={ramp(t, b3 + 0.8, 0.6)} />
        </g>
      )}
    </Drift>
  );
};

