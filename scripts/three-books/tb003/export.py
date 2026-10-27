"""Viewer texts and the measured timeline of TB-003.

  python3 export.py OUTDIR
writes OUTDIR/TB003_script_RU.txt (final spoken text, no service headings), OUTDIR/TB003_youtube_RU.txt
(five titles, description, chapters with the measured timecodes) and three-books/episodes/TB-003/TIMELINE.json."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "src", "three-books", "tb003", "engine"))
import film  # noqa: E402
import script  # noqa: E402

TITLES = [
    "Ты создал своё дело — или вторую работу?",
    "Почему без тебя всё останавливается",
    "Он стал незаменимым. И попал в ловушку",
    "Почему большая выручка ещё не означает свободу",
    "Он перестал ждать уверенности — и сделал следующий шаг",
]
CHAPTER_NAMES = ["Смена ждёт одного человека", "Выбрать раз и навсегда", "Кто здесь выполняет работу?",
                 "Возможность вне привычного круга", "Инструкция есть, решения нет", "Право решать и право остановиться",
                 "Сколько стоит самостоятельность команды", "Команда умеет сказать «стоп»",
                 "Следующий профессиональный шаг"]


def mmss(t):
    t = int(t)
    return f"{t // 60:02d}:{t % 60:02d}"


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    T = film.Timing()
    parts = T.parts
    with open(os.path.join(out, "TB003_script_RU.txt"), "w", encoding="utf-8") as f:
        f.write("Ты создал своё дело — или вторую работу?\nАвторская история из цветных частиц. Итоговый текст русской озвучки.\n\n")
        for p in parts:
            f.write(f"{mmss(T.part_times[p['id']])} — {p['title']}\n\n")
            for b in p["blocks"]:
                f.write(b["text"] + "\n\n")
    chapters = [(T.part_times[p["id"]], n) for p, n in zip(parts, CHAPTER_NAMES)]
    with open(os.path.join(out, "TB003_youtube_RU.txt"), "w", encoding="utf-8") as f:
        f.write("НАЗВАНИЯ (5 вариантов; фаворит — №1)\n")
        for i, t in enumerate(TITLES, 1):
            f.write(f"{i}. {t}\n")
        f.write("\nОПИСАНИЕ\n")
        f.write("Рин хотел построить своё дело, но каждый следующий шаг требовал его личного ответа. Учебная смена "
                "без подсказок показала причину: людям передали работу, но не право решать.\n\n")
        f.write("Авторская история из цветных частиц о профессиональном выборе, опыте, оплате команды и "
                "ответственности. Персонажи, события и расчёты вымышлены. История не обещает дохода без труда и не "
                "определяет единственно правильный карьерный путь.\n\n")
        f.write("ГЛАВЫ\n")
        for t, n in chapters:
            f.write(f"{mmss(t)} {n}\n")
        f.write("\nКакой участок вашей работы сейчас ждёт решения только одного человека?\n")
        f.write("\nОбложки: обложка N соответствует названию N (1–5).\n")
    tl = T.timeline()
    tl["chapters"] = [{"start": round(t, 3), "mmss": mmss(t), "title": n} for t, n in chapters]
    ep = os.path.join(HERE, "..", "..", "..", "three-books", "episodes", "TB-003", "TIMELINE.json")
    json.dump(tl, open(ep, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("chapters:", ", ".join(f"{mmss(t)} {n}" for t, n in chapters))
    print("estimated blocks:", tl["estimated_blocks"], "slack", tl["slack_s"])


if __name__ == "__main__":
    main()
