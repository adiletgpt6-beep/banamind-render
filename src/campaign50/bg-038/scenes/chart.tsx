// «Предметная линейка» на столе (сцены 3–5): четыре ряда шкалы пропусков
// за прошлый месяц. В каждом ряду — карточки пропущенных дней (листки
// календаря; пунктир — необязательный день диапазона), подпись «2–3 күн →»
// и круглый знак процента, растущий от 5 % к 20 %. Над рядами — потолок
// «Эң көп 20%». Координаты — мир стола (px), камера задаётся сценой.
import { fontFamily } from "../../../fonts";
import { clamp, easeOut } from "../../../two-schedules-2d/rig/motion";
import { box } from "../context";
import { BG38_TEXT, BG38_TIERS } from "../script";
import { Chip, DayCard, NAVY, NAVY_SOFT, PercentBadge, YELLOW } from "../sets";

export const ROW = { left: 140, right: 890, h: 230, tops: [1300, 1040, 780, 520] } as const;
export const CEILING_Y = 474;
export const TINTS = ["#FFE7A3", "#FFD866", "#FFC93D", "#FFB300"] as const;
export const CARD = { w: 84, step: 56, x0: 212, dy: 160 } as const;

// Число карточек ряда: сплошные (минимум диапазона) + одна пунктирная.
export const cardsOf = (tier: number) => BG38_TIERS[tier].min + 1;
// Центр карточки i ряда tier (мир).
export const cardPos = (tier: number, i: number) => ({ x: CARD.x0 + i * CARD.step, y: ROW.tops[tier] + CARD.dy });
export const badgePos = (tier: number) => ({ x: 800, y: ROW.tops[tier] + ROW.h / 2, d: 120 + BG38_TIERS[tier].percent * 2.6 });

export type RowState = {
  readonly appear: number; // 0…1 панель ряда
  readonly cardsFrom: number; // кадр, с которого падают карточки
  readonly badge: number; // кадр появления процента
  readonly skipFirst?: boolean; // первая карточка прилетает отдельно
};

// Один ряд шкалы в кадре f.
export const TierRow: React.FC<{ tier: number; f: number; s: RowState; fade?: number; hideCards?: boolean; hot?: number }> = ({ tier, f, s, fade = 1, hideCards, hot = 0 }) => {
  const t = BG38_TIERS[tier];
  const top = ROW.tops[tier];
  const a = clamp(s.appear) * fade;
  if (a <= 0.01) return null;
  const n = cardsOf(tier);
  const b = badgePos(tier);
  const badgeA = clamp((f - s.badge) / 12);
  return (
    <>
      <div
        style={box({
          left: ROW.left,
          top,
          width: ROW.right - ROW.left,
          height: ROW.h,
          borderRadius: 34,
          backgroundColor: "rgba(255,255,255,0.93)",
          boxShadow: "0 14px 30px rgba(110,70,30,0.16)",
          opacity: a,
          translate: `${(1 - easeOut(s.appear)) * -120}px 0`,
          overflow: "hidden",
        })}
      >
        {/* полоса шкалы: ширина ∝ проценту (20 % — во всю ширину) */}
        <div style={box({ left: 0, top: 0, width: (ROW.right - ROW.left) * (t.percent / 20) * easeOut(badgeA * 1.4), height: ROW.h, background: `linear-gradient(90deg, ${TINTS[tier]}88, ${TINTS[tier]}44)` })} />
        <div style={box({ left: 0, top: 0, width: 16, height: ROW.h, backgroundColor: TINTS[tier] })} />
      </div>
      <div
        style={box({
          left: ROW.left + 40,
          top: top + 18,
          fontFamily,
          fontSize: 64,
          fontWeight: 900,
          color: NAVY,
          opacity: a,
          translate: `${(1 - easeOut(s.appear)) * -120}px 0`,
          whiteSpace: "nowrap",
        })}
      >
        {t.label} <span style={{ color: NAVY_SOFT }}>→</span>
      </div>
      {hideCards
        ? null
        : Array.from({ length: n }).map((_, i) => {
            if (i === 0 && s.skipFirst) return null;
            const p = cardPos(tier, i);
            const k = easeOut((f - s.cardsFrom - i * 3) / 9);
            if (k <= 0.01) return null;
            const ghost = i === n - 1;
            return (
              <div key={i} style={box({ left: 0, top: 0, opacity: fade })}>
                <DayCard x={p.x} y={p.y - (1 - k) * 70} w={CARD.w} rot={(1 - k) * (i % 2 ? 18 : -18) + (i % 3) - 1} a={k} ghost={ghost} tint={TINTS[tier]} />
                {ghost && t.max === null ? (
                  <div style={box({ left: p.x - 30, top: p.y - 40, width: 60, textAlign: "center", fontFamily, fontSize: 56, fontWeight: 900, color: NAVY_SOFT, opacity: k })}>+</div>
                ) : null}
              </div>
            );
          })}
      <div style={box({ left: 0, top: 0, opacity: fade })}>
        <PercentBadge x={b.x} y={b.y} d={b.d} percent={t.percent} a={badgeA} hot={hot} />
      </div>
    </>
  );
};

// Потолок шкалы: пунктир на уровне верхнего ряда и подпись «Эң көп 20%».
export const Ceiling: React.FC<{ f: number; at: number; fade?: number }> = ({ f, at, fade = 1 }) => {
  const a = clamp((f - at) / 14) * fade;
  if (a <= 0.01) return null;
  const w = (ROW.right - ROW.left) * easeOut((f - at) / 18);
  return (
    <>
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <line x1={ROW.left} y1={CEILING_Y} x2={ROW.left + w} y2={CEILING_Y} stroke={NAVY} strokeWidth={8} strokeDasharray="26 16" strokeLinecap="round" opacity={a} />
        {/* «крышка» над знаком 20 % */}
        <path d={`M ${badgePos(3).x} ${CEILING_Y + 6} L ${badgePos(3).x} ${ROW.tops[3] + 14}`} stroke={YELLOW} strokeWidth={10} strokeLinecap="round" opacity={a} />
      </svg>
      <Chip text={BG38_TEXT.ceiling} a={a} x={(ROW.left + ROW.right) / 2} y={CEILING_Y - 96} center bg={NAVY} color="#FFFFFF" size={46} />
    </>
  );
};
