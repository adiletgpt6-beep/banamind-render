// Главы 1–2: кораблик, взгляды, погреб, мост, свидетели и молчание суда.
import React from "react";
import { C } from "../theme";
import { boat, digits, eye, figure, water } from "./shapes";
import { circle, clamp01, curve, Dots, easeInOut, fill, fillRect, join, line, memo, Morph, move, poly, rect, recolor, rnd, type Shape, type VisualProps } from "./dots";
import { Box, BW, Headline, kAt, Label, Node, Thread } from "./kit";

// лист рекламной газеты: рамка и строки
const sheet = (): Shape =>
  join(
    rect(-190, -130, 380, 260, { col: "paper", gap: 11 }),
    ...Array.from({ length: 6 }, (_, i) => line(-160, -90 + i * 36, 160 - (i % 3) * 40, -90 + i * 36, { col: "mist", gap: 11, r: 3 })),
  );

// ── s07: обычная вещь — лист → кораблик → путь по трубам за пределы города
export const BoatDetail: React.FC<VisualProps<{ host: string }>> = (c) => {
  const sh = memo("bd-sheet", () => move(sheet(), 420, 300));
  const bt = memo("bd-boat", () => move(boat("paper", 10), 420, 330, 1.2));
  const kSheet = kAt(c, 0.3, 1.4);
  const kMorph = kAt(c, 1.4, 2.2);
  const kWax = kAt(c, 2, 1.4);
  const kPath = kAt(c, 3, Math.max(2, (c.ends[3] ?? c.t) - (c.beats[3] ?? 0)));
  const pipe = memo("bd-pipe", () =>
    join(
      curve(
        [
          [420, 470],
          [560, 640],
          [900, 520],
          [1250, 640],
        ],
        { col: "dim", gap: 14, r: 3.2 },
      ),
    ),
  );
  // точка кораблика на пути
  const u = easeInOut(kPath);
  const px = (1 - u) ** 3 * 420 + 3 * (1 - u) ** 2 * u * 560 + 3 * (1 - u) * u * u * 900 + u ** 3 * 1250;
  const py = (1 - u) ** 3 * 470 + 3 * (1 - u) ** 2 * u * 640 + 3 * (1 - u) * u * u * 520 + u ** 3 * 640;
  return (
    <Box host={c.p.host}>
      {kMorph < 0.01 ? <Dots shape={sh} k={kSheet} seed={81} scatter="left" /> : kPath < 0.01 ? <Morph a={sh} b={bt} k={kMorph} seed={82} /> : null}
      {kPath >= 0.01 && kPath < 1 && (
        <g transform={`translate(${px} ${py - 60}) scale(${1 - 0.55 * u}) translate(-420 -330)`}>
          <Dots shape={bt} k={1} />
        </g>
      )}
      {/* парафин: тёплая обводка бортов */}
      {kWax > 0 && kPath < 0.01 && (
        <g opacity={kWax}>
          <Dots shape={memo("bd-wax", () => recolor(move(line(-150, 70, 150, 70, { gap: 12, r: 5 }), 420, 330, 1.2), "amber"))} k={kWax} seed={83} glow={1} />
        </g>
      )}
      <Label x={420} y={130} k={kSheet} size={30} color={C.mist}>
        лист рекламной газеты
      </Label>
      <Label x={420} y={620} k={kWax} size={32} color={C.amber}>
        общая работа держится на плаву
      </Label>
      <Dots shape={pipe} k={kPath > 0 ? 1 : 0} seed={84} scatter="right" />
      <Label x={1180} y={720} k={kAt(c, 3.6, 1)} size={30} color={C.mist}>
        где он закончил путь — неизвестно
      </Label>
    </Box>
  );
};

// ── s08: груз вины делится на двоих
export const BoatGuilt: React.FC<VisualProps<{ host: string }>> = (c) => {
  const bt = memo("bg-boat", () => move(boat("paper", 10), 650, 560, 1));
  const block = memo("bg-block", () => fillRect(520, 170, 260, 200, { col: "dim", gap: 13, r: 4 }));
  const half1 = memo("bg-h1", () => fillRect(240, 220, 130, 200, { col: "mist", gap: 13, r: 4 }));
  const half2 = memo("bg-h2", () => fillRect(930, 220, 130, 200, { col: "mist", gap: 13, r: 4 }));
  const both = memo("bg-both", () => join(half1, half2));
  const k0 = kAt(c, 0, 1.6);
  const kSplit = kAt(c, 1.5, 2.4);
  return (
    <Box host={c.p.host}>
      <Dots shape={bt} k={k0} seed={91} glow={0.5} />
      {kSplit < 0.01 ? <Dots shape={block} k={k0} seed={92} scatter="rain" /> : <Morph a={block} b={both} k={kSplit} seed={93} />}
      <Thread a={[650, 380]} b={[650, 470]} k={k0 * (1 - kSplit)} color={C.dim} />
      <Label x={650} y={290} k={k0 * (1 - kSplit)} size={40} color={C.white}>
        вина
      </Label>
      <Node x={305} y={500} k={kSplit} label="Билл" />
      <Node x={995} y={500} k={kSplit} label="Ричи" />
      <Label x={650} y={140} k={kAt(c, 1, 1.2)} size={38} color={C.amber}>
        «не ружьё, а кораблик»
      </Label>
      <Label x={650} y={760} k={kAt(c, 2, 1.2)} size={34} color={C.teal}>
        вину можно разделить, если её назвать
      </Label>
    </Box>
  );
};

// ── s09: учителя отводят глаза; Джордж «умел видеть»
export const LookAway: React.FC<VisualProps<{ host: string }>> = (c) => {
  const kid = memo("la-kid", () => move(figure(true, "teal"), 650, 640));
  const adults = memo("la-adults", () => join(move(figure(false, "mist"), 300, 640), move(figure(false, "mist"), 1000, 640)));
  const eyesClosed = memo("la-ec", () => join(move(eye(false, "dim", 0.5), 300, 330), move(eye(false, "dim", 0.5), 1000, 330)));
  const george = memo("la-george", () => move(figure(true, "amber"), 1180, 700, 0.7));
  const gEye = memo("la-geye", () => move(eye(true, "teal", 0.55), 1180, 470));
  const k0 = kAt(c, 0, 1.6);
  const kTurn = kAt(c, 0.5, 1.6);
  const kG = kAt(c, 2, 1.6);
  const kTxt = kAt(c, 3, 1.2);
  // «заикание»: облачко из точек, которое прерывается
  const stutter = Array.from({ length: 9 }, (_, i) => i);
  return (
    <Box host={c.p.host}>
      <Dots shape={kid} k={k0} seed={101} />
      <Dots shape={adults} k={k0} seed={102} scatter="rise" dimTo={0.45} dimK={kTurn} />
      <Dots shape={eyesClosed} k={kTurn} seed={103} />
      {k0 > 0.5 &&
        stutter.map((i) => {
          const on = Math.floor(c.t * 3 + i * 0.7) % 3 !== 0;
          return on ? <circle key={i} cx={600 + i * 13} cy={400 - Math.sin(i * 0.9) * 8} r={4} fill={C.white} opacity={0.85} /> : null;
        })}
      <Label x={650} y={300} k={kTurn} size={30} color={C.mist}>
        неловкое — не замечать
      </Label>
      <Dots shape={george} k={kG} seed={104} />
      <Dots shape={gEye} k={kG} seed={105} glow={0.8} />
      <Label x={300} y={110} k={kTxt} size={36} color={C.mist}>
        учится не смотреть
      </Label>
      <Label x={1080} y={110} k={kTxt} size={36} color={C.teal}>
        умеет видеть
      </Label>
    </Box>
  );
};

// ── s09b: погреб, о котором нельзя рассказать; правило, которое легко обойти
export const Cellar: React.FC<VisualProps<{ host: string }>> = (c) => {
  const room = memo("ce-room", () => join(rect(200, 120, 900, 300, { col: "teal", gap: 13 }), line(200, 420, 1100, 420, { col: "teal", gap: 13 })));
  const stairs = memo("ce-stairs", () => join(...Array.from({ length: 6 }, (_, i) => line(330 + i * 60, 440 + i * 50, 390 + i * 60, 440 + i * 50, { col: "mist", gap: 10, r: 3.4 }))));
  const dark = memo("ce-dark", () => fillRect(220, 470, 860, 250, { col: "dim", gap: 22, r: 3 }));
  const kid = memo("ce-kid", () => move(figure(true, "amber"), 300, 410, 0.75));
  const adults = memo("ce-adults", () => join(move(figure(false, "mist"), 820, 405, 0.8), move(figure(false, "mist"), 960, 405, 0.8)));
  const shield = memo("ce-shield", () => circle(650, 280, 150, { col: "teal", gap: 12, r: 4 }));
  const k0 = kAt(c, 0, 1.6);
  const kAlone = kAt(c, 1, 1.4);
  const kRule = kAt(c, 2, 1.4);
  const kBreak = kAt(c, 2.7, 2);
  return (
    <Box host={c.p.host}>
      {kRule < 0.01 ? (
        <g>
          <Dots shape={room} k={k0} seed={111} />
          <Dots shape={stairs} k={k0} seed={112} />
          <Dots shape={dark} k={k0} seed={113} opacity={0.8} />
          <Dots shape={kid} k={k0} seed={114} glow={0.6} />
          <Dots shape={adults} k={k0} seed={115} dimTo={0.4} dimK={kAlone} />
          <Label x={890} y={170} k={kAlone} size={30} color={C.mist}>
            «глупости»
          </Label>
          <Label x={650} y={780} k={kAlone} size={34} color={C.amber}>
            один со своим страхом
          </Label>
        </g>
      ) : (
        <g>
          {/* правило-щит из точек, который рассыпается от одного «знакомства» */}
          <Dots shape={shield} k={kRule} seed={116} opacity={1 - kBreak * 0.85} scatter="burst" />
          {kBreak > 0 &&
            shield.map((d, i) => {
              const a = rnd(i, 7) * Math.PI * 2;
              const r = easeInOut(kBreak) * (60 + rnd(i, 8) * 160);
              return <circle key={i} cx={d.x + Math.cos(a) * r} cy={d.y + Math.sin(a) * r + kBreak * 120} r={3.4} fill={C.mist} opacity={(1 - kBreak) * 0.9} />;
            })}
          <Label x={650} y={290} k={kRule * (1 - kBreak)} size={34}>
            {"нельзя брать вещи\nу посторонних"}
          </Label>
          <Label x={650} y={640} k={kBreak} size={36} color={C.amber}>
            слова есть — рядом никого
          </Label>
        </g>
      )}
    </Box>
  );
};

// мост через Канал, остановка и машина, которая не тормозит
const bridge = (): Shape =>
  join(
    curve(
      [
        [80, 430],
        [400, 250],
        [900, 250],
        [1220, 430],
      ],
      { col: "teal", gap: 13, r: 4 },
    ),
    line(80, 300, 1220, 300, { col: "mist", gap: 18, r: 3 }),
    ...[250, 450, 650, 850, 1050].map((x) => line(x, 300, x, 262 + Math.abs(650 - x) * 0.12, { col: "mist", gap: 10, r: 3 })),
  );
const car = (): Shape =>
  join(
    poly(
      [
        [-110, 0],
        [-110, -40],
        [-60, -40],
        [-30, -80],
        [60, -80],
        [90, -40],
        [120, -40],
        [120, 0],
      ],
      { col: "white", gap: 11, closed: true },
    ),
    circle(-60, 4, 22, { col: "mist", gap: 9, r: 3.4 }),
    circle(70, 4, 22, { col: "mist", gap: 9, r: 3.4 }),
    fillRect(110, -36, 12, 14, { col: "amber", gap: 6, r: 3.6 }),
  );

export const BridgeNoHelp: React.FC<VisualProps<{ host: string }>> = (c) => {
  const br = memo("bn-bridge", bridge);
  const wt = memo("bn-water", () => move(water(1200, 3, "tealSoft"), 650, 520));
  const stop = memo("bn-stop", () =>
    join(line(1060, 760, 1060, 600, { col: "mist", gap: 10 }), fillRect(1030, 570, 60, 36, { col: "amber", gap: 9, r: 3.6 }), move(figure(false, "mist"), 1140, 770, 0.55), move(figure(false, "mist"), 1210, 770, 0.55), move(figure(false, "mist"), 980, 770, 0.55)),
  );
  const cr = memo("bn-car", car);
  const k0 = kAt(c, 0, 1.8);
  const kFall = kAt(c, 1, 1.4);
  const kCarStart = c.beats[2] ?? 0;
  const carX = -200 + clamp01((c.t - kCarStart) / 4.5) * 1700;
  const kStop = kAt(c, 2.4, 1.4);
  const kQ = kAt(c, 3, 1.2);
  return (
    <Box host={c.p.host}>
      <Dots shape={br} k={k0} seed={121} />
      <Dots shape={wt} k={k0} seed={122} scatter="left" />
      {/* падение: янтарная точка уходит под воду, круги */}
      {kFall > 0 && (
        <g>
          <circle cx={650} cy={250 + easeInOut(clamp01(kFall * 1.4)) * 270} r={9} fill={C.amber} opacity={1 - clamp01(kFall * 1.4 - 0.8) * 5} />
          {[0, 1, 2].map((i) => {
            const ph = clamp01(kFall * 1.6 - 0.6 - i * 0.2);
            return ph > 0 ? <ellipse key={i} cx={650} cy={525} rx={30 + ph * 150} ry={8 + ph * 26} fill="none" stroke={C.tealSoft} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" opacity={1 - ph} /> : null;
          })}
        </g>
      )}
      {c.t > kCarStart && carX < 1500 && (
        <g transform={`translate(${carX} 230)`}>
          <Dots shape={cr} k={1} />
        </g>
      )}
      <Dots shape={stop} k={kStop} seed={123} dimTo={0.5} dimK={kQ} />
      <Label x={1100} y={530} k={kStop} size={28} color={C.mist}>
        остановка
      </Label>
      <Headline x={BW / 2} y={120} k={kQ} text="НЕУЖЕЛИ НИКТО?" size={58} color={C.white} />
    </Box>
  );
};

// ── s12: решения принимают люди
export const HumanCruelty: React.FC<VisualProps<{ host: string }>> = (c) => {
  const people = memo("hc-people", () => join(move(figure(false, "white"), 250, 560, 0.85), move(figure(false, "white"), 650, 560, 0.85), move(figure(false, "white"), 1050, 560, 0.85)));
  const ghost = memo("hc-ghost", () => circle(650, 250, 120, { col: "mist", gap: 22, r: 2.6 }));
  const k0 = kAt(c, 0, 1.6);
  const kG = kAt(c, 1, 1.4);
  const kLbl = kAt(c, 2, 0.9);
  const words = ["бить", "проехать мимо", "молчать"];
  return (
    <Box host={c.p.host}>
      <Dots shape={people} k={k0} seed={131} scatter="rise" />
      <Dots shape={ghost} k={kG} seed={132} opacity={0.5} />
      <Label x={650} y={262} k={kG} size={28} color={C.mist}>
        чудовище — в показаниях
      </Label>
      {words.map((w, i) => (
        <g key={w}>
          <Node x={250 + i * 400} y={660} k={clamp01(kLbl * 3 - i)} r={18} />
          <Label x={250 + i * 400} y={730} k={clamp01(kLbl * 3 - i)} size={38} color={C.amber}>
            {w}
          </Label>
        </g>
      ))}
      <Label x={650} y={100} k={kLbl} size={36} color={C.white}>
        решения принимают люди
      </Label>
    </Box>
  );
};

// ── s13: два свидетеля → молчание суда → «Это был Дерри»
export const Witnesses: React.FC<VisualProps<{ host: string }>> = (c) => {
  const e1 = memo("wi-e1", () => move(eye(true, "teal", 0.9), 260, 200));
  const e2 = memo("wi-e2", () => move(eye(true, "teal", 0.9), 1040, 200));
  const d1 = memo("wi-d1", () => fill(Array.from({ length: 12 }, (_, i) => [260 + Math.cos((i / 12) * 6.283) * 90, 400 + Math.sin((i / 12) * 6.283) * 60] as [number, number]), { col: "mist", gap: 16, r: 3.2 }));
  const d2 = memo("wi-d2", () => fill(Array.from({ length: 5 }, (_, i) => [1040 + Math.cos((i / 5) * 6.283 - 1.57) * 95, 400 + Math.sin((i / 5) * 6.283 - 1.57) * 80] as [number, number]), { col: "mist", gap: 16, r: 3.2 }));
  const gard = memo("wi-gard", () => move(figure(false, "white"), 650, 520, 0.7));
  const k0 = kAt(c, 0, 1.6);
  const kG = kAt(c, 1, 1.4);
  const kMute = kAt(c, 2.5, 1.6);
  const kCmp = kAt(c, 4, 1.4);
  const kDerry = kAt(c, 5, 1.2);
  const y1957 = memo("wi-1957", () => move(digits("1957", 9, "teal"), 330, 690));
  const y1984 = memo("wi-1984", () => move(digits("1984", 9, "amber"), 970, 690));
  return (
    <Box host={c.p.host}>
      <g opacity={1 - kCmp * 0.75}>
        <Dots shape={e1} k={k0} seed={141} glow={0.4} />
        <Dots shape={e2} k={clamp01(k0 * 1.3 - 0.2)} seed={142} glow={0.4} />
        <Dots shape={d1} k={k0} seed={143} />
        <Dots shape={d2} k={k0} seed={144} />
        <Label x={260} y={530} k={k0} size={28} color={C.mist}>
          свидетель 1
        </Label>
        <Label x={1040} y={530} k={k0} size={28} color={C.mist}>
          свидетель 2
        </Label>
        <Dots shape={gard} k={kG} seed={145} dimTo={0.4} dimK={kMute} />
        <Label x={650} y={300} k={kG * (1 - kMute)} size={56} color={C.white}>
          ?
        </Label>
        {/* «ни слова»: рот перечёркнут линией из точек */}
        <Thread a={[560, 260]} b={[740, 260]} k={kMute} color={C.bordo} r={4} gap={12} />
        <Label x={650} y={220} k={kMute} size={34} color={C.bordo}>
          ни слова
        </Label>
      </g>
      <Dots shape={y1957} k={kCmp} seed={146} />
      <Dots shape={y1984} k={kCmp} seed={147} />
      <Label x={330} y={770} k={kCmp} size={30} color={C.white}>
        шериф: «никого не могло быть»
      </Label>
      <Label x={970} y={770} k={kCmp} size={30} color={C.white}>
        суд: о клоуне — ни слова
      </Label>
      <Headline x={BW / 2} y={90} k={kDerry} text="«ЭТО БЫЛ ДЕРРИ»" size={64} color={C.amber} />
    </Box>
  );
};

