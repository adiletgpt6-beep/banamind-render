// Visual identity of the finance series: palette, type scale, layout zones.
export const PALETTE = {
  bg: "#FAFAF7",
  ink: "#151820",
  green: "#20B66A",
  greenDark: "#086D49",
  yellow: "#FFC83D",
  blue: "#E9F5FF",
  coral: "#FF6262",
  navy: "#111B32",
  // derived tints
  inkSoft: "#5B6170",
  line: "rgba(21,24,32,0.08)",
  grid: "rgba(21,24,32,0.055)",
  card: "#FFFFFF",
  greenSoft: "#E3F7EC",
  coralSoft: "#FFE9E9",
  yellowSoft: "#FFF3CF",
  navySoft: "#1B2A4A",
} as const;

export const FONT = {
  family: "Inter",
  // weights available in the bundled variable font
  black: 900,
  extraBold: 800,
  bold: 700,
  semi: 600,
  medium: 500,
} as const;

// Layout zones for 1080×1920 with YouTube Shorts UI safe areas:
// top ~200 px (title/progress), bottom ~420 px (description, buttons),
// right ~140 px (action rail).
export const ZONE = {
  width: 1080,
  height: 1920,
  safeTop: 200,
  safeBottom: 1500,
  side: 72,
  /** Vertical band where narration captions live. */
  captionTop: 1540,
  captionBottom: 1660,
} as const;
