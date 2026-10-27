// Сцена 4 (28,6–39,2 с): папа открывает BalaGo на планшете — карточка
// «Мектепке каттам» → нажатие «Маршрутту көрүү» → карточка раскрывается в
// условную схему: дома (группа детей) и школа, белая машина утром
// ҮЙ → МЕКТЕП, после уроков МЕКТЕП → ҮЙ. Метка «Шарттуу мисал».
// Диктор: «BalaGo Бишкекте балдарды үйдөн мектепке, сабактан кийин кайра
// үйгө жеткирүүгө багытталган кызмат.»
import { useCurrentFrame } from "remotion";
import { cruise, easeInOut, keys } from "../rig/motion";
import { LOOKS } from "../rig/looks";
import { AppHome, Finger, RouteMap, TabletFrame } from "../screens";
import { box, Shot } from "../shots";

export const APP = { tap: 46, morph: 58, morningFrom: 92, morningTo: 186, afterFrom: 204, afterTo: 300 } as const;
const TAB = { x: 120, y: 440, w: 840, h: 1150 } as const;

export const AppScene: React.FC = () => {
  const f = useCurrentFrame();
  const morph = easeInOut((f - APP.morph) / 22);
  const morning = cruise((f - APP.morningFrom) / (APP.morningTo - APP.morningFrom));
  const after = f >= APP.afterFrom ? cruise((f - APP.afterFrom) / (APP.afterTo - APP.afterFrom)) : 0;
  const innerW = TAB.w - 48;
  const innerH = TAB.h - 48;
  const k = innerH / 1352;
  // палец: подходит к кнопке, нажимает, уходит
  const fx = keys(f, [[10, 760], [APP.tap - 10, 560], [APP.tap + 14, 600], [APP.tap + 30, 900]]);
  const fy = keys(f, [[10, 1900], [APP.tap - 10, TAB.y + 24 + 1000], [APP.tap + 14, TAB.y + 24 + 1000], [APP.tap + 30, 2000]]);
  const press = keys(f, [[APP.tap - 4, 0], [APP.tap, 1], [APP.tap + 6, 0]]);
  return (
    <Shot
      f={f}
      from={0}
      to={400}
      cam={{ x: 540, y: 960, zoom: 1 }}
      overlay={
        <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 45%, #FFFFFF, #DCE3EE)" })}>
          <TabletFrame x={TAB.x} y={TAB.y - 10 * (f / 330)} w={TAB.w} h={TAB.h}>
            <div style={box({ inset: 0, opacity: 1 - morph })}>
              <AppHome f={f} tapAt={APP.tap} />
            </div>
            {morph > 0 ? (
              <div style={box({ left: (innerW - 792 * k) / 2, top: 0, width: 792, height: 1352, transformOrigin: "0 0", scale: `${k * (0.85 + 0.15 * morph)}`, translate: `${(1 - morph) * 60}px ${(1 - morph) * 380}px` })}>
                <RouteMap morning={morning} after={after} reveal={morph} />
              </div>
            ) : null}
          </TabletFrame>
          {f < APP.tap + 30 ? <Finger x={fx} y={fy} skin={LOOKS.dad.skin} sleeve={LOOKS.dad.topColor} press={press} /> : null}
        </div>
      }
    >
      {null}
    </Shot>
  );
};
