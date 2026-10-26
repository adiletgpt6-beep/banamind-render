// Сцена 3 (≈17 – 30 с): «он төлөйсүз — он аласыз», бонуса нет, это
// минимальный пакет.
// Билет из сцены 2 раскрывается веером из десяти. Штамп из хука наконец
// опускается: ровно десять ударов, по одной печати «ТОЛУК / САПАР» на
// каждый билет, счётчик 1…10 (не 9 + 1, без одиннадцатого билета и
// календаря). Сверху — «10 төлөйсүз → 10 аласыз», затем «Бонус сапар: 0».
// На последней реплике веер собирается в стопку, её обхватывает жёлтая
// лента «10», внизу — «Эң аз пакет — 10 сапар».
import { useCurrentFrame } from "remotion";
import {
  clamp,
  easeInOut,
  easeOut,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import { fontFamily } from "../../../fonts";
import { useScene, useWordAt } from "../context";
import { AXIS } from "./Hook";
import { C } from "../palette";
import { BG34_TEXT } from "../script";
import {
  MiniTicket,
  Paper,
  Pill,
  RubberStamp,
  TICKET_RATIO,
  TicketStack,
  Txt,
  popScale,
  rise,
} from "../ui";

const TW = 148;
// Два ряда по пять, каждый ряд — пологой дугой (веером): печати видны целиком.
export const fanAngle = (i: number) => ((i % 5) - 2) * 4;
export const fanPos = (i: number) => {
  const c = (i % 5) - 2;
  return {
    x: AXIS + c * 160,
    y: 846 + Math.floor(i / 5) * 128 + Math.abs(c) * Math.abs(c) * 6,
  };
};
// Стопка в конце сцены (из неё начинается сцена 4).
export const STACK = { x: AXIS, y: 960, w: 300 } as const;

export const TE = { stamp0: 0, interval: 7 } as const;

export const TenScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const w3 = useWordAt("n03", 3); // «он» (толук сапар)
  const w7 = useWordAt("n03", 7); // «төлөйсүз»
  const w10 = useWordAt("n03", 10);
  const w11 = useWordAt("n03", 11); // «аласыз»
  const bonusAt = useWordAt("n04", 2); // «бонус»
  const gatherAt = useWordAt("n05", 0); // «Туруктуу»
  const bandAt = useWordAt("n05", 4); // «эң»
  const minAt = useWordAt("n05", 6); // «пакет»

  // удары штампа: ровно десять, по ритму реплики n03
  const interval = clamp((w10 - w3) / 10, 5, 9);
  const hitAt = (i: number) => Math.round(w3 + 4 + i * interval);
  const hits = Array.from({ length: 10 }, (_, i) => hitAt(i));
  const stamped = hits.filter((h) => f >= h).length;

  const gather = easeInOut((f - gatherAt) / 16);
  const exitT = easeInOut((f - (frames - 14)) / 14);

  // положение штампа: между ударами висит над следующим билетом
  const stampPos = () => {
    const first = hits[0];
    const last = hits[9];
    if (f < first - 14) {
      const u = easeOut((f - (first - 34)) / 20);
      const p = fanPos(0);
      return {
        x: lerp(1000, p.x, u),
        y: lerp(560, p.y - 110, u),
        press: 0,
        on: u > 0,
      };
    }
    if (f > last + 4) {
      const u = easeInOut((f - (last + 4)) / 16);
      const p = fanPos(9);
      return {
        x: lerp(p.x, 1060, u),
        y: lerp(p.y - 110, 520, u),
        press: 0,
        on: u < 1,
      };
    }
    // ближайший удар
    let i = 0;
    while (i < 9 && f > hits[i] + interval / 2) i++;
    const h = hits[i];
    const prev = i > 0 ? fanPos(i - 1) : fanPos(0);
    const p = fanPos(i);
    const mv =
      i > 0
        ? easeInOut((f - (hits[i - 1] + 1)) / Math.max(2, interval - 3))
        : 1;
    const press = Math.max(0, 1 - Math.abs(f - h) / 3);
    return {
      x: lerp(prev.x, p.x, mv),
      y: lerp(prev.y, p.y, mv) - 110 * (1 - press),
      press,
      on: true,
    };
  };
  const st = stampPos();

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Paper />
      {/* 10 төлөйсүз → 10 аласыз */}
      <div
        style={{
          position: "absolute",
          left: 60,
          width: 870,
          top: 290,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          fontFamily,
          color: C.navy,
          opacity: 1 - exitT,
        }}
      >
        <div style={rise(f, w7 - 4)}>
          <Pill tone="navy" size={46}>
            {BG34_TEXT.ten.paid}
          </Pill>
        </div>
        <div style={{ ...rise(f, w11 - 8), fontSize: 50, fontWeight: 1000 }}>
          <Txt>→</Txt>
        </div>
        <div style={rise(f, w11 - 4)}>
          <Pill tone="yellow" size={46}>
            {BG34_TEXT.ten.got}
          </Pill>
        </div>
      </div>

      {/* счётчик печатей */}
      <div
        style={{
          position: "absolute",
          left: AXIS - 220,
          top: 430,
          width: 440,
          height: 220,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          color: C.navy,
          opacity: clamp((f - (w3 - 2)) / 8) * (1 - gather),
          transform: `scale(${1 + 0.08 * Math.max(0, 1 - (f - hits[Math.max(0, stamped - 1)]) / 5) * (stamped > 0 ? 1 : 0)})`,
        }}
      >
        <div
          style={{
            fontSize: 170,
            fontWeight: 1000,
            lineHeight: 1,
            color: stamped === 10 ? C.stampInk : C.navy,
          }}
        >
          {stamped}
        </div>
        <div
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: C.stampInk,
            letterSpacing: 1,
          }}
        >
          {BG34_TEXT.ten.stamp}
        </div>
      </div>

      {/* Бонус сапар: 0 */}
      <div
        style={{
          position: "absolute",
          left: 60,
          width: 870,
          top: 676,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${popScale(f, bonusAt - 2, 12)})`,
          opacity: 1 - exitT,
        }}
      >
        <Pill tone="white" size={44}>
          {BG34_TEXT.ten.bonus}
        </Pill>
      </div>

      {/* веер из десяти билетов → стопка */}
      {gather < 1
        ? Array.from({ length: 10 }, (_, i) => {
            const p = fanPos(i);
            const open = easeOut((f - i * 1.6) / 16);
            const from = { x: 498, y: 1050 };
            const x0 = lerp(from.x, p.x, open);
            const y0 = lerp(from.y, p.y, open);
            const x = lerp(x0, STACK.x, gather);
            const y = lerp(y0, STACK.y, gather);
            const rot = lerp(fanAngle(i) * open, 0, gather);
            const hit = hits[i];
            const stampT = clamp((f - hit + 1) / 4);
            const bump = f >= hit && f < hit + 5 ? 1 - (f - hit) / 5 : 0;
            const sw = lerp(TW, STACK.w, gather);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x - sw / 2,
                  top: y - (sw * TICKET_RATIO) / 2 + 6 * bump,
                  width: sw,
                  height: sw * TICKET_RATIO,
                  transform: `rotate(${rot}deg)`,
                  filter: "drop-shadow(0 8px 12px rgba(20,40,90,0.16))",
                  opacity: gather > 0.85 ? 1 - (gather - 0.85) / 0.15 : 1,
                }}
              >
                <MiniTicket
                  w={sw}
                  stamp={stampT}
                  stampRot={-10 + (i % 3) * 6}
                />
                {f >= hit ? (
                  <div
                    style={{
                      position: "absolute",
                      right: -10,
                      top: -22,
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: C.yellow,
                      border: `3px solid ${C.navy}`,
                      color: C.navy,
                      fontFamily,
                      fontSize: 24,
                      fontWeight: 1000,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `scale(${popScale(f, hit, 8)}) rotate(${-rot}deg)`,
                      opacity: 1 - gather,
                    }}
                  >
                    {i + 1}
                  </div>
                ) : null}
              </div>
            );
          })
        : null}
      {gather > 0.85 ? (
        <TicketStack
          x={STACK.x}
          y={STACK.y + lerp(0, 120, exitT)}
          w={STACK.w}
          band={clamp((f - bandAt) / 14)}
          style={{
            opacity: clamp((gather - 0.85) / 0.15),
            transform: `scale(${lerp(1, 0.85, exitT)})`,
          }}
        />
      ) : null}

      {/* штамп (из хука) ставит печати */}
      {st.on ? (
        <RubberStamp
          x={st.x}
          y={st.y + 18}
          s={0.58}
          tilt={4 * (1 - st.press)}
        />
      ) : null}

      {/* Эң аз пакет — 10 сапар */}
      <div
        style={{
          position: "absolute",
          left: 60,
          width: 870,
          top: 1196,
          display: "flex",
          justifyContent: "center",
          ...rise(f, minAt - 4),
        }}
      >
        <Pill tone="navy" size={46} style={{ opacity: 1 - exitT }}>
          {BG34_TEXT.ten.minimum}
        </Pill>
      </div>
    </div>
  );
};
