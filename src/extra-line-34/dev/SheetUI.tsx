// Рабочий лист «UI» (№34): карточки интерфейса вне фильма.
//   0   объявление в начале (курсор в конце третьего пункта)
//   30  правка «Тажрыйбасы бар» → «Балдар менен иш тажрыйбасы»
//   60  набор первой строки нового пункта «Айдоочулук күбөлүк»
//   90  строка мягко подсвечена янтарём
//   120 весь пункт о вождении, подчёркнуто «мектептен»
//   150 вечер: пункт выделен перед удалением
//   180 пункт удалён (вечерний оттенок)
//   210 две карточки кандидатов (взгляд на второй)
//   240 разделение на две карточки (split 200 → 260)
//   270 календарь + телефон со списком и телефон с календарём
//   272–284 объявление уменьшается в «экран ноутбука» (compact 0 → 1)
//   285–299 морфинг AdCard → SplitCards (fromH, morph, затем split)
import { useCurrentFrame } from "remotion";
import { Backdrop, Headline } from "../kit";
import { PhoneAdList, PhoneCalendar, PhoneFrame } from "../props/Phone";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { EL_TEXT } from "../script";
import { AdCard, adLayout } from "../ui/AdCard";
import { CalendarCard } from "../ui/CalendarCard";
import { CandidateCard } from "../ui/CandidateCard";
import { SplitCards } from "../ui/SplitCards";
import { DevSheet } from "./DevSheet";

const ramp = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
const fade = (f: number, a: number, b: number, c: number, d: number) => ramp(f, a, b) * (1 - ramp(f, c, d));

export const SheetUI: React.FC = () => {
  const f = useCurrentFrame();

  // объявление
  const ad = {
    edit: ramp(f, 8, 44),
    extraLines: ramp(f, 48, 54) + 2 * ramp(f, 94, 110),
    typed: ramp(f, 54, 76),
    highlight: ramp(f, 78, 90),
    focus: ramp(f, 108, 120) * (1 - ramp(f, 126, 134)),
    evening: ramp(f, 126, 142),
    select: ramp(f, 132, 148),
    remove: ramp(f, 152, 176),
  };
  const adOn = f < 200 ? 1 - ramp(f, 182, 190) : 0;

  // объявление → экран ноутбука (272–284)
  const shrink = easeInOut(ramp(f, 273, 283));
  // экран ноутбука: рамка 800 × 520 в (140, 520), поле экрана 22 px
  const scr = { x: 140 + 22, y: 520 + 22, w: 800 - 44, h: 520 - 44 };
  const small = { w: 400, x: scr.x + (scr.w - 400) / 2, y: scr.y + 24 };

  return (
    <DevSheet>
      <Backdrop warm={ad.evening * adOn} />
      {adOn > 0 ? <AdCard x={90} y={260} w={900} {...ad} caretFrame={f} style={{ opacity: adOn }} /> : null}

      {/* кандидаты */}
      {f >= 184 && f < 218 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - ramp(f, 210, 216) }}>
          <Headline text={EL_TEXT.candidatesHeadline.text} accent={EL_TEXT.candidatesHeadline.accent} t={(f - 186) * 2} top={190} perWord={4} />
          <CandidateCard which={0} x={90} y={420} w={900} reveal={ramp(f, 186, 200)} focus={fade(f, 198, 203, 204, 208)} f={f} />
          <CandidateCard which={1} x={90} y={816} w={900} reveal={ramp(f, 192, 206)} focus={ramp(f, 205, 210)} f={f} />
        </div>
      ) : null}

      {/* разделение */}
      {f >= 214 && f < 256 ? <SplitCards x={90} y={640} w={900} split={ramp(f, 200, 260)} reveal={ramp(f, 215, 225)} style={{ opacity: 1 - ramp(f, 248, 254) }} /> : null}

      {/* календарь и телефоны */}
      {f >= 252 && f < 272 ? (
        <>
          <CalendarCard x={90} y={170} w={900} reveal={ramp(f, 254, 264)} add={ramp(f, 258, 268)} />
          <div style={{ position: "absolute", inset: 0, opacity: ramp(f, 256, 264), transform: `translateY(${(1 - easeOut(ramp(f, 256, 266))) * 60}px)` }}>
            <PhoneFrame x={110} y={790} w={400} tilt={-2} screen={<PhoneAdList highlight={ramp(f, 262, 270)} />} />
            <PhoneFrame x={570} y={790} w={400} tilt={2} screen={<PhoneCalendar add={ramp(f, 262, 270)} />} />
          </div>
        </>
      ) : null}

      {/* объявление уменьшается в экран ноутбука */}
      {f >= 272 && f < 285 ? (
        <>
          <div
            style={{ position: "absolute", left: 140, top: 520, width: 800, height: 520, borderRadius: 28, backgroundColor: "#1F2633", boxShadow: "0 30px 60px rgba(23,38,61,0.18)", opacity: shrink }}
          >
            <div style={{ position: "absolute", left: 22, top: 22, right: 22, bottom: 22, borderRadius: 10, backgroundColor: "#EEF1F5" }} />
          </div>
          <div style={{ position: "absolute", left: 90, top: 1060, width: 900, height: 36, borderRadius: 18, backgroundColor: "#C9CED8", opacity: shrink }} />
          <AdCard x={lerp(90, small.x, shrink)} y={lerp(260, small.y, shrink)} w={lerp(900, small.w, shrink)} compact={shrink} highlight={1} />
        </>
      ) : null}

      {/* морфинг объявление → две карточки */}
      {f >= 285 ? (
        <>
          {f < 288 ? <AdCard x={90} y={300} w={900} highlight={1} /> : null}
          <SplitCards x={90} y={300} w={900} fromH={adLayout(900).h} morph={ramp(f, 288, 295)} split={ramp(f, 295, 299)} style={{ opacity: ramp(f, 285, 288) }} />
        </>
      ) : null}
    </DevSheet>
  );
};
