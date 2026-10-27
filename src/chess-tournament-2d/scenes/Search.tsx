// Сцена 12. Родители сами находят BalaGo (N07). Один телефон мамы,
// разные состояния экрана — каждое после касания:
//   1) касание поля поиска, набор «Бишкек балдар үчүн такси» (несколько
//      касаний клавиатуры, без показа каждой буквы);
//   2) результаты: строка BalaGo «Балдар үчүн такси» (без рейтингов и
//      отзывов) — касание;
//   3) страница BalaGo: предварительное обращение для обсуждения
//      маршрута — касание «Алдын ала каттоо»;
//   4) форма с уже введёнными данными: «Маршрут: Мектеп → Үй», «Кошумча
//      сабактан кийин», дни, «Убакыт: 15:00» — касание «Жөнөтүү»;
//   5) статус «Өтүнмө жөнөтүлдү» — получение обращения, не маршрут и не
//      поездка.
import { AbsoluteFill } from "remotion";
import { clamp } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { PhoneClose, WEB_TAP, WebScreen, type Tap, type WebState } from "../props/Phone";
import { SKIN } from "../props/CloseHand";

export const searchPlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "search");
  const tapSearch = 6;
  const typeFrom = 16;
  const keys = Array.from({ length: 9 }, (_, i) => typeFrom + i * 5);
  const typeTo = keys[keys.length - 1] + 4;
  const tapResult = Math.max(typeTo + 22, T.word("N07", "БалаГону") + 4);
  const cta = Math.max(tapResult + 34, T.word("N07", "Кошумча") + 10);
  const form = cta + 6;
  const send = Math.max(form + 40, T.to("N07") + 8);
  return { tapSearch, typeFrom, keys, typeTo, tapResult, page: tapResult + 6, cta, form, send, sent: send + 5, len: T.len };
};
type P = ReturnType<typeof searchPlan>;

export const searchTaps = (p: P): Tap[] => [
  { at: p.tapSearch, tip: WEB_TAP.search },
  ...p.keys.map((at, i) => ({ at, tip: WEB_TAP.key(i) })),
  { at: p.tapResult, tip: WEB_TAP.result },
  { at: p.cta, tip: WEB_TAP.cta },
  { at: p.send, tip: WEB_TAP.send },
];

export const SearchScene: React.FC = () => {
  const { f } = useScene("search");
  const p = usePlan(searchPlan);
  const state: WebState = f < p.typeTo + 6 ? "search" : f < p.page ? "results" : f < p.form ? "page" : f < p.sent ? "form" : "sent";
  const pressed = f >= p.tapResult && f < p.tapResult + 6 ? "result" : f >= p.cta && f < p.cta + 6 ? "cta" : f >= p.send && f < p.sent ? "send" : null;
  const typed = clamp((f - p.typeFrom + 2) / (p.typeTo - p.typeFrom));
  const filled = clamp((f - p.form - 4) / 18) * 4;
  return (
    <AbsoluteFill>
      <PhoneClose f={f} taps={searchTaps(p)} skin={SKIN.mom} caseColor="#C9786A">
        <WebScreen state={state} typed={f < p.typeFrom ? 0 : typed} pressed={pressed} filled={filled} sentT={f - p.sent} />
      </PhoneClose>
    </AbsoluteFill>
  );
};
