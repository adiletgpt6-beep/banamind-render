// Слой «переживание войны»: художественные реконструкции BanaMind — без крови
// и натурализма, без кадров экранизаций и исторических военных схем. Дым —
// чёткие круги, взрывы — условные вспышки-звёзды, раненые не показываются.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT, SERIF } from "../theme";
import { Banner, BigArrow, Cloud, DotNet, Figure, Horse, Izba, Label, makeDots, OL, Paper, PierreWhiteHat, rnd, SmallArrow } from "./draw";
import { Appear, area, at, clamp01, Drift, ease, Fit, ramp, Txt, wob, type VisualProps } from "./kit";

type P = { host?: string; mode?: string; text?: string; who?: string; labels?: string[]; items?: string[] };

const Ground: React.FC<{ y: number; color: string; x0?: number; x1?: number; hill?: number }> = ({ y, color, x0 = -40, x1 = 1960, hill = 30 }) => (
  <path d={`M ${x0} ${y} Q ${(x0 + x1) * 0.3} ${y - hill} ${(x0 + x1) / 2} ${y - hill * 0.4} T ${x1} ${y - hill * 0.6} L ${x1} 1100 L ${x0} 1100 Z`} fill={color} />
);

const Smoke: React.FC<{ x: number; y: number; t: number; s?: number; seed?: number; color?: string }> = ({ x, y, t, s = 1, seed = 0, color = "#e6e9f2" }) => (
  <g transform={`translate(${x + Math.sin(t * 0.3 + seed) * 20} ${y - ((t * 8 + seed * 30) % 60)}) scale(${s})`} fill={color} opacity={0.85}>
    <circle cx={0} cy={0} r={40} />
    <circle cx={44} cy={-12} r={32} />
    <circle cx={-40} cy={-6} r={28} />
    <circle cx={10} cy={-40} r={30} />
  </g>
);

// ── Аустерлиц: знамя → высокое небо → маленький Наполеон ──
// mode: run (Андрей со знаменем), sky (лежит и смотрит в небо), napoleon (над ним «маленький человек»)
export const Sky: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const mode = p.mode ?? "sky";
  const cx = a.cx;
  const skyK = mode === "run" ? 0 : ramp(t, at(ctx, 0), 1.5);
  return (
    <g>
      {/* огромное небо */}
      <rect x={0} y={0} width={1920} height={1080} fill={C.sky} opacity={0.35 + 0.55 * skyK} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Cloud key={i} x={((rnd(i) * 1920 + t * (8 + i * 3)) % 2300) - 200} y={120 + i * 85} s={0.7 + rnd(i + 4) * 0.8} opacity={0.75} />
      ))}
      <Drift t={t} dur={dur} cx={cx} cy={800} amount={0.03}>
        <Ground y={900} color="#7f9c6a" />
        {mode === "run" && (
          <g>
            {Array.from({ length: 9 }).map((_, i) => (
              <Figure key={i} who="soldier" x={((cx - 700 + i * 150 + t * 60) % 1900) + 10} y={900 + (i % 3) * 12} s={0.42} pose="run" t={t + i} />
            ))}
            <g transform={`translate(${cx - 120 + t * 40} 0)`}>
              <Figure who="andrei" x={0} y={905} s={0.75} pose="banner" t={t} />
              <g transform="translate(26 690) rotate(14)">
                <Banner x={0} y={0} s={0.9} t={t} color={C.gold} />
              </g>
            </g>
            <Smoke x={cx + 480} y={800} t={t} s={1.3} seed={1} />
            <Smoke x={cx - 520} y={820} t={t} s={1.1} seed={3} />
          </g>
        )}
        {mode !== "run" && (
          <g>
            <Figure who="andrei" x={cx - 160} y={880} s={0.72} pose="lie" t={0} />
            <g transform={`translate(${cx + 130} 905) rotate(84)`}>
              <Banner x={0} y={0} s={0.7} t={0} color={C.gold} />
            </g>
            {/* взгляд вверх: пунктир к небу */}
            <line x1={cx - 160} y1={830} x2={cx - 160} y2={830 - 600 * skyK} stroke="#fff" strokeWidth={5} strokeDasharray="3 16" strokeLinecap="round" opacity={0.8} />
          </g>
        )}
        {mode === "napoleon" && (
          <Appear t={t} at={at(ctx, 1)} x={0} y={0}>
            <Horse x={cx + 420} y={905} s={0.45} t={0} fill={C.ink} flip />
            <Figure who="napoleon" x={cx + 400} y={815} s={0.42} t={t} />
            <Label x={cx + 400} y={560} text={p.text ?? "«маленький, ничтожный»"} size={32} serif />
          </Appear>
        )}
      </Drift>
      {mode === "sky" && p.text && (
        <Appear t={t} at={at(ctx, 1)} x={cx} y={180}>
          <Txt x={0} y={0} size={60} color={C.ink}>
            {p.text}
          </Txt>
        </Appear>
      )}
    </g>
  );
};

// ── «Мой Тулон»: мечта о славе — золотая звезда против маленького силуэта ──
export const Glory: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const star = ramp(t, at(ctx, 0.3), 1);
  const dim = p.mode === "fade" ? ramp(t, at(ctx, 1), 1.6) : 0;
  const pts = Array.from({ length: 10 }).map((_, i) => {
    const r = i % 2 ? 70 : 170;
    const ang = (i * Math.PI) / 5 - Math.PI / 2;
    return `${Math.cos(ang) * r},${Math.sin(ang) * r}`;
  });
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      <rect x={0} y={0} width={1920} height={1080} fill="#0f1a3a" opacity={0.25} />
      <Fit a={a} w={1400} c={cx - 20}>
      <g transform={`translate(${cx + 260} 330) rotate(${t * 6}) scale(${star * (1 - 0.6 * dim)})`} opacity={1 - 0.7 * dim}>
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 8) * 300} y2={Math.sin((i * Math.PI) / 8) * 300} stroke={C.yellow} strokeWidth={6} opacity={0.35} />
        ))}
        <polygon points={pts.join(" ")} fill={C.gold} stroke="#fff" strokeWidth={8} />
      </g>
      <Ground y={930} color="#46557e" />
      <Figure who={(p.who as "andrei" | "nikolai") ?? "andrei"} x={cx - 300} y={930} s={0.9} pose="look" t={t} rim={C.yellow} />
      {(p.labels ?? []).map((l, i) => (
        <Appear key={l} t={t} at={at(ctx, 0.6 + i * 0.6)} x={cx - 260 + i * 200} y={330 + i * 95}>
          <Label x={0} y={0} text={l} size={32} bg={i === (p.labels?.length ?? 1) - 1 ? C.yellow : C.paper} />
        </Appear>
      ))}
      </Fit>
    </Drift>
  );
};

// ── Диспозиция против поля: аккуратный план тонет в тумане ──
// mode: austerlitz | borodino ; items — строки «плана»
export const Plan: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const fog = ramp(t, at(ctx, 1), 2.2);
  const lines = p.items ?? ["Первая колонна марширует…", "Вторая колонна марширует…", "Третья колонна марширует…"];
  const dots = makeDots(40, cx + 320, 560, 280, 250, 23);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.03}>
      <Fit a={a} w={1340} c={cx + 15}>
      <Paper x={cx - 330} y={540} w={560} h={640} rot={-3}>
        <text x={0} y={-250} fontFamily={SERIF} fontWeight={700} fontSize={38} fill={C.ink} textAnchor="middle">
          {p.mode === "borodino" ? "Диспозиция" : "Disposition"}
        </text>
        {lines.map((l, i) => (
          <g key={i} opacity={ramp(t, at(ctx, 0.2 + i * 0.25))}>
            <text x={-230} y={-170 + i * 64} fontFamily={SERIF} fontStyle="italic" fontSize={28} fill={C.inkSoft}>
              {l}
            </text>
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <SmallArrow key={i} x={-200 + i * 30} y={120 + i * 50} ang={-12 + i * 4} len={300} color={C.red} k={ramp(t, at(ctx, 0.5 + i * 0.2))} />
        ))}
      </Paper>
      {/* поле: те же стрелки расходятся точками; туман */}
      <g>
        <rect x={cx + 20} y={260} width={620} height={600} rx={30} fill="#9aa9c4" opacity={0.6} />
        <DotNet dots={dots} t={t} k={fog} links={1} drift={22 * fog} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx={cx + 330 + Math.sin(t * 0.4 + i) * 120} cy={320 + i * 100} rx={300} ry={46} fill="#eef1f8" opacity={0.55 * fog} />
        ))}
        <Label x={cx + 330} y={920} text={p.text ?? "поле"} size={34} bg={C.yellow} />
      </g>
      </Fit>
    </Drift>
  );
};

// ── Армия как часовой механизм (сравнение повествователя): шестерни без циферблата ──
export const Gears: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const gear = (x: number, y: number, r: number, teeth: number, rot: number, color: string, key: number) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: teeth }).map((_, i) => (
        <rect key={i} x={-r * 0.12} y={-r - r * 0.22} width={r * 0.24} height={r * 0.34} rx={4} fill={color} transform={`rotate(${(i * 360) / teeth})`} />
      ))}
      <circle r={r} fill={color} />
      <circle r={r * 0.32} fill={C.paper} />
    </g>
  );
  const spin = t * 24;
  const k2 = ramp(t, at(ctx, 1));
  return (
    <Drift t={t} dur={dur} cx={cx} cy={540}>
      <Fit a={a} w={1460} c={cx + 160}>
      {gear(cx - 380, 520, 170, 16, spin, C.goldDeep, 0)}
      {gear(cx - 120, 360, 100, 10, -spin * 1.7 + 10, C.gold, 1)}
      {gear(cx + 70, 520, 120, 12, spin * 1.4, C.steel, 2)}
      {gear(cx + 270, 380, 80, 9, -spin * 2.1, C.gold, 3)}
      {gear(cx + 330, 600, 70, 8, spin * 2.4, C.steel, 4)}
      <g opacity={k2}>
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={cx + 420 + rnd(i) * 300 + Math.sin(t + i) * 10} cy={360 + rnd(i + 30) * 420} r={10} fill={C.dots[i % 8]} stroke="#fff" strokeWidth={3} />
        ))}
        <Label x={cx + 560} y={300} text={p.text ?? "результат?"} size={32} bg={C.yellow} />
      </g>
      {(p.labels ?? []).map((l, i) => (
        <Appear key={l} t={t} at={at(ctx, i * 0.6)} x={cx - 380 + i * 400} y={820}>
          <Label x={0} y={0} text={l} size={30} />
        </Appear>
      ))}
      </Fit>
    </Drift>
  );
};

// ── Батарея Тушина: удержала центр без приказа ──
export const Battery: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const flash = (i: number) => {
    const ph = (t * 0.8 + i * 0.37) % 1;
    return ph < 0.12 ? 1 - ph / 0.12 : 0;
  };
  return (
    <Drift t={t} dur={dur} cx={cx} cy={640}>
      <Ground y={880} color="#6f8a5c" hill={160} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${cx - 360 + i * 150} ${790 - Math.sin(i * 0.9) * 40})`}>
          <rect x={-60} y={-30} width={110} height={26} rx={10} fill={OL} transform="rotate(-12)" />
          <circle cx={-20} cy={0} r={26} fill="#5a4632" stroke={OL} strokeWidth={6} />
          <g opacity={flash(i)} transform="translate(70 -50)">
            <polygon points="0,-40 12,-12 40,0 12,12 0,40 -12,12 -40,0 -12,-12" fill={C.yellow} />
          </g>
          <Smoke x={80} y={-80} t={t} s={0.6} seed={i} />
        </g>
      ))}
      <Figure who="soldier" x={cx - 470} y={830} s={0.55} pose="point" t={t} rim={C.yellow} />
      <Appear t={t} at={at(ctx, 0.5)} x={cx - 470} y={540}>
        <Label x={0} y={0} text={(p.labels ?? ["Тушин"])[0]} size={34} bg={C.yellow} />
      </Appear>
      <Appear t={t} at={at(ctx, 1)} x={0} y={0}>
        <Horse x={cx + 520} y={880} s={0.5} t={0} fill="#2a2f4a" flip />
        <Figure who="officer" x={cx + 500} y={780} s={0.5} t={t} />
        <Label x={cx + 500} y={520} text={(p.labels ?? [, "«Хорошо!»"])[1] ?? "«Хорошо!»"} size={30} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.6)} x={cx} y={200}>
        <Label x={0} y={0} text={p.text ?? "приказа не было"} size={40} bg={C.paper} />
      </Appear>
    </Drift>
  );
};

// ── Бородино: Пьер в белой шляпе на батарее; дым, реальные «точки» людей ──
// mode: field (общий план, Пьер-штатский), battery (курган, круг людей), kutuzov (ставка — донесения)
export const Borodino: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const mode = p.mode ?? "field";
  const cx = a.cx;
  if (mode === "kutuzov") {
    const msgs = Array.from({ length: 8 }).map((_, i) => ({ d: rnd(i + 3), y: 360 + i * 60 }));
    return (
      <Drift t={t} dur={dur} cx={cx} cy={600}>
        <Ground y={900} color="#8a9a6a" />
        <rect x={cx - 520} y={720} width={180} height={30} rx={10} fill="#6a4a2a" />
        <Figure who="kutuzov" x={cx - 430} y={900} s={0.8} pose="sit" t={t} rim={C.yellow} />
        {msgs.map((m, i) => {
          const ph = (t * 0.22 + m.d) % 1;
          const x = cx + 600 - ph * 950;
          return (
            <g key={i} opacity={clamp01(ph * 5) * clamp01((1 - ph) * 5)}>
              <Horse x={x} y={m.y + 300} s={0.22} t={t * 2 + i} fill={C.ink} flip />
              <rect x={x - 30} y={m.y + 180} width={44} height={30} rx={4} fill={C.paper} />
            </g>
          );
        })}
        <Appear t={t} at={at(ctx, 0.6)} x={cx + 300} y={230}>
          <Label x={0} y={0} text={p.text ?? "донесения противоречат друг другу"} size={32} bg={C.yellow} />
        </Appear>
      </Drift>
    );
  }
  const people = makeDots(54, cx + 80, 640, 640, 200, 41);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={640} amount={0.04}>
      <Ground y={900} color="#7d8f62" hill={mode === "battery" ? 220 : 40} />
      <Fit a={a} w={1600} c={cx + 60} cy={640}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Smoke key={i} x={cx - 700 + i * 230} y={680 - (i % 3) * 60} t={t} s={0.9 + (i % 2) * 0.5} seed={i * 2} color={i % 2 ? "#e9ecf4" : "#d7dcea"} />
      ))}
      {mode === "field" && <DotNet dots={people} t={t} k={ramp(t, at(ctx, 0.5), 1.5)} links={1} drift={6} />}
      {mode === "battery" &&
        Array.from({ length: 7 }).map((_, i) => (
          <Figure key={i} who="soldier" x={cx - 380 + i * 115} y={760 - Math.sin((i / 6) * Math.PI) * 120} s={0.46} pose={i % 2 ? "reach" : "stand"} t={t + i} flip={i > 3} />
        ))}
      <PierreWhiteHat x={cx + (mode === "battery" ? 60 : -100)} y={mode === "battery" ? 660 : 900} s={mode === "battery" ? 0.6 : 0.78} t={t} pose="look" />
      <Appear t={t} at={at(ctx, 0.4)} x={cx + (mode === "battery" ? 60 : -100)} y={mode === "battery" ? 330 : 560}>
        <Label x={0} y={0} text={p.text ?? "штатский в белой шляпе"} size={30} bg={C.yellow} />
      </Appear>
      {(p.labels ?? []).map((l, i) => (
        <Appear key={l} t={t} at={at(ctx, 1 + i * 0.5)} x={cx + 520} y={240 + i * 90}>
          <Label x={0} y={0} text={l} size={30} />
        </Appear>
      ))}
      </Fit>
    </Drift>
  );
};

// ── Совет в Филях глазами девочки на печи ──
export const Council: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const k = ramp(t, at(ctx, 0.5));
  return (
    <Drift t={t} dur={dur} cx={cx} cy={600}>
      {/* изба изнутри */}
      <rect x={cx - 760} y={220} width={1520} height={700} rx={30} fill="#9a7650" />
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={i} x1={cx - 760} x2={cx + 760} y1={260 + i * 66} y2={260 + i * 66} stroke="#7d5c3c" strokeWidth={6} />
      ))}
      {/* печь и девочка */}
      <rect x={cx - 740} y={420} width={300} height={500} rx={16} fill="#efe4cf" />
      <Figure who="child" x={cx - 600} y={430} s={0.62} pose="sit" t={t} rim={C.yellow} />
      <Appear t={t} at={at(ctx, 0.2)} x={cx - 590} y={260}>
        <Label x={0} y={0} text={(p.labels ?? ["Малаша"])[0]} size={30} bg={C.yellow} />
      </Appear>
      {/* стол с картой и генералы */}
      <rect x={cx - 320} y={700} width={760} height={30} rx={10} fill="#6a4a2a" />
      <rect x={cx - 280} y={660} width={680} height={50} rx={8} fill={C.paper} />
      {[0, 1, 2, 3].map((i) => (
        <Figure key={i} who={i === 0 ? "kutuzov" : "officer"} x={cx - 220 + i * 190} y={910} s={0.62} pose={i === 0 ? "sit" : i === 2 ? "point" : "stand"} t={t + i} flip={i > 1} />
      ))}
      <g opacity={k}>
        <Label x={cx - 200} y={420} text={(p.labels ?? [, "«дедушка»"])[1] ?? "«дедушка»"} size={30} />
        <Label x={cx + 260} y={420} text={(p.labels ?? [, , "«длиннополый»"])[2] ?? "«длиннополый»"} size={30} />
      </g>
      <Appear t={t} at={at(ctx, 1.4)} x={cx + 60} y={170}>
        <Label x={0} y={0} text={p.text ?? "оставить Москву без сражения?"} size={34} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Кутузов и Наполеон: приказывать или угадывать ход событий ──
// mode: compare | patience | wave (волна перед кораблём) | child (ребёнок в карете)
export const Generals: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const mode = p.mode ?? "compare";
  const cx = a.cx;
  if (mode === "wave") {
    const k = ramp(t, at(ctx, 0.6), 1.2);
    const x = Math.max(a.x0 + 420, cx - 260) + ((t * 30) % 200);
    return (
      <Drift t={t} dur={dur} cx={cx} cy={600}>
        <rect x={0} y={700} width={1920} height={400} fill="#4f7fb8" />
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={`M ${-100 + i * 280 + ((t * 30) % 280)} ${760 + (i % 2) * 40} q 40 -20 80 0`} stroke="#cfe3ff" strokeWidth={6} fill="none" />
        ))}
        <g transform={`translate(${x} 700)`}>
          <path d="M -380 -20 L 260 -20 L 200 90 L -330 90 Z" fill="#6a4a2a" />
          <rect x={-60} y={-360} width={16} height={340} fill="#5a3f22" />
          <path d="M -44 -350 Q 130 -250 -44 -60 Z" fill={C.paper} />
          {/* волна перед носом */}
          <path d={`M 260 -10 Q 330 ${-60 + Math.sin(t * 3) * 8} 400 0 Q 330 30 260 40 Z`} fill="#eaf4ff" />
        </g>
        <Appear t={t} at={at(ctx, 0.6)} x={x + 360} y={520}>
          <Label x={0} y={0} text={p.text ?? "волна «ведёт» корабль?"} size={32} bg={C.yellow} />
        </Appear>
        <g opacity={k}>
          <Label x={cx - 300} y={300} text={(p.labels ?? ["корабль — движение масс"])[0]} size={30} />
        </g>
      </Drift>
    );
  }
  if (mode === "child") {
    return (
      <Drift t={t} dur={dur} cx={cx} cy={600}>
        <Ground y={900} color="#8a9a72" />
        <g transform={`translate(${cx - 100} 0)`}>
          <Horse x={300} y={900} s={0.7} t={t} fill="#4a3f5a" />
          <rect x={-260} y={640} width={360} height={190} rx={30} fill="#6a3f4a" />
          <circle cx={-180} cy={860} r={60} fill="none" stroke={OL} strokeWidth={14} />
          <circle cx={40} cy={860} r={60} fill="none" stroke={OL} strokeWidth={14} />
          <Figure who="child" x={-80} y={720} s={0.5} pose="reach" t={t} rim={C.yellow} />
          <path d={`M -40 590 Q 120 ${560 + Math.sin(t * 2) * 10} 260 650`} stroke={C.gold} strokeWidth={6} fill="none" />
        </g>
        <Appear t={t} at={at(ctx, 0.6)} x={cx} y={260}>
          <Label x={0} y={0} text={p.text ?? "держится за тесёмки — и думает, что правит"} size={32} bg={C.yellow} />
        </Appear>
      </Drift>
    );
  }
  if (mode === "people") {
    const glow = 0.5 + 0.5 * Math.sin(t * 4);
    return (
      <Drift t={t} dur={dur} cx={cx} cy={600}>
        <rect x={0} y={760} width={1920} height={320} fill={C.snow} opacity={0.75} />
        {Array.from({ length: 30 }).map((_, i) => (
          <circle key={i} cx={(rnd(i) * 1920 + Math.sin(t + i) * 15) % 1920} cy={(rnd(i + 4) * 1080 + t * 35) % 1080} r={3 + (i % 3)} fill="#fff" />
        ))}
        {/* костёр */}
        <g transform={`translate(${cx + 120} 860)`}>
          <circle r={120} fill={C.amber} opacity={0.15 + 0.05 * glow} />
          <path d="M -40 0 Q -20 -90 0 -120 Q 20 -90 40 0 Z" fill={C.amber} />
          <path d="M -18 0 Q -8 -50 0 -70 Q 8 -50 18 0 Z" fill={C.yellow} />
        </g>
        {[0, 1, 2].map((i) => (
          <Figure key={i} who="frenchman" x={cx - 10 + i * 130} y={900} s={0.55} pose="sit" t={t + i} fill="#5a6080" flip={i === 2} />
        ))}
        {[0, 1].map((i) => (
          <Figure key={i} who="soldier" x={cx + 470 + i * 110} y={900} s={0.6} pose={i ? "reach" : "stand"} t={t + i} flip />
        ))}
        <Figure who="kutuzov" x={cx - 330} y={900} s={0.85} pose="reach" t={t} rim={C.yellow} />
        <Appear t={t} at={at(ctx, 0.4)} x={cx} y={300}>
          <Label x={0} y={0} text={p.text ?? "«Тоже и они люди»"} size={36} bg={C.yellow} />
        </Appear>
        <Appear t={t} at={at(ctx, 1.2)} x={cx} y={420}>
          <Label x={0} y={0} text="«нет величия там, где нет простоты, добра и правды»" size={26} serif />
        </Appear>
      </Drift>
    );
  }
  const left = ramp(t, at(ctx, 0));
  const right = ramp(t, at(ctx, Math.min(1, ctx.beats.length - 1)));
  const dots = makeDots(30, cx + 340, 560, 260, 220, 51);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.03}>
      <Fit a={a} w={1560} c={cx - 10}>
      <g opacity={left}>
        <rect x={cx - 760} y={240} width={680} height={680} rx={34} fill={C.paper} opacity={0.9} />
        <Figure who="napoleon" x={cx - 420} y={880} s={0.9} pose="point" t={t} />
        {[0, 1, 2, 3].map((i) => (
          <SmallArrow key={i} x={cx - 330} y={460 + i * 70} ang={-20 + i * 14} len={220} color={C.red} k={ramp(t, at(ctx, 0.3 + i * 0.15))} />
        ))}
        <Label x={cx - 420} y={300} text={(p.labels ?? ["Наполеон: приказывает"])[0]} size={30} />
      </g>
      <g opacity={right}>
        <rect x={cx + 60} y={240} width={680} height={680} rx={34} fill="#2a3a6e" opacity={0.92} />
        <DotNet dots={dots} t={t} k={right} links={2} drift={12} />
        <Figure who="kutuzov" x={cx + 300} y={880} s={0.85} pose="sit" t={t} rim={C.yellow} />
        <Label x={cx + 400} y={300} text={(p.labels ?? [, "Кутузов: слушает ход дела"])[1] ?? ""} size={30} bg={C.yellow} />
      </g>
      {mode === "patience" && (
        <Appear t={t} at={at(ctx, 1.5)} x={cx} y={170}>
          <Txt x={0} y={0} size={52} color={C.paper}>
            {p.text ?? "«Терпение и время»"}
          </Txt>
        </Appear>
      )}
      </Fit>
    </Drift>
  );
};

// Карта похода 1805/1812 (художественная, без претензии на военную точность)
export const March: React.FC<VisualProps<P & { route?: [number, number][]; back?: boolean }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const route = p.route ?? [
    [-520, 120], [-300, 60], [-80, 30], [140, -40], [360, -110],
  ];
  const k = ramp(t, at(ctx, 0.2), 2.4);
  const back = p.back ? ramp(t, at(ctx, 1.2), 2.2) : 0;
  const pts = route.map(([x, y]) => [cx + x, 560 + y]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const len = pts.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]) : 0), 0);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.03}>
      <rect x={cx - 680} y={230} width={1360} height={660} rx={30} fill={C.paper} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${cx - 660} ${330 + i * 150} C ${cx - 200} ${280 + i * 150} ${cx + 200} ${380 + i * 150} ${cx + 660} ${320 + i * 150}`} stroke={C.skyDeep} strokeOpacity={0.35} strokeWidth={6} fill="none" />
      ))}
      <path d={d} stroke={C.red} strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - k)} opacity={0.85} />
      {back > 0 && <path d={d} stroke={C.steel} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" fill="none" strokeDasharray={`${len}`} strokeDashoffset={-len * (1 - back)} transform="translate(0 50)" />}
      {(p.labels ?? []).map((l, i) => {
        const q = pts[Math.min(pts.length - 1, Math.round((i * (pts.length - 1)) / Math.max(1, (p.labels?.length ?? 1) - 1)))];
        return (
          <Appear key={l} t={t} at={at(ctx, 0.3 + i * 0.4)} x={q[0]} y={q[1] - 70}>
            <circle cx={0} cy={70} r={16} fill={C.ink} stroke="#fff" strokeWidth={5} />
            <Label x={0} y={0} text={l} size={28} />
          </Appear>
        );
      })}
      <text x={cx - 650} y={870} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.inkSoft}>
        художественная схема BanaMind, не военная карта
      </text>
    </Drift>
  );
};

// Подкреплённый вывод: «план» пишет одна рука, «поле» — тысячи людей (числа без таймера)
export const PlanVsField: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const k = ramp(t, at(ctx, 1), 1.4);
  const dots = makeDots(90, cx + 300, 560, 330, 280, 61);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={560} amount={0.03}>
      <Paper x={cx - 380} y={560} w={520} h={560}>
        <BigArrow x1={-180} y1={160} x2={170} y2={-160} w={60} grow={ramp(t, at(ctx, 0), 1)} />
        <text x={0} y={240} fontFamily={SERIF} fontWeight={700} fontSize={34} fill={C.ink} textAnchor="middle">
          {(p.labels ?? ["план"])[0]}
        </text>
      </Paper>
      <g opacity={k}>
        <DotNet dots={dots} t={t} k={k} links={2} drift={12} />
        <Label x={cx + 300} y={920} text={(p.labels ?? [, "поле"])[1] ?? "поле"} size={34} bg={C.yellow} />
      </g>
      <Appear t={t} at={at(ctx, 1.6)} x={cx} y={190}>
        <Label x={0} y={0} text={p.text ?? "план ≠ поле"} size={40} bg={C.paper} />
      </Appear>
      {interpolate(t, [0, 1], [0, 1], { extrapolateRight: "clamp", easing: ease }) > 5 && <Izba x={0} y={0} />}
      {wob(t) > 100 && <g />}
    </Drift>
  );
};
