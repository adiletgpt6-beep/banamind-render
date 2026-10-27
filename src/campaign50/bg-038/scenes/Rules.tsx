// Сцена 2: телефон мамы крупно. Она заранее отправляет классному
// руководителю «бүгүн бара албайт» (условный пример), затем сама
// открывает сайт BalaGo и прокручивает к разделу о пропущенных днях.
// Диктор: «Бала ооруп же башка себеп менен каттамдан калган күндөр
// боюнча BalaGo'до кийинки төлөм мезгилине арзандатуу тартиби бар.»
// Маркер по «кийинки төлөмдө эске алабыз», под телефоном — «Өткөрүлгөн
// күндөр» и «Кийинки төлөм мезгили» на словах диктора.
import { useCurrentFrame } from "remotion";
import { LOOKS } from "../../../two-schedules-2d/rig/looks";
import { clamp, easeIn, easeInOut, easeOut, keys } from "../../../two-schedules-2d/rig/motion";
import { PhoneFrame } from "../../../two-schedules-2d/screens";
import { box, useSaid, useSceneFrames } from "../context";
import { BG38_TEXT } from "../script";
import { Fingertip, PhoneHand, RulesPage, TeacherChat } from "../screens";
import { Chip, ExampleTag, YELLOW_SOFT } from "../sets";

export const RULES = {
  send: 34, // нажатие «отправить»
  swipe: 70, // переход в браузер
  scrollFrom: 84,
  scrollTo: 136,
} as const;

const PHONE = { x: 290, y: 262, w: 500 } as const;

export const RulesScene: React.FC = () => {
  const f = useCurrentFrame();
  const total = useSceneFrames("rules");
  const daysAt = useSaid("n1", "каттамдан калган");
  const nextAt = useSaid("n1", "кийинки төлөм");
  const ruleAt = useSaid("n1", "арзандатуу тартиби");

  // вход: телефон «выныривает» из предыдущего плана
  const enter = easeOut(f / 12);
  // телефон уменьшается, освобождая место для подписей под ним
  const shrink = easeInOut((f - (daysAt - 10)) / 14);
  // выход: телефон уходит вниз-влево, рюкзак ждёт в следующей сцене
  const exit = easeIn((f - (total - 12)) / 12);
  const scale = (1.22 - 0.22 * enter) * (1 - 0.14 * shrink) * (1 - 0.25 * exit);
  const slide = easeInOut((f - RULES.swipe) / 12);

  // палец (координаты экрана телефона): к кнопке отправки, затем
  // вверх по странице (прокрутка)
  const fx = keys(f, [[8, 330], [RULES.send, 398], [RULES.swipe + 18, 250], [RULES.scrollTo, 250]]);
  const fy = keys(f, [[8, 1010], [RULES.send, 913], [RULES.swipe + 18, 780], [RULES.scrollFrom, 780], [RULES.scrollTo, 380]]);
  const fingerA = clamp((f - 8) / 6) * (1 - clamp((f - RULES.scrollTo) / 8));
  const tapAt = f < RULES.swipe ? RULES.send : RULES.swipe + 20;

  const sleeve = LOOKS.mom.topColor;
  const skin = LOOKS.mom.skin;
  const w = PHONE.w;
  const chatA = 1 - slide;
  return (
    <div style={box({ inset: 0, background: `radial-gradient(circle at 50% 38%, ${YELLOW_SOFT}, #E9DCC8 75%)` })}>
      {/* мягкое размытое окно и стена на фоне */}
      <div style={box({ left: -120, top: 120, width: 520, height: 600, borderRadius: 30, background: "linear-gradient(180deg, #CFE4F4, #F4E8D6)", filter: "blur(26px)", opacity: 0.7 })} />
      <div
        style={box({
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          scale: `${scale}`,
          transformOrigin: `540px ${PHONE.y}px`,
          translate: `${-260 * exit}px ${(1 - enter) * 40 + 380 * exit}px`,
          opacity: 1 - exit,
        })}
      >
        <PhoneHand x={PHONE.x} y={PHONE.y} w={w} sleeve={sleeve} skin={skin} part="back" />
        <PhoneFrame x={PHONE.x} y={PHONE.y} w={w} tilt={-1.2 + 1.2 * shrink}>
          <div style={box({ inset: 0, translate: `${-slide * 100}% 0` })}>
            <TeacherChat f={f} sendAt={RULES.send} />
          </div>
          {slide > 0 ? (
            <div style={box({ inset: 0, translate: `${(1 - slide) * 100}% 0` })}>
              <RulesPage f={f} scrollFrom={RULES.scrollFrom} scrollTo={RULES.scrollTo} markAt={nextAt} noteAt={ruleAt + 8} />
            </div>
          ) : null}
          <Fingertip x={fx} y={fy} tapAt={tapAt} f={f} a={fingerA} />
        </PhoneFrame>
        <PhoneHand x={PHONE.x} y={PHONE.y} w={w} sleeve={sleeve} skin={skin} part="front" />
      </div>
      {/* подписи под телефоном — на словах диктора */}
      <Chip text={BG38_TEXT.chips.days} a={easeOut((f - daysAt) / 10) * (1 - exit)} x={90} y={1150} size={40} />
      <Chip text={BG38_TEXT.chips.next} a={easeOut((f - nextAt) / 10) * (1 - exit)} x={930 - 520} y={1252} w={520} size={40} bg="#FFC90E" />
      <ExampleTag a={chatA} />
    </div>
  );
};
