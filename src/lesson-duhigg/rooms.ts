// Названия частей фильма (подпись вверху кадра, документы).
import type { PartId } from "./types";

export const ROOMS: Record<PartId, string> = {
  intro: "Лаборатория невидимых кнопок",
  what: "Что такое привычка",
  brain: "Мозг на автопилоте",
  loop: "Три точки петли",
  craving: "Тяга",
  test: "Эксперимент BanaMind",
  change: "Как меняют привычку",
  keystone: "Краеугольные привычки",
  teams: "Привычки организаций",
  crisis: "Ловушки и кризисы",
  society: "Привычки общества",
  choice: "Выбор и ответственность",
  protocol: "Протокол BanaMind",
  end: "Выводы Лаборатории",
};
