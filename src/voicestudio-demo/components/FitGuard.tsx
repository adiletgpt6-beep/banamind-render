import React, { useLayoutEffect, useRef } from "react";
import { cancelRender, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";

const visibleOpacity = (el: HTMLElement, root: HTMLElement) => {
  let o = 1;
  let cur: HTMLElement | null = el;
  while (cur && cur !== root) {
    o *= Number(getComputedStyle(cur).opacity || 1);
    cur = cur.parentElement;
  }
  return o;
};

/**
 * Автоматическая проверка выхода текста за края кадра.
 * Каждый элемент с атрибутом data-fit, видимый полностью (opacity ≈ 1),
 * должен целиком помещаться в кадр с отступом `margin` и не переполнять
 * собственный блок. Иначе рендер падает с понятной ошибкой.
 */
export const FitGuard: React.FC<{ margin?: number; children: React.ReactNode }> = ({ margin = 24, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    const handle = delayRender(`FitGuard ${frame}`);
    let finished = false;
    let tries = 0;
    const finish = () => {
      if (!finished) {
        finished = true;
        continueRender(handle);
      }
    };
    const run = () => {
      const box = root.getBoundingClientRect();
      if (box.width === 0) {
        // Кадр ещё не размечен (шрифты/монтирование) — ждём следующий тик.
        if (tries++ < 60) {
          requestAnimationFrame(run);
        } else {
          finish();
        }
        return;
      }
      const k = box.width / width;
      const problems: string[] = [];
      root.querySelectorAll<HTMLElement>("[data-fit]").forEach((el) => {
        if (visibleOpacity(el, root) < 0.98) {
          return;
        }
        const r = el.getBoundingClientRect();
        const x0 = (r.left - box.left) / k;
        const y0 = (r.top - box.top) / k;
        const x1 = (r.right - box.left) / k;
        const y1 = (r.bottom - box.top) / k;
        const label = `${el.dataset.fit} «${(el.textContent || "").slice(0, 40)}»`;
        if (x0 < margin - 1 || y0 < margin - 1 || x1 > width - margin + 1 || y1 > height - margin + 1) {
          problems.push(`${label} выходит за кадр: [${x0.toFixed(0)},${y0.toFixed(0)}]–[${x1.toFixed(0)},${y1.toFixed(0)}]`);
        }
        if (el.scrollWidth > el.clientWidth + 2) {
          problems.push(`${label} переполняет блок по ширине (${el.scrollWidth} > ${el.clientWidth})`);
        }
      });
      if (problems.length) {
        cancelRender(new Error(`FitGuard, кадр ${frame}: ${problems.join(" | ")}`));
      }
      finish();
    };
    requestAnimationFrame(run);
    return finish;
  }, [frame, width, height, margin]);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      {children}
    </div>
  );
};
