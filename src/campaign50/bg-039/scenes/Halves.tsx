// Сцена 3: «Эки бөлүк — бир толук сапар». Тот же бумажный билет крупно на
// светлом фоне. На словах диктора половины расходятся по перфорации:
// «эртең менен мектепке» — подсвечен верх (машинка доехала до школы),
// «сабактан кийин үйгө» — подсвечен низ (в примере не выполнен). Затем
// половины снова соединяются, перфорация вспыхивает — «бир толук сапар»,
// и из-за одной блёклой половины тускнеет весь билет: сапар — одно целое.
// Диктор: «BalaGo'до бир толук сапар эки бөлүктөн турат: эртең менен
// мектепке, сабактан кийин үйгө.»
import { fontFamily } from "../../../fonts";
import { easeInOut, easeOut, keys } from "../../../two-schedules-2d/rig/motion";
import { NAVY, NAVY_SOFT, PaperBg, Ticket, YELLOW } from "../art";
import { box, useLine, useSceneFrame, useWordAt } from "../context";
import { BG39_TEXT } from "../script";

export const HALVES_TICKET = { x: 510, y: 900, s: 0.92 } as const;

const Chip: React.FC<{ readonly n: number; readonly a: number; readonly y: number; readonly color: string }> = ({ n, a, y, color }) => (
  <div
    style={box({
      left: 120,
      top: y - 46,
      width: 92,
      height: 92,
      borderRadius: 46,
      backgroundColor: color,
      color: NAVY,
      fontFamily,
      fontWeight: 900,
      fontSize: 54,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: a,
      scale: `${0.6 + 0.4 * a}`,
      boxShadow: "0 10px 24px rgba(20,40,90,0.16)",
    })}
  >
    {n}
  </div>
);

export const HalvesScene: React.FC = () => {
  const f = useSceneFrame();
  const n2 = useLine("n2");
  const two = useWordAt("n2", "эки", 0.35);
  const morning = useWordAt("n2", "эртең", 0.55);
  const after = useWordAt("n2", "сабактан", 0.8);
  const join = n2.to + 8;
  const fadeAll = join + 22;
  const t = BG39_TEXT.halves;

  // билет въезжает крупнее (наплыв из сцены отца) и встаёт на место
  const enter = easeOut((f + 10) / 26);
  const s = HALVES_TICKET.s * (1.35 - 0.35 * enter);
  const split = easeInOut((f - two) / 14) * (1 - easeInOut((f - join) / 14));
  const glowTop = keys(f, [[morning - 4, 0], [morning + 4, 1], [after - 2, 1], [after + 8, 0.25], [join, 0]]);
  const glowBottom = keys(f, [[after - 4, 0], [after + 4, 1], [join - 4, 1], [join + 6, 0]]);
  const car = keys(f, [[morning, 0], [morning + 26, 0.5]]);
  const joinGlow = keys(f, [[join + 4, 0], [join + 12, 1], [join + 30, 0.4]]);
  const whole = easeInOut((f - fadeAll) / 24);
  const title = easeOut((f - two) / 12);
  const chipTop = easeOut((f - morning) / 10);
  const chipBottom = easeOut((f - after) / 10);
  const chipsOut = 1 - easeOut((f - join) / 10);
  const cap = easeOut((f - (fadeAll + 10)) / 12);
  const halfH = (880 * s) / 2;
  const gapPx = 60 * split * s;
  return (
    <div style={box({ inset: 0 })}>
      <PaperBg f={f} />
      {/* заголовок */}
      <div style={box({ left: 90, right: 150, top: 352, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 50, color: NAVY, whiteSpace: "nowrap", opacity: title, translate: `0 ${(1 - title) * 20}px` })}>
        {t.title.split(" — ").map((p, i) => (
          <span key={i}>
            {i ? " — " : ""}
            <span style={i ? { backgroundColor: YELLOW, borderRadius: 14, padding: "0 12px" } : undefined}>{p}</span>
          </span>
        ))}
      </div>
      <Ticket
        x={HALVES_TICKET.x}
        y={HALVES_TICKET.y + 30 * (1 - enter)}
        s={s}
        bg="#FFFCF5"
        topColor={1}
        bottomColor={0}
        done={1}
        failed={1}
        split={split}
        glowTop={glowTop}
        glowBottom={glowBottom}
        join={joinGlow}
        whole={whole}
        car={car}
      />
      {/* номера частей слева */}
      <Chip n={1} a={chipTop * chipsOut} y={HALVES_TICKET.y - halfH / 2 - gapPx / 2} color={YELLOW} />
      <Chip n={2} a={chipBottom * chipsOut} y={HALVES_TICKET.y + halfH / 2 + gapPx / 2} color="#BFD9F0" />
      {/* подпись: из-за одной части не выполнен весь сапар */}
      {cap > 0.01 ? (
        <div style={box({ left: 90, right: 150, top: 1336, display: "flex", justifyContent: "center", opacity: cap, translate: `0 ${(1 - cap) * 16}px` })}>
          <div style={{ padding: "16px 30px 18px", borderRadius: 26, backgroundColor: "#FFFFFF", border: `4px solid ${NAVY_SOFT}`, fontFamily, fontWeight: 900, fontSize: 38, color: NAVY, textAlign: "center", lineHeight: 1.15, maxWidth: 820 }}>
            {t.whole}
          </div>
        </div>
      ) : null}
    </div>
  );
};
