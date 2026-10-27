// Сцены Бюро невозможных доказательств BM-033: холодный старт, Бюро со штампами,
// справка о редакции, карта путей, страница дневника, «лестница объяснений»,
// замок, письма с датами вперёд, перехват почты, хор документов, корабль,
// пятьдесят ящиков, сеть тайн, запечатанный дневник, клиника, опоздавшая
// телеграмма, газетная вырезка, окно, колбы фактов, обмен архивами, машинка,
// прозрачные листы показаний, стол техники, огонь и копии, стена, записка Мины,
// граф без голоса, весы «разумно/суеверно». Тексты приходят из сценария (p).
// Всё — образы фильма BanaMind, не иллюстрации издания и не кадры экранизаций.
import React from "react";
import { C, FONT, HEAVY, SERIF } from "../theme";
import { Appear, area, Arrow, at, Check, Cross, Drift, Panel, ramp, Txt, wob, clamp01, ease, type VisualProps } from "./kit";
import { Particles, rnd } from "./particles";
import { Envelope, Label, OL, Thread } from "./props";
import { Clipping, Diary, Flask, Key, Lamp, Lock, Phonograph, Sheet, Stack, Stamp, Telegram, Typewriter } from "./gothic";

type P = { mode?: string; host?: string; [k: string]: unknown };
const S = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const A = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const N = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const COL: Record<string, string> = { amber: C.amber, plum: C.plum, teal: C.teal, wine: C.wine, frost: C.nightSoft };

// ── Холодный старт: ночь, раскрытый дневник под лампой, три реакции на запись ──
export const ColdOpen: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const cards = [
    { x: 300, y: 250, text: "врач: «кошмар»", at: at(ctx, 0.55), rot: -5 },
    { x: 330, y: 470, text: "близкие: «успокойтесь»", at: b1 + 0.2, rot: 4 },
    { x: 360, y: 690, text: "и снова…", at: at(ctx, 1.7), rot: -3 },
  ];
  return (
    <Drift t={t} dur={dur} amount={0.035} cx={760}>
      <Lamp x={1060} y={420} s={1.1} k={ramp(t, 0.1, 0.8)} t={t} />
      <Diary x={820} y={560} s={0.82} k={ramp(t, 0.3, 0.7)} t={t} date="запись" title="Мой дневник" rows={["я видел…", "не верю себе", "это было?"]} rowAt={[0.9, 1.6, 2.3]} rot={-2} />
      {cards.map((c, i) => (
        <Appear key={i} t={t} at={c.at} x={c.x} y={c.y}>
          <Label x={0} y={0} text={c.text} size={34} bg={i === 2 ? C.wineSoft : C.frostSoft} rot={c.rot} />
        </Appear>
      ))}
      <Appear t={t} at={b2 + 0.5} x={1180} y={230}>
        <g transform={`scale(${1 + 0.03 * Math.sin(t * 2)})`}>
          <circle r={86} fill={C.yellow} stroke={OL} strokeWidth={6} />
          <text y={34} fontFamily={HEAVY} fontWeight={900} fontSize={100} fill={C.ink} textAnchor="middle">
            ?
          </text>
        </g>
      </Appear>
    </Drift>
  );
};

// ── Справка о редакции: оригинал 1897 (27 глав, внешняя справка) и наш файл 2013 (23 главы) ──
export const Edition: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const docs = ["дневник", "письмо", "телеграмма", "вырезка"];
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      {docs.map((d, i) => (
        <Appear key={d} t={t} at={0.4 + i * 0.45} x={Ar.cx - 450 + i * 300} y={200}>
          <rect x={-120} y={-58} width={240} height={116} rx={14} fill={i % 2 ? C.cream : C.paper} stroke={OL} strokeWidth={4} transform={`rotate(${(i % 2 ? 3 : -3)})`} />
          <Txt x={0} y={12} size={32} weight={900}>
            {d}
          </Txt>
        </Appear>
      ))}
      {[
        { x: Ar.cx - 260, n: 27, title: "английское издание 1897", sub: "внешняя справка", col: C.frost, k: ramp(t, b1, 0.6) },
        { x: Ar.cx + 260, n: 23, title: "наш файл: редакция 2013", sub: "единственная основа фильма", col: C.amber, k: ramp(t, b1 + 0.8, 0.6) },
      ].map((c, i) => (
        <g key={i} opacity={c.k} transform={`translate(${c.x} ${520 + (1 - c.k) * 30})`}>
          <Panel x={-230} y={-120} w={460} h={330} fill={C.white} />
          {Array.from({ length: c.n }).map((_, j) => (
            <rect key={j} x={-190 + (j % 9) * 42} y={-90 + Math.floor(j / 9) * 46} width={32} height={38} rx={5} fill={c.col} stroke={OL} strokeWidth={2} opacity={clamp01(c.k * 3 - j / c.n)} />
          ))}
          <text y={110} fontFamily={HEAVY} fontWeight={900} fontSize={48} fill={C.ink} textAnchor="middle">
            {`${c.n} ${c.n === 23 ? "главы" : "глав"}`}
          </text>
          <Txt x={0} y={155} size={26} color={C.inkSoft} weight={800}>
            {c.title}
          </Txt>
          <Txt x={0} y={188} size={22} color={i ? C.tealDeep : C.inkSoft} weight={800}>
            {c.sub}
          </Txt>
        </g>
      ))}
      <Appear t={t} at={b2 + 0.4} x={Ar.cx} y={790}>
        <Label x={0} y={0} text="ничего не досочиняем" size={36} bg={C.tealSoft} />
      </Appear>
    </Drift>
  );
};

// ── Бюро: стол с документами; штампы «наблюдение / догадка / свидетельство» ──
export const Bureau: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cx = Ar.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const items = [0, 1, 2, 3, 4];
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <Appear t={t} at={0.1} x={cx} y={600}>
        <path d="M -720 0 L 720 0 L 680 60 L -680 60 Z" fill="#7a5230" stroke={OL} strokeWidth={4} />
        <rect x={-640} y={60} width={34} height={200} fill="#5e3e22" stroke={OL} strokeWidth={4} />
        <rect x={606} y={60} width={34} height={200} fill="#5e3e22" stroke={OL} strokeWidth={4} />
      </Appear>
      <Lamp x={cx + 560} y={340} s={0.8} k={ramp(t, 0.3, 0.6)} t={t} />
      {items.map((i) => {
        const a = 0.5 + i * 0.4;
        const x = cx - 520 + i * 250;
        return (
          <Appear key={i} t={t} at={a} x={x} y={i === 3 ? 470 : 500}>
            {i === 0 && <Diary x={0} y={0} s={0.3} k={1} t={t} />}
            {i === 1 && <Envelope x={0} y={-10} s={0.55} k={1} rot={-6} />}
            {i === 2 && <Clipping x={0} y={-10} s={0.45} k={1} head="Газета" rot={4} />}
            {i === 3 && <Telegram x={0} y={0} s={0.55} k={1} text="ПРИЕЗЖАЙ" rot={-3} />}
            {i === 4 && <Phonograph x={0} y={60} s={0.38} k={1} t={t} play={1} />}
          </Appear>
        );
      })}
      <Appear t={t} at={Math.min(2.6, b1)} x={cx} y={170}>
        <Label x={0} y={0} text="Бюро невозможных доказательств" size={46} bg={C.yellow} />
        <Txt x={0} y={74} size={28} color={C.frostSoft} weight={800}>
          образ фильма, не сцена романа
        </Txt>
      </Appear>
      {[
        ["наблюдение", C.amber],
        ["догадка", C.plum],
        ["свидетельство", C.teal],
      ].map(([w, col], i) => (
        <Stamp key={w} x={cx - 420 + i * 420} y={800} text={w} k={ramp(t, b2 + 0.7 + i * 0.7, 0.5)} color={col} rot={[-7, 4, -3][i]} size={40} />
      ))}
    </Drift>
  );
};

// ── Карта: стилизованная Европа, маршруты (поездка Харкера, погоня, три отряда) ──
const CITIES: Record<string, [number, number]> = {
  Лондон: [380, 330], Уайтби: [430, 210], Мюнхен: [880, 520], Вена: [1050, 500], Будапешт: [1200, 540], Клуж: [1360, 520],
  Бистрица: [1450, 470], Борго: [1520, 430], Варна: [1620, 700], Галац: [1560, 590], Замок: [1555, 390],
};
export const MapScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const mode = p.mode ?? "trip";
  const routes: { pts: string[]; at: number; col: string; dash?: boolean }[] =
    mode === "trip"
      ? [{ pts: ["Мюнхен", "Вена", "Будапешт", "Клуж", "Бистрица", "Борго"], at: at(ctx, 0.3), col: C.amber }]
      : mode === "chase"
        ? [
            { pts: ["Лондон", "Варна"], at: at(ctx, 0.5), col: C.wine, dash: true },
            { pts: ["Лондон", "Варна"], at: at(ctx, 1), col: C.teal },
            { pts: ["Варна", "Галац"], at: at(ctx, 1.6), col: C.teal },
          ]
        : [
            { pts: ["Галац", "Бистрица", "Борго"], at: at(ctx, 0.2), col: C.teal },
            { pts: ["Галац", "Клуж", "Борго"], at: at(ctx, 0.5), col: C.amber },
            { pts: ["Галац", "Замок"], at: at(ctx, 0.8), col: C.plum },
          ];
  const shown = new Set(routes.flatMap((r) => r.pts));
  const unknown = mode === "trip" ? ramp(t, at(ctx, 1.3), 0.6) : 0;
  const Ar = area(p.host);
  const fit = Math.min(1, (Ar.x1 - Ar.x0) / 1600);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.04}>
      <g transform={`translate(${Ar.cx - 960 * fit} ${480 * (1 - fit)}) scale(${fit})`}>
      <Appear t={t} at={0.05} x={0} y={0} dy={0}>
        <rect x={180} y={120} width={1560} height={720} rx={40} fill="#e8dcc0" stroke={OL} strokeWidth={5} />
        {/* условные материки и острова — без точной географии */}
        <path d="M 330 160 Q 470 150 470 260 Q 450 380 330 400 Q 280 300 330 160 Z" fill="#b9cf9e" stroke={OL} strokeWidth={3} />
        <path d="M 600 820 Q 700 420 900 380 Q 1150 330 1400 360 Q 1640 330 1700 480 Q 1720 700 1660 820 Z" fill="#c7d8a8" stroke={OL} strokeWidth={3} />
        <path d="M 1580 650 Q 1690 640 1720 760 L 1640 800 Q 1600 720 1580 650 Z" fill="#9fc3f0" opacity={0.8} />
        <path d="M 1400 430 Q 1500 360 1600 420 Q 1560 470 1470 470 Z" fill="#8a8fa6" opacity={0.75} />
        <text x={1500} y={455} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.ink} opacity={0.7}>
          Карпаты
        </text>
        <text x={240} y={800} fontFamily={SERIF} fontStyle="italic" fontWeight={700} fontSize={26} fill={C.inkSoft}>
          схема, не точная карта
        </text>
      </Appear>
      {routes.map((r, i) => {
        const k = ramp(t, r.at, 1.6);
        if (k <= 0) return null;
        const pts = r.pts.map((n) => CITIES[n]);
        const d = pts.map(([x, y], j) => `${j ? "L" : "M"} ${x} ${y}`).join(" ");
        let len = 0;
        for (let j = 1; j < pts.length; j++) len += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
        return <path key={i} d={d} fill="none" stroke={r.col} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={r.dash ? `${len * k} ${len}` : len} strokeDashoffset={r.dash ? 0 : len * (1 - k)} opacity={r.dash ? 0.55 : 1} />;
      })}
      {Object.entries(CITIES).map(([n, [x, y]]) =>
        shown.has(n) || (mode === "trip" && n === "Замок") ? (
          <Appear key={n} t={t} at={0.4} x={x} y={y} dy={10}>
            <circle r={13} fill={n === "Замок" ? C.wine : C.ink} stroke="#fff" strokeWidth={4} />
            <text y={-24} fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.ink} textAnchor="middle" stroke="#f3ead6" strokeWidth={6} paintOrder="stroke">
              {n === "Замок" ? (mode === "trip" ? "?" : "замок") : n}
            </text>
          </Appear>
        ) : null,
      )}
      {mode === "trip" && unknown > 0 && (
        <g opacity={unknown}>
          <circle cx={CITIES.Замок[0]} cy={CITIES.Замок[1]} r={60 + 6 * Math.sin(t * 3)} fill="none" stroke={C.wine} strokeWidth={6} strokeDasharray="14 12" />
          <Label x={CITIES.Замок[0] - 160} y={CITIES.Замок[1] - 120} text="на картах нет" size={32} bg={C.wineSoft} />
        </g>
      )}
      {mode === "chase" && (
        <>
          <Appear t={t} at={at(ctx, 0.2)} x={CITIES.Лондон[0] + 40} y={CITIES.Лондон[1] + 120}>
            <Label x={0} y={0} text="граф уходит морем" size={30} bg={C.wineSoft} />
          </Appear>
          <Appear t={t} at={at(ctx, 1.2)} x={CITIES.Варна[0] - 330} y={CITIES.Варна[1] + 80}>
            <Label x={0} y={0} text="«никаких известий»" size={30} bg={C.frostSoft} />
          </Appear>
          <Appear t={t} at={at(ctx, 1.75)} x={CITIES.Галац[0] - 300} y={CITIES.Галац[1] - 40}>
            <Label x={0} y={0} text="поезд нашла Мина" size={30} bg={C.tealSoft} />
          </Appear>
        </>
      )}
      {mode === "converge" && (
        <Appear t={t} at={at(ctx, 1.3)} x={CITIES.Борго[0] - 330} y={CITIES.Борго[1] - 110}>
          <Label x={0} y={0} text="общий план — одна точка" size={30} bg={C.tealSoft} />
        </Appear>
      )}
      </g>
    </Drift>
  );
};

// ── Страница дневника со штампами ──
export const DiaryScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const rows = A(p.rows);
  const stamps = (Array.isArray(p.stamps) ? p.stamps : []) as [string, number, string][];
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Diary x={Ar.cx} y={470} s={1.05} k={ramp(t, 0.1, 0.7)} t={t} date={S(p.date)} title={S(p.title)} rows={rows} rowAt={rows.map((_, i) => at(ctx, i * 0.9 + 0.2))} />
      {stamps.map(([w, beat, col], i) => (
        <Stamp key={i} x={Ar.cx + (i % 2 ? -230 : 230)} y={760} text={w} k={ramp(t, at(ctx, beat), 0.45)} color={COL[col] ?? C.wine} rot={i % 2 ? 5 : -6} size={42} />
      ))}
    </Drift>
  );
};

// ── Лестница объяснений: «разумные» карточки зачёркиваются, остаётся материальный след ──
export const Explain: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const items = A(p.items);
  const beats = (Array.isArray(p.beats) ? p.beats : items.map((_, i) => i)) as number[];
  const proofAt = at(ctx, N(p.proofBeat, items.length));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {S(p.title) && (
        <Appear t={t} at={0.1} x={Ar.cx} y={140}>
          <Label x={0} y={0} text={S(p.title)} size={44} bg={C.yellow} />
        </Appear>
      )}
      {items.map((it, i) => {
        const a = at(ctx, beats[i]) + 0.15;
        const y = 270 + i * 140;
        const x = Ar.cx - 120 + i * 120;
        const cross = ramp(t, a + 1.1, 0.5);
        return (
          <g key={i}>
            <Appear t={t} at={a} x={x} y={y}>
              <Panel x={-250} y={-52} w={500} h={104} r={26} fill={C.frostSoft} />
              <Txt x={0} y={14} size={40} weight={900}>
                {it}
              </Txt>
            </Appear>
            {cross > 0 && <line x1={x - 230} y1={y} x2={x - 230 + 460 * cross} y2={y} stroke={C.wine} strokeWidth={9} strokeLinecap="round" />}
          </g>
        );
      })}
      <Appear t={t} at={proofAt} x={Ar.cx + 30} y={270 + items.length * 140 + 20}>
        <Panel x={-330} y={-58} w={660} h={116} r={28} fill={C.white} stroke={C.teal} />
        <Txt x={20} y={14} size={38} weight={900} color={C.tealDeep}>
          {S(p.proof)}
        </Txt>
        <Check x={-270} y={0} s={40} k={ramp(t, proofAt + 0.3, 0.5)} color={C.teal} />
      </Appear>
    </Drift>
  );
};

// ── Замок из точек и запертые двери ──
export const CastleScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const locks = A(p.locks);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.04}>
      <Particles shape="castle" t={t} at={0.15} dur={2.2} x={Ar.cx - 200} y={470} s={0.95} r={5.4} step={14} spread={900} />
      {locks.map((l, i) => (
        <Lock key={l} x={Ar.cx + 260 + (i % 2) * 120} y={250 + i * 190} s={0.75} k={ramp(t, at(ctx, 0.3) + i * 0.6, 0.5)} label={l} />
      ))}
      <Appear t={t} at={at(ctx, 0.9)} x={Ar.cx - 200} y={130}>
        <Label x={0} y={0} text={S(p.caption)} size={40} bg={C.wineSoft} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.3)} x={Ar.cx - 330} y={790}>
        <Diary x={0} y={0} s={0.26} k={1} t={t} />
        <Label x={230} y={10} text="тайный дневник" size={32} bg={C.amberSoft} />
      </Appear>
    </Drift>
  );
};

// ── Три письма с датами вперёд ──
export const Letters: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const dates = A(p.dates);
  const b2 = at(ctx, 2);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Appear t={t} at={0.2} x={Ar.cx} y={150}>
        <Label x={0} y={0} text="«только о делах»" size={38} bg={C.white} />
      </Appear>
      {dates.map((d, i) => {
        const k = ramp(t, at(ctx, 0.4) + i * 0.7, 0.6);
        const x = Ar.cx + (i - 1) * 380;
        return (
          <g key={i}>
            <Envelope x={x} y={470} s={0.85} k={k} open={0} rot={(i - 1) * 4} />
            <Appear t={t} at={at(ctx, 0.4) + 0.4 + i * 0.7} x={x} y={640}>
              <Label x={0} y={0} text={d} size={40} bg={C.amberSoft} serif />
            </Appear>
          </g>
        );
      })}
      <Appear t={t} at={b2 + 0.3} x={Ar.cx} y={790}>
        <Label x={0} y={0} text={S(p.caption)} size={40} bg={C.wineSoft} />
      </Appear>
    </Drift>
  );
};

// ── Перехват почты: стенограмма-закорючки, путь письма, огонь камина ──
export const Intercept: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const go = ramp(t, b1 + 0.3, 1.6);
  const burn = ramp(t, b1 + 2, 1);
  const x = Ar.x0 + 200 + go * (Ar.x1 - Ar.x0 - 400);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Appear t={t} at={0.3} x={Ar.x0 + 200} y={300}>
        <Label x={0} y={0} text="Харкер" size={34} bg={C.amberSoft} />
      </Appear>
      <Appear t={t} at={0.3} x={Ar.x1 - 200} y={300}>
        <Label x={0} y={0} text="граф" size={34} bg={C.frostSoft} />
      </Appear>
      <g opacity={1 - burn}>
        <g transform={`translate(${x} ${470 - Math.sin(go * Math.PI) * 80}) rotate(${wob(t, 1, 3)})`}>
          <rect x={-150} y={-90} width={300} height={180} rx={10} fill={C.cream} stroke={OL} strokeWidth={4} opacity={ramp(t, 0.6, 0.5)} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M -120 ${-50 + i * 34} q 15 -14 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0`} fill="none" stroke={C.ink} strokeWidth={3.5} opacity={ramp(t, 0.8 + i * 0.2, 0.4) * 0.8} />
          ))}
        </g>
      </g>
      <Appear t={t} at={0.9} x={Ar.x0 + 200} y={640}>
        <Label x={0} y={0} text="стенография = шифр" size={30} bg={C.white} />
      </Appear>
      {burn > 0 && (
        <g transform={`translate(${Ar.x1 - 200} 560)`}>
          {[0, 1, 2, 3, 4].map((i) => {
            const ph = ((t * 1.4 + i / 5) % 1 + 1) % 1;
            return <path key={i} d={`M ${-60 + i * 30} 60 Q ${-70 + i * 30} ${-20 - ph * 60} ${-40 + i * 30} ${-60 - ph * 80} Q ${-20 + i * 30} -10 ${-30 + i * 30} 60 Z`} fill={i % 2 ? C.amber : C.gold} opacity={(1 - ph) * burn} />;
          })}
          <rect x={-110} y={60} width={220} height={40} rx={8} fill={C.stoneDark} stroke={OL} strokeWidth={4} />
        </g>
      )}
      <Appear t={t} at={b2 + 0.3} x={Ar.cx} y={790}>
        <Label x={0} y={0} text="кто держит почту — держит знание" size={38} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Хор документов: разные голоса по кругу, нити между ними пока не связаны ──
export const Chorus: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const items = (Array.isArray(p.items) ? p.items : []) as [string, string][];
  const cx = Ar.cx;
  const cy = 470;
  const n = items.length;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <Appear t={t} at={0.2} x={cx} y={cy}>
        <circle r={88} fill={C.paper} stroke={OL} strokeWidth={5} />
        <Txt x={0} y={14} size={34} weight={900}>
          история
        </Txt>
      </Appear>
      {items.map(([who, what], i) => {
        const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const x = cx + Math.cos(ang) * 470;
        const y = cy + Math.sin(ang) * 300;
        const a = Math.min(b1, at(ctx, 0.3)) + i * 0.5;
        const k = ramp(t, a, 0.5);
        const broken = ramp(t, b2 + 0.4, 0.6);
        return (
          <g key={who}>
            {k > 0 && <line x1={cx} y1={cy} x2={cx + (x - cx) * k} y2={cy + (y - cy) * k} stroke={C.amber} strokeWidth={5} strokeDasharray="10 14" opacity={0.8 * (1 - broken * 0.7)} />}
            <Appear t={t} at={a} x={x} y={y}>
              <Panel x={-160} y={-62} w={320} h={124} r={24} fill={C.white} />
              <rect x={-160} y={-62} width={320} height={44} rx={22} fill={[C.amber, C.plum, C.teal, C.wine, C.stoneDark][i % 5]} />
              <Txt x={0} y={-30} size={28} color={C.white} weight={900}>
                {who}
              </Txt>
              <Txt x={0} y={36} size={28} weight={800}>
                {what}
              </Txt>
            </Appear>
          </g>
        );
      })}
    </Drift>
  );
};

// ── Корабль из точек и судовой журнал: версия → её опровержение ──
export const ShipScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const cross = ramp(t, at(ctx, 1.6), 0.6);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.035}>
      <g transform={`translate(0 ${Math.sin(t * 1.3) * 8}) rotate(${Math.sin(t * 0.9) * 1.5} ${Ar.cx - 260} 470)`}>
        <Particles shape="ship" t={t} at={0.15} dur={2} x={Ar.cx - 260} y={430} s={0.8} r={5} step={14} spread={800} />
      </g>
      <Appear t={t} at={b1 - 0.2} x={Ar.cx + 300} y={420}>
        <Panel x={-250} y={-230} w={500} h={460} r={20} fill={C.paper} />
        <Txt x={0} y={-170} size={32} weight={900}>
          судовой журнал
        </Txt>
        <Txt x={0} y={-80} size={28} weight={800} color={C.inkSoft}>
          версия штурмана:
        </Txt>
        <Txt x={0} y={-30} size={32} weight={900}>
          «виноват помощник»
        </Txt>
        {cross > 0 && <line x1={-190} y1={-40} x2={-190 + 380 * cross} y2={-40} stroke={C.wine} strokeWidth={8} strokeLinecap="round" />}
        <g opacity={ramp(t, at(ctx, 1.8), 0.5)}>
          <Txt x={0} y={60} size={28} weight={800} color={C.inkSoft}>
            записка в бутылке:
          </Txt>
          <Txt x={0} y={110} size={32} weight={900} color={C.wine}>
            «напрасная клевета»
          </Txt>
        </g>
      </Appear>
      <Stamp x={Ar.cx} y={820} text="следствие приостановлено" k={ramp(t, b2 + 0.6, 0.5)} color={C.stoneDark} rot={-3} size={36} />
    </Drift>
  );
};

// ── Пятьдесят ящиков: прибытие и путь по бумагам / подсчёт Джонатана ──
export const Boxes: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "arrive";
  const cols = 10;
  const groups = mode === "count" ? [29, 6, 6, 9] : [50];
  const gcol = [C.amber, C.plum, C.teal, C.coral];
  const glab = mode === "count" ? ["часовня Карфакса: 29", "книжка грузчика: 6", "ещё адрес: 6", "рассказ возчика: 9"] : ["50 ящиков с землёй"];
  let idx = 0;
  const boxes: React.ReactNode[] = [];
  groups.forEach((g, gi) => {
    const a = mode === "count" ? at(ctx, [0.3, 1.2, 1.5, 1.8][gi]) : at(ctx, 0.3);
    for (let j = 0; j < g; j++, idx++) {
      const k = ramp(t, a + j * 0.03, 0.4);
      if (k <= 0) continue;
      const x = Ar.cx - 330 + (idx % cols) * 66;
      const y = 260 + Math.floor(idx / cols) * 66;
      boxes.push(<rect key={idx} x={x} y={y - (1 - ease(k)) * 120} width={52} height={50} rx={6} fill={gcol[gi]} stroke={OL} strokeWidth={3} opacity={clamp01(k * 2)} />);
    }
  });
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {boxes}
      {glab.map((l, i) => (
        <Appear key={l} t={t} at={(mode === "count" ? at(ctx, [0.6, 1.3, 1.6, 1.9][i]) : at(ctx, 0.6))} x={Ar.cx - 330 + (i % 2) * 380 + 150} y={640 + Math.floor(i / 2) * 70}>
          <Label x={0} y={0} text={l} size={30} bg={mode === "count" ? [C.amberSoft, C.plumSoft, C.tealSoft, C.coralSoft][i] : C.amberSoft} />
        </Appear>
      ))}
      {mode === "arrive" && (
        <>
          <Appear t={t} at={at(ctx, 0.2)} x={Ar.cx} y={170}>
            <Label x={0} y={0} text="Варна → Уайтби → Карфакс" size={38} bg={C.white} />
          </Appear>
          <Stamp x={Ar.cx} y={650} text="накладная в порядке" k={ramp(t, at(ctx, 1.2), 0.5) * (1 - ramp(t, at(ctx, 2.1), 0.4))} color={C.tealDeep} rot={-4} size={34} />
          <Appear t={t} at={at(ctx, 2.2)} x={Ar.cx} y={740}>
            <Label x={0} y={0} text="подсказка: атлас графа → Уайтби" size={32} bg={C.yellow} />
          </Appear>
        </>
      )}
      {mode === "count" && (
        <>
          <Appear t={t} at={at(ctx, 0.1)} x={Ar.cx} y={170}>
            <Label x={0} y={0} text="где остальные?" size={40} bg={C.white} />
          </Appear>
          <Appear t={t} at={at(ctx, 2.2)} x={Ar.cx} y={790}>
            <Label x={0} y={0} text="29 + 6 + 6 + 9 = 50 (наш подсчёт)" size={32} bg={C.yellow} />
          </Appear>
        </>
      )}
    </Drift>
  );
};

// ── Сеть добрых тайн: три фигуры, у каждой «замок» на губах ──
export const Secrets: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const ppl = [
    { name: "Люси", x: -380, col: C.plum },
    { name: "мать Люси", x: 0, col: C.stoneDark },
    { name: "Артур", x: 380, col: C.amber },
  ];
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {ppl.map((q, i) => (
        <Appear key={q.name} t={t} at={0.3 + i * 0.4} x={Ar.cx + q.x} y={520}>
          <path d="M -90 170 L -80 30 Q 0 -10 80 30 L 90 170 Z" fill={q.col} stroke={OL} strokeWidth={4} />
          <circle cy={-50} r={66} fill="#f1c9a5" stroke={OL} strokeWidth={4} />
          <rect x={-40} y={-30} width={80} height={22} rx={8} fill={C.ink} opacity={ramp(t, b1 + i * 0.6, 0.4)} />
          <Label x={0} y={220} text={q.name} size={30} bg={C.white} />
        </Appear>
      ))}
      {[0, 1].map((i) => (
        <g key={i} opacity={ramp(t, b1 + 0.4 + i * 0.6, 0.5)}>
          <Arrow x1={Ar.cx + ppl[i].x + 90} y1={420} x2={Ar.cx + ppl[i + 1].x - 90} y2={420} k={ramp(t, b1 + 0.4 + i * 0.6, 0.6)} color={C.wine} w={7} bend={-0.15} />
          <Cross x={(Ar.cx + ppl[i].x + Ar.cx + ppl[i + 1].x) / 2} y={360} s={50} k={ramp(t, b1 + 1 + i * 0.6, 0.5)} />
        </g>
      ))}
      <Appear t={t} at={b2 + 0.2} x={Ar.cx} y={170}>
        <Label x={0} y={0} text="молчат из любви" size={42} bg={C.wineSoft} />
      </Appear>
    </Drift>
  );
};

// ── Запечатанный дневник: «доверие» и «знание» на весах ──
export const Seal: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const closeK = ramp(t, b1 + 0.4, 1);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Diary x={Ar.cx} y={420} s={0.62} k={ramp(t, 0.2, 0.6) * (1 - closeK)} t={t} title="Дневник" date="Будапешт" />
      <Envelope x={Ar.cx} y={420} s={1.25} k={closeK} open={0} num="запечатано" />
      <Appear t={t} at={b1 + 1.2} x={Ar.cx} y={150}>
        <Label x={0} y={0} text="«залог нашей веры друг в друга»" size={36} bg={C.amberSoft} serif />
      </Appear>
      <Appear t={t} at={b2 + 0.4} x={Ar.cx - 260} y={720}>
        <Label x={0} y={0} text="доверие ✓" size={38} bg={C.tealSoft} />
      </Appear>
      <Appear t={t} at={b2 + 0.9} x={Ar.cx + 260} y={720}>
        <Label x={0} y={0} text="знание ✕" size={38} bg={C.wineSoft} />
      </Appear>
    </Drift>
  );
};

// ── Клиника Сьюарда: ярлык-классификация / анализ «норма» против наблюдения ──
export const Clinic: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "label";
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  if (mode === "label")
    return (
      <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
        <Phonograph x={Ar.cx - 300} y={560} s={0.75} k={ramp(t, 0.2, 0.6)} t={t} play={1} />
        <Appear t={t} at={b1} x={Ar.cx + 280} y={450}>
          <Panel x={-220} y={-170} w={440} h={340} r={18} fill={C.cream} />
          <Txt x={0} y={-110} size={30} weight={900}>
            записная книжка
          </Txt>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-170} y={-70 + i * 50} width={i === 3 ? 180 : 340} height={14} rx={7} fill={C.inkSoft} opacity={0.35} />
          ))}
        </Appear>
        <Stamp x={Ar.cx + 280} y={720} text="диагноз" k={ramp(t, b1 + 1.4, 0.5)} color={C.tealDeep} rot={-6} size={44} />
        <Appear t={t} at={b2 + 0.3} x={Ar.cx} y={150}>
          <Label x={0} y={0} text="назвать ≠ объяснить" size={42} bg={C.yellow} />
        </Appear>
      </Drift>
    );
  const fall = ramp(t, b1, 2.2);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Appear t={t} at={0.3} x={Ar.cx - 300} y={430}>
        <Panel x={-230} y={-200} w={460} h={400} r={22} fill={C.white} />
        <Txt x={0} y={-130} size={32} weight={900}>
          анализ
        </Txt>
        <Txt x={0} y={-30} size={60} weight={900} color={C.tealDeep}>
          норма
        </Txt>
        <Check x={0} y={80} s={60} k={ramp(t, 1, 0.5)} color={C.teal} />
      </Appear>
      <Appear t={t} at={b1 - 0.2} x={Ar.cx + 300} y={430}>
        <Panel x={-230} y={-200} w={460} h={400} r={22} fill={C.white} />
        <Txt x={0} y={-130} size={32} weight={900}>
          наблюдение
        </Txt>
        <path d={`M -170 -40 L ${-170 + 340 * fall} ${-40 + 200 * fall}`} stroke={C.wine} strokeWidth={12} strokeLinecap="round" />
        <Txt x={0} y={150} size={30} weight={800} color={C.wine}>
          силы уходят
        </Txt>
      </Appear>
      <Appear t={t} at={b2} x={Ar.cx} y={790}>
        <Label x={0} y={0} text="инструмент видит то, на что рассчитан" size={36} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Телеграмма идёт по проводам и опаздывает ──
export const TelegraphScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const go = ramp(t, 0.6, at(ctx, 1) + 1);
  const x0 = Ar.x0 + 120;
  const x1 = Ar.x1 - 120;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {[0, 1, 2, 3].map((i) => {
        const x = x0 + ((x1 - x0) * i) / 3;
        return (
          <Appear key={i} t={t} at={0.1 + i * 0.15} x={x} y={600}>
            <rect x={-8} y={-280} width={16} height={300} fill="#6b4524" stroke={OL} strokeWidth={3} />
            <rect x={-60} y={-270} width={120} height={14} fill="#6b4524" stroke={OL} strokeWidth={3} />
          </Appear>
        );
      })}
      <path d={`M ${x0} 340 Q ${(x0 + x1) / 2} 400 ${x1} 340`} fill="none" stroke={C.ink} strokeWidth={4} opacity={ramp(t, 0.5, 0.5)} />
      <Telegram x={x0 + (x1 - x0) * go} y={250 + Math.sin(go * Math.PI) * 50} s={0.62} k={ramp(t, 0.5, 0.4)} text="НОЧУЙТЕ У ЛЮСИ" />
      <Appear t={t} at={at(ctx, 0.7)} x={x1 - 60} y={770}>
        <Label x={0} y={0} text="«на сутки позже»" size={40} bg={C.wineSoft} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.3)} x={Ar.cx} y={150}>
        <Label x={0} y={0} text="цепочка связи = все её звенья" size={36} bg={C.white} />
      </Appear>
    </Drift>
  );
};

// ── Газетная вырезка: заметка, где читатель видит больше героев ──
export const ClippingScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.035}>
      <Clipping x={Ar.cx} y={420} s={1.3} k={ramp(t, 0.2, 0.7)} head={S(p.head)} sub={S(p.sub)} rot={-2} />
      <Appear t={t} at={at(ctx, 0.6)} x={Ar.cx + 120} y={430}>
        <Label x={0} y={0} text={S(p.quote)} size={40} bg={C.yellow} rot={3} />
      </Appear>
      <Appear t={t} at={at(ctx, 1.1)} x={Ar.cx} y={790}>
        <Label x={0} y={0} text="имени нет — связь видит читатель" size={34} bg={C.frostSoft} />
      </Appear>
    </Drift>
  );
};

// ── Окно Люси: защита у окна, мать открывает створку из лучших побуждений ──
export const WindowScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const open = ramp(t, b1 + 0.6, 1.2);
  const cx = Ar.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <Appear t={t} at={0.1} x={cx} y={450}>
        <rect x={-260} y={-300} width={520} height={560} rx={14} fill="#6b4524" stroke={OL} strokeWidth={5} />
        <rect x={-230} y={-270} width={460} height={500} fill="#1d2a4c" />
        <circle cx={120} cy={-160} r={60} fill="#e8f0ff" opacity={0.85} />
        {/* створки */}
        <g transform={`translate(-230 -270) scale(${1 - open * 0.75} 1)`}>
          <rect width={230} height={500} fill={C.glass} fillOpacity={0.35} stroke={OL} strokeWidth={5} />
        </g>
        <g transform={`translate(230 -270) scale(${-(1 - open * 0.75)} 1)`}>
          <rect width={230} height={500} fill={C.glass} fillOpacity={0.35} stroke={OL} strokeWidth={5} />
        </g>
        {/* белые цветы на подоконнике: исчезают, когда их убирают */}
        {Array.from({ length: 7 }).map((_, i) => (
          <circle key={i} cx={-210 + i * 70} cy={260} r={22} fill="#fff" stroke={OL} strokeWidth={3} opacity={(1 - ramp(t, b1 + 0.2 + i * 0.08, 0.4)) * ramp(t, at(ctx, 0.5) + i * 0.1, 0.4)} />
        ))}
        <rect x={-280} y={250} width={560} height={30} rx={8} fill="#8a5a34" stroke={OL} strokeWidth={4} />
      </Appear>
      <Appear t={t} at={at(ctx, 0.6)} x={cx} y={120}>
        <Label x={0} y={0} text="защита без объяснений" size={30} bg={C.white} />
      </Appear>
      <Appear t={t} at={b1 + 0.5} x={cx + 330} y={560}>
        <Label x={0} y={0} text="забота без знания" size={32} bg={C.wineSoft} />
      </Appear>
      <Appear t={t} at={b2 + 0.4} x={cx} y={790}>
        <Label x={0} y={0} text="цена знания, которым не поделились" size={34} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Колбы фактов: одна — мало; две сливаются в одно доказательство ──
export const Flasks: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "one";
  if (mode === "one") {
    const b1 = at(ctx, 1);
    return (
      <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
        <Flask x={Ar.cx - 200} y={460} s={1.05} k={ramp(t, 0.3, 0.6)} level={ramp(t, 0.6, 1.2) * 0.5} color={C.frost} label={S(p.label)} t={t} />
        {[["тело унесли?", 0.3], ["ошибка?", 0.9], ["вор?", 1.5]].map(([q, d], i) => (
          <Appear key={i} t={t} at={b1 + (d as number)} x={Ar.cx + 300} y={300 + i * 150}>
            <Label x={0} y={0} text={q as string} size={36} bg={C.frostSoft} />
          </Appear>
        ))}
        <Appear t={t} at={b1 + 0.1} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.caption)} size={38} bg={C.white} />
        </Appear>
      </Drift>
    );
  }
  const merge = ramp(t, at(ctx, 1.1), 1.4);
  const b2 = at(ctx, 2);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Flask x={Ar.cx - 300 + merge * 300} y={460} s={0.85 + merge * 0.3} k={ramp(t, 0.3, 0.6)} level={0.45 + merge * 0.35} color={merge > 0.5 ? C.teal : C.amber} label={merge > 0.5 ? "общее знание" : S(p.left)} t={t} />
      <g opacity={1 - merge}>
        <Flask x={Ar.cx + 300 - merge * 300} y={460} s={0.85} k={ramp(t, at(ctx, 0.5), 0.6)} level={0.45} color={C.plum} label={S(p.right)} t={t} />
      </g>
      <Appear t={t} at={at(ctx, 1.4)} x={Ar.cx} y={150}>
        <Label x={0} y={0} text={S(p.caption)} size={40} bg={C.tealSoft} />
      </Appear>
      <Appear t={t} at={b2 + 0.4} x={Ar.cx} y={790}>
        <Label x={0} y={0} text="признанная запись → уверенность" size={34} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Обмен архивами: дневники ↔ валики фонографа ──
export const Exchange: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const swap = ramp(t, b1 + 0.4, 1.6);
  const lx = Ar.cx - 330;
  const rx = Ar.cx + 330;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Appear t={t} at={0.2} x={lx} y={720}>
        <Label x={0} y={0} text="Мина" size={36} bg={C.amberSoft} />
      </Appear>
      <Appear t={t} at={0.2} x={rx} y={720}>
        <Label x={0} y={0} text="Сьюард" size={36} bg={C.tealSoft} />
      </Appear>
      <g transform={`translate(${lx + (rx - lx) * swap} ${460 - Math.sin(swap * Math.PI) * 140})`}>
        <Diary x={0} y={0} s={0.36} k={ramp(t, 0.4, 0.5)} t={t} />
      </g>
      <g transform={`translate(${rx + (lx - rx) * swap} ${460 + Math.sin(swap * Math.PI) * 140})`}>
        <g opacity={ramp(t, 0.6, 0.5)}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-90 + i * 60} y={-60} width={46} height={120} rx={22} fill={C.amber} stroke={OL} strokeWidth={4} />
          ))}
        </g>
      </g>
      <Appear t={t} at={b1 + 0.2} x={Ar.cx} y={170}>
        <Label x={0} y={0} text="обмен архивами = обмен доверием" size={38} bg={C.white} />
      </Appear>
      <Appear t={t} at={b2 + 0.6} x={Ar.cx} y={790}>
        <Label x={0} y={0} text="одна запись подтверждает другую" size={34} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Мина печатает: машинка, хронология, три копии ──
export const TypewriterScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const rows = A(p.rows);
  const typed = ramp(t, at(ctx, 0.5), Math.max(2, at(ctx, 1.6) - at(ctx, 0.5)));
  const copies = ramp(t, at(ctx, 1.3), 0.8);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Typewriter x={Ar.cx - 230} y={560} s={0.95} k={ramp(t, 0.2, 0.6)} typed={typed} rows={rows} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${Ar.cx + 300 + i * 40} ${330 + i * 40}) rotate(${(i - 1) * 3})`} opacity={clamp01(copies * 3 - i)}>
          <rect x={-150} y={-190} width={300} height={380} rx={8} fill={C.cream} stroke={OL} strokeWidth={4} />
          {rows.map((r, j) => (
            <text key={j} x={-125} y={-140 + j * 44} fontFamily="'Courier New', monospace" fontWeight={700} fontSize={22} fill={C.ink}>
              {r}
            </text>
          ))}
          <text x={110} y={170} fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={C.amber} textAnchor="end">
            {`№${i + 1}`}
          </text>
        </g>
      ))}
      <Appear t={t} at={at(ctx, 1.5)} x={Ar.cx + 380} y={150}>
        <Label x={0} y={0} text={S(p.caption)} size={38} bg={C.yellow} />
      </Appear>
      <Stamp x={Ar.cx - 230} y={150} text="хронология" k={ramp(t, at(ctx, 0.3), 0.5)} color={C.teal} rot={-4} size={40} />
      <Appear t={t} at={at(ctx, 2.3)} x={Ar.cx + 300} y={790}>
        <Label x={0} y={0} text="редактор расследования" size={34} bg={C.tealSoft} />
      </Appear>
    </Drift>
  );
};

// ── Прозрачные листы показаний: точки складываются в рисунок ──
export const Sheets: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const who = A(p.who);
  const join = ramp(t, at(ctx, 1), 1.4);
  const reveal = at(ctx, 1) + 1.2;
  const cols = [C.amber, C.plum, C.teal, C.wine];
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.035}>
      {who.map((w, i) => {
        const spread = (i - (who.length - 1) / 2) * 290;
        const x = Ar.cx + spread * (1 - join);
        const dots: [number, number][] = Array.from({ length: 5 }, (_, j) => [(rnd(i * 7 + j, 1) - 0.5) * 260, (rnd(i * 7 + j, 2) - 0.5) * 300]);
        return <Sheet key={w} x={x} y={470} k={ramp(t, 0.3 + i * 0.4, 0.5)} who={w} color={cols[i % 4]} dots={join > 0.7 ? [] : dots} rot={(i - 1.5) * 3 * (1 - join)} />;
      })}
      {join > 0.6 && <Particles shape={S(p.reveal, "castle")} t={t} at={reveal} dur={1.8} x={Ar.cx} y={480} s={0.6} r={4.6} step={13} spread={260} />}
      <Appear t={t} at={reveal + 1.4} x={Ar.cx} y={790}>
        <Label x={0} y={0} text={S(p.caption)} size={40} bg={C.yellow} />
      </Appear>
      <Appear t={t} at={0.4} x={Ar.cx} y={150}>
        <Label x={0} y={0} text="прозрачные листы — образ фильма" size={30} bg={C.white} />
      </Appear>
    </Drift>
  );
};

// ── Стол техники: стенография, машинка, фонограф, телеграф, газета ──
export const TechTable: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const items = ["стенография", "машинка", "фонограф", "телеграф", "газеты"];
  const b1 = at(ctx, 1);
  const w = (Ar.x1 - Ar.x0 - 80) / items.length;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {items.map((it, i) => {
        const x = Ar.x0 + 40 + w * (i + 0.5);
        const a = 0.3 + i * 0.35;
        return (
          <Appear key={it} t={t} at={a} x={x} y={470}>
            <circle r={Math.min(110, w * 0.42)} fill={C.white} stroke={OL} strokeWidth={4} />
            {i === 0 && <path d="M -60 0 q 15 -24 30 0 t 30 0 t 30 0 t 30 0" fill="none" stroke={C.ink} strokeWidth={6} />}
            {i === 1 && <Typewriter x={0} y={30} s={0.22} k={1} typed={0} />}
            {i === 2 && <Phonograph x={-10} y={40} s={0.24} k={1} t={t} play={1} />}
            {i === 3 && <Telegram x={0} y={0} s={0.28} k={1} text="СРОЧНО" />}
            {i === 4 && <Clipping x={0} y={0} s={0.3} k={1} head="Газета" />}
            <Txt x={0} y={160} size={Math.min(30, w * 0.1)} weight={900}>
              {it}
            </Txt>
          </Appear>
        );
      })}
      <Appear t={t} at={b1 + 0.4} x={Ar.cx} y={170}>
        <Label x={0} y={0} text="древний страх ↔ новейшая запись" size={40} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Огонь и копии: оригиналы сгорают, копии в несгораемом шкафу ──
export const FireScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const burn = ramp(t, b1 + 0.4, 1.4);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Appear t={t} at={0.2} x={Ar.cx} y={170}>
        <Label x={0} y={0} text="граф тоже знает силу бумаг" size={38} bg={C.white} />
      </Appear>
      <g transform={`translate(${Ar.cx - 300} 520)`} opacity={ramp(t, 0.5, 0.5)}>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-110 + i * 75} y={-80 - (i % 2) * 10} width={56} height={150} rx={26} fill={C.amber} stroke={OL} strokeWidth={4} opacity={1 - burn * 0.85} />
        ))}
        {burn > 0 &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const ph = ((t * 1.3 + i / 6) % 1 + 1) % 1;
            return <path key={i} d={`M ${-120 + i * 45} 80 Q ${-140 + i * 45} ${-10 - ph * 70} ${-100 + i * 45} ${-60 - ph * 110} Q ${-70 + i * 45} 0 ${-80 + i * 45} 80 Z`} fill={i % 2 ? C.amber : C.gold} opacity={(1 - ph) * burn} />;
          })}
        <rect x={-170} y={80} width={340} height={36} rx={8} fill={C.stoneDark} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={175} size={30} weight={800} color={C.ink}>
          цилиндры сгорели
        </Txt>
      </g>
      <Appear t={t} at={b1 + 1.4} x={Ar.cx + 300} y={520}>
        <rect x={-150} y={-170} width={300} height={300} rx={16} fill="#5d6380" stroke={OL} strokeWidth={5} />
        <circle cx={70} cy={-20} r={34} fill={C.gold} stroke={OL} strokeWidth={4} />
        <rect x={-110} y={-130} width={150} height={20} rx={6} fill={C.cream} />
        <rect x={-110} y={-100} width={150} height={20} rx={6} fill={C.cream} />
        <rect x={-110} y={-70} width={150} height={20} rx={6} fill={C.cream} />
        <Txt x={0} y={185} size={30} weight={800}>
          копии в шкафу
        </Txt>
        <Check x={120} y={-140} s={44} k={ramp(t, b1 + 1.9, 0.5)} color={C.teal} />
      </Appear>
      <Appear t={t} at={b2 + 0.3} x={Ar.cx} y={790}>
        <Label x={0} y={0} text="копия = защита памяти" size={40} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Стена: кирпичи между Миной и группой (первая, пролом, снова) ──
export const Wall: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "first";
  const build = mode === "break" ? 1 - ramp(t, at(ctx, 1), 1.2) : ramp(t, at(ctx, mode === "again" ? 0.3 : 0.5), 2.2);
  const rows = 7;
  const bricks: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c;
      const k = clamp01(build * rows * 3 - i);
      if (k <= 0) continue;
      bricks.push(<rect key={i} x={Ar.cx - 90 + c * 60 - (r % 2) * 30} y={760 - r * 72 - (1 - k) * 80} width={56} height={66} rx={6} fill={mode === "break" ? C.stone : C.stoneDark} stroke={OL} strokeWidth={3} opacity={k} />);
    }
  const ppl = [0, 1, 2, 3].map((i) => ({ x: Ar.cx + 240 + (i % 2) * 120, y: 520 + Math.floor(i / 2) * 170 }));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Appear t={t} at={0.2} x={Ar.cx - 330} y={560}>
        <path d="M -80 180 L -70 30 Q 0 -10 70 30 L 80 180 Z" fill={C.amber} stroke={OL} strokeWidth={4} />
        <circle cy={-50} r={62} fill="#f1c9a5" stroke={OL} strokeWidth={4} />
        <Diary x={0} y={250} s={0.22} k={1} t={t} />
        <Label x={0} y={-160} text="Мина" size={32} bg={C.amberSoft} />
      </Appear>
      {ppl.map((q, i) => (
        <Appear key={i} t={t} at={0.3 + i * 0.12} x={q.x} y={q.y}>
          <path d="M -50 110 L -44 20 Q 0 -8 44 20 L 50 110 Z" fill={C.nightSoft} stroke={OL} strokeWidth={3} />
          <circle cy={-30} r={38} fill="#f1c9a5" stroke={OL} strokeWidth={3} />
        </Appear>
      ))}
      {bricks}
      {mode === "break" && <Thread x1={Ar.cx - 260} y1={520} x2={Ar.cx + 220} y2={520} k={ramp(t, at(ctx, 1.2), 1)} t={t} color={C.teal} sag={30} n={34} />}
      <Appear t={t} at={at(ctx, mode === "again" ? 1.1 : 1)} x={Ar.cx} y={150}>
        <Label x={0} y={0} text={mode === "break" ? "«Мина все будет знать»" : mode === "again" ? "«между нами выросла стена»" : "оберегают — и отстраняют"} size={38} bg={mode === "break" ? C.tealSoft : C.wineSoft} />
      </Appear>
      {mode === "again" && (
        <Appear t={t} at={at(ctx, 2.2)} x={Ar.cx} y={250}>
          <Label x={0} y={0} text="выход: честно назвать риск" size={34} bg={C.yellow} />
        </Appear>
      )}
    </Drift>
  );
};

// ── «Заключение Мины Харкер»: метод исключения ──
export const Memo: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const items = A(p.items);
  const marks = A(p.marks);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Appear t={t} at={0.2} x={Ar.cx} y={480}>
        <rect x={-430} y={-380} width={860} height={720} rx={14} fill={C.cream} stroke={OL} strokeWidth={5} />
        <text y={-300} fontFamily={SERIF} fontWeight={700} fontSize={44} fill={C.ink} textAnchor="middle">
          Заключение Мины Харкер
        </text>
        <line x1={-360} y1={-270} x2={360} y2={-270} stroke={C.amber} strokeWidth={4} />
        <text y={-215} fontFamily={SERIF} fontStyle="italic" fontWeight={700} fontSize={32} fill={C.inkSoft} textAnchor="middle">
          «Обдумаю все без предвзятости»
        </text>
      </Appear>
      {items.map((it, i) => {
        const a = b1 + 0.6 + i * 0.8;
        const y = 380 + i * 110;
        const ok = marks[i] === "ok";
        return (
          <Appear key={i} t={t} at={a} x={Ar.cx - 340} y={y}>
            <text x={0} y={14} fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={C.amber}>
              {`${i + 1}.`}
            </text>
            <text x={60} y={14} fontFamily={FONT} fontWeight={800} fontSize={40} fill={C.ink}>
              {it}
            </text>
            {ok ? <Check x={600} y={0} s={46} k={ramp(t, a + 0.5, 0.4)} color={C.teal} /> : <Cross x={600} y={0} s={60} k={ramp(t, a + 0.5, 0.4)} />}
          </Appear>
        );
      })}
      <Stamp x={Ar.cx} y={760} text={S(p.verdict)} k={ramp(t, b1 + 0.8 + items.length * 0.8, 0.5)} color={C.tealDeep} rot={-4} size={46} />
      <Appear t={t} at={b2 + 0.3} x={Ar.cx + 400} y={230}>
        <Label x={0} y={0} text="«посрамила!»" size={40} bg={C.yellow} rot={8} />
      </Appear>
    </Drift>
  );
};

// ── Граф без голоса: силуэт без лица, вокруг — чужие записи о нём ──
export const Voiceless: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const docs = [
    { who: "Джонатан", x: -420, y: -230 },
    { who: "возчик", x: 420, y: -230 },
    { who: "профессор", x: -440, y: 170 },
    { who: "газета", x: 440, y: 170 },
  ];
  const fade = ramp(t, b2 + 1.2, 1.6);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <g transform={`translate(${Ar.cx} 520)`} opacity={(1 - fade * 0.85) * ramp(t, 0.3, 0.8)}>
        {/* силуэт плаща без лица — не кинообраз, а пустое место */}
        <path d="M -150 300 L -110 -40 Q -60 -120 0 -130 Q 60 -120 110 -40 L 150 300 Z" fill={C.night} stroke={C.frost} strokeWidth={4} strokeDasharray="14 10" />
        <ellipse cx={0} cy={-190} rx={70} ry={80} fill={C.night} stroke={C.frost} strokeWidth={4} strokeDasharray="14 10" />
        <text y={-170} fontFamily={HEAVY} fontWeight={900} fontSize={70} fill={C.frost} textAnchor="middle">
          ?
        </text>
      </g>
      <Appear t={t} at={0.6} x={Ar.cx} y={150}>
        <Label x={0} y={0} text="у графа нет своего дневника" size={36} bg={C.frostSoft} />
      </Appear>
      {docs.map((d, i) => (
        <Appear key={d.who} t={t} at={b1 + 0.4 + i * 0.6} x={Ar.cx + d.x} y={520 + d.y}>
          <Panel x={-150} y={-60} w={300} h={120} r={18} fill={C.paper} />
          <Txt x={0} y={-12} size={26} weight={800} color={C.inkSoft}>
            пишет о нём:
          </Txt>
          <Txt x={0} y={30} size={34} weight={900}>
            {d.who}
          </Txt>
        </Appear>
      ))}
      <Appear t={t} at={b2 + 1.5} x={Ar.cx} y={790}>
        <Label x={0} y={0} text="папка собрана — пустоте нет места" size={34} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Весы «разумно / суеверно» и проверка как точка опоры ──
export const Scales: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const tilt = (ramp(t, 0.5, 1) - ramp(t, b1 + 0.6, 1.2)) * 12;
  const cx = Ar.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <Appear t={t} at={0.1} x={cx} y={520}>
        <rect x={-14} y={-230} width={28} height={420} fill={C.ink} />
        <rect x={-140} y={180} width={280} height={34} rx={8} fill={C.ink} />
        <g transform={`translate(0 -230) rotate(${tilt})`}>
          <rect x={-380} y={-12} width={760} height={24} rx={10} fill={C.ink} />
          <g transform={`translate(-360 0) rotate(${-tilt})`}>
            <line x1={0} y1={0} x2={-60} y2={150} stroke={C.ink} strokeWidth={4} />
            <line x1={0} y1={0} x2={60} y2={150} stroke={C.ink} strokeWidth={4} />
            <path d="M -110 150 L 110 150 Q 0 230 -110 150 Z" fill={C.amber} stroke={OL} strokeWidth={4} />
            <Label x={0} y={260} text="«это суеверие»" size={30} bg={C.white} />
          </g>
          <g transform={`translate(360 0) rotate(${-tilt})`}>
            <line x1={0} y1={0} x2={-60} y2={150} stroke={C.ink} strokeWidth={4} />
            <line x1={0} y1={0} x2={60} y2={150} stroke={C.ink} strokeWidth={4} />
            <path d="M -110 150 L 110 150 Q 0 230 -110 150 Z" fill={C.frost} stroke={OL} strokeWidth={4} />
            <Label x={0} y={260} text="«сие не существует»" size={30} bg={C.white} />
          </g>
        </g>
        <circle cy={-230} r={34} fill={C.teal} stroke={OL} strokeWidth={4} />
      </Appear>
      <Appear t={t} at={b1 + 0.6} x={cx} y={130}>
        <Label x={0} y={0} text="опора: наблюдать, записывать, проверять вместе" size={34} bg={C.tealSoft} />
      </Appear>
      <Appear t={t} at={b2 + 0.4} x={cx} y={790}>
        <Label x={0} y={0} text="роман — вымысел, не доказательство вампиров" size={32} bg={C.yellow} />
      </Appear>
    </Drift>
  );
};

export { Key, Stack };
