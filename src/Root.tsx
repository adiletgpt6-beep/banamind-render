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
import { buildTimeline, estimateManifest } from "./timeline";

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
