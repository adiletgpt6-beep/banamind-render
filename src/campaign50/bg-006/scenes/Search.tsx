// Сцена 4 (31–41,5 с). Субъективная камера: мама сама набирает запрос
// «Балдарды мектепке уюштурулган жеткирүү Бишкек», открывает BalaGo и
// читает порядок «Дарек → Мектеп → Убакыт». Затем общий план: мама у
// экрана, и слайд её презентации перестраивается в схему маршрута
// ҮЙ → МЕКТЕП → ҮЙ (столбики проекта превращаются в точки маршрута).
// Диктор: «BalaGo — Бишкекте балдарды үйдөн мектепке, кайра үйгө
// жеткирүү үчүн уюштурулган кызмат.»
import { useCurrentFrame } from "remotion";
import type { PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, easeInOut, keys, keysV } from "../rig/motion";
import { B6_TEXT } from "../script";
import { HoldBack, HoldFront, BalaGoPage, PhoneFrame, SearchScreen, TapFinger } from "../screens";
import { OFFICE } from "../sets/Office";
import { box, camMove, Shot } from "../shots";
import { H, restOnTable, seated, seatOf } from "./common";
import { OfficeWorld } from "./OfficeWorld";

export const SEARCH = { typeFrom: 8, typeTo: 64, result: 70, tap: 100, page: 108, steps: 140, wide: 200, morph: 212, morphEnd: 272 };
const MOM = { x: OFFICE.mom.x, y: OFFICE.mom.y, h: H.mom };
const COL = seated("colleague", OFFICE.seat.colleague);
const SCREEN_PT = { x: OFFICE.screen.x + 140, y: OFFICE.screen.y + 160 };

export const SearchScene: React.FC = () => {
  const f = useCurrentFrame();
  const ph = { x: 220, y: 110, w: 640 };
  const k = ph.w / 700;
  const mom = LOOKS.mom;
  // кончик пальца: к клавиатуре (печать), к результату, к шагам
  const tip = keysV(f, [
    [SEARCH.typeFrom, { x: ph.x + 380 * k, y: ph.y + 1100 * k }],
    [SEARCH.typeTo, { x: ph.x + 330 * k, y: ph.y + 1100 * k }],
    [SEARCH.tap - 12, { x: ph.x + 360 * k, y: ph.y + 400 * k }],
    [SEARCH.tap, { x: ph.x + 360 * k, y: ph.y + 380 * k }],
    [SEARCH.tap + 16, { x: ph.x + 600 * k, y: 1700 }],
  ]);
  const typing = f >= SEARCH.typeFrom && f < SEARCH.typeTo ? Math.abs(Math.sin(f * 0.9)) : 0;
  const press = f >= SEARCH.tap - 3 && f <= SEARCH.tap + 4 ? 1 : typing;
  const fingerOn = 1 - easeInOut((f - (SEARCH.tap + 10)) / 12);
  const momPose = (t: number): PoseIn => ({
    expr: t < SEARCH.morphEnd ? "thinking" : "softSmile",
    armL: { target: { x: MOM.x - 60, y: MOM.y - 0.55 * MOM.h }, shape: "phone", item: "phone", glow: 1, elbow: "down", itemTilt: -8 },
    armR: {
      target: keysV(t, [[SEARCH.wide, { x: MOM.x + 80, y: MOM.y - 0.45 * MOM.h }], [SEARCH.morph, SCREEN_PT], [SEARCH.morphEnd, { x: SCREEN_PT.x + 300, y: SCREEN_PT.y }], [SEARCH.morphEnd + 20, { x: MOM.x + 80, y: MOM.y - 0.45 * MOM.h }]], anticipate),
      shape: t > SEARCH.morph - 6 && t < SEARCH.morphEnd + 6 ? "point" : "relax",
      elbow: "out",
    },
    lookY: keys(t, [[SEARCH.wide, 0.6], [SEARCH.morph - 6, 0.6], [SEARCH.morph + 4, -0.1]]),
  });
  const momFace = (t: number) => keys(t, [[SEARCH.wide, -0.2], [SEARCH.morph - 4, -0.2], [SEARCH.morph + 6, 0.55], [SEARCH.morphEnd + 20, 0.5], [SEARCH.morphEnd + 36, -0.3]]);
  const route = easeInOut((f - SEARCH.morph) / (SEARCH.morphEnd - SEARCH.morph));
  return (
    <>
      <Shot
        f={f}
        from={0}
        to={SEARCH.wide}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 40%, #F3F5F8, #C9D2DD)" })}>
            <HoldBack x={ph.x} y={ph.y} w={ph.w} sleeve={mom.topColor} skin={mom.skin} />
            <PhoneFrame x={ph.x} y={ph.y + Math.sin(f / 28) * 4} w={ph.w} tilt={-1}>
              {f < SEARCH.page ? (
                <SearchScreen f={f} typeFrom={SEARCH.typeFrom} typeTo={SEARCH.typeTo} resultAt={SEARCH.result} tapAt={SEARCH.tap} />
              ) : (
                <BalaGoPage f={f} at={SEARCH.page} stepsAt={SEARCH.steps} />
              )}
            </PhoneFrame>
            <HoldFront x={ph.x} y={ph.y} w={ph.w} skin={mom.skin} />
            {/* клавиатура при наборе */}
            {f < SEARCH.result + 4 ? (
              <div style={box({ left: ph.x + 24 * k, top: ph.y + 900 * k, width: 652 * k, height: 470 * k, backgroundColor: "#D7DCE4", borderRadius: 18, opacity: 1 - easeInOut((f - SEARCH.result) / 6) })}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} style={box({ left: 14 + (i % 10) * 58, top: 18 + Math.floor(i / 10) * 96, width: 50, height: 80, borderRadius: 10, backgroundColor: "#FFFFFF", opacity: Math.floor(f / 3) % 30 === i ? 0.6 : 1 })} />
                ))}
              </div>
            ) : null}
            {fingerOn > 0.01 ? <TapFinger x={tip.x} y={tip.y + (1 - fingerOn) * 500} sleeve={mom.topColor} skin={mom.skin} press={press} /> : null}
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={SEARCH.wide} to={9999} cam={camMove(f, SEARCH.wide, 315, { x: 1600, y: 1000, zoom: 1.12 }, { x: 1600, y: 980, zoom: 1.16 })}>
        <OfficeWorld
          f={f}
          minutes={B6_TEXT.clockNow + 12 + f / 600}
          slide={{ reveal: 1, route }}
          seated={[{ uid: "s-col", look: "colleague", seed: 4, place: () => COL, face: () => 0.6, pose: () => ({ sit: 1, seat: seatOf(COL), expr: "softSmile", armL: restOnTable(COL, -1), armR: restOnTable(COL, 1) }) }]}
          standing={[{ uid: "s-mom", look: "mom", seed: 1, place: () => MOM, face: momFace, pose: momPose, role: "mother" }]}
          emptyChairs={[OFFICE.seat.b, OFFICE.seat.c]}
        />
      </Shot>
    </>
  );
};
