// Внешность и пропорции героев BG-048: папа («главный диспетчер»), мама
// («второй оператор»), дочь ≈ 8 лет (смастерила картонный пульт).
export type LookId = "dad" | "mom" | "girl";

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
  // короткий рукав (видна кожа предплечья)
  readonly shortSleeve: boolean;
};

export const LOOKS: Record<LookId, Look> = {
  dad: {
    id: "dad",
    build: { headRx: 64, headRy: 74, neck: 32, neckW: 38, shoulder: 98, torso: 236, hip: 84, upper: 122, fore: 112, hand: 19, thigh: 160, shin: 180, arm: 38, leg: 46 },
    skin: "#EDC09A",
    skinShade: "#D49F79",
    blush: "#E59684",
    hair: "#221A18",
    hairHi: "#3A2C28",
    brow: "#221A18",
    iris: "#3A2418",
    lip: "#B8695F",
    // тёмно-синий джемпер с белым воротником рубашки
    top: "#24407A",
    topShade: "#1B3263",
    topAccent: "#F4F7FC",
    pants: "#3B3F4A",
    shoe: "#2B2B2E",
    child: false,
    shortSleeve: false,
  },
  mom: {
    id: "mom",
    build: { headRx: 60, headRy: 70, neck: 30, neckW: 30, shoulder: 80, torso: 220, hip: 74, upper: 112, fore: 104, hand: 17, thigh: 150, shin: 170, arm: 32, leg: 40 },
    skin: "#F2C9A4",
    skinShade: "#DFA983",
    blush: "#F09A8A",
    hair: "#3A2520",
    hairHi: "#5A3A30",
    brow: "#3A2520",
    iris: "#4A2E22",
    lip: "#C9675E",
    // жёлтый кардиган поверх белой футболки
    top: "#F4C430",
    topShade: "#D9A91E",
    topAccent: "#FFFFFF",
    pants: "#4D5B7C",
    shoe: "#E9E2D6",
    child: false,
    shortSleeve: false,
  },
  girl: {
    id: "girl",
    build: { headRx: 62, headRy: 66, neck: 16, neckW: 22, shoulder: 52, torso: 142, hip: 54, upper: 70, fore: 66, hand: 13, thigh: 92, shin: 100, arm: 24, leg: 26 },
    skin: "#F4CDA8",
    skinShade: "#E0AE87",
    blush: "#F39A8A",
    hair: "#2E201B",
    hairHi: "#4C362D",
    brow: "#2E201B",
    iris: "#4B2F22",
    lip: "#D0726A",
    // школьная форма: белая блузка, тёмно-синий сарафан
    top: "#FFFFFF",
    topShade: "#E3E8F2",
    topAccent: "#2A3F73",
    pants: "#2A3F73",
    shoe: "#2B2B2E",
    child: true,
    shortSleeve: false,
  },
};

export const INK = "#2A1F24";
