// Сцена 4 «candidates» (N04): «Бир талапкер машинаны жакшы айдайт, бирок
// кичинекей балдар менен тажрыйбасы аз. Башкасынын балдар менен тажрыйбасы
// мол, бирок машина айдабайт.» Две карточки кандидатов по очереди (одна
// над другой, крупный текст), строки появляются вместе со словами; мама
// внизу переводит взгляд с одной карточки на другую. Заголовок «Талаптарга
// толук дал келбейт». Без рейтингов, крестов и звуков проигрыша.
import { clamp, keys } from "../rig/motion";
import { box, Headline, useScene } from "../kit";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { CandidateCard, candidateHeight } from "../ui/CandidateCard";
import { EL_TEXT } from "../script";
import { AdDesk, typingPose } from "./AdDesk";

const W = 900;
const X = 90;
const Y1 = 420;
const Y2 = Y1 + candidateHeight(W) + 40;

export const candidatesPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "candidates");
  const c1 = T.from("N04") - 6;
  const c1plus = T.word("N04", "машинаны");
  const c1minus = T.word("N04", "бирок");
  const c2 = T.word("N04", "Башкасынын") - 6;
  const c2plus = T.word("N04", "мол") - 10;
  const c2minus = T.wordEnd("N04", "мол") + 2;
  return { c1, c1plus, c1minus, c2, c2plus, c2minus, len: T.len, end: T.to("N04") };
};

// reveal карточки: 0–0,45 вход, 0,35–0,65 строка ✓, 0,65–1 строка «—».
const revealAt = (f: number, a: number, plus: number, minus: number) => keys(f, [[a, 0], [a + 14, 0.45], [plus, 0.45], [plus + 10, 0.65], [minus, 0.65], [minus + 12, 1]], (x) => x);

export const CandidatesScene: React.FC = () => {
  const { f, tl } = useScene("candidates");
  const P = candidatesPlan(tl);
  const r1 = revealAt(f, P.c1, P.c1plus, P.c1minus);
  const r2 = revealAt(f, P.c2, P.c2plus, P.c2minus);
  const focus1 = keys(f, [[P.c1, 0], [P.c1 + 14, 1], [P.c2 - 4, 1], [P.c2 + 8, 0]]);
  const focus2 = keys(f, [[P.c2, 0], [P.c2 + 14, 1], [P.end + 6, 1], [P.end + 20, 0.4]]);
  // мама смотрит на верхнюю карточку, затем на нижнюю, потом задумчиво вниз
  const momPose = (t: number) =>
    typingPose(t, 0, {
      lookY: keys(t, [[0, 0.1], [P.c1, -0.45], [P.c2 - 4, -0.45], [P.c2 + 8, -0.15], [P.end, -0.15], [P.end + 14, 0.3]]),
      lookX: keys(t, [[P.c1, 0], [P.c1 + 10, -0.3], [P.c2, -0.3], [P.c2 + 10, -0.15]]),
      expr: t > P.end ? "thinking" : "calm",
      headTilt: keys(t, [[P.c2, 0], [P.c2 + 16, -5]]),
    });
  return (
    <>
      <AdDesk uidPrefix="s4" f={f} ad={null} momFace={(t) => keys(t, [[0, -0.6], [P.c1, -0.4]])} momPose={momPose}>
        <CandidateCard which={0} w={W} x={X} y={Y1} reveal={r1} focus={focus1} f={f} />
        <CandidateCard which={1} w={W} x={X} y={Y2} reveal={r2} focus={focus2} f={f} />
      </AdDesk>
      <div style={box({ left: 0, top: 0, width: 1080, height: 400, background: "linear-gradient(180deg, rgba(247,245,239,1) 0%, rgba(247,245,239,0.96) 72%, rgba(247,245,239,0) 100%)", opacity: clamp(f / 8) })} />
      <Headline text={EL_TEXT.candidatesHeadline.text} accent={EL_TEXT.candidatesHeadline.accent} t={f - 4} top={196} size={62} />
    </>
  );
};
