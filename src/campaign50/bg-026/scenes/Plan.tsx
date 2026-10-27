// Сцена 2: тот же стол сверху. Рука отца закрывает ноутбук «на минуту» и
// подвигает телефон. На телефоне — публичный раздел сайта BalaGo «Көп
// берилүүчү суроолор» (без личного кабинета и «подтверждённого заказа»).
// Отец сам открывает вопрос «Ата-энелер сапар тууралуу маалыматты кантип
// алышат?» — ответ на его «Кантип кабар алам?» — и раскрывается
// официальный ответ сайта. Нажатие на «WhatsApp-группага» открывает
// условный пример (бесшовный стык в сцену group).
import { interpolate, useCurrentFrame } from "remotion";
import { keysV } from "../../../two-schedules-2d/rig/motion";
import { appear, easeInOut, easeOut } from "../anim";
import { useScene, useWordStarting } from "../context";
import { C } from "../palette";
import { abs, Chip, DeskClock, DeskTop, font, LaptopTop, laptopEdgeY, Logo, Notebook, PhoneFrame, Plant, TopHand } from "../parts";
import { BG26_TEXT } from "../script";

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const PLAN_PHONE = { x: 150, y: 470, w: 780, h: 1360 } as const;
const SCREEN_TOP = PLAN_PHONE.y + Math.round(PLAN_PHONE.w * 0.035);
const LAP = { x: 220, y: 250, w: 640 } as const;
// Координаты (кадр, после прокрутки) вопроса и ключевого слова ответа —
// куда нажимает палец (сверено по контрольным кадрам).
const Q_POINT = { x: 620, y: SCREEN_TOP + 615 } as const;
const KEY_POINT = { x: 350, y: SCREEN_TOP + 712 } as const;

const FaqPage: React.FC<{ readonly scroll: number; readonly open: number; readonly focus: number; readonly hl: number }> = ({ scroll, open, focus, hl }) => {
  const t = BG26_TEXT.plan;
  const [before, after] = t.answer.split(t.answerKey);
  return (
    <div style={abs({ inset: 0, background: "#FFFFFF" })}>
      {/* прокручиваемая часть: раздел FAQ */}
      <div style={abs({ left: 0, right: 0, top: 170 - scroll, padding: "0 28px" })}>
        <div style={{ marginTop: 18, ...font(44, 1000, C.navy), lineHeight: 1.08 }}>{t.eyebrow}</div>
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {t.faq.map((q, i) => {
            const on = i === t.focus ? focus : 0;
            return (
              <div
                key={q}
                style={{
                  padding: "14px 18px",
                  borderRadius: 20,
                  background: on ? `rgba(255,201,14,${0.22 + 0.18 * on})` : "#F6F8FB",
                  boxShadow: on ? `0 0 0 ${5 * on}px ${C.yellow}` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ flex: 1, ...font(31, 900, C.navy), lineHeight: 1.15 }}>{q}</div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      background: i === t.focus ? C.green : "#DCE4F0",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...font(30, 1000, i === t.focus ? "#FFFFFF" : C.navy),
                      transform: `rotate(${i === t.focus ? 45 * open : 0}deg)`,
                    }}
                  >
                    +
                  </div>
                </div>
                {i === t.focus ? (
                  <div style={{ maxHeight: 260 * open, overflow: "hidden", opacity: open }}>
                    <div style={{ marginTop: 10, ...font(28, 800, "#33466E"), lineHeight: 1.25 }}>
                      {before}
                      <span style={{ background: `rgba(47,154,98,${0.18 + 0.3 * hl})`, borderRadius: 8, padding: "0 6px", color: "#1F7A45", boxShadow: hl ? `0 0 0 ${3 * hl}px rgba(47,154,98,0.5)` : undefined }}>{t.answerKey}</span>
                      {after}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {/* шапка сайта неподвижна (как на настоящем сайте) */}
      <div style={abs({ left: 0, right: 0, top: 0, height: 160, background: "#FFFFFF", borderBottom: "2px solid #EEF2F7" })}>
        <div style={abs({ left: 28, top: 62, display: "flex", alignItems: "center", gap: 16 })}>
          <div style={{ position: "relative", width: 76, height: 76 }}>
            <Logo x={38} y={38} r={38} />
          </div>
          <div>
            <div style={font(36, 1000, C.navy)}>{t.site}</div>
            <div style={font(22, 800, "#5A6C94")}>{t.siteSub}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Кадр нажатия на «WhatsApp-группага» (от начала сцены) — общий для звука.
export const planTapKey = (wKnow: number, frames: number) => Math.min(wKnow + 24, frames - 26);
export const planTapQ = (wInfo: number) => wInfo + 18;

export const PlanScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const wInfo = Math.max(84, useWordStarting("n02", "жолдогу"));
  const wKnow = Math.max(wInfo + 40, useWordStarting("n02", "билгиңиз"));

  // 1) рука закрывает ноутбук, 2) ноутбук отодвигается вверх, телефон — в центр
  const close = easeInOut((f - 8) / 26);
  const lapOut = easeInOut((f - 38) / 24);
  const phoneIn = easeOut((f - 42) / 24);
  // 3) палец листает FAQ и открывает вопрос про информацию о поездке
  const scroll = interpolate(f, [wInfo - 10, wInfo + 8], [0, 40], { ...CL, easing: easeInOut });
  const tapQ = planTapQ(wInfo);
  const open = easeInOut((f - (tapQ + 4)) / 14);
  const focus = appear(f, tapQ, 10);
  // 4) нажатие на «WhatsApp-группага» → стык в чат
  const tapKey = planTapKey(wKnow, frames);
  const hl = appear(f, tapKey, 6);

  const edge = laptopEdgeY(LAP.y, LAP.w, 1 - close);
  const qPoint = Q_POINT;
  const keyPoint = KEY_POINT;
  const tip =
    f < 36
      ? { x: 560, y: edge + 6 }
      : keysV(f, [
          [36, { x: 560, y: laptopEdgeY(LAP.y, LAP.w, 0) + 6 }],
          [52, { x: 1000, y: 1500 }],
          [wInfo - 26, { x: 1060, y: 1600 }],
          [wInfo - 10, { x: 700, y: 1250 }],
          [wInfo + 8, { x: 700, y: 1210 }],
          [tapQ - 4, qPoint],
          [tapQ + 14, qPoint],
          [tapQ + 30, { x: 1060, y: 1550 }],
          [tapKey - 16, { x: 1060, y: 1550 }],
          [tapKey - 2, keyPoint],
          [frames, keyPoint],
        ]);
  const handVis = interpolate(f, [0, 6, 46, 54, wInfo - 24, wInfo - 16, tapQ + 22, tapQ + 30, tapKey - 16, tapKey - 8], [0, 1, 1, 0, 0, 1, 1, 0, 0, 1], CL);
  const press = (f > 10 && f < 34) || (f > wInfo - 10 && f < wInfo + 8) || Math.abs(f - tapQ) <= 3 || (f >= tapKey - 2 && f <= tapKey + 4) ? 0.7 : 0;
  const light = 0.15 + 0.15 * (f / frames);
  const t = BG26_TEXT.plan;

  return (
    <>
      <DeskTop light={light}>
        <DeskClock x={135} y={430} minutes={7 * 60 + 47.5 + f / 600} />
        <Plant x={960} y={420} s={0.95} />
        <Notebook x={-70} y={1240} rot={-10} />
        <div style={abs({ left: 0, top: 0, width: 1080, height: 1920, transform: `translateY(${-lapOut * 720}px)` })}>
          <LaptopTop x={LAP.x} y={LAP.y} w={LAP.w} open={1 - close} />
        </div>
        <div
          style={abs({
            left: 0,
            top: 0,
            width: 1080,
            height: 1920,
            opacity: Math.min(1, phoneIn * 2),
            transform: `translate(${(1 - phoneIn) * 420}px, ${(1 - phoneIn) * 520}px) rotate(${(1 - phoneIn) * 14}deg)`,
            transformOrigin: "540px 1100px",
          })}
        >
          <PhoneFrame x={PLAN_PHONE.x} y={PLAN_PHONE.y} w={PLAN_PHONE.w} h={PLAN_PHONE.h} clock="07:48" screenBg="#FFFFFF" statusDark>
            <FaqPage scroll={scroll} open={open} focus={focus} hl={hl} />
          </PhoneFrame>
        </div>
      </DeskTop>
      <TopHand x={tip.x + 18} y={tip.y} angle={f < 40 ? -6 : -18} press={press} opacity={handVis} />
      {/* подпись сцены */}
      <div style={abs({ left: 60, right: 150, top: 262, display: "flex", justifyContent: "center", opacity: appear(f, 50, 10) })}>
        <Chip size={38}>{t.label}</Chip>
      </div>
    </>
  );
};
