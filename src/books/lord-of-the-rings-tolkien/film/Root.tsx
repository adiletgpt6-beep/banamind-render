// Композиции фильма BM-018 «Властелин колец: Музей искушений». Хронометраж — по озвучке
// (public/lotr/voice/manifest.json); без неё — черновые оценки по тексту.
//   LotrFilm  — полный фильм 1920×1080, 30 fps (цель 29:30–30:30)
//   LotrPilot — тестовый пилот: сцены с pilot: true, без растяжки пауз
import React from "react";
import { Composition } from "remotion";
import "../../../fonts";
import manifest from "../../../../public/lotr/voice/manifest.json";
import { buildCues } from "./captions";
import { Film } from "./Film";
import { PILOT_SCENES, SCENES } from "./script";
import { FPS, H, W } from "./theme";
import { buildTimeline, type VoiceManifest } from "./timeline";

const m = manifest as unknown as VoiceManifest;
const voice = m.lines?.length ? m : null;
const tl = buildTimeline(SCENES, voice);
const cues = buildCues(tl);
const ptl = buildTimeline(PILOT_SCENES, voice, 0);
const pcues = buildCues(ptl);

const FilmComp: React.FC = () => <Film tl={tl} scenes={SCENES} cues={cues} />;
const PilotComp: React.FC = () => <Film tl={ptl} scenes={PILOT_SCENES} cues={pcues} />;

export const LotrRoot: React.FC = () => (
  <>
    <Composition id="LotrFilm" component={FilmComp} durationInFrames={Math.ceil(tl.duration * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="LotrPilot" component={PilotComp} durationInFrames={Math.ceil(ptl.duration * FPS)} fps={FPS} width={W} height={H} />
  </>
);
