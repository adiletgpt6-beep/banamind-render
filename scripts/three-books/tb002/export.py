"""Viewer texts and the measured timeline of TB-002.

  python3 export.py OUTDIR
writes OUTDIR/TB002_script_RU.txt (final spoken text, no service headings), OUTDIR/TB002_youtube_RU.txt
(five titles, description, chapters with the measured timecodes) and three-books/episodes/TB-002/TIMELINE.json."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "src", "three-books", "tb002", "engine"))
import film  # noqa: E402
import script  # noqa: E402

TITLES = [
    "Почему у тебя не покупают — даже если ты очень стараешься",
    "Красивую вещь никто не купил. Вот что изменило всё",
    "Твой продукт нужен людям? История двух первых заказов",
    "Он убрал почти всё — и понял, за что готовы платить",
    "Почему простая верёвка оказалась полезнее изобретения",
]
CHAPTER_NAMES = ["Ноль покупок", "Вещь, в которую вложено слишком много", "По другую сторону витрины",
                 "Что оставить", "Понятное предложение", "Проверка, которая всё меняет", "Цена и затраты",
                 "Место встречи", "Что показали два заказа", "Большое предложение", "Следующий честный вопрос"]


def mmss(t):
    t = int(t)
    return f"{t // 60:02d}:{t % 60:02d}"


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    T = film.Timing()
    parts = T.parts
    with open(os.path.join(out, "TB002_script_RU.txt"), "w", encoding="utf-8") as f:
        f.write("Почему у тебя не покупают\nАвторская история из цветных частиц. Итоговый текст русской озвучки.\n\n")
        for p in parts:
            f.write(f"{mmss(T.part_times[p['id']])} — {p['title']}\n\n")
            for b in p["blocks"]:
                f.write(b["text"] + "\n\n")
    chapters = [(T.part_times[p["id"]], n) for p, n in zip(parts, CHAPTER_NAMES)]
    with open(os.path.join(out, "TB002_youtube_RU.txt"), "w", encoding="utf-8") as f:
        f.write("НАЗВАНИЯ (5 вариантов; фаворит — №1)\n")
        for i, t in enumerate(TITLES, 1):
            f.write(f"{i}. {t}\n")
        f.write("\nОПИСАНИЕ\n")
        f.write("Тико сделал красивую вещь, но люди проходили мимо. Разгадка нашлась у обычной двери: покупателю был "
                "нужен результат, который изобретатель ещё не заметил.\n\n")
        f.write("Авторская история из цветных частиц о полезном продукте, понятных словах, цене и первых заказах. "
                "Персонажи, станция и расчёты вымышлены. Два заказа в этой истории не обещают такой же результат "
                "вашему делу.\n\n")
        f.write("ГЛАВЫ\n")
        for t, n in chapters:
            f.write(f"{mmss(t)} {n}\n")
        f.write("\nВопрос к зрителю: какую задачу решает ваша идея — и как человек справляется с ней сейчас?\n")
        f.write("\nОбложки: 1 «Почему не покупают?» → название 1; 2 «Шнур победил?» → 5; 3 «Слова не спасут» → 2; "
                "4 «Что здесь лишнее?» → 4; 5 «2 заказа» → 3.\n")
    tl = T.timeline()
    tl["chapters"] = [{"start": round(t, 3), "mmss": mmss(t), "title": n} for t, n in chapters]
    ep = os.path.join(HERE, "..", "..", "..", "three-books", "episodes", "TB-002", "TIMELINE.json")
    json.dump(tl, open(ep, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("chapters:", ", ".join(f"{mmss(t)} {n}" for t, n in chapters))
    print("estimated blocks:", tl["estimated_blocks"], "slack", tl["slack_s"])


if __name__ == "__main__":
    main()
