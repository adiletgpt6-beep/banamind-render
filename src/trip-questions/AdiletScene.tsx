import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ASSETS, COLORS, PHOTO_CROP, SAFE, TQ_TEXT } from "../config";
import { fontFamily } from "../fonts";
import { Logo } from "../components/Logo";
import { Photo } from "../components/Photo";
import { easeInOut, easeOut, pop } from "../components/anim";
import { Gear } from "../morning-rush/icons";
import {
  DotGrid,
  PAPER_SHADOW,
  Paper,
  Scribble,
  Tape,
  drop,
} from "../founder-story/paper";
import { useTimeline } from "../TimelineContext";
import { wordCue } from "../timeline";
import {
  ENTER,
  MiniFace,
  NumberBadge,
  lerpRect,
  miniRect,
  type Rect,
} from "./parts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = TQ_TEXT.adilet;
const MEMO: Rect = { x: 96, y: SAFE.top + 20, w: 440, h: 500 };
const rowRect = (i: number): Rect => ({
  x: MEMO.x + 24,
  y: MEMO.y + 110 + i * 126,
  w: MEMO.w - 48,
  h: 108,
});
const PHOTO = { x: 570, y: SAFE.top + 10, w: 330, h: 380 };
const LOGO = { size: 210, top: SAFE.top + 600 };

// 40–48 с: три карточки собираются в памятку, рядом — фото Адилета.
// Камера плавно приближается, жёлтая линия ведёт взгляд к логотипу,
// затем статус «Ишке киргизүүгө даярданып жатабыз».
export const AdiletScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeline = useTimeline();

  // карточки летят из ряда в памятку (меняют размер, а не растягиваются)
  const gather = interpolate(frame, [0, 22], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const rowText = interpolate(frame, [22, 30], [0, 1], clamp);
  const nameAt = Math.max(
    ENTER + 16,
    wordCue(timeline, "tqAdilet", "Адилет", ENTER + 20) - 4,
  );
  const logoAt = Math.max(
    nameAt + 16,
    wordCue(timeline, "tqAdilet", "БалаГо", nameAt + 30) - 10,
  );
  const lineDraw = interpolate(frame, [logoAt - 12, logoAt + 4], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const statusAt = Math.max(
    logoAt + 8,
    wordCue(timeline, "tqAdilet", "ишке", logoAt + 20) - 6,
  );
  const underline = interpolate(
    frame,
    [nameAt + 6, nameAt + 20],
    [0, 1],
    clamp,
  );
  const cam = interpolate(frame, [ENTER, durationInFrames], [1, 1.04], clamp);
  // Конец сцены: всё, кроме логотипа, уходит, а логотип занимает место
  // логотипа финального экрана — следующая сцена начинается с него же.
  const endAt = durationInFrames - ENTER;
  const rest = interpolate(frame, [endAt - 20, endAt - 6], [1, 0], clamp);
  const toFinal = interpolate(frame, [endAt - 20, endAt], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const statusDrop = drop(frame, statusAt, -1, 40);
  const logoSize = LOGO.size + (220 - LOGO.size) * toFinal;
  const logoTop = LOGO.top + (SAFE.top - 10 - LOGO.top) * toFinal;

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <AbsoluteFill
        style={{
          transformOrigin: "540px 760px",
          scale: `${cam}`,
          opacity: rest,
        }}
      >
        {/* лист памятки */}
        <Paper
          style={{
            left: MEMO.x,
            top: MEMO.y,
            width: MEMO.w,
            height: MEMO.h,
            rotate: "-2deg",
            opacity: interpolate(frame, [14, 22], [0, 1], clamp),
          }}
        >
          <Tape width={150} rotate={-5} style={{ top: -22, left: 140 }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 30,
              textAlign: "center",
              fontSize: 44,
              fontWeight: 900,
            }}
          >
            {T.memo}
          </div>
        </Paper>
        {TQ_TEXT.cards.map((c, i) => {
          const r = lerpRect(miniRect(i), rowRect(i), gather);
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
                backgroundColor: COLORS.white,
                border: `${gather > 0.5 ? 4 : 5}px solid ${gather > 0.5 ? COLORS.yellow : COLORS.block}`,
                boxShadow: gather > 0.5 ? "none" : PAPER_SHADOW,
                rotate: `${-2 * gather}deg`,
              }}
            >
              {gather < 0.5 ? (
                <MiniFace index={i} closed={false} />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "0 16px",
                  }}
                >
                  <NumberBadge n={c.n} size={66} />
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      lineHeight: 1.08,
                      opacity: rowText,
                    }}
                  >
                    {c.short}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* фото Адилета */}
        <Paper
          style={{
            left: PHOTO.x - 18,
            top: PHOTO.y,
            width: PHOTO.w + 36,
            height: PHOTO.h + 130,
            borderRadius: 10,
            ...drop(frame, 8, 3, 60),
          }}
        >
          <Photo
            src={ASSETS.portrait}
            crop={PHOTO_CROP.portraitClose}
            width={PHOTO.w}
            height={PHOTO.h}
            radius={6}
            border={0}
            zoomStart={0}
            zoomEnd={durationInFrames}
            style={{ left: 18, top: 18, boxShadow: "none" }}
          />
          <Tape
            width={140}
            rotate={4}
            style={{ top: -22, left: (PHOTO.w + 36) / 2 - 70 }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: PHOTO.h + 34,
              textAlign: "center",
              fontSize: 44,
              fontWeight: 900,
              opacity: interpolate(frame, [nameAt, nameAt + 8], [0, 1], clamp),
            }}
          >
            {T.name}
          </div>
          <Scribble
            width={280}
            progress={underline}
            style={{ left: (PHOTO.w + 36) / 2 - 140, top: PHOTO.h + 92 }}
          />
        </Paper>

        {/* жёлтая линия к логотипу */}
        <svg
          width={1080}
          height={240}
          viewBox="0 0 1080 240"
          style={{
            position: "absolute",
            left: 0,
            top: SAFE.top + 450,
            overflow: "visible",
          }}
        >
          <path
            d="M 320 90 C 360 170, 450 150, 500 170 M 740 90 C 700 170, 630 150, 580 170"
            fill="none"
            stroke={COLORS.yellow}
            strokeWidth={12}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - lineDraw}
          />
        </svg>
      </AbsoluteFill>

      {/* логотип — вне камеры: в конце сцены переезжает на место финального */}
      <div
        style={{
          position: "absolute",
          left: 540 - logoSize / 2,
          top: logoTop,
          opacity: interpolate(frame, [logoAt, logoAt + 6], [0, 1], clamp),
          scale: `${interpolate(pop(frame, fps, logoAt), [0, 1], [0.6, 1])}`,
        }}
      >
        <Logo size={logoSize} />
      </div>

      {/* статус подготовки — вне камеры, всегда в одном месте */}
      <Paper
        style={{
          left: 120,
          right: 150,
          top: SAFE.top + 850,
          padding: "28px 26px 32px",
          backgroundColor: COLORS.yellowSoft,
          border: `6px solid ${COLORS.yellow}`,
          display: "flex",
          alignItems: "center",
          gap: 24,
          ...statusDrop,
          opacity: Number(statusDrop.opacity ?? 1) * rest,
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            flexShrink: 0,
            borderRadius: "50%",
            backgroundColor: COLORS.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Gear size={80} angle={(frame / fps) * 45} />
        </div>
        <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1 }}>
          {T.status}
        </div>
      </Paper>
    </AbsoluteFill>
  );
};
