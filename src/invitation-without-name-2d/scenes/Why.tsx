// Сцена 8. Почему он не попросил. Общий план двоих: сын смотрит на лист,
// затем на папу (пауза перед ответом). S02 целиком: на «Анан…» — спокойный
// крупный план мальчика; на «ашыкча…» — реакция папы: он слушает, рот
// закрыт, взгляд на сыне, брови мягко поднимаются. Без рассказчика, плашек
// и громкой музыки. В паузах (после «чыгасың», «кайтасың», «сурансам»)
// мальчик опускает глаза и снова поднимает.
import { keys } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { HomeShot, SON_AT } from "./HomeShot";
import { DAD_SEATED, dadSeated, SheetOnTable, sonSeated } from "./HomeCast";

export const whyPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "why");
  return {
    s02: T.from("S02"),
    look: [8, 34] as const, // на лист, затем на папу
    anan: T.word("S02", "Анан") - 4,
    dagy: T.word("S02", "Дагы"),
    ashyk: T.word("S02", "ашыкча") - 4,
    oil: T.word("S02", "ойлодум"),
    s02End: T.to("S02"),
    len: T.len,
  };
};

export const WhyScene: React.FC = () => {
  const { f } = useScene("why");
  const p = usePlan(whyPlan);
  const sonPose = (tt: number) =>
    sonSeated({
      expr: tt < p.dagy ? { browIn: 4, browOut: 0, lid: 0.12, smile: 0 } : { browIn: 6, browOut: -1, lid: 0.18, smile: -0.08 },
      // на лист → на папу; на «Дагы бир жолу…» — глаза вниз; на «ойлодум» — снова на папу
      lookY: tt < p.look[1] ? keys(tt, [[p.look[0], 0.2], [p.look[0] + 8, 0.7], [p.look[1] - 6, 0.7], [p.look[1], 0.05]]) : tt < p.dagy ? 0.05 : tt < p.oil - 4 ? keys(tt, [[p.dagy, 0.05], [p.dagy + 10, 0.55]]) : keys(tt, [[p.oil - 4, 0.55], [p.oil + 6, 0.05]]),
      lookX: 0.5,
      nod: tt >= p.dagy && tt < p.oil ? 4 : 1,
      shoulders: 0.2,
    });
  const dadPose = (tt: number) =>
    dadSeated({
      expr: tt < p.ashyk ? "calm" : { browIn: 6, browOut: 0, lid: 0.12, smile: 0.05 },
      lookY: 0.12,
      lookX: -0.25,
      nod: keys(tt, [[p.ashyk + 20, 0], [p.ashyk + 30, 3], [p.ashyk + 46, 1]]),
    });
  const cam =
    f < p.anan
      ? { x: 655, y: 1060, zoom: 2.2 }
      : f < p.ashyk
        ? { x: SON_AT.x + 30, y: 1050, zoom: keys(f, [[p.anan, 3.1], [p.ashyk, 3.25]]) }
        : { x: DAD_SEATED.x - 30, y: 990, zoom: keys(f, [[p.ashyk, 3.0], [p.len, 3.12]]) };
  return (
    <HomeShot
      f={f}
      cam={cam}
      chairs={[{ x: SON_AT.x }, { x: DAD_SEATED.x }]}
      actors={[
        { uid: "w8-son", look: "emir", place: () => SON_AT, face: () => 0.4, pose: sonPose, role: "son", seed: 4, blinkShift: 37 },
        { uid: "w8-dad", look: "azamat", place: () => DAD_SEATED, face: () => -0.45, pose: dadPose, role: "father", seed: 2 },
      ]}
      onTable={<SheetOnTable />}
    />
  );
};
