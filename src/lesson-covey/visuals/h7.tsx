// Навык 7 «Затачивайте пилу» и финал: лесоруб с тупой пилой, четыре измерения
// обновления, записки на берегу (история Артура Гордона), восходящая спираль,
// границы семи инструментов, недельный эксперимент, три вопроса, финальная заставка.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, DISPLAY, FONT, HABIT } from "../theme";
import { Bubble, Card, Icon, Label, Laptop, OL, Person, Sun, Tree } from "./draw";
import { Appear, area, at, Check, clamp01, Drift, Pop, ramp, Txt, type VisualProps } from "./kit";

const H7 = HABIT[7].color;

// ───────────── лесоруб ─────────────
export const Saw: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const ring = ramp(t, at(ctx, 1.55), 0.8);
  const sawX = Math.sin(t * 5) * 60 * (1 - ring);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g opacity={1 - ring}>
        <Tree x={cx - 120} y={860} s={1.25} t={t} color={C.grassDeep} />
        <g transform={`translate(${cx - 120 + sawX} 690)`}>
          <path d="M -260 0 L 160 0 L 160 34 L -260 34 Z" fill="#cfd6e4" stroke={OL} strokeWidth={4} />
          <path d={`M -260 34 ${Array.from({ length: 21 }).map((_, i) => `L ${-250 + i * 20} ${i % 2 ? 44 : 36}`).join(" ")} L 160 34`} stroke={OL} strokeWidth={3} fill="#b7bfd0" />
          <rect x={160} y={-10} width={70} height={54} rx={14} fill={C.wood} stroke={OL} strokeWidth={4} />
        </g>
        {Array.from({ length: 6 }).map((_, i) => {
          const ph = (t * 1.3 + i * 0.17) % 1;
          return <circle key={i} cx={cx - 120 + Math.sin(i) * 40} cy={740 + ph * 110} r={5} fill="#e8c9a0" opacity={1 - ph} />;
        })}
        <Person who="worker" x={cx + 230 + sawX * 0.3} y={870} s={0.72} t={t} pose="hold" mood="tense" flip />
        <Pop t={t} at={b1 + 0.2} x={cx + 200} y={300}>
          <Bubble x={0} y={0} text={"Нет у меня времени\nпилу затачивать!"} w={420} size={30} tail="down" bg={C.coralSoft} />
        </Pop>
        <Appear t={t} at={0.8} x={cx - 360} y={250}>
          <Label x={0} y={0} text="пятый час пилит" size={28} bg={C.white} />
        </Appear>
      </g>
      {ring > 0 && (
        <g opacity={ring}>
          {[1, 2, 3, 4, 5, 6].map((n, i) => {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            return (
              <g key={n} transform={`translate(${cx + Math.cos(a) * 280} ${470 + Math.sin(a) * 260})`}>
                <circle r={50} fill={HABIT[n].color} stroke={C.white} strokeWidth={8} />
                <text y={16} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={C.white} textAnchor="middle">
                  {n}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={470} r={110} fill={H7} stroke={C.white} strokeWidth={10} />
          <text x={cx} y={490} fontFamily={DISPLAY} fontWeight={800} fontSize={64} fill={C.white} textAnchor="middle">
            7
          </text>
          <Label x={cx} y={850} text="обновление делает возможными все остальные" size={28} bg={C.white} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── четыре измерения ─────────────
export const Four: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const cy = 470;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const sectors = [
    { name: "физическое", items: "движение · сон · еда", icon: "run" as const, color: "#ff8a3d", at: 0.4 },
    { name: "духовное", items: "ценности · тишина · смысл", icon: "leaf" as const, color: "#7d6bd6", at: b1 },
    { name: "интеллектуальное", items: "читать · писать · учиться", icon: "book" as const, color: "#3d8bff", at: b2 },
    { name: "социально-эмоциональное", items: "навыки 4–6 каждый день", icon: "people" as const, color: "#2fbf71", at: at(ctx, 2.55) },
  ];
  const R = 300;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy}>
      {sectors.map((s, i) => {
        const k = ramp(t, s.at, 0.6);
        const a0 = -Math.PI / 2 + (i * Math.PI) / 2;
        const a1 = a0 + Math.PI / 2;
        const r = R * (0.85 + 0.15 * k);
        const d = `M ${cx} ${cy} L ${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r} Z`;
        const am = (a0 + a1) / 2;
        return (
          <g key={s.name} opacity={0.3 + 0.7 * k}>
            <path d={d} fill={s.color} stroke={C.white} strokeWidth={10} />
            <Icon name={s.icon} x={cx + Math.cos(am) * r * 0.55} y={cy + Math.sin(am) * r * 0.55} s={1.4} color={C.white} />
            <g transform={`translate(${cx + Math.cos(am) * (r + 150)} ${cy + Math.sin(am) * (r + 70)})`} opacity={k}>
              <Label x={0} y={0} text={s.name} size={s.name.length > 14 ? 22 : 26} bg={C.white} />
              <Txt x={0} y={52} size={22} color={C.white} weight={900}>
                {s.items}
              </Txt>
            </g>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={70} fill={H7} stroke={C.white} strokeWidth={8} />
      <Txt x={cx} y={cy + 10} size={28} color={C.white} weight={900}>
        вы
      </Txt>
      <Appear t={t} at={b1 + 2.2} x={cx} y={130}>
        <Label x={0} y={0} text="по своей традиции и убеждениям" size={26} bg={C.violetSoft} />
      </Appear>
    </Drift>
  );
};

// ───────────── записки на берегу ─────────────
export const Sand: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const notes = ["слушать внимательно", "вспомнить хорошее", "проверить мотивы", "тревоги — на песке"];
  const write = ramp(t, at(ctx, 1.6), 1);
  const wave = ramp(t, at(ctx, 1.85), 1.4);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <rect x={A.x0 + 20} y={160} width={A.x1 - A.x0 - 40} height={330} rx={30} fill="#5aa9e6" stroke={OL} strokeWidth={5} />
      <Sun x={A.x1 - 160} y={240} r={46} t={t} color="#ffd27a" />
      <rect x={A.x0 + 20} y={470} width={A.x1 - A.x0 - 40} height={400} rx={30} fill="#f3dca8" stroke={OL} strokeWidth={5} />
      {notes.map((n, i) => {
        const k = ramp(t, b1 + i * 0.9, 0.5);
        const x = A.x0 + 170 + i * ((A.x1 - A.x0 - 340) / 3);
        return (
          <g key={n} opacity={k} transform={`translate(${x} ${300 + (i % 2) * 40}) rotate(${(i - 1.5) * 4}) scale(${0.8 + 0.2 * k})`}>
            <rect x={-130} y={-56} width={260} height={112} rx={10} fill={C.paper} stroke={OL} strokeWidth={4} />
            <text y={-8} fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.ink} textAnchor="middle">
              {n.split(" ")[0]}
            </text>
            <text y={26} fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.inkSoft} textAnchor="middle">
              {n.split(" ").slice(1).join(" ")}
            </text>
          </g>
        );
      })}
      <g opacity={clamp01(write) * (1 - wave)}>
        <text x={cx} y={700} fontFamily={DISPLAY} fontWeight={800} fontSize={76} fill="#c09a5a" textAnchor="middle" letterSpacing={6}>
          тревоги
        </text>
      </g>
      {wave > 0 && (
        <path d={`M ${A.x0 + 20} ${490 + wave * 260} q 120 -50 240 0 t 240 0 t 240 0 t 240 0 t 240 0 L ${A.x1 - 20} 490 L ${A.x0 + 20} 490 Z`} fill="#8fd0ff" opacity={0.85 * (1 - ramp(t, at(ctx, 1.85) + 1.6, 1))} />
      )}
      <Person who="man" x={A.x0 + 180} y={860} s={0.6} t={t} pose="write" mood="calm" />
    </Drift>
  );
};

// ───────────── восходящая спираль ─────────────
export const Spiral: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const k = ramp(t, 0.3, 3);
  const night = ramp(t, b1, 0.6);
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const f = i / 120;
    const a = f * Math.PI * 6;
    const r = 260 - f * 60;
    pts.push(`${cx + Math.cos(a) * r} ${780 - f * 560 + Math.sin(a) * 50}`);
  }
  const len = 5200;
  const words = ["узнать", "решить", "сделать"];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g opacity={1 - night}>
        <path d={`M ${pts.join(" L ")}`} stroke={H7} strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - k)} />
        {words.map((w, i) => {
          const f = 0.15 + i * 0.32;
          const a = f * Math.PI * 6;
          const r = 260 - f * 60;
          return (
            <Pop key={w} t={t} at={0.8 + i * 0.7} x={cx + Math.cos(a) * r} y={780 - f * 560 + Math.sin(a) * 50}>
              <Label x={0} y={0} text={w} size={30} bg={C.white} />
            </Pop>
          );
        })}
      </g>
      {night > 0 && (
        <g opacity={night}>
          <rect x={A.x0 + 30} y={170} width={A.x1 - A.x0 - 60} height={690} rx={40} fill="#2f4d8a" stroke={OL} strokeWidth={5} />
          <Icon name="moon" x={A.x1 - 180} y={260} s={1.6} color={C.sun} />
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={A.x0 + 80 + ((i * 131) % (A.x1 - A.x0 - 160))} cy={220 + ((i * 71) % 220)} r={3 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 2 + i)} />
          ))}
          <Laptop x={cx - 300} y={760} s={0.8} open={1 - ramp(t, b1 + 0.6, 0.8)} />
          <Person who="marat" x={cx + 60 + ramp(t, b1 + 1.4, 3) * 240} y={860} s={0.7} t={t} pose={t > b1 + 1.4 ? "walk" : "stand"} mood="calm" accent={C.teal} />
          <Appear t={t} at={b1 + 2.6} x={cx + 120} y={330}>
            <Label x={0} y={0} text="заточка пилы перед завтрашним днём" size={28} bg={HABIT[7].soft} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ───────────── границы инструментов ─────────────
const LIMITS = [
  [1, "круг влияния ≠ всемогущество"],
  [2, "миссия у каждого своя"],
  [3, "план ≠ отсутствие неожиданностей"],
  [4, "доверие не покупается вкладами"],
  [4, "не каждый конфликт — без потерь"],
  [5, "понять ≠ согласиться"],
  [7, "отдых — не волшебная таблетка"],
] as const;

export const Limits: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const quote = ramp(t, at(ctx, 1.7), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g opacity={1 - quote}>
        {LIMITS.map(([n, s], i) => {
          const k = ramp(t, i < 3 ? 0.6 + i * 1.4 : b1 + (i - 3) * 1.2, 0.5);
          const y = 190 + i * 92;
          return (
            <g key={i} opacity={0.2 + 0.8 * k} transform={`translate(${cx} ${y}) translate(${(1 - k) * 40} 0)`}>
              <rect x={-500} y={-38} width={1000} height={76} rx={38} fill={C.white} stroke={OL} strokeWidth={4} />
              <circle cx={-460} cy={0} r={28} fill={HABIT[n].color} stroke={OL} strokeWidth={3} />
              <text x={-460} y={10} fontFamily={DISPLAY} fontWeight={800} fontSize={28} fill={C.white} textAnchor="middle">
                {n}
              </text>
              <text x={-410} y={11} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink}>
                {s}
              </text>
            </g>
          );
        })}
      </g>
      {quote > 0 && (
        <g opacity={quote} transform={`translate(${cx} 470) scale(${0.85 + 0.15 * quote})`}>
          <Card x={0} y={0} w={820} h={220} color={C.sunDeep} title="«быть высокоэффективным –" lines={["это идеал»  — С. Кови"]} size={40} titleSize={44} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── недельный эксперимент ─────────────
const DAYS = [
  ["пн", "пауза перед ответом", 1],
  ["вт", "одна фраза о важном", 2],
  ["ср", "час второго квадрата", 3],
  ["чт", "искренний вклад", 4],
  ["пт", "спросить об интересах", 4],
  ["сб", "дослушать до конца", 5],
  ["вс", "восстановить силы", 7],
] as const;

export const Experiment: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <Appear t={t} at={0.3} x={cx} y={170}>
        <Label x={0} y={0} text="эксперимент на 7 дней — без обещаний чуда" size={30} bg={C.white} />
      </Appear>
      {DAYS.map(([d, s, n], i) => {
        const start = i < 3 ? b1 + i * 1.6 : b2 + (i - 3) * 1.3;
        const k = ramp(t, start, 0.5);
        const col = i < 4 ? i : i - 4;
        const row = i < 4 ? 0 : 1;
        const x = cx - 375 + col * 250 + (row ? 125 : 0);
        const y = 360 + row * 260;
        return (
          <g key={d} opacity={0.3 + 0.7 * k} transform={`translate(${x} ${y}) scale(${0.92 + 0.08 * k})`}>
            <rect x={-112} y={-110} width={224} height={220} rx={28} fill={C.white} stroke={OL} strokeWidth={5} />
            <rect x={-112} y={-110} width={224} height={54} rx={27} fill={HABIT[n].color} />
            <text y={-72} fontFamily={DISPLAY} fontWeight={800} fontSize={32} fill={C.white} textAnchor="middle">
              {d}
            </text>
            {s.split(" ").reduce<string[]>((acc, w) => {
              const last = acc[acc.length - 1];
              if (last && (last + " " + w).length <= 12) acc[acc.length - 1] = last + " " + w;
              else acc.push(w);
              return acc;
            }, []).map((l, j) => (
              <text key={j} y={-6 + j * 34} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink} textAnchor="middle">
                {l}
              </text>
            ))}
            <Check x={70} y={80} s={26} k={ramp(t, start + 0.6, 0.4)} />
          </g>
        );
      })}
    </Drift>
  );
};

// ───────────── три вопроса ─────────────
export const Questions: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const qs = ["свой ответ", "чья срочность", "кого выслушать"];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={420} amount={0.02}>
      <g transform={`translate(${cx} 330)`}>
        <circle r={150 + 6 * Math.sin(t * 1.5)} fill={C.white} opacity={0.18} />
        <text y={70} fontFamily={DISPLAY} fontWeight={800} fontSize={220} fill={C.white} textAnchor="middle">
          ?
        </text>
      </g>
      {qs.map((q, i) => {
        const k = ramp(t, at(ctx, i + 1) - 0.2, 0.5);
        const x = cx - 340 + i * 340;
        return (
          <g key={q} opacity={0.25 + 0.75 * k} transform={`translate(${x} 620)`}>
            <circle cx={0} cy={-40} r={34} fill={HABIT[[1, 3, 5][i]].color} stroke={C.white} strokeWidth={6} />
            <text y={-28} fontFamily={DISPLAY} fontWeight={800} fontSize={36} fill={C.white} textAnchor="middle">
              {i + 1}
            </text>
            <Label x={0} y={50} text={q} size={28} bg={C.white} />
          </g>
        );
      })}
    </Drift>
  );
};

// ───────────── финал ─────────────
export const Finale: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const logo = ramp(t, at(ctx, 1.45), 0.8);
  return (
    <g>
      <Sun x={cx} y={600} r={100} t={t} color="#ffcf6a" />
      <path d={`M ${cx - 380} 1080 L ${cx - 60} 620 L ${cx + 60} 620 L ${cx + 380} 1080 Z`} fill={C.teal} stroke={OL} strokeWidth={5} opacity={0.92} />
      <path d={`M ${cx} 1080 L ${cx} 640`} stroke="#fff" strokeWidth={8} strokeDasharray="40 30" opacity={0.8} />
      {[1, 2, 3, 4, 5, 6, 7].map((n, i) => {
        const y = 1010 - i * 52;
        const w = 1 - i * 0.11;
        return <circle key={n} cx={cx + (i % 2 ? 1 : -1) * 150 * w} cy={y} r={20 * w} fill={HABIT[n].color} stroke={C.white} strokeWidth={4} opacity={ramp(t, 0.4 + i * 0.25, 0.4)} />;
      })}
      <Appear t={t} at={0.4} x={cx} y={220}>
        <g opacity={1 - logo}>
          <rect x={-570} y={-100} width={1140} height={200} rx={40} fill={C.paper} stroke={OL} strokeWidth={5} />
          <text y={-22} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink} textAnchor="middle">
            «прибудем на то же место, с которого начали,
          </text>
          <text y={26} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink} textAnchor="middle">
            и впервые познаем его по-настоящему»
          </text>
          <text x={530} y={74} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.inkSoft} textAnchor="end">
            Т. С. Элиот — в книге Кови
          </text>
        </g>
      </Appear>
      {logo > 0 && (
        <g opacity={logo} transform={`translate(${cx} 230) scale(${0.85 + 0.15 * logo})`}>
          <text y={20} fontFamily={DISPLAY} fontWeight={800} fontSize={130} textAnchor="middle" fill={C.white}>
            {BRAND.wordmark[0]}
            <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
          </text>
          <text y={96} fontFamily={FONT} fontWeight={800} fontSize={42} textAnchor="middle" fill={C.white}>
            Большие идеи — простыми словами
          </text>
        </g>
      )}
    </g>
  );
};
