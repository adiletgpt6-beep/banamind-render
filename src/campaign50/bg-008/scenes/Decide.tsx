// Сцена 5 (32,5–44,5 с). Продолжение действия мамы: телефон крупно, она
// сама набирает «Бишкек мектепке балдар таксиси», находит карточку BalaGo
// и нажимает «Толугураак». Только после её выбора звучит BalaGo. Экран
// телефона раскрывается на весь кадр и становится схемой маршрута по
// кварталам Бишкека: Үй → Мектеп, на «сабактан кийин» — обратный путь.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { bg8Beats } from "../beats";
import { CuesContext } from "../context";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { NAVY, PhoneFrame, RouteSchematic, SearchPhone, YELLOW } from "../screens";
import { BG8_TEXT } from "../script";
import { box } from "../shots";

export const DecideScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { decide: d } = bg8Beats(cues);
  // телефон 620 px → на весь кадр (экран раскрывается)
  const grow = easeInOut((f - d.expand) / 22);
  const w = lerp(620, 1180, grow);
  const x = lerp(230, -50, grow);
  const y = lerp(300, -320, grow);
  const map = clamp((f - d.expand - 8) / 12);
  const draw = easeInOut((f - d.drawFrom) / Math.max(20, d.drawTo - d.drawFrom));
  const back = easeInOut((f - d.back) / 50);
  const chipIn = easeOut((f - d.drawFrom - 10) / 10);
  const swap = clamp((f - d.back) / 8);
  return (
    <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 40%, #E7EDF6, #C8D3E3)", overflow: "hidden" })}>
      {map < 1 ? (
        <PhoneFrame x={x} y={y} w={w}>
          <div style={box({ left: 0, top: 0, width: 584, height: 1230, transform: `scale(${(w - w * 0.07) / 577})`, transformOrigin: "0 0" })}>
            <SearchPhone f={f} typeFrom={d.typeFrom} typeTo={d.typeTo} found={d.found} click={d.click} time={BG8_TEXT.time.school} />
          </div>
        </PhoneFrame>
      ) : null}
      {map > 0 ? (
        <div style={box({ inset: 0, opacity: map })}>
          <RouteSchematic draw={draw} back={back} intro={easeOut((f - d.expand - 8) / 14)} />
        </div>
      ) : null}
      {f >= d.drawFrom ? (
        <div style={box({ left: 60, top: 370, display: "flex", opacity: chipIn, fontFamily })}>
          <div style={{ padding: "16px 34px", borderRadius: 50, backgroundColor: "#FFFFFF", boxShadow: "0 10px 26px rgba(20,40,90,0.18)", fontSize: 46, fontWeight: 900, color: NAVY, border: `6px solid ${YELLOW}` }}>
            <span style={{ opacity: swap < 0.5 ? 1 - swap * 2 : (swap - 0.5) * 2 }}>{swap < 0.5 ? BG8_TEXT.route.there : BG8_TEXT.route.back}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
