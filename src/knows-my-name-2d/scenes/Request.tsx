// Сцена 8. Предварительная заявка и вопросы.
// A. Тот же телефон крупно: экран «Алдын ала өтүнмө» — поля заполняются,
//    палец попадает в кнопку «Өтүнмө жөнөтүү», после нажатия —
//    «Алдын ала өтүнмө жөнөтүлдү» (обращение отправлено; ни водителя, ни
//    времени, ни ответа).
// B. Блокнот сверху: папа записывает вопросы для разговора по мере того,
//    как их называет рассказчик. Без галочек.
import { clamp, easeInOut, keysV } from "../rig/motion";
import { NB, nbPenTip, NotebookTop } from "../props/Notebook30";
import { PHONE_TARGETS } from "../props/Phone30";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Km2Timeline } from "../timing";
import { KM2_TEXT } from "../script";
import { DadPen, TableTop } from "./Hook";
import { PhoneCloseUp, phoneScreenPt } from "./Balago";

const T = KM2_TEXT;
const R = NB.rows;
const QROWS = [R.q0, R.q1, R.q2, R.q3];

export const requestPlan = (tl: Km2Timeline) => {
  const S = sceneTools(tl, "request");
  const fill: [number, number] = [6, 54];
  const tap = 64;
  const sent = tap + 4;
  const sheet = Math.max(sent + 26, S.word("N06", "Блокнотко") - 4);
  const words = ["сабактын", "кайсы", "үйдө", "сапарга"];
  const q = words.map((w, i) => Math.max(sheet + 6 + i * 30, S.word("N06", w)));
  return { fill, tap, sent, sheet, q, len: S.len };
};
type P = ReturnType<typeof requestPlan>;

export const NotebookLines = (f: number, q: readonly number[], dur = 30) => [
  { text: T.notePlan[0], y: R.address, u: 1 },
  { text: T.notePlan[1], y: R.time, u: 1 },
  { text: T.notePlan[2], y: R.route, u: 1 },
  { text: T.noteSchool[0], y: R.classB, u: 1 },
  { text: T.noteSchool[1], y: R.gymExit, u: 1 },
  ...T.questions.map((text, i) => ({ text, y: QROWS[i], u: q.length ? clamp((f - q[i]) / dur) : 1 })),
];

export const RequestScene: React.FC = () => {
  const { f } = useScene("request");
  const p = usePlan(requestPlan);
  if (f < p.sheet) {
    const btn = phoneScreenPt(PHONE_TARGETS.send, 860);
    const fp = keysV(f, [
      [p.fill[1], { x: btn.x + 180, y: btn.y + 300 }],
      [p.tap, btn],
      [p.tap + 6, btn],
      [p.tap + 20, { x: btn.x + 220, y: btn.y + 420 }],
    ]);
    const view = f < p.sent ? "form" : "sent";
    return <PhoneCloseUp f={f} y={860} s={{ view, fill: 3 * easeInOut(clamp((f - p.fill[0]) / (p.fill[1] - p.fill[0]))), tap: f >= p.tap - 1 && f < p.sent, sent: clamp((f - p.sent) / 12) }} finger={f > p.fill[1] - 10 && f < p.tap + 20 ? { ...fp, press: f >= p.tap - 1 && f < p.tap + 4 } : null} />;
  }
  // кончик ручки на текущей строке вопроса
  const cur = p.q.reduce((a, t, i) => (f >= t - 4 ? i : a), 0);
  const u = clamp((f - p.q[cur]) / 30);
  const tip = nbPenTip(T.questions[cur], QROWS[cur], u);
  const lift = f > p.q[cur] + 30 ? 1 : 0.15 * Math.abs(Math.sin(f / 2.3));
  return (
    <TableTop f={f} cam={{ x: 560, y: 960, zoom: 1.15 }}>
      <NotebookTop lines={NotebookLines(f, p.q)} map={1}>
        <DadPen x={tip.x} y={tip.y} lift={lift} />
      </NotebookTop>
    </TableTop>
  );
};
export type RequestPlan = P;
