// Журнал раздачи салфеток фильма 80-1-9: ровно 25 чистых салфеток
// napkin01…napkin25 для 25 мальчиков (учитель в учёт не входит).
// Первые 24 передачи делает Билал (bg01…bg22, Амир, Юсуф), последнюю —
// Юсуф: он берёт с подноса последнюю чистую салфетку и отдаёт её Билалу.
// Каждая передача — одно событие с моментами (кадры фильма):
//   take    — пальцы дающего снимают салфетку со стопки на подносе;
//   contact — пальцы получателя касаются той же салфетки (совместное касание);
//   release — дающий отпускает; дальше салфетка в руке получателя;
//   settle  — получатель кладёт её на место (рядом со своей тарелкой).
// Для салфетки, которую Билал сам кладёт перед Юсуфом, contact = release =
// settle: салфетка из руки ложится на стол, Юсуф её не берёт.
// Состояние любой салфетки в любом кадре вычисляется только из журнала и
// номера кадра — рендер с середины даёт тот же результат.
// Без зависимостей от Remotion (читается тестами).

export type NapkinState = "tray" | "giverHand" | "sharedContact" | "recipient" | "placed";

export type NapkinEvent = {
  readonly napkin: string; // napkin01…napkin25
  readonly giver: string; // "bilal" | "yusuf"
  readonly recipient: string; // castId получателя
  readonly take: number;
  readonly contact: number;
  readonly release: number;
  readonly settle: number;
};

export type NapkinLog = { readonly total: number; readonly events: readonly NapkinEvent[] };

export const napkinId = (i: number) => `napkin${String(i + 1).padStart(2, "0")}`;

// Состояние салфетки события e в кадре t.
export const napkinStateAt = (e: NapkinEvent, t: number): NapkinState => {
  if (t < e.take) return "tray";
  if (t < e.contact) return "giverHand";
  if (t < e.release) return "sharedContact";
  if (t < e.settle) return "recipient";
  return "placed";
};

// Сколько салфеток лежит на подносе в кадре t (салфетки в руках не на подносе).
export const trayCountAt = (log: NapkinLog, t: number) => log.total - log.events.filter((e) => t >= e.take).length;

// Есть ли у получателя своя салфетка в кадре t (в руке или на месте).
export const hasNapkinAt = (log: NapkinLog, castId: string, t: number) => log.events.some((e) => e.recipient === castId && t >= e.release);

// Сколько мальчиков уже получили салфетку к кадру t.
export const givenCountAt = (log: NapkinLog, t: number) => log.events.filter((e) => t >= e.release).length;

// Проверка журнала: 25 событий на 25 разных получателей из реестра, порядок
// моментов, ни один получатель не повторяется, Билал не среди первых 24,
// Юсуф получает свою не раньше контрольного кадра, последнюю передачу делает
// Юсуф Билалу, предметы не множатся (поднос + в руках + у получателей = 25).
export const checkNapkinLog = (
  log: NapkinLog,
  opts: { readonly roster: readonly string[]; readonly yusufNotBefore?: number; readonly duration: number },
): string[] => {
  const p: string[] = [];
  const ev = log.events;
  if (log.total !== 25) p.push(`салфеток ${log.total}, нужно 25`);
  if (ev.length !== 25) p.push(`передач ${ev.length}, нужно 25`);
  const seen = new Set<string>();
  const ids = new Set<string>();
  ev.forEach((e, i) => {
    if (e.napkin !== napkinId(i)) p.push(`передача ${i + 1}: салфетка ${e.napkin}, ожидалась ${napkinId(i)}`);
    if (ids.has(e.napkin)) p.push(`салфетка ${e.napkin} передаётся дважды`);
    ids.add(e.napkin);
    if (!opts.roster.includes(e.recipient)) p.push(`неизвестный получатель ${e.recipient}`);
    if (seen.has(e.recipient)) p.push(`получатель ${e.recipient} повторяется`);
    seen.add(e.recipient);
    if (!(e.take < e.contact && e.contact <= e.release && e.release <= e.settle)) p.push(`${e.napkin}: моменты передачи не по порядку`);
    if (i > 0 && e.take < ev[i - 1].release) p.push(`${e.napkin}: взята раньше, чем отдана предыдущая`);
    if (i < 24 && e.giver !== "bilal") p.push(`${e.napkin}: первые 24 раздаёт Билал`);
    if (i < 24 && e.recipient === "bilal") p.push("Билал среди первых 24 получателей");
  });
  const last = ev[24];
  if (last && (last.giver !== "yusuf" || last.recipient !== "bilal")) p.push("последнюю салфетку должен отдать Юсуф Билалу");
  const ys = ev.find((e) => e.recipient === "yusuf");
  if (ys && opts.yusufNotBefore !== undefined && ys.take < opts.yusufNotBefore) p.push("Юсуф получает салфетку раньше сцены 5");
  if (ev[23] && ev[23].recipient !== "yusuf") p.push("24-й получатель должен быть Юсуф");
  if (ev[22] && ev[22].recipient !== "amir") p.push("23-й получатель должен быть Амир");
  for (const r of opts.roster) if (!seen.has(r)) p.push(`${r} не получил салфетку`);
  // сохранение количества в каждом кадре: поднос + в руках + у получателей = 25
  for (let t = 0; t <= opts.duration; t += 3) {
    const onTray = trayCountAt(log, t);
    const out = ev.filter((e) => t >= e.take).length;
    if (onTray + out !== log.total || onTray < 0) {
      p.push(`кадр ${t}: салфеток ${onTray + out}`);
      break;
    }
  }
  return p;
};
