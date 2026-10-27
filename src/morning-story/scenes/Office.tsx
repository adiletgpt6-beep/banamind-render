import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { COLORS } from "../../config";
import { ARM, Character, mixArm, type Expr } from "../Character";
import { Desk, Office } from "../sets";
import { ClockFace, MapView, Phone, Sedan } from "../props";
import { Feed } from "../screens";
import { MS_TEXT } from "../script";
import { useLineCue, useMouth, useSceneLength, useWordCue } from "../StoryContext";
import { Cam, Caption, Feet, keys, project, ramp } from "../ui";
import { SCHOOL_END_MIN } from "./School";

const C = MS_TEXT.captions;
const OFFICE_CLOCK = { x: 790, y: 360, size: 190 };
// Камера офиса: крупнее, персонажи и стол заполняют кадр.
const OFFICE_CAM = { x: 520, y: 1060, scale: 1.2 } as const;
const OFFICE_MIN = 8 * 60 + 41;
// Телефон с лентой (сцены 10–11): центр и ширина на экране.
export const FEED_PHONE = { w: 600, cx: 540, cy: 1010 } as const;

// Кадр-«воспоминание» (полароид) с маленькой сценой утра.
const Memory: React.FC<{
  x: number;
  y: number;
  rot: number;
  show: number;
  children: React.ReactNode;
}> = ({ x, y, rot, show, children }) =>
  show <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 300,
        height: 300,
        padding: "16px 16px 46px",
        boxSizing: "border-box",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        boxShadow: "0 18px 40px rgba(20,40,90,0.25)",
        rotate: `${rot}deg`,
        scale: `${0.6 + 0.4 * show}`,
        opacity: show,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: 6, backgroundColor: "#EEF2F7" }}>
        {children}
      </div>
    </div>
  );

// ---------- Сцена 9: эми жумушка да кечигүү ----------
export const OfficeScene: React.FC = () => {
  const t = useCurrentFrame();
  const len = useSceneLength("s09Office");
  const b01 = useLineCue("s09Office", "b01");
  const m10 = useLineCue("s09Office", "m10");
  const n04 = useLineCue("s09Office", "n04");
  const w1 = useWordCue("s09Office", "n04", "шашылыш");
  const w2 = useWordCue("s09Office", "n04", "күтүүгө");
  const w3 = useWordCue("s09Office", "n04", "убакыт");
  const w4 = useWordCue("s09Office", "n04", "нерв");
  const mouthMom = useMouth("s09Office", "mother");
  const mouthBoss = useMouth("s09Office", "boss");
  // часы на весь кадр → часы на стене офиса; стрелки догоняют время
  const z = ramp(t, 0, 30);
  const clockSize = 2400 + (OFFICE_CLOCK.size * OFFICE_CAM.scale - 2400) * z;
  const clockC = project(
    { x: OFFICE_CLOCK.x + OFFICE_CLOCK.size / 2, y: OFFICE_CLOCK.y + OFFICE_CLOCK.size / 2 },
    OFFICE_CAM,
  );
  const clockMin = SCHOOL_END_MIN + (OFFICE_MIN - SCHOOL_END_MIN) * ramp(t, 0, 30) + t / 120;
  // мама входит, руководитель у стола; потом мама садится
  const walk = ramp(t, 18, 60);
  const momX = -150 + 420 * walk;
  const bossOut = ramp(t, m10.end + 10, m10.end + 50);
  const sit = ramp(t, m10.end + 24, m10.end + 40);
  const momY = 1700 + 210 * sit;
  const momExpr: Expr = t < b01.start ? "worried" : t < m10.end + 6 ? "embarrassed" : "tired";
  const memories = [w1, w2, w3, w4, w4 + 8].map((w, i) => ramp(t, w - 4, w + 8) - ramp(t, len - 16 + i, len - 6 + i));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Cam {...OFFICE_CAM}>
      <Office clockMinutes={clockMin} />
      <Feet x={830 + 520 * bossOut} y={1690} height={960}>
        <Character kind="boss" height={960} expr={t >= b01.start - 6 && t < b01.end + 6 ? "annoyed" : "neutral"} mouth={mouthBoss} look={-1} armR={ARM.hold} itemR="folder" legs={bossOut > 0 && bossOut < 1 ? "walk" : "stand"} walk={t} flip={bossOut > 0} seed={18} />
      </Feet>
      <Feet x={momX} y={momY} height={960}>
        <Character
          kind="mom"
          height={960}
          expr={momExpr}
          mouth={mouthMom}
          look={t < m10.end + 10 ? 1 : 0}
          headTilt={t >= m10.start - 4 && t < m10.end + 6 ? 8 : sit * 6}
          legs={walk > 0 && walk < 1 ? "walk" : "stand"}
          walk={t}
          armR={sit > 0.5 ? mixArm(ARM.down, ARM.chin, ramp(t, m10.end + 40, m10.end + 54)) : ARM.down}
          bag
          seed={19}
        />
      </Feet>
      <Desk x={90} y={1440} />
      </Cam>
      {/* настенные часы: в начале — на весь кадр, затем на своё место */}
      {z < 1 ? (
        <div style={{ position: "absolute", left: clockC.x - clockSize / 2 + (540 - clockC.x) * (1 - z), top: clockC.y - clockSize / 2 + (960 - clockC.y) * (1 - z) }}>
          <ClockFace size={clockSize} minutes={clockMin} />
        </div>
      ) : null}
      {/* воспоминания утра */}
      <Memory x={80} y={420} rot={-6} show={memories[0]}>
        <div style={{ position: "absolute", left: 30, top: -10 }}>
          <Character kind="dad" height={760} expr="apologetic" armL={ARM.behindHead} seed={20} />
        </div>
      </Memory>
      <Memory x={660} y={600} rot={5} show={memories[1]}>
        <MapView width={268} height={238} home={{ x: 90, y: 170 }} car={{ x: 190, y: 80, angle: 90 }} zoom={0.6} />
      </Memory>
      <Memory x={110} y={830} rot={4} show={memories[2]}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#6E7685" }} />
        {[0, 1].map((k) => (
          <div key={k} style={{ position: "absolute", left: -60 + k * 170, top: 60 + k * 70 }}>
            <Sedan kind={k === 0 ? "taxi" : "car"} width={200} />
          </div>
        ))}
      </Memory>
      <Memory x={620} y={1000} rot={-5} show={memories[3]}>
        <svg width={268} height={238} viewBox="0 0 268 238">
          <rect width={268} height={238} fill="#F3E3C9" />
          <path d="M 134 40 C 100 40, 96 74, 96 96 L 84 118 L 184 118 L 172 96 C 172 74, 168 40, 134 40 Z" fill={COLORS.yellow} stroke="#1E2A44" strokeWidth={6} />
          <circle cx={134} cy={132} r={12} fill="#1E2A44" />
        </svg>
      </Memory>
      <Memory x={360} y={1180} rot={2} show={memories[4]}>
        <div style={{ position: "absolute", left: 24, top: 4 }}>
          <ClockFace size={220} minutes={OFFICE_MIN + 4} />
        </div>
      </Memory>
      <Caption text={C.work} frame={t} at={24} out={Math.max(40, n04.start - 30)} />
    </AbsoluteFill>
  );
};

// ---------- Сцена 10: негизги ой ----------
export const IdeaScene: React.FC = () => {
  const t = useCurrentFrame();
  const len = useSceneLength("s10Idea");
  const n05 = useLineCue("s10Idea", "n05");
  const ideaAt = useWordCue("s10Idea", "n05", "уюштурууга");
  // перерыв: мама с чашкой берёт телефон → телефон на весь кадр
  const grow = ramp(t, 22, 44);
  const stopAt = n05.start - 26; // реклама BalaGo останавливается в центре
  const scroll = keys(t, [
    [44, 0],
    [stopAt - 20, 1500],
    [stopAt, 1640],
  ]);
  const brand = ramp(t, stopAt - 10, stopAt + 30);
  const tapAt = len - 22;
  const bg = interpolateColors(brand, [0, 1], ["rgba(20,30,55,0.5)", "rgba(255,244,194,0.92)"]);
  const pw = 120 + (FEED_PHONE.w - 120) * grow;
  const hand = project({ x: 300, y: 1360 }, OFFICE_CAM);
  const pcx = hand.x + (FEED_PHONE.cx - hand.x) * grow;
  const pcy = hand.y + (FEED_PHONE.cy - hand.y) * grow;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Cam {...OFFICE_CAM}>
      <Office clockMinutes={12 * 60 + 40} brand={brand} />
      <Feet x={330} y={1910} height={960}>
        <Character kind="mom" height={960} expr="tired" armR={ARM.hold} itemR="cup" armL={mixArm(ARM.down, ARM.phoneLook, ramp(t, 6, 20))} itemL={grow > 0 ? "none" : "phone"} seed={21} />
      </Feet>
      <Desk x={90} y={1440} />
      </Cam>
      {grow > 0 ? <AbsoluteFill style={{ backgroundColor: bg, opacity: grow }} /> : null}
      {grow > 0 ? (
        <Phone w={pw} style={{ left: pcx - pw / 2, top: pcy - (pw * 2.05) / 2 }}>
          <Feed scroll={scroll} adY={1760} pressed={t >= tapAt - 4 && t < tapAt + 6 ? 1 : 0} />
        </Phone>
      ) : null}
      {/* касание кнопки «Байланышуу» */}
      {t >= tapAt - 8 && t < tapAt + 14 ? (
        <div style={{ position: "absolute", left: 540 - 40, top: FEED_PHONE.cy + 100 - 40, width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.75)", boxShadow: "0 6px 16px rgba(0,0,0,0.25)", scale: `${1 - 0.2 * ramp(t, tapAt - 4, tapAt)}` }} />
      ) : null}
      <Caption text={C.question} frame={t} at={50} out={Math.max(60, ideaAt - 16)} size={56} />
      <Caption text={C.idea} frame={t} at={Math.max(70, ideaAt - 4)} out={len - 10} size={56} dark />
    </AbsoluteFill>
  );
};
