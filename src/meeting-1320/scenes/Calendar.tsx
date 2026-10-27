// Сцена 1 «Календардагы 13:20» — без персонажей.
// 1a. Макро: огромные «13:20» на мягко-жёлтой плашке; за долю секунды
//     проступает рамка пункта календаря (без вспышки: из бумаги).
// 1b. N01: плавный отъезд — карточка «Директордун күн тартиби», над ней
//     название фильма; затем две смены дня (Шейшемби, Шаршемби): остальные
//     встречи меняются, плашка 13:20 стоит на месте; надписи «Күн сайын.»,
//     «Бир эле убакыт.». На «Саат бирден жыйырма…» 13:20 мягко светится.
// 1c. N02: пункт 13:20 раскрывается в карточку с полями «Компания»,
//     «Аты-жөнү», «Бөлмө» — каждый прочерк на своём слове; лёгкий наезд.
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { HeavyLine, Shot, box, camMove, usePlan, useScene } from "../kit";
import { clamp, easeInOut, keys } from "../rig/motion";
import { MacroTime, DAY, DAY_DETAIL, DAY_POS } from "../props/CalendarUI";
import { M13_TEXT } from "../script";
import { C } from "../theme";
import type { M13Sfx } from "./sfx";

export const calendarPlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "calendar");
  const n1 = T.from("N01");
  const n1End = T.to("N01");
  const n2 = T.from("N02");
  // отъезд от макро к карточке
  const pullA = Math.max(14, n1 - 16);
  const pullB = pullA + 78;
  // название фильма над карточкой
  const titleIn = pullA + 34;
  const titleOut = Math.max(titleIn + 70, T.word("N01", "бар") + 4);
  // смены дня (по одной понятной анимации)
  const flip1 = titleOut + 4;
  const flip2 = Math.max(flip1 + 40, Math.min(T.word("N01", "өткөндө") - 6, n1End - 30));
  const capOut = Math.max(flip2 + 46, n2 - 22);
  // раскрытие пункта и поля на словах N02
  const openA = Math.max(capOut + 6, n2 - 14);
  const fields = [T.word("N02", "Компаниянын"), T.word("N02", "аты-жөнү"), T.word("N02", "бөлмөнүн")];
  return {
    len: T.len,
    n1,
    n2,
    frameIn: 4,
    pullA,
    pullB,
    titleIn,
    titleOut,
    flip1,
    flip2,
    capOut,
    glowA: T.word("N01", "Саат"),
    openA,
    openB: openA + 22,
    fields,
  };
};

export const calendarSfx = (tl: M13Timeline): M13Sfx[] => {
  void tl;
  return [];
};

export const calendarSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  void tl;
  return [];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));

export const CalendarScene: React.FC = () => {
  const { f } = useScene("calendar");
  const P = usePlan(calendarPlan);
  // макро → обычный план карточки
  const macro = 1 - easeInOut(ramp(f, P.pullA, P.pullB));
  const frame = ramp(f, P.frameIn, P.frameIn + 16);
  const title = ramp(f, P.titleIn, P.titleIn + 26) * (1 - ramp(f, P.titleOut, P.titleOut + 12));
  const day = keys(f, [
    [P.flip1, 0],
    [P.flip1 + 30, 1],
    [P.flip2, 1],
    [P.flip2 + 30, 2],
  ]);
  const glow = 0.25 * ramp(f, P.flip1, P.flip1 + 20) + 0.75 * ramp(f, P.glowA, P.glowA + 18);
  const open = ramp(f, P.openA, P.openB);
  const fields = P.fields.map((w) => ramp(f, w - 4, w + 14));
  // надписи «Күн сайын. / Бир эле убакыт.» в зоне над карточкой
  const capFade = 1 - ramp(f, P.capOut, P.capOut + 10);
  // лёгкий наезд на раскрытую карточку деталей (камера — по миру кадра)
  const det = { x: DAY_POS.x + DAY_DETAIL.x + DAY_DETAIL.w / 2, y: DAY_POS.y + DAY_DETAIL.y + DAY_DETAIL.h / 2 };
  const cam = camMove(f, P.openA - 6, P.len, { x: 540, y: 960, zoom: 1 }, { x: 540 + (det.x - 540) * 0.35, y: 960 + (det.y - 960) * 0.35, zoom: 1.07 });
  return (
    <Shot f={f} cam={cam} bg={C.paper}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
        <MacroTime macro={macro} frame={frame} day={day} title={title} glow={glow} detail={open > 0 ? { open, fields } : undefined} />
      </div>
      {f >= P.flip1 && capFade > 0 ? (
        <div style={box({ left: DAY_POS.x, top: DAY_POS.y - 300, width: DAY.w, opacity: capFade, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 })}>
          <HeavyLine text={M13_TEXT.everyDay[0]} t={f - P.flip1 - 4} size={96} color={C.navy} from="left" dist={180} />
          <HeavyLine text={M13_TEXT.everyDay[1]} t={f - P.flip2 - 4} size={96} color={C.navy} from="right" dist={180} />
        </div>
      ) : null}
    </Shot>
  );
};
