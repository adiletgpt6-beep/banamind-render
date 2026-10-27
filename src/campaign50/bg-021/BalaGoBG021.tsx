// BalaGo-50, выпуск №22 / BG-021 «Это не обычный вызов такси».
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Bg021Audio } from "./Bg021Audio";
import { Captions } from "./Captions";
import { C, clamp } from "./parts";
import { CtaScene, FormScene, GroupScene, HookScene, OneOffScene, TrialScene } from "./scenes";
import { BG021_VIDEO, type Bg021SceneId } from "./script";
import { type Bg021Timeline } from "./timing";

export type BalaGoBG021Props = { readonly timeline: Bg021Timeline | null; readonly strictVoice?: boolean };

const SCENES: Record<Bg021SceneId, React.FC<{ readonly tl: Bg021Timeline }>> = {
  hook: HookScene,
  oneoff: OneOffScene,
  form: FormScene,
  group: GroupScene,
  trial: TrialScene,
  cta: CtaScene,
};

const FADE = 9;

// Сцена: мягкое появление с лёгким подъёмом и растворение в следующую.
const SceneShell: React.FC<{ readonly len: number; readonly last: boolean; readonly first: boolean; readonly children: React.ReactNode }> = ({ len, last, first, children }) => {
  const frame = useCurrentFrame();
  const inP = first ? 1 : interpolate(frame, [0, FADE], [0, 1], clamp);
  const outP = last ? 1 : interpolate(frame, [len, len + FADE], [1, 0], clamp);
  const drift = interpolate(frame, [0, len], [0, -14], clamp);
  return (
    <AbsoluteFill style={{ opacity: Math.min(inP, outP), transform: `translateY(${(1 - inP) * 24 + drift}px)` }}>{children}</AbsoluteFill>
  );
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFFFFF 0%, ${C.sky} 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.55 }}>
        {Array.from({ length: 13 }).map((_, r) =>
          Array.from({ length: 8 }).map((__, c) => (
            <circle key={`${r}-${c}`} cx={70 + c * 135 + ((frame * 0.25) % 135)} cy={140 + r * 140} r={3} fill={C.line} />
          )),
        )}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 14, background: C.yellow }} />
    </AbsoluteFill>
  );
};

export const BalaGoBG021: React.FC<BalaGoBG021Props> = ({ timeline }) => {
  if (!timeline) throw new Error("Шкала BalaGoBG021 не рассчитана (calculateMetadata).");
  const fps = BG021_VIDEO.fps;
  const n = timeline.scenes.length;
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      <Backdrop />
      {timeline.scenes.map((s, i) => {
        const from = Math.round(s.from * fps);
        const len = Math.round(s.to * fps) - from;
        const Scene = SCENES[s.id];
        const last = i === n - 1;
        return (
          <Sequence key={s.id} name={s.title} from={from} durationInFrames={len + (last ? 0 : FADE)}>
            <SceneShell len={len} last={last} first={i === 0}>
              <Scene tl={timeline} />
            </SceneShell>
          </Sequence>
        );
      })}
      <Captions tl={timeline} />
      <Bg021Audio tl={timeline} />
    </AbsoluteFill>
  );
};
