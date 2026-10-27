import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../config";
import { ARM, Character, mixArm, type Expr } from "../Character";
import { Entrance, Street, TrafficLight } from "../sets";
import { Sedan, WindowHead } from "../props";
import { MS_TEXT } from "../script";
import { useLineCue, useMouth, useSceneLength } from "../StoryContext";
import { Caption, Feet, Panel, ramp } from "../ui";

const C = MS_TEXT.captions;
const CAR_COLORS = ["#8FA3BF", "#C9B79C", "#9DB7A5", "#B7A3C4", "#A9B4C2", "#D1A99A"];

// Крупный план головы и плеч персонажа внутри панели.
const CloseUp: React.FC<{
  kind: "mom" | "driver";
  w: number;
  h: number;
  expr: Expr;
  mouth: number;
  look?: number;
  headTilt?: number;
  arm?: readonly [number, number];
}> = ({ kind, w, h, expr, mouth, look = 0, headTilt = 0, arm }) => {
  const H = 1650;
  return (
    <div style={{ position: "absolute", left: w / 2 - 0.2 * H, top: h * 0.42 - 0.158 * H }}>
      <Character
        kind={kind}
        height={H}
        expr={expr}
        mouth={mouth}
        look={look}
        headTilt={headTilt}
        armL={arm ?? ARM.down}
        itemL={arm ? "phone" : "none"}
        seed={kind === "mom" ? 11 : 12}
      />
    </div>
  );
};

// ---------- Сцена 6: тыгын ----------
export const TrafficScene: React.FC = () => {
  const t = useCurrentFrame();
  const len = useSceneLength("s06Traffic");
  const m05 = useLineCue("s06Traffic", "m05");
  const t01 = useLineCue("s06Traffic", "t01");
  const m06 = useLineCue("s06Traffic", "m06");
  const mouthMom = useMouth("s06Traffic", "mother");
  const mouthDriver = useMouth("s06Traffic", "driver");
  // машины почти не двигаются: «ползут» рывками
  const creep = (t / 30) * 6 + Math.max(0, Math.sin(t / 25)) * 10;
  const panelsIn = ramp(t, 4, 22);
  const panelsOut = ramp(t, m06.end + 26, m06.end + 44);
  const speakingMom = t >= m05.start - 2 && t <= m05.end + 2 || (t >= m06.start - 2 && t <= m06.end + 2);
  const speakingDriver = t >= t01.start - 2 && t <= t01.end + 2;
  const laneA = [-260, 200, 660, 1120];
  const laneB = [-120, 480, 1080];
  const laneC = [-380, 300, 980];
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#FFFFFF" }}>
      <Street width={1080} offset={creep * 0.2} roadY={1080} />
      <div style={{ position: "absolute", left: 900, top: 650 }}>
        <TrafficLight state="red" size={90} />
      </div>
      {/* дальний ряд: такси среди машин */}
      {laneA.map((x, i) => (
        <div key={x} style={{ position: "absolute", left: x + creep, top: 1330 - 0.42 * 440 * 0.98 }}>
          <Sedan
            kind={i === 1 ? "taxi" : "car"}
            width={440}
            color={i === 1 ? undefined : CAR_COLORS[i]}
            wheel={creep * 6}
            driver={
              i === 1 ? <WindowHead x={322} y={88} r={26} skin="#C9996F" hair="#3D3A38" cap tired mouth={mouthDriver} /> : undefined
            }
          />
        </div>
      ))}
      {/* ближний ряд */}
      {laneB.map((x, i) => (
        <div key={x} style={{ position: "absolute", left: x + creep * 0.7, top: 1640 - 0.42 * 560 * 0.98 }}>
          <Sedan kind="car" width={560} color={CAR_COLORS[(i + 3) % CAR_COLORS.length]} wheel={creep * 5} />
        </div>
      ))}
      {/* самый ближний ряд (крупно, частично за кадром) */}
      {laneC.map((x, i) => (
        <div key={x} style={{ position: "absolute", left: x + creep * 0.5, top: 1990 - 0.42 * 700 * 0.98 }}>
          <Sedan kind="car" width={700} color={CAR_COLORS[(i + 1) % CAR_COLORS.length]} wheel={creep * 4} />
        </div>
      ))}
      {/* выхлоп / «стоим» */}
      {[0, 1, 2].map((k) => {
        const p = ((t + k * 20) % 60) / 60;
        return (
          <div key={k} style={{ position: "absolute", left: 180 + creep - p * 60, top: 1290 - p * 50, width: 40 + p * 40, height: 40 + p * 40, borderRadius: 999, backgroundColor: `rgba(200,205,215,${0.6 * (1 - p)})` }} />
        );
      })}
      {/* разговор по телефону: мама ↔ таксист */}
      <div style={{ position: "absolute", inset: 0, translate: `0px ${(1 - panelsIn) * -900 + panelsOut * -1000}px` }}>
        <Panel x={90} y={410} w={410} h={470} bg="#F3E7D7" style={{ borderColor: speakingMom ? COLORS.yellow : "#FFFFFF" }}>
          <CloseUp kind="mom" w={410} h={470} expr={t > t01.end ? "tired" : "worried"} mouth={mouthMom} look={0.6} arm={ARM.phoneEar} />
        </Panel>
        <Panel x={540} y={410} w={410} h={470} bg="#C9D3E0" style={{ borderColor: speakingDriver ? COLORS.yellow : "#FFFFFF" }}>
          {/* салон: окно с пробкой, руль */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 410, height: 200, background: "linear-gradient(#BFE0F7, #E9EEF3)" }} />
          {[0, 1].map((k) => (
            <div key={k} style={{ position: "absolute", left: -40 + k * 230, top: 120, width: 200, height: 70, borderRadius: 24, backgroundColor: CAR_COLORS[k + 2] }} />
          ))}
          <CloseUp kind="driver" w={410} h={470} expr="tired" mouth={mouthDriver} look={-0.5} />
          <svg width={300} height={160} viewBox="0 0 300 160" style={{ position: "absolute", left: 55, top: 360 }}>
            <circle cx={150} cy={150} r={130} fill="none" stroke="#2A2F3A" strokeWidth={22} />
          </svg>
        </Panel>
      </div>
      <Caption text={C.traffic} frame={t} at={10} out={len - 12} />
    </AbsoluteFill>
  );
};

// Положение машины при езде: скорость по кадрам (разгон, остановка на
// красный, снова зелёный). Возвращает пройденный путь (px) к кадру t.
const driveDistance = (t: number, start: number, stopAt: number, goAt: number) => {
  let d = 0;
  for (let f = start; f < t; f++) {
    const accel = ramp(f, start, start + 24);
    const brake = 1 - ramp(f, stopAt - 22, stopAt);
    const go = ramp(f, goAt, goAt + 26);
    const v = f < stopAt ? 22 * accel * brake : 22 * go;
    d += v;
  }
  return d;
};

// ---------- Сцена 7: такси келди ----------
export const RideScene: React.FC = () => {
  const t = useCurrentFrame();
  const m07 = useLineCue("s07Ride", "m07");
  const t02 = useLineCue("s07Ride", "t02");
  const mouthMom = useMouth("s07Ride", "mother");
  const mouthDriver = useMouth("s07Ride", "driver");
  const roadY = 1300;
  const carW = 760;
  const carH = carW * 0.42;
  const carTop = 1560 - carH * 0.98;
  // подъезд: машина въезжает слева и останавливается
  const arrive = ramp(t, 0, 50);
  const carX0 = -900 + 960 * arrive;
  // мама и дочь выходят из подъезда к машине
  const walk = ramp(t, 14, Math.max(30, m07.start - 6));
  const momX = 760 - 330 * walk;
  const girlX = 880 - 330 * walk;
  const boardAt = t02.end + 8;
  const board = ramp(t, boardAt, boardAt + 14);
  const driveAt = boardAt + 24;
  const stopAt = driveAt + 70;
  const goAt = stopAt + 54;
  const dist = t > driveAt ? driveDistance(t, driveAt, stopAt, goAt) : 0;
  // светофор стоит так, чтобы машина остановилась прямо перед ним
  const lightX = 800 + driveDistance(stopAt + 1, driveAt, stopAt, goAt);
  const wheel = (carX0 + dist) * 0.8;
  const momExpr: Expr = t < m07.start - 4 ? "worried" : "neutral";
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#FFFFFF" }}>
      {/* крупнее: машина и люди заполняют кадр */}
      <AbsoluteFill style={{ scale: "1.2", transformOrigin: "50% 72%" }}>
      <Street width={1080} offset={-dist} roadY={roadY} />
      <div style={{ position: "absolute", left: -dist, top: 0 }}>
        <Entrance x={600} roadY={roadY - 10} />
      </div>
      <div style={{ position: "absolute", left: lightX - dist, top: roadY - 470 }}>
        <TrafficLight state={t < goAt ? "red" : "green"} size={100} />
      </div>
      {/* мама и дочь (за машиной — «садятся» за кузов) */}
      {board < 1 ? (
        <>
          <Feet x={momX - dist} y={roadY - 10 + board * 300} height={760}>
            <Character kind="mom" height={760} expr={momExpr} mouth={mouthMom} look={-1} legs={walk > 0 && walk < 1 ? "walk" : "stand"} walk={t} armR={mixArm(ARM.down, [-150, 520], walk)} bag seed={13} />
          </Feet>
          <Feet x={girlX - dist} y={roadY - 4 + board * 300} height={480}>
            <Character kind="girl" height={480} expr="calm" look={-1} jacket="#6CB4C6" backpack legs={walk > 0 && walk < 1 ? "walk" : "stand"} walk={t + 5} seed={14} />
          </Feet>
        </>
      ) : null}
      <div style={{ position: "absolute", left: carX0, top: carTop }}>
        <Sedan
          kind="taxi"
          width={carW}
          wheel={wheel}
          driver={<WindowHead x={322} y={86} r={26} skin="#C9996F" hair="#3D3A38" cap tired mouth={mouthDriver} />}
          passengers={
            board >= 1 ? (
              <>
                <WindowHead x={196} y={84} r={24} skin="#EDC5A0" hair="#3A2722" />
                <WindowHead x={238} y={96} r={18} skin="#F2CBA8" hair="#2E1F1B" shirt="#6CB4C6" />
              </>
            ) : undefined
          }
        />
      </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
