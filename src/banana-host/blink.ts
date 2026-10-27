// Моргание банана: детерминированные интервалы 2.4–5 с (одинаково при любом рендере).
export const blinkAt = (t: number) => {
  let s = 0.7;
  let i = 0;
  while (s < t + 1) {
    const next = s + 2.4 + ((i * 7919) % 26) / 10;
    if (t >= s && t < s + 0.2) {
      const k = (t - s) / 0.2;
      return k < 0.5 ? k * 2 : (1 - k) * 2;
    }
    s = next;
    i++;
  }
  return 0;
};
