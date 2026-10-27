// Моменты действий сцены заявки (кадры сцены) — общие для картинки
// (scenes/Reply.tsx) и звука (sound.ts). word(id, i) — кадр сцены начала
// слова i реплики id.
export const requestBeats = (word: (id: string, i: number) => number) => {
  // поиск: «кызды мектептен алып келүүнүн жолун издеп» — запрос
  // набирается, появляются результаты; «BalaGo’ну табышты» — нажатие
  const qFrom = Math.max(6, word("n04", 2) - 4);
  const qTo = word("n04", 7);
  const resultsAt = qTo - 4;
  const resClick = word("n04", 8) + 2;
  const pageAt = resClick + 7;
  // страница BalaGo: оба направления, нажатие «Алдын ала арыз»
  const routeHL = pageAt + 6;
  const pageClick = Math.max(routeHL + 34, word("n04b", 0) - 8);
  const formAt = pageClick + 8;
  // заявка: поля, выбор «Мектеп → Үй» (на «Мектептен үйгө»), кнопка,
  // нажатие на «арыз», подтверждение
  const fill = [formAt + 2, formAt + 8, formAt + 14] as const;
  const routeAt = formAt + 16;
  const chooseAt = Math.max(routeAt + 8, word("n04b", 1) + 2);
  const readyAt = chooseAt + 8;
  const tap = Math.max(readyAt + 10, word("n04b", 5));
  const sent = tap + 6;
  return { qFrom, qTo, resultsAt, resClick, pageAt, routeHL, pageClick, formAt, fill, routeAt, chooseAt, readyAt, tap, sent };
};
