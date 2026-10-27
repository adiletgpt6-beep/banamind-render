// Сцены Лаборатории развилок истории BM-027 (часть 1): два условных мира,
// лабораторный стол с линзами-переменными, «луковица» причин, Кахамарка как
// верхушка причин, цепь причин, излишки еды и специалисты. Все карты и
// ландшафты — условные схемы фильма, не реконструкции и не иллюстрации издания.
import React from "react";
import { C, FONT, HEAVY } from "../theme";
import { Appear, area, Arrow, at, clamp01, Cross, Drift, Panel, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { Animal, City, Germ, Granary, House, Icon, Lens, Musket, OL, Person, Plant, Wheat, Ingot, Horse, Ship, Scroll, Crown } from "./icons";
import { Label } from "./props";
import { rnd } from "./particles";

type P = { mode?: string; host?: string; [k: string]: unknown };
const S = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const A = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const N = (v: unknown, d: number) => (typeof v === "number" ? v : d);

// ── Условный участок суши: скруглённая «плитка-пазл» с травой, рекой или берегом ──
export const Tile: React.FC<{ x: number; y: number; w: number; h: number; kind: "fertile" | "island" | "dry" | "plain"; k: number; t: number }> = ({ x, y, w, h, kind, k, t }) => {
  if (k <= 0) return null;
  const land = kind === "fertile" ? C.sageSoft : kind === "dry" ? C.earthSoft : kind === "island" ? "#cfe3bd" : C.earthSoft;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 40})`} opacity={clamp01(k * 1.5)}>
      {kind === "island" && <rect x={-w / 2 - 30} y={-h / 2 - 20} width={w + 60} height={h + 40} rx={50} fill={C.skySoft} stroke={OL} strokeWidth={3} strokeOpacity={0.4} />}
      {kind === "island" &&
        [0, 1, 2].map((i) => (
          <path key={i} d={`M ${-w / 2 - 10 + i * 30} ${h / 2 + 4 + Math.sin(t * 1.5 + i) * 3} q 12 -8 24 0 q 12 8 24 0`} stroke={C.sky} strokeWidth={4} fill="none" strokeLinecap="round" />
        ))}
      <path
        d={
          kind === "island"
            ? `M ${-w * 0.38} ${-h * 0.32} Q 0 ${-h * 0.5} ${w * 0.4} ${-h * 0.28} Q ${w * 0.46} ${h * 0.2} ${w * 0.2} ${h * 0.4} Q ${-w * 0.2} ${h * 0.5} ${-w * 0.42} ${h * 0.2} Z`
            : `M ${-w / 2} ${-h / 2 + 30} Q ${-w / 2} ${-h / 2} ${-w / 2 + 30} ${-h / 2} L ${-w * 0.08} ${-h / 2} q 14 -22 30 0 L ${w / 2 - 30} ${-h / 2} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 30} L ${w / 2} ${h / 2 - 30} Q ${w / 2} ${h / 2} ${w / 2 - 30} ${h / 2} L ${-w / 2 + 30} ${h / 2} Q ${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - 30} Z`
        }
        fill={land}
        stroke={OL}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {kind === "fertile" && <path d={`M ${-w / 2 + 20} ${h * 0.18} Q ${-w * 0.1} ${h * 0.02} ${w * 0.05} ${h * 0.2} T ${w / 2 - 20} ${h * 0.12}`} stroke={C.sky} strokeWidth={14} fill="none" strokeLinecap="round" />}
      {kind === "dry" &&
        [0, 1, 2, 3].map((i) => <circle key={i} cx={(rnd(i, 3) - 0.5) * w * 0.7} cy={(rnd(i, 4) - 0.5) * h * 0.6} r={6} fill={C.earth} opacity={0.6} />)}
    </g>
  );
};

// ── Холодный старт: два одинаково умных человека в разных условиях ──
// beats: 0 — два участка и люди; 1 — левый: колосья и животные; 2 — время идёт,
// слева появляются амбар, город, сталь, микроб; 3 — вопрос. p.leftTag / p.rightTag.
export const TwoWorlds: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const span = Math.min(560, (Ar.x1 - Ar.x0) / 2 - 40);
  const lx = Ar.cx - span / 2 - 20;
  const rx = Ar.cx + span / 2 + 20;
  const b1 = at(ctx, N(p.richBeat, 1));
  const b2 = at(ctx, N(p.timeBeat, 2));
  const b3 = at(ctx, N(p.qBeat, 3));
  const later = ["granary", "city", "steel", "germ"];
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Tile x={lx} y={560} w={span} h={420} kind="fertile" k={ramp(t, 0.2, 0.7)} t={t} />
      <Tile x={rx} y={560} w={span} h={420} kind="island" k={ramp(t, 0.5, 0.7)} t={t} />
      {/* одинаковые люди с одинаковым «огоньком» мысли */}
      {[lx, rx].map((x, i) => (
        <g key={i}>
          <Person x={x} y={640} s={1.7} k={ramp(t, 0.8 + i * 0.3, 0.5)} color={C.teal} />
          <Appear t={t} at={1.2 + i * 0.3} x={x} y={530}>
            <circle r={20} fill={C.yellow} stroke={OL} strokeWidth={3.5} opacity={0.85 + 0.15 * Math.sin(t * 3 + i)} />
          </Appear>
        </g>
      ))}
      <g opacity={1 - ramp(t, b3, 0.5)}>
        <Appear t={t} at={1.6} x={Ar.cx} y={160}>
          <Label x={0} y={0} text={S(p.same, "одинаковая смекалка")} size={36} bg={C.yellow} />
        </Appear>
      </g>
      {/* слева — колосья и животные, справа — лес и океан */}
      {[0, 1, 2].map((i) => (
        <Wheat key={i} x={lx - span * 0.32 + i * 46} y={470} s={0.55} k={ramp(t, b1 + i * 0.2, 0.5)} />
      ))}
      <Animal x={lx + span * 0.28} y={500} s={0.6} k={ramp(t, b1 + 0.7, 0.5)} />
      {[0, 1].map((i) => (
        <Plant key={i} x={rx - 90 + i * 180} y={500} s={0.6} big={0} fruit={C.sage} k={ramp(t, b1 + 0.4 + i * 0.2, 0.5)} />
      ))}
      <Appear t={t} at={b1 + 0.6} x={lx} y={830}>
        <Label x={0} y={0} text={S(p.leftTag, "легко выращивать и приручать")} size={28} bg={C.sageSoft} />
      </Appear>
      <Appear t={t} at={b1 + 1} x={rx} y={830}>
        <Label x={0} y={0} text={S(p.rightTag, "другая природная среда")} size={28} bg={C.skySoft} />
      </Appear>
      {/* время: стрелка «тысячелетия», слева вырастают последствия */}
      {ramp(t, b2, 0.8) > 0 && (
        <g>
          <Arrow x1={Ar.cx - span * 0.6} y1={290} x2={Ar.cx + span * 0.6} y2={290} k={ramp(t, b2, 1.2)} color={C.inkSoft} w={8} />
          <Appear t={t} at={b2 + 0.3} x={Ar.cx} y={258}>
            <Txt x={0} y={0} size={30} color={C.inkSoft} weight={800}>
              {S(p.time, "тысячелетия")}
            </Txt>
          </Appear>
        </g>
      )}
      {later.map((n, i) => (
        <Icon key={n} name={n} x={lx - span * 0.36 + i * (span * 0.24)} y={410} s={0.55} k={ramp(t, b2 + 0.8 + i * 0.45, 0.5)} t={t} />
      ))}
      <Appear t={t} at={b3} x={rx} y={410}>
        <g transform={`scale(${1 + 0.03 * Math.sin(t * 2)})`}>
          <circle r={56} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <text y={22} fontFamily={HEAVY} fontWeight={900} fontSize={64} fill={C.ink} textAnchor="middle">
            ?
          </text>
        </g>
      </Appear>
      {S(p.caption) && (
        <Appear t={t} at={b3 + 0.6} x={Ar.cx} y={160}>
          <Label x={0} y={0} text={S(p.caption)} size={38} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Лаборатория: стол и стеклянные линзы-переменные ──
// mode: intro (линзы появляются по одной), focus (выделена p.focus), chain (линзы
// соединяются стрелками по порядку), fade (часть линз тускнеет — p.keep индексы).
export const LENSES = ["климат", "растения", "животные", "запасы еды", "население", "контакты", "микробы", "власть", "технологии"];
const LENS_COL = [C.sky, C.sage, C.earth, C.amber, C.teal, C.tealDeep, C.coral, C.plum, C.steel];
export const Lab: React.FC<VisualProps<P & { focus?: number; keep?: number[]; items?: string[] }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = p.mode ?? "intro";
  const items = A(p.items).length ? A(p.items) : LENSES;
  const n = items.length;
  const w = Ar.x1 - Ar.x0 - 80;
  const cols = n > 5 ? Math.ceil(n / 2) : n;
  const cell = Math.min(230, w / cols);
  const pos = (i: number) => {
    const row = n > 5 ? (i < cols ? 0 : 1) : 0;
    const ci = row === 0 ? i : i - cols;
    const inRow = row === 0 ? cols : n - cols;
    return { x: Ar.cx + (ci - (inRow - 1) / 2) * cell, y: (n > 5 ? 330 : 470) + row * 260 };
  };
  const b1 = at(ctx, 1);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {/* лабораторный стол */}
      <Appear t={t} at={0.05} x={Ar.cx} y={760}>
        <rect x={-w / 2 - 20} y={0} width={w + 40} height={30} rx={12} fill="#9fb4bf" stroke={OL} strokeWidth={4} />
      </Appear>
      {mode === "chain" &&
        items.slice(0, -1).map((_, i) => {
          const a = pos(i);
          const b = pos(i + 1);
          const k = ramp(t, b1 + i * 0.45, 0.6);
          return <Arrow key={i} x1={a.x + (b.y === a.y ? 75 : 0)} y1={a.y + (b.y === a.y ? 0 : 80)} x2={b.x - (b.y === a.y ? 75 : -20)} y2={b.y - (b.y === a.y ? 0 : 80)} k={k} color={C.tealDeep} w={7} bend={b.y === a.y ? 0 : 0.15} />;
        })}
      {items.map((name, i) => {
        const { x, y } = pos(i);
        const appear = mode === "intro" ? ramp(t, 0.4 + i * 0.32, 0.5) : ramp(t, 0.1 + i * 0.05, 0.4);
        const focus = mode === "focus" ? p.focus === i : mode === "fade" ? (p.keep ?? []).includes(i) : true;
        const glow = mode === "focus" && focus ? 0.6 + 0.4 * Math.sin(t * 2.4) : mode === "chain" ? ramp(t, b1 + i * 0.45, 0.6) : 0;
        const dim = mode === "fade" ? (focus ? 1 : 1 - 0.65 * ramp(t, b1, 0.8)) : focus ? 1 : 0.35;
        return (
          <g key={name} opacity={dim} transform={`translate(0 ${wob(t, i, 3)})`}>
            <Lens x={x} y={y} r={66} k={appear} glow={glow} color={LENS_COL[i % LENS_COL.length]} label={name} />
          </g>
        );
      })}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 1)) + 0.3} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.caption)} size={40} bg={C.yellow} />
        </Appear>
      )}
      {S(p.note) && (
        <Appear t={t} at={at(ctx, N(p.noteBeat, 2))} x={Ar.cx} y={830}>
          <Label x={0} y={0} text={S(p.note)} size={30} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── «Луковица»: внешние слои — непосредственные причины, сердцевина — конечные ──
// p.layers — от внешнего к внутреннему; p.beats — реплика раскрытия каждого слоя.
export const Onion: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const layers = A(p.layers);
  const beats = (Array.isArray(p.beats) ? p.beats : layers.map((_, i) => i)) as number[];
  const n = layers.length;
  const cx = Ar.cx - 160;
  const cols = [C.coralSoft, C.amberSoft, C.sageSoft, C.tealSoft, C.skySoft];
  const strokes = [C.coral, C.amber, C.sage, C.teal, C.sky];
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {layers.map((l, i) => {
        const r = 330 - i * (240 / Math.max(1, n - 1));
        const k = ramp(t, 0.2 + i * 0.25, 0.6);
        const peel = i < n - 1 ? ramp(t, at(ctx, beats[i + 1] ?? 99) - 0.2, 0.9) : 0;
        return (
          <g key={i} opacity={k * (1 - peel * 0.55)} transform={`translate(${cx - peel * 40 * (n - i)} ${540}) scale(${1 + peel * 0.04})`}>
            <path d={`M 0 ${-r} C ${r * 0.9} ${-r * 0.9} ${r * 1.05} ${r * 0.6} 0 ${r} C ${-r * 1.05} ${r * 0.6} ${-r * 0.9} ${-r * 0.9} 0 ${-r} Z`} fill={cols[i % cols.length]} stroke={strokes[i % strokes.length]} strokeWidth={8} />
            {i === 0 && <path d={`M 0 ${-r} Q -12 ${-r - 60} 10 ${-r - 90}`} stroke={C.sage} strokeWidth={12} fill="none" strokeLinecap="round" />}
          </g>
        );
      })}
      {layers.map((l, i) => {
        const a = at(ctx, beats[i] ?? i) + 0.2;
        const y = 300 + i * (440 / Math.max(1, n - 1));
        return (
          <g key={`l${i}`}>
            <Appear t={t} at={a} x={cx + 470} y={y}>
              <Label x={0} y={0} text={l} size={34} bg={i === n - 1 ? C.yellow : C.white} />
            </Appear>
            <Arrow x1={cx + 280} y1={y} x2={cx + (i === n - 1 ? 40 : 300 - i * (240 / Math.max(1, n - 1)) * 0.6)} y2={540 + (y - 540) * 0.3} k={ramp(t, a + 0.3, 0.5)} color={C.inkSoft} w={5} />
          </g>
        );
      })}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, n))} x={cx + 470} y={150}>
          <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Кахамарка: маленький отряд и огромное войско; вокруг отряда — значки причин ──
// p.left / p.right — подписи численности (как в книге); p.causes [[icon, label, beat]];
// p.germBeat — микроб на стороне империи (эпидемия пришла раньше).
export const Cajamarca: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const lx = Ar.x0 + 280;
  const rx = Ar.x1 - 380;
  const causes = (Array.isArray(p.causes) ? p.causes : []) as [string, string, number][];
  const field = Array.from({ length: 220 }, (_, i) => ({ x: (rnd(i, 1) - 0.5) * 520, y: (rnd(i, 2) - 0.5) * 420 }));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {/* маленький отряд */}
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={lx + ((i % 4) - 1.5) * 26} cy={680 + Math.floor(i / 4) * 26} r={10} fill={C.steel} stroke={OL} strokeWidth={2.5} opacity={ramp(t, 0.3 + i * 0.03, 0.4)} />
      ))}
      <Appear t={t} at={0.6} x={lx} y={600}>
        <Label x={0} y={0} text={S(p.left)} size={32} bg={C.steelSoft} />
      </Appear>
      {/* огромное войско — поле точек */}
      {field.map((d, i) => (
        <circle key={i} cx={rx + d.x} cy={560 + d.y * 0.8} r={7} fill={C.amber} stroke={OL} strokeWidth={1.5} strokeOpacity={0.5} opacity={ramp(t, 0.9 + rnd(i, 3) * 1.2, 0.4)} />
      ))}
      <Appear t={t} at={1.6} x={rx} y={330}>
        <Label x={0} y={0} text={S(p.right)} size={32} bg={C.amberSoft} />
      </Appear>
      {/* причины вокруг отряда */}
      {causes.map(([icon, label, beat], i) => {
        const a = at(ctx, beat) + (i % 3) * 0.35;
        const x = lx + ((i % 3) - 1) * 190;
        const y = 230 + Math.floor(i / 3) * 170;
        return (
          <g key={i}>
            <Icon name={icon} x={x} y={y - 20} s={0.55} k={ramp(t, a, 0.5)} t={t} />
            <Appear t={t} at={a + 0.2} x={x} y={y + 40}>
              <Txt x={0} y={0} size={26} weight={900}>
                {label}
              </Txt>
            </Appear>
          </g>
        );
      })}
      {p.germBeat !== undefined && (
        <g>
          <Germ x={rx + 200} y={200} s={0.6} k={ramp(t, at(ctx, N(p.germBeat, 2)), 0.5)} t={t} />
          <Appear t={t} at={at(ctx, N(p.germBeat, 2)) + 0.4} x={rx} y={830}>
            <Label x={0} y={0} text={S(p.germLabel, "эпидемия — раньше отряда")} size={26} bg={C.coralSoft} />
          </Appear>
        </g>
      )}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2))} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.caption)} size={36} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Цепь причин (граф): узлы по сетке, стрелки «сильная» / «спорная» ──
// p.nodes [[id, label, col, row, beat, color?]], p.edges [[from, to, "strong"|"weak"|"no", beat]]
// col/row — доли области (0…1). Спорные стрелки — пунктир сливового цвета со знаком «?».
const NODE_COL: Record<string, [string, string]> = {
  geo: [C.skySoft, C.sky],
  food: [C.amberSoft, C.amber],
  people: [C.tealSoft, C.teal],
  power: [C.plumSoft, C.plum],
  tech: [C.steelSoft, C.steel],
  germ: [C.coralSoft, C.coral],
  plant: [C.sageSoft, C.sage],
  white: [C.white, C.inkSoft],
};
export const Chain: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const nodes = (Array.isArray(p.nodes) ? p.nodes : []) as [string, string, number, number, number, string?][];
  const edges = (Array.isArray(p.edges) ? p.edges : []) as [string, string, string, number][];
  const top = N(p.top, 230);
  const bottom = N(p.bottom, 800);
  const pos = new Map(nodes.map(([id, , c, r]) => [id, { x: Ar.x0 + 120 + c * (Ar.x1 - Ar.x0 - 240), y: top + r * (bottom - top) }]));
  const size = N(p.size, 32);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      {edges.map(([a, b, kind, beat], i) => {
        const pa = pos.get(a);
        const pb = pos.get(b);
        if (!pa || !pb) return null;
        const k = ramp(t, at(ctx, beat), 0.7);
        const dx = pb.x - pa.x;
        const dy = pb.y - pa.y;
        const L = Math.hypot(dx, dy) || 1;
        const off = 80;
        const x1 = pa.x + (dx / L) * off;
        const y1 = pa.y + (dy / L) * (off * 0.6);
        const x2 = pb.x - (dx / L) * off;
        const y2 = pb.y - (dy / L) * (off * 0.6);
        const col = kind === "strong" ? C.tealDeep : kind === "weak" ? C.plum : C.red;
        return (
          <g key={i} opacity={kind === "weak" ? 0.95 : 1}>
            {kind === "weak" ? (
              <g>
                <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k} stroke={col} strokeWidth={7} strokeDasharray="16 14" strokeLinecap="round" />
                {k > 0.9 && (
                  <g transform={`translate(${(x1 + x2) / 2} ${(y1 + y2) / 2})`}>
                    <circle r={22} fill={C.plumSoft} stroke={col} strokeWidth={4} />
                    <text y={10} fontFamily={HEAVY} fontWeight={900} fontSize={28} fill={col} textAnchor="middle">
                      ?
                    </text>
                  </g>
                )}
              </g>
            ) : (
              <Arrow x1={x1} y1={y1} x2={x2} y2={y2} k={k} color={col} w={kind === "strong" ? 9 : 7} />
            )}
            {kind === "no" && k > 0.9 && <Cross x={(x1 + x2) / 2} y={(y1 + y2) / 2} s={60} k={ramp(t, at(ctx, beat) + 0.6, 0.5)} />}
          </g>
        );
      })}
      {nodes.map(([id, label, , , beat, col]) => {
        const ps = pos.get(id)!;
        const [bg, st] = NODE_COL[col ?? "white"] ?? NODE_COL.white;
        const k = pop(t, at(ctx, beat));
        if (k <= 0.01) return null;
        const lines = label.split("\n");
        const w = Math.max(...lines.map((l) => l.length)) * size * 0.56 + size * 1.4;
        const h = lines.length * size * 1.2 + size * 0.9;
        return (
          <g key={id} transform={`translate(${ps.x} ${ps.y}) scale(${k})`}>
            <rect x={-w / 2 + 5} y={-h / 2 + 8} width={w} height={h} rx={22} fill="#24324a" opacity={0.1} />
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={22} fill={bg} stroke={st} strokeWidth={5} />
            <text fontFamily={FONT} fontWeight={900} fontSize={size} fill={C.ink} textAnchor="middle">
              {lines.map((l, j) => (
                <tspan key={j} x={0} y={(j - (lines.length - 1) / 2) * size * 1.2 + size * 0.36}>
                  {l}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
      {S(p.title) && (
        <Appear t={t} at={0.15} x={Ar.cx} y={140}>
          <Label x={0} y={0} text={S(p.title)} size={38} bg={C.yellow} />
        </Appear>
      )}
      {p.legend === true && (
        <Appear t={t} at={at(ctx, N(p.legendBeat, 1))} x={Ar.cx} y={215}>
          <g>
            <line x1={-420} y1={0} x2={-340} y2={0} stroke={C.tealDeep} strokeWidth={9} strokeLinecap="round" />
            <Txt x={-325} y={10} size={28} anchor="start" weight={800}>
              сильная связь в книге
            </Txt>
            <line x1={40} y1={0} x2={120} y2={0} stroke={C.plum} strokeWidth={7} strokeDasharray="16 14" strokeLinecap="round" />
            <Txt x={135} y={10} size={28} anchor="start" weight={800}>
              спорно / не всегда
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Излишки: охотники-собиратели и земледельцы на одинаковой площади ──
// p.left/p.right — подписи; p.leftN/p.rightN — число людей-значков (условная пропорция);
// p.specialists — ярлыки «кормящихся не от земли» (вожди, писцы, ремесленники…).
export const Surplus: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const span = Math.min(560, (Ar.x1 - Ar.x0) / 2 - 40);
  const lx = Ar.cx - span / 2 - 20;
  const rx = Ar.cx + span / 2 + 20;
  const ln = N(p.leftN, 4);
  const rn = N(p.rightN, 24);
  const b1 = at(ctx, N(p.rightBeat, 1));
  const b2 = at(ctx, N(p.specBeat, 2));
  const spec = A(p.specialists);
  const crowd = (n: number, seed: number) => Array.from({ length: n }, (_, i) => ({ x: (rnd(i, seed) - 0.5) * span * 0.75, y: (rnd(i, seed + 1) - 0.5) * 200 }));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <Tile x={lx} y={540} w={span} h={380} kind="plain" k={ramp(t, 0.2, 0.6)} t={t} />
      <Tile x={rx} y={540} w={span} h={380} kind="fertile" k={ramp(t, b1, 0.6)} t={t} />
      {[0, 1, 2].map((i) => (
        <Plant key={i} x={lx - 160 + i * 150} y={440 + (i % 2) * 40} s={0.45} big={0} fruit={C.sage} k={ramp(t, 0.5 + i * 0.2, 0.5)} />
      ))}
      {crowd(ln, 3).map((d, i) => (
        <Person key={i} x={lx + d.x} y={580 + d.y * 0.6} s={0.75} k={ramp(t, 0.8 + i * 0.2, 0.4)} color={C.teal} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <Wheat key={i} x={rx - span * 0.36 + i * span * 0.18} y={420} s={0.45} k={ramp(t, b1 + 0.2 + i * 0.12, 0.4)} />
      ))}
      {crowd(rn, 7).map((d, i) => (
        <Person key={i} x={rx + d.x} y={600 + d.y * 0.6} s={0.6} k={ramp(t, b1 + 0.5 + i * 0.05, 0.4)} color={C.amber} />
      ))}
      <Appear t={t} at={0.6} x={lx} y={800}>
        <Label x={0} y={0} text={S(p.left, "охотники-собиратели")} size={30} bg={C.white} />
      </Appear>
      <Appear t={t} at={b1 + 0.3} x={rx} y={800}>
        <Label x={0} y={0} text={S(p.right, "земледельцы")} size={30} bg={C.amberSoft} />
      </Appear>
      {/* амбар и специалисты над полем земледельцев */}
      <Granary x={rx + span * 0.38} y={300} s={0.7} k={ramp(t, b2, 0.5)} />
      {spec.map((s, i) => (
        <Appear key={i} t={t} at={b2 + 0.5 + i * 0.4} x={rx - span * 0.3 + (i % 2) * span * 0.42} y={230 + Math.floor(i / 2) * 70}>
          <Label x={0} y={0} text={s} size={28} bg={[C.plumSoft, C.steelSoft, C.tealSoft, C.coralSoft][i % 4]} />
        </Appear>
      ))}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2)) + 1.2} x={Ar.cx} y={130}>
          <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Набор значков с подписями в ряд (символы, причины, этапы) ──
// p.items [[icon, label, beat]]; p.title; p.strike — индексы зачёркнутых.
export const Icons: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const items = (Array.isArray(p.items) ? p.items : []) as [string, string, number][];
  const n = items.length;
  const w = Ar.x1 - Ar.x0 - 80;
  const cell = Math.min(n <= 3 ? 540 : 320, w / Math.max(1, n));
  const strike = (Array.isArray(p.strike) ? p.strike : []) as number[];
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {S(p.title) && (
        <Appear t={t} at={0.15} x={Ar.cx} y={170}>
          <Label x={0} y={0} text={S(p.title)} size={40} bg={C.yellow} />
        </Appear>
      )}
      {items.map(([icon, label, beat], i) => {
        const x = Ar.cx + (i - (n - 1) / 2) * cell;
        const a = at(ctx, beat) + 0.15;
        return (
          <g key={i}>
            <Appear t={t} at={a} x={x} y={500}>
              <circle r={100} fill={C.white} stroke={OL} strokeWidth={4} />
              <circle r={100} fill={C.tealSoft} opacity={0.35} />
            </Appear>
            <Icon name={icon} x={x} y={495} s={1} k={ramp(t, a + 0.15, 0.5)} t={t} />
            <Appear t={t} at={a + 0.3} x={x} y={680}>
              <Label x={0} y={0} text={label} size={32} bg={C.white} />
            </Appear>
            {strike.includes(i) && <Cross x={x} y={500} s={150} k={ramp(t, at(ctx, N(p.strikeBeat, 1)), 0.5)} />}
          </g>
        );
      })}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 1))} x={Ar.cx} y={820}>
          <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.amberSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Вопрос Яли: берег, ящики «карго», лодка с грузом, вопрос в облачке ──
export const Yali: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cx = Ar.cx;
  const b1 = at(ctx, N(p.qBeat, 1));
  const crates = A(p.crates).length ? A(p.crates) : ["топоры", "ткани", "лекарства", "спички"];
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {/* море и берег */}
      <Appear t={t} at={0.1} x={0} y={0} dy={0}>
        <rect x={Ar.x0} y={700} width={Ar.x1 - Ar.x0} height={260} rx={40} fill={C.skySoft} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${Ar.x0 + 60 + i * 230} ${780 + Math.sin(t * 1.4 + i) * 5} q 25 -12 50 0 q 25 12 50 0`} stroke={C.sky} strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        <path d={`M ${Ar.x0} 720 Q ${cx} 640 ${Ar.x1} 700 L ${Ar.x1} 560 L ${Ar.x0} 560 Z`} fill="#e9d9b0" stroke={OL} strokeWidth={4} />
      </Appear>
      <Ship x={cx + 260 + Math.sin(t * 0.6) * 10} y={800} s={1.1} k={ramp(t, 0.4, 0.6)} />
      {crates.map((c, i) => {
        const x = cx - 360 + i * 170;
        const k = ramp(t, 0.8 + i * 0.3, 0.5);
        return (
          <g key={i} opacity={k} transform={`translate(${x} ${620 - (1 - k) * 60})`}>
            <rect x={-62} y={-50} width={124} height={92} rx={8} fill="#d8a96a" stroke={OL} strokeWidth={4} />
            <path d="M -62 -50 L 62 42 M 62 -50 L -62 42" stroke={OL} strokeWidth={3} opacity={0.3} />
            <rect x={-56} y={-90} width={112} height={36} rx={18} fill={C.white} stroke={OL} strokeWidth={3} />
            <text y={-64} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.ink} textAnchor="middle">
              {c}
            </text>
          </g>
        );
      })}
      <Appear t={t} at={b1} x={cx - 40} y={300}>
        <Panel x={-520} y={-110} w={1040} h={A(p.question).length * 64 + 90} fill={C.white} r={44} />
        <path d="M -40 -110 L 0 -170 L 30 -110 Z" fill={C.white} />
        {A(p.question).map((l, i) => (
          <Txt key={i} x={0} y={-40 + i * 64} size={46} weight={900} color={C.tealDeep}>
            {l}
          </Txt>
        ))}
      </Appear>
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.capBeat, 2))} x={cx} y={130}>
          <Label x={0} y={0} text={S(p.caption)} size={30} bg={C.amberSoft} />
        </Appear>
      )}
    </Drift>
  );
};

export { Animal, City, Crown, Horse, House, Ingot, Musket, Scroll, Ship };
