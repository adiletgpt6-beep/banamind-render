// Предметные силуэты BM-020 из точек. Все предметы — собственные условные
// рисунки для объяснения (не кадры экранизаций, не обложка издательства).
// Координаты локальные (центр предмета ≈ 0,0), размещение — move().
import { circle, curve, disc, fill, fillRect, join, line, move, poly, rect, type ColName, type Shape } from "./dots";

type P = [number, number];

// бумажный кораблик: корпус-трапеция и сложенный парус
export const boat = (col: ColName = "paper", gap = 11): Shape =>
  join(
    poly(
      [
        [-170, 0],
        [170, 0],
        [120, 70],
        [-120, 70],
      ],
      { closed: true, col, gap },
    ),
    poly(
      [
        [-110, 0],
        [0, -150],
        [110, 0],
      ],
      { col, gap },
    ),
    line(0, -150, 0, 0, { col, gap, r: 3 }),
    fill(
      [
        [-150, 8],
        [150, 8],
        [114, 62],
        [-114, 62],
      ],
      { col, gap: 17, r: 3 },
    ),
  );

// водосток у тротуара: решётка из прутьев
export const drain = (col: ColName = "mist"): Shape =>
  join(rect(-150, -40, 300, 80, { col, gap: 12 }), ...[-100, -50, 0, 50, 100].map((x) => line(x, -34, x, 34, { col, gap: 11, r: 3.5 })));

// дождь/вода: волнистые линии
export const water = (w: number, rows = 3, col: ColName = "tealSoft", y0 = 0): Shape =>
  join(
    ...Array.from({ length: rows }, (_, r) =>
      curve(
        [
          [-w / 2, y0 + r * 34],
          [-w / 6, y0 + r * 34 - 18],
          [w / 6, y0 + r * 34 + 18],
          [w / 2, y0 + r * 34],
        ],
        { col, gap: 15, r: 3 },
      ),
    ),
  );

// дом: контур, крыша, окна (lit — какие окна горят)
export const house = (w = 260, h = 200, cols = 3, rows = 2, lit: boolean[] = [], col: ColName = "teal"): Shape => {
  const walls = rect(-w / 2, -h, w, h, { col, gap: 12 });
  const roof = poly(
    [
      [-w / 2 - 24, -h],
      [0, -h - w * 0.42],
      [w / 2 + 24, -h],
    ],
    { col, gap: 12 },
  );
  const win: Shape[] = [];
  const ww = (w - 40) / cols - 22;
  const wh = (h - 50) / rows - 26;
  let n = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = -w / 2 + 20 + c * ((w - 40) / cols) + 11;
      const y = -h + 22 + r * ((h - 50) / rows) + 6;
      win.push(fillRect(x, y, ww, wh, { col: lit[n] ? "amber" : "dim", gap: 10, r: 3.4 }));
      n++;
    }
  return join(walls, roof, ...win);
};

// старый телефон: корпус, диск, трубка
export const phone = (col: ColName = "teal"): Shape =>
  join(
    poly(
      [
        [-130, 90],
        [130, 90],
        [95, -20],
        [-95, -20],
      ],
      { closed: true, col, gap: 12 },
    ),
    circle(0, 36, 42, { col: "amber", gap: 11 }),
    circle(0, 36, 14, { col: "amber", gap: 9, r: 3 }),
    curve(
      [
        [-150, -40],
        [-120, -110],
        [120, -110],
        [150, -40],
      ],
      { col, gap: 11, r: 5 },
    ),
    disc(-140, -42, 26, { col, gap: 11, r: 3.4 }),
    disc(140, -42, 26, { col, gap: 11, r: 3.4 }),
  );

// раскрытая тетрадь/рукопись со строками
export const manuscript = (col: ColName = "paper", lines = 7): Shape => {
  const page = (x: number) =>
    join(
      rect(x, -170, 230, 320, { col, gap: 12 }),
      ...Array.from({ length: lines }, (_, i) => line(x + 26, -128 + i * 38, x + 204 - ((i * 37) % 60), -128 + i * 38, { col: "mist", gap: 10, r: 2.8 })),
    );
  return join(page(-240), page(10), line(0, -176, 0, 156, { col, gap: 10, r: 3 }));
};

// фигурка человека: голова и тело (child — ниже ростом)
export const figure = (child = false, col: ColName = "white"): Shape => {
  const s = child ? 0.72 : 1;
  return join(
    disc(0, -230 * s, 34 * s, { col, gap: 10, r: 3.6 }),
    fill(
      [
        [-48 * s, -180 * s],
        [48 * s, -180 * s],
        [62 * s, -40 * s],
        [-62 * s, -40 * s],
      ],
      { col, gap: 12, r: 3.6 },
    ),
    line(-30 * s, -40 * s, -36 * s, 40 * s, { col, gap: 11 }),
    line(30 * s, -40 * s, 36 * s, 40 * s, { col, gap: 11 }),
  );
};

// глаз свидетеля: миндаль и зрачок (open=false — закрытый, линия)
export const eye = (open = true, col: ColName = "teal", s = 1): Shape =>
  open
    ? join(
        curve(
          [
            [-90 * s, 0],
            [-30 * s, -60 * s],
            [30 * s, -60 * s],
            [90 * s, 0],
          ],
          { col, gap: 11 },
        ),
        curve(
          [
            [-90 * s, 0],
            [-30 * s, 60 * s],
            [30 * s, 60 * s],
            [90 * s, 0],
          ],
          { col, gap: 11 },
        ),
        disc(0, 0, 24 * s, { col: "amber", gap: 9, r: 3.4 }),
      )
    : curve(
        [
          [-90 * s, 0],
          [-30 * s, 36 * s],
          [30 * s, 36 * s],
          [90 * s, 0],
        ],
        { col: "mist", gap: 10, r: 4.4 },
      );

// раковина: чаша, кран, слив
export const sink = (col: ColName = "white"): Shape =>
  join(
    curve(
      [
        [-200, -40],
        [-190, 110],
        [190, 110],
        [200, -40],
      ],
      { col, gap: 12 },
    ),
    line(-220, -40, 220, -40, { col, gap: 12 }),
    poly(
      [
        [0, -40],
        [0, -130],
        [70, -130],
        [70, -105],
      ],
      { col, gap: 11 },
    ),
    circle(0, 60, 16, { col: "mist", gap: 8, r: 3 }),
  );

// плотина: ряд кольев и досок, вода выше и ниже
export const dam = (col: ColName = "amber"): Shape =>
  join(
    ...Array.from({ length: 9 }, (_, i) => line(-260 + i * 65, -70, -260 + i * 65, 70, { col, gap: 11, r: 4.2 })),
    line(-290, -20, 290, -20, { col, gap: 11, r: 3.6 }),
    line(-290, 30, 290, 30, { col, gap: 11, r: 3.6 }),
    move(water(520, 2, "teal"), -560, -30),
    move(water(520, 2, "tealSoft"), 560, 0),
  );

// велосипед
export const bike = (col: ColName = "teal"): Shape =>
  join(
    circle(-130, 40, 80, { col, gap: 12 }),
    circle(130, 40, 80, { col, gap: 12 }),
    poly(
      [
        [-130, 40],
        [-30, -60],
        [90, -60],
        [130, 40],
      ],
      { col: "amber", gap: 12 },
    ),
    line(-30, -60, 0, 40, { col: "amber", gap: 12 }),
    line(0, 40, -130, 40, { col: "amber", gap: 12 }),
    line(90, -60, 80, -110, { col, gap: 11 }),
    line(60, -110, 110, -110, { col, gap: 11 }),
  );

// фотоальбом: страница и снимок
export const album = (col: ColName = "paper"): Shape =>
  join(
    rect(-220, -160, 440, 320, { col, gap: 12 }),
    rect(-150, -110, 300, 200, { col: "mist", gap: 11 }),
    fillRect(-130, -90, 260, 160, { col: "dim", gap: 14, r: 3 }),
  );

// дом с заколоченными окнами (условный, не конкретный кадр)
export const oldHouse = (col: ColName = "mist"): Shape =>
  join(
    rect(-200, -260, 400, 260, { col, gap: 12 }),
    poly(
      [
        [-230, -260],
        [0, -420],
        [230, -260],
      ],
      { col, gap: 12 },
    ),
    rect(-40, -120, 80, 120, { col: "dim", gap: 10 }),
    ...[-130, 90].map((x) => join(rect(x, -210, 60, 60, { col: "dim", gap: 10 }), line(x, -210, x + 60, -150, { col, gap: 9, r: 3 }), line(x + 60, -210, x, -150, { col, gap: 9, r: 3 }))),
  );

// клуб-барак с вывеской (вторая интерлюдия) — простой силуэт
export const club = (col: ColName = "teal"): Shape =>
  join(
    rect(-260, -200, 520, 200, { col, gap: 12 }),
    poly(
      [
        [-280, -200],
        [-180, -270],
        [180, -270],
        [280, -200],
      ],
      { col, gap: 12 },
    ),
    rect(-50, -110, 100, 110, { col: "amber", gap: 10 }),
    ...[-200, -120, 120, 200].map((x) => fillRect(x - 25, -160, 50, 46, { col: "amber", gap: 10, r: 3.4 })),
  );

// нить свидетельств: узлы и связи
export const network = (nodes: P[], edges: [number, number][], col: ColName = "teal"): Shape =>
  join(...nodes.map(([x, y]) => disc(x, y, 18, { col: "amber", gap: 9, r: 3.6 })), ...edges.map(([a, b]) => line(nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1], { col, gap: 16, r: 2.6 })));

// цифры точечной матрицей 5×7 (годы: 1957, 1958, 1984, 1985)
const DIG: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  "·": ["00000", "00000", "00000", "00100", "00000", "00000", "00000"],
  "–": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
};
export const digits = (s: string, cell = 14, col: ColName = "amber"): Shape => {
  const out: Shape = [];
  const w = s.length * 6 * cell;
  [...s].forEach((ch, k) => {
    const g = DIG[ch];
    if (!g) return;
    g.forEach((row, y) => [...row].forEach((v, x) => v === "1" && out.push({ x: -w / 2 + (k * 6 + x) * cell, y: (y - 3) * cell, r: cell * 0.36, c: 0 })));
  });
  return out.map((d) => ({ ...d, c: { teal: 0, amber: 1, white: 2, mist: 3, dim: 4, bordo: 5, tealSoft: 6, paper: 7 }[col] }));
};

// условный город: река, улицы, кварталы-домики. Это авторская схема для
// объяснения, а не точная карта Дерри из книги.
export type TownBlock = { x: number; y: number; w: number; h: number; id: number };
export const TOWN_BLOCKS: TownBlock[] = (() => {
  const out: TownBlock[] = [];
  let id = 0;
  const xs = [150, 390, 630, 1130, 1370, 1610];
  const ys = [150, 390, 630];
  for (const y of ys) for (const x of xs) out.push({ x, y, w: 200, h: 200, id: id++ });
  return out;
})();
export const town = (): Shape => {
  // река с каналом посередине карты (вертикальная лента)
  const river = join(
    curve(
      [
        [880, 60],
        [820, 330],
        [960, 620],
        [880, 900],
      ],
      { col: "tealSoft", gap: 14, r: 3.4 },
    ),
    curve(
      [
        [990, 60],
        [930, 330],
        [1070, 620],
        [990, 900],
      ],
      { col: "tealSoft", gap: 14, r: 3.4 },
    ),
  );
  const streets = join(
    ...[130, 370, 610, 850].map((y) => join(line(110, y, 840, y, { col: "mist", gap: 18, r: 2.6 }), line(1060, y, 1830, y, { col: "mist", gap: 18, r: 2.6 }))),
    ...[130, 370, 610, 850, 1110, 1350, 1590, 1830].map((x) => line(x, 130, x, 850, { col: "mist", gap: 18, r: 2.6 })),
  );
  const houses = join(
    ...TOWN_BLOCKS.map((b) =>
      join(
        rect(b.x + 30, b.y + 40, b.w - 60, b.h - 70, { col: "teal", gap: 13, r: 3.4 }),
        poly(
          [
            [b.x + 22, b.y + 40],
            [b.x + b.w / 2, b.y + 6],
            [b.x + b.w - 22, b.y + 40],
          ],
          { col: "teal", gap: 13, r: 3.4 },
        ),
      ),
    ),
  );
  return join(river, streets, houses);
};
// окна каждого квартала (отдельно — чтобы гасить/зажигать)
export const townWindows = (): Shape =>
  join(
    ...TOWN_BLOCKS.map((b) =>
      join(
        fillRect(b.x + 52, b.y + 66, 40, 34, { col: "amber", gap: 10, r: 3.4 }),
        fillRect(b.x + b.w - 92, b.y + 66, 40, 34, { col: "amber", gap: 10, r: 3.4 }),
        fillRect(b.x + 52, b.y + 118, 40, 34, { col: "amber", gap: 10, r: 3.4 }),
        fillRect(b.x + b.w - 92, b.y + 118, 40, 34, { col: "amber", gap: 10, r: 3.4 }),
      ),
    ),
  );
export const blockOf = (x: number, y: number) => TOWN_BLOCKS.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)?.id ?? -1;
