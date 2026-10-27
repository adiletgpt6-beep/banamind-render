// Объявление о поиске няни — сквозной мотив №34 (сцены 1, 3, 13 и
// уменьшенно — экран ноутбука в сценах 2 и 10). Спокойная карточка
// документа: метка «Жарыя · 5-вариант», заголовок, три пункта с мягкими
// круглыми маркерами и ниже — отдельная группа требований о вождении
// (три строки). Все состояния — чистая функция от чисел 0…1.
//
// Карточка рисуется в макете шириной AD_W = 900 px и масштабируется до w:
// раскладка (adLayout) одинакова при любом w, переносы строк заданы явно
// (ширины строк замерены по Nunito 700/44 px), поэтому высоты известны
// заранее и сцены могут наводить камеру на строку или слово «мектептен».
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { EL_TEXT } from "../script";
import { C, F, RADIUS } from "../theme";

export const AD_W = 900;

// Смешение двух цветов #RRGGBB (t = 0 — a, 1 — b). Общий помощник
// карточек ui/ и props/Phone.
const rgbOf = (c: string): number[] => (c.startsWith("#") ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : (c.match(/[\d.]+/g) ?? ["0", "0", "0"]).slice(0, 3).map(Number));
export const mix = (a: string, b: string, t: number) => {
  const k = clamp(t);
  if (k <= 0) return a;
  if (k >= 1) return b;
  const pa = rgbOf(a);
  const pb = rgbOf(b);
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(",")})`;
};

// Метрики макета (px при ширине 900).
const M = {
  padTop: 52,
  padBottom: 56,
  headerH: 56,
  headerGap: 30,
  titleSize: 68,
  titleH: 80,
  titleGap: 26,
  divider: 2,
  dividerGap: 30,
  size: 44, // пункты
  lh: 58,
  itemGap: 20,
  bulletX: 56,
  bulletD: 28,
  textX: 100,
  blockGap: 28,
  blockPad: 20,
  lineGap: 12,
  blockInset: 32,
  bar: 8,
} as const;

// Пункты по строкам (ширина текста ≤ 744 px). «Уулубуз мектептен
// келгенде тосуп алуу» не помещается в одну строку — перенос после
// третьего слова.
const words = (s: string, from: number, to?: number) => s.split(" ").slice(from, to).join(" ");
const ITEM_LINES: readonly (readonly string[])[] = [[EL_TEXT.ad.items[0]], [words(EL_TEXT.ad.items[1], 0, 3), words(EL_TEXT.ad.items[1], 3)], [EL_TEXT.ad.items[2]]];

// Слово «мектептен» в третьей строке блока: «Баланы » = 178 px,
// «мектептен» = 223 px (Nunito 700, 44 px).
const FOCUS_DX = 178;
const FOCUS_W = 223;

export type AdState = {
  readonly extraLines?: number;
  readonly remove?: number;
};
export type AdBox = { readonly y: number; readonly h: number };
export type AdLayout = {
  readonly scale: number; // w / 900
  readonly w: number;
  readonly h: number; // полная высота карточки
  readonly header: AdBox;
  readonly title: AdBox;
  readonly items: readonly AdBox[]; // три пункта (второй — две строки)
  readonly block: AdBox; // группа о вождении (с отступом над ней — gap)
  readonly gap: number; // текущий отступ над группой
  readonly extra: readonly (AdBox & { readonly shown: number })[]; // три строки группы; shown 0…1
  readonly focus: {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
  }; // слово «мектептен»
  readonly textX: number; // левый край текста пунктов
};

const presence = (extraLines: number, i: number) => easeInOut(clamp(extraLines - i));
const collapse = (remove: number) => 1 - easeInOut(clamp((remove - 0.3) / 0.7));

// Раскладка в px карточки ширины w (от верхнего края карточки).
export const adLayout = (w: number, state: AdState = {}): AdLayout => {
  const s = w / AD_W;
  const extraLines = state.extraLines ?? 3;
  const remove = state.remove ?? 0;
  const header = { y: M.padTop, h: M.headerH };
  const title = { y: header.y + M.headerH + M.headerGap, h: M.titleH };
  let y = title.y + M.titleH + M.titleGap + M.divider + M.dividerGap;
  const items: AdBox[] = ITEM_LINES.map((lines, i) => {
    const b = { y: y + (i > 0 ? M.itemGap : 0), h: lines.length * M.lh };
    y = b.y + b.h;
    return b;
  });
  const c = collapse(remove);
  const p = [0, 1, 2].map((i) => presence(extraLines, i));
  const gap = M.blockGap * p[0] * c;
  const blockY = y + gap;
  let ly = blockY + M.blockPad * p[0];
  const extra = p.map((pi, i) => {
    const top = ly + (i > 0 ? M.lineGap * pi : 0);
    ly = top + M.lh * pi;
    return { y: top, h: M.lh, shown: pi };
  });
  const blockFull = ly + M.blockPad * p[0] - blockY;
  const block = { y: blockY, h: blockFull * c };
  const h = blockY + block.h + M.padBottom;
  const fy = extra[2].y;
  const sc = (b: AdBox) => ({ y: b.y * s, h: b.h * s });
  return {
    scale: s,
    w,
    h: h * s,
    header: sc(header),
    title: sc(title),
    items: items.map(sc),
    block: sc(block),
    gap: gap * s,
    extra: extra.map((e) => ({ ...sc(e), shown: e.shown })),
    focus: {
      x: (M.textX + FOCUS_DX) * s,
      y: fy * s,
      w: FOCUS_W * s,
      h: M.lh * s,
    },
    textX: M.textX * s,
  };
};

// ---------- мелкие элементы ----------
const CARET_H = 48;

// Мигание курсора: мягкое вкл/выкл с периодом ≈ 1 с; во время набора —
// ровный.
const caretAlpha = (frame: number, solid: boolean) => (solid ? 1 : clamp(0.5 + 2.2 * Math.cos((2 * Math.PI * frame) / 32)));

const Caret: React.FC<{ readonly o: number }> = ({ o }) => (
  <span
    style={{
      position: "absolute",
      left: "100%",
      marginLeft: 3,
      top: (M.lh - CARET_H) / 2 + 1,
      width: 4,
      height: CARET_H,
      borderRadius: 2,
      backgroundColor: C.caret,
      opacity: o,
    }}
  />
);

// Выделение текста (как в редакторе): заливка растёт слева направо.
const selection = (k: number): React.CSSProperties =>
  k <= 0
    ? {}
    : {
        backgroundImage: `linear-gradient(${C.select}, ${C.select})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${clamp(k) * 100}% 100%`,
        borderRadius: 6,
      };

const Bullet: React.FC<{
  readonly amber: number;
  readonly evening: number;
}> = ({ amber, evening }) => {
  const ring = mix(mix("#EAEFF5", "#F3ECE0", evening), "#FAD9A1", amber);
  const dot = mix(C.greyBlue, C.amberLine, amber);
  return (
    <div
      style={{
        position: "absolute",
        left: M.bulletX,
        top: (M.lh - M.bulletD) / 2,
        width: M.bulletD,
        height: M.bulletD,
        borderRadius: 999,
        backgroundColor: ring,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 8,
          top: 8,
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: dot,
        }}
      />
    </div>
  );
};

const lineText: React.CSSProperties = {
  position: "absolute",
  left: M.textX,
  top: 0,
  height: M.lh,
  lineHeight: `${M.lh}px`,
  fontSize: M.size,
  fontWeight: 700,
  whiteSpace: "nowrap",
  color: C.ink,
};

// Строка: маркер (если first) + текст + необязательный курсор в конце.
const Row: React.FC<{
  readonly y: number;
  readonly first?: boolean;
  readonly amber?: number;
  readonly evening: number;
  readonly sel?: number;
  readonly caret?: number; // непрозрачность курсора в конце строки (0 — нет)
  readonly opacity?: number;
  readonly dy?: number;
  readonly children: React.ReactNode;
}> = ({ y, first = true, amber = 0, evening, sel = 0, caret = 0, opacity = 1, dy = 0, children }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: y,
      width: AD_W,
      height: M.lh,
      opacity,
      transform: dy ? `translateY(${dy}px)` : undefined,
    }}
  >
    {first ? <Bullet amber={amber} evening={evening} /> : null}
    <div style={lineText}>
      <span
        style={{
          position: "relative",
          display: "inline-block",
          height: M.lh,
          ...selection(sel),
        }}
      >
        {children}
        {caret > 0 ? <Caret o={caret} /> : null}
      </span>
    </div>
  </div>
);

// Небольшой значок «карандаш» справа в шапке (редактирование документа).
const Pencil: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width={40} height={40} viewBox="0 0 40 40">
    <path d="M 9 31 L 10.5 24.5 L 25 10 Q 27 8 29 10 L 30 11 Q 32 13 30 15 L 15.5 29.5 Z" fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 22.5 12.5 L 27.5 17.5" stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

export type AdCardProps = {
  readonly w?: number; // ширина карточки, px (макет — 900)
  readonly x?: number;
  readonly y?: number;
  readonly edit0?: number; // первая правка: 0 — «Кызыбызга кам көрүү»; 0…0,3 выделение; 0,3…1 набор «Кичинекей кызыбызга кам көрүү»
  readonly edit?: number; // 0 — «Тажрыйбасы бар»; 0…0,3 выделение; 0,3…1 набор «Балдар менен иш тажрыйбасы»
  readonly typed?: number; // набор первой строки блока «Айдоочулук күбөлүк» 0…1
  readonly extraLines?: number; // 0…3 строк блока (дробное — следующая проявляется)
  readonly highlight?: number; // янтарная подсветка блока
  readonly focus?: number; // подчёркивание слова «мектептен», курсор на нём
  readonly select?: number; // выделение всего блока (перед удалением)
  readonly remove?: number; // удаление: растворение и сжатие места
  readonly caretFrame?: number; // кадр для мигания курсора; не задан — курсора нет
  readonly evening?: number; // тёплый вечерний оттенок
  readonly compact?: boolean | number; // экран ноутбука: та же раскладка, лёгкая тень (число 0…1 — плавный переход)
  readonly style?: React.CSSProperties; // для внешней обёртки (вход, прозрачность)
};

export const AdCard: React.FC<AdCardProps> = ({
  w = AD_W,
  x = 0,
  y = 0,
  edit0 = 1,
  edit = 1,
  typed = 1,
  extraLines = 3,
  highlight = 0,
  focus = 0,
  select = 0,
  remove = 0,
  caretFrame,
  evening = 0,
  compact = false,
  style,
}) => {
  const L = adLayout(AD_W, { extraLines, remove });
  const s = w / AD_W;
  const ev = clamp(evening);
  const hl = easeOut(clamp(highlight));

  // пункт 1: выделение старых слов → набор новых (первая короткая правка)
  const before1 = EL_TEXT.ad.itemsBefore[0];
  const after1 = [...EL_TEXT.ad.items[0]];
  const typing1 = edit0 > 0.3 && edit0 < 1;
  const item1 = edit0 <= 0.3 ? before1 : after1.slice(0, Math.round(after1.length * clamp((edit0 - 0.3) / 0.7))).join("");
  const sel1 = edit0 > 0 && edit0 <= 0.3 ? easeInOut(clamp(edit0 / 0.22)) : 0;

  // пункт 3: выделение старых слов → набор новых
  const before = EL_TEXT.ad.itemsBefore[2];
  const after = [...EL_TEXT.ad.items[2]];
  const typing3 = edit > 0.3 && edit < 1;
  const item3 = edit <= 0.3 ? before : after.slice(0, Math.round(after.length * clamp((edit - 0.3) / 0.7))).join("");
  const sel3 = edit > 0 && edit <= 0.3 ? easeInOut(clamp(edit / 0.22)) : 0;

  // первая строка блока набирается
  const line0 = [...EL_TEXT.ad.extra[0]];
  const typedText = typed >= 1 ? EL_TEXT.ad.extra[0] : line0.slice(0, Math.round(line0.length * clamp(typed))).join("");
  const typing0 = typed > 0 && typed < 1;

  // где курсор
  type At = "item1" | "item3" | 0 | 1 | 2 | "focus" | null;
  let at: At = null;
  if (caretFrame !== undefined) {
    if (remove >= 1) at = "item3";
    else if (select > 0 || remove > 0) at = null;
    else if (focus > 0) at = "focus";
    else if (extraLines > 0) at = Math.min(2, Math.ceil(extraLines) - 1) as 0 | 1 | 2;
    else if (edit0 < 1) at = edit0 <= 0 || edit0 > 0.3 ? "item1" : null;
    else if (edit <= 0 || edit > 0.3) at = "item3";
  }
  const solid = (at === "item1" && typing1) || (at === "item3" && typing3) || (at === 0 && typing0);
  const caretO = caretFrame === undefined ? 0 : caretAlpha(caretFrame, solid);
  const caretFor = (k: At) => (at === k ? caretO : 0);

  // строки блока
  const gone = 1 - clamp(remove / 0.45);
  const extraSel = (i: number) => clamp(select * 3 - i);
  const fx = easeInOut(clamp(focus));
  const focusText = EL_TEXT.ad.extra[2];
  const fi = focusText.indexOf(EL_TEXT.ad.extraFocus);
  const fPre = focusText.slice(0, fi);
  const fWord = EL_TEXT.ad.extraFocus;
  const fPost = focusText.slice(fi + fWord.length);

  const cardBg = mix(C.card, "#FFF8EC", ev);
  // тень: обычная ↔ компактная (экран ноутбука), вечером — теплее
  const cp = typeof compact === "number" ? clamp(compact) : compact ? 1 : 0;
  const sc = `${Math.round(lerp(23, 70, ev))},${Math.round(lerp(38, 46, ev))},${Math.round(lerp(61, 20, ev))}`;
  const shadow = [
    `0 ${lerp(30, 8, cp)}px ${lerp(60, 20, cp)}px rgba(${sc},${lerp(0.12 + 0.03 * ev, 0.1, cp)})`,
    `0 ${lerp(8, 0, cp)}px ${lerp(18, 0, cp)}px rgba(${sc},${0.08 * (1 - cp)})`,
    `0 0 0 ${1.5 * cp}px rgba(23,38,61,${0.06 * cp})`,
  ].join(", ");
  const lineCol = mix(C.line, "#EADFCB", ev);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: L.h * s,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: AD_W,
          height: L.h,
          transform: `scale(${s})`,
          transformOrigin: "0 0",
          backgroundColor: cardBg,
          borderRadius: RADIUS.card,
          boxShadow: shadow,
          fontFamily: F.text,
          color: C.ink,
          overflow: "hidden",
        }}
      >
        {/* шапка: метка, вариант, карандаш */}
        <div
          style={{
            position: "absolute",
            left: M.bulletX,
            top: L.header.y,
            height: M.headerH,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              height: M.headerH,
              padding: "0 24px",
              borderRadius: RADIUS.chip,
              backgroundColor: mix("#E9EEF4", "#F1E9DB", ev),
              color: C.inkSoft,
              fontSize: 30,
              fontWeight: 800,
              lineHeight: `${M.headerH}px`,
            }}
          >
            {EL_TEXT.ad.tag}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.inkMute }}>{EL_TEXT.ad.version}</div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 48,
            top: L.header.y + 8,
            opacity: 0.75,
          }}
        >
          <Pencil color={C.inkMute} />
        </div>

        {/* заголовок и разделитель */}
        <div
          style={{
            position: "absolute",
            left: M.bulletX,
            top: L.title.y,
            height: M.titleH,
            lineHeight: `${M.titleH}px`,
            fontSize: M.titleSize,
            fontWeight: 900,
            letterSpacing: -0.6,
            whiteSpace: "nowrap",
          }}
        >
          {EL_TEXT.ad.title}
        </div>
        <div
          style={{
            position: "absolute",
            left: M.bulletX,
            right: M.bulletX,
            top: L.title.y + M.titleH + M.titleGap,
            height: M.divider,
            backgroundColor: lineCol,
          }}
        />

        {/* три пункта */}
        {ITEM_LINES.map((lines, i) =>
          lines.map((t, k) => {
            const ry = L.items[i].y + k * M.lh;
            if (i === 0) {
              return (
                <Row key={`${i}-${k}`} y={ry} first evening={ev} sel={sel1} caret={caretFor("item1")}>
                  {item1}
                </Row>
              );
            }
            if (i === 2) {
              return (
                <Row key={`${i}-${k}`} y={ry} evening={ev} sel={sel3} caret={caretFor("item3")}>
                  {item3}
                </Row>
              );
            }
            return (
              <Row key={`${i}-${k}`} y={ry} first={k === 0} evening={ev}>
                {t}
              </Row>
            );
          }),
        )}

        {/* отдельная группа о вождении */}
        {L.extra[0].shown > 0 && L.block.h > 0.5 ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: L.block.y,
              width: AD_W,
              height: L.block.h,
              overflow: "hidden",
              opacity: gone,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: M.blockInset,
                right: M.blockInset,
                top: 0,
                height: Math.max(L.block.h, 0),
                borderRadius: RADIUS.inner,
                overflow: "hidden",
                backgroundColor: `rgba(255,235,196,${hl})`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: M.bar,
                  backgroundColor: C.amberLine,
                  transform: `scaleY(${hl})`,
                  transformOrigin: "50% 0",
                }}
              />
            </div>
            {[0, 1, 2].map((i) => {
              const e = L.extra[i];
              if (e.shown <= 0) return null;
              const ry = e.y - L.block.y;
              const common = {
                y: ry,
                amber: hl,
                evening: ev,
                sel: extraSel(i),
                opacity: e.shown,
                dy: (1 - e.shown) * 18,
              } as const;
              if (i === 0)
                return (
                  <Row key={i} {...common} caret={caretFor(0)}>
                    {typedText}
                  </Row>
                );
              if (i === 1)
                return (
                  <Row key={i} {...common} caret={caretFor(1)}>
                    {EL_TEXT.ad.extra[1]}
                  </Row>
                );
              return (
                <Row key={i} {...common} caret={caretFor(2)}>
                  {fPre}
                  <span style={{ position: "relative", display: "inline-block" }}>
                    {fWord}
                    {fx > 0 ? (
                      <span
                        style={{
                          position: "absolute",
                          left: -2,
                          bottom: 3,
                          height: 7,
                          width: `calc(${fx * 100}% + 4px)`,
                          borderRadius: 4,
                          backgroundColor: C.amberLine,
                        }}
                      />
                    ) : null}
                    {caretFor("focus") > 0 ? <Caret o={caretFor("focus") * clamp(focus * 3 - 1.5)} /> : null}
                  </span>
                  {fPost}
                </Row>
              );
            })}
          </div>
        ) : null}
        {/* вечерний тёплый свет сверху-слева */}
        {ev > 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 18% 0%, rgba(255,214,150,${0.16 * ev}), rgba(255,214,150,0) 70%)`,
              pointerEvents: "none",
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
