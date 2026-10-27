import { clamp, type Vec } from "./motion.ts";
import type { Build } from "./looks.ts";
import type { FootLocal } from "./pose.ts";

// Общий решатель конечностей; доступен проверкам без React/JSX.
export const twoBone = (root: Vec, target: Vec, l1: number, l2: number, pref: Vec, width = 0.14) => {
  let dx = target.x - root.x;
  let dy = target.y - root.y;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 1;
  if (d > maxD) {
    dx *= maxD / d;
    dy *= maxD / d;
    d = maxD;
  }
  const ux = d > 1e-6 ? dx / d : 0;
  const uy = d > 1e-6 ? dy / d : 1;
  d = Math.max(d, Math.abs(l1 - l2) + 2);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const sinA = Math.sqrt(1 - cosA * cosA);
  const bias = pref.x * uy - pref.y * ux;
  const bend = clamp(bias / width, -1, 1);
  return {
    mid: { x: root.x + l1 * cosA * ux + bend * l1 * sinA * uy, y: root.y + l1 * cosA * uy - bend * l1 * sinA * ux },
    end: { x: root.x + ux * d, y: root.y + uy * d },
  };
};

// Опорную стопу нельзя «приклеить» только математически: если цель
// недостижима, IK отодвигает нарисованную стопу и она всё равно скользит.
// Слегка опускаем таз, чтобы обе ноги доставали до своих реальных целей.
export const supportDrop = (b: Build, feet: readonly FootLocal[], bodyTurn: number, sway = 0) => {
  const reach = b.thigh + b.shin - 3;
  const minHip = feet.reduce((y, foot, i) => {
    const side = i === 0 ? -1 : 1;
    const hipX = sway + side * b.hipJointX * (1 - 0.55 * Math.abs(bodyTurn));
    const dx = foot.x - hipX;
    const vertical = Math.sqrt(Math.max(0, reach * reach - dx * dx));
    return Math.max(y, foot.y - vertical);
  }, b.hipJointY);
  return Math.max(0, minHip - b.hipJointY);
};
