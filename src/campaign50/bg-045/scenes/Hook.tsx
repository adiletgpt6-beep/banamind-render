// Сцена 1 (≈0–6,5 с): хук. Один офис, одна мама и один ноутбук на весь
// кадр — мама печатает. По центру прорастает светлая линия-зеркало, кадр
// сжимается в левую половину, а из линии, как створка зеркала,
// раскрывается правая — отражённый, полупрозрачный «условный» офис.
// Сверху: «АЗЫР» и «ЭГЕР КАТТАМ УЮШУЛСА • шарттуу мисал».
// Диктор: «Бир эле дүйшөмбү эки башкача өтсө кандай болот?»
// На словах «эки башкача» мамы впервые двигаются по-разному: левая
// озабоченно смотрит на часы, правая спокойно улыбается и печатает дальше.
import { useCurrentFrame } from "remotion";
import { useScene, useTimeline } from "../context";
import { LeftPanel, MirrorLine, NowLabel, RightPanel, HALF } from "../mirror";
import type { PoseIn } from "../rig/Actor";
import { easeInOut, keys, lerp } from "../rig/motion";
import { mixCam } from "../shots";
import { CAM_FULL, CAM_HALF, OFFICE_AXIS, typePose, wordFrame } from "./common";
import { OfficeWorld } from "./OfficeWorld";
import { HK, hookDiverge } from "../beats";

export { HK };

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { from } = useScene();
  const tl = useTimeline();
  const cue = tl.cues.find((c) => c.id === "n01")!;
  const diverge = hookDiverge((p, fb, nth = 0) => wordFrame(cue, p, fb, from, nth));
  const s = easeInOut((f - HK.split0) / (HK.split1 - HK.split0));
  const width = lerp(1080, HALF, s);
  const cam = mixCam(CAM_FULL, CAM_HALF, s);
  const minutes = 12 * 60 + 24 + f / 90;
  // левая: на «эки башкача» вибрирует телефон — «12:40 • Мектептен алып
  // кетүү»; мама перестаёт печатать и встревоженно смотрит на него
  const leftPose = (t: number): PoseIn => {
    const look = keys(t, [[diverge + 2, 0], [diverge + 12, 1]]);
    return {
      ...typePose(t, 1 - look * 0.85, 0),
      lookY: lerp(0.22, 0.7, look),
      expr: t < diverge + 4 ? "calm" : "worried",
    };
  };
  const leftFace = (t: number) => keys(t, [[diverge + 2, 0.55], [diverge + 12, 0.25]]);
  // правая: та же мама, печатает и спокойно улыбается
  const rightPose = (t: number): PoseIn => ({
    ...typePose(t, 1, 0),
    expr: t < diverge ? "calm" : "softSmile",
    nod: keys(t, [[diverge + 6, 0], [diverge + 14, 4], [diverge + 22, 0]]),
  });
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }}>
      <LeftPanel cam={cam} width={width}>
        <OfficeWorld f={f} minutes={minutes} uid="h-l" pose={leftPose} face={leftFace} seed={6} buzz={keys(f, [[diverge, 0], [diverge + 3, 1]])} reminder={keys(f, [[diverge + 4, 0], [diverge + 14, 1]])} />
      </LeftPanel>
      <RightPanel cam={CAM_HALF} mirror={OFFICE_AXIS} open={(f - HK.open0) / (HK.open1 - HK.open0)} f={f}>
        <OfficeWorld f={f} minutes={minutes} uid="h-r" pose={rightPose} seed={6} />
      </RightPanel>
      <MirrorLine draw={(f - HK.line) / 14} glow={keys(f, [[HK.line, 1], [HK.split1, 0.3]])} />
      <NowLabel a={keys(f, [[HK.labels, 0], [HK.labels + 10, 1]])} />
      {/* вспышка-блик в момент «раскола» зеркала (мягкая, не слепящая) */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.55), transparent 55%)", opacity: keys(f, [[HK.line, 0], [HK.line + 6, 0.6], [HK.line + 20, 0]]) }} />
    </div>
  );
};
