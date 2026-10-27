import { fontFamily } from "../fonts";
import { NB_TEXT } from "./script";
import { BRAND, roundRect, wrapText, type ScreenDraw } from "./three/props";

// Экраны телефонов (canvas 540×1140; форма — 720×1520). Крупный шрифт:
// текст должен читаться в вертикальном кадре.

const INK = "#1E2A44";
const MUTED = "#6B778C";

const statusBar = (g: CanvasRenderingContext2D, w: number, time: string, dark = false) => {
  const s = w / 540;
  g.fillStyle = dark ? "#FFFFFF" : INK;
  g.font = `800 ${30 * s}px ${fontFamily}`;
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  g.fillText(time, 36 * s, 58 * s);
  for (let i = 0; i < 4; i++) g.fillRect(w - (150 - i * 14) * s, (52 - i * 6 - 8) * s, 9 * s, (i * 6 + 8) * s);
  g.fillRect(w - 80 * s, 34 * s, 42 * s, 22 * s);
  g.fillRect(w - 38 * s, 40 * s, 4 * s, 10 * s);
};

const bg = (g: CanvasRenderingContext2D, w: number, h: number, c = "#F4F6F9") => {
  g.fillStyle = c;
  g.fillRect(0, 0, w, h);
};

const avatar = (g: CanvasRenderingContext2D, x: number, y: number, r: number, letter: string, color: string) => {
  g.fillStyle = color;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.font = `900 ${r}px ${fontFamily}`;
  g.textAlign = "center";
  g.fillText(letter, x, y + r * 0.36);
  g.textAlign = "left";
};

const chatHeader = (g: CanvasRenderingContext2D, w: number, name: string, color: string) => {
  g.fillStyle = "#FFFFFF";
  g.fillRect(0, 80, w, 110);
  avatar(g, 78, 135, 34, name[0], color);
  g.fillStyle = INK;
  g.font = `900 38px ${fontFamily}`;
  g.textAlign = "left";
  g.fillText(name, 130, 148);
};

// Исходящий звонок / разговор: «Апа», статус или длительность.
export const drawCall = (status: string): ScreenDraw => (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#2B3F66");
  gr.addColorStop(1, "#16223A");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  statusBar(g, w, "07:41", true);
  avatar(g, w / 2, 330, 110, NB_TEXT.call.name[0], "#C98A6B");
  g.fillStyle = "#FFFFFF";
  g.textAlign = "center";
  g.font = `900 64px ${fontFamily}`;
  g.fillText(NB_TEXT.call.name, w / 2, 540);
  g.font = `700 38px ${fontFamily}`;
  g.fillStyle = "#C7D3EA";
  g.fillText(status, w / 2, 600);
  g.fillStyle = "#E5484D";
  g.beginPath();
  g.arc(w / 2, h - 190, 62, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#FFFFFF";
  roundRect(g, w / 2 - 34, h - 198, 68, 18, 9);
  g.fill();
};

// Голосовое сообщение брата: progress 0..1 — проиграно.
export const drawVoiceMsg = (progress: number): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#EEF1F5");
  statusBar(g, w, "07:44");
  chatHeader(g, w, NB_TEXT.brother.name, "#4F7CC9");
  const y = 300;
  roundRect(g, 30, y, w - 110, 150, 34);
  g.fillStyle = "#FFFFFF";
  g.fill();
  // кнопка воспроизведения
  g.fillStyle = "#2F6FDB";
  g.beginPath();
  g.arc(100, y + 62, 40, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#FFFFFF";
  if (progress > 0 && progress < 1) {
    g.fillRect(86, y + 44, 10, 36);
    g.fillRect(104, y + 44, 10, 36);
  } else {
    g.beginPath();
    g.moveTo(90, y + 40);
    g.lineTo(122, y + 62);
    g.lineTo(90, y + 84);
    g.closePath();
    g.fill();
  }
  // волна
  const n = 26;
  for (let i = 0; i < n; i++) {
    const a = Math.abs(Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.53) * 0.4);
    const bh = 12 + a * 52;
    g.fillStyle = i / n <= progress ? "#2F6FDB" : "#C3CCDA";
    roundRect(g, 160 + i * 10.5, y + 62 - bh / 2, 6, bh, 3);
    g.fill();
  }
  g.fillStyle = MUTED;
  g.font = `700 30px ${fontFamily}`;
  g.fillText(NB_TEXT.brother.voice, 64, y + 132);
};

// Переписка с подругой: одно входящее сообщение.
export const drawFriendChat = (shown: boolean): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#EEF1F5");
  statusBar(g, w, "07:45");
  chatHeader(g, w, NB_TEXT.friend.name, "#3FA37A");
  if (!shown) {
    g.fillStyle = MUTED;
    g.font = `700 32px ${fontFamily}`;
    g.fillText("жазып жатат…", 130, 182);
    return;
  }
  g.font = `800 44px ${fontFamily}`;
  const lines = wrapText(g, NB_TEXT.friend.body, w - 150);
  const bw = Math.max(...lines.map((l) => g.measureText(l).width)) + 56;
  const bh = lines.length * 58 + 40;
  roundRect(g, 30, 270, bw, bh, 30);
  g.fillStyle = "#FFFFFF";
  g.fill();
  g.fillStyle = INK;
  lines.forEach((l, i) => g.fillText(l, 58, 334 + i * 58));
  g.fillStyle = MUTED;
  g.font = `700 26px ${fontFamily}`;
  g.fillText("07:45", 58, 270 + bh + 40);
};

// Экран блокировки с пропущенным рабочим уведомлением.
export const drawWorkMissed = (): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#E9EEF5");
  g.fillStyle = INK;
  g.font = `800 120px ${fontFamily}`;
  g.textAlign = "center";
  g.fillText(NB_TEXT.workMissed.time, w / 2, 260);
  roundRect(g, 26, 360, w - 52, 230, 40);
  g.fillStyle = "#FFFFFF";
  g.fill();
  g.fillStyle = "#2D4A7A";
  roundRect(g, 56, 392, 64, 64, 18);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.font = `900 40px ${fontFamily}`;
  g.fillText("Ж", 88, 438);
  g.textAlign = "left";
  g.fillStyle = INK;
  g.font = `800 34px ${fontFamily}`;
  g.fillText(NB_TEXT.workMissed.app, 140, 436);
  g.font = `800 40px ${fontFamily}`;
  const lines = wrapText(g, NB_TEXT.workMissed.body, w - 120);
  lines.forEach((l, i) => g.fillText(l, 56, 520 + i * 50));
};

// Рабочий чат на экране папы (утро): короткое сообщение.
export const drawDadMsg = (): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#EEF1F5");
  statusBar(g, w, "07:38");
  chatHeader(g, w, NB_TEXT.dadMsg.from, "#2D4A7A");
  g.font = `800 42px ${fontFamily}`;
  const lines = wrapText(g, NB_TEXT.dadMsg.body, w - 150);
  const bh = lines.length * 54 + 40;
  roundRect(g, 30, 260, w - 120, bh, 30);
  g.fillStyle = "#FFFFFF";
  g.fill();
  g.fillStyle = INK;
  lines.forEach((l, i) => g.fillText(l, 58, 318 + i * 54));
};

// Страница BalaGo (предварительная запись).
export const drawBalaGoPage = (logo: HTMLImageElement | null): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#FFFFFF");
  statusBar(g, w, "20:14", true);
  g.fillStyle = BRAND.navy;
  g.fillRect(0, 0, w, 600);
  statusBar(g, w, "20:14", true);
  if (logo) g.drawImage(logo, w / 2 - 150, 100, 300, 300);
  g.fillStyle = "#FFFFFF";
  g.font = `900 48px ${fontFamily}`;
  g.textAlign = "center";
  g.fillText(NB_TEXT.cta.tagline, w / 2, 480);
  g.font = `900 34px ${fontFamily}`;
  g.fillStyle = BRAND.yellow;
  g.fillText(NB_TEXT.cta.route, w / 2, 545);
  roundRect(g, 40, 650, w - 80, 90, 45);
  g.fillStyle = "#EEF2FA";
  g.fill();
  g.fillStyle = INK;
  g.font = `800 32px ${fontFamily}`;
  g.fillText(NB_TEXT.cta.status, w / 2, 707);
  roundRect(g, 50, 800, w - 100, 110, 55);
  g.fillStyle = BRAND.yellow;
  g.fill();
  g.fillStyle = BRAND.navy;
  g.font = `900 44px ${fontFamily}`;
  g.fillText(NB_TEXT.cta.button, w / 2, 872);
};

// Форма предварительной заявки (720×1520): k — заполнено полей (0..4,
// дробное — набор текущего), pressed — кнопка нажата, sent — отправлено.
export const drawForm = (k: number, pressed: boolean, sent: boolean): ScreenDraw => (g, w, h) => {
  const f = NB_TEXT.form;
  const s = w / 540;
  bg(g, w, h, "#F4F6F9");
  g.fillStyle = BRAND.navy;
  g.fillRect(0, 0, w, 210 * s);
  statusBar(g, w, "20:16", true);
  g.fillStyle = "#FFFFFF";
  g.font = `900 ${48 * s}px ${fontFamily}`;
  g.textAlign = "left";
  g.fillText(f.title, 34 * s, 160 * s);
  const fields: [string, string][] = [
    [f.name, f.nameValue],
    [f.school, f.schoolValue],
    [f.address, f.addressValue],
    [f.time, f.timeValue],
  ];
  fields.forEach(([label, value], i) => {
    const y = (275 + i * 165) * s;
    g.fillStyle = MUTED;
    g.font = `800 ${32 * s}px ${fontFamily}`;
    g.fillText(label, 36 * s, y);
    roundRect(g, 28 * s, y + 16 * s, w - 56 * s, 96 * s, 22 * s);
    g.fillStyle = "#FFFFFF";
    g.fill();
    g.strokeStyle = k >= i && k < i + 1 && !sent ? "#2F6FDB" : "#D7DDE6";
    g.lineWidth = 4 * s;
    g.stroke();
    const part = Math.max(0, Math.min(1, k - i));
    const shown = value.slice(0, Math.round(value.length * part));
    g.fillStyle = INK;
    g.font = `800 ${38 * s}px ${fontFamily}`;
    g.fillText(shown + (part > 0 && part < 1 ? "|" : ""), 54 * s, y + 80 * s);
  });
  const by = 945 * s;
  roundRect(g, 28 * s, by, w - 56 * s, 112 * s, 56 * s);
  g.fillStyle = sent ? "#2E9E5B" : pressed ? "#E6B000" : BRAND.yellow;
  g.fill();
  g.fillStyle = sent ? "#FFFFFF" : BRAND.navy;
  g.font = `900 ${42 * s}px ${fontFamily}`;
  g.textAlign = "center";
  g.fillText(sent ? "Жөнөтүлдү" : f.send, w / 2, by + 74 * s);
  if (sent) {
    g.fillStyle = INK;
    g.font = `900 ${40 * s}px ${fontFamily}`;
    const lines = wrapText(g, f.sent, w - 80 * s);
    lines.forEach((l, i) => g.fillText(l, w / 2, by + (190 + i * 54) * s));
  }
};

// Рисунок дочки (вечер): дом, солнце, машина, горы.
export const drawDrawing = (k: number): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#FBFAF5");
  g.lineWidth = 8;
  g.lineCap = "round";
  const prog = Math.max(0, Math.min(1, k));
  // горы
  g.strokeStyle = "#5B7BB5";
  g.beginPath();
  g.moveTo(20, 420);
  g.lineTo(140, 230);
  g.lineTo(230, 360);
  g.lineTo(330, 200);
  g.lineTo(480, 420);
  g.stroke();
  // солнце
  g.fillStyle = "#FFC90E";
  g.beginPath();
  g.arc(420, 120, 50, 0, Math.PI * 2);
  g.fill();
  // дом
  g.strokeStyle = "#C0504D";
  g.strokeRect(70, 460, 170, 150);
  g.beginPath();
  g.moveTo(55, 470);
  g.lineTo(155, 380);
  g.lineTo(255, 470);
  g.stroke();
  // школа (дорисовывается)
  if (prog > 0) {
    g.strokeStyle = "#2F6FDB";
    g.beginPath();
    g.moveTo(300, 610);
    g.lineTo(300, 610 - 170 * Math.min(1, prog * 2));
    g.stroke();
    if (prog > 0.5) {
      g.strokeRect(300, 440, 190 * Math.min(1, (prog - 0.5) * 2), 170);
    }
  }
  // дорога
  g.strokeStyle = "#888";
  g.setLineDash([22, 18]);
  g.beginPath();
  g.moveTo(150, 700);
  g.quadraticCurveTo(270, 640, 400, 700);
  g.stroke();
  g.setLineDash([]);
};

// Экран блокировки: только время (мама смотрит, который час).
export const drawLock = (time: string): ScreenDraw => (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#7FA8D6");
  gr.addColorStop(1, "#E9EEF5");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#FFFFFF";
  g.font = `800 150px ${fontFamily}`;
  g.textAlign = "center";
  g.fillText(time, w / 2, 330);
  g.font = `700 38px ${fontFamily}`;
  g.fillText("Шейшемби", w / 2, 400);
};

// Монитор в офисе: список задач.
export const drawMonitor = (time: string): ScreenDraw => (g, w, h) => {
  bg(g, w, h, "#F6F8FB");
  g.fillStyle = "#2D4A7A";
  g.fillRect(0, 0, w, 70);
  g.fillStyle = "#FFFFFF";
  g.font = `800 34px ${fontFamily}`;
  g.textAlign = "left";
  g.fillText("Бүгүнкү тапшырмалар", 28, 47);
  g.textAlign = "right";
  g.fillText(time, w - 28, 47);
  g.textAlign = "left";
  ["Жыйналыш — 08:00", "Отчёт — даярдоо", "Кардарга жооп"].forEach((r, i) => {
    const y = 130 + i * 92;
    roundRect(g, 28, y, w - 56, 74, 14);
    g.fillStyle = "#FFFFFF";
    g.fill();
    g.fillStyle = INK;
    g.font = `800 30px ${fontFamily}`;
    g.fillText(r, 52, y + 47);
  });
};
