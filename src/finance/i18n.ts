// Язык выпуска: английский (исходный) или русский. Язык задаётся композицией
// (Episode вызывает setLang до отрисовки сцен); тексты графики переводятся
// словарём по английскому ключу, суммы форматируются по-русски ($3200, а не
// $3,200 — в русском запятая означает дробь).
import { RU_UI } from "./episode/ui.ru";

export type Lang = "en" | "ru";
let current: Lang = "en";
export const setLang = (l: Lang) => {
  current = l;
};
export const getLang = () => current;

const ruNumbers = (s: string) => s.replace(/(\d),(\d{3})/g, "$1$2");

/** Перевод строки графики. Нет перевода → английский текст (ловится тестом). */
export const t = (en: string): string => {
  if (current === "en") return en;
  const ru = RU_UI[en];
  return ruNumbers(ru ?? en);
};
