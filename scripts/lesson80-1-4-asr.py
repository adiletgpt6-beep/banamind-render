# Проверка озвучки ролика 80-1-4 распознаванием речи (CI, CPU).
#
# OpenAI-распознавание недоступно (нет кредитов), у ключа ElevenLabs нет права
# speech_to_text — поэтому в CI работает открытая модель Whisper large-v3
# (faster-whisper, int8, без подсказок и без ожидаемого текста). Проверяются:
#   • каждый сырой дубль (public/audio/lesson80-1-4/raw/*.mp3) — по нему
#     выбираются дубли (scripts/lesson80-1-4-pick.mjs);
#   • каждый готовый файл реплики (public/audio/lesson80-1-4/80-1-4-0NN.mp3) —
#     то, что звучит в фильме.
# Для каждого — распознанный текст, доля ошибок по буквам (CER) относительно
# сценария и медиана основного тона (F0, Гц). Это машинный замер
# разборчивости и текста, а не прослушивание человеком.
#
#   python3 scripts/lesson80-1-4-asr.py docs/lesson80-1-4/voice-asr.json [--shard i/n --part out.json]
#   python3 scripts/lesson80-1-4-asr.py docs/lesson80-1-4/voice-asr.json --merge part1.json part2.json …
# В CI работа делится на n параллельных задач (--shard): каждая распознаёт свою
# часть и пишет её в --part; затем --merge сводит части в общий файл.
#
# Кыргызская версия (--lang ky или A4_LANG=ky): дубли и реплики из
# public/audio/lesson80-1-4-ky, результат — docs/lesson80-1-4/voice-asr.ky.json.
# Whisper кыргызский не поддерживает — распознаёт Meta MMS (facebook/mms-1b-all,
# адаптер "kir"), как в кыргызских роликах проекта (scripts/ts2d_asr.py).
import json
import os
import re
import subprocess
import sys

ARGS = sys.argv[1:]
LANG = ARGS[ARGS.index("--lang") + 1] if "--lang" in ARGS else os.environ.get("A4_LANG", "ru")
if LANG not in ("ru", "ky"):
    sys.exit(f"неизвестный язык: {LANG}")
DIR = "public/audio/lesson80-1-4" + ("" if LANG == "ru" else "-" + LANG)
RAW = DIR + "/raw"
OUT = ARGS[0] if ARGS and not ARGS[0].startswith("--") else ("docs/lesson80-1-4/voice-asr.json" if LANG == "ru" else f"docs/lesson80-1-4/voice-asr.{LANG}.json")


def opt(name):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else None


def save(db, path):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w") as f:
        json.dump(db, f, ensure_ascii=False, indent=1)
PAD = "хорошо" if LANG == "ru" else "жакшы"


def norm(s):
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def lev(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def cer(ref, hyp):
    r, h = norm(ref), norm(hyp)
    return round(lev(r, h) / max(1, len(r)), 3)


def load(path):
    import numpy as np  # только для распознавания (сведение частей обходится без numpy)

    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def median_f0(a):
    import numpy as np

    sr, win, hop = 16000, 640, 160
    lo, hi = sr // 500, sr // 65
    rms = np.sqrt(np.mean(a**2) + 1e-12)
    out = []
    for i in range(0, len(a) - win, hop):
        fr = a[i : i + win] * np.hanning(win)
        if np.sqrt(np.mean(fr**2)) < rms * 0.5:
            continue
        c = np.correlate(fr, fr, "full")[win - 1 :]
        if c[0] <= 0:
            continue
        k = lo + int(np.argmax(c[lo:hi]))
        if c[k] / c[0] > 0.45:
            out.append(sr / k)
    return round(float(np.median(out)), 1) if out else 0.0


def mms_kir():
    """Распознаватель кыргызской речи: Meta MMS (CTC, без языковой модели —
    слышит буквы, а не «додумывает» фразы)."""
    import torch
    from transformers import AutoProcessor, Wav2Vec2ForCTC

    model_id = "facebook/mms-1b-all"
    processor = AutoProcessor.from_pretrained(model_id, target_lang="kir")
    model = Wav2Vec2ForCTC.from_pretrained(model_id, target_lang="kir", ignore_mismatched_sizes=True)
    model.eval()
    torch.set_num_threads(os.cpu_count() or 4)

    def run(audio):
        inputs = processor(audio, sampling_rate=16000, return_tensors="pt")
        with torch.no_grad():
            logits = model(**inputs).logits
        return processor.decode(torch.argmax(logits, dim=-1)[0])

    return run


def rescore(db):
    # пересчёт CER уже распознанных повторённых реплик (без распознавания)
    for rec in db["lines"].values():
        if rec.get("repeat") == 2:
            words = rec["text"].split()
            one = " ".join(words[: len(words) // 2])
            rec["cer"] = min(cer(rec["text"], rec["heard"]), cer(one, rec["heard"]))
    return db


def merge(parts):
    db = json.load(open(OUT)) if os.path.exists(OUT) else {"model": "", "takes": {}, "lines": {}}
    for p in parts:
        if not os.path.exists(p):
            print(f"нет части {p}")
            continue
        part = json.load(open(p))
        db["model"] = part.get("model") or db["model"]
        db["takes"].update(part.get("takes", {}))
        db["lines"].update(part.get("lines", {}))
    save(rescore(db), OUT)
    print(f"{OUT}: дублей {len(db['takes'])}, реплик {len(db['lines'])}")


def main():
    if "--merge" in ARGS:
        return merge(ARGS[ARGS.index("--merge") + 1 :])
    if "--rescore" in ARGS:
        return save(rescore(json.load(open(OUT))), OUT)
    db = json.load(open(OUT)) if os.path.exists(OUT) else {"model": "", "takes": {}, "lines": {}}
    shard = opt("--shard")
    part_path = opt("--part") or OUT
    part = {"model": db["model"], "takes": {}, "lines": {}} if shard else db
    todo = []
    for f in sorted(os.listdir(RAW)):
        if not f.endswith(".json"):
            continue
        key = f[:-5]
        meta = json.load(open(os.path.join(RAW, f)))
        if key in db["takes"]:
            continue
        # в дубле после реплики — страховочное слово «Хорошо.» (потом вырезается)
        todo.append(("takes", key, os.path.join(RAW, key + ".mp3"), meta["text"] + " " + PAD, meta))
    man_path = os.path.join(DIR, "manifest.json")
    if os.path.exists(man_path):
        man = json.load(open(man_path))
        for ln in man["lines"]:
            path = os.path.join(DIR, ln["file"])
            sig = f'{ln["segId"]}:{os.path.getsize(path)}'
            if db["lines"].get(ln["segId"], {}).get("sig") == sig:
                continue
            todo.append(("lines", ln["segId"], path, ln["text"], {"sig": sig, "segId": ln["segId"], "role": ln["role"], "take": ln.get("take"), "source": ln.get("source")}))
    if shard:
        i, n = (int(x) for x in shard.split("/"))
        todo = todo[i::n]
    print(f"К распознаванию: {len(todo)}")
    if not todo:
        if shard:
            save(part, part_path)
        return
    import numpy as np

    if LANG == "ky":
        model = mms_kir()
        part["model"] = "facebook/mms-1b-all kir (CTC)"
    else:
        from faster_whisper import WhisperModel

        name = os.environ.get("ASR_MODEL", "large-v3")
        model = WhisperModel(name, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)
        part["model"] = f"faster-whisper {name} int8"

    for i, (kind, key, path, ref, meta) in enumerate(todo):
        a = load(path)
        rep = 1
        ref1 = ref
        # короткую реплику (< 2 с) Whisper без контекста часто «додумывает»
        # (вместо «Творение.» — подпись субтитров): готовая реплика проверяется
        # дважды подряд через 0,4 с тишины, ожидаемый текст — тоже дважды
        if kind == "lines" and len(a) < 2.0 * 16000 and LANG == "ru":
            rep = 2
            a = np.concatenate([a, np.zeros(int(0.4 * 16000), dtype=np.float32), a])
            ref = ref + " " + ref
        if LANG == "ky":
            heard = model(a)
        else:
            segs, _ = model.transcribe(a, language="ru", beam_size=5, condition_on_previous_text=False, vad_filter=False, without_timestamps=True)
            heard = " ".join(s.text.strip() for s in segs).strip()
        # при повторе Whisper нередко слышит фразу один раз (повтор считает
        # «эхом») — засчитывается лучшее из двух сравнений
        score = cer(ref, heard) if rep == 1 else min(cer(ref, heard), cer(ref1, heard))
        rec = {"segId": meta.get("segId"), "role": meta.get("role"), "take": meta.get("take"), "gtake": meta.get("gtake"), "voice": meta.get("voice"), "text": ref, "heard": heard, "cer": score, "f0": median_f0(a)}
        if kind == "lines":
            rec["sig"] = meta["sig"]
            rec["repeat"] = rep
            rec["source"] = meta.get("source")
        part[kind][key] = rec
        flag = "  " if rec["cer"] < 0.1 else "!!"
        print(f"{flag} {kind[:4]} {rec['segId']} t{rec['take']} cer={rec['cer']:.3f} f0={rec['f0']:6} «{heard}»", flush=True)
        if i % 10 == 9:
            save(part, part_path)
    save(part, part_path)


if __name__ == "__main__":
    main()
