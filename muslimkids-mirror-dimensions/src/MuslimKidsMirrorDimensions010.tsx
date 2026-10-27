// MUSLIM KIDS — ЭКСПЕРИМЕНТ 010 «ЗЕРКАЛЬНЫЕ МИРЫ» / «Удивительный мир в отражениях».
import { AbsoluteFill } from "remotion";
import { WORLDS } from "./engines/MirrorDimensionsEngine";
import { sampleCamera } from "./engines/MirrorCameraController";
import { PALETTE } from "./engines/MirrorLightingSystem";
import { WorldCanvas, projectToScreen } from "./compositions/ReflectionSceneComposer";
import { SpaceWorld, SPACE_CAMERA } from "./worlds/SpaceWorld";
import { ValleyMainWorld } from "./worlds/ValleyMainWorld";
import { UniverseWorld } from "./worlds/UniverseWorld";
import { NightWorld } from "./worlds/NightWorld";
import { REVEAL } from "./scenes/Scene03Lake";
import { seg } from "./utils/math";
import { useTexturesReady } from "./utils/textures";
import { Overlay } from "./components/Overlay";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const MuslimKidsMirrorDimensions010: React.FC = () => {
  const ready = useTexturesReady();
  if (!ready) return <AbsoluteFill style={{ backgroundColor: PALETTE.navy }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.navy }}>
      <WorldCanvas from={WORLDS.space.from} to={WORLDS.space.to} render={(t) => <SpaceWorld t={t} />} />
      <WorldCanvas
        from={WORLDS.valley.from}
        to={WORLDS.valley.to}
        mask={(t) => {
          // долина «поднимается» от дальнего края зеркала-озера вверх по кадру
          const far = projectToScreen(sampleCamera(SPACE_CAMERA, t), [0, 0, -1.5]);
          const k = seg(t, REVEAL[0], REVEAL[1]);
          const start = 1 - far.y + 0.04;
          return k >= 1 ? { kind: "none" } : { kind: "vertical", fromTop: false, edge: start + (1.25 - start) * k, soft: 0.06 + 0.18 * k };
        }}
        render={(t) => <ValleyMainWorld t={t} />}
      />
      {/* звёздное небо долины продолжается в небо зеркальной вселенной */}
      <WorldCanvas
        from={WORLDS.universe.from}
        to={WORLDS.universe.to}
        mask={(t) => ({ kind: "opacity", value: seg(t, 37.1, 38.0) })}
        render={(t) => <UniverseWorld t={t} />}
      />
      {/* зеркала складываются — проступает тихое ночное озеро */}
      <WorldCanvas
        from={WORLDS.night.from}
        to={WORLDS.night.to}
        mask={(t) => ({ kind: "opacity", value: seg(t, 55.0, 56.3) })}
        render={(t) => <NightWorld t={t} />}
      />
      <Overlay />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
