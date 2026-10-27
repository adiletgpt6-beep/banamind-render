// Сцена 2 (≈ 6–17 с): ответ 1. Плитка мамы с чертежами из хука
// раскрывается на весь кадр (переход — в начале сцены), мама сворачивает
// незаконченный чертёж и отвечает. После ответа — жёлтый штрих
// «ИШИМДИ БҮТҮРӨМ». Сверху — «1. Ишти аягына чыгаруу» и «Шарттуу мисал».
import { useCurrentFrame } from "remotion";
import { InScene, useScene, useTimeline } from "../context";
import { BG50_TEXT } from "../script";
import { AnswerLabel, BrushStroke, ExampleChip } from "../ui";
import { workCam, workKeys, WorkWorld } from "../worlds/Work";
import { HookExpand } from "./Hook";

export const WorkScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { frames } = useScene();
  const k = workKeys(tl);
  return (
    <>
      <HookExpand f={f} index={0} cam={workCam(f, k)}>
        <InScene id="work">
          <WorkWorld f={f} />
        </InScene>
      </HookExpand>
      <ExampleChip />
      <AnswerLabel n={1} f={f} at={12} out={frames - 8} />
      <BrushStroke text={BG50_TEXT.stroke} f={f} at={k.a01.to + 14} x={170} y={1250} w={740} out={frames - 8} />
    </>
  );
};
