// Сцена 5 (≈46–59 с): «Бирок төлөм дароо алынбайт…» — длинный чек
// складывается гармошкой и превращается в честную мини-памятку: сначала
// виден её каркас (три пустых шага), затем по словам диктора: «топ» →
// «Алгач топ», «акысыз» → талон «Акысыз» и «+ акысыз толук сыноо»,
// «андан кийин» → «Андан кийин чечим», «тандайсыз» — галочка. Мелко, но
// читаемо — строка сайта «Топ издөө көбүнчө 2 жумага чейин убакыт алат»
// (группа не обещается сразу). Цены и списаний на памятке нет: порядок
// одинаков для всех расстояний. В конце — мама с памяткой спокойно
// кивает: решение за ней.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { clamp, easeInOut, easeOut, keys } from "../../../two-schedules-2d/rig/motion";
import { box, Shot } from "../../../two-schedules-2d/shots";
import { useLine, useScene, useWordAt } from "../context";
import { HELD, KITCHEN_CAM, KitchenShot, holdArms } from "../kitchen";
import { C } from "../palette";
import { B, ReceiptBack } from "../receipt";
import { BG31_TEXT } from "../script";
import { Check, Cut, Paper, TableTop } from "../ui";

const CARD = { x: 130, y: 330, w: 800, h: 960 } as const;
const MEMO_W = 160; // памятка в руках у мамы (мир)
const BACK = { x: 170, y: 286 } as const;

// Иконка группы: три ребёнка и одно «возможное» место (3–4).
const GroupIcon: React.FC<{ readonly size: number; readonly p: number }> = ({ size, p }) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 100 62">
    {[18, 41, 64].map((cx, i) => (
      <g key={cx} opacity={clamp(p * 3 - i)} transform={`translate(0 ${(1 - clamp(p * 3 - i)) * 8})`}>
        <circle cx={cx} cy={20} r={11} fill={["#E3B08A", "#D9A27C", "#EAC09E"][i]} />
        <path d={`M ${cx - 14} 52 Q ${cx} 30 ${cx + 14} 52 Z`} fill={[C.navy, "#3D6FB0", "#5E9A93"][i]} />
      </g>
    ))}
    <g opacity={clamp(p * 3 - 2)}>
      <circle cx={86} cy={20} r={11} fill="none" stroke={C.muted} strokeWidth={3} strokeDasharray="4 4" />
      <path d="M 72 52 Q 86 30 100 52" fill="none" stroke={C.muted} strokeWidth={3} strokeDasharray="4 4" />
    </g>
  </svg>
);

// Талон пробной поездки со штампом «Акысыз».
const TrialTicket: React.FC<{ readonly p: number }> = ({ p }) => (
  <div style={{ position: "relative", width: 150, height: 96, flex: "none" }}>
    <svg width={150} height={96} viewBox="0 0 150 96" style={{ position: "absolute", inset: 0 }}>
      <path d="M 10 4 L 140 4 Q 146 4 146 10 L 146 34 A 14 14 0 0 0 146 62 L 146 86 Q 146 92 140 92 L 10 92 Q 4 92 4 86 L 4 62 A 14 14 0 0 0 4 34 L 4 10 Q 4 4 10 4 Z" fill={C.yellowSoft} stroke={C.navy} strokeWidth={4} />
      <path d="M 40 30 L 110 30 M 40 48 L 96 48" stroke={C.navy} strokeWidth={5} strokeLinecap="round" opacity={0.35} />
    </svg>
    <div
      style={{
        position: "absolute",
        left: 10,
        top: 40,
        padding: "2px 12px",
        borderRadius: 10,
        border: `4px solid ${C.green}`,
        color: C.green,
        backgroundColor: "rgba(255,255,255,0.92)",
        fontFamily,
        fontSize: 30,
        fontWeight: 1000,
        transform: `rotate(-10deg) scale(${1.6 - 0.6 * easeOut(p)})`,
        opacity: clamp(p * 2),
      }}
    >
      {BG31_TEXT.memo.free}
    </div>
  </div>
);

// Содержимое памятки. Доли появления (0…1): group, free, then, check, search.
type MemoState = { readonly group: number; readonly groupText: number; readonly free: number; readonly then: number; readonly check: number; readonly search: number };
export const MEMO_DONE: MemoState = { group: 1, groupText: 1, free: 1, then: 1, check: 1, search: 1 };

const MemoCard: React.FC<{ readonly st: MemoState; readonly shadow?: number }> = ({ st, shadow = 1 }) => {
  const [first, second] = BG31_TEXT.memo.first.split(" + ");
  const show = (p: number): React.CSSProperties => ({ opacity: easeOut(p), translate: `0 ${(1 - easeOut(p)) * 22}px` });
  // каркас шага: пока шаг не назван, видна бледная заготовка
  const ghost = (p: number): React.CSSProperties => ({ opacity: 0.22 * (1 - easeOut(p)) });
  return (
    <Paper w={CARD.w} h={CARD.h} tooth={16} shadow={shadow}>
      <div style={box({ left: 0, top: 0, width: CARD.w, height: CARD.h, fontFamily, color: C.navy })}>
        {/* каркас: три пустых шага */}
        {[200, 345, 520].map((y, i) => (
          <div key={y} style={box({ left: 56, top: y + 14, width: 92, height: 92, borderRadius: 20, border: `6px solid ${C.navy}`, ...ghost([st.group, st.free, st.then][i]) })} />
        ))}
        {[200, 345, 520].map((y, i) => (
          <div key={`l${y}`} style={box({ left: 180, top: y + 40, width: [360, 440, 400][i], height: 40, borderRadius: 14, backgroundColor: C.navy, ...ghost([st.group, st.free, st.then][i]) })} />
        ))}
        <div style={box({ left: 56, right: 40, top: 200, display: "flex", alignItems: "center", gap: 24, ...show(st.group) })}>
          <GroupIcon size={150} p={st.group} />
          <div style={{ fontSize: 62, fontWeight: 1000, opacity: easeOut(st.groupText) }}>{first}</div>
        </div>
        <div style={box({ left: 56, right: 30, top: 345, display: "flex", alignItems: "center", gap: 24, ...show(st.free) })}>
          <TrialTicket p={st.free} />
          <div style={{ fontSize: 44, fontWeight: 1000, whiteSpace: "nowrap" }}>
            <span style={{ color: C.yellowDeep }}>+ </span>
            {second}
          </div>
        </div>
        <div style={box({ left: 56, right: 56, top: 486, height: 0, borderTop: `4px dashed ${C.paperEdge}` })} />
        <div style={box({ left: 56, right: 30, top: 520, display: "flex", alignItems: "center", gap: 24, ...show(st.then) })}>
          <div style={{ flex: "none", width: 92, height: 92, borderRadius: 20, border: `6px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: st.check > 0 ? C.yellow : "#FFFFFF" }}>
            <Check size={74} color={C.navy} width={3.4} p={easeOut(st.check)} />
          </div>
          <div style={{ fontSize: 58, fontWeight: 1000, whiteSpace: "nowrap" }}>{BG31_TEXT.memo.then}</div>
        </div>
        <div style={box({ left: 56, right: 56, top: 700, fontSize: 36, fontWeight: 800, lineHeight: 1.25, color: C.muted, ...show(st.search) })}>{BG31_TEXT.memo.search}</div>
      </div>
    </Paper>
  );
};

export const MemoScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const n05 = useLine("n05");
  const wSuit = useWordAt("n05", 4);
  const wGroup = useWordAt("n05", 5);
  const wFormed = useWordAt("n05", 6);
  const wFree = useWordAt("n05", 12);
  const wThen = useWordAt("n05", 13);
  const wChoose = useWordAt("n05", 17);
  // чек складывается гармошкой (0…1) и превращается в памятку
  const fold = easeInOut((f - 4) / 26);
  const memoIn = easeOut((f - 24) / 14);
  const momAt = Math.max(n05.to + 14, frames - 62);
  const bands = 4;
  const bandH = B.h / bands;
  const st: MemoState = {
    group: clamp((f - wSuit) / 18),
    groupText: clamp((f - wGroup) / 8),
    free: clamp((f - wFree + 6) / 10),
    then: clamp((f - wThen) / 10),
    check: clamp((f - wChoose) / 10),
    search: clamp((f - wFormed - 6) / 10),
  };
  return (
    <>
      <Shot f={f} from={0} to={momAt + 10} cam={{ x: 540, y: 960, zoom: 1 }} bg="#F3ECE0">
        <div style={{ position: "absolute", left: -600, top: -400, width: 2280, height: 2720 }}>
          <TableTop />
        </div>
        {/* гармошка: полосы чека сжимаются с чередующейся тенью */}
        {fold < 1 ? (
          <div style={{ position: "absolute", left: BACK.x, top: BACK.y + (B.h / 2) * 0.55 * fold, opacity: 1 - memoIn }}>
            {Array.from({ length: bands }).map((_, i) => (
              <div key={i} style={{ position: "absolute", left: 0, top: i * bandH * (1 - 0.86 * fold), width: B.w, height: bandH, overflow: "hidden", transform: `scaleY(${1 - 0.86 * fold})`, transformOrigin: "50% 0" }}>
                <div style={{ position: "absolute", left: 0, top: -i * bandH }}>
                  <ReceiptBack unroll={1} over={1} max={1} pinKm={9.4} pinDrop={1} />
                </div>
                <div style={{ position: "absolute", inset: 0, background: i % 2 ? `rgba(60,40,10,${0.22 * fold})` : `rgba(255,255,255,${0.2 * fold})` }} />
              </div>
            ))}
          </div>
        ) : null}
        {/* строка сайта из прошлой сцены гаснет вместе с чеком */}
        {fold < 1 ? (
          <div style={{ position: "absolute", left: 110, width: 800, top: BACK.y + B.h + 24, textAlign: "center", fontFamily, fontSize: 34, fontWeight: 800, lineHeight: 1.22, color: C.ink, opacity: 1 - fold }}>
            {BG31_TEXT.beyond.address}
          </div>
        ) : null}
        {/* памятка */}
        <div style={{ position: "absolute", left: CARD.x, top: CARD.y, opacity: memoIn, transform: `scale(${0.7 + 0.3 * memoIn})`, transformOrigin: "50% 30%" }}>
          <MemoCard st={st} />
        </div>
      </Shot>
      {/* мама с памяткой: спокойная улыбка, кивок */}
      <Cut f={f} from={momAt} to={100000} fade={10}>
        <KitchenShot
          f={f}
          from={0}
          to={100000}
          cam={KITCHEN_CAM}
          pose={(t) => ({
            ...holdArms(HELD.x, HELD.handY, MEMO_W),
            expr: "softSmile",
            lookY: keys(t, [
              [momAt, 0.5],
              [momAt + 16, 0.1],
            ]),
            nod: keys(t, [
              [momAt + 18, 0],
              [momAt + 26, 6],
              [momAt + 38, 0],
            ]),
            lean: 3,
          })}
          held={
            <div style={box({ left: HELD.x - MEMO_W / 2, top: HELD.top, width: CARD.w, height: CARD.h, transform: `scale(${MEMO_W / CARD.w})`, transformOrigin: "0 0" })}>
              <MemoCard st={MEMO_DONE} shadow={0.6} />
            </div>
          }
        />
      </Cut>
    </>
  );
};
