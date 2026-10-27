// Сцена 1, вставка: стол сверху. Письмо «Катталуу», два одинаковых
// конверта «Арыз» и «Төлөм»; рука мамы с картой тянется к «Төлөм»,
// на конверте пульсирует слово «ТӨЛӨМ» — и рука замирает в нерешительности.
import { fontFamily } from "../../../fonts";
import { easeInOut, easeOut, NAVY, prog, YELLOW } from "../art";
import type { Bg37Beats } from "../beats";
import { EnvelopeTop, PAPER, TopHand } from "../props";
import { BG37_TEXT } from "../script";
import { DeskBg } from "./Desk";

export const HookInsert: React.FC<{ readonly t: number; readonly b: Bg37Beats }> = ({ t, b }) => {
  const h = b.hook;
  const a = h.insert;
  const len = Math.max(0.6, h.to - a);
  const u = prog(t, a, len);
  const reach = easeOut(prog(t, a, 0.7));
  const hesitate = easeInOut(prog(t, a + 0.85, 0.6));
  const zoom = 1 + 0.08 * easeInOut(u);
  const pulse = 0.5 + 0.5 * Math.sin((t - a) * 9);
  const T = BG37_TEXT.hook;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "62% 52%" }}>
        <DeskBg t={t} />
        {/* письмо «Катталуу» */}
        <div style={{ position: "absolute", left: 90, top: 380, width: 420, height: 540, borderRadius: 18, backgroundColor: PAPER, boxShadow: "0 16px 34px rgba(110,70,20,0.2)", transform: "rotate(-7deg)" }}>
          <div style={{ position: "absolute", left: 40, top: 46, fontSize: 56, fontWeight: 1000, color: NAVY }}>{T.letter}</div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ position: "absolute", left: 40, top: 150 + i * 56, width: i % 3 === 2 ? 220 : 330, height: 16, borderRadius: 8, backgroundColor: "#D7DEEA" }} />
          ))}
        </div>
        {/* два одинаковых конверта */}
        <EnvelopeTop x={760} y={560} w={480} label={T.envApply} />
        <EnvelopeTop x={760} y={1000} w={480} label={T.envPay} glow={0.55 + 0.45 * pulse} />
        {/* «ТӨЛӨМ» — фокус */}
        <div style={{ position: "absolute", left: 760 - 210, top: 1000 + 160, width: 420, textAlign: "center", fontSize: 64, fontWeight: 1000, color: NAVY, letterSpacing: 4, opacity: easeOut(prog(t, a + 0.2, 0.3)) }}>
          <span style={{ boxShadow: `inset 0 -18px 0 ${YELLOW}` }}>{T.pay}</span>
        </div>
        {/* рука мамы с картой тянется к «Төлөм» и замирает */}
        <TopHand x={985 + 300 * (1 - reach) + 50 * hesitate} y={880 + 520 * (1 - reach) + 40 * hesitate} angle={-38} card />
      </div>
    </div>
  );
};
