// Раскадровка BalaGoLive04Motion: все моменты графики — это начала
// конкретных произнесённых слов (из расшифровки), а не произвольный таймер.
// Склейки исходника найдены ffmpeg (scene > 0.25).
import { findWord } from "../live/sync";
import { LIVE04_WORDS } from "./transcript";
export { LIVE04, live04Timing, type BrandVoice } from "./timing.ts";

const at = (text: string, nth = 0) => findWord(LIVE04_WORDS, text, nth).start;
const end = (text: string, nth = 0) => findWord(LIVE04_WORDS, text, nth).end;

// Ключевые слова → секунды.
export const CUE = {
  // План 1: хук
  balany: at("Баланы"),
  mektepke1: at("мектепке"),
  zhetkiruu: at("жеткирүү"),
  keede: at("кээде"),
  twenty: at("20"),
  munottuk: at("мүнөттүк"),
  ele1: at("эле"),
  ish1: at("иш"),
  emes: at("эмес."),
  emesEnd: end("эмес."),
  // План 2: шаги
  adegende: at("Адегенде"),
  ishinizdi: at("ишиңизди"),
  toktotosuz: at("токтотосуз,"),
  anan: at("анан"),
  zholgo: at("жолго"),
  chygasyz: at("чыгасыз,"),
  mektepke2: at("мектепке", 1),
  zhetesiz: at("жетесиз."),
  // План 3: возвращение и темп
  andan: at("Андан"),
  kayra1: at("кайра"),
  zhe1: at("же"),
  zhumushka: at("жумушка"),
  ozunuzdun: at("өзүңүздүн"),
  ishinizge: at("ишиңизге"),
  kaytyp: at("кайтып,"),
  kayra2: at("кайра", 1),
  oshol: at("ошол"),
  ele2: at("эле", 1),
  tempke: at("темпке"),
  kirish: at("кириш"),
  kerek1: at("керек."),
  kerek1End: end("керек."),
  // План 4: неделя
  munu: at("Муну"),
  bir: at("бир"),
  zholu: at("жолу"),
  kylsanyz: at("кылсаңыз,"),
  ancha: at("анча"),
  bilinbeyt: at("билинбейт."),
  birok: at("Бирок"),
  mektep: at("мектеп"),
  zhumasyna: at("жумасына"),
  besh: at("беш"),
  kun: at("күн."),
  // План 5: решение
  balago: at("BalaGo"),
  ushul: at("ушул"),
  kunumduk: at("күнүмдүк"),
  kattamdy: at("каттамды"),
  ozubuzgo: at("өзүбүзгө"),
  alabyz: at("алабыз:"),
  // План 6: маршрут
  erteng: at("эртең"),
  menen: at("менен"),
  uydon: at("үйдөн"),
  mektepke3: at("мектепке", 2),
  sabaktan: at("сабактан"),
  kiyin: at("кийин", 1),
  kayra3: at("кайра", 2),
  mekteptenn: at("мектептен"),
  uygo: at("үйгө."),
  // План 7: призыв
  eger: at("Эгер"),
  sizge: at("сизге"),
  da: at("да"),
  ushunday: at("ушундай"),
  kyzmat: at("кызмат"),
  kerek2: at("керек", 1),
  bolso: at("болсо,"),
  profil: at("профилдеги"),
  shilteme: at("шилтемеге"),
  otunuz: at("өтүңүз"),
  zhe: at("же", 1),
  tomonku: at("төмөнкү"),
  whatsapp: at("WhatsApp"),
  nomerge: at("номерге"),
  zhazynyz: at("жазыңыз."),
  biz: at("Биз"),
  dayyma: at("дайыма"),
  kyzmattabyz: at("кызматтабыз!"),
  lastWordEnd: end("кызматтабыз!"),
} as const;

