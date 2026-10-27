// Вступление, карта города, граница тома, временные линии и финал.
import React from "react";
import { BRAND } from "../../../../banamind/brand";
import { C, FONT } from "../theme";
import { boat, digits, drain, house, TOWN_BLOCKS, town, townWindows, water } from "./shapes";
import { clamp01, Dots, easeInOut, fillRect, join, line, memo, move, rect, rnd, type Shape, type VisualProps } from "./dots";
import { BH, Box, BW, Headline, kAt, Label, Node, Thread, beat } from "./kit";
import { eye } from "./shapes";

// ── капли дождя: детерминированное падение (движутся, но не «шумят» на формах)
const Rain: React.FC<{ t: number; n?: number; w?: number; h?: number; o?: number }> = ({ t, n = 90, w = 1920, h = 1080, o = 0.5 }) => (
  <g opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const x = rnd(i, 5) * w;
      const sp = 380 + rnd(i, 6) * 260;
      const y = ((rnd(i, 7) * h + t * sp) % (h + 60)) - 30;
      return (
        <g key={i}>
          <circle cx={x - y * 0.06} cy={y} r={2.4} fill={C.mist} />
          <circle cx={x - (y - 12) * 0.06} cy={y - 12} r={1.8} fill={C.mist} opacity={0.6} />
        </g>
      );
    })}
  </g>
);

// ── s01: кораблик в сточной канаве
export const BoatHook: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kBoat = kAt(c, 0, 2.2);
  const drift = easeInOut(clamp01(t / Math.max(6, c.dur))) * 240;
  const kPair = kAt(c, 1, 1.2);
  const kLeave = kAt(c, 2, 2.4);
  const curb = memo("hook-curb", () => join(line(60, 720, 1860, 720, { col: "mist", gap: 14, r: 3.2 }), line(60, 745, 1860, 745, { col: "dim", gap: 16, r: 2.6 })));
  const waves = memo("hook-water", () => move(water(1700, 3, "tealSoft"), 960, 760));
  const b = memo("hook-boat", () => move(boat("paper", 10), 0, 0, 1.45));
  const homeLit = memo("hook-house-lit", () => move(house(300, 230, 3, 2, [false, true, false, false, false, false], "teal"), 230, 640));
  const grate = memo("hook-drain", () => move(drain("mist"), 1000, 770, 0.8));
  const bx = 640 + drift;
  return (
    <g>
      <Rain t={t} />
      <Dots shape={homeLit} k={kAt(c, 0, 1.4)} seed={4} scatter="rise" dimTo={0.25} dimK={kLeave} only={(d) => d.c !== 1 || kLeave < 0.99} />
      <Dots shape={curb} k={kAt(c, 0, 1)} seed={2} scatter="left" />
      <Dots shape={waves} k={kAt(c, 0, 1.2)} seed={3} scatter="left" />
      <Dots shape={grate} k={kAt(c, 0.5, 1.2)} seed={8} />
      <g transform={`translate(${bx} ${640 + Math.sin(t * 1.6) * 5}) rotate(${Math.sin(t * 1.3) * 2.5})`}>
        <Dots shape={b} k={kBoat} seed={11} scatter="rain" glow={0.6} />
      </g>
      {/* «вместе»: две тёплые точки-ладони сходятся над корпусом */}
      {kPair > 0 && (
        <g opacity={1 - kLeave * 0.8}>
          <Node x={bx - 170 + 60 * easeInOut(kPair)} y={480} k={kPair} r={16} />
          <Node x={bx + 170 - 60 * easeInOut(kPair)} y={480} k={kPair} r={16} />
          <Thread a={[bx - 110, 480]} b={[bx + 110, 480]} k={kPair} color={C.amber} />
        </g>
      )}
    </g>
  );
};

// ── карта города: assemble (окна гаснут) / festival (праздник отбраковывает тёмное)
const DIM_BLOCKS = [1, 4, 7, 9, 13, 16];
export const TownMap: React.FC<VisualProps<{ mode: string; host: string }>> = (c) => {
  const { p } = c;
  const map = memo("town", town);
  const win = memo("town-win", townWindows);
  const kMap = p.mode === "festival" ? kAt(c, 0, 0.9) : clamp01(c.t / 2.4);
  const kWin = p.mode === "festival" ? kAt(c, 0, 1.2) : clamp01((c.t - 1) / 1.8);
  const kDim = p.mode === "festival" ? kAt(c, 2, 2.2) : kAt(c, 1, 2.6);
  const dimSet = new Set(DIM_BLOCKS);
  const blockOfDot = (x: number, y: number) => TOWN_BLOCKS.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)?.id ?? -1;
  const winLit = win.filter((d) => !dimSet.has(blockOfDot(d.x, d.y)));
  const winDim = win.filter((d) => dimSet.has(blockOfDot(d.x, d.y)));
  const s = 0.66;
  return (
    <Box host={p.host}>
      <g transform={`scale(${s})`}>
        <Dots shape={map} k={kMap} seed={21} spread={0.6} />
        <Dots shape={winLit} k={kWin} seed={22} glow={0.8} />
        <Dots shape={winDim} k={kWin} seed={23} glow={0.8 * (1 - kDim)} dimTo={0.18} dimK={kDim} />
        {p.mode === "festival" && <Festival c={c} />}
      </g>
      <Label x={BW / 2} y={BH - 10} k={kAt(c, 0.6, 1)} size={26} color={C.mist}>
        {p.mode === "festival" ? "условная схема · не карта Дерри из книги" : "условная схема города · не карта Дерри из книги"}
      </Label>
    </Box>
  );
};

// флажки праздника и «тёмные экспонаты», которые убирают
const Festival: React.FC<{ c: VisualProps }> = ({ c }) => {
  const flags = memo("fest-flags", () => {
    const out: Shape = [];
    for (let i = 0; i < 16; i++) {
      const x = 140 + i * 110;
      const y = 40 + Math.sin(i * 0.9) * 6;
      out.push(...line(x, y, x + 55, y + 50, { col: i % 2 ? "amber" : "teal", gap: 10, r: 3 }), ...line(x + 55, y + 50, x + 110, y, { col: i % 2 ? "amber" : "teal", gap: 10, r: 3 }));
    }
    return out;
  });
  const frames = memo("fest-frames", () => join(...[0, 1, 2, 3].map((i) => join(rect(560 + i * 230, 900, 170, 120, { col: "paper", gap: 11 }), fillRect(580 + i * 230, 920, 130, 80, { col: i % 2 ? "bordo" : "dim", gap: 13, r: 3.2 })))));
  const kF = kAt(c, 0, 1.2);
  const kOut = kAt(c, 1.4, 2.4);
  return (
    <g>
      <Dots shape={flags} k={kF} seed={31} scatter="left" />
      <Dots shape={frames} k={kAt(c, 1, 1.2)} seed={32} />
      {/* тёмные экспонаты «отбраковывают»: их точки уходят вниз за кадр */}
      {kOut > 0 && <rect x={540} y={880} width={940} height={170} fill={C.bgBottom} opacity={0.85 * kOut} />}
    </g>
  );
};

// ── s03: граница тома — 9 глав и 2 интерлюдии светятся, дальше роман уходит в пустоту
const SEGS = ["1", "2", "3", "И", "4", "5", "6", "7", "8", "9", "И"];
export const VolumeBorder: React.FC<VisualProps<{ host: string }>> = (c) => {
  const k0 = kAt(c, 0, 1.6);
  const kNo = kAt(c, 1, 1.4);
  const kOk = kAt(c, 2, 1.2);
  const bars = memo("vol-bars", () =>
    join(
      ...SEGS.map((s, i) => {
        const x = 40 + i * 88 + (i >= 4 ? 30 : 0);
        return s === "И" ? fillRect(x, 260, 56, 300, { col: "amber", gap: 13, r: 3.6 }) : fillRect(x, 220, 56, 340, { col: "teal", gap: 13, r: 3.6 });
      }),
    ),
  );
  const beyond = memo("vol-beyond", () => join(...Array.from({ length: 7 }, (_, i) => fillRect(1070 + i * 34, 220 + i * 6, 18, 340 - i * 12, { col: "dim", gap: 17, r: 2.8 }))));
  return (
    <Box host={c.p.host}>
      <Dots shape={bars} k={k0} seed={41} scatter="rise" />
      {SEGS.map((s, i) => (
        <Label key={i} x={68 + i * 88 + (i >= 4 ? 30 : 0)} y={610} k={k0} size={30} color={s === "И" ? C.amber : C.white}>
          {s}
        </Label>
      ))}
      <Label x={190} y={160} k={k0} size={34}>
        Часть I
      </Label>
      <Label x={690} y={160} k={k0} size={34}>
        Часть II
      </Label>
      <Dots shape={beyond} k={kNo} seed={42} opacity={0.7} scatter="right" />
      <Label x={1170} y={160} k={kNo} size={30} color={C.mist}>
        дальше роман
      </Label>
      <Label x={1170} y={640} k={kNo} size={30} color={C.bordo}>
        финала здесь нет
      </Label>
      <Label x={500} y={720} k={kOk} size={30} color={C.amber}>
        «И» — интерлюдии: рукопись Майка Хэнлона
      </Label>
    </Box>
  );
};

// ── s04: главный вопрос — дети видят, взрослые не замечают
export const BigQuestion: React.FC<VisualProps<{ host: string }>> = (c) => {
  const open = memo("bq-open", () => move(eye(true, "teal", 1.6), 330, 330));
  const closed = memo("bq-closed", () => move(eye(false, "dim", 1.6), 970, 330));
  const k1 = kAt(c, 1, 1.4);
  const k2 = kAt(c, 1.5, 1.4);
  const k3 = kAt(c, 2, 1.6);
  return (
    <Box host={c.p.host}>
      <Headline x={BW / 2} y={90} k={kAt(c, 0, 1)} text="ГЛАВНЫЙ ВОПРОС" size={52} color={C.amber} />
      <Dots shape={open} k={k1} seed={51} glow={0.6} />
      <Label x={330} y={480} k={k1} size={40}>
        что видят дети
      </Label>
      <Dots shape={closed} k={k2} seed={52} />
      <Label x={970} y={480} k={k2} size={40} color={C.mist}>
        {"чего взрослые\nне замечают"}
      </Label>
      <Thread a={[330, 620]} b={[970, 620]} k={k3} color={C.mist} gap={18} />
      <Label x={BW / 2} y={700} k={k3} size={36} color={C.teal}>
        карта того, что город не видит
      </Label>
    </Box>
  );
};

// ── s05–s06: два слоя времени
export const TwoTimelines: React.FC<VisualProps<{ mode: string; host: string }>> = (c) => {
  const { p } = c;
  const top = memo("tl-top", () => line(60, 230, 1240, 230, { col: "amber", gap: 16, r: 3.4 }));
  const bot = memo("tl-bot", () => line(60, 560, 1240, 560, { col: "teal", gap: 16, r: 3.4 }));
  const y1 = memo("tl-y1", () => move(digits("1957–58", 11, "teal"), 650, 640));
  const y2 = memo("tl-y2", () => move(digits("1984–85", 11, "amber"), 650, 150));
  const kA = kAt(c, 0, 1.6);
  const kB = kAt(c, p.mode === "layers" ? 1 : 0, 1.6);
  if (p.mode === "layers") {
    const kJump = kAt(c, 2, 1.8);
    const kBell = kAt(c, 3, 1.4);
    const arcs = [260, 640, 1020];
    return (
      <Box host={p.host}>
        <Dots shape={bot} k={kA} seed={61} scatter="left" />
        <Dots shape={y1} k={kA} seed={62} />
        <Label x={650} y={720} k={kA} size={28} color={C.mist}>
          детство
        </Label>
        <Dots shape={top} k={kB} seed={63} scatter="right" />
        <Dots shape={y2} k={kB} seed={64} />
        <Label x={650} y={80} k={kB} size={28} color={C.mist}>
          взрослые
        </Label>
        {arcs.map((x, i) => {
          const k = clamp01(kJump * 3 - i);
          const n = 22;
          return (
            <g key={i}>
              {Array.from({ length: Math.round(n * k) }, (_, j) => {
                const u = j / n;
                return <circle key={j} cx={x + u * 120} cy={560 - Math.sin(u * Math.PI) * 330 - u * 0} r={3} fill={C.white} opacity={0.8} />;
              })}
            </g>
          );
        })}
        {/* звонок: сигнал в салоне превращается в школьный звонок — кольца-волны */}
        {kBell > 0 &&
          [0, 1, 2].map((i) => {
            const ph = clamp01(kBell * 1.6 - i * 0.3);
            return <circle key={i} cx={1100} cy={395} r={20 + ph * 120} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" opacity={(1 - ph) * 0.9} />;
          })}
        <Node x={1100} y={395} k={kBell} r={18} label="звонок" labelDy={52} />
      </Box>
    );
  }
  // success: на верхнем слое шесть успешных жизней, нижний слой затуманен
  const roles = ["архитектор", "писатель", "модельер", "радио", "бухгалтер", "шофёр"];
  const kRoles = kAt(c, 0, 1.8);
  const kHole = kAt(c, 1, 1.6);
  const kBill = kAt(c, 3, 1.6);
  const kHyp = kAt(c, 4, 1.4);
  return (
    <Box host={p.host}>
      <Dots shape={top} k={kA} seed={63} />
      <Dots shape={bot} k={kA} seed={61} dimTo={0.3} dimK={kHole} />
      <Dots shape={y1} k={kA} seed={62} dimTo={0.3} dimK={kHole} />
      <Dots shape={y2} k={kA} seed={64} />
      {roles.map((r, i) => {
        const x = 130 + i * 205;
        const k = clamp01(kRoles * 2 - i * 0.18);
        const h = memo(`tl-house-${i}`, () => move(house(110, 90, 2, 1, [true, i !== 4], "teal"), x, 390));
        return (
          <g key={i}>
            <Dots shape={h} k={k} seed={70 + i} scatter="rise" />
            <Label x={x} y={440} k={k} size={26} color={C.mist}>
              {r}
            </Label>
          </g>
        );
      })}
      {/* память — провал: точки нижней линии гаснут, «знак вопроса» */}
      <Label x={650} y={530} k={kHole} size={54} color={C.mist}>
        ?
      </Label>
      {/* шрамы и заикание Билла: память возвращается — нить снизу вверх */}
      <Thread a={[335, 560]} b={[335, 450]} k={kBill} color={C.amber} />
      <Label x={345} y={520} k={kBill} size={28} color={C.amber} anchor="start">
        {"  21 год"}
      </Label>
      <Label x={650} y={740} k={kHyp} size={36} color={C.teal}>
        забвение не лечит — оно откладывает встречу
      </Label>
    </Box>
  );
};

// ── s47: ответ — видеть вместе и действовать конкретно
export const Answer: React.FC<VisualProps<{ host: string }>> = (c) => {
  const map = memo("town", town);
  const win = memo("town-win", townWindows);
  const k0 = clamp01(c.t / 1.6);
  const kNet = kAt(c, 1, 2);
  const nodes: [number, number][] = [
    [290, 260],
    [770, 500],
    [1230, 270],
    [1470, 560],
    [1700, 300],
    [540, 700],
    [1230, 730],
  ];
  return (
    <Box host={c.p.host}>
      <Headline x={BW / 2} y={40} k={kAt(c, 0.6, 1)} text="ОБЪЯСНЯЕТ · ОТБРАКОВЫВАЕТ · ЗАБЫВАЕТ" size={38} color={C.mist} />
      <g transform="translate(0 70) scale(0.66)">
        <Dots shape={map} k={k0} seed={21} opacity={0.55} />
        <Dots shape={win} k={k0} seed={22} glow={0.5} dimTo={0.3} dimK={1 - kNet} />
        {nodes.map((a, i) => nodes.slice(i + 1, i + 3).map((b, j) => <Thread key={`${i}-${j}`} a={a} b={b} k={clamp01(kNet * 2 - i * 0.15)} color={C.teal} gap={18} r={3.4} />))}
        {nodes.map(([x, y], i) => (
          <Node key={i} x={x} y={y} k={clamp01(kNet * 2 - i * 0.12)} r={22} />
        ))}
      </g>
      <Headline x={BW / 2} y={760} k={kNet} text="ВИДЕТЬ ВМЕСТЕ — ДЕЙСТВОВАТЬ КОНКРЕТНО" size={44} color={C.amber} />
    </Box>
  );
};

// ── s48: открытый финал + знак BanaMind
export const FinalMap: React.FC<VisualProps<{ host: string }>> = (c) => {
  const map = memo("town", town);
  const win = memo("town-win", townWindows);
  const k0 = clamp01(c.t / 1.8);
  const kOpen = kAt(c, 1, 2);
  const kQ = kAt(c, 2, 1.4);
  const kBrand = kAt(c, 3, 1.2);
  return (
    <Box host={c.p.host}>
      <g transform="scale(0.66)">
        <Dots shape={map} k={k0} seed={21} />
        <Dots shape={win} k={k0} seed={22} glow={0.6} only={(d, i) => rnd(i, 99) < 0.55 + 0.45 * (1 - kOpen) || d.x < 900} />
      </g>
      {/* правый край: дорога уходит за пределы тома */}
      <Thread a={[1180, 380]} b={[1300, 380]} k={kOpen} color={C.mist} />
      <Label x={1060} y={330} k={kOpen} size={28} color={C.mist}>
        роман продолжается
      </Label>
      <Label x={BW / 2} y={BH - 40} k={kQ} size={38} color={C.amber}>
        Чего не замечает ваш город?
      </Label>
      {kBrand > 0 && (
        <text x={BW / 2} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} opacity={kBrand}>
          <tspan fill={BRAND.white}>{BRAND.wordmark[0]}</tspan>
          <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
        </text>
      )}
    </Box>
  );
};

export { beat };
