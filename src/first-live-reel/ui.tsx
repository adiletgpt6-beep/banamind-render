// Общие элементы оформления: карточка, подсветка ключевых слов, лого.
import { Img, staticFile } from "remotion";
import { ASSETS, COLORS } from "../config";
import { fontFamily } from "../fonts";

export const NAVY = COLORS.navy;
export const YELLOW = COLORS.yellow;
export const WHITE = COLORS.white;

// Тень текста поверх живого видео — читаемость на светлом и тёмном фоне.
export const TEXT_SHADOW =
  "0 2px 4px rgba(6,10,24,0.55), 0 6px 22px rgba(6,10,24,0.45)";

export const CARD_SHADOW = "0 18px 44px rgba(8,14,32,0.32)";

export const baseText: React.CSSProperties = {
  fontFamily,
  fontWeight: 900,
  lineHeight: 1.08,
  letterSpacing: 0.5,
};

// «[слово]» в тексте → жёлтое ключевое слово.
export const Highlighted: React.FC<{
  readonly text: string;
  readonly upper?: boolean;
  readonly accent?: string;
}> = ({ text, upper = true, accent = YELLOW }) => {
  const parts = text.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        const key = p.startsWith("[");
        const raw = key ? p.slice(1, -1) : p;
        const t = upper ? raw.toLocaleUpperCase("ky") : raw;
        return key ? (
          <span key={i} style={{ color: accent }}>
            {t}
          </span>
        ) : (
          <span key={i}>{t}</span>
        );
      })}
    </>
  );
};

// Официальный логотип BalaGo (public/assets/logo.png), обрезан по кругу.
export const OfficialLogo: React.FC<{
  readonly size: number;
  readonly style?: React.CSSProperties;
}> = ({ size, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      backgroundColor: WHITE,
      flexShrink: 0,
      ...style,
    }}
  >
    <Img src={staticFile(ASSETS.logo)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
  </div>
);
