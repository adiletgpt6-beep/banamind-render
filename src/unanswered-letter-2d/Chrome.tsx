// Постоянная подача кадра: тёмный фон, одна крупная светлая карточка
// (содержимое рисуют сцены через PanelArea) и одна строка над ней —
// активная тема (иконка + название в её цвете) и метка дня. Без ряда
// декоративных вкладок, приглушённых «следующих» карточек и вторых слоёв.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../fonts";
import { Icon } from "./graphics/Icons";
import { cardRectAt, dayLabelAt, sceneById, topicAt } from "./layout";
import { easeOut } from "./rig/motion";
import { UL2_TOPICS, UL2_VIDEO, type Ul2Topic } from "./script";
import { C, LAYOUT } from "./theme";

const FPS = UL2_VIDEO.fps;
const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const SERVICE = sceneById("service").from;
export const topicColor = (id: Ul2Topic) => UL2_TOPICS.find((x) => x.id === id)!.color;

// Карточка (фон под содержимым сцены).
export const CardBack: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const r = cardRectAt(t);
  // карточка остаётся до последнего кадра (объяснение услуги и контакты —
  // на ней же, без ухода в темноту)
  return <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 40, backgroundColor: C.card, opacity: r.opacity, scale: `${r.scale}`, boxShadow: "0 30px 80px rgba(0,0,0,0.45)" })} />;
};

// Сколько кадров подряд значение не меняется (для мягкого проявления).
const ageOf = (f: number, fn: (t: number) => unknown, max = 30) => {
  const v = fn(f / FPS);
  let age = 0;
  // до начала ролика значение считается тем же (первый кадр сразу читаем)
  while (age < max && (f - age - 1 < 0 || fn((f - age - 1) / FPS) === v)) age++;
  return age;
};

// Строка над карточкой: тема и день.
export const TopicBar: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const a = 1 - easeOut((t - SERVICE + 0.35) / 0.35);
  if (a < 0.01) return null;
  const topic = topicAt(t);
  const day = dayLabelAt(t);
  const H = LAYOUT.header.h;
  const topicA = easeOut(ageOf(f, topicAt) / 8);
  const dayA = easeOut(ageOf(f, dayLabelAt) / 8);
  const tp = topic ? UL2_TOPICS.find((x) => x.id === topic)! : null;
  return (
    <div style={box({ left: LAYOUT.side + 6, right: LAYOUT.side + 6, top: LAYOUT.header.y, height: H, display: "flex", alignItems: "center", gap: 14, fontFamily, opacity: a })}>
      {tp ? (
        <div style={{ height: H, padding: "0 30px 0 10px", borderRadius: H / 2, backgroundColor: tp.color, display: "flex", alignItems: "center", gap: 10, opacity: topicA, translate: `0 ${(1 - topicA) * 8}px` }}>
          <div style={{ width: H - 16, height: H - 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon id={tp.id} size={40} color={C.ink} stroke={4} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.ink, whiteSpace: "nowrap" }}>{tp.label}</div>
        </div>
      ) : null}
      {day ? (
        <div style={{ height: H - 8, padding: "0 26px", borderRadius: (H - 8) / 2, backgroundColor: C.dark, border: `2px solid ${C.line}`, display: "flex", alignItems: "center", fontSize: 34, fontWeight: 900, color: C.text, opacity: dayA, whiteSpace: "nowrap" }}>
          {day}
        </div>
      ) : null}
    </div>
  );
};
