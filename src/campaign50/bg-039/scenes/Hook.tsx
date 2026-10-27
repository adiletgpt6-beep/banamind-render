// Сцена 1 (хук, 0–3 с): крупно бумажный билет одного полного сапара на
// деревянном столе. Верх «ҮЙ → МЕКТЕП» — «Аткарылды»; на 0,9 с на нижнюю
// половину «МЕКТЕП → ҮЙ» падает штамп «Кызмат аткарган жок», и она теряет
// цвет снизу вверх. Вопрос крупно: «КЫЗМАТТАН УЛАМ ҮЗГҮЛТҮК БОЛСО?».
// Диктор: «Кызматтан улам жолдун бир бөлүгү аткарылбай калсачы?»
// К концу сцены билет встаёт ровно в центр (HOOK_END) — следующая сцена
// начинается с того же кадра билета в руках отца и отъезжает.
import { fontFamily } from "../../../fonts";
import { clamp, easeInOut, easeOut, keys } from "../../../two-schedules-2d/rig/motion";
import { NAVY, Ticket, YELLOW } from "../art";
import { box, useSceneFrame, useSceneFrames } from "../context";
import { BG39_TEXT } from "../script";

export const HOOK = {
  drop: 0, // билет опускается на стол
  done: 8, // отметка «Аткарылды»
  stamp: 24, // штамп «Кызмат аткарган жок»
  fade: 30, // нижняя половина теряет цвет
  title: 32, // вопрос крупно
} as const;

// Положение билета в конце сцены (центр кадра, масштаб) — с него
// начинается отъезд камеры в сцене отца.
export const HOOK_END = { x: 510, y: 955, s: 0.94 } as const;

// Деревянная столешница крупным планом: тёплые доски, мягкий свет.
const TableTop: React.FC<{ readonly f: number }> = ({ f }) => (
  <div style={box({ inset: 0, overflow: "hidden", backgroundColor: "#D9B184" })}>
    <div style={box({ inset: -40, backgroundImage: "repeating-linear-gradient(90deg, rgba(120,80,40,0.10) 0 3px, transparent 3px 230px), repeating-linear-gradient(90deg, rgba(255,240,210,0.10) 0 60px, transparent 60px 130px)", translate: `${-f * 0.25}px 0` })} />
    {/* волокна дерева */}
    <svg width={1200} height={2000} viewBox="0 0 1200 2000" style={box({ left: -60 - f * 0.25, top: -40 })}>
      {[180, 520, 860, 1120].map((x, i) => (
        <path key={x} d={`M ${x} 0 C ${x + 40} 400, ${x - 50} 900, ${x + 20} 1400 S ${x - 30} 1900, ${x} 2000`} stroke="rgba(130,90,50,0.16)" strokeWidth={4 + i} fill="none" />
      ))}
    </svg>
    {/* размытый карандаш сына у края (дом) */}
    <div style={box({ left: 860, top: 360, width: 300, height: 26, borderRadius: 13, backgroundColor: "#F2A900", rotate: "28deg", filter: "blur(8px)", opacity: 0.8 })} />
    {/* мягкий свет из окна */}
    <div style={box({ inset: 0, background: "radial-gradient(circle at 75% 15%, rgba(255,236,190,0.55), transparent 60%)" })} />
  </div>
);

export const HookScene: React.FC = () => {
  const f = useSceneFrame();
  const len = useSceneFrames("hook");
  const t = BG39_TEXT;
  // билет: опускается с лёгким поворотом, затем медленный наезд к HOOK_END
  const drop = easeOut((f - HOOK.drop) / 16);
  const push = easeInOut((f - 20) / Math.max(30, len - 24));
  const s = (1.04 - 0.06 * drop) * (1 - push) + HOOK_END.s * push;
  const y = HOOK_END.y - 120 * (1 - drop) + 20 * (1 - push) * drop;
  const rot = keys(f, [[0, -9], [16, -3], [len - 10, 0]]);
  const done = clamp((f - HOOK.done) / 14);
  const stamp = clamp((f - HOOK.stamp) / 12);
  // нижняя половина блекнет снизу вверх
  const fade = easeInOut((f - HOOK.fade) / 22);
  // лёгкая встряска от удара штампа
  const shake = f >= HOOK.stamp + 6 && f < HOOK.stamp + 14 ? Math.sin((f - HOOK.stamp) * 2.6) * 5 * (1 - (f - HOOK.stamp - 6) / 8) : 0;
  const words = t.hookTitle.split(" ");
  return (
    <div style={box({ inset: 0 })}>
      <TableTop f={f} />
      <Ticket
        x={HOOK_END.x + shake}
        y={y}
        s={s}
        rot={rot}
        bg="#D9B184"
        topColor={1}
        bottomColor={1 - fade}
        done={done}
        failed={stamp}
        car={keys(f, [[4, 0], [26, 0.5]])}
      />
      {/* вопрос крупно: слова появляются по одному */}
      <div style={box({ left: 90, right: 150, top: 362, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px", fontFamily, fontWeight: 900, fontSize: 70, lineHeight: 1.06, textAlign: "center" })}>
        {words.map((w, i) => {
          const a = easeOut((f - HOOK.title - i * 4) / 9);
          const hot = /ҮЗГҮЛТҮК/.test(w);
          return (
            <span
              key={i}
              style={{
                opacity: a,
                translate: `0 ${(1 - a) * 26}px`,
                scale: `${0.8 + 0.2 * a}`,
                color: hot ? NAVY : "#FFFFFF",
                backgroundColor: hot ? YELLOW : "transparent",
                padding: hot ? "0 14px" : 0,
                borderRadius: 14,
                WebkitTextStroke: hot ? undefined : `12px ${NAVY}`,
                paintOrder: "stroke fill",
                textShadow: hot ? undefined : "0 6px 16px rgba(10,20,50,0.3)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
