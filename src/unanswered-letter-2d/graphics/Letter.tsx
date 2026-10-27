// Письмо-предложение и ответ Айжан — один и тот же экран почты во всех
// сценах (строки — только из UL2_LETTER). Состояния:
//   • письмо получено: тема, отправитель, обращение, ключевая фраза
//     (мягкая рамка-выделение);
//   • черновик ответа: начатая фраза (UL2_LETTER.draft) и мигающий курсор (тот же
//     черновик в начале, в повторе дней и вечером);
//   • окончательный ответ: текст появляется смысловыми порциями, затем
//     «Жөнөтүү» и статус «Жөнөтүлдү».
import { fontFamily } from "../../fonts";
import { clamp, easeOut } from "../rig/motion";
import { UL2_LETTER } from "../script";
import { C } from "../theme";
import { Icon } from "./Icons";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
export const LETTER_BLUE = "#7FB8F0";

export type LetterView = {
  readonly f: number; // кадр (для курсора)
  readonly offerHL?: number; // 0…1 рамка вокруг ключевой фразы
  readonly draft?: number; // 0…1 сколько напечатано из черновика
  readonly reply?: number; // 0…3 порции окончательного ответа
  readonly caret?: boolean; // курсор виден
  readonly typing?: boolean; // курсор не мигает, пока печатают
  readonly sendHover?: number; // 0…1 указатель над кнопкой
  readonly press?: number; // 0…1 нажатие
  readonly sent?: number; // 0…1 статус «Жөнөтүлдү»
  readonly showReply?: boolean; // показывать блок ответа
  readonly typed?: number; // сколько букв окончательного ответа напечатано (вместо порций)
  readonly saved?: number; // 0…1 метка «Кара нуска сакталды»
};

// Курсор: мигает с периодом 1 с (во время печати — горит).
export const caretOn = (f: number, typing = false) => typing || Math.floor(f / 15) % 2 === 0;

// Экран почты (w × h в px карточки).
export const LetterScreen: React.FC<{ readonly w: number; readonly h: number; readonly v: LetterView }> = ({ w, h, v }) => {
  const L = UL2_LETTER;
  const draftN = Math.round([...L.draft].length * clamp(v.draft ?? 1));
  const reply = v.reply ?? 0;
  const sent = clamp(v.sent ?? 0);
  const caret = (v.caret ?? true) && sent < 0.5 && caretOn(v.f, v.typing);
  const hl = clamp(v.offerHL ?? 0);
  const showReply = v.showReply ?? true;
  const press = clamp(v.press ?? 0);
  const hover = clamp(v.sendHover ?? 0);
  const saved = clamp(v.saved ?? 0);
  // окончательный ответ по буквам: пока не дописано начало черновика,
  // виден сам черновик (с многоточием)
  const typedText = v.typed === undefined ? null : [...L.reply].slice(0, Math.round(v.typed)).join("");
  const prefix = L.draft.replace("…", "");
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: "#FFFFFF", fontFamily, color: C.ink, overflow: "hidden" })}>
      {/* верхняя строка: тема */}
      <div style={box({ left: 0, top: 0, width: w, height: 104, backgroundColor: "#F1F5FA", borderBottom: `2px solid ${C.cardLine}`, display: "flex", alignItems: "center", gap: 18, padding: "0 34px", boxSizing: "border-box" })}>
        <div style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: LETTER_BLUE, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon id="letter" size={36} color={C.ink} stroke={4} />
        </div>
        <div style={{ fontSize: 44, fontWeight: 900, whiteSpace: "nowrap" }}>{L.subject}</div>
      </div>
      {/* отправитель */}
      <div style={box({ left: 34, top: 128, display: "flex", alignItems: "center", gap: 16 })}>
        <div style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: "#DCE6F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#3D5A80" }}>{L.from.slice(0, 1)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: C.inkSoft }}>
          {L.from} <span style={{ color: "#A3B1C2" }}>→</span> {L.heroine}
        </div>
      </div>
      {/* тело письма */}
      <div style={box({ left: 34, top: 200, width: w - 68, fontSize: 44, fontWeight: 800, lineHeight: 1.25 })}>
        <div style={{ marginBottom: 12 }}>{L.greeting}</div>
        <div style={{ position: "relative", display: "inline-block", padding: "8px 14px", marginLeft: -14, borderRadius: 18 }}>
          <div style={box({ inset: 0, borderRadius: 18, border: `4px solid ${C.yellow}`, backgroundColor: `rgba(255,211,61,${0.18 * hl})`, opacity: hl, scale: `${1.04 - 0.04 * hl}` })} />
          <span style={{ position: "relative", fontWeight: 900 }}>{L.offer}</span>
        </div>
      </div>
      {/* ответ */}
      {showReply ? (
        <div style={box({ left: 24, right: 24, top: 430, bottom: 24, borderRadius: 26, border: `3px solid ${caret || reply > 0 || (v.typed ?? 0) > 0 ? LETTER_BLUE : C.cardLine}`, backgroundColor: "#F8FAFC" })}>
          <div style={box({ left: 26, top: 20, display: "flex", alignItems: "center", gap: 12, fontSize: 28, fontWeight: 900, color: C.inkSoft })}>
            <div style={{ padding: "4px 16px", borderRadius: 999, backgroundColor: saved > 0.5 ? "#E7F5EC" : "#E6EDF6", border: `2px solid ${saved > 0.5 ? C.green : "transparent"}`, color: saved > 0.5 ? C.ink : C.inkSoft, display: "flex", alignItems: "center", gap: 8, scale: `${1 + 0.08 * Math.sin(Math.PI * saved)}` }}>
              {saved > 0.5 ? <Icon id="check" size={28} color={C.green} stroke={5} /> : null}
              {saved > 0.5 ? L.draftSaved : L.draftLabel}
            </div>
            <span style={{ fontWeight: 800 }}>{L.reSubject}</span>
          </div>
          <div style={box({ left: 26, right: 26, top: 84, fontSize: 46, fontWeight: 800, lineHeight: 1.3 })}>
            {typedText !== null ? (
              <span>
                {typedText.length <= prefix.length ? L.draft : typedText}
                <Caret on={caret} />
              </span>
            ) : reply <= 0 ? (
              <span>
                {[...L.draft].slice(0, draftN).join("")}
                <Caret on={caret} />
              </span>
            ) : (
              <span>
                {L.replyParts.map((p, i) => {
                  const a = easeOut(clamp(reply - i) * 1.4);
                  return a > 0 ? (
                    <span key={i} style={{ opacity: a }}>
                      {i ? " " : ""}
                      {p}
                    </span>
                  ) : null;
                })}
                <Caret on={caret} />
              </span>
            )}
          </div>
          {/* кнопка «Жөнөтүү» → статус «Жөнөтүлдү» */}
          <div style={box({ right: 24, bottom: 22, height: 96, padding: "0 40px", borderRadius: 999, backgroundColor: sent > 0.5 ? "#E7F5EC" : C.yellow, border: sent > 0.5 ? `3px solid ${C.green}` : `3px solid ${hover > 0.5 ? "#E0B520" : C.yellow}`, display: "flex", alignItems: "center", gap: 14, fontSize: 42, fontWeight: 900, color: C.ink, scale: `${1 - 0.06 * press + 0.06 * Math.sin(Math.PI * clamp((sent - 0.5) * 2))}`, boxShadow: hover > 0.3 && sent < 0.5 ? "0 8px 22px rgba(224,181,32,0.45)" : "none" })}>
            {sent > 0.5 ? (
              <>
                <Icon id="check" size={40} color={C.green} stroke={5} />
                {L.sent}
              </>
            ) : (
              <>
                <Icon id="reply" size={36} color={C.ink} stroke={4} />
                {L.send}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Caret: React.FC<{ on: boolean }> = ({ on }) => (
  <span style={{ display: "inline-block", width: 5, height: 52, marginLeft: 4, verticalAlign: "-9px", backgroundColor: on ? "#2F6FD6" : "transparent" }} />
);

// Указатель мыши (стрелка) — кончик в точке (x, y).
export const Pointer: React.FC<{ x: number; y: number; press?: number; opacity?: number }> = ({ x, y, press = 0, opacity = 1 }) => (
  <svg width={60} height={70} viewBox="0 0 30 35" style={box({ left: x - 3, top: y - 2, opacity, scale: `${1 - 0.12 * press}`, transformOrigin: "0 0", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.3))" })}>
    <path d="M 2 2 L 2 27 L 9 21 L 14 32 L 19 30 L 14 19 L 23 19 Z" fill="#FFFFFF" stroke="#172433" strokeWidth={2} strokeLinejoin="round" />
  </svg>
);
