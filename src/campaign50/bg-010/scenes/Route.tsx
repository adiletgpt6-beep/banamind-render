// Сцена 5 (≈47–62 с): папа наклоняется к экрану с лёгкой улыбкой —
// открылась страница BalaGo. Маршрут ҮЙ → МЕКТЕП → ҮЙ прорисовывается
// как план («эртең менен» / «сабактан кийин»), белая машина-значок стоит
// у дома, плашка «Алдын ала пландалат». Под голос диктора по очереди:
// 1 Арыз → 2 Топ түзүү (3–4 бала, поиск до 2 недель) → 3 Биринчи толук
// сыноо сапары — «Акысыз». Никаких выполненных поездок и «старта завтра».
import { useCurrentFrame } from "remotion";
import { RouteView } from "../browser";
import { useLine } from "../context";
import { EditorWindow } from "../editor";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { BG10_TEXT } from "../script";
import { CarKeys } from "../sets/Apartment";
import { Chair, Desk, Laptop, OFFICE, OfficeBack, ScreenGlow } from "../sets/Office";
import { camMove, Shot } from "../shots";
import { DAD_SEAT, ScreenCam, seated, useWordFrame } from "./common";

export const ROUTE = { screen: 44 };

export const RouteScene: React.FC = () => {
  const f = useCurrentFrame();
  const n03 = useLine("n03");
  const n04 = useLine("n04");
  const wTop = useWordFrame("n04", 2); // «топ»
  const wNext = useWordFrame("n04", 4); // «Андан кийин…»
  const wFree = useWordFrame("n04", 10); // «акысыз»
  const dadPose = (t: number): PoseIn => ({ ...seated(t), expr: t < 14 ? "surprised" : "softSmile", lean: keys(t, [[0, 2], [30, 14]]), lookY: 0.5, nod: keys(t, [[22, 0], [30, 4], [40, 0]]) });
  const world = (
    <>
      <OfficeBack minutes={13 * 60 + 14} light={1} noteOn={false} />
      <Chair x={OFFICE.chair.x} />
      <ScreenGlow x={OFFICE.dadX} y={920} a={1.2} />
      <Actor uid="s5-dad" look="dad" f={f} place={() => DAD_SEAT} face={() => 0} pose={dadPose} seed={2} />
      <Desk />
      <Laptop open={1} />
      <CarKeys x={1420} y={1262} />
    </>
  );
  const g = f - ROUTE.screen;
  const head = easeOut(g / 12);
  const draw = clamp((f - (n03.from + 6)) / Math.max(30, n03.to - n03.from - 10));
  const car = easeOut((f - n03.to + 30) / 12);
  const status = easeOut((f - n03.to + 6) / 10);
  const steps = [easeOut((f - n04.from + 4) / 10), easeOut((f - wTop + 2) / 10), easeOut((f - wNext + 2) / 10)];
  const dots = clamp((f - wTop - 4) / 30);
  const badge = easeOut((f - wFree + 2) / 8);
  const cy = lerp(900, 960, easeInOut((f - n04.from) / 30));
  const tabs = [BG10_TEXT.editor.tabs[0], BG10_TEXT.plan.file, BG10_TEXT.plan.newTab];
  return (
    <>
      <Shot f={f} from={0} to={ROUTE.screen} cam={camMove(f, 0, ROUTE.screen, { x: 1080, y: 900, zoom: 1.9 }, { x: 1080, y: 910, zoom: 2.05 })}>
        {world}
      </Shot>
      {f >= ROUTE.screen ? (
        <ScreenCam cx={540} cy={cy} z={lerp(1.08, 1.0, easeInOut(g / 40))}>
          <EditorWindow tabs={tabs} active={2}>
            <RouteView head={head} draw={draw} car={car} status={status} steps={steps} badge={badge} dots={dots} />
          </EditorWindow>
        </ScreenCam>
      ) : null}
    </>
  );
};
