// Разделение задачи (сцена 10): «Балдарга кам көрүү» и «Мектептен үйгө
// жеткирүү». При split = 0 — одна белая карточка (тот же стиль, что
// AdCard: белый фон, радиус 28, мягкая тень) с тонким разделителем; при
// split = 1 — две отдельные карточки одна над другой с промежутком.
// На карточке заботы — взрослый и ребёнок (без машины); на карточке
// дороги — школа → дом (стрелка SVG). Водитель няней не изображается.
//
// Макет шириной 900 px, масштабируется до w. Центр пары неподвижен:
// верхняя карточка уходит вверх, нижняя — вниз (splitLayout).
// Переход из объявления: SplitCards поверх AdCard в той же точке x/y и той
// же ширины, fromH = adLayout(w).h; style.opacity 0 → 1 (оболочка закрывает
// текст объявления), затем morph 0 → 1, затем split 0 → 1.
import { Arrow } from "../kit";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { EL_TEXT } from "../script";
import { C, F, RADIUS, SHADOW } from "../theme";

export const SPLIT_W = 900;
const PH = 236; // высота половины
const GAP = 44; // промежуток при split = 1
const PAD = 44;
const TILE_W = 220;
const TILE_H = 148;
const TEXT_X = PAD + TILE_W + 36;

export type SplitLayout = {
  readonly scale: number;
  readonly h: number; // высота слитой карточки (split = 0), px
  readonly care: { readonly y: number; readonly h: number }; // от верха слитой карточки (может быть < 0)
  readonly route: { readonly y: number; readonly h: number };
};

export const splitLayout = (w: number, split: number): SplitLayout => {
  const s = w / SPLIT_W;
  const e = easeInOut(clamp(split));
  return {
    scale: s,
    h: 2 * PH * s,
    care: { y: (-GAP / 2) * e * s, h: PH * s },
    route: { y: (PH + (GAP / 2) * e) * s, h: PH * s },
  };
};

// Взрослый и ребёнок держатся за руки, над ними — маленькое сердце.
const CareIcon: React.FC = () => (
  <svg width={TILE_W} height={TILE_H} viewBox={`0 0 ${TILE_W} ${TILE_H}`}>
    <rect x={0} y={0} width={TILE_W} height={TILE_H} rx={RADIUS.inner} fill={C.yellowSoft} />
    <path d="M 30 128 L 190 128" stroke="rgba(23,38,61,0.10)" strokeWidth={3} strokeLinecap="round" />
    {/* взрослый */}
    <circle cx={86} cy={44} r={19} fill="#8E6A7E" />
    <path d="M 56 128 L 56 92 Q 56 70 78 68 L 94 68 Q 116 70 116 92 L 116 128 Z" fill="#8E6A7E" />
    {/* ребёнок */}
    <circle cx={146} cy={76} r={14} fill="#E59A80" />
    <path d="M 126 128 L 126 108 Q 126 94 140 93 L 152 93 Q 166 94 166 108 L 166 128 Z" fill="#E59A80" />
    {/* руки */}
    <path d="M 114 98 Q 122 108 130 104" stroke="#8E6A7E" strokeWidth={8} fill="none" strokeLinecap="round" />
    {/* сердце */}
    <path d="M 116 40 C 116 33 107 31 104.5 37 C 102 31 93 33 93 40 C 93 47 104.5 53 104.5 53 C 104.5 53 116 47 116 40 Z" transform="translate(16 -14)" fill={C.yellowDeep} />
  </svg>
);

// Школа → дом.
const RouteIcon: React.FC = () => (
  <div style={{ position: "relative", width: TILE_W, height: TILE_H }}>
    <svg width={TILE_W} height={TILE_H} viewBox={`0 0 ${TILE_W} ${TILE_H}`} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect x={0} y={0} width={TILE_W} height={TILE_H} rx={RADIUS.inner} fill={C.sky} />
      <path d="M 18 124 L 202 124" stroke="rgba(23,38,61,0.12)" strokeWidth={3} strokeLinecap="round" />
      {/* школа */}
      <path d="M 52 20 L 52 38" stroke={C.inkSoft} strokeWidth={3} strokeLinecap="round" />
      <path d="M 53 21 L 68 26 L 53 31 Z" fill={C.yellowDeep} />
      <path d="M 22 62 L 52 40 L 82 62 Z" fill={C.greyBlue} />
      <rect x={26} y={62} width={52} height={62} fill={C.white} />
      <rect x={33} y={72} width={13} height={13} rx={2} fill={C.glass} />
      <rect x={58} y={72} width={13} height={13} rx={2} fill={C.glass} />
      <rect x={44} y={98} width={16} height={26} rx={3} fill={C.greyBlue} />
      {/* дом */}
      <path d="M 136 74 L 166 50 L 196 74 Z" fill={C.wood} />
      <rect x={141} y={74} width={50} height={50} fill={C.white} />
      <rect x={160} y={98} width={13} height={26} rx={3} fill={C.woodDark} />
      <rect x={146} y={82} width={10} height={10} rx={2} fill="#FFE7A6" />
    </svg>
    <div style={{ position: "absolute", left: 92, top: 74 }}>
      <Arrow size={38} color={C.inkSoft} />
    </div>
  </div>
);

const Part: React.FC<{
  readonly icon: React.ReactNode;
  readonly text: string;
}> = ({ icon, text }) => (
  <>
    <div style={{ position: "absolute", left: PAD, top: (PH - TILE_H) / 2 }}>{icon}</div>
    <div
      style={{
        position: "absolute",
        left: TEXT_X,
        width: SPLIT_W - TEXT_X - PAD,
        top: 0,
        height: PH,
        display: "flex",
        alignItems: "center",
        fontSize: 52,
        fontWeight: 800,
        lineHeight: 1.14,
        letterSpacing: -0.3,
        color: C.ink,
      }}
    >
      {text}
    </div>
  </>
);

export type SplitCardsProps = {
  readonly split: number; // 0 — одна карточка, 1 — две отдельные
  readonly reveal?: number; // 0…1: вход
  readonly w?: number; // ширина, px (макет — 900)
  readonly x?: number;
  readonly y?: number; // верх слитой карточки
  // Морфинг из другой карточки (AdCard → SplitCards): fromH — её высота в
  // px (adLayout(w).h), morph 0…1 — белая оболочка меняет высоту fromH →
  // высота пары, содержимое проявляется во второй половине. Пока morph < 1,
  // split не действует.
  readonly fromH?: number;
  readonly morph?: number;
  readonly style?: React.CSSProperties;
};

export const SplitCards: React.FC<SplitCardsProps> = ({ split, reveal = 1, w = SPLIT_W, x = 0, y = 0, fromH, morph = 1, style }) => {
  const s = w / SPLIT_W;
  const mo = clamp(morph);
  const e = mo < 1 ? 0 : easeInOut(clamp(split));
  const r = RADIUS.card * e;
  const topY = (-GAP / 2) * e;
  const botY = PH + (GAP / 2) * e;
  const k = easeOut(clamp(reveal));
  // морфинг из другой карточки: оболочка меняет высоту fromH → 472,
  // содержимое проявляется во второй половине
  const shellH = lerp(fromH !== undefined ? fromH / s : 2 * PH, 2 * PH, easeInOut(mo));
  const content = clamp((mo - 0.5) / 0.5);
  const cardBase: React.CSSProperties = { position: "absolute", left: 0, width: SPLIT_W, height: PH, backgroundColor: C.card, overflow: "hidden" };
  const divider = <div style={{ position: "absolute", left: PAD, right: PAD, top: PH - 1, height: 2, backgroundColor: C.line, opacity: 1 - clamp(e * 3) }} />;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 2 * PH * s, ...style, opacity: clamp(reveal / 0.6) * Number(style?.opacity ?? 1) }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SPLIT_W, height: 2 * PH, transform: `translateY(${(1 - k) * 60}px) scale(${s})`, transformOrigin: "0 0", fontFamily: F.text }}>
        {mo < 1 ? (
          <div style={{ position: "absolute", left: 0, top: 0, width: SPLIT_W, height: shellH, borderRadius: RADIUS.card, boxShadow: SHADOW.card, backgroundColor: C.card, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, opacity: content }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: SPLIT_W, height: PH }}>
                <Part icon={<CareIcon />} text={EL_TEXT.split.care} />
              </div>
              <div style={{ position: "absolute", left: 0, top: PH, width: SPLIT_W, height: PH }}>
                <Part icon={<RouteIcon />} text={EL_TEXT.split.route} />
              </div>
              {divider}
            </div>
          </div>
        ) : (
          <>
            {/* тени: общая (слитая) ↔ отдельные */}
            <div style={{ position: "absolute", left: 0, top: 0, width: SPLIT_W, height: 2 * PH, borderRadius: RADIUS.card, boxShadow: SHADOW.card, opacity: 1 - e }} />
            <div style={{ position: "absolute", left: 0, top: topY, width: SPLIT_W, height: PH, borderRadius: RADIUS.card, boxShadow: SHADOW.card, opacity: e }} />
            <div style={{ position: "absolute", left: 0, top: botY, width: SPLIT_W, height: PH, borderRadius: RADIUS.card, boxShadow: SHADOW.card, opacity: e }} />
            {/* карточки */}
            <div style={{ ...cardBase, top: topY, borderRadius: `${RADIUS.card}px ${RADIUS.card}px ${r}px ${r}px` }}>
              <Part icon={<CareIcon />} text={EL_TEXT.split.care} />
            </div>
            <div style={{ ...cardBase, top: botY, borderRadius: `${r}px ${r}px ${RADIUS.card}px ${RADIUS.card}px` }}>
              <Part icon={<RouteIcon />} text={EL_TEXT.split.route} />
            </div>
            {divider}
          </>
        )}
      </div>
    </div>
  );
};
