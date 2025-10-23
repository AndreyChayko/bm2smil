import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { EMPTY, Subject } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { GlobalMessagesService } from '../../core/services/global-messages.service';
import { ServerService } from '../../core/services/server.service';

@Injectable({ providedIn: 'root' })
export class ConverterService {
  private readonly http = inject(HttpClient);
  private readonly server = inject(ServerService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly messages = inject(GlobalMessagesService);

  // Inputs/state
  readonly url = signal<string>('');
  readonly file = signal<File | null>(null);

  // Outputs/state
  readonly svg = signal<string | null>(null);
  readonly busy = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Derived URLs for preview/download (sanitized)
  readonly svgDataUrl = computed<string | null>(() => {
    const s = this.svg();
    return s ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s) : null;
  });
  readonly safeSvgResourceUrl = computed<SafeResourceUrl | null>(() => {
    const u = this.svgDataUrl();
    return u ? this.sanitizer.bypassSecurityTrustResourceUrl(u) : null;
  });
  readonly safeSvgDownloadUrl = computed<SafeUrl | null>(() => {
    const u = this.svgDataUrl();
    return u ? this.sanitizer.bypassSecurityTrustUrl(u) : null;
  });

  // Additional input for direct JSON paste
  readonly jsonText = signal<string>('');

  // Metadata (derived)
  readonly fileName = computed(() => this.file()?.name ?? null);
  readonly fileSize = computed(() => {
    const f = this.file();
    return f ? `${Math.round(f.size / 1024)} KB` : null;
  });

  private readonly trigger$ = new Subject<'url' | 'file' | 'json'>();
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.trigger$
      .pipe(
        tap(() => {
          this.busy.set(true);
          this.error.set(null);
          this.svg.set(null);
        }),
        switchMap((kind) => {
          const fd = new FormData();
          if (kind === 'file') {
            const f = this.file();
            if (!f) {
              this.error.set('Please select a file first');
              this.messages.show({
                message: 'Please select a file first',
                timeToShow: 5000,
                canClose: true,
                type: 'error',
              });
              return EMPTY;
            }
            fd.set('file', f);
          } else if (kind === 'url') {
            const u = this.url().trim();
            if (!u) {
              this.error.set('Please enter a URL first');
              this.messages.show({
                message: 'Please enter a URL first',
                timeToShow: 5000,
                canClose: true,
                type: 'error',
              });
              return EMPTY;
            }
            fd.set('url', u);
          } else if (kind === 'json') {
            const txt = this.jsonText().trim();
            if (!txt) {
              this.error.set('Please paste JSON first');
              this.messages.show({
                message: 'Please paste JSON first',
                timeToShow: 5000,
                canClose: true,
                type: 'error',
              });
              return EMPTY;
            }
            fd.set('json', txt);
          }
          return this.http.post(this.api('/api/convert'), fd, { responseType: 'text' }).pipe(
            tap((svg) => this.svg.set(svg ?? null)),
            catchError((err) => {
              const msg = err?.message || 'Request failed';
              this.error.set(msg);
              this.messages.show({ message: msg, timeToShow: 6000, canClose: true, type: 'error' });
              return EMPTY;
            }),
            finalize(() => this.busy.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private api(path: string) {
    return `${this.server.baseUrl()}${path}`;
  }

  triggerConvertByUrl() {
    this.trigger$.next('url');
  }

  triggerConvertByFile(file?: File) {
    if (file) this.file.set(file);
    this.trigger$.next('file');
  }

  triggerConvertByJson() {
    this.trigger$.next('json');
  }

  clearFile() {
    this.file.set(null);
  }
}
