// Сцена 3: отъезд камеры от Земли → звёзды и орбиты → открытая книга;
// фон раскрывается кругом из центра книги в белый. Название суры.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, range } from "../../lib/math";
import { Grid, Header, Reveal } from "../../lib/ui";
import { FONT, MK } from "../../theme";
import { AYAH } from "../script";
import { useCues } from "../timeline";

const useReveal = () => {
  const f = useCurrentFrame();
  const c = useCues();
  const at = c.local("s3", c.word("s3a", "творении") - 2);
  return { f, at, k: ease.inOutCubic(range(f, at, at + 30)) };
};

export const S3Back: React.FC = () => {
  const { k } = useReveal();
  const r = k * 1500;
  return (
    <AbsoluteFill style={{ backgroundColor: MK.black }}>
      <Grid dark opacity={0.6} />
      <AbsoluteFill
        style={{
          backgroundColor: MK.white,
          clipPath: `circle(${r}px at 540px 930px)`,
        }}
      >
        <Grid dark={false} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const S3Front: React.FC = () => {
  const { f, at: revealAt, k } = useReveal();
  const c = useCues();
  const L = (x: number) => c.local("s3", x);
  const knowAt = L(c.word("s3a", 0) - 4);
  const thinkAt = L(c.word("s3a", "задуматься") - 4);
  const titleAt = revealAt + 16;
  const hc = k > 0.5 ? MK.black : MK.white;
  return (
    <AbsoluteFill>
      <Header
        parts={[
          { t: "Коран", c: MK.sky },
          " предлагает не только узнать, как это происходит…",
        ]}
        at={knowAt}
        out={thinkAt - 6}
      />
      <Header
        parts={["…но и ", { t: "задуматься", c: MK.blue }, " о творении"]}
        at={thinkAt + 4}
        color={hc}
        out={c.scene("s3").dur - 14}
      />
      <AbsoluteFill style={{ top: 1290, height: "auto", alignItems: "center" }}>
        <Reveal
          parts={[AYAH.surahArabic]}
          at={titleAt}
          by="word"
          color={MK.blue}
          style={{
            fontFamily: FONT.arabic,
            fontWeight: 700,
            fontSize: 70,
            direction: "rtl",
            lineHeight: 1.5,
          }}
        />
        <Reveal
          parts={["СУРА ", { t: "«АЛЬ-ИМРАН»", c: MK.blue }]}
          at={titleAt + 8}
          by="char"
          stagger={1.2}
          color={MK.black}
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 64,
            marginTop: 6,
          }}
        />
        <Reveal
          parts={["АЯТЫ 190–191"]}
          at={titleAt + 24}
          color={MK.black}
          style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: 8,
            marginTop: 18,
            opacity: 0.75,
          }}
        />
      </AbsoluteFill>
      {/* тонкая шкала: аяты 190–191 из 200 в суре */}
      <AbsoluteFill
        style={{
          top: 1600,
          height: 40,
          alignItems: "center",
          opacity: range(f, titleAt + 30, titleAt + 46),
        }}
      >
        <svg width={760} height={24}>
          {Array.from({ length: 50 }, (_, i) => {
            const hi = i === 47; // 190–191 ≈ 47-я четвёрка из 200
            return (
              <circle
                key={i}
                cx={8 + i * 15.2}
                cy={12}
                r={hi ? 6 : 3.4}
                fill={hi ? MK.blue : "rgba(8,9,13,0.25)"}
              />
            );
          })}
        </svg>
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 22,
            color: "rgba(8,9,13,0.5)",
            marginTop: 6,
            letterSpacing: 1,
          }}
        >
          200 аятов · 1 точка = 4 аята
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
