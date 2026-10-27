// Сцена 1 «line» (N01): «Апасы бала багуучу издеп, жарыясын кайра-кайра
// өзгөрттү. Акыркы кошкон бир сабы жакшы талапкерлердин көбүн тизмеден
// чыгарып койду.» Сразу — крупная карточка объявления над мамой за столом.
// Первая фраза — две короткие правки («Кызыбызга…» → «Кичинекей кызыбызга…»,
// «Тажрыйбасы бар» → «Балдар менен иш тажрыйбасы»): видно, что текст
// переписывают не впервые.
// Вторая фраза — курсор добавляет «Айдоочулук күбөлүк», строка мягко
// желтеет, камера приближается к ней; заголовок «Бир сап баарын
// татаалдаштырды».
import { clamp, easeInOut, keys } from "../rig/motion";
import { box, Headline, useScene } from "../kit";
import { EL_TEXT } from "../script";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { AdDesk, cardPoint, typingPose } from "./AdDesk";

export const linePlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "line");
  const a = T.from("N01");
  const s2 = T.word("N01", "Акыркы");
  // две короткие правки подряд: «Кызыбызга…» → «Кичинекей кызыбызга…»,
  // затем «Тажрыйбасы бар» → «Балдар менен иш тажрыйбасы»
  const editA0 = a + 12;
  const editA1 = editA0 + 30;
  const edit0 = editA1 + 6;
  const edit1 = Math.max(edit0 + 34, Math.min(s2 - 14, edit0 + 52));
  const type0 = s2 - 4; // набор новой строки начинается со словом «Акыркы»
  const type1 = Math.max(type0 + 30, T.wordEnd("N01", "сабы") - 2);
  const hi = type1 + 4; // строка желтеет
  const push0 = hi - 6;
  const push1 = T.len - 6;
  const head = T.word("N01", "жакшы") - 4;
  return { a, s2, editA0, editA1, edit0, edit1, type0, type1, hi, push0, push1, head, len: T.len };
};

// Конечное состояние карточки сцены 1 (для монтажа в экран ноутбука, сц. 2).
export const LINE_END_AD = { edit: 1, typed: 1, extraLines: 1, highlight: 1 } as const;
// приближение к добавленной строке: пункты остаются в безопасной зоне x ≤ 936
export const LINE_ZOOM = 0.1;
export const lineEndZoom = () => {
  const pt = cardPoint("extra0", LINE_END_AD);
  return { k: 1 + LINE_ZOOM, ox: 540, oy: pt.y, tx: 0, ty: 800 - pt.y };
};

export const LineScene: React.FC = () => {
  const { f, tl } = useScene("line");
  const P = linePlan(tl);
  const edit0 = keys(f, [[P.editA0, 0], [P.editA1, 1]], (x) => x);
  const edit = keys(f, [[P.edit0, 0], [P.edit1, 1]], (x) => x);
  const typed = keys(f, [[P.type0, 0], [P.type1, 1]], (x) => x);
  const extraLines = keys(f, [[P.type0 - 10, 0], [P.type0, 1]]);
  const highlight = keys(f, [[P.hi, 0], [P.hi + 16, 1]]);
  const ad = { edit0, edit, typed, extraLines, highlight, caretFrame: f };
  const pt = cardPoint("extra0", ad);
  const u = easeInOut(clamp((f - P.push0) / (P.push1 - P.push0)));
  const k = 1 + LINE_ZOOM * u;
  // мама печатает во время правок, затем перечитывает добавленную строку
  const typing = (t: number) => (t > P.editA0 + 9 && t < P.editA1) || (t > P.edit0 + 10 && t < P.edit1) || (t > P.type0 && t < P.type1) ? 1 : 0;
  const momPose = (t: number) =>
    typingPose(t, typing(t), {
      lookY: keys(t, [[0, 0.32], [P.type1 + 4, 0.32], [P.type1 + 16, 0.12]]),
      expr: t > P.hi + 10 ? "thinking" : "calm",
      headTilt: keys(t, [[P.hi, 0], [P.hi + 20, -4]]),
    });
  return (
    <>
      <AdDesk
        uidPrefix="s1"
        f={f}
        ad={ad}
        zoom={{ k, ox: 540, oy: pt.y, tx: 0, ty: (800 - pt.y) * u }}
        momFace={(t) => keys(t, [[0, -0.75], [P.hi, -0.75], [P.hi + 16, -0.62]])}
        momPose={momPose}
      />
      {/* мягкая подложка под заголовком, когда карточка приближена */}
      <div style={box({ left: 0, top: 0, width: 1080, height: 440, background: "linear-gradient(180deg, rgba(247,245,239,1) 0%, rgba(247,245,239,1) 84%, rgba(247,245,239,0) 100%)", opacity: clamp((f - P.head + 6) / 10) * (1 - clamp((f - (P.len - 13)) / 8)) })} />
      {/* до склейки: сначала уходит заголовок, затем подложка открывает шапку
          карточки — она целиком уходит в экран ноутбука */}
      <AdDeskHeadline t={f - P.head} out={P.len - 24 - P.head} />
    </>
  );
};

const AdDeskHeadline: React.FC<{ readonly t: number; readonly out: number }> = ({ t, out }) => <Headline text={EL_TEXT.headline.text} accent={EL_TEXT.headline.accent} t={t} out={out} top={170} size={62} />;
