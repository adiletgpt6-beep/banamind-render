import { Img, staticFile } from "remotion";
import { ASSETS, COLORS } from "../config";

// Круглый логотип: квадратный PNG обрезается по кругу,
// чтобы на белом фоне не было видно углов.
export const Logo: React.FC<{
  readonly size: number;
  readonly style?: React.CSSProperties;
}> = ({ size, style }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor: COLORS.white,
        boxShadow: `0 30px 70px ${COLORS.shadow}`,
        ...style,
      }}
    >
      <Img
        src={staticFile(ASSETS.logo)}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
};
