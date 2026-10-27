import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, TQ_TEXT } from "../config";
import { fontFamily } from "../fonts";
import { easeInOut, easeOut, pop } from "../components/anim";
import { AdultFigure } from "../founder-story/icons";
import { DotGrid, Marker, drop } from "../founder-story/paper";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import {
  BigCard,
  CallGlyph,
  ClockFace,
  MessageGlyph,
  MiniRow,
  useCardOpen,
} from "./parts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = TQ_TEXT.change;

// 29–40 с: «3. Кантип байланышасыз?» — на школьном листке время окончания
// занятия сдвигается раньше; рядом телефон с цельной карточкой контакта
// (сообщение и звонок). Никакой переписки — только понятная иллюстрация.
export const ChangeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();
  const { ready } = useCardOpen(frame, 2);

  const a3 = segmentCue(timeline, "tqChange", "a3");
  const earlyAt = Math.max(
    ready + 10,
    wordCue(timeline, "tqChange", "эрте", a3 + 10) - 4,
  );
  const shift = interpolate(frame, [earlyAt, earlyAt + 20], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const phoneAt = Math.max(
    ready + 6,
    wordCue(timeline, "tqChange", "байланыш", ready + 20) - 4,
  );
  const qAt = Math.max(
    earlyAt + 12,
    wordCue(timeline, "tqChange", "убакыт", earlyAt + 24) - 4,
  );
  const markAt = Math.max(
    qAt + 6,
    wordCue(timeline, "tqChange", "өзгөрсө", qAt + 12, 1),
  );
  const marker = interpolate(frame, [markAt, markAt + 12], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const contactAt = Math.max(
    phoneAt + 10,
    wordCue(timeline, "tqChange", "кимге", qAt + 20) - 4,
  );
  const [qWord1, qWord2] = T.question.split(" ");

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <MiniRow active={2} hide={[2]} />
      <BigCard frame={frame} index={2}>
        {/* школьный листок: занятие заканчивается раньше */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 220,
            width: 330,
            height: 420,
            borderRadius: 26,
            backgroundColor: COLORS.white,
            border: `4px solid ${COLORS.block}`,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: 84,
              backgroundColor: COLORS.yellow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 900,
            }}
          >
            {T.lesson}
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 26 }}
          >
            <ClockFace
              size={170}
              hour={interpolate(shift, [0, 1], [30, 0])}
              minute={interpolate(shift, [0, 1], [360, 180])}
            />
          </div>
          {/* полоса занятия: конец сдвигается левее */}
          <div
            style={{
              position: "absolute",
              left: 30,
              right: 30,
              bottom: 40,
              height: 34,
              borderRadius: 17,
              backgroundColor: COLORS.sky,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${interpolate(shift, [0, 1], [92, 58])}%`,
                borderRadius: 17,
                backgroundColor: COLORS.navy,
              }}
            />
          </div>
          {/* «!» — время изменилось */}
          <div
            style={{
              position: "absolute",
              right: 18,
              top: 104,
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: COLORS.yellow,
              border: `4px solid ${COLORS.navy}`,
              boxSizing: "border-box",
              fontSize: 42,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: `${pop(frame, fps, earlyAt + 10)}`,
            }}
          >
            !
          </div>
        </div>

        {/* телефон с цельной карточкой контакта */}
        <div
          style={{
            position: "absolute",
            left: 420,
            top: 190,
            width: 340,
            height: 480,
            borderRadius: 48,
            backgroundColor: COLORS.navy,
            padding: 18,
            boxSizing: "border-box",
            ...drop(frame, phoneAt, 3, 50),
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 32,
              backgroundColor: COLORS.white,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 50,
              boxSizing: "border-box",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: "50%",
                backgroundColor: COLORS.yellowSoft,
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <AdultFigure size={124} accent={COLORS.navy} />
            </div>
            {/* нейтральные строки вместо имени и номера */}
            <div
              style={{
                width: 190,
                height: 22,
                borderRadius: 11,
                backgroundColor: COLORS.block,
              }}
            />
            <div
              style={{
                width: 140,
                height: 22,
                borderRadius: 11,
                backgroundColor: COLORS.block,
              }}
            />
            <div style={{ display: "flex", gap: 34, marginTop: 14 }}>
              {[MessageGlyph, CallGlyph].map((G, i) => (
                <div
                  key={i}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    backgroundColor: COLORS.yellow,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    scale: `${interpolate(pop(frame, fps, contactAt + i * 6), [0, 1], [0.4, 1])}`,
                    opacity: interpolate(
                      frame,
                      [contactAt + i * 6, contactAt + i * 6 + 4],
                      [0, 1],
                      clamp,
                    ),
                  }}
                >
                  <G size={60} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* «Убакыт өзгөрсөчү?» */}
        <div
          style={{
            position: "absolute",
            left: 30,
            right: 30,
            top: 740,
            textAlign: "center",
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1.1,
            ...drop(frame, qAt, -1, 40),
          }}
        >
          {qWord1} <Marker progress={marker}>{qWord2}</Marker>
        </div>
      </BigCard>
    </AbsoluteFill>
  );
};
