// Обложки всех книг канала: для каждой книги — пять кадров 1280×720
// с id thumb-<slug>-<n>. Новая книга добавляется в BOOKS одной строкой.
import React from "react";
import { Still } from "remotion";
import "../fonts";
import { ATLAS_THUMBNAILS } from "../books/ayn-rand-atlas-shrugged-fragment/thumbnails";
import { TRAKTAT_THUMBNAILS } from "../books/traktat-o-prirode/thumbnails";
import "../banamind/fonts";
import { TH, TW } from "./kit";
import type { BookThumbnails } from "./types";

export const BOOKS: BookThumbnails[] = [TRAKTAT_THUMBNAILS, ATLAS_THUMBNAILS];

export const ThumbnailsRoot: React.FC = () => (
  <>
    {BOOKS.flatMap((b) => ([1, 2, 3, 4, 5] as const).map((n) => <Still key={`${b.slug}-${n}`} id={`thumb-${b.slug}-${n}`} component={b.components[n]} width={TW} height={TH} />))}
  </>
);
