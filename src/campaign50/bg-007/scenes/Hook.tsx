// Сцена 1 (0–≈6,5 с), хук: календарь недели собирается, как тетрис, —
// большие блоки «Жыйын», «Кардар», «Отчёт» падают и плотно заполняют
// сетку. Маленький жёлтый «Мектеп 07:30» появляется сверху, ищет место
// (влево, ещё влево), пробует опуститься и повернуться — «Орун жок».
// Диктор: «Бир кичинекей жазуу бүт графикти жылдырып жатабы?»
import { useCurrentFrame } from "remotion";
import { hookState } from "../calendar";
import { useScene } from "../context";
import { BoardClose } from "./common";

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  return <BoardClose s={hookState(f)} f={f} len={frames} push={0.05} />;
};
