// Выпуск целиком: фон по сценам, графика сцен, ведущий, субтитры, звук.
// Всё вычисляется из номера кадра и хронометража по озвучке.
import { Audio } from "@remotion/media";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { buildCaptions } from "./captions";
import { Host } from "./components/Host";
import { Subtitles } from "./components/Subtitles";
import { SCENES } from "./episode/script";
import { SCENES_RU } from "./episode/script.ru";
import { setLang, type Lang } from "./i18n";
import { SFX_FILES, sfxCues } from "./episode/sfx";
import { VISUALS } from "./visuals/index";
import { buildTimeline, cueTime, FPS, type VoiceManifest } from "./timeline";
import { C } from "./theme";
import { SceneCtx } from "./visuals/ctx";

export type EpisodeProps = { manifest: VoiceManifest | null; lang?: Lang };

export const scenesOf = (lang: Lang = "en") => (lang === "ru" ? SCENES_RU : SCENES);
export const voiceDirOf = (lang: Lang = "en") => (lang === "ru" ? "finance/voice-ru" : "finance/voice");

const f = (s: number) => Math.round(s * FPS);

export const Episode: React.FC<EpisodeProps> = ({ manifest, lang = "en" }) => {
  setLang(lang);
  const SCENES = scenesOf(lang);
  const frame = useCurrentFrame();
  const tl = useMemo(() => buildTimeline(SCENES, manifest), [manifest, SCENES]);
  const caps = useMemo(() => buildCaptions(tl), [tl]);
  const hl = useMemo(() => Object.fromEntries(SCENES.flatMap((s) => s.lines.map((l) => [l.id, l.hl ?? []]))), [SCENES]);
  const layouts = useMemo(
    () =>
      SCENES.flatMap((s, i) =>
        s.host.map((h, k) => ({ frame: k === 0 ? f(tl.scenes[i].from) : f(cueTime(tl, h.at)), layout: h.layout })),
      ),
    [tl],
  );
  const poses = useMemo(
    () => SCENES.flatMap((s, i) => s.poses.map((p, k) => ({ frame: k === 0 ? f(tl.scenes[i].from) + 4 : f(cueTime(tl, p.at)), pose: p.pose }))),
    [tl],
  );
  const sfx = useMemo(() => sfxCues(tl, SCENES), [tl, SCENES]);

  // фон: кремовый или нежно-голубой; плавная смена между сценами
  const sceneIdx = tl.scenes.findIndex((s) => frame >= f(s.from) && frame < f(s.to));
  const cur = tl.scenes[Math.max(0, sceneIdx)];
  const prevScene = tl.scenes[Math.max(0, sceneIdx - 1)];
  const colorOf = (id: string) => (SCENES.find((s) => s.id === id)!.bg === "sky" ? C.sky : C.cream);
  const k = interpolate(frame, [f(cur.from), f(cur.from) + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <AbsoluteFill style={{ background: colorOf(prevScene.id) }} />
      <AbsoluteFill style={{ background: colorOf(cur.id), opacity: k }} />
      {/* лёгкая фактура: крупные мягкие круги в углах */}
      <AbsoluteFill>
        <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", right: -380, top: -420, background: "rgba(255,255,255,0.55)" }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", left: -300, bottom: -330, background: "rgba(255,255,255,0.4)" }} />
      </AbsoluteFill>

      {tl.scenes.map((sc, i) => {
        const V = VISUALS[SCENES[i].visual];
        if (!V) throw new Error(`Нет визуального блока ${SCENES[i].visual}`);
        const from = f(sc.from);
        const dur = Math.max(1, f(sc.to) - from + 10);
        return (
          <Sequence key={sc.id} from={from} durationInFrames={dur} layout="none">
            <SceneCtx.Provider value={{ tl, sceneFrom: sc.from, sceneTo: sc.to }}>
              <V />
            </SceneCtx.Provider>
          </Sequence>
        );
      })}

      <Host layouts={layouts} poses={poses} lines={tl.lines} />
      <Subtitles caps={caps} hl={hl} />

      {tl.lines
        .filter((l) => l.file)
        .map((l) => (
          <Sequence key={l.id} from={f(l.from)} layout="none">
            <Audio src={staticFile(`${voiceDirOf(lang)}/${l.file}`)} />
          </Sequence>
        ))}
      {sfx.map((s, i) => (
        <Sequence key={`sfx${i}`} from={f(s.at)} durationInFrames={f(1.2)} layout="none">
          <Audio src={staticFile(`finance/sfx/${SFX_FILES[s.kind]}`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
