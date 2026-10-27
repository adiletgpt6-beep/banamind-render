// Вставка: телефон в руке папы — профиль BalaGo, касание ссылки «Каттоо
// шилтемеси», открывается страница BalaGo (Бишкек, ҮЙ → МЕКТЕП → ҮЙ).
import { AbsoluteFill } from "remotion";
import { PageScreen, Phone, ProfileScreen, SCREEN_W } from "../props";
import { tw } from "../rig/motion";
import { WarmGrade } from "../sets/LivingRoom";

export const PhoneInsert: React.FC<{ readonly t: number; readonly dur: number }> = ({ t, dur }) => {
  const tap = 1.0;
  const slide = tw(t, 1.35, 1.8, 0, 1);
  // в конце — наезд на строку маршрута (склейка с рисунком-маршрутом)
  const push = tw(t, dur - 0.6, dur, 0, 1, (x) => x * x);
  const s = 1.85 * (1 + push * 0.9);
  const press = Math.max(0, 1 - Math.abs(t - tap) / 0.25);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #F7DDB3 0%, #D9AE7E 70%, #B98A5C 100%)" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 ${900 + push * 120}) scale(${s}) rotate(${-2 + tw(t, 0, dur, 0, 2)})`}>
          <Phone>
            <g transform={`translate(${-slide * SCREEN_W} 0)`}>
              <ProfileScreen tap={press > 0 || t > tap ? 1 : 0} />
            </g>
            <g transform={`translate(${(1 - slide) * SCREEN_W} 0)`}>
              <PageScreen reveal={tw(t, 1.6, 2.1, 0, 1)} />
            </g>
            {press > 0 ? <circle cx={180} cy={325} r={26 + (1 - press) * 40} fill="#1E3A6E" opacity={0.25 * press} /> : null}
          </Phone>
          {/* рука папы: тёмно-синий рукав, большой палец */}
          <g transform="translate(150 330)">
            <rect x={-30} y={20} width={150} height={260} rx={60} fill="#24407A" transform="rotate(-18)" />
            <ellipse cx={20} cy={30} rx={70} ry={78} fill="#EDC09A" />
          </g>
        </g>
      </svg>
      <WarmGrade strength={0.6} />
    </AbsoluteFill>
  );
};
