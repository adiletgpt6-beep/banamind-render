// Главная метафора фильма — «стеклянная модель решения» на столе банана и семь
// цветных фильтров согласия. Это авторская метафора BanaMind, не схема из книги.
//   modelIntro  — запрос проходит сквозь семь стёкол и сам собой становится «ДА»;
//   modelSeven  — семь фильтров раскрываются веером (обзор фильма);
//   filterTitle — заставка фильтра: стекло, имя, вопрос, точки складываются в знак;
//   filterPass  — один фильтр: запрос → «ощущение» → проверка фактов → свой выбор;
//   modelFinal  — все семь стёкол полупрозрачны, два вопроса выбора.
import React from "react";
import { interpolate } from "remotion";
import { C, DISPLAY, FC, FILTERS, FONT, type FilterId } from "../theme";
import { Card, Desk, GlassPlate, Label, OL, YesButton } from "./draw";
import { dotsOf, SH, Swarm, word, Morph } from "./dots";
import { Appear, area, at, clamp01, Drift, ease, ramp, Txt, type VisualProps } from "./kit";

type P = { host?: string; f?: FilterId; feel?: string; fact?: string; choice?: string; request?: string; mode?: string; q?: string };

// ── Запрос проходит сквозь семь стёкол → «ДА» ──
export const ModelIntro: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const x0 = cx - 520;
  const plates = FILTERS.map((f, i) => ({ f, x: x0 + 140 + i * 130 }));
  const go = at(ctx, 0.3);
  const cardX = interpolate(t, [go, go + 4.2], [a.x0 - 80, cx + 560], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const done = ramp(t, go + 4.2, 0.5);
  const stop = p.mode === "stop" ? ramp(t, at(ctx, 1.2), 0.6) : 0;
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Desk x={cx} y={780} w={1300} />
      {/* стеклянный корпус модели */}
      <rect x={x0} y={330} width={1040} height={430} rx={40} fill="#ffffff" fillOpacity={0.1} stroke="#fff" strokeWidth={5} />
      <rect x={x0 + 14} y={344} width={1012} height={402} rx={30} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />
      <path d={`M ${x0 + 40} 380 L ${x0 + 110} 350 L ${x0 + 150} 350 L ${x0 + 40} 420 Z`} fill="#fff" opacity={0.35} />
      {plates.map(({ f, x }, i) => {
        const lit = clamp01(1 - Math.abs(cardX - x) / 120);
        return (
          <Appear key={f.id} t={t} at={at(ctx, 0) + i * 0.12} dy={40}>
            <GlassPlate id={f.id} x={x} y={545} w={104} h={300} glow={lit} t={t} label={false} />
          </Appear>
        );
      })}
      {/* карточка запроса */}
      <g transform={`translate(${cardX} 545)`} opacity={1 - done}>
        <Card x={0} y={0} w={190} h={110} lines={[p.request ?? "Просьба"]} size={30} fill={C.paper} />
      </g>
      {/* выход: «ДА» нажимается само */}
      <g opacity={done}>
        <YesButton x={cx + 640} y={600} s={1.05} press={ramp(t, go + 4.4, 0.2) * (1 - ramp(t, go + 4.8, 0.3)) * 0.8 + 0.2} />
        <Txt x={cx + 640} y={470} size={34} color="#fff">
          автоматически
        </Txt>
      </g>
      {stop > 0 && (
        <g opacity={stop} transform={`translate(${cx + 640} 600) scale(${0.7 + 0.3 * stop})`}>
          <circle r={130} fill="none" stroke={C.yellow} strokeWidth={14} />
          <Txt x={0} y={-150} size={44} color={C.yellow}>
            ПАУЗА
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// длинные имена фильтров — в две строки
const SPLIT: Partial<Record<FilterId, string[]>> = { social: ["Социальное", "доказательство"], commit: ["Последова-", "тельность"], recip: ["Взаим-", "ность"] };

// ── Семь фильтров веером: имя появляется по ходу речи ──
export const ModelSeven: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const n = FILTERS.length;
  const span = Math.min(1500, a.x1 - a.x0 - 80);
  const step = span / n;
  const w = Math.min(190, step - 22);
  const from = at(ctx, 0.15);
  const to = at(ctx, Math.max(0.9, ctx.beats.length - 0.6));
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {FILTERS.map((f, i) => {
        const appear = from + ((to - from) * i) / n;
        const k = ramp(t, appear, 0.55);
        const x = cx - span / 2 + step * (i + 0.5);
        const y = 470 + Math.sin(i * 0.9 + t * 0.8) * 8;
        if (k <= 0) return null;
        return (
          <g key={f.id} opacity={k} transform={`translate(0 ${(1 - k) * 60})`}>
            <GlassPlate id={f.id} x={x} y={y} w={w} h={w * 1.45} t={t} glow={clamp01(1 - (t - appear) / 1.6)} />
            {(SPLIT[f.id] ?? [f.name]).map((ln, j) => (
              <text key={j} x={x} y={y + w * 0.73 + 50 + j * 34} fontFamily={FONT} fontWeight={900} fontSize={Math.min(30, step / (ln.length * 0.6))} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
                {ln}
              </text>
            ))}
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 0)} x={cx} y={190}>
        <Txt x={0} y={0} size={54} color="#fff">
          {p.q ?? "Семь фильтров согласия"}
        </Txt>
      </Appear>
    </Drift>
  );
};

// толстая стрелка вправо (dir = 1) или влево (dir = −1) на высоте y
const arrowShape = (dir: number, y0: number) => (x0: number, y: number) => {
  const x = x0 * dir;
  const dy = Math.abs(y - y0);
  if (x >= -170 && x <= 50 && dy <= 32) return true;
  return x > 50 && x <= 170 && dy <= 75 * (1 - (x - 50) / 120);
};

// знак фильтра из точек (для заставок фильтров)
const ICON_SHAPE: Record<FilterId, ReturnType<typeof word>> = {
  recip: SH.union(arrowShape(1, -75), arrowShape(-1, 75)),
  liking: SH.heart(150),
  social: SH.union(SH.move(SH.person(150), -150, 10), SH.move(SH.person(170), 0, -20), SH.move(SH.person(150), 150, 10)),
  authority: SH.minus(SH.shield(170), SH.move(SH.circle(40), 0, 0)),
  scarcity: SH.union(SH.strokes([[-150, -150, 150, -150, 30, -10, 30, 150, -30, 150, -30, -10, -150, -150]], 30), SH.move(SH.circle(26), 0, 110)),
  commit: SH.union(SH.strokes([[-170, 120, -170, 0, -120, -80, -40, -60, -20, 20, 40, 80, 120, 60, 160, -20, 140, -110, 60, -150]], 50), SH.move(SH.circle(40), -170, 130)),
  unity: SH.union(SH.ring(95, 140), SH.move(SH.ring(95, 140), 130, 0)),
};

// ── Заставка фильтра ──
export const FilterTitle: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const f = FC[p.f ?? "recip"];
  const a = area(p.host);
  const cx = a.cx;
  const k = ramp(t, at(ctx, 0) - 0.3, 0.9);
  const dk = clamp01((t - at(ctx, 0.2)) / 2.2);
  const shapeX = cx + (p.f === "unity" ? -65 : 0);
  const pts = dotsOf(`icon-${f.id}`, ICON_SHAPE[f.id], shapeX, 530, [f.color, f.deep, f.light, "#ffffff"], 14, 420);
  const titleSize = Math.min(66, 1300 / (f.name.length * 0.62));
  const tw = f.name.length * titleSize * 0.62;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.035}>
      <g opacity={k} transform={`translate(${cx} 530) scale(${0.85 + 0.15 * k}) translate(${-cx} -530)`}>
        <GlassPlate id={f.id} x={cx} y={530} w={500} h={500} t={t} label={false} icon={false} />
      </g>
      <Swarm pts={pts} k={dk} t={t} r={6.5} from="scatter" spread={700} seed={f.n} />
      <Appear t={t} at={at(ctx, 0.1)} x={cx + 30} y={200}>
        <circle cx={-tw / 2 - 60} cy={-titleSize * 0.33} r={34} fill="#fff" stroke={f.deep} strokeWidth={5} />
        <text x={-tw / 2 - 60} y={-titleSize * 0.33 + 14} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={f.deep} textAnchor="middle">
          {f.n}
        </text>
        <text x={0} y={0} fontFamily={DISPLAY} fontWeight={800} fontSize={titleSize} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={8} paintOrder="stroke">
          {f.name}
        </text>
      </Appear>
      <Appear t={t} at={at(ctx, 0.6)} x={cx} y={845}>
        <Label x={0} y={0} text={p.q ?? f.short} size={40} bg={f.light} border={f.deep} />
      </Appear>
    </Drift>
  );
};

// ── Один фильтр: запрос → ощущение → проверка → выбор ──
export const FilterPass: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const f = FC[p.f ?? "recip"];
  const a = area(p.host);
  const cx = a.cx;
  const L = cx - 470;
  const R = cx + 470;
  const go = at(ctx, 0.2);
  const cx1 = interpolate(t, [go, go + 1.6], [L, cx], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const feelK = ramp(t, go + 1.5, 0.6);
  const factK = ramp(t, at(ctx, 1.2), 0.6);
  const choiceK = ramp(t, at(ctx, 2.2), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <GlassPlate id={f.id} x={cx} y={470} w={260} h={420} t={t} glow={1 - feelK * 0.6} />
      {/* запрос входит в стекло */}
      <g opacity={1 - feelK}>
        <Card x={cx1} y={470} w={300} h={130} lines={[p.request ?? "Просьба"]} size={34} />
      </g>
      {/* ощущение на выходе */}
      <g opacity={feelK} transform={`translate(${R - 40 + (1 - feelK) * -120} 400)`}>
        <Card x={0} y={0} w={440} h={150} lines={[p.feel ?? "надо согласиться"]} size={38} fill={f.light} edge={f.color} title="ощущение" />
      </g>
      {/* факты и свой выбор */}
      <g opacity={factK} transform={`translate(${R - 40} ${600 + (1 - factK) * 30})`}>
        <Card x={0} y={0} w={440} h={150} lines={[p.fact ?? "а что я знаю?"]} size={38} fill="#ffffff" edge={C.inkSoft} title="проверка" />
      </g>
      <g opacity={choiceK} transform={`translate(${L + 40} ${560 + (1 - choiceK) * 30})`}>
        <Card x={0} y={0} w={420} h={150} lines={[p.choice ?? "решаю сам(а)"]} size={38} fill={C.yellow} title="выбор" />
      </g>
    </Drift>
  );
};

// ── Финал модели: семь стёкол и два вопроса ──
export const ModelFinal: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const qk1 = ramp(t, at(ctx, 0.5), 0.6);
  const qk2 = ramp(t, at(ctx, 1.2), 0.6);
  const yes = word("ДА", 170, 26);
  const q = word("?", 230, 26);
  const dk = clamp01((t - at(ctx, 0)) / 2);
  const morphK = clamp01((t - at(ctx, 1.8)) / 1.6);
  const ptsA = dotsOf("final-da", yes, cx, 330, [C.green, "#7be0a4", "#ffffff"], 13, 300);
  const ptsB = dotsOf("final-q", q, cx, 330, FILTERS.map((x) => x.color), 13, 300);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {FILTERS.map((f, i) => {
        const ang = ((i - 3) / 3) * 0.95;
        const x = cx + Math.sin(ang) * 640;
        const y = 560 - Math.cos(ang) * 140 + 140;
        return <GlassPlate key={f.id} id={f.id} x={x} y={y} w={130} h={190} t={t} opacity={0.55 + 0.2 * Math.sin(t * 1.2 + i)} label={false} />;
      })}
      {morphK <= 0 ? <Swarm pts={ptsA} k={dk} t={t} r={5.5} from="center" /> : <Morph a={ptsA} b={ptsB} k={morphK} t={t} r={5.5} />}
      <g opacity={qk1} transform={`translate(${cx - 270} ${640 + (1 - qk1) * 30})`}>
        <Card x={0} y={0} w={440} h={130} lines={["Что я знаю?"]} size={46} fill="#ffffff" edge={C.inkSoft} />
      </g>
      <g opacity={qk2} transform={`translate(${cx + 270} ${640 + (1 - qk2) * 30})`}>
        <Card x={0} y={0} w={440} h={130} lines={["Что я хочу?"]} size={46} fill={C.yellow} edge={C.gold} />
      </g>
    </Drift>
  );
};
