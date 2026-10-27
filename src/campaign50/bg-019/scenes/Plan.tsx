// Сцена 4: мама сама организует повторяющееся дело.
// Диктор: «Кайталанган ишти күн сайын башынан чечпей, алдын ала уюштуруу
// мүмкүнчүлүгүн караңыз.»
//
// Телефон в её руке: новый пункт «Мектеп каттамы», повтор Дүйшөмбү –
// Жума, маршрут Үй → Мектеп → Үй → «Сактоо» — неделя становится
// спокойной. Короткий план мамы (решение принято), затем она ищет
// «Бишкек балдар үчүн такси» и открывает BalaGo. Линия маршрута на
// странице продолжается в карту следующей сцены.
import { useCurrentFrame } from "remotion";
import { HoldingHand, PhoneFrame } from "../../../two-schedules-2d/screens";
import { LOOKS } from "../../../two-schedules-2d/rig/looks";
import { clamp, easeInOut, keys } from "../../../two-schedules-2d/rig/motion";
import { box, Panel, useSceneFrames } from "../context";
import { BalaGoScreen, NewEventScreen, SearchScreen, WeekScreen } from "../screens";
import { handOnDesk, MOM_LOOK, Office } from "./common";

export const PLAN = {
  fills: [8, 30, 52],
  save: 80,
  week: 88,
  mom: 132, // короткий план мамы
  search: 168,
  typeTo: 206,
  tap: 228,
  page: 238,
} as const;

export const PlanScene: React.FC = () => {
  const f = useCurrentFrame();
  const dur = useSceneFrames("plan");
  const sleeve = LOOKS.mom.topColor;
  const skin = LOOKS.mom.skin;
  // вход: телефон поднимается снизу; выход: приближение к маршруту
  const enter = easeInOut(f / 12);
  const out = easeInOut((f - (dur - 16)) / 16);
  const momShot = f >= PLAN.mom && f < PLAN.search;
  const screen =
    f < PLAN.week ? (
      <NewEventScreen f={f} fills={PLAN.fills} saveAt={PLAN.save} />
    ) : f < PLAN.search ? (
      <WeekScreen f={f} lit={[PLAN.week - 20, PLAN.week - 18, PLAN.week - 16, PLAN.week - 14, PLAN.week - 12]} planned={1} />
    ) : f < PLAN.page ? (
      <SearchScreen f={f} typeFrom={PLAN.search + 6} typeTo={PLAN.typeTo} tapAt={PLAN.tap} />
    ) : (
      <BalaGoScreen f={f} at={PLAN.page} />
    );
  const momPose = (t: number) => ({
    expr: "softSmile" as const,
    nod: keys(t, [[PLAN.mom + 8, 0], [PLAN.mom + 16, 5], [PLAN.mom + 26, 0]]),
    lookY: 0.45,
    armR: { target: MOM_LOOK, shape: "phone" as const, item: "phone" as const, glow: 1, itemTilt: 4, elbow: "down" as const, behind: false },
    armL: handOnDesk(-1),
  });
  // крупный план мамы: решение принято (кивок, улыбка)
  const momCam = { x: 690, y: 960, zoom: 2.15 + 0.08 * clamp((f - PLAN.mom) / 36) };
  // масштаб телефона на выходе: к карточке маршрута
  const zoom = 1 + 1.6 * out;
  return (
    <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 35%, #F7F9FC, #D6DEE8)" })}>
      {momShot ? (
        <Panel top={0} height={1920} cam={momCam} bg="#E8EEF4">
          <Office uid="p4" f={f} mom={momPose} face={() => 0.3} phoneOnDesk={false} />
        </Panel>
      ) : (
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, translate: `0 ${(1 - enter) * 300}px`, scale: `${zoom}`, transformOrigin: "540px 1010px" })}>
          <PhoneFrame x={180} y={230} w={720}>
            {screen}
          </PhoneFrame>
          <HoldingHand x={180} y={230} w={720} sleeve={sleeve} skin={skin} />
        </div>
      )}
    </div>
  );
};
