// MUSLIM KIDS — WOVEN WORLDS («Тканые миры»): фирменная палитра и материалы нитей.
import { hexLin, V3 } from "../utils/math";

export const HEX = {
  night: "#081626",
  gold: "#F0C575",
  turquoise: "#52CBD4",
  sky: "#8DDAF0",
  emerald: "#40A97D",
  brown: "#997054",
  milk: "#F6F3EB",
  silver: "#C7DDE4",
} as const;

export const COL = {
  gold: hexLin(HEX.gold),
  goldDeep: hexLin("#D9A54E"),
  turquoise: hexLin(HEX.turquoise),
  sky: hexLin(HEX.sky),
  emerald: hexLin(HEX.emerald),
  emeraldLight: hexLin("#6CC596"),
  emeraldDeep: hexLin("#2E8A64"),
  brown: hexLin(HEX.brown),
  brownDeep: hexLin("#7A563E"),
  brownLight: hexLin("#B48A68"),
  milk: hexLin(HEX.milk),
  silver: hexLin(HEX.silver),
  ocean: hexLin("#1F78BE"),
  oceanDeep: hexLin("#185E9E"),
  river: hexLin("#4FB8E0"),
  skyThread: hexLin("#1E4A7C"),
  skyThreadDeep: hexLin("#163A66"),
  skyThreadLight: hexLin("#2A5E96"),
} satisfies Record<string, V3>;

/**
 * Типы волокон ThreadMaterialSystem.
 * gold — декоративная шёлковая золотая нить, silk — гладкий шёлк, cotton — матовый хлопок,
 * wool — мягкая шерсть, coarse — грубое коричневое волокно, silver — серебристая нить звёзд.
 */
export type MaterialKind = "gold" | "silk" | "cotton" | "wool" | "coarse" | "silver";
export const MATERIAL_KINDS: MaterialKind[] = ["gold", "silk", "cotton", "wool", "coarse", "silver"];

/** Глубина рельефа скрутки (доля радиуса) для каждого типа нити. */
export const PLY_LOBE: Record<MaterialKind, number> = {
  gold: 0.09,
  silk: 0.07,
  cotton: 0.12,
  wool: 0.1,
  coarse: 0.16,
  silver: 0.08,
};
