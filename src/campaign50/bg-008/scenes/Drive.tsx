// Сцена 3 (12,5–19,5 с), без слов — звук телефона. Серебристая машина
// мамы едет по улице Бишкека к школе; в салоне телефон в держателе
// вибрирует («Кардар» на дорожке «Жумуш» пульсирует), но мама смотрит на
// дорогу, руки на руле. Звонок обрывается — «Өткөрүлгөн чалуу • Кардар»;
// на дорожке «Жумуш» появляется красный значок пропущенного звонка.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { bg8Beats, buzzing } from "../beats";
import { CuesContext } from "../context";
import { Lanes } from "../lanes";
import type { PoseIn } from "../rig/Actor";
import { clamp, easeOut, keys, lerp } from "../rig/motion";
import { DashHolder, MissedScreen, NAVY, PhoneFrame, YELLOW } from "../screens";
import { BG8_TEXT } from "../script";
import { Car } from "../sets/Outdoor";
import { MOM_CAR, ROAD_Y, Street } from "../sets/Street";
import { box, Panel } from "../shots";
import { Cabin, WHEEL_L, WHEEL_R } from "./Cabin";
import { CALL, dayLanes, ROAD } from "./dayLanes";
import { LANES_TOP, SPLIT } from "./Office";

export const DriveScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { drive: d } = bg8Beats(cues);
  const ringing = f < d.missed;
  const buzz = ringing && buzzing(f, d.buzz);
  const shake = buzz ? Math.sin(f * 2.7) * 4 : 0;
  const carX = lerp(-100, 1500, f / 210);
  const momPose = (t: number): PoseIn => ({
    expr: t < d.missed ? "calm" : "thinking",
    sit: 1,
    seat: 780,
    // взгляд только на дорогу; на пропущенный — короткий взгляд после
    lookX: keys(t, [[d.missed + 6, 0], [d.missed + 12, -0.35], [d.missed + 30, -0.35], [d.missed + 38, 0]]),
    lookY: keys(t, [[d.missed + 6, 0], [d.missed + 12, 0.3], [d.missed + 30, 0.3], [d.missed + 38, 0]]),
    armL: { target: WHEEL_L, shape: "fist", elbow: "down" },
    armR: { target: WHEEL_R, shape: "fist", elbow: "down" },
  });
  const momFace = (t: number) => keys(t, [[0, 0.04], [60, -0.04], [120, 0.04]]);
  const lanesIn = 1;
  const missedV = clamp((f - d.missed) / 10);
  const playhead = lerp(40, 58, clamp(f / 210));
  const chip = easeOut((f - 2) / 8);
  return (
    <>
      {f < d.cabin ? (
        <Panel top={0} height={SPLIT} cam={{ x: carX + 120, y: ROAD_Y - 120, zoom: 0.9 }} bg="#FFFFFF">
          <Street withSchool={false} />
          <Car x={carX} y={ROAD_Y + 80} s={1} color={MOM_CAR} wheel={carX * 0.9} dir={1} driver />
        </Panel>
      ) : f < d.missed ? (
        <Panel top={0} height={SPLIT} cam={{ x: 600, y: 1130, zoom: 1.0 }} bg="#2F343E">
          <Cabin f={f} uid="d3" pass={20 + f * 0.9} moving window="street" momFace={momFace} momPose={momPose} phoneInHolder phoneGlow={1} phoneShake={shake} />
        </Panel>
      ) : (
        <div style={box({ left: 0, top: 0, width: 1080, height: SPLIT, overflow: "hidden", background: "linear-gradient(180deg, #2B2F38 0%, #1E2128 100%)" })}>
          <div style={box({ left: 335, top: 70, width: 620, height: 1300, transform: "scale(0.66)", transformOrigin: "0 0" })}>
            <DashHolder x={0} y={0} w={620} />
            <PhoneFrame x={0} y={0} w={620}>
              <MissedScreen f={f} at={d.missed + 4} time={BG8_TEXT.time.drive} />
            </PhoneFrame>
          </div>
        </div>
      )}
      <div style={box({ left: 0, top: SPLIT, width: 1080, height: 1920 - SPLIT, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: 0, top: SPLIT - 6, width: 1080, height: 12, backgroundColor: YELLOW })} />
      <Lanes
        f={f}
        lanes={dayLanes({ at: -100, pulse: ringing ? (buzz ? 1 : 0.4) : 0, callDim: clamp((f - d.missed) / 12) })}
        intro={lanesIn}
        playhead={playhead}
        clash={{ from: CALL.from, to: ROAD.to, v: 1 }}
        missed={{ at: 41, v: missedV }}
        top={LANES_TOP}
      />
      <div style={box({ left: 60, top: 220, display: "flex", gap: 14, fontFamily, opacity: chip * (f < d.missed ? 1 : 0) })}>
        <div style={{ padding: "12px 26px", borderRadius: 40, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 42, fontWeight: 900 }}>{BG8_TEXT.time.drive}</div>
        <div style={{ padding: "12px 26px", borderRadius: 40, backgroundColor: "#FFFFFF", color: NAVY, fontSize: 40, fontWeight: 900, border: `4px solid ${YELLOW}` }}>{BG8_TEXT.lanes.go}</div>
      </div>
    </>
  );
};
