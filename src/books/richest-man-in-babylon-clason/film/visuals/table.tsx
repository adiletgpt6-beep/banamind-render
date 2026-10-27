// Стол мастерской — сквозная схема фильма «Десятая монета». Зоны: доход, расходы (или «нужное» и
// «желанное»), собственный запас, долги. Монеты — отдельные, их всегда можно пересчитать; число
// в каждой зоне считает код по фактическим перемещениям (не рисуется вручную). Ходы монет —
// по репликам: { at: номер реплики (+доля), from?, to, n }. Без from — монеты приходят сверху
// (оплата за работу); to "out" — монеты уходят за край стола.
import React from "react";
import { C, FONT, HEAVY, ZONES } from "../theme";
import { at, clamp01, Coin, cxOf, ease, Label, pop, ramp, type VisualProps } from "./kit";

type Zone = "income" | "spend" | "need" | "want" | "keep" | "debt";
type Move = { at: number; from?: Zone; to: Zone; n: number; glow?: boolean };
type P = {
  host?: string;
  split?: boolean;
  start: Partial<Record<Zone, number>>;
  moves: Move[];
  rule?: { at: number; text: string };
  keepNote?: { at: number; text: string };
  shares?: Partial<Record<Zone, string>>;
};

const META: Record<Zone, { label: string; color: string; deep: string; light: string }> = {
  income: ZONES.income,
  spend: ZONES.spend,
  need: { label: "Нужное", color: C.spend, deep: C.spendDeep, light: C.spendLight },
  want: { label: "Желанное", color: C.orange, deep: "#c96f12", light: "#ffe4c7" },
  keep: { label: "Запас", color: ZONES.keep.color, deep: ZONES.keep.deep, light: ZONES.keep.light },
  debt: ZONES.debt,
};

const R = 25; // радиус монеты
const STEP = 0.14; // интервал между монетами одного хода, с
const FLY = 0.62; // перелёт одной монеты, с

export const Table: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const zones: Zone[] = p.split ? ["income", "need", "want", "keep", "debt"] : ["income", "spend", "keep", "debt"];
  const cx = cxOf(p.host) + (p.split ? (p.host === "left" ? 90 : p.host === "right" ? -60 : 0) : 0);
  const trayW = p.split ? 212 : 272;
  const gap = p.split ? 18 : 34;
  const total = zones.length * trayW + (zones.length - 1) * gap;
  const x0 = cx - total / 2;
  const trayY = 440;
  const trayH = 236;
  const cols = p.split ? 4 : 5;
  const zx = (z: Zone) => x0 + zones.indexOf(z) * (trayW + gap);
  const slot = (z: Zone, i: number) => {
    const cw = (trayW - 30) / cols;
    const col = i % cols;
    const row = Math.floor(i / cols);
    return { x: zx(z) + 15 + cw * (col + 0.5), y: trayY + trayH - 44 - row * 54 };
  };

  // ── симуляция: у каждой монеты — список (время, зона, слот) ──
  type Key = { t: number; z: Zone | "sky"; i: number };
  const coins: { keys: Key[]; glow?: number }[] = [];
  const inZone: Record<string, number[]> = {};
  zones.forEach((z) => (inZone[z] = []));
  for (const z of zones) for (let i = 0; i < (p.start[z] ?? 0); i++) {
    inZone[z].push(coins.length);
    coins.push({ keys: [{ t: -10, z, i }] });
  }
  for (const m of p.moves) {
    const t0 = at(ctx, m.at);
    for (let j = 0; j < m.n; j++) {
      const tj = t0 + j * STEP;
      let id: number;
      if (m.from) {
        id = inZone[m.from].pop()!;
        if (id === undefined) continue;
      } else {
        id = coins.length;
        coins.push({ keys: [{ t: -10, z: "sky", i: j }] });
      }
      inZone[m.to].push(id);
      coins[id].keys.push({ t: tj, z: m.to, i: inZone[m.to].length - 1 });
      if (m.glow) coins[id].glow = tj + FLY;
    }
  }
  const counts: Record<string, number> = {};
  zones.forEach((z) => (counts[z] = 0));
  const coinEls: React.ReactNode[] = [];
  coins.forEach((cn, id) => {
    let k = 0;
    while (k + 1 < cn.keys.length && cn.keys[k + 1].t <= t) k++;
    const cur = cn.keys[k];
    const next = cn.keys[k + 1];
    const posOf = (key: Key, idx: number) => (key.z === "sky" ? { x: zx("income") + 40 + idx * 18, y: 120 } : slot(key.z, key.i));
    let { x, y } = posOf(cur, id % 10);
    let op = cur.z === "sky" ? 0 : 1;
    // в полёте (отправилась к следующей зоне)
    const fl = cur.t > -10 && k > 0 ? clamp01((t - cur.t) / FLY) : 1;
    if (k > 0 && fl < 1) {
      const prev = cn.keys[k - 1];
      const a = posOf(prev, id % 10);
      const e = ease(fl);
      const lift = Math.sin(fl * Math.PI) * (prev.z === "sky" ? 20 : 110);
      x = a.x + (x - a.x) * e;
      y = a.y + (y - a.y) * e - lift;
      op = prev.z === "sky" ? clamp01(fl * 3) : 1;
    }
    if (cur.z !== "sky" && fl >= 0.98) counts[cur.z]++;
    const glow = cn.glow && t > cn.glow ? 0.6 + 0.4 * Math.sin((t - cn.glow) * 3) : 0;
    if (op > 0) coinEls.push(<Coin key={id} x={x} y={y} r={R} op={op} glow={glow} />);
    void next;
  });

  const inK = ramp(t, 0, 0.6);
  return (
    <g>
      {/* столешница */}
      <g opacity={inK} transform={`translate(0 ${(1 - inK) * 30})`}>
        <path d={`M ${x0 - 40} ${trayY - 50} L ${x0 + total + 40} ${trayY - 50} L ${x0 + total + 70} ${trayY + trayH + 50} L ${x0 - 70} ${trayY + trayH + 50} Z`} fill={C.wood} />
        <path d={`M ${x0 - 70} ${trayY + trayH + 50} L ${x0 + total + 70} ${trayY + trayH + 50} L ${x0 + total + 70} ${trayY + trayH + 78} L ${x0 - 70} ${trayY + trayH + 78} Z`} fill={C.woodDeep} />
        {[0.25, 0.55, 0.8].map((f, i) => (
          <line key={i} x1={x0 - 50 + 20 * f} y1={trayY - 50 + (trayH + 100) * f} x2={x0 + total + 50 + 30 * f} y2={trayY - 50 + (trayH + 100) * f} stroke={C.woodDeep} strokeOpacity={0.18} strokeWidth={4} />
        ))}
        {zones.map((z, i) => {
          const m = META[z];
          const k = pop(t, 0.15 + i * 0.12);
          const xz = zx(z);
          return (
            <g key={z} opacity={clamp01(k * 1.5)}>
              <rect x={xz} y={trayY} width={trayW} height={trayH} rx={26} fill={m.light} stroke={m.color} strokeWidth={7} />
              <rect x={xz + trayW / 2 - Math.min(trayW - 8, m.label.length * 19 + 40) / 2} y={trayY - 40} width={Math.min(trayW - 8, m.label.length * 19 + 40)} height={60} rx={30} fill={m.color} />
              <text x={xz + trayW / 2} y={trayY + 3} fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.white} textAnchor="middle">
                {m.label}
              </text>
              {/* число монет — считает код */}
              <circle cx={xz + trayW / 2} cy={trayY + trayH + 26} r={30} fill={C.white} stroke={m.deep} strokeWidth={5} />
              <text x={xz + trayW / 2} y={trayY + trayH + 39} fontFamily={HEAVY} fontWeight={800} fontSize={36} fill={m.deep} textAnchor="middle">
                {counts[z]}
              </text>
              {p.shares?.[z] && (
                <text x={xz + trayW / 2} y={trayY - 62} fontFamily={HEAVY} fontWeight={800} fontSize={40} fill={m.deep} textAnchor="middle" opacity={ramp(t, at(ctx, z === "keep" ? 0.2 : z === "debt" ? 2.1 : 1.05), 0.5)}>
                  {p.shares[z]}
                </text>
              )}
            </g>
          );
        })}
      </g>
      {coinEls}
      {p.keepNote && (
        <Label x={zx("keep") + trayW / 2} y={trayY + trayH / 2 + 12} text={p.keepNote.text} k={pop(t, at(ctx, p.keepNote.at))} color={C.keepDeep} size={34} />
      )}
      {p.rule && <Label x={cx} y={p.shares ? 250 : 300} text={p.rule.text} k={pop(t, at(ctx, p.rule.at))} color={C.ink} bg={C.goldLight} size={46} />}
    </g>
  );
};
