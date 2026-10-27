// Сцена 15 «cta» (N10). Страница с закладкой светлеет и раскрывается в
// финальный экран: BalaGo и «Балдар үчүн такси · Бишкек» — на «БалаГо…
// Бишкектеги»; маршрут ҮЙ → МЕКТЕП → ҮЙ — на «Үйдөн мектепке»; жёлтая
// кнопка «Баланы каттоо» и «Шилтеме — профилдин башында» — на «Балаңызды
// каттоо»; WhatsApp 0998 08 38 28 — на «экрандагы номерге». Финал
// неподвижен и читается дольше трёх секунд, последняя фраза «BalaGo менен
// жолго чыгалы!» звучит над готовым экраном.
import { clamp } from "../rig/motion";
import { useScene } from "../kit";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { PageGlow } from "../props/Book";
import { CtaScreen } from "../ui/CtaScreen";
import { FinalBook } from "./Bookmark";

export const ctaPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "cta");
  const glow0 = 3; // первые кадры — чистый финальный образ сц. 14
  const glow1 = glow0 + 22; // переход: страница → светлый фон
  const brand0 = Math.min(glow1 - 6, T.word("N10", "БалаГо") - 8);
  const route0 = T.word("N10", "Үйдөн") - 6;
  const cta0 = T.word("N10", "Балаңызды") - 4;
  const contact0 = T.word("N10", "экрандагы") - 4; // номер на экране к словам «экрандагы номерге»
  return { glow0, glow1, brand0, route0, cta0, contact0, len: T.len };
};

export const CtaScene: React.FC = () => {
  const { f, tl } = useScene("cta");
  const P = ctaPlan(tl);
  return (
    <>
      {f < P.glow1 + 2 ? <FinalBook k={1} /> : null}
      {f < P.glow1 + 2 ? <PageGlow t={clamp((f - P.glow0) / (P.glow1 - P.glow0))} /> : null}
      {f >= P.brand0 ? <CtaScreen backdrop={f >= P.glow1} brand={clamp((f - P.brand0) / 20)} route={clamp((f - P.route0) / 20)} cta={clamp((f - P.cta0) / 20)} contact={clamp((f - P.contact0) / 18)} /> : null}
    </>
  );
};
