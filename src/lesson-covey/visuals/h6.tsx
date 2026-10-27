// Навык 6 «Достигайте синергии»: два растения с переплетёнными корнями, три уровня
// общения по доверию, третья альтернатива как вершина треугольника, газ и тормоз и
// силовое поле Левина (пружина), притча о школе зверей.
import React from "react";
import { C, DISPLAY, HABIT } from "../theme";
import { Bubble, Card, Icon, Label, OL, Person } from "./draw";
import { Appear, area, Arrow, at, Check, Cross, Drift, Pop, ramp, Txt, wob, type VisualProps } from "./kit";

const H6 = HABIT[6].color;

// ───────────── корни ─────────────
export const Synergy: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const grow = ramp(t, b1, 2.4);
  const soil = ramp(t, b1 + 1.6, 2);
  const soilColor = `rgb(${Math.round(150 - soil * 40)}, ${Math.round(105 - soil * 15)}, ${Math.round(70 - soil * 10)})`;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <Appear t={t} at={0.4} x={cx} y={240}>
        <g>
          <Txt x={-210} y={0} size={110} color={C.white} weight={900}>
            1 + 1
          </Txt>
          <Txt x={40} y={0} size={110} color={C.white} weight={900}>
            {">"}
          </Txt>
          <Txt x={200} y={0} size={110} color={C.sun} weight={900}>
            2
          </Txt>
          <Label x={0} y={90} text="целое больше суммы частей" size={30} bg={C.white} />
        </g>
      </Appear>
      <rect x={cx - 520} y={600} width={1040} height={260} rx={30} fill={soilColor} stroke={OL} strokeWidth={5} />
      {[-1, 1].map((side) => {
        const px = cx + side * 160;
        const h = 60 + grow * 140;
        return (
          <g key={side}>
            <path d={`M ${px} 600 Q ${px + wob(t, side, 8)} ${600 - h / 2} ${px} ${600 - h}`} stroke={C.grassDeep} strokeWidth={12} fill="none" strokeLinecap="round" />
            {[0.4, 0.7, 1].map((f, i) => (
              <ellipse key={i} cx={px + (i % 2 ? 34 : -34)} cy={600 - h * f} rx={40} ry={18} fill={C.grass} stroke={OL} strokeWidth={3} transform={`rotate(${i % 2 ? 25 : -25} ${px + (i % 2 ? 34 : -34)} ${600 - h * f})`} />
            ))}
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${px} 600 Q ${px - side * (40 + i * 30)} ${660 + i * 40} ${px - side * (60 + i * 70) * (0.4 + 0.6 * grow)} ${700 + i * 50}`} stroke="#f3e2c3" strokeWidth={7} fill="none" strokeLinecap="round" />
            ))}
          </g>
        );
      })}
      {soil > 0 && [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={cx - 300 + i * 150} cy={760 + Math.sin(i * 2) * 30} r={10 * soil} fill={C.sun} opacity={0.7} />)}
      <Appear t={t} at={b1 + 1.8} x={cx} y={560}>
        <Label x={0} y={0} text="ценить различия, а не стирать их" size={28} bg={HABIT[6].soft} />
      </Appear>
    </Drift>
  );
};

// ───────────── три уровня общения ─────────────
export const Trust: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const lv = [
    { name: "оборона", sub: "низкое доверие", f: "", color: C.coral, icon: "key" as const },
    { name: "уважение", sub: "компромисс", f: "1 + 1 ≈ 1,5", color: "#ffb84a", icon: "people" as const },
    { name: "синергия", sub: "новое решение", f: "больше суммы", color: C.green, icon: "star" as const },
  ];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      {lv.map((l, i) => {
        const k = ramp(t, i < 2 ? 0.4 + i * 1.4 : b1, 0.5);
        const x = cx - 380 + i * 380;
        const y = 700 - i * 150;
        return (
          <g key={l.name} opacity={0.25 + 0.75 * k}>
            <rect x={x - 170} y={y} width={340} height={860 - y} rx={22} fill={l.color} stroke={OL} strokeWidth={5} />
            <Icon name={l.icon} x={x} y={y + 70} s={1.2} color={C.white} />
            <Txt x={x} y={y - 76} size={40} color={C.white} weight={900}>
              {l.name}
            </Txt>
            <Txt x={x} y={y - 34} size={26} color={C.white}>
              {l.sub}
            </Txt>
            {l.f && (
              <Txt x={x} y={y + 160} size={30} color={C.white} weight={900}>
                {l.f}
              </Txt>
            )}
          </g>
        );
      })}
      <Arrow x1={cx - 520} y1={880} x2={cx + 540} y2={880} k={ramp(t, 0.4, 1.2)} color={C.white} w={8} />
      <Txt x={cx + 470} y={850} size={24} color={C.white} weight={900}>
        доверие
      </Txt>
      <Appear t={t} at={b1 + 2.2} x={cx - 230} y={230}>
        <Label x={0} y={0} text="не магия «1 + 1 = 10»" size={28} bg={C.white} />
        <Label x={0} y={74} text="не уступка сильному" size={28} bg={C.white} />
      </Appear>
    </Drift>
  );
};

// ───────────── третья альтернатива ─────────────
export const Triangle: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const apex = ramp(t, b1 + 0.6, 1.4);
  const L = { x: cx - 470, y: 760 };
  const R = { x: cx + 470, y: 760 };
  const T = { x: cx, y: 760 - apex * 470 };
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={C.white} strokeWidth={8} strokeDasharray="18 14" />
      {apex > 0 && (
        <g>
          <path d={`M ${L.x} ${L.y} L ${T.x} ${T.y} L ${R.x} ${R.y}`} stroke={H6} strokeWidth={10} fill={H6} fillOpacity={0.15} strokeLinejoin="round" />
          <Pop t={t} at={b1 + 2} x={T.x} y={T.y}>
            <circle r={44} fill={C.sun} stroke={C.white} strokeWidth={8} />
            <Icon name="star" x={0} y={0} s={0.9} color={C.white} />
          </Pop>
          <Appear t={t} at={b1 + 2.6} x={T.x} y={T.y - 100}>
            <Card x={0} y={-30} w={620} h={150} color={H6} title="третий вариант" lines={["вместе к маме + рыбалка у реки"]} size={28} titleSize={36} />
          </Appear>
        </g>
      )}
      <g transform={`translate(${L.x} ${L.y})`}>
        <ellipse cx={0} cy={-20} rx={110} ry={44} fill={C.sky} stroke={OL} strokeWidth={4} />
        <Label x={0} y={70} text="озеро" size={30} bg={C.white} />
      </g>
      <g transform={`translate(${R.x} ${R.y})`}>
        <rect x={-70} y={-110} width={140} height={110} fill={C.paper} stroke={OL} strokeWidth={4} />
        <path d="M -90 -106 L 0 -170 L 90 -106 Z" fill={C.coral} stroke={OL} strokeWidth={4} />
        <Label x={0} y={70} text="мама" size={30} bg={C.white} />
      </g>
      <Person who="marat" x={L.x + 200} y={860} s={0.55} t={t} pose={t < b1 ? "stand" : "open"} mood="calm" accent={C.teal} />
      <Person who="leila" x={R.x - 200} y={860} s={0.55} t={t} pose={t < b1 ? "stand" : "open"} mood={t < b1 ? "sad" : "calm"} flip />
      <Pop t={t} at={0.8} x={R.x - 230} y={420}>
        <Bubble x={0} y={0} text={"тревога\nза маму"} w={240} size={28} think />
      </Pop>
      <Pop t={t} at={at(ctx, 0.55)} x={L.x + 230} y={420}>
        <Bubble x={0} y={0} text={"очень устал,\nнужна тишина"} w={270} size={28} think />
      </Pop>
    </Drift>
  );
};

// ───────────── газ и тормоз; силовое поле ─────────────
export const Forces: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const field = ramp(t, b1 - 0.2, 0.6);
  const push = ramp(t, b1 + 2.2, 1) - ramp(t, b1 + 3.6, 0.5);
  const release = ramp(t, b1 + 5, 1.4);
  const level = 520 - push * 40 + ramp(t, b1 + 3.6, 0.5) * 40 * (1 - release) - release * 130;
  const shake = (1 - field) * Math.sin(t * 30) * 3;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      {field < 1 && (
        <g opacity={1 - field} transform={`translate(${shake} 0)`}>
          <path d={`M ${cx - 330} 560 L ${cx - 280} 430 Q ${cx - 200} 380 ${cx - 60} 380 L ${cx + 120} 380 Q ${cx + 220} 390 ${cx + 280} 450 L ${cx + 340} 560 Z`} fill={H6} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
          <rect x={cx - 160} y={400} width={240} height={70} rx={14} fill={C.sky} stroke={OL} strokeWidth={4} />
          <circle cx={cx - 200} cy={570} r={52} fill={OL} />
          <circle cx={cx + 210} cy={570} r={52} fill={OL} />
          <g transform={`translate(${cx - 90} 760)`}>
            <rect x={-60} y={-90} width={120} height={180} rx={20} fill={C.coral} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={14} size={30} color={C.white} weight={900}>
              газ
            </Txt>
          </g>
          <g transform={`translate(${cx + 90} 760)`}>
            <rect x={-60} y={-70} width={120} height={140} rx={20} fill="#5a6280" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={14} size={28} color={C.white} weight={900}>
              тормоз
            </Txt>
          </g>
          {[0, 1].map((i) => <path key={i} d={`M ${cx - 380 - i * 40} 470 l -60 ${i ? 20 : -20}`} stroke="#c9d2e6" strokeWidth={10} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 9 + i)} />)}
        </g>
      )}
      {field > 0 && (
        <g opacity={field}>
          <line x1={cx - 520} y1={level} x2={cx + 520} y2={level} stroke={C.white} strokeWidth={10} strokeLinecap="round" />
          <Txt x={cx + 470} y={level - 24} size={28} color={C.white} weight={900}>
            сейчас
          </Txt>
          {["цели", "логика", "выгода"].map((s, i) => {
            const x = cx - 400 + i * 160;
            const len = 150 + push * 70;
            return (
              <g key={s}>
                <Arrow x1={x} y1={level + 40 + len} x2={x} y2={level + 30} k={ramp(t, b1 + i * 0.4, 0.6)} color={C.green} w={14} />
                <Label x={x} y={level + 90 + len} text={s} size={24} bg={C.white} />
              </g>
            );
          })}
          {["страх", "обида", "недоверие"].map((s, i) => {
            const x = cx + 120 + i * 160;
            const gone = ramp(t, b1 + 5 + i * 0.4, 0.6);
            return (
              <g key={s} opacity={1 - gone}>
                <Arrow x1={x} y1={level - 230} x2={x} y2={level - 30} k={ramp(t, b1 + 1 + i * 0.4, 0.6)} color={C.coral} w={14} />
                <Label x={x} y={level - 270} text={s} size={24} bg={C.coralSoft} />
              </g>
            );
          })}
          {push > 0.2 && (
            <g transform={`translate(${cx - 600} ${level})`}>
              <path d={`M 0 0 ${Array.from({ length: 8 }).map((_, i) => `L ${i % 2 ? 14 : -14} ${-(i + 1) * (16 - push * 8)}`).join(" ")}`} stroke={C.sun} strokeWidth={6} fill="none" />
              <Txt x={0} y={60} size={24} color={C.white}>
                пружина
              </Txt>
            </g>
          )}
        </g>
      )}
    </Drift>
  );
};

// ───────────── школа зверей ─────────────
const Animal: React.FC<{ kind: "duck" | "rabbit" | "squirrel"; x: number; y: number; s?: number; t: number; sad?: boolean }> = ({ kind, x, y, s = 1, t, sad }) => {
  const body = kind === "duck" ? "#ffd23f" : kind === "rabbit" ? "#eae6f2" : "#c9824f";
  const bob = Math.sin(t * 3 + x) * 4;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {kind === "rabbit" && (
        <g fill={body} stroke={OL} strokeWidth={4}>
          <ellipse cx={-22} cy={-170} rx={16} ry={50} />
          <ellipse cx={22} cy={-170} rx={16} ry={50} />
        </g>
      )}
      {kind === "squirrel" && <path d="M 50 -20 Q 130 -60 90 -160 Q 60 -200 40 -150 Q 80 -100 30 -60 Z" fill="#b06c3a" stroke={OL} strokeWidth={4} />}
      <ellipse cx={0} cy={-50} rx={64} ry={56} fill={body} stroke={OL} strokeWidth={4} />
      <circle cx={0} cy={-120} r={44} fill={body} stroke={OL} strokeWidth={4} />
      {kind === "duck" && <path d="M 30 -118 L 74 -110 L 30 -100 Z" fill={C.sunDeep} stroke={OL} strokeWidth={3} />}
      <circle cx={-14} cy={-128} r={5} fill={OL} />
      <circle cx={14} cy={-128} r={5} fill={OL} />
      <path d={sad ? "M -10 -98 Q 0 -106 10 -98" : "M -10 -104 Q 0 -96 10 -104"} stroke={OL} strokeWidth={3} fill="none" />
    </g>
  );
};

export const Animals: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const quote = ramp(t, b1, 0.6);
  const subjects = [
    { kind: "duck" as const, lesson: "бег", good: "плавание" },
    { kind: "rabbit" as const, lesson: "плавание", good: "бег" },
    { kind: "squirrel" as const, lesson: "полёт", good: "лазание" },
  ];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g opacity={1 - quote}>
        <rect x={cx - 520} y={180} width={1040} height={110} rx={24} fill={C.paper} stroke={OL} strokeWidth={5} />
        <text x={cx} y={252} fontFamily={DISPLAY} fontWeight={800} fontSize={48} fill={C.ink} textAnchor="middle">
          ШКОЛА ЗВЕРЕЙ
        </text>
        {subjects.map((s, i) => {
          const x = cx - 340 + i * 340;
          const k = ramp(t, 0.6 + i * 1.2, 0.5);
          const fail = t > 1.2 + i * 1.2 + 1.2;
          return (
            <g key={s.kind} opacity={k}>
              <Animal kind={s.kind} x={x} y={760} s={1.1} t={t} sad={fail} />
              <Label x={x} y={380} text={`урок: ${s.lesson}`} size={26} bg={C.coralSoft} />
              <Label x={x} y={830} text={`дар: ${s.good}`} size={24} bg={HABIT[6].soft} />
              {fail && <Cross x={x + 110} y={520} s={60} k={ramp(t, 1.2 + i * 1.2 + 1.2, 0.5)} />}
            </g>
          );
        })}
      </g>
      {quote > 0 && (
        <g opacity={quote} transform={`translate(${cx} 470) scale(${0.85 + 0.15 * quote})`}>
          <Card x={0} y={0} w={900} h={260} color={H6} title="«Если два человека имеют одно" lines={["и то же мнение, один из них не нужен»"]} size={36} titleSize={38} />
          <Check x={-380} y={90} s={36} k={ramp(t, b1 + 1, 0.5)} />
        </g>
      )}
    </Drift>
  );
};

