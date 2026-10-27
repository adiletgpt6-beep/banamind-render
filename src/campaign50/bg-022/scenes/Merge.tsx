// Сцена 4 (≈33–43 с): обе половины петли — «1» (утро) и «2» (после
// уроков) — подсвечиваются стрелками; карта уходит в белый, петля
// сжимается и складывается в большую цифру «1»: 1 толук сапар =
// ҮЙ → МЕКТЕП → ҮЙ. Цена между этапами не делится (цен в сцене нет).
import { getPointAtLength, getLength } from "@remotion/paths";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  clamp,
  easeInOut,
  easeOut,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import {
  BishkekMap,
  HOME,
  PATH_AM,
  PATH_PM,
  Pin,
  RouteLine,
  SCHOOL,
} from "../map";
import { C } from "../palette";
import { BG22_TEXT } from "../script";
import { Txt, rise } from "../ui";

export const MG = {
  labels: 30,
  fold0: 108,
  fold1: 148,
  one: 140,
  text: 156,
} as const;

const CENTER = { x: (HOME.x + SCHOOL.x) / 2, y: (HOME.y + SCHOOL.y) / 2 };

// Номер этапа на середине своей половины петли.
const PartDot: React.FC<{
  readonly path: string;
  readonly n: string;
  readonly at: number;
  readonly f: number;
}> = ({ path, n, at, f }) => {
  const p = getPointAtLength(path, getLength(path) * 0.5) ?? { x: 0, y: 0 };
  const a = easeOut((f - at) / 10);
  return (
    <div
      style={{
        position: "absolute",
        left: p.x - 44,
        top: p.y - 44,
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: C.navy,
        color: "#FFFFFF",
        fontFamily,
        fontSize: 52,
        fontWeight: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${a})`,
        boxShadow: "0 8px 18px rgba(20,40,90,0.3)",
        border: `6px solid ${C.yellow}`,
      }}
    >
      {n}
    </div>
  );
};

export const MergeScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG22_TEXT.merge;
  const dim = easeInOut(f / 26);
  const fold = easeInOut((f - MG.fold0) / (MG.fold1 - MG.fold0));
  const pinsOut = 1 - clamp((f - MG.fold0 + 6) / 12);
  const one = easeOut((f - MG.one) / 14);
  const pulse = clamp((f - 8) / 10) * (1 - clamp((f - 30) / 20));
  // петля сжимается по горизонтали в вертикальный штрих — основу «1»
  const loopStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
    transform: `translate(${(540 - CENTER.x) * fold}px, ${(900 - CENTER.y) * fold}px) scale(${lerp(1, 0.06, fold)}, ${lerp(1, 0.9, fold)})`,
    opacity: 1 - clamp((f - MG.one) / 10),
  };
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#FFFFFF",
        fontFamily,
        color: C.navy,
      }}
    >
      <div style={{ opacity: 1 - dim }}>
        <BishkekMap />
      </div>
      <div
        style={{
          position: "absolute",
          left: -240,
          top: 520,
          width: 900,
          height: 900,
          borderRadius: 450,
          backgroundColor: C.yellowSoft,
          opacity: dim,
        }}
      />
      <div style={loopStyle}>
        <RouteLine am={1} pm={1} pulse={pulse} width={30} />
        <div style={{ opacity: pinsOut }}>
          <PartDot path={PATH_AM} n="1" at={MG.labels} f={f} />
          <PartDot path={PATH_PM} n="2" at={MG.labels + 14} f={f} />
        </div>
      </div>
      <div style={{ opacity: pinsOut }}>
        <Pin kind="home" pop={1} />
        <Pin kind="school" pop={1} />
      </div>
      {/* большая «1» */}
      {one > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 470,
            textAlign: "center",
            fontSize: 600,
            fontWeight: 1000,
            lineHeight: 1,
            color: C.yellow,
            WebkitTextStroke: `14px ${C.navy}`,
            paintOrder: "stroke fill",
            opacity: one,
            transform: `scale(${0.7 + 0.3 * one})`,
            textShadow: "0 24px 50px rgba(20,40,90,0.18)",
          }}
        >
          {t.one}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1080,
          textAlign: "center",
          fontSize: 76,
          fontWeight: 1000,
          ...rise(f, MG.text),
        }}
      >
        {t.word}
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1190,
          display: "flex",
          justifyContent: "center",
          ...rise(f, MG.text + 8),
        }}
      >
        <div
          style={{
            padding: "14px 34px",
            borderRadius: 999,
            backgroundColor: C.navy,
            color: "#FFFFFF",
            fontSize: 46,
            fontWeight: 900,
          }}
        >
          {t.eq} ={" "}
          <span style={{ color: C.yellow }}>
            <Txt>{t.route}</Txt>
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 360,
          textAlign: "center",
          fontSize: 44,
          fontWeight: 900,
          color: C.muted,
          ...rise(f, MG.labels + 24),
        }}
      >
        {t.note}
      </div>
    </div>
  );
};
