// Сцена 5 (≈43–53 с): как это начинается — честно и по шагам. На экране
// телефона: 1) адрес и время → «Арыз калтыруу» → заявка принята;
// 2) подбор совместимой группы (3–4 ребёнка, до 2 недель) — идёт поиск;
// 3) первая полная пробная поездка ҮЙ → МЕКТЕП → ҮЙ бесплатно — после
// формирования группы. Карточки появляются вместе со словами диктора.
// Диктор: «Дарек менен убакытты бересиз. Ылайыктуу топ түзүлсө, биринчи
// толук сыноо сапары акысыз өтөт.»
import { useCurrentFrame } from "remotion";
import { useScene, useTimeline } from "../context";
import { LOOKS } from "../rig/looks";
import { HoldingHand, PhoneFrame, StepsScreen, TapFinger } from "../screens";
import { BG7_VIDEO } from "../script";

export const StepsScene: React.FC = () => {
  const f = useCurrentFrame();
  const { from } = useScene();
  const { cues } = useTimeline();
  const n04 = cues.find((c) => c.id === "n04")!;
  // начало слов 0 («Дарек»), 4 («Ылайыктуу»), 7 («биринчи»)
  const w = (i: number, fallback: number) => Math.round(((n04.words[i]?.start ?? n04.from + fallback) - 0.25) * BG7_VIDEO.fps) - from;
  const at: [number, number, number] = [Math.max(4, w(0, 0)), w(4, 2.3), w(7, 4.0)];
  const tapAt = Math.min(at[0] + 44, at[1] - 6);
  const dad = LOOKS.dad;
  const y = 140;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "radial-gradient(circle at 50% 35%, #F1E4CF 0%, #D9C2A0 80%)" }}>
      <PhoneFrame x={230} y={y} w={620} tilt={-1.5}>
        <StepsScreen f={f} at={at} tapAt={tapAt} />
      </PhoneFrame>
      <HoldingHand x={230} y={y} w={620} sleeve={dad.topColor} skin={dad.skin} />
      <TapFinger x={540} y={y + 22 + 176 + 225} f={f} tapAt={tapAt} skin={dad.skin} />
    </div>
  );
};
