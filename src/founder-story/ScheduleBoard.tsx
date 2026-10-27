import { interpolate } from "remotion";
import { COLORS, FOUNDER_TEXT, SAFE } from "../config";
import { Backpack } from "../morning-rush/icons";
import { AdultFigure } from "./icons";
import { Paper, Tape } from "./paper";

// Семейный чат, который раскрывается в расписание (сцены chat и trust).
// Это художественная иллюстрация ситуации, а не реальная переписка.

const T = FOUNDER_TEXT.chat;
export const BOARD = {
  left: 120,
  width: 810,
  headerTop: SAFE.top + 10,
  rowTop: SAFE.top + 190,
  rowH: 140,
  rowGap: 34,
  // дорожка времени внутри строки
  trackX: 356,
  trackW: 430,
  // «школьное» окно на дорожке (доли ширины)
  slot: [0.26, 0.46] as const,
};
// Занятые отрезки у троих взрослых: все перекрывают школьное окно.
const BUSY: readonly (readonly [number, number])[][] = [
  [
    [0.0, 0.55],
    [0.7, 1.0],
  ],
  [[0.14, 0.62]],
  [
    [0.04, 0.5],
    [0.64, 0.92],
  ],
];
const ACCENTS = [COLORS.navy, COLORS.yellow, COLORS.navySoft];

export const rowY = (i: number) =>
  BOARD.rowTop + i * (BOARD.rowH + BOARD.rowGap);
// Центр пустого школьного окна в кадре (для камеры сцены trust).
export const SLOT_CENTER = {
  x:
    BOARD.left +
    BOARD.trackX +
    BOARD.trackW * ((BOARD.slot[0] + BOARD.slot[1]) / 2),
  y: rowY(3) + BOARD.rowH / 2,
};

export const ScheduleBoard: React.FC<{
  readonly frame: number;
  // кадры появления трёх сообщений
  readonly messageAt: readonly number[];
  // 0…1 — сообщения раскрываются в расписание
  readonly unfold: number;
  // 0…1 — подсветка пустого школьного окна
  readonly slotGlow?: number;
  // кадр появления шапки чата (после перехода между сценами)
  readonly headerAt?: number;
}> = ({ frame, messageAt, unfold, slotGlow = 0, headerAt = 0 }) => {
  const u = unfold;
  return (
    <>
      {/* шапка чата */}
      <Paper
        style={{
          left: BOARD.left,
          width: BOARD.width,
          top: BOARD.headerTop,
          height: 120,
          opacity: interpolate(frame, [headerAt, headerAt + 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "0 30px",
          rotate: "-1deg",
        }}
      >
        <Tape width={120} rotate={-5} style={{ top: -20, left: 330 }} />
        <div style={{ display: "flex" }}>
          {[...ACCENTS, COLORS.yellow].map((c, i) => (
            <div
              key={i}
              style={{
                width: 70,
                height: 70,
                marginLeft: i ? -18 : 0,
                borderRadius: "50%",
                backgroundColor: COLORS.white,
                border: `4px solid ${COLORS.block}`,
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <AdultFigure size={66} accent={c} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 58, fontWeight: 900 }}>{T.title}</div>
      </Paper>

      {/* три реплики → три строки расписания */}
      {T.messages.map((m, i) => {
        const at = messageAt[i];
        const appear = interpolate(frame, [at, at + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const bubbleW = 580;
        const w = bubbleW + (BOARD.width - bubbleW) * u;
        return (
          <Paper
            key={m.text}
            style={{
              left: BOARD.left,
              top: rowY(i),
              width: w,
              height: BOARD.rowH,
              borderRadius: 28 + 8 * (1 - u),
              borderTopLeftRadius: 8 + 20 * u,
              opacity: appear,
              translate: `${(1 - appear) * -40}px 0px`,
              overflow: "hidden",
            }}
          >
            {/* аватар */}
            <div
              style={{
                position: "absolute",
                left: 20,
                top: (BOARD.rowH - 84) / 2,
                width: 84,
                height: 84,
                borderRadius: "50%",
                backgroundColor: COLORS.yellowSoft,
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <AdultFigure size={80} accent={ACCENTS[i]} />
            </div>
            {/* текст: крупно в чате, мельче в расписании */}
            <div
              style={{
                position: "absolute",
                left: 124,
                top: 0,
                height: BOARD.rowH,
                display: "flex",
                alignItems: "center",
                fontSize: 54 - 24 * u,
                fontWeight: 900,
                lineHeight: 1,
                width: 200 + 300 * (1 - u),
              }}
            >
              {m.text}
            </div>
            {/* дорожка времени с занятыми отрезками */}
            <div
              style={{
                position: "absolute",
                left: BOARD.trackX,
                top: 36,
                width: BOARD.trackW,
                height: BOARD.rowH - 72,
                borderRadius: 14,
                backgroundColor: COLORS.sky,
                opacity: Math.max(0, u * 2 - 1),
              }}
            >
              {BUSY[i].map(([a, b], k) => (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    left: `${a * 100}%`,
                    width: `${(b - a) * 100 * Math.max(0, u * 2 - 1)}%`,
                    top: 0,
                    bottom: 0,
                    borderRadius: 14,
                    backgroundColor: COLORS.navy,
                  }}
                />
              ))}
            </div>
          </Paper>
        );
      })}

      {/* строка «Мектеп» с пустым окном */}
      <Paper
        style={{
          left: BOARD.left,
          top: rowY(3),
          width: BOARD.width,
          height: BOARD.rowH,
          opacity: interpolate(u, [0.4, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          border: `4px solid ${COLORS.yellow}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 26,
            top: 22,
          }}
        >
          <Backpack size={80} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 124,
            top: 0,
            height: BOARD.rowH,
            display: "flex",
            alignItems: "center",
            fontSize: 34,
            fontWeight: 900,
          }}
        >
          {T.school}
        </div>
        <div
          style={{
            position: "absolute",
            left: BOARD.trackX,
            top: 36,
            width: BOARD.trackW,
            height: BOARD.rowH - 72,
            borderRadius: 14,
            backgroundColor: COLORS.sky,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `${BOARD.slot[0] * 100}%`,
              width: `${(BOARD.slot[1] - BOARD.slot[0]) * 100}%`,
              top: -8,
              bottom: -8,
              borderRadius: 14,
              border: `5px dashed ${COLORS.navy}`,
              backgroundColor: `rgba(255, 201, 14, ${0.25 + 0.55 * slotGlow})`,
              boxShadow: slotGlow
                ? `0 0 ${30 * slotGlow}px rgba(255, 201, 14, 0.9)`
                : "none",
            }}
          />
        </div>
      </Paper>

      {/* вертикальная полоса школьного времени через все строки */}
      <div
        style={{
          position: "absolute",
          left: BOARD.left + BOARD.trackX + BOARD.trackW * BOARD.slot[0],
          width: BOARD.trackW * (BOARD.slot[1] - BOARD.slot[0]),
          top: rowY(0) - 10,
          height: rowY(3) - rowY(0),
          borderRadius: 16,
          backgroundColor: "rgba(255, 201, 14, 0.22)",
          opacity: interpolate(u, [0.6, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </>
  );
};
