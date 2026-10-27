// Сцены BM-035 о командах и обществе: цепная реакция краеугольной привычки,
// печенье и редиска (сила воли), «княжества» организации с перемириями и пустым
// местом ответственного, корзина покупателя и поток данных (этика), песня между
// хитами, сеть крепких и слабых связей, пустые автобусы утра бойкота, сложенный
// лист бумаги, рыбы и вода, протокол из четырёх вопросов, бассейн «видеофильма».
// Учебные схемы BanaMind: без логотипов, портретов реальных людей и насилия.
import React from "react";
import { C, FONT, HEAVY } from "../theme";
import { Appear, area, Arrow, at, Check, clamp01, Cross, Drift, pop, ramp, wob, type VisualProps } from "./kit";
import { Figure, Label, OL } from "./props";
import { rnd } from "./particles";

type P = { host?: string; [k: string]: unknown };
const S = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const N = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const A = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const softOf = (i: number) => [C.cueSoft, C.routineSoft, C.rewardSoft, C.craveSoft, C.sageSoft][i % 5];

// ── Цепная реакция: одна оранжевая точка запускает волну по сетке «организации» ──
// p: title, triggerBeat, waveBeat, labels [[text, beat]], caption
export const Keystone: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cols = 9;
  const rows = 5;
  const gx = Ar.cx - ((cols - 1) * 110) / 2;
  const gy = 270;
  const trig = at(ctx, N(p.triggerBeat, 0)) + 0.4;
  const wave = at(ctx, N(p.waveBeat, 1));
  const sx = 0;
  const sy = 2;
  const labels = (Array.isArray(p.labels) ? p.labels : []) as [string, number][];
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.035}>
      {S(p.title) && (
        <Appear t={t} at={0.2} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.title)} size={40} bg={C.white} />
        </Appear>
      )}
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const d = Math.hypot(c - sx, r - sy);
        const k = ramp(t, wave + d * 0.22, 0.5);
        const isTrig = c === sx && r === sy;
        const x = gx + c * 110;
        const y = gy + r * 105;
        const col = isTrig ? C.cue : k > 0.5 ? [C.routine, C.reward, C.sage][(c + r) % 3] : C.stoneSoft;
        const s = isTrig ? 1 + 0.12 * Math.sin(t * 4) * ramp(t, trig, 0.4) : 1 + 0.25 * Math.sin(Math.PI * k);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={ramp(t, 0.1 + (i % 7) * 0.05, 0.5)}>
            <circle r={isTrig ? 30 : 22} fill={col} stroke={OL} strokeWidth={3} />
          </g>
        );
      })}
      {labels.map(([text, beat], i) => (
        <Appear key={i} t={t} at={at(ctx, beat) + 0.3} x={Ar.cx + (i - (labels.length - 1) / 2) * 380} y={815}>
          <Label x={0} y={0} text={text} size={32} bg={softOf(i)} />
        </Appear>
      ))}
      {S(p.trigText) && (
        <Appear t={t} at={trig} x={gx - 10} y={gy + sy * 105 - 80}>
          <Label x={0} y={0} text={S(p.trigText)} size={32} bg={C.cueSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// Печенье и редиска.
const Cookie: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={46} fill="#e0a96d" stroke={OL} strokeWidth={4} />
    {[[-16, -14], [14, -6], [-4, 16], [20, 18], [-22, 10]].map(([a, b], i) => (
      <circle key={i} cx={a} cy={b} r={7} fill="#5a3520" />
    ))}
  </g>
);
const Radish: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -10 -40 Q -30 -80 -20 -100 M 0 -40 Q 0 -90 10 -106 M 10 -40 Q 30 -80 34 -96" stroke={C.sage} strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d="M -36 -10 Q -40 -46 0 -46 Q 40 -46 36 -10 Q 30 30 0 56 Q -30 30 -36 -10 Z" fill="#e05c7a" stroke={OL} strokeWidth={4} />
    <path d="M -14 -26 Q -8 -34 0 -32" stroke="#fff" strokeWidth={5} fill="none" opacity={0.6} strokeLinecap="round" />
  </g>
);

// ── Сила воли: две тарелки, затем столбики «сколько держались над головоломкой» ──
// p: platesBeat, barsBeat, left, right, leftVal, rightVal, unit, caption
export const Plates: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const bars = ramp(t, at(ctx, N(p.barsBeat, 1)), 1.2);
  const lv = N(p.leftVal, 19);
  const rv = N(p.rightVal, 8);
  const mx = Math.max(lv, rv);
  const xs = [Ar.cx - 260, Ar.cx + 260];
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {xs.map((x, i) => (
        <g key={i}>
          <Appear t={t} at={at(ctx, N(p.platesBeat, 0)) + 0.2 + i * 0.4} x={x} y={330}>
            <ellipse cx={0} cy={40} rx={190} ry={50} fill="#fff" stroke={OL} strokeWidth={5} />
            <ellipse cx={0} cy={34} rx={150} ry={34} fill={C.paper} />
            {i === 0 ? (
              <>
                <Cookie x={-60} y={10} s={0.8} />
                <Cookie x={30} y={0} s={0.85} />
                <Cookie x={-10} y={-40} s={0.75} />
              </>
            ) : (
              <>
                <Radish x={-60} y={20} s={0.7} />
                <Radish x={20} y={10} s={0.75} />
                <Radish x={80} y={24} s={0.65} />
              </>
            )}
            <Label x={0} y={140} text={i === 0 ? S(p.left, "печенье") : S(p.right, "редиска")} size={34} bg={i === 0 ? C.rewardSoft : C.coralSoft} />
          </Appear>
          {bars > 0 && (
            <g transform={`translate(${x} 820)`}>
              <rect x={-70} y={-((i === 0 ? lv : rv) / mx) * 250 * bars} width={140} height={((i === 0 ? lv : rv) / mx) * 250 * bars} rx={14} fill={i === 0 ? C.reward : C.coral} stroke={OL} strokeWidth={4} />
              <text y={-((i === 0 ? lv : rv) / mx) * 250 * bars - 22} fontFamily={HEAVY} fontWeight={900} fontSize={44} fill={C.ink} textAnchor="middle" opacity={clamp01(bars * 2 - 1)}>
                {`≈ ${i === 0 ? lv : rv} ${S(p.unit, "мин")}`}
              </text>
            </g>
          )}
        </g>
      ))}
      {bars > 0 && <line x1={Ar.cx - 420} y1={820} x2={Ar.cx + 420} y2={820} stroke={OL} strokeWidth={5} />}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.3} x={Ar.cx} y={130}>
          <Label x={0} y={0} text={S(p.caption)} size={30} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Организация как «княжества»: отделы с границами-перемириями; посередине —
// пустой стул «ответственный за безопасность?»; при кризисе границы размыкаются ──
// p: units [..], gapBeat, crisisBeat, gapText, fixText, fixBeat
export const Truce: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const units = A(p.units);
  const n = Math.max(1, units.length);
  const R = 300;
  const cx = Ar.cx;
  const cy = 520;
  const gap = p.gapBeat !== undefined ? ramp(t, at(ctx, N(p.gapBeat, 1)), 0.6) : 0;
  const crisis = p.crisisBeat !== undefined ? ramp(t, at(ctx, N(p.crisisBeat, 2)), 0.8) : 0;
  const fix = p.fixBeat !== undefined ? ramp(t, at(ctx, N(p.fixBeat, 3)), 0.7) : 0;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy} amount={0.03}>
      {units.map((u, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const open = crisis * 40;
        const x = cx + Math.cos(a) * (R + open);
        const y = cy + Math.sin(a) * (R * 0.72 + open);
        return (
          <Appear key={i} t={t} at={0.2 + i * 0.25} x={x} y={y}>
            <rect x={-150} y={-62} width={300} height={124} rx={26} fill={softOf(i)} stroke={OL} strokeWidth={4} strokeDasharray={crisis > 0.5 ? "0" : "14 10"} />
            <text y={12} fontFamily={HEAVY} fontWeight={800} fontSize={32} fill={C.ink} textAnchor="middle">
              {u}
            </text>
          </Appear>
        );
      })}
      {/* центр: пустое место ответственного */}
      <g transform={`translate(${cx} ${cy})`} opacity={ramp(t, 0.6, 0.5)}>
        <circle r={92} fill={fix > 0.5 ? C.sageSoft : C.white} stroke={fix > 0.5 ? C.green : C.coral} strokeWidth={6} strokeDasharray={fix > 0.5 ? "0" : "12 10"} />
        {fix > 0.5 ? <Figure x={0} y={64} s={0.4} color={C.sage} /> : <text y={30} fontFamily={HEAVY} fontWeight={900} fontSize={90} fill={C.coral} textAnchor="middle">?</text>}
      </g>
      {gap > 0 && fix < 0.5 && (
        <g opacity={gap}>
          <Label x={cx} y={130} text={S(p.gapText, "кто отвечает за всех?")} size={32} bg={C.coralSoft} />
        </g>
      )}
      {fix > 0 && (
        <g opacity={fix}>
          <Label x={cx} y={130} text={S(p.fixText, "у каждого места — ответственный")} size={32} bg={C.sageSoft} />
        </g>
      )}
      {crisis > 0 && crisis < 1 && <circle cx={cx} cy={cy} r={200 + crisis * 300} fill="none" stroke={C.cue} strokeWidth={10} opacity={1 - crisis} />}
    </Drift>
  );
};

// ── Корзина покупателя: товары → поток точек данных → карточка «прогноз»;
// предупреждение об этике; купоны «перемешаны» с посторонними ──
// p: items [..], dataBeat, predictBeat, predict, warnBeat, warn, mixBeat
export const Cart: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const items = A(p.items);
  const data = p.dataBeat !== undefined ? ramp(t, at(ctx, N(p.dataBeat, 1)), 1) : 0;
  const pred = p.predictBeat !== undefined ? ramp(t, at(ctx, N(p.predictBeat, 2)), 0.6) : 0;
  const warn = p.warnBeat !== undefined ? ramp(t, at(ctx, N(p.warnBeat, 3)), 0.6) : 0;
  const mix = p.mixBeat !== undefined ? ramp(t, at(ctx, N(p.mixBeat, 3)), 0.8) : 0;
  const cx0 = Ar.cx - 380;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {/* тележка */}
      <g transform={`translate(${cx0} 560)`} opacity={ramp(t, 0.1, 0.5)}>
        <path d="M -210 -170 L -170 -170 L -120 60 L 170 60 L 210 -110 L -150 -110" fill="none" stroke={OL} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={-90} cy={110} r={24} fill={C.stone} stroke={OL} strokeWidth={5} />
        <circle cx={140} cy={110} r={24} fill={C.stone} stroke={OL} strokeWidth={5} />
        {items.map((it, i) => (
          <Appear key={i} t={t} at={0.4 + i * 0.35} x={-80 + (i % 2) * 190} y={-150 - Math.floor(i / 2) * 64}>
            <Label x={0} y={0} text={it} size={26} bg={softOf(i)} />
          </Appear>
        ))}
      </g>
      {/* поток данных */}
      {data > 0 &&
        Array.from({ length: 18 }, (_, i) => {
          const u = (((t * 0.45 + i / 18) % 1) + 1) % 1;
          const x = cx0 + 160 + u * 420;
          const y = 470 + Math.sin(u * Math.PI * 2 + i) * 40 - u * 60;
          return <circle key={i} cx={x} cy={y} r={9} fill={[C.cue, C.routine, C.reward][i % 3]} stroke={OL} strokeWidth={2} opacity={data * Math.sin(u * Math.PI)} />;
        })}
      {/* карточка прогноза */}
      {pred > 0 && (
        <g transform={`translate(${Ar.cx + 330} 420) scale(${0.8 + 0.2 * pred})`} opacity={pred}>
          <rect x={-230} y={-150} width={460} height={300} rx={28} fill={C.white} stroke={OL} strokeWidth={5} />
          <circle cx={-150} cy={-70} r={40} fill={C.craveSoft} stroke={OL} strokeWidth={4} />
          <rect x={-90} y={-92} width={260} height={18} rx={9} fill={C.inkSoft} opacity={0.25} />
          <rect x={-90} y={-56} width={180} height={18} rx={9} fill={C.inkSoft} opacity={0.25} />
          <text y={60} fontFamily={HEAVY} fontWeight={900} fontSize={36} fill={C.crave} textAnchor="middle">
            {S(p.predict, "прогноз привычки")}
          </text>
        </g>
      )}
      {mix > 0 && (
        <g transform={`translate(${Ar.cx + 330} 760)`} opacity={mix}>
          {["газонокосилка", "купон", "бокалы"].map((s, i) => (
            <g key={i} transform={`translate(${(i - 1) * 170} ${Math.sin(t * 2 + i) * 6})`}>
              <Label x={0} y={0} text={s} size={26} bg={i === 1 ? C.rewardSoft : C.white} />
            </g>
          ))}
        </g>
      )}
      {warn > 0 && (
        <g opacity={warn} transform={`translate(${Ar.cx} 130)`}>
          <Label x={0} y={0} text={S(p.warn, "удобно для компании — тревожно для человека")} size={32} bg={C.coralSoft} />
        </g>
      )}
    </Drift>
  );
};

// ── Песня между хитами: три полоски эфира и снижение доли переключений ──
// p: sandwichBeat, values [[label, value]], valuesBeat, caption
export const Playlist: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const sw = ramp(t, at(ctx, N(p.sandwichBeat, 0)) + 0.2, 0.8);
  const vals = (Array.isArray(p.values) ? p.values : []) as [string, number][];
  const vb = at(ctx, N(p.valuesBeat, 1));
  const songs = [S(p.hitA, "знакомый хит"), S(p.song, "новая песня"), S(p.hitB, "знакомый хит")];
  const x0 = Ar.cx - 470;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {songs.map((s, i) => {
        const k = ramp(t, 0.2 + i * 0.3, 0.5);
        const y = 270 + i * 120;
        const slide = i === 1 ? (1 - sw) * 300 : 0;
        return (
          <g key={i} opacity={k} transform={`translate(${slide} 0)`}>
            <rect x={x0} y={y - 46} width={560} height={92} rx={46} fill={i === 1 ? C.craveSoft : C.routineSoft} stroke={OL} strokeWidth={4} />
            <circle cx={x0 + 50} cy={y} r={26} fill={i === 1 ? C.crave : C.routine} />
            <path d={`M ${x0 + 42} ${y - 12} L ${x0 + 62} ${y} L ${x0 + 42} ${y + 12} Z`} fill="#fff" />
            <text x={x0 + 100} y={y + 12} fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.ink}>
              {s}
            </text>
          </g>
        );
      })}
      {/* столбики: доля переключающих */}
      {vals.map(([lab, v], i) => {
        const k = ramp(t, vb + 0.3 + i * 0.5, 0.7);
        const h = (v / 30) * 420 * k;
        const x = Ar.cx + 260 + i * 170;
        return (
          <g key={i} opacity={clamp01(k * 2)}>
            <rect x={x - 55} y={760 - h} width={110} height={h} rx={12} fill={C.cue} stroke={OL} strokeWidth={4} />
            <text x={x} y={740 - h} fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={C.ink} textAnchor="middle">
              {`${String(v).replace(".", ",")}%`}
            </text>
            <text x={x} y={800} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.inkSoft} textAnchor="middle">
              {lab}
            </text>
          </g>
        );
      })}
      {vals.length > 0 && <line x1={Ar.cx + 180} y1={760} x2={Ar.cx + 260 + (vals.length - 1) * 170 + 80} y2={760} stroke={OL} strokeWidth={4} opacity={ramp(t, vb, 0.5)} />}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.3} x={Ar.cx} y={140}>
          <Label x={0} y={0} text={S(p.caption)} size={32} bg={C.rewardSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Сеть связей: центр — человек; толстые линии — близкие друзья (крепкие связи),
// тонкие — знакомые знакомых (слабые связи); волна идёт по сети ──
// p: strongBeat, weakBeat, waveBeat, center, strongLabel, weakLabel
export const Network: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cx = Ar.cx;
  const cy = 520;
  const sb = ramp(t, at(ctx, N(p.strongBeat, 0)) + 0.2, 0.8);
  const wb = ramp(t, at(ctx, N(p.weakBeat, 1)), 1);
  const wave = p.waveBeat !== undefined ? at(ctx, N(p.waveBeat, 2)) : 1e9;
  const inner = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    return { x: cx + Math.cos(a) * 190, y: cy + Math.sin(a) * 150 };
  });
  const outer = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + 0.1;
    const r = 380 + rnd(i, 3) * 70;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.7, parent: i % 6 };
  });
  const lit = (d: number) => (t > wave + d * 0.35 ? 1 : 0);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy} amount={0.03}>
      {outer.map((o, i) => (
        <line key={`w${i}`} x1={inner[o.parent].x} y1={inner[o.parent].y} x2={o.x} y2={o.y} stroke={C.inkSoft} strokeWidth={3} strokeDasharray="6 8" opacity={wb * 0.7} />
      ))}
      {inner.map((n, i) => (
        <line key={`s${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={C.routine} strokeWidth={12} opacity={sb} strokeLinecap="round" />
      ))}
      {outer.map((o, i) => (
        <circle key={`o${i}`} cx={o.x} cy={o.y} r={20 * wb} fill={lit(2 + (i % 4) * 0.4) ? C.reward : C.stoneSoft} stroke={OL} strokeWidth={3} opacity={wb} />
      ))}
      {inner.map((n, i) => (
        <circle key={`i${i}`} cx={n.x} cy={n.y} r={30 * sb} fill={lit(1) ? C.reward : C.routineSoft} stroke={OL} strokeWidth={4} />
      ))}
      <g transform={`translate(${cx} ${cy}) scale(${pop(t, 0.2)})`}>
        <circle r={52} fill={t > wave ? C.cue : C.white} stroke={OL} strokeWidth={5} />
        <text y={12} fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={C.ink} textAnchor="middle">
          {S(p.center, "")}
        </text>
      </g>
      {sb > 0 && S(p.strongLabel) && (
        <Appear t={t} at={at(ctx, N(p.strongBeat, 0)) + 0.6} x={Ar.x0 + 210} y={210}>
          <Label x={0} y={0} text={S(p.strongLabel)} size={32} bg={C.routineSoft} />
        </Appear>
      )}
      {wb > 0 && S(p.weakLabel) && (
        <Appear t={t} at={at(ctx, N(p.weakBeat, 1)) + 0.6} x={Ar.x1 - 210} y={210}>
          <Label x={0} y={0} text={S(p.weakLabel)} size={32} bg={C.stoneSoft} />
        </Appear>
      )}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.3} x={cx} y={125}>
          <Label x={0} y={0} text={S(p.caption)} size={30} bg={C.rewardSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// Автобус 1950-х (условный): корпус, окна, колёса.
const Bus: React.FC<{ x: number; y: number; s?: number; full?: number; t: number }> = ({ x, y, s = 1, full = 0, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-150} width={520} height={190} rx={40} fill="#f2c14e" stroke={OL} strokeWidth={6} />
    <rect x={-260} y={-20} width={520} height={18} fill={C.cue} opacity={0.6} />
    {Array.from({ length: 5 }, (_, i) => (
      <g key={i}>
        <rect x={-230 + i * 92} y={-128} width={74} height={70} rx={12} fill="#dff0fb" stroke={OL} strokeWidth={4} />
        {rnd(i, 9) < full && <circle cx={-193 + i * 92} cy={-80} r={18} fill={C.inkSoft} />}
      </g>
    ))}
    <circle cx={-160} cy={44} r={40} fill={OL} />
    <circle cx={-160} cy={44} r={16} fill={C.stone} transform={`rotate(${t * 200} -160 44)`} />
    <circle cx={160} cy={44} r={40} fill={OL} />
    <circle cx={160} cy={44} r={16} fill={C.stone} />
  </g>
);

// ── Утро бойкота: автобус проезжает пустым; люди идут пешком и подвозят друг друга ──
// p: busBeat, walkBeat, caption
export const Boycott: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const bus = at(ctx, N(p.busBeat, 0));
  const walk = ramp(t, at(ctx, N(p.walkBeat, 1)), 0.8);
  const bx = Ar.x0 - 300 + ((t - bus) * 220) % (Ar.x1 - Ar.x0 + 900);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      <rect x={Ar.x0 - 60} y={570} width={Ar.x1 - Ar.x0 + 120} height={110} fill={C.stoneSoft} />
      <rect x={Ar.x0 - 60} y={618} width={Ar.x1 - Ar.x0 + 120} height={10} fill="#fff" opacity={0.8} />
      {t >= bus && <Bus x={bx} y={560} s={0.9} full={0} t={t} />}
      {walk > 0 &&
        Array.from({ length: 7 }, (_, i) => {
          const x = Ar.x0 + 80 + ((i * 190 + (t - at(ctx, N(p.walkBeat, 1))) * 60) % (Ar.x1 - Ar.x0 - 100));
          return <Figure key={i} x={x} y={820} s={0.34} color={[C.routine, C.sage, C.crave, C.cue][i % 4]} head={["#8a5a3c", "#6b4430", "#a8714f", "#7a4f36"][i % 4]} bob={Math.abs(Math.sin(t * 5 + i)) * -8} k={walk} />;
        })}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 1)) + 0.3} x={Ar.cx} y={200}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={C.white} />
        </Appear>
      )}
      {S(p.caption2) && (
        <Appear t={t} at={at(ctx, N(p.caption2Beat, 2)) + 0.3} x={Ar.cx} y={300}>
          <Label x={0} y={0} text={S(p.caption2)} size={32} bg={C.rewardSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Лист бумаги: сгибается, раскрывается и снова «падает» по той же складке
// (старая привычка); затем на листе появляется новая зелёная складка под другим
// углом, и лист сгибается уже по ней. ──
// p: foldBeat, newBeat, caption
const Sheet: React.FC<{ ang: number; crease: string; tilt: number; k: number }> = ({ ang, crease, tilt, k }) => {
  // ang: угол сгиба правой половины, 0 — лист раскрыт, 170 — почти сложен
  const a = (ang * Math.PI) / 180;
  const w = 260;
  const h = 360;
  const fx = w * Math.cos(a);
  const lift = Math.sin(a) * 70; // перспектива: дальний край приподнят
  const shade = 0.5 + 0.5 * Math.cos(a);
  return (
    <g transform={`rotate(${tilt})`} opacity={k}>
      <rect x={-w + 10} y={-h / 2 + 14} width={w} height={h} rx={8} fill="#24324a" opacity={0.1} />
      <rect x={-w} y={-h / 2} width={w} height={h} fill={C.white} stroke={OL} strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={-w + 40} y1={-h / 2 + 60 + i * 56} x2={-40} y2={-h / 2 + 60 + i * 56} stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" opacity={0.18} />
      ))}
      <path d={`M 0 ${-h / 2} L ${fx} ${-h / 2 - lift} L ${fx} ${h / 2 - lift} L 0 ${h / 2} Z`} fill={shade > 0.4 ? "#ffffff" : "#efe6d4"} stroke={OL} strokeWidth={5} strokeLinejoin="round" opacity={0.6 + 0.4 * Math.abs(Math.cos(a))} />
      <line x1={0} y1={-h / 2 - 16} x2={0} y2={h / 2 + 16} stroke={crease} strokeWidth={8} strokeDasharray="14 10" strokeLinecap="round" />
    </g>
  );
};

export const Paper: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const b0 = at(ctx, N(p.foldBeat, 0)) + 0.3;
  const b1 = at(ctx, N(p.newBeat, 1));
  const isNew = t >= b1;
  // цикл старой складки: сгиб → раскрыть → снова падает по той же линии
  const cyc = t < b0 ? 0 : ((t - b0) % 3.2) / 3.2;
  const oldAng = cyc < 0.4 ? 160 * ramp(cyc, 0, 0.4) : cyc < 0.6 ? 160 : 160 * (1 - ramp(cyc, 0.6, 0.4));
  const newAng = 150 * ramp(t, b1 + 1.2, 1.4);
  const swap = ramp(t, b1, 0.8);
  const cx = Ar.cx;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      <g transform={`translate(${cx} 470)`} opacity={ramp(t, 0.1, 0.5)}>
        {!isNew ? (
          <Sheet ang={oldAng} crease={C.crave} tilt={0} k={1} />
        ) : (
          <>
            <g opacity={1 - swap * 0.75} transform={`translate(${-swap * 330} 0) scale(${1 - swap * 0.35})`}>
              <Sheet ang={60} crease={C.crave} tilt={0} k={1} />
            </g>
            <g transform={`translate(${swap * 260} 0)`}>
              <Sheet ang={newAng} crease={C.green} tilt={-28} k={swap} />
            </g>
          </>
        )}
      </g>
      <Appear t={t} at={b0 + 0.4} x={cx - 330} y={250}>
        <Label x={0} y={0} text="старая складка" size={30} bg={C.craveSoft} />
      </Appear>
      {isNew && (
        <Appear t={t} at={b1 + 0.6} x={cx + 330} y={250}>
          <Label x={0} y={0} text="новая складка" size={30} bg={C.sageSoft} />
        </Appear>
      )}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 1)) + 0.4} x={cx} y={130}>
          <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// Рыбка.
const Fish: React.FC<{ x: number; y: number; s?: number; color: string; t: number; dir?: number }> = ({ x, y, s = 1, color, t, dir = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
    <path d={`M -60 0 Q -20 -40 40 0 Q -20 40 -60 0 Z`} fill={color} stroke={OL} strokeWidth={4} />
    <path d={`M -56 0 L -96 ${-26 + Math.sin(t * 8) * 6} L -96 ${26 + Math.sin(t * 8) * 6} Z`} fill={color} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={18} cy={-6} r={6} fill={OL} />
  </g>
);

// ── Финал: две рыбки, вопрос «что такое вода?»; вода проступает прозрачным слоем петли ──
// p: askBeat, waterBeat, ask, caption
export const Water: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const ask = ramp(t, at(ctx, N(p.askBeat, 0)) + 0.4, 0.6);
  const water = ramp(t, at(ctx, N(p.waterBeat, 1)), 1.4);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.035}>
      <rect x={Ar.x0} y={140} width={Ar.x1 - Ar.x0} height={760} rx={50} fill={C.sky} opacity={0.12 + 0.28 * water} />
      {water > 0 &&
        Array.from({ length: 14 }, (_, i) => {
          const x = Ar.x0 + 80 + rnd(i, 1) * (Ar.x1 - Ar.x0 - 160);
          const y = 860 - (((t * 40 + rnd(i, 2) * 700) % 700) + 1);
          return <circle key={i} cx={x} cy={y} r={6 + rnd(i, 3) * 10} fill="#fff" stroke={C.routine} strokeWidth={2} opacity={water * 0.8} />;
        })}
      <Fish x={Ar.cx - 220 + Math.sin(t * 0.7) * 40} y={480 + wob(t, 1, 10)} s={1.3} color={C.reward} t={t} />
      <Fish x={Ar.cx + 220 + Math.sin(t * 0.6 + 1) * 40} y={540 + wob(t, 2, 10)} s={1.3} color={C.routine} t={t} dir={-1} />
      {ask > 0 && (
        <g opacity={ask}>
          <Label x={Ar.cx} y={300} text={S(p.ask, "Что такое вода?")} size={40} bg={C.white} />
        </g>
      )}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.3} x={Ar.cx} y={820}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={C.rewardSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Протокол BanaMind: четыре карточки-вопроса (цвета петли) с ответами банана ──
// p: items [[вопрос, ответ], …], beats, title
export const Protocol: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const items = (Array.isArray(p.items) ? p.items : []) as [string, string][];
  const beats = (Array.isArray(p.beats) ? p.beats : items.map((_, i) => i)) as number[];
  const cols = [C.cue, C.reward, C.routine, C.crave];
  const w = Math.min(1180, Ar.x1 - Ar.x0 - 60);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.02}>
      {S(p.title) && (
        <Appear t={t} at={0.15} x={Ar.cx} y={140}>
          <Label x={0} y={0} text={S(p.title)} size={42} bg={C.yellow} />
        </Appear>
      )}
      {items.map(([q, a], i) => {
        const b = at(ctx, beats[i] ?? i) + 0.2;
        const k = ramp(t, b, 0.5);
        const ka = ramp(t, b + 1.2, 0.5);
        const y = 270 + i * 165;
        const focus = p.focus === i ? 1 : 0;
        return (
          <g key={i} opacity={k} transform={`translate(${Ar.cx - w / 2 + (1 - k) * 30} ${y})`}>
            <rect x={6} y={-60} width={w} height={130} rx={30} fill="#24324a" opacity={0.1} />
            <rect x={0} y={-66} width={w} height={130} rx={30} fill={C.white} stroke={focus ? cols[i] : OL} strokeWidth={focus ? 8 : 4} />
            <circle cx={70} cy={-2} r={40} fill={cols[i]} stroke={OL} strokeWidth={4} />
            <text x={70} y={14} fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#fff" textAnchor="middle">
              {String(i + 1)}
            </text>
            <text x={135} y={-10} fontFamily={HEAVY} fontWeight={900} fontSize={36} fill={C.ink}>
              {q}
            </text>
            {a && (
              <text x={135} y={38} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.inkSoft} opacity={ka}>
                {a}
              </text>
            )}
            <Check x={w - 70} y={0} s={36} k={ramp(t, b + 1.6, 0.5)} color={cols[i]} />
          </g>
        );
      })}
    </Drift>
  );
};

// ── Бассейн «видеофильма»: дорожка, пловец-точка, очки наполняются водой, но
// движение по привычке доводит до стены ──
// p: swimBeat, blindBeat, caption
export const Pool: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const swim = at(ctx, N(p.swimBeat, 0));
  const blind = ramp(t, at(ctx, N(p.blindBeat, 1)), 1.2);
  const L = Ar.x1 - Ar.x0 - 160;
  const u = clamp01((t - swim) / Math.max(4, dur - swim - 1.5));
  const x = Ar.x0 + 80 + u * L;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <rect x={Ar.x0 + 40} y={380} width={L + 80} height={300} rx={30} fill={C.skySoft} stroke={OL} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={Ar.x0 + 60} y1={440 + i * 60} x2={Ar.x1 - 60} y2={440 + i * 60} stroke={C.routine} strokeWidth={4} strokeDasharray="14 12" opacity={0.6} />
      ))}
      <rect x={Ar.x1 - 60} y={380} width={20} height={300} fill={OL} />
      {/* пловец */}
      <g transform={`translate(${x} 530)`}>
        <ellipse rx={60} ry={22} fill={C.routine} stroke={OL} strokeWidth={4} />
        <circle cx={58} cy={-6} r={22} fill="#f1c9a5" stroke={OL} strokeWidth={4} />
        <rect x={50} y={-16} width={30} height={12} rx={6} fill={blind > 0.5 ? C.sky : C.ink} />
        <path d={`M -10 ${-10 + Math.sin(t * 9) * 16} Q 20 ${-40 + Math.sin(t * 9) * 16} 60 -30`} fill="none" stroke={OL} strokeWidth={8} strokeLinecap="round" />
      </g>
      {/* очки крупно */}
      <g transform={`translate(${Ar.cx} 230)`} opacity={ramp(t, 0.3, 0.5)}>
        {[-90, 90].map((dx, i) => (
          <g key={i} transform={`translate(${dx} 0)`}>
            <ellipse rx={74} ry={52} fill="#fff" stroke={OL} strokeWidth={6} />
            <clipPath id={`gog${i}`}>
              <ellipse rx={70} ry={48} />
            </clipPath>
            <rect x={-74} y={52 - 104 * blind} width={148} height={104} fill={C.sky} opacity={0.75} clipPath={`url(#gog${i})`} />
          </g>
        ))}
        <rect x={-18} y={-8} width={36} height={16} rx={8} fill={OL} />
      </g>
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.3} x={Ar.cx} y={820}>
          <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.rewardSoft} />
        </Appear>
      )}
    </Drift>
  );
};

export { Arrow, Cross };
