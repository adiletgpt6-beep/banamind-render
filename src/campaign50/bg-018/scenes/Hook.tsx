// Сцена 1 (хук): в семейном чате появляются три сообщения в разные дни —
// одна и та же фраза «Бүгүн ким алып кетет?». Жёлтый маркер проходит по
// всем трём, рядом — «×3». Диктор задаёт вопрос.
import { interpolate, useCurrentFrame } from "remotion";
import { beatsOf } from "../beats";
import { useSceneFrames, useTimeline } from "../context";
import { abs, Avatar, Bubble, C, clamp, DayChip, font, pop, SoftBackdrop } from "../ui";

export const DAYS3 = [
  { day: "Дүйшөмбү, 12-октябрь", time: "07:48" },
  { day: "Шейшемби, 13-октябрь", time: "08:05" },
  { day: "Шаршемби, 14-октябрь", time: "07:52" },
] as const;

export const ChatHeader: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20 * scale, padding: `${20 * scale}px ${30 * scale}px`, borderRadius: 34 * scale, background: C.white, boxShadow: "0 10px 30px rgba(22,52,107,0.12)" }}>
    <div style={{ display: "flex" }}>
      <Avatar who="mom" size={60 * scale} />
      <div style={{ marginLeft: -16 * scale }}>
        <Avatar who="dad" size={60 * scale} />
      </div>
    </div>
    <div>
      <div style={font(36 * scale, 900, C.navy)}>Үй-бүлөлүк чат</div>
      <div style={font(22 * scale, 700, C.grey)}>Апа, Ата</div>
    </div>
  </div>
);

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { len } = useSceneFrames("hook");
  const b = beatsOf(tl).hook;
  const push = interpolate(f, [0, len], [1, 1.06], clamp);
  return (
    <>
      <SoftBackdrop f={f} />
      <div style={abs({ inset: 0, transform: `scale(${push})`, transformOrigin: "50% 45%" })}>
        <div style={abs({ left: 70, right: 70, top: 150, opacity: pop(f, 0) })}>
          <ChatHeader />
        </div>
        {DAYS3.map((d, i) => {
          const p = pop(f, b.pops[i]);
          const hl = interpolate(f, [b.sweep + i * 7, b.sweep + i * 7 + 12], [0, 1], clamp);
          return (
            <div key={d.day} style={abs({ left: 60, right: 90, top: 340 + i * 320, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 60}px) scale(${0.85 + 0.15 * p})` })}>
              <DayChip text={d.day} active={hl} />
              <div style={{ height: 22 }} />
              <Bubble who="mom" text="Бүгүн ким алып кетет?" time={d.time} highlight={hl} scale={1.3} />
            </div>
          );
        })}
        {/* ×3 */}
        {(() => {
          const p = pop(f, b.sweep + 26, 10);
          return (
            <div style={abs({ left: 90, top: 1060, width: 170, height: 170, borderRadius: 170, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p}) rotate(${-10 + 10 * p}deg)`, boxShadow: "0 12px 30px rgba(255,170,0,0.35)" })}>
              <div style={font(84, 1000, C.navy)}>×3</div>
            </div>
          );
        })()}
      </div>
    </>
  );
};
