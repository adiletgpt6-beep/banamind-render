import { AbsoluteFill, Composition, Folder } from "remotion";
import { BalaGoPromo, type BalaGoPromoProps } from "./BalaGoPromo";
import { loadVoiceClips } from "./Soundtrack";
import { Background } from "./components/Background";
import { SCENES, TOTAL_FRAMES, VIDEO } from "./config";
import { CarScene } from "./scenes/CarScene";
import { CtaScene } from "./scenes/CtaScene";
import { DriverScene } from "./scenes/DriverScene";
import { HookScene } from "./scenes/HookScene";
import { RouteScene } from "./scenes/RouteScene";

if (TOTAL_FRAMES !== VIDEO.durationInFrames) {
  throw new Error(
    `Сумма сцен (${TOTAL_FRAMES}) не равна длительности ролика (${VIDEO.durationInFrames}). Проверьте SCENES в src/config.ts.`,
  );
}

// Отдельные сцены для удобного просмотра в Studio (папка Scenes) —
// на том же белом фоне, что и в основном ролике.
const ScenePreview: React.FC<{ readonly scene: React.FC }> = ({
  scene: Scene,
}) => (
  <AbsoluteFill>
    <Background />
    <Scene />
  </AbsoluteFill>
);

const HookPreview: React.FC = () => <ScenePreview scene={HookScene} />;
const RoutePreview: React.FC = () => <ScenePreview scene={RouteScene} />;
const DriverPreview: React.FC = () => <ScenePreview scene={DriverScene} />;
const CarPreview: React.FC = () => <ScenePreview scene={CarScene} />;
const CtaPreview: React.FC = () => <ScenePreview scene={CtaScene} />;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={VIDEO.id}
        component={BalaGoPromo}
        defaultProps={{ voice: [] } satisfies BalaGoPromoProps}
        calculateMetadata={async ({ props }) => ({
          props: { ...props, voice: await loadVoiceClips() },
        })}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Folder name="Scenes">
        <Composition
          id="Scene1-Hook"
          component={HookPreview}
          durationInFrames={SCENES.hook}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Scene2-Route"
          component={RoutePreview}
          durationInFrames={SCENES.route}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Scene3-Driver"
          component={DriverPreview}
          durationInFrames={SCENES.driver}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Scene4-Car"
          component={CarPreview}
          durationInFrames={SCENES.car}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        <Composition
          id="Scene5-Cta"
          component={CtaPreview}
          durationInFrames={SCENES.cta}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
      </Folder>
    </>
  );
};
