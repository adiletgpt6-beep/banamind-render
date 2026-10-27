import { fontFamily } from "../fonts";
import { HH_TEXT } from "./script";
import { BRAND, roundRect, wrapText, type ScreenDraw } from "./three/props";

// Экраны телефонов, монитора и телевизора (canvas 540×1140 для телефона).
// Крупный шрифт: текст должен читаться на вертикальном видео.

const INK = "#1E2A44";
const MUTED = "#6B778C";

const statusBar = (g: CanvasRenderingContext2D, w: number, time: string, dark = false) => {
  g.fillStyle = dark ? "#FFFFFF" : INK;
  g.font = `800 30px ${fontFamily}`;
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  g.fillText(time, 36, 58);
  // сигнал и батарея — фигурами (без символов шрифта)
  for (let i = 0; i < 4; i++) g.fillRect(w - 150 + i * 14, 52 - i * 6 - 8, 9, i * 6 + 8);
  g.fillRect(w - 80, 34, 42, 22);
  g.fillRect(w - 38, 40, 4, 10);
};

const bg = (g: CanvasRenderingContext2D, w: number, h: number, c = "#F4F6F9") => {
  g.fillStyle = c;
  g.fillRect(0, 0, w, h);
};

// Экран блокировки с напоминанием.
export const drawReminder = (time: string): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#E9EEF5");
  statusBar(g, w, "");
  g.fillStyle = INK;
  g.font = `800 120px ${fontFamily}`;
  g.textAlign = "center";
  g.fillText(time, w / 2, 260);
  roundRect(g, 26, 360, w - 52, 290, 40);
  g.fillStyle = "#FFFFFF";
  g.fill();
  g.fillStyle = BRAND.yellow;
  roundRect(g, 56, 392, 64, 64, 18);
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 5;
  g.beginPath();
  g.arc(88, 424, 18, 0, Math.PI * 2);
  g.moveTo(88, 424);
  g.lineTo(88, 412);
  g.moveTo(88, 424);
  g.lineTo(97, 428);
  g.stroke();
  g.fillStyle = INK;
  g.textAlign = "left";
  g.font = `800 34px ${fontFamily}`;
  g.fillText(HH_TEXT.reminder.title, 140, 436);
  g.font = `800 44px ${fontFamily}`;
  g.fillText("Уулумдун сабагы", 56, 530);
  g.fillText(`бүтөт — ${HH_TEXT.reminder.time}`, 56, 590);
};

// Переписка «Уулум» ↔ мама. side: "son" — экран сына (его сообщения справа),
// "mom" — экран мамы. typed — набираемый текст (с курсором), sent — отправлено.
export const drawChat = (o: { side: "son" | "mom"; time: string; inShown: boolean; typed: string; sent: boolean; outText?: string }): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#EEF1F5");
  statusBar(g, w, o.time);
  g.fillStyle = "#FFFFFF";
  g.fillRect(0, 80, w, 110);
  g.fillStyle = "#D7DDE6";
  g.beginPath();
  g.arc(78, 135, 34, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = INK;
  g.font = `900 38px ${fontFamily}`;
  g.textAlign = "left";
  g.fillText(o.side === "son" ? "Апа" : HH_TEXT.chat.name, 130, 148);
  const bubble = (text: string, right: boolean, y: number) => {
    g.font = `800 42px ${fontFamily}`;
    const lines = wrapText(g, text, w - 180);
    const bw = Math.max(...lines.map((l) => g.measureText(l).width)) + 56;
    const bh = lines.length * 54 + 34;
    const x = right ? w - 30 - bw : 30;
    roundRect(g, x, y, bw, bh, 30);
    g.fillStyle = right ? "#2F6FDB" : "#FFFFFF";
    g.fill();
    g.fillStyle = right ? "#FFFFFF" : INK;
    lines.forEach((l, i) => g.fillText(l, x + 28, y + 58 + i * 54));
    return y + bh + 22;
  };
  let y = 250;
  if (o.inShown) y = bubble(HH_TEXT.chat.in, o.side === "son", y);
  const out = o.outText ?? HH_TEXT.chat.out;
  if (o.sent) bubble(out, o.side === "mom", y);
  // поле ввода
  g.fillStyle = "#FFFFFF";
  g.fillRect(0, h - 150, w, 150);
  roundRect(g, 24, h - 126, w - 48, 84, 42);
  g.fillStyle = "#EEF1F5";
  g.fill();
  g.font = `700 36px ${fontFamily}`;
  g.fillStyle = o.typed ? INK : MUTED;
  g.fillText(o.typed ? `${o.typed}|` : "Билдирүү…", 56, h - 72);
};

// Пропущенные звонки (экран блокировки).
export const drawMissed = (time: string): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#E9EEF5");
  g.fillStyle = INK;
  g.font = `800 120px ${fontFamily}`;
  g.textAlign = "center";
  g.fillText(time, w / 2, 260);
  roundRect(g, 26, 360, w - 52, 220, 40);
  g.fillStyle = "#FFFFFF";
  g.fill();
  g.fillStyle = "#E5484D";
  g.beginPath();
  g.arc(88, 424, 30, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.font = `900 40px ${fontFamily}`;
  g.fillText("3", 88, 438);
  g.textAlign = "left";
  g.fillStyle = INK;
  g.font = `800 32px ${fontFamily}`;
  g.fillText("Телефон", 136, 436);
  g.font = `800 42px ${fontFamily}`;
  g.fillText("3 кабыл алынбаган", 56, 506);
  g.fillText("чалуу", 56, 556);
};

// Часы в держателе в машине (навигатор/часы).
export const drawCarClock = (time: string): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#16202E");
  g.fillStyle = "#FFFFFF";
  g.font = `800 150px ${fontFamily}`;
  g.textAlign = "center";
  g.fillText(time, w / 2, 470);
  g.font = `700 40px ${fontFamily}`;
  g.fillStyle = "#9FB3CC";
  g.fillText("Мектепке чейин 2,1 км", w / 2, 560);
  roundRect(g, 60, 640, w - 120, 16, 8);
  g.fillStyle = "#2B3A52";
  g.fill();
  roundRect(g, 60, 640, (w - 120) * 0.45, 16, 8);
  g.fillStyle = "#FF9F43";
  g.fill();
};

// Монитор: список задач (утро/после обеда).
export const drawMonitor = (o: { time: string; progress: number; overdue?: boolean }): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#F6F8FB");
  g.fillStyle = "#2D4A7A";
  g.fillRect(0, 0, w, 70);
  g.fillStyle = "#FFFFFF";
  g.font = `800 34px ${fontFamily}`;
  g.textAlign = "left";
  g.fillText("Иштердин тизмеси", 28, 47);
  g.textAlign = "right";
  g.fillText(o.time, w - 28, 47);
  g.textAlign = "left";
  const rows = ["Келишимди текшерүү", "Айлык отчет", "Кардарга жооп"];
  rows.forEach((r, i) => {
    const y = 130 + i * 92;
    roundRect(g, 28, y, w - 56, 74, 14);
    g.fillStyle = "#FFFFFF";
    g.fill();
    g.fillStyle = INK;
    g.font = `800 30px ${fontFamily}`;
    g.fillText(r, 52, y + 47);
    if (i === 1) {
      g.fillStyle = o.overdue ? "#E5484D" : "#FF9F43";
      g.font = `800 26px ${fontFamily}`;
      g.textAlign = "right";
      g.fillText(HH_TEXT.task.replace("Тапшырма: ", ""), w - 52, y + 46);
      g.textAlign = "left";
      roundRect(g, 52, y + 60, (w - 104) * o.progress, 6, 3);
      g.fill();
    }
  });
};

// Видеозвонок с клиентом (ТВ в переговорной): talk 0..1 — открытый рот.
export const drawCall = (talk: number): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#283445");
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#3D5068");
  gr.addColorStop(1, "#1F2A38");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  // клиент: силуэт с лицом
  g.fillStyle = "#4E5D73";
  g.beginPath();
  g.ellipse(w / 2, h * 0.95, w * 0.2, h * 0.32, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = "#D9AE8C";
  g.beginPath();
  g.ellipse(w / 2, h * 0.42, w * 0.075, h * 0.17, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#2A211D";
  g.beginPath();
  g.ellipse(w / 2, h * 0.31, w * 0.08, h * 0.08, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = "#3A2622";
  g.beginPath();
  g.ellipse(w / 2, h * 0.5, w * 0.02, h * (0.008 + talk * 0.02), 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#1B2430";
  g.fillRect(0, h - 64, w, 64);
  g.fillStyle = "#FFFFFF";
  g.font = `800 30px ${fontFamily}`;
  g.textAlign = "left";
  g.fillText("Кардар · видеочалуу", 24, h - 22);
  g.fillStyle = "#E5484D";
  g.beginPath();
  g.arc(w - 40, h - 32, 12, 0, Math.PI * 2);
  g.fill();
};

// Страница BalaGo в телефоне мужа.
export const drawBalaGoPage = (logo: HTMLImageElement | null): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#FFFFFF");
  statusBar(g, w, "20:14");
  g.fillStyle = BRAND.navy;
  g.fillRect(0, 80, w, 520);
  if (logo) g.drawImage(logo, w / 2 - 150, 120, 300, 300);
  g.fillStyle = "#FFFFFF";
  g.font = `900 46px ${fontFamily}`;
  g.textAlign = "center";
  g.fillText(HH_TEXT.cta.tagline, w / 2, 490);
  g.font = `800 32px ${fontFamily}`;
  g.fillStyle = BRAND.yellow;
  g.fillText(HH_TEXT.cta.route, w / 2, 550);
  g.fillStyle = INK;
  g.font = `800 34px ${fontFamily}`;
  g.fillText(HH_TEXT.cta.status, w / 2, 680);
  roundRect(g, 50, 740, w - 100, 110, 55);
  g.fillStyle = BRAND.yellow;
  g.fill();
  g.fillStyle = BRAND.navy;
  g.font = `900 42px ${fontFamily}`;
  g.fillText(HH_TEXT.cta.button, w / 2, 810);
};

// Форма предварительной заявки: k — сколько полей заполнено (0..3, дробное
// — набор текущего поля), sent — отправлено.
export const drawForm = (k: number, sent: boolean, pressed: boolean): ScreenDraw => (g, w, h) => {
  const f = HH_TEXT.form;
  bg(g, w, h, "#F4F6F9");
  statusBar(g, w, "20:16");
  g.fillStyle = BRAND.navy;
  g.fillRect(0, 80, w, 120);
  g.fillStyle = "#FFFFFF";
  g.font = `900 44px ${fontFamily}`;
  g.textAlign = "left";
  g.fillText(f.title, 36, 156);
  const fields: [string, string][] = [
    [f.school, f.schoolValue],
    [f.address, f.addressValue],
    [f.time, f.timeValue],
  ];
  fields.forEach(([label, value], i) => {
    const y = 250 + i * 190;
    g.fillStyle = MUTED;
    g.font = `800 32px ${fontFamily}`;
    g.fillText(label, 36, y);
    roundRect(g, 30, y + 20, w - 60, 100, 22);
    g.fillStyle = "#FFFFFF";
    g.fill();
    g.strokeStyle = k >= i && k < i + 1 && !sent ? "#2F6FDB" : "#D7DDE6";
    g.lineWidth = 4;
    g.stroke();
    const part = Math.max(0, Math.min(1, k - i));
    const shown = value.slice(0, Math.round(value.length * part));
    g.fillStyle = INK;
    g.font = `800 36px ${fontFamily}`;
    g.fillText(shown + (part > 0 && part < 1 ? "|" : ""), 56, y + 84);
  });
  roundRect(g, 30, 830, w - 60, 110, 55);
  g.fillStyle = sent ? "#2E9E5B" : pressed ? "#E6B000" : BRAND.yellow;
  g.fill();
  g.fillStyle = sent ? "#FFFFFF" : BRAND.navy;
  g.font = `900 40px ${fontFamily}`;
  g.textAlign = "center";
  g.fillText(sent ? "Жөнөтүлдү" : f.send, w / 2, 900);
  if (sent) {
    g.fillStyle = INK;
    g.font = `800 32px ${fontFamily}`;
    const lines = wrapText(g, f.sent, w - 80);
    lines.forEach((l, i) => g.fillText(l, w / 2, 1010 + i * 44));
  }
};
