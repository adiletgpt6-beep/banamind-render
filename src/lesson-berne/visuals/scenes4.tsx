// Сцены последних частей BM-034: обычный разговор, место игр между скукой и
// близостью, независимость (включённость, спонтанность, близость), птицы,
// водители и итоговые наблюдения.
import React from "react";
import { C, DISPLAY, EGO, EGOS, FONT } from "../theme";
import { Bubble, CloudIcon, EyeIcon, Plate, textW } from "./core";
import { dotsOf, hash, Morph, SH, Swarm, type Pt } from "./dots";
import { OL, Person } from "./draw";
import { area, at, clamp01, Drift, pop, ramp, type VisualProps } from "./kit";

type HostP = { host?: string };

// ── Обычный разговор о погоде — просто разговор ──
export const SmallTalk: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const sun = 0.5 + 0.5 * Math.sin(t * 2);
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      <g transform={`translate(${cx} 210)`} opacity={ramp(t, 0.1, 0.6)}>
        <circle r={70 + sun * 6} fill={C.yellow} stroke={OL} strokeWidth={5} />
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={Math.cos((i * Math.PI) / 4) * 95} y1={Math.sin((i * Math.PI) / 4) * 95} x2={Math.cos((i * Math.PI) / 4) * 125} y2={Math.sin((i * Math.PI) / 4) * 125} stroke={C.yellow} strokeWidth={10} strokeLinecap="round" />
        ))}
      </g>
      <Person who="neighbor" x={cx - 300} y={840} s={0.85} mood="smile" pose="wave" t={t} />
      <Person who="friend" x={cx + 300} y={840} s={0.85} mood="happy" t={t} flip seed={3} />
      <Bubble x={cx - 260} y={410} text="Как погода!" k={pop(t, 0.6)} tail="b" maxW={420} />
      <Bubble x={cx + 260} y={470} text="Чудесная!" k={pop(t, 1.2)} tail="b" tone="soft" maxW={420} />
      {[
        { text: "без задней мысли", at: 1.1, y: 130, x: A.x0 + 220 },
        { text: "знаки внимания", at: 1.4, y: 130, x: A.x1 - 220 },
        { text: "просто разговор", at: 2.2, y: 640, x: cx },
      ].map((l, i) => (
        <Plate key={i} x={l.x} y={l.y} text={l.text} k={ramp(t, at(ctx, l.at), 0.5)} bg={i === 2 ? "#e3fbef" : "#ffffff"} size={38} />
      ))}
    </Drift>
  );
};

// ── Игры между скукой и близостью; передаются в семьях ──
export const Between: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const x0 = A.x0 + 80;
  const x1 = A.x1 - 80;
  const mid = ramp(t, at(ctx, 1), 0.8);
  const fam = ramp(t, at(ctx, 2), 0.6);
  const midPts = dotsOf("between-mid", SH.rect(300, 150, 30), (x0 + x1) / 2, 380, [EGO.P.color, EGO.A.color, EGO.C.color, "#ffffff"], 13, 200);
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      <g opacity={1 - fam * 0.85}>
        <line x1={x0} y1={380} x2={x1} y2={380} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
        <g transform={`translate(${x0 + 90} 380)`} opacity={ramp(t, at(ctx, 0.2), 0.5)}>
          <circle r={90} fill="#c8c8d8" stroke={OL} strokeWidth={5} />
          <text y={18} fontFamily={DISPLAY} fontWeight={800} fontSize={50} fill={C.ink} textAnchor="middle">
            zZ
          </text>
          <text y={150} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
            приедается
          </text>
        </g>
        <g transform={`translate(${x1 - 90} 380)`} opacity={ramp(t, at(ctx, 0.6), 0.5)}>
          <circle r={90} fill="#ff9fb8" stroke={OL} strokeWidth={5} />
          <path d="M 0 -10 C -20 -50 -66 -26 -40 10 L 0 44 L 40 10 C 66 -26 20 -50 0 -10 Z" fill="#ff4d7e" stroke={OL} strokeWidth={4} />
          <text y={150} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
            рискованно
          </text>
        </g>
        <Swarm pts={midPts} k={mid} t={t} r={6} from="below" />
        <text x={(x0 + x1) / 2} y={400} fontFamily={DISPLAY} fontWeight={800} fontSize={56} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={8} paintOrder="stroke" opacity={mid}>
          игры
        </text>
        <Plate x={(x0 + x1) / 2} y={600} text="компромисс: не скучно и не слишком открыто" k={ramp(t, at(ctx, 1.4), 0.5)} bg="#ffffff" size={34} />
      </g>
      {fam > 0 && (
        <g opacity={fam}>
          {[0, 1, 2].map((g) => {
            const x = x0 + 160 + g * ((x1 - x0 - 320) / 2);
            const k = ramp(t, at(ctx, 2) + g * 0.5, 0.5);
            return (
              <g key={g} opacity={k}>
                <Person who={(["grandma", "timur", "kid"] as const)[g]} x={x} y={760} s={0.78} mood="smile" t={t} seed={g} />
                {g < 2 && <path d={`M ${x + 90} 380 C ${x + 200} 300 ${x + (x1 - x0 - 320) / 2 - 200} 300 ${x + (x1 - x0 - 320) / 2 - 90} 380`} fill="none" stroke={C.yellow} strokeWidth={8} strokeDasharray="20 14" strokeDashoffset={-t * 40} />}
              </g>
            );
          })}
          <Plate x={A.cx} y={160} text="выученный маршрут — не клеймо" k={ramp(t, at(ctx, 2.4), 0.5)} size={40} />
        </g>
      )}
    </Drift>
  );
};

// ── Независимость: три способности ──
const eyeShape = SH.minus(SH.union(SH.circle(80)), SH.ring(30, 46));
const sparkShape = SH.strokes([[-70, 0, 70, 0], [0, -70, 0, 70], [-50, -50, 50, 50], [50, -50, -50, 50]], 26);
export const Three: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const items = [
    { name: "включённость\nв настоящее", f: eyeShape, c: [EGO.A.color, EGO.A.light, "#ffffff"] },
    { name: "спонтанность", f: sparkShape, c: [EGO.C.color, C.yellow, "#ffffff"] },
    { name: "близость", f: SH.heart(80), c: ["#ff6b9a", "#ff9fb8", "#ffffff"] },
  ];
  const gap = (A.x1 - A.x0) / 3;
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      <Plate x={A.cx} y={160} text="независимость" k={ramp(t, at(ctx, 0.5), 0.5)} bg={C.yellow} size={58} />
      {items.map((it, i) => {
        const x = A.x0 + gap * (i + 0.5);
        const pts = dotsOf(`three-${i}`, it.f, x, 440, it.c, 11, 140);
        const k = ramp(t, at(ctx, 1.25 + i * 0.22), 1.2);
        return (
          <g key={i}>
            <circle cx={x} cy={440} r={140} fill="#ffffff" fillOpacity={0.14} stroke="#fff" strokeOpacity={0.5} strokeWidth={4} opacity={k} />
            <Swarm pts={pts} k={k} t={t} r={6} />
            <text x={x} y={650} fontFamily={FONT} fontWeight={900} fontSize={42} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={7} paintOrder="stroke" opacity={k}>
              {it.name.split("\n").map((r, j) => (
                <tspan key={j} x={x} dy={j === 0 ? 0 : 48}>
                  {r}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </Drift>
  );
};

// ── Мальчик и птицы ──
const birdShape = SH.union(SH.circle(46), SH.move(SH.circle(28), 46, -32), SH.strokes([[-36, -10, -120, -70], [-18, -10, -70, -104]], 24), SH.strokes([[68, -32, 100, -22]], 14));
export const Birds: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const dad = ramp(t, at(ctx, 1.4), 0.6);
  const grey = ramp(t, at(ctx, 2.2), 1.2);
  const live = [EGO.C.color, C.yellow, "#ff6b9a", EGO.A.color, "#ffffff"];
  const flock: Pt[][] = [0, 1, 2].map((i) => dotsOf(`bird-${i}`, birdShape, cx - 300 + i * 300, 250 + (i % 2) * 60, live, 10, 150));
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      {flock.map((pts, i) => {
        const dy = Math.sin(t * 2 + i) * 14 * (1 - grey);
        const greyPts = pts.map((p, j) => ({ ...p, c: ["#c8c8d8", "#a8acc0", "#e0e0ea"][Math.floor(hash(j, 5) * 3)] }));
        return (
          <g key={i} transform={`translate(0 ${dy})`}>
            {grey <= 0 ? <Swarm pts={pts} k={ramp(t, 0.2 + i * 0.2, 1)} t={t} r={5} /> : <Morph a={pts} b={greyPts} k={grey} t={t} r={5} arc={0} />}
          </g>
        );
      })}
      <Person who="kid" x={cx - 140} y={840} s={0.95} mood={grey > 0.5 ? "think" : "happy"} pose={grey > 0.5 ? "stand" : "point"} t={t} />
      {dad > 0 && <Person who="boss" x={cx + 220} y={840} s={0.85} mood="smile" pose="point" t={t} flip opacity={dad} />}
      {[
        { text: "сойка", at: 1.6, x: cx - 260, y: 330 },
        { text: "воробей", at: 1.85, x: cx + 260, y: 330 },
      ].map((l, i) => (
        <Plate key={i} x={l.x} y={l.y + 40} text={l.text} k={ramp(t, at(ctx, l.at), 0.4)} bg="#ffffff" size={38} />
      ))}
      <Plate x={cx} y={110} text="видеть и слышать самому" k={ramp(t, at(ctx, 0.3), 0.5)} bg={C.yellow} size={40} />
    </Drift>
  );
};

// ── Четыре водителя и скамейка в парке ──
export const Drivers: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const lanes = [
    { think: "что скажет начальство?", at: 0.35, c: EGO.P.color },
    { think: "кто виноват?", at: 0.75, c: C.outcome },
    { think: "люблю водить!", at: 1.05, c: EGO.A.color },
    { think: "небо, деревья…", at: 1.45, c: EGO.C.color },
  ];
  const park = ramp(t, at(ctx, 2), 0.7);
  const x0 = A.x0 + 40;
  const x1 = A.x1 - 40;
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.03}>
      <g opacity={1 - park}>
        {lanes.map((l, i) => {
          const y = 200 + i * 150;
          const k = ramp(t, at(ctx, l.at), 0.5);
          const carX = x0 + 120 + ((t * (i === 3 ? 60 : 160) + i * 140) % (x1 - x0 - 300));
          return (
            <g key={i} opacity={0.35 + 0.65 * k}>
              <rect x={x0} y={y - 46} width={x1 - x0} height={92} rx={20} fill="#4a5070" stroke={OL} strokeWidth={4} />
              <g transform={`translate(${carX} ${y})`}>
                <rect x={-70} y={-30} width={140} height={60} rx={16} fill={l.c} stroke={OL} strokeWidth={4} />
                <rect x={-30} y={-24} width={50} height={26} rx={6} fill="#e8f4ff" stroke={OL} strokeWidth={3} />
              </g>
              <g transform={`translate(${Math.min(x1 - 220, carX + 260)} ${y})`} opacity={k}>
                <rect x={-textW(l.think, 32) / 2 - 20} y={-30} width={textW(l.think, 32) + 40} height={58} rx={28} fill="#ffffff" stroke={OL} strokeWidth={4} />
                <text y={10} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink} textAnchor="middle">
                  {l.think}
                </text>
              </g>
            </g>
          );
        })}
      </g>
      {park > 0 && (
        <g opacity={park}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${A.x0 + 180 + i * 220} ${560 - (i % 2) * 40})`}>
              <rect x={-14} y={-20} width={28} height={140} fill="#7a5a3a" stroke={OL} strokeWidth={4} />
              <circle cy={-80} r={110} fill="#4fae6a" stroke={OL} strokeWidth={5} />
            </g>
          ))}
          <rect x={A.cx + 40} y={640} width={360} height={30} rx={10} fill="#a8724c" stroke={OL} strokeWidth={4} />
          <rect x={A.cx + 60} y={670} width={20} height={90} fill="#7a5a3a" stroke={OL} strokeWidth={3} />
          <rect x={A.cx + 360} y={670} width={20} height={90} fill="#7a5a3a" stroke={OL} strokeWidth={3} />
          <Person who="neighbor" x={A.cx + 220} y={780} s={0.62} mood="happy" t={t} />
          <Plate x={A.cx + 220} y={200} text="сэкономленные двадцать минут — на скамейку" k={ramp(t, at(ctx, 2.3), 0.5)} bg="#ffffff" size={34} />
        </g>
      )}
    </Drift>
  );
};

// ── Спонтанность, близость, авторская сноска, финал книги ──
export const Spontaneity: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const cx = A.cx;
  const s1 = 1 - ramp(t, at(ctx, 1) - 0.3, 0.4);
  const s2 = ramp(t, at(ctx, 1), 0.5) * (1 - ramp(t, at(ctx, 2) - 0.3, 0.4));
  const s3 = ramp(t, at(ctx, 2), 0.5) * (1 - ramp(t, at(ctx, 3) - 0.3, 0.4));
  const s4 = ramp(t, at(ctx, 3), 0.5);
  const choice = EGOS[Math.floor(t * 0.8) % 3];
  const heart = dotsOf("spont-heart", SH.heart(140), cx, 420, ["#ff6b9a", "#ff9fb8", "#ffffff", C.yellow], 12, 240);
  return (
    <Drift t={t} dur={ctx.dur} cx={cx} amount={0.03}>
      {s1 > 0 && (
        <g opacity={s1}>
          {EGOS.map((e, i) => {
            const on = e === choice;
            return (
              <g key={e} transform={`translate(${cx + (i - 1) * 280} 430) scale(${on ? 1.15 : 0.9})`}>
                <circle r={110} fill={EGO[e].color} stroke={OL} strokeWidth={6} opacity={on ? 1 : 0.55} />
                <text y={30} fontFamily={DISPLAY} fontWeight={800} fontSize={80} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={5} paintOrder="stroke">
                  {EGO[e].short}
                </text>
              </g>
            );
          })}
          <Plate x={cx} y={160} text="спонтанность — свобода выбора" k={ramp(t, 0.3, 0.5)} bg={C.yellow} size={42} />
        </g>
      )}
      {s2 > 0 && (
        <g opacity={s2}>
          <Swarm pts={heart} k={ramp(t, at(ctx, 1), 1.2)} t={t} r={6} />
          <Plate x={cx} y={160} text="близость — честный контакт без игр" k={s2} bg="#ffffff" size={40} />
        </g>
      )}
      {s3 > 0 && (
        <g opacity={s3}>
          <rect x={cx - 520} y={180} width={1040} height={480} rx={30} fill="#fffdf6" stroke={OL} strokeWidth={5} />
          <text x={cx - 470} y={250} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.inkSoft}>
            сноска автора
          </text>
          <text x={cx} y={340} fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.ink} textAnchor="middle">
            <tspan x={cx}>экспериментальное применение анализа</tspan>
            <tspan x={cx} dy={48}>требует специального образования и опыта</tspan>
          </text>
          <g transform={`translate(${cx - 180} 540)`}>
            <path d="M 0 -50 L 14 -16 L 50 -16 L 22 6 L 32 42 L 0 20 L -32 42 L -22 6 L -50 -16 L -14 -16 Z" fill={C.yellow} stroke={OL} strokeWidth={4} />
          </g>
          <text x={cx} y={556} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={C.ink} textAnchor="middle">
            ≈ ?
          </text>
          <g transform={`translate(${cx + 180} 540)`}>
            <circle r={44} fill={EGO.P.color} stroke={OL} strokeWidth={4} />
            <ellipse rx={74} ry={16} fill="none" stroke={OL} strokeWidth={5} transform="rotate(-18)" />
          </g>
        </g>
      )}
      {s4 > 0 && (
        <g opacity={s4}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Person key={i} who={(["anna", "timur", "grandma", "kid", "friend"] as const)[i]} x={cx - 440 + i * 220} y={760} s={0.62} mood="happy" pose={i % 2 ? "wave" : "stand"} t={t} seed={i} />
          ))}
          <Plate x={cx} y={180} text={"чувство общности —\nвпереди прекрасные надежды"} k={s4} bg="#e3fbef" size={40} />
        </g>
      )}
    </Drift>
  );
};

// ── Три наблюдения ──
export const Takeaways: React.FC<VisualProps<HostP>> = (ctx) => {
  const { t } = ctx;
  const A = area(ctx.p.host);
  const n = 3;
  const w = (A.x1 - A.x0 - 80) / n - 24;
  const items = [
    { title: "замечать\nповторение", icon: "loop" },
    { title: "отличать\nнаблюдение\nот догадки", icon: "eye" },
    { title: "уточнять,\nо чём разговор, —\nс уважением", icon: "talk" },
  ];
  return (
    <Drift t={t} dur={ctx.dur} cx={A.cx} amount={0.025}>
      {items.map((it, i) => {
        const k = pop(t, at(ctx, 1 + i));
        if (k <= 0.01) return null;
        const x = A.x0 + 40 + w / 2 + i * (w + 24);
        const rows = it.title.split("\n");
        const fs = Math.min(40, (w - 40) / (Math.max(...rows.map((r) => [...r].length)) * 0.56));
        return (
          <g key={i} transform={`translate(${x} 450) scale(${0.7 + 0.3 * Math.min(1, k)})`} opacity={clamp01(k * 1.5)}>
            <rect x={-w / 2 + 6} y={-290} width={w} height={580} rx={34} fill="#000" opacity={0.16} />
            <rect x={-w / 2} y={-300} width={w} height={580} rx={34} fill="#ffffff" stroke={OL} strokeWidth={5} />
            <circle cx={0} cy={-300} r={46} fill={C.yellow} stroke={OL} strokeWidth={5} />
            <text y={-284} fontFamily={DISPLAY} fontWeight={800} fontSize={48} fill={C.ink} textAnchor="middle">
              {i + 1}
            </text>
            <g transform="translate(0 -130)">
              {it.icon === "loop" && (
                <g>
                  <circle r={80} fill="none" stroke={EGO.P.color} strokeWidth={18} strokeDasharray="60 20" strokeDashoffset={-t * 40} />
                  <circle r={34} fill={C.outcome} stroke={OL} strokeWidth={4} />
                </g>
              )}
              {it.icon === "eye" && (
                <g>
                  <EyeIcon x={-70} y={0} s={0.9} />
                  <CloudIcon x={80} y={0} s={0.9} />
                </g>
              )}
              {it.icon === "talk" && (
                <g>
                  <Bubble x={-50} y={-20} text="О чём мы?" k={1} tail="none" maxW={220} size={30} />
                  <path d="M 30 50 C 60 20 90 20 110 40" fill="none" stroke={EGO.A.color} strokeWidth={10} strokeLinecap="round" />
                </g>
              )}
            </g>
            <text y={60} fontFamily={FONT} fontWeight={900} fontSize={fs} fill={C.ink} textAnchor="middle">
              {rows.map((r, j) => (
                <tspan key={j} x={0} dy={j === 0 ? 0 : fs * 1.2}>
                  {r}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </Drift>
  );
};
