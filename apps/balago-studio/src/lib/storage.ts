import { AwsClient } from "aws4fetch";
import type { StudioConfig } from "./config";

// Абстракция приватного хранилища. В продакшене — Cloudflare R2 (S3 API),
// в тестах — MemoryObjectStore без настоящих ключей.

export interface ObjectHead {
  size: number;
  contentType: string | null;
}

export interface ObjectStore {
  /** Короткоживущий signed PUT: браузер грузит файл напрямую, минуя Vercel. */
  presignPut(key: string, contentType: string, ttlSeconds: number): Promise<string>;
  head(key: string): Promise<ObjectHead | null>;
  readRange(key: string, start: number, endInclusive: number): Promise<Uint8Array | null>;
  getJson<T>(key: string): Promise<T | null>;
  /** Записать JSON. onlyIfAbsent — атомарно, только если объекта ещё нет (If-None-Match: *). */
  putJson(key: string, value: unknown, options?: { onlyIfAbsent?: boolean }): Promise<boolean>;
  delete(key: string): Promise<void>;
}

export class StorageError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "StorageError";
  }
}

function encodeKey(key: string): string {
  if (key.includes("..") || key.startsWith("/") || !/^[A-Za-z0-9/._-]+$/.test(key)) {
    throw new StorageError("unsafe object key");
  }
  return key.split("/").map(encodeURIComponent).join("/");
}

export class R2ObjectStore implements ObjectStore {
  private readonly client: AwsClient;
  private readonly base: string;

  constructor(config: StudioConfig["r2"], private readonly fetchImpl: typeof fetch = fetch) {
    this.client = new AwsClient({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      service: "s3",
      region: "auto",
      retries: 2,
    });
    this.base = `https://${config.accountId}.r2.cloudflarestorage.com/${encodeURIComponent(config.bucket)}`;
  }

  private url(key: string): string {
    return `${this.base}/${encodeKey(key)}`;
  }

  async presignPut(key: string, contentType: string, ttlSeconds: number): Promise<string> {
    const url = new URL(this.url(key));
    url.searchParams.set("X-Amz-Expires", String(ttlSeconds));
    const signed = await this.client.sign(url.toString(), {
      method: "PUT",
      headers: { "Content-Type": contentType },
      // Content-Type входит в подпись: загрузить под этим URL другой тип нельзя.
      aws: { signQuery: true, allHeaders: true },
    });
    return signed.url;
  }

  private async send(key: string, init: RequestInit): Promise<Response> {
    const request = await this.client.sign(this.url(key), init);
    return this.fetchImpl(request);
  }

  async head(key: string): Promise<ObjectHead | null> {
    const res = await this.send(key, { method: "HEAD" });
    if (res.status === 404) return null;
    if (!res.ok) throw new StorageError("R2 HEAD failed", res.status);
    return {
      size: Number(res.headers.get("content-length") ?? "-1"),
      contentType: res.headers.get("content-type"),
    };
  }

  async readRange(key: string, start: number, endInclusive: number): Promise<Uint8Array | null> {
    const res = await this.send(key, {
      method: "GET",
      headers: { Range: `bytes=${start}-${endInclusive}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new StorageError("R2 GET range failed", res.status);
    return new Uint8Array(await res.arrayBuffer());
  }

  async getJson<T>(key: string): Promise<T | null> {
    const res = await this.send(key, { method: "GET" });
    if (res.status === 404) return null;
    if (!res.ok) throw new StorageError("R2 GET failed", res.status);
    return (await res.json()) as T;
  }

  async putJson(key: string, value: unknown, options: { onlyIfAbsent?: boolean } = {}): Promise<boolean> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (options.onlyIfAbsent) headers["If-None-Match"] = "*";
    const res = await this.send(key, { method: "PUT", headers, body: JSON.stringify(value) });
    if (res.status === 412) return false;
    if (!res.ok) throw new StorageError("R2 PUT failed", res.status);
    return true;
  }

  async delete(key: string): Promise<void> {
    const res = await this.send(key, { method: "DELETE" });
    if (!res.ok && res.status !== 404) throw new StorageError("R2 DELETE failed", res.status);
  }
}

/** Хранилище в памяти для тестов и smoke-проверки. */
export class MemoryObjectStore implements ObjectStore {
  readonly objects = new Map<string, { body: Uint8Array; contentType: string | null }>();
  readonly presigned: { key: string; contentType: string; ttlSeconds: number }[] = [];

  async presignPut(key: string, contentType: string, ttlSeconds: number): Promise<string> {
    encodeKey(key);
    this.presigned.push({ key, contentType, ttlSeconds });
    return `https://r2.test/${key}?X-Amz-Expires=${ttlSeconds}&X-Amz-Signature=fake`;
  }

  /** Имитация PUT браузера по signed URL. */
  simulateUpload(key: string, body: Uint8Array, contentType: string | null): void {
    this.objects.set(key, { body, contentType });
  }

  async head(key: string): Promise<ObjectHead | null> {
    const obj = this.objects.get(key);
    return obj ? { size: obj.body.length, contentType: obj.contentType } : null;
  }

  async readRange(key: string, start: number, endInclusive: number): Promise<Uint8Array | null> {
    const obj = this.objects.get(key);
    return obj ? obj.body.slice(start, endInclusive + 1) : null;
  }

  async getJson<T>(key: string): Promise<T | null> {
    const obj = this.objects.get(key);
    return obj ? (JSON.parse(new TextDecoder().decode(obj.body)) as T) : null;
  }

  async putJson(key: string, value: unknown, options: { onlyIfAbsent?: boolean } = {}): Promise<boolean> {
    encodeKey(key);
    if (options.onlyIfAbsent && this.objects.has(key)) return false;
    this.objects.set(key, {
      body: new TextEncoder().encode(JSON.stringify(value)),
      contentType: "application/json",
    });
    return true;
  }

  async delete(key: string): Promise<void> {
    this.objects.delete(key);
  }
}
