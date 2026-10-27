# Офлайн-синтез русской речи RHVoice (Ubuntu: rhvoice + rhvoice-russian) с
# точными таймингами слов. Библиотека libRHVoice вызывает колбэки
# word_starts / word_ends между порциями звука, поэтому позиция каждого слова
# в аудио известна по числу уже отданных сэмплов — так работают экранные
# дикторы с подсветкой слов. Это даёт губам персонажей фактические границы
# слов без внешнего распознавания речи.
#
#   python3 scripts/lesson80/rhvoice_tts.py --voice Aleksandr-hq --pitch 0 \
#       --rate 0 --text "Посмотрим тихо." --out line.wav --json line.json
#
# Выход: WAV (16 бит, моно, частота голоса) и JSON {sampleRate, words:
# [{text, start, end}]} в секундах от начала файла.
import argparse
import ctypes
import json
import struct
import sys

LIB = "libRHVoice.so.5"

class Callbacks(ctypes.Structure):
    _fields_ = [
        ("set_sample_rate", ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_int, ctypes.c_void_p)),
        ("play_speech", ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_uint, ctypes.c_void_p)),
        ("process_mark", ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_char_p, ctypes.c_void_p)),
        ("word_starts", ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_uint, ctypes.c_uint, ctypes.c_void_p)),
        ("word_ends", ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_uint, ctypes.c_uint, ctypes.c_void_p)),
        ("sentence_starts", ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_uint, ctypes.c_uint, ctypes.c_void_p)),
        ("sentence_ends", ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_uint, ctypes.c_uint, ctypes.c_void_p)),
        ("play_audio", ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_char_p, ctypes.c_void_p)),
        ("done", ctypes.CFUNCTYPE(None, ctypes.c_void_p)),
    ]

class InitParams(ctypes.Structure):
    _fields_ = [
        ("data_path", ctypes.c_char_p),
        ("config_path", ctypes.c_char_p),
        ("resource_paths", ctypes.POINTER(ctypes.c_char_p)),
        ("callbacks", Callbacks),
        ("options", ctypes.c_uint),
    ]

class SynthParams(ctypes.Structure):
    _fields_ = [
        ("voice_profile", ctypes.c_char_p),
        ("absolute_rate", ctypes.c_double),
        ("absolute_pitch", ctypes.c_double),
        ("absolute_volume", ctypes.c_double),
        ("relative_rate", ctypes.c_double),
        ("relative_pitch", ctypes.c_double),
        ("relative_volume", ctypes.c_double),
        ("punctuation_mode", ctypes.c_int),
        ("punctuation_list", ctypes.c_char_p),
        ("capitals_mode", ctypes.c_int),
        ("flags", ctypes.c_int),
    ]


def synth(text: str, voice: str, pitch: float, rate: float, volume: float = 0.0, ssml: bool = False):
    lib = ctypes.CDLL(LIB)
    lib.RHVoice_new_tts_engine.restype = ctypes.c_void_p
    lib.RHVoice_new_tts_engine.argtypes = [ctypes.POINTER(InitParams)]
    lib.RHVoice_new_message.restype = ctypes.c_void_p
    lib.RHVoice_new_message.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_uint, ctypes.c_int, ctypes.POINTER(SynthParams), ctypes.c_void_p]
    lib.RHVoice_speak.argtypes = [ctypes.c_void_p]
    lib.RHVoice_delete_message.argtypes = [ctypes.c_void_p]
    lib.RHVoice_delete_tts_engine.argtypes = [ctypes.c_void_p]

    state = {"sr": 24000, "samples": bytearray(), "count": 0, "words": [], "open": None}
    raw = text.encode("utf-8")
    # позиции колбэков — смещения в байтах UTF-8 исходного текста
    def set_sr(sr, _):
        state["sr"] = sr
        return 1
    def play(samples, count, _):
        state["samples"] += ctypes.string_at(samples, count * 2)
        state["count"] += count
        return 1
    def w_start(pos, length, _):
        state["open"] = (pos, length, state["count"])
        return 1
    def w_end(pos, length, _):
        o = state["open"]
        start = o[2] if o else state["count"]
        state["words"].append({"text": raw[pos:pos + length].decode("utf-8", "ignore"), "pos": pos, "startSample": start, "endSample": state["count"]})
        state["open"] = None
        return 1
    def noop_mark(name, _):
        return 1
    def noop_pos(pos, length, _):
        return 1
    def noop_audio(src, _):
        return 1
    def done(_):
        return None
    cb = Callbacks(
        Callbacks._fields_[0][1](set_sr),
        Callbacks._fields_[1][1](play),
        Callbacks._fields_[2][1](noop_mark),
        Callbacks._fields_[3][1](w_start),
        Callbacks._fields_[4][1](w_end),
        Callbacks._fields_[5][1](noop_pos),
        Callbacks._fields_[6][1](noop_pos),
        Callbacks._fields_[7][1](noop_audio),
        Callbacks._fields_[8][1](done),
    )
    init = InitParams(None, None, None, cb, 0)
    engine = lib.RHVoice_new_tts_engine(ctypes.byref(init))
    if not engine:
        raise SystemExit("RHVoice: не удалось создать движок (установлены ли rhvoice и rhvoice-russian?)")
    sp = SynthParams(voice.encode("utf-8"), rate, pitch, volume, 1.0, 1.0, 1.0, 0, None, 0, 0)
    msg = lib.RHVoice_new_message(engine, raw, len(raw), 1 if ssml else 0, ctypes.byref(sp), None)
    if not msg:
        raise SystemExit("RHVoice: не удалось создать сообщение")
    if not lib.RHVoice_speak(msg):
        raise SystemExit("RHVoice: синтез прерван")
    lib.RHVoice_delete_message(msg)
    lib.RHVoice_delete_tts_engine(engine)
    sr = state["sr"]
    words = [
        {"text": w["text"], "start": round(w["startSample"] / sr, 3), "end": round(w["endSample"] / sr, 3)}
        for w in state["words"]
        if any(ch.isalnum() for ch in w["text"])
    ]
    return sr, bytes(state["samples"]), words


def write_wav(path: str, sr: int, pcm: bytes):
    with open(path, "wb") as f:
        f.write(b"RIFF" + struct.pack("<I", 36 + len(pcm)) + b"WAVE")
        f.write(b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, sr, sr * 2, 2, 16))
        f.write(b"data" + struct.pack("<I", len(pcm)) + pcm)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--pitch", type=float, default=0.0, help="−1…1")
    ap.add_argument("--rate", type=float, default=0.0, help="−1…1")
    ap.add_argument("--text", required=True)
    ap.add_argument("--ssml", action="store_true")
    ap.add_argument("--out", required=True)
    ap.add_argument("--json", required=True)
    a = ap.parse_args()
    sr, pcm, words = synth(a.text, a.voice, a.pitch, a.rate, ssml=a.ssml)
    write_wav(a.out, sr, pcm)
    with open(a.json, "w", encoding="utf-8") as f:
        json.dump({"sampleRate": sr, "durationSec": round(len(pcm) / 2 / sr, 3), "words": words}, f, ensure_ascii=False)
    print(f"{a.out}: {sr} Гц, {len(pcm) / 2 / sr:.2f} с, слов: {len(words)}", file=sys.stderr)
