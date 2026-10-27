// СЦЕНА 7 — ПОСМОТРИ ВОКРУГ (00:54–01:00)
// Цитата исчезает целиком, резерв бумаги снова заливается небом; на переднем
// плане из мягких мазков появляется мальчик на холме, обретает объём,
// поднимает голову к звёздам; камера отдаляется до всего холста; надписи.
import { span } from "../utils/noise";

export const S7 = {
  refill: [1630, 1672] as const,
  boy: [1636, 1700] as const,
  boyAwaken: [1690, 1716] as const,
  lift: [1706, 1748] as const,
  question: [1746, 1764] as const,
  brand: [1758, 1776] as const,
};

export const s7 = (f: number) => ({
  refill: span(f, ...S7.refill),
  boy: span(f, ...S7.boy, (x) => x),
  boyAwaken: span(f, ...S7.boyAwaken),
  lift: span(f, ...S7.lift),
});
