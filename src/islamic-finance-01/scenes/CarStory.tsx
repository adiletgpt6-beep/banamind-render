// Scenes 4 + 5 (9–22 s): the car and its price, then the murabaha transaction
// in three steps — the financier buys the car, sells it to the customer at an
// agreed price, and the customer pays in installments. One component so the
// car, price tag and contract move continuously between steps.
import { AbsoluteFill } from "remotion";
import { AnimatedCar, FinancialContract, InstitutionIcon, PersonIcon, PriceTag } from "../components/illustrations";
import { PaymentTimeline } from "../components/PaymentTimeline";
import { Camera, Pill, TransactionArrow } from "../components/ui";
import { fontFamily } from "../fonts";
import { type If01Manifest, wordStart } from "../manifest";
import { cameraScale, easeInOut, easeOut, map, prog, sec, springFirm, springPop } from "../motion";
import { PALETTE } from "../theme";

const DEAL = sec(13) - sec(9); // local frame where scene 5 begins (120)

// transaction layout
const COL = { seller: 190, financier: 540, buyer: 890 } as const;
const ACTOR_Y = 540;
const CONTRACT_Y = 815;
const CAR_LANE_Y = 1060;
const CAR_W_BIG = 580;
const CAR_W = 300;

const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

const ActorLabel: React.FC<{ readonly text: string; readonly x: number; readonly op: number; readonly strong?: boolean }> = ({ text, x, op, strong }) => (
  <div style={{ position: "absolute", left: x - 160, top: ACTOR_Y + 220, width: 320, textAlign: "center", fontFamily, fontSize: 32, fontWeight: 800, letterSpacing: "0.1em", color: strong ? PALETTE.ink : PALETTE.inkSoft, opacity: op }}>{text}</div>
);

export const CarStory: React.FC<{ readonly frame: number; readonly manifest: If01Manifest }> = ({ frame: f, manifest }) => {
  // spoken-word anchors (local frames)
  const w = (id: string, word: string, fb: number) => sec(wordStart(manifest, id, word, fb)) - sec(9);
  const tBuys = Math.max(DEAL + 28, w("l5", "buys", 14.94) - 10); // car → financier
  const tResells = Math.max(tBuys + 46, w("l5", "resells", 16.2) - 4); // car → buyer
  const tAgreed = Math.max(tResells + 30, w("l5", "agreed", 17.57) - 2);
  const tPrice = Math.max(tAgreed + 8, w("l5", "twenty-two", 17.96) - 2);
  const tPaid = Math.max(tPrice + 40, w("l5", "paid", 19.57) - 6);

  // ---------- phase 4: car drives in, price counter
  const drive = prog(f, 0, 44, easeOut);
  const bigCarX = -560 + (540 - CAR_W_BIG / 2 + 560) * drive; // left edge
  const tagDrop = springFirm(f, 26, 30);
  const count = map(f, [32, 78], [0, 20000], easeOut);
  const priceValue = f >= 78 ? 20000 : Math.round(count / 100) * 100;

  // ---------- re-framing into the transaction layout (f 120–150)
  const shift = prog(f, DEAL, DEAL + 30, easeInOut);
  const carScale = 1 - (1 - CAR_W / CAR_W_BIG) * shift;
  const actors = prog(f, DEAL + 26, DEAL + 42);

  // car center x through the steps
  const carMove1 = prog(f, tBuys, tBuys + 34, easeInOut);
  const carMove2 = prog(f, tResells, tResells + 34, easeInOut);
  let carCx = 540 + (COL.seller - 540) * shift;
  carCx += (COL.financier - COL.seller) * carMove1 + (COL.buyer - COL.financier) * carMove2;
  // wheel rotation ∝ distance travelled (big car: wheel r ≈ 36 px; small ≈ 22 px)
  const wheelDeg = (drive * (540 + 560) * 360) / 226 + ((carMove1 + carMove2) * 350 * 360) / 141;
  const carW = CAR_W_BIG * carScale;
  const carLeft = f < DEAL ? bigCarX : carCx - carW / 2;
  const carTop = f < DEAL ? 960 : 960 + (CAR_LANE_Y - 960) * shift;
  const bob = f < 44 ? Math.sin(f * 0.9) * 2.5 * (1 - drive) : 0;

  // price tag: big (phase 4) → small under the car
  const tagScale = 1 - 0.45 * shift;
  const tagToSeller = 540 + (COL.seller - 540) * shift;
  const tagMove = prog(f, tAgreed - 4, tAgreed + 14, easeInOut);
  const tagCx = tagToSeller + (COL.financier - COL.seller) * carMove1 + (COL.buyer - COL.financier) * tagMove;
  const tagTop = 440 + (CAR_LANE_Y + 180 - 440) * shift;
  const flip = prog(f, tPrice, tPrice + 10, easeInOut);
  const isSale = f >= tPrice + 5;
  const tagLabel = f < DEAL ? "CAR PRICE" : isSale ? "AGREED SALE PRICE" : "COST";

  // contract card
  const c1 = prog(f, tBuys + 6, tBuys + 36, easeInOut); // seller → financier
  const c2 = prog(f, tResells + 2, tResells + 36, easeInOut); // financier → buyer
  const contractShow = prog(f, tBuys - 4, tBuys + 8);
  const contractCx = COL.seller + (COL.financier - COL.seller) * c1 + (COL.buyer - COL.financier) * c2;
  const contractTitle = f >= tPaid ? "INSTALLMENTS" : f >= tResells + 20 ? "SALE" : "OWNERSHIP";

  const cam = f < DEAL ? cameraScale(f, 0, DEAL, 1.02, 1.0) : 1 + 0.03 * prog(f, tBuys, tBuys + 40) - 0.03 * prog(f, tResells, tResells + 40);

  const ownedByBuyer = springPop(f, tResells + 36);

  return (
    <Camera scale={cam}>
      <AbsoluteFill>
        {/* actors */}
        <div style={{ position: "absolute", inset: 0, opacity: actors }}>
          <div style={{ position: "absolute", left: COL.seller - 100, top: ACTOR_Y, opacity: 1 - 0.55 * carMove1 }}>
            <PersonIcon size={200} tone="#EEF0EA" />
          </div>
          <ActorLabel text="SELLER" x={COL.seller} op={1 - 0.55 * carMove1} />
          <div style={{ position: "absolute", left: COL.financier - 100, top: ACTOR_Y, transform: `scale(${1 + 0.06 * carMove1 - 0.06 * carMove2})`, transformOrigin: "50% 50%" }}>
            <InstitutionIcon size={200} />
          </div>
          <ActorLabel text="FINANCIER" x={COL.financier} op={1} strong />
          <div style={{ position: "absolute", left: COL.buyer - 100, top: ACTOR_Y, transform: `scale(${1 + 0.06 * carMove2})`, transformOrigin: "50% 50%" }}>
            <PersonIcon size={200} />
          </div>
          <ActorLabel text="YOU" x={COL.buyer} op={1} strong />
        </div>

        {/* step headline */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center" }}>
          <Pill frame={f} start={tBuys - 6} end={tResells - 2} tone="ink" size={40} firm>
            FINANCIER BUYS
          </Pill>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center" }}>
          <Pill frame={f} start={tResells + 4} end={tPaid - 2} tone="green" size={40} firm>
            FINANCIER SELLS TO YOU
          </Pill>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center" }}>
          <Pill frame={f} start={tPaid + 4} tone="green" size={40} firm>
            PAID IN INSTALLMENTS
          </Pill>
        </div>

        {/* ownership arrows */}
        <TransactionArrow x1={COL.seller + 60} y1={CAR_LANE_Y - 30} x2={COL.financier - 70} y2={CAR_LANE_Y - 30} progress={carMove1 * (1 - prog(f, tResells, tResells + 10))} color={PALETTE.ink} width={6} curve={-70} opacity={0.5} />
        <TransactionArrow x1={COL.financier + 60} y1={CAR_LANE_Y - 30} x2={COL.buyer - 70} y2={CAR_LANE_Y - 30} progress={carMove2 * (1 - prog(f, tPaid, tPaid + 10))} color={PALETTE.green} width={6} curve={-70} opacity={0.75} />

        {/* installments: buyer → financier */}
        <PaymentTimeline frame={f} appear={tPaid} start={tPaid + 10} interval={18} travel={16} count={4} fromX={COL.buyer - 120} toX={COL.financier + 70} y={CAR_LANE_Y - 42} />

        {/* contract */}
        {f >= tBuys - 4 ? (
          <div style={{ position: "absolute", left: contractCx - 75, top: CONTRACT_Y - 30 * Math.sin(Math.max(c1 % 1, c2 % 1) * Math.PI), opacity: contractShow, transform: `scale(${0.8 + 0.2 * contractShow}) rotate(${-4 + 8 * ((c1 + c2) / 2)}deg)`, transformOrigin: "50% 50%" }}>
            <FinancialContract title={contractTitle} width={150} sealed={f >= tPaid ? springPop(f, tPaid + 10) : f >= tResells + 20 ? springPop(f, tResells + 30) : springPop(f, tBuys + 30)} tone={contractTitle === "OWNERSHIP" ? "ink" : "green"} />
          </div>
        ) : null}

        {/* car */}
        <div style={{ position: "absolute", left: carLeft, top: carTop + bob, width: carW }}>
          <AnimatedCar width={carW} wheelAngle={wheelDeg} />
          {f >= tResells + 36 ? (
            <div style={{ position: "absolute", right: -10, top: -18, width: 64, height: 64, borderRadius: 32, backgroundColor: PALETTE.green, border: "4px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${ownedByBuyer})`, boxShadow: "0 8px 20px rgba(21,24,32,0.2)" }}>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M7 17 L14 24 L27 10" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : null}
        </div>

        {/* price tag */}
        <div style={{ position: "absolute", left: tagCx - 280, top: tagTop, width: 560, opacity: tagDrop, transform: `translateY(${(1 - tagDrop) * -420}px) scale(${tagScale}) scaleY(${1 - 0.9 * Math.sin(flip * Math.PI)})`, transformOrigin: "50% 40%" }}>
          <PriceTag value={isSale ? "$22,000" : money(priceValue)} label={tagLabel} tone={isSale ? "green" : "ink"} />
        </div>
      </AbsoluteFill>
    </Camera>
  );
};
