// Глава 3 и первая интерлюдия: шесть звонков, память, «дом», рукопись Майка,
// цикл с оговорками, молчание и удобные объяснения.
import React from "react";
import { C, SERIF } from "../theme";
import { digits, eye, house, manuscript, phone, water } from "./shapes";
import { circle, clamp01, curve, Dots, easeInOut, fillRect, join, line, memo, move, rect, rnd, type VisualProps } from "./dots";
import { BH, Box, BW, kAt, Label, Node, Thread } from "./kit";

const NAMES = ["Стэнли", "Ричи", "Бен", "Эдди", "Беверли", "Билл"];
const CX = 650;
const CY = 390;
const RX = 470;
const RY = 290;
const spot = (i: number): [number, number] => {
  const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
  return [CX + Math.cos(a) * RX, CY + Math.sin(a) * RY];
};

// ── s14–s15: шесть звонков
export const SixCalls: React.FC<VisualProps<{ mode: string; host: string }>> = (c) => {
  const { p } = c;
  const phones = memo("sc-phones", () => join(...NAMES.map((_, i) => move(phone("teal"), spot(i)[0], spot(i)[1], 0.42))));
  const k0 = p.mode === "ring" ? kAt(c, 0, 1.8) : kAt(c, 0, 0.8);
  const center = <Node x={CX} y={CY} k={k0} r={34} label="Майк · Дерри" labelDy={78} labelSize={30} />;
  if (p.mode === "ring") {
    const kCall = kAt(c, 1, 3);
    const kCrack = kAt(c, 2, 1.6);
    const kEyes = kAt(c, 3, 1.4);
    const eyes = memo("sc-eyes", () => join(...[0, 2, 4, 5].map((i) => move(eye(true, "mist", 0.32), spot(i)[0] + 120, spot(i)[1] - 40))));
    return (
      <Box host={p.host}>
        <Dots shape={phones} k={k0} seed={151} scatter="burst" />
        {center}
        {NAMES.map((n, i) => {
          const k = clamp01(kCall * 6 - i);
          const [x, y] = spot(i);
          return (
            <g key={n}>
              <Thread a={[CX, CY]} b={[x, y]} k={k} color={C.amber} gap={16} />
              {k > 0.9 &&
                [0, 1].map((j) => {
                  const ph = (c.t * 1.2 + j * 0.5 + i * 0.13) % 1;
                  return <circle key={j} cx={x} cy={y} r={50 + ph * 50} fill="none" stroke={C.amber} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" opacity={(1 - ph) * 0.6} />;
                })}
              <Label x={x} y={y + 80} k={k0} size={30}>
                {n}
              </Label>
              {/* трещина под будничным заголовком */}
              <Thread a={[x - 40, y + 100]} b={[x + 40, y + 112]} k={kCrack} color={C.mist} gap={9} r={2.4} />
            </g>
          );
        })}
        <Dots shape={eyes} k={kEyes} seed={152} />
        <Label x={CX} y={60} k={kEyes} size={32} color={C.mist}>
          герой — чужими глазами
        </Label>
      </Box>
    );
  }
  // answers: реакции по очереди; Стэнли — тихо гаснет
  const order = [1, 2, 3, 4, 5, 0]; // Ричи, Бен (реплика 0), Эдди 1, Беверли 2, Билл 3, Стэнли 4
  const startBeat = [0, 0.5, 1, 2, 3, 4];
  const notes = ["«Приеду»", "«за всё надо платить»", "уходит из дома", "даёт отпор, уходит", "рассказывает жене", ""];
  return (
    <Box host={p.host}>
      <Dots shape={phones} k={k0} seed={151} />
      {center}
      {order.map((idx, j) => {
        const k = kAt(c, startBeat[j], 1.2);
        const [x, y] = spot(idx);
        const stan = idx === 0;
        return (
          <g key={idx}>
            <Label x={x} y={y + 80} k={1} size={30} color={stan && k > 0 ? C.mist : C.white}>
              {NAMES[idx]}
            </Label>
            {!stan && <Node x={x} y={y - 6} k={k} r={22} />}
            {!stan && <Thread a={[x, y]} b={[CX, CY]} k={k} color={C.amber} gap={16} opacity={0.7} />}
            {!stan && (
              <Label x={x} y={y + 118} k={k} size={26} color={C.amber}>
                {notes[j]}
              </Label>
            )}
            {stan && k > 0 && <circle cx={x} cy={y} r={70} fill="none" stroke={C.mist} strokeWidth={2} strokeDasharray="1 12" strokeLinecap="round" opacity={0.6 * k} />}
            {stan && k > 0 && <rect x={x - 90} y={y - 70} width={180} height={140} fill={C.bgBottom} opacity={0.55 * k} />}
          </g>
        );
      })}
    </Box>
  );
};

// ── s16: память как физическое вторжение; клятва — крючок
export const MemoryInvasion: React.FC<VisualProps<{ host: string }>> = (c) => {
  const head = memo("mi-head", () => circle(420, 380, 250, { col: "teal", gap: 13, r: 4 }));
  const k0 = kAt(c, 0, 1.4);
  const kBub = kAt(c, 1, 3);
  const kFlood = kAt(c, 2, 1.6);
  const kHook = kAt(c, 3, 2);
  const kOath = kAt(c, 4, 1.4);
  const hook = memo("mi-hook", () =>
    join(
      line(1000, 80, 1000, 330, { col: "mist", gap: 12, r: 3 }),
      curve(
        [
          [1000, 330],
          [1000, 420],
          [900, 430],
          [890, 360],
        ],
        { col: "white", gap: 11, r: 4 },
      ),
    ),
  );
  const crypts = memo("mi-crypts", () => join(rect(270, 260, 90, 60, { col: "mist", gap: 10, r: 3 }), rect(480, 430, 90, 60, { col: "mist", gap: 10, r: 3 })));
  const y58 = memo("mi-58", () => move(digits("1958", 9, "amber"), 1000, 640));
  const wt = memo("mi-water", () => move(water(360, 2, "tealSoft"), 1000, 720));
  return (
    <Box host={c.p.host}>
      <Dots shape={head} k={k0} seed={161} />
      <Dots shape={crypts} k={kBub} seed={162} />
      {/* «пузырь» прошлого растёт изнутри */}
      {kBub > 0 && <Dots shape={circle(420, 380, 30 + easeInOut(kBub) * 180, { col: "amber", gap: 14, r: 3.4 })} k={1} />}
      {kFlood > 0 &&
        Array.from({ length: 60 }, (_, i) => {
          const a = rnd(i, 3) * Math.PI * 2;
          const r0 = 520 - easeInOut(kFlood) * (300 + rnd(i, 4) * 180);
          return <circle key={i} cx={420 + Math.cos(a) * r0} cy={380 + Math.sin(a) * r0} r={3.4} fill={C.white} opacity={kFlood * 0.9} />;
        })}
      <Label x={420} y={720} k={kFlood} size={34} color={C.white}>
        не альбом, а вторжение
      </Label>
      <Dots shape={hook} k={kHook} seed={163} />
      {/* крючок тянет узел вправо — назад в Дерри */}
      <Node x={890 + easeInOut(kHook) * 0} y={360} k={kHook} r={16} />
      <Label x={1000} y={60} k={kHook} size={30} color={C.mist}>
        клятва — крючок
      </Label>
      <Dots shape={y58} k={kOath} seed={164} />
      <Dots shape={wt} k={kOath} seed={165} />
    </Box>
  );
};

// ── s16b: дома, которые не дом; поезд — машина времени
export const Homes: React.FC<VisualProps<{ host: string }>> = (c) => {
  const homes = memo("ho-homes", () => join(...[0, 1, 2, 3].map((i) => move(house(150, 110, 2, 1, [true, true], "teal"), 140, 120 + i * 170))));
  const derry = memo("ho-derry", () => join(move(house(120, 90, 2, 1, [true, false], "amber"), 1060, 340), move(house(120, 90, 2, 1, [false, true], "amber"), 1200, 380), move(house(120, 90, 2, 1, [true, true], "amber"), 1130, 470)));
  const train = memo("ho-train", () => join(...[0, 1, 2].map((i) => join(rect(-170 + i * 120, -50, 105, 70, { col: "white", gap: 11 }), circle(-140 + i * 120, 28, 14, { col: "mist", gap: 8, r: 3 }), circle(-90 + i * 120, 28, 14, { col: "mist", gap: 8, r: 3 })))));
  const k0 = kAt(c, 0, 1.6);
  const kDim = kAt(c, 2, 1.6);
  const kTrain = kAt(c, 3, 3);
  const tx = 360 + easeInOut(kTrain) * 560;
  return (
    <Box host={c.p.host}>
      <Dots shape={homes} k={k0} seed={171} scatter="left" dimTo={0.35} dimK={kDim} />
      {["океан", "ферма", "Англия", "Нью-Йорк"].map((n, i) => (
        <Label key={n} x={300} y={110 + i * 170} k={k0} size={26} color={C.mist} anchor="start">
          {n}
        </Label>
      ))}
      <Dots shape={derry} k={kAt(c, 1, 1.6)} seed={172} glow={0.6} />
      <Label x={1130} y={240} k={kAt(c, 1, 1.4)} size={36} color={C.amber}>
        «дом»?
      </Label>
      {kTrain > 0 && (
        <g transform={`translate(${tx} 660)`}>
          <Dots shape={train} k={1} />
        </g>
      )}
      <Thread a={[360, 720]} b={[1240, 720]} k={kTrain} color={C.mist} gap={16} />
      <Label x={800} y={778} k={kTrain} size={32} color={C.teal}>
        машина времени — назад
      </Label>
    </Box>
  );
};

// ── s17, s20: рукопись Майка
export const Manuscript: React.FC<VisualProps<{ mode: string; host: string }>> = (c) => {
  const { p } = c;
  const ms = memo("ms-pages", () => move(manuscript("paper", 7), 650, 380, 1.15));
  const k0 = kAt(c, 0, 1.8);
  if (p.mode === "title") {
    const kT = kAt(c, 1, 1.4);
    const kTwo = kAt(c, 2, 1.6);
    const cards = memo("ms-cards", () => join(...[0, 1, 2].map((i) => rect(60 + i * 40, 130 + i * 30, 170, 110, { col: "mist", gap: 12, r: 3.2 }))));
    return (
      <Box host={p.host}>
        <Dots shape={ms} k={k0} seed={181} scatter="rise" glow={0.3 * (1 - kTwo)} opacity={1 - kTwo * 0.3} />
        {kT > 0 && (
          <text x={650} y={140} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={44} fill={C.paper} opacity={kT * (1 - kTwo * 0.4)}>
            «Дерри: Неавторизированная история»
          </text>
        )}
        <Dots shape={cards} k={kTwo} seed={182} />
        <Label x={190} y={360} k={kTwo} size={30} color={C.mist}>
          официальная
        </Label>
        <Node x={1140} y={220} k={kTwo} r={24} label="ночью" labelDy={60} />
        <Label x={1140} y={360} k={kTwo} size={30} color={C.amber}>
          частная
        </Label>
      </Box>
    );
  }
  // gap: «ничего не забыл» — но в памяти Майка провал с 11 лет
  const kClaim = kAt(c, 0, 1.2);
  const kGap = kAt(c, 1, 2);
  const kSense = kAt(c, 2, 1.4);
  const mem = memo("ms-mem", () => line(120, 700, 1180, 700, { col: "teal", gap: 14, r: 3.6 }));
  return (
    <Box host={p.host}>
      <Dots shape={ms} k={k0} seed={181} opacity={0.75} />
      <Label x={650} y={110} k={kClaim} size={38} color={C.white}>
        «я единственный, кто ничего не забыл»
      </Label>
      <Dots shape={mem} k={k0} seed={183} only={(d) => !(kGap > 0 && d.x > 380 && d.x < 380 + 700 * easeInOut(kGap))} />
      <Label x={250} y={760} k={kGap} size={28} color={C.mist}>
        11 лет
      </Label>
      <Label x={1110} y={760} k={kGap} size={28} color={C.mist}>
        1985
      </Label>
      <Label x={730} y={660} k={kGap} size={30} color={C.bordo}>
        провал памяти
      </Label>
      <Label x={650} y={190} k={kSense} size={32} color={C.teal}>
        рукопись — способ вспоминать
      </Label>
    </Box>
  );
};

// ── s18: цикл с оговорками (не расписание)
const PERIODS: { a: number; b: number; lbl: string }[] = [
  { a: 1876, b: 1877, lbl: "1876–77" },
  { a: 1904, b: 1906, lbl: "1904–06" },
  { a: 1929, b: 1930, lbl: "1929–30" },
  { a: 1957, b: 1958, lbl: "1957–58" },
];
export const Cycle: React.FC<VisualProps<{ host: string }>> = (c) => {
  const X = (y: number) => 80 + ((y - 1865) / (1995 - 1865)) * 1140;
  const axis = memo("cy-axis", () => line(60, 470, 1240, 470, { col: "mist", gap: 15, r: 3 }));
  const blobs = memo("cy-blobs", () => join(...PERIODS.map((p) => fillRect(X(p.a) - 14, 430, Math.max(28, X(p.b) - X(p.a) + 28), 80, { col: "amber", gap: 12, r: 4 }))));
  const k0 = kAt(c, 0, 2.4);
  const kArc = kAt(c, 1, 2);
  const kVar = kAt(c, 2, 1.4);
  const kNot = kAt(c, 3, 1.2);
  return (
    <Box host={c.p.host}>
      <Dots shape={axis} k={k0} seed={191} scatter="left" />
      <Dots shape={blobs} k={k0} seed={192} glow={0.5} />
      {PERIODS.map((p, i) => (
        <Label key={p.lbl} x={X((p.a + p.b) / 2)} y={570} k={clamp01(k0 * 2 - i * 0.2)} size={28}>
          {p.lbl}
        </Label>
      ))}
      <Node x={X(1985)} y={470} k={k0} r={16} lit={0.5} label="1984–85" labelDy={-36} labelSize={26} />
      {PERIODS.slice(0, 3).map((p, i) => {
        const x1 = X(p.b);
        const x2 = X(PERIODS[i + 1].a);
        const n = 24;
        const kk = clamp01(kArc * 3 - i);
        return (
          <g key={i}>
            {Array.from({ length: Math.round(n * kk) }, (_, j) => {
              const u = j / n;
              return <circle key={j} cx={x1 + (x2 - x1) * u} cy={410 - Math.sin(u * Math.PI) * 120} r={3} fill={C.teal} />;
            })}
            <Label x={(x1 + x2) / 2} y={270} k={kk} size={30} color={C.teal}>
              {"≈27?"}
            </Label>
          </g>
        );
      })}
      <Label x={650} y={140} k={kVar} size={36} color={C.mist}>
        «иногда раньше, иногда позже» · 25 · 26 · 27
      </Label>
      <Label x={650} y={720} k={kNot} size={44} color={C.white}>
        гипотеза рассказчика, не расписание
      </Label>
      {kNot > 0 && (
        <g opacity={kNot}>
          <Label x={650} y={650} k={1} size={34} color={C.bordo}>
            «ровно каждые 27 лет»
          </Label>
          <Thread a={[470, 640]} b={[830, 640]} k={kNot} color={C.bordo} gap={10} r={3.4} />
        </g>
      )}
    </Box>
  );
};

// ── s19: 1741 — исчезновение и молчание; удобные объяснения
export const Silence1741: React.FC<VisualProps<{ host: string }>> = (c) => {
  const village = memo("si-village", () => join(...Array.from({ length: 7 }, (_, i) => move(house(110, 80, 1, 1, [true], "teal"), 120 + (i % 4) * 150 + (i >= 4 ? 75 : 0), 260 + (i >= 4 ? 150 : 0)))));
  const y41 = memo("si-1741", () => move(digits("1741", 10, "amber"), 360, 110));
  const book = memo("si-book", () => join(rect(820, 160, 340, 240, { col: "paper", gap: 12 }), line(990, 160, 990, 400, { col: "paper", gap: 12 })));
  const ear = memo("si-ear", () => join(circle(990, 560, 40, { col: "teal", gap: 10, r: 3.4, from: -1.6, to: 1.6 }), circle(990, 560, 75, { col: "teal", gap: 12, r: 3.4, from: -1.3, to: 1.3 })));
  const k0 = kAt(c, 0, 1.6);
  const kGone = kAt(c, 0.5, 3);
  const kListen = kAt(c, 1, 1.4);
  const kCards = kAt(c, 2, 1.2);
  const kEnd = kAt(c, 3, 1.2);
  const kMany = kAt(c, 4, 2);
  const cards = ["«Депрессия»", "«люди кочуют»", "разговор окончен"];
  return (
    <Box host={c.p.host}>
      <g opacity={1 - kCards * 0.8}>
        <Dots shape={y41} k={k0} seed={201} />
        <Dots shape={village} k={k0} seed={202} only={(d, i) => rnd(i, 5) > easeInOut(kGone)} />
        <Label x={360} y={560} k={kGone} size={32} color={C.mist}>
          исчезли все жители
        </Label>
        <Dots shape={book} k={kAt(c, 0.6, 1.4)} seed={203} />
        <Label x={990} y={130} k={kAt(c, 0.6, 1.4)} size={28} color={C.mist}>
          учебник молчит
        </Label>
        <Dots shape={ear} k={kListen} seed={204} />
        <Label x={990} y={680} k={kListen} size={30} color={C.teal}>
          надо уметь слушать
        </Label>
      </g>
      {cards.map((t, i) => {
        const k = i < 2 ? clamp01(kCards * 2 - i * 0.6) : kEnd;
        return (
          <g key={t} opacity={easeInOut(k)} transform={`translate(${200 + i * 450} ${330 + (1 - easeInOut(k)) * 30})`}>
            <Dots shape={memo(`si-card-${i}`, () => rect(-180, -70, 360, 140, { col: i === 2 ? "bordo" : "mist", gap: 12, r: 3.4 }))} k={k} seed={205 + i} />
            <Label x={0} y={12} k={k} size={34} color={C.white}>
              {t}
            </Label>
          </g>
        );
      })}
      {kMany > 0 &&
        Array.from({ length: 14 }, (_, i) => {
          const k = clamp01(kMany * 2 - i * 0.1);
          return k > 0 ? (
            <g key={i} opacity={0.5 * k} transform={`translate(${100 + rnd(i, 1) * 1100} ${560 + rnd(i, 2) * 160})`}>
              <Dots shape={memo("si-mini", () => rect(-60, -24, 120, 48, { col: "mist", gap: 12, r: 2.8 }))} k={1} />
            </g>
          ) : null;
        })}
      <Label x={BW / 2} y={BH - 10} k={kMany} size={34} color={C.amber}>
        объяснений всегда хватает
      </Label>
    </Box>
  );
};

