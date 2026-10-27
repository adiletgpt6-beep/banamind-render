// Композиции фильма «Sapiens» (BanaMind). Хронометраж — по озвучке
// (public/lesson-sapiens/voice/manifest.json); без неё — черновые оценки.
import React from "react";
import { Composition } from "remotion";
import "../fonts";
import manifest from "../../public/lesson-sapiens/voice/manifest.json";
import { buildCues } from "./captions";
import { PoseSheet } from "./dev/PoseSheet";
import { Lesson } from "./Lesson";
import { SCENES } from "./script";
import { FPS, H, W } from "./theme";
import { buildTimeline, type VoiceManifest } from "./timeline";

const m = manifest as unknown as VoiceManifest;
const tl = buildTimeline(SCENES, m.lines?.length ? m : null);
const cues = buildCues(tl);

const LessonComp: React.FC = () => <Lesson tl={tl} scenes={SCENES} cues={cues} />;

export const LessonRoot: React.FC = () => (
  <>
    <Composition id="SapiensLesson" component={LessonComp} durationInFrames={Math.ceil(tl.duration * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="BananaPoseSheet" component={PoseSheet} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);
