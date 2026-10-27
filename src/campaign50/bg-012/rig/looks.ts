// Внешность и пропорции героев BG-012: мама, папа, сын (≈7 лет).
export type LookId = "mom" | "dad" | "son";

export type Build = {
  readonly headRx: number;
  readonly headRy: number;
  readonly neck: number;
  readonly neckW: number;
  readonly shoulder: number; // половина ширины плеч
  readonly torso: number;
  readonly hip: number; // половина ширины бёдер
  readonly upper: number; // плечо
  readonly fore: number; // предплечье
  readonly hand: number;
  readonly thigh: number;
  readonly shin: number;
  readonly arm: number; // толщина рукава
  readonly leg: number; // толщина штанины
};

export type Look = {
  readonly id: LookId;
  readonly build: Build;
  readonly skin: string;
  readonly skinShade: string;
  readonly blush: string;
  readonly hair: string;
  readonly hairHi: string;
  readonly brow: string;
  readonly iris: string;
  readonly lip: string;
  readonly top: string; // одежда
  readonly topShade: string;
  readonly topAccent: string;
  readonly pants: string;
  readonly shoe: string;
  readonly child: boolean;
};

const SKIN = "#F2C9A4";
const SKIN_SHADE = "#DFA983";

export const LOOKS: Record<LookId, Look> = {
  mom: {
    id: "mom",
    build: { headRx: 60, headRy: 70, neck: 30, neckW: 30, shoulder: 80, torso: 220, hip: 74, upper: 112, fore: 104, hand: 17, thigh: 150, shin: 170, arm: 32, leg: 40 },
    skin: SKIN,
    skinShade: SKIN_SHADE,
    blush: "#F09A8A",
    hair: "#3A2520",
    hairHi: "#5A3A30",
    brow: "#3A2520",
    iris: "#4A2E22",
    lip: "#C9675E",
    // мягкий жёлтый кардиган поверх белой футболки
    top: "#F4C430",
    topShade: "#D9A91E",
    topAccent: "#FFFFFF",
    pants: "#4D5B7C",
    shoe: "#E9E2D6",
    child: false,
  },
  dad: {
    id: "dad",
    build: { headRx: 64, headRy: 74, neck: 32, neckW: 38, shoulder: 96, torso: 236, hip: 84, upper: 122, fore: 112, hand: 19, thigh: 160, shin: 180, arm: 38, leg: 46 },
    skin: "#EDC09A",
    skinShade: "#D49F79",
    blush: "#E59684",
    hair: "#221A18",
    hairHi: "#3A2C28",
    brow: "#221A18",
    iris: "#3A2418",
    lip: "#B8695F",
    // тёмно-синий свитер
    top: "#24407A",
    topShade: "#1B3263",
    topAccent: "#DCE6F7",
    pants: "#3B3F4A",
    shoe: "#2B2B2E",
    child: false,
  },
  son: {
    id: "son",
    build: { headRx: 64, headRy: 68, neck: 16, neckW: 24, shoulder: 56, torso: 148, hip: 52, upper: 74, fore: 70, hand: 14, thigh: 96, shin: 104, arm: 26, leg: 30 },
    skin: "#F4CDA8",
    skinShade: "#E0AE87",
    blush: "#F39A8A",
    hair: "#2E201B",
    hairHi: "#4C362D",
    brow: "#2E201B",
    iris: "#4B2F22",
    lip: "#D0726A",
    // голубая футболка с жёлтой полосой
    top: "#7CB8E8",
    topShade: "#5E9CCF",
    topAccent: "#F7C531",
    pants: "#2F4D7E",
    shoe: "#FFFFFF",
    child: true,
  },
};

export const INK = "#2A1F24";
