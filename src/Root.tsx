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
  BalaGo34ExtraLine,
  type BalaGo34ExtraLineProps,
} from "./BalaGo34ExtraLine";
import {
  loadElManifest,
  loadElPreviewManifest,
} from "./extra-line-34/loadManifest";
import { EL_VIDEO } from "./extra-line-34/script";
import { buildElTimeline, estimateElManifest } from "./extra-line-34/timing";
import { El34DevSheets } from "./extra-line-34/dev";

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
      {/* №34 «Жарыядагы ашыкча сап» (Лишняя строка в объявлении), 2D.
          Длительность — по фактической речи (timing.ts). Финальный рендер
          требует полной озвучки; preview: true — черновые кадры (готовые
          реплики + оценка недостающих). */}
      <Composition
        id={EL_VIDEO.id}
        component={BalaGo34ExtraLine}
        defaultProps={
          {
            manifest: estimateElManifest(),
            preview: false,
          } satisfies BalaGo34ExtraLineProps
        }
        calculateMetadata={async ({ props }) => {
          const manifest = props.preview
            ? await loadElPreviewManifest()
            : await loadElManifest();
          return {
            props: { ...props, manifest },
            durationInFrames: buildElTimeline(manifest).frames,
          };
        }}
        durationInFrames={buildElTimeline(estimateElManifest()).frames}
        fps={EL_VIDEO.fps}
        width={EL_VIDEO.width}
        height={EL_VIDEO.height}
      />
      <El34DevSheets />
      <Folder name="Scenes">
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
