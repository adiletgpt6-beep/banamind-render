// Сцены 1–2: хук «тишина среди будильников» → «Баланын кыялы» (мама не
// спешит: закрывает ноутбук, наливает себе воды) → перемотка назад →
// реальное утро: будильник, часы, папка «Жумуш», записка «Мектеп 8:00»,
// родители сверяют время. Мама заботлива, не раздражена.
import { AbsoluteFill } from "remotion";
import { Actor, atBody, type Place } from "../Actor";
import { cueOf, FPS, useScene, sceneSpan } from "../context";
import { AlarmClock, Bottle, Folder, Glass, K, KitchenBack, Laptop, TableFront } from "../Kitchen";
import { clamp, easeInOut, easeOut, keys, keysV } from "../../../two-schedules-2d/rig/motion";
import { wordTime } from "../timeline";
import { Chip, CityTag, DreamHaze, DreamLabel, RewindFx } from "../ui";

const MOM: Place = { x: 380, y: 1650, h: 1050 };
const SON: Place = { x: 880, y: 1765, h: 900 };
const DAD: Place = { x: 118, y: 1640, h: 1090 };

const LAPTOP_DREAM = { x: 232, y: K.tableTop };
const GLASS = { x: 520, y: K.tableTop + 4 };
const BOTTLE_HOME = { x: 640, y: K.tableTop + 4 };

// ---------- Мечта: кухня в момент t (кадр сцены 1) ----------
// sonSpeaks — кадр начала реплики мальчика (для взглядов); abs — кадр ролика
// для губ (в перемотке губы не двигаются).
export const DreamKitchen: React.FC<{ readonly t: number; readonly abs: number; readonly askAt: number }> = ({ t, abs, askAt }) => {
  // ноутбук закрывается 40–68
  const lid = keys(t, [[0, 1], [40, 1], [68, 0]]);
  // бутылка: берёт 78–96, наливает 104–140, ставит 148–166
  const grip = keysV(t, [
    [0, { x: BOTTLE_HOME.x, y: BOTTLE_HOME.y - 64 }],
    [96, { x: BOTTLE_HOME.x, y: BOTTLE_HOME.y - 64 }],
    [112, { x: 626, y: 1046 }],
    [142, { x: 626, y: 1046 }],
    [160, { x: BOTTLE_HOME.x, y: BOTTLE_HOME.y - 64 }],
  ]);
  const rot = keys(t, [[0, 0], [104, 0], [118, -108], [138, -108], [152, 0]]);
  const fill = keys(t, [[0, 0], [116, 0], [140, 0.72]], easeOut);
  const level = keys(t, [[0, 0.82], [116, 0.82], [140, 0.5]]);
  const pouring = t > 116 && t < 140;
  // рука мамы к бутылке: тянется 78–96
  const handR = keysV(t, [
    [0, { x: 560, y: K.tableTop - 6 }],
    [78, { x: 560, y: K.tableTop - 6 }],
    [96, { x: BOTTLE_HOME.x - 4, y: BOTTLE_HOME.y - 64 }],
    [160, { x: BOTTLE_HOME.x - 4, y: BOTTLE_HOME.y - 64 }],
    [176, { x: 590, y: K.tableTop - 6 }],
  ]);
  const holding = t >= 96 && t <= 160;
  const handRAt = holding ? { x: grip.x - 4, y: grip.y } : handR;
  // левая рука закрывает крышку и остаётся на ноутбуке
  const lidTop = { x: LAPTOP_DREAM.x + 30, y: LAPTOP_DREAM.y - 22 - Math.max(8, 170 * lid) };
  const handL = keysV(t, [
    [0, { x: 300, y: K.tableTop - 6 }],
    [30, { x: 300, y: K.tableTop - 6 }],
    [40, { x: lidTop.x, y: LAPTOP_DREAM.y - 22 - 170 }],
  ]);
  const handLAt = t < 40 ? handL : t < 72 ? lidTop : keysV(t, [[72, lidTop], [86, { x: 300, y: K.tableTop - 6 }]]);

  return (
    <AbsoluteFill>
      <KitchenBack dream={1} clockMin={7 * 60 + 10} />
      <Actor
        uid="d-son"
        look="son"
        f={t}
        abs={abs}
        place={SON}
        role="son"
        seed={3}
        face={(x) => keys(x, [[0, -0.15], [askAt - 14, -0.15], [askAt, -0.65]])}
        pose={(x) => ({
          expr: x < 34 ? "calm" : x < askAt + 50 ? "surprised" : "thinking",
          lookY: keys(x, [[0, 0], [askAt, 0.15]]),
          headTilt: keys(x, [[0, 0], [askAt, 5], [askAt + 30, 7]]),
          armL: { target: keysV(x, [[0, atBody(SON, -150, -460)], [askAt - 6, atBody(SON, -150, -460)], [askAt + 8, atBody(SON, -210, -600)], [askAt + 52, atBody(SON, -210, -600)], [askAt + 70, atBody(SON, -150, -460)]]), shape: "open", elbow: "down" },
          armR: { target: atBody(SON, 70, -560), shape: "fist", elbow: "hang" },
          strapTug: 0.6,
        })}
      />
      <Actor
        uid="d-mom"
        look="mom"
        f={t}
        abs={abs}
        place={MOM}
        seed={5}
        face={(x) => keys(x, [[0, -0.15], [76, -0.15], [92, 0.35], [askAt + 6, 0.35], [askAt + 22, 0.55]])}
        pose={(x) => ({
          expr: x < askAt + 20 ? "calm" : "softSmile",
          lookY: keys(x, [[0, 0.55], [askAt + 6, 0.55], [askAt + 22, 0]]),
          headTilt: keys(x, [[0, 0], [askAt + 22, -4]]),
          lean: 4,
          armL: { target: handLAt, shape: t >= 40 && t < 72 ? "open" : "relax", elbow: "down" },
          armR: { target: handRAt, shape: holding ? "fist" : "relax", elbow: "down" },
          exhale: keys(x, [[0, 0], [60, 0], [80, 0.6], [110, 0.2]]),
        })}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Laptop x={LAPTOP_DREAM.x} y={LAPTOP_DREAM.y} open={lid} glow={0.4} />
        <Glass x={GLASS.x} y={GLASS.y} fill={fill} />
        {pouring ? (
          <path d={`M${grip.x - 107} ${grip.y + 40} Q ${GLASS.x - 4} ${GLASS.y - 120} ${GLASS.x} ${GLASS.y - 20}`} stroke="rgba(120,190,245,0.85)" strokeWidth={7} fill="none" strokeLinecap="round" />
        ) : null}
        <Bottle x={grip.x} y={grip.y + 64} rot={rot} level={level} />
      </svg>
      <TableFront />
    </AbsoluteFill>
  );
};

// ---------- Сцена 1 ----------
export const DreamScene: React.FC = () => {
  const { f, abs, tl } = useScene("dream");
  const c01 = cueOf(tl, "c01");
  const askAt = Math.round((c01.from - sceneSpan(tl, "dream").from) * FPS);
  // хук: три будильника звенят 0–20, на 20 замолкают («секунда тишины»)
  const ring = f < 20 ? 1 : 0;
  const clocksOut = easeInOut((f - 26) / 14);
  const iris = easeInOut((f - 24) / 20);
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFF5E6" }}>
      <AbsoluteFill style={{ clipPath: `circle(${iris * 1250}px at 540px 820px)` }}>
        <DreamKitchen t={f} abs={abs} askAt={askAt} />
        <DreamHaze f={f} amount={iris} />
      </AbsoluteFill>
      {clocksOut < 1 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - clocksOut }}>
          {[
            { x: 290, y: 720, c: "#E5677A", l: "07:30" },
            { x: 800, y: 640, c: "#3E6FB0", l: "07:35" },
            { x: 540, y: 1080, c: "#F2A541", l: "07:40" },
          ].map((c, i) => {
            const s = 1.5 * (1 - clocksOut * 0.7) * (f < 20 ? 1 + 0.03 * Math.sin(f * 3 + i) : 1);
            return <AlarmClock key={i} x={c.x} y={c.y - clocksOut * 120} s={s} ring={ring} f={f + i * 5} color={c.c} label={c.l} />;
          })}
        </svg>
      ) : null}
      {/* «тишина» — короткая пауза-вспышка без резкости */}
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: f >= 20 && f < 32 ? 0.35 * (1 - (f - 20) / 12) : 0 }} />
      <DreamLabel opacity={clamp((f - 30) / 10)} />
    </AbsoluteFill>
  );
};

// ---------- Сцена 2 ----------
export const ReverseScene: React.FC = () => {
  const { f, abs, tl, at } = useScene("reverse");
  const dreamSpan = sceneSpan(tl, "dream");
  const dreamLen = Math.round((dreamSpan.to - dreamSpan.from) * FPS);
  const c01 = cueOf(tl, "c01");
  const askAt = Math.round((c01.from - dreamSpan.from) * FPS);
  const n02 = cueOf(tl, "n02");
  const REAL = 40; // кадр смены на реальность
  // перемотка: 4× назад по кадрам сцены 1
  const rewindT = Math.max(0, dreamLen - 1 - f * 4.2);
  const rw = f < REAL ? 1 : 0;
  const flash = f >= REAL - 6 && f < REAL + 10 ? 0.55 * (1 - Math.abs(f - REAL) / 10) : 0;

  const schoolAt = at(wordTime(n02, 1));
  const workAt = at(wordTime(n02, 3));
  const clashAt = at(wordTime(n02, 6));
  const r = f - REAL; // кадр реальности
  const minutes = 7 * 60 + 48 + clamp(r / 300) * 4;
  // будильник на столе звенит, мама выключает его на r≈34
  const alarmRing = r >= 0 && r < 36 ? 1 : 0;
  const ALARM = { x: 236, y: K.tableTop - 60 };

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFF5E6" }}>
      {f < REAL ? (
        <AbsoluteFill style={{ filter: `saturate(${1 - f / REAL * 0.6}) contrast(1.05)`, transform: `translateX(${Math.sin(f * 1.7) * 6}px)` }}>
          <DreamKitchen t={rewindT} abs={-10000} askAt={askAt} />
          <DreamHaze f={dreamLen - f} amount={1 - f / REAL} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <KitchenBack dream={0} clockMin={minutes} fridgeNote={1} />
          <Actor
            uid="r-dad"
            look="dad"
            f={r}
            abs={abs}
            place={DAD}
            seed={9}
            face={(x) => keys(x, [[0, 0.3], [30, 0.3], [44, 0.55], [120, 0.55], [134, 0.75]])}
            pose={(x) => ({
              expr: x < 120 ? "thinking" : "apologetic",
              lookY: keys(x, [[0, 0.7], [30, 0.7], [44, -0.35], [120, -0.35], [134, 0]]),
              armL: { target: atBody(DAD, -90, -440), shape: "fist", item: "keys", elbow: "hang" },
              armR: { target: keysV(x, [[0, atBody(DAD, 40, -470)], [12, atBody(DAD, -10, -600)], [110, atBody(DAD, -10, -600)], [126, atBody(DAD, 70, -470)]]), shape: "relax", elbow: "down", wrist: -20 },
            })}
          />
          <Actor
            uid="r-mom"
            look="mom"
            f={r}
            abs={abs}
            place={MOM}
            seed={5}
            face={(x) => keys(x, [[0, -0.4], [40, -0.4], [56, 0], [120, 0], [136, 0.6]])}
            pose={(x) => ({
              expr: x < 120 ? "thinking" : "softSmile",
              lookY: keys(x, [[0, 0.5], [40, 0.5], [56, 0.75], [120, 0.75], [136, 0]]),
              lean: 3,
              armL: { target: keysV(x, [[0, { x: 300, y: K.tableTop - 4 }], [14, { x: ALARM.x + 6, y: ALARM.y - 66 }], [40, { x: ALARM.x + 6, y: ALARM.y - 66 }], [52, { x: 300, y: K.tableTop - 4 }]]), shape: x > 10 && x < 42 ? "point" : "relax", elbow: "down" },
              armR: { target: keysV(x, [[0, { x: 470, y: K.tableTop - 6 }], [48, { x: 470, y: K.tableTop - 6 }], [60, atBody(MOM, 30, -600)], [118, atBody(MOM, 30, -600)], [132, { x: 480, y: K.tableTop - 6 }]]), shape: "relax", elbow: "down", wrist: -25 },
            })}
          />
          <Actor
            uid="r-son"
            look="son"
            f={r}
            abs={abs}
            place={SON}
            seed={3}
            face={(x) => keys(x, [[0, -0.55], [60, -0.55], [76, -0.35], [130, -0.35], [146, -0.7]])}
            pose={(x) => ({
              expr: x < 140 ? "worried" : "neutral",
              lookY: keys(x, [[0, -0.2], [60, -0.2], [76, -0.6], [130, -0.6], [146, 0]]),
              strapTug: 1,
              armL: { target: atBody(SON, -70, -600), shape: "fist", elbow: "hang" },
              armR: { target: atBody(SON, 70, -600), shape: "fist", elbow: "hang" },
            })}
          />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <Laptop x={560} y={K.tableTop} open={1} glow={0.8} />
            <Folder x={590} y={K.tableTop + 2} />
            <AlarmClock x={ALARM.x} y={ALARM.y} s={0.5} ring={alarmRing} f={f} />
            <Glass x={700} y={K.tableTop + 4} fill={0} />
          </svg>
          <TableFront />
          <CityTag x={112} y={560} opacity={clamp((r - 10) / 14)} text="Бишкек, таңкы 7:50" />
          <Chip x={915} y={470} t={(f - schoolAt) / 10} text="Мектеп" sub="8:00" color="#E5677A" />
          <Chip x={560} y={790} t={(f - workAt) / 10} text="Жумуш" sub="8:00" color="#3E6FB0" />
          {f >= clashAt ? (
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: clamp((f - clashAt) / 10) }}>
              <path d="M640 760 Q 760 620 840 520" stroke="#FFB020" strokeWidth={8} strokeDasharray="18 14" fill="none" strokeLinecap="round" />
              <g transform={`translate(742 632) scale(${0.9 + 0.1 * Math.sin((f - clashAt) / 4)})`}>
                <circle r={34} fill="#FFB020" />
                <text y={16} textAnchor="middle" fontSize={46} fontWeight={900} fill="#FFFFFF" fontFamily="Nunito">
                  !
                </text>
              </g>
            </svg>
          ) : null}
        </AbsoluteFill>
      )}
      <RewindFx f={f} amount={rw} />
      <DreamLabel opacity={f < REAL ? 1 - clamp((f - REAL + 14) / 14) : 0} />
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: flash }} />
    </AbsoluteFill>
  );
};
