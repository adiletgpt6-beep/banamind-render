import { Composition, staticFile } from "remotion";
import "../../fonts";
import { BalaGo35ProgrammersHardestTask } from "../../BalaGo35ProgrammersHardestTask";
import { PHT_VIDEO } from "../script";
import { estimatePhtManifest, planPht, type PhtManifest } from "../timing";
import { Gallery } from "./Gallery";

// Локальная проверка: фильм с текущим manifest.json без строгой проверки
// актуальности (пока новые дубли ещё синтезируются в CI).
export const DevRoot: React.FC = () => (
  <>
    <Composition id="PhtGallery" component={Gallery} width={1080} height={1920} fps={30} durationInFrames={130} />
    <Composition
      id="PhtDev"
      component={BalaGo35ProgrammersHardestTask}
      width={1080}
      height={1920}
      fps={PHT_VIDEO.fps}
      defaultProps={{ manifest: estimatePhtManifest() }}
      durationInFrames={planPht(estimatePhtManifest()).totalFrames}
      calculateMetadata={async () => {
        const manifest = (await (await fetch(staticFile(`${PHT_VIDEO.voiceDir}/manifest.json`))).json()) as PhtManifest;
        return { props: { manifest }, durationInFrames: planPht(manifest).totalFrames };
      }}
    />
  </>
);
