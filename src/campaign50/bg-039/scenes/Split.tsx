// Сцена 5: «Эки башка эреже». Блёклый билет бережно закрывается —
// верхняя половина складывается по перфорации — и ложится в жёлтую папку
// «Кызматтын себеби» (→ «Өзүнчө компенсация»). Рядом — отдельная голубая
// папка «Баланын өзү барбаган күн» с термометром (→ «Өзүнчө арзандатуу»).
// Между ними «≠»; на «чаташтырбоо» папки вздрагивают, знак вспыхивает.
// Диктор: «Бул — баланын ооруп сабакка барбай калган күнүнө тиешелүү
// арзандатуудан башка эреже. Эки шартты чаташтырбоо маанилүү.»
import { fontFamily } from "../../../fonts";
import { clamp, easeInOut, easeOut, keys, lerp } from "../../../two-schedules-2d/rig/motion";
import { BonusTicket, Folder, INK_RED, NAVY, NAVY_SOFT, PaperBg, ThermometerIcon, Ticket, YELLOW } from "../art";
import { box, useSceneFrame, useWordAt } from "../context";
import { BG39_TEXT } from "../script";

// Всё в пределах x 90…930 (справа 150 px — кнопки Reels).
const LEFT = { x: 300, y: 860 } as const;
const RIGHT = { x: 720, y: 860 } as const;
const FOLDER = { w: 380, h: 470 } as const;

export const SPLIT = { fold: [2, 22], fly: [24, 44], insert: [44, 56], close: 58 } as const;
// Верх папки (экран) и высота сложенного билета над её краем.
const FOLDER_TOP = LEFT.y - FOLDER.h / 2;
const TK_S = 0.36;

const Result: React.FC<{ readonly x: number; readonly a: number; readonly title: string; readonly sub: string; readonly color: string }> = ({ x, a, title, sub, color }) => (
  <div style={box({ left: x - 190, top: 1130, width: 380, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: a, translate: `0 ${(1 - a) * 22}px`, fontFamily, textAlign: "center" })}>
    <div style={{ padding: "10px 20px 12px", borderRadius: 999, backgroundColor: color, fontSize: 34, fontWeight: 900, color: NAVY, whiteSpace: "nowrap" }}>{title}</div>
    <div style={{ fontSize: 30, fontWeight: 800, color: NAVY_SOFT, lineHeight: 1.15 }}>{sub}</div>
  </div>
);

export const SplitScene: React.FC = () => {
  const f = useSceneFrame();
  const t = BG39_TEXT.split;
  const ill = useWordAt("n4", "ооруп", 0.2);
  const discount = useWordAt("n4", "арзандатуудан", 0.45);
  const other = useWordAt("n4", "башка", 0.5);
  const mix = useWordAt("n4", "чаташтырбоо", 0.8);

  const title = easeOut((f - 4) / 12);
  const leftIn = easeOut((f - 6) / 14);
  const rightIn = easeOut((f - 12) / 14);
  // билет: складывается, затем опускается в левую папку
  const fold = easeInOut((f - SPLIT.fold[0]) / (SPLIT.fold[1] - SPLIT.fold[0]));
  const fly = easeInOut((f - SPLIT.fly[0]) / (SPLIT.fly[1] - SPLIT.fly[0]));
  // центр сложенного билета = его верхний край (видна нижняя половина)
  const tk = {
    x: lerp(510, LEFT.x, fly),
    y: lerp(780, FOLDER_TOP - 150, fly) - Math.sin(fly * Math.PI) * 120,
    s: lerp(0.62, TK_S, fly),
  };
  // затем скользит вниз за передний клапан папки
  const insert = easeInOut((f - SPLIT.insert[0]) / (SPLIT.insert[1] - SPLIT.insert[0]));
  const leftOpen = keys(f, [[SPLIT.fly[0], 0], [SPLIT.fly[0] + 10, 1], [SPLIT.close, 1], [SPLIT.close + 10, 0]]);
  const thermo = easeOut((f - ill) / 10);
  const resL = easeOut((f - (SPLIT.close + 6)) / 12);
  const resR = easeOut((f - discount) / 12);
  const neq = easeOut((f - other) / 10);
  const pulse = keys(f, [[mix, 0], [mix + 5, 1], [mix + 16, 0]]);
  const shakeL = pulse * Math.sin(f * 1.6) * 6;
  const inside = f >= SPLIT.insert[0];
  return (
    <div style={box({ inset: 0 })}>
      <PaperBg f={f} tint="#FFF4C2" />
      <div style={box({ left: 90, right: 150, top: 352, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 60, color: NAVY, opacity: title, translate: `0 ${(1 - title) * 18}px` })}>
        <span style={{ backgroundColor: YELLOW, borderRadius: 14, padding: "0 16px" }}>{t.title}</span>
      </div>
      {/* левая папка: кызматтын себеби */}
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: leftIn, translate: `${shakeL}px ${(1 - leftIn) * 40}px` })}>
        {/* значок результата на папке: «+1 сапар акысыз» — пара термометру справа */}
        <Folder x={LEFT.x} y={LEFT.y} w={FOLDER.w} h={FOLDER.h} color={YELLOW} tab={t.service.label} open={leftOpen}>
          {inside ? <Ticket x={FOLDER.w / 2} y={lerp(-150, 4, insert)} s={TK_S} rot={-4} bg={YELLOW} topColor={1} bottomColor={0} done={1} failed={1} whole={1} fold={1} shadow={0} /> : null}
        </Folder>
      </div>
      {resL > 0.01 ? (
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: resL, translate: `${shakeL}px ${(1 - leftIn) * 40}px` })}>
          <BonusTicket x={LEFT.x} y={RIGHT.y + 90} s={0.42 * (0.7 + 0.3 * resL)} rot={-6} />
        </div>
      ) : null}
      {/* правая папка: баланын өзү барбаган күн */}
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: rightIn, translate: `${-shakeL}px ${(1 - rightIn) * 40}px` })}>
        <Folder x={RIGHT.x} y={RIGHT.y} w={FOLDER.w} h={FOLDER.h} color="#BFD9F0" tab={t.absence.label} />
        <div style={box({ left: RIGHT.x - 20, top: RIGHT.y + 40, opacity: thermo, scale: `${0.6 + 0.4 * thermo}`, rotate: `${-12 + 12 * thermo}deg` })}>
          <ThermometerIcon s={1.1} />
        </div>
      </div>
      {/* ≠ между папками */}
      <div
        style={box({
          left: (LEFT.x + RIGHT.x) / 2 - 50,
          top: LEFT.y - 50,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#FFFFFF",
          border: `6px solid ${pulse > 0.2 ? INK_RED : NAVY}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 66,
          color: pulse > 0.2 ? INK_RED : NAVY,
          opacity: neq,
          scale: `${0.5 + 0.5 * neq + 0.18 * pulse}`,
          boxShadow: "0 10px 26px rgba(20,40,90,0.16)",
        })}
      >
        ≠
      </div>
      <Result x={LEFT.x} a={resL} title={t.service.result} sub={t.service.sub} color={YELLOW} />
      <Result x={RIGHT.x} a={resR} title={t.absence.result} sub={t.absence.sub} color="#BFD9F0" />
      {/* билет в полёте (поверх папки, пока не лёг внутрь) */}
      {!inside ? (
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: clamp((f + 12) / 8) })}>
          <Ticket x={tk.x} y={tk.y} s={tk.s} rot={lerp(0, -4, fly)} bg="#FFFCF5" topColor={1} bottomColor={0} done={1} failed={1} whole={1} fold={fold} />
        </div>
      ) : null}
    </div>
  );
};
