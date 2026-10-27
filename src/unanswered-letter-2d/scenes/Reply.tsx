// Сцены 10–12 («Эртеси» и финал).
// 10. Родители вместе заполняют ПРЕДВАРИТЕЛЬНУЮ заявку BalaGo: «Үй дареги»,
//     «Мектеп», «Сабактын убактысы» (14:30 — сабак бүтөт), направление
//     «Мектеп → Үй», кнопка «Алдын ала арыз», статус «Арыз жөнөтүлдү».
//     Без подтверждённого маршрута, машины, оплаты и водителя.
// 11. Айжан возвращается к тому же письму: черновик становится законченным
//     ответом (смысловыми порциями под её внутреннее чтение, рты закрыты),
//     указатель попадает в «Жөнөтүү» → «Жөнөтүлдү». Затем она достаёт тот
//     же рисунок из папки, принесённой из дома, и ставит его у монитора.
//     Последний человеческий кадр — рисунок у монитора, спокойная Айжан,
//     завершённое письмо (≥ 2 с).
// 12. Контактная карточка BalaGo — ровно 150 кадров.
import { Logo } from "../../components/Logo";
import { fontFamily } from "../../fonts";
import { ChildDrawing, DRAWING_H, DRAWING_W } from "../graphics/Drawing";
import { FormPage, FORM_GEOM } from "../graphics/Form";
import { LetterScreen, Pointer } from "../graphics/Letter";
import { Actor, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV, type Vec } from "../rig/motion";
import { UL2_LETTER, UL2_TEXT } from "../script";
import { Icon } from "../graphics/Icons";
import { ChairBack, HOME, HomeBack } from "../sets/Home";
import { FolderOnDesk, OFFICE } from "../sets/Office";
import { box as wbox } from "../shots";
import { C } from "../theme";
import { onTable, seated, seatOf } from "./common";
import { box, crossfade, PanelArea, Stage, usePanel, useScene } from "./kit";
import { OFFICE_MOM, OfficeStage, Screen, typingArms } from "./Office";
import { PAPER_BACK } from "./Drawing";

// ---------- 10. Следующий день и заявка ----------
export const RequestScene: React.FC = () => {
  const { f, word, to } = useScene("request");
  const r = usePanel();
  // поля заполняются по ходу фразы, затем нажатие и статус
  const fill = [word("n04", 2), word("n04", 5), word("n04", 7)];
  const tap = to("n04") + 10;
  const sent = tap + 6;
  const v = {
    fills: [0, 1, 2].map((i) => clamp((f - fill[i]) / 14)) as unknown as [number, number, number],
    route: clamp((f - fill[2] - 18) / 10),
    hover: clamp((f - tap + 12) / 6),
    press: keys(f, [[tap - 3, 0], [tap, 1], [tap + 6, 0]]),
    sent: clamp((f - sent) / 10),
  };
  const s = r.w / 860;
  const ptr = keysV(f, [
    [0, { x: 640, y: 520 }],
    [fill[0] - 8, { x: 520, y: FORM_GEOM.fieldY(0) }],
    [fill[1] - 8, { x: 520, y: FORM_GEOM.fieldY(1) }],
    [fill[2] - 8, { x: 560, y: FORM_GEOM.fieldY(2) }],
    [tap - 10, { x: FORM_GEOM.buttonX, y: FORM_GEOM.buttonY + 30 }],
  ], anticipate);
  // родители рядом за ноутбуком (утро) — маленькая вставка
  const mom = seated("mom", 1010);
  const dad = seated("dad", 1250);
  const pose = (p: typeof mom, side: 1 | -1) => (): PoseIn => ({
    expr: "calm",
    sit: 1,
    seat: seatOf(p),
    lean: 6,
    armL: { target: onTable(p.x - 0.1 * p.h, -4), shape: "relax", elbow: "down" },
    armR: { target: onTable(p.x + 0.1 * p.h, -4), shape: "relax", elbow: "down" },
    lookY: 0.35,
    lookX: side * 0.2,
  });
  return (
    <PanelArea>
      <div style={box({ left: 0, top: 0, width: 860, height: r.h / s, scale: `${s}`, transformOrigin: "0 0" })}>
        <FormPage w={860} h={r.h / s} v={v} />
        <Pointer x={ptr.x} y={ptr.y} press={v.press} opacity={easeOut((f - 8) / 8) * (1 - clamp((f - sent - 20) / 8))} />
      </div>
      <div style={box({ right: 22, top: 18, width: 300, height: 200, borderRadius: 24, overflow: "hidden", border: `4px solid #8FD3A6`, boxShadow: "0 12px 30px rgba(0,0,0,0.3)", opacity: easeOut((f - 4) / 10) })}>
        <Stage cam={{ x: 1130, y: 1040, zoom: 0.36 }} bg="#EFE3D0" inset={{ x: 0, y: 0, w: 300, h: 200 }} radius={0}>
          <HomeBack minutes={8 * 60 + 10} />
          <ChairBack x={mom.x} />
          <ChairBack x={dad.x} />
          <Actor uid="r10-mom" look="aizhan" f={f} place={() => mom} face={() => 0.4} pose={pose(mom, 1)} seed={11} />
          <Actor uid="r10-dad" look="dad" f={f} place={() => dad} face={() => -0.4} pose={pose(dad, -1)} seed={2} />
          <div style={wbox({ left: HOME.table.x - 450, top: HOME.table.top - 4, width: 900, height: 340, backgroundColor: "#F6EEE1" })} />
          <div style={wbox({ left: 1060, top: HOME.table.top - 170, width: 230, height: 160, borderRadius: 12, backgroundColor: "#AEB6C4" })} />
        </Stage>
      </div>
    </PanelArea>
  );
};

// ---------- 11. Ответ и рисунок рядом ----------
export const REPLY = { pressAfter: 0.4, sentAfter: 0.62 } as const;
export const ReplyScene: React.FC = () => {
  const { f, word, from, to } = useScene("reply");
  const r = usePanel();
  const m06 = from("m06");
  const part = [word("m06", 0), word("m06", 2), word("m06", 7)];
  const press = to("m06") + Math.round(REPLY.pressAfter * 30);
  const sent = to("m06") + Math.round(REPLY.sentAfter * 30);
  const toEmail = m06 - 14;
  const toDesk = sent + 16;
  const emailA = crossfade(f, toEmail, 8) * (1 - crossfade(f, toDesk, 10));
  const deskA = 1 - crossfade(f, toEmail, 8) + crossfade(f, toDesk, 10);
  const reply = part.reduce((n, p, i) => n + clamp((f - p + 2) / 8) * (i < 3 ? 1 : 0), 0);
  const typing = part.some((p) => f >= p - 2 && f < p + 10);
  const ptr = keysV(f, [
    [0, { x: 560, y: 420 }],
    [to("m06") - 16, { x: 560, y: 420 }],
    [press - 4, { x: 820, y: 790 }],
  ], anticipate);
  // кабинет: папку кладёт на стол → (письмо) → открывает папку, достаёт
  // тот же рисунок и ставит его у монитора
  const fold = OFFICE.folder;
  const open = toDesk + 10;
  const grab = open + 12;
  const lift = grab + 12;
  const place = lift + 22;
  const release = place + 8;
  const spot: Vec = { x: OFFICE.drawing.x, y: OFFICE.top - 4 - (OFFICE.drawing.w * DRAWING_H) / DRAWING_W / 2 };
  const paperAt = (tt: number): Vec =>
    keysV(tt, [
      [grab, { x: fold.x - 20, y: fold.y - 20 }],
      [lift, { x: fold.x - 60, y: OFFICE.top - 200 }],
      [place, spot],
    ], anticipate);
  const holding = f >= grab && f < release;
  const momPose = (tt: number): PoseIn => {
    const base = typingArms(tt, false);
    const p = paperAt(tt);
    const inHand = tt >= grab - 6 && tt < release + 4;
    return {
      expr: tt < sent ? "calm" : "softSmile",
      sit: 1,
      seat: seatOf(OFFICE_MOM),
      // в начале — кладёт папку на стол
      armR: tt < 24
        ? { target: keysV(tt, [[0, { x: fold.x + 10, y: fold.y - 70 }], [16, { x: fold.x + 10, y: fold.y - 14 }]], anticipate), shape: "fist", elbow: "down", behind: false }
        : inHand
          ? { target: { x: p.x + 50, y: p.y + 20 }, shape: "pinch", elbow: "down", behind: false }
          : tt >= open - 10 && tt < grab - 6
            ? { target: keysV(tt, [[open - 10, base.armR!.target!], [open, { x: fold.x + 60, y: fold.y - 16 }]], anticipate), shape: "open", elbow: "down", behind: false }
            : base.armR,
      armL: inHand && tt > lift - 4 ? { target: { x: p.x - 40, y: p.y + 30 }, shape: "pinch", elbow: "down", behind: false } : base.armL,
      lookY: keys(tt, [[toDesk, 0.15], [open, 0.5], [lift, 0.3], [place + 10, 0.2]]),
      lookX: keys(tt, [[toDesk, 0], [open, 0.6], [lift, 0.2], [place, -0.3], [release + 20, -0.1]]),
    };
  };
  const momFace = (tt: number) => keys(tt, [[toDesk, -0.4], [open, 0.15], [lift, -0.1], [place, -0.45], [release + 30, -0.3]]);
  const placed = f >= release;
  const paper = paperAt(f);
  const paperW = OFFICE.drawing.w;
  return (
    <PanelArea>
      {deskA > 0 ? (
        <OfficeStage
          f={f}
          uid="r11"
          cam={{ x: keys(f, [[toDesk, 880], [release + 10, 860]]), y: 1080, zoom: keys(f, [[0, 0.92], [toDesk, 0.96], [release + 40, 1.04]], easeInOut) }}
          momFace={momFace}
          momPose={momPose}
          screen={
            <>
              <Screen v={{ f, reply: 3, sent: f >= sent ? 1 : 0, caret: false }} />
              {/* статус письма крупно внизу экрана */}
              <div style={box({ right: 30, bottom: 26, height: 96, padding: "0 36px", borderRadius: 999, backgroundColor: "#E7F5EC", border: `4px solid ${C.green}`, display: "flex", alignItems: "center", gap: 16, fontFamily, fontSize: 52, fontWeight: 900, color: C.ink, opacity: f >= sent ? 1 : 0 })}>
                <Icon id="check" size={56} color={C.green} stroke={5} />
                {UL2_LETTER.sent}
              </div>
            </>
          }
          opacity={Math.min(1, deskA)}
          onDesk={
            <>
              <FolderOnDesk open={clamp((f - open) / 8) * (1 - clamp((f - release - 10) / 10))} />
              {/* тот же рисунок: в папке → в руке → стоит у монитора */}
              {f >= grab - 2 ? (
                holding && f < lift - 2 ? (
                  <div style={wbox({ left: paper.x - paperW / 2, top: paper.y - 20, width: paperW, height: 30, backgroundColor: PAPER_BACK, borderRadius: 4 })} />
                ) : (
                  <ChildDrawing width={paperW} style={{ position: "absolute", left: paper.x - paperW / 2, top: paper.y - (paperW * DRAWING_H) / DRAWING_W / 2, rotate: placed ? "-5deg" : `${keys(f, [[lift, 8], [place, -5]])}deg`, transformOrigin: "50% 100%" }} shadow />
                )
              ) : null}
              {placed ? <div style={wbox({ left: spot.x - paperW / 2 + 10, top: OFFICE.top - 8, width: paperW - 20, height: 8, borderRadius: 4, backgroundColor: "rgba(60,40,20,0.18)" })} /> : null}
            </>
          }
        />
      ) : null}
      {emailA > 0 ? (
        <div style={box({ inset: 0, opacity: emailA })}>
          <LetterScreen w={r.w} h={r.h} v={{ f, draft: 1, reply, typing, sendHover: clamp((f - press + 10) / 6), press: keys(f, [[press - 3, 0], [press, 1], [press + 6, 0]]), sent: f >= sent ? 1 : 0, caret: true }} />
          <Pointer x={ptr.x} y={ptr.y} press={keys(f, [[press - 3, 0], [press, 1], [press + 6, 0]])} opacity={easeOut((f - (to("m06") - 16)) / 8)} />
        </div>
      ) : null}
    </PanelArea>
  );
};

// ---------- 12. Контактный финал ----------
export const ContactScene: React.FC = () => {
  const { f } = useScene("contact");
  const t = UL2_TEXT.cta;
  // быстрое появление (≤ 0,3 с), дальше карточка неподвижна и читаема
  const a = (k: number) => easeOut((f - k * 1.5) / 6);
  const item = (k: number): React.CSSProperties => ({ opacity: a(k), translate: `0 ${(1 - a(k)) * 12}px` });
  return (
    <div style={box({ inset: 0, fontFamily, background: `radial-gradient(circle at 50% 40%, rgba(255,196,107,0.14), transparent 60%), ${C.bg}` })}>
      <div style={box({ left: 70, right: 70, top: 230, padding: "70px 40px 64px", borderRadius: 44, backgroundColor: C.card, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, textAlign: "center", boxShadow: "0 40px 90px rgba(0,0,0,0.5)", opacity: a(0), scale: `${0.97 + 0.03 * a(0)}` })}>
        <div style={item(0)}>
          <Logo size={200} style={{ boxShadow: "0 0 0 10px #FFD33D" }} />
        </div>
        <div style={{ ...item(1), fontSize: 124, fontWeight: 900, color: C.ink, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(1), fontSize: 56, fontWeight: 800, color: C.inkSoft }}>{t.tagline}</div>
        <div style={{ ...item(2), marginTop: 14, padding: "26px 48px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 56, fontWeight: 900, color: C.ink, boxShadow: "0 14px 34px rgba(255,211,61,0.4)" }}>{t.call}</div>
        <div style={{ ...item(2), fontSize: 44, fontWeight: 800, color: C.inkSoft }}>{t.link}</div>
      </div>
      <div style={box({ left: 70, right: 70, top: 1340, display: "flex", justifyContent: "center", ...item(3) })}>
        <div style={{ padding: "30px 44px", borderRadius: 30, border: `4px solid ${C.yellow}`, backgroundColor: C.dark, fontSize: 62, fontWeight: 900, color: C.text, whiteSpace: "nowrap", letterSpacing: 1 }}>{t.whatsapp}</div>
      </div>
    </div>
  );
};
