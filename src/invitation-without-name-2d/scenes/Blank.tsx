// Сцена 2. Пустая строка. Приглашение крупно на светлом фоне — тот же лист
// с помятыми краями и загнутым углом. Сначала по очереди проявляются верхние
// строки; на «бир жума» один раз появляется плашка «Бир жума». На второй
// фразе («Аты-жөнү…») проявляется строка гостя, камера спокойно подходит к
// ней, за пустой линией проходит мягкий жёлтый маркер. Имя не показывается
// даже бледно. Без декоративного вращения.
import { clamp, easeInOut, easeOut, keys } from "../rig/motion";
import { box, Paper, Shot, Tag, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C } from "../theme";
import { IW2_TEXT } from "../script";
import { INVITE_RATIO, InvitationArt } from "../props/Invitation";

export const blankPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "blank");
  const n01 = T.from("N01");
  const guest = T.word("N01", "Аты");
  return { n01, week: T.word("N01", 3), weekEnd: T.wordEnd("N01", 4), guest, push: [guest - 4, guest + 34] as const, n01End: T.to("N01"), len: T.len };
};

// Лист в кадре (мировые px): из него в начале раскрывается карточка сцены 1.
export const BLANK_SHEET = { x: 540, y: 930, w: 760 } as const;
const H = BLANK_SHEET.w * INVITE_RATIO;
const top = BLANK_SHEET.y - H / 2;
const U = BLANK_SHEET.w / 100;
export const BLANK_RECT = { x: BLANK_SHEET.x - BLANK_SHEET.w / 2, y: top, w: BLANK_SHEET.w, h: H } as const;

export const BlankScene: React.FC = () => {
  const { f } = useScene("blank");
  const p = usePlan(blankPlan);
  // строки: заголовок, день, время, кабинет — до речи; строка гостя — на «Аты-жөнү»
  const reveal = Math.min(keys(f, [[2, 0], [10, 1], [16, 2], [22, 3], [28, 4]]), 4) + clamp((f - (p.guest - 6)) / 8);
  const cam = keys(f, [[p.push[0], 0], [p.push[1], 1]], easeInOut);
  const camera = { x: 540, y: 960 + cam * (top + 100 * U - 960 - 40), zoom: 1 + cam * 0.3 };
  const mark = easeOut(clamp((f - p.push[1] + 4) / 16));
  return (
    <Shot f={f} cam={camera} bg={C.paper} overlay={f >= p.week - 2 ? <Tag text={IW2_TEXT.week} t={f - p.week + 2} x={110} y={300} bg={C.coral} color={C.white} size={64} out={p.push[0] - p.week + 2} /> : null}>
      <Paper />
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`translate(${BLANK_SHEET.x} ${BLANK_SHEET.y}) rotate(-1.5)`}>
          <InvitationArt w={BLANK_SHEET.w} reveal={reveal} name={0} />
        </g>
      </svg>
      {/* маркер на пустой строке (поверх листа, multiply) */}
      <div style={box({ left: BLANK_RECT.x + 10 * U, top: top + 101 * U, width: 80 * U * mark, height: 14 * U, backgroundColor: C.yellow, opacity: 0.6, mixBlendMode: "multiply" })} />
    </Shot>
  );
};
