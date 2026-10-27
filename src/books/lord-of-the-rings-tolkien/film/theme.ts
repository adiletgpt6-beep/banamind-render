// Палитра фильма «Властелин колец» — «Музей искушений» BanaMind.
// Свой цветовой код: тёплое золото экспонатов на светлом камне музея,
// у каждого зала — свой мягкий фон (Шир — зелень, Скальбург — ржавчина,
// Мордор — пепел, Гавани — море). Кадр остаётся светлым и читаемым.
import type { HallId } from "./types";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#232a44",
  inkSoft: "#4b557a",
  paper: "#fffaf0",
  stone: "#efe8da",
  stoneDeep: "#d9cfbb",
  gold: "#f2b630",
  goldDeep: "#c98a12",
  goldLight: "#ffe08a",
  yellow: "#ffd23f",
  green: "#4caf6e",
  greenDeep: "#2e7d4f",
  moss: "#8bbf5a",
  sky: "#7cc4ea",
  skyDeep: "#2f7fb8",
  sea: "#4aa3c7",
  rust: "#c4622d",
  ember: "#e8552f",
  ash: "#6d6a73",
  coral: "#ff7a6b",
  red: "#e5484d",
  violet: "#8a6ce8",
  silver: "#c9d6e3",
  white: "#ffffff",
};

// Фон каждого зала (верх → низ градиента)
export const HALL_BG: Record<HallId, [string, string]> = {
  h00: ["#fff4d8", "#f6dfa6"], // вход: золотой свет
  h01: ["#eef8e4", "#cfe9b8"], // Шир
  h02: ["#f3efe6", "#e2d8c3"], // ловушка: камень музея
  h03: ["#e9f1fb", "#c9dcf2"], // Совет: мрамор Раздола
  h04: ["#eaf6f2", "#c6e6dc"], // содружество, Лориэн
  h05: ["#f1eefb", "#d9d1f3"], // братья, Гондор
  h06: ["#eef1f6", "#d3dbe8"], // две карты войны
  h07: ["#f8ebe1", "#ecc9b0"], // Скальбург и энты
  h08: ["#efeee9", "#d8d5c8"], // Фродо, Сэм, Горлум
  h09: ["#f7f3ea", "#e6dcc2"], // короли: белый камень
  h10: ["#f6e7df", "#e6c3b4"], // Роковая гора: пепел и жар, но светлый кадр
  h11: ["#eef6e6", "#d4e8c0"], // возвращение домой
  h12: ["#e6f3f8", "#c3e1ee"], // Гавани и выводы
};

export const HALLS: { id: HallId; label: string }[] = [
  { id: "h00", label: "Вход" },
  { id: "h01", label: "Маленький народ" },
  { id: "h02", label: "Ловушка" },
  { id: "h03", label: "Совет" },
  { id: "h04", label: "Содружество" },
  { id: "h05", label: "Два брата" },
  { id: "h06", label: "Две карты" },
  { id: "h07", label: "Машина" },
  { id: "h08", label: "Жалость" },
  { id: "h09", label: "Король" },
  { id: "h10", label: "Роковая гора" },
  { id: "h11", label: "Дом" },
  { id: "h12", label: "Выход" },
];

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const DISPLAY = "'Russo One', Rubik, sans-serif";
