// Сцена 1 (хук): бумажная карта Бишкека раскрывается pop-up волной —
// горы Ала-Тоо, тополя, пятиэтажки. Напечатанная жёлтая точка дрожит,
// отклеивается от листа, у неё открываются глаза и вырастают ножки; она
// выпрыгивает, оглядывается и спрашивает: «Мен кайсы мектеп жолуна туура
// келем?». Подписи: «КАРТАДАГЫ БИР ЧЕКИТ», «Графикалык мисал».
import { useCurrentFrame } from "remotion";
import { useLine, useSceneFrames, useSpeech } from "../context";
import { HOOK } from "../beats";
import { BG47_TEXT } from "../script";
import { Dot, DOT_H, DOT_W } from "../art/Dot";
import { SPOT } from "../art/MapSheet";
import { blink, clamp, easeInOut, easeOut, hop, keyed, lerp, prog, springy, squashAt } from "../art/motion";
import { Chip, KineticTitle, Question } from "../art/ui";
import { lerpCam, projectBillboard, type Cam } from "../art/Stage";
import { World } from "../art/World";

export const HOOK_CAM_END: Cam = { cx: 510, cy: 860, zoom: 1.78, tilt: 50, sy: 1130 };
export const HOOK_DOT_END = { x: 520, y: 876 } as const;
const PRINT_SCALE = 40 / 56;


export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const d1 = useLine("d1");
  const out = useSceneFrames("hook") - 6;
  const speech = useSpeech("dot", f);

  const c0: Cam = { cx: 500, cy: 760, zoom: 1.02, tilt: 58, sy: 1080 };
  const c1: Cam = { cx: 490, cy: 820, zoom: 1.32, tilt: 54, sy: 1110 };
  const cam = f < 44 ? lerpCam(c0, c1, easeInOut(f / 44)) : lerpCam(c1, HOOK_CAM_END, easeInOut((f - 44) / Math.max(60, d1.to - 20)));

  const pop = clamp(f / 34);
  // напечатанная точка стоит на «шарнире» под кружком: в плоском положении
  // её центр совпадает с кругом на листе
  const startY = SPOT.printed.y + (196 - 86) * PRINT_SCALE;
  const wob = f >= HOOK.wobble && f < HOOK.peel + 4 ? Math.sin((f - HOOK.wobble) * 1.6) * (1 - prog(f, HOOK.peel, 6)) : 0;
  const up = springy(prog(f, HOOK.peel, 14));
  const alive = easeOut(prog(f, HOOK.alive, 10));
  const scale = lerp(PRINT_SCALE, 1, easeOut(prog(f, HOOK.alive, 12)));
  const jumpT = easeInOut(prog(f, HOOK.jump, HOOK.land - HOOK.jump));
  const x = lerp(SPOT.printed.x, HOOK_DOT_END.x, jumpT);
  const y = lerp(startY, HOOK_DOT_END.y, jumpT);
  const lift = hop(f, HOOK.jump, HOOK.land - HOOK.jump, 150);
  const sq = squashAt(f, HOOK.jump, HOOK.land - HOOK.jump);
  const look =
    f < HOOK.land + 2
      ? { x: 0, y: -0.2 }
      : { x: keyed(f, [[HOOK.land + 2, 0], [HOOK.land + 8, -1], [HOOK.land + 18, -1], [HOOK.land + 24, 1], [HOOK.land + 34, 1], [HOOK.land + 40, 0]]), y: 0.1 };
  const gesture = easeInOut(prog(f, d1.from + 4, 10)) * (1 - easeInOut(prog(f, d1.to + 10, 12)));
  const head = projectBillboard(cam, x, y, (DOT_H - 4) * scale + lift);

  return (
    <>
      <World cam={cam} pop={pop} hole={easeOut(prog(f, HOOK.peel + 2, 8))} label={1 - easeOut(prog(f, 40, 12))} mountainLabel={0}>
        <DotOnMap
          x={x}
          y={y}
          up={up}
          angle={cam.tilt}
          lift={lift}
          sx={scale * (2 - sq) * (1 + wob * 0.04)}
          sy={scale * sq * (1 - wob * 0.04)}
          rot={wob * 6}
        >
          <Dot
            face={alive}
            legs={easeOut(prog(f, HOOK.alive + 2, 10))}
            blink={f < HOOK.alive ? 1 : blink(f, 1)}
            look={look}
            mouth={clamp(speech * 1.35)}
            mood={f > d1.from - 6 ? "curious" : "smile"}
            armL={lerp(lift > 10 ? 120 : 24, 30, 0)}
            armR={lerp(lift > 10 ? 120 : 24, 150, gesture)}
            glow={0}
          />
        </DotOnMap>
      </World>
      <KineticTitle text={BG47_TEXT.hook.title.replace("БИР ЧЕКИТ", "БИР\u00A0ЧЕКИТ")} f={f} at={4} y={276} size={84} per={1} out={out} />
      <Chip f={f} at={20} out={out} y={470} center size={32} bg={"#FFF4C2"} border={`3px dashed #3A4F80`}>
        {BG47_TEXT.graphic}
      </Chip>
      {/* плашка сценария: образ вымышленный (крупно, в безопасной зоне) */}
      <Chip f={f} at={2} out={out} y={538} center size={30} bg="rgba(255,255,255,0.94)" color="#3A4F80" border={`3px solid #3A4F80`}>
        {BG47_TEXT.hook.plate}
      </Chip>
      <Question f={f} at={d1.to - 8} out={out} x={head.x + 70 * head.s} y={head.y - 6} size={86} />
      <Question f={f} at={d1.to - 2} out={out} x={head.x - 74 * head.s} y={head.y + 10} size={60} />
    </>
  );
};

// Точка на карте: фигурка-открытка, смотрит прямо в камеру.
export const DotOnMap: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly up?: number;
  readonly lift?: number;
  readonly sx?: number;
  readonly sy?: number;
  readonly rot?: number;
  readonly opacity?: number;
  readonly children: React.ReactNode;
}> = ({ x, y, angle, up = 1, lift = 0, sx = 1, sy = 1, rot = 0, opacity = 1, children }) => (
  // прозрачность — только у дочерних слоёв: opacity < 1 у обёртки с
  // preserve-3d сплющивает фигурку на лист
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transformStyle: "preserve-3d" }}>
    <div
      style={{
        position: "absolute",
        left: -50,
        top: -16,
        width: 100,
        height: 32,
        borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(20,40,90,0.34), rgba(20,40,90,0))",
        transform: `translateZ(0.6px) scale(${Math.max(0.45, 1 - lift / 300) * Math.max(0.7, sx)})`,
        opacity: opacity * Math.min(1, up * 1.4),
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -DOT_W / 2,
        top: -DOT_H + 4,
        width: DOT_W,
        height: DOT_H,
        transformOrigin: `50% ${DOT_H - 4}px`,
        transform: `translateZ(1.5px) rotateX(${-angle * up}deg) translateY(${-lift}px) rotate(${rot}deg) scale(${sx}, ${sy})`,
        opacity,
      }}
    >
      {children}
    </div>
  </div>
);
