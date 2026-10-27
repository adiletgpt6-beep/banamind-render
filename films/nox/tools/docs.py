"""Generate the readable screenplay (NOX_script_RU.md), storyboard and timeline from the canonical
script + the final narration timing.

  python3 docs.py   (writes films/nox/release/NOX_script_RU.md, films/nox/docs/storyboard.md,
                     films/nox/docs/timeline.json)"""
import json
import os
import sys

HERE = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(HERE, "..", "engine"))
import film  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, ".."))


def mmss(t):
    return f"{int(t // 60):02d}:{t % 60:05.2f}"


def main():
    T = film.Timing()
    # literary screenplay for reading
    lines = ["# НОКС — ЦЕНА БЕСКОНЕЧНОГО «ЕЩЁ»", "",
             "Полный литературный сценарий анимационного фильма (30:00, 16:9, русская озвучка).",
             "Нокс — вымышленный герой; суммы условные. Время — начало речи блока в финальном фильме.", ""]
    for ch in T.chapters:
        c0 = (ch["index"] - 1) * 120
        lines += [f"## Глава {ch['index']:02d}. {ch['title']}  ·  {mmss(c0)[:5]}–{mmss(c0 + 120)[:5]}", ""]
        if ch["notes"]:
            lines += [f"*{ch['notes']}*", ""]
        for b in ch["blocks"]:
            bb = T.blocks[b["id"]]
            lines += [f"**{b['id']}** · {mmss(bb['start'])}", ""]
            if b["visual"]:
                lines += [f"> Кадр: {b['visual']}", ""]
            lines += [b["text"], ""]
    lines += ["---", "", "Нокс и все ситуации вымышлены; расчёты условные; фильм не является инвестиционной рекомендацией."]
    os.makedirs(os.path.join(ROOT, "release"), exist_ok=True)
    open(os.path.join(ROOT, "release", "NOX_script_RU.md"), "w", encoding="utf-8").write("\n".join(lines) + "\n")

    # storyboard: shot id, chapter, interval, speech, visual action, exit
    sb = ["# Раскадровка (storyboard)", "",
          "Планы = смысловые блоки сценария; внутри блока действие расписано в коде главы "
          "`engine/scenes/chNN.py` (ключевые кадры, привязанные к словам речи). Интервал — от начала речи блока "
          "до начала следующего блока.", "",
          "| План | Интервал | Речь (начало) | Главный предмет и действие | Проверка смысла |", "|---|---|---|---|---|"]
    ids = sorted(T.blocks, key=lambda k: T.blocks[k]["start"])
    for i, bid in enumerate(ids):
        b = T.blocks[bid]
        nxt = T.blocks[ids[i + 1]]["start"] if i + 1 < len(ids) else film.TOTAL
        vis = next(x["visual"] for c in T.chapters for x in c["blocks"] if x["id"] == bid)
        words = b["text"].split()
        sb.append(f"| {bid} | {mmss(b['start'])}–{mmss(nxt)} | {' '.join(words[:8])}… | {vis} | "
                  f"кадр соответствует фразе; подписи 2–6 слов |")
    open(os.path.join(ROOT, "docs", "storyboard.md"), "w", encoding="utf-8").write("\n".join(sb) + "\n")

    tl = {"fps": film.FPS, "frames": int(film.TOTAL * film.FPS), "duration": film.TOTAL, "estimated": T.estimated,
          "chapters": [{"id": c["id"], "title": c["title"], "start": (c["index"] - 1) * 120.0,
                        "frames": [(c["index"] - 1) * 3600, c["index"] * 3600 - 1]} for c in T.chapters],
          "blocks": [{"id": k, "start": round(T.blocks[k]["start"], 3), "end": round(T.blocks[k]["end"], 3),
                      "frame_start": int(T.blocks[k]["start"] * film.FPS),
                      "frame_end": int(T.blocks[k]["end"] * film.FPS)} for k in ids],
          "speech_per_chapter": T.report}
    json.dump(tl, open(os.path.join(ROOT, "docs", "timeline.json"), "w"), ensure_ascii=False, indent=1)
    print("ok; estimated timing" if T.estimated else "ok")


if __name__ == "__main__":
    main()
