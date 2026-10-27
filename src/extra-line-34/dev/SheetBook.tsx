// Рабочий лист «Book» (№34): книга «Кичинекей каарман».
//   0     закрытая книга крупно (BookCover) и мелкие BookClosedArt;
//   60    раскрытая книга, разворот 0;
//   90    середина перелистывания (кольцо — openBookCorner);
//   120   разворот 1 (лисёнок и зайчонок);
//   180   крупный план с закладкой (кольцо — closeUpBookmarkTip);
//   240   PageGlow — страница светлеет до фона финала.
import { useCurrentFrame } from "remotion";
import { Backdrop, box, Svg } from "../kit";
import { clamp } from "../rig/motion";
import { BookClosedArt, BookCloseUp, BookCover, closeUpBookmarkTip, closeUpCorner, OpenBook, openBookCorner, PageGlow } from "../props/Book";
import { C, F } from "../theme";
import { DevSheet } from "./DevSheet";

const OPEN = { x: 516, y: 980, w: 960, tilt: -2 } as const;

const Marker: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r={18} fill="none" stroke={C.caret} strokeWidth={4} opacity={0.8} />
    <circle cx={x} cy={y} r={4} fill={C.caret} />
  </g>
);

const Label: React.FC<{ readonly text: string }> = ({ text }) => (
  <div style={box({ left: 96, top: 170, width: 840, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 40, color: C.inkMute })}>{text}</div>
);

export const SheetBook: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 40) {
    return (
      <DevSheet>
        <Backdrop />
        <Svg>
          <BookCover x={516} y={860} w={600} tilt={-2} />
          <g transform="translate(250 1520)">
            <BookClosedArt w={90} tilt={-6} />
          </g>
          <g transform="translate(450 1500)">
            <BookClosedArt w={140} />
          </g>
          <g transform="translate(720 1470)">
            <BookClosedArt w={200} tilt={5} />
          </g>
        </Svg>
      </DevSheet>
    );
  }
  if (f < 150) {
    const turn = f < 75 ? 0 : clamp((f - 75) / 30);
    const c = openBookCorner(OPEN, turn);
    return (
      <DevSheet>
        <div style={box({ inset: 0, backgroundColor: "#8FA6B6" })} />
        <div style={box({ inset: 0, background: "radial-gradient(circle at 25% 15%, rgba(255,255,255,0.25), rgba(255,255,255,0) 60%)" })} />
        <Label text={f < 75 ? "spread 0" : f < 105 ? `turn ${turn.toFixed(2)}` : "spread 1"} />
        <Svg>
          <OpenBook {...OPEN} turn={turn} spread={0} />
          {f < 105 ? <Marker x={c.x} y={c.y} /> : null}
        </Svg>
      </DevSheet>
    );
  }
  // 196–209 (вне списка кадров): крупный план, перелистывание, кольцо — closeUpCorner
  if (f >= 196 && f < 210) {
    const turn = clamp((f - 196) / 13);
    const c = closeUpCorner(turn);
    return (
      <DevSheet>
        <BookCloseUp turn={turn} spread={0} />
        <Svg>
          <Marker x={c.x} y={c.y} />
        </Svg>
      </DevSheet>
    );
  }
  const bookmark = clamp((f - 152) / 22);
  const tip = closeUpBookmarkTip(bookmark);
  return (
    <DevSheet>
      <BookCloseUp bookmark={bookmark} warm={f < 210 ? 0 : 1} />
      {f < 210 ? (
        <Svg>
          <Marker x={tip.x} y={tip.y} />
        </Svg>
      ) : null}
      <PageGlow t={clamp((f - 215) / 50)} />
    </DevSheet>
  );
};
