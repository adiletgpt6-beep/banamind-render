// Сцена 4: папа вводит «Бишкек мектеп каттамы», открывает страницу BalaGo:
// поля заявки (үй, мектеп, убакыт); линия страницы переходит в схему
// ҮЙ → МЕКТЕП → ҮЙ. Диктор: «BalaGo — Бишкектеги балдар үчүн алдын ала
// уюштурулган мектеп каттамы. Үйдөн мектепке, сабактан кийин кайра үйгө.»
import { useSceneInfo } from "../context";
import { SearchFlow } from "../screens";
import { wordTime } from "../timeline";

export const searchBeats = (n02From: number, routeFrame: number) => ({
  typeFrom: 4,
  typeTo: Math.max(26, n02From - 22),
  resultsAt: Math.max(30, n02From - 14),
  clickAt: Math.max(42, n02From + 4),
  routeAt: routeFrame,
});

export const SearchScene: React.FC = () => {
  const { f, line, fr } = useSceneInfo("search");
  const n02 = line("n02");
  const routeAt = fr(wordTime(n02.cue, "үйдөн", 0.6)) - 6;
  const b = searchBeats(n02.from, routeAt);
  return <SearchFlow f={f} {...b} />;
};
