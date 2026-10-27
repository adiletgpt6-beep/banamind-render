// Сцена 04. Дүйшөмбү (VO08–VO11).
// 1. Мамин офис, средний план: мама печатает (к камере — внешняя сторона
//    крышки ноутбука); на столе загорается её телефон (один мягкий звук),
//    она переводит взгляд на него.
// 2. Вставка с её стороны стола (вид сверху): телефон с напоминанием и
//    крупная карточка «Ачкычты алууну унутпа · 13:20»; кисть в рукаве
//    жакета входит снизу, берёт связку ключей за кольцо, ключи
//    поднимаются вместе с рукой и уходят из кадра.
// 3. Школа: сын в пиджаке с рюкзаком ждёт у ворот, рядом учительница;
//    сын машет, мама подходит (ключи в руке), наклоняется: «Кеттикпи?» —
//    «Кеттик!»; сын берёт маму за руку, они вместе уходят по тротуару.
// 4. VO11 — три коротких действия: серебристая машина едет по широкой
//    улице (тополя, панельные дома, горы); дома сын ставит рюкзак на пол и
//    машет маме, мама машет у края кадра и уходит; мама снова в офисе —
//    садится за стол и кладёт ключи на место.
import { useCurrentFrame } from "remotion";
import { Mountains } from "../../two-schedules-2d/sets/Apartment";
import { Car, PanelHouse, Sky, Tree } from "../../two-schedules-2d/sets/Outdoor";
import { SchoolBack, SchoolFence, SidewalkTrees } from "../../two-schedules-2d/sets/School";
import { useLine } from "../context";
import { Actor, type Place, type PoseIn, type WorldArm } from "../rig/Actor";
import { LOOKS, type LookId } from "../rig/looks";
import { anticipate, clamp, cruise, easeIn, easeInOut, easeOut, keys, keysV, lerp, lerpV, type Vec } from "../rig/motion";
import { PHT_TEXT, PHT_TIME, PHT_WEEK } from "../script";
import { ChairBack, LIVING, LivingBack, LaptopFront, Mug, PhoneOnTable, TableFront } from "../sets/Living";
import { DeskFront, OFFICE, OfficeBack, OfficeChair } from "../sets/Office";
import { box, camMove, Shot } from "../shots";
import type { SceneSound } from "../sound";
import { COMMON, TS2 } from "../sound";
import { abs, appear, DayLabel, font, Notification, Phone, StatusBar } from "../ui/kit";
import { H, placeAt, seated, seatOf, sitDown, SKIN } from "./common";

const T = PHT_TEXT;
const MOM = LOOKS.mom;
const DAD = LOOKS.dad;
const SON = LOOKS.sonSchool;
const NOTE_TIME = "12:55"; // когда пришло напоминание (за 25 мин до 13:20)
const DESK = OFFICE.desk.top;
const LAP = OFFICE.laptop;
const KEYS_AT = { x: 905, y: DESK + 18 }; // ключи на мамином столе (слева от ноутбука)

type Span = { readonly from: number; readonly to: number };

// Кадры действий (кадры сцены) от реплик — общие для картинки и звука.
const beats = (vo08: Span, vo09: Span, vo10: Span, vo11: Span) => ({
  glow: vo08.from + 13, // телефон на столе загорается (звук)
  insert: vo08.from + 25, // вставка: напоминание (на слове «колдонмо»)
  handIn: vo08.from + 58, // рука входит в кадр
  grab: vo08.from + 75, // пальцы сомкнулись на кольце («ачкычты»)
  school: vo08.to + 1, // школа
  arrive: vo08.to + 26, // мама остановилась перед сыном
  offer: vo09.to + 3, // мама протягивает руку
  take: vo10.to - 1, // сын взял маму за руку
  walkOff: vo10.to + 4, // уходят вместе
  drive: vo11.from + 10, // машина на улице («уулун»)
  home: vo11.from + 40, // дома («алып… үйгө»)
  office: vo11.from + 80, // снова в офисе («кеңсеге»)
});
type Beats = ReturnType<typeof beats>;

// ---------- помощники для поз ----------

// Где висит свободная рука стоящего (мир): из пропорций рига.
const hangOf = (look: LookId, p: Place, side: -1 | 1): Vec => {
  const b = LOOKS[look].build;
  const k = p.h / 1000;
  return { x: p.x + side * (b.shoulderHalf - b.limb * 0.45 + 16) * k, y: p.y + (b.shoulderY + 14 + b.limb * 0.45 + b.upperArm + b.forearm - 16) * k };
};
// Рука машет (k 0…1 — подъём), кисть у головы, покачивание по кадру t.
const waving = (look: LookId, p: Place, side: -1 | 1, k: number, t: number): WorldArm => {
  const low = hangOf(look, p, side);
  const high = { x: p.x + side * (0.22 + 0.035 * Math.sin(t * 0.5)) * p.h, y: p.y - 0.84 * p.h };
  return { target: lerpV(low, high, easeInOut(k)), shape: k > 0.45 ? "wave" : "relax", elbow: "out", behind: false };
};
// Ходьба по прямой: плавный разгон и торможение, рост по глубине.
const walk = (t: number, t0: number, t1: number, a: Vec, b: Vec, h: number, acc = 0.3): Place => {
  const u = cruise((t - t0) / Math.max(1, t1 - t0), acc);
  return placeAt(lerp(a.x, b.x, u), lerp(a.y, b.y, u), h);
};

// ---------- реквизит ----------

// Связка ключей (вид сверху): кольцо, ключ от квартиры, ключ машины с
// брелоком. (0, 0) — центр кольца, s — масштаб, swing — покачивание.
const KeysArt: React.FC<{ readonly s: number; readonly rot?: number; readonly swing?: number }> = ({ s, rot = 0, swing = 0 }) => (
  <g transform={`scale(${s}) rotate(${rot})`}>
    <g transform={`rotate(${swing * 0.6})`}>
      {/* ключ от квартиры (латунь) */}
      <g transform="rotate(-38)">
        <rect x={-8} y={14} width={16} height={30} rx={7} fill="#C9A646" />
        <circle cx={0} cy={26} r={4} fill="#A88A34" />
        <rect x={-4} y={40} width={8} height={62} rx={3} fill="#D8B85A" />
        <path d="M 4 64 h 8 v 7 h -8 Z M 4 80 h 6 v 7 h -6 Z" fill="#D8B85A" />
      </g>
    </g>
    <g transform={`rotate(${swing})`}>
      {/* ключ машины: брелок и лезвие */}
      <g transform="rotate(26)">
        <rect x={-15} y={18} width={30} height={46} rx={13} fill="#2E3550" />
        <circle cx={0} cy={36} r={6} fill="#4B5578" />
        <rect x={-4} y={60} width={8} height={48} rx={3} fill="#B9BEC8" />
      </g>
    </g>
    <circle cx={0} cy={0} r={17} fill="none" stroke="#B9BEC8" strokeWidth={5} />
    <circle cx={0} cy={0} r={17} fill="none" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.5} strokeDasharray="10 30" />
  </g>
);

// Ключи, лежащие на столе (средний план офиса).
const KeysOnDesk: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y}) scale(1 0.5)`}>
      <KeysArt s={0.5} rot={-70} />
    </g>
  </svg>
);

// Кисть мамы (вид сверху, тыльная сторона) с рукавом жакета и манжетой
// блузы. (x, y) — точка хвата, angle — направление кисти (0 — пальцы
// вверх), grip 0…1 — пальцы раскрыты → сомкнуты. Предмет (children)
// рисуется между ладонью и пальцами.
const GrabHand: React.FC<{ readonly x: number; readonly y: number; readonly angle: number; readonly grip: number; readonly s: number; readonly children?: React.ReactNode }> = ({ x, y, angle, grip, s, children }) => {
  const sk = SKIN.mom;
  const fingerLen = (base: number) => lerp(base, base * 0.42, grip);
  const spread = lerp(1, 0.6, grip);
  const knuckY = -40;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`rotate(${angle})`}>
        {/* рукав жакета и манжета блузы */}
        <path d="M -94 150 Q -102 116 -70 104 L 70 104 Q 102 116 94 150 L 116 760 L -120 760 Z" fill={sk.sleeve} />
        <path d="M -94 150 Q 0 128 94 150 L 98 184 Q 0 164 -98 186 Z" fill={MOM.topShade} opacity={0.6} />
        <path d="M -72 84 Q 0 70 72 84 L 74 116 Q 0 104 -74 118 Z" fill={MOM.inner} />
        {/* ладонь (тыльная сторона) */}
        <path d={`M -62 92 Q -72 20 -66 ${knuckY} Q 0 ${knuckY - 26} 68 ${knuckY} Q 74 20 62 92 Z`} fill={sk.skin} stroke={sk.shade} strokeWidth={3} />
        {children}
        {/* большой палец */}
        <g transform={`rotate(${lerp(-40, -6, grip)} -58 30)`}>
          <rect x={-80} y={-58} width={34} height={94} rx={17} fill={sk.skin} stroke={sk.shade} strokeWidth={3} />
        </g>
        {/* четыре пальца */}
        {[-1.5, -0.5, 0.5, 1.5].map((k) => {
          const len = fingerLen(116 - Math.abs(k) * 16);
          const fx = k * 33 * spread;
          return (
            <g key={k} transform={`rotate(${k * 7 * spread} ${fx} ${knuckY})`}>
              <rect x={fx - 15} y={knuckY - len} width={30} height={len + 14} rx={15} fill={sk.skin} stroke={sk.shade} strokeWidth={3} />
              <path d={`M ${fx - 9} ${knuckY - len + 10} Q ${fx} ${knuckY - len + 4} ${fx + 9} ${knuckY - len + 10}`} stroke="#F4D7C6" strokeWidth={4} fill="none" opacity={0.8 * (1 - grip)} />
            </g>
          );
        })}
        {/* костяшки у сжатой кисти */}
        <path d={`M -54 ${knuckY - 8} Q 0 ${knuckY - 24} 54 ${knuckY - 8}`} stroke={sk.shade} strokeWidth={3} fill="none" opacity={grip} />
      </g>
    </g>
  );
};

// Вставка: мамин стол с её стороны (вид сверху). Слева телефон с
// напоминанием, справа ключи; сверху — крупно, что пришло. Рука входит
// снизу справа, берёт ключи за кольцо, поднимает и уносит из кадра.
const KEY_S = 2.6;
const RING: Vec = { x: 735, y: 1160 };
const DeskInsert: React.FC<{ readonly f: number; readonly B: Beats }> = ({ f, B }) => {
  const k = appear(f, B.insert + 2, 9);
  const G = keysV(
    f,
    [
      [B.handIn, { x: 1180, y: 2020 }],
      [B.grab - 3, { x: RING.x + 8, y: RING.y + 10 }],
      [B.grab + 3, { x: RING.x, y: RING.y }],
      [B.grab + 16, { x: RING.x + 30, y: RING.y - 120 }],
      [B.grab + 22, { x: RING.x + 40, y: RING.y - 128 }],
      [B.grab + 40, { x: 1240, y: 2160 }],
    ],
    anticipate,
  );
  const grip = keys(f, [[B.grab - 7, 0], [B.grab + 1, 1]]);
  const held = f >= B.grab + 1;
  const lift = keys(f, [[B.grab + 2, 0], [B.grab + 16, 1]]);
  const handAngle = keys(f, [[B.handIn, -30], [B.grab, -24], [B.grab + 16, -14], [B.grab + 40, -30]]);
  const swing = held ? Math.sin((f - B.grab) / 3) * 10 * Math.exp(-(f - B.grab) / 20) : 0;
  const hs = 0.8 * (1 + 0.06 * lift);
  return (
    <div style={abs({ inset: 0, overflow: "hidden" })}>
      {/* столешница (вид сверху), мягкий свет от окна */}
      <div style={abs({ inset: 0, background: "linear-gradient(170deg, #F1F3F6 0%, #E9ECF0 60%, #E1E5EA 100%)" })} />
      <div style={abs({ left: -300, top: -200, width: 1300, height: 1000, borderRadius: 650, background: "radial-gradient(circle, rgba(255,255,255,0.75), transparent 70%)" })} />
      {/* ручка и стикер на краю стола */}
      <div style={abs({ left: 860, top: 1560, width: 190, height: 170, borderRadius: 8, backgroundColor: "#FFE59A", rotate: "8deg", boxShadow: "0 8px 16px rgba(20,36,59,0.10)" })} />
      <div style={abs({ left: 560, top: 1620, width: 260, height: 18, borderRadius: 9, backgroundColor: "#2F4A7A", rotate: "-18deg", boxShadow: "0 6px 10px rgba(20,36,59,0.18)" })} />
      {/* телефон лежит на столе экраном вверх */}
      <Phone x={90} y={880} w={390} tilt={-5} screen="#22304A">
        <StatusBar time={NOTE_TIME} w={362} dark />
        <div style={abs({ left: 0, right: 0, top: 66, textAlign: "center", fontFamily: font, color: "rgba(255,255,255,0.92)", fontSize: 96, fontWeight: 300 })}>{NOTE_TIME}</div>
        <div style={abs({ left: 14, top: 214 })}>
          <Notification w={334} title={T.app.keys} body={`${PHT_TIME.pickup} · ${T.app.fromSchool}`} time={NOTE_TIME} k={k} />
        </div>
      </Phone>
      <svg width={1080} height={1920} style={abs({ left: 0, top: 0, overflow: "visible" })}>
        {/* ключи лежат на столе */}
        {!held ? (
          <g transform={`translate(${RING.x} ${RING.y})`}>
            <g transform="translate(8 10)" opacity={0.16}>
              <KeysArt s={KEY_S} rot={-58} />
            </g>
            <KeysArt s={KEY_S} rot={-58} />
          </g>
        ) : null}
        {f >= B.handIn ? (
          <>
            {/* тень руки и ключей: при подъёме уходит в сторону и бледнеет */}
            <g transform={`translate(${G.x + 18 + 60 * lift} ${G.y + 24 + 80 * lift})`} opacity={0.14 * (1 - 0.5 * lift)}>
              <g transform={`scale(${hs}) rotate(${handAngle})`}>
                <path d="M -70 90 Q -80 -40 -40 -70 L 50 -70 Q 84 -40 72 90 L 116 760 L -120 760 Z" fill="#1E2A3E" />
              </g>
              {held ? (
                <g transform={`scale(${hs / 0.8})`}>
                  <KeysArt s={KEY_S} rot={-58} swing={swing} />
                </g>
              ) : null}
            </g>
            <GrabHand x={G.x} y={G.y} angle={handAngle} grip={grip} s={hs}>
              {held ? (
                <g transform={`rotate(${-handAngle}) scale(${1 / 0.8})`}>
                  <KeysArt s={KEY_S} rot={-58} swing={swing} />
                </g>
              ) : null}
            </GrabHand>
          </>
        ) : null}
      </svg>
      {/* что пришло — крупно */}
      <div style={abs({ left: 90, top: 380 })}>
        <Notification w={900} scale={1.3} title={T.app.keys} body={`${PHT_TIME.pickup} · ${T.app.fromSchool}`} time={NOTE_TIME} k={k} />
      </div>
    </div>
  );
};

// Широкая улица Бишкека: горы, панельные дома, тополя, дорога, арык.
// Камера ведёт машину: дальние слои смещаются медленнее, ближние быстрее.
// За рулём мама (сын сзади) или папа один (сцена 08).
export const Street: React.FC<{ readonly f: number; readonly from: number; readonly driver?: "mom" | "dad" }> = ({ f, from, driver = "mom" }) => {
  const t = f - from;
  const S = 1.55; // масштаб машины
  const carX = 400 + t * 6;
  const carY = 1250;
  const road = 18; // скорость дороги относительно кадра (px/кадр)
  const wheel = (((6 + road) * t) / (38 * S)) * (180 / Math.PI);
  const pan = (k: number) => -t * k;
  const toFrame = (vx: number, vy: number) => ({ x: carX + vx * S, y: carY + vy * S });
  const momHead = toFrame(84, -126);
  const sonHead = toFrame(-50, -118);
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" })}>
      <Sky w={1080} h={1100} />
      <div style={box({ left: pan(0.5), top: 0 })}>
        <Mountains x={-300} y={330} w={1900} h={380} />
      </div>
      <div style={box({ left: pan(4), top: 0 })}>
        <PanelHouse x={-180} y={930} w={480} floors={4} color="#E3D5C6" seed={2} />
        <PanelHouse x={400} y={940} w={520} floors={3} color="#D9CFC2" seed={5} />
        <PanelHouse x={1010} y={930} w={480} floors={4} color="#E1D3C1" seed={9} />
      </div>
      {/* дальний тротуар и тополя */}
      <div style={box({ left: 0, top: 920, width: 1080, height: 90, backgroundColor: "#DAD3C7" })} />
      <div style={box({ left: pan(12), top: 0 })}>
        {[-40, 300, 640, 980, 1320, 1660].map((x, i) => (
          <Tree key={x} x={x} y={985} s={i % 2 ? 0.95 : 1.05} kind="poplar" />
        ))}
      </div>
      <div style={box({ left: 0, top: 1000, width: 1080, height: 14, backgroundColor: "#EFECE6" })} />
      {/* дорога */}
      <div style={box({ left: 0, top: 1014, width: 1080, height: 270, backgroundColor: "#6E737E" })} />
      <div style={box({ left: 0, top: 1110, width: 1080, height: 10, backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.75) 0 90px, transparent 90px 190px)", backgroundPositionX: -(t * road) })} />
      {/* ближний бордюр, арык, тротуар, газон */}
      <div style={box({ left: 0, top: 1284, width: 1080, height: 22, backgroundColor: "#EFECE6" })} />
      <div style={box({ left: 0, top: 1306, width: 1080, height: 46, backgroundColor: "#A9A39A" })} />
      <div style={box({ left: 0, top: 1316, width: 1080, height: 26, background: "linear-gradient(180deg, #6E9CB8, #8FB8CF)" })} />
      <div style={box({ left: 0, top: 1352, width: 1080, height: 300, backgroundColor: "#DAD3C7" })} />
      <div style={box({ left: 0, top: 1352, width: 1080, height: 300, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 3px, transparent 3px 160px)", backgroundPositionX: -(t * 22) })} />
      <div style={box({ left: 0, top: 1652, width: 1080, height: 300, backgroundColor: "#9CC07E" })} />
      {/* серебристая семейная машина: мама за рулём, сын сзади */}
      <Car x={carX} y={carY} s={S} color="#AEB4BE" wheel={wheel} />
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        {driver === "mom" ? (
          <g transform={`translate(${momHead.x} ${momHead.y}) scale(${S})`}>
            <rect x={-9} y={10} width={18} height={14} fill={MOM.skin} />
            <path d="M -26 30 Q -24 14 0 14 Q 24 14 26 30 Z" fill={MOM.inner} />
            <circle r={19} fill={MOM.skin} />
            <path d="M -21 6 Q -25 -22 -2 -23 Q 20 -23 22 -6 Q 8 -12 0 -4 L -8 16 Q -20 18 -21 6 Z" fill={MOM.hair} />
            <circle cx={10} cy={-1} r={2.2} fill="#2A201D" />
          </g>
        ) : (
          <g transform={`translate(${momHead.x} ${momHead.y - 4}) scale(${S})`}>
            <rect x={-9} y={10} width={18} height={14} fill={DAD.skin} />
            <path d="M -28 30 Q -26 14 0 14 Q 26 14 28 30 Z" fill={DAD.topColor} />
            <circle r={20} fill={DAD.skin} />
            <path d="M -20 -2 Q -22 -24 0 -24 Q 21 -24 21 -6 Q 8 -14 -6 -10 L -12 2 Z" fill={DAD.hair} />
            <circle cx={11} cy={-1} r={2.2} fill="#221B19" />
          </g>
        )}
        {driver === "mom" ? <g transform={`translate(${sonHead.x} ${sonHead.y}) scale(${S})`}>
          <path d="M -20 30 Q -18 14 0 14 Q 18 14 20 30 Z" fill={SON.topColor} />
          <circle r={15} fill={SON.skin} />
          <path d="M -16 0 Q -17 -17 0 -17 Q 15 -17 16 -6 Q 4 -10 -6 -6 L -10 6 Z" fill={SON.hair} />
          <circle cx={8} cy={0} r={2} fill="#221B19" />
        </g> : null}
      </svg>
      {/* стекло поверх голов */}
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`translate(${carX} ${carY}) scale(${S})`}>
          <path d="M -112 -110 Q -78 -158 -12 -160 L 62 -158 Q 112 -154 146 -112 Z" fill="rgba(190,215,235,0.3)" />
          <path d="M -70 -150 L -40 -150 L -90 -112 L -112 -112 Z" fill="rgba(255,255,255,0.22)" />
          <rect x={14} y={-160} width={10} height={50} fill="#AEB4BE" />
        </g>
      </svg>
    </div>
  );
};

export const MondayScene: React.FC = () => {
  const f = useCurrentFrame();
  const vo08 = useLine("vo08");
  const vo09 = useLine("vo09");
  const vo10 = useLine("vo10");
  const vo11 = useLine("vo11");
  const B = beats(vo08, vo09, vo10, vo11);

  // ---------- 1. офис: мама за работой ----------
  const momDesk = seated("mom", OFFICE.seat);
  const typing = (t: number, side: -1 | 1) => (t < B.glow + 3 ? Math.max(0, Math.sin((t + (side > 0 ? 2.5 : 0)) * 0.95)) * 5 : 0);
  const deskPose = (t: number): PoseIn => ({
    expr: t < B.glow + 4 ? "calm" : "neutral",
    sit: 1,
    seat: seatOf(momDesk),
    lean: keys(t, [[0, 4], [B.glow + 3, 4], [B.glow + 12, 7]]),
    armL: { target: { x: LAP.x - 40, y: DESK - 10 - typing(t, -1) }, shape: "relax", elbow: "hang", behind: false },
    armR: { target: { x: LAP.x + 40, y: DESK - 10 - typing(t, 1) }, shape: "relax", elbow: "hang", behind: false },
    lookY: keys(t, [[0, 0.45], [B.glow + 3, 0.45], [B.glow + 11, 0.7]]),
    nod: keys(t, [[B.glow + 3, 0], [B.glow + 11, 4]]),
  });
  const deskFace = (t: number) => keys(t, [[0, 0], [B.glow + 2, 0], [B.glow + 11, 0.45]]);
  const phoneGlow = clamp((f - B.glow) / 4);
  const office1 = (
    <>
      <OfficeBack who="mom" minutes={12 * 60 + 55 + f / 300} />
      <OfficeChair x={momDesk.x} />
      <Actor uid="m4-mom-d" look="mom" f={f} place={() => momDesk} face={deskFace} pose={deskPose} seed={1} layer="body" />
      <DeskFront />
      <Mug x={720} y={DESK + 14} pencils />
      <KeysOnDesk x={KEYS_AT.x} y={KEYS_AT.y} />
      <PhoneOnTable x={OFFICE.phone.x} y={OFFICE.phone.y} glow={phoneGlow} />
      {/* руки на клавиатуре — за крышкой ноутбука */}
      <Actor uid="m4-mom-d" look="mom" f={f} place={() => momDesk} face={deskFace} pose={deskPose} seed={1} layer="arms" />
      <LaptopFront x={LAP.x} y={LAP.y} open={1} />
    </>
  );

  // ---------- 3. школа ----------
  const SON_AT = { x: 1040, y: 1790 };
  const MOM_A = { x: 610, y: 1800 };
  const MOM_B = { x: 860, y: 1800 };
  const AWAY = -250; // на сколько уходят влево (план обрывается на ходу)
  const offDur = 40;
  const momS = (t: number): Place =>
    t < B.walkOff ? walk(t, B.school, B.arrive, MOM_A, MOM_B, H.mom, 0.3) : walk(t, B.walkOff, B.walkOff + offDur, MOM_B, { x: MOM_B.x + AWAY, y: MOM_B.y }, H.mom, 0.4);
  const sonS = (t: number): Place =>
    t < B.walkOff ? placeAt(SON_AT.x, SON_AT.y, H.son) : walk(t, B.walkOff, B.walkOff + offDur, SON_AT, { x: SON_AT.x + AWAY, y: SON_AT.y }, H.son, 0.4);
  // точка, где руки встречаются: между свободными кистями мамы и сына
  const handAt = (t: number): Vec => {
    const m = hangOf("mom", momS(t), 1);
    const s = hangOf("sonSchool", sonS(t), -1);
    return { x: lerp(m.x, s.x, 0.55), y: lerp(m.y, s.y, 0.28) - 10 };
  };
  const teacher = placeAt(1192, 1736, H.teacher);
  const sees = B.school + 4; // сын увидел маму
  const momSchoolPose = (t: number): PoseIn => {
    const p = momS(t);
    const holding = t >= B.take;
    return {
      expr: t < B.arrive - 6 ? "calm" : t < vo09.from - 2 ? "softSmile" : "smile",
      bagOnShoulder: 1,
      lean: keys(t, [[B.arrive - 2, 0], [vo09.from - 2, 9], [B.walkOff - 4, 9], [B.walkOff + 8, 1]]),
      nod: keys(t, [[vo09.from, 0], [vo09.from + 6, 5], [vo09.to + 6, 2], [vo10.to, 0]]),
      headTilt: keys(t, [[B.arrive - 4, 0], [vo09.from, 5], [B.walkOff, 5], [B.walkOff + 8, 0]]),
      // ключи от машины — в руке
      armL: { target: null, shape: "fist", item: "keys" },
      armR: holding
        ? { target: handAt(t), shape: "fist", elbow: "down", behind: false }
        : t >= B.offer
          ? { target: keysV(t, [[B.offer, hangOf("mom", p, 1)], [B.take, handAt(B.take)]], anticipate), shape: "open", wrist: -12, elbow: "down", behind: false }
          : { target: null, shape: "relax" },
      lookY: keys(t, [[B.arrive - 6, 0], [B.arrive + 4, 0.3], [B.offer, 0.3], [B.offer + 6, 0.45], [B.take + 2, 0.45], [B.walkOff + 4, 0.1]]),
    };
  };
  const momSchoolFace = (t: number) => keys(t, [[B.school, 0.5], [B.arrive - 4, 0.5], [B.arrive + 4, 0.55], [B.walkOff - 2, 0.55], [B.walkOff + 6, -0.5]]);
  const sonSchoolPose = (t: number): PoseIn => {
    const p = sonS(t);
    const reach = vo10.from + 2;
    const holding = t >= B.take;
    const waveK = keys(t, [[sees, 0], [sees + 7, 1], [B.arrive - 6, 1], [B.arrive + 4, 0]]);
    return {
      expr: t < sees ? "calm" : "smile",
      // на «Кеттик!» — радостно подпрыгивает плечами
      crouch: keys(t, [[vo10.from - 6, 0], [vo10.from - 1, 0.1], [vo10.from + 4, 0], [vo10.from + 10, 0.03], [vo10.from + 15, 0]]),
      shoulders: keys(t, [[vo10.from - 2, 0], [vo10.from + 3, 0.8], [vo10.from + 14, 0]]),
      lean: keys(t, [[vo09.from - 4, 0], [vo09.from + 4, -3], [vo10.from, -3], [vo10.from + 6, 4], [B.walkOff, 2]]),
      nod: keys(t, [[vo10.from, 0], [vo10.from + 5, 7], [vo10.from + 12, 0]]),
      headTilt: keys(t, [[vo09.from, 0], [vo09.from + 8, -6], [vo10.from, -6], [vo10.from + 8, -2]]),
      armL: holding
        ? { target: handAt(t), shape: "fist", elbow: "down", behind: false }
        : t >= reach
          ? { target: keysV(t, [[reach, hangOf("sonSchool", p, -1)], [B.take, handAt(B.take)]], anticipate), shape: "open", elbow: "down", behind: false }
          : waveK > 0
            ? waving("sonSchool", p, -1, waveK, t)
            : { target: null, shape: "relax" },
      armR: { target: null, shape: "relax" },
      strapTug: 0.5,
      lookY: keys(t, [[B.arrive - 4, 0], [B.arrive + 4, -0.3], [B.walkOff, -0.3], [B.walkOff + 8, 0]]),
    };
  };
  const sonSchoolFace = (t: number) => keys(t, [[B.school, -0.3], [sees, -0.55], [B.arrive, -0.5]]);
  const teacherPose = (t: number): PoseIn => {
    const waveK = keys(t, [[B.walkOff - 2, 0], [B.walkOff + 6, 1]]);
    return {
      expr: "softSmile",
      armL: { target: { x: teacher.x - 0.06 * teacher.h, y: teacher.y - 0.5 * teacher.h }, shape: "fist", item: "notebook", elbow: "down" },
      armR: waveK > 0 ? waving("teacher", teacher, 1, waveK, t) : { target: null, shape: "relax" },
      nod: keys(t, [[B.arrive - 2, 0], [B.arrive + 6, 6], [B.arrive + 16, 0]]),
      lookY: 0.1,
    };
  };
  const teacherFace = (t: number) => keys(t, [[B.school, -0.3], [B.arrive, -0.45]]);
  const school = (
    <>
      <SchoolBack minutes={13 * 60 + 18 + (f - B.school) / 300} />
      <Actor uid="m4-teacher" look="teacher" f={f} place={() => teacher} face={teacherFace} pose={teacherPose} seed={5} />
      <SchoolFence />
      <Actor uid="m4-son-s" look="sonSchool" f={f} place={sonS} face={sonSchoolFace} pose={sonSchoolPose} role="son" seed={4} walkFrom={B.school} />
      <Actor uid="m4-mom-s" look="mom" f={f} place={momS} face={momSchoolFace} pose={momSchoolPose} role="mother" seed={1} walkFrom={B.school} />
      <SidewalkTrees />
    </>
  );

  // ---------- 4b. дома ----------
  const sonH = placeAt(840, 1700, H.son);
  const putAt = B.home + 9; // рюкзак коснулся пола
  const kH = sonH.h / 1000;
  const packW = SON.build.shoulderHalf * 1.76 * kH;
  const packH = (SON.build.hipY - SON.build.shoulderY) * 1.04 * kH;
  const packFloorY = sonH.y + 6;
  const handle = 16 * kH * 1.6;
  const packGrip = { x: sonH.x + 0.27 * sonH.h, y: packFloorY - packH - handle };
  const sonGrip = (t: number) => keysV(t, [[B.home, { x: packGrip.x - 6, y: packGrip.y - 34 }], [putAt, packGrip]], easeOut);
  const sonHomePose = (t: number): PoseIn => {
    const holding = t < putAt;
    const waveK = keys(t, [[putAt + 10, 0], [putAt + 18, 1]]);
    const g = sonGrip(t);
    return {
      expr: "smile",
      packOff: true,
      crouch: keys(t, [[B.home, 0.5], [putAt, 0.56], [putAt + 3, 0.56], [putAt + 15, 0]]),
      lean: keys(t, [[B.home, 14], [putAt, 15], [putAt + 3, 15], [putAt + 15, 0]]),
      armR: holding
        ? { target: { x: g.x, y: g.y - 12 * kH }, shape: "fist", elbow: "out", behind: false }
        : t < putAt + 16
          ? { target: keysV(t, [[putAt, { x: packGrip.x, y: packGrip.y - 12 * kH }], [putAt + 14, hangOf("sonSchool", sonH, 1)]], easeOut), shape: "relax", elbow: "out" }
          : { target: null, shape: "relax" },
      armL: waveK > 0 ? waving("sonSchool", sonH, -1, waveK, t) : { target: null, shape: "relax" },
      lookY: keys(t, [[B.home, 0.5], [putAt + 2, 0.5], [putAt + 12, -0.05]]),
    };
  };
  const sonHomeFace = (t: number) => keys(t, [[B.home, 0.25], [putAt + 4, 0.25], [putAt + 12, -0.55]]);
  const packPos = (t: number) => (t < putAt ? sonGrip(t) : packGrip);
  const momLeave = B.home + 26;
  const MOM_H = { x: 400, y: 1700 };
  const momH = (t: number) => walk(t, momLeave, momLeave + 30, MOM_H, { x: MOM_H.x - 330, y: MOM_H.y }, H.mom, 0.35);
  const momHomePose = (t: number): PoseIn => {
    const p = momH(t);
    const waveK = keys(t, [[B.home, 0.8], [B.home + 4, 1], [momLeave - 8, 1], [momLeave, 0]]);
    return {
      expr: "smile",
      bagOnShoulder: 1,
      armR: waveK > 0 ? waving("mom", p, 1, waveK, t) : { target: null, shape: "relax" },
      armL: { target: null, shape: "fist", item: "keys" },
      headTilt: keys(t, [[B.home, 4], [momLeave, 0]]),
    };
  };
  const momHomeFace = (t: number) => keys(t, [[B.home, 0.5], [momLeave - 6, 0.5], [momLeave + 2, -0.8]]);
  const backpack = (() => {
    const p = packPos(f);
    return (
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`translate(${p.x} ${p.y})`}>
          {f >= putAt ? <ellipse cx={0} cy={packFloorY - p.y + 2} rx={packW * 0.62} ry={7} fill="rgba(25,30,60,0.16)" /> : null}
          <path d={`M ${-packW * 0.16} ${handle} Q 0 ${-handle * 0.3} ${packW * 0.16} ${handle}`} stroke="#14285A" strokeWidth={6} fill="none" strokeLinecap="round" />
          <rect x={-packW / 2} y={handle} width={packW} height={packH} rx={packW * 0.2} fill={SON.backpack} />
          <rect x={-packW * 0.34} y={handle + packH * 0.52} width={packW * 0.68} height={packH * 0.36} rx={10} fill="#B8892F" />
          <rect x={-packW * 0.2} y={handle + packH * 0.1} width={packW * 0.4} height={6} rx={3} fill="#FFFFFF" opacity={0.3} />
        </g>
      </svg>
    );
  })();
  const home = (
    <>
      <LivingBack minutes={13 * 60 + 42 + (f - B.home) / 300} />
      <ChairBack x={LIVING.seat.mom} />
      <ChairBack x={LIVING.seat.dad} />
      <ChairBack x={LIVING.seat.son} h={600} />
      <TableFront />
      <Mug x={1470} y={LIVING.table.top + 14} />
      {backpack}
      <Actor uid="m4-son-h" look="sonSchool" f={f} place={() => sonH} face={sonHomeFace} pose={sonHomePose} seed={4} />
      <Actor uid="m4-mom-h" look="mom" f={f} place={momH} face={momHomeFace} pose={momHomePose} seed={1} walkFrom={B.home} />
    </>
  );

  // ---------- 4c. снова в офисе ----------
  const sitAt = B.office + 10;
  const momBack = (t: number): Place => {
    const p = walk(t, B.office - 4, sitAt + 2, { x: 1290, y: OFFICE.seatY }, { x: OFFICE.seat, y: OFFICE.seatY }, H.mom, 0.3);
    return { ...p, h: H.mom };
  };
  const keysDown = sitAt + 20; // ключи легли на стол
  const backPose = (t: number): PoseIn => {
    const p = momBack(t);
    const s = sitDown(t, sitAt, 24);
    const hand = { x: KEYS_AT.x + 4, y: KEYS_AT.y - 24 };
    return {
      expr: t < keysDown ? "calm" : "softSmile",
      sit: s.sit,
      seat: seatOf(momDesk),
      lean: s.lean + keys(t, [[keysDown - 10, 0], [keysDown - 2, 6], [keysDown + 10, 4]]),
      armL:
        t < keysDown
          ? { target: keysV(t, [[sitAt + 6, hangOf("mom", p, -1)], [keysDown, hand]], easeInOut), shape: "fist", item: "keys", elbow: t < sitAt + 12 ? "down" : "hang", behind: false }
          : { target: keysV(t, [[keysDown + 2, hand], [keysDown + 14, { x: LAP.x - 40, y: DESK - 10 }]], easeInOut), shape: "relax", elbow: "hang", behind: false },
      armR: t < sitAt + 10 ? { target: null, shape: "relax" } : { target: keysV(t, [[sitAt + 10, hangOf("mom", p, 1)], [sitAt + 26, { x: LAP.x + 40, y: DESK - 10 }]], easeInOut), shape: "relax", elbow: "hang", behind: false },
      lookY: keys(t, [[sitAt, 0.1], [keysDown - 8, 0.6], [keysDown + 6, 0.45]]),
    };
  };
  const backFace = (t: number) => keys(t, [[B.office, -0.7], [sitAt - 2, -0.5], [sitAt + 8, -0.1], [keysDown - 8, -0.3], [keysDown + 8, 0]]);
  const office2 = (
    <>
      <OfficeBack who="mom" minutes={14 * 60 + 3 + (f - B.office) / 300} />
      <OfficeChair x={momDesk.x} />
      <Actor uid="m4-mom-o" look="mom" f={f} place={momBack} face={backFace} pose={backPose} seed={1} layer="body" walkFrom={B.office} />
      <DeskFront />
      <Mug x={720} y={DESK + 14} pencils />
      {f >= keysDown ? <KeysOnDesk x={KEYS_AT.x} y={KEYS_AT.y} /> : null}
      <PhoneOnTable x={OFFICE.phone.x} y={OFFICE.phone.y} />
      <Actor uid="m4-mom-o" look="mom" f={f} place={momBack} face={backFace} pose={backPose} seed={1} layer="arms" walkFrom={B.office} />
      <LaptopFront x={LAP.x} y={LAP.y} open={1} />
    </>
  );

  const deskCam = { x: 1080, y: 1120, zoom: 1.85 };
  const schoolA = { x: 975, y: 1410, zoom: 1.44 };
  const schoolB = { x: 965, y: 1405, zoom: 1.5 };
  return (
    <>
      <Shot f={f} from={0} to={B.insert} cam={camMove(f, 0, B.insert, deskCam, { ...deskCam, x: 1095, zoom: 1.92 })}>
        {office1}
      </Shot>
      {f >= B.insert && f < B.school ? <DeskInsert f={f} B={B} /> : null}
      <Shot f={f} from={B.school} to={B.drive} cam={f < B.walkOff - 4 ? camMove(f, B.school, B.walkOff - 4, schoolA, schoolB) : camMove(f, B.walkOff - 4, B.drive + 10, schoolB, { ...schoolB, x: 880 }, easeIn)}>
        {school}
      </Shot>
      <Shot f={f} from={B.drive} to={B.home} cam={{ x: 540, y: 960, zoom: 1 }}>
        <Street f={f} from={B.drive} />
      </Shot>
      <Shot f={f} from={B.home} to={B.office} cam={camMove(f, B.home, B.office, { x: 630, y: 1320, zoom: 1.36 }, { x: 650, y: 1320, zoom: 1.4 })}>
        {home}
      </Shot>
      <Shot f={f} from={B.office} to={9999} cam={camMove(f, B.office, B.office + 46, { ...deskCam, x: 1120 }, { ...deskCam, x: 1090, zoom: 1.9 })}>
        {office2}
      </Shot>
      <DayLabel text={PHT_WEEK[0].label} f={f} from={2} hold={62} />
    </>
  );
};

export const sound: SceneSound = (ctx) => {
  const B = beats(ctx.line("vo08"), ctx.line("vo09"), ctx.line("vo10"), ctx.line("vo11"));
  return [
    // одно мягкое напоминание
    { at: B.glow, src: COMMON("notify"), volume: 0.28 },
    { at: B.grab, src: TS2("keys"), volume: 0.2, dur: 1.0, fade: 0.2 },
    { at: B.drive, src: COMMON("car"), volume: 0.12, dur: 1.0, fade: 0.3 },
    { at: B.office + 14, src: TS2("chair"), volume: 0.14 },
    { at: B.office + 30, src: TS2("keys"), volume: 0.1, dur: 0.6, fade: 0.15 },
  ];
};
