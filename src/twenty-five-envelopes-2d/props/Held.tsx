// Крупные планы предметов в руках (координаты кадра 1080×1920):
//   • HeldEnvelope — конверт в двух руках: переворот, клапан, вложение
//     выходит из горловины и уходит обратно; правая рука держит край
//     вложения и движется вместе с ним;
//   • HeldSheet — записка или рисунок в руках (пальцы на нижних углах).
// Фон — тёплый размытый план комнаты (стол внизу), без мерцания.
import { AbsoluteFill } from "remotion";
import { box, Svg } from "../kit";
import { C } from "../theme";
import { CloseHand } from "./CloseHand";
import { ENV_RATIO, EnvelopeArt } from "./Envelope";

type Skin = { skin: string; shade: string; sleeve: string; cuff?: string };

export const WarmBg: React.FC<{ readonly children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: "#D9B98E" }}>
    <div style={box({ left: 0, top: 0, width: 1080, height: 1250, background: "linear-gradient(180deg, #CDB08A, #E2C9A2)" })} />
    <div style={box({ left: -200, top: 120, width: 1100, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,0.5), rgba(255,214,140,0) 70%)" })} />
    <div style={box({ left: 0, top: 1250, width: 1080, height: 670, background: "linear-gradient(180deg, #C99A68, #B98B5D)" })} />
    {children}
  </AbsoluteFill>
);

export const ENV_HELD = { cx: 540, cy: 1020, w: 760 } as const;

export const HeldEnvelope: React.FC<{
  readonly name: string;
  readonly turn: number;
  readonly open: number;
  readonly out: number;
  readonly content: "note" | "drawing";
  readonly skin: Skin;
  readonly y?: number; // смещение (подъём/опускание)
  readonly flapFinger?: number; // 0…1 указательный палец у клапана
}> = ({ name, turn, open, out, content, skin, y = 0, flapFinger = 0 }) => {
  const { cx, w } = ENV_HELD;
  const cy = ENV_HELD.cy + y;
  const h = w * ENV_RATIO;
  // правая рука: на краю конверта → на край вложения (идёт вверх с ним)
  const insertTop = cy - h / 2 - out * h * 0.95 + h * 0.02 - h * 0.45;
  const pulling = out > 0.02;
  const rx = pulling ? cx + 60 : cx + w / 2 - 10;
  const ry = pulling ? insertTop + 30 : cy + 10;
  return (
    <WarmBg>
      <Svg>
        <g transform={`translate(${cx} ${cy})`}>
          <EnvelopeArt w={w} name={name} turn={turn} open={open} out={out} content={content} lift={1} />
        </g>
        {/* левая рука держит левый нижний угол (рукав уходит вниз-влево) */}
        <CloseHand x={cx - w / 2 - 130} y={cy + h / 2 + 150} angle={-140} size={260} {...skin} shape="pinch" mirror armLen={5} />
        {/* палец поднимает клапан */}
        {flapFinger > 0 ? <CloseHand x={cx + 40} y={cy - h / 2 + 260 - flapFinger * 60} angle={180} size={250} {...skin} shape="point" armLen={5} /> : null}
        {/* правая рука: край конверта или верхний край вложения */}
        {flapFinger > 0 ? null : pulling ? <CloseHand x={rx + 30} y={ry - 230} angle={8} size={260} {...skin} shape="pinch" armLen={5} /> : <CloseHand x={cx + w / 2 + 130} y={cy + h / 2 + 150} angle={140} size={260} {...skin} shape="pinch" armLen={5} />}
      </Svg>
    </WarmBg>
  );
};

// Лист в руках: content — сам лист (NoteSheet или KidDrawing, 900 px
// шириной), пальцы на нижних углах.
export const HeldSheet: React.FC<{ readonly skin: Skin; readonly top?: number; readonly h?: number; readonly children: React.ReactNode; readonly overlay?: React.ReactNode }> = ({ skin, top = 560, h = 620, children, overlay }) => (
  <WarmBg>
    <div style={box({ left: 60, top })}>{children}</div>
    <Svg>
      <CloseHand x={30} y={top + h + 120} angle={-140} size={250} {...skin} shape="pinch" mirror armLen={4} />
      <CloseHand x={1050} y={top + h + 120} angle={140} size={250} {...skin} shape="pinch" armLen={4} />
    </Svg>
    {overlay}
  </WarmBg>
);

export { C };
