// Шаг 4, короткая врезка: мама средним планом в своём светлом кабинете
// (тот же, что в хуке) задумалась — палец у подбородка, взгляд вверх и в
// сторону. Над ней раскрывается бумажное облачко мысли с её настоящим
// вопросом «Улантамбы?». Она молчит (говорит диктор) — рот закрыт.
import { box, settle, Shot, span, Svg, type Cam } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { OfficeBack, OfficeFront } from "../sets/Office";
import { C, F } from "../theme";

const MOM = { x: 575, y: 1500, h: 1000 } as const;
const placeFn = () => MOM;

// Бумажное облачко мысли (координаты кадра): три круга от головы и облако.
const Thought: React.FC<{ readonly t: number; readonly out: number }> = ({ t, out }) => {
  const dots = [0, 1, 2].map((i) => clamp((t - i * 3) / 7));
  const k = settle(t - 9, 16);
  if (t < 0) return null;
  const o = 1 - out;
  return (
    <>
      <Svg opacity={o}>
        {[
          { x: 470, y: 560, r: 14 },
          { x: 420, y: 505, r: 21 },
          { x: 360, y: 440, r: 28 },
        ].map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r * dots[i]} fill={C.paper} stroke={C.paperFold} strokeWidth={3} />
        ))}
      </Svg>
      <div
        style={box({
          left: 90,
          top: 262,
          width: 560,
          height: 190,
          opacity: clamp(k * 1.5) * o,
          transform: `scale(${0.7 + 0.3 * k})`,
          transformOrigin: "70% 100%",
        })}
      >
        <svg width={560} height={190} style={box({ left: 0, top: 0, overflow: "visible" })}>
          <path
            d="M 70 150 C 10 150 6 80 64 72 C 60 20 140 4 180 36 C 210 -4 300 -6 330 34 C 370 0 460 8 466 62 C 540 62 552 150 482 156 C 470 196 380 196 350 170 C 310 200 220 200 190 172 C 150 196 80 190 70 150 Z"
            fill={C.paper}
            stroke={C.paperFold}
            strokeWidth={4}
            style={{ filter: "drop-shadow(0 12px 18px rgba(20,40,90,0.16))" }}
          />
        </svg>
        <div style={box({ left: 0, right: 30, top: 58, textAlign: "center", fontFamily: F.text, fontWeight: 900, fontSize: 64, color: C.navy })}>{BG25_TEXT.step4.question}</div>
      </div>
    </>
  );
};

export const Step4Mom: React.FC<{ readonly f: number; readonly t: number; readonly dur: number; readonly opacity: number }> = ({ f, t, dur, opacity }) => {
  if (opacity <= 0.001) return null;
  const p = clamp(t / Math.max(1, dur));
  const cam: Cam = { x: lerp(560, 552, easeInOut(p)), y: lerp(760, 752, easeInOut(p)), zoom: lerp(1.86, 1.95, p) };
  // рука поднимается к подбородку, взгляд уходит вверх в сторону облачка
  const up = span(t, -12, 6); // рука уже у подбородка, когда врезка проявляется
  const look = span(t, 6, 18);
  const pose = (): PoseIn => ({
    expr: { browIn: 4 * look, browOut: 2 + 2 * look, lid: 0.14, smile: 0.05 },
    lookX: -0.45 * look,
    lookY: -0.5 * look,
    headTilt: -5 * look + Math.sin(f / 29) * 0.8,
    nod: 2 - 4 * look,
    // правая на экране рука — у подбородка (палец), левая поддерживает локоть
    armL: { target: { x: MOM.x + lerp(-70, -16, up), y: MOM.y + lerp(-470, -738, up) }, shape: up > 0.5 ? "fist" : "relax", elbow: "down", wrist: 0 },
    armR: { target: { x: MOM.x + lerp(90, -36, up), y: MOM.y + lerp(-458, -598, up) }, shape: "relax", elbow: "down", wrist: lerp(0, 80, up) },
  });
  return (
    <div style={box({ inset: 0, opacity })}>
      <Shot f={f} cam={cam} bg="#F8F2E7">
        <OfficeBack f={f} />
        <Actor uid="apa-s4" look="apa" f={f} seed={7} place={placeFn} pose={pose} blinks={[f - t + 22]} />
        <OfficeFront />
      </Shot>
      <Thought t={t - 8} out={clamp((t - (dur - 6)) / 6)} />
    </div>
  );
};
