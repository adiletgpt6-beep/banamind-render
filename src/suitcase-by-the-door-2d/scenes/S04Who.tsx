// S04 · Кто что может сделать. Планы меняются на предложениях N04:
//
// 4A «Сабактан кийин…» — обычный день: школьный двор (sets/School.tsx),
//    мама ждёт у ворот, сын с рюкзаком выходит со двора через ворота,
//    подходит к ней, она с улыбкой протягивает руку, он берёт её за руку.
// 4B «Атасы ошол убакта…» — переговорная (sets/Office.tsx): папа за столом
//    встречи с двумя коллегами, часы показывают ≈ 12:30, на экране схема;
//    папа объясняет жестом (рот закрыт — говорит рассказчик).
// 4C «Үйдө баланы чоң энеси…» — бабушка открывает дверь своей квартиры
//    (дверь поворачивается на петлях), тёплая улыбка; за ней стол и
//    свободный стул.
// 4D «Болгону…» — тёмно-синяя схема: «Мектеп» → тонкая линия, средний
//    участок — пустой пунктир, мягко подсвеченный жёлтым → «Чоң эненин
//    үйү». Без красного и тревожных знаков.
import { useScene, usePlan, Shot, Svg, Blueprint, BpLine, camMove, roughRect, Grain, HatchDefs, FONT } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, glide, keys, keysV, lerp, type Vec } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { SCHOOL, SchoolBack, SchoolFence, SchoolFront, schoolScale, TinyPerson } from "../sets/School";
import { OFFICE, OfficeBack, OfficeChair, OfficeTable } from "../sets/Office";
import { SD2_TEXT } from "../script";
import { H, seatOf } from "./common";
import type { Sd2SfxPlan } from "../sfx";

export const whoPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "who");
  return {
    len: T.len,
    office: T.word("N04", "атасы") - 4,
    grandma: T.word("N04", "үйдө") - 4,
    scheme: T.word("N04", "болгону") - 4,
    gap: T.word("N04", "жеткирүүнү"),
  };
};
type Plan = ReturnType<typeof whoPlan>;

// ---------- 4A: школьный двор ----------
const SON_PATH: readonly Vec[] = [
  { x: SCHOOL.exit.x, y: SCHOOL.exit.y },
  { x: SCHOOL.gate.x + SCHOOL.gate.w / 2, y: SCHOOL.fenceY - 6 },
  { x: SCHOOL.gate.x + SCHOOL.gate.w / 2 + 60, y: SCHOOL.fenceY + 60 },
  { x: SCHOOL.meet.x - 150, y: SCHOOL.meet.y - 6 },
];
const Yard: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const walkEnd = Math.min(p.office - 22, 70);
  const sonPlace = (t: number) => {
    const q = glide(t, 2, walkEnd, SON_PATH);
    return { x: q.x, y: q.y, h: H.son * schoolScale(q.y) };
  };
  const mom = { x: SCHOOL.meet.x, y: SCHOOL.meet.y, h: H.mom };
  const sonP = sonPlace(f);
  const inYard = sonP.y < SCHOOL.fenceY;
  const reach = clamp((f - walkEnd + 14) / 12);
  const momPose = (): PoseIn => ({
    expr: EXPR.smile,
    lookY: 0.25,
    armL: { target: lerpV2({ x: mom.x - 70, y: mom.y - 330 }, { x: mom.x - 110, y: mom.y - 300 }, reach), shape: reach > 0.5 ? "open" : "relax", elbow: "down" },
    armR: { target: null },
    bagOnShoulder: 1,
  });
  const sonPose = (t: number): PoseIn => {
    const hold = clamp((t - walkEnd + 4) / 8);
    const sp = sonPlace(t);
    return {
      expr: EXPR.smile,
      lookY: -0.1,
      armR: hold > 0 ? { target: lerpV2({ x: sp.x + 40, y: sp.y - sp.h * 0.42 }, { x: mom.x - 104, y: mom.y - 300 }, hold), shape: hold > 0.6 ? "fist" : "relax", elbow: "out" } : { target: null },
      armL: { target: null },
    };
  };
  const son = <Actor uid="s04-son" look="sonSchool" f={f} place={sonPlace} face={(t) => (t < walkEnd - 10 ? 0 : 0.5)} pose={sonPose} seed={3} />;
  const cam = camMove(f, 0, p.office, { x: 560, y: 1150, zoom: 1.16 }, { x: 580, y: 1160, zoom: 1.24 });
  const ink = 3.4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <SchoolBack ink={ink} uid="s04-sch" />
      <Svg>
        <TinyPerson x={640} y={1120} h={150} ink={ink} top="#B4785C" kid pack="#7A6BC4" arm={0.2} />
        <TinyPerson x={700} y={1112} h={220} ink={ink} top="#6F7F8E" />
        <TinyPerson x={150} y={1100} h={146} ink={ink} top="#2F4A7A" kid pack="#D9A85F" step={0.5} />
      </Svg>
      {inYard ? son : null}
      <SchoolFence ink={ink} uid="s04-sch" />
      <Actor uid="s04-mom" look="momHome" f={f} place={() => mom} face={(t) => (t < 20 ? -0.4 : -0.6)} pose={momPose} seed={1} />
      {inYard ? null : son}
      <SchoolFront ink={ink} uid="s04-sch" />
    </Shot>
  );
};
const lerpV2 = (a: Vec, b: Vec, t: number): Vec => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

// ---------- 4B: переговорная ----------
const Office: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const seat = (h: number) => seatOf(h);
  const dad = { x: OFFICE.seats[1], y: OFFICE.floor, h: H.dad };
  const c1 = { x: OFFICE.seats[0], y: OFFICE.floor, h: H.colleague };
  const c2 = { x: OFFICE.seats[2], y: OFFICE.floor, h: H.mom };
  const t0 = p.office;
  // кисти на коленях за столешницей (стол перекрывает их), руки опущены
  const onTable = (x: number) => ({ x, y: OFFICE.table.back + 92 });
  const dadPose = (t: number): PoseIn => {
    const g = clamp((t - t0 - 14) / 10) * (1 - clamp((t - t0 - 70) / 12));
    return {
      sit: 1,
      seat: seat(dad.h),
      expr: EXPR.calm,
      lookY: 0.05,
      armL: { target: onTable(dad.x - 40), shape: "relax", elbow: "hang" },
      armR: { target: keysV(g, [[0, onTable(dad.x + 40)], [1, { x: dad.x + 120, y: OFFICE.table.back - 34 }]], (x) => x), shape: g > 0.4 ? "open" : "relax", elbow: g > 0.3 ? "down" : "hang" },
    };
  };
  const listen = (seed: number): ((t: number) => PoseIn) => (t) => ({
    sit: 1,
    seat: seat(H.mom),
    expr: EXPR.calm,
    nod: keys(t, [[t0 + 20 + seed, 0], [t0 + 26 + seed, 4], [t0 + 34 + seed, 0]]),
    armL: { target: onTable((seed ? c2.x : c1.x) - 40), shape: "relax", elbow: "hang" },
    armR: { target: onTable((seed ? c2.x : c1.x) + 40), shape: "relax", elbow: "hang" },
  });
  const cam = camMove(f, t0, p.grandma, { x: 560, y: 1010, zoom: 1.42 }, { x: 566, y: 1010, zoom: 1.5 });
  const actors = (layer: "body" | "arms") => (
    <>
      <Actor uid="s04-c1" look="colleague" f={f} place={() => c1} face={() => 0.45} pose={listen(0)} seed={5} layer={layer} />
      <Actor uid="s04-dad" look="dadWork" f={f} place={() => dad} face={(t) => keys(t, [[t0, 0.1], [t0 + 30, -0.25], [t0 + 60, 0.2]])} pose={dadPose} seed={2} layer={layer} />
      <Actor uid="s04-c2" look="listenerA" f={f} place={() => c2} face={() => -0.45} pose={listen(9)} seed={7} layer={layer} />
    </>
  );
  const ink = 3.4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      <OfficeBack ink={ink} uid="s04-off" minutes={752 + (f - t0) / 30} />
      <Svg>
        {[c1, dad, c2].map((a) => (
          <OfficeChair key={a.x} x={a.x} seat={OFFICE.floor - seat(a.h)} ink={ink} />
        ))}
      </Svg>
      {actors("body")}
      {actors("arms")}
      <OfficeTable ink={ink} uid="s04-ot" />
      <Svg>
        {[c1.x, dad.x, c2.x].map((x, i) => (
          <g key={x}>
            <rect x={x - 40 + i * 6} y={OFFICE.table.top - 24} width={70} height={16} rx={3} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.7} transform={`skewX(-20)`} />
          </g>
        ))}
      </Svg>
    </Shot>
  );
};

// ---------- 4C: дверь бабушки ----------
const GD = { x: 330, w: 330, top: 640, floor: 1500 };
const GrandmaDoor: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const t0 = p.grandma;
  const open = easeInOut((f - t0 - 4) / 18);
  const gm = { x: GD.x + GD.w / 2 + 6, y: GD.floor - 30, h: H.grandma };
  // дверь на петлях справа: при открытии полотно сужается и уходит внутрь
  const leafW = GD.w * Math.cos((open * Math.PI) / 2 * 0.86);
  const pose = (t: number): PoseIn => ({
    expr: t < t0 + 16 ? EXPR.softSmile : EXPR.smile,
    lookY: 0.2,
    armR: { target: { x: GD.x + GD.w - leafW + 8 + (GD.w - leafW) * 0.02, y: gm.y - gm.h * 0.5 }, shape: "fist", elbow: "out" },
    armL: { target: keysV(t, [[t0 + 18, { x: gm.x - 70, y: gm.y - gm.h * 0.4 }], [t0 + 34, { x: gm.x - 120, y: gm.y - gm.h * 0.52 }]]), shape: t > t0 + 26 ? "open" : "relax", elbow: "down" },
  });
  const cam = camMove(f, t0, p.scheme, { x: 506, y: 1050, zoom: 1.86 }, { x: 506, y: 1040, zoom: 1.96 });
  const ink = 3.4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam}>
      {/* подъезд: спокойная зелёная стена */}
      <div style={{ position: "absolute", left: -400, top: -300, width: 1900, height: 1800, backgroundColor: "#E4E9DA", overflow: "hidden" }}>
        <Grain opacity={0.5} w={1900} h={1800} />
      </div>
      <div style={{ position: "absolute", left: -400, top: GD.floor, width: 1900, height: 900, backgroundColor: "#D8CDB6" }} />
      <Svg>
        <HatchDefs id="s04-gh" />
        {/* комната за дверью: тёплая стена, окно, стол со свободным стулом */}
        <rect x={GD.x} y={GD.top} width={GD.w} height={GD.floor - GD.top} fill="#F4E3C4" />
        <rect x={GD.x + 30} y={GD.top + 80} width={120} height={150} rx={6} fill="#DCE9EE" stroke={C.ink} strokeWidth={ink * 0.8} />
        <path d={`M ${GD.x + 90} ${GD.top + 80} L ${GD.x + 90} ${GD.top + 230} M ${GD.x + 30} ${GD.top + 155} L ${GD.x + 150} ${GD.top + 155}`} stroke={C.ink} strokeWidth={ink * 0.6} />
        <rect x={GD.x} y={GD.floor - 220} width={GD.w} height={220} fill="#E6D2AE" />
        <ellipse cx={GD.x + 90} cy={GD.floor - 150} rx={80} ry={16} fill={C.woodLight} stroke={C.ink} strokeWidth={ink * 0.8} />
        <rect x={GD.x + 86} y={GD.floor - 150} width={8} height={90} fill={C.woodDark} stroke={C.ink} strokeWidth={ink * 0.5} />
        {/* свободный стул у стола */}
        <path d={roughRect(GD.x + 196, GD.floor - 250, 70, 110, 8, 44, ink * 0.4)} fill={C.wood} stroke={C.ink} strokeWidth={ink * 0.8} />
        <rect x={GD.x + 190} y={GD.floor - 146} width={86} height={14} rx={4} fill={C.woodDark} stroke={C.ink} strokeWidth={ink * 0.7} />
        <path d={`M ${GD.x + 196} ${GD.floor - 132} L ${GD.x + 196} ${GD.floor - 70} M ${GD.x + 268} ${GD.floor - 132} L ${GD.x + 268} ${GD.floor - 70}`} stroke={C.woodDark} strokeWidth={ink * 1.6} />
        {/* пиала и чайник на столе */}
        <ellipse cx={GD.x + 70} cy={GD.floor - 160} rx={14} ry={7} fill="#FFFFFF" stroke={C.ink} strokeWidth={ink * 0.6} />
        <path d={`M ${GD.x + 98} ${GD.floor - 158} q 0 -26 24 -26 q 24 0 24 26 Z`} fill="#FFFFFF" stroke={C.ink} strokeWidth={ink * 0.6} />
      </Svg>
      <Actor uid="s04-gm" look="grandma" f={f} place={() => gm} face={() => 0.05} pose={pose} seed={8} />
      <Svg>
        {/* наличник и дверь */}
        <path d={roughRect(GD.x - 24, GD.top - 24, GD.w + 48, GD.floor - GD.top + 24, 4, 61, ink * 0.5)} fill="none" stroke="#9C7A54" strokeWidth={26} />
        <path d={roughRect(GD.x - 37, GD.top - 37, GD.w + 74, GD.floor - GD.top + 37, 4, 62, ink * 0.5)} fill="none" stroke={C.ink} strokeWidth={ink} />
        <path d={`M ${GD.x + GD.w - leafW} ${GD.top + 4} L ${GD.x + GD.w} ${GD.top} L ${GD.x + GD.w} ${GD.floor} L ${GD.x + GD.w - leafW} ${GD.floor - 4} Z`} fill="#A86F4C" stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
        {leafW > 60 ? <circle cx={GD.x + GD.w - leafW + 30} cy={GD.top + 460} r={9} fill="#D9C27A" stroke={C.ink} strokeWidth={ink * 0.6} /> : null}
        {/* коврик у двери */}
        <rect x={GD.x + 20} y={GD.floor + 6} width={GD.w - 40} height={36} rx={8} fill="#B88C6A" stroke={C.ink} strokeWidth={ink * 0.7} />
      </Svg>
    </Shot>
  );
};

// ---------- 4D: схема пути ----------
const SchoolGlyph: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g opacity={clamp(t / 8)}>
    <path d={`M ${x - 90} ${y + 60} L ${x - 90} ${y - 40} L ${x} ${y - 100} L ${x + 90} ${y - 40} L ${x + 90} ${y + 60} Z`} fill="none" stroke={C.line} strokeWidth={4} strokeLinejoin="round" />
    <rect x={x - 22} y={y + 4} width={44} height={56} fill="none" stroke={C.line} strokeWidth={3} />
    {[-60, 40].map((dx) => (
      <rect key={dx} x={x + dx} y={y - 30} width={22} height={22} fill="none" stroke={C.line} strokeWidth={3} />
    ))}
    <path d={`M ${x} ${y - 100} L ${x} ${y - 150} L ${x + 34} ${y - 138} L ${x} ${y - 126}`} fill="none" stroke={C.yellow} strokeWidth={3} />
  </g>
);
const HouseGlyph: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g opacity={clamp(t / 8)}>
    <path d={`M ${x - 76} ${y + 60} L ${x - 76} ${y - 20} L ${x} ${y - 86} L ${x + 76} ${y - 20} L ${x + 76} ${y + 60} Z`} fill="none" stroke={C.line} strokeWidth={4} strokeLinejoin="round" />
    <rect x={x - 18} y={y + 8} width={36} height={52} fill="none" stroke={C.line} strokeWidth={3} />
    <rect x={x + 30} y={y - 14} width={24} height={24} fill="none" stroke={C.line} strokeWidth={3} />
    <path d={`M ${x - 46} ${y - 46} L ${x - 46} ${y - 80} L ${x - 30} ${y - 80} L ${x - 30} ${y - 60}`} fill="none" stroke={C.line} strokeWidth={3} />
  </g>
);
// Схема по диагонали кадра: школа сверху слева, дом бабушки снизу справа,
// между ними дорога с пустым средним участком (пунктир, мягкая пульсация).
const SA: Vec = { x: 360, y: 560 };
const SB: Vec = { x: 720, y: 1240 };
const R0: Vec = { x: 402, y: 700 };
const R1: Vec = { x: 690, y: 1108 };
const rAt = (k: number): Vec => ({ x: lerp(R0.x, R1.x, k), y: lerp(R0.y, R1.y, k) });
const Scheme: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const t = f - p.scheme;
  const g0 = rAt(0.34);
  const g1 = rAt(0.66);
  const seg = (a: Vec, b: Vec) => Math.hypot(b.x - a.x, b.y - a.y);
  const pulse = 0.55 + 0.45 * Math.sin(Math.max(0, f - p.gap) / 9);
  const gapOn = clamp((f - p.gap) / 10);
  const big = (c: Vec) => `translate(${c.x} ${c.y}) scale(1.5) translate(${-c.x} ${-c.y})`;
  const label = (x: number, y: number, text: string, at: number, anchor: "start" | "end") => (
    <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.paper} opacity={clamp((t - at) / 8)}>
      {text}
    </text>
  );
  return (
    <Blueprint t={t}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={big(SA)}>
          <SchoolGlyph x={SA.x} y={SA.y} t={t - 2} />
        </g>
        {label(SA.x + 160, SA.y + 30, SD2_TEXT.route.school, 4, "start")}
        <g transform={big(SB)}>
          <HouseGlyph x={SB.x} y={SB.y} t={t - 10} />
        </g>
        {label(SB.x - 150, SB.y + 40, SD2_TEXT.route.grandma, 12, "end")}
        {/* дорога: два готовых участка и пустой средний (пунктир) */}
        <BpLine d={`M ${R0.x} ${R0.y} L ${g0.x} ${g0.y}`} len={seg(R0, g0)} t={t - 14} dur={10} width={6} />
        <BpLine d={`M ${g1.x} ${g1.y} L ${R1.x} ${R1.y}`} len={seg(g1, R1)} t={t - 22} dur={10} width={6} />
        <BpLine d={`M ${g0.x} ${g0.y} L ${g1.x} ${g1.y}`} len={seg(g0, g1)} t={t - 26} dur={10} width={6} dashed />
        {gapOn > 0 ? <path d={`M ${g0.x} ${g0.y} L ${g1.x} ${g1.y}`} stroke={C.yellow} strokeWidth={10} strokeDasharray="16 16" opacity={gapOn * pulse} strokeLinecap="round" /> : null}
        {[g0, g1].map((q) => (
          <circle key={q.y} cx={q.x} cy={q.y} r={12} fill={C.navy} stroke={C.line} strokeWidth={4} opacity={clamp((t - 28) / 6)} />
        ))}
        {/* маленький рюкзак ребёнка у школы — «откуда» */}
        <g opacity={clamp((t - 30) / 8)} transform={`translate(${R0.x - 70} ${R0.y + 30}) scale(1.4)`}>
          <rect x={-18} y={-22} width={36} height={44} rx={10} fill="none" stroke={C.line} strokeWidth={3} />
          <path d={`M -10 -22 Q 0 -36 10 -22`} fill="none" stroke={C.line} strokeWidth={3} />
        </g>
      </svg>
    </Blueprint>
  );
};

export const S04Who: React.FC = () => {
  const { f } = useScene("who");
  const p = usePlan(whoPlan);
  if (f < p.office) return <Yard f={f} p={p} />;
  if (f < p.grandma) return <Office f={f} p={p} />;
  if (f < p.scheme) return <GrandmaDoor f={f} p={p} />;
  return <Scheme f={f} p={p} />;
};

// Звук: школьный двор, тихая переговорная, дверь бабушки.
export const sfxS04Who: Sd2SfxPlan = (tl) => {
  const p = whoPlan(tl);
  return [
    { at: 0, kind: "yard", dur: p.office / 30 + 0.3, volume: 0.16 },
    { at: p.office, kind: "room", dur: (p.scheme - p.office) / 30 },
    { at: p.grandma + 4, kind: "door", volume: 0.2 },
  ];
};

