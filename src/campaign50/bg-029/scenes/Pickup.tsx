// Сцена 4 (≈33–48 с): карточка «Ким тосот?» на столе переворачивается и
// раскрывается в короткую сцену после уроков у дома в Бишкеке. Белая
// машина стоит у подъезда, ребёнок выходит и идёт к маме, которая уже
// ждёт (встреча согласована заранее). Ребёнок передаётся из рук в руки
// и не остаётся на улице один. Варианты: ата-энеси или заранее
// согласованный доверенный человек.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, lerp } from "../anim";
import { useLine, useWordAt } from "../context";
import { C } from "../palette";
import { Adult, Car, Check, Pill, PickupCard, SceneTitle, Skyline, Table, WalkingKid } from "../parts";
import { BG29_TEXT } from "../script";

export const PICKUP = { flip: 16, open: 30 } as const;
const GROUND = 1440;
const MOM_X = 300;
const KID_FROM = 690;
const KID_TO = 420;

const Street: React.FC<{ readonly f: number; readonly wave: number; readonly kidX: number; readonly walking: number; readonly phase: number; readonly open: number; readonly door: number }> = ({
  f,
  wave,
  kidX,
  walking,
  phase,
  open,
  door,
}) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFF7E4", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 260 }}>
      <Skyline h={760} warm drift={f} />
    </div>
    {/* пятиэтажка с подъездом */}
    <div style={{ position: "absolute", left: 30, top: 640, width: 560, height: GROUND - 640, backgroundColor: "#F1E9DA", borderTop: "16px solid #E2D6C0" }}>
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => (
          <div key={`${r}-${c}`} style={{ position: "absolute", left: 30 + c * 104, top: 40 + r * 130, width: 70, height: 84, borderRadius: 6, backgroundColor: "#CFDDEA", border: "5px solid #FFFFFF" }} />
        )),
      )}
      <div style={{ position: "absolute", left: 200, top: GROUND - 640 - 230, width: 150, height: 230, backgroundColor: "#7B5A44", borderRadius: "10px 10px 0 0" }} />
      <div style={{ position: "absolute", left: 170, top: GROUND - 640 - 262, width: 210, height: 26, backgroundColor: "#B9A68A", borderRadius: 6 }} />
    </div>
    {/* тротуар и дорога */}
    <div style={{ position: "absolute", left: 0, right: 0, top: GROUND - 20, height: 90, backgroundColor: "#E9EDF3" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: GROUND + 70, bottom: 0, backgroundColor: "#D8DEE8" }} />
    <Car x={810} y={GROUND + 30} s={0.95} dir={-1} door={door} />
    <Adult x={MOM_X} y={GROUND} s={0.78} f={f} wave={wave} open={open} />
    <WalkingKid x={kidX} y={GROUND + 6} s={0.74} phase={phase} step={walking} f={f} dir={-1} />
  </div>
);

export const PickupScene: React.FC = () => {
  const f = useCurrentFrame();
  const n06 = useLine("n06");
  const n07 = useLine("n07");
  const t = BG29_TEXT.pickup;
  const flip = easeInOut((f - PICKUP.flip) / 14);
  const open = easeInOut((f - PICKUP.open) / 30);
  // ребёнок выходит из машины и идёт к маме; передача — на «өткөрүлөт»
  const handAt = useWordAt("n07", 8);
  const walkFrom = Math.max(PICKUP.open + 34, n07.from - 16);
  const walkTo = Math.max(walkFrom + 66, handAt - 4);
  const w = clamp((f - walkFrom) / (walkTo - walkFrom));
  const walking = f > walkFrom && f < walkTo ? Math.min(1, (f - walkFrom) / 8, (walkTo - f) / 8) : 0;
  const kidX = lerp(KID_FROM, KID_TO, w);
  const phase = (f - walkFrom) * 0.32;
  const met = appear(f, walkTo - 2, 12);
  const wave = clamp((f - (PICKUP.open + 20)) / 10) * (1 - clamp((f - (walkTo - 30)) / 12));
  const opt1 = appear(f, useWordAt("n07", 1) - 4, 12);
  const opt2 = appear(f, useWordAt("n07", 5) - 4, 12);
  // карточка: переворот (scaleX) → её «внутренность» раскрывается в кадр
  const clipT = lerp(744, 0, open);
  const clipX = lerp(228, 0, open);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy }}>
      <div style={{ position: "absolute", inset: 0, transform: "scale(1.5)", transformOrigin: "540px 960px" }}>
        <Table drift={0} />
      </div>
      {flip < 1 ? (
        <div style={{ position: "absolute", inset: 0, transform: `scaleX(${1 - flip})`, transformOrigin: "540px 960px" }}>
          <PickupCard x={540} y={960} s={2.4} text={t.card} />
        </div>
      ) : null}
      {flip >= 1 ? (
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(${clipT}px ${clipX}px ${clipT}px ${clipX}px round ${lerp(60, 0, open)}px)` }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(0.62, 1, open)})`, transformOrigin: "540px 960px" }}>
            <Street f={f} wave={wave} kidX={kidX} walking={walking} phase={phase} open={met} door={clamp((f - (walkFrom - 12)) / 8)} />
          </div>
        </div>
      ) : null}
      <SceneTitle text={t.title} a={appear(f, Math.max(PICKUP.open + 10, n06.from), 12)} />
      <div style={{ position: "absolute", left: 60, top: 460, opacity: appear(f, PICKUP.open + 24, 12) }}>
        <Pill bg="#FFFFFF" color={C.navy} size={34} style={{ boxShadow: "0 8px 20px rgba(20,40,90,0.12)" }}>
          🕑 {t.after}
        </Pill>
      </div>
      <div style={{ position: "absolute", left: 60, right: 150, top: 540, display: "flex", flexDirection: "column", gap: 12 }}>
        {t.options.map((o, i) => {
          const a = i ? opt2 : opt1;
          return (
            <div
              key={o}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                alignSelf: "flex-start",
                padding: "12px 24px",
                borderRadius: 24,
                backgroundColor: "#FFFFFF",
                boxShadow: "0 8px 20px rgba(20,40,90,0.12)",
                fontSize: 38,
                fontWeight: 900,
                opacity: a,
                translate: `${(1 - a) * -30}px 0`,
              }}
            >
              <Check s={44} />
              {o}
            </div>
          );
        })}
      </div>
      {/* передача из рук в руки */}
      <div style={{ position: "absolute", left: MOM_X - 140, top: 840, opacity: met, transform: `scale(${0.8 + 0.2 * met})` }}>
        <Pill bg={C.greenSoft} color={C.green} size={40} style={{ border: `3px solid ${C.green}` }}>
          ✓ {t.handed}
        </Pill>
      </div>
    </div>
  );
};
