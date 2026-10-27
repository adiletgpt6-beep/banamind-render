# Распознавание кыргызской озвучки ролика 80-1-3 (кыргызская версия) моделью
# Meta MMS (facebook/mms-1b-all, адаптер "kir") — той же, что проверяет озвучку
# роликов BalaGo (scripts/ts2d_asr.py): сырые дубли и готовые файлы реплик,
# доля ошибок по буквам (CER) относительно текста и медиана основного тона.
# Это технический замер распознавателем, а не прослушивание человеком:
# акцент и интонацию модель не оценивает, но пропущенные, обрезанные и
# искажённые слова дают высокий CER.
#
# Кэш по SHA-1 файла: public/audio/lesson80-1-3-ky/stt/<sha1>.json
#   python3 scripts/lesson80-1-3-ky-asr.py           — распознать новые файлы (CI; нужен torch)
#   python3 scripts/lesson80-1-3-ky-asr.py --report  — сводка по кэшу (без модели)
import hashlib
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ts2d_asr import cer, load, median_f0  # noqa: E402

DIR = "public/audio/lesson80-1-3-ky"
RAW = os.path.join(DIR, "raw")
OUT = os.path.join(DIR, "stt")


def sha(p: str) -> str:
    return hashlib.sha1(open(p, "rb").read()).hexdigest()[:16]


def targets():
    t = []
    if os.path.isdir(RAW):
        for f in sorted(os.listdir(RAW)):
            if not f.endswith(".json"):
                continue
            meta = json.load(open(os.path.join(RAW, f), encoding="utf-8"))
            mp3 = os.path.join(RAW, f[:-5] + ".mp3")
            if not os.path.exists(mp3):
                continue
            expected = (meta["lead"] + " " if meta.get("lead") else "") + meta["text"] + " " + meta["pad"]
            t.append({"kind": "take", "file": mp3, "id": meta["segId"], "take": meta["take"], "voice": meta["voice"], "key": f[:-5], "expected": expected})
    man = os.path.join(DIR, "manifest.json")
    if os.path.exists(man):
        for line in json.load(open(man, encoding="utf-8"))["lines"]:
            p = os.path.join(DIR, line["file"])
            if os.path.exists(p):
                t.append({"kind": "line", "file": p, "id": line["segId"], "take": line.get("take"), "voice": line.get("voice"), "key": None, "expected": line["text"]})
    return t


def report():
    rows = []
    for t in targets():
        p = os.path.join(OUT, sha(t["file"]) + ".json")
        if os.path.exists(p):
            r = json.load(open(p, encoding="utf-8"))
            rows.append({**t, "heard": r["heard"], "cer": cer(t["expected"], r["heard"]), "f0": r.get("f0")})
    rows.sort(key=lambda r: (r["id"], r["kind"] != "line", r["voice"] or "", r["take"] if r["take"] is not None else -1))
    for r in rows:
        mark = "!!" if r["cer"] >= 0.08 else "  "
        who = "ФАЙЛ" if r["kind"] == "line" else f"{r['voice']} t{r['take']}"
        print(f"{mark} {r['id']} {who:30s} CER {r['cer']:.3f} F0 {r['f0']} | {r['heard']}")
    os.makedirs("out", exist_ok=True)
    json.dump(rows, open("out/lesson80-1-3-ky-asr-report.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def main():
    if "--report" in sys.argv:
        report()
        return
    os.makedirs(OUT, exist_ok=True)
    todo = [t for t in targets() if not os.path.exists(os.path.join(OUT, sha(t["file"]) + ".json"))]
    print(f"Распознать: {len(todo)}")
    if not todo:
        return
    from ts2d_asr import transcribe  # noqa: E402 — модель загружается только здесь

    for t in todo:
        audio = load(t["file"])
        heard = transcribe(audio)
        res = {"file": t["file"], "id": t["id"], "take": t["take"], "voice": t["voice"], "kind": t["kind"], "model": "mms-1b-all/kir", "heard": heard, "cer": cer(t["expected"], heard), "f0": median_f0(audio)}
        json.dump(res, open(os.path.join(OUT, sha(t["file"]) + ".json"), "w", encoding="utf-8"), ensure_ascii=False)
        print(f"✓ {t['id']} {t['kind']} {t['voice']} t{t['take']}: CER {res['cer']} — {heard}", flush=True)


if __name__ == "__main__":
    main()
