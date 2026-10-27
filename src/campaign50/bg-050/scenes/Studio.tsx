// Сцена 4 (≈ 30–37 с): ответ 3. Лента прокручивается к мастерской:
// предпринимательница раскладывает войлочные образцы и отвечает. Сверху —
// «3. Өз ишине убакыт» и «Шарттуу мисал».
import { useCurrentFrame } from "remotion";
import { InScene, sceneOf, useScene, useTimeline } from "../context";
import { AnswerLabel, ExampleChip } from "../ui";
import { eveningCam, eveningKeys, EveningWorld } from "../worlds/Evening";
import { studioCam, studioKeys, StudioWorld } from "../worlds/Studio";
import { FeedSwipe, SWIPE } from "./Feed";

export const StudioScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { frames } = useScene();
  const k = studioKeys(tl);
  const ev = sceneOf(tl, "evening");
  const ef = ev.frames + f;
  return (
    <>
      <FeedSwipe
        f={f}
        prev={
          <InScene id="evening">
            <EveningWorld f={ef} />
          </InScene>
        }
        prevCam={eveningCam(ef, eveningKeys(tl))}
        prevBg="#F3E7D6"
        cam={studioCam(f, k)}
        bg="#FBF4EA"
      >
        <InScene id="studio">
          <StudioWorld f={f} />
        </InScene>
      </FeedSwipe>
      <ExampleChip />
      <AnswerLabel n={3} f={f} at={SWIPE - 4} out={frames - 8} />
    </>
  );
};
