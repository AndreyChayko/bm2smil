import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, delay, finalize, map, of, tap } from 'rxjs';

export type ServerHealth = { ok: true } | { ok: false; error?: unknown };

@Injectable({ providedIn: 'root' })
export class ServerService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly baseUrl = signal<string>('http://localhost:5174');
  readonly healthy = signal<null | boolean>(null);
  readonly lastError = signal<unknown | null>(null);
  readonly checking = signal<boolean>(false);

  constructor() {
    this.ping();
  }

  /**
   * Ping the backend health endpoint using HttpClient + RxJS operators (no async/promises).
   * Ensures a minimum 700ms delay so the "Connecting" state is visible.
   * Updates signals: checking, healthy, lastError.
   */
  ping = (): void => {
    const url = `${this.baseUrl()}/api/health`;
    this.checking.set(true);

    this.http
      .get(url, { responseType: 'text' })
      .pipe(
        map(() => ({ ok: true }) as const),
        catchError((error) => of<ServerHealth>({ ok: false, error })),
        tap((result) => {
          if (result.ok) {
            this.healthy.set(true);
            this.lastError.set(null);
          } else {
            this.healthy.set(false);
            this.lastError.set(result.error);
          }
        }),
        // Keep the yellow "connecting" badge visible for at least 700ms
        delay(700),
        // Auto-unsubscribe when this service is destroyed (teardown via DestroyRef)
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.checking.set(false)),
      )
      .subscribe();
  };
}
