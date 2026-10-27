// Сцены 1–4 ролика BalaGo «Сабак бүттү». Моменты действий привязаны к словам
// диктора (wordFrame), поэтому монтаж следует за естественной озвучкой.
import { interpolate } from "remotion";
import { fontFamily } from "../fonts";
import { PhoneFlat } from "../two-schedules-2d/sets/Apartment";
import {
  clamp,
  cruise,
  easeInOut,
  easeOut,
  keys,
  lerp,
} from "../two-schedules-2d/rig/motion";
import { box } from "../two-schedules-2d/shots";
import { useScene } from "./context";
import { Actor, type Place, type PoseIn } from "./rig";
import { TC_TEXT } from "./script";
import {
  Belt,
  Classroom,
  Desk,
  HomeEntrance,
  LaptopBack,
  MeetingTable,
  Notebook,
  Office,
  RearCushion,
  RearRow,
  RouteStreet,
} from "./sets";
import { sceneBeats } from "./timing";
import {
  appear,
  Backdrop,
  Brand,
  C,
  Caption,
  IconSchool,
  KIDS,
  KidAvatar,
  MapView,
  Phone,
  Reminder,
  RouteStrip,
  WaChat,
  WhiteCar,
} from "./ui";

type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

// Кадрированная часть экрана со своим «миром» и камерой (центр и масштаб).
export const Panel: React.FC<{
  readonly top: number;
  readonly height: number;
  readonly cam: Cam;
  readonly children: React.ReactNode;
}> = ({ top, height, cam, children }) => (
  <div style={box({ left: 0, top, width: 1080, height, overflow: "hidden" })}>
    <div
      style={box({
        left: 0,
        top: 0,
        width: 1,
        height: 1,
        transformOrigin: "0 0",
        transform: `translate(${540 - cam.x * cam.zoom}px, ${height / 2 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
      })}
    >
      {children}
    </div>
  </div>
);

const still = (x: number, y: number, h: number) => () => ({ x, y, h });

// ---------- Офис: мама на рабочей встрече ----------
// Мир офиса: столешница — y 860, сидящие — ступни y 1040.
export const OFFICE = {
  table: 860,
  feet: 1040,
  mom: 470,
  phone: { x: 575, y: 868 },
} as const;
const MOM_SEAT: Place = { x: OFFICE.mom, y: OFFICE.feet, h: 760 };
const COL_M: Place = { x: 130, y: OFFICE.feet, h: 790 };
const COL_F: Place = { x: 905, y: OFFICE.feet, h: 760 };
const onTable = (x: number) => ({ x, y: OFFICE.table + 4 });

// Встреча: коллега справа говорит и жестикулирует, коллега слева кивает.
const Meeting: React.FC<{
  f: number;
  D: number;
  mom: (t: number) => PoseIn;
  momFace: (t: number) => number;
  phoneGlow: number;
  phoneShake?: number;
  phoneOnTable: boolean;
  scroll?: number;
}> = ({
  f,
  D,
  mom,
  momFace,
  phoneGlow,
  phoneShake = 0,
  phoneOnTable,
  scroll = 0,
}) => (
  <>
    <Office doc={TC_TEXT.hook.doc} scroll={scroll} />
    <Actor
      uid="col-m"
      look="colleagueM"
      f={f}
      span={D}
      place={still(COL_M.x, COL_M.y, COL_M.h)}
      face={() => 0.55}
      pose={(t) => ({
        sit: 1,
        seat: 210,
        expr: "calm",
        nod: 3 + 3 * Math.sin(t / 22),
        armL: { target: onTable(COL_M.x + 70), shape: "relax", elbow: "down" },
        armR: { target: onTable(COL_M.x + 170), shape: "relax", elbow: "down" },
      })}
      seed={7}
    />
    <Actor
      uid="col-f"
      look="colleagueF"
      f={f}
      span={D}
      place={still(COL_F.x, COL_F.y, COL_F.h)}
      face={() => -0.55}
      pose={(t) => ({
        sit: 1,
        seat: 205,
        expr: "softSmile",
        headTilt: 3 * Math.sin(t / 30),
        armL: {
          target: {
            x: COL_F.x - 150 + 18 * Math.sin(t / 9),
            y: OFFICE.table - 120 + 14 * Math.cos(t / 11),
          },
          shape: "open",
          elbow: "down",
          behind: false,
        },
        armR: { target: onTable(COL_F.x - 60), shape: "relax", elbow: "down" },
      })}
      seed={9}
    />
    <Actor
      uid="mom-office"
      look="mom"
      f={f}
      span={D}
      place={still(MOM_SEAT.x, MOM_SEAT.y, MOM_SEAT.h)}
      face={momFace}
      pose={mom}
      seed={1}
    />
    <MeetingTable top={OFFICE.table} />
    <LaptopBack x={COL_F.x - 150} y={OFFICE.table + 6} />
    <LaptopBack x={COL_M.x + 140} y={OFFICE.table + 6} />
    {phoneOnTable ? (
      <PhoneFlat
        x={OFFICE.phone.x}
        y={OFFICE.phone.y}
        glow={phoneGlow}
        shake={phoneShake}
        scale={1.3}
      />
    ) : null}
  </>
);

// ---------- 1. Уроки закончились, работа продолжается ----------
export const HookScene: React.FC = () => {
  const { f, D, slot } = useScene();
  const { bell, cap: capAt, brand: brandAt, line: lineAt } = sceneBeats(slot); // звонок и напоминание
  const glance = bell + 3;
  // ребёнок: закрывает тетрадь, смотрит на часы, улыбается
  const KID: Place = { x: 330, y: 985, h: 540 };
  const close = easeInOut((f - bell - 4) / 20);
  const kidPose = (t: number): PoseIn => {
    const c = easeInOut((t - bell - 4) / 20);
    return {
      sit: 1,
      seat: 190,
      expr: t > bell + 26 ? "smile" : "calm",
      lookY: keys(t, [
        [0, 0.55],
        [bell + 24, 0.55],
        [bell + 34, -0.35],
        [bell + 70, -0.35],
        [bell + 84, 0],
      ]),
      armL: {
        target: { x: KID.x - 55, y: 768 },
        shape: "relax",
        elbow: "down",
        behind: false,
      },
      armR: {
        target: {
          x: lerp(KID.x + 130, KID.x + 40, c),
          y: 768 - Math.sin(Math.PI * c) * 30,
        },
        shape: c > 0 && c < 1 ? "pinch" : "relax",
        elbow: "down",
      },
    };
  };
  const GIRL: Place = { x: 790, y: 905, h: 480 };
  // мама: напоминание → взгляд на телефон → короткая заминка → к коллегам
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: 205,
    expr: t < glance ? "calm" : t < glance + 50 ? "thinking" : "softSmile",
    lookY: keys(t, [
      [glance, 0],
      [glance + 6, 0.65],
      [glance + 34, 0.65],
      [glance + 42, 0],
    ]),
    nod: keys(t, [
      [glance, 0],
      [glance + 8, 7],
      [glance + 34, 7],
      [glance + 44, 0],
    ]),
    armL: { target: onTable(OFFICE.mom - 90), shape: "relax", elbow: "down" },
    armR: { target: onTable(OFFICE.mom + 80), shape: "relax", elbow: "down" },
  });
  const momFace = (t: number) =>
    keys(t, [
      [0, 0.35],
      [glance, 0.35],
      [glance + 8, 0.15],
      [glance + 36, 0.15],
      [glance + 48, -0.45],
      [glance + 90, -0.45],
      [glance + 110, 0.3],
    ]);
  const glow = f >= bell ? 1 - clamp((f - bell - 60) / 20) : 0;
  const shake = f >= bell && f < bell + 14 ? Math.sin(f * 2.4) * 3 : 0;
  // «13:00» соединяет обе половины, затем уступает место надписи
  const big = appear(f, 0, 8) * (1 - appear(f, capAt - 8, 10));
  // жёлтая линия напоминания уходит в следующую сцену
  const line = easeInOut((f - lineAt) / 14);
  return (
    <>
      <Backdrop />
      <Panel top={0} height={880} cam={{ x: 540, y: 560, zoom: 1 }}>
        <Classroom minutes={12 * 60 + 59 + clamp(f / bell)} />
        <Actor
          uid="girl-class"
          look="kidGirl"
          f={f}
          span={D}
          place={still(GIRL.x, GIRL.y, GIRL.h)}
          face={() => -0.2}
          pose={(t) => ({
            sit: 1,
            seat: 170,
            expr: t > bell + 10 ? "smile" : "calm",
            lookY: 0.4,
            armL: {
              target: { x: GIRL.x - 45, y: 708 },
              shape: "relax",
              elbow: "down",
              behind: false,
            },
            armR: {
              target: { x: GIRL.x + 45, y: 708 },
              shape: "relax",
              elbow: "down",
              behind: false,
            },
          })}
          seed={3}
        />
        <Desk x={600} y={700} w={380} />
        <Actor
          uid="kid-class"
          look="kid"
          f={f}
          span={D}
          place={still(KID.x, KID.y, KID.h)}
          face={(t) =>
            keys(t, [
              [0, 0],
              [bell + 24, 0],
              [bell + 34, 0.35],
              [bell + 84, 0.1],
            ])
          }
          pose={kidPose}
          seed={4}
        />
        <Desk x={120} y={760} w={460} />
        <Notebook x={KID.x + 30} y={762} close={close} />
      </Panel>
      <Panel top={1040} height={880} cam={{ x: 540, y: 700, zoom: 1.28 }}>
        <Meeting
          f={f}
          D={D}
          mom={momPose}
          momFace={momFace}
          phoneGlow={glow}
          phoneShake={shake}
          phoneOnTable
        />
      </Panel>
      {/* шов между половинами */}
      <div
        style={box({
          left: 0,
          top: 872,
          width: 1080,
          height: 170,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 0 24px rgba(20,40,90,0.12)",
        })}
      />
      <div
        style={box({
          left: 0,
          top: 950,
          width: 1080 * line,
          height: 14,
          borderRadius: 7,
          backgroundColor: C.yellow,
        })}
      />
      {big > 0 ? (
        <div
          style={box({
            left: 340,
            top: 882,
            width: 400,
            height: 150,
            borderRadius: 75,
            backgroundColor: C.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily,
            fontSize: 112,
            fontWeight: 1000,
            color: C.ink,
            opacity: big,
            scale: `${0.85 + 0.15 * big}`,
            boxShadow: "0 14px 30px rgba(20,40,90,0.2)",
          })}
        >
          {TC_TEXT.hook.time}
        </div>
      ) : null}
      <Caption
        f={f}
        at={capAt}
        lines={TC_TEXT.hook.caption}
        top={884}
        size={58}
        card={false}
        accent={1}
      />
      {f < capAt + 4 ? (
        <div style={box({ inset: 0, opacity: 1 - appear(f, capAt - 6, 10) })}>
          <Reminder f={f} at={bell} x={160} y={1060} w={760} />
        </div>
      ) : null}
      {/* небольшая подпись BalaGo — не закрывает героев */}
      <div
        style={box({
          left: 690,
          top: 222,
          opacity: appear(f, brandAt, 12),
          padding: "12px 22px",
          borderRadius: 26,
          backgroundColor: "rgba(255,255,255,0.92)",
          boxShadow: "0 8px 20px rgba(20,40,90,0.14)",
        })}
      >
        <Brand size={36} />
      </div>
    </>
  );
};

// ---------- 2. Услуга и оба направления ----------
export const ServiceScene: React.FC = () => {
  const { f, slot } = useScene();
  const { title, fwd0, fwd1, back0, back1 } = sceneBeats(slot);
  const road = 1235;
  // жёлтая линия из напоминания поднимается и становится маршрутом
  const rise = easeInOut(f / 16);
  const lineY = lerp(956, 590, rise);
  const lineW = lerp(1080, 700, rise);
  const draw = cruise((f - fwd0) / Math.max(1, fwd1 - fwd0));
  const back = cruise((f - back0) / Math.max(1, back1 - back0));
  const going = f < back0;
  const carX = going ? lerp(190, 880, draw) : lerp(880, 190, back);
  const nodes = appear(f, 10, 10);
  return (
    <>
      <Backdrop />
      <div
        style={box({
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          opacity: appear(f, 4, 12),
        })}
      >
        <RouteStreet road={road} offset={(going ? draw : -back) * 600} />
        <WhiteCar
          x={carX}
          y={road + 92}
          s={0.82}
          dir={going ? 1 : -1}
          wheel={(going ? draw : -back) * 1400}
          kids={1}
        />
      </div>
      <div
        style={box({
          left: 0,
          top: 200,
          width: 1080,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          opacity: appear(f, title, 12),
          translate: `0 ${(1 - appear(f, title, 12)) * 20}px`,
        })}
      >
        <Brand size={84} />
        <div
          style={{ fontFamily, fontSize: 48, fontWeight: 800, color: C.ink2 }}
        >
          {TC_TEXT.service.sub}
        </div>
      </div>
      {rise < 1 ? (
        <div
          style={box({
            left: 540 - lineW / 2,
            top: lineY - 7,
            width: lineW,
            height: 14,
            borderRadius: 7,
            backgroundColor: C.yellow,
          })}
        />
      ) : null}
      <div
        style={box({
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          opacity: nodes,
        })}
      >
        <RouteStrip
          x={190}
          y={590}
          w={700}
          draw={rise >= 1 ? draw : 0}
          back={back}
          node={110}
        />
      </div>
    </>
  );
};

// ---------- 3. Небольшая группа и знакомый водитель ----------
const KID_X = [230, 540, 850];
const KID_LOOKS = ["kidGirl", "kid", "kidBoy"] as const;

export const GroupScene: React.FC = () => {
  const { f, D, slot } = useScene();
  const { inside, greet, flip } = sceneBeats(slot);
  return (
    <>
      {f < inside ? <GroupMap f={f} end={inside} /> : null}
      {f >= inside && f < greet ? <RearKids f={f - inside} D={D} /> : null}
      {f >= greet ? <Greeting f={f} D={D} start={greet} flip={flip} /> : null}
      <Caption
        f={f}
        at={4}
        lines={[TC_TEXT.group.first]}
        top={228}
        size={58}
        out={greet}
      />
      <Caption
        f={f}
        at={greet + 4}
        lines={[TC_TEXT.group.second]}
        top={228}
        size={58}
      />
    </>
  );
};

// Три адреса собираются в один маршрут к школе.
const GroupMap: React.FC<{ f: number; end: number }> = ({ f, end }) => {
  const pins = [
    { x: 250, y: 1090 },
    { x: 560, y: 900 },
    { x: 330, y: 650 },
  ];
  const school = { x: 830, y: 520 };
  const path = [
    pins[0],
    { x: 560, y: 1090 },
    pins[1],
    { x: 560, y: 650 },
    pins[2],
    { x: 830, y: 650 },
    school,
  ];
  const u = clamp((f - 22) / Math.max(10, end - 30));
  const seg = path
    .slice(1)
    .map((p, i) => Math.hypot(p.x - path[i].x, p.y - path[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = cruise(u) * total;
  let car = path[0];
  let reached = 0;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) {
      car = {
        x: path[i].x + ((path[i + 1].x - path[i].x) * d) / seg[i],
        y: path[i].y + ((path[i + 1].y - path[i].y) * d) / seg[i],
      };
      break;
    }
    d -= seg[i];
    reached = i + 1;
    car = path[i + 1];
  }
  const done = (k: number) => [0, 2, 4][k] <= reached || (k === 0 && u > 0);
  const drawn = cruise(u);
  return (
    <>
      <Backdrop tint="#EEF4EA" />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        {[200, 420, 560, 760, 900].map((x) => (
          <rect
            key={`v${x}`}
            x={x - 14}
            y={420}
            width={28}
            height={860}
            fill="#FFFFFF"
          />
        ))}
        {[520, 650, 900, 1090, 1220].map((y) => (
          <rect
            key={`h${y}`}
            x={80}
            y={y - 14}
            width={920}
            height={28}
            fill="#FFFFFF"
          />
        ))}
        <polyline
          points={path.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={C.line}
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 30"
        />
        <polyline
          points={path.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={C.yellow}
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${drawn * total} ${total + 10}`}
        />
      </svg>
      <div
        style={box({
          left: school.x - 70,
          top: school.y - 70,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: C.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "8px solid #FFFFFF",
          boxShadow: "0 10px 24px rgba(20,40,90,0.2)",
        })}
      >
        <IconSchool size={84} color="#FFFFFF" />
      </div>
      {pins.map((p, k) => {
        const a = appear(f, 4 + k * 6, 10);
        return (
          <div
            key={k}
            style={box({
              left: p.x - 66,
              top: p.y - 66,
              width: 132,
              height: 132,
              opacity: a,
              scale: `${0.6 + 0.4 * easeOut(a)}`,
            })}
          >
            <KidAvatar size={132} {...KIDS[k]} />
            {done(k) ? (
              <div
                style={box({
                  right: -6,
                  bottom: -6,
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: C.green,
                  border: "5px solid #FFFFFF",
                  color: "#FFFFFF",
                  fontFamily,
                  fontSize: 30,
                  fontWeight: 900,
                  textAlign: "center",
                  lineHeight: "40px",
                })}
              >
                ✓
              </div>
            ) : null}
          </div>
        );
      })}
      <div
        style={box({
          left: car.x - 46,
          top: car.y - 46,
          width: 92,
          height: 92,
          borderRadius: 46,
          backgroundColor: "#FFFFFF",
          border: `7px solid ${C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: u > 0 ? 1 : 0,
        })}
      >
        <svg width={56} height={56} viewBox="0 0 48 48">
          <path
            d="M6 30 Q6 24 11 23 L15 15 Q17 12 21 12 L29 12 Q33 12 35 15 L39 23 Q43 24 43 30 L43 34 L6 34 Z"
            fill={C.ink}
          />
          <circle cx={14} cy={35} r={4.5} fill={C.ink} />
          <circle cx={35} cy={35} r={4.5} fill={C.ink} />
        </svg>
      </div>
    </>
  );
};

// Салон: трое детей на своих местах, ремни пристёгнуты.
const RearKids: React.FC<{ f: number; D: number }> = ({ f, D }) => {
  const seatY = 1250;
  const kidPlace = (i: number): Place => ({ x: KID_X[i], y: 1520, h: 640 });
  const lap = (i: number, side: -1 | 1) => ({
    x: KID_X[i] + side * 70,
    y: seatY - 20,
  });
  const faces = [
    (t: number) =>
      keys(t, [
        [0, 0.1],
        [10, 0.55],
      ]),
    (t: number) =>
      keys(t, [
        [0, 0],
        [14, -0.45],
        [40, -0.45],
        [52, 0.35],
      ]),
    (t: number) =>
      keys(t, [
        [0, 0.2],
        [16, 0.85],
      ]),
  ];
  const poses = [
    (t: number): PoseIn => ({
      sit: 1,
      seat: 270,
      expr: t > 8 ? "smile" : "calm",
      packOff: true,
      armL: { target: lap(0, -1), shape: "relax", elbow: "down" },
      armR: {
        target: { x: KID_X[0] + 60, y: seatY - 70 - 8 * Math.sin(t / 7) },
        shape: "fist",
        elbow: "down",
        item: "backpack",
        itemColor: "#7A6BC4",
      },
    }),
    (t: number): PoseIn => ({
      sit: 1,
      seat: 270,
      expr: t > 12 ? "smile" : "softSmile",
      packOff: true,
      armL: { target: lap(1, -1), shape: "relax", elbow: "down" },
      armR: { target: lap(1, 1), shape: "relax", elbow: "down" },
    }),
    (t: number): PoseIn => ({
      sit: 1,
      seat: 270,
      expr: "calm",
      packOff: true,
      lookY: -0.1,
      armL: {
        target: {
          x: KID_X[2] - 40,
          y: keys(t, [
            [0, 1080],
            [14, 1080],
            [24, seatY - 30],
          ]),
        },
        shape: t < 18 ? "pinch" : "relax",
        elbow: "down",
      },
      armR: { target: lap(2, 1), shape: "relax", elbow: "down" },
    }),
  ];
  const pass = f * 1.3;
  return (
    <div
      style={box({
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        translate: `0 ${Math.sin(f * 0.35) * 2}px`,
      })}
    >
      <RearRow pass={pass} />
      {[0, 1, 2].map((i) => (
        <Actor
          key={i}
          uid={`rear-${i}`}
          look={KID_LOOKS[i]}
          f={f}
          span={D}
          place={() => kidPlace(i)}
          face={faces[i]}
          pose={poses[i]}
          seed={11 + i}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <Belt
          key={i}
          sx={KID_X[i] + 44}
          sy={1086}
          hx={KID_X[i] - 46}
          hy={seatY - 12}
          t={i === 2 ? easeInOut(f / 12) : 1}
        />
      ))}
      <RearCushion />
    </div>
  );
};

// Водитель у машины приветствует ребёнка; через два дня — то же приветствие.
const Greeting: React.FC<{
  f: number;
  D: number;
  start: number;
  flip: number;
}> = ({ f, D, start, flip }) => {
  const ground = 1270;
  const door = 250;
  const day2 = f >= flip;
  const t0 = day2 ? flip : start;
  const DRIVER: Place = { x: 600, y: ground + 70, h: 600 };
  const kidPlace = (t: number): Place => {
    const u = cruise(clamp((t - t0 - 2) / 30));
    return {
      x: lerp(door + 20, 420, u),
      y: lerp(ground + 6, ground + 64, u),
      h: 410,
    };
  };
  const wave = (t: number, at: number) =>
    clamp((t - t0 - at) / 6) * clamp((t0 + at + 30 - t) / 6);
  const driverPose = (t: number): PoseIn => {
    const w = wave(t, 8);
    return {
      expr: "softSmile",
      nod: 4 * w,
      armR: {
        target: {
          x: DRIVER.x - 0.14 * DRIVER.h,
          y: lerp(DRIVER.y - 0.45 * DRIVER.h, DRIVER.y - 0.9 * DRIVER.h, w),
        },
        shape: w > 0.3 ? "wave" : "relax",
        wrist: Math.sin(t / 4) * 12 * w,
        behind: false,
      },
      armL: {
        target: {
          x: DRIVER.x + 0.16 * DRIVER.h,
          y: DRIVER.y - 0.46 * DRIVER.h,
        },
        shape: "relax",
        elbow: "down",
      },
    };
  };
  const kidPose = (t: number): PoseIn => {
    const p = kidPlace(t);
    const w = wave(t, 18);
    return {
      expr: "smile",
      armR: {
        target: {
          x: p.x + 0.16 * p.h,
          y: lerp(p.y - 0.42 * p.h, p.y - 0.95 * p.h, w),
        },
        shape: w > 0.3 ? "wave" : "relax",
        wrist: Math.sin(t / 4) * 14 * w,
        behind: false,
      },
      armL: {
        target: { x: p.x - 0.13 * p.h, y: p.y - 0.42 * p.h },
        shape: "relax",
      },
    };
  };
  const whip = day2 ? 1 - appear(f, flip, 8) : 0;
  const dayA = appear(f, start + 2, 10);
  return (
    <>
      <HomeEntrance ground={ground} door={door} open={1} />
      <WhiteCar
        x={830}
        y={ground + 150}
        s={1.15}
        dir={-1}
        door={0.9}
        driver={false}
        kids={0}
      />
      <Actor
        uid={`kid-greet-${day2 ? 2 : 1}`}
        look="kid"
        f={f}
        span={D}
        place={kidPlace}
        face={(t) => (t - t0 < 30 ? 0.6 : 0.5)}
        pose={kidPose}
        walkFrom={t0}
        seed={4}
      />
      <Actor
        uid={`driver-greet-${day2 ? 2 : 1}`}
        look="driver"
        f={f}
        span={D}
        place={() => DRIVER}
        face={() => -0.55}
        pose={driverPose}
        seed={21}
      />
      {/* день недели: тот же водитель и тот же ребёнок через день */}
      <div
        style={box({
          left: 60,
          top: 370,
          opacity: dayA,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 26px",
          borderRadius: 24,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 8px 22px rgba(20,40,90,0.16)",
          fontFamily,
        })}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 12,
            backgroundColor: C.ink,
            color: "#FFFFFF",
            fontSize: 26,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {day2 ? 3 : 2}
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 900,
            color: C.ink,
            translate: `0 ${day2 ? (1 - appear(f, flip, 8)) * 20 : 0}px`,
          }}
        >
          {TC_TEXT.group.days[day2 ? 1 : 0]}
        </div>
      </div>
      {whip > 0 ? (
        <div
          style={box({
            inset: 0,
            backgroundColor: `rgba(255,255,255,${whip * 0.85})`,
          })}
        />
      ) : null}
    </>
  );
};

// ---------- 4. Родитель получает информацию о поездке ----------
export const WhatsappScene: React.FC = () => {
  const { f, D, slot } = useScene();
  const { phone: phoneAt, m1, m2, loc, map: mapAt, back } = sceneBeats(slot);
  const reading = (t: number) => t >= back;
  const momPose = (t: number): PoseIn => {
    const r = t - back;
    const hold = { x: OFFICE.mom + 70, y: 700 };
    const down = { x: OFFICE.phone.x, y: OFFICE.phone.y - 6 };
    const has = t < phoneAt || (reading(t) && r < 26);
    return {
      sit: 1,
      seat: 205,
      expr: reading(t) ? "softSmile" : "calm",
      lookY:
        t < phoneAt
          ? keys(t, [
              [0, 0],
              [8, 0.6],
            ])
          : keys(r, [
              [0, 0.55],
              [18, 0.55],
              [28, 0],
            ]),
      nod:
        t < phoneAt
          ? 5
          : keys(r, [
              [0, 6],
              [18, 6],
              [28, 0],
            ]),
      armL: { target: onTable(OFFICE.mom - 90), shape: "relax", elbow: "down" },
      armR: {
        target:
          t < phoneAt || r < 14
            ? hold
            : {
                x: lerp(hold.x, down.x, easeInOut((r - 14) / 12)),
                y: lerp(hold.y, down.y, easeInOut((r - 14) / 12)),
              },
        shape: has ? "phone" : "relax",
        item: has ? "phone" : "none",
        glow: 1,
        itemTilt: 12,
        elbow: "down",
        behind: false,
      },
    };
  };
  const momFace = (t: number) =>
    t < back + 22
      ? 0.2
      : keys(t - back, [
          [22, 0.2],
          [34, 0.5],
        ]);
  return (
    <>
      {f < phoneAt || f >= back ? (
        <Panel top={0} height={1920} cam={{ x: 520, y: 700, zoom: 1.45 }}>
          <Meeting
            f={f}
            D={D}
            mom={momPose}
            momFace={momFace}
            phoneGlow={1}
            phoneOnTable={f >= back + 26}
            scroll={f / 6}
          />
        </Panel>
      ) : (
        <>
          <Backdrop tint="#E2EAF4" />
          <Phone x={270} y={318} w={540}>
            {f < mapAt ? (
              <WaChat f={f} m1={m1} m2={m2} loc={loc} tap={mapAt - 4} />
            ) : (
              <div style={box({ inset: 0, backgroundColor: C.waBg })}>
                <div
                  style={box({
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 150,
                    backgroundColor: C.wa,
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "0 26px 24px",
                    fontFamily,
                    fontSize: 36,
                    fontWeight: 900,
                  })}
                >
                  {TC_TEXT.whatsapp.location}
                </div>
                <div
                  style={box({
                    left: 0,
                    top: 150,
                    opacity: appear(f, mapAt, 8),
                  })}
                >
                  <MapView
                    f={f}
                    w={502}
                    h={880}
                    progress={interpolate(f, [mapAt, mapAt + 60], [0.55, 0.7], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })}
                  />
                </div>
              </div>
            )}
          </Phone>
        </>
      )}
      <Caption
        f={f}
        at={6}
        lines={[TC_TEXT.whatsapp.caption]}
        top={212}
        size={36}
      />
    </>
  );
};
