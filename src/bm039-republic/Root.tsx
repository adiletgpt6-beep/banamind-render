// Композиции фильма BM-039 «Государство» (Платон). Хронометраж — по озвучке
// (public/bm039-republic/voice/manifest.json); без неё — черновые оценки.
import React from "react";
import { Composition } from "remotion";
import "../fonts";
import manifest from "../../public/bm039-republic/voice/manifest.json";
import { buildCues } from "./captions";
import { ShapeSheet } from "./dev/ShapeSheet";
import { Lesson } from "./Lesson";
import { SCENES } from "./script";
import { FPS, H, W } from "./theme";
import { buildTimeline, type VoiceManifest } from "./timeline";

const m = manifest as unknown as VoiceManifest;
const tl = buildTimeline(SCENES, m.lines?.length ? m : null);
const cues = buildCues(tl);

const Film: React.FC = () => <Lesson tl={tl} scenes={SCENES} cues={cues} />;

export const RepublicRoot: React.FC = () => (
  <>
    <Composition id="RepublicFilm" component={Film} durationInFrames={Math.max(1, Math.ceil(tl.duration * FPS))} fps={FPS} width={W} height={H} />
    <Composition id="RepublicShapeSheet" component={ShapeSheet} durationInFrames={40} fps={FPS} width={W} height={H} />
  </>
);
