import type React from "react";

// Набор обложек книги. Правило канала: ровно пять разных концепций.
// Тексты, идеи и рекомендация лежат в books/<slug>/thumbnails.json (их проверяет
// scripts/books/thumbnails.mjs), рисунки — в src/books/<slug>/thumbnails.tsx.
export type ThumbnailMeta = {
  n: 1 | 2 | 3 | 4 | 5;
  concept: string; // «Классическое», «Интрига», …
  idea: string; // что изображено и зачем
  texts: string[]; // все надписи на обложке (проверяются орфографией)
};

export type BookThumbnails = {
  slug: string; // папка books/<slug>
  title: string;
  thumbnails: ThumbnailMeta[];
  recommended: number; // предложение; финальный выбор — за владельцем канала
  why: string;
  components: Record<1 | 2 | 3 | 4 | 5, React.FC>;
};
