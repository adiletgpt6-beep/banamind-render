import { AbsoluteFill, Composition, Folder } from "remotion";
import {
  BalaGoDriverIntro,
  type BalaGoDriverIntroProps,
} from "./BalaGoDriverIntro";
import {
  BalaGoHowItWorks,
  type BalaGoHowItWorksProps,
} from "./BalaGoHowItWorks";
import {
  BalaGoFounderStory,
  type BalaGoFounderStoryProps,
} from "./BalaGoFounderStory";
import {
  BalaGoTripQuestions,
  type BalaGoTripQuestionsProps,
} from "./BalaGoTripQuestions";
import {
  BalaGoMorningRush,
  type BalaGoMorningRushProps,
} from "./BalaGoMorningRush";
import { BalaGoPromo, type BalaGoPromoProps } from "./BalaGoPromo";
import { loadNarration } from "./Soundtrack";
import { Background } from "./components/Background";
import { VIDEO, VIDEOS } from "./config";
import { BrandScene } from "./scenes/BrandScene";
import { CarScene } from "./scenes/CarScene";
import { CtaScene } from "./scenes/CtaScene";
import { DriverScene } from "./scenes/DriverScene";
import { HookScene } from "./scenes/HookScene";
import { PromiseScene } from "./scenes/PromiseScene";
import { RouteScene } from "./scenes/RouteScene";
import {
  BalaGoMorningStory,
  type BalaGoMorningStoryProps,
} from "./BalaGoMorningStory";
import { loadStoryManifest } from "./morning-story/loadManifest";
import { MS_VIDEO } from "./morning-story/script";
import {
  buildStoryTimeline,
  estimateStoryManifest,
} from "./morning-story/storyTimeline";
import { buildTimeline, estimateManifest } from "./timeline";
import {
  BalaGoTwoSchedules2D,
  type BalaGoTwoSchedules2DProps,
} from "./BalaGoTwoSchedules2D";
import { loadTs2Manifest } from "./two-schedules-2d/loadManifest";
import { TS2_FRAMES, TS2_VIDEO } from "./two-schedules-2d/script";
import { estimateTs2Manifest } from "./two-schedules-2d/timing";
import {
  BalaGoMeeting1320,
  type BalaGoMeeting1320Props,
} from "./BalaGoMeeting1320";
import {
  loadM13Manifest,
  loadM13PreviewManifest,
} from "./meeting-1320/loadManifest";
import { M13_VIDEO } from "./meeting-1320/script";
import { CharacterSheet as M13CharacterSheet } from "./meeting-1320/CharacterSheet";
import { LabOffice as M13LabOffice } from "./meeting-1320/lab/LabOffice";
import { LabOutdoor as M13LabOutdoor } from "./meeting-1320/lab/LabOutdoor";
import { LabHome as M13LabHome } from "./meeting-1320/lab/LabHome";
import { LabCast as M13LabCast } from "./meeting-1320/lab/LabCast";
import {
  buildM13Timeline,
  estimateM13Manifest,
} from "./meeting-1320/timing";

// Отдельные сцены для просмотра в Studio (папка Scenes) — на том же фоне.
// Их длительность берётся из оценочного монтажа.
const preview = buildTimeline(estimateManifest());
const sceneLength = (id: string) =>
  preview.scenes.find((s) => s.id === id)?.durationInFrames ?? 120;

const ScenePreview: React.FC<{ readonly scene: React.FC }> = ({
  scene: Scene,
}) => (
  <AbsoluteFill>
    <Background />
    <Scene />
  </AbsoluteFill>
);

const HookPreview: React.FC = () => <ScenePreview scene={HookScene} />;
const BrandPreview: React.FC = () => <ScenePreview scene={BrandScene} />;
const RoutePreview: React.FC = () => <ScenePreview scene={RouteScene} />;
const DriverPreview: React.FC = () => <ScenePreview scene={DriverScene} />;
const CarPreview: React.FC = () => <ScenePreview scene={CarScene} />;
const PromisePreview: React.FC = () => <ScenePreview scene={PromiseScene} />;
const CtaPreview: React.FC = () => <ScenePreview scene={CtaScene} />;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={VIDEO.id}
        component={BalaGoPromo}
        defaultProps={
          { manifest: estimateManifest() } satisfies BalaGoPromoProps
        }
        calculateMetadata={async ({ props }) => {
          const manifest = await loadNarration();
          const timeline = buildTimeline(manifest, VIDEO.fps);
          return {
            props: { ...props, manifest },
            durationInFrames: timeline.durationInFrames,
          };
        }}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id={VIDEOS["driver-intro"].id}
        component={BalaGoDriverIntro}
        defaultProps={
          {
            manifest: estimateManifest(VIDEOS["driver-intro"].narration),
          } satisfies BalaGoDriverIntroProps
        }
        calculateMetadata={async ({ props }) => {
          const spec = VIDEOS["driver-intro"];
          const manifest = await loadNarration(spec.voiceDir, spec.narration);
          const timeline = buildTimeline(manifest, VIDEO.fps, spec.scenePlan);
          return {
            props: { ...props, manifest },
            durationInFrames: timeline.durationInFrames,
          };
        }}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id={VIDEOS["how-it-works"].id}
        component={BalaGoHowItWorks}
        defaultProps={
          {
            manifest: estimateManifest(VIDEOS["how-it-works"].narration),
          } satisfies BalaGoHowItWorksProps
        }
        calculateMetadata={async ({ props }) => {
          const spec = VIDEOS["how-it-works"];
          const manifest = await loadNarration(spec.voiceDir, spec.narration);
          const timeline = buildTimeline(
            manifest,
            VIDEO.fps,
            spec.scenePlan,
            spec.timing,
          );
          return {
            props: { ...props, manifest },
            durationInFrames: timeline.durationInFrames,
          };
        }}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id={VIDEOS["morning-rush"].id}
        component={BalaGoMorningRush}
        defaultProps={
          {
            manifest: estimateManifest(VIDEOS["morning-rush"].narration),
          } satisfies BalaGoMorningRushProps
        }
        calculateMetadata={async ({ props }) => {
          const spec = VIDEOS["morning-rush"];
          const manifest = await loadNarration(spec.voiceDir, spec.narration);
          const timeline = buildTimeline(
            manifest,
            VIDEO.fps,
            spec.scenePlan,
            spec.timing,
          );
          return {
            props: { ...props, manifest },
            durationInFrames: timeline.durationInFrames,
          };
        }}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id={VIDEOS["founder-story"].id}
        component={BalaGoFounderStory}
        defaultProps={
          {
            manifest: estimateManifest(VIDEOS["founder-story"].narration),
          } satisfies BalaGoFounderStoryProps
        }
        calculateMetadata={async ({ props }) => {
          const spec = VIDEOS["founder-story"];
          const manifest = await loadNarration(spec.voiceDir, spec.narration);
          const timeline = buildTimeline(
            manifest,
            VIDEO.fps,
            spec.scenePlan,
            spec.timing,
          );
          return {
            props: { ...props, manifest },
            durationInFrames: timeline.durationInFrames,
          };
        }}
        durationInFrames={60 * VIDEO.fps}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id={VIDEOS["trip-questions"].id}
        component={BalaGoTripQuestions}
        defaultProps={
          {
            manifest: estimateManifest(VIDEOS["trip-questions"].narration),
          } satisfies BalaGoTripQuestionsProps
        }
        calculateMetadata={async ({ props }) => {
          const spec = VIDEOS["trip-questions"];
          const manifest = await loadNarration(spec.voiceDir, spec.narration);
          const timeline = buildTimeline(
            manifest,
            VIDEO.fps,
            spec.scenePlan,
            spec.timing,
          );
          return {
            props: { ...props, manifest },
            durationInFrames: timeline.durationInFrames,
          };
        }}
        durationInFrames={60 * VIDEO.fps}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id={MS_VIDEO.id}
        component={BalaGoMorningStory}
        defaultProps={
          {
            manifest: estimateStoryManifest(),
          } satisfies BalaGoMorningStoryProps
        }
        calculateMetadata={async ({ props }) => {
          const manifest = await loadStoryManifest();
          const timeline = buildStoryTimeline(manifest, MS_VIDEO.fps);
          return {
            props: { ...props, manifest },
            durationInFrames: timeline.durationInFrames,
          };
        }}
        durationInFrames={180 * MS_VIDEO.fps}
        fps={MS_VIDEO.fps}
        width={MS_VIDEO.width}
        height={MS_VIDEO.height}
      />
      {/* Двенадцатый ролик в 2D: «У двоих детей — разное расписание» — ровно 120 с. */}
      <Composition
        id={TS2_VIDEO.id}
        component={BalaGoTwoSchedules2D}
        defaultProps={
          { manifest: estimateTs2Manifest() } satisfies BalaGoTwoSchedules2DProps
        }
        calculateMetadata={async ({ props }) => ({
          props: { ...props, manifest: await loadTs2Manifest() },
        })}
        durationInFrames={TS2_FRAMES}
        fps={TS2_VIDEO.fps}
        width={TS2_VIDEO.width}
        height={TS2_VIDEO.height}
      />
      {/* Фильм №31 в 2D: «13:20дагы жолугушуу» — длительность по
          фактической речи, карточка с контактами неподвижна ≥ 5 с.
          Финальный рендер требует полной озвучки; preview: true — только
          для черновых кадров. */}
      <Composition
        id={M13_VIDEO.id}
        component={BalaGoMeeting1320}
        defaultProps={
          {
            manifest: estimateM13Manifest(),
            preview: false,
          } satisfies BalaGoMeeting1320Props
        }
        calculateMetadata={async ({ props }) => {
          const manifest = props.preview
            ? await loadM13PreviewManifest()
            : await loadM13Manifest();
          return {
            props: { ...props, manifest },
            durationInFrames: buildM13Timeline(manifest).frames,
          };
        }}
        durationInFrames={buildM13Timeline(estimateM13Manifest()).frames}
        fps={M13_VIDEO.fps}
        width={M13_VIDEO.width}
        height={M13_VIDEO.height}
      />
      <Folder name="Scenes">
        {/* №31: рабочий лист героев (виды и позы), не кадр фильма */}
        <Composition
          id="M13CharacterSheet"
          component={M13CharacterSheet}
          durationInFrames={30}
          fps={M13_VIDEO.fps}
          width={M13_VIDEO.width}
          height={M13_VIDEO.height}
        />
        <Composition
          id="M13LabOffice"
          component={M13LabOffice}
          durationInFrames={600}
          fps={M13_VIDEO.fps}
          width={M13_VIDEO.width}
          height={M13_VIDEO.height}
        />
        <Composition
          id="M13LabOutdoor"
          component={M13LabOutdoor}
          durationInFrames={600}
          fps={M13_VIDEO.fps}
          width={M13_VIDEO.width}
          height={M13_VIDEO.height}
        />
        <Composition
          id="M13LabHome"
          component={M13LabHome}
          durationInFrames={600}
          fps={M13_VIDEO.fps}
          width={M13_VIDEO.width}
          height={M13_VIDEO.height}
        />
        <Composition
          id="M13LabCast"
          component={M13LabCast}
          durationInFrames={600}
          fps={M13_VIDEO.fps}
          width={M13_VIDEO.width}
          height={M13_VIDEO.height}
        />
        <Composition
          id="Scene1-Hook"
          component={HookPreview}
          durationInFrames={sceneLength("hook")}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Scene2-Brand"
          component={BrandPreview}
          durationInFrames={sceneLength("brand")}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Scene3-Route"
          component={RoutePreview}
          durationInFrames={sceneLength("route")}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Scene4-Driver"
          component={DriverPreview}
          durationInFrames={sceneLength("driver")}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Scene5-Car"
          component={CarPreview}
          durationInFrames={sceneLength("car")}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Scene6-Promise"
          component={PromisePreview}
          durationInFrames={sceneLength("promise")}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Scene7-Cta"
          component={CtaPreview}
          durationInFrames={sceneLength("cta")}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
      </Folder>
    </>
  );
};
