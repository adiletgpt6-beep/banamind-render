import { interpolate, useVideoConfig } from "remotion";
import { COLORS, SAFE, TQ_TEXT, TQ_TIMING } from "../config";
import { easeInOut } from "../components/anim";
import { MorningIcon } from "../morning-rush/icons";
import { AdultFigure } from "../founder-story/icons";
import { PAPER_SHADOW, Tape } from "../founder-story/paper";

// Общие элементы шестого ролика: ряд из трёх карточек памятки, большая
// карточка вопроса, которая «разворачивается» из маленькой, и иконки.
// Карточки меняют размер через ширину/высоту (а не растяжение), поэтому
// на любом промежуточном кадре сохраняют целую форму, а текст внутри
// появляется только после того, как карточка раскрылась.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Длительность перехода между сценами (кадры) — см. TQ_TIMING.
export const ENTER = TQ_TIMING.transitionFrames;

export type Rect = { x: number; y: number; w: number; h: number };
export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});

// Ряд из трёх маленьких карточек вверху кадра.
const MINI = { w: 220, h: 116, gap: 24, y: SAFE.top - 6 };
export const miniRect = (i: number): Rect => {
  const total = 3 * MINI.w + 2 * MINI.gap;
  return {
    x: (1080 - total) / 2 + i * (MINI.w + MINI.gap),
    y: MINI.y,
    w: MINI.w,
    h: MINI.h,
  };
};
// Большая карточка вопроса.
export const BIG: Rect = { x: 120, y: SAFE.top + 150, w: 810, h: 960 };

export const CARD_ICONS = ["driver", "route", "phone"] as const;

// Номер в жёлтом круге.
export const NumberBadge: React.FC<{
  readonly n: number;
  readonly size?: number;
  readonly inverted?: boolean;
}> = ({ n, size = 96, inverted = false }) => (
  <div
    style={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: "50%",
      backgroundColor: inverted ? COLORS.navy : COLORS.yellow,
      color: inverted ? COLORS.yellow : COLORS.navy,
      fontSize: size * 0.56,
      fontWeight: 900,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {n}
  </div>
);

// Иконка темы карточки (водитель / маршрут / телефон).
export const TopicIcon: React.FC<{
  readonly kind: (typeof CARD_ICONS)[number];
  readonly size: number;
}> = ({ kind, size }) =>
  kind === "driver" ? (
    <AdultFigure size={size} accent={COLORS.navy} />
  ) : kind === "route" ? (
    <MorningIcon kind="school" size={size * 0.85} />
  ) : (
    <PhoneIcon size={size * 0.85} />
  );

// Лицевая сторона маленькой карточки: номер и иконка темы.
// closed — жёлтая (вопрос ещё впереди), иначе — белая.
export const MiniFace: React.FC<{
  readonly index: number;
  readonly closed: boolean;
  readonly vertical?: boolean;
}> = ({ index, closed, vertical = false }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: vertical ? "column" : "row",
      alignItems: "center",
      justifyContent: "center",
      gap: vertical ? 6 : 14,
    }}
  >
    <NumberBadge n={TQ_TEXT.cards[index].n} size={62} inverted={closed} />
    <TopicIcon kind={CARD_ICONS[index]} size={vertical ? 60 : 70} />
  </div>
);

// Ряд памятки вверху кадра: пройденные карточки — белые, будущие — жёлтые.
// Ряд виден с первого кадра сцены: им же заканчивается предыдущая сцена,
// поэтому на переходе нет ни пустых кадров, ни наложений.
export const MiniRow: React.FC<{
  readonly active: number;
  readonly hide?: readonly number[];
}> = ({ active, hide = [] }) => (
  <>
    {TQ_TEXT.cards.map((c, i) => {
      if (hide.includes(i)) return null;
      const r = miniRect(i);
      const closed = i > active;
      return (
        <div
          key={c.n}
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            boxSizing: "border-box",
            borderRadius: 20,
            backgroundColor: closed ? COLORS.yellow : COLORS.white,
            border: `5px solid ${closed ? COLORS.yellow : COLORS.block}`,
            boxShadow: PAPER_SHADOW,
          }}
        >
          <MiniFace index={i} closed={closed} />
        </div>
      );
    })}
  </>
);

// Большая карточка вопроса: разворачивается из маленькой карточки ряда
// (после перехода), а в конце сцены сворачивается обратно в ряд — так
// следующая сцена начинается с того же кадра. Размер меняется через
// ширину/высоту, текст виден только у полностью раскрытой карточки.
export const useCardOpen = (frame: number, index: number) => {
  const { durationInFrames } = useVideoConfig();
  const T = ENTER;
  // карточка начинает раскрываться сразу, пока идёт переход: на
  // предыдущем кадре ряд выглядит так же, поэтому наложений нет
  const O = 0;
  const open = interpolate(frame, [O, O + 18], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const endAt = durationInFrames - T; // начало перехода к следующей сцене
  const contentOut = interpolate(
    frame,
    [endAt - 20, endAt - 14],
    [0, 1],
    clamp,
  );
  const shrink = interpolate(frame, [endAt - 14, endAt], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const size = open * (1 - shrink);
  const rect = lerpRect(miniRect(index), BIG, size);
  const content =
    interpolate(frame, [O + 18, O + 28], [0, 1], clamp) * (1 - contentOut);
  return { open, shrink, size, rect, content, ready: O + 18, endAt };
};

export const BigCard: React.FC<{
  readonly frame: number;
  readonly index: number;
  readonly children: React.ReactNode;
}> = ({ frame, index, children }) => {
  const { open, shrink, size, rect, content } = useCardOpen(frame, index);
  const c = TQ_TEXT.cards[index];
  // до раскрытия — закрытая жёлтая карточка, после сворачивания — белая
  const closed = open < 0.25 && shrink === 0;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        boxSizing: "border-box",
        borderRadius: 20 + 16 * size,
        backgroundColor: closed ? COLORS.yellow : COLORS.white,
        border: `5px solid ${shrink > 0.9 ? COLORS.block : COLORS.yellow}`,
        boxShadow: PAPER_SHADOW,
      }}
    >
      {/* скотч — вместе с содержимым */}
      <div style={{ opacity: content }}>
        <Tape width={160} rotate={-4} style={{ top: -22, left: 60 }} />
        <Tape width={160} rotate={5} style={{ top: -22, right: 60 }} />
      </div>
      {/* номер и иконка — пока карточка меняет размер */}
      <div style={{ opacity: content > 0 ? 0 : 1 }}>
        <MiniFace index={index} closed={closed} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: content }}>
        {/* заголовок вопроса */}
        <div
          style={{
            position: "absolute",
            left: 36,
            right: 36,
            top: 40,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <NumberBadge n={c.n} size={104} />
          <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.08 }}>
            {c.question}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

const line = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Телефон (контур).
export const PhoneIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size * 0.62} height={size} viewBox="0 0 40 64">
    <rect
      x={3}
      y={3}
      width={34}
      height={58}
      rx={8}
      stroke={COLORS.navy}
      strokeWidth={5}
      {...line}
    />
    <path d="M15 52 H25" stroke={COLORS.navy} strokeWidth={5} {...line} />
  </svg>
);

// «Разговор»: облачко с тремя точками.
export const SpeechIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path
      d="M10 14 H54 A6 6 0 0 1 60 20 V40 A6 6 0 0 1 54 46 H28 L16 56 V46 H10 A6 6 0 0 1 4 40 V20 A6 6 0 0 1 10 14 Z"
      fill={COLORS.white}
      stroke={COLORS.navy}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    {[20, 32, 44].map((x) => (
      <circle key={x} cx={x} cy={30} r={4} fill={COLORS.navy} />
    ))}
  </svg>
);

// Сообщение (конверт-облачко) и звонок (трубка) — кнопки контакта.
export const MessageGlyph: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path
      d="M12 16 H52 A6 6 0 0 1 58 22 V40 A6 6 0 0 1 52 46 H26 L14 54 V46 H12 A6 6 0 0 1 6 40 V22 A6 6 0 0 1 12 16 Z"
      stroke={COLORS.navy}
      strokeWidth={5}
      {...line}
    />
  </svg>
);
export const CallGlyph: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path
      d="M20 10 L28 22 L22 28 C25 35 29 39 36 42 L42 36 L54 44 L50 54 C30 54 10 34 10 14 Z"
      fill={COLORS.navy}
      stroke={COLORS.navy}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  </svg>
);

// Метка адреса.
export const PinIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 48 60">
    <path
      d="M24 57 C24 57 4 34 4 22 A20 20 0 0 1 44 22 C44 34 24 57 24 57 Z"
      fill={COLORS.yellow}
      stroke={COLORS.navy}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <circle
      cx={24}
      cy={22}
      r={7}
      fill={COLORS.white}
      stroke={COLORS.navy}
      strokeWidth={4}
    />
  </svg>
);

// Часы без цифр — иллюстрация «времени», не расписание.
export const ClockFace: React.FC<{
  readonly size: number;
  readonly hour: number; // угол часовой стрелки, градусы
  readonly minute: number; // угол минутной стрелки, градусы
  readonly ring?: string;
}> = ({ size, hour, minute, ring = COLORS.navy }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle
      cx={32}
      cy={32}
      r={28}
      fill={COLORS.white}
      stroke={ring}
      strokeWidth={5}
    />
    {[0, 90, 180, 270].map((a) => (
      <path
        key={a}
        d="M32 9 V14"
        stroke={COLORS.navySoft}
        strokeWidth={4}
        strokeLinecap="round"
        transform={`rotate(${a} 32 32)`}
      />
    ))}
    <path
      d="M32 32 V19"
      stroke={COLORS.navy}
      strokeWidth={5}
      strokeLinecap="round"
      transform={`rotate(${hour} 32 32)`}
    />
    <path
      d="M32 32 V13"
      stroke={COLORS.yellow}
      strokeWidth={4}
      strokeLinecap="round"
      transform={`rotate(${minute} 32 32)`}
    />
    <circle cx={32} cy={32} r={4} fill={COLORS.navy} />
  </svg>
);
