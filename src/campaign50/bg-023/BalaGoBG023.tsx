import React, { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Bg23Audio } from "./Bg23Audio";
import { CtaScene } from "./Cta";
import { CROSSFADE, SceneIn, type SceneCue, type SceneProps } from "./frame";
import { GroupScene, HookScene, MapScene, groupSnapTimes } from "./scenes1";
import { SeatsScene, TrialScene, seatBeltTimes } from "./scenes2";
import { BG23_VIDEO, buildBg23Subs, buildBg23Timeline, type Bg23Manifest, type Bg23SceneId } from "./script";
import { Subtitles } from "./Subtitles";

export type BalaGoBG023Props = {
  // Заполняется calculateMetadata из public/audio/campaign50/bg-023/manifest.json.
  readonly manifest: Bg23Manifest | null;
};

const SCENES: Record<Exclude<Bg23SceneId, "cta">, React.FC<SceneProps>> = {
  hook: HookScene,
  map: MapScene,
  group: GroupScene,
  seats: SeatsScene,
  trial: TrialScene,
};

export const BalaGoBG023: React.FC<BalaGoBG023Props> = ({ manifest }) => {
  const tl = useMemo(() => buildBg23Timeline(manifest), [manifest]);
  const subs = useMemo(() => buildBg23Subs(tl), [tl]);
  const fps = BG23_VIDEO.fps;
  const rel = (id: Bg23SceneId, idx = 0): SceneCue => {
    const sc = tl.scenes.find((s) => s.id === id)!;
    const c = tl.cues.filter((x) => x.scene === id)[idx];
    return { from: c.from - sc.from, to: c.to - sc.from, words: c.words.map((w) => ({ ...w, start: w.start - sc.from, end: w.end - sc.from })) };
  };
  const sceneFrom = (id: Bg23SceneId) => tl.scenes.find((s) => s.id === id)!.from;
  const sfx = useMemo(() => {
    const g = sceneFrom("group");
    const s = sceneFrom("seats");
    return [
      ...groupSnapTimes(rel("group")).map((t) => ({ at: g + t + 0.12, src: "audio/sfx-pop.mp3", volume: 0.22 })),
      ...seatBeltTimes(rel("seats")).map((t) => ({ at: s + t + 0.48, src: "audio/sfx-tap.mp3", volume: 0.3 })),
      { at: sceneFrom("cta") + 0.1, src: "audio/sfx-chime.mp3", volume: 0.12 },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tl]);
  const cta = tl.scenes.find((s) => s.id === "cta")!;
  const goAt = tl.cues.find((c) => c.id === "c3-go")!.from - cta.from;
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      {tl.scenes.map((sc) => {
        const from = Math.round(sc.from * fps);
        // сцена остаётся под следующей, пока та плавно проявляется (кроссфейд
        // без пустого белого кадра на стыке)
        const durationInFrames = Math.round(sc.to * fps) - from + (sc.id === "cta" ? 0 : CROSSFADE);
        if (sc.id === "cta") {
          return (
            <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={durationInFrames}>
              <SceneIn>
                <CtaScene goAt={goAt} />
              </SceneIn>
            </Sequence>
          );
        }
        const Scene = SCENES[sc.id];
        return (
          <Sequence key={sc.id} name={sc.title} from={from} durationInFrames={durationInFrames} premountFor={fps}>
            <AbsoluteFill style={{ overflow: "hidden" }}>
              <Scene dur={durationInFrames - CROSSFADE} cue={rel(sc.id)} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Subtitles subs={subs} />
      <Bg23Audio tl={tl} sfx={sfx} />
    </AbsoluteFill>
  );
};
