// Сцена 2 (≈6–18 с): «Каттам пазлы». В рамке группы — полоса деталей
// первого ребёнка: дарек, мектеп, убакыт. Рука родителя приносит полосу
// другой семьи (Б мектеби, 2-смена, алыс) — детали не совпадают, полоса
// покачивается и уходит. Затем рука приносит совпадающую полосу — она
// защёлкивается. Заголовки столбцов подсвечиваются на словах диктора
// «дареги», «мектеби», «убактысы». Остальные места группы ждут «?».
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, lerp, shake, snap } from "../anim";
import { useWordAt } from "../context";
import { C } from "../palette";
import { Backdrop, Hand, Icon, Piece, Pill, type PieceKind } from "../parts";
import { BG24_TEXT } from "../script";

const W = 240;
const H = 140;
const X0 = 170;
const SLOTS = [480, 650, 820, 990];
const KINDS: PieceKind[] = ["home", "school", "time"];

export const PUZZLE = { wrongIn: 36, wrongHover: 84, wrongOut: 116, rightIn: 152, rightSnap: 198 } as const;

type Look = { fill: string; stroke: string };
const plain: Look = { fill: "#FFFFFF", stroke: C.navy };

const Strip: React.FC<{ x: number; y: number; labels: readonly string[]; looks: readonly Look[]; opacity?: number; rotate?: number }> = ({ x, y, labels, looks, opacity = 1, rotate = 0 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, opacity, transform: `rotate(${rotate}deg)`, transformOrigin: `${x + 360}px ${y + 70}px` }}>
    {KINDS.map((k, i) => (
      <Piece key={k} kind={k} label={labels[i]} x={x + i * W} y={y} w={W} h={H} fill={looks[i].fill} stroke={looks[i].stroke} notch={i > 0} tab={i < 2} />
    ))}
  </div>
);

export const PuzzleScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG24_TEXT.puzzle;
  const P = PUZZLE;
  const words = [useWordAt("n02", 2), useWordAt("n02", 3), useWordAt("n02", 5)];
  const base = snap(f / 18);
  // полоса другой семьи: вход, проверка, уход
  const wIn = easeInOut((f - P.wrongIn) / (P.wrongHover - P.wrongIn));
  const wOut = easeInOut((f - P.wrongOut) / 30);
  const wrongX = X0 + shake(f, P.wrongHover + 4, 22, 18) + wOut * 820;
  const wrongY = lerp(1500, SLOTS[1] + 24, wIn) + wOut * 120;
  const wrongBad = clamp((f - P.wrongHover) / 8) * (1 - wOut);
  // совпадающая полоса
  const rIn = easeInOut((f - P.rightIn) / (P.rightSnap - P.rightIn));
  const rSnap = snap((f - P.rightSnap + 2) / 12);
  const rightY = lerp(1500, SLOTS[1] + 24, rIn) - 24 * rSnap;
  const rightOk = clamp((f - P.rightSnap) / 8);
  // рука следует за полосой, которую держит
  const holdingWrong = f < P.wrongOut + 30;
  const handX = holdingWrong ? wrongX + 400 : X0 + 400 + (1 - clamp((P.rightSnap + 18 - f) / 18)) * 300;
  const handY = holdingWrong ? wrongY + 112 : rightY + 112 + clamp((f - P.rightSnap - 6) / 24) * 640;
  const handOpacity = clamp((f - P.wrongIn + 4) / 8) * (holdingWrong ? 1 : clamp((f - P.rightIn + 6) / 8)) * (1 - clamp((f - P.rightSnap - 18) / 14));
  const bad: Look = { fill: C.coralSoft, stroke: C.coral };
  const mix = (k: number): Look => (k > 0.5 ? bad : plain);
  const good: Look = { fill: C.greenSoft, stroke: C.green };
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy }}>
      <Backdrop tone="cool" drift={f * 0.5} />
      {/* заголовок */}
      <div style={{ position: "absolute", left: 90, right: 150, top: 262, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: appear(f, 0, 10) }}>
        <div style={{ fontSize: 62, fontWeight: 900 }}>{t.title}</div>
        <Pill size={34}>📍 {t.city}</Pill>
      </div>
      {/* заголовки столбцов */}
      {KINDS.map((k, i) => {
        const on = clamp((f - words[i] + 3) / 6);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: X0 + i * W + 14,
              top: 382,
              width: W - 28,
              height: 64,
              borderRadius: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 30,
              fontWeight: 900,
              backgroundColor: on > 0.5 ? C.yellow : "#FFFFFF",
              border: `3px solid ${on > 0.5 ? C.yellow : C.line}`,
              transform: `scale(${1 + 0.08 * Math.sin(Math.PI * clamp((f - words[i] + 3) / 10))})`,
            }}
          >
            <Icon kind={k} s={30} />
            {t.kinds[i]}
          </div>
        );
      })}
      {/* рамка группы и места */}
      <div style={{ position: "absolute", left: 140, top: 462, width: 790, height: 694, borderRadius: 40, border: `4px solid ${C.line}`, backgroundColor: "rgba(255,255,255,0.75)" }} />
      {SLOTS.slice(1).map((y, i) => (
        <div key={y} style={{ opacity: i === 0 ? 1 - rightOk : 1 }}>
          {KINDS.map((k, j) => (
            <Piece key={k} kind={k} label="" x={X0 + j * W} y={y + 8} w={W} h={H - 16} fill="transparent" stroke="#C9D5E6" dashed notch={j > 0} tab={j < 2} />
          ))}
          {i > 0 ? (
            <div
              style={{
                position: "absolute",
                left: X0,
                top: y + 8,
                width: 3 * W,
                height: H - 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 72,
                fontWeight: 900,
                color: "#AEBBD0",
                opacity: 0.6 + 0.4 * Math.sin(f / 9 + i),
              }}
            >
              ?
            </div>
          ) : null}
        </div>
      ))}
      {/* первый ребёнок */}
      <div style={{ opacity: clamp(f / 8) }}>
        <Strip x={X0} y={SLOTS[0] + (1 - base) * 380} labels={[t.base.home, t.base.school, t.base.time]} looks={[plain, { fill: C.yellowSoft, stroke: C.navy }, plain]} />
      </div>
      {/* полоса другой семьи — не совпадает */}
      {f >= P.wrongIn - 2 && f < P.wrongOut + 34 ? (
        <Strip x={wrongX} y={wrongY} labels={[t.wrong.home, t.wrong.school, t.wrong.time]} looks={[mix(wrongBad), mix(wrongBad), mix(wrongBad)]} rotate={-2 * wIn + 6 * wOut} />
      ) : null}
      {wrongBad > 0.02 ? (
        <div style={{ position: "absolute", left: 0, right: 150, top: SLOTS[1] - 52, display: "flex", justifyContent: "center", opacity: wrongBad }}>
          <Pill bg={C.coral} size={34}>
            ✕ {t.wrong.note}
          </Pill>
        </div>
      ) : null}
      {/* совпадающая полоса */}
      {f >= P.rightIn - 2 ? (
        <Strip x={X0} y={rightY} labels={[t.right.home, t.right.school, t.right.time]} looks={rightOk > 0.5 ? [good, good, good] : [plain, plain, plain]} />
      ) : null}
      {rightOk > 0.02 ? (
        <div style={{ position: "absolute", left: 0, right: 150, top: SLOTS[1] - 52 + (1 - rightOk) * 10, display: "flex", justifyContent: "center", opacity: rightOk }}>
          <Pill bg={C.green} size={34}>
            ✓ {t.right.note}
          </Pill>
        </div>
      ) : null}
      {/* итог */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 150,
          top: 1196,
          textAlign: "center",
          fontSize: 44,
          fontWeight: 900,
          lineHeight: 1.15,
          opacity: appear(f, P.rightSnap + 20, 14),
        }}
      >
        {t.sum}
      </div>
      <Hand x={handX} y={handY} opacity={handOpacity} grip />
    </div>
  );
};
