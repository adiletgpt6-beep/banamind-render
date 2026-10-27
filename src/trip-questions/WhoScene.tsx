import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, TQ_TEXT } from "../config";
import { fontFamily } from "../fonts";
import { easeOut } from "../components/anim";
import { AdultFigure, WheelIcon } from "../founder-story/icons";
import { DotGrid, Marker, drop } from "../founder-story/paper";
import { useTimeline } from "../TimelineContext";
import { wordCue } from "../timeline";
import { BigCard, MiniRow, SpeechIcon, useCardOpen } from "./parts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = TQ_TEXT.who;

// 6–16 с: «1. Баланы ким жеткирет?» — карточка раскрывается как досье:
// силуэт водителя, значок разговора и два пункта, которые маркер
// выделяет по словам «таанышып» и «тажрыйбасын». Общая памятка: без
// выдуманных сведений и отметок о «проверках».
export const WhoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const timeline = useTimeline();
  const { ready } = useCardOpen(frame, 0);

  const pointAt = T.points.map((p, i) =>
    Math.max(
      ready + 8 + i * 14,
      wordCue(timeline, "tqWho", p.word, ready + 30 + i * 30) - 6,
    ),
  );
  const marks = pointAt.map((at) =>
    interpolate(frame, [at + 4, at + 16], [0, 1], {
      ...clamp,
      easing: easeOut,
    }),
  );

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <MiniRow active={0} hide={[0]} />
      <BigCard frame={frame} index={0}>
        {/* досье: силуэт водителя + значок разговора */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 220,
            width: 300,
            height: 330,
            borderRadius: 28,
            backgroundColor: COLORS.sky,
            border: `4px dashed ${COLORS.navySoft}`,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <AdultFigure size={270} accent={COLORS.navy} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 270,
            top: 190,
            ...drop(frame, ready + 6, 4, 30),
          }}
        >
          <SpeechIcon size={120} />
        </div>
        {/* нейтральные строки досье — без выдуманных данных */}
        {[0, 1, 2].map((k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 390,
              top: 300 + k * 64,
              width: [340, 260, 300][k],
              height: 26,
              borderRadius: 13,
              backgroundColor: COLORS.block,
            }}
          />
        ))}

        {/* два пункта памятки */}
        {T.points.map((p, i) => (
          <div
            key={p.text}
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: 610 + i * 170,
              height: 140,
              borderRadius: 26,
              backgroundColor: COLORS.white,
              border: `4px solid ${COLORS.block}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              gap: 28,
              padding: "0 30px",
              ...drop(frame, pointAt[i], i ? 1.5 : -1.5, 40),
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                flexShrink: 0,
                borderRadius: "50%",
                backgroundColor: COLORS.yellowSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i === 0 ? <SpeechIcon size={70} /> : <WheelIcon size={66} />}
            </div>
            <div style={{ fontSize: 68, fontWeight: 900 }}>
              <Marker progress={marks[i]}>{p.text}</Marker>
            </div>
          </div>
        ))}
      </BigCard>
    </AbsoluteFill>
  );
};
