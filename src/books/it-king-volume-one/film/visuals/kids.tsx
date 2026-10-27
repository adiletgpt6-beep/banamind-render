// Главы 4–6 (+ Стэн из главы 9): Бен, Билл, газета, разные образы страха.
import React from "react";
import { C } from "../theme";
import { album, bike, eye, figure, house } from "./shapes";
import { circle, clamp01, curve, Dots, easeInOut, fill, fillRect, join, line, memo, Morph, move, poly, rect, rnd, type Shape, type VisualProps } from "./dots";
import { Box, Headline, kAt, Label, Node, Thread } from "./kit";

// ── s21: Бен один; взрослые рядом, но с закрытыми глазами
export const LoneFigure: React.FC<VisualProps<{ host: string }>> = (c) => {
  const ben = memo("lf-ben", () => move(figure(true, "amber"), 650, 640));
  const adults = [
    { x: 230, lbl: "учительница", b: 1 },
    { x: 1070, lbl: "библиотекарша", b: 2 },
    { x: 650, lbl: "мама", b: 2.5, y: 300, s: 0.6 },
  ];
  const k0 = kAt(c, 0, 1.6);
  const kEnd = kAt(c, 3, 1.4);
  return (
    <Box host={c.p.host}>
      <circle cx={650} cy={560} r={190} fill="none" stroke={C.dim} strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" opacity={k0 * 0.8} />
      <Dots shape={ben} k={k0} seed={211} glow={0.5} />
      {adults.map((a, i) => {
        const k = kAt(c, a.b, 1.4);
        const fig = memo(`lf-ad-${i}`, () => move(figure(false, "mist"), a.x, a.y ?? 690, a.s ?? 0.85));
        const ey = memo(`lf-ey-${i}`, () => move(eye(false, "dim", 0.45), a.x, (a.y ?? 690) - (a.s ?? 0.85) * 330));
        return (
          <g key={i}>
            <Dots shape={fig} k={k} seed={212 + i} />
            <Dots shape={ey} k={kAt(c, a.b + 0.5, 1)} seed={215 + i} />
            <Label x={a.x} y={(a.y ?? 690) + 70} k={k} size={28} color={C.mist}>
              {a.lbl}
            </Label>
          </g>
        );
      })}
      <Label x={650} y={90} k={kEnd} size={40} color={C.white}>
        никто не злодей — никто не видит
      </Label>
    </Box>
  );
};

const car = (): Shape =>
  join(
    poly(
      [
        [-120, 0],
        [-120, -44],
        [-66, -44],
        [-36, -88],
        [64, -88],
        [96, -44],
        [130, -44],
        [130, 0],
      ],
      { col: "white", gap: 11, closed: true },
    ),
    circle(-64, 4, 24, { col: "mist", gap: 9, r: 3.4 }),
    circle(76, 4, 24, { col: "mist", gap: 9, r: 3.4 }),
    fillRect(-26, -80, 40, 30, { col: "dim", gap: 9, r: 3 }),
    fillRect(26, -80, 30, 30, { col: "dim", gap: 9, r: 3 }),
  );

// ── s22: машина с пожилой парой проезжает мимо; «манекены»
export const PassingCar: React.FC<VisualProps<{ host: string }>> = (c) => {
  const road = memo("pc-road", () => join(line(40, 470, 1260, 470, { col: "mist", gap: 14, r: 3 }), line(40, 500, 1260, 500, { col: "dim", gap: 22, r: 2.4 })));
  const rail = memo("pc-rail", () => join(line(40, 560, 1260, 560, { col: "teal", gap: 12, r: 3.4 }), ...Array.from({ length: 11 }, (_, i) => line(80 + i * 112, 560, 80 + i * 112, 620, { col: "teal", gap: 12, r: 3.4 }))));
  const kids = memo("pc-kids", () => join(move(figure(true, "amber"), 650, 760, 0.8), move(figure(true, "mist"), 520, 760, 0.85), move(figure(true, "mist"), 780, 760, 0.85), move(figure(true, "mist"), 900, 760, 0.85)));
  const cr = memo("pc-car", car);
  const k0 = kAt(c, 0, 1.6);
  const tc = c.beats[1] ?? 0;
  const span = Math.max(5, (c.ends[1] ?? tc + 6) - tc + 2.5);
  const cx = -180 + clamp01((c.t - tc) / span) * 1680;
  const kGone = kAt(c, 2, 1.2);
  const kWho = kAt(c, 3, 1.4);
  return (
    <Box host={c.p.host}>
      <Dots shape={road} k={k0} seed={221} scatter="left" />
      <Dots shape={rail} k={k0} seed={222} />
      <Dots shape={kids} k={k0} seed={223} dimTo={0.55} dimK={kAt(c, 1.5, 1.2)} />
      {c.t > tc && cx < 1480 && (
        <g transform={`translate(${cx} 455)`}>
          <Dots shape={cr} k={1} />
          {/* взгляд в сторону детей — луч из точек на миг */}
          {cx > 450 && cx < 850 && <Thread a={[20, -50]} b={[20, 200]} k={1} color={C.mist} gap={18} r={2.4} opacity={0.5} />}
        </g>
      )}
      <Label x={650} y={300} k={kAt(c, 1.6, 1.2)} size={36} color={C.mist}>
        «манекены, на которых никто не смотрит»
      </Label>
      <Label x={650} y={180} k={kGone} size={40} color={C.white}>
        свидетель рядом — помощи нет
      </Label>
      <Label x={650} y={100} k={kWho} size={34} color={C.amber}>
        причина — в злости Генри, не в Бене
      </Label>
    </Box>
  );
};

// ── s23: Бен молчит; «мне страшно — и ей тоже»
export const Secret: React.FC<VisualProps<{ host: string }>> = (c) => {
  const ben = memo("se-ben", () => move(figure(true, "amber"), 380, 650));
  const mom = memo("se-mom", () => move(figure(false, "mist"), 900, 650));
  const wall = memo("se-wall", () => line(640, 200, 640, 700, { col: "dim", gap: 12, r: 4 }));
  const teacher = memo("se-teacher", () => move(figure(false, "teal"), 900, 650));
  const k0 = kAt(c, 0, 1.6);
  const kWall = kAt(c, 1, 1.4);
  const kTeach = kAt(c, 2, 1.6);
  const kStream = kAt(c, 3.5, 1.8);
  return (
    <Box host={c.p.host}>
      <Dots shape={ben} k={k0} seed={231} glow={0.4} />
      {kTeach < 0.01 ? <Dots shape={mom} k={k0} seed={232} /> : <Morph a={mom} b={teacher} k={kTeach} seed={233} />}
      <Dots shape={wall} k={kWall * (1 - kTeach)} seed={234} />
      <Label x={640} y={150} k={kWall * (1 - kTeach)} size={34} color={C.mist}>
        молчание
      </Label>
      {/* общее чувство: две одинаковые янтарные точки над головами */}
      <Node x={380} y={300} k={kTeach} r={18} />
      <Node x={900} y={240} k={kTeach} r={18} />
      <Thread a={[400, 300]} b={[880, 240]} k={kAt(c, 2.5, 1.4)} color={C.amber} gap={16} opacity={0.6} />
      <Label x={640} y={120} k={kAt(c, 2.5, 1.2)} size={34} color={C.amber}>
        мне страшно — и ей тоже
      </Label>
      <Label x={640} y={780} k={kStream} size={30} color={C.teal}>
        у ручья: Бен встречает Билла
      </Label>
    </Box>
  );
};

// ── s23b: библиотека со стеклянным коридором → вертикальный коридор
const libraryShape = (): Shape =>
  join(
    rect(80, 280, 330, 360, { col: "teal", gap: 12 }),
    rect(890, 330, 330, 310, { col: "teal", gap: 12 }),
    rect(410, 440, 480, 110, { col: "white", gap: 11 }),
    ...[460, 560, 660, 760, 840].map((x) => line(x, 440, x, 550, { col: "mist", gap: 10, r: 2.8 })),
    fillRect(120, 330, 250, 60, { col: "amber", gap: 13, r: 3.4 }),
  );
const towerShape = (): Shape =>
  join(
    rect(560, 120, 180, 560, { col: "white", gap: 11 }),
    ...Array.from({ length: 9 }, (_, i) => line(560, 170 + i * 56, 740, 170 + i * 56, { col: "mist", gap: 10, r: 2.8 })),
    rect(400, 560, 160, 120, { col: "teal", gap: 12 }),
    rect(740, 520, 160, 160, { col: "teal", gap: 12 }),
  );
export const Library: React.FC<VisualProps<{ host: string }>> = (c) => {
  const lib = memo("lb-lib", libraryShape);
  const tow = memo("lb-tow", towerShape);
  const k0 = kAt(c, 0, 1.6);
  const kLib = kAt(c, 1, 1.6);
  const kM = kAt(c, 2, 2.6);
  const kEnd = kAt(c, 3, 1.2);
  // реплика 0: «переваривает прошлое» — волны точек внутрь
  return (
    <Box host={c.p.host}>
      {kLib < 0.01 ? (
        <g>
          {Array.from({ length: 5 }, (_, i) => {
            const ph = (c.t * 0.5 + i * 0.2) % 1;
            return <circle key={i} cx={650} cy={400} r={330 - ph * 300} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="2 14" strokeLinecap="round" opacity={k0 * ph * 0.8} />;
          })}
          <Label x={650} y={410} k={k0} size={40} color={C.white}>
            «меня переваривает моё прошлое»
          </Label>
        </g>
      ) : kM < 0.01 ? (
        <Dots shape={lib} k={kLib} seed={241} glow={0.3} />
      ) : (
        <Morph a={lib} b={tow} k={kM} seed={242} />
      )}
      <Label x={650} y={230} k={kLib * (1 - kM)} size={32} color={C.mist}>
        стеклянный коридор — убежище
      </Label>
      <Label x={650} y={760} k={kM} size={32} color={C.teal}>
        тот же коридор, только вертикальный
      </Label>
      <Label x={650} y={80} k={kEnd} size={36} color={C.amber}>
        память живёт в работе
      </Label>
    </Box>
  );
};

// ── s24: велосипед — «Гони!»; скорость отгоняет горе
export const Bike: React.FC<VisualProps<{ host: string }>> = (c) => {
  const bk = memo("bi-bike", () => bike("teal"));
  const hill = memo("bi-hill", () =>
    curve(
      [
        [0, 300],
        [400, 280],
        [800, 700],
        [1300, 720],
      ],
      { col: "mist", gap: 15, r: 3.2 },
    ),
  );
  const k0 = kAt(c, 0, 1.6);
  const kGo = kAt(c, 1, 3.5);
  const kNote = kAt(c, 3, 1.4);
  const u = easeInOut(kGo);
  const bx = (1 - u) ** 3 * 0 + 3 * (1 - u) ** 2 * u * 400 + 3 * (1 - u) * u * u * 800 + u ** 3 * 1300;
  const by = (1 - u) ** 3 * 300 + 3 * (1 - u) ** 2 * u * 280 + 3 * (1 - u) * u * u * 700 + u ** 3 * 720;
  const bx0 = 240;
  const by0 = 290;
  const x = kGo > 0 ? Math.min(1050, bx + 200) : bx0;
  const y = kGo > 0 ? Math.min(650, by - 80) : by0 - 90;
  const sp = kGo > 0 && kGo < 1;
  const note = memo("bi-note", () => join(rect(-80, -60, 160, 120, { col: "paper", gap: 11 }), ...[0, 1, 2].map((i) => line(-55, -25 + i * 26, 55 - i * 20, -25 + i * 26, { col: "mist", gap: 10, r: 2.8 }))));
  return (
    <Box host={c.p.host}>
      <Dots shape={hill} k={k0} seed={251} scatter="left" />
      <g transform={`translate(${x} ${y}) scale(0.75) rotate(${kGo > 0 ? 14 * Math.sin(u * Math.PI) : 0})`}>
        <Dots shape={bk} k={k0} seed={252} glow={0.4} />
      </g>
      {sp &&
        Array.from({ length: 6 }, (_, i) => <line key={i} x1={x - 140 - i * 10} y1={y - 60 + i * 22} x2={x - 260 - i * 30} y2={y - 60 + i * 22} stroke={C.white} strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" opacity={0.5} />)}
      <Headline x={400} y={200} k={kAt(c, 1, 0.8) * (1 - kNote)} text="«ГОНИ!»" size={84} color={C.amber} />
      <Label x={900} y={160} k={kAt(c, 2, 1.2) * (1 - kNote)} size={32} color={C.mist}>
        на спуске горе отстаёт
      </Label>
      <g transform="translate(1050 260)">
        <Dots shape={note} k={kNote} seed={253} />
      </g>
      <Label x={1050} y={390} k={kNote} size={30} color={C.amber}>
        записка вместо речи
      </Label>
    </Box>
  );
};

// ── s25: ледяная пустыня на кушетке
const couch = (): Shape =>
  join(
    poly(
      [
        [-420, 0],
        [-420, -120],
        [420, -120],
        [420, 0],
      ],
      { col: "teal", gap: 12 },
    ),
    line(-460, 0, 460, 0, { col: "teal", gap: 12 }),
    line(-460, 0, -460, -80, { col: "teal", gap: 12 }),
    line(460, 0, 460, -80, { col: "teal", gap: 12 }),
    line(-440, 40, -440, 0, { col: "teal", gap: 12 }),
    line(440, 40, 440, 0, { col: "teal", gap: 12 }),
  );
export const IceCouch: React.FC<VisualProps<{ host: string }>> = (c) => {
  const ch = memo("ic-couch", () => move(couch(), 650, 600));
  const par = memo("ic-par", () => join(move(figure(false, "mist"), 300, 590, 0.75), move(figure(false, "mist"), 1000, 590, 0.75)));
  const ice = memo("ic-ice", () => fill(Array.from({ length: 6 }, (_, i) => [650 + Math.cos((i / 6) * 6.283) * 170, 470 + Math.sin((i / 6) * 6.283) * 110] as [number, number]), { col: "white", gap: 18, r: 2.8 }));
  const bill = memo("ic-bill", () => move(figure(true, "amber"), 650, 820, 0.6));
  const k0 = kAt(c, 0, 1.6);
  const kIce = kAt(c, 1, 2);
  const kTears = kAt(c, 2, 1.2);
  const kUnseen = kAt(c, 3, 1.6);
  const kGhost = kAt(c, 4, 1.6);
  return (
    <Box host={c.p.host}>
      <Dots shape={ch} k={k0} seed={261} />
      <Dots shape={par} k={k0} seed={262} />
      <Dots shape={ice} k={kIce} seed={263} glow={0.3} />
      <Label x={650} y={300} k={kIce} size={34} color={C.white}>
        ледяная пустыня — между ними
      </Label>
      {kTears > 0 &&
        [300, 1000].map((x, i) =>
          [0, 1, 2].map((j) => {
            const ph = (c.t * 0.7 + j * 0.33 + i * 0.5) % 1;
            return <circle key={`${i}-${j}`} cx={x + 12} cy={360 + ph * 120} r={3.4} fill={C.teal} opacity={kTears * (1 - ph)} />;
          }),
        )}
      <Label x={650} y={210} k={kTears} size={30} color={C.mist}>
        плачут порознь
      </Label>
      {/* живой сын рядом — но точки его фигуры гаснут: «привидение» */}
      <Dots shape={bill} k={kUnseen} seed={264} dimTo={0.22} dimK={kGhost} />
      <Label x={650} y={110} k={kGhost} size={36} color={C.amber}>
        невидимый живой сын
      </Label>
    </Box>
  );
};

// ── s25b: комната брата — любить и бояться одновременно
export const BrotherRoom: React.FC<VisualProps<{ host: string }>> = (c) => {
  const door = memo("br-door", () => join(rect(520, 180, 260, 480, { col: "teal", gap: 12 }), fillRect(740, 420, 16, 16, { col: "amber", gap: 6, r: 3.4 })));
  const al = memo("br-album", () => move(album("paper"), 650, 420, 0.6));
  const bill = memo("br-bill", () => move(figure(true, "amber"), 330, 680, 0.8));
  const k0 = kAt(c, 0, 1.6);
  const kIn = kAt(c, 0.6, 2);
  const kBoth = kAt(c, 1, 1.4);
  const kAdults = kAt(c, 2, 1.4);
  const bx = 330 + easeInOut(kIn) * 200;
  return (
    <Box host={c.p.host}>
      <Dots shape={door} k={k0} seed={271} dimTo={0.4} dimK={kIn} />
      <Dots shape={al} k={kIn} seed={272} glow={0.4} />
      <g transform={`translate(${bx - 330} 0)`}>
        <Dots shape={bill} k={k0} seed={273} glow={0.5} />
      </g>
      <Node x={560} y={180} k={kBoth} r={18} color={C.amber} />
      <Node x={740} y={180} k={kBoth} r={18} color={C.teal} />
      <Label x={560} y={130} k={kBoth} size={30} color={C.amber}>
        любовь
      </Label>
      <Label x={740} y={130} k={kBoth} size={30} color={C.teal}>
        страх
      </Label>
      <Label x={1080} y={300} k={kAdults} size={30} color={C.mist}>
        {"взрослые\nзакрывают дверь"}
      </Label>
      <Label x={1080} y={520} k={kAdults} size={30} color={C.amber}>
        {"ребёнок\nидёт сам"}
      </Label>
    </Box>
  );
};

// ── s26: смех трёх — первые три точки сети
export const ThreeLaugh: React.FC<VisualProps<{ host: string }>> = (c) => {
  const pts: [number, number][] = [
    [360, 520],
    [650, 300],
    [940, 520],
  ];
  const names = ["Эдди", "Билл", "Бен"];
  const k0 = kAt(c, 0, 1.4);
  const kNet = kAt(c, 1, 1.8);
  return (
    <Box host={c.p.host}>
      {pts.map(([x, y], i) => (
        <g key={i}>
          <Node x={x} y={y} k={clamp01(k0 * 2 - i * 0.3)} r={30} label={names[i]} />
          {/* смех: маленькие точки-волны */}
          {k0 > 0.5 &&
            [0, 1, 2].map((j) => {
              const ph = (c.t * 1.4 + j * 0.33 + i * 0.2) % 1;
              return <circle key={j} cx={x + 40 + ph * 50} cy={y - 40 - ph * 40} r={3.6} fill={C.white} opacity={(1 - ph) * 0.8 * (1 - kNet * 0.5)} />;
            })}
        </g>
      ))}
      <Thread a={pts[0]} b={pts[1]} k={kNet} color={C.teal} />
      <Thread a={pts[1]} b={pts[2]} k={kNet} color={C.teal} />
      <Thread a={pts[0]} b={pts[2]} k={kNet} color={C.teal} />
      <Label x={650} y={720} k={kNet} size={38} color={C.amber}>
        голос не теряется, а дополняет
      </Label>
    </Box>
  );
};

// ── s27: газета против правды текста
const paper = (): Shape =>
  join(
    rect(-260, -320, 520, 640, { col: "paper", gap: 12 }),
    fillRect(-220, -280, 440, 60, { col: "mist", gap: 12, r: 3.4 }),
    ...Array.from({ length: 10 }, (_, i) => line(-220, -180 + i * 44, -20, -180 + i * 44, { col: "dim", gap: 11, r: 2.8 })),
    ...Array.from({ length: 10 }, (_, i) => line(20, -180 + i * 44, 220, -180 + i * 44, { col: "dim", gap: 11, r: 2.8 })),
  );
export const Newspaper: React.FC<VisualProps<{ host: string }>> = (c) => {
  const np = memo("np-paper", () => move(paper(), 400, 400, 0.95));
  const k0 = kAt(c, 0, 1.6);
  const kTruth = kAt(c, 1.5, 1.6);
  const kSchool = kAt(c, 2, 1.4);
  const kTen = kAt(c, 3, 1.4);
  return (
    <Box host={c.p.host}>
      <Dots shape={np} k={k0} seed={281} scatter="rain" opacity={1 - kTruth * 0.35} />
      <Label x={400} y={130} k={k0} size={30} color={C.white}>
        ПРОПАВШИЙ МАЛЬЧИК
      </Label>
      <Label x={400} y={760} k={k0} size={28} color={C.mist}>
        публичная версия
      </Label>
      {/* правда текста: рассказчик опровергает газету — бирюзовая метка */}
      <Thread a={[180, 300]} b={[620, 620]} k={kTruth} color={C.teal} r={4.4} gap={13} />
      <Label x={980} y={260} k={kTruth} size={34} color={C.teal}>
        {"рассказчик:\nгазеты ошиблись"}
      </Label>
      <Label x={980} y={460} k={kSchool} size={32} color={C.amber}>
        {"«забудьте об этом,\nесли не хотите выговора»"}
      </Label>
      <Label x={980} y={650} k={kTen} size={34} color={C.white}>
        {"десять убийств\nне раскрыты"}
      </Label>
    </Box>
  );
};

// ── s28: у каждого свой страх — одна точка-узел, разные силуэты
const silhouettes = (): Shape[] => [
  // клоун-мумия Бена — условная фигура в бинтах (полосы)
  join(move(figure(false, "mist"), 0, 120, 0.7), ...[-60, -20, 20, 60].map((y) => line(-50, y, 50, y + 14, { col: "paper", gap: 10, r: 3 }))),
  // заброшенный дом Эдди
  move(house(220, 160, 2, 1, [false, false], "mist"), 0, 130),
  // фотография Билла
  move(album("paper"), 0, 0, 0.55),
  // облик погибшего брата — маленькая фигура
  move(figure(true, "mist"), 0, 140, 0.8),
  // киномонстр/оборотень — условный силуэт с острыми ушами
  join(
    move(figure(false, "mist"), 0, 140, 0.75),
    poly(
      [
        [-34, -160],
        [-20, -210],
        [-6, -168],
      ],
      { col: "mist", gap: 9 },
    ),
    poly(
      [
        [6, -168],
        [20, -210],
        [34, -160],
      ],
      { col: "mist", gap: 9 },
    ),
  ),
];
const FEAR_NAMES = ["Бен", "Эдди", "Билл", "Эдди Коркоран", "Ричи и Билл"];
export const FearMasks: React.FC<VisualProps<{ host: string }>> = (c) => {
  const each = silhouettes();
  const k0 = kAt(c, 0, 1.2);
  const beatsFor = [1, 1.3, 1.6, 2, 3];
  const kSame = kAt(c, 4, 1.8);
  return (
    <Box host={c.p.host}>
      <Label x={650} y={90} k={k0} size={36} color={C.white}>
        у каждого — свой образ страха
      </Label>
      {each.map((s, i) => {
        const k = kAt(c, beatsFor[i], 1.4);
        const sh = memo(`fm-${i}`, () => move(s, 160 + i * 245, 420));
        return (
          <g key={i}>
            <Dots shape={sh} k={k} seed={290 + i} />
            <Label x={160 + i * 245} y={640} k={k} size={26} color={C.mist}>
              {FEAR_NAMES[i]}
            </Label>
            {/* нить от образа к личной боли — общий центр снизу */}
            <Thread a={[160 + i * 245, 680]} b={[650, 760]} k={kSame} color={C.amber} gap={16} r={2.6} opacity={0.7} />
          </g>
        );
      })}
      <Node x={650} y={760} k={kSame} r={20} />
      <Label x={650} y={180} k={kSame} size={32} color={C.amber}>
        форма — из личной боли
      </Label>
    </Box>
  );
};

// ── s29: все поднимают головы — сеть проступает; Майк молчит перед отцом
export const Simultaneity: React.FC<VisualProps<{ host: string }>> = (c) => {
  const kids: [number, number, string][] = [
    [200, 300, "Бен"],
    [460, 220, "Эдди"],
    [760, 220, "Беверли"],
    [1060, 300, "Майк"],
    [330, 560, "Ричи"],
    [970, 560, "Билл"],
  ];
  const k0 = kAt(c, 0, 1.8);
  const kPar = kAt(c, 1, 1.4);
  const kUp = kAt(c, 1.5, 1.2);
  const kNet = kAt(c, 2, 2);
  const kMike = kAt(c, 3, 1.4);
  return (
    <Box host={c.p.host}>
      {kids.map(([x, y, n], i) => (
        <g key={n}>
          <Node x={x} y={y - kUp * 20} k={clamp01(k0 * 2 - i * 0.15)} r={22} lit={kNet > 0 ? 1 : 0.4} label={n} labelDy={58} labelSize={28} />
          {/* рядом — родитель: приглушённая точка */}
          <Node x={x + 70} y={y + 40} k={kPar} r={12} lit={0} />
        </g>
      ))}
      {kids.map(([x, y], i) =>
        kids.slice(i + 1).map(([x2, y2], j) => (rnd(i * 7 + j, 3) < 0.45 ? <Thread key={`${i}-${j}`} a={[x, y - kUp * 20]} b={[x2, y2 - kUp * 20]} k={kNet} color={C.teal} gap={18} r={2.4} opacity={0.6} /> : null)),
      )}
      <Label x={650} y={430} k={kUp} size={32} color={C.white}>
        все невольно поднимают головы
      </Label>
      <Label x={650} y={760} k={kMike} size={32} color={C.amber}>
        «чем меньше слов, тем лучше»
      </Label>
    </Box>
  );
};

// ── s29b: страх Стэна — трещина в порядке; спасение названиями птиц
export const OrderCrack: React.FC<VisualProps<{ host: string }>> = (c) => {
  const grid = memo("oc-grid", () => {
    const out: Shape = [];
    for (let y = 0; y < 9; y++) for (let x = 0; x < 15; x++) out.push({ x: 220 + x * 62, y: 150 + y * 62, r: 4, c: 0 });
    return out;
  });
  const crack = memo("oc-crack", () =>
    poly(
      [
        [380, 120],
        [520, 300],
        [470, 400],
        [650, 520],
        [600, 640],
        [780, 720],
      ],
      { col: "bordo", gap: 11, r: 3.6 },
    ),
  );
  const k0 = kAt(c, 0, 1.6);
  const kCrack = kAt(c, 1, 1.6);
  const kBirds = kAt(c, 2, 2);
  const kEnd = kAt(c, 3, 1.4);
  const near = (x: number, y: number) => {
    // расстояние до ломаной трещины (грубо)
    const pts = [
      [380, 120],
      [520, 300],
      [470, 400],
      [650, 520],
      [600, 640],
      [780, 720],
    ];
    let m = 1e9;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
      m = Math.min(m, Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)));
    }
    return m;
  };
  const birds = ["Малиновки!", "Гагары!", "Серые цапли!", "Галки!"];
  return (
    <Box host={c.p.host}>
      <Dots shape={grid} k={k0} seed={301} only={(d) => !(kCrack > 0.3 && near(d.x, d.y) < 48 * kCrack)} />
      <Dots shape={crack} k={kCrack} seed={302} />
      <Label x={650} y={90} k={kCrack} size={34} color={C.bordo}>
        «не испугали, а оскорбили»
      </Label>
      {birds.map((b, i) => (
        <Label key={b} x={1120} y={220 + i * 110} k={clamp01(kBirds * 2 - i * 0.3)} size={32} color={C.teal} anchor="middle">
          {b}
        </Label>
      ))}
      <Label x={650} y={778} k={kEnd} size={32} color={C.amber}>
        своя уязвимость — и своя опора
      </Label>
    </Box>
  );
};

