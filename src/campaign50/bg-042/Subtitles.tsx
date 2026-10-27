// Титры короткими фразами по фактическим таймингам слов. Стиль телевыпуска:
// маленькая подпись говорящего («Алып баруучу», «Кабарчы», «Апа», «Диктор»)
// и белая плашка с жёлтым краем. Полоса титров выше нижней безопасной зоны
// Reels; финальная фраза «BalaGo менен жолго чыгалы!» уже крупно в кадре —
// второй слой титров для неё не нужен.
import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { BG42_CTA, BG42_ROLE_LABEL } from "./script";
import { C, FPS, SUB_TOP, clamp } from "./theme";
import { buildSubs, type Timeline } from "./timeline";

export const Subtitles: React.FC<{ readonly tl: Timeline }> = ({ tl }) => {
  const subs = useMemo(() => buildSubs(tl), [tl]);
  const f = useCurrentFrame();
  const t = (f + 0.5) / FPS;
  const cur = subs.find((s) => t >= s.from && t < s.to);
  if (!cur || cur.text === BG42_CTA.go) return null;
  // подпись говорящего держится всю реплику, фраза мягко сменяется
  const lineStart = subs.find((s) => s.id.split("-")[0] === cur.id.split("-")[0])!.from;
  const k = interpolate(t, [cur.from, cur.from + 0.14], [0, 1], clamp);
  const kl = interpolate(t, [lineStart, lineStart + 0.18], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 90, right: 150, top: SUB_TOP, display: "flex", flexDirection: "column", alignItems: "center", fontFamily }}>
      <div
        style={{
          alignSelf: "center",
          marginBottom: -4,
          padding: "4px 16px 6px",
          borderRadius: "12px 12px 0 0",
          background: C.navy,
          color: C.yellow,
          fontWeight: 900,
          fontSize: 24,
          letterSpacing: 1,
          opacity: kl,
          zIndex: 1,
        }}
      >
        {BG42_ROLE_LABEL[cur.role]}
      </div>
      <div
        style={{
          maxWidth: 840,
          padding: "12px 28px 14px",
          borderRadius: 22,
          background: "rgba(255,255,255,0.96)",
          border: `4px solid ${C.navy}`,
          borderBottom: `8px solid ${C.yellow}`,
          boxShadow: `0 12px 30px ${C.shadow}`,
          fontWeight: 900,
          fontSize: 44,
          lineHeight: 1.14,
          color: C.navy,
          textAlign: "center",
          opacity: kl * (0.35 + 0.65 * k),
          transform: `translateY(${(1 - k) * 6}px)`,
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};
