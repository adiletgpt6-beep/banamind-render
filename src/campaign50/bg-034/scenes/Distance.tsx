// Сцена 4 (≈30 – 43 с): «Пакеттин баасы ар бир бала үчүн, мектептен үйгө
// чейинки аралыкка жараша эсептелет. Так баа дарек текшерилгенден кийин
// тастыкталат.»
// Мама (слева внизу) с телефоном указывает в заявке школу и дом: на
// светлой карте Бишкека (горы Ала-Тоо на горизонте) падают метки МЕКТЕП и
// ҮЙ, между ними растягивается мерная лента без чисел — только расстояние,
// без сумм и тарифных зон (единственное число — предел 20 км с сайта). Справа стопка из 10 билетов и
// «1 бала үчүн», «Максималдуу аралык — 20 км». На второй реплике лупа
// проходит по адресам, на карте остаётся метка «Так баа — дарек
// текшерилгенден кийин». Никаких галочек и «заявка отправлена/принята».
import { useCurrentFrame } from "remotion";
import {
  Actor,
  type Place,
  type PoseIn,
} from "../../../two-schedules-2d/rig/Actor";
import {
  clamp,
  easeInOut,
  easeOut,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import { useScene, useWordAt } from "../context";
import { C } from "../palette";
import { BG34_TEXT } from "../script";
import {
  Headline,
  HomeIcon,
  Paper,
  Pill,
  SchoolIcon,
  TicketStack,
  popScale,
  rise,
} from "../ui";
import { STACK } from "./Ten";

const CARD = { x: 70, y: 392, w: 840, h: 470 } as const;
// метки (в координатах кадра)
const SCHOOL = { x: 712, y: 520 };
const HOME = { x: 236, y: 742 };
export const ST4 = { x: 770, y: 1196, w: 250 } as const;

const MOM_X = 248;
const MOM_Y = 2390;
const MOM_H = 1400;

const MapPin: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly t: number;
  readonly kind: "home" | "school";
}> = ({ x, y, t, kind }) => {
  if (t <= 0) return null;
  const drop = easeOut(t);
  const s = popScale(t * 12, 0, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 60,
        top: y - 150 - 60 * (1 - drop),
        width: 120,
        height: 150,
        transform: `scale(${s})`,
        transformOrigin: "50% 100%",
      }}
    >
      <svg
        width={120}
        height={150}
        viewBox="0 0 120 150"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <ellipse
          cx={60}
          cy={146}
          rx={22 * drop}
          ry={6}
          fill="rgba(20,40,90,0.22)"
        />
        <path
          d="M 60 146 C 36 110 10 86 10 58 A 50 50 0 1 1 110 58 C 110 86 84 110 60 146 Z"
          fill={kind === "home" ? C.yellow : "#FFFFFF"}
          stroke={C.navy}
          strokeWidth={6}
        />
      </svg>
      <div style={{ position: "absolute", left: 30, top: 22 }}>
        {kind === "home" ? <HomeIcon size={60} /> : <SchoolIcon size={60} />}
      </div>
    </div>
  );
};

export const DistanceScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const childAt = useWordAt("n06", 2); // «ар бир бала»
  const tapAt = useWordAt("n06", 5);
  const schoolAt = useWordAt("n06", 6); // «мектептен»
  const homeAt = useWordAt("n06", 7); // «үйгө»
  const tapeAt = useWordAt("n06", 8);
  const tapeEnd = useWordAt("n06", 10);
  const lensAt = useWordAt("n07", 2); // «дарек»
  const okAt = useWordAt("n07", 3);

  const exitT = easeInOut((f - (frames - 16)) / 16);
  const enter = easeOut(f / 18);

  // стопка из сцены 3 переезжает вправо вниз
  const sx = lerp(STACK.x, ST4.x, easeInOut(f / 20));
  const sy = lerp(STACK.y + 120, ST4.y, easeInOut(f / 20));
  const sw = lerp(STACK.w * 0.85, ST4.w, easeInOut(f / 20));

  const tape = easeInOut((f - tapeAt) / Math.max(18, tapeEnd - tapeAt));
  const len = Math.hypot(SCHOOL.x - HOME.x, SCHOOL.y - HOME.y);
  const ang =
    (Math.atan2(HOME.y - SCHOOL.y, HOME.x - SCHOOL.x) * 180) / Math.PI;

  // лупа проходит от школы к дому
  const lensT = easeInOut((f - lensAt) / 26);
  const lensOn = f >= lensAt - 4 && f <= okAt + 40;
  const lx = lerp(SCHOOL.x, HOME.x, lensT);
  const ly = lerp(SCHOOL.y - 70, HOME.y - 70, lensT);

  const mom: Place = { x: lerp(MOM_X - 220, MOM_X, enter), y: MOM_Y, h: MOM_H };
  const tapping = (t: number) => {
    const d = Math.min(Math.abs(t - schoolAt + 4), Math.abs(t - homeAt + 4));
    return d < 6 ? 1 - d / 6 : 0;
  };
  const momPose = (t: number): PoseIn => {
    const tap = tapping(t);
    return {
      expr: t > okAt ? "smile" : "calm",
      lookY: tapping(t) > 0 || t < tapAt ? 0.55 : t < okAt + 20 ? -0.45 : 0.1,
      lookX: t < tapAt ? 0.1 : 0.5,
      nod: 6 * tap,
      armR: {
        target: {
          x: mom.x + 0.1 * MOM_H,
          y: MOM_Y - (0.76 - 0.015 * tap) * MOM_H,
        },
        shape: "phone",
        item: "phone",
        glow: 1,
        itemTilt: -8,
        elbow: "down",
        behind: false,
      },
    };
  };
  const phone = { x: mom.x + 0.1 * MOM_H, y: MOM_Y - 0.73 * MOM_H };
  const ripple = (at: number) => {
    const u = clamp((f - at + 4) / 16);
    return u > 0 && u < 1 ? u : 0;
  };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Paper tint="sky" />
      {/* в конце сцены всё, кроме стопки, мягко гаснет (стопка переезжает в сцену 5) */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - exitT }}>
        <Headline
          top={282}
          size={62}
          style={{ ...rise(f, 4), whiteSpace: "nowrap" }}
        >
          {BG34_TEXT.distance.title}
        </Headline>

        {/* карта Бишкека: горы, улицы, парк — без масштаба и чисел */}
        <div
          style={{
            position: "absolute",
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD.h,
            borderRadius: 36,
            overflow: "hidden",
            backgroundColor: "#F4F1E8",
            border: `4px solid ${C.skyDeep}`,
            boxShadow: "0 18px 40px rgba(20,40,90,0.14)",
            ...rise(f, 6, 14, 40),
          }}
        >
          <svg
            width={CARD.w}
            height={CARD.h}
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            <path
              d={`M 0 70 L 90 26 L 170 58 L 260 14 L 360 52 L 450 20 L 560 60 L 650 22 L 760 54 L ${CARD.w} 30 L ${CARD.w} 92 L 0 92 Z`}
              fill="#DCE7F3"
            />
            <path
              d={`M 230 26 L 260 14 L 290 27 Z M 620 30 L 650 22 L 680 31 Z`}
              fill="#FFFFFF"
            />
            <rect x={0} y={92} width={CARD.w} height={CARD.h} fill="#F4F1E8" />
            <ellipse cx={420} cy={300} rx={110} ry={60} fill="#CFE5BC" />
            <ellipse cx={120} cy={170} rx={70} ry={40} fill="#CFE5BC" />
            {[150, 250, 350].map((y) => (
              <path
                key={y}
                d={`M 0 ${y} L ${CARD.w} ${y + 30}`}
                stroke="#FFFFFF"
                strokeWidth={18}
              />
            ))}
            {[180, 400, 600].map((x) => (
              <path
                key={x}
                d={`M ${x} 92 L ${x - 40} ${CARD.h}`}
                stroke="#FFFFFF"
                strokeWidth={18}
              />
            ))}
            <path
              d={`M 0 ${CARD.h - 40} Q 300 ${CARD.h - 90} ${CARD.w} ${CARD.h - 30}`}
              stroke="#BFD8EE"
              strokeWidth={14}
              fill="none"
            />
          </svg>
          <div style={{ position: "absolute", left: 24, top: 108 }}>
            <Pill tone="white" size={28}>
              Бишкек
            </Pill>
          </div>
        </div>

        {/* мерная лента между школой и домом (без чисел) */}
        {tape > 0 ? (
          <div
            style={{
              position: "absolute",
              left: SCHOOL.x,
              top: SCHOOL.y - 13,
              width: len * tape,
              height: 26,
              transformOrigin: "0 13px",
              transform: `rotate(${ang}deg)`,
              borderRadius: 13,
              backgroundColor: C.yellow,
              border: `3px solid ${C.navy}`,
              boxSizing: "border-box",
              backgroundImage: `repeating-linear-gradient(90deg, ${C.navy} 0 3px, transparent 3px 26px)`,
              backgroundSize: "26px 10px",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "0 0",
              boxShadow: "0 6px 12px rgba(20,40,90,0.2)",
            }}
          />
        ) : null}

        <MapPin
          x={SCHOOL.x}
          y={SCHOOL.y}
          t={clamp((f - schoolAt + 3) / 10)}
          kind="school"
        />
        <MapPin
          x={HOME.x}
          y={HOME.y}
          t={clamp((f - homeAt + 3) / 10)}
          kind="home"
        />

        {/* подпись расстояния */}
        <div
          style={{
            position: "absolute",
            left: 60,
            width: 870,
            top: 884,
            display: "flex",
            justifyContent: "center",
            ...rise(f, tapeAt + 6),
          }}
        >
          <Pill tone="yellow" size={36}>
            {BG34_TEXT.distance.measure}
          </Pill>
        </div>

        {/* лупа: проверка адреса */}
        {lensOn ? (
          <svg
            width={150}
            height={150}
            viewBox="0 0 150 150"
            style={{
              position: "absolute",
              left: lx - 50,
              top: ly - 50,
              opacity:
                clamp((f - lensAt + 4) / 6) * (1 - clamp((f - okAt - 30) / 10)),
            }}
          >
            <circle
              cx={60}
              cy={60}
              r={42}
              fill="rgba(255,255,255,0.45)"
              stroke={C.navy}
              strokeWidth={10}
            />
            <path
              d="M 92 92 L 132 132"
              stroke={C.navy}
              strokeWidth={16}
              strokeLinecap="round"
            />
          </svg>
        ) : null}

        {/* предел обслуживания (факт сайта) — под подписью расстояния */}
        <div
          style={{
            position: "absolute",
            left: 60,
            width: 870,
            top: 958,
            display: "flex",
            justifyContent: "center",
            ...rise(f, tapeEnd),
          }}
        >
          <Pill tone="white" size={34}>
            {BG34_TEXT.distance.maxDistance}
          </Pill>
        </div>

        {/* после проверки адресов лупой — метка «так баа …» на карте
            (без галочек «подтверждено»: заявку подтверждает человек) */}
        <div
          style={{
            position: "absolute",
            left: CARD.x,
            width: CARD.w,
            top: CARD.y + CARD.h - 78,
            display: "flex",
            justifyContent: "center",
            ...rise(f, okAt, 12, 18),
          }}
        >
          <Pill tone="navy" size={32}>
            <svg width={30} height={30} viewBox="0 0 150 150">
              <circle
                cx={60}
                cy={60}
                r={42}
                fill="none"
                stroke={C.yellow}
                strokeWidth={14}
              />
              <path
                d="M 92 92 L 132 132"
                stroke={C.yellow}
                strokeWidth={18}
                strokeLinecap="round"
              />
            </svg>
            {BG34_TEXT.distance.confirmShort}
          </Pill>
        </div>

        {/* «1 бала үчүн» над стопкой */}
        <div
          style={{
            position: "absolute",
            left: 560,
            width: 370,
            top: 1058,
            display: "flex",
            justifyContent: "center",
            transform: `scale(${popScale(f, childAt - 2, 12)})`,
          }}
        >
          <Pill tone="navy" size={38}>
            <svg width={34} height={34} viewBox="0 0 34 34">
              <circle cx={17} cy={11} r={8} fill={C.yellow} />
              <path d="M 4 32 Q 6 19 17 19 Q 28 19 30 32 Z" fill={C.yellow} />
            </svg>
            {BG34_TEXT.distance.perChild}
          </Pill>
        </div>

        {/* мама с телефоном (заявка: адрес дома и школы) */}
        <Actor
          uid="d-mom"
          look="mom"
          f={f}
          place={() => mom}
          face={(t) => (t < tapAt ? 0.15 : 0.3)}
          pose={momPose}
          seed={1}
        />
        {[schoolAt, homeAt].map((at, i) =>
          ripple(at) > 0 ? (
            <div
              key={i}
              style={{
                position: "absolute",
                left: phone.x - 40 * (0.5 + ripple(at)),
                top: phone.y - 40 * (0.5 + ripple(at)) - 60,
                width: 80 * (0.5 + ripple(at)),
                height: 80 * (0.5 + ripple(at)),
                borderRadius: 999,
                border: `5px solid ${C.yellow}`,
                opacity: 1 - ripple(at),
              }}
            />
          ) : null,
        )}
      </div>
      {/* стопка пакета */}
      <TicketStack x={sx} y={sy} w={sw} band={1} />
    </div>
  );
};
