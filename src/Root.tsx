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
import { Lesson80_1_7, type Lesson80_1_7Props } from "./Lesson80_1_7";
import { FILM as L817 } from "./lesson80/film-1-7/script";
import { buildTimeline as buildL817, estimateManifest as estimateL817 } from "./lesson80/film-1-7/timeline";
import { loadManifest as loadL817 } from "./lesson80/film-1-7/loadManifest";
import { GlobeCheck } from "./lesson80/film-1-7/GlobeCheck";
import { Lesson80_1_8, type Lesson80_1_8Props } from "./Lesson80_1_8";
import { FILM as L818 } from "./lesson80/film-1-8/script";
import { buildTimeline as buildL818, estimateManifest as estimateL818 } from "./lesson80/film-1-8/timeline";
import { loadManifest as loadL818 } from "./lesson80/film-1-8/loadManifest";
import { Lesson80_1_12, type Lesson80_1_12Props } from "./Lesson80_1_12";
import { FILM as L8112 } from "./lesson80/film-1-12/script";
import { buildTimeline as buildL8112, estimateManifest as estimateL8112 } from "./lesson80/film-1-12/timeline";
import { loadManifest as loadL8112 } from "./lesson80/film-1-12/loadManifest";
import { PuzzleCheck as L8112PuzzleCheck } from "./lesson80/film-1-12/PuzzleCheck";

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
      {/* Урок 80-1, мини-фильм 7 «Почему приходит утро?» (16:9, ≈ 4:30, voice-first). */}
      <Composition
        id={L817.id}
        component={Lesson80_1_7}
        defaultProps={{ manifest: estimateL817(), subtitles: false } satisfies Lesson80_1_7Props}
        calculateMetadata={async ({ props }) => {
          const manifest = await loadL817();
          return { props: { ...props, manifest }, durationInFrames: buildL817(manifest).durationInFrames };
        }}
        durationInFrames={buildL817(estimateL817()).durationInFrames}
        fps={L817.fps}
        width={L817.width}
        height={L817.height}
      />
      {/* Урок 80-1, мини-фильм 12 «Аллах слышит меня?» (16:9, ≈ 4:00, voice-first). */}
      <Composition
        id={L8112.id}
        component={Lesson80_1_12}
        defaultProps={{ manifest: estimateL8112(), subtitles: false } satisfies Lesson80_1_12Props}
        calculateMetadata={async ({ props }) => {
          const manifest = await loadL8112();
          return { props: { ...props, manifest }, durationInFrames: buildL8112(manifest).durationInFrames };
        }}
        durationInFrames={buildL8112(estimateL8112()).durationInFrames}
        fps={L8112.fps}
        width={L8112.width}
        height={L8112.height}
      />
      {/* Урок 80-1, мини-фильм 8 «А кто создал Аллаха?» (16:9, ≈ 4:10, voice-first). */}
      <Composition
        id={L818.id}
        component={Lesson80_1_8}
        defaultProps={{ manifest: estimateL818(), subtitles: false } satisfies Lesson80_1_8Props}
        calculateMetadata={async ({ props }) => {
          const manifest = await loadL818();
          return { props: { ...props, manifest }, durationInFrames: buildL818(manifest).durationInFrames };
        }}
        durationInFrames={buildL818(estimateL818()).durationInFrames}
        fps={L818.fps}
        width={L818.width}
        height={L818.height}
      />
      <Folder name="Dev">
        <Composition id="Lesson80-1-7-GlobeCheck" component={GlobeCheck} durationInFrames={480} fps={30} width={1920} height={1080} />
        <Composition id="Lesson80-1-12-PuzzleCheck" component={L8112PuzzleCheck} durationInFrames={120} fps={30} width={1920} height={1080} />
      </Folder>
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
