// Глава 9, вторая интерлюдия и три вывода.
import React from "react";
import { C } from "../theme";
import { club, figure, phone, sink, TOWN_BLOCKS, town, townWindows } from "./shapes";
import { circle, clamp01, disc, Dots, easeInOut, fillRect, join, line, memo, Morph, move, rect, rnd, type Shape, type VisualProps } from "./dots";
import { Box, Headline, kAt, Label, Node, Thread } from "./kit";

// пятна на стене и раковине: бордовые точки — редкий смысловой акцент, без натурализма
const stains = (): Shape => {
  const out: Shape = [];
  const centers: [number, number, number][] = [
    [560, 300, 46],
    [720, 260, 38],
    [820, 350, 30],
    [480, 400, 26],
    [650, 470, 40],
  ];
  centers.forEach(([x, y, r], k) => {
    const n = Math.round(r * 0.9);
    for (let i = 0; i < n; i++) {
      const a = rnd(i, 10 + k) * Math.PI * 2;
      const rr = Math.sqrt(rnd(i, 20 + k)) * r;
      out.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr, r: 3.6, c: 5 });
    }
  });
  return out;
};

// ── s36–s37: раковина — отец не видит / четверо отмывают
export const Sink: React.FC<VisualProps<{ mode: string; host: string }>> = (c) => {
  const { p } = c;
  const sk = memo("sk-sink", () => move(sink("white"), 650, 560, 1.1));
  const st = memo("sk-stains", stains);
  const mirror = memo("sk-mirror", () => rect(470, 150, 360, 260, { col: "mist", gap: 12, r: 3.2 }));
  const k0 = kAt(c, 0, 1.4);
  if (p.mode === "father") {
    const kBlood = kAt(c, 0.6, 1.4);
    const kDad = kAt(c, 1, 1.6);
    const kHit = kAt(c, 2, 1);
    const kNot = kAt(c, 3, 1.4);
    const dad = memo("sk-dad", () => move(figure(false, "mist"), 1060, 740, 0.9));
    return (
      <Box host={p.host}>
        <Dots shape={mirror} k={k0} seed={361} />
        <Dots shape={sk} k={k0} seed={362} />
        {/* голоса из слива — тонкие кольца */}
        {k0 > 0.5 &&
          kBlood < 0.5 &&
          [0, 1, 2].map((i) => {
            const ph = (c.t * 0.8 + i * 0.33) % 1;
            return <ellipse key={i} cx={650} cy={626} rx={20 + ph * 140} ry={6 + ph * 30} fill="none" stroke={C.mist} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" opacity={(1 - ph) * 0.7} />;
          })}
        <Dots shape={st} k={kBlood} seed={363} scatter="burst" spread={0.3} />
        <Dots shape={dad} k={kDad} seed={364} />
        <Label x={1060} y={340} k={kDad} size={32} color={C.mist}>
          не видит
        </Label>
        <Thread a={[1000, 470]} b={[780, 560]} k={kDad} color={C.mist} gap={16} opacity={0.6} />
        <Label x={650} y={110} k={kHit} size={40} color={C.amber}>
          «я беспокоюсь о тебе»
        </Label>
        <Label x={650} y={778} k={kNot} size={34} color={C.teal}>
          насилие, которое называет себя заботой
        </Label>
      </Box>
    );
  }
  // clean: четверо видят и отмывают; пятна исчезают, лампочка меняется
  const kKids = kAt(c, 1, 1.4);
  const kClean = kAt(c, 2, 4);
  const kBulb = kAt(c, 2.5, 1);
  const kNot = kAt(c, 3, 1.2);
  const kNet = kAt(c, 4, 1.6);
  const kids: [number, number, string][] = [
    [160, 300, "Беверли"],
    [160, 620, "Бен"],
    [1140, 300, "Эдди"],
    [1140, 620, "Стэн"],
  ];
  const bulbOld = memo("sk-bulb0", () => disc(650, 90, 26, { col: "bordo", gap: 9, r: 3.4 }));
  const bulbNew = memo("sk-bulb1", () => disc(650, 90, 26, { col: "amber", gap: 9, r: 3.4 }));
  return (
    <Box host={p.host}>
      <Dots shape={mirror} k={k0} seed={361} />
      <Dots shape={sk} k={k0} seed={362} />
      <Dots shape={st} k={k0} seed={363} only={(d, i) => rnd(i, 77) > easeInOut(kClean) * 0.92} />
      {kBulb < 0.5 ? <Dots shape={bulbOld} k={k0} seed={365} /> : <Dots shape={bulbNew} k={1} glow={1} />}
      {kids.map(([x, y, n], i) => (
        <g key={n}>
          <Node x={x} y={y} k={clamp01(kKids * 2 - i * 0.2)} r={24} label={n} />
          <Thread a={[x, y]} b={[650, 420]} k={kAt(c, 1.5, 1.4)} color={C.teal} gap={18} opacity={0.6} />
        </g>
      ))}
      {kNet > 0 && (
        <g>
          <Thread a={[160, 300]} b={[1140, 300]} k={kNet} color={C.amber} gap={18} />
          <Thread a={[160, 620]} b={[1140, 620]} k={kNet} color={C.amber} gap={18} />
          <Thread a={[160, 300]} b={[160, 620]} k={kNet} color={C.amber} gap={18} />
          <Thread a={[1140, 300]} b={[1140, 620]} k={kNet} color={C.amber} gap={18} />
        </g>
      )}
      <Label x={650} y={778} k={kNot * (1 - kNet)} size={34} color={C.mist}>
        «они-то всё равно кровь не видят»
      </Label>
      <Label x={650} y={778} k={kNet} size={34} color={C.amber}>
        видят несколько — и действуют вместе
      </Label>
    </Box>
  );
};

// ── s38: следы остаются, но легче; «ты не одинока»; вечером — снова одна
export const Traces: React.FC<VisualProps<{ host: string }>> = (c) => {
  const wall = memo("tr-wall", () => rect(120, 140, 520, 420, { col: "mist", gap: 13, r: 3.2 }));
  const st = memo("tr-st", () => move(stains(), -170, 0, 0.9).filter((_, i) => rnd(i, 31) < 0.12));
  const washer = memo("tr-wash", () => join(rect(820, 160, 300, 340, { col: "white", gap: 12 }), circle(970, 350, 100, { col: "teal", gap: 11 }), circle(970, 350, 60, { col: "tealSoft", gap: 10, r: 3 })));
  const k0 = kAt(c, 0, 1.4);
  const kWash = kAt(c, 1, 1.4);
  const kTools = kAt(c, 2, 1.6);
  const kAlone = kAt(c, 3, 1.6);
  const tools: { lbl: string; s: () => Shape }[] = [
    { lbl: "тряпка", s: () => fillRect(-50, -30, 100, 60, { col: "paper", gap: 12, r: 3.4 }) },
    { lbl: "монета", s: () => circle(0, 0, 34, { col: "amber", gap: 9, r: 3.6 }) },
    { lbl: "лампочка", s: () => join(disc(0, -10, 30, { col: "amber", gap: 9, r: 3.4 }), fillRect(-14, 22, 28, 22, { col: "mist", gap: 8, r: 3 })) },
  ];
  return (
    <Box host={c.p.host}>
      <g opacity={1 - kAlone * 0.6}>
        <Dots shape={wall} k={k0} seed={371} />
        <g opacity={0.45}>
          <Dots shape={st} k={k0} seed={372} />
        </g>
        <Label x={380} y={610} k={k0} size={28} color={C.mist}>
          «как мазки пастели»
        </Label>
        <Dots shape={washer} k={kWash} seed={373} />
        <Label x={970} y={110} k={kWash} size={36} color={C.amber}>
          «ты не одинока»
        </Label>
        {tools.map((t, i) => {
          const k = clamp01(kTools * 3 - i);
          return (
            <g key={t.lbl} transform={`translate(${200 + i * 400} 660)`}>
              <Dots shape={memo(`tr-tool-${i}`, t.s)} k={k} seed={374 + i} glow={0.4} />
              <Label x={110} y={12} k={k} size={28} color={C.white} anchor="start">
                {t.lbl}
              </Label>
            </g>
          );
        })}
      </g>
      {kAlone > 0 && (
        <g>
          <Node x={650} y={380} k={kAlone} r={24} lit={0.6} label="одна — снова" />
          <circle cx={650} cy={380} r={130} fill="none" stroke={C.dim} strokeWidth={3} strokeDasharray="1 12" strokeLinecap="round" opacity={kAlone} />
        </g>
      )}
    </Box>
  );
};

// ── s39: зеркало — отец и муж; «твоей вины тут нет»
export const MirrorRepeat: React.FC<VisualProps<{ host: string }>> = (c) => {
  const mirror = memo("mr-mirror", () => rect(380, 120, 540, 560, { col: "mist", gap: 13, r: 3.4 }));
  const a = memo("mr-a", () => move(figure(false, "mist"), 650, 640, 1.2));
  const b = memo("mr-b", () => move(figure(false, "white"), 650, 640, 1.2));
  const k0 = kAt(c, 0, 1.4);
  const kM = kAt(c, 0.5, 2.4);
  const kKay = kAt(c, 1, 1.6);
  return (
    <Box host={c.p.host}>
      <Dots shape={mirror} k={k0} seed={381} />
      {kM < 0.01 ? <Dots shape={a} k={k0} seed={382} /> : <Morph a={a} b={b} k={kM} seed={383} />}
      <Label x={650} y={80} k={k0} size={30} color={C.mist}>
        {kM < 0.5 ? "отец · 1958" : "муж · 1985"}
      </Label>
      <Node x={1110} y={400} k={kKay} r={26} label="подруга" />
      <Thread a={[1080, 400]} b={[930, 400]} k={kKay} color={C.teal} />
      <Label x={650} y={780} k={kKay} size={38} color={C.teal}>
        «твоей вины тут вообще нет»
      </Label>
    </Box>
  );
};

// ── s40: Майк набирает номер и кладёт трубку
export const PhoneHangup: React.FC<VisualProps<{ host: string }>> = (c) => {
  const ph = memo("ph-phone", () => move(phone("teal"), 650, 420, 1.4));
  const k0 = kAt(c, 0, 1.4);
  const kDial = kAt(c, 1, 2.4);
  const kLie = kAt(c, 1.6, 1.4);
  const digitsShown = Math.min(3, Math.floor(kDial * 4));
  return (
    <Box host={c.p.host}>
      <Dots shape={ph} k={k0} seed={391} dimTo={0.5} dimK={kLie} />
      <Label x={650} y={150} k={k0 * (1 - kDial)} size={32} color={C.mist}>
        «сходите к психиатру»
      </Label>
      <text x={650} y={180} textAnchor="middle" fontFamily="Rubik" fontWeight={900} fontSize={64} fill={C.amber} opacity={kDial > 0 ? 1 - kLie * 0.6 : 0}>
        {"404".slice(0, digitsShown)}
      </text>
      <Label x={650} y={760} k={kLie} size={38} color={C.white}>
        «ложь самому себе»
      </Label>
    </Box>
  );
};

// ── s41: клуб «Чёрное пятно» — открыт для всех; поджог; расхождение чисел
export const Club: React.FC<VisualProps<{ host: string }>> = (c) => {
  const cl = memo("cl-club", () => move(club("teal"), 650, 560, 1.15));
  const k0 = kAt(c, 0, 1.8);
  const kGuests = kAt(c, 1, 2);
  const kFire = kAt(c, 2, 2.4);
  const kNum = kAt(c, 3, 1.2);
  const guests = Array.from({ length: 16 }, (_, i) => ({ x: 200 + rnd(i, 1) * 900, y: 640 + rnd(i, 2) * 80, col: i % 3 ? C.white : C.amber }));
  return (
    <Box host={c.p.host}>
      <Dots shape={cl} k={k0} seed={401} glow={0.5 * (1 - kFire)} dimTo={0.3} dimK={kFire} />
      <Label x={650} y={170} k={k0} size={34} color={C.amber}>
        «Чёрное пятно» · 1930
      </Label>
      {/* музыка: ноты-точки над клубом */}
      {k0 > 0.6 &&
        kFire < 0.3 &&
        [0, 1, 2, 3].map((i) => {
          const ph = (c.t * 0.6 + i * 0.25) % 1;
          return <circle key={i} cx={560 + i * 60 + Math.sin(ph * 6) * 10} cy={300 - ph * 120} r={6} fill={C.amber} opacity={1 - ph} />;
        })}
      {guests.map((g, i) => {
        const k = clamp01(kGuests * 2 - i * 0.08) * (1 - kFire);
        return k > 0 ? <circle key={i} cx={g.x} cy={g.y} r={7} fill={g.col} opacity={k} /> : null;
      })}
      {/* поджог: тёплые точки поднимаются над крышей — без пламени и натурализма */}
      {kFire > 0 &&
        Array.from({ length: 40 }, (_, i) => {
          const ph = (c.t * 0.5 + rnd(i, 3)) % 1;
          return <circle key={i} cx={380 + rnd(i, 4) * 540} cy={330 - ph * 220} r={3.6} fill={i % 4 ? C.amberDeep : C.bordo} opacity={kFire * (1 - ph) * 0.8} />;
        })}
      <Label x={650} y={778} k={kNum} size={36} color={C.white}>
        погибших: 60? 80? — в рассказе по-разному
      </Label>
    </Box>
  );
};

// ── s42: «замяли и ни гугу»; забытые казармы; колебания свидетеля
export const Hushed: React.FC<VisualProps<{ host: string }>> = (c) => {
  const cl = memo("cl-club", () => move(club("teal"), 650, 560, 1.15));
  const bar = memo("hu-barracks", () => rect(160, 600, 300, 140, { col: "dim", gap: 18, r: 3 }));
  const k0 = kAt(c, 0, 1);
  const kSink = kAt(c, 0.4, 3);
  const kBar = kAt(c, 1, 1.4);
  const kTwo = kAt(c, 2, 1.4);
  const kTold = kAt(c, 4, 1.4);
  return (
    <Box host={c.p.host}>
      <g transform={`translate(0 ${easeInOut(kSink) * 80})`} opacity={1 - easeInOut(kSink) * 0.8}>
        <Dots shape={cl} k={k0} seed={401} dimTo={0.3} dimK={1} />
      </g>
      <Label x={650} y={150} k={kSink} size={40} color={C.white}>
        «тихо, как будто ничего и не было»
      </Label>
      <Dots shape={bar} k={kBar} seed={411} />
      <Label x={310} y={778} k={kBar} size={26} color={C.mist}>
        забытые казармы
      </Label>
      <Label x={880} y={330} k={kTwo} size={32} color={C.amber}>
        «поджог»
      </Label>
      <Label x={880} y={430} k={kAt(c, 2.5, 1.2)} size={32} color={C.mist}>
        «не могу поверить в умысел»
      </Label>
      <Label x={880} y={560} k={kTold} size={30} color={C.white}>
        {"«никому не рассказывал»"}
      </Label>
    </Box>
  );
};

// ── s42b: насилие по наследству — Батч Бауэрс → Генри → Бен
export const Generations: React.FC<VisualProps<{ host: string }>> = (c) => {
  const farm = memo("ge-farm", () => join(rect(120, 380, 260, 180, { col: "teal", gap: 12 }), fillRect(160, 420, 70, 60, { col: "amber", gap: 10, r: 3.4 }), fillRect(270, 420, 70, 60, { col: "amber", gap: 10, r: 3.4 })));
  const k0 = kAt(c, 0, 1.6);
  const kHit = kAt(c, 0.5, 2);
  const kChain = kAt(c, 1, 2.4);
  const kEnd = kAt(c, 2, 1.4);
  return (
    <Box host={c.p.host}>
      <Dots shape={farm} k={k0} seed={421} dimTo={0.4} dimK={kHit} />
      <Label x={250} y={620} k={k0} size={28} color={C.mist}>
        ферма Хэнлонов
      </Label>
      {kHit > 0 &&
        Array.from({ length: 8 }, (_, i) => {
          const ph = clamp01(kHit * 2 - i * 0.15);
          return ph > 0 && ph < 1 ? <circle key={i} cx={560 - ph * 320} cy={300 + i * 12 + ph * 120} r={6} fill={C.mist} opacity={1 - ph * 0.5} /> : null;
        })}
      <Node x={620} y={300} k={kChain} r={26} lit={0.4} label="Батч Бауэрс" labelDy={-44} />
      <Thread a={[620, 300]} b={[860, 470]} k={clamp01(kChain * 2 - 0.5)} color={C.bordo} />
      <Node x={860} y={470} k={clamp01(kChain * 2 - 0.5)} r={26} lit={0.4} label="Генри" />
      <Thread a={[860, 470]} b={[1120, 330]} k={clamp01(kChain * 2 - 1)} color={C.bordo} />
      <Node x={1120} y={330} k={clamp01(kChain * 2 - 1)} r={26} label="Бен" labelDy={-44} />
      <Label x={650} y={760} k={kEnd} size={36} color={C.white}>
        насилие передаётся, как привычка
      </Label>
    </Box>
  );
};

// ── s43: добро есть, но не становится памятью; 1 марта 1985
export const GoodAndSilence: React.FC<VisualProps<{ host: string }>> = (c) => {
  const crowd = memo("gs-crowd", () => {
    const out: Shape = [];
    for (let i = 0; i < 260; i++) out.push({ x: 160 + rnd(i, 1) * 980, y: 360 + rnd(i, 2) * 220, r: 4, c: i % 2 ? 2 : 1 });
    return out;
  });
  const k0 = kAt(c, 0, 2);
  const kFade = kAt(c, 1, 3);
  const kDate = kAt(c, 2, 1.4);
  const kClose = kAt(c, 3, 1.6);
  return (
    <Box host={c.p.host}>
      <Dots shape={crowd} k={k0} seed={431} scatter="rise" only={(_, i) => rnd(i, 9) > easeInOut(kFade) * 0.85} />
      <Label x={650} y={300} k={k0} size={34} color={C.white}>
        тысячи на похоронах · бесплатные больницы
      </Label>
      <Label x={650} y={660} k={kFade} size={34} color={C.mist}>
        добро не превращается в память
      </Label>
      <Label x={650} y={140} k={kDate} size={40} color={C.amber}>
        1 марта 1985 · последняя запись тома
      </Label>
      {kClose > 0 && (
        <g opacity={kClose}>
          <Dots shape={memo("gs-book", () => join(rect(560, 700, 180, 90, { col: "paper", gap: 11 }), line(650, 700, 650, 790, { col: "paper", gap: 11 })))} k={kClose} seed={432} />
        </g>
      )}
    </Box>
  );
};

// ── s44–s46: три вывода
export const Conclusion: React.FC<VisualProps<{ n: number; host: string }>> = (c) => {
  const { p } = c;
  const kH = kAt(c, p.n === 1 ? 0.5 : 0, 1.2);
  if (p.n === 1) {
    const iso: [number, number, string][] = [
      [220, 380, "Джордж"],
      [520, 300, "Бен"],
      [800, 300, "Билл"],
      [1090, 380, "Беверли"],
    ];
    const kIso = kAt(c, 1, 2.4);
    const kInt = kAt(c, 2, 1.2);
    return (
      <Box host={p.host}>
        <Headline x={650} y={110} k={kAt(c, 0, 1)} text="1 · ИЗОЛЯЦИЯ" size={56} color={C.amber} />
        {iso.map(([x, y, n], i) => {
          const k = clamp01(kIso * 4 - i);
          return (
            <g key={n}>
              <circle cx={x} cy={y} r={92} fill="none" stroke={C.dim} strokeWidth={3} strokeDasharray="1 12" strokeLinecap="round" opacity={k} />
              <Node x={x} y={y} k={k} r={24} label={n} labelDy={130} />
            </g>
          );
        })}
        <Label x={650} y={680} k={kH * kIso} size={32} color={C.white}>
          один со своим знанием
        </Label>
        <Label x={650} y={770} k={kInt} size={28} color={C.mist}>
          интерпретация — не правило из книги
        </Label>
      </Box>
    );
  }
  if (p.n === 2) {
    const map = memo("town", town);
    const win = memo("town-win", townWindows);
    const dim = new Set([0, 3, 5, 8, 10, 14, 17]);
    const blk = (x: number, y: number) => TOWN_BLOCKS.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)?.id ?? -1;
    const kMap = kAt(c, 0, 1.6);
    const kBody = kAt(c, 1, 1.4);
    const kEx = kAt(c, 2, 2);
    const kEnd = kAt(c, 3, 1.2);
    const ex: [number, number, string][] = [
      [300, 560, "Нелл"],
      [650, 620, "учительница"],
      [1000, 560, "похороны"],
    ];
    return (
      <Box host={p.host}>
        <Headline x={650} y={60} k={kH} text="2 · ИЗБИРАТЕЛЬНАЯ ПАМЯТЬ" size={52} color={C.amber} />
        <g transform="translate(130 100) scale(0.54)">
          <Dots shape={map} k={kMap} seed={21} opacity={0.6} />
          <Dots shape={win} k={kMap} seed={22} glow={0.5} dimTo={0.15} dimK={1} only={(d) => dim.has(blk(d.x, d.y))} />
          <Dots shape={win} k={kMap} seed={23} glow={0.5} only={(d) => !dim.has(blk(d.x, d.y))} />
        </g>
        <Label x={650} y={680} k={kBody * (1 - kEx)} size={30} color={C.white}>
          память возвращается телом: шрамы, заикание
        </Label>
        {ex.map(([x, y, n], i) => (
          <Node key={n} x={x} y={y} k={clamp01(kEx * 3 - i)} r={22} color={C.teal} label={n} labelDy={56} labelSize={28} />
        ))}
        <Label x={650} y={778} k={kEnd} size={38} color={C.teal}>
          не заговор — привычка не смотреть
        </Label>
      </Box>
    );
  }
  // n === 3: разделённое свидетельство
  const pts: [number, number][] = [
    [220, 330],
    [440, 230],
    [650, 330],
    [860, 230],
    [1080, 330],
    [330, 520],
    [650, 560],
    [970, 520],
  ];
  const kNet = kAt(c, 0, 2.4);
  const kQ = kAt(c, 2, 3);
  const kUneven = kAt(c, 3, 1.4);
  const quotes = ["«мы не будем смеяться»", "«давайте пойдём посмотрим»", "«ты не одинока»"];
  return (
    <Box host={p.host}>
      <Headline x={650} y={90} k={kH} text="3 · РАЗДЕЛЁННОЕ СВИДЕТЕЛЬСТВО" size={50} color={C.amber} />
      {pts.map(([x, y], i) => (
        <Node key={i} x={x} y={y} k={clamp01(kNet * 2 - i * 0.1)} r={20} />
      ))}
      {pts.map((a, i) =>
        pts.slice(i + 1).map((b, j) => {
          const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
          if (dist > 330) return null;
          const weak = kUneven > 0 && rnd(i * 9 + j, 4) < 0.35;
          return <Thread key={`${i}-${j}`} a={a} b={b} k={clamp01(kNet * 2 - 0.6)} color={weak ? C.dim : C.teal} gap={weak ? 30 : 16} r={2.8} />;
        }),
      )}
      {quotes.map((q, i) => (
        <Label key={q} x={650} y={660 + i * 50} k={clamp01(kQ * 3 - i)} size={32} color={C.white}>
          {q}
        </Label>
      ))}
      <Label x={650} y={180} k={kUneven} size={28} color={C.mist}>
        доверие неравномерно — живые дети, не идеальное братство
      </Label>
    </Box>
  );
};

