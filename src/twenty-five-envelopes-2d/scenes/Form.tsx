// Сцена 12. Предварительная заявка (N07). То же устройство.
// Касание «Алдын ала каттоо» → форма. Мама указывает адрес дома и нынешнюю
// школу (графическое сокращение: поля меняются на «Дарек киргизилди» и
// «Мектеп көрсөтүлдү» после касания, без личных данных). Палец попадает в
// кнопку «Жөнөтүү», и только после нажатия появляется статус «Өтүнмө
// жөнөтүлдү / Маршрутту талкуулоо үчүн». Никаких подтверждённых маршрутов,
// водителей, оплаты и номеров телефона.
import { clamp } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { SKIN } from "../props/CloseHand";
import { PhoneClose, WEB_TAP, WebScreen } from "../props/Phone";

export const formPlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "form");
  const cta = 10;
  const address = 40;
  const school = 74;
  const send = Math.max(school + 40, T.to("N07") - 36);
  return { cta, address, school, send, len: T.len };
};

export const FormScene: React.FC = () => {
  const { f } = useScene("form");
  const p = usePlan(formPlan);
  const taps = [
    { at: p.cta, tip: WEB_TAP.cta },
    { at: p.address, tip: WEB_TAP.address },
    { at: p.school, tip: WEB_TAP.school },
    { at: p.send, tip: WEB_TAP.send },
  ];
  const state = f < p.cta + 2 ? "page" : f < p.send + 2 ? "form" : "sent";
  const filled = (f >= p.address + 2 ? clamp((f - p.address - 2) / 6) : 0) + (f >= p.school + 2 ? clamp((f - p.school - 2) / 6) : 0);
  const pressed = f >= p.cta && f <= p.cta + 2 ? "cta" : f >= p.send && f <= p.send + 2 ? "send" : null;
  return (
    <PhoneClose f={f} taps={taps} skin={SKIN.mom}>
      <WebScreen state={state} filled={filled} pressed={pressed} sentT={f - p.send - 2} />
    </PhoneClose>
  );
};
