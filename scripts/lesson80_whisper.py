# Второе независимое распознавание озвучки LESSON-80 (Whisper, faster-whisper):
# текст, доля ошибок по буквам (CER) относительно сценария и вероятность
# каждого слова. Слова с низкой вероятностью — кандидаты на перезапись дубля
# (неразборчиво, смазанное окончание, неверное ударение часто дают низкую
# уверенность). Это технический замер, не прослушивание человеком.
#
#   python scripts/lesson80_whisper.py in.json out.json [model]
#       in.json: [{"id", "path", "text", "seed"?}, …] → out.json: [{"id", "heard", "cer", "words": [{"w", "p"}], "low": [...], "seed"?}]
import json
import sys

sys.path.insert(0, "scripts")
from lesson80_asr import cer  # noqa: E402


def main() -> None:
    inp, out = sys.argv[1], sys.argv[2]
    name = sys.argv[3] if len(sys.argv) > 3 else "medium"
    from faster_whisper import WhisperModel

    model = WhisperModel(name, device="cpu", compute_type="int8")
    items = json.load(open(inp, encoding="utf-8"))
    res = []
    for it in items:
        segs, _ = model.transcribe(it["path"], language="ru", beam_size=5, word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
        words = []
        heard = []
        for s in segs:
            heard.append(s.text.strip())
            for w in s.words or []:
                words.append({"w": w.word.strip(), "p": round(float(w.probability), 3)})
        text = " ".join(heard).strip()
        low = [w for w in words if w["p"] < 0.5]
        r = {"id": it["id"], "heard": text, "cer": cer(it["text"], text), "words": words, "low": low}
        if it.get("seed") is not None:
            r["seed"] = it["seed"]
        res.append(r)
        flag = " ⚠ " + ", ".join(f"{w['w']}({w['p']})" for w in low) if low else ""
        print(f"№{it['id']:02d} CER {r['cer']:<5} «{text}»{flag}", flush=True)
    json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
