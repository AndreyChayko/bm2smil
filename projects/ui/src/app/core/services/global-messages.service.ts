import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NEVER, Subject, race, timer } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';

export type GlobalMessageType = 'info' | 'success' | 'error';

export interface GlobalMessageConfig {
  message: string;
  timeToShow?: number; // ms; 0 or negative disables auto-hide
  canClose?: boolean;
  type?: GlobalMessageType;
}

export interface GlobalMessage extends Required<GlobalMessageConfig> {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class GlobalMessagesService {
  private seq = 0;
  private readonly destroyRef = inject(DestroyRef);

  readonly active = signal<GlobalMessage | null>(null);

  // RxJS streams to control lifecycle
  private readonly show$ = new Subject<GlobalMessageConfig>();
  private readonly close$ = new Subject<number | undefined>();

  // Wire up: each show replaces current toast; auto-hide via timer or manual close
  private readonly sub = this.show$
    .pipe(
      map(
        (cfg): GlobalMessage => ({
          id: ++this.seq,
          message: cfg.message,
          canClose: cfg.canClose ?? true,
          timeToShow: cfg.timeToShow ?? 5000,
          type: cfg.type ?? 'error',
        }),
      ),
      tap((msg) => this.active.set(msg)),
      switchMap((msg) => {
        const manual$ = this.close$.pipe(
          filter((id) => id == null || id === msg.id),
          take(1),
          map(() => ({ kind: 'manual' as const, msg })),
        );
        const auto$ =
          msg.timeToShow > 0
            ? timer(msg.timeToShow).pipe(map(() => ({ kind: 'auto' as const, msg })))
            : NEVER;
        return race(manual$, auto$).pipe(take(1));
      }),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe(({ msg }) => {
      // Close only if this message is still the active one
      if (this.active()?.id === msg.id) {
        this.active.set(null);
      }
    });

  /** Show a toast message with optional auto-hide. Replaces any existing message. */
  show(cfg: GlobalMessageConfig) {
    this.show$.next(cfg);
  }

  /** Request to close the current message (optionally only if id matches the current one). */
  close(id?: number) {
    this.close$.next(id);
  }
}
