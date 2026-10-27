// Сцена 6 (44,5–56 с). Две дорожки расходятся: «Жумуш» остаётся маме,
// «Мектеп жолу» уходит на отдельную дорожку BalaGo — без красного
// пересечения. На ней по словам диктора загораются шаги без обещания
// мгновенного старта: Арыз → Ылайыктуу топ → Акысыз биринчи толук сапар →
// Сиздин чечим. Затем — условный пример чата родителей маршрута: водитель
// сам пишет сообщение и отправляет ссылку на текущую геолокацию.
import { useContext } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { bg8Beats } from "../beats";
import { CuesContext } from "../context";
import { Lanes, type Lane } from "../lanes";
import { clamp, easeInOut, easeOut } from "../rig/motion";
import { ChatExample, GREEN, NAVY, PURPLE, YELLOW } from "../screens";
import { BG8_TEXT } from "../script";
import { box } from "../shots";
import { CALL, SchoolIcon, WorkIcon } from "./dayLanes";

const STEP_SPANS = [
  [0, 18],
  [18, 42],
  [42, 78],
  [78, 100],
] as const;

export const HowScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { how: h } = bg8Beats(cues);
  const gap = 110 * easeInOut((f - h.split) / 26);
  const L = BG8_TEXT.lanes;
  const lanes: Lane[] = [
    {
      label: L.work,
      color: PURPLE,
      badge: <WorkIcon color={PURPLE} />,
      blocks: [
        { from: 0, to: 36, label: L.doc, color: GREEN },
        { from: CALL.from, to: CALL.to, label: L.call, color: PURPLE },
      ],
    },
    {
      label: BG8_TEXT.stepsLane,
      color: NAVY,
      badge: (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <SchoolIcon color={NAVY} />
          <Img src={staticFile("assets/logo.png")} style={{ width: 44, height: 44, borderRadius: 22 }} />
        </div>
      ),
      blocks: BG8_TEXT.steps.map((label, i) => ({
        from: STEP_SPANS[i][0],
        to: STEP_SPANS[i][1],
        label,
        color: i === 2 ? YELLOW : i === 3 ? "#3FA27A" : "#4C7BD9",
        ink: i === 2 ? NAVY : "#FFFFFF",
        at: h.steps[i],
      })),
    },
  ];
  const chat = easeOut((f - h.chatIn) / 14);
  // жёлтая линия между дорожками — школьная дорога отделена от работы
  const divider = clamp((f - h.split - 10) / 20);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", overflow: "hidden" })}>
      <div style={box({ left: -200, top: -260, width: 640, height: 640, borderRadius: 320, backgroundColor: "#FFF6D6" })} />
      <div style={box({ left: 70, top: 230 + 110 + 104 + 30 + gap / 2, width: 940 * divider, height: 10, borderRadius: 5, backgroundColor: YELLOW })} />
      <Lanes f={f} lanes={lanes} intro={1} gap={gap} top={230} ruler={false} />
      {f >= h.chatIn ? (
        <div style={box({ left: 60, right: 60, top: 860, opacity: chat, transform: `translateY(${(1 - chat) * 60}px)` })}>
          <ChatExample f={f} msgAt={h.msg} locAt={h.loc} />
          <div style={{ marginTop: 12, textAlign: "right", fontSize: 32, fontWeight: 900, color: "#1F7A4D", fontFamily }}>✎ {BG8_TEXT.chat.manual}</div>
        </div>
      ) : null}
    </div>
  );
};
