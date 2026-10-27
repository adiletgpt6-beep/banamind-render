// Сцены 5–8 ролика BalaGo «Сабак бүттү»: передача ребёнка взрослому, цена за полный
// маршрут, бесплатный пробный день, ссылка в профиле и WhatsApp.
import { interpolate } from "remotion";
import { fontFamily } from "../fonts";
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
import { Logo } from "../components/Logo";
import { Panel } from "./scenes-a";
import { TC_TEXT } from "./script";
import {
  DoorFrame,
  HomeEntrance,
  LaptopBack,
  MeetingTable,
  Office,
} from "./sets";
import { sceneBeats } from "./timing";
import {
  appear,
  Backdrop,
  C,
  Caption,
  CL,
  IconBell,
  IconHome,
  IconSchool,
  KIDS,
  KidAvatar,
  PhoneToast,
  RouteStrip,
  TrialDay,
  WhiteCar,
} from "./ui";

// ---------- 5. Возвращение домой и передача взрослому ----------
// Машина останавливается у подъезда, водитель провожает ребёнка до бабушки
// (заранее согласованный взрослый), бабушка и ребёнок заходят домой.
// Сцена не заканчивается ребёнком, одиноко уходящим от машины.
export const HandoffScene: React.FC = () => {
  const { f, D, slot } = useScene();
  const b = sceneBeats(slot);
  const ground = 1270;
  const door = 250;
  const carX = interpolate(f, [8, b.stop], [1320, 830], {
    ...CL,
    easing: easeOut,
  });
  const GRAN0: Place = { x: 250, y: ground + 24, h: 590 };
  const kidPlace = (t: number): Place => {
    if (t < b.out) return { x: 740, y: ground + 120, h: 430 };
    if (t < b.meet) {
      const u = cruise((t - b.out) / (b.meet - b.out));
      return {
        x: lerp(740, 392, u),
        y: lerp(ground + 120, ground + 70, u),
        h: 430,
      };
    }
    const u = cruise((t - b.enter) / 40);
    return {
      x: lerp(392, door + 40, u),
      y: lerp(ground + 70, ground - 10, u),
      h: lerp(430, 400, u),
    };
  };
  const granPlace = (t: number): Place => {
    const u = cruise((t - b.enter - 2) / 40);
    return {
      x: lerp(GRAN0.x, door - 10, u),
      y: lerp(GRAN0.y, ground - 14, u),
      h: lerp(GRAN0.h, 570, u),
    };
  };
  const driverPlace = (t: number): Place => {
    const u = cruise((t - b.out - 4) / (b.meet - b.out));
    return { x: lerp(690, 590, u), y: ground + 60, h: 610 };
  };
  const hand = (t: number) => {
    const g = granPlace(t);
    const k = kidPlace(t);
    return { x: (g.x + 0.16 * g.h + k.x - 0.14 * k.h) / 2, y: k.y - 0.5 * k.h };
  };
  const holding = (t: number) => t >= b.hand;
  const kidPose = (t: number): PoseIn => {
    const p = kidPlace(t);
    return {
      expr: "smile",
      armL: holding(t)
        ? { target: hand(t), shape: "fist", elbow: "down", behind: false }
        : {
            target: { x: p.x - 0.13 * p.h, y: p.y - 0.42 * p.h },
            shape: "relax",
          },
      armR: {
        target: { x: p.x + 0.14 * p.h, y: p.y - 0.46 * p.h },
        shape: "fist",
        elbow: "down",
      },
    };
  };
  const granPose = (t: number): PoseIn => {
    const g = granPlace(t);
    const reach = clamp((t - (b.meet - 14)) / 12);
    return {
      expr: t > b.meet - 20 ? "smile" : "softSmile",
      crouch: keys(t, [
        [b.meet - 16, 0],
        [b.meet, 0.22],
        [b.enter, 0.22],
        [b.enter + 12, 0],
      ]),
      lean: keys(t, [
        [b.meet - 16, 0],
        [b.meet, 6],
        [b.enter, 6],
        [b.enter + 12, 0],
      ]),
      armR: holding(t)
        ? { target: hand(t), shape: "fist", elbow: "down", behind: false }
        : {
            target: {
              x: g.x + lerp(0.12, 0.24, reach) * g.h,
              y: g.y - lerp(0.44, 0.5, reach) * g.h,
            },
            shape: reach > 0.5 ? "open" : "relax",
            elbow: "down",
            behind: false,
          },
      armL: {
        target: { x: g.x - 0.12 * g.h, y: g.y - 0.44 * g.h },
        shape: "relax",
      },
    };
  };
  const driverPose = (t: number): PoseIn => {
    const p = driverPlace(t);
    const w = clamp((t - b.toast) / 6) * clamp((b.toast + 34 - t) / 6);
    return {
      expr: "softSmile",
      nod: 5 * clamp((t - b.hand) / 8) * clamp((b.hand + 24 - t) / 8),
      armR: {
        target: {
          x: p.x - 0.14 * p.h,
          y: lerp(p.y - 0.44 * p.h, p.y - 0.88 * p.h, w),
        },
        shape: w > 0.3 ? "wave" : "relax",
        wrist: Math.sin(t / 4) * 10 * w,
        behind: false,
      },
      armL: {
        target: { x: p.x + 0.15 * p.h, y: p.y - 0.45 * p.h },
        shape: "relax",
        elbow: "down",
      },
    };
  };
  const inside = (t: number) => clamp((t - b.enter - 30) / 14);
  const intro = 1 - appear(f, 0, 12);
  return (
    <>
      <HomeEntrance ground={ground} door={door} open={1} />
      <Actor
        uid="gran"
        look="grandma"
        f={f}
        span={D}
        place={granPlace}
        face={(t) => (t < b.enter ? 0.45 : -0.2)}
        pose={granPose}
        walkFrom={b.enter}
        seed={31}
        opacity={1 - inside(f)}
      />
      <DoorFrame ground={ground} door={door} />
      {f >= b.out ? (
        <Actor
          uid="driver-home"
          look="driver"
          f={f}
          span={D}
          place={driverPlace}
          face={(t) => (t < b.toast + 30 ? -0.55 : 0.4)}
          pose={driverPose}
          walkFrom={b.out}
          seed={21}
          opacity={clamp((f - b.out + 2) / 6)}
        />
      ) : null}
      {f >= b.out ? (
        <Actor
          uid="kid-home"
          look="kid"
          f={f}
          span={D}
          place={kidPlace}
          face={(t) => (t < b.meet ? -0.7 : t < b.enter ? -0.3 : -0.5)}
          pose={kidPose}
          walkFrom={b.out}
          seed={4}
          opacity={clamp((f - b.out) / 6) * (1 - inside(f))}
        />
      ) : null}
      <WhiteCar
        x={carX}
        y={ground + 160}
        s={1.15}
        dir={-1}
        wheel={(1320 - carX) * -0.9}
        driver={f < b.out}
        kids={f < b.out ? 1 : 0}
        door={clamp((f - b.door) / 8)}
      />
      <Caption
        f={f}
        at={6}
        lines={TC_TEXT.handoff.caption}
        top={228}
        size={54}
      />
      <PhoneToast
        f={f}
        at={b.toast}
        x={300}
        y={440}
        text={TC_TEXT.handoff.msg}
        time={TC_TEXT.handoff.time}
      />
      {/* значок окончания занятий — переход к обратной поездке */}
      {intro > 0 ? (
        <div
          style={box({
            inset: 0,
            backgroundColor: `rgba(245,248,252,${intro})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: C.yellow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: intro,
              scale: `${1 + 0.3 * (1 - intro)}`,
            }}
          >
            <IconBell size={130} ring={clamp(f / 12)} />
          </div>
        </div>
      ) : null}
    </>
  );
};

// ---------- 6. Понятная цена за полный маршрут ----------
export const PriceScene: React.FC = () => {
  const { f, slot } = useScene();
  const b = sceneBeats(slot);
  const t = TC_TEXT.price;
  const draw = easeInOut(f / 16);
  const back = easeInOut((f - 10) / 16);
  const pa = appear(f, b.price, 12);
  const note = (k: number) =>
    k === 0 ? appear(f, 14, 12) : appear(f, b.notes + k * 8, 10);
  return (
    <>
      <Backdrop />
      <RouteStrip x={190} y={500} w={700} draw={draw} back={back} node={112} />
      <div
        style={box({
          left: 60,
          right: 60,
          top: 700,
          display: "flex",
          justifyContent: "center",
          opacity: pa,
          scale: `${0.94 + 0.06 * pa}`,
        })}
      >
        <div
          style={{
            padding: "34px 54px",
            borderRadius: 44,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 22px 50px rgba(20,40,90,0.16)",
            fontFamily,
            color: C.ink,
            textAlign: "center",
            border: `6px solid ${C.yellow}`,
          }}
        >
          <div
            style={{
              fontSize: 124,
              fontWeight: 1000,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {t.main}
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: C.ink2,
              marginTop: 10,
            }}
          >
            {t.per}
          </div>
        </div>
      </div>
      <div
        style={box({
          left: 60,
          right: 60,
          top: 1050,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          fontFamily,
        })}
      >
        <div
          style={{
            opacity: note(0),
            padding: "12px 30px",
            borderRadius: 30,
            backgroundColor: C.yellowSoft,
            fontSize: 48,
            fontWeight: 900,
            color: C.ink,
          }}
        >
          {t.route}
        </div>
        <div
          style={{
            opacity: note(1),
            fontSize: 46,
            fontWeight: 800,
            color: C.ink,
          }}
        >
          {t.note1}
        </div>
        <div
          style={{
            opacity: note(2),
            fontSize: 46,
            fontWeight: 800,
            color: C.ink,
          }}
        >
          {t.note2}
        </div>
      </div>
    </>
  );
};

// ---------- 7. Бесплатный пробный день с понятным условием ----------
export const TrialScene: React.FC = () => {
  const { f, slot } = useScene();
  const b = sceneBeats(slot);
  const t = TC_TEXT.trial;
  const lineW = 760;
  const draw = easeInOut(f / 14);
  const main = appear(f, b.main, 12);
  return (
    <>
      <Backdrop tint="#EAF5EE" />
      {/* согласованный маршрут: дом → школа, по одному появляются трое детей */}
      <div style={box({ left: 160, top: 430, width: lineW, height: 0 })}>
        <div
          style={box({
            left: 0,
            top: -7,
            width: lineW * draw,
            height: 14,
            borderRadius: 7,
            backgroundColor: C.yellow,
          })}
        />
        <div
          style={box({
            left: -62,
            top: -62,
            width: 124,
            height: 124,
            borderRadius: 62,
            backgroundColor: "#FFFFFF",
            border: `6px solid ${C.ink}`,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <IconHome size={72} />
        </div>
        <div
          style={box({
            left: lineW - 62,
            top: -62,
            width: 124,
            height: 124,
            borderRadius: 62,
            backgroundColor: C.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <IconSchool size={76} color="#FFFFFF" />
        </div>
        {KIDS.map((k, i) => {
          const a = appear(f, b.kids + i * 7, 10);
          return (
            <div
              key={i}
              style={box({
                left: 175 + i * 160,
                top: -66,
                width: 132,
                height: 132,
                opacity: a,
                scale: `${0.5 + 0.5 * easeOut(a)}`,
                translate: `0 ${(1 - a) * -30}px`,
              })}
            >
              <KidAvatar size={132} bg={k.bg} hair={k.hair} girl={k.girl} />
            </div>
          );
        })}
      </div>
      <TrialDay f={f} at={b.card} stamp={b.stamp} x={150} y={560} w={780} />
      <div
        style={box({
          left: 40,
          right: 40,
          top: 1020,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily,
          color: C.ink,
          opacity: main,
          translate: `0 ${(1 - main) * 20}px`,
        })}
      >
        <div style={{ fontSize: 58, fontWeight: 900 }}>{t.main}</div>
        <div
          style={{
            fontSize: 104,
            fontWeight: 1000,
            lineHeight: 1.05,
            padding: "0 18px",
            background: `linear-gradient(180deg, transparent 55%, ${C.yellow} 55%)`,
          }}
        >
          {t.free}
        </div>
        <div
          style={{
            marginTop: 24,
            padding: "12px 28px",
            borderRadius: 26,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 8px 22px rgba(20,40,90,0.12)",
            fontSize: 44,
            fontWeight: 900,
            color: C.ink,
          }}
        >
          {t.cond}
        </div>
      </div>
    </>
  );
};

// ---------- 8. Ссылка в профиле или WhatsApp ----------
// Финальная композиция: логотип BalaGo, кадры завершённого дня, ссылка в
// шапке профиля и WhatsApp 0998 08 38 28. Последние 4 с — без изменений.
export const CtaScene: React.FC = () => {
  const { f, D, slot } = useScene();
  const b = sceneBeats(slot);
  const t = TC_TEXT.cta;
  const a = (at: number) => appear(f, at, 12);
  const pulse = (at: number) =>
    interpolate(f, [at, at + 7, at + 16], [1, 1.05, 1], CL);
  const glow = (at: number) =>
    interpolate(f, [at, at + 8, at + 24], [0, 1, 0], CL);
  return (
    <>
      <Backdrop />
      <div
        style={box({
          left: 0,
          right: 0,
          top: 170,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          opacity: a(0),
          scale: `${0.92 + 0.08 * a(0)}`,
          fontFamily,
        })}
      >
        <Logo size={300} />
        <div style={{ fontSize: 40, fontWeight: 800, color: C.ink2 }}>
          {t.city}
        </div>
      </div>
      <DayDone f={f} D={D} x={60} y={575} w={470} h={290} kind="home" at={10} />
      <DayDone f={f} D={D} x={550} y={575} w={470} h={290} kind="mom" at={16} />
      <div
        style={box({
          left: 40,
          right: 40,
          top: 892,
          textAlign: "center",
          opacity: a(18),
          fontFamily,
          fontSize: 44,
          fontWeight: 900,
          color: C.ink,
          whiteSpace: "nowrap",
        })}
      >
        {t.line}
      </div>
      <div
        style={box({
          left: 0,
          right: 0,
          top: 966,
          display: "flex",
          justifyContent: "center",
          opacity: a(22),
        })}
      >
        <div
          style={{
            width: 860,
            height: 104,
            borderRadius: 52,
            backgroundColor: C.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            fontFamily,
            fontSize: 46,
            fontWeight: 1000,
            color: C.ink,
            scale: `${pulse(b.link)}`,
            boxShadow: `0 14px 30px rgba(20,40,90,0.18), 0 0 0 ${14 * glow(b.link)}px rgba(255,201,14,0.35)`,
          }}
        >
          <svg width={46} height={46} viewBox="0 0 48 48">
            <path
              d="M24 38 L24 12 M13 22 L24 11 L35 22"
              stroke={C.ink}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.button}
        </div>
      </div>
      <div
        style={box({
          left: 0,
          right: 0,
          top: 1080,
          textAlign: "center",
          opacity: a(26),
          fontFamily,
          fontSize: 38,
          fontWeight: 800,
          color: C.muted,
        })}
      >
        {t.or}
      </div>
      <div
        style={box({
          left: 0,
          right: 0,
          top: 1136,
          display: "flex",
          justifyContent: "center",
          opacity: a(28),
        })}
      >
        <div
          style={{
            width: 860,
            height: 124,
            borderRadius: 62,
            backgroundColor: "#1FA855",
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "0 34px",
            boxSizing: "border-box",
            fontFamily,
            color: "#FFFFFF",
            scale: `${pulse(b.wa)}`,
            boxShadow: `0 14px 30px rgba(20,40,90,0.18), 0 0 0 ${14 * glow(b.wa)}px rgba(31,168,85,0.3)`,
          }}
        >
          <svg
            width={78}
            height={78}
            viewBox="0 0 48 48"
            style={{ flex: "none" }}
          >
            <circle cx={24} cy={24} r={22} fill="#FFFFFF" />
            <path
              d="M24 9 A15 15 0 0 0 11 31 L9 39 L17 37 A15 15 0 1 0 24 9 Z"
              fill="#1FA855"
            />
            <path
              d="M18 17 Q16 19 17 22 Q20 29 27 32 Q30 33 32 31 L31 28 L27 27 L25 29 Q21 27 19 23 L21 21 L20 17 Z"
              fill="#FFFFFF"
            />
          </svg>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.05,
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, opacity: 0.9 }}>
              {t.whatsappLabel}
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 1000,
                letterSpacing: 1,
                whiteSpace: "nowrap",
              }}
            >
              {t.whatsappNumber}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Небольшой кадр завершённого дня: ребёнок дома с бабушкой / мама закончила встречу.
const DayDone: React.FC<{
  f: number;
  D: number;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "home" | "mom";
  at: number;
}> = ({ f, D, x, y, w, h, kind, at }) => {
  const a = appear(f, at, 12);
  const still = (px: number, py: number, ph: number) => () => ({
    x: px,
    y: py,
    h: ph,
  });
  return (
    <div
      style={box({
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 30,
        overflow: "hidden",
        boxShadow: "0 14px 34px rgba(20,40,90,0.16)",
        opacity: a,
        translate: `0 ${(1 - a) * 24}px`,
        border: "6px solid #FFFFFF",
        boxSizing: "border-box",
      })}
    >
      <div
        style={box({
          left: -(540 - w / 2) - 6,
          top: -6,
          width: 1080,
          height: h,
        })}
      >
        {kind === "home" ? (
          <Panel top={0} height={h} cam={{ x: 320, y: 1010, zoom: 0.44 }}>
            <HomeEntrance ground={1270} door={250} open={1} />
            <Actor
              uid="dd-gran"
              look="grandma"
              f={f}
              span={D}
              place={still(250, 1294, 590)}
              face={() => 0.3}
              pose={() => ({
                expr: "smile",
                armR: {
                  target: { x: 330, y: 1000 },
                  shape: "fist",
                  elbow: "down",
                  behind: false,
                },
              })}
              seed={31}
            />
            <Actor
              uid="dd-kid"
              look="kid"
              f={f}
              span={D}
              place={still(390, 1320, 420)}
              face={() => -0.4}
              pose={() => ({
                expr: "smile",
                armL: {
                  target: { x: 334, y: 1004 },
                  shape: "fist",
                  elbow: "down",
                  behind: false,
                },
              })}
              seed={4}
            />
          </Panel>
        ) : (
          <Panel top={0} height={h} cam={{ x: 480, y: 690, zoom: 0.6 }}>
            <Office doc={TC_TEXT.hook.doc} />
            <Actor
              uid="dd-mom"
              look="mom"
              f={f}
              span={D}
              place={still(470, 1040, 760)}
              face={() => 0.1}
              pose={() => ({
                sit: 1,
                seat: 205,
                expr: "smile",
                armL: {
                  target: { x: 380, y: 864 },
                  shape: "relax",
                  elbow: "down",
                },
                armR: {
                  target: { x: 560, y: 864 },
                  shape: "relax",
                  elbow: "down",
                },
              })}
              seed={1}
            />
            <MeetingTable top={860} />
            <LaptopBack x={470} y={866} />
          </Panel>
        )}
      </div>
    </div>
  );
};
