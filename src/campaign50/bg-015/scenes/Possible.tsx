// «Возможное после» — тот же двор и тот же проезд камеры, что в хуке
// (окно → скамейка), но днём: окно квартиры пустое, на скамейке папа и сын
// запускают воздушного змея. Это условная картина (пометка в кадре), не
// изображение уже оказанной услуги.
import { Actor, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { keys } from "../../../two-schedules-2d/rig/motion";
import type { Cam } from "../../../two-schedules-2d/shots";
import { BenchFront, FamilyWindow, Kite, PARK, ParkBack, ParkTint } from "../sets/Park";

export const PossibleWorld: React.FC<{ f: number; cam: Cam }> = ({ f, cam }) => {
  const b = PARK.bench;
  const dad = { x: b.x + 300, y: b.floor, h: 640 };
  const son = { x: b.x + 130, y: b.floor, h: 440 };
  const seat = b.floor - b.seatY;
  const kite = { x: 1010 + Math.sin(f / 23) * 26, y: 1560 + Math.cos(f / 31) * 18 };
  const sonHand = { x: son.x + 70, y: son.y - seat - 0.5 * son.h };
  const dadPose = (t: number): PoseIn => ({
    expr: "smile",
    sit: 1,
    seat,
    lookY: -0.35,
    headTilt: keys(t, [[0, 0], [40, 4], [80, 0]]),
    armR: { target: { x: dad.x + 120, y: dad.y - seat - 0.5 * dad.h }, shape: "point", elbow: "out", behind: false },
    armL: { target: { x: son.x + 50, y: son.y - seat - 0.62 * son.h }, shape: "relax", elbow: "out", behind: true },
  });
  const sonPose = (): PoseIn => ({
    expr: "smile",
    sit: 1,
    seat,
    packOff: true,
    lookY: -0.5,
    armR: { target: sonHand, shape: "fist", elbow: "down", behind: false },
    armL: { target: { x: son.x - 0.14 * son.h, y: son.y - seat - 0.08 * son.h }, shape: "relax", elbow: "down" },
  });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#BFDDF3" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1, height: 1, transformOrigin: "0 0", transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})` }}>
        <ParkBack mode="day" />
        <FamilyWindow mode="day" curtain={0.14} />
        <Actor uid="p-dad" look="dad" f={f} place={() => dad} face={() => -0.35} pose={dadPose} seed={2} />
        <Actor uid="p-son" look="son" f={f} place={() => son} face={() => 0.45} pose={sonPose} seed={4} />
        <BenchFront />
        <svg width={PARK.w} height={PARK.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path d={`M ${sonHand.x} ${sonHand.y} Q ${(sonHand.x + kite.x) / 2 + 40} ${(sonHand.y + kite.y) / 2 + 80} ${kite.x} ${kite.y + 100}`} stroke="#FFFFFF" strokeWidth={3} fill="none" />
        </svg>
        <Kite x={kite.x} y={kite.y} s={0.8} rot={14 + Math.sin(f / 17) * 6} sway={Math.sin(f / 9)} />
        <ParkTint mode="day" />
      </div>
    </div>
  );
};
