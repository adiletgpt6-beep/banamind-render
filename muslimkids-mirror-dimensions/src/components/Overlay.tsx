// Текстовый слой мультфильма (TypographySystem): подписи синхронизированы с речью.
import { AbsoluteFill } from "remotion";
import { BEATS } from "../engines/MirrorDimensionsEngine";
import { PALETTE } from "../engines/MirrorLightingSystem";
import { Caption, Label, MuslimKidsTitle, QuranQuote, SANS, useT } from "./Typography";
import { seg } from "../utils/math";

export const Overlay: React.FC = () => {
  const t = useT();
  const titleK = seg(t, 0.5, 1.4) * (1 - seg(t, 3.2, 3.9));
  return (
    <AbsoluteFill>
      {/* название */}
      {titleK > 0 ? (
        <div style={{ position: "absolute", top: "63%", left: 60, right: 60, textAlign: "center", opacity: titleK, filter: `blur(${(1 - titleK) * 6}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: 10, color: PALETTE.turquoise }}>MUSLIM KIDS</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 76, lineHeight: 1.1, marginTop: 24, color: PALETTE.milk, textShadow: "0 2px 20px rgba(4,10,22,0.6)" }}>
            Удивительный мир
            <br />в <span style={{ color: PALETTE.gold }}>отражениях</span>
          </div>
        </div>
      ) : null}
      {/* сцены 1–2: что понимает ребёнок */}
      <Caption t={t} from={3.9} to={6.5} top={9}>
        Зеркало отражает <span style={{ color: PALETTE.gold }}>свет</span>
      </Caption>
      <Caption t={t} from={6.7} to={8.7} top={9}>
        Меняется ракурс —<br />меняется отражение
      </Caption>
      <Caption t={t} from={BEATS.rotatesWord - 0.1} to={11.3} top={9}>
        Земля вращается
        <br />
        вокруг своей <span style={{ color: PALETTE.gold }}>оси</span>
      </Caption>
      <Label t={t} from={BEATS.dayWord - 0.15} to={15.3} x={34} y={34} text="ДЕНЬ" color={PALETTE.gold} side="left" />
      <Label t={t} from={BEATS.nightWord - 0.15} to={15.3} x={70} y={62} text="НОЧЬ" color={PALETTE.silver} side="right" />
      {/* сцена 3 */}
      <Caption t={t} from={20.6} to={23.9} top={9}>
        Спокойная вода —<br />
        тоже <span style={{ color: PALETTE.gold }}>зеркало</span>
      </Caption>
      {/* сцена 4 */}
      <Caption t={t} from={BEATS.sproutWord + 0.6} to={33.6} top={88} size={30}>
        <span style={{ fontWeight: 500, color: PALETTE.silver }}>рост растения показан ускоренно</span>
      </Caption>
      {/* сцена 5 */}
      <Caption t={t} from={BEATS.surahStart + 0.2} to={44.8} top={4.5} size={40}>
        <span style={{ fontWeight: 500, color: PALETTE.silver }}>
          Сура «Аль-Имран», 3:190
          <br />
          <span style={{ fontSize: 30 }}>пересказ смысла аята</span>
        </span>
      </Caption>
      {/* сцена 6 */}
      <QuranQuote t={t} from={BEATS.lordWord - 1.0} to={54.4} />
      {/* сцена 7 */}
      <Caption t={t} from={BEATS.finalQuestion + 0.6} to={60.5} top={31} size={66}>
        А что удивляет <span style={{ color: PALETTE.gold }}>тебя</span>?
      </Caption>
      <MuslimKidsTitle t={t} from={58.0} />
    </AbsoluteFill>
  );
};
