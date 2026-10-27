// Сцена 1 (0–≈6 с): белый стол у окна с видом на Бишкек. Маленькая рука
// ребёнка по очереди кладёт ремень с пряжкой, бутылку воды 0,5 л и
// карточку «Ким тосот?». Предметы «оживают» — подпрыгивают, как в
// предметном театре. Сверху крупно «МАЙДА НЕРСЕБИ?», после вопроса
// диктора — «МАЙДА НЕРСЕЛЕР — МААНИЛҮҮ». В конце камера наезжает на
// пряжку — через неё переход в салон.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, easeOut, lerp } from "../anim";
import { useLine, useScene } from "../context";
import { C } from "../palette";
import { Belt, Bottle, KidHand, Pill, PickupCard, Table } from "../parts";
import { BG29_TEXT } from "../script";

// Места предметов на столе; BELT — центр наезда и перехода.
export const HOOK_ITEMS = [
  { x: 250, y: 1200, rot: -8 },
  { x: 545, y: 1140, rot: 0 },
  { x: 835, y: 1210, rot: 6 },
] as const;
export const HOOK = { place: [12, 30, 48].map((x) => x + 18) } as const;
const ENTER = 18;

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const n01 = useLine("n01");
  const t = BG29_TEXT.hook;
  const push = easeInOut((f - (frames - 26)) / 26);
  const answerAt = Math.max(n01.from + 20, n01.to - 8);
  const ans = appear(f, answerAt, 12);
  const q = appear(f, 2, 10) * (1 - appear(f, answerAt - 7, 6));
  // предмет i: вход снизу в руке, «приземление», затем жизнь на столе
  const item = (i: number) => {
    const t0 = HOOK.place[i] - ENTER;
    const p = easeOut((f - t0) / ENTER);
    const land = f - HOOK.place[i];
    const squash = land >= 0 ? Math.max(0, Math.sin(clamp(land / 10) * Math.PI)) * (1 - clamp(land / 14)) : 0;
    // «оживают» на словах «майда нерселер»
    const hopAt = n01.from + 18 + i * 7;
    const hop = Math.sin(clamp((f - hopAt) / 12) * Math.PI) * 46;
    const idle = land > 0 ? Math.sin((f + i * 23) / 16) * 4 : 0;
    const { x, y, rot } = HOOK_ITEMS[i];
    return {
      x,
      y: lerp(2150, y, p) - hop + idle,
      rot: rot + Math.sin((f + i * 30) / 20) * 2 * clamp(land / 10) + (hop ? Math.sin((f - hopAt) / 2) * 3 : 0),
      squash,
      opacity: clamp(p * 4),
      hand: { y: lerp(2150, y, p) + [96, 136, 76][i], out: easeInOut((f - HOOK.place[i] - 2) / 14) },
    };
  };
  const items = [0, 1, 2].map(item);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${1 + push * 1.8})`,
          transformOrigin: `${HOOK_ITEMS[0].x}px ${HOOK_ITEMS[0].y}px`,
        }}
      >
        <Table drift={f} />
        <div style={{ position: "absolute", left: 60, top: 460, opacity: appear(f, 4, 12) }}>
          <Pill bg="#FFFFFF" color={C.navy} size={34} style={{ boxShadow: "0 8px 20px rgba(20,40,90,0.12)" }}>
            📍 {t.city}
          </Pill>
        </div>
        {/* вопрос → ответ */}
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 150,
            top: 640,
            textAlign: "center",
            fontSize: 104,
            fontWeight: 900,
            lineHeight: 1,
            opacity: q,
            transform: `scale(${0.85 + 0.15 * appear(f, 2, 10)})`,
          }}
        >
          {t.question}
        </div>
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 150,
            top: 610,
            textAlign: "center",
            fontSize: 86,
            fontWeight: 900,
            lineHeight: 1.04,
            opacity: ans * (1 - push),
            transform: `scale(${0.9 + 0.1 * ans})`,
          }}
        >
          <span style={{ backgroundColor: C.yellow, padding: "0 18px", borderRadius: 20, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{t.answer}</span>
        </div>
        {/* три детали на столе */}
        <Belt x={items[0].x} y={items[0].y} s={0.95} rotate={items[0].rot} opacity={items[0].opacity} />
        <Bottle x={items[1].x} y={items[1].y} s={1.05} rotate={items[1].rot} squash={items[1].squash} label={t.bottle} opacity={items[1].opacity} />
        <PickupCard x={items[2].x} y={items[2].y} s={0.95} rotate={items[2].rot} text={t.card} opacity={items[2].opacity} />
        {items.map((it, i) =>
          it.hand.out < 1 ? (
            <KidHand key={i} x={it.x} y={it.hand.y + it.hand.out * 700} angle={(i - 1) * 8} opacity={clamp(1 - it.hand.out) * it.opacity} />
          ) : null,
        )}
      </div>
    </div>
  );
};
