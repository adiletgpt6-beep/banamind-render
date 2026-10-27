// Реестр печати панелей ленты: итоговый вид каждой панели нужен и
// следующим сценам (верх ленты виден над текущей панелью).
import { P1Art } from "./P1";
import { P2Art } from "./P2";
import { P3Art } from "./P3";
import { P4Art } from "./P4";
import { P5Art } from "./P5";
import { P6Art } from "./P6";

export const PANEL_ART: Record<number, React.FC<{ readonly t: number }>> = {
  1: P1Art,
  2: P2Art,
  3: P3Art,
  4: P4Art,
  5: P5Art,
  6: P6Art,
};

// «Итог» для уже развёрнутых панелей.
export const DONE = 9999;
