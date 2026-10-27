// СЦЕНА 4 — РОСТОК И ДЕРЕВО (00:24–00:34)
// Пар поднимается от моря и собирается в облака → облака обретают объём →
// дождь → камера следует за одной каплей → развод на земле → семечко →
// росток → дерево вырастает мазок за мазком → камера поднимается по стволу в небо.
import { lin, span } from "../utils/noise";

export const S4 = {
  vapor: [688, 748] as const,
  clouds: [728, 768] as const,
  cloudAwaken: [748, 775] as const,
  rain: [752, 790] as const,
  rainEnd: [812, 840] as const,
  drop: [770, 805] as const,
  impact: 805,
  sprout: [852, 900] as const,
  grow: [898, 990] as const,
  treeAwaken: [930, 975] as const,
};

export const s4 = (f: number) => ({
  vapor: lin(f, ...S4.vapor),
  clouds: span(f, ...S4.clouds),
  cloudAwaken: span(f, ...S4.cloudAwaken),
  rain: span(f, ...S4.rain) * (1 - span(f, ...S4.rainEnd)),
  drop: lin(f, ...S4.drop),
  sprout: span(f, ...S4.sprout),
  grow: span(f, ...S4.grow, (x) => x),
  treeAwaken: span(f, ...S4.treeAwaken),
});
