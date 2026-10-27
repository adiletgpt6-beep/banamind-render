import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS } from "../config";

type Crop = {
  readonly focusX: number;
  readonly focusY: number;
  readonly zoomFrom: number;
  readonly zoomTo: number;
};

type PhotoProps = {
  readonly src: string;
  readonly crop: Crop;
  readonly width: number;
  readonly height: number;
  // Кадры (относительно сцены), за которые идёт мягкое приближение.
  readonly zoomStart: number;
  readonly zoomEnd: number;
  readonly radius?: number;
  readonly border?: number;
  readonly style?: React.CSSProperties;
};

// Фотография в карточке: пропорции сохраняются (object-fit: cover),
// кадрирование — вокруг точки фокуса, плюс эффект Кена Бёрнса.
export const Photo: React.FC<PhotoProps> = ({
  src,
  crop,
  width,
  height,
  zoomStart,
  zoomEnd,
  radius = 40,
  border = 10,
  style,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: COLORS.sky,
        border: `${border}px solid ${COLORS.white}`,
        boxShadow: `0 24px 60px ${COLORS.shadow}`,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${crop.focusX}% ${crop.focusY}%`,
          transformOrigin: `${crop.focusX}% ${crop.focusY}%`,
          scale: interpolate(
            frame,
            [zoomStart, zoomEnd],
            [crop.zoomFrom, crop.zoomTo],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      />
    </div>
  );
};
