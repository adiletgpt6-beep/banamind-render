// Сцена 5: все карточки аккуратно уходят в папку «Өткөн ай»; знак
// процента переходит в соседнюю папку «Кийинки төлөм мезгили», где
// появляется одна отметка месяца — «Эң көп 1 ай». Отдельно, с «≠»,
// выезжает красно-синий знак «Кызматтын катасы — башка эреже»: это другая
// гарантия, её не смешивают со шкалой. Никаких обещаний автоматического
// начисления. Диктор: «Арзандатуу кийинки төлөнүүчү мезгилге эң көп бир
// айга тиешелүү. Бул баланын келбей калган күндөрү үчүн эреже,
// кызматтын катасы тууралуу шарттан өзүнчө.»
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { clamp, easeIn, easeInOut, easeOut, lerp } from "../../../two-schedules-2d/rig/motion";
import { box, useSaid, useSceneFrames, World, type Cam } from "../context";
import { BG38_TEXT, BG38_TIERS } from "../script";
import { Chip, DayCard, Folder, NAVY, PackProjector, ServiceSign, TableTop, YELLOW } from "../sets";
import { CARD, cardPos, cardsOf, Ceiling, TierRow, TINTS } from "./chart";
import { CAM_ROWS_ALL, mixCam, PACK_TABLE } from "./Scale";

const CAM_FOLDERS: Cam = { x: 540, y: 960, zoom: 1 };
const PAST = { x: 100, y: 570, w: 390, h: 470 } as const;
const NEXT = { x: 590, y: 570, w: 340, h: 470 } as const;

// Все сплошные карточки шкалы (без пунктирных) в порядке рядов.
const ALL_CARDS = BG38_TIERS.flatMap((_, tier) => Array.from({ length: cardsOf(tier) - 1 }, (_, i) => ({ tier, i })));

export const FoldersScene: React.FC = () => {
  const f = useCurrentFrame();
  const total = useSceneFrames("folders");
  const nextAt = useSaid("n4", "кийинки төлөнүүчү");
  const monthAt = useSaid("n4", "бир айга");
  const serviceAt = useSaid("n4", "кызматтын катасы");

  // карточки складываются в папку (0…34), камера — на папки
  const cam = mixCam(CAM_ROWS_ALL, CAM_FOLDERS, easeInOut((f - 4) / 26));
  const rowsFade = 1 - clamp((f - 8) / 16);
  const foldersIn = easeOut((f - 6) / 14);
  const nextOpen = easeOut((f - nextAt) / 14);
  const coin = easeInOut((f - nextAt - 2) / 20);
  const month = easeOut((f - monthAt) / 12);
  const sign = easeOut((f - serviceAt) / 14);
  const noMix = easeOut((f - serviceAt - 16) / 12);
  const exit = easeIn((f - (total - 10)) / 10);

  const inPast = { x: PAST.x + PAST.w / 2, y: PAST.y + 150 };
  return (
    <>
      <World cam={cam} bg="#EBD5B2">
        <TableTop f={f + 700} />
        <PackProjector x={PACK_TABLE.x} y={PACK_TABLE.y} f={f + 700} a={rowsFade} />
        {/* ряды шкалы растворяются, карточки летят в папку */}
        {[0, 1, 2, 3].map((tier) => (
          <TierRow key={tier} tier={tier} f={f} s={{ appear: 1, cardsFrom: -100, badge: -100 }} fade={rowsFade} hideCards />
        ))}
        <Ceiling f={f} at={-100} fade={rowsFade} />
        <div style={box({ left: 0, top: 0, opacity: foldersIn })}>
          <Folder x={PAST.x} y={PAST.y} w={PAST.w} h={PAST.h} label={BG38_TEXT.folders.past} color="#FFE7A3" tab="#E9B949">
            {ALL_CARDS.map(({ tier, i }, k) => {
              const from = cardPos(tier, i);
              const t = easeInOut((f - 2 - k * 0.9) / 16);
              const x = lerp(from.x, inPast.x + ((k % 5) - 2) * 26, t) - PAST.x;
              const y = lerp(from.y, inPast.y - (k % 3) * 8, t) - PAST.y;
              return <DayCard key={k} x={x} y={y} w={lerp(CARD.w, 92, t)} rot={((k % 5) - 2) * 5 * t} tint={TINTS[tier]} />;
            })}
          </Folder>
          <Folder x={NEXT.x} y={NEXT.y} w={NEXT.w} h={NEXT.h} label={BG38_TEXT.folders.next} color="#DCEBFA" tab="#8FB6E0" open={nextOpen}>
            {/* одна отметка месяца */}
            {month > 0.01 ? (
              <div
                style={box({
                  left: NEXT.w / 2 - 95,
                  top: 70 - 70 * month,
                  width: 190,
                  height: 170,
                  borderRadius: 22,
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 8px 18px rgba(20,40,90,0.18)",
                  overflow: "hidden",
                  fontFamily,
                  opacity: month,
                })}
              >
                <div style={box({ left: 0, right: 0, top: 0, height: 44, backgroundColor: "#2F62A8" })} />
                <div style={box({ left: 0, right: 0, top: 54, textAlign: "center", fontSize: 64, fontWeight: 900, color: NAVY })}>{BG38_TEXT.folders.month}</div>
              </div>
            ) : null}
          </Folder>
        </div>
        {/* стрелка между папками и знак процента, переходящий в «кийинки» */}
        <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", opacity: foldersIn })}>
          <path d="M 500 860 L 578 860" stroke={NAVY} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={80} strokeDashoffset={80 * (1 - nextOpen)} />
          <path d="M 556 836 L 582 860 L 556 884" stroke={NAVY} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={nextOpen} />
        </svg>
        {coin > 0.01 && coin < 1 ? (
          <div
            style={box({
              left: lerp(inPast.x, NEXT.x + NEXT.w / 2, coin) - 50,
              top: lerp(PAST.y + 60, NEXT.y + 60, coin) - 50 - Math.sin(Math.PI * coin) * 160,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: YELLOW,
              border: "6px solid #FFFFFF",
              boxSizing: "border-box",
              boxShadow: "0 10px 22px rgba(200,140,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily,
              fontSize: 50,
              fontWeight: 900,
              color: NAVY,
            })}
          >
            %
          </div>
        ) : null}
      </World>
      {/* подписи (в кадре, безопасная зона) */}
      <div style={box({ inset: 0, opacity: 1 - exit })}>
        <Chip text={BG38_TEXT.folders.heading} a={easeOut((f - nextAt) / 12)} x={540} y={452} center bg={NAVY} color="#FFFFFF" size={42} />
        <Chip text={BG38_TEXT.folders.max} a={month} x={NEXT.x + NEXT.w / 2} y={1066} center bg={YELLOW} size={42} />
        <ServiceSign x={100} y={1178} w={830} text={BG38_TEXT.folders.service} a={sign} />
        <Chip text={BG38_TEXT.folders.noMix} a={noMix} x={515} y={1356} center size={36} />
      </div>
    </>
  );
};
