# Распознавание кыргызской речи моделью Meta MMS (facebook/mms-1b-all,
# адаптер "kir") для BalaGoHalfHour2D. Технический замер разборчивости:
# доля ошибок по буквам (CER) между распознанным текстом и сценарием.
# Это не проверка на слух: акцент и естественность интонации модель не
# оценивает, но неразборчивые и искажённые слова дают высокий CER.
#
# Режимы:
#   python scripts/asr_mms.py
#       voice-samples/half-hour-2d/asr-targets.json (файл → текст) →
#       voice-samples/half-hour-2d/asr-mms.json; уже распознанные файлы
#       (тот же SHA-1) повторно не обрабатываются.
#   python scripts/asr_mms.py --score in.json out.json
#       in.json: [{"path": …, "text": …}, …] → out.json: [{"path", "heard",
#       "cer"}, …] — для отбора лучшего дубля реплики при озвучке.
import hashlib
import json
import os
import re
import subprocess
import sys

ROOT = "voice-samples/half-hour-2d"
TARGETS = os.path.join(ROOT, "asr-targets.json")
OUT = os.path.join(ROOT, "asr-mms.json")


def norm(s: str) -> str:
    s = s.lower().replace("balago", "балаго").replace("ё", "е")
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def lev(a: str, b: str) -> int:
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def cer(ref: str, hyp: str) -> float:
    r, h = norm(ref), norm(hyp)
    return round(lev(r, h) / max(1, len(r)), 3)


_model = None


def recognizer():
    global _model
    if _model is None:
        import torch
        from transformers import AutoProcessor, Wav2Vec2ForCTC

        model_id = "facebook/mms-1b-all"
        processor = AutoProcessor.from_pretrained(model_id, target_lang="kir")
        model = Wav2Vec2ForCTC.from_pretrained(model_id, target_lang="kir", ignore_mismatched_sizes=True)
        model.eval()
        _model = (processor, model, torch)
    return _model


def transcribe(path: str) -> str:
    import numpy as np

    processor, model, torch = recognizer()
    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
        check=True,
        capture_output=True,
    ).stdout
    audio = np.frombuffer(raw, dtype=np.float32)
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        logits = model(**inputs).logits
    return processor.decode(torch.argmax(logits, dim=-1)[0])


def score(inp: str, out: str) -> None:
    items = json.load(open(inp, encoding="utf-8"))
    res = []
    for it in items:
        heard = transcribe(it["path"])
        res.append({"path": it["path"], "heard": heard, "cer": cer(it["text"], heard)})
        print(f"  {os.path.basename(it['path'])}: CER {res[-1]['cer']} — «{heard}»")
    json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)


def main() -> None:
    if len(sys.argv) == 4 and sys.argv[1] == "--score":
        score(sys.argv[2], sys.argv[3])
        return
    if not os.path.exists(TARGETS):
        print("Нет asr-targets.json — распознавать нечего.")
        return
    targets = json.load(open(TARGETS, encoding="utf-8"))
    out = json.load(open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {}
    todo = []
    for path, text in targets.items():
        if not os.path.exists(path):
            continue
        sha = hashlib.sha1(open(path, "rb").read()).hexdigest()[:16]
        if out.get(path, {}).get("sha") == sha and out[path].get("expected") == text:
            continue
        todo.append((path, text, sha))
    print(f"Распознавание MMS: {len(todo)} новых из {len(targets)}")
    for path, text, sha in todo:
        heard = transcribe(path)
        out[path] = {"sha": sha, "expected": text, "heard": heard, "cer": cer(text, heard)}
        print(f"  {path}: CER {out[path]['cer']} — «{heard}»")
        json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
