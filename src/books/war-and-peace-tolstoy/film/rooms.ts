// Подписи частей фильма (вверху кадра, в документах).
import type { PartId } from "./types";

export const ROOMS: Record<PartId, string> = {
  intro: "Масштаб выбора",
  society: "Свет 1805 года",
  austerlitz: "Аустерлиц",
  pierre: "Пьер и наследство",
  natasha: "Наташа",
  families: "Семьи и долг",
  plan: "1812: план и поле",
  moscow: "Москва",
  captivity: "Плен",
  generals: "Кутузов и Наполеон",
  recovery: "Потери и жизнь",
  theory: "Эпилог: кто движет историей",
  end: "Выводы",
};
