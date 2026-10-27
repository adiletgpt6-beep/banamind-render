// Сцены 3–4: рюкзак открывается и «проецирует» на стол карточки
// пропущенных дней; они складываются в подтверждённую шкалу.
//
// Сцена 3. Клапан рюкзака на стуле поднимается, тёплый луч, карточки
// вылетают к камере → стол-инфографика. Большая карточка «1 күн»:
// үй → мектеп и мектеп → үй под одной скобкой — «1 күн = 1 толук сапар»
// (один полный день, а не два отдельных пропуска). Затем она занимает
// место в первом ряду. Диктор: «Өткөн айда эки-үч күн өткөрүлсө — беш
// пайыз, төрт-беш күн өткөрүлсө — он пайыз арзандатуу каралган.»
//
// Сцена 4. Камера идёт вверх по той же линейке: 6–7 → 15 %, 8+ → 20 %,
// потолок «Эң көп 20%», затем отъезд — видна вся шкала.
// «Алты-жети күн болсо — он беш пайыз. Сегиз же андан көп күндө —
// жыйырма пайыз. Эң жогорку чек — жыйырма пайыз.»
import { useCurrentFrame } from "remotion";
import { clamp, easeIn, easeInOut, easeOut, lerp } from "../../../two-schedules-2d/rig/motion";
import { box, useSaid, World, type Cam } from "../context";
import { BG38_TEXT } from "../script";
import { DayCard, ExampleTag, LightBeam, OneDayCard, PACK_ON_CHAIR, PackProjector, TableTop } from "../sets";
import { cardPos, CARD, Ceiling, TierRow, TINTS } from "./chart";
import { HomeWorld, MOM_HOOK, phoneInHands } from "./home";

export const CAM_ROWS_LOW: Cam = { x: 540, y: 1285, zoom: 1.1 };
export const CAM_ROWS_HIGH: Cam = { x: 540, y: 820, zoom: 1.1 };
export const CAM_ROWS_ALL: Cam = { x: 540, y: 954, zoom: 0.9 };
// рюкзак-«проектор» на краю стола, под рядами шкалы
export const PACK_TABLE = { x: 540, y: 1585 } as const;
const CAM_PACK: Cam = { x: PACK_ON_CHAIR.x, y: PACK_ON_CHAIR.y + 150, zoom: 2.3 };

export const mixCam = (a: Cam, b: Cam, t: number): Cam => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), zoom: lerp(a.zoom, b.zoom, t) });
export const toScreen = (cam: Cam, p: { x: number; y: number }) => ({ x: (p.x - cam.x) * cam.zoom + 540, y: (p.y - cam.y) * cam.zoom + 960 });

// Большая карточка «1 күн» собирается к кадру card + 28 и держится до
// слова «эки-үч» (lead сцены 3,0 с) — ≈ 1,9 с полностью читаемой.
export const SCALE1 = {
  open: 2, // клапан поднимается
  burst: 10, // карточки вылетают
  table: 20, // переход к столу
  card: 26, // большая карточка «1 күн»
} as const;

// Ряды шкалы 2–3 и 4–5 по словам диктора (общие для сцен 3–5).
export const useLowRows = () => {
  const r0 = useSaid("n2", "эки-үч");
  const b0 = useSaid("n2", "беш пайыз");
  const r1 = useSaid("n2", "төрт-беш");
  const b1 = useSaid("n2", "он пайыз");
  return { r0, b0, r1, b1 };
};

export const Scale1Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { r0, b0, r1, b1 } = useLowRows();

  // ---- рюкзак открывается (мир квартиры) ----
  const open = easeOut((f - SCALE1.open) / 14);
  const glow = clamp((f - SCALE1.open - 6) / 10);
  const homeA = 1 - clamp((f - SCALE1.table) / 12);
  const homeCam = mixCam(CAM_PACK, { ...CAM_PACK, zoom: 3.1, y: CAM_PACK.y + 40 }, easeIn((f - SCALE1.burst) / 26));

  // ---- большая карточка «1 күн»: в центре, затем летит в первый ряд ----
  const fly = easeInOut((f - r0 + 4) / 16);
  const first = toScreen(CAM_ROWS_LOW, cardPos(0, 0));
  const cardW = 640;
  const cx = lerp(540, first.x, fly);
  const cy = lerp(880, first.y, fly);
  const cs = lerp(1, (CARD.w * CAM_ROWS_LOW.zoom) / cardW, fly);
  const cardIn = easeOut((f - SCALE1.card) / 12);

  const tableA = clamp((f - SCALE1.table) / 12);
  const cam = mixCam({ ...CAM_ROWS_LOW, zoom: 1.0, y: 1150 }, CAM_ROWS_LOW, easeOut((f - SCALE1.table) / 40));
  return (
    <>
      {tableA > 0 ? (
        <div style={box({ inset: 0, opacity: tableA })}>
          <World cam={cam} bg="#EBD5B2">
            <TableTop f={f} />
            <PackProjector x={PACK_TABLE.x} y={PACK_TABLE.y} f={f} a={clamp((f - SCALE1.table - 6) / 14)} />
            <TierRow tier={0} f={f} s={{ appear: easeOut((f - r0) / 12), cardsFrom: r0 + 4, badge: b0, skipFirst: fly < 1 }} />
            <TierRow tier={1} f={f} s={{ appear: easeOut((f - r1) / 12), cardsFrom: r1 + 4, badge: b1 }} />
          </World>
        </div>
      ) : null}
      {homeA > 0 ? (
        <div style={box({ inset: 0, opacity: homeA })}>
          <World cam={homeCam} bg="#EFE3D0">
            <HomeWorld
              f={f}
              dust={200}
              uid="s3"
              momPlace={() => MOM_HOOK}
              momFace={() => -0.5}
              momPose={() => ({ expr: "surprised", lookY: 0.2, ...phoneInHands(MOM_HOOK, 0.05) })}
              packOpen={open}
              packGlow={glow}
              sun={0.8}
            />
            <LightBeam x={PACK_ON_CHAIR.x} y={PACK_ON_CHAIR.y + 30} len={520} w={520} a={glow * 0.9} />
          </World>
        </div>
      ) : null}
      {/* квартира — условный пример: метка, пока она видна */}
      <ExampleTag a={homeA} />
      {/* карточки вылетают из рюкзака к камере */}
      {f >= SCALE1.burst && f < SCALE1.table + 16
        ? [0, 1, 2, 3, 4].map((i) => {
            const k = easeOut((f - SCALE1.burst - i * 2) / 16);
            const fade = 1 - clamp((f - SCALE1.table - 2) / 12);
            if (k <= 0) return null;
            const dx = [-300, 260, -120, 360, 60][i];
            const dy = [-260, -180, 300, 200, -420][i];
            return (
              <div key={i} style={box({ left: 0, top: 0, opacity: fade })}>
                <DayCard x={540 + dx * k} y={900 + dy * k} w={90 + 200 * k} rot={(i % 2 ? 1 : -1) * (12 + 20 * k)} a={clamp(k * 2)} tint={TINTS[i % 4]} />
              </div>
            );
          })
        : null}
      {/* мягкая вспышка света при переходе (не слепящая) */}
      <div style={box({ inset: 0, backgroundColor: "#FFF6DA", opacity: 0.55 * clamp(1 - Math.abs(f - SCALE1.table - 4) / 10), pointerEvents: "none" })} />
      {/* «1 күн = 1 толук сапар» */}
      {cardIn > 0.01 && fly < 1 ? (
        <div
          style={box({
            left: cx - cardW / 2,
            top: cy - 300,
            width: cardW,
            height: 600,
            scale: `${cs * (0.8 + 0.2 * cardIn)}`,
            opacity: cardIn,
            rotate: `${lerp(-2, 0, fly)}deg`,
          })}
        >
          <OneDayCard f={f} at={SCALE1.card} text={BG38_TEXT.oneDay} />
        </div>
      ) : null}
    </>
  );
};

export const Scale2Scene: React.FC = () => {
  const f = useCurrentFrame();
  const r2 = useSaid("n3", "Алты-жети");
  const b2 = useSaid("n3", "он беш");
  const r3 = useSaid("n3", "Сегиз");
  const b3 = useSaid("n3", "жыйырма пайыз. Эң");
  const top = useSaid("n3", "Эң жогорку");
  // камера вверх по линейке, затем отъезд на всю шкалу
  const up = easeInOut(f / 26);
  const back = easeInOut((f - top + 6) / 24);
  const cam = mixCam(mixCam(CAM_ROWS_LOW, CAM_ROWS_HIGH, up), CAM_ROWS_ALL, back);
  const done = { appear: 1, cardsFrom: -100, badge: -100 };
  return (
    <World cam={cam} bg="#EBD5B2">
      <TableTop f={f + 400} />
      <PackProjector x={PACK_TABLE.x} y={PACK_TABLE.y} f={f + 300} a={1} />
      <TierRow tier={0} f={f} s={done} />
      <TierRow tier={1} f={f} s={done} />
      <TierRow tier={2} f={f} s={{ appear: easeOut((f - r2) / 12), cardsFrom: r2 + 4, badge: b2 }} />
      <TierRow tier={3} f={f} s={{ appear: easeOut((f - r3) / 12), cardsFrom: r3 + 4, badge: b3 }} hot={clamp((f - top) / 10)} />
      <Ceiling f={f} at={top} />
    </World>
  );
};
