// Шаг 6, врезка «Айдоочу өзү жазып кабарлайт». Утро у панельного дома:
// белая машина ПРИПАРКОВАНА у бордюра (колёса не крутятся, внутри никого),
// постоянный водитель стоит на тротуаре перед ней и САМ набирает сообщение
// указательным пальцем свободной руки → в крупном плане карточки группы
// (та же карточка, что на панели 5/6) появляется входящий пузырь «Жолго
// чыктым». Короткий скачок времени: растворяется только фон (дом → школа,
// утро → позже), машина так же стоит; водитель снова пишет → «Жеткирдим».
// Телефон — только когда машина стоит и водитель снаружи. Без
// push-уведомлений, карт и галочек доставки.
// Мир врезки совпадает с кадром при камере (540, 960, ×1).
import { Block, Car, Mountains, Poplar, SchoolBuilding } from "../art";
import { box, Shot, Svg, type Cam } from "../kit";
import { P5Chat, P5Head } from "../panels/P5";
import { Actor, atBody, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, easeOut, lerp, smoothstep } from "../rig/motion";
import { EXPR, mixExpr } from "../rig/pose";
import { C, F } from "../theme";

// Моменты врезки (кадры сцены) — считает Step56.
export type InsertBeats = {
  readonly insA: number; // врезка начинается (растворение 6 кадров)
  readonly type1: number; // водитель набирает у дома
  readonly send1: number; // сам нажимает «жөнөтүү»
  readonly msg1: number; // «Жолго чыктым» в группе
  readonly jumpA: number; // скачок времени (растворение 8 кадров)
  readonly type2: number; // набирает у школы
  readonly send2: number;
  readonly msg2: number; // «Жеткирдим»
  readonly insB: number; // возврат к ленте
};
const JUMP = 8;

// ---------- расстановка (мир = кадр при камере ×1) ----------
// Водитель близко к камере (крупнее), машина — за ним у бордюра: по
// перспективе (горизонт ≈ 965) пропорции человека и машины совпадают.
const DRV = { x: 346, y: 2124, h: 1450 } as const;
const placeDrv = () => DRV;
const CAR = { x: 880, y: 1300 - 8 * 1.9, s: 1.9 } as const; // низ колёс ≈ 1300
const HORIZON = 965;

// Телефон в руке (точка запястья, единицы рисунка от ступней).
const PHONE_W = { x: -6, y: -650 } as const;

// ---------- фон ----------
const Sky: React.FC<{ readonly loc: 1 | 2 }> = ({ loc }) => (
  <>
    <div
      style={box({
        left: -400,
        top: -300,
        width: 1900,
        height: HORIZON + 300 + 40,
        background: loc === 1 ? "linear-gradient(180deg, #CFE3F7 0%, #E9F1F8 55%, #FFEBC9 100%)" : "linear-gradient(180deg, #C9E2FA 0%, #E6F1FC 60%, #F5F9FE 100%)",
      })}
    />
    {/* солнце: утром низко и тепло, позже выше и светлее */}
    <div
      style={box({
        left: loc === 1 ? 70 : 150,
        top: loc === 1 ? 700 : 380,
        width: 190,
        height: 190,
        borderRadius: 999,
        background: loc === 1 ? "radial-gradient(circle, #FFE7A6 0%, #FFE7A6 34%, rgba(255,231,166,0) 70%)" : "radial-gradient(circle, #FFF6D8 0%, #FFF6D8 30%, rgba(255,246,216,0) 70%)",
      })}
    />
  </>
);

const Far: React.FC<{ readonly f: number; readonly loc: 1 | 2 }> = ({ f, loc }) => {
  const sway = Math.sin(f / 30) * 1.1;
  return (
    <Svg>
      <Mountains w={1700} h={300} x={-320} y={HORIZON + 4} far />
      <Mountains w={1400} h={190} x={-180} y={HORIZON + 14} />
      <rect x={-400} y={HORIZON + 10} width={1900} height={200} fill={loc === 1 ? "#E4ECDD" : "#E6EEDF"} />
      {loc === 1 ? <Block x={-150} y={1104} w={300} floors={4} color="#EBDDC6" lit={0.15} /> : null}
      <Poplar x={150} y={1112} h={440} sway={sway} />
      <Poplar x={262} y={1116} h={360} sway={-sway * 0.8} />
      <Poplar x={1060} y={1118} h={400} sway={sway * 0.9} />
    </Svg>
  );
};

// Здание за машиной: утром — панельный дом, позже — школа.
// Табличка «Мектеп» — ниже плашки под карточкой группы и левее кнопок Reels.
const Building: React.FC<{ readonly loc: 1 | 2 }> = ({ loc }) => (
  <Svg>
    {loc === 1 ? <Block x={500} y={1124} w={640} floors={5} lit={0.25} /> : <SchoolBuilding x={486} y={1145} w={524} />}
  </Svg>
);

// Дорога, бордюр и тротуар (вид чуть сверху).
const Street: React.FC = () => (
  <Svg>
    <rect x={-400} y={1122} width={1900} height={22} fill="#D9DFE7" />
    <rect x={-400} y={1144} width={1900} height={164} fill={C.road} />
    <path d="M -400 1226 H 1500" stroke={C.roadLine} strokeWidth={6} strokeDasharray="60 46" opacity={0.8} />
    <rect x={-400} y={1306} width={1900} height={16} fill="#C7CFDA" />
    <rect x={-400} y={1322} width={1900} height={800} fill="#EEF1F5" />
    {[1372, 1440, 1530, 1650, 1800].map((y) => (
      <path key={y} d={`M -400 ${y} H 1500`} stroke="#E0E5EC" strokeWidth={3} />
    ))}
  </Svg>
);

// ---------- водитель ----------
// Нажатия: палец свободной руки ходит по экрану маленькими шагами.
const KEYS = [
  { x: -7, y: 4 },
  { x: 5, y: 0 },
  { x: -2, y: 7 },
  { x: 8, y: 3 },
  { x: -5, y: -2 },
  { x: 2, y: 5 },
] as const;
const TAP = 4; // кадров на нажатие
const hump = (x: number, a: number, b: number) => (x <= a || x >= b ? 0 : Math.sin((Math.PI * (x - a)) / (b - a)));

const typingAt = (f: number, a: number, send: number) => {
  // 0…1: рука подходит к телефону; затем нажатия до send; нажатие send
  const reach = smoothstep((f - (a - 8)) / 8) * (1 - smoothstep((f - (send + 4)) / 10));
  let dx = 0;
  let dy = 0;
  if (f >= a && f < send - 3) {
    const ph = (f - a) / TAP;
    const i = Math.floor(ph);
    const fr = ph - i;
    const k0 = KEYS[i % KEYS.length];
    const k1 = KEYS[(i + 1) % KEYS.length];
    const m = smoothstep(fr * 1.6);
    dx = lerp(k0.x, k1.x, m);
    dy = lerp(k0.y, k1.y, m) - 3.5 * Math.sin(Math.PI * fr);
  } else if (f >= send - 3) {
    // к кнопке отправки (справа внизу экрана) и нажатие
    const g = smoothstep((f - (send - 3)) / 3);
    dx = lerp(KEYS[0].x, 11, g);
    dy = lerp(KEYS[0].y, 20, g) + (f >= send && f <= send + 2 ? 3 : 0);
  }
  return { reach, dx, dy };
};

// Экран телефона — чуть правее и выше запястья левой руки (единицы
// рисунка); локоть свободной руки при elbow "hang" — примерно под плечом.
// Кисть ставится на линию «локоть → кончик пальца», поэтому указательный
// всегда смотрит в экран (предплечье в ракурсе — к зрителю).
// Кончик пальца — в нижнюю середину экрана телефона.
const SCREEN = { dx: 6, dy: -6 } as const;
const ELBOW_R = { x: 89, y: -611 } as const;
const FINGER = 58; // от запястья до кончика указательного
// взгляд вниз на экран: веки опущены немного, зрачки — вниз (не «прищур»)
const LOOK_DOWN = { browIn: 1, browOut: -0.5, lid: 0.38, smile: 0.15 } as const;

// Водитель один на всю врезку (через скачок времени поза непрерывна):
// пишет у дома → поднимает взгляд → снова опускает и пишет у школы.
const Driver: React.FC<{ readonly f: number; readonly B: InsertBeats }> = ({ f, B }) => {
  const pose = (t: number): PoseIn => {
    // какая из двух записей сейчас (между ними рука свободно опущена)
    const second = t >= (B.send1 + B.type2) / 2;
    const ty = second ? typingAt(t, B.type2, B.send2) : typingAt(t, B.type1, B.send1);
    // взгляд: на телефон → вверх после отправки → снова на телефон
    const up1 = smoothstep((t - (B.send1 + 6)) / 14);
    const down2 = smoothstep((t - (B.type2 - 14)) / 12);
    const up2 = smoothstep((t - (B.send2 + 6)) / 14);
    const after = clamp(up1 * (1 - down2) + up2);
    const lift = 22 * smoothstep((t - (B.type1 - 10)) / 10) - 30 * after;
    const pw = { x: PHONE_W.x, y: PHONE_W.y - lift };
    // свободная рука: от бедра к экрану, указательный касается экрана
    const tip = { x: pw.x + SCREEN.dx + ty.dx, y: pw.y + SCREEN.dy + 6 + ty.dy };
    const ex = tip.x - ELBOW_R.x;
    const ey = tip.y - ELBOW_R.y;
    const d = Math.hypot(ex, ey) || 1;
    const fore = Math.max(14, d - FINGER);
    const typeW = { x: ELBOW_R.x + (ex / d) * fore, y: ELBOW_R.y + (ey / d) * fore };
    const rest = { x: 70, y: -470 };
    const hand = { x: lerp(rest.x, typeW.x, ty.reach), y: lerp(rest.y, typeW.y, ty.reach) };
    return {
      // взгляд вниз на экран: веки чуть опущены; после отправки — улыбка
      expr: mixExpr(LOOK_DOWN, EXPR.softSmile, after),
      lookY: lerp(2.3, 0, after),
      lookX: lerp(-0.12, 0.35, after),
      // голова наклонена к телефону; после отправки — короткий кивок
      nod: lerp(30, 2, after) + 4 * (hump(t, B.send1 + 10, B.send1 + 28) + hump(t, B.send2 + 10, B.send2 + 28)),
      headTilt: lerp(-4, 3, after) + Math.sin(t / 37) * 0.8,
      armL: { target: atBody(DRV, pw.x, pw.y), shape: "phone", item: "phone", itemColor: "#26386A", elbow: "hang", glow: 1 },
      armR: { target: atBody(DRV, hand.x, hand.y), shape: ty.reach > 0.35 ? "point" : "relax", elbow: "hang", wrist: -6 * ty.reach },
    };
  };
  const face = (t: number) => {
    const up = clamp(smoothstep((t - (B.send1 + 6)) / 16) * (1 - smoothstep((t - (B.type2 - 14)) / 12)) + smoothstep((t - (B.send2 + 6)) / 16));
    return lerp(0.02, 0.38, up);
  };
  // Руки — отдельным слоем с мягкой тенью: синие рукава не сливаются с
  // таким же синим жакетом, видно, что предплечья перед грудью.
  return (
    <>
      <Actor uid="drv56" look="driver" f={f} place={placeDrv} face={face} pose={pose} seed={7} layer="body" />
      <div style={box({ left: 0, top: 0, width: 1, height: 1, filter: "drop-shadow(0 8px 5px rgba(12,20,44,0.45)) drop-shadow(0 0 2px rgba(165,185,220,1))" })}>
        <Actor uid="drv56a" look="driver" f={f} place={placeDrv} face={face} pose={pose} seed={7} layer="arms" />
      </div>
    </>
  );
};

// Фон места: 1 — панельный дом утром, 2 — школа позже.
const Back: React.FC<{ readonly f: number; readonly loc: 1 | 2; readonly cam: Cam }> = ({ f, loc, cam }) => {
  // параллакс: дальний план смещается вдвое меньше камеры
  const px = (cam.x - 540) * 0.5;
  const py = (cam.y - 960) * 0.5;
  return (
    <>
      <div style={box({ left: 0, top: 0, width: 1, height: 1, transform: `translate(${px}px, ${py}px)` })}>
        <Sky loc={loc} />
        <Far f={f} loc={loc} />
      </div>
      <Building loc={loc} />
    </>
  );
};

// ---------- крупный план карточки группы (слой кадра) ----------
export const CARD_BOX = { x: 342, y: 376, w: 572, head: 88, chat: 250 } as const;

const GroupCardClose: React.FC<{ readonly f: number; readonly B: InsertBeats }> = ({ f, B }) => {
  const t = f - (B.insA + 3);
  const k = easeOut(t / 12);
  if (k <= 0) return null;
  const { x, y, w, head, chat } = CARD_BOX;
  const rot = -1.2 + Math.sin(f / 40) * 0.25;
  return (
    <div
      style={box({
        left: x,
        top: y,
        width: w,
        height: head + chat,
        transform: `translateY(${(1 - k) * -36}px) rotate(${rot}deg)`,
        opacity: clamp(k * 1.5),
        borderRadius: 24,
        backgroundColor: C.paper,
        boxShadow: "0 20px 44px rgba(20,40,90,0.22)",
        padding: 8,
        boxSizing: "content-box",
      })}
    >
      <div style={box({ left: 8, top: 8, width: w, height: head + chat, borderRadius: 20, overflow: "hidden" })}>
        <P5Head w={w} h={head} title={32} />
        <div style={box({ left: 0, top: head, width: w, height: chat })}>
          <P5Chat w={w} h={chat} msgs={[f - B.msg1, f - B.msg2]} size={33} round={20} pad={16} />
        </div>
      </div>
      {/* тот же лист ленты: язычок «5/6» */}
      <div style={box({ right: -6, top: -18, padding: "4px 14px", borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontFamily: F.text, fontWeight: 900, fontSize: 26, lineHeight: 1.1, boxShadow: "0 4px 10px rgba(20,40,90,0.16)" })}>5/6</div>
    </div>
  );
};

export const Step56Insert: React.FC<{ readonly f: number; readonly B: InsertBeats; readonly opacity: number }> = ({ f, B, opacity }) => {
  if (opacity <= 0.001) return null;
  // скачок времени: меняется только фон (дом → школа, утро → позже);
  // машина стоит на том же месте, водитель — тот же
  const jump = easeInOut((f - B.jumpA) / JUMP);
  const q = clamp((f - B.insA) / (B.insB + 6 - B.insA));
  const cam: Cam = { x: lerp(550, 530, easeInOut(q)), y: lerp(968, 956, easeInOut(q)), zoom: lerp(1.0, 1.06, q) + 0.012 * jump };
  return (
    <div style={box({ inset: 0, opacity })}>
      <Shot f={f} cam={cam} bg="#EEF3F8">
        {jump < 1 ? <Back f={f} loc={1} cam={cam} /> : null}
        {jump > 0 ? (
          <div style={box({ left: 0, top: 0, width: 1, height: 1, opacity: jump })}>
            <Back f={f} loc={2} cam={cam} />
          </div>
        ) : null}
        <Street />
        {/* машина стоит: roll = 0, bounce = 0; внутри никого */}
        <Svg>
          <Car x={CAR.x} y={CAR.y} s={CAR.s} roll={0} bounce={0} kids={0} driver={false} />
        </Svg>
        <Driver f={f} B={B} />
      </Shot>
      <GroupCardClose f={f} B={B} />
    </div>
  );
};
