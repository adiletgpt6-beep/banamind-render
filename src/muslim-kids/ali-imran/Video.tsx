import React, { useMemo } from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ParticleCanvas, type Decor } from "../lib/ParticleCanvas";
import { range } from "../lib/math";
import { Watermark } from "../lib/ui";
import { loadMuslimKidsFonts } from "../fonts";
import { MK } from "../theme";
import { buildPlan, drawGlobeDetail, drawStars, N, PlanCtx } from "./choreo";
import { S1Back, S1Front } from "./scenes/S1Why";
import { S2Back, S2Front } from "./scenes/S2Earth";
import { S3Back, S3Front } from "./scenes/S3Quran";
import { S4Back, S4Front } from "./scenes/S4Signs";
import { S5Back, S5Front } from "./scenes/S5Sign";
import { S6Back, S6Front } from "./scenes/S6Ayah";
import { S7Back, S7Front } from "./scenes/S7Turn";
import { VIDEO } from "./script";
import { soundCues } from "./sound";
import { Cues, TimelineCtx, type Timeline } from "./timeline";

loadMuslimKidsFonts();

export type AliImranProps = { timeline: Timeline | null; voice: boolean };

const SCENES: Record<string, [React.FC, React.FC]> = {
  s1: [S1Back, S1Front],
  s2: [S2Back, S2Front],
  s3: [S3Back, S3Front],
  s4: [S4Back, S4Front],
  s5: [S5Back, S5Front],
  s6: [S6Back, S6Front],
  s7: [S7Back, S7Front],
};

const Mark: React.FC<{ cues: Cues }> = ({ cues }) => {
  const f = useCurrentFrame();
  const s3 = cues.scene("s3");
  const s5 = cues.scene("s5");
  const s7 = cues.scene("s7");
  const lightK =
    f >= s3.from && f < s3.from + s3.dur
      ? range(
          f,
          cues.word("s3a", "творении"),
          cues.word("s3a", "творении") + 20,
        )
      : 0;
  const inS5 = f >= s5.from && f < s5.from + s5.dur;
  const dark = !(lightK > 0.5 || inS5);
  const hide = range(
    f,
    cues.line("s7c").speechTo,
    cues.line("s7c").speechTo + 15,
  );
  const fadeS5 = inS5
    ? 1 - range(f, s5.from + s5.dur - 70, s5.from + s5.dur - 40)
    : 1;
  return f >= s7.from + s7.dur ? null : (
    <Watermark dark={dark} opacity={(1 - hide) * fadeS5 * range(f, 10, 30)} />
  );
};

export const AliImran: React.FC<AliImranProps> = ({ timeline, voice }) => {
  const cues = useMemo(
    () => (timeline ? new Cues(timeline) : null),
    [timeline],
  );
  const plan = useMemo(() => (cues ? buildPlan(cues) : null), [cues]);
  const below = useMemo<Decor | undefined>(
    () =>
      plan
        ? (ctx, f) => {
            drawStars(ctx, f, plan.stars(f));
            for (const g of plan.globes(f)) drawGlobeDetail(ctx, g);
          }
        : undefined,
    [plan],
  );
  if (!cues || !plan || !timeline)
    return <AbsoluteFill style={{ backgroundColor: MK.black }} />;
  return (
    <TimelineCtx.Provider value={cues}>
      <PlanCtx.Provider value={plan}>
        <AbsoluteFill style={{ backgroundColor: MK.black }}>
          {timeline.scenes.map((s) => {
            const Back = SCENES[s.id][0];
            return (
              <Sequence
                key={`b-${s.id}`}
                from={s.from}
                durationInFrames={s.dur}
                name={`${s.id} фон`}
              >
                <Back />
              </Sequence>
            );
          })}
          <ParticleCanvas segments={plan.segments} count={N} below={below} />
          {timeline.scenes.map((s) => {
            const Front = SCENES[s.id][1];
            return (
              <Sequence
                key={`f-${s.id}`}
                from={s.from}
                durationInFrames={s.dur}
                name={`${s.id} текст`}
              >
                <Front />
              </Sequence>
            );
          })}
          <Mark cues={cues} />
          {voice
            ? timeline.lines.map((l) =>
                l.file ? (
                  <Sequence
                    key={l.id}
                    from={l.audioFrom}
                    name={`голос ${l.id}`}
                  >
                    <Audio src={staticFile(`${VIDEO.voiceDir}/${l.file}`)} />
                  </Sequence>
                ) : null,
              )
            : null}
          {soundCues(cues, plan).map((s, i) => (
            <Sequence
              key={`sfx-${i}`}
              from={Math.max(0, s.at)}
              durationInFrames={s.dur}
              name={`звук ${s.file}`}
            >
              <Audio
                src={staticFile(`${VIDEO.sfxDir}/${s.file}`)}
                volume={(f) =>
                  s.dur
                    ? s.volume *
                      interpolate(
                        f,
                        [0, s.fadeIn ?? 1, s.dur - (s.fadeOut ?? 1), s.dur],
                        [0, 1, 1, 0],
                        {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        },
                      )
                    : s.volume
                }
              />
            </Sequence>
          ))}
        </AbsoluteFill>
      </PlanCtx.Provider>
    </TimelineCtx.Provider>
  );
};
