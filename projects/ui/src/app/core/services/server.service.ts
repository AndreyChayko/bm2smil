import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export type ServerHealth = { ok: true } | { ok: false; error?: unknown };

@Injectable({ providedIn: 'root' })
export class ServerService {
  private readonly http = inject(HttpClient);

  readonly baseUrl = signal<string>('http://localhost:5174');
  readonly healthy = signal<null | boolean>(null);
  readonly lastError = signal<unknown | null>(null);
  readonly checking = signal<boolean>(false);

  constructor() {
    // single initial ping
    void this.ping();
  }

  ping = async (): Promise<ServerHealth> => {
    const url = `${this.baseUrl()}/api/health`;
    this.checking.set(true);
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 700));
    try {
      const resPromise = fetch(url, { method: 'GET', cache: 'no-store' });
      const res = await Promise.race([
        Promise.all([resPromise, minDelay]).then(([r]) => r as Response),
      ]);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      this.healthy.set(true);
      this.lastError.set(null);
      return { ok: true };
    } catch (error) {
      this.healthy.set(false);
      this.lastError.set(error);
      return { ok: false, error };
    } finally {
      await minDelay; // ensure yellow state visible at least for the delay duration
      this.checking.set(false);
    }
  };
}
