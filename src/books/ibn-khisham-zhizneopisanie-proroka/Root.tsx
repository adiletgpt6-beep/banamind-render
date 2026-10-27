// Композиции фильма BM-002 «Жизнеописание Пророка Мухаммада» (Ибн Хишам) — канал BanaMind.
// Хронометраж — по озвучке (public/ibn-khisham/voice/manifest.json); без неё — черновые оценки.
import React from "react";
import { Composition } from "remotion";
import "../../fonts";
import manifest from "../../../public/ibn-khisham/voice/manifest.json";
import { buildCues } from "./captions";
import { Film } from "./Film";
import { SCENES } from "./script";
import { FPS, H, W } from "./theme";
import { buildTimeline, type VoiceManifest } from "./timeline";

const m = manifest as unknown as VoiceManifest;
const tl = buildTimeline(SCENES, m.lines?.length ? m : null);
const cues = buildCues(tl);

const FilmComp: React.FC = () => <Film tl={tl} scenes={SCENES} cues={cues} />;

export const FilmRoot: React.FC = () => (
  <Composition id="IbnKhishamFilm" component={FilmComp} durationInFrames={Math.ceil(tl.duration * FPS)} fps={FPS} width={W} height={H} />
);
