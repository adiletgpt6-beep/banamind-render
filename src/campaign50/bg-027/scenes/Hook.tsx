// Сцена 1: хук у ворот. Крупный план: к руке ребёнка тянется ладонь
// взрослого, которого никто не обозначил, — кадр замирает (стоп-кадр,
// цвет уходит, «?»). Камера отъезжает: ребёнок рядом с водителем у белой
// машины, передачи не происходит; ребёнок отступает к водителю.
// Надпись «БАЛАНЫ КИМ ТОСОТ?»; метка «Шарттуу мисал» всё время сцены.
import { useCurrentFrame } from "remotion";
import { Actor, type Place, type PoseIn } from "../../../two-schedules-2d/rig/Actor";
import { easeOut, keys, keysV, type Vec } from "../../../two-schedules-2d/rig/motion";
import { camMove, Shot, box } from "../../../two-schedules-2d/shots";
import { fontFamily } from "../../../fonts";
import { useLine } from "../context";
import { BG27_TEXT } from "../script";
import { GATE, GateStreet, H, Marker, NAVY, WhiteCar, YELLOW } from "../sets";

export const HOOK = { freeze: 30, release: 118 } as const;

const at = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + dx * p.h, y: p.y + dy * p.h });

// Ход времени персонажей: до стоп-кадра, пауза, затем продолжение.
const actorFrame = (f: number) => (f < HOOK.freeze ? f : f < HOOK.release ? HOOK.freeze : f - (HOOK.release - HOOK.freeze));

export const DRIVER: Place = { x: GATE.driver, y: GATE.footY, h: H.adult };
export const KID_AT_GATE: Place = { x: GATE.kid, y: GATE.footY, h: H.kid };
export const ADULT_AT_GATE: Place = { x: GATE.adult, y: GATE.footY, h: H.adult };

// Водитель: спокойная поза у машины, телефон не в руках.
export const driverRest = (): PoseIn => ({
  expr: "calm",
  armL: { target: at(DRIVER, -0.12, -0.43), shape: "relax", elbow: "down" },
  armR: { target: at(DRIVER, 0.12, -0.43), shape: "relax", elbow: "down" },
});

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const fa = actorFrame(f);
  const n1 = useLine("n1");
  const frozen = f >= HOOK.freeze && f < HOOK.release;
  const freezeK = frozen ? easeOut((f - HOOK.freeze) / 6) : f >= HOOK.release ? 1 - easeOut((f - HOOK.release) / 10) : 0;

  // ребёнок: после стоп-кадра отступает к водителю
  const r = HOOK.freeze; // кадр персонажей, где они «продолжают»
  const kidPlace = (t: number): Place => ({ ...KID_AT_GATE, x: keys(t, [[r + 4, GATE.kid], [r + 40, GATE.kid - 70]]) });
  const kid = (t: number): PoseIn => ({
    expr: t < r ? "thinking" : "worried",
    lookX: 0.1,
    armR: { target: keysV(t, [[0, at(KID_AT_GATE, 0.16, -0.42)], [r - 6, at(KID_AT_GATE, 0.24, -0.5)], [r + 10, at(KID_AT_GATE, 0.24, -0.5)], [r + 30, at(KID_AT_GATE, 0.13, -0.42)]]), shape: "open", elbow: "down" },
    armL: { target: at(KID_AT_GATE, -0.15, -0.42), shape: "relax", elbow: "down" },
  });
  const kidFace = (t: number) => keys(t, [[0, 0.55], [r + 20, 0.5], [r + 40, -0.4], [r + 70, -0.1]]);
  // неизвестный взрослый: протянутая ладонь, затем опускает руку
  const stranger = (t: number): PoseIn => ({
    expr: "neutral",
    lean: keys(t, [[0, 2], [r, 5], [r + 30, 2]]),
    armL: {
      target: keysV(t, [[0, at(ADULT_AT_GATE, -0.25, -0.5)], [r, { x: GATE.kid + 230, y: GATE.footY - 0.5 * H.adult }], [r + 20, { x: GATE.kid + 230, y: GATE.footY - 0.5 * H.adult }], [r + 50, at(ADULT_AT_GATE, -0.12, -0.42)]]),
      shape: "open",
      elbow: "down",
    },
    armR: { target: at(ADULT_AT_GATE, 0.12, -0.43), shape: "relax", elbow: "down" },
  });
  // водитель: после стоп-кадра мягко кладёт руку ребёнку на плечо
  const driver = (t: number): PoseIn => ({
    ...driverRest(),
    expr: "calm",
    armR: {
      target: keysV(t, [[r + 18, at(DRIVER, 0.12, -0.43)], [r + 46, { x: GATE.kid - 70 - 0.12 * H.kid, y: GATE.footY - 0.74 * H.kid }]]),
      shape: t > r + 30 ? "open" : "relax",
      elbow: "down",
    },
  });

  const cam = f < 40 ? { x: 1050, y: 1110, zoom: 2.3 } : camMove(f, 40, 150, { x: 1050, y: 1110, zoom: 2.3 }, { x: 930, y: 1000, zoom: 1.02 });
  const strangerGrey = f >= HOOK.freeze ? 1 : 0;
  const title = easeOut((f - (HOOK.freeze + 4)) / 10);
  const q = easeOut((f - (HOOK.freeze + 2)) / 8);
  const qPos = { x: GATE.kid + 175, y: GATE.footY - 0.5 * H.adult - 40 };

  return (
    <Shot
      f={f}
      from={0}
      to={100000}
      cam={cam}
      base={{ x: 930, y: 1040, zoom: 1.02 }}
      overlay={
        <>
          {/* стоп-кадр: светлая рамка */}
          <div style={box({ inset: 0, boxShadow: `inset 0 0 0 ${18 * freezeK}px rgba(255,255,255,0.9)`, pointerEvents: "none" })} />
          <Marker text={BG27_TEXT.marker} f={f} />
          <div style={box({ left: 60, right: 60, top: 360, textAlign: "center", fontFamily, opacity: title, translate: `0 ${(1 - title) * 30}px`, scale: `${0.92 + 0.08 * title}` })}>
            <div style={{ display: "inline-block", padding: "18px 34px", borderRadius: 28, backgroundColor: "#FFFFFF", boxShadow: "0 14px 40px rgba(20,40,90,0.18)", fontSize: 76, fontWeight: 900, color: NAVY, lineHeight: 1.05 }}>
              <span>БАЛАНЫ </span>
              <span style={{ color: "#E0A400" }}>КИМ</span>
              <span> ТОСОТ?</span>
            </div>
            <div style={{ marginTop: 16, fontSize: 36, fontWeight: 800, color: "#3A4F80", opacity: easeOut((f - n1.from) / 10) }}>{BG27_TEXT.hook.city}</div>
          </div>
        </>
      }
    >
      <GateStreet f={f}>
        <div style={{ filter: `saturate(${1 - 0.7 * freezeK})` }}>
          <Actor uid="h-driver" look="parentA" f={fa} place={() => DRIVER} face={(t) => keys(t, [[0, 0.35], [r + 20, 0.35], [r + 40, 0.6]])} pose={driver} seed={8} />
          <Actor uid="h-kid" look="son" f={fa} place={kidPlace} face={kidFace} pose={kid} seed={4} />
        </div>
        <div style={{ filter: strangerGrey ? "grayscale(1) brightness(1.18) contrast(0.7)" : undefined, opacity: 1 - 0.35 * strangerGrey }}>
          <Actor uid="h-stranger" look="dad" f={fa} place={() => ADULT_AT_GATE} face={() => -0.6} pose={stranger} seed={9} />
        </div>
        {/* «?» над протянутой ладонью */}
        <div style={box({ left: qPos.x - 46, top: qPos.y - 46, width: 92, height: 92, borderRadius: 46, backgroundColor: YELLOW, color: NAVY, fontFamily, fontSize: 64, fontWeight: 900, textAlign: "center", lineHeight: "92px", opacity: q, scale: `${0.6 + 0.4 * q}`, boxShadow: "0 8px 20px rgba(20,40,90,0.2)" })}>?</div>
        <WhiteCar x={GATE.carStop - 60} y={GATE.carY} s={1.6} />
      </GateStreet>
    </Shot>
  );
};
