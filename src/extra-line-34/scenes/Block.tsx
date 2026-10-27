// Сцена 3 «block» (N03): «Аларга кичүүсүн карап, уулун мектептен алып
// келе турган адам керек эле. Ошондуктан жарыяга дагы бир талап кошулду.»
// Снова объявление крупно. Первая фраза — мягкий маркер проходит по
// пунктам о заботе о малышке и о встрече сына; вторая — под ними
// дописывается отдельный пункт о вождении (три строки, янтарная полоса);
// мама перечитывает, курсор останавливается на «мектептен».
import { clamp, easeInOut, keys } from "../rig/motion";
import { box, useScene } from "../kit";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { adLayout } from "../ui/AdCard";
import { C } from "../theme";
import { AdDesk, CARD, cardPoint, typingPose } from "./AdDesk";

export const blockPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "block");
  const care = T.word("N03", "кичүүсүн");
  const school = T.word("N03", "уулун");
  const s2 = T.word("N03", "Ошондуктан");
  const lines0 = T.word("N03", "дагы") - 6;
  const lines1 = T.wordEnd("N03", "кошулду");
  const focus0 = T.to("N03") + 4;
  return { care, school, s2, lines0, lines1, focus0, len: T.len };
};

// Мягкий маркер под пунктом объявления (экранные px).
const Marker: React.FC<{ readonly item: number; readonly t: number; readonly extraLines: number }> = ({ item, t, extraLines }) => {
  const lay = adLayout(CARD.w, { extraLines });
  const it = lay.items[item];
  const w = (CARD.w - lay.textX - 70) * easeInOut(clamp(t / 16));
  const o = clamp(t / 4) * (1 - clamp((t - 70) / 20));
  if (o <= 0) return null;
  return <div style={box({ left: CARD.x + lay.textX - 8, top: CARD.y + it.y + 4, width: w, height: it.h - 8, borderRadius: 12, backgroundColor: C.yellowSoft, mixBlendMode: "multiply", opacity: o })} />;
};

export const BlockScene: React.FC = () => {
  const { f, tl } = useScene("block");
  const P = blockPlan(tl);
  const extraLines = keys(f, [[P.lines0, 1], [P.lines0 + 14, 2], [P.lines0 + 28, 3]]);
  const highlight = keys(f, [[P.lines0 + 20, 0.6], [P.lines0 + 40, 1]]);
  const focus = keys(f, [[P.focus0, 0], [P.focus0 + 14, 1]]);
  const ad = { edit: 1, typed: 1, extraLines, highlight: Math.max(0.6, highlight), focus, caretFrame: f };
  const pt = cardPoint("focus", ad);
  const u = easeInOut(clamp((f - P.lines1) / (P.len - P.lines1)));
  const k = 1 + 0.14 * u;
  const momPose = (t: number) =>
    typingPose(t, t > P.lines0 && t < P.lines0 + 30 ? 1 : 0, {
      lookY: keys(t, [[0, 0.3], [P.lines1, 0.3], [P.lines1 + 12, 0.15]]),
      expr: t > P.focus0 ? "thinking" : "calm",
      nod: keys(t, [[P.care, 0], [P.care + 8, 3], [P.care + 18, 0], [P.school, 0], [P.school + 8, 3], [P.school + 18, 0]]),
    });
  return (
    <>
      <AdDesk uidPrefix="s3" f={f} ad={ad} zoom={{ k, ox: 540, oy: pt.y, tx: 0, ty: (980 - pt.y) * u * 0.6 }} momFace={() => -0.72} momPose={momPose}>
        <Marker item={0} t={f - P.care} extraLines={extraLines} />
        <Marker item={1} t={f - P.school} extraLines={extraLines} />
      </AdDesk>
    </>
  );
};
