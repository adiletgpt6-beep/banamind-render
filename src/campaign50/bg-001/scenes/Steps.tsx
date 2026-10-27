// Сцена 6 (45,5–56,5 с). Мама спокойно изучает на странице BalaGo, как
// всё устроено: по словам диктора загораются шаги Арыз → Топ түзүү →
// Акысыз биринчи сапар → Чечим; в конце она наводит курсор на «Арыз
// калтыруу» — собирается оставить заявку (не отправлена, поездка не
// подтверждена). Без обещания мгновенного старта: сначала подходящая
// группа, потом бесплатная полная пробная поездка, потом решение семьи.
import { useContext } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { bg1Beats } from "../beats";
import { CuesContext } from "../context";
import { type PoseIn } from "../rig/Actor";
import { clamp, easeOut, keys, lerp } from "../rig/motion";
import { NAVY, pop, YELLOW, YELLOW_DEEP } from "../screens";
import { BG1_TEXT } from "../script";
import { box, camMove, Shot } from "../shots";
import { keyAt, seatOf } from "./common";
import { MOM, OfficeWorld } from "./OfficeWorld";

const StepIcon: React.FC<{ i: number }> = ({ i }) => (
  <svg width={64} height={64} viewBox="0 0 40 40">
    {i === 0 ? <><rect x={10} y={7} width={20} height={26} rx={3} fill="none" stroke={NAVY} strokeWidth={3.5} /><path d="M 14 15 L 26 15 M 14 21 L 24 21 M 14 27 L 20 27" stroke={NAVY} strokeWidth={3} strokeLinecap="round" /></> : null}
    {i === 1 ? <>{[12, 20, 28].map((x) => <circle key={x} cx={x} cy={15} r={4.5} fill={NAVY} />)}<path d="M 6 32 Q 20 18 34 32" fill="none" stroke={NAVY} strokeWidth={4} strokeLinecap="round" /></> : null}
    {i === 2 ? <><path d="M 6 26 L 8 18 Q 9 14 13 14 L 27 14 Q 31 14 32 18 L 34 26 Z" fill={NAVY} /><circle cx={13} cy={27} r={4} fill={NAVY} /><circle cx={27} cy={27} r={4} fill={NAVY} /></> : null}
    {i === 3 ? <path d="M 9 21 L 17 29 L 32 12" fill="none" stroke={NAVY} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /> : null}
  </svg>
);

export const StepsScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { steps, n04 } = bg1Beats(cues);
  const free = steps[2];
  const apply = Math.max(steps[3] + 24, n04.to - 10); // курсор на «Арыз калтыруу»
  const pose = (t: number): PoseIn => ({
    expr: t < free + 10 ? "calm" : "softSmile",
    sit: 1,
    seat: seatOf(MOM),
    lean: keys(t, [[0, 2], [apply - 20, 2], [apply, 6]]),
    lookY: 0.32,
    exhale: keys(t, [[free, 0], [free + 16, 0.7], [free + 50, 0.2]]),
    nod: keys(t, [[steps[3] + 4, 0], [steps[3] + 12, 4], [steps[3] + 22, 0]]),
    armL: { target: keyAt(0, t, false), shape: "relax", elbow: "down", behind: false },
    // правая рука на тачпаде: листает и в конце подводит курсор
    armR: { target: keyAt(4, t * 0.4, t > apply - 16 && t < apply), shape: "relax", elbow: "down", behind: false },
  });
  const face = () => 0.5;
  const panelIn = easeOut((f - 2) / 12);
  const btn = easeOut((f - (steps[3] + 14)) / 12);
  const hover = clamp((f - apply) / 8);
  return (
    <>
      <Shot f={f} from={0} to={400} cam={camMove(f, 0, 330, { x: 540, y: 1040, zoom: 1.5 }, { x: 530, y: 1045, zoom: 1.6 })}>
        <OfficeWorld f={f} uid="s6-mom" minutes={16 * 60 + 45 + f / 600} face={face} pose={pose} speaking={false} />
      </Shot>
      {/* страница BalaGo «Кантип иштейт?» */}
      <div style={box({ left: 60, top: 130, width: 960, padding: "28px 34px 30px", boxSizing: "border-box", borderRadius: 40, backgroundColor: "rgba(255,255,255,0.97)", border: `4px solid ${YELLOW}`, boxShadow: "0 18px 40px rgba(20,40,90,0.18)", fontFamily, opacity: panelIn, transform: `translateY(${(1 - panelIn) * -40}px)` })}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: 76, height: 76, borderRadius: 38 }} />
          <div style={{ fontSize: 46, fontWeight: 900, color: NAVY }}>{BG1_TEXT.stepsTitle}</div>
        </div>
        {BG1_TEXT.steps.map((label, i) => {
          const u = clamp((f - steps[i]) / 12);
          const isFree = i === 2;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 12, opacity: lerp(0.18, 1, u) }}>
              <div style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: isFree ? YELLOW : "#EEF2F8", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${lerp(0.7, 1, pop(u))})`, border: isFree ? `4px solid ${YELLOW_DEEP}` : "4px solid #DCE3EE", boxSizing: "border-box" }}>
                <StepIcon i={i} />
              </div>
              <div style={{ fontSize: isFree ? 54 : 52, fontWeight: 900, color: NAVY }}>{label}</div>
            </div>
          );
        })}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 18, opacity: btn, transform: `translateY(${(1 - btn) * 16}px)` }}>
          <div style={{ padding: "16px 40px", borderRadius: 40, backgroundColor: hover > 0.5 ? YELLOW_DEEP : YELLOW, color: NAVY, fontSize: 44, fontWeight: 900, boxShadow: hover > 0 ? `0 0 0 ${6 * hover}px rgba(242,183,5,0.35)` : "none" }}>{BG1_TEXT.apply}</div>
          {f >= apply - 14 ? (
            <svg width={56} height={66} viewBox="0 0 30 35" style={{ marginLeft: -60, marginTop: 50, transform: `translate(${(1 - easeOut((f - apply + 14) / 14)) * 160}px, ${(1 - easeOut((f - apply + 14) / 14)) * 60}px)` }}>
              <path d="M 2 2 L 2 28 L 9 22 L 14 33 L 19 31 L 14 20 L 24 20 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={2.4} strokeLinejoin="round" />
            </svg>
          ) : null}
        </div>
      </div>
    </>
  );
};
