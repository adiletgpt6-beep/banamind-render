// Сцена 6: звёздное небо, спокойное движение; часть аята 3:191 в переводе смысла.
// Дизайн сдержанный: без вспышек, слова проявляются вместе с речью.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, range } from "../../lib/math";
import { Reveal } from "../../lib/ui";
import { FONT, MK } from "../../theme";
import { AYAH } from "../script";
import { useCues } from "../timeline";

export const S6Back: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 120%, #10204a 0%, ${MK.black} 62%)`,
    }}
  />
);

const Q: React.CSSProperties = {
  fontFamily: FONT.display,
  fontWeight: 700,
  lineHeight: 1.12,
  letterSpacing: -0.5,
  textShadow: "0 4px 30px rgba(8,9,13,0.9)",
};

export const S6Front: React.FC = () => {
  const f = useCurrentFrame();
  const c = useCues();
  const L = (x: number) => c.local("s6", x);
  const said = L(c.word("s6a", 0) - 4);
  const lord = L(c.word("s6b", 0) - 3);
  const line2 = c.line("s6b").words;
  // слова второй строки: «Ты не сотворил это понапрасну»
  const w = (i: number) => L(line2[Math.min(i, line2.length - 1)].from - 3);
  const dur = c.scene("s6").dur;
  const out = dur - 12;
  const cap = ease.outCubic(
    range(f, L(c.line("s6b").speechTo) - 6, L(c.line("s6b").speechTo) + 14),
  );
  const rule = ease.inOutCubic(range(f, lord + 4, lord + 34));
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <AbsoluteFill style={{ top: 560, height: "auto" }}>
        <Reveal
          parts={["Верующие говорят:"]}
          at={said}
          out={out}
          color={MK.sky}
          stagger={3}
          style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: 1,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 650, height: "auto" }}>
        <Reveal
          parts={[AYAH.arabic]}
          at={lord - 8}
          out={out}
          color={MK.sky}
          stagger={4}
          dur={22}
          rise={14}
          style={{
            fontFamily: FONT.arabic,
            fontWeight: 400,
            fontSize: 64,
            direction: "rtl",
            lineHeight: 1.6,
            opacity: 0.9,
          }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 800,
          left: 540 - 60 * rule,
          width: 120 * rule,
          height: 3,
          background: MK.blue,
          opacity: 1 - range(f, out, out + 12),
        }}
      />
      <AbsoluteFill style={{ top: 860, height: "auto", padding: "0 70px" }}>
        <Reveal
          parts={["«ГОСПОДЬ НАШ!"]}
          at={lord}
          out={out}
          stagger={5}
          dur={20}
          rise={24}
          style={{ ...Q, fontSize: 82 }}
        />
        <div style={{ height: 26 }} />
        <Reveal
          parts={["ТЫ НЕ СОТВОРИЛ"]}
          at={w(2)}
          out={out}
          stagger={5}
          dur={20}
          rise={24}
          style={{ ...Q, fontSize: 70 }}
        />
        <Reveal
          parts={["ЭТО ", { t: "ПОНАПРАСНУ»", c: MK.sky }]}
          at={w(5)}
          out={out}
          stagger={6}
          dur={20}
          rise={24}
          style={{ ...Q, fontSize: 70 }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          top: 1290,
          height: "auto",
          alignItems: "center",
          opacity: cap * (1 - range(f, out, out + 12)),
        }}
      >
        <div
          style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 36,
            color: MK.white,
          }}
        >
          {AYAH.ref}
        </div>
        <div
          style={{
            fontFamily: FONT.body,
            fontWeight: 400,
            fontSize: 30,
            color: "rgba(255,255,255,0.6)",
            marginTop: 10,
          }}
        >
          {AYAH.note}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
