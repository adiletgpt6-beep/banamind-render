// Сцена 1 (0–6 с): точка → Луна → Солнце; экран делится на день и ночь; «ПОЧЕМУ?»
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, range } from "../../lib/math";
import { Grid } from "../../lib/ui";
import { FONT, MK } from "../../theme";
import { useCues } from "../timeline";

const SPLIT = 960;

export const S1Back: React.FC = () => {
  const f = useCurrentFrame();
  const c = useCues();
  const L = (x: number) => c.local("s1", x);
  const light = L(c.word("s1b", "светло") - 6);
  const day = ease.inOutQuint(range(f, light, light + 20));
  return (
    <AbsoluteFill style={{ backgroundColor: MK.black }}>
      <Grid dark />
      {/* верхняя половина становится днём: белая панель опускается до середины */}
      <AbsoluteFill
        style={{
          height: SPLIT * day,
          backgroundColor: MK.white,
          overflow: "hidden",
        }}
      >
        <Grid dark={false} />
      </AbsoluteFill>
      {/* линия раздела */}
      <div
        style={{
          position: "absolute",
          top: SPLIT - 1,
          left: 540 - 540 * ease.outCubic(range(f, light + 14, light + 34)),
          width: 1080 * ease.outCubic(range(f, light + 14, light + 34)),
          height: 2,
          background: MK.blue,
        }}
      />
    </AbsoluteFill>
  );
};

export const S1Front: React.FC = () => {
  const f = useCurrentFrame();
  const c = useCues();
  const L = (x: number) => c.local("s1", x);
  const light = L(c.word("s1b", "светло") - 6);
  const why = L(c.word("s1c", "почему") - 3);
  const dur = c.scene("s1").dur;
  const lab = ease.outCubic(range(f, light + 20, light + 36));
  // «ПОЧЕМУ?» поверх линии: верх — тёмные буквы на дне, низ — белые на ночи
  const letters = [..."ПОЧЕМУ?"];
  const word = (color: string) => (
    <div
      style={{
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: 128,
        letterSpacing: -3,
        color,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {letters.map((ch, i) => {
        const p = ease.outBack(range(f, why + i * 2, why + i * 2 + 16));
        const isQ = ch === "?";
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: isQ ? MK.blue : color,
              opacity: range(f, why + i * 2, why + i * 2 + 8),
              transform: `translateY(${(1 - p) * 90}px) scale(${0.6 + 0.4 * p}) rotate(${isQ ? (1 - p) * 30 + Math.sin((f - why) * 0.12) * 4 * range(f, why + 20, why + 30) : 0}deg)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
  const exit = range(f, dur - 10, dur);
  const box = (top: boolean, color: string) => (
    <AbsoluteFill
      style={{
        clipPath: top
          ? `inset(0 0 ${1920 - SPLIT}px 0)`
          : `inset(${SPLIT}px 0 0 0)`,
        alignItems: "center",
        justifyContent: "center",
        opacity: 1 - exit,
      }}
    >
      {word(color)}
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      {box(true, MK.black)}
      {box(false, MK.white)}
      {/* подписи половин */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 790,
          opacity: lab * (1 - exit),
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: 4,
          color: MK.black,
        }}
      >
        ДЕНЬ
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 1100,
          opacity: lab * (1 - exit),
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: 4,
          color: MK.sky,
        }}
      >
        НОЧЬ
      </div>
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 790,
          opacity: lab * (1 - exit),
          fontFamily: FONT.body,
          fontWeight: 500,
          fontSize: 28,
          color: "rgba(8,9,13,0.55)",
        }}
      >
        сегодня
      </div>
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 1100,
          opacity: lab * (1 - exit),
          fontFamily: FONT.body,
          fontWeight: 500,
          fontSize: 28,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        вчера
      </div>
    </AbsoluteFill>
  );
};
