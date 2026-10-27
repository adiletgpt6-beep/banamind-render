// Сцена 3 (≈ 17–30 с): ответ 2. Лента прокручивается от мамы с чертежами
// к вечерней сцене: папа с поделкой придвигает стул к сыну и отвечает;
// сын просит на «сиз»; папа садится рядом. Сверху — «2. Үй-бүлөгө көңүл
// буруу» и «Шарттуу мисал».
import { useCurrentFrame } from "remotion";
import { InScene, sceneOf, useScene, useTimeline } from "../context";
import { AnswerLabel, ExampleChip } from "../ui";
import { eveningCam, eveningKeys, EveningWorld } from "../worlds/Evening";
import { workCam, workKeys, WorkWorld } from "../worlds/Work";
import { FeedSwipe, SWIPE } from "./Feed";

export const EveningScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { frames } = useScene();
  const k = eveningKeys(tl);
  const work = sceneOf(tl, "work");
  const wf = work.frames + f;
  return (
    <>
      <FeedSwipe
        f={f}
        prev={
          <InScene id="work">
            <WorkWorld f={wf} />
          </InScene>
        }
        prevCam={workCam(wf, workKeys(tl))}
        prevBg="#F6F8FC"
        cam={eveningCam(f, k)}
        bg="#F3E7D6"
      >
        <InScene id="evening">
          <EveningWorld f={f} />
        </InScene>
      </FeedSwipe>
      <ExampleChip />
      <AnswerLabel n={2} f={f} at={SWIPE - 4} out={frames - 8} />
    </>
  );
};
