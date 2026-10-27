// S09 · BalaGo как заранее обсуждённый вариант.
//
// 9A (первое предложение N08) — вечер, гостиная: мама и папа сидят рядом на
//      диване и спокойно разговаривают (рты закрыты — говорит рассказчик):
//      мама делает лёгкий жест, папа отвечает жестом и кивает, мама кивает.
//      В конце мама берёт телефон с подлокотника (дотянуться → взять →
//      поднять к груди), экран загорается.
// 9B (второе предложение) — средний план: оба смотрят в телефон в руке
//      мамы, папа наклоняется и показывает на экран; на «издешти» они
//      коротко переглядываются и снова смотрят в телефон.
// 9C (на «БалаГону…») — крупно телефон в руке мамы (левая кисть держит
//      корпус, пальцы обхватывают края). Мини-страница BalaGo проявляется;
//      на «маршрутту» прорисовывается маршрут Үй → Мектеп → Үй. Палец
//      проводит по экрану вверх — лента прокручивается к форме «Алдын ала
//      өтүнмө»; поля «Дарек», «Мектеп», «Убакыт» заполняются условными
//      значениями. На «өтүнмө» палец ОДИН раз касается кнопки «Өтүнмө
//      калтыруу» и уходит; экран отвечает после касания спокойным
//      сообщением «Маршрут жана убакыт талкууланат» (держится > 2 с).
import { useScene, usePlan, Shot, Svg, camKeys, useInk, fadeIO } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeIn, easeInOut, easeOut, keys, lerp, lerpV, type Vec } from "../rig/motion";
import { CoffeeTable, LampGlow, LIVING, LIVING_TINT, LivingBack, LivingSofa } from "../sets/Living";
import { BalaGoScreen, BUTTON_AT, PHONE_CASE, PhoneFrame, PhoneGrip, phoneGeom, phonePt, SCROLL_MAX, type PhonePlace } from "../props/Phone";
import { CloseHand, SKIN } from "../props/CloseHand";
import { H } from "./common";
import type { Sd2SfxPlan } from "../sfx";

// Кадры действий (кадры сцены) — общие для анимации и звука.
export const requestPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "request");
  const swipe = T.word("N08", "жана") + 2; // палец касается экрана и ведёт вверх
  const fill0 = swipe + 28; // поля заполняются
  const tap = T.word("N08", "өтүнмө") - 1; // единственное касание кнопки
  return {
    len: T.len,
    // 9A
    g1: T.word("N08", "мындай"), // мама: лёгкий жест
    g2: T.word("N08", "алдын"), // папа отвечает жестом
    nodM: T.word("N08", "даярданууну") + 6, // мама кивает
    pick: T.word("N08", "сүйлөшүштү") - 4, // мама берёт телефон
    cut2: T.word("N08", "Уулунун") - 3,
    // 9B
    point: T.word("N08", "туруктуу"), // папа показывает на экран
    glance: T.word("N08", "издешти"), // переглядываются
    cut3: T.word("N08", "БалаГону") - 2,
    // 9C
    route: T.word("N08", "маршрутту"),
    swipe,
    fill: [fill0, fill0 + 14, fill0 + 28] as const,
    tap,
    sent: tap + 8,
  };
};
type Plan = ReturnType<typeof requestPlan>;

// ---------- 9A и 9B: гостиная ----------
const M = { x: LIVING.pair.mom, y: LIVING.feetY, h: H.mom };
const D = { x: LIVING.pair.dad, y: LIVING.feetY, h: H.dad };
const SEAT = LIVING.seat;
// телефон лежит на левом подлокотнике (экраном вниз)
const PHONE_REST: Vec = { x: LIVING.armL.x + 18, y: LIVING.armL.y - 2 };
// куда тянется запястье, чтобы взять телефон (кисть накрывает его)
const PICK_WRIST: Vec = { x: PHONE_REST.x + 12, y: PHONE_REST.y - 22 };
const HOLD: Vec = { x: M.x + 26, y: 1302 }; // телефон у груди (между ними)

const lapL = (p: Vec): Vec => ({ x: p.x - 30, y: 1438 });
const lapR = (p: Vec): Vec => ({ x: p.x + 30, y: 1440 });
const io = (t: number, a: number, b: number, i = 10, o = 12) => easeInOut(fadeIO(t, a, b, i, o));

const momFace = (p: Plan) => (t: number) => {
  if (t < p.cut2)
    return keys(t, [
      [0, 0.42],
      [p.pick - 6, 0.42],
      [p.pick + 2, -0.5], // смотрит на телефон на подлокотнике
      [p.pick + 14, -0.45],
      [p.pick + 26, 0.18],
    ]);
  return keys(t, [
    [p.cut2, 0.16],
    [p.glance, 0.16],
    [p.glance + 6, 0.48], // взгляд на папу
    [p.glance + 16, 0.48],
    [p.glance + 22, 0.16],
  ]);
};

const momPose = (p: Plan) => (t: number): PoseIn => {
  const base = { sit: 1, seat: SEAT };
  if (t < p.cut2) {
    const g = io(t, p.g1 - 4, p.g1 + 40, 12, 14);
    const reach = easeInOut((t - p.pick) / 12);
    const lift = easeInOut((t - (p.pick + 14)) / 16);
    const holding = t >= p.pick + 12;
    const armL = !holding
      ? { target: lerpV(lapL(M), PICK_WRIST, reach), shape: reach > 0.7 ? ("open" as const) : ("relax" as const), elbow: "out" as const }
      : {
          target: lerpV(PICK_WRIST, HOLD, lift),
          shape: "phone" as const,
          item: "phone" as const,
          itemColor: PHONE_CASE,
          flat: 1 - lift,
          itemTilt: lerp(-10, 4, lift),
          glow: clamp((t - (p.pick + 22)) / 8) * 0.75,
          elbow: "down" as const,
        };
    const nod = keys(t, [
      [p.nodM, 0],
      [p.nodM + 7, 7],
      [p.nodM + 16, 0],
    ]);
    return {
      ...base,
      expr: t > p.g2 + 4 && t < p.pick ? "softSmile" : "calm",
      lookY: t > p.pick - 2 && t < p.pick + 16 ? 0.5 : t >= p.pick + 16 ? 0.45 : 0.05,
      nod,
      headTilt: g * 3,
      lean: t > p.pick && t < p.pick + 24 ? 6 * Math.sin(clamp((t - p.pick) / 24) * Math.PI) : 0,
      armL,
      armR: { target: lerpV(lapR(M), { x: M.x + 82, y: 1336 }, g), shape: g > 0.3 ? "open" : "relax", elbow: "down" },
    };
  }
  // 9B: держит телефон у груди, второй рукой поддерживает снизу
  const bob = Math.sin((t - p.cut2) / 26) * 2;
  const glance = io(t, p.glance + 2, p.glance + 22, 6, 6);
  return {
    ...base,
    expr: glance > 0.3 ? "smile" : "calm",
    lookY: lerp(0.55, 0.05, glance),
    nod: lerp(4, 0, glance),
    armL: { target: { x: HOLD.x + 4, y: HOLD.y - 4 + bob }, shape: "phone", item: "phone", itemColor: PHONE_CASE, glow: 0.8, itemTilt: 4, elbow: "hang" },
    armR: { target: { x: HOLD.x + 46, y: HOLD.y + 34 + bob }, shape: "relax", elbow: "hang", wrist: -30 },
  };
};

const dadFace = (p: Plan) => (t: number) => {
  if (t < p.cut2)
    return keys(t, [
      [0, -0.42],
      [p.pick + 10, -0.42],
      [p.pick + 26, -0.34], // провожает взглядом телефон
    ]);
  return keys(t, [
    [p.cut2, -0.4],
    [p.glance, -0.4],
    [p.glance + 6, -0.55],
    [p.glance + 18, -0.55],
    [p.glance + 24, -0.4],
  ]);
};

const dadPose = (p: Plan) => (t: number): PoseIn => {
  const base = { sit: 1, seat: SEAT };
  // правая рука спокойно на колене (не тянется к подлокотнику)
  const armR = { target: lapR(D), shape: "relax" as const, elbow: "hang" as const };
  if (t < p.cut2) {
    const g = io(t, p.g2, p.g2 + 40, 12, 14);
    const nod = keys(t, [
      [p.g2 + 6, 0],
      [p.g2 + 13, 6],
      [p.g2 + 22, 0],
    ]);
    return {
      ...base,
      expr: g > 0.2 ? "softSmile" : "calm",
      lookY: t > p.pick + 14 ? 0.35 : 0.05,
      nod,
      armL: { target: lerpV(lapL(D), { x: D.x - 74, y: 1338 }, g), shape: g > 0.3 ? "open" : "relax", elbow: "down" },
      armR,
    };
  }
  // 9B: наклоняется к телефону, показывает на экран, переглядывается
  const pt = io(t, p.point - 4, p.point + 32, 12, 12);
  const glance = io(t, p.glance + 2, p.glance + 22, 6, 6);
  return {
    ...base,
    expr: glance > 0.3 ? "smile" : "calm",
    lean: lerp(9, 4, glance),
    lookY: lerp(0.5, 0.05, glance),
    nod: lerp(4, 0, glance),
    armL: { target: lerpV(lapL(D), { x: HOLD.x + 52, y: HOLD.y + 6 }, pt), shape: pt > 0.4 ? "point" : "relax", elbow: "down" },
    armR,
  };
};

const LivingShot: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const plan1 = f < p.cut2;
  const cam = plan1
    ? camKeys(f, [
        [0, { x: 548, y: 1238, zoom: 1.22 }],
        [p.cut2, { x: 538, y: 1240, zoom: 1.27 }],
      ])
    : camKeys(f, [
        [p.cut2, { x: 512, y: 1236, zoom: 1.86 }],
        [p.cut3, { x: 506, y: 1240, zoom: 1.94 }],
      ]);
  const mf = momFace(p);
  const mp = momPose(p);
  const df = dadFace(p);
  const dp = dadPose(p);
  const phoneOnArm = f < p.pick + 12;
  const ink = 3.6 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam} tint={LIVING_TINT}>
      <LivingBack ink={ink} uid="s09-liv" />
      <LivingSofa ink={ink} uid="s09-sofa" />
      {phoneOnArm ? (
        <Svg>
          {/* телефон лежит на подлокотнике экраном вниз */}
          <rect x={PHONE_REST.x - 30} y={PHONE_REST.y - 9} width={60} height={18} rx={6} fill={PHONE_CASE} stroke={C.ink} strokeWidth={ink * 0.7} />
        </Svg>
      ) : null}
      <Actor uid="s09-dad" look="dadHome" f={f} place={() => D} face={df} pose={dp} seed={5} blinkShift={23} />
      <Actor uid="s09-mom" look="momHome" f={f} place={() => M} face={mf} pose={mp} seed={1} blinkShift={7} />
      <CoffeeTable ink={ink} uid="s09-table" />
      <LampGlow uid="s09-glow" />
    </Shot>
  );
};

// ---------- 9C: телефон крупно ----------
const HANDL = 300; // кисть с вытянутым указательным
const HAND_ANG = 152; // палец направлен вверх-влево (рука снизу справа)
const rotV = (a: number, x: number, y: number): Vec => {
  const r = (a * Math.PI) / 180;
  return { x: x * Math.cos(r) - y * Math.sin(r), y: x * Math.sin(r) + y * Math.cos(r) };
};
// запястье CloseHand (shape "point") для кончика указательного в tip
const wristFor = (tip: Vec, size: number): Vec => {
  const W = size * 0.78;
  const o = rotV(HAND_ANG, W * 0.22, size * 1.12);
  return { x: tip.x - o.x, y: tip.y - o.y };
};

// Телефон чуть «дышит» в руке (медленно, на несколько px).
const phoneAt = (f: number): PhonePlace => ({ x: 540 + Math.sin(f / 47) * 3, y: 806 + Math.sin(f / 61 + 1) * 3, w: 560, rot: -2 + Math.sin(f / 83) * 0.4 });

// Палец: кончик (мир), «высота» над стеклом 0…1 (0 — касается), виден ли.
const fingerAt = (f: number, p: Plan, ph: PhonePlace) => {
  const off: Vec = { x: 1180, y: 1900 }; // за краем кадра снизу справа
  const s0 = phonePt(ph, 238, 600); // начало движения по экрану
  const s1 = phonePt(ph, 238, 390); // конец
  const b = phonePt(ph, BUTTON_AT.x, BUTTON_AT.y);
  // прокрутка: подход → касание → ведёт вверх → отрыв → уход
  if (f >= p.swipe - 16 && f < p.swipe + 26) {
    if (f < p.swipe) {
      const u = easeOut((f - (p.swipe - 16)) / 16);
      return { tip: lerpV(off, s0, u), hover: 1 - easeInOut((f - (p.swipe - 5)) / 5), on: true };
    }
    if (f < p.swipe + 9) return { tip: lerpV(s0, s1, easeInOut((f - p.swipe) / 9)), hover: 0, on: true };
    const u = easeIn((f - (p.swipe + 11)) / 15);
    return { tip: lerpV(s1, off, u), hover: clamp((f - (p.swipe + 9)) / 3), on: true };
  }
  // касание кнопки: подход → касание (один раз) → отрыв → уход
  if (f >= p.tap - 18 && f < p.tap + 24) {
    if (f < p.tap) {
      const u = easeOut((f - (p.tap - 18)) / 14);
      const above = { x: b.x + 10, y: b.y + 14 };
      return { tip: lerpV(lerpV(off, above, u), b, easeInOut((f - (p.tap - 4)) / 4)), hover: 1 - easeInOut((f - (p.tap - 6)) / 6), on: true };
    }
    if (f < p.tap + 4) return { tip: b, hover: 0, on: true };
    const u = easeIn((f - (p.tap + 6)) / 18);
    return { tip: lerpV({ x: b.x + 6, y: b.y + 8 }, off, u), hover: clamp((f - (p.tap + 4)) / 3), on: true };
  }
  return { tip: off, hover: 1, on: false };
};

// Прокрутка ленты (0…1): пока палец ведёт — лента идёт за ним, потом по
// инерции до формы.
const scrollAt = (f: number, p: Plan) => {
  const drag = (600 - 390) / SCROLL_MAX;
  if (f < p.swipe) return 0;
  if (f < p.swipe + 9) return drag * easeInOut((f - p.swipe) / 9);
  return lerp(drag, 1, easeOut((f - (p.swipe + 9)) / 18));
};

// Размытый фон: колени мамы и диван (вечерний тёплый свет).
const Backdrop: React.FC = () => (
  <div style={{ position: "absolute", left: -120, top: -120, width: 1320, height: 2160, filter: "blur(7px)" }}>
    <svg width={1320} height={2160} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect x={0} y={0} width={1320} height={2160} fill="#C98A6A" />
      <rect x={0} y={0} width={1320} height={760} fill="#B87D60" />
      <path d="M 0 760 Q 660 720 1320 780" stroke="#D9A486" strokeWidth={16} fill="none" />
      <path d="M 660 0 L 650 760" stroke="#A9705A" strokeWidth={10} />
      {/* колени в тёмно-синих брюках и край кардигана */}
      <path d="M -40 1500 Q 300 1180 640 1300 Q 900 1200 1360 1420 L 1360 2200 L -40 2200 Z" fill="#34405C" />
      <path d="M 640 1300 Q 660 1700 600 2200" stroke="#2A3550" strokeWidth={14} fill="none" />
      <path d="M -40 1640 Q 120 1600 220 2200 L -40 2200 Z" fill="#8FA58A" />
      <path d="M 1360 1660 Q 1180 1640 1120 2200 L 1360 2200 Z" fill="#8FA58A" />
      <ellipse cx={980} cy={260} rx={520} ry={420} fill="#FFD9A0" opacity={0.35} />
    </svg>
  </div>
);

const PhoneShot: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const ink = useInk(4);
  const ph = phoneAt(f);
  const g = phoneGeom(ph.w);
  const si = ink / g.s; // контур в единицах экрана
  const fill = p.fill.map((a) => clamp((f - a) / 12));
  const press = f >= p.tap && f < p.tap + 7 ? keys(f, [[p.tap, 0], [p.tap + 1, 1], [p.tap + 4, 1], [p.tap + 7, 0]]) : 0;
  const sent = clamp((f - p.sent) / 12);
  const fg = fingerAt(f, p, ph);
  const size = HANDL * (1 + 0.07 * fg.hover);
  const wr = wristFor(fg.tip, size);
  // кончик пальца при «зависании» над стеклом — чуть ближе к камере
  const tip = { x: fg.tip.x + fg.hover * 8, y: fg.tip.y + fg.hover * 10 };
  const b = phonePt(ph, BUTTON_AT.x, BUTTON_AT.y);
  const ripple = f >= p.tap && f < p.tap + 16 ? (f - p.tap) / 16 : -1;
  return (
    <>
      <Backdrop />
      <Svg>
        <PhoneGrip {...ph} look={SKIN.mom} ink={ink} part="back" />
        <PhoneFrame {...ph} ink={ink} uid="s09-phone">
          <BalaGoScreen ink={si} appear={f - p.cut3} route={easeInOut((f - p.route) / 18)} scroll={scrollAt(f, p)} fill={fill} press={press} sent={sent} />
        </PhoneFrame>
        <PhoneGrip {...ph} look={SKIN.mom} ink={ink} part="front" />
        {/* отклик касания: мягкое кольцо от точки на кнопке */}
        {ripple >= 0 ? <circle cx={b.x} cy={b.y} r={20 + ripple * 70} fill="none" stroke={C.paper} strokeWidth={ink * 1.2 * (1 - ripple)} opacity={0.9 * (1 - ripple)} /> : null}
        {fg.on ? (
          <g>
            {/* тень пальца на стекле: сходится с кончиком в момент касания */}
            <ellipse cx={tip.x + 22 * fg.hover + 6} cy={tip.y + 26 * fg.hover + 8} rx={26} ry={18} fill="rgba(36,50,74,0.22)" opacity={0.4 + 0.6 * (1 - fg.hover)} />
            <CloseHand x={wr.x + fg.hover * 8} y={wr.y + fg.hover * 10} angle={HAND_ANG} size={size} look={SKIN.mom} shape="point" armLen={4} ink={ink} />
          </g>
        ) : null}
      </Svg>
    </>
  );
};

export const S09Request: React.FC = () => {
  const { f } = useScene("request");
  const p = usePlan(requestPlan);
  if (f < p.cut3) return <LivingShot f={f} p={p} />;
  const cam = camKeys(f, [
    [p.cut3, { x: 540, y: 926, zoom: 1.0 }],
    [p.swipe + 20, { x: 542, y: 944, zoom: 1.03 }],
    [p.tap, { x: 544, y: 950, zoom: 1.045 }],
  ]);
  return (
    <Shot f={f} cam={cam} bg="#C98A6A" tint={LIVING_TINT}>
      <PhoneShot f={f} p={p} />
    </Shot>
  );
};

// Звук: касание кнопки и тихий отклик экрана; атмосфера вечерней комнаты.
export const sfxS09Request: Sd2SfxPlan = (tl) => {
  const p = requestPlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.tap, kind: "tap", volume: 0.35 },
    { at: p.sent + 2, kind: "notify", volume: 0.25 },
  ];
};
