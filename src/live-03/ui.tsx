// Общие элементы оформления BalaGoLive03: палитра, светлые карточки для
// ночного фона, подсветка ключевых слов, логотип.
import { Img, staticFile } from "remotion";
import { ASSETS, COLORS } from "../config";
import { fontFamily } from "../fonts";

export const NAVY = COLORS.navy; // тёмно-синий
export const NAVY_DEEP = "#0C1838";
export const GRAPHITE = "#1E2433";
export const YELLOW = COLORS.yellow;
export const YELLOW_SOFT = COLORS.yellowSoft;
export const WHITE = COLORS.white;
export const MUTED = "#6B7894";
export const LINE = "#E3E8F1";
export const WA_GREEN = "#25D366";

// Тень текста поверх живого ночного видео.
export const TEXT_SHADOW = "0 2px 4px rgba(4,8,20,0.6), 0 8px 26px rgba(4,8,20,0.5)";
// Мягкая тень карточки (свет — сверху, как у фонарей в кадре).
export const CARD_SHADOW = "0 22px 50px rgba(3,7,20,0.42), 0 4px 10px rgba(3,7,20,0.25)";

export const baseText: React.CSSProperties = {
  fontFamily,
  fontWeight: 900,
  lineHeight: 1.08,
  letterSpacing: 0.3,
};

export const upper = (s: string) => s.toLocaleUpperCase("ky");

// «[слово]» → жёлтое ключевое слово.
export const Highlighted: React.FC<{
  readonly text: string;
  readonly accent?: string;
}> = ({ text, accent = YELLOW }) => {
  const parts = text.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[") ? (
          <span key={i} style={{ color: accent }}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

// Светлая карточка с объёмом: верхний блик, мягкая тень, скругление.
export const Card: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly radius?: number;
}> = ({ children, style, radius = 28 }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: radius,
      background: "linear-gradient(180deg, #FFFFFF 0%, #F3F6FB 100%)",
      boxShadow: `${CARD_SHADOW}, inset 0 1px 0 rgba(255,255,255,0.9)`,
      color: NAVY,
      fontFamily,
      ...style,
    }}
  >
    {children}
  </div>
);

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

// Объёмный текст: несколько слоёв тени вниз-вправо дают «экструзию»,
// как у объёмных букв в референсе, плюс мягкая тень на фон.
export const extrude = (depth: number, color: string) => {
  const layers: string[] = [];
  for (let i = 1; i <= depth; i++) layers.push(`${i * 0.6}px ${i}px 0 ${color}`);
  layers.push(`0 ${depth + 10}px 30px rgba(3,7,20,0.55)`);
  return layers.join(", ");
};

// Стрелка схемы «ҮЙ → МЕКТЕП → ҮЙ»: глиф «→» в Nunito мелкий, поэтому
// рисуем её сами — по высоте строки, жёлтую, с объёмной тенью.
export const SchemeArrow: React.FC<{ readonly size: number; readonly opacity?: number }> = ({ size, opacity = 1 }) => (
  <svg
    width={size * 0.9}
    height={size * 0.6}
    viewBox="0 0 54 36"
    style={{ display: "inline-block", verticalAlign: "middle", margin: `0 ${size * 0.16}px`, opacity, filter: "drop-shadow(1px 3px 0 #B98A00) drop-shadow(0 6px 10px rgba(3,7,20,0.5))" }}
  >
    <path d="M4 18 H44 M30 5 L46 18 L30 31" fill="none" stroke={YELLOW} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
