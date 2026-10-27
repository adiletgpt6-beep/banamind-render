// Проверочная композиция Lesson80-1-12-PuzzleCheck: шесть деталей картинки
// по отдельности (контуры, выступы и пазы), собранная картинка, деталь с
// листиком в неправильном положении и детские руки в разных позах.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TopArm, YUSUF_HANDS, AMIR_HANDS, type TopHandPose } from "./hands";
import { PIECES, START_PLACED, pieceById, type PiecePose } from "./puzzle";
import { TopPiece } from "./puzzleArt";

const pose = (theta = 0, z = 0): PiecePose => ({ u: 0, w: 0, z, theta, placed: false, held: null });

export const PuzzleCheck: React.FC = () => {
  const f = useCurrentFrame();
  const k = 5.2;
  const step = 36 * k;
  const poses: TopHandPose[] = ["rest", "grip", "pinch", "point", "trace", "open"];
  return (
    <AbsoluteFill style={{ backgroundColor: "#B88A5A" }}>
      <svg width={1920} height={1080}>
        <rect width={1920} height={1080} fill="#C39566" />
        {/* отдельные детали */}
        {PIECES.map((p, i) => (
          <TopPiece key={p.id} p={p} pose={pose(0, i === 1 ? 20 : 0)} X={160 + (i % 3) * 230} Y={170 + Math.floor(i / 3) * 230} k={k} uid={`chk-${p.id}`} />
        ))}
        {/* собранная картинка */}
        {(["under", "face"] as const).map((part) =>
          PIECES.map((p) => <TopPiece key={`a-${part}-${p.id}`} part={part} p={p} pose={pose(0)} X={1060 + p.col * step} Y={150 + p.row * step} k={k} uid={`chka-${p.id}`} />),
        )}
        {/* три соединены, деталь с листиком повёрнута */}
        {START_PLACED.map((id) => {
          const p = pieceById(id);
          return <TopPiece key={`s-${id}`} p={p} pose={pose(0)} X={1060 + p.col * step} Y={640 + p.row * step} k={k} uid={`chks-${id}`} />;
        })}
        <TopPiece p={pieceById("r0c1")} pose={pose(90 + Math.sin(f / 10) * 4, 6)} X={1060 + step + 26} Y={640 - 10} k={k} uid="chk-leaf" />
        {poses.map((ps, i) => (
          <TopArm key={ps} wrist={{ x: 120 + i * 140, y: 900 }} anchor={{ x: 150 + i * 140, y: 1150 }} L={150} angle={-6} side={1} pose={ps} look={i % 2 ? AMIR_HANDS : YUSUF_HANDS} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
