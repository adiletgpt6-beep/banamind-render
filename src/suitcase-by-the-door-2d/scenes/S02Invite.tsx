// S02 · Приглашение и три дня.
//
// 2A — продолжение подъезда S01: та же охристая папка крупно, вид сверху на
//      столешницу. Кисть мамы приподнимает обложку за край, доводит её до
//      вертикали и отпускает — обложка ложится налево. Сверху в папке —
//      приглашение «ЧАКЫРУУ»: на словах «кесиптештеринин жолугушуусуна»
//      строка мягко выделяется маркером, на «сөз сүйлөөгө» — роль
//      «Баяндамачы». Перед «Сапар…» кисть перелистывает лист (он
//      поворачивается вокруг левого края и ложится оборотом вверх), под ним —
//      карандашный эскиз зала с маленькой сценой. Камера опускается: на
//      «жол», «баяндама», «кесиптештери менен талкуу» рядом по очереди
//      появляются три карточки дней — карточка чуть поднимается и ложится.
// 2B — короткая тёмно-синяя вставка: те же три карточки светлыми линиями,
//      соединённые тонкой линией, жёлтый обводящий круг на дне выступления;
//      линия уходит вниз и прорисовывает контур календарного листа —
//      переход к школьному расписанию S03.
import { Blueprint, BpLine, FONT, Ring, Shot, Svg, camKeys, roughRect, useInk, usePlan, useScene } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { clamp, easeIn, easeInOut, easeOut, glide, lerp, type Vec } from "../rig/motion";
import { FolderTop } from "../props/Folder";
import { CloseHand, SKIN } from "../props/CloseHand";
import { DayIcon, HallSketch, INVITE_RATIO, InviteSheet, TripDayCard, CARD_RATIO } from "../props/Invite";
import { TableTop } from "../sets/Home";
import { SD2_TEXT } from "../script";
import type { Sd2SfxPlan } from "../sfx";

// Кадры действий (кадры сцены) — общие для анимации и звука.
export const invitePlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "invite");
  const roleHi = T.word("N02", "сөз");
  const sapar = T.word("N02", "сапар");
  const flip = Math.max(roleHi + 30, sapar - 12); // пальцы берут край листа
  // «жол» и «кесиптештери» — по номеру слова: по началу слова они совпали бы
  // с «жолугушуусуна» и «кесиптештеринин» в первом предложении.
  const c1 = T.word("N02", 12);
  return {
    len: T.len,
    grab: 5, // кисть взяла край обложки
    upright: 20, // обложка за вертикалью — кисть отпускает
    coverDown: 26,
    lineHi: T.word("N02", "кесиптештеринин"),
    roleHi,
    reach: flip - 16,
    flip,
    flipRelease: flip + 16,
    flipDown: flip + 23,
    panDown: flip + 24,
    cards: [c1, Math.max(c1 + 10, T.word("N02", 13)), T.word("N02", 14) + 8] as const,
    bp: T.word("N02", "талкуу") + 2,
  };
};
type Plan = ReturnType<typeof invitePlan>;

// ---------- мир предметного плана (вид сверху) ----------
const FOLDER = { cx: 540, cy: 700, w: 620, h: 440 } as const;
const X0 = FOLDER.cx - FOLDER.w / 2; // корешок
const Y0 = FOLDER.cy - FOLDER.h / 2;
const INV = { x: X0 + 20, y: Y0 + 22, w: 578 } as const;
const INV_H = INV.w * INVITE_RATIO;
const CARD_W = 200;
const CARDS: readonly Vec[] = [
  { x: 272, y: 1218 },
  { x: 540, y: 1210 },
  { x: 808, y: 1220 },
];
const CARD_ROT = [-3, 1.5, -2] as const;

// Обложка: подъём до вертикали рукой, затем падает налево сама.
const coverOpen = (f: number, p: Plan) =>
  f < p.grab ? 0 : f < p.upright ? 0.56 * easeInOut((f - p.grab) / (p.upright - p.grab)) : 0.56 + 0.44 * easeIn((f - p.upright) / (p.coverDown - p.upright));

// Лист приглашения: угол поворота вокруг левого края (0…π).
const pageAngle = (f: number, p: Plan) =>
  f < p.flip ? 0 : f < p.flipRelease ? 0.62 * Math.PI * easeInOut((f - p.flip) / (p.flipRelease - p.flip)) : lerp(0.62 * Math.PI, Math.PI, easeIn((f - p.flipRelease) / (p.flipDown - p.flipRelease)));

// Кисть с края (снизу справа — мама стоит у ближнего края стола).
const HAND_ANG = 146;
const HAND_DIR = { x: -Math.sin((HAND_ANG * Math.PI) / 180), y: Math.cos((HAND_ANG * Math.PI) / 180) };
const wristFor = (grip: Vec, L: number): Vec => ({ x: grip.x - HAND_DIR.x * L * 0.8, y: grip.y - HAND_DIR.y * L * 0.8 });

// Мелочи на столе: чашка (вид сверху) и ручка.
const Cup: React.FC<{ x: number; y: number; ink: number }> = ({ x, y, ink }) => (
  <g>
    <ellipse cx={x + 6} cy={y + 8} rx={74} ry={74} fill={C.shadow} />
    <circle cx={x} cy={y} r={72} fill="#F2EEE6" stroke={C.ink} strokeWidth={ink * 0.8} />
    <path d={`M ${x + 46} ${y - 8} Q ${x + 86} ${y - 4} ${x + 84} ${y + 22} Q ${x + 80} ${y + 40} ${x + 44} ${y + 26}`} fill="none" stroke={C.ink} strokeWidth={ink * 0.8} />
    <circle cx={x} cy={y} r={50} fill="#FFFFFF" stroke={C.ink} strokeWidth={ink * 0.8} />
    <circle cx={x} cy={y} r={40} fill="#B97A4B" />
    <ellipse cx={x - 12} cy={y - 14} rx={14} ry={7} fill="#FFFFFF" opacity={0.25} />
  </g>
);
const Pen: React.FC<{ x: number; y: number; rot: number; ink: number }> = ({ x, y, rot, ink }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-4} y={-6} width={190} height={20} rx={10} fill={C.shadow} />
    <rect x={-10} y={-10} width={190} height={20} rx={10} fill="#172A46" stroke={C.ink} strokeWidth={ink * 0.6} />
    <rect x={130} y={-10} width={40} height={20} rx={8} fill={C.yellow} stroke={C.ink} strokeWidth={ink * 0.6} />
    <path d={`M -10 -7 L -30 0 L -10 7 Z`} fill="#C9B79A" stroke={C.ink} strokeWidth={ink * 0.5} strokeLinejoin="round" />
  </g>
);

const TopShot: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const ink = useInk(4);
  const o = coverOpen(f, p);
  const cw = FOLDER.w * Math.cos(Math.PI * o);
  const phi = pageAngle(f, p);
  const flipped = phi > Math.PI / 2;
  const pc = Math.cos(phi);
  const lifted = Math.sin(phi);
  // ---- кисть 1: открывает обложку ----
  const L = 170;
  let hand1: React.ReactNode = null;
  if (f < p.upright + 22) {
    const edge = (oo: number): Vec => ({ x: X0 + FOLDER.w * Math.cos(Math.PI * oo), y: FOLDER.cy + 128 });
    const grip0 = edge(0);
    const s = 1 + 0.24 * Math.sin(Math.PI * Math.min(o, 0.56));
    let grip: Vec;
    if (f < p.grab) grip = glide(f, -4, p.grab, [{ x: grip0.x + 190, y: grip0.y + 230 }, { x: grip0.x + 30, y: grip0.y + 40 }, grip0], easeOut);
    else if (f <= p.upright) grip = edge(o);
    else grip = glide(f, p.upright, p.upright + 22, [edge(0.56), { x: 360, y: 1010 }, { x: 760, y: 1420 }], easeInOut);
    const w = wristFor(grip, L * s);
    const shape = f < p.grab - 2 ? "open" : f <= p.upright + 1 ? "pinch" : "open";
    hand1 = <CloseHand x={w.x} y={w.y} angle={HAND_ANG + (f > p.upright ? 6 : 0)} size={L * s} look={SKIN.mom} shape={shape} armLen={9} ink={ink} />;
  }
  // ---- кисть 2: перелистывает лист ----
  let hand2: React.ReactNode = null;
  if (f >= p.reach - 2 && f < p.flipRelease + 24) {
    const persp = 1 + 0.16 * lifted;
    const edgeAt = (a: number): Vec => ({ x: INV.x + INV.w * Math.cos(a), y: INV.y + INV_H * 0.8 });
    const gripP = edgeAt(0);
    let grip: Vec;
    if (f < p.flip) grip = glide(f, p.reach - 2, p.flip, [{ x: gripP.x + 230, y: gripP.y + 360 }, { x: gripP.x + 40, y: gripP.y + 60 }, gripP], easeOut);
    else if (f <= p.flipRelease) grip = edgeAt(phi);
    else grip = glide(f, p.flipRelease, p.flipRelease + 24, [edgeAt(0.62 * Math.PI), { x: 520, y: 1060 }, { x: 860, y: 1440 }], easeInOut);
    const s = f <= p.flipRelease ? persp : 1 + 0.16 * Math.sin(0.62 * Math.PI) * (1 - clamp((f - p.flipRelease) / 10));
    const w = wristFor(grip, L * s);
    const shape = f < p.flip - 2 ? "open" : f <= p.flipRelease + 1 ? "pinch" : "open";
    hand2 = <CloseHand x={w.x} y={w.y} angle={HAND_ANG} size={L * s} look={SKIN.mom} shape={shape} armLen={9} ink={ink} />;
  }
  // ---- карточки дней ----
  const cards = CARDS.map((c, i) => {
    const t = f - p.cards[i];
    if (t < 0) return null;
    const lift = t < 5 ? lerp(0.35, 1, easeOut(t / 5)) : 1 - easeInOut((t - 5) / 11);
    return <TripDayCard key={i} cx={c.x} cy={c.y - lift * 10} w={CARD_W} i={i} ink={ink} lift={lift} rot={CARD_ROT[i] * (1 + lift * 0.6)} opacity={clamp(t / 3)} />;
  });
  // ---- лист приглашения (в проекции поворота вокруг левого края) ----
  const persp = 1 + 0.07 * lifted;
  const page = (
    <g transform={`translate(${INV.x} ${INV.y + INV_H / 2}) scale(${pc} ${persp}) translate(${-INV.x} ${-(INV.y + INV_H / 2)})`}>
      <InviteSheet
        x={INV.x}
        y={INV.y}
        w={INV.w}
        ink={ink}
        back={flipped}
        hiLine={easeInOut((f - p.lineHi) / 18)}
        hiRole={easeInOut((f - p.roleHi) / 14)}
      />
    </g>
  );
  // правая половина видна там, где её не закрывает обложка
  const clipX = X0 + Math.max(0, cw);
  return (
    <>
      <TableTop ink={ink} uid="s02-top" />
      <Svg>
        <Cup x={936} y={350} ink={ink} />
        <Pen x={150} y={330} rot={24} ink={ink} />
        <clipPath id="s02-right">
          <rect x={clipX} y={Y0 - 40} width={Math.max(0, X0 + FOLDER.w + 40 - clipX)} height={FOLDER.h + 80} />
        </clipPath>
        <FolderTop cx={FOLDER.cx} cy={FOLDER.cy} w={FOLDER.w} h={FOLDER.h} open={o} ink={ink} />
        {o > 0.01 ? (
          <g clipPath={o < 0.5 ? "url(#s02-right)" : undefined}>
            <HallSketch x={INV.x - 6} y={INV.y - 4} w={INV.w + 10} h={INV_H + 8} ink={ink} uid="s02-hall" />
            {/* тень приподнятого листа */}
            {lifted > 0.02 ? <rect x={INV.x + (flipped ? INV.w * pc : 0) + 20 * lifted} y={INV.y + 26 * lifted} width={INV.w * Math.abs(pc) + 4} height={INV_H} rx={8} fill={C.shadow} opacity={0.9 * lifted} /> : null}
            {page}
          </g>
        ) : null}
        {cards}
        {hand1}
        {hand2}
      </Svg>
    </>
  );
};

// ---------- 2B: схема ----------
const BP = { cy: 690, w: 196, xs: [270, 540, 810] as const } as const;
const CAL = { x: 240, y: 980, w: 600, h: 330 } as const;
const BpInsert: React.FC<{ t: number }> = ({ t }) => {
  const h = BP.w * CARD_RATIO;
  const top = BP.cy - h / 2;
  const colW = CAL.w / 5;
  const head = 74;
  return (
    <Blueprint t={t}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {BP.xs.map((cx, i) => {
          const tt = t - 1 - i * 3;
          const d = SD2_TEXT.tripDays[i];
          return (
            <g key={i}>
              <BpLine d={roughRect(cx - BP.w / 2, top, BP.w, h, 12, 201 + i, 1.4)} len={2 * (BP.w + h) + 40} t={tt} dur={10} width={3} />
              <DayIcon i={i} x={cx} y={BP.cy - 4} s={92} ink={3} line={C.line} draw={(tt - 4) / 6} />
              <text x={cx - BP.w / 2 + 18} y={top + 40} fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.line} opacity={clamp((tt - 6) / 6) * 0.8}>
                {d.day}
              </text>
              <text x={cx} y={top + h - 24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={i === 1 ? 28 : 32} fill={C.line} opacity={clamp((tt - 7) / 6)}>
                {d.label}
              </text>
            </g>
          );
        })}
        {/* тонкая линия, соединяющая три дня */}
        {[0, 1].map((k) => {
          const a = BP.xs[k] + BP.w / 2 + 6;
          const b = BP.xs[k + 1] - BP.w / 2 - 6;
          return <BpLine key={k} d={`M ${a} ${BP.cy} L ${b} ${BP.cy}`} len={b - a} t={t - 11 - k * 3} dur={7} width={2.5} />;
        })}
        {/* единственный акцент — день выступления */}
        <Ring x={BP.xs[1]} y={BP.cy} r={162} t={t - 17} dur={12} color={C.yellow} width={4} />
        {/* линия уходит вниз к календарному листу */}
        <BpLine d={`M ${BP.xs[2]} ${top + h + 6} L ${BP.xs[2]} ${CAL.y - 4}`} len={CAL.y - top - h - 10} t={t - 23} dur={7} width={2.5} />
        <BpLine d={roughRect(CAL.x, CAL.y, CAL.w, CAL.h, 10, 221, 1.2)} len={2 * (CAL.w + CAL.h) + 30} t={t - 28} dur={12} width={3} />
        <BpLine d={`M ${CAL.x} ${CAL.y + head} L ${CAL.x + CAL.w} ${CAL.y + head}`} len={CAL.w} t={t - 33} dur={7} width={2} />
        {[1, 2, 3, 4].map((k) => (
          <BpLine key={k} d={`M ${CAL.x + colW * k} ${CAL.y + head} L ${CAL.x + colW * k} ${CAL.y + CAL.h}`} len={CAL.h - head} t={t - 35 - k} dur={7} width={2} />
        ))}
        {SD2_TEXT.school.week.map((d, k) => (
          <text key={d} x={CAL.x + colW * (k + 0.5)} y={CAL.y + 50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.line} opacity={clamp((t - 37 - k) / 5)}>
            {d}
          </text>
        ))}
      </svg>
    </Blueprint>
  );
};

export const S02Invite: React.FC = () => {
  const { f } = useScene("invite");
  const p = usePlan(invitePlan);
  if (f >= p.bp) return <BpInsert t={f - p.bp} />;
  const cam = camKeys(f, [
    [0, { x: 540, y: 700, zoom: 1.05 }],
    [26, { x: 520, y: 704, zoom: 1.08 }],
    [p.lineHi - 2, { x: 548, y: 704, zoom: 1.42 }],
    [p.reach - 6, { x: 552, y: 708, zoom: 1.48 }],
    [p.flip + 14, { x: 470, y: 716, zoom: 1.14 }],
    [p.cards[0] - 2, { x: 540, y: 1000, zoom: 1.1 }],
    [p.bp, { x: 540, y: 1006, zoom: 1.12 }],
  ]);
  return (
    <Shot f={f} cam={cam}>
      <TopShot f={f} p={p} />
    </Shot>
  );
};

// Звук: обложка, перелистывание, три карточки ложатся (тихо).
export const sfxS02Invite: Sd2SfxPlan = (tl) => {
  const p = invitePlan(tl);
  return [
    { at: 0, kind: "room", dur: p.bp / 30 },
    { at: p.grab, kind: "paper", volume: 0.22 },
    { at: p.coverDown - 1, kind: "folder-down", volume: 0.14 },
    { at: p.flip, kind: "paper", volume: 0.3 },
    ...p.cards.map((c) => ({ at: c + 14, kind: "paper" as const, volume: 0.1 })),
  ];
};
