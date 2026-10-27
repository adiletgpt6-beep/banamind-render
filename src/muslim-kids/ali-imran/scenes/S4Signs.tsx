// Сцена 4: пересказ смысла аята 3:190 — небо, Земля, смена дня и ночи →
// три знамения в одну строку.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, range } from "../../lib/math";
import { Grid, Header, Reveal } from "../../lib/ui";
import { FONT, MK } from "../../theme";
import { useCues } from "../timeline";

export const S4Back: React.FC = () => {
  const f = useCurrentFrame();
  // книга «уходит в ночь»: чёрный круг растёт из центра
  const k = ease.inOutCubic(range(f, 0, 22));
  return (
    <AbsoluteFill style={{ backgroundColor: MK.white }}>
      <AbsoluteFill
        style={{
          backgroundColor: MK.black,
          clipPath: `circle(${k * 1500}px at 540px 930px)`,
        }}
      >
        <Grid dark opacity={0.7} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BIG: React.CSSProperties = {
  fontFamily: FONT.display,
  fontWeight: 700,
  fontSize: 92,
  letterSpacing: -1,
  lineHeight: 1,
};

export const S4Front: React.FC = () => {
  const f = useCurrentFrame();
  const c = useCues();
  const L = (x: number) => c.local("s4", x);
  const sky = L(c.word("s4b", "небо") - 2);
  const land = L(c.word("s4b", "земля") - 2);
  const dn = L(c.word("s4b", "смена") - 2);
  const trio = L(c.word("s4b", "знамения") - 4);
  const think = L(c.word("s4b", "размышляют") - 4);
  const dur = c.scene("s4").dur;
  const end = dur - 10;
  const small = (text: string, x: number, at: number) => (
    <div
      style={{
        position: "absolute",
        left: x - 170,
        width: 340,
        top: 1010,
        textAlign: "center",
        fontFamily: FONT.body,
        fontWeight: 700,
        fontSize: 32,
        letterSpacing: 3,
        color: MK.white,
        opacity: range(f, at, at + 14) * (1 - range(f, end, end + 10)),
      }}
    >
      {text}
    </div>
  );
  return (
    <AbsoluteFill>
      <Header
        parts={["В суре ", { t: "«Аль-Имран»", c: MK.sky }, " говорится:"]}
        at={L(c.word("s4a", 0)) - 4}
        out={end}
      />
      <AbsoluteFill
        style={{
          top: 292,
          height: "auto",
          alignItems: "center",
          opacity: range(f, 18, 32) * (1 - range(f, end, end + 10)),
        }}
      >
        <div
          style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: 2,
            color: MK.sky,
            border: `1.5px solid rgba(143,197,255,0.5)`,
            borderRadius: 40,
            padding: "8px 22px",
          }}
        >
          3:190 · пересказ смысла
        </div>
      </AbsoluteFill>
      {/* крупные слова под формой — по одному на знамение */}
      <AbsoluteFill style={{ top: 1330, height: 120, alignItems: "center" }}>
        <Reveal
          parts={["НЕБО"]}
          at={sky}
          out={land - 6}
          by="char"
          stagger={2}
          style={BIG}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1330, height: 120, alignItems: "center" }}>
        <Reveal
          parts={["ЗЕМЛЯ"]}
          at={land}
          out={dn - 6}
          by="char"
          stagger={2}
          style={BIG}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1330, height: 120, alignItems: "center" }}>
        <Reveal
          parts={["ДЕНЬ ", { t: "И", c: MK.sky }, " НОЧЬ"]}
          at={dn}
          out={trio - 6}
          by="char"
          stagger={1.6}
          style={BIG}
        />
      </AbsoluteFill>
      {small("НЕБО", 200, trio + 18)}
      {small("ЗЕМЛЯ", 540, trio + 22)}
      {small("ДЕНЬ И НОЧЬ", 880, trio + 26)}
      <AbsoluteFill style={{ top: 1180, height: "auto", alignItems: "center" }}>
        <Reveal
          parts={[{ t: "ЗНАМЕНИЯ", c: MK.blue }]}
          at={trio + 10}
          out={end}
          by="char"
          stagger={1.5}
          style={{ ...BIG, fontSize: 104 }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1330, height: "auto", alignItems: "center" }}>
        <Reveal
          parts={["для людей, которые ", { t: "размышляют", c: MK.sky }]}
          at={think}
          out={end}
          stagger={3}
          style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 46 }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
