// Технический лист предметов ролика 80-1-2 (проверка формы и размеров).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Apple, AppleHalf, AppleHalfTurning, Knife, Napkin, Plate, Saucer, SAUCER_SEED, Seed } from "./sets/props";

export const PropsTest: React.FC = () => {
  const fr = useCurrentFrame();
  const k = (fr % 30) / 29;
  return (
    <AbsoluteFill style={{ background: "#c9925f" }}>
      <svg width={1920} height={1080} viewBox="0 0 480 270">
        <Plate x={70} y={120} />
        <Apple x={70} y={115} cut={0.6} />
        <Plate x={200} y={120} />
        <AppleHalf x={180} y={116} side={-1} />
        <AppleHalf x={222} y={113} side={1} seeds={[true, false]} />
        <Saucer x={320} y={120}>
          <Seed x={SAUCER_SEED.x} y={SAUCER_SEED.y} ang={170} />
        </Saucer>
        <Napkin x={410} y={120} />
        <Knife x={408} y={112} />
        <AppleHalfTurning x={60} y={220} side={-1} k={k} />
        <AppleHalfTurning x={110} y={220} side={1} k={k * 0.5} />
        <Apple x={200} y={220} s={2} />
        <AppleHalf x={340} y={225} side={-1} s={2.4} />
      </svg>
    </AbsoluteFill>
  );
};
