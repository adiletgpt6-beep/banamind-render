// Главы 7–8: плотина, пятеро, цепочка признаний, обрыв главы, Нелл, проверка по уликам.
import React from "react";
import { C } from "../theme";
import { album, bike, dam, drain, figure, water } from "./shapes";
import { clamp01, Dots, easeInOut, fillRect, join, line, memo, move, rect, rnd, type Shape, type VisualProps } from "./dots";
import { Box, Headline, kAt, Label, Node, Thread } from "./kit";

// ── s30: плотина — сначала доски уносит, потом с Беном стоит
export const Dam: React.FC<VisualProps<{ host: string }>> = (c) => {
  const river = memo("dm-river", () => join(move(water(1200, 3, "tealSoft"), 650, 470)));
  const d = memo("dm-dam", () => move(dam("amber"), 650, 470, 0.95));
  const k0 = kAt(c, 0, 1.4);
  const kFail = kAt(c, 0.3, 2.6);
  const kBuild = kAt(c, 1, 2.6);
  const kTwo = kAt(c, 2, 1.4);
  const kJoin = kAt(c, 3, 1.4);
  return (
    <Box host={c.p.host}>
      <Dots shape={river} k={k0} seed={311} scatter="left" />
      {/* вчерашние доски уплывают */}
      {kBuild < 0.01 &&
        [0, 1, 2].map((i) => {
          const x = 420 + i * 140 + easeInOut(kFail) * (500 + i * 80);
          return (
            <g key={i} opacity={1 - kFail} transform={`translate(${x} ${470 + Math.sin(i + c.t) * 6}) rotate(${kFail * (20 + i * 15)})`}>
              <Dots shape={memo("dm-plank", () => line(-50, 0, 50, 0, { col: "amber", gap: 11, r: 4 }))} k={k0} seed={312 + i} />
            </g>
          );
        })}
      <Dots shape={d} k={kBuild} seed={315} scatter="rise" />
      <Node x={360} y={250} k={kTwo} r={22} label="идея — Билл" labelDy={-40} />
      <Node x={940} y={250} k={kTwo} r={22} label="знание — Бен" labelDy={-40} />
      <Thread a={[360, 250]} b={[650, 380]} k={kJoin} color={C.teal} />
      <Thread a={[940, 250]} b={[650, 380]} k={kJoin} color={C.teal} />
      <Label x={650} y={720} k={kJoin} size={36} color={C.amber}>
        держится, потому что соединили
      </Label>
    </Box>
  );
};

// ── s31: пятеро у плотины; Беверли и Майка нет
export const FiveNodes: React.FC<VisualProps<{ host: string }>> = (c) => {
  const morning: [number, number, string][] = [
    [420, 300, "Бен"],
    [650, 230, "Билл"],
    [880, 300, "Эдди"],
  ];
  const after: [number, number, string][] = [
    [470, 520, "Ричи"],
    [830, 520, "Стэн"],
  ];
  const absent: [number, number, string][] = [
    [150, 690, "Беверли"],
    [1150, 690, "Майк"],
  ];
  const kM = kAt(c, 0, 1.4);
  const kA = kAt(c, 0.6, 1.4);
  const kAbs = kAt(c, 1, 1.4);
  const kTeam = kAt(c, 2, 1.6);
  const all = [...morning, ...after];
  return (
    <Box host={c.p.host}>
      <Label x={650} y={110} k={kM} size={30} color={C.mist}>
        утро — трое · после обеда — пятеро
      </Label>
      {morning.map(([x, y, n], i) => (
        <Node key={n} x={x} y={y} k={clamp01(kM * 2 - i * 0.2)} r={26} label={n} />
      ))}
      {after.map(([x, y, n], i) => (
        <Node key={n} x={x} y={y} k={clamp01(kA * 2 - i * 0.2)} r={26} label={n} />
      ))}
      {absent.map(([x, y, n]) => (
        <g key={n} opacity={kAbs}>
          <circle cx={x} cy={y} r={28} fill="none" stroke={C.dim} strokeWidth={3} strokeDasharray="1 10" strokeLinecap="round" />
          <Label x={x} y={y + 64} k={kAbs} size={26} color={C.mist}>
            {`${n} — нет`}
          </Label>
        </g>
      ))}
      {all.map(([x, y], i) => all.slice(i + 1).map(([x2, y2], j) => <Thread key={`${i}-${j}`} a={[x, y]} b={[x2, y2]} k={kTeam} color={C.teal} gap={18} r={2.6} opacity={0.75} />))}
      <Label x={650} y={420} k={kTeam} size={32} color={C.amber}>
        «одна команда»
      </Label>
    </Box>
  );
};

// ── s32: цепочка признаний и совпавшая деталь
export const ChainConfess: React.FC<VisualProps<{ host: string }>> = (c) => {
  const nodes: [number, number, string][] = [
    [200, 420, "Билл"],
    [470, 300, "Бен"],
    [750, 420, "Стэн"],
    [1020, 300, "Эдди"],
  ];
  const k0 = kAt(c, 0, 1.2);
  const kBen = kAt(c, 1, 1.2);
  const kChain = kAt(c, 2, 2.4);
  const kMatch = kAt(c, 3, 1.6);
  const kKnow = kAt(c, 4, 1.4);
  // «костюм»: одинаковый набор оранжевых точек-пуговиц у двух рассказов
  const btn = (x: number, y: number) => join(...[0, 1, 2].map((i) => fillRect(x - 10, y - 50 + i * 40, 20, 20, { col: "amber", gap: 8, r: 3.6 })));
  const suitA = memo("cc-sa", () => join(rect(420, 520, 100, 170, { col: "white", gap: 11 }), btn(470, 610)));
  const suitB = memo("cc-sb", () => join(rect(970, 520, 100, 170, { col: "white", gap: 11 }), btn(1020, 610)));
  return (
    <Box host={c.p.host}>
      <Node x={nodes[0][0]} y={nodes[0][1]} k={k0} r={26} label={nodes[0][2]} />
      <Label x={200} y={250} k={k0} size={28} color={C.mist}>
        «если будете смеяться…»
      </Label>
      <Node x={nodes[1][0]} y={nodes[1][1]} k={kBen} r={26} label={nodes[1][2]} labelDy={-46} />
      <Thread a={[nodes[0][0], nodes[0][1]]} b={[nodes[1][0], nodes[1][1]]} k={kBen} color={C.amber} />
      <Label x={470} y={200} k={kBen} size={30} color={C.amber}>
        «мы не будем смеяться»
      </Label>
      {nodes.slice(2).map(([x, y, n], i) => (
        <g key={n}>
          <Node x={x} y={y} k={clamp01(kChain * 2 - i)} r={26} label={n} labelDy={i === 1 ? -46 : 62} />
          <Thread a={[nodes[i + 1][0], nodes[i + 1][1]]} b={[x, y]} k={clamp01(kChain * 2 - i)} color={C.amber} />
        </g>
      ))}
      <Dots shape={suitA} k={kMatch} seed={321} glow={0.3} />
      <Dots shape={suitB} k={kMatch} seed={322} glow={0.3} />
      <Thread a={[530, 610]} b={[960, 610]} k={kAt(c, 3.5, 1.6)} color={C.teal} gap={16} />
      <Label x={745} y={580} k={kAt(c, 3.5, 1.2)} size={28} color={C.teal}>
        совпало
      </Label>
      <Headline x={650} y={90} k={kKnow} text="НЕСКОЛЬКО СВИДЕТЕЛЕЙ — ЗНАНИЕ" size={44} color={C.white} />
    </Box>
  );
};

// ── s33: вера неравномерна; фразу Стэна обрывает взрослый голос
export const Interrupted: React.FC<VisualProps<{ host: string }>> = (c) => {
  const k0 = kAt(c, 0, 1.4);
  const kStan = kAt(c, 1, 1.4);
  const kCut = kAt(c, 2, 0.6);
  const kTheme = kAt(c, 3, 1.4);
  const nodes: [number, number, string, number][] = [
    [250, 300, "Ричи", 0.5],
    [520, 220, "Билл", 1],
    [780, 220, "Бен", 1],
    [1050, 300, "Эдди", 1],
  ];
  // реплика Стэна: слово за словом, обрывается
  const words = ["У", "меня", "был", "не", "клоун…"];
  const shown = kStan > 0 ? Math.min(words.length, Math.floor((c.t - (c.beats[1] ?? 0)) * 2.4) + 1) : 0;
  const wave = memo("in-wave", () => {
    const out: Shape = [];
    for (let i = 0; i < 60; i++) out.push({ x: 1180 - i * 14, y: 600 + Math.sin(i * 0.9) * (30 - i * 0.3), r: 4, c: 1 });
    return out;
  });
  return (
    <Box host={c.p.host}>
      {nodes.map(([x, y, n, lit], i) => (
        <Node key={n} x={x} y={y} k={clamp01(k0 * 2 - i * 0.2)} r={22} lit={lit} label={n} labelDy={-42} labelSize={26} />
      ))}
      <Thread a={[250, 300]} b={[520, 220]} k={k0} color={C.teal} />
      <Thread a={[250, 300]} b={[780, 220]} k={k0} color={C.dim} gap={26} />
      <Thread a={[250, 300]} b={[1050, 300]} k={k0} color={C.dim} gap={26} />
      <Label x={650} y={120} k={k0} size={28} color={C.mist}>
        вера в группе неравномерна
      </Label>
      <Node x={320} y={560} k={kStan} r={24} label="Стэн" />
      {words.slice(0, kCut > 0 ? 4 : shown).map((w, i) => {
        const x = 410 + words.slice(0, i).reduce((a, ww) => a + ww.length * 26 + 22, 0);
        return (
          <text key={i} x={x} y={575} fontFamily="Rubik" fontWeight={800} fontSize={44} fill={C.white} opacity={0.9}>
            {w}
          </text>
        );
      })}
      {/* взрослый крик — волна, которая режет фразу */}
      <Dots shape={wave} k={kCut} seed={331} scatter="right" />
      <Label x={1030} y={700} k={kCut} size={34} color={C.amber}>
        мистер Нелл
      </Label>
      <Label x={650} y={778} k={kTheme} size={32} color={C.teal}>
        взрослый голос перебивает свидетельство
      </Label>
    </Box>
  );
};

// ── s34: домино признаний перед Неллом; «держитесь вместе»
export const Domino: React.FC<VisualProps<{ host: string }>> = (c) => {
  const names = ["Бен", "Билл", "Эдди", "Ричи", "Стэн"];
  const kFall = kAt(c, 0, 3);
  const kNell = kAt(c, 1, 1.4);
  const kBlind = kAt(c, 2, 1.4);
  const nell = memo("do-nell", () => move(figure(false, "teal"), 1080, 700, 0.85));
  const grate = memo("do-grate", () => move(drain("mist"), 1080, 300, 0.7));
  return (
    <Box host={c.p.host}>
      {names.map((n, i) => {
        const fall = clamp01(kFall * 5 - i);
        const x = 140 + i * 150;
        return (
          <g key={n} transform={`translate(${x} 640) rotate(${easeInOut(fall) * 62})`}>
            <Dots shape={memo("do-tile", () => join(rect(-34, -200, 68, 200, { col: "white", gap: 11 }), fillRect(-12, -150, 24, 24, { col: "amber", gap: 8, r: 3.6 })))} k={clamp01(kFall * 4 + 0.2)} seed={340 + i} />
            <text x={0} y={40} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={28} fill={C.mist} transform={`rotate(${-easeInOut(fall) * 62})`}>
              {n}
            </text>
          </g>
        );
      })}
      <Label x={450} y={300} k={kFall} size={32} color={C.amber}>
        первая костяшка домино
      </Label>
      <Dots shape={nell} k={kNell} seed={346} />
      <Label x={1080} y={778} k={kNell} size={28} color={C.teal}>
        «держитесь вместе»
      </Label>
      <Dots shape={grate} k={kNell} seed={347} />
      <Label x={1080} y={210} k={kBlind} size={28} color={C.mist}>
        {"видит канализацию —\nне видит угрозы"}
      </Label>
    </Box>
  );
};

// ── s35: проверка опыта — пустой кармашек, порезы, откат, улики Ниболт-стрит
export const Evidence: React.FC<VisualProps<{ host: string }>> = (c) => {
  const al = memo("ev-album", () => move(album("paper"), 330, 330, 0.75));
  const items: { lbl: string; shape: () => Shape }[] = [
    { lbl: "велосипед", shape: () => move(bike("teal"), 0, 0, 0.42) },
    { lbl: "решётка", shape: () => move(drain("mist"), 0, 0, 0.6) },
    { lbl: "стекло снаружи", shape: () => join(...Array.from({ length: 14 }, (_, i) => fillRect(-70 + rnd(i, 4) * 140, -30 + rnd(i, 5) * 60, 10, 10, { col: "white", gap: 6, r: 3 }))) },
  ];
  const k0 = kAt(c, 0, 1.6);
  const kCut = kAt(c, 1, 1.2);
  const kDoubt = kAt(c, 2, 1.4);
  const kN = kAt(c, 3, 2.4);
  const kSort = kAt(c, 4, 1.4);
  return (
    <Box host={c.p.host}>
      <Dots shape={al} k={k0} seed={351} opacity={1 - kDoubt * 0.5} />
      {/* пустой кармашек */}
      <rect x={250} y={270} width={160} height={110} fill="none" stroke={C.amber} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" opacity={k0} />
      <Label x={330} y={160} k={k0} size={28} color={C.mist}>
        снимка нет
      </Label>
      {/* порезы на пальцах — три короткие тёплые линии */}
      {[0, 1, 2].map((i) => (
        <Thread key={i} a={[230 + i * 40, 520]} b={[260 + i * 40, 560]} k={kCut} color={C.bordo} gap={8} r={3.4} />
      ))}
      <Label x={330} y={620} k={kCut} size={28} color={C.white}>
        след на руке
      </Label>
      <Label x={330} y={700} k={kDoubt} size={26} color={C.mist}>
        утром: «галлюцинация?»
      </Label>
      {items.map((it, i) => {
        const k = clamp01(kN * 3 - i);
        return (
          <g key={it.lbl} transform={`translate(${780 + (i % 2) * 300} ${230 + i * 170})`}>
            <Dots shape={memo(`ev-it-${i}`, it.shape)} k={k} seed={352 + i} />
            <Label x={0} y={90} k={k} size={26} color={C.mist}>
              {it.lbl}
            </Label>
            <Node x={150} y={0} k={k} r={14} />
          </g>
        );
      })}
      <Label x={930} y={110} k={kN} size={32} color={C.amber}>
        «похоже, было правдой»
      </Label>
      <Label x={650} y={740} k={kSort} size={28} color={C.teal}>
        «нас словно кто-то сортирует» — кто, том не объясняет
      </Label>
    </Box>
  );
};
