import { interpolate } from "remotion";
import { COLORS, FOUNDER_TEXT, SAFE } from "../config";
import { easeOut } from "../components/anim";
import { AdultFigure } from "./icons";
import { PAPER_SHADOW } from "./paper";

const T = FOUNDER_TEXT.chat;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ACCENTS = [COLORS.navy, COLORS.yellow, COLORS.navySoft];
const TIMES = ["08:04", "08:05", "08:05"];
const ENTER = 12;
const incomingColor = "#EFF3FA";

const GroupAvatar: React.FC = () => (
  <svg width={82} height={82} viewBox="0 0 82 82">
    <circle cx={41} cy={41} r={41} fill={COLORS.yellowSoft} />
    {[21, 35, 49, 63].map((x, i) => (
      <g key={x}>
        <circle
          cx={x}
          cy={32}
          r={7}
          fill={COLORS.white}
          stroke={COLORS.navy}
          strokeWidth={2.5}
        />
        <path
          d={`M${x - 9} 56 V51 A9 9 0 0 1 ${x + 9} 51 V56 Z`}
          fill={i % 2 ? COLORS.yellow : COLORS.navy}
          stroke={COLORS.navy}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </g>
    ))}
  </svg>
);

const ReadTicks: React.FC = () => (
  <svg width={36} height={24} viewBox="0 0 36 24">
    <path
      d="M2 12 L9 19 L24 4 M16 16 L19 19 L34 4"
      fill="none"
      stroke={COLORS.navySoft}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Художественная переписка, а не скриншот личных сообщений.
// Имена-обращения, хвостики, время и строка ввода делают сцену чатом.
// Реплики остаются крупными и не превращаются в полосы расписания.
export const FamilyChat: React.FC<{
  readonly frame: number;
  readonly messageAt: readonly number[];
}> = ({ frame, messageAt }) => {
  const enter = interpolate(frame, [ENTER, ENTER + 10], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 105,
        top: SAFE.top,
        width: 825,
        height: 1220,
        borderRadius: 38,
        border: "3px solid #DBE3F0",
        boxSizing: "border-box",
        backgroundColor: COLORS.white,
        overflow: "hidden",
        boxShadow: PAPER_SHADOW,
        opacity: enter,
        translate: `0px ${(1 - enter) * 28}px`,
      }}
    >
      {/* Шапка группового чата. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 144,
          backgroundColor: COLORS.white,
          borderBottom: "3px solid #E5EBF5",
        }}
      >
        <svg
          width={38}
          height={44}
          viewBox="0 0 38 44"
          style={{ position: "absolute", left: 25, top: 50 }}
        >
          <path
            d="M28 7 L12 22 L28 37"
            fill="none"
            stroke={COLORS.navy}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ position: "absolute", left: 88, top: 30 }}>
          <GroupAvatar />
        </div>
        <div style={{ position: "absolute", left: 194, top: 24 }}>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.12 }}>
            {T.title}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 30,
              fontWeight: 600,
              color: COLORS.navySoft,
            }}
          >
            {T.subtitle}
          </div>
        </div>
        <svg
          width={12}
          height={44}
          viewBox="0 0 12 44"
          style={{ position: "absolute", right: 35, top: 50 }}
        >
          {[6, 22, 38].map((y) => (
            <circle key={y} cx={6} cy={y} r={4} fill={COLORS.navy} />
          ))}
        </svg>
      </div>

      {/* Исходящий вопрос справа — причина появления ответов. */}
      <div
        style={{
          position: "absolute",
          left: 220,
          top: 185,
          width: 575,
          height: 184,
          borderRadius: 26,
          borderTopRightRadius: 6,
          backgroundColor: COLORS.yellow,
          boxShadow: "0 5px 12px rgba(20, 40, 90, 0.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -13,
            top: 16,
            width: 28,
            height: 26,
            backgroundColor: COLORS.yellow,
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
        <div
          style={{
            padding: "22px 26px 44px",
            fontSize: 50,
            fontWeight: 800,
            lineHeight: 1.14,
          }}
        >
          {T.question}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 22,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 24,
            fontWeight: 600,
            color: COLORS.navySoft,
          }}
        >
          08:03 <ReadTicks />
        </div>
      </div>

      {/* Три разных отправителя отвечают слева. */}
      {T.messages.map((m, i) => {
        const appear = interpolate(
          frame,
          [messageAt[i], messageAt[i] + 8],
          [0, 1],
          { ...clamp, easing: easeOut },
        );
        const top = 395 + i * 220;
        return (
          <div
            key={m.word}
            style={{
              opacity: appear,
              translate: `${(1 - appear) * -22}px ${(1 - appear) * 12}px`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 24,
                top: top + 28,
                width: 72,
                height: 72,
                borderRadius: "50%",
                backgroundColor: COLORS.yellowSoft,
                border: "3px solid #DBE3F0",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <AdultFigure size={72} accent={ACCENTS[i]} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 112,
                top,
                width: 620,
                height: 180,
                borderRadius: 26,
                borderTopLeftRadius: 6,
                backgroundColor: incomingColor,
                boxShadow: "0 5px 12px rgba(20, 40, 90, 0.06)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -13,
                  top: 16,
                  width: 28,
                  height: 26,
                  backgroundColor: incomingColor,
                  clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 25,
                  top: 16,
                  fontSize: 30,
                  fontWeight: 900,
                  color: COLORS.navySoft,
                }}
              >
                {m.sender}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 25,
                  right: 25,
                  top: 60,
                  fontSize: 56,
                  fontWeight: 800,
                  lineHeight: 1.14,
                }}
              >
                {m.reply}
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 22,
                  bottom: 12,
                  fontSize: 24,
                  fontWeight: 600,
                  color: COLORS.navySoft,
                }}
              >
                {TIMES[i]}
              </div>
            </div>
          </div>
        );
      })}

      {/* Строка ввода закреплена внизу окна. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 110,
          borderTop: "3px solid #E5EBF5",
          backgroundColor: COLORS.white,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "0 22px",
        }}
      >
        <svg width={40} height={40} viewBox="0 0 40 40">
          <path
            d="M20 7 V33 M7 20 H33"
            fill="none"
            stroke={COLORS.navySoft}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            flex: 1,
            backgroundColor: incomingColor,
            borderRadius: 999,
            padding: "12px 26px",
            fontSize: 38,
            fontWeight: 600,
            color: COLORS.navySoft,
          }}
        >
          {T.placeholder}
        </div>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: COLORS.navy,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={38} height={38} viewBox="0 0 38 38">
            <path
              d="M6 7 L32 19 L6 31 L11 19 Z M12 19 H30"
              fill="none"
              stroke={COLORS.white}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
