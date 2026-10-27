// Сцена 1 (хук): на белом фоне пять дверей «Дүйшөмбү … Жума», на каждой —
// одна и та же школьная метка 07:40. «Беш күн. Беш башка жумуш. Бир эле
// суроо.» — на «бир эле суроо» метки вспыхивают вместе и появляется вопрос
// «Баланы мектепке ким жеткирет?». Затем камера влетает в первую дверь
// (понедельник): дверь заполняет кадр и распахивается уже в сцене дня.
import { easeInOut, easeOut, NAVY, NAVY_SOFT, popScale, prog, YELLOW, YELLOW_SOFT } from "../art";
import { cueOf } from "../timing";
import { wordTime } from "../timing";
import { local, type SceneProps } from "../kit";
import { BG9_DAYS, BG9_TEXT } from "../script";
import { Door } from "./Door";

export const DOOR_W = 180;
const GAP = 20;
const X0 = (1080 - (5 * DOOR_W + 4 * GAP)) / 2;
const TOP = 720;
export const doorX = (i: number) => X0 + i * (DOOR_W + GAP);

export const Hook: React.FC<SceneProps> = ({ t, tl }) => {
  const { s, lt } = local(tl, "hook", t);
  const n01 = cueOf(tl, "n01");
  const one = wordTime(n01, "бир", 0.7) - s.from;
  const zoomAt = s.to - s.from - 0.8;
  const z = easeInOut(prog(lt, zoomAt, 0.8));
  // увеличение: дверь понедельника заполняет кадр 1080×1920
  const S = 1080 / DOOR_W;
  const cx = doorX(0) + DOOR_W / 2;
  const cy = TOP + (DOOR_W * 16) / 9 / 2;
  const scale = 1 + (S - 1) * z;
  const tx = (540 - cx) * z;
  const ty = (960 - cy) * z;
  const glow = Math.min(1, prog(lt, one, 0.3)) * (0.75 + 0.25 * Math.sin((lt - one) * 7));
  const q = easeOut(prog(lt, one + 0.25, 0.45));
  const fadeUi = 1 - prog(lt, zoomAt, 0.3);
  const title = easeOut(prog(lt, 0.15, 0.5));
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -180 + Math.sin(lt * 0.9) * 12, top: 1500, width: 560, height: 560, borderRadius: 280, backgroundColor: YELLOW_SOFT, opacity: fadeUi }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", opacity: title * fadeUi, transform: `translateY(${(1 - title) * 30}px)` }}>
        <div style={{ display: "inline-block", padding: "14px 40px", borderRadius: 60, backgroundColor: YELLOW, fontSize: 64, fontWeight: 1000, color: NAVY }}>{BG9_TEXT.hook.five}</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: `${cx}px ${cy}px`, transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
        {BG9_DAYS.map((d, i) => {
          const u = prog(lt, 0.3 + i * 0.17, 0.4);
          const sc = popScale(u);
          // на «беш башка жумуш» двери слегка «дышат» по очереди
          const bob = Math.sin(Math.max(0, lt - 1.2) * 3 - i * 0.8) * 4 * (1 - z);
          return (
            <div key={d.id} style={{ position: "absolute", left: doorX(i), top: TOP + bob, opacity: Math.min(1, u * 2), transform: `scale(${sc})`, transformOrigin: "50% 100%" }}>
              <div style={{ position: "absolute", left: -10, right: -10, top: -56, textAlign: "center", fontSize: 30, fontWeight: 1000, color: d.color, whiteSpace: "nowrap", opacity: 1 - z }}>{d.name}</div>
              <Door w={DOOR_W} color={d.color} name={d.name} glow={glow} />
            </div>
          );
        })}
        {/* пол под дверями */}
        <div style={{ position: "absolute", left: 40, right: 40, top: TOP + (DOOR_W * 16) / 9 + 4, height: 8, borderRadius: 4, backgroundColor: "#DCE3EE", opacity: 1 - z }} />
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1160, display: "flex", justifyContent: "center", opacity: q * fadeUi, transform: `translateY(${(1 - q) * 40}px) scale(${0.9 + 0.1 * q})` }}>
        <div style={{ padding: "22px 36px", borderRadius: 36, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 54, fontWeight: 1000, textAlign: "center", lineHeight: 1.15, boxShadow: "0 16px 40px rgba(20,40,75,0.25)" }}>
          {BG9_TEXT.hook.question}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", fontSize: 34, fontWeight: 900, color: NAVY_SOFT, opacity: q * fadeUi }}>
        Дүйшөмбүдөн жумага чейин
      </div>
    </div>
  );
};
