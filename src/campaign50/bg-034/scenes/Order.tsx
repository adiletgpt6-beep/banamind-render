// Сцена 5 (≈43 – 58 с): порядок. «Топ түзүлүп, биринчи толук сыноо сапары
// акысыз өткөндөн кийин гана пакетти тандайсыз. Улантуу чечими —
// өзүңүздө. Улантсаңыз, пакет үчүн алдын ала төлөйсүз.»
// Сверху: стопка из 10 билетов лежит под прозрачной плашкой «Чечимге
// чейин төлөм жок». Рядом — отдельный пунктирный зелёный билет «Сыноо •
// Акысыз»: он не из десяти и не бонус. Ниже — пять шагов, загораются по
// словам: Топ издөө (3–4 бала, көбүнчө 2 жумага чейин) → Акысыз
// сыноо → Чечим — өзүңүздө (мама кивает и улыбается) → Пакет → Алдын ала
// төлөм. Только после решения плашка поднимается. Без интерфейса оплаты,
// без «оплачено». В конце верхний билет вылетает к финальной карточке.
import { useCurrentFrame } from "remotion";
import { Actor, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import {
  clamp,
  easeInOut,
  easeOut,
  lerp,
} from "../../../two-schedules-2d/rig/motion";
import type { LookId } from "../../../two-schedules-2d/rig/looks";
import { fontFamily } from "../../../fonts";
import { useScene, useWordAt } from "../context";
import { C } from "../palette";
import { BG34_TEXT } from "../script";
import {
  Check,
  Paper,
  Pill,
  TICKET_RATIO,
  TicketBody,
  TicketStack,
  popScale,
} from "../ui";
import { ST4 } from "./Distance";
import { AXIS } from "./Hook";

export const ST5 = { x: 350, y: 430, w: 300 } as const;
const PLATE = { x: 82, y: 300, w: 540, h: 300 } as const;
const TRIAL = { x: 800, y: 452, w: 210 } as const;
const ROW0 = 650;
const ROW_H = 128;

// Лицо персонажа в круге (из общего рига, без губ — реплик у них нет).
const Face: React.FC<{
  readonly look: LookId;
  readonly f: number;
  readonly size: number;
  readonly pose?: (t: number) => PoseIn;
  readonly face?: number;
  readonly uid: string;
}> = ({ look, f, size, pose, face = 0, uid }) => {
  const h = size * 6.2;
  const place = { x: size / 2, y: size / 2 + 0.86 * h, h };
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: C.sky,
        border: `4px solid #FFFFFF`,
        boxShadow: "0 6px 14px rgba(20,40,90,0.18)",
      }}
    >
      <Actor
        uid={uid}
        look={look}
        f={f}
        place={() => place}
        face={() => face}
        pose={pose ?? (() => ({ expr: "smile" }))}
        seed={3}
      />
    </div>
  );
};

export const OrderScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const a0 = useWordAt("n08", 0); // «Топ»
  const a1 = useWordAt("n08", 2); // «биринчи»
  const trialAt = useWordAt("n08", 4); // «сыноо»
  const freeAt = useWordAt("n08", 6); // «акысыз»
  const a2 = useWordAt("n09", 0); // «Улантуу чечими»
  const nodAt = useWordAt("n09", 2); // «өзүңүздө»
  const liftAt = useWordAt("n09", 3); // «Улантсаңыз»
  const a3 = useWordAt("n09", 4); // «пакет»
  const a4 = useWordAt("n09", 6); // «алдын ала»
  const acts = [a0, a1, a2, a3, a4];
  const active = acts.filter((x) => f >= x - 3).length - 1;

  // стопка приезжает из сцены 4; плашка ложится сверху
  const inT = easeInOut(f / 20);
  const sx = lerp(ST4.x, ST5.x, inT);
  const sy = lerp(ST4.y, ST5.y, inT);
  const sw = lerp(ST4.w, ST5.w, inT);
  const plateIn = easeOut((f - 12) / 14);
  const lift = easeInOut((f - liftAt) / 18);
  const exitT = easeInOut((f - (frames - 18)) / 18);

  const kids: LookId[] = ["son", "daughter", "kidA"];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Paper />

      {/* стопка под плашкой */}
      <TicketStack
        x={sx}
        y={sy}
        w={sw}
        band={1}
        glow={clamp((f - liftAt - 10) / 12) * (1 - exitT)}
        style={{ opacity: 1 - exitT }}
      />
      {plateIn > 0 && lift < 1 ? (
        <div
          style={{
            position: "absolute",
            left: PLATE.x,
            top: PLATE.y - 140 * (1 - plateIn) - 260 * lift,
            width: PLATE.w,
            height: PLATE.h,
            borderRadius: 28,
            backgroundColor: C.glass,
            border: "4px solid rgba(160,190,225,0.95)",
            boxShadow:
              "inset 0 0 0 2px rgba(255,255,255,0.7), 0 14px 30px rgba(20,40,90,0.12)",
            opacity: plateIn * (1 - lift),
            transform: `rotate(${-4 * lift}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 16,
              width: 120,
              height: 10,
              borderRadius: 5,
              backgroundColor: "rgba(255,255,255,0.8)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -26,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pill tone="white" size={32}>
              {BG34_TEXT.order.plate}
            </Pill>
          </div>
        </div>
      ) : null}

      {/* отдельный пробный билет: не из десяти, не бонус */}
      {f >= trialAt - 4 ? (
        <div
          style={{
            position: "absolute",
            left: TRIAL.x - TRIAL.w / 2,
            top: TRIAL.y - (TRIAL.w * TICKET_RATIO) / 2,
            width: TRIAL.w,
            height: TRIAL.w * TICKET_RATIO,
            transform: `scale(${popScale(f, trialAt - 4, 12)}) rotate(6deg)`,
            opacity: 1 - exitT,
          }}
        >
          <TicketBody
            w={TRIAL.w}
            dashed
            fill={C.trial}
            edge={C.trialEdge}
            logo={false}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                fontFamily,
                color: "#1F7A45",
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 1000 }}>
                {BG34_TEXT.order.trialCard}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 1000,
                  padding: "2px 12px",
                  borderRadius: 999,
                  backgroundColor: "#FFFFFF",
                  border: `2px solid ${C.trialEdge}`,
                  opacity: clamp((f - freeAt + 2) / 6),
                }}
              >
                {BG34_TEXT.order.trialFree}
              </div>
            </div>
          </TicketBody>
        </div>
      ) : null}

      {/* пять шагов */}
      {BG34_TEXT.order.steps.map((st, i) => {
        const y = ROW0 + i * ROW_H;
        const on = i <= active;
        const isActive = i === active;
        const done = i < active;
        const at = acts[i];
        const hl = isActive ? easeOut((f - at + 3) / 8) : done ? 1 : 0;
        return (
          <div
            key={st.id}
            style={{
              position: "absolute",
              left: 60,
              width: 870,
              top: y,
              height: ROW_H - 14,
              borderRadius: 28,
              backgroundColor: isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)",
              // шаги загораются строго по порядку (решение — раньше пакета)
              border: `4px solid ${isActive ? C.yellow : "rgba(207,226,246,0.9)"}`,
              boxShadow: isActive ? "0 12px 28px rgba(20,40,90,0.16)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 22px",
              boxSizing: "border-box",
              fontFamily,
              color: C.navy,
              opacity:
                (on ? 1 : 0.5) *
                clamp(1 - 2 * exitT) *
                clamp((f - 16 - i * 3) / 10),
              transform: `translateX(${(1 - clamp((f - 16 - i * 3) / 10)) * -40}px) scale(${1 + 0.03 * hl * (isActive ? 1 : 0)})`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                flex: "0 0 64px",
                backgroundColor: done
                  ? C.green
                  : isActive
                    ? C.yellow
                    : "#E3ECF7",
                color: C.navy,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                fontWeight: 1000,
              }}
            >
              {done ? <Check size={40} /> : i + 1}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 1000,
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                }}
              >
                {st.title}
              </div>
              <div
                style={{
                  fontSize: 29,
                  fontWeight: 800,
                  color: "#3A4F80",
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                }}
              >
                {st.note}
              </div>
            </div>
            {/* топ: 3–4 бала собираются */}
            {i === 0 ? (
              <div style={{ marginLeft: "auto", display: "flex" }}>
                {kids.map((k, j) => (
                  <div
                    key={j}
                    style={{
                      marginLeft: j ? -18 : 0,
                      transform: `scale(${popScale(f, a0 + 2 + j * 4, 10)})`,
                    }}
                  >
                    <Face
                      uid={`o-kid${j}`}
                      look={k}
                      f={f}
                      size={58}
                      face={j % 2 ? -0.2 : 0.2}
                    />
                  </div>
                ))}
                {/* четвёртое место — по возможности (3–4 бала) */}
                <div
                  style={{
                    marginLeft: -10,
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    border: `3px dashed ${C.skyDeep}`,
                    backgroundColor: "#FFFFFF",
                    color: C.muted,
                    fontSize: 34,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    transform: `scale(${popScale(f, a0 + 14, 10)})`,
                  }}
                >
                  +
                </div>
              </div>
            ) : null}
            {/* решение мамы */}
            {i === 2 ? (
              <div
                style={{
                  marginLeft: "auto",
                  transform: `scale(${popScale(f, a2, 12)})`,
                }}
              >
                <Face
                  uid="o-mom"
                  look="mom"
                  f={f}
                  size={92}
                  face={0.1}
                  pose={(t) => ({
                    expr: t >= nodAt - 4 ? "smile" : "thinking",
                    nod:
                      t >= nodAt - 4 && t < nodAt + 14
                        ? 10 * Math.sin(((t - nodAt + 4) / 18) * Math.PI)
                        : 0,
                    lookY: 0.1,
                  })}
                />
              </div>
            ) : null}
          </div>
        );
      })}

      {/* верхний билет вылетает к финальной карточке */}
      {exitT > 0 ? (
        <div
          style={{
            position: "absolute",
            left: lerp(sx, AXIS, exitT) - (sw * lerp(1, 1.6, exitT)) / 2,
            top:
              lerp(sy, 760, exitT) -
              (sw * lerp(1, 1.6, exitT) * TICKET_RATIO) / 2,
            transform: `scale(${lerp(1, 1.6, exitT)})`,
            transformOrigin: "0 0",
            width: sw,
            height: sw * TICKET_RATIO,
            opacity: 1 - clamp((exitT - 0.8) / 0.2) * 0.2,
          }}
        >
          <TicketBody w={sw} glow={1} />
        </div>
      ) : null}
    </div>
  );
};
