// Роли серии LESSON-80 — общие для всех мини-фильмов: учитель Мухаммад и
// три главных мальчика; «kids» — групповая реплика класса. Файл без
// зависимостей от Remotion.
export type L80Role = "muhammad" | "yusuf" | "amir" | "bilal" | "kids";

export const SPEAKER_NAME: Record<L80Role, string> = {
  muhammad: "Мухаммад",
  yusuf: "Юсуф",
  amir: "Амир",
  bilal: "Билал",
  kids: "Дети",
};
