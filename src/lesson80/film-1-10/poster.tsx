// Общий плакат (A1 горизонтально, мм): лист, заголовок маркером учителя,
// две текстовые карточки учителя, 25 детских карточек и полоски крепления.
// Один и тот же рисунок во всех видах: на столе (вид сверху и сжатый
// перспективой в комнате), в руках учителя и на доске. Состояние задаёт
// план фильма (plan.ts) — компонент только рисует.
import { fontFamily } from "../../fonts";
import { CardFace } from "./drawings";
import { CARD_MM, CARD_UNITS, POSTER, POSTER_TITLE, type Vec } from "./layout";
import type { DrawingKind } from "./roster";
import { POSTER_TEXT } from "./script";
import { TEXT_CARD_FONT, textCardLen, textCardSize, TITLE_LEN, TITLE_X0 } from "./posterText";

export const PAPER = "#FBF8EF";
export const PAPER_EDGE = "#DCD3C0";
export const TITLE_INK = "#2C4A84"; // синий маркер учителя
export const CARD_INK = "#2F6B4F"; // зелёный маркер текстовых карточек
const TAPE = "#F3E6BC";
const TAPE_EDGE = "#DCCB93";

export type PosterCard = {
  readonly id: string;
  readonly kind: DrawingKind;
  readonly pos: Vec; // центр, мм плаката
  readonly rot: number;
  readonly tape: number; // 0…2 — сколько полосок уже прижато (дробное — полоска опускается)
  readonly progress?: number;
  readonly boat?: number;
  readonly caption?: number;
};
export type TextCardOnPoster = { readonly pos: Vec; readonly rot: number; readonly tape: number };
export type PosterView = {
  readonly title: number; // 0…1 — доля написанного заголовка
  readonly one: TextCardOnPoster | null;
  readonly two: TextCardOnPoster | null;
  readonly cards: readonly PosterCard[];
};

export const EMPTY_POSTER: PosterView = { title: 0, one: null, two: null, cards: [] };

// Полоска крепления: появляется сверху и прижимается (k 0…1).
export const TapeStrip: React.FC<{ readonly x: number; readonly y: number; readonly rot: number; readonly k: number; readonly w?: number }> = ({ x, y, rot, k, w = 20 }) => {
  if (k <= 0) return null;
  const lift = (1 - Math.min(1, k)) * 6;
  return (
    <g transform={`translate(${x} ${y - lift}) rotate(${rot})`} opacity={Math.min(1, k * 2.5)}>
      <rect x={-w / 2} y={-3.6} width={w} height={7.2} rx={0.8} fill={TAPE} stroke={TAPE_EDGE} strokeWidth={0.5} opacity={0.88} />
      <path d={`M ${-w / 2} -3.6 l 1.2 1.8 l -1.2 1.8 l 1.2 1.8 l -1.2 1.8 M ${w / 2} -3.6 l -1.2 1.8 l 1.2 1.8 l -1.2 1.8 l 1.2 1.8`} stroke={TAPE_EDGE} strokeWidth={0.4} fill="none" />
    </g>
  );
};

// Текстовая карточка учителя (мм; начало координат — центр). Лицо или оборот.
export const TextCardFace: React.FC<{ readonly which: "one" | "two"; readonly back?: boolean }> = ({ which, back = false }) => {
  const s = textCardSize(which);
  const text = which === "one" ? POSTER_TEXT.one : POSTER_TEXT.noBeginning;
  return (
    <g>
      <rect x={-s.w / 2} y={-s.h / 2} width={s.w} height={s.h} rx={2.5} fill={back ? "#F1EBDD" : "#FFFBEF"} stroke="#D6CCB5" strokeWidth={0.8} />
      {back ? (
        <path d={`M ${-s.w / 2 + 8} ${-s.h / 2 + 8} L ${s.w / 2 - 8} ${-s.h / 2 + 8}`} stroke="#E4DCC8" strokeWidth={0.6} />
      ) : (
        <text x={0} y={TEXT_CARD_FONT * 0.36} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={TEXT_CARD_FONT} fill={CARD_INK} textLength={textCardLen(which)} lengthAdjust="spacingAndGlyphs">
          {text}
        </text>
      )}
    </g>
  );
};

// Детская карточка на плакате (мм; центр в pos).
const CardOnSheet: React.FC<{ readonly c: PosterCard; readonly uid: string }> = ({ c, uid }) => {
  const k = CARD_MM.w / CARD_UNITS.w;
  const t1 = Math.max(0, Math.min(1, c.tape));
  const t2 = Math.max(0, Math.min(1, c.tape - 1));
  return (
    <g transform={`translate(${c.pos.x} ${c.pos.y}) rotate(${c.rot})`}>
      <rect x={-CARD_MM.w / 2 + 0.8} y={-CARD_MM.h / 2 + 1.4} width={CARD_MM.w} height={CARD_MM.h} rx={1.5} fill="#000" opacity={0.08} />
      <g transform={`translate(${-CARD_MM.w / 2} ${-CARD_MM.h / 2}) scale(${k})`}>
        <CardFace kind={c.kind} progress={c.progress ?? 1} boat={c.boat} caption={c.caption} uid={`${uid}-${c.id}`} />
      </g>
      <TapeStrip x={-CARD_MM.w / 2 + 4} y={-CARD_MM.h / 2 + 3} rot={-38} k={t1} w={18} />
      <TapeStrip x={CARD_MM.w / 2 - 4} y={-CARD_MM.h / 2 + 3} rot={38} k={t2} w={18} />
    </g>
  );
};

// upsideDownText — для листа, который в комнате нарисован отражённым по
// глубине (PosterProp): надписи дополнительно отражаются по горизонтали, и в
// сумме читаются перевёрнутыми на 180°, как лист, лежащий к зрителю верхом.
export const PosterContent: React.FC<{ readonly v: PosterView; readonly uid: string; readonly sheet?: boolean; readonly upsideDownText?: boolean }> = ({ v, uid, sheet = true, upsideDownText = false }) => {
  const clip = `${uid}-title`;
  const mirrorX = (cx: number) => (upsideDownText ? `translate(${2 * cx} 0) scale(-1 1)` : undefined);
  const tp = Math.max(0, Math.min(1, v.title));
  return (
    <g>
      {sheet ? (
        <>
          <rect x={2} y={4} width={POSTER.w} height={POSTER.h} rx={3} fill="#000" opacity={0.1} />
          <rect x={0} y={0} width={POSTER.w} height={POSTER.h} rx={3} fill={PAPER} stroke={PAPER_EDGE} strokeWidth={1.4} />
          <rect x={10} y={10} width={POSTER.w - 20} height={POSTER.h - 20} rx={2} fill="none" stroke="#EFE8D8" strokeWidth={1} />
        </>
      ) : null}
      {tp > 0 ? (
        <g transform={mirrorX(POSTER_TITLE.cx)}>
          <defs>
            <clipPath id={clip}>
              <rect x={TITLE_X0 - 6} y={POSTER_TITLE.top - 10} width={tp >= 1 ? TITLE_LEN + 20 : tp * TITLE_LEN + 4} height={POSTER_TITLE.bottom - POSTER_TITLE.top + 24} />
            </clipPath>
          </defs>
          <text
            x={POSTER_TITLE.cx}
            y={POSTER_TITLE.baseline}
            textAnchor="middle"
            fontFamily={fontFamily}
            fontWeight={800}
            fontSize={POSTER_TITLE.size}
            fill={TITLE_INK}
            textLength={TITLE_LEN}
            lengthAdjust="spacingAndGlyphs"
            clipPath={`url(#${clip})`}
          >
            {POSTER_TEXT.title}
          </text>
        </g>
      ) : null}
      {(["one", "two"] as const).map((w) => {
        const c = v[w];
        if (!c) return null;
        const s = textCardSize(w);
        return (
          <g key={w} transform={`translate(${c.pos.x} ${c.pos.y}) rotate(${c.rot})`}>
            <rect x={-s.w / 2 + 0.8} y={-s.h / 2 + 1.4} width={s.w} height={s.h} rx={2.5} fill="#000" opacity={0.08} />
            <g transform={mirrorX(0)}>
              <TextCardFace which={w} />
            </g>
            <TapeStrip x={-s.w / 2 + 3} y={0} rot={90} k={Math.min(1, c.tape)} w={22} />
            <TapeStrip x={s.w / 2 - 3} y={0} rot={90} k={Math.max(0, Math.min(1, c.tape - 1))} w={22} />
          </g>
        );
      })}
      {v.cards.map((c) => (
        <CardOnSheet key={c.id} c={c} uid={uid} />
      ))}
    </g>
  );
};
