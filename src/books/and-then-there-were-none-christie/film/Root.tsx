// Композиции BM-017. Хронометраж — по озвучке (public/books/<slug>/voice/manifest.json);
// без неё — черновые оценки длительности реплик.
import React from "react";
import { Composition } from "remotion";
import "../../../fonts";
import manifest from "../../../../public/books/and-then-there-were-none-christie/voice/manifest.json";
import { buildCues } from "./captions";
import { Film } from "./Film";
import { SCENES } from "./script";
import { buildTimeline, FPS, type VoiceManifest } from "./timeline";

const m = manifest as unknown as VoiceManifest;
const tl = buildTimeline(SCENES, m.lines?.length ? m : null);
const cues = buildCues(tl);

const Pilot: React.FC = () => <Film tl={tl} scenes={SCENES} cues={cues} />;

export const FilmRoot: React.FC = () => (
  <Composition id="ChristiePilot" component={Pilot} durationInFrames={Math.ceil(tl.duration * FPS)} fps={FPS} width={1920} height={1080} />
);
