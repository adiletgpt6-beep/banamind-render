// Сцена 4: действующее правило сайта BalaGo (serviceFailureCompensation.ts).
//  • «…кызматтын себебинен…» — на блёклый билет падает штамп
//    «КЫЗМАТТЫН СЕБЕБИ».
//  • «…ар бир он сапар боюнча эсептелет» — билет улетает в 4-ю ячейку
//    блока из 10 запланированных сапаров (1–3 выполнены, 5–10 впереди);
//    счётчик «1 учур».
//  • «Алар бирден үчкө чейин болсо, пакетиңизге бир акысыз сапар кошулат» —
//    печатается золотой билет «+1 сапар акысыз» и ложится в конверт
//    «Сиздин пакетиңиз».
//  • «төрт же беш болсо — эки акысыз сапар. Шкала андан ары да ушундай
//    уланат.» — полная шкала сайта: 1–3 → +1, 4–5 → +2, 6–7 → +3,
//    8–9 → +4, 10 → +5 и «Компенсация пакетиңизге кошулат».
// Цифры шкалы — из BG39_COMP_TIERS (та же формула, что на сайте).
import { fontFamily } from "../../../fonts";
import { clamp, easeIn, easeInOut, easeOut, keys, lerp } from "../../../two-schedules-2d/rig/motion";
import { BonusTicket, INK_RED, NAVY, NAVY_SOFT, PackEnvelope, PaperBg, Ticket, YELLOW } from "../art";
import { box, useSceneFrame, useWordAt } from "../context";
import { BG39_COMP_WINDOW, BG39_TEXT } from "../script";
import { wordFrameAt, type Bg39Timeline } from "../timing";
import { HALVES_TICKET } from "./Halves";

// Кадр сцены, с которого показывается шкала (для плашки «Шарттуу мисал»).
// Пример (блок, билет, пакет) уходит за 10 кадров после «төрт» — тогда же
// гаснет плашка; шкала проявляется после него, без наложения.
export const ruleScaleAt = (tl: Bg39Timeline) => wordFrameAt(tl, "n3", "төрт", 0.7) + RULE.swap;

// Всё в пределах x 90…930 (справа 150 px — кнопки Reels), центр x = 510.
const CARD = { left: 90, top: 430, width: 840 } as const;
const CX = CARD.left + CARD.width / 2;
const SLOT = { w: 140, h: 170, gap: 18, s: 0.16 } as const;
const FAILED_SLOT = 3; // 4-й сапар блока — наш пример
const DONE = 3; // 1–3 уже выполнены
const slotXY = (i: number) => {
  const row = Math.floor(i / 5);
  const col = i % 5;
  const x0 = CX - (5 * SLOT.w + 4 * SLOT.gap) / 2 + SLOT.w / 2;
  return { x: x0 + col * (SLOT.w + SLOT.gap), y: CARD.top + 210 + row * (SLOT.h + 22) };
};

export const RULE = { title: 4, flyDur: 20, swap: 10 } as const;

export const RuleScene: React.FC = () => {
  const f = useSceneFrame();
  const t = BG39_TEXT.rule;
  const stampAt = useWordAt("n3", "себебинен", 0.12);
  const blockAt = useWordAt("n3", "он", 0.3);
  const oneAt = useWordAt("n3", "бирден", 0.45);
  const packAt = useWordAt("n3", "пакетиңизге", 0.55);
  const fourAt = useWordAt("n3", "төрт", 0.7);
  const scaleAt = useWordAt("n3", "шкала", 0.85);

  // ---------- фаза A–B: билет → ячейка блока ----------
  const fly = easeInOut((f - (blockAt + 6)) / RULE.flyDur);
  const slot = slotXY(FAILED_SLOT);
  const tx = lerp(HALVES_TICKET.x, slot.x, fly);
  const ty = lerp(HALVES_TICKET.y, slot.y, fly) - Math.sin(fly * Math.PI) * 120;
  const ts = lerp(HALVES_TICKET.s, SLOT.s, fly);
  const stamp = clamp((f - stampAt) / 12);
  const stripIn = easeOut((f - (blockAt - 4)) / 12);
  // сначала уходит пример, затем проявляется шкала (без двойных заголовков)
  const stripOut = 1 - easeInOut((f - fourAt) / RULE.swap);
  const toScale = easeInOut((f - (fourAt + RULE.swap - 2)) / 12);
  const counter = easeOut((f - (blockAt + RULE.flyDur + 4)) / 10);
  // ---------- фаза C: «+1 сапар акысыз» → пакет ----------
  const envIn = easeOut((f - oneAt) / 12);
  const bonusIn = easeOut((f - (oneAt + 6)) / 12);
  const bonusFly = easeInOut((f - (packAt + 4)) / 18);
  const bump = keys(f, [[packAt + 20, 0], [packAt + 24, 1], [packAt + 34, 0]]);
  const added = f >= packAt + 22;
  const note = easeOut((f - (packAt + 20)) / 12);
  // ---------- фаза D: шкала ----------
  const rowIn = (i: number) => easeOut((f - (i < 2 ? fourAt + RULE.swap + i * 5 : scaleAt + (i - 2) * 5)) / 10);
  const rowHot = (i: number) => (i === 0 ? keys(f, [[fourAt + 4, 1], [fourAt + 20, 0.35]]) : i === 1 ? keys(f, [[fourAt + 16, 0], [fourAt + 26, 1], [scaleAt, 1], [scaleAt + 10, 0.35]]) : 0.35 * rowIn(i));
  const title = easeOut((f - RULE.title) / 12);

  return (
    <div style={box({ inset: 0 })}>
      <PaperBg f={f} />
      {/* заголовок */}
      <div style={box({ left: 90, right: 150, top: 352, display: "flex", justifyContent: "center", gap: 12, fontFamily, fontWeight: 900, fontSize: 42, color: NAVY, opacity: title, translate: `0 ${(1 - title) * 18}px`, whiteSpace: "nowrap" })}>
        {t.title.split(" → ").map((p, i) => (
          <span key={i} style={{ display: "flex", gap: 14 }}>
            {i ? <span style={{ color: NAVY_SOFT }}>→</span> : null}
            <span style={i ? { backgroundColor: YELLOW, borderRadius: 14, padding: "0 12px" } : undefined}>{p}</span>
          </span>
        ))}
      </div>

      {/* блок из 10 запланированных сапаров */}
      {stripOut > 0.01 && stripIn > 0.01 ? (
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: stripIn * stripOut, translate: `0 ${(1 - stripIn) * 30 - 40 * (1 - stripOut)}px` })}>
          <div style={box({ left: CARD.left, top: CARD.top + 20, width: CARD.width, height: 470, borderRadius: 34, backgroundColor: "#FFFFFF", boxShadow: "0 16px 40px rgba(20,40,90,0.12)" })} />
          <div style={box({ left: CARD.left + 40, top: CARD.top + 50, fontFamily, fontWeight: 900, fontSize: 38, color: NAVY })}>{t.window}</div>
          <div
            style={box({
              right: 1080 - CARD.left - CARD.width + 36,
              top: CARD.top + 42,
              padding: "6px 18px 8px",
              borderRadius: 999,
              backgroundColor: INK_RED,
              color: "#FFFFFF",
              fontFamily,
              fontWeight: 900,
              fontSize: 34,
              opacity: counter,
              scale: `${0.7 + 0.3 * counter + 0.12 * keys(f, [[oneAt, 0], [oneAt + 5, 1], [oneAt + 14, 0]])}`,
            })}
          >
            {t.caseLabel}
          </div>
          {Array.from({ length: BG39_COMP_WINDOW }, (_, i) => {
            const p = slotXY(i);
            if (i === FAILED_SLOT) {
              // ячейка ждёт наш билет (пунктир), пока он летит
              return fly < 1 ? <div key={i} style={box({ left: p.x - SLOT.w / 2 + 14, top: p.y - SLOT.h / 2 + 4, width: SLOT.w - 28, height: SLOT.h - 8, borderRadius: 16, border: `4px dashed ${INK_RED}`, boxSizing: "border-box", opacity: 0.6 })} /> : null;
            }
            if (i < DONE) {
              const a = easeOut((f - (blockAt + i * 3)) / 8);
              return (
                <div key={i} style={box({ left: 0, top: 0, opacity: a, translate: `0 ${(1 - a) * 16}px` })}>
                  <Ticket x={p.x} y={p.y} s={SLOT.s} bg="#FFFFFF" done={1} shadow={0} />
                </div>
              );
            }
            const a = easeOut((f - (blockAt + 10 + i * 2)) / 8);
            return (
              <div
                key={i}
                style={box({
                  left: p.x - SLOT.w / 2 + 14,
                  top: p.y - SLOT.h / 2 + 4,
                  width: SLOT.w - 28,
                  height: SLOT.h - 8,
                  borderRadius: 16,
                  border: `4px dashed #C9D3E3`,
                  boxSizing: "border-box",
                  opacity: a,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily,
                  fontWeight: 900,
                  fontSize: 34,
                  color: "#B3BFD3",
                })}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* наш билет: штамп, полёт в ячейку */}
      {stripOut > 0.01 ? (
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: stripOut, translate: `0 ${-40 * (1 - stripOut)}px` })}>
          <Ticket x={tx} y={ty} s={ts} bg={fly > 0.5 ? "#FFFFFF" : "#FFFCF5"} topColor={1} bottomColor={0} done={1} failed={1} whole={1} service={stamp} shadow={fly < 1 ? 1 : 0} />
        </div>
      ) : null}

      {/* пакет и билет компенсации */}
      {stripOut > 0.01 && envIn > 0.01 ? (
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: envIn * stripOut, translate: `0 ${(1 - envIn) * 40 + 60 * (1 - stripOut)}px` })}>
          <PackEnvelope x={CX} y={1140} w={400} label={t.pack} count={added ? 4 : 3} bump={bump} />
          {bonusIn > 0.01 && bonusFly < 0.98 ? (
            <BonusTicket
              x={lerp(760, CX, bonusFly)}
              y={lerp(990, 1090, bonusFly) - Math.sin(bonusFly * Math.PI) * 70}
              s={lerp(0.78 * (0.6 + 0.4 * bonusIn), 0.42, easeIn(bonusFly))}
              rot={lerp(8, -4, bonusFly)}
              shine={clamp((f - (oneAt + 10)) / 18)}
            />
          ) : null}
          {note > 0.01 ? (
            <div style={box({ left: 90, right: 150, top: 1318, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 38, color: NAVY, opacity: note })}>{t.added}</div>
          ) : null}
        </div>
      ) : null}

      {/* полная шкала сайта */}
      {toScale > 0.01 ? (
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: toScale, translate: `0 ${(1 - toScale) * 80}px` })}>
          <div style={box({ left: CARD.left, top: CARD.top + 20, width: CARD.width, height: 790, borderRadius: 34, backgroundColor: "#FFFFFF", boxShadow: "0 16px 40px rgba(20,40,90,0.12)" })} />
          <div style={box({ left: CARD.left + 40, top: CARD.top + 52, fontFamily, fontWeight: 900, fontSize: 38, color: NAVY })}>{t.window}</div>
          {t.tiers.map((row, i) => {
            const a = rowIn(i);
            const hot = rowHot(i);
            const y = CARD.top + 130 + i * 128;
            return (
              <div
                key={row.range}
                style={box({
                  left: CARD.left + 30,
                  top: y,
                  width: CARD.width - 60,
                  height: 108,
                  borderRadius: 24,
                  backgroundColor: `rgba(255,244,194,${0.25 + 0.75 * hot})`,
                  border: `4px solid rgba(255,201,14,${hot})`,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 26px",
                  opacity: a,
                  translate: `${(1 - a) * 40}px 0`,
                  fontFamily,
                })}
              >
                <span style={{ fontSize: 44, fontWeight: 900, color: NAVY }}>{row.range}</span>
                <span style={{ fontSize: 38, fontWeight: 900, color: NAVY, backgroundColor: YELLOW, borderRadius: 999, padding: "8px 20px 10px" }}>{row.result}</span>
              </div>
            );
          })}
          <div style={box({ left: 90, right: 150, top: 1265, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 38, color: NAVY, opacity: easeOut((f - (fourAt + RULE.swap + 10)) / 12) })}>{t.added}</div>
        </div>
      ) : null}
    </div>
  );
};
