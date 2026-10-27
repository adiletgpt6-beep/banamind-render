// Постоянная подача кадра (референс 1000206304.mp4): полоса тем — активная
// вкладка раскрыта (иконка + название), остальные компактные круги; метка
// дня справа; светлая основная карточка; приглушённая градиентом следующая
// карточка ниже; «второй слой» письма за календарём. Содержимое основной
// карточки рисуют сцены (PanelArea).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { Icon } from "./graphics/Icons";
import { bigAt, cardRectAt, dayLabelAt, hostDockAt, letterBehindAt, peekTopicAt, sceneById, topicAt } from "./layout";
import { clamp, easeOut } from "./rig/motion";
import { UL2_LETTER, UL2_TOPICS, UL2_VIDEO, type Ul2Topic } from "./script";
import { C, LAYOUT } from "./theme";

const FPS = UL2_VIDEO.fps;
const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const CONTACT = sceneById("contact").from;
export const topicColor = (id: Ul2Topic) => UL2_TOPICS.find((x) => x.id === id)!.color;

// Доля «активности» темы с мягким переходом (≈ 0,3 с).
const activeAmt = (id: Ul2Topic, f: number) => {
  let n = 0;
  for (let k = 0; k < 9; k++) if (topicAt((f - k) / FPS) === id) n++;
  return easeOut(n / 9);
};

// Карточка (фон под содержимым сцены).
export const CardBack: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const r = cardRectAt(t);
  const hide = easeOut((t - CONTACT + 0.35) / 0.35);
  const behind = letterBehindAt(t);
  return (
    <>
      {/* второй слой: письмо за календарём */}
      {behind > 0.01 ? (
        <div style={box({ left: r.x + 46, top: r.y - 64 * behind, width: r.w - 92, height: 160, borderRadius: 30, backgroundColor: "#D9E0EA", opacity: behind * 0.85 * (1 - hide), fontFamily, display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 28px", boxSizing: "border-box" })}>
          <Icon id="letter" size={34} color={topicColor("letter")} stroke={4} />
          <div style={{ fontSize: 28, fontWeight: 800, color: C.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{UL2_LETTER.subject}</div>
        </div>
      ) : null}
      <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 36, backgroundColor: C.card, opacity: r.opacity * (1 - hide) * hostDockAt(t + 0.4), scale: `${r.scale}`, boxShadow: "0 30px 80px rgba(0,0,0,0.45)" })} />
    </>
  );
};

// Следующая карточка: частично видна ниже основной и приглушена градиентом.
export const PeekCard: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const id = peekTopicAt(t);
  const r = cardRectAt(t);
  const a = (1 - bigAt(t)) * (1 - easeOut((t - CONTACT + 0.4) / 0.4)) * clamp((t - 1.2) / 0.5) * Math.min(1, r.opacity * 1.4);
  if (!id || a < 0.01) return null;
  const color = topicColor(id);
  const label = UL2_TOPICS.find((x) => x.id === id)!.label;
  const top = r.y + r.h + 34;
  return (
    <div style={box({ left: r.x + 34, top, width: r.w - 68, height: LAYOUT.peek.h, borderRadius: 32, overflow: "hidden", opacity: a * 0.55 })}>
      <div style={box({ inset: 0, backgroundColor: "#DCE3EC" })} />
      <div style={box({ left: 30, top: 26, display: "flex", alignItems: "center", gap: 14, fontFamily, fontSize: 32, fontWeight: 900, color: C.ink })}>
        <div style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon id={id} size={32} color={C.ink} stroke={4} />
        </div>
        {label}
      </div>
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: 30, top: 104 + i * 40, width: i ? 420 : 640, height: 18, borderRadius: 9, backgroundColor: "#B9C4D2" })} />
      ))}
      {/* приглушение к низу */}
      <div style={box({ inset: 0, background: `linear-gradient(180deg, rgba(11,13,19,0) 0%, rgba(11,13,19,0.55) 45%, ${C.bg} 100%)` })} />
    </div>
  );
};

// Полоса тем и метка дня (поверх фона, над карточкой).
export const TopicBar: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const hide = easeOut((t - CONTACT + 0.35) / 0.35);
  const show = easeOut((t - 1.0) / 0.4);
  const a = show * (1 - hide);
  if (a < 0.01) return null;
  const day = dayLabelAt(t);
  // смена метки дня — мягкое проявление
  let age = 0;
  while (age < 30 && dayLabelAt(t - (age + 1) / FPS) === day) age++;
  const dayA = easeOut(age / 8);
  const big = bigAt(t);
  let x = LAYOUT.side;
  const H = LAYOUT.tabs.h;
  return (
    <div style={box({ left: 0, top: LAYOUT.tabs.y, width: 1080, height: H, opacity: a * (1 - 0.35 * big), fontFamily })}>
      {UL2_TOPICS.map((tp) => {
        const k = activeAmt(tp.id, f);
        const labelW = tp.label.length * 18.5 + 10;
        const w = H + (labelW + 10) * k;
        const left = x;
        x += w + 10;
        return (
          <div
            key={tp.id}
            style={box({
              left,
              top: 0,
              width: w,
              height: H,
              borderRadius: H / 2,
              backgroundColor: k > 0.5 ? tp.color : C.dark,
              border: `2px solid ${k > 0.5 ? tp.color : C.line}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              boxShadow: k > 0.5 ? `0 8px 26px ${tp.color}44` : "none",
            })}
          >
            <div style={{ width: H - 4, height: H - 4, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon id={tp.id} size={36} color={k > 0.5 ? C.ink : tp.color} stroke={k > 0.5 ? 4 : 3.4} style={{ opacity: k > 0.5 ? 1 : 0.75 }} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.ink, whiteSpace: "nowrap", opacity: clamp((k - 0.4) / 0.6) }}>{tp.label}</div>
          </div>
        );
      })}
      {day ? (
        <div style={box({ right: LAYOUT.side, top: 6, height: H - 12, padding: "0 22px", borderRadius: (H - 12) / 2, backgroundColor: C.dark, border: `2px solid ${C.line}`, display: "flex", alignItems: "center", fontSize: 30, fontWeight: 900, color: C.text, opacity: dayA, whiteSpace: "nowrap" })}>
          {day}
        </div>
      ) : null}
    </div>
  );
};
