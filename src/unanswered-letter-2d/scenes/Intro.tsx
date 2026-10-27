// Сцена 1. 00:00–00:08. «Эки жыл жана үч күн».
// Светлая карточка письма сразу на тёмном фоне; ведущая на мгновение в
// центре с кольцом иконок, затем наверху. Остановившийся черновик ответа
// с мигающим курсором. На «эки жыл» — «2 жыл күттү», на «үч күн» —
// «3 күн жооп жазган жок». В конце — «Эмне үчүн?» у курсора. Причина
// пока не объясняется.
import { fontFamily } from "../../fonts";
import { LetterScreen } from "../graphics/Letter";
import { clamp, easeOut } from "../rig/motion";
import { UL2_TEXT } from "../script";
import { C } from "../theme";
import { box, PanelArea, usePanel, useScene } from "./kit";

const Stat: React.FC<{ big: string; small: string; a: number; x: number; y: number; accent: string }> = ({ big, small, a, x, y, accent }) => (
  <div style={box({ left: x, top: y, padding: "20px 34px", borderRadius: 32, backgroundColor: C.dark, border: `3px solid ${accent}`, fontFamily, opacity: a, translate: `0 ${(1 - a) * 24}px`, scale: `${0.92 + 0.08 * a}`, boxShadow: "0 24px 60px rgba(0,0,0,0.4)", display: "flex", alignItems: "baseline", gap: 18, whiteSpace: "nowrap" })}>
    <span style={{ fontSize: 104, fontWeight: 900, color: accent, lineHeight: 1 }}>{big}</span>
    <span style={{ fontSize: 46, fontWeight: 900, color: C.text }}>{small}</span>
  </div>
);

export const IntroScene: React.FC = () => {
  const { f, word, to } = useScene("intro");
  const r = usePanel();
  const two = easeOut((f - (word("n01", 3) - 3)) / 9);
  const three = easeOut((f - (word("n01", 9) - 3)) / 9);
  const statsOut = 1 - easeOut((f - (to("n01") + 8)) / 10);
  const dimA = Math.max(two, three) * statsOut;
  // рамка у остановившегося курсора и вопрос
  const frame = easeOut((f - (word("n01", 11) - 2)) / 10);
  const why = easeOut((f - (to("n01") + 6)) / 10);
  return (
    <>
      <PanelArea>
        <LetterScreen w={r.w} h={r.h} v={{ f, draft: 1, caret: true }} />
        {/* приглушение письма, пока говорят цифры */}
        <div style={box({ inset: 0, backgroundColor: `rgba(11,13,19,${0.35 * dimA})` })} />
        {/* тонкая рамка вокруг остановившегося ответа */}
        <div style={box({ left: 16, right: 16, top: 422, bottom: 16, borderRadius: 32, border: `4px solid ${C.yellow}`, opacity: frame * (1 - 0.4 * dimA), scale: `${1.02 - 0.02 * frame}` })} />
      </PanelArea>
      <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, pointerEvents: "none" })}>
        <Stat big={UL2_TEXT.waited[0]} small={UL2_TEXT.waited[1]} a={two * statsOut} x={40} y={120} accent={C.yellow} />
        <Stat big={UL2_TEXT.noReply[0]} small={UL2_TEXT.noReply[1]} a={three * statsOut} x={120} y={300} accent={C.orange} />
        {/* «Эмне үчүн?» с короткой стрелкой к курсору */}
        <div style={box({ right: 40, top: 300, opacity: why, translate: `0 ${(1 - why) * 20}px`, display: "flex", flexDirection: "column", alignItems: "flex-end" })}>
          <div style={{ padding: "18px 40px", borderRadius: 999, backgroundColor: C.yellow, fontFamily, fontSize: 70, fontWeight: 900, color: C.ink, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>{UL2_TEXT.why}</div>
          <svg width={200} height={150} style={{ marginRight: 120 }}>
            <path d={`M 150 8 Q 140 90 ${60} ${130}`} stroke={C.yellow} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={260} strokeDashoffset={260 * (1 - clamp((f - (to("n01") + 12)) / 10))} />
            <path d="M 48 108 L 58 132 L 84 126" stroke={C.yellow} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={clamp((f - (to("n01") + 20)) / 4)} />
          </svg>
        </div>
      </div>
    </>
  );
};
