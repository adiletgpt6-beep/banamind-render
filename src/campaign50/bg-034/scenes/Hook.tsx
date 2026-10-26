// Сцена 1 (0 – ≈5 с): хук «10 САПАР = ?».
// Десять бумажных билетов-конвертов BalaGo разлетаются на светлую витрину
// (их никто не «выдал» маме — это наглядная схема пакета). Большая плитка
// «10» переворачивается в «?». Над билетами висит резиновый штамп и не
// опускается, пока мама не разберётся. Мама (слева внизу) задумчиво смотрит
// на билеты, рука у подбородка. В конце один билет поднимается и светится —
// камера приближается к нему (переход к сцене 2).
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
import { fontFamily } from "../../../fonts";
import { useScene, useWordAt } from "../context";
import { C } from "../palette";
import { BG34_TEXT } from "../script";
import {
  Headline,
  MiniTicket,
  Paper,
  RubberStamp,
  TICKET_RATIO,
  popScale,
} from "../ui";

export const TW = 140;
// Общая вертикальная ось кадра: центр безопасной зоны (слева 60, справа 150 px).
export const AXIS = 495;
// Сетка билетов 2 × 5 (центры), под плиткой «10».
export const gridPos = (i: number) => ({
  x: AXIS + ((i % 5) - 2) * 158,
  y: 838 + Math.floor(i / 5) * 116,
});
// Наклоны билетов (детерминированно).
export const gridRot = (i: number) => [-5, 3, -2, 4, -4, 2, -3, 5, -1, 3][i];
export const HERO = 2; // билет, к которому приближается камера

const MOM: Place = { x: 236, y: 2420, h: 1450 };

export const HK = { deal: 4, stamp: 16 } as const;

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const flipAt = Math.min(Math.max(34, useWordAt("n01", 4) - 6), 60);
  const liftAt = frames - 22;
  const lift = easeInOut((f - liftAt) / 18);

  // камера: лёгкий наезд в начале, в конце — к поднятому билету
  const hero = gridPos(HERO);
  const zoom = lerp(1.04, 1, easeOut(f / 40)) * (1 + 0.55 * lift);
  const cx = lerp(540, hero.x, lift);
  const cy = lerp(960, hero.y - 40, lift);
  const fade = 1 - lift; // при наезде на билет всё остальное гаснет

  const tileS = 0.72 + 0.28 * popScale(f, 0, 10);
  const flip = easeInOut((f - flipAt) / 14);
  const ang = 180 * flip;
  const qA = popScale(f, flipAt + 10, 10);

  const momPose = (t: number): PoseIn => {
    const think = t < flipAt + 18;
    return {
      expr: think ? "thinking" : "surprised",
      lookY: -0.45,
      lookX: 0.35,
      headTilt: think ? -5 : 3,
      // телефон у груди: мама читает про пакет и поднимает взгляд на билеты
      armR: {
        target: { x: MOM.x + 0.13 * MOM.h, y: MOM.y - 0.6 * MOM.h },
        shape: "phone",
        item: "phone",
        glow: 1,
        itemTilt: -8,
        elbow: "down",
        behind: false,
      },
    };
  };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Paper />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "0 0",
          transform: `translate(${540 - cx * zoom}px, ${960 - cy * zoom}px) scale(${zoom})`,
        }}
      >
        <Headline
          top={282}
          size={100}
          style={{ opacity: clamp(1 - 2 * lift), letterSpacing: 2 }}
        >
          {BG34_TEXT.hook.title}{" "}
          <span style={{ color: C.yellowDeep, opacity: qA > 0 ? 1 : 0.35 }}>
            {BG34_TEXT.hook.eq}
          </span>
        </Headline>

        {/* плитка «10» → «?» */}
        <div
          style={{
            position: "absolute",
            left: AXIS - 125,
            top: 430,
            width: 250,
            height: 250,
            perspective: 1200,
            transform: `scale(${tileS})`,
            opacity: fade,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transform: `rotateY(${ang}deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 44,
                backgroundColor: C.yellow,
                border: `8px solid ${C.navy}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily,
                fontWeight: 1000,
                fontSize: 170,
                color: C.navy,
                backfaceVisibility: "hidden",
                boxShadow: "0 18px 40px rgba(20,40,90,0.18)",
              }}
            >
              10
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 44,
                backgroundColor: C.navy,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily,
                fontWeight: 1000,
                fontSize: 190,
                color: C.yellow,
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                boxShadow: "0 18px 40px rgba(20,40,90,0.22)",
              }}
            >
              ?
            </div>
          </div>
        </div>

        {/* десять билетов разлетаются по витрине */}
        {Array.from({ length: 10 }, (_, i) => {
          const p = gridPos(i);
          const at = HK.deal + i * 2.6;
          const u = easeOut((f - at) / 14);
          if (u <= 0) return null;
          const sx = 1180;
          const sy = 1420;
          const x = lerp(sx, p.x, u);
          const y = lerp(sy, p.y, u) - 120 * Math.sin(Math.PI * u);
          const rot = lerp(40, gridRot(i), u);
          const isHero = i === HERO;
          const s = isHero ? 1 + 0.32 * lift : 1;
          const dim = isHero ? 1 : fade;
          const lifty = isHero ? -28 * lift : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - TW / 2,
                top: y - (TW * TICKET_RATIO) / 2 + lifty,
                width: TW,
                height: TW * TICKET_RATIO,
                transform: `rotate(${rot * (isHero ? 1 - lift : 1)}deg) scale(${s})`,
                opacity: dim,
                filter: `drop-shadow(0 ${6 + 10 * (isHero ? lift : 0)}px ${8 + 10 * (isHero ? lift : 0)}px rgba(20,40,90,0.18))`,
                zIndex: isHero ? 2 : 1,
              }}
            >
              <MiniTicket w={TW} glow={isHero ? lift : 0} />
            </div>
          );
        })}

        {/* штамп ждёт над билетами и не опускается */}
        {f >= HK.stamp && fade > 0 ? (
          <div style={{ opacity: fade }}>
            <RubberStamp
              x={826}
              y={724 + 10 * Math.sin(f / 7)}
              s={0.62 * popScale(f, HK.stamp, 12)}
              tilt={8 * Math.sin(f / 11) + 10}
            />
          </div>
        ) : null}
        {f >= HK.stamp + 8 ? (
          <div
            style={{
              position: "absolute",
              left: 852,
              top: 560 + 6 * Math.sin(f / 9),
              fontFamily,
              fontWeight: 1000,
              fontSize: 58,
              color: C.navy,
              opacity: clamp((f - HK.stamp - 8) / 8) * fade,
            }}
          >
            ?
          </div>
        ) : null}

        {/* мама разбирается: телефон у груди, взгляд на билеты */}
        <Actor
          uid="h-mom"
          look="mom"
          f={f}
          place={() => MOM}
          face={() => 0.35}
          pose={momPose}
          seed={1}
          opacity={fade}
        />
      </div>
    </div>
  );
};
