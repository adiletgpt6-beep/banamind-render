"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatMegabytes, MAX_NOTE_LENGTH, MAX_TITLE_LENGTH } from "@/lib/validation";

type Stage = "empty" | "selected" | "uploading" | "verifying" | "uploaded" | "submitting" | "done";

interface Saved {
  uploadId: string;
  fileName: string;
  size: number;
  stage: "uploaded" | "done";
  result?: SubmitResult;
}

interface SubmitResult {
  liveId: string;
  issueNumber: number;
  issueUrl: string;
  alreadyExisted: boolean;
}

const STORAGE_KEY = "balago-studio:current";

class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string) {
    super(message);
  }
}

async function api<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: { code: string; message: string } } & T;
  if (!res.ok) {
    throw new ApiError(data.error?.message ?? "Ошибка сети — повторите", res.status, data.error?.code ?? "unknown");
  }
  return data;
}

function extensionType(file: File): string {
  if (file.type) return file.type;
  return /\.mov$/i.test(file.name) ? "video/quicktime" : "video/mp4";
}

function putWithProgress(url: string, file: File, contentType: string, onProgress: (p: number) => void, xhrRef: { current: XMLHttpRequest | null }): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Хранилище ответило ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("Связь прервалась"));
    xhr.onabort = () => reject(new Error("Загрузка отменена"));
    xhr.send(file);
  });
}

function loadSaved(): Saved | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(value: Saved | null): void {
  try {
    if (value) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* хранилище браузера недоступно — работаем без восстановления */
  }
}

export function StudioApp({ login, maxUploadBytes }: { login: string; maxUploadBytes: number }) {
  const [stage, setStage] = useState<Stage>("empty");
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const busy = useRef(false);

  // Восстановление после перезагрузки страницы: файл уже в R2, осталось отправить.
  useEffect(() => {
    const saved = loadSaved();
    if (!saved) return;
    setUploadId(saved.uploadId);
    setFileInfo({ name: saved.fileName, size: saved.size });
    if (saved.stage === "done" && saved.result) {
      setResult(saved.result);
      setStage("done");
    } else {
      setStage("uploaded");
    }
  }, []);

  useEffect(() => {
    if (stage !== "uploading") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [stage]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const choose = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    setError(null);
    if (!/\.(mp4|mov)$/i.test(picked.name)) return setError("Выберите видео в формате MP4 или MOV.");
    if (picked.size > maxUploadBytes) return setError(`Файл больше ${formatMegabytes(maxUploadBytes)}.`);
    setFile(picked);
    setFileInfo({ name: picked.name, size: picked.size });
    setPreviewUrl(URL.createObjectURL(picked));
    setUploadId(null);
    setProgress(0);
    setStage("selected");
  };

  const upload = useCallback(async () => {
    if (!file || busy.current) return;
    busy.current = true;
    setError(null);
    setStage("uploading");
    setProgress(0);
    try {
      const contentType = extensionType(file);
      const created = await api<{ uploadId: string; uploadUrl: string; contentType: string }>("/api/uploads", {
        fileName: file.name,
        contentType,
        size: file.size,
      });
      await putWithProgress(created.uploadUrl, file, created.contentType, setProgress, xhrRef);
      setStage("verifying");
      await api(`/api/uploads/${created.uploadId}/complete`, {});
      setUploadId(created.uploadId);
      save({ uploadId: created.uploadId, fileName: file.name, size: file.size, stage: "uploaded" });
      setStage("uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить");
      setStage("selected");
    } finally {
      xhrRef.current = null;
      busy.current = false;
    }
  }, [file]);

  const submit = useCallback(async () => {
    if (!uploadId || busy.current) return;
    busy.current = true;
    setError(null);
    setStage("submitting");
    try {
      let attempt = 0;
      for (;;) {
        try {
          const created = await api<SubmitResult>(`/api/uploads/${uploadId}/submit`, { title, note });
          setResult(created);
          save({ uploadId, fileName: fileInfo?.name ?? "", size: fileInfo?.size ?? 0, stage: "done", result: created });
          setStage("done");
          return;
        } catch (err) {
          // Параллельный запрос уже создаёт карточку — ждём его результат.
          if (err instanceof ApiError && err.code === "in_progress" && attempt++ < 6) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          throw err;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать задание");
      setStage("uploaded");
    } finally {
      busy.current = false;
    }
  }, [uploadId, title, note, fileInfo]);

  const reset = () => {
    save(null);
    setFile(null);
    setFileInfo(null);
    setPreviewUrl(null);
    setUploadId(null);
    setTitle("");
    setNote("");
    setResult(null);
    setProgress(0);
    setError(null);
    setStage("empty");
  };

  if (stage === "done" && result) {
    return (
      <section className="card done" aria-live="polite">
        <div className="badge">Получено</div>
        <h2 className="live-id">{result.liveId}</h2>
        <p className="muted">
          Видео в приватном хранилище, карточка в GitHub создана. Монтаж и рендер не запускаются автоматически.
        </p>
        <a className="button primary" href={result.issueUrl} target="_blank" rel="noopener noreferrer">
          Открыть карточку #{result.issueNumber}
        </a>
        <button type="button" className="button ghost" onClick={reset}>
          Загрузить следующее видео
        </button>
      </section>
    );
  }

  const uploading = stage === "uploading" || stage === "verifying";
  const uploaded = stage === "uploaded" || stage === "submitting";
  const percent = Math.round(progress * 100);

  return (
    <>
      <section className="card">
        <div className="step">
          <span className={`dot ${uploaded ? "ok" : ""}`}>1</span>
          <h2>Загрузить видео</h2>
        </div>

        {fileInfo ? (
          <div className="file">
            {previewUrl ? <video src={previewUrl} muted playsInline preload="metadata" /> : null}
            <div>
              <strong>{fileInfo.name}</strong>
              <span className="muted">{formatMegabytes(fileInfo.size)}</span>
            </div>
          </div>
        ) : (
          <p className="muted">MP4 или MOV до {formatMegabytes(maxUploadBytes)}. Файл идёт напрямую в приватное хранилище.</p>
        )}

        {uploading ? (
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
            <div className="bar" style={{ width: `${percent}%` }} />
            <span>{stage === "verifying" ? "Проверяем файл…" : `${percent}%`}</span>
          </div>
        ) : null}

        {uploaded ? <p className="ok-line">✓ Видео загружено и проверено</p> : null}

        {!uploading && !uploaded ? (
          <div className="actions">
            <label className={`button ${file ? "ghost" : "primary"}`}>
              {file ? "Выбрать другое" : "Выбрать видео"}
              <input type="file" accept="video/mp4,video/quicktime,.mp4,.mov" onChange={choose} hidden />
            </label>
            {file ? (
              <button type="button" className="button primary" onClick={upload}>
                Загрузить
              </button>
            ) : null}
          </div>
        ) : null}

        {stage === "uploading" ? (
          <button type="button" className="button ghost" onClick={() => xhrRef.current?.abort()}>
            Отменить
          </button>
        ) : null}
      </section>

      <section className={`card ${uploaded ? "" : "dim"}`}>
        <div className="step">
          <span className="dot">2</span>
          <h2>Кратко о видео</h2>
        </div>
        <label className="field">
          <span>Тема или название (необязательно)</span>
          <input
            type="text"
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Балдарды мектептен алып кетебиз"
            disabled={stage === "submitting" || stage === "done"}
          />
        </label>
        <label className="field">
          <span>Заметка для монтажа (необязательно)</span>
          <textarea
            value={note}
            maxLength={MAX_NOTE_LENGTH}
            rows={3}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Что важно показать или подчеркнуть"
            disabled={stage === "submitting" || stage === "done"}
          />
        </label>
      </section>

      <section className={`card ${uploaded ? "" : "dim"}`}>
        <div className="step">
          <span className="dot">3</span>
          <h2>Отправить в работу</h2>
        </div>
        <p className="muted">Создаст одну карточку LIVE-NNN в GitHub. Повторное нажатие не создаст дубль.</p>
        <button type="button" className="button primary" onClick={submit} disabled={!uploaded || stage === "submitting"}>
          {stage === "submitting" ? "Создаём задание…" : "Отправить в работу"}
        </button>
      </section>

      {error ? (
        <p className="alert" role="alert">
          {error}
        </p>
      ) : null}

      <footer className="foot">
        <span>Вы вошли как @{login}</span>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="link">
            Выйти
          </button>
        </form>
      </footer>
    </>
  );
}
