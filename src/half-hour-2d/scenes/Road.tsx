import { interpolate, useCurrentFrame } from "remotion";
import { CHILD_ARM, LOOKS } from "../Character";
import { useMouth } from "../context";
import { INK, Sedan, WindowHead } from "../props";
import { Actor, reach, walkOf, type Placement } from "../rig";
import { HH2_TEXT } from "../script";
import { Street, TrafficLight } from "../sets";
import { BenchBack, OfficeFacade, SchoolYard, Tree } from "../sets2";
import { camMove, Shot } from "../shots";
import { keys } from "../ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Скамейка у школы; сидящие опираются на её сиденье.
export const BENCH = { x: 210, y: 1488, w: 640 };
export const SON_SIT: Placement = { x: 610, y: 1716, h: 640 };
export const TEACHER_SIT: Placement = { x: 400, y: 1790, h: 930 };

// Машина мамы (обычная, не BalaGo): серо-голубой седан.
const MOM_CAR = "#7F95B5";

// Кабина: вид спереди через лобовое стекло. Руки на руле, телефон в
// держателе (не в руке), часы на панели.
const Cockpit: React.FC<{ f: number; light: "red" | "green"; clock: string }> = ({ f, light, clock }) => {
  const mom: Placement = { x: 540, y: 1700, h: 1240 };
  const wheel = { x: 540, y: 1400, r: 210 };
  const handL = reach(mom, "mom", -1, wheel.x - 180, wheel.y - 96, 1);
  const handR = reach(mom, "mom", 1, wheel.x + 180, wheel.y - 96, 1);
  const glow = light === "red" ? "rgba(240,100,75,0.07)" : "rgba(76,194,122,0.05)";
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#8C97AB" }} />
      <div style={{ position: "absolute", left: 200, top: 520, width: 680, height: 1000, borderRadius: "140px 140px 40px 40px", backgroundColor: "#5E6A80" }} />
      <div style={{ position: "absolute", left: 330, top: 420, width: 420, height: 170, borderRadius: 60, backgroundColor: "#6E7A90" }} />
      <Actor
        at={mom}
        kind="mom"
        legs="hidden"
        sit={1}
        expr="worried"
        look={keys(f, [[0, 0], [24, 0], [34, 0.6], [52, 0.6], [62, 0]])}
        lookY={keys(f, [[0, -0.2], [24, -0.2], [34, 0.9], [52, 0.9], [62, -0.2]])}
        armL={handL}
        armR={handR}
        watchL
        seed={1}
      />
      {/* ремень безопасности */}
      <div style={{ position: "absolute", left: 610, top: 1050, width: 30, height: 420, backgroundColor: "#2A3142", rotate: "34deg", transformOrigin: "top" }} />
      <svg width={600} height={600} viewBox="-300 -300 600 600" style={{ position: "absolute", left: wheel.x - 300, top: wheel.y - 300 }}>
        <circle r={wheel.r} fill="none" stroke="#2A2F3A" strokeWidth={46} />
        <path d={`M ${-wheel.r} 30 Q 0 90 ${wheel.r} 30`} stroke="#2A2F3A" strokeWidth={40} fill="none" />
        <circle r={70} fill="#2A2F3A" />
      </svg>
      {/* кисти лежат на ободе руля (поверх него) */}
      {[-1, 1].map((s) => (
        <div key={s} style={{ position: "absolute", left: wheel.x + s * 180 - 30, top: wheel.y - 96 - 30, width: 60, height: 60, borderRadius: 30, backgroundColor: LOOKS.mom.skin }} />
      ))}
      <div style={{ position: "absolute", left: -40, top: 1560, width: 1160, height: 420, borderRadius: "80px 80px 0 0", backgroundColor: "#2F3646" }} />
      {/* телефон в держателе: навигация, руки его не трогают */}
      <div style={{ position: "absolute", left: 830, top: 1420, width: 150, height: 250, borderRadius: 22, backgroundColor: INK, border: "6px solid #555E70" }}>
        <div style={{ position: "absolute", left: 10, top: 12, right: 10, bottom: 12, borderRadius: 12, backgroundColor: "#DDE7F2", overflow: "hidden" }}>
          <svg width={118} height={214} viewBox="0 0 118 214">
            <path d="M 20 200 L 20 120 L 80 80 L 80 20" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
            <circle cx={20} cy={190} r={10} fill={INK} />
            <circle cx={80} cy={22} r={10} fill="#FFC90E" />
          </svg>
        </div>
      </div>
      <div style={{ position: "absolute", left: 470, top: 1700, width: 140, height: 60, borderRadius: 14, backgroundColor: "#1B2030", color: "#9FE1B8", fontSize: 40, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito" }}>
        {clock}
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: glow }} />
      <div style={{ position: "absolute", left: -120, top: -200, width: 260, height: 2400, backgroundColor: "#262C3A", rotate: "8deg" }} />
      <div style={{ position: "absolute", right: -120, top: -200, width: 260, height: 2400, backgroundColor: "#262C3A", rotate: "-8deg" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 150, backgroundColor: "#262C3A" }} />
    </div>
  );
};

// Поток машин на соседних полосах.
const Traffic: React.FC<{ offset: number }> = ({ offset }) => (
  <>
    <div style={{ position: "absolute", left: 760 - offset * 0.3, top: 1330 }}>
      <Sedan kind="car" width={560} color="#C9B7D8" />
    </div>
    <div style={{ position: "absolute", left: -360 - offset * 0.3, top: 1330 }}>
      <Sedan kind="taxi" width={560} />
    </div>
  </>
);

// ---------- Сцена 4: дорога (44–63 с) ----------
export const RoadScene: React.FC = () => {
  const f = useCurrentFrame();
  const teacherMouth = useMouth("teacher");
  const door = keys(f, [[0, 0], [14, 1], [70, 1], [90, 0]]);
  // выходит из дверей к камере, затем быстрым шагом уходит вправо
  const exitPos = (t: number): Placement => ({
    x: keys(t, [[40, 540], [104, 1300]], (u) => u * u * 0.6 + u * 0.4),
    y: keys(t, [[8, 1560], [40, 1800]]),
    h: keys(t, [[8, 860], [40, 1080]]),
  });
  const exitWalk = walkOf(exitPos, 8, f);
  // в потоке: медленно, с остановками; после зелёного — ровно
  // пробка: трогаются и останавливаются плавно (скорость в ключах — ноль)
  const slow = keys(f, [[105, 0], [145, 120], [170, 150], [215, 260]]);
  // зелёный: плавный разгон
  const fast = 760 * Math.pow(interpolate(f, [455, 570], [0, 1], clamp), 1.6);
  const teacher = TEACHER_SIT;
  const son = SON_SIT;
  const yard = (
    <>
      <SchoolYard label={HH2_TEXT.school} afternoon={0.35} />
      <Tree x={980} y={1420} s={1.05} />
      <BenchBack x={BENCH.x} y={BENCH.y} w={BENCH.w} />
      <Actor
        at={teacher}
        kind="teacher"
        sit={1}
        expr="calm"
        mouth={teacherMouth}
        look={1}
        turn={0.45}
        headTilt={2}
        armL={[-40, 500]}
        armR={[-46, 505]}
        seed={5}
      />
      <Actor
        at={son}
        kind="son"
        sit={1}
        expr="sad"
        look={keys(f, [[215, 0], [262, 0], [274, -0.8], [322, -0.8], [334, 0]])}
        lookY={keys(f, [[215, 0.8], [262, 0.8], [274, 0], [322, 0], [334, 0.8]])}
        armL={CHILD_ARM.lap}
        armR={CHILD_ARM.lap}
        backpack
        seed={2}
      />
    </>
  );
  const momHead = <WindowHead x={300} y={92} r={34} skin={LOOKS.mom.skin} hair={LOOKS.mom.hair} shirt={LOOKS.mom.top} />;
  return (
    <>
      <Shot f={f} from={0} to={105} cam={camMove(f, 0, 105, { x: 560, y: 1200, scale: 1.0 }, { x: 600, y: 1200, scale: 1.05 })}>
        <OfficeFacade doorOpen={door} />
        <Actor at={exitPos(f)} kind="mom" {...exitWalk} expr="worried" look={0.7} bag seed={1} />
      </Shot>
      <Shot f={f} from={105} to={215} cam={camMove(f, 105, 215, { x: 540, y: 1460, scale: 1.3 }, { x: 540, y: 1460, scale: 1.36 })}>
        <Street width={1080} offset={slow} roadY={1280} />
        <Traffic offset={slow} />
        {/* пробка в её полосе: машины впереди и сзади едут так же медленно */}
        <div style={{ position: "absolute", left: 880, top: 1560 }}>
          <Sedan kind="car" width={720} color="#D9C3A5" wheel={slow * 1.2} />
        </div>
        <div style={{ position: "absolute", left: -520, top: 1560 }}>
          <Sedan kind="car" width={720} color="#A9B9A0" wheel={slow * 1.2} />
        </div>
        <div style={{ position: "absolute", left: 180, top: 1560 }}>
          <Sedan kind="car" width={720} color={MOM_CAR} wheel={slow * 1.2} driver={momHead} />
        </div>
      </Shot>
      <Shot f={f} from={215} to={345} cam={camMove(f, 215, 345, { x: 520, y: 1330, scale: 1.55 }, { x: 520, y: 1320, scale: 1.62 })}>
        {yard}
      </Shot>
      <Shot
        f={f}
        from={345}
        to={385}
        cam={{ x: 540, y: 960, scale: 1 }}
        overlay={
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#BFE0F7, #EAF5FD)" }}>
            <div style={{ position: "absolute", left: 0, top: 1200, width: 1080, height: 720, backgroundColor: "#6E7685" }} />
            <div style={{ position: "absolute", left: 390, top: 360, scale: String(1 + (f - 345) * 0.002) }}>
              <TrafficLight state="red" size={300} />
            </div>
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={385} to={455} cam={{ x: 540, y: 960, scale: 1 }} overlay={<Cockpit f={f - 385} light={f < 440 ? "red" : "green"} clock="13:06" />}>
        {null}
      </Shot>
      <Shot f={f} from={455} to={570} cam={{ x: 540, y: 1460, scale: 1.3 }}>
        <Street width={1080} offset={260 + fast} roadY={1280} />
        <div style={{ position: "absolute", left: 180 + 140 * Math.pow(interpolate(f, [455, 570], [0, 1], clamp), 1.6), top: 1560 }}>
          <Sedan kind="car" width={720} color={MOM_CAR} wheel={fast * 1.2} driver={momHead} />
        </div>
      </Shot>
    </>
  );
};
