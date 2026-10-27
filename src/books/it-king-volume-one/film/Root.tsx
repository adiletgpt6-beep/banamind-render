// Композиции BM-020. Хронометраж — по озвучке (public/it-king/voice/manifest.json);
// без неё — черновые оценки. ItPilot — пилот 30–60 с (сцены PILOT, без растяжки).
import React from "react";
import { Composition } from "remotion";
import "../../../fonts";
import manifest from "../../../../public/it-king/voice/manifest.json";
import { buildCues } from "./captions";
import { Film } from "./Film";
import { PILOT, SCENES } from "./script";
import { FPS, H, W } from "./theme";
import { buildTimeline, type VoiceManifest } from "./timeline";

const m = manifest as unknown as VoiceManifest;
const voiced = m.lines?.length ? m : null;
const tl = buildTimeline(SCENES, voiced);
const cues = buildCues(tl);
const pilotScenes = SCENES.filter((s) => PILOT.includes(s.id));
const ptl = buildTimeline(pilotScenes, voiced, 0);
const pcues = buildCues(ptl);

const FilmComp: React.FC = () => <Film tl={tl} scenes={SCENES} cues={cues} />;
const PilotComp: React.FC = () => <Film tl={ptl} scenes={pilotScenes} cues={pcues} />;

export const ItRoot: React.FC = () => (
  <>
    <Composition id="ItVolumeOne" component={FilmComp} durationInFrames={Math.ceil(tl.duration * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="ItPilot" component={PilotComp} durationInFrames={Math.ceil(ptl.duration * FPS)} fps={FPS} width={W} height={H} />
  </>
);
